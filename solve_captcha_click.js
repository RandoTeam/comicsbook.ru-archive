const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

puppeteer.launch({ headless: true }).then(async browser => {
  const page = await browser.newPage();
  await page.goto('https://vk.com/comicsbook', { waitUntil: 'networkidle2', timeout: 60000 });
  
  console.log('Clicking Продолжить...');
  try {
      await page.click('button.start');
      console.log('Clicked. Waiting 10 seconds...');
      await new Promise(r => setTimeout(r, 10000));
      await page.screenshot({ path: 'vk_after_click.png' });
      console.log('Screenshot saved.');
  } catch(e) {
      console.log('Error clicking button:', e.toString());
  }
  
  await browser.close();
});
