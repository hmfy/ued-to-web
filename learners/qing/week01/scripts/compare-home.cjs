// Compare the local home page with the live reference at two viewports.
// Prints section heights and key element boxes so differences are measurable.
const puppeteer = require("D:/Documents/deepseek-harness/default-workspace/node_modules/puppeteer-core");
const path = require("node:path");
const fs = require("node:fs");

const PROJ = path.join(__dirname, "..");
const LOCAL = "file:///" + path.join(PROJ, "home.html").replace(/\\/g, "/");
const REF = "https://chargewipe.com/";
const OUT = "D:\\Documents\\deepseek-harness\\default-workspace\\shots-home";
fs.mkdirSync(OUT, { recursive: true });

const VIEWPORTS = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "mobile", width: 390, height: 844, isMobile: true },
];

(async () => {
  const browser = await puppeteer.launch({
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    headless: "new",
    args: ["--no-sandbox", "--disable-gpu", "--hide-scrollbars"],
    protocolTimeout: 180000,
  });

  const results = {};

  for (const vp of VIEWPORTS) {
    for (const [label, url] of [["ref", REF], ["local", LOCAL]]) {
      const page = await browser.newPage();
      await page.setViewport({
        width: vp.width,
        height: vp.height,
        deviceScaleFactor: 1,
        isMobile: !!vp.isMobile,
        hasTouch: !!vp.isMobile,
      });
      await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });
      await page.evaluate(async () => {
        document.querySelectorAll('[role="dialog"]').forEach((el) => {
          if (/cookie/i.test(el.textContent || "")) el.remove();
        });
        for (let y = 0; y < document.body.scrollHeight; y += 220) {
          window.scrollTo(0, y);
          await new Promise((r) => setTimeout(r, 90));
        }
        window.scrollTo(0, 0);
      });
      await new Promise((r) => setTimeout(r, 1500));

      const data = await page.evaluate(() => {
        const R = (n) => Math.round(n * 100) / 100;
        const norm = (s) => (s || "").replace(/\s+/g, " ").trim();
        const vis = (sel) =>
          Array.from(document.querySelectorAll(sel)).filter(
            (e) => e.getBoundingClientRect().height > 0,
          );

        const secByName = (t) =>
          vis("section").find((s) => {
            const h = s.querySelector("h1, h2");
            return h && norm(h.textContent).toLowerCase().startsWith(t);
          });

        const box = (el) => {
          if (!el) return null;
          const r = el.getBoundingClientRect();
          const cs = getComputedStyle(el);
          return {
            top: R(r.top + scrollY),
            left: R(r.left),
            w: R(r.width),
            h: R(r.height),
            fs: cs.fontSize,
            lh: cs.lineHeight,
          };
        };

        const h1 = document.querySelector("h1");
        const heroSec = h1 ? h1.closest("section") : null;

        return {
          bodyHeight: document.body.scrollHeight,
          scrollWidth: document.documentElement.scrollWidth,
          viewportWidth: innerWidth,
          sections: vis("section").map((s) => {
            const h = s.querySelector("h1, h2");
            const r = s.getBoundingClientRect();
            return {
              name: h ? norm(h.textContent).slice(0, 34) : "(none)",
              top: R(r.top + scrollY),
              height: R(r.height),
            };
          }),
          details: {
            h1: box(h1),
            heroP: box(h1 && h1.parentElement.querySelector("p")),
            heroImg: box(h1 && h1.closest("section").querySelector("img")),
            canDoH2: box(secByName("what can we do")?.querySelector("h2")),
            card1: box(secByName("what can we do")?.querySelector("article")),
            prodH2: box(secByName("our products")?.querySelector("h2")),
            prodRow1: box(secByName("our products")?.querySelector("article")),
            whyH2: box(secByName("why choose")?.querySelector("h2")),
            whyLi1: box(secByName("why choose")?.querySelector("li")),
            faqH2: box(secByName("faqs")?.querySelector("h2")),
            faqItem1: box(secByName("faqs")?.querySelector("article")),
            contactH2: box(secByName("contact us")?.querySelector("h2")),
            contactPanel: box(
              secByName("contact us")?.querySelector("[class*=rounded]"),
            ),
          },
        };
      });

      results[`${vp.name}-${label}`] = data;
      await page.screenshot({
        path: path.join(OUT, `${vp.name}-${label}.png`),
        fullPage: true,
      });
      console.log(
        `${vp.name.padEnd(8)} ${label.padEnd(6)} body=${data.bodyHeight} scrollW=${data.scrollWidth}`,
      );
      await page.close();
    }
  }

  console.log("\n=== Sections (ref vs local) ===");
  for (const vp of VIEWPORTS) {
    const ref = results[`${vp.name}-ref`];
    const loc = results[`${vp.name}-local`];
    console.log(`\n[${vp.name}] ref body=${ref.bodyHeight}  local body=${loc.bodyHeight}`);
    const max = Math.max(ref.sections.length, loc.sections.length);
    for (let i = 0; i < max; i++) {
      const a = ref.sections[i];
      const b = loc.sections[i];
      const name = (a && a.name) || (b && b.name) || "?";
      const d = a && b ? (b.height - a.height).toFixed(1) : "-";
      console.log(
        `  ${name.padEnd(36)} ref=${String(a ? a.height : "-").padStart(8)}  local=${String(b ? b.height : "-").padStart(8)}  d=${d}`,
      );
    }
  }

  console.log("\n=== Element details ===");
  for (const vp of VIEWPORTS) {
    const ref = results[`${vp.name}-ref`].details;
    const loc = results[`${vp.name}-local`].details;
    console.log(`\n[${vp.name}]`);
    for (const key of Object.keys(ref)) {
      const a = ref[key];
      const b = loc[key];
      if (!a && !b) continue;
      const f = (o) =>
        o
          ? `t=${String(o.top).padStart(8)} l=${String(o.left).padStart(6)} ${String(o.w).padStart(7)}x${String(o.h).padStart(7)} fs=${o.fs}`
          : "  (missing)";
      console.log(`  ${key.padEnd(13)} ref ${f(a)}`);
      console.log(`  ${" ".repeat(13)} loc ${f(b)}`);
    }
  }

  fs.writeFileSync(path.join(OUT, "result.json"), JSON.stringify(results, null, 2));
  await browser.close();
})();
