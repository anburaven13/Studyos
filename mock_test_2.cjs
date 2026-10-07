const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    
    // intercept API requests to return fake data so buttons render
    await page.route('**/api/**', async (route) => {
        const url = route.request().url();
        if (url.includes('/api/planner/merged')) return route.fulfill({ json: [] });
        if (url.includes('/api/homework')) return route.fulfill({ json: [{id:'1', title:'Mock Task', subject:'Mock', due_date:'2026-01-01', completed:false}] });
        if (url.includes('/api/exams')) return route.fulfill({ json: [{id:'1', name:'Mock Exam', date:'2026-01-01', confidence: 50}] });
        if (url.includes('/api/routines')) return route.fulfill({ json: { 'Monday': [{id:'1', name:'Mock Class', start_time:'08:00', end_time:'09:00', routine_type:'class'}], 'Tuesday': [], 'Wednesday': [], 'Thursday': [], 'Friday': [], 'Saturday': [], 'Sunday': [] } });
        if (url.includes('/api/notes')) return route.fulfill({ json: [{id:'1', title:'Mock Note', content:'mock', folder:'General'}] });
        if (url.includes('/api/analytics')) return route.fulfill({ json: [] });
        return route.fulfill({ status: 200, json: {} }); // default success for POST/PUT/DELETE
    });
    
    page.on('console', msg => {
        if (msg.type() === 'error') console.log(`[CONSOLE ERROR] ${msg.text()}`);
    });
    page.on('pageerror', err => console.log(`[PAGE ERROR] ${err.message}`));

    const routes = [
        '/app', '/app/notes', '/app/homework', '/app/planner', 
        '/app/routines', '/app/tutor', '/app/workspace', 
        '/app/exams', '/app/messages', '/app/settings'
    ];

    for (const route of routes) {
        console.log(`\nTesting route: ${route}`);
        await page.goto(`http://localhost:5174${route}`, { waitUntil: 'load' });
        await page.waitForTimeout(1500); // let data fetch
        
        const count = await page.locator('button').count();
        console.log(`Found ${count} buttons on ${route}`);
        
        for (let i = 0; i < count; i++) {
            const btn = page.locator('button').nth(i);
            
            // Check if visible and enabled
            const isVisible = await btn.isVisible();
            const isDisabled = await btn.isDisabled();
            
            const btnText = (await btn.textContent())?.trim() || '[no text]';
            
            if (!isVisible || isDisabled) {
                continue;
            }
            
            console.log(`Clicking button [${btnText}] (index ${i})`);
            
            const htmlBefore = await page.content();
            try {
                await btn.click({ timeout: 2000, force: true });
                await page.waitForTimeout(500); // wait for state change
                const htmlAfter = await page.content();
                
                if (htmlBefore === htmlAfter) {
                    // double check if there was a real state change that didn't affect HTML (e.g. interval)
                    // but most buttons should change HTML (modal opens, etc.)
                    console.log(`>>> POSSIBLE BROKEN BUTTON: No visual change and no error for [${btnText}]`);
                }
            } catch (e) {
                console.log(`>>> ERROR clicking [${btnText}]: ${e.message}`);
            }
            
            // reload to reset state for the next button
            await page.goto(`http://localhost:5174${route}`, { waitUntil: 'load' });
            await page.waitForTimeout(1000);
        }
    }
    
    await browser.close();
})();
