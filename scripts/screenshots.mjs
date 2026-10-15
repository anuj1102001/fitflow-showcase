// Regenerates the portfolio screenshots in public/screens (run `npm run dev` first).
// node scripts/screenshots.mjs [baseUrl]
import { mkdirSync } from "node:fs";
import puppeteer from "puppeteer-core";

const BASE = process.argv[2] ?? "http://localhost:3200";
const OUT = "public/screens";
mkdirSync(OUT, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const browser = await puppeteer.launch({ executablePath: process.env.CHROME_PATH ?? "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: true, args: ["--hide-scrollbars"] });
const page = await browser.newPage();
page.on("dialog", (d) => d.accept());

const desktop = { width: 1440, height: 900, deviceScaleFactor: 1.5 };
const click = (t) => page.evaluate((x) => [...document.querySelectorAll("button")].find((b) => b.textContent.includes(x) && b.offsetParent)?.click(), t);
const scrollTo = (sel, offset = 80) => page.evaluate((q, o) => { const el = document.querySelector(q); if (el) window.scrollTo(0, el.getBoundingClientRect().top + scrollY - o); }, sel, offset);
// Opens the first sequence step in Today, drafts it and scrolls to the explanation.
const composeStep = async () => {
  const href = await page.evaluate(() => [...document.querySelectorAll("#today a")].find((a) => a.textContent.trim() === "Draft" && a.href.includes("enrollment="))?.getAttribute("href"));
  if (href) await page.goto(BASE + href, { waitUntil: "load" });
  await sleep(900);
  await click("Draft message");
  await sleep(3200);
};
// The theme for each capture is staged in localStorage on the app origin, then applied before first paint.
await page.goto(BASE, { waitUntil: "load" });
async function shot(name, path, { viewport = desktop, wait = 2600, before, dark = false } = {}) {
  await page.evaluate((t) => localStorage.setItem("ff-theme", t), dark ? "dark" : "light");
  await page.setViewport(viewport);
  await page.goto(BASE + path, { waitUntil: "load" });
  await sleep(600);
  await click("Skip");
  if (before) await before();
  await sleep(wait);
  await page.screenshot({ path: `${OUT}/${name}.jpg`, type: "jpeg", quality: 86 });
  console.log("saved", name);
}

await shot("landing", "/", { wait: 3500 });
await shot("landing-dark", "/", { wait: 3500, dark: true });
await shot("overview", "/app", { wait: 3500 });
await shot("overview-dark", "/app", { wait: 3500, dark: true });
await shot("today", "/app", { wait: 1500, before: async () => (await sleep(1500), await scrollTo("#today", 70)) });
await shot("today-dark", "/app", { wait: 1500, dark: true, before: async () => (await sleep(1500), await scrollTo("#today", 70)) });
await shot("sequences", "/app/sequences", { wait: 2500 });
await shot("compose", "/app", { wait: 800, before: async () => (await sleep(1200), await composeStep(), await scrollTo("textarea[aria-label='Message draft']", 140)) });
await shot("engine", "/", { wait: 2500, before: async () => (await sleep(1200), await scrollTo("#engine", 40)) });
await shot("leads", "/app/leads");
await shot("offer-builder", "/app/offers?new=1", {
  wait: 1500,
  before: async () => {
    for (const t of ["Build strength", "Continue", "Busy desk workers", "Continue", "1:1 online coaching", "Continue"]) {
      await click(t);
      await sleep(400);
    }
    await page.type("#price", "14999");
    await click("Continue");
    await sleep(400);
    await click("Generate offer");
    await page.waitForSelector("#o-title", { timeout: 15000 });
  },
});
await shot("analytics", "/app/analytics", { wait: 3500 });
await shot("clients", "/app/clients", { wait: 3000 });
await shot("bookings", "/app/bookings");
await shot("assistant", "/app/assistant", { before: async () => (await click("What should I improve this week?"), await sleep(4000)) });
const phone = { width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true };
await shot("mobile-landing", "/", { viewport: phone, wait: 3000 });
await shot("mobile-overview", "/app", { viewport: phone, wait: 3000 });
await shot("mobile-today", "/app", { viewport: phone, wait: 1500, before: async () => (await sleep(1500), await scrollTo("#today", 64)) });
await shot("mobile-compose", "/app", { viewport: phone, wait: 800, before: async () => (await sleep(1200), await composeStep(), await scrollTo("textarea[aria-label='Message draft']", 120)) });
await browser.close();
