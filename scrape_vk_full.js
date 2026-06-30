const fs = require('fs');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

puppeteer.launch({ headless: true }).then(async browser => {
  console.log('Starting full VK scrape...');
  const page = await browser.newPage();
  await page.goto('https://vk.com/comicsbook', { waitUntil: 'networkidle2', timeout: 60000 });
  
  let allPosts = [];
  
  let offset = 0;
  while(offset <= 15000) {
      console.log('Fetching offset', offset);
      const res = await page.evaluate(async (offset) => {
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
              // Parse the JSON. format: {"payload":[0,["<div id=\"post..."]]}
              let data = JSON.parse(text.replace(/^<!--/, ''));
              let html = data.payload[1][0];
              
              // We can create a DOM parser inside the browser
              let parser = new DOMParser();
              let doc = parser.parseFromString(html, 'text/html');
              
              let results = [];
              doc.querySelectorAll('div[data-post-id]').forEach(post => {
                  let id = post.getAttribute('data-post-id');
                  let textEl = post.querySelector('div.wall_post_text') || post.querySelector('span[data-post-id]');
                  let text = textEl ? textEl.innerText : '';
                  
                  let likesEl = post.querySelector('div[data-testid=\"post_footer_action_like\"] span') || post.querySelector('.like_button_count');
                  let likes = likesEl ? likesEl.innerText : '0';
                  
                  let linkEl = post.querySelector('a[href^=\"/wall\"]') || post.querySelector('a.post_link');
                  let link = linkEl ? 'https://vk.com' + linkEl.getAttribute('href') : 'https://vk.com/wall' + id;
                  
                  // Extract image
                  let imgUrl = '';
                  let img = post.querySelector('img.PhotoPrimaryAttachment__imageElement') || post.querySelector('img.PhotoAttachment__imageElement') || post.querySelector('a.page_post_thumb_wrap');
                  if (img && img.tagName === 'IMG') {
                      imgUrl = img.getAttribute('src');
                  } else if (img && img.tagName === 'A') {
                      let style = img.getAttribute('style') || '';
                      let m = style.match(/url\((['\"]?)(.*?)\1\)/);
                      if (m) imgUrl = m[2];
                  }
                  
                  // Extract date
                  let dateEl = post.querySelector('time.PostHeaderSubtitle__itemDate') || post.querySelector('a.rel_date');
                  let dateStr = dateEl ? (dateEl.innerText || dateEl.textContent) : '';
                  
                  results.push({id, text, likes, link, imgUrl, dateStr});
              });
              
              return { success: true, posts: results };
          } catch(e) {
              return { success: false, error: e.toString() };
          }
      }, offset);
      
      if (res.success && res.posts) {
          allPosts.push(...res.posts);
          console.log(`Offset ${offset}: got ${res.posts.length} posts. Total so far: ${allPosts.length}`);
          if (res.posts.length === 0) {
              console.log('No more posts returned. Stopping.');
              break;
          }
          offset += res.posts.length;
      } else {
          console.log(`Offset ${offset} failed:`, res.error);
          break;
      }
      
      // Delay slightly to prevent rate limit
      await new Promise(r => setTimeout(r, 500));
  }
  
  fs.writeFileSync('data_vk_full.json', JSON.stringify(allPosts, null, 2));
  console.log('Saved', allPosts.length, 'posts to data_vk_full.json.');
  await browser.close();
});
