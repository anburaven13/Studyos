const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
  page.on('pageerror', err => console.log('BROWSER ERROR:', err.message));
  
  console.log('Navigating to http://localhost:5173...');
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
  
  const hasGlass = await page.evaluate(() => {
    return !!document.querySelector('.hero-glass');
  });
  console.log('Has .hero-glass?', hasGlass);
  
  await browser.close();
})();
