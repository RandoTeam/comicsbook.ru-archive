const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

puppeteer.launch({ headless: true }).then(async browser => {
  const page = await browser.newPage();
  await page.goto('https://vk.com/comicsbook', { waitUntil: 'networkidle2', timeout: 60000 });
  await page.screenshot({ path: 'vk_screenshot.png' });
  console.log('Screenshot saved.');
  await browser.close();
});
