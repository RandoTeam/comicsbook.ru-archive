const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

puppeteer.launch({ headless: true }).then(async browser => {
  const page = await browser.newPage();
  await page.goto('https://vk.com/comicsbook', { waitUntil: 'networkidle2', timeout: 60000 });
  const html = await page.content();
  const fs = require('fs');
  fs.writeFileSync('captcha_page.html', html);
  console.log('Saved captcha page HTML.');
  await browser.close();
});
