const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));

    await page.goto('http://localhost:5174/app', { waitUntil: 'load', timeout: 15000 });
    await page.waitForTimeout(2000);
    
    // click via JS
    await page.evaluate(() => {
        const btn = document.querySelectorAll('button')[1];
        btn.click();
    });
    
    await page.waitForTimeout(1000);
    
    console.log('isRunning after JS click:', await page.evaluate(() => localStorage.getItem('study_timer_running')));
    
    await browser.close();
})();
