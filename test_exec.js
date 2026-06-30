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
          let errors = [];
          post.querySelectorAll('[data-exec]').forEach(el => {
              try {
                  let raw = el.getAttribute('data-exec');
                  let execData = JSON.parse(raw);
                  let jsonStr = JSON.stringify(execData);
                  let matches = jsonStr.match(/comicsbook\.ru[^\"]*/g) || [];
                  matches.forEach(m => {
                      let cleaned = m.replace(/\\\\\\//g, '/').replace(/\\/g, '');
                      cbLinks.push(cleaned);
                  });
              } catch(e) {
                  errors.push(e.toString());
              }
          });
          results.push({id, cbLinks, errors});
      });
      return results;
  });
  console.log('Sample links found:', JSON.stringify(links.slice(0, 5), null, 2));
  await browser.close();
});
