const fs = require('fs');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

puppeteer.launch({ headless: true }).then(async browser => {
  console.log('Starting full VK scrape...');
  const page = await browser.newPage();
  await page.goto('https://vk.com/comicsbook', { waitUntil: 'networkidle2', timeout: 60000 });
  
  let allPosts = [];
  let parsedIds = new Set();
  
  for(let i=0; i<10; i++) { // test with 10 scrolls
      const posts = await page.evaluate(() => {
          let results = [];
          document.querySelectorAll('div[data-post-id]').forEach(post => {
              let id = post.getAttribute('data-post-id');
              let textEl = post.querySelector('div.wall_post_text') || post.querySelector('span[data-post-id]');
              let text = textEl ? textEl.innerText : '';
              
              let likesEl = post.querySelector('div[data-testid=\"post_footer_action_like\"] span') || post.querySelector('.like_button_count');
              let likes = likesEl ? likesEl.innerText : '0';
              
              let linkEl = post.querySelector('a[href^=\"/wall\"]');
              let link = linkEl ? 'https://vk.com' + linkEl.getAttribute('href') : 'https://vk.com/wall' + id;
              
              results.push({id, text, likes, link});
          });
          return results;
      });
      
      posts.forEach(p => {
          if(!parsedIds.has(p.id)) {
              parsedIds.add(p.id);
              allPosts.push(p);
          }
      });
      
      console.log('Scroll', i, 'Posts extracted:', allPosts.length);
      await page.evaluate(() => window.scrollBy(0, 3000));
      await new Promise(r => setTimeout(r, 2000));
  }
  
  fs.writeFileSync('data_vk_test.json', JSON.stringify(allPosts, null, 2));
  console.log('Saved', allPosts.length, 'posts.');
  await browser.close();
});
