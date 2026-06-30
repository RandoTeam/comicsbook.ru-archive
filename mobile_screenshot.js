const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

puppeteer.launch({ headless: true }).then(async browser => {
  const page = await browser.newPage();
  await page.goto('https://m.vk.com/wall-32563297', { waitUntil: 'networkidle2', timeout: 60000 });
  await page.screenshot({ path: 'vk_mobile_screenshot.png' });
  console.log('Mobile screenshot saved.');
  await browser.close();
});
