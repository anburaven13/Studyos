const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
  await page.setContent('<video crossorigin="anonymous" autoplay><source src="https://raw.githubusercontent.com/anburaven13/Studyos/master/public/hero-bg.mp4" type="video/mp4" /></video><script>const v = document.querySelector("video"); v.addEventListener("loadeddata", () => console.log("Video loaded!")); v.addEventListener("error", () => console.log("Video error", v.error));</script>');
  await page.waitForTimeout(5000);
  await browser.close();
})();
