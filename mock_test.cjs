const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    
    // intercept API requests to return fake data so buttons render
    await page.route('**/api/planner/merged', route => route.fulfill({ json: [] }));
    await page.route('**/api/homework', route => route.fulfill({ json: [{id:'1', title:'Mock Task', subject:'Mock', due_date:'2026-01-01', completed:false}] }));
    await page.route('**/api/exams', route => route.fulfill({ json: [] }));
    await page.route('**/api/routines', route => route.fulfill({ json: { 'Monday': [], 'Tuesday': [], 'Wednesday': [], 'Thursday': [], 'Friday': [], 'Saturday': [], 'Sunday': [] } }));
    await page.route('**/api/notes', route => route.fulfill({ json: [] }));
    await page.route('**/api/analytics', route => route.fulfill({ json: [] }));
    
    // Go to app
    await page.goto('http://localhost:5174/app', { waitUntil: 'load' });
    await page.waitForTimeout(1000);
    
    // We will inject a script that clicks every button on the page and checks if state changes.
    // Instead of doing it on every route, let's just do manual code review of the buttons.
    await browser.close();
})();
