// Produce the required screenshots for BOTH pages:
//   screenshots/desktop.png / mobile.png            (About)
//   screenshots/home-desktop.png / home-mobile.png  (Home)
const puppeteer = require("D:/Documents/deepseek-harness/default-workspace/node_modules/puppeteer-core");
const path = require("node:path");
const fs = require("node:fs");

const PROJ =
  "D:\\Documents\\deepseek-harness\\default-workspace\\assets-raw\\ued-to-web-real\\learners\\week01\\qing";
const OUT = path.join(PROJ, "screenshots");
fs.mkdirSync(OUT, { recursive: true });

const PAGES = [
  { file: "index.html", prefix: "" },
  { file: "home.html", prefix: "home-" },
];

(async () => {
  const browser = await puppeteer.launch({
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    headless: "new",
    args: ["--no-sandbox", "--disable-gpu", "--hide-scrollbars"],
    protocolTimeout: 180000,
  });

  for (const p of PAGES) {
    const url = "file:///" + path.join(PROJ, p.file).replace(/\\/g, "/");
    for (const [name, width, height, mobile] of [
      ["desktop", 1440, 900, false],
      ["mobile", 390, 844, true],
    ]) {
      const page = await browser.newPage();
      await page.setViewport({
        width,
        height,
        deviceScaleFactor: 1,
        isMobile: mobile,
        hasTouch: mobile,
      });
      await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });
      await page.evaluate(async () => {
        for (let y = 0; y < document.body.scrollHeight; y += 250) {
          window.scrollTo(0, y);
          await new Promise((r) => setTimeout(r, 60));
        }
        window.scrollTo(0, 0);
      });
      await page.evaluate(() => document.fonts.ready);
      await new Promise((r) => setTimeout(r, 800));

      const file = path.join(OUT, `${p.prefix}${name}.png`);
      await page.screenshot({ path: file, fullPage: true });
      const size = await page.evaluate(() => ({
        w: document.documentElement.scrollWidth,
        h: document.body.scrollHeight,
      }));
      console.log(`${p.prefix}${name}: ${size.w}x${size.h} -> ${path.basename(file)}`);
      await page.close();
    }
  }

  await browser.close();
})();
