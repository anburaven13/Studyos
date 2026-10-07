const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));

    await page.goto('http://localhost:5174/app', { waitUntil: 'load', timeout: 15000 });
    await page.waitForTimeout(2000);
    
    const timerBtn = page.locator('button').nth(1);
    
    // add an event listener to see if click fires
    await page.evaluate(() => {
        const btn = document.querySelectorAll('button')[1];
        btn.addEventListener('click', () => console.log('BUTTON WAS CLICKED NATIVELY'));
    });

    console.log('isRunning before:', await page.evaluate(() => localStorage.getItem('study_timer_running')));
    
    await timerBtn.click({ force: true });
    await page.waitForTimeout(1000);
    
    console.log('isRunning after:', await page.evaluate(() => localStorage.getItem('study_timer_running')));
    
    await browser.close();
})();
