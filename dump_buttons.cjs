const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    await page.goto('http://localhost:5174/app', { waitUntil: 'load', timeout: 15000 });
    await page.waitForTimeout(2000);
    
    const count = await page.locator('button').count();
    for(let i = 0; i < count; i++) {
        const html = await page.locator('button').nth(i).evaluate(b => b.outerHTML);
        console.log(`Button ${i}:`, html);
    }
    
    await browser.close();
})();
