const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

puppeteer.launch({ headless: true }).then(async browser => {
  const page = await browser.newPage();
  await page.goto('https://vk.com/comicsbook', { waitUntil: 'networkidle2', timeout: 60000 });
  console.log('Page loaded. Waiting 10 seconds for session to stabilize...');
  await new Promise(r => setTimeout(r, 10000));
  
  const res = await page.evaluate(async () => {
      let formData = new FormData();
      formData.append('act', 'get_wall');
      formData.append('al', '1');
      formData.append('owner_id', '-32563297');
      formData.append('offset', '100');
      formData.append('type', 'own');
      try {
          let r = await fetch('/al_wall.php', { method: 'POST', body: formData, headers: {'X-Requested-With': 'XMLHttpRequest'} });
          return await r.text();
      } catch(e) {
          return 'FETCH_ERROR: ' + e.toString();
      }
  });
  const fs = require('fs');
  fs.writeFileSync('error_response.txt', res);
  console.log('Result written. Length:', res.length);
  await browser.close();
});
