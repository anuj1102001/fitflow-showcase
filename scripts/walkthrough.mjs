// Records the silent, captioned product walkthrough to public/walkthrough.mp4.
// Needs a running build (npm run build && npx next start -p 3200) and ffmpeg (set FFMPEG_PATH).
// node scripts/walkthrough.mjs [baseUrl]
import { execFileSync } from "node:child_process";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import puppeteer from "puppeteer-core";

const BASE = process.argv[2] ?? "http://localhost:3200";
const FFMPEG = process.env.FFMPEG_PATH ?? "ffmpeg";
const FRAMES = ".walkthrough-frames";
const OUT = "public/walkthrough.mp4";
const W = 1440;
const H = 900;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await puppeteer.launch({
  executablePath: process.env.CHROME_PATH ?? "C:/Program Files/Google/Chrome/Application/chrome.exe",
  headless: true,
  args: ["--hide-scrollbars", `--window-size=${W},${H}`],
});
const page = await browser.newPage();
await page.setViewport({ width: W, height: H, deviceScaleFactor: 1 });
page.on("dialog", (d) => d.accept());

// Caption pill and a visible cursor, injected into every document.
await page.evaluateOnNewDocument(() => {
  const css = `
    #wt-cap{position:fixed;left:50%;bottom:28px;transform:translateX(-50%);z-index:2147483646;pointer-events:none;
      font:600 17px/1.3 Geist,system-ui,sans-serif;letter-spacing:-.01em;color:#f4f5f0;background:rgba(14,15,17,.88);
      border:1px solid rgba(255,255,255,.12);padding:11px 18px;border-radius:12px;box-shadow:0 10px 30px rgba(0,0,0,.25);
      transition:opacity .25s ease;white-space:nowrap}
    #wt-cap:empty{opacity:0}
    #wt-cur{position:fixed;left:0;top:0;width:22px;height:22px;z-index:2147483647;pointer-events:none;
      transform:translate(-100px,-100px);transition:none}
    #wt-cur svg{filter:drop-shadow(0 2px 3px rgba(0,0,0,.35))}
    #wt-cur.down svg{transform:scale(.85)}`;
  const mount = () => {
    if (document.getElementById("wt-cap")) return;
    const st = document.createElement("style");
    st.textContent = css;
    document.head.appendChild(st);
    const cap = document.createElement("div");
    cap.id = "wt-cap";
    cap.textContent = sessionStorage.getItem("wt-cap") ?? "";
    const cur = document.createElement("div");
    cur.id = "wt-cur";
    cur.innerHTML = '<svg width="22" height="22" viewBox="0 0 24 24"><path d="M4 2l16 10-7 1.5L9.5 21z" fill="#fff" stroke="#111" stroke-width="1.6" stroke-linejoin="round"/></svg>';
    document.body.append(cap, cur);
    if (window.__wtXY) cur.style.transform = `translate(${window.__wtXY[0]}px,${window.__wtXY[1]}px)`;
  };
  document.addEventListener("DOMContentLoaded", mount);
  new MutationObserver(() => document.body && !document.getElementById("wt-cap") && mount()).observe(document, { childList: true, subtree: true });
  addEventListener("mousemove", (e) => {
    window.__wtXY = [e.clientX, e.clientY];
    const c = document.getElementById("wt-cur");
    if (c) c.style.transform = `translate(${e.clientX}px,${e.clientY}px)`;
  }, true);
  addEventListener("mousedown", () => document.getElementById("wt-cur")?.classList.add("down"), true);
  addEventListener("mouseup", () => document.getElementById("wt-cur")?.classList.remove("down"), true);
});

let mouse = [W / 2, H / 2];
const caption = (t) =>
  page.evaluate((t) => {
    sessionStorage.setItem("wt-cap", t);
    const c = document.getElementById("wt-cap");
    if (c) c.textContent = t;
  }, t);
async function moveTo(x, y, steps = 28) {
  const [x0, y0] = mouse;
  for (let i = 1; i <= steps; i++) {
    const k = i / steps;
    const e = k < 0.5 ? 2 * k * k : 1 - (-2 * k + 2) ** 2 / 2;
    await page.mouse.move(x0 + (x - x0) * e, y0 + (y - y0) * e);
    await sleep(12);
  }
  mouse = [x, y];
}
/** Moves the cursor to an element (by CSS selector or visible text) and clicks it. */
async function clickOn(target, sel = "button, a, [role=tab], [role=radio], [role=button]") {
  let box = null;
  for (let i = 0; i < 15 && !box; i++) {
    if (i) await sleep(200); // the target may still be animating in
    box = await find(target, sel);
  }
  if (!box) throw new Error(`walkthrough: nothing to click for "${target}"`);
  await moveTo(box.x, box.y);
  await sleep(180);
  await page.mouse.click(box.x, box.y);
  await sleep(250);
}
function find(target, sel) {
  return page.evaluate(
    (t, s) => {
      let el;
      if (t.startsWith("css:")) el = [...document.querySelectorAll(t.slice(4))].find((e) => e.offsetParent !== null);
      else el = [...document.querySelectorAll(s)].find((e) => e.textContent.replace(/\s+/g, " ").trim().includes(t) && e.offsetParent !== null);
      if (!el || getComputedStyle(el).opacity === "0" || el.closest("[style*='opacity: 0']")) return null;
      el.scrollIntoView({ block: "nearest" });
      const r = el.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    },
    target,
    sel,
  );
}
async function scrollBy(dy, ms) {
  await page.evaluate(
    (dy, ms) =>
      new Promise((done) => {
        const y0 = scrollY;
        const t0 = performance.now();
        const tick = (t) => {
          const k = Math.min(1, (t - t0) / ms);
          const e = k < 0.5 ? 4 * k * k * k : 1 - (-2 * k + 2) ** 3 / 2;
          scrollTo(0, y0 + dy * e);
          if (k < 1) requestAnimationFrame(tick);
          else done();
        };
        requestAnimationFrame(tick);
      }),
    dy,
    ms,
  );
}
const go = async (path) => {
  await page.goto(BASE + path, { waitUntil: "load" });
  await sleep(500);
};

// Prepare: light theme, welcome tour already dismissed, so the recording starts clean.
await page.goto(BASE + "/app", { waitUntil: "load" });
await page.evaluate(() => localStorage.setItem("ff-theme", "light"));
await page.reload({ waitUntil: "load" });
await sleep(1200);
await page.evaluate(() => [...document.querySelectorAll("button")].find((b) => b.textContent.includes("Skip") && b.offsetParent)?.click());
await sleep(600);

await go("/");
await page.mouse.move(...mouse);
// Chrome only sends a frame when the page changes, so keep each frame's timestamp and
// let ffmpeg hold it for exactly that long (real-time playback).
rmSync(FRAMES, { recursive: true, force: true });
mkdirSync(FRAMES);
const frames = [];
const cdp = await page.createCDPSession();
cdp.on("Page.screencastFrame", ({ data, metadata, sessionId }) => {
  const file = `${FRAMES}/${String(frames.length).padStart(5, "0")}.jpg`;
  writeFileSync(file, Buffer.from(data, "base64"));
  frames.push({ file, t: metadata.timestamp });
  cdp.send("Page.screencastFrameAck", { sessionId }).catch(() => {});
});
await cdp.send("Page.startScreencast", { format: "jpeg", quality: 90, maxWidth: W, maxHeight: H });

// 1. Landing
await caption("FITFLOW AI: a business OS for fitness coaches (interactive prototype)");
await sleep(3600);
await caption("Light and dark themes, switched instantly");
await clickOn("css:[aria-label='Dark theme']");
await sleep(1500);
await clickOn("css:[aria-label='Light theme']");
await sleep(1100);
await caption("Scroll-driven “How it works” (GSAP ScrollTrigger)");
const wf = await page.evaluate(() => document.getElementById("workflow").getBoundingClientRect().top + 70);
await scrollBy(wf, 1800);
await sleep(400);
await scrollBy(H * 2.5, 6500);
await sleep(700);

// 2. App: overview
await caption("The live demo: KPIs, trends and AI insights from sample data");
await go("/app");
await sleep(600);
await moveTo(760, 640);
await sleep(2600);

// 3. Leads
await caption("Lead pipeline: every enquiry has a source, stage and follow-up date");
await clickOn("Leads", "nav a, aside a");
await sleep(1800);
await clickOn("css:[draggable][aria-label$='Open details']");
await sleep(2600);
await page.keyboard.press("Escape");
await sleep(500);

// 4. Follow-ups
await caption("AI drafts the follow-up. The coach edits it and sends it themselves.");
await clickOn("Follow-ups", "nav a, aside a");
await sleep(1200);
await clickOn("Draft message");
await sleep(3400);

// 5. Offer builder
await caption("AI Offer Builder: five guided steps to an editable, claims-checked offer");
await go("/app/offers?new=1");
for (const t of ["Build strength", "Continue", "Busy desk workers", "Continue", "1:1 online coaching", "Continue"]) {
  await clickOn(t);
  await sleep(420);
}
await clickOn("css:#price");
await page.click("#price", { clickCount: 3 });
await page.keyboard.type("14999", { delay: 70 });
await sleep(400);
await clickOn("Continue");
await clickOn("Generate offer");
await page.waitForSelector("#o-title", { timeout: 15000 });
await sleep(3200);

// 6. Storefront
await caption("Storefront builder with live desktop and phone previews");
await go("/app/storefront");
await sleep(1500);
await clickOn("Bloom");
await sleep(2200);
await clickOn("Forge");
await sleep(1600);
await caption("The coach's public page: enquiries land straight in the pipeline");
await go("/s/aarav");
await sleep(1500);
await scrollBy(1300, 3200);
await sleep(900);

// 7. Assistant
await caption("Assistant answers questions from the same data as the charts");
await go("/app/assistant");
await sleep(800);
await clickOn("Which lead source is performing best?");
await sleep(4200);

// 8. Dark mode in the app, then the case study
await caption("Every screen works in both themes");
await clickOn("css:[aria-label='Switch to dark mode']");
await sleep(2000);
await caption("Case study, Figma file and code: links in the description");
await go("/case-study");
await sleep(1200);
await scrollBy(1100, 3000);
await sleep(1500);

await cdp.send("Page.stopScreencast");
await browser.close();

const name = (f) => f.file.slice(FRAMES.length + 1);
const list = frames.map((f, i) => `file '${name(f)}'\nduration ${((frames[i + 1]?.t ?? f.t + 1.5) - f.t).toFixed(3)}`);
writeFileSync(`${FRAMES}/list.txt`, `${list.join("\n")}\nfile '${name(frames.at(-1))}'\n`);
// H.264 MP4 plays everywhere (Safari included) and streams with faststart.
execFileSync(FFMPEG, ["-y", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", `${FRAMES}/list.txt`, "-vf", "fps=30,format=yuv420p", "-c:v", "libx264", "-crf", "26", "-preset", "slow", "-movflags", "+faststart", "-an", OUT]);
rmSync(FRAMES, { recursive: true, force: true });
console.log("saved", OUT);
