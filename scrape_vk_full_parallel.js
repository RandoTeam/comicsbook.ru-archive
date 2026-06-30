const fs = require('fs');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

puppeteer.launch({ headless: true }).then(async browser => {
  console.log('Starting fast parallel VK scrape...');
  const page = await browser.newPage();
  await page.goto('https://vk.com/comicsbook', { waitUntil: 'networkidle2', timeout: 60000 });
  
  let allPosts = [];
  
  const fetchOffset = async (offset) => {
      return await page.evaluate(async (offset) => {
          let formData = new FormData();
          formData.append('act', 'get_wall');
          formData.append('al', '1');
          formData.append('owner_id', '-32563297');
          formData.append('offset', offset.toString());
          formData.append('type', 'own');
          
          try {
              let r = await fetch('/al_wall.php', {
                  method: 'POST',
                  body: formData,
                  headers: {'X-Requested-With': 'XMLHttpRequest'}
              });
              let text = await r.text();
              let data = JSON.parse(text.replace(/^<!--/, ''));
              let html = data.payload[1][0];
              
              let parser = new DOMParser();
              let doc = parser.parseFromString(html, 'text/html');
              
              let results = [];
              doc.querySelectorAll('div[data-post-id]').forEach(post => {
                  let id = post.getAttribute('data-post-id');
                  
                  // Fix: Use textContent instead of innerText
                  let textEl = post.querySelector('div.wall_post_text') || post.querySelector('div.post_info');
                  let text = textEl ? textEl.textContent : '';
                  
                  let likesEl = post.querySelector('div[data-testid=\"post_footer_action_like\"] span') || post.querySelector('.like_button_count');
                  let likes = likesEl ? likesEl.textContent : '0';
                  
                  let linkEl = post.querySelector('a[href^=\"/wall\"]') || post.querySelector('a.post_link');
                  let link = linkEl ? 'https://vk.com' + linkEl.getAttribute('href') : 'https://vk.com/wall' + id;
                  
                  // Look for comicsbook links anywhere
                  let allLinks = Array.from(post.querySelectorAll('a')).map(a => a.getAttribute('href')).join(' ');
                  text += ' ' + allLinks;
                  
                  let imgUrl = '';
                  let img = post.querySelector('img.PhotoPrimaryAttachment__imageElement') || post.querySelector('img.PhotoAttachment__imageElement') || post.querySelector('a.page_post_thumb_wrap');
                  if (img && img.tagName === 'IMG') {
                      imgUrl = img.getAttribute('src');
                  } else if (img && img.tagName === 'A') {
                      let style = img.getAttribute('style') || '';
                      let m = style.match(/url\((['\"]?)(.*?)\1\)/);
                      if (m) imgUrl = m[2];
                  }
                  
                  let dateEl = post.querySelector('time.PostHeaderSubtitle__itemDate') || post.querySelector('a.rel_date');
                  let dateStr = dateEl ? (dateEl.textContent) : '';
                  
                  results.push({id, text, likes, link, imgUrl, dateStr});
              });
              
              return { success: true, posts: results };
          } catch(e) {
              return { success: false, error: e.toString() };
          }
      }, offset);
  };

  let offset = 0;
  let batchSize = 10; // fetch 10 requests at once
  while(offset <= 15000) {
      console.log('Fetching offsets', offset, 'to', offset + (batchSize - 1) * 10);
      let promises = [];
      for (let i = 0; i < batchSize; i++) {
          promises.push(fetchOffset(offset + i * 10));
      }
      
      let results = await Promise.all(promises);
      
      let postsAdded = 0;
      for (let res of results) {
          if (res && res.success && res.posts) {
              allPosts.push(...res.posts);
              postsAdded += res.posts.length;
          }
      }
      
      console.log(`Added ${postsAdded} posts. Total: ${allPosts.length}`);
      if (postsAdded === 0) {
          console.log('No more posts returned. Stopping.');
          break;
      }
      
      offset += 10 * batchSize; // 10 posts per request * batchSize
      await new Promise(r => setTimeout(r, 500));
  }
  
  fs.writeFileSync('data_vk_full.json', JSON.stringify(allPosts, null, 2));
  console.log('Saved', allPosts.length, 'posts to data_vk_full.json.');
  await browser.close();
});
