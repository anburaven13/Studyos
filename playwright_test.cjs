const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  let errors = [];

  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(`Console Error: ${msg.text()}`);
    }
  });

  page.on('pageerror', err => {
    errors.push(`Page Error: ${err.message}`);
  });

  await page.addInitScript(() => {
    window.localStorage.setItem('token', 'mocktoken');
  });

  const routes = [
    '/app',
    '/app/notes',
    '/app/homework',
    '/app/planner',
    '/app/exams',
    '/app/genome',
    '/app/messages',
    '/app/settings',
    '/app/routines',
    '/app/workspace'
  ];

  for (const route of routes) {
    try {
      console.log(`\nTesting route: ${route}`);
      await page.goto(`http://localhost:5174${route}`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(1500); // wait for rendering and any async data
      
      const buttons = await page.locator('button').all();
      console.log(`Found ${buttons.length} buttons on ${route}`);
      
      for (let i = 0; i < buttons.length; i++) {
        const btn = buttons[i];
        let text = 'no text';
        try { text = await btn.textContent(); } catch(e) {}
        
        console.log(`Clicking button: [${text ? text.trim() : 'no text'}]`);
        errors = [];
        try {
            await btn.click({ timeout: 1000, force: true });
            await page.waitForTimeout(500); // Wait for error to pop up
            if (errors.length > 0) {
                console.log(`>>> ERROR after clicking [${text ? text.trim() : 'no text'}]:`, errors);
            }
        } catch(e) {
            console.log(`Button click failed: ` + e.message);
        }
      }
    } catch (e) {
        console.log(`Failed to test route ${route}:`, e.message);
    }
  }

  await browser.close();
})();
