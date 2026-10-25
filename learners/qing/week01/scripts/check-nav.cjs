// Verify the new nav dropdowns: hover each menu, screenshot it, and check the
// panel geometry against the reference (210px wide, 8px radius, 17px inset).
const puppeteer = require("D:/Documents/deepseek-harness/default-workspace/node_modules/puppeteer-core");
const path = require("node:path");
const fs = require("fs");

const OUT = "D:\\Documents\\deepseek-harness\\default-workspace\\shots-nav";
fs.mkdirSync(OUT, { recursive: true });

const LOCAL =
  "file:///" +
  path
    .join(
      path.join(__dirname, ".."),
      "home.html",
    )
    .replace(/\\/g, "/");

(async () => {
  const browser = await puppeteer.launch({
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    headless: "new",
    args: ["--no-sandbox", "--disable-gpu"],
    protocolTimeout: 180000,
  });

  let failures = 0;
  const fail = (m) => {
    failures++;
    console.log("  FAIL " + m);
  };
  const pass = (m) => console.log("  ok   " + m);

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 919 });
  await page.goto(LOCAL, { waitUntil: "networkidle2", timeout: 60000 });
  await new Promise((r) => setTimeout(r, 800));

  for (const label of ["Chargebacks", "Merchants", "Resources"]) {
    console.log(`\n[${label}]`);

    const handle = await page.evaluateHandle((text) => {
      return Array.from(document.querySelectorAll(".primary-nav > ul > li.has-menu")).find(
        (li) => (li.querySelector(":scope > a").textContent || "").trim().startsWith(text),
      );
    }, label);

    const li = handle.asElement();
    if (!li) {
      fail("menu item not found");
      continue;
    }

    const link = await li.$(":scope > a");
    await link.hover();
    await new Promise((r) => setTimeout(r, 450));

    const state = await page.evaluate((text) => {
      const li = Array.from(document.querySelectorAll(".primary-nav li.has-menu")).find(
        (x) => (x.querySelector(":scope > a").textContent || "").trim().startsWith(text),
      );
      const menu = li.querySelector(".nav-menu");
      const cs = getComputedStyle(menu);
      const r = menu.getBoundingClientRect();
      return {
        visible: cs.visibility === "visible" && Number(cs.opacity) > 0.9,
        w: Math.round(r.width),
        h: Math.round(r.height),
        radius: cs.borderRadius,
        pad: cs.padding,
        bg: cs.backgroundColor,
        items: Array.from(menu.querySelectorAll("a")).map((a) => ({
          text: (a.textContent || "").trim(),
          fs: getComputedStyle(a).fontSize,
        })),
      };
    }, label);

    if (state.visible) pass(`panel visible on hover (${state.w}x${state.h})`);
    else fail("panel not visible on hover");

    if (state.w === 210) pass("width 210px matches reference");
    else fail(`width is ${state.w}, expected 210`);

    if (state.radius === "8px") pass("radius 8px");
    else fail(`radius is ${state.radius}`);

    if (state.items.length) pass(`${state.items.length} items: ${state.items.map((i) => i.text).join(" / ")}`);
    else fail("no items in panel");

    const shot = path.join(OUT, `${label.toLowerCase()}.png`);
    await page.screenshot({
      path: shot,
      clip: { x: 600, y: 0, width: 900, height: 320 },
    });

    // Move away so the next hover starts clean.
    await page.mouse.move(50, 600);
    await new Promise((r) => setTimeout(r, 300));
  }

  // Keyboard: tabbing into a menu should reveal it (focus-within).
  console.log("\n[Keyboard]");
  await page.evaluate(() => {
    const a = document.querySelector(".primary-nav li.has-menu > a");
    a.focus();
  });
  await new Promise((r) => setTimeout(r, 400));
  const kbVisible = await page.evaluate(() => {
    const li = document.querySelector(".primary-nav li.has-menu");
    const menu = li.querySelector(".nav-menu");
    const cs = getComputedStyle(menu);
    return cs.visibility === "visible" && Number(cs.opacity) > 0.9;
  });
  if (kbVisible) pass("panel opens on keyboard focus");
  else fail("panel does not open on keyboard focus");

  await page.close();
  await browser.close();

  console.log(`\n=== ${failures === 0 ? "NAV DROPDOWNS OK" : failures + " PROBLEM(S)"} ===`);
})();
