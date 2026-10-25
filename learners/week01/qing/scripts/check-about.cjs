// Final acceptance checks for the About page:
//   1. no horizontal overflow at several widths
//   2. keyboard focus order and a visible focus ring
//   3. every image actually loads (no broken assets)
//   4. HTML basics: one h1, lang, alt text, viewport meta
const puppeteer = require("D:/Documents/deepseek-harness/default-workspace/node_modules/puppeteer-core");
const path = require("node:path");

const PROJ =
  "D:\\Documents\\deepseek-harness\\default-workspace\\assets-raw\\ued-to-web-real\\learners\\week01\\qing";
const LOCAL = "file:///" + path.join(PROJ, "index.html").replace(/\\/g, "/");

const WIDTHS = [1920, 1440, 1280, 1024, 900, 768, 640, 480, 390, 360, 320];

(async () => {
  const browser = await puppeteer.launch({
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    headless: "new",
    args: ["--no-sandbox", "--disable-gpu"],
    protocolTimeout: 180000,
  });

  let failures = 0;
  const fail = (msg) => {
    failures++;
    console.log("  FAIL " + msg);
  };
  const pass = (msg) => console.log("  ok   " + msg);

  // --- 1. horizontal overflow -------------------------------------------
  console.log("\n[1] Horizontal overflow");
  for (const w of WIDTHS) {
    const page = await browser.newPage();
    await page.setViewport({ width: w, height: 900 });
    await page.goto(LOCAL, { waitUntil: "networkidle2", timeout: 60000 });
    await new Promise((r) => setTimeout(r, 400));

    const info = await page.evaluate(() => {
      const docW = document.documentElement.scrollWidth;
      const bodyW = document.body.scrollWidth;
      const vw = window.innerWidth;
      // Which elements stick out past the viewport?
      const offenders = [];
      for (const el of document.querySelectorAll("*")) {
        const r = el.getBoundingClientRect();
        if (r.width === 0 || r.height === 0) continue;
        if (r.right > vw + 1 || r.left < -1) {
          offenders.push(
            `${el.tagName.toLowerCase()}.${(el.className || "").toString().slice(0, 30)} ` +
              `left=${Math.round(r.left)} right=${Math.round(r.right)}`,
          );
        }
      }
      return { docW, bodyW, vw, offenders: offenders.slice(0, 6) };
    });

    const ok = info.docW <= info.vw && info.bodyW <= info.vw;
    if (ok) {
      pass(`${w}px  docW=${info.docW} bodyW=${info.bodyW} (no overflow)`);
    } else {
      fail(`${w}px  docW=${info.docW} bodyW=${info.bodyW} vw=${info.vw}`);
      for (const o of info.offenders) console.log("        " + o);
    }
    await page.close();
  }

  // --- 2. keyboard focus ------------------------------------------------
  console.log("\n[2] Keyboard focus");
  {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });
    await page.goto(LOCAL, { waitUntil: "networkidle2", timeout: 60000 });
    await new Promise((r) => setTimeout(r, 400));

    const order = [];
    for (let i = 0; i < 14; i++) {
      await page.keyboard.press("Tab");
      const info = await page.evaluate(() => {
        const el = document.activeElement;
        if (!el || el === document.body) return null;
        const cs = getComputedStyle(el);
        const r = el.getBoundingClientRect();
        return {
          tag: el.tagName.toLowerCase(),
          text: (el.textContent || el.getAttribute("aria-label") || "").trim().slice(0, 26),
          outline: cs.outlineStyle !== "none" && cs.outlineWidth !== "0px",
          visible: r.width > 0 && r.height > 0,
        };
      });
      if (info) order.push(info);
    }

    console.log(
      "  tab order: " + order.map((o) => `${o.tag}(${o.text})`).join(" > "),
    );
    if (order.length < 8) fail(`only ${order.length} focusable elements reached`);
    else pass(`${order.length} focusable stops`);

    const allVisible = order.every((o) => o.visible);
    if (allVisible) pass("every focused element is visible");
    else fail("some focused element has zero size");

    // the skip link must be first
    if (order[0] && /skip/i.test(order[0].text)) pass("skip link is first");
    else fail("first tab stop is not the skip link: " + JSON.stringify(order[0]));

    const withOutline = order.filter((o) => o.outline).length;
    if (withOutline > 0) pass(`${withOutline} stops show a focus ring`);
    else fail("no element showed a focus outline");

    await page.close();
  }

  // --- 3. images --------------------------------------------------------
  console.log("\n[3] Images load");
  {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });
    await page.goto(LOCAL, { waitUntil: "networkidle2", timeout: 60000 });
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 300) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 60));
      }
      window.scrollTo(0, 0);
    });
    await new Promise((r) => setTimeout(r, 800));

    const imgs = await page.evaluate(() =>
      Array.from(document.images).map((i) => ({
        src: (i.getAttribute("src") || "").split("/").pop(),
        complete: i.complete,
        natW: i.naturalWidth,
        natH: i.naturalHeight,
        alt: i.getAttribute("alt"),
        hidden: i.getBoundingClientRect().width === 0,
      })),
    );
    for (const i of imgs) {
      if (i.natW === 0) fail(`broken image: ${i.src}`);
      else if (!i.hidden) pass(`${i.src} ${i.natW}x${i.natH}`);
    }
    const missingAlt = imgs.filter((i) => i.alt === null);
    if (missingAlt.length === 0) pass("every img has an alt attribute");
    else fail(`${missingAlt.length} img without alt`);

    // the woff2 must load too
    const fontOk = await page.evaluate(async () => {
      await document.fonts.ready;
      return document.fonts.check('16px "Inter"');
    });
    if (fontOk) pass("Inter webfont available");
    else fail("Inter webfont not loaded");
    await page.close();
  }

  // --- 4. document structure -------------------------------------------
  console.log("\n[4] Document structure");
  {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });
    await page.goto(LOCAL, { waitUntil: "networkidle2", timeout: 60000 });
    const struct = await page.evaluate(() => ({
      lang: document.documentElement.lang,
      title: document.title,
      h1Count: document.querySelectorAll("h1").length,
      h2Count: document.querySelectorAll("h2").length,
      header: !!document.querySelector("header"),
      nav: document.querySelectorAll("nav").length,
      main: !!document.querySelector("main#main"),
      footer: !!document.querySelector("footer"),
      viewport: !!document.querySelector('meta[name="viewport"]'),
      desc: !!document.querySelector('meta[name="description"]'),
      skip: !!document.querySelector(".skip-link"),
      // heading level jumps (h2 -> h4) hurt screen-reader navigation
      headings: Array.from(document.querySelectorAll("h1,h2,h3,h4,h5,h6")).map(
        (h) => h.tagName.toLowerCase(),
      ),
    }));

    if (struct.lang) pass(`lang="${struct.lang}"`);
    else fail("html has no lang");

    if (struct.h1Count === 1) pass("exactly one h1");
    else fail(`${struct.h1Count} h1 elements`);

    if (struct.title) pass(`title: ${struct.title}`);
    else fail("no title");

    if (struct.main) pass("<main id=main> present");
    else fail("no main landmark");

    if (struct.skip) pass("skip link present");
    else fail("no skip link");

    if (struct.viewport && struct.desc) pass("viewport + description meta");
    else fail("missing viewport or description meta");

    // detect skipped heading levels
    const levels = struct.headings.map((t) => Number(t[1]));
    let jump = null;
    for (let i = 1; i < levels.length; i++) {
      if (levels[i] - levels[i - 1] > 1) {
        jump = `h${levels[i - 1]} -> h${levels[i]}`;
        break;
      }
    }
    if (!jump) pass(`heading order ok (${struct.headings.join(",")})`);
    else fail(`heading level jump: ${jump}`);

    await page.close();
  }

  await browser.close();
  console.log(`\n=== ${failures === 0 ? "ALL CHECKS PASSED" : failures + " CHECK(S) FAILED"} ===`);
  process.exit(failures === 0 ? 0 : 1);
})();
