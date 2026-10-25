// Acceptance checks for the home page:
//   1. no horizontal overflow at many widths
//   2. FAQ accordion actually opens/closes and updates aria-expanded
//   3. keyboard: focus order, focus ring, Enter/Space on FAQ buttons
//   4. images all load, fonts load
//   5. document structure sanity
const puppeteer = require("D:/Documents/deepseek-harness/default-workspace/node_modules/puppeteer-core");
const path = require("node:path");

const PROJ = path.join(__dirname, "..");
const LOCAL = "file:///" + path.join(PROJ, "home.html").replace(/\\/g, "/");

const WIDTHS = [1920, 1440, 1280, 1024, 900, 768, 640, 480, 390, 360, 320];

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

  // --- 1. overflow ---
  console.log("\n[1] Horizontal overflow");
  for (const w of WIDTHS) {
    const page = await browser.newPage();
    await page.setViewport({ width: w, height: 900 });
    await page.goto(LOCAL, { waitUntil: "networkidle2", timeout: 60000 });
    await new Promise((r) => setTimeout(r, 350));
    const info = await page.evaluate(() => ({
      docW: document.documentElement.scrollWidth,
      bodyW: document.body.scrollWidth,
      vw: innerWidth,
    }));
    if (info.docW <= info.vw && info.bodyW <= info.vw) {
      pass(`${w}px  docW=${info.docW} (no overflow)`);
    } else {
      fail(`${w}px  docW=${info.docW} bodyW=${info.bodyW} vw=${info.vw}`);
    }
    await page.close();
  }

  // --- 2. FAQ accordion ---
  console.log("\n[2] FAQ accordion");
  {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });
    await page.goto(LOCAL, { waitUntil: "networkidle2", timeout: 60000 });
    await new Promise((r) => setTimeout(r, 400));

    const start = await page.evaluate(() => {
      const b = document.querySelector(".hp-faq-btn");
      const item = b.closest(".hp-faq-item");
      return {
        expanded: b.getAttribute("aria-expanded"),
        itemH: item.getBoundingClientRect().height,
      };
    });
    if (start.expanded === "false") pass("starts collapsed (aria-expanded=false)");
    else fail("initial aria-expanded is " + start.expanded);

    await page.click(".hp-faq-btn");
    await new Promise((r) => setTimeout(r, 500));

    const opened = await page.evaluate(() => {
      const b = document.querySelector(".hp-faq-btn");
      const item = b.closest(".hp-faq-item");
      const p = item.querySelector(".hp-faq-a-inner p");
      return {
        expanded: b.getAttribute("aria-expanded"),
        itemH: item.getBoundingClientRect().height,
        answerVisible: p ? p.getBoundingClientRect().height > 0 : false,
      };
    });
    if (opened.expanded === "true") pass("click opens (aria-expanded=true)");
    else fail("click did not set aria-expanded: " + opened.expanded);
    if (opened.itemH > start.itemH) pass(`item grew ${start.itemH.toFixed(1)} -> ${opened.itemH.toFixed(1)}`);
    else fail("item did not grow when opened");
    if (opened.answerVisible) pass("answer text is visible");
    else fail("answer text not visible");

    // single-open behaviour: opening the 2nd closes the 1st
    const all = await page.$$(".hp-faq-btn");
    await all[1].click();
    await new Promise((r) => setTimeout(r, 500));
    const states = await page.evaluate(() =>
      Array.from(document.querySelectorAll(".hp-faq-btn")).map((b) =>
        b.getAttribute("aria-expanded"),
      ),
    );
    if (states[0] === "false" && states[1] === "true") {
      pass("single-open: opening #2 closed #1");
    } else {
      fail("single-open broken: " + JSON.stringify(states));
    }

    // clicking the open one closes it
    await all[1].click();
    await new Promise((r) => setTimeout(r, 500));
    const afterToggle = await page.evaluate(
      () => document.querySelectorAll('.hp-faq-btn[aria-expanded="true"]').length,
    );
    if (afterToggle === 0) pass("clicking again closes it");
    else fail(`${afterToggle} panels still open`);

    // keyboard: Enter on a focused button must open it
    await page.evaluate(() => document.querySelectorAll(".hp-faq-btn")[2].focus());
    await page.keyboard.press("Enter");
    await new Promise((r) => setTimeout(r, 500));
    const kb = await page.evaluate(
      () => document.querySelectorAll(".hp-faq-btn")[2].getAttribute("aria-expanded"),
    );
    if (kb === "true") pass("keyboard Enter opens the panel");
    else fail("keyboard Enter did not open panel: " + kb);

    await page.close();
  }

  // --- 3. keyboard focus ---
  console.log("\n[3] Keyboard focus");
  {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });
    await page.goto(LOCAL, { waitUntil: "networkidle2", timeout: 60000 });
    await new Promise((r) => setTimeout(r, 400));

    const order = [];
    for (let i = 0; i < 24; i++) {
      await page.keyboard.press("Tab");
      const info = await page.evaluate(() => {
        const el = document.activeElement;
        if (!el || el === document.body) return null;
        const cs = getComputedStyle(el);
        const r = el.getBoundingClientRect();
        return {
          tag: el.tagName.toLowerCase(),
          text: (el.textContent || el.getAttribute("aria-label") || "").trim().slice(0, 24),
          outline: cs.outlineStyle !== "none" && cs.outlineWidth !== "0px",
          visible: r.width > 0 && r.height > 0,
        };
      });
      if (info) order.push(info);
    }
    console.log("  stops: " + order.map((o) => `${o.tag}(${o.text})`).join(" > ").slice(0, 300));
    if (order.length >= 15) pass(`${order.length} focusable stops`);
    else fail(`only ${order.length} focusable stops`);
    if (order.every((o) => o.visible)) pass("all focused elements visible");
    else fail("some focused element is zero-size");
    if (/skip/i.test(order[0]?.text || "")) pass("skip link is first");
    else fail("first stop is not the skip link");
    if (order.some((o) => o.tag === "button")) pass("FAQ buttons are reachable by keyboard");
    else fail("no button reached by Tab");
    await page.close();
  }

  // --- 4. assets ---
  console.log("\n[4] Assets");
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
      Array.from(document.images)
        .filter((i) => i.getBoundingClientRect().width > 0)
        .map((i) => ({
          src: (i.getAttribute("src") || "").split("/").pop(),
          natW: i.naturalWidth,
          natH: i.naturalHeight,
          alt: i.getAttribute("alt"),
        })),
    );
    let broken = 0;
    for (const i of imgs) {
      if (i.natW === 0) {
        fail(`broken image: ${i.src}`);
        broken++;
      }
    }
    if (!broken) pass(`all ${imgs.length} visible images loaded`);
    if (imgs.every((i) => i.alt !== null)) pass("every img has alt");
    else fail("img without alt attribute");

    const fontOk = await page.evaluate(async () => {
      await document.fonts.ready;
      return document.fonts.check('16px "Inter"');
    });
    if (fontOk) pass("Inter webfont available");
    else fail("Inter webfont missing");
    await page.close();
  }

  // --- 5. structure ---
  console.log("\n[5] Document structure");
  {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });
    await page.goto(LOCAL, { waitUntil: "networkidle2", timeout: 60000 });
    const s = await page.evaluate(() => ({
      lang: document.documentElement.lang,
      title: document.title,
      h1: document.querySelectorAll("h1").length,
      main: !!document.querySelector("main#main"),
      header: !!document.querySelector("header"),
      footer: !!document.querySelector("footer"),
      skip: !!document.querySelector(".skip-link"),
      headings: Array.from(document.querySelectorAll("h1,h2,h3,h4")).map((h) =>
        Number(h.tagName[1]),
      ),
      scripts: document.querySelectorAll("script[src]").length,
    }));
    if (s.lang) pass(`lang="${s.lang}"`);
    else fail("no lang");
    if (s.h1 === 1) pass("exactly one h1");
    else fail(`${s.h1} h1 elements`);
    if (s.main && s.header && s.footer) pass("main/header/footer landmarks present");
    else fail("missing landmark");
    if (s.skip) pass("skip link present");
    else fail("no skip link");
    if (s.scripts >= 1) pass(`${s.scripts} external script(s) — FAQ behaviour lives in home.js`);
    else fail("home.js not referenced");

    let jump = null;
    for (let i = 1; i < s.headings.length; i++) {
      if (s.headings[i] - s.headings[i - 1] > 1) {
        jump = `h${s.headings[i - 1]} -> h${s.headings[i]}`;
        break;
      }
    }
    if (!jump) pass("heading order has no skipped level");
    else fail("heading jump: " + jump);

    if (s.title) pass(`title: ${s.title}`);
    else fail("no title");
    await page.close();
  }

  await browser.close();
  console.log(`\n=== ${failures === 0 ? "ALL CHECKS PASSED" : failures + " CHECK(S) FAILED"} ===`);
  process.exit(failures === 0 ? 0 : 1);
})();
