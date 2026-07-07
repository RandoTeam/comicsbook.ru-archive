const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  page.on('response', response => {
    if (!response.ok()) {
      console.log('PAGE NETWORK ERROR:', response.url(), response.status());
    }
  });

  try {
    await page.goto('http://localhost:5173', { waitUntil: 'domcontentloaded', timeout: 30000 });
    console.log('Page loaded. Waiting 5 seconds...');
    await new Promise(r => setTimeout(r, 5000));
    
    // Evaluate state
    const data = await page.evaluate(() => {
      return {
        emptyState: document.body.innerText.includes('Комиксы не найдены'),
        postsCount: document.querySelectorAll('.item, .item-compact').length
      };
    });
    console.log('Results:', data);
    
  } catch (err) {
    console.log('NAVIGATION ERROR:', err.message);
  } finally {
    await browser.close();
  }
})();
