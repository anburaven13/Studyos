const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    await page.goto('http://localhost:5174/app', { waitUntil: 'load', timeout: 15000 });
    await page.waitForTimeout(2000);
    
    const timerBtn = page.locator('button').nth(1); // Assuming index 1 is StudyTimer
    console.log("Button HTML before:", await timerBtn.evaluate(b => b.outerHTML));
    
    await timerBtn.click({ force: true });
    await page.waitForTimeout(1000);
    
    console.log("Button HTML after:", await timerBtn.evaluate(b => b.outerHTML));
    
    await browser.close();
})();
