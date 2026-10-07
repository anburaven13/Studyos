import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const errors = [];

  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(`Console Error: ${msg.text()}`);
    }
  });

  page.on('pageerror', err => {
    errors.push(`Page Error: ${err.message}`);
  });

  try {
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
    console.log('Page loaded');
    
    const buttons = await page.locator('button').all();
    console.log(`Found ${buttons.length} buttons on Landing page`);

    for (let i = 0; i < buttons.length; i++) {
        const btn = buttons[i];
        try {
            await btn.click({ timeout: 1000 });
        } catch(e) {
            console.log(`Button ${i} click failed: ` + e.message);
        }
    }
    
    // Also try logging in to access other pages
    await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle' });
    console.log('At login page');
    const loginBtns = await page.locator('button').all();
    for (let i = 0; i < loginBtns.length; i++) {
        try {
            await loginBtns[i].click({ timeout: 1000 });
        } catch(e) {}
    }

    // Try accessing /app/notes, it might redirect if not logged in
    
    console.log("Errors caught:", errors);
  } catch (err) {
    console.error('Script Error:', err);
  } finally {
    await browser.close();
  }
})();
