// Interaction test for the running prototype (npm run dev, then: node tests/e2e.mjs [baseUrl]).
// Uses puppeteer-core with a locally installed Chrome; set CHROME_PATH if it lives elsewhere.
import puppeteer from "puppeteer-core";

const BASE = process.argv[2] ?? "http://localhost:3200";
const browser = await puppeteer.launch({ executablePath: process.env.CHROME_PATH ?? "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: true });
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
page.on("dialog", (d) => d.accept());
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let passed = 0;
const failures = [];
async function step(name, fn) {
  try {
    await fn();
    passed++;
    console.log("✓", name);
  } catch (e) {
    failures.push(name);
    console.log("✗", name, "—", e.message);
  }
}
const assert = (c, m) => {
  if (!c) throw new Error(m);
};
// Polls for a condition instead of sleeping a fixed time, so slower machines don't fail on animations.
const waitFor = async (fn, ms = 4000) => {
  for (const end = Date.now() + ms; Date.now() < end; await sleep(100)) if (await fn()) return true;
  return false;
};
const clickText = async (text, sel = "button, a, [role=tab], [role=option]") => {
  const click = () =>
    page.evaluate(
      (t, s) => {
        const el = [...document.querySelectorAll(s)].find((e) => e.textContent.replace(/\s+/g, " ").trim().includes(t) && e.offsetParent !== null);
        if (el) el.click();
        return !!el;
      },
      text,
      sel,
    );
  assert(await waitFor(click), `no clickable "${text}"`);
  await sleep(350);
};
const typeInto = async (sel, text) => {
  await page.waitForSelector(sel, { visible: true, timeout: 5000 });
  await page.click(sel, { clickCount: 3 });
  await page.type(sel, text);
};
const bodyHas = (t) => page.evaluate((x) => document.body.innerText.includes(x), t);
const go = async (p) => {
  await page.goto(BASE + p, { waitUntil: "networkidle2" });
  await sleep(700);
};

await step("welcome tour shows and can be completed", async () => {
  await go("/app");
  assert(await bodyHas("You're signed in as Aarav Mehta"), "tour missing");
  for (let i = 0; i < 3; i++) await clickText("Next");
  await clickText("Start exploring");
  assert(await waitFor(async () => !(await bodyHas("Welcome to the demo"))), "tour still visible");
});

await step("add lead validates and creates a lead", async () => {
  await clickText("New");
  await clickText("Lead", "[role=menuitem]");
  await clickText("Add lead", "button[type=submit]");
  assert(await bodyHas("Enter the lead's name."), "no validation message");
  await typeInto("#lf-name", "Test Person");
  await typeInto("#lf-email", "test.person@example.com");
  await clickText("Add lead", "button[type=submit]");
  await sleep(900);
  assert(page.url().includes("/app/leads?lead="), "drawer not opened: " + page.url());
  assert(await bodyHas("Lead added manually"), "timeline missing");
});

await step("moving a lead to Won creates a client", async () => {
  await clickText("Won", "[role=dialog] button");
  await sleep(500);
  await go("/app/clients");
  assert(await bodyHas("Test Person"), "client not created");
});

await step("offer builder: guided steps → generate → publish", async () => {
  await go("/app/offers?new=1");
  await clickText("Build strength");
  await clickText("Continue");
  await clickText("Busy desk workers");
  await clickText("Continue");
  await clickText("1:1 online coaching");
  await clickText("Continue");
  await typeInto("#price", "100");
  await page.click("body");
  await sleep(200);
  assert(await bodyHas("Minimum ₹499."), "price validation missing");
  await typeInto("#price", "14999");
  await clickText("Continue");
  await clickText("Generate offer");
  await page.waitForSelector("#o-title", { timeout: 15000 });
  const title = await page.$eval("#o-title", (e) => e.value);
  assert(title.length > 5, "no generated title");
  assert(await bodyHas("Claims check passed"), "claims check missing");
  await clickText("Regenerate");
  await page.waitForFunction((t) => document.querySelector("#o-title")?.value && document.querySelector("#o-title").value !== t, { timeout: 15000 }, title);
  const title2 = await page.$eval("#o-title", (e) => e.value);
  assert(title2 !== title, "regenerate gave same title");
  await clickText("Publish to storefront");
  await sleep(600);
  assert(await bodyHas(title2), "published offer not listed");
});

await step("storefront enquiry becomes a lead with a notification", async () => {
  await go("/s/aarav");
  await page.evaluate(() => document.querySelector("#sf-enquire")?.scrollIntoView());
  await typeInto("input[aria-label=Name]", "Enquiry Tester");
  await typeInto("input[aria-label=Email]", "enquiry@example.com");
  await page.click("input[type=checkbox]");
  await clickText("Send enquiry", "button[type=submit]");
  await sleep(1500);
  assert(await bodyHas("Thanks, Enquiry!"), "no success state");
  await go("/app/leads?view=list");
  assert(await bodyHas("Enquiry Tester"), "lead not in CRM");
  await page.click("[aria-label^=Notifications]");
  await sleep(300);
  assert(await bodyHas("New lead: Enquiry Tester"), "no notification");
});

await step("follow-up draft generates, saves and logs", async () => {
  await go("/app/follow-ups");
  await clickText("Draft message");
  await sleep(2500);
  const text = await page.$eval("textarea[aria-label='Message draft']", (e) => e.value);
  assert(text.length > 60, "draft too short");
  await clickText("I sent it: log it");
  await sleep(400);
  assert(await bodyHas("Logged"), "draft not logged");
});

await step("booking can be created from the calendar", async () => {
  await go("/app/bookings");
  await clickText("New booking");
  await clickText("Add booking", "button[type=submit]");
  await sleep(500);
  assert(await bodyHas("Booking added"), "no toast");
});

await step("assistant answers a suggested prompt from the data", async () => {
  await go("/app/assistant");
  await clickText("Which lead source is performing best?");
  await sleep(3500);
  assert(await bodyHas("Over the last 90 days"), "no answer");
});

await step("analytics filters update the URL and charts", async () => {
  await go("/app/analytics");
  await clickText("12 months", "[role=tab]");
  await sleep(1200);
  assert(page.url().includes("range=12m"), "range not in URL");
  await page.select("select[aria-label='Lead source']", "Referral");
  await sleep(1200);
  assert(page.url().includes("source=Referral"), "source not in URL");
});

await step("command palette finds a lead", async () => {
  await go("/app");
  await page.keyboard.down("Control");
  await page.keyboard.press("k");
  await page.keyboard.up("Control");
  await sleep(300);
  await page.keyboard.type("Enquiry Tester");
  await sleep(300);
  await page.keyboard.press("Enter");
  await sleep(900);
  assert(page.url().includes("/app/leads?lead="), "palette did not navigate");
});

await step("storefront builder theme switch is reflected on the public page", async () => {
  await go("/app/storefront");
  await clickText("Bloom");
  await sleep(400);
  await go("/s/aarav");
  const bg = await page.$eval(".sf-root", (e) => getComputedStyle(e).backgroundColor);
  assert(bg === "rgb(246, 241, 234)", "theme not applied: " + bg);
});

await step("reset restores sample data", async () => {
  await go("/app");
  await clickText("Reset");
  await sleep(800);
  await go("/app/leads?view=list");
  assert(!(await bodyHas("Enquiry Tester")), "reset did not clear edits");
});

console.log(`\n${passed} passed, ${failures.length} failed${errors.length ? `\nPage errors: ${[...new Set(errors)].join(" | ")}` : ""}`);
await browser.close();
process.exit(failures.length || errors.length ? 1 : 0);
