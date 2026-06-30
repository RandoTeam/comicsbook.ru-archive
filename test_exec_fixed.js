const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

puppeteer.launch({ headless: true }).then(async browser => {
  const page = await browser.newPage();
  await page.goto('https://vk.com/comicsbook', { waitUntil: 'networkidle2', timeout: 60000 });
  const links = await page.evaluate(async () => {
      let formData = new FormData();
      formData.append('act', 'get_wall');
      formData.append('al', '1');
      formData.append('owner_id', '-32563297');
      formData.append('offset', '100');
      formData.append('type', 'own');
      
      try {
          let r = await fetch('/al_wall.php', { method: 'POST', body: formData, headers: {'X-Requested-With': 'XMLHttpRequest'} });
          let text = await r.text();
          let data = JSON.parse(text.replace(/^<!--/, ''));
          let html = data.payload[1][0];
          
          let parser = new DOMParser();
          let doc = parser.parseFromString(html, 'text/html');
          let results = [];
          doc.querySelectorAll('div[data-post-id]').forEach(post => {
              let id = post.getAttribute('data-post-id');
              let cbLinks = [];
              
              // Search both post itself and descendants
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
                          let cleaned = m.replace(/\\\\\\//g, '/').replace(/\\/g, '');
                          cbLinks.push(cleaned);
                      });
                  } catch(e) {}
              });
              results.push({id, cbLinks});
          });
          return { success: true, results };
      } catch(e) {
          return { success: false, error: e.toString() };
      }
  });
  console.log('Results:', JSON.stringify(links, null, 2));
  await browser.close();
});
