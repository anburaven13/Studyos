const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
  await page.setContent('<video crossorigin="anonymous" autoplay><source src="https://corsproxy.io/?url=https%3A%2F%2Fcdn.sceneai.art%2FHero%2520Section%2520Video%2F50b4f304-cdca-4e12-8735-580d225834be.mp4" type="video/mp4" /></video><script>const v = document.querySelector("video"); v.addEventListener("loadeddata", () => console.log("Video loaded!")); v.addEventListener("error", () => console.log("Video error", v.error));</script>');
  await page.waitForTimeout(5000);
  await browser.close();
})();
