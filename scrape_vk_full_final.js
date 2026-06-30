const fs = require('fs');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

puppeteer.launch({ headless: true }).then(async browser => {
  console.log('Starting fast parallel VK scrape with data-exec links...');
  const page = await browser.newPage();
  await page.goto('https://vk.com/comicsbook', { waitUntil: 'networkidle2', timeout: 60000 });
  
  const hasCaptcha = await page.evaluate(() => !!document.querySelector('button.start'));
  if (hasCaptcha) {
      console.log('Captcha detected! Clicking "Продолжить"...');
      await page.click('button.start');
      await new Promise(r => setTimeout(r, 10000));
  }
  
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
                  
                  // Extract raw text
                  let textEl = post.querySelector('div.wall_post_text') || post.querySelector('div.post_info');
                  let text = textEl ? textEl.textContent : '';
                  
                  // Extract likes
                  let likesEl = post.querySelector('div[data-testid=\"post_footer_action_like\"] span') || post.querySelector('.like_button_count');
                  let likes = likesEl ? likesEl.textContent : '0';
                  
                  // Extract post link
                  let linkEl = post.querySelector('a[href^=\"/wall\"]') || post.querySelector('a.post_link');
                  let link = linkEl ? 'https://vk.com' + linkEl.getAttribute('href') : 'https://vk.com/wall' + id;
                  
                  // Extract image URL
                  let postHtml = post.innerHTML;
                  let imgMatches = postHtml.match(/http[s]?:\/\/[^\s\"\'\(\)]+\.(?:jpg|png|webp|gif)/gi) || [];
                  let imgUrl = imgMatches.length > 0 ? imgMatches[imgMatches.length - 1] : '';
                  if(!imgUrl) {
                      let sunMatches = postHtml.match(/http[s]?:\/\/sun[^\s\"\'\(\)]+/gi) || [];
                      if(sunMatches.length > 0) imgUrl = sunMatches[0];
                  }
                  
                  // Extract date
                  let dateEl = post.querySelector('time.PostHeaderSubtitle__itemDate') || post.querySelector('a.rel_date');
                  let dateStr = dateEl ? (dateEl.textContent) : '';
                  
                  // EXTRACT comicsbook.ru links from data-exec (crucial fix!)
                  let cbLinks = [];
                  let els = Array.from(post.querySelectorAll('[data-exec]'));
                  if (post.hasAttribute('data-exec')) {
                      els.push(post);
                  }
                  els.forEach(el => {
                      try {
                          let execData = JSON.parse(el.getAttribute('data-exec'));
                          let jsonStr = JSON.stringify(execData);
                          let matches = jsonStr.match(/comicsbook\.ru[^\"]*/g) || [];
                          matches.forEach(m => {
                              let cleaned = m;
                              // Add http prefix if missing
                              if (!cleaned.startsWith('http')) {
                                  cleaned = 'http://' + cleaned;
                              }
                              cbLinks.push(cleaned);
                          });
                      } catch(e) {}
                  });
                  
                  // Deduplicate cbLinks
                  cbLinks = Array.from(new Set(cbLinks));
                  
                  results.push({id, text, likes, link, imgUrl, dateStr, cbLinks});
              });
              
              return { success: true, posts: results };
          } catch(e) {
              return { success: false, error: e.toString() };
          }
      }, offset);
  };

  let offset = 0;
  let batchSize = 10;
  while(offset <= 15000) {
      console.log(`Fetching offsets ${offset} to ${offset + (batchSize - 1) * 10}...`);
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
          } else if (res && !res.success) {
              console.log(`Error at offset:`, res.error);
          }
      }
      
      console.log(`Batch done. Added ${postsAdded} posts. Total so far: ${allPosts.length}`);
      if (postsAdded === 0) {
          console.log('No more posts returned or errors occurred. Stopping.');
          break;
      }
      offset += 10 * batchSize;
      await new Promise(r => setTimeout(r, 1000)); // Increase delay to avoid ban
  }
  
  if (allPosts.length > 0) {
      fs.writeFileSync('data_vk_full.json', JSON.stringify(allPosts, null, 2));
      console.log('Saved', allPosts.length, 'posts to data_vk_full.json.');
  } else {
      console.log('No posts scraped, keeping old data_vk_full.json.');
  }
  await browser.close();
});
