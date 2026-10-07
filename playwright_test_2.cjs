const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    const errors = [];
    const stateChanges = [];

    page.on('console', msg => {
        if (msg.type() === 'error') {
            errors.push(msg.text());
        }
    });
    
    page.on('pageerror', err => {
        errors.push(err.message);
    });

    const routes = [
        '/',
        '/app',
        '/app/notes',
        '/app/homework',
        '/app/planner',
        '/app/routines',
        '/app/tutor',
        '/app/workspace',
        '/app/exams',
        '/app/messages',
        '/app/settings'
    ];

    for (const route of routes) {
        console.log(`\nTesting route: ${route}`);
        try {
            await page.goto(`http://localhost:5174${route}`, { waitUntil: 'load', timeout: 15000 });
            await page.waitForTimeout(2000); // wait for render
            
            const buttons = await page.locator('button');
            const count = await buttons.count();
            console.log(`Found ${count} buttons on ${route}`);
            
            for (let i = 0; i < count; i++) {
                const btn = buttons.nth(i);
                const text = await btn.textContent();
                const isVisible = await btn.isVisible();
                const isDisabled = await btn.isDisabled();
                if (!isVisible || isDisabled) {
                    console.log(`Skipping button [${text ? text.trim() : 'no text'}] - visible: ${isVisible}, disabled: ${isDisabled}`);
                    continue;
                }
                
                console.log(`Clicking button [${text ? text.trim() : 'no text'}] (index ${i})`);
                const htmlBefore = await page.content();
                try {
                    await btn.click({ timeout: 2000, force: true });
                    await page.waitForTimeout(500); // wait for state change
                    
                    const htmlAfter = await page.content();
                    if (htmlBefore === htmlAfter && errors.length === 0) {
                        console.log(`>>> POSSIBLE BROKEN BUTTON: No visual change and no error for [${text ? text.trim() : 'no text'}]`);
                    }
                    if (errors.length > 0) {
                        console.log(`>>> ERROR after clicking [${text ? text.trim() : 'no text'}]:`, errors);
                        errors.length = 0; // clear errors
                    }
                } catch (e) {
                    console.log(`Click failed: ${e.message}`);
                }
                
                // If it opened a modal, try to close it or reload
                if (htmlBefore !== await page.content()) {
                    await page.reload({ waitUntil: 'load', timeout: 10000 });
                    await page.waitForTimeout(1000);
                }
            }
        } catch (e) {
            console.log(`Failed to test route ${route}: ${e.message}`);
        }
    }

    await browser.close();
})();
