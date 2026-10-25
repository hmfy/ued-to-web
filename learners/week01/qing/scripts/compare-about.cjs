// Compare the local About page with the reference at two viewports.
//
// Opens both files with a headless browser, screenshots them, and prints the
// section heights so the CSS can be tuned against real numbers.
//
// Usage: node scripts/compare-about.cjs

const puppeteer = require("D:/Documents/deepseek-harness/default-workspace/node_modules/puppeteer-core");
const path = require("node:path");
const fs = require("node:fs");

const PROJ = "D:\\Documents\\deepseek-harness\\default-workspace\\assets-raw\\ued-to-web-real\\learners\\week01\\qing";
const LOCAL_URL = "file:///" + path.join(PROJ, "index.html").replace(/\\/g, "/");
const REF_URL = "https://chargewipe.com/about";

const OUT = path.join(PROJ, "..", "..", "..", "..", "..", "shots-about");
const VIEWPORTS = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "mobile", width: 390, height: 844, isMobile: true },
];

fs.mkdirSync(OUT, { recursive: true });

(async () => {
  const browser = await puppeteer.launch({
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    headless: "new",
    args: ["--no-sandbox", "--disable-gpu", "--hide-scrollbars"],
    protocolTimeout: 180000,
  });

  const results = {};

  for (const vp of VIEWPORTS) {
    for (const [label, url] of [
      ["ref", REF_URL],
      ["local", LOCAL_URL],
    ]) {
      const page = await browser.newPage();
      await page.setViewport({
        width: vp.width,
        height: vp.height,
        deviceScaleFactor: 1,
        isMobile: !!vp.isMobile,
        hasTouch: !!vp.isMobile,
      });

      try {
        await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });
      } catch (error) {
        console.log(`goto warn ${label}: ${error.message}`);
      }

      await page.evaluate(async () => {
        document.querySelectorAll('[role="dialog"]').forEach((el) => {
          if (/cookie/i.test(el.textContent || "")) el.remove();
        });
        for (let y = 0; y < document.body.scrollHeight; y += 350) {
          window.scrollTo(0, y);
          await new Promise((r) => setTimeout(r, 70));
        }
        window.scrollTo(0, 0);
      });
      await new Promise((r) => setTimeout(r, 1200));

      const data = await page.evaluate(() => {
        const round = (n) => Math.round(n);
        const rectOf = (el) => {
          if (!el) return null;
          const r = el.getBoundingClientRect();
          const cs = getComputedStyle(el);
          return {
            top: round(r.top + scrollY),
            left: round(r.left),
            w: round(r.width),
            h: round(r.height),
            fontSize: cs.fontSize,
            lineHeight: cs.lineHeight,
            padding: cs.padding,
            margin: cs.margin,
            gap: cs.gap,
          };
        };
        // Find by text so both documents resolve the same landmark.
        const byText = (sel, needle) =>
          Array.from(document.querySelectorAll(sel)).find((el) =>
            el.textContent.trim().toLowerCase().startsWith(needle),
          );

        const bannerImg = Array.from(document.querySelectorAll("img")).find(
          (i) => /why-banner/i.test(i.getAttribute("src") || ""),
        );

        return {
          bodyHeight: document.body.scrollHeight,
          scrollWidth: document.documentElement.scrollWidth,
          viewportWidth: innerWidth,
          // Measure by landmark rather than by nth-child so the two documents
          // line up even though their markup differs.
          sections: Array.from(document.querySelectorAll("section")).filter((s) => s.offsetParent).map((s) => {
            const r = s.getBoundingClientRect();
            const h = s.querySelector("h1, h2");
            return {
              name: h ? h.textContent.trim().slice(0, 30) : "(no heading)",
              top: Math.round(r.top + scrollY),
              height: Math.round(r.height),
            };
          }),
          details: {
            h1: rectOf(document.querySelector("h1")),
            heroP: rectOf(document.querySelector("h1 + p")),
            heroImg: rectOf(
              Array.from(document.querySelectorAll("img")).find((i) =>
                /hero/i.test(i.getAttribute("src") || ""),
              ),
            ),
            introImg: rectOf(
              Array.from(document.querySelectorAll("img")).find((i) =>
                /intro|team/i.test(i.getAttribute("src") || ""),
              ),
            ),
            whyH2: rectOf(byText("h2", "why chargewipe")),
            whyP: rectOf(byText("p", "stay ahead")),
            whyBannerImg: rectOf(bannerImg),
            whyBannerWrap: rectOf(bannerImg && bannerImg.parentElement),
            whyCard1H3: rectOf(byText("h3", "multi-channel")),
            whyCard2H3: rectOf(byText("h3", "dual-mode")),
            whyCard3H3: rectOf(byText("h3", "payment channel")),
            whyCard4H3: rectOf(byText("h3", "full-link")),
            whyCard1P: rectOf(byText("p", "deeply integrates")),
            resH2: rectOf(byText("h2", "our resources")),
            resImg: rectOf(
              Array.from(document.querySelectorAll("img")).find((i) =>
                /partners/i.test(i.getAttribute("src") || ""),
              ),
            ),
          },
        };
      });

      results[`${vp.name}-${label}`] = data;

      const file = path.join(OUT, `${vp.name}-${label}.png`);
      await page.screenshot({ path: file, fullPage: true });
      console.log(
        `${vp.name.padEnd(8)} ${label.padEnd(6)} body=${data.bodyHeight} scrollW=${data.scrollWidth} -> ${path.basename(file)}`,
      );

      await page.close();
    }
  }

  console.log("\n=== Section heights (ref vs local) ===");
  for (const vp of VIEWPORTS) {
    const ref = results[`${vp.name}-ref`];
    const loc = results[`${vp.name}-local`];
    console.log(`\n[${vp.name}] ref body=${ref.bodyHeight}  local body=${loc.bodyHeight}`);
    const max = Math.max(ref.sections.length, loc.sections.length);
    for (let i = 0; i < max; i++) {
      const a = ref.sections[i];
      const b = loc.sections[i];
      const name = (a && a.name) || (b && b.name) || "?";
      console.log(
        `  ${name.padEnd(32)} ref=${String(a ? a.height : "-").padStart(5)}  local=${String(b ? b.height : "-").padStart(5)}`,
      );
    }
  }

  console.log("\n=== Element details (ref vs local) ===");
  for (const vp of VIEWPORTS) {
    const ref = results[`${vp.name}-ref`].details;
    const loc = results[`${vp.name}-local`].details;
    console.log(`\n[${vp.name}]`);
    for (const key of Object.keys(ref)) {
      const a = ref[key];
      const b = loc[key];
      if (!a && !b) continue;
      const fmt = (o) =>
        o
          ? `top=${String(o.top).padStart(5)} left=${String(o.left).padStart(5)} w=${String(o.w).padStart(4)} h=${String(o.h).padStart(4)} fs=${o.fontSize}`
          : "        (not found)";
      const dh = a && b ? b.h - a.h : "-";
      const dt = a && b ? b.top - a.top : "-";
      console.log(`  ${key.padEnd(14)} ref ${fmt(a)}`);
      console.log(`  ${" ".repeat(14)} loc ${fmt(b)}   dh=${dh} dt=${dt}`);
    }
  }

  fs.writeFileSync(path.join(OUT, "result.json"), JSON.stringify(results, null, 2));
  await browser.close();
})();
