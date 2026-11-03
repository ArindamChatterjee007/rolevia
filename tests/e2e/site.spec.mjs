import { test, expect } from "@playwright/test";
import { mkdirSync } from "node:fs";

const SHOTS = "test-results/screens";
mkdirSync(SHOTS, { recursive: true });
// Every screenshot doubles as a render check: a raw null/undefined child would show up as literal text.
const strayText = (page) => page.evaluate(() => {
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const found = [];
  while (walker.nextNode()) { const text = walker.currentNode.textContent.trim(); if (text === "null" || text === "undefined" || text === "nullnull" || text === "[object Object]") found.push(`${text} in ${walker.currentNode.parentElement?.className || walker.currentNode.parentElement?.tagName}`); }
  return found;
});
const shot = async (page, name, fullPage = true) => {
  // Chromium shots are the published evidence set; other engines go into their own folder.
  const project = test.info().project.name;
  const dir = project === "chromium" ? SHOTS : `${SHOTS}/${project}`;
  mkdirSync(dir, { recursive: true });
  await page.screenshot({ path: `${dir}/${name}.png`, fullPage });
  expect(await strayText(page), `stray text on ${name}`).toEqual([]);
};

async function open(page, route = "/") {
  await page.goto(`/?fast#${route}`);
  await page.waitForSelector("#splash", { state: "detached" });
}
const latestCode = (page) => page.evaluate(() => {
  const state = JSON.parse(localStorage.getItem("rolevia.preview.v8"));
  return state.outbox.find(message => message.channel === "email" && /Code \d{6}/.test(message.body)).body.match(/Code (\d{6})/)[1];
});
async function enterOtpBoxes(page) {
  const code = await latestCode(page);
  const boxes = page.locator(".otp-box");
  for (let index = 0; index < 6; index += 1) await boxes.nth(index).fill(code[index]);
}
async function studentLogin(page, identifier = "RV-26-0001", password = "Learn#2026") {
  await open(page, "/login");
  await page.fill("input[name=identifier]", identifier);
  await page.fill("input[name=password]", password);
  await page.click("button[type=submit]");
  await expect(page.locator(".otp-box").first()).toBeVisible();
  await enterOtpBoxes(page);
}
const ADMINS = { lead: ["RV-ADM-001", "Lead-Arindam-2026"], content: ["RV-ADM-002", "Content-Ayush-2026"], success: ["RV-ADM-003", "Success-Souvik-2026"] };
async function adminLogin(page, role = "lead") {
  const [adminId, password] = ADMINS[role];
  await open(page, "/admin/login");
  await page.fill("input[name=identifier]", adminId);
  await page.fill("input[name=password]", password);
  await page.click("button[type=submit]");
  await expect(page.locator("input[name=code]")).toBeVisible();
  await page.fill("input[name=code]", await latestCode(page));
  await page.click("button[type=submit]");
  await expect(page).toHaveURL(/#\/admin\/account\?first=1/);
  await page.fill("input[name=current]", password);
  await page.fill("input[name=password]", `${password}-new`);
  await page.fill("input[name=confirm]", `${password}-new`);
  await page.getByRole("button", { name: "Change password" }).click();
  await expect(page.locator("h1")).toHaveText("Overview");
}

test("public site renders the animated hero, company marquee, eight skills and stays mobile-safe", async ({ page }) => {
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  await open(page, "/");
  await expect(page.locator("h1.display")).toContainText("Business knowledge");
  await expect(page.locator(".orbit-chip")).toHaveCount(8);
  // Orbit geometry: every chip stays inside the orbit box and clear of the core and of every other chip.
  const orbitReport = () => page.evaluate(() => {
    const rect = (element) => element.getBoundingClientRect();
    const box = rect(document.querySelector(".orbit"));
    const core = rect(document.querySelector(".orbit-core"));
    const chips = [...document.querySelectorAll(".orbit-chip-inner")].map(rect);
    const overlaps = (a, b) => a.left < b.right - 1 && b.left < a.right - 1 && a.top < b.bottom - 1 && b.top < a.bottom - 1;
    const outside = chips.filter(chip => chip.left < box.left - 1 || chip.right > box.right + 1 || chip.top < box.top - 1 || chip.bottom > box.bottom + 1).length;
    const onCore = chips.filter(chip => overlaps(chip, core)).length;
    let collisions = 0;
    for (let i = 0; i < chips.length; i += 1) for (let j = i + 1; j < chips.length; j += 1) if (overlaps(chips[i], chips[j])) collisions += 1;
    const clipped = chips.filter((chip, index) => document.querySelectorAll(".orbit-chip-inner")[index].scrollWidth > chip.width + 1).length;
    // A label may wrap between words but never inside a word: line boxes must not exceed the word count.
    const brokenWords = [...document.querySelectorAll(".orbit-chip-inner strong")].filter(label => label.getClientRects().length > label.textContent.trim().split(/\s+/).length).map(label => label.textContent);
    return { width: Math.round(box.width), outside, onCore, collisions, clipped, brokenWords };
  });
  const desktopOrbit = await orbitReport();
  expect(desktopOrbit, JSON.stringify(desktopOrbit)).toMatchObject({ outside: 0, onCore: 0, collisions: 0, clipped: 0, brokenWords: [] });
  expect(desktopOrbit.width).toBeGreaterThanOrEqual(480);
  await shot(page, "01a-hero-desktop", false);
  expect(await page.locator(".marquee .wordmark").count()).toBeGreaterThanOrEqual(12);
  await expect(page.locator(".marquee-wrap")).toContainText("no partnership with, endorsement from or placement arrangement with");
  await expect(page.locator(".skills-grid .skill-card")).toHaveCount(8);
  await expect(page.locator(".quotes-ticker .quote").first()).toBeVisible();
  await expect(page.locator(".teaser-row").first()).toContainText("#1");
  await shot(page, "01-home-desktop");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload();
  await page.waitForSelector("#splash", { state: "detached" });
  const widths = await page.evaluate(() => ({ viewport: window.innerWidth, content: document.documentElement.scrollWidth }));
  expect(widths.content).toBe(widths.viewport);
  const mobileOrbit = await orbitReport();
  expect(mobileOrbit, JSON.stringify(mobileOrbit)).toMatchObject({ outside: 0, onCore: 0, collisions: 0, clipped: 0, brokenWords: [] });
  expect(mobileOrbit.width).toBeGreaterThanOrEqual(300);
  await shot(page, "02-home-mobile", false);
  await page.locator(".orbit").scrollIntoViewIfNeeded();
  await shot(page, "02a-orbit-mobile", false);
  await open(page, "/pricing");
  await page.getByRole("button", { name: "International · USD" }).click();
  await expect(page.locator(".pricing-table")).toContainText("USD 49");
  await open(page, "/skills/business-ai");
  await expect(page.locator("h1")).toHaveText("AI for MBA & Business");
  await expect(page.locator(".price-big")).toHaveText("INR 2,999");
  expect(errors).toEqual([]);
});

test("preview shortcuts: one-click demo sign-in for a student and an admin; misrouted IDs get a hint instead of an error", async ({ page }) => {
  await open(page, "/login");
  await page.fill("input[name=identifier]", "RV-ADM-001");
  await page.fill("input[name=password]", "whatever");
  await page.click("button[type=submit]");
  await expect(page.locator(".alert.info")).toContainText("That is an Admin ID");
  await expect(page.locator(".alert.info a")).toHaveAttribute("href", "#/admin/login");
  await expect(page.locator(".preview-shortcut")).toContainText("Preview shortcut");
  await shot(page, "00-student-signin", false);
  await page.locator('[data-shortcut="RV-26-0002"]').click();
  await expect(page.locator("h1")).toHaveText("Dashboard", { timeout: 15_000 });
  await expect(page.locator(".dash-hero h2")).toContainText("Rohit");
  await page.getByRole("button", { name: "Sign out" }).click();
  await expect(page).toHaveURL(/#\/$/);

  await open(page, "/admin/login");
  // A wrong admin password must produce a visible error (regression: the admin page once rendered none).
  await page.fill("input[name=identifier]", "RV-ADM-001");
  await page.fill("input[name=password]", "wrong-password");
  await page.click("button[type=submit]");
  await expect(page.locator(".alert.error")).toContainText("could not match");
  await page.fill("input[name=identifier]", "RV-26-0001");
  await page.fill("input[name=password]", "whatever");
  await page.click("button[type=submit]");
  await expect(page.locator(".alert.info")).toContainText("That is a Student ID");
  await shot(page, "00a-admin-signin", false);
  await page.locator('[data-shortcut="RV-ADM-002"]').click();
  await expect(page.locator("h1")).toHaveText("Overview", { timeout: 15_000 });
  await expect(page.locator(".portal-top")).toContainText("Ayush");
  // The shortcut kept the demo password, so the manual flow still works afterwards without a forced change.
  await page.getByRole("button", { name: "Sign out" }).click();
  await expect(page).toHaveURL(/#\/$/);
  await open(page, "/admin/login");
  await page.fill("input[name=identifier]", "RV-ADM-002");
  await page.fill("input[name=password]", "Content-Ayush-2026");
  await page.click("button[type=submit]");
  await expect(page.locator("input[name=code]")).toBeVisible();
  await page.fill("input[name=code]", await latestCode(page));
  await page.click("button[type=submit]");
  await expect(page.locator("h1")).toHaveText("Overview", { timeout: 15_000 });
});

test("course material: tabbed module page, lesson reader with checkpoints, view-only slides with a watermark, interview prep", async ({ page }) => {
  await studentLogin(page);
  await open(page, "/portal/learn/spreadsheets");
  await expect(page.locator(".learn-tabs button.active")).toContainText("Overview");
  await expect(page.locator(".week-grid .week")).toHaveCount(2);
  await expect(page.locator(".learn-art")).toBeVisible();
  await shot(page, "17-learn-overview");
  await page.locator('.learn-tabs [data-tab="lessons"]').click();
  const lessonLinks = page.locator(".lesson-list a.lesson");
  expect(await lessonLinks.count()).toBeGreaterThanOrEqual(4);
  await lessonLinks.first().click();
  await expect(page.locator(".reader-head h2")).toBeVisible();
  expect(await page.locator(".reader-section").count()).toBeGreaterThanOrEqual(3);
  await page.locator(".checkpoint summary").first().click();
  await expect(page.locator(".checkpoint[open] p").first()).toBeVisible();
  expect(await page.locator("a[download]").count()).toBe(0);
  await shot(page, "18-lesson-reader");
  await page.getByRole("button", { name: /Mark complete/ }).click();
  await expect(page.locator(".toast", { hasText: "+5 points" })).toBeVisible();
  await open(page, "/portal/learn/spreadsheets?tab=slides");
  await expect(page.locator(".learn-panel")).toContainText("No slides are published");
  await open(page, "/portal/learn/business-ai?tab=slides");
  await page.locator(".deck-card").first().click();
  await expect(page.locator(".deck-viewer")).toBeVisible();
  await expect(page.locator(".deck-watermark")).toContainText("Ananya Iyer");
  expect(await page.locator("a[download]").count()).toBe(0);
  const total = await page.locator(".deck-dot").count();
  expect(total).toBeGreaterThanOrEqual(8);
  await page.locator(".deck-next").click();
  await expect(page.locator(".slide-count")).toHaveText(`2 / ${total}`);
  await page.locator(".deck-viewer").focus();
  for (let step = 0; step < total && !(await page.locator(".slide.kind-question").count()); step += 1) await page.keyboard.press("ArrowRight");
  await expect(page.locator(".slide.kind-question")).toBeVisible();
  await page.locator(".slide-option").first().click();
  await expect(page.locator(".slide-explanation")).toBeVisible();
  await shot(page, "19-slides-viewer");
  await open(page, "/portal/interview");
  await page.locator(".qa summary").first().click();
  await expect(page.locator(".qa[open] .reader-bullets li").first()).toBeVisible();
  expect(await page.locator(".star").count()).toBeGreaterThanOrEqual(2);
});

test("content manager builds a slide deck, previews it as a learner would see it, and publishes it", async ({ page }) => {
  await adminLogin(page, "content");
  await open(page, "/admin/decks");
  await expect(page.locator(".deck-row")).toHaveCount(8);
  await page.getByRole("link", { name: "New deck" }).click();
  await page.fill("input[name=title]", "Budgeting clinic: reading a cash forecast");
  await page.selectOption("select[name=moduleId]", "budgeting");
  await page.locator(".slide-form input.input").first().fill("Reading a cash forecast");
  await page.locator(".add-slide").getByRole("button", { name: "Points" }).click();
  await expect(page.locator(".slide-item")).toHaveCount(2);
  await page.locator(".slide-form input.input").first().fill("Three habits");
  await page.locator(".slide-form textarea").first().fill("Opening balance first\nInflows before outflows\nFlag the lowest week");
  await expect(page.locator(".deck-preview .slide-bullets li")).toHaveCount(3);
  await page.getByRole("button", { name: "Create draft" }).click();
  await expect(page).toHaveURL(/#\/admin\/decks\/deck-/);
  await expect(page.locator(".slide-item")).toHaveCount(2);
  await page.getByRole("button", { name: "Present preview" }).click();
  await expect(page.locator(".modal .deck-viewer")).toBeVisible();
  await page.locator(".modal").getByRole("button", { name: "Close", exact: true }).click();
  await page.getByRole("button", { name: "Publish for learners" }).click();
  await expect(page.locator(".deck-actions")).toContainText("Published", { timeout: 15_000 });
  await shot(page, "20-admin-deck-editor");
});

test("registration pays first, a human verifies, credentials arrive by message, OTP sign-in forces a password change", async ({ page }) => {
  await open(page, "/register");
  await page.click("button[type=submit]");
  await expect(page.locator(".field-error").first()).toBeVisible();
  await page.fill("input[name=name]", "Test Learner");
  await page.fill("input[name=email]", "test.learner@example.com");
  await page.fill("input[name=phone]", "+919800012345");
  await page.fill("input[name=city]", "Mumbai");
  await page.selectOption("select[name=education]", "mba");
  await page.fill("input[name=graduationYear]", "2025");
  await page.selectOption("select[name=currentStatus]", "fresher");
  await page.selectOption("select[name=preferredSlot]", "weekend-morning");
  await page.fill("textarea[name=goal]", "Move into an operations analyst role within six months.");
  await page.click("button[type=submit]");
  await expect(page.locator("input[name=contactCode]")).toBeVisible();
  await shot(page, "03a-register-contact-code");
  await page.fill("input[name=contactCode]", await latestCode(page));
  await page.getByRole("button", { name: "Confirm and continue" }).click();
  await expect(page.locator("h1")).toHaveText("Choose your skills.");
  await page.click(".choice[data-id=spreadsheets]");
  await page.click(".choice[data-id=budgeting]");
  await expect(page.locator(".plan-total")).toContainText("INR 4,998");
  await page.getByRole("button", { name: "Review and pay" }).click();
  await expect(page.locator(".alert.error")).toContainText("accept the proposed terms");
  await page.check("input[name=acceptedTerms]");
  await page.getByRole("button", { name: "Review and pay" }).click();
  await expect(page.locator("h1")).toHaveText("Review and pay.");
  await expect(page.locator(".order-summary")).toContainText("INR 4,998");
  await shot(page, "03-register-payment");
  await page.getByRole("button", { name: "Pay (preview)" }).click();
  await expect(page.locator(".status-badge")).toContainText("Awaiting human verification");
  await shot(page, "04-register-verification");

  await adminLogin(page, "success");
  await open(page, "/admin/tracker");
  await expect(page.locator(".task", { hasText: "Verify registration: Test Learner" })).toBeVisible();
  await expect(page.locator(".stage.pending_verification")).toHaveCount(1);
  await shot(page, "05a-admin-tracker");
  await open(page, "/admin/students");
  await expect(page.locator(".queue-row")).toHaveCount(1);
  await page.getByRole("button", { name: "Verify and issue ID" }).click();
  const modal = page.locator(".modal");
  await expect(modal).toContainText("Credentials issued");
  const text = await modal.innerText();
  const studentId = text.match(/Student ID (RV-26-\d{4})/)[1];
  const temporaryPassword = text.match(/temporary password (\S+)\./)[1];
  await page.getByRole("button", { name: "Done" }).click();
  await shot(page, "05-admin-students");
  await open(page, "/admin/tracker?view=done");
  await expect(page.locator(".task.done", { hasText: "Verify registration: Test Learner" })).toBeVisible();
  await page.getByRole("button", { name: "Sign out" }).click();
  await expect(page).toHaveURL(/#\/$/);

  await studentLogin(page, studentId, temporaryPassword);
  await expect(page).toHaveURL(/#\/portal\/profile\?first=1/);
  await expect(page.locator(".alert.info")).toContainText("First sign-in");
  await page.fill("input[name=current]", temporaryPassword);
  await page.fill("input[name=password]", "Brand-new-2026");
  await page.fill("input[name=confirm]", "Brand-new-2026");
  await page.getByRole("button", { name: "Change password" }).click();
  await expect(page.locator("h1")).toHaveText("Dashboard");
  await expect(page.locator(".dash-hero h2")).toContainText("Good to see you, Test");
  await expect(page.locator(".module-row")).toHaveCount(2);
});

test("a student completes an interactive lab, a daily quiz, sees the leaderboard badge and is signed out when another device signs in", async ({ page }) => {
  await studentLogin(page);
  await expect(page.locator(".dash-hero h2")).toContainText("Good to see you, Ananya");
  await shot(page, "06-portal-dashboard");

  // Rolevia Sheets lab: type real formulas through the formula bar; checks run live and the best score is saved.
  await open(page, "/portal/labs/spreadsheets");
  await expect(page.locator(".sheet-grid")).toBeVisible();
  await expect(page.locator(".sheet-task")).toHaveCount(6);
  await expect(page.locator(".sheet-score strong")).toHaveText("0 / 6");
  const enter = async (ref, formula) => { await page.locator(`.sheet-cell[data-ref="${ref}"]`).click(); await page.fill(".sheet-formula", formula); await page.keyboard.press("Enter"); };
  await enter("F2", "=TRIM(UPPER(C2))");
  await expect(page.locator('.sheet-cell[data-ref="F2"]')).toHaveText("NORTH");
  await expect(page.locator('.sheet-cell[data-ref="F2"]')).toHaveClass(/formula/);
  await enter("K1", "=SUM(E2:E9)");
  await expect(page.locator(".sheet-task").nth(2)).toContainText("expected 11100");
  await enter("K1", "=1/0");
  await expect(page.locator('.sheet-cell[data-ref="K1"]')).toHaveText("#DIV/0!");
  for (let row = 3; row <= 9; row += 1) await enter(`F${row}`, `=TRIM(UPPER(C${row}))`);
  for (let row = 2; row <= 9; row += 1) await enter(`G${row}`, `=VALUE(E${row})`);
  for (let row = 2; row <= 9; row += 1) await enter(`H${row}`, `=IF(G${row}>=1500,"Review","Routine")`);
  await enter("K1", "=SUM(G2:G9)");
  await enter("K2", '=SUMIFS(G2:G9,F2:F9,"North")');
  await enter("K3", '=COUNTIFS(G2:G9,">=1500")');
  await expect(page.locator('.sheet-cell[data-ref="K1"]')).toHaveText("11100");
  await expect(page.locator('.sheet-cell[data-ref="K2"]')).toHaveText("6600");
  await expect(page.locator(".sheet-score strong")).toHaveText("6 / 6");
  await expect(page.locator(".lab-status")).toContainText("best 100/100 · 50 points from this lab");
  await expect(page.locator(".sheet-google")).toContainText("Prefer real Google Sheets");
  await shot(page, "07-lab-spreadsheets");

  // AI workbench: brief completeness and verification are scored; the assistant itself is the learner's own.
  await open(page, "/portal/labs/business-ai");
  await page.getByRole("button", { name: "Insert the fictional sample data" }).click();
  await page.fill('[data-field="role"]', "You are an operations analyst for a small stationery retailer.");
  await page.fill('[data-field="goal"]', "Summarise sales by region so the owner can decide where to add stock.");
  await page.fill('[data-field="constraints"]', "Use only the data given; say unknown when a figure is missing; do not convert currency.");
  await page.fill('[data-field="format"]', "A table with Region, Orders and Sales (INR), then a paragraph of three sentences.");
  await page.fill('[data-field="acceptance"]', "Totals must match my SUM; every claim must cite a row; no figure may be invented.");
  await expect(page.locator(".ai-total")).toContainText("brief 40/40");
  await page.locator(".chip", { hasText: "My own API key" }).click();
  await expect(page.locator(".ai-lab")).toContainText("stored in this tab's session only");
  await page.locator(".chip", { hasText: "Continue with ChatGPT" }).click();
  await expect(page.locator(".ai-lab")).toContainText("limited trial");
  await page.locator(".chip", { hasText: "Paste from my assistant" }).click();
  await page.fill('textarea[aria-label="Assistant reply"]', "North: 4 orders, INR 6,600.\nSouth: 4 orders, INR 4,900.\nRecommendation: add stock in the North first.");
  await expect(page.locator(".verify-lines li")).toHaveCount(3);
  await page.locator(".verify-lines li").nth(0).getByRole("button", { name: "Supported", exact: true }).click();
  await page.locator(".verify-lines li").nth(1).getByRole("button", { name: "Unsupported", exact: true }).click();
  await page.locator(".verify-lines li").nth(2).getByRole("button", { name: "Needs evidence", exact: true }).click();
  await page.fill('textarea[placeholder^="How you checked"]', "Recalculated both regional totals with SUM against the eight rows; South is 4,500 not 4,900, so line 2 is unsupported.");
  await expect(page.locator(".ai-total strong")).toHaveText("100 / 100");
  await expect(page.locator(".lab-status")).toContainText("best 100/100 · 50 points from this lab");
  await shot(page, "07a-lab-ai-workbench");

  await open(page, "/portal/quiz?module=canva");
  await expect(page.locator(".question")).toHaveCount(5);
  for (const question of await page.locator(".question").all()) await question.locator("input[type=radio]").first().check();
  await page.getByRole("button", { name: "Submit answers" }).click();
  await expect(page.locator(".quiz-result h3")).toContainText("/5 correct");
  await shot(page, "08-quiz-result");

  await open(page, "/portal/leaderboard");
  expect(await page.locator(".board-row").count()).toBeGreaterThanOrEqual(6);
  await expect(page.locator(".board-row.me")).toContainText("Ananya Iyer");
  const share = page.getByRole("link", { name: "Share on LinkedIn" });
  await expect(share).toHaveAttribute("href", /linkedin\.com\/sharing\/share-offsite/);
  await expect(page.getByRole("link", { name: "Add to LinkedIn profile" })).toHaveAttribute("href", /linkedin\.com\/profile\/add/);
  await shot(page, "09-leaderboard");
  const badgeHref = await share.getAttribute("href");
  const badgeCode = decodeURIComponent(badgeHref).match(/#\/badge\/([A-Z0-9-]+)/)[1];

  await open(page, "/portal/assignments");
  const openAssignment = page.locator(".assignment", { hasText: "Canva" });
  await openAssignment.locator("textarea[name=text]").fill("Five-slide pitch with a checked chart, consistent style and a one-page brief for the fictional idea.");
  await openAssignment.locator("input[type=file]").setInputFiles({ name: "pitch.pdf", mimeType: "application/pdf", buffer: Buffer.from("%PDF-1.4 fictional pitch deck") });
  await expect(openAssignment.locator(".file-meta")).toContainText("will be stored");
  await openAssignment.getByRole("button", { name: "Submit" }).click();
  await expect(page.locator(".toast", { hasText: "Submitted." })).toBeVisible();
  await expect(openAssignment.locator("summary .tag")).toHaveText("Submitted");
  await open(page, "/portal/addons");
  await expect(page.locator(".kit-card")).toContainText("Your career kit is included");

  await page.click(".inbox-fab");
  await page.getByRole("button", { name: "Simulate sign-in from another device" }).click();
  const overlay = page.locator(".modal-overlay", { hasText: "Signed out" });
  await expect(overlay).toBeVisible({ timeout: 10_000 });
  await expect(overlay).toContainText("signed in on another device");
  await shot(page, "10-signed-out-other-device", false);
  await overlay.getByRole("link", { name: "Sign in again" }).click();
  await expect(page.locator("h1")).toHaveText("Welcome back.");

  await open(page, `/badge/${badgeCode}`);
  await expect(page.locator(".badge-card")).toContainText("Ananya Iyer");
  await shot(page, "11-badge-public");
});

test("content manager uploads a lesson with a file, grades a submission, announces; the unlisted operations view needs its passphrase", async ({ page }) => {
  await adminLogin(page, "content");
  await expect(page.locator(".role-pill")).toContainText("Learning & content manager");
  await expect(page.locator(".portal-nav")).not.toContainText("Students & verification");
  await expect(page.locator(".task", { hasText: "Upload week 1 recordings" })).toBeVisible();
  await shot(page, "12-admin-overview");
  await open(page, "/admin/students");
  await expect(page.locator(".alert.error")).toContainText("does not include students");
  await open(page, "/admin/content");
  const addLesson = page.locator(".edit-row.new", { hasText: "Add a lesson" });
  await addLesson.locator("summary").click();
  await addLesson.locator("input[name=title]").fill("Week 1 / Recording: cleaning a register");
  await addLesson.locator("input[name=url]").fill("https://videos.example.com/spreadsheets-week-1");
  await addLesson.locator("input[type=file]").setInputFiles({ name: "week-1-slides.pdf", mimeType: "application/pdf", buffer: Buffer.from("%PDF-1.4 preview slides for week one") });
  await expect(addLesson.locator(".file-meta")).toContainText("will be stored");
  await addLesson.getByRole("button", { name: "Add lesson" }).click();
  await expect(page.locator(".toast", { hasText: "Lesson saved." })).toBeVisible();
  await expect(page.locator(".card", { hasText: "Lessons · Business Spreadsheets" })).toContainText("Recording: cleaning a register");
  await expect(page.locator(".card", { hasText: "Lessons · Business Spreadsheets" })).toContainText("week-1-slides.pdf");
  await open(page, "/admin/grading");
  const ungraded = page.locator(".card", { hasText: "Ungraded" }).first();
  await ungraded.locator("input[name=score]").fill("82");
  await ungraded.locator("textarea[name=feedback]").fill("Good evidence; label assumptions next time.");
  await ungraded.getByRole("button", { name: "Save grade" }).click();
  await expect(page.locator(".toast", { hasText: "Graded." })).toBeVisible();
  await open(page, "/admin/announce");
  await page.fill("input[name=title]", "Batch 1 live workshop");
  await page.fill("textarea[name=body]", "Saturday 10:00 IST. Link arrives by email.");
  await page.getByRole("button", { name: "Publish" }).click();
  await expect(page.locator(".toast", { hasText: "Announcement published" })).toBeVisible();
  await open(page, "/admin/tracker");
  await expect(page.locator(".task.done", { hasText: "Grade:" })).toHaveCount(0);
  await page.getByRole("button", { name: "All open" }).click();
  await expect(page.locator(".task").first()).toBeVisible();
  await page.getByRole("button", { name: "Sign out" }).click();
  await expect(page).toHaveURL(/#\/$/);

  await open(page, "/ops");
  await expect(page).toHaveURL(/#\/ops\/login/);
  await page.fill("input[name=passphrase]", "wrong-passphrase");
  await page.getByRole("button", { name: "Enter" }).click();
  await expect(page.locator(".alert.error")).toContainText("not right");
  await page.fill("input[name=passphrase]", "ROLEVIA-OPS-PREVIEW");
  await page.getByRole("button", { name: "Enter" }).click();
  await expect(page.locator("h1")).toHaveText("Operations snapshot");
  await expect(page.locator(".cohort")).toHaveCount(8);
  await expect(page.locator(".ops")).toContainText("collections (preview)");
  await expect(page.locator(".ops")).not.toContainText("reserve to ring-fence");
  await expect(page.locator(".ops table").first()).toContainText("RV-ADM-003");
  const createAdmin = page.locator(".edit-row.new", { hasText: "Create an admin account" });
  await createAdmin.locator("summary").click();
  await createAdmin.locator("input[name=name]").fill("Fourth Teammate");
  await createAdmin.locator("input[name=email]").fill("fourth@rolevia.demo");
  await createAdmin.locator("input[name=phone]").fill("+919800000444");
  await createAdmin.locator("select[name=role]").selectOption("success");
  await createAdmin.getByRole("button", { name: "Create admin" }).click();
  await expect(page.locator(".modal")).toContainText("Admin ID RV-ADM-004");
  await page.getByRole("button", { name: "Done" }).click();
  // Hiring companies: a logo needs a permission record before it is published; names show as monogram chips.
  const companies = page.locator(".card", { has: page.locator("h3", { hasText: "Hiring companies" }) });
  await expect(companies).toContainText("0 with a permitted logo");
  const firstCompany = companies.locator(".company-row").first();
  await firstCompany.locator("summary").click();
  await firstCompany.locator("input[name=careersUrl]").fill("https://example.com/careers");
  await firstCompany.locator("input[name=grantedBy]").fill("Brand team lead, Example Co");
  await firstCompany.locator("input[name=reference]").fill("Email: logo approval for Rolevia, 4 Nov 2026");
  await firstCompany.locator("input[name=date]").fill("2026-11-04");
  await firstCompany.getByRole("button", { name: "Save" }).click();
  await expect(page.locator(".toast", { hasText: "Company updated" })).toBeVisible();
  await expect(companies).toContainText("0 with a permitted logo", { timeout: 10_000 }); // permission recorded, but no logo file yet: nothing published
  await shot(page, "13-ops-snapshot");
  await open(page, "/");
  await expect(page.locator(".marquee .wordmark").first()).toBeVisible();
  expect(await page.locator(".marquee img.company-logo").count()).toBe(0);
});

test("protected areas redirect anonymous visitors to the right sign-in", async ({ page }) => {
  await open(page, "/portal/labs");
  await expect(page).toHaveURL(/#\/login\?next=%2Fportal%2Flabs/);
  await open(page, "/admin/students");
  await expect(page).toHaveURL(/#\/admin\/login/);
  await open(page, "/ops");
  await expect(page).toHaveURL(/#\/ops\/login/);
  await open(page, "/does-not-exist");
  await expect(page.locator("h1")).toContainText("That page is not here");
});

test("live class: host starts, learner joins with video, screen share, live quiz, chat, recording and attendance are saved", async ({ context }) => {
  test.setTimeout(240_000);
  const hostPage = await context.newPage();
  await adminLogin(hostPage, "content");
  await open(hostPage, "/admin/classes");
  const hostCard = hostPage.locator(".class-card", { hasText: "Week 1 live workshop" });
  await expect(hostCard).toBeVisible();
  await hostCard.getByRole("button", { name: "Start class" }).click();
  await expect(hostPage.locator(".gate-card h1")).toContainText("Week 1 live workshop");
  const hostJoin = hostPage.getByRole("button", { name: "Join class" });
  await expect(hostJoin).toBeEnabled({ timeout: 20_000 });
  await hostJoin.click();
  await expect(hostPage.locator(".room")).toBeVisible();
  await expect(hostPage.locator(".tile")).toHaveCount(1);

  const studentPage = await context.newPage();
  await studentLogin(studentPage);
  await open(studentPage, "/portal/classes");
  const studentCard = studentPage.locator(".class-card", { hasText: "Week 1 live workshop" });
  await expect(studentCard).toContainText("Live now");
  await studentCard.getByRole("link", { name: "Join now" }).click();
  const studentJoin = studentPage.getByRole("button", { name: "Join class" });
  await expect(studentJoin).toBeEnabled({ timeout: 20_000 });
  await studentJoin.click();
  await expect(studentPage.locator(".room")).toBeVisible();

  await expect(hostPage.locator(".tile")).toHaveCount(2, { timeout: 20_000 });
  await expect(studentPage.locator(".tile")).toHaveCount(2, { timeout: 20_000 });
  await expect.poll(() => studentPage.evaluate(() => document.querySelector('.tile[data-peer="u-admin-2"] video')?.videoWidth ?? 0), { timeout: 30_000, message: "host video should play on the learner's tile" }).toBeGreaterThan(0);
  await expect.poll(() => hostPage.evaluate(() => document.querySelector('.tile[data-peer="u-student-1"] video')?.videoWidth ?? 0), { timeout: 30_000, message: "learner video should play on the host's tile" }).toBeGreaterThan(0);
  await expect(hostPage.locator(".roster")).toContainText("Ananya Iyer");
  // Role boundary inside the room: the learner has no host controls and is labelled as a learner everywhere.
  for (const control of ["record", "quiz"]) await expect(studentPage.locator(`[data-control="${control}"]`)).toHaveCount(0);
  await expect(studentPage.locator(".room-top").getByRole("button", { name: "End class" })).toHaveCount(0);
  await expect(studentPage.locator(".room-top").getByRole("button", { name: "Leave" })).toBeVisible();
  await expect(hostPage.locator(".roster li", { hasText: "Ananya Iyer" })).toContainText("Learner");
  await expect(hostPage.locator(".roster li", { hasText: "Ayush (you)" })).toContainText("Host");
  await expect(studentPage.locator(".roster li", { hasText: "Ayush" })).toContainText("Host");
  // Host-only messages from a non-host peer are ignored: a "ghost" learner joins the channel, then tries to
  // push a question and end the class; the learner's room shows neither.
  await hostPage.evaluate(() => {
    const channel = new BroadcastChannel("rolevia-class-cls-demo-live");
    const envelope = (type, payload) => ({ room: "cls-demo-live", from: "u-ghost", role: "participant", name: "Ghost", to: "u-student-1", type, payload, at: Date.now() });
    channel.postMessage(envelope("hello", { name: "Ghost", role: "participant", state: {}, media: false }));
    setTimeout(() => channel.postMessage(envelope("quiz", { quiz: { id: "lq-fake", classId: "cls-demo-live", question: "Forged question?", options: ["A", "B"], seconds: 60, sentAt: Date.now(), closesAt: Date.now() + 60_000 } })), 150);
    setTimeout(() => channel.postMessage(envelope("ended", {})), 300);
    setTimeout(() => channel.postMessage(envelope("bye", {})), 450);
  });
  await studentPage.waitForTimeout(900);
  await expect(studentPage.locator(".room")).toBeVisible();
  await expect(studentPage.locator(".quiz-card")).toHaveCount(0);
  await expect(studentPage.locator(".tile")).toHaveCount(2, { timeout: 10_000 });

  await hostPage.locator('[data-control="share"]').click();
  await expect(hostPage.locator('[data-control="share"]')).toHaveClass(/on/, { timeout: 15_000 });
  await expect(studentPage.locator(".stage-label")).toContainText("screen", { timeout: 20_000 });
  await expect.poll(() => studentPage.evaluate(() => document.querySelector(".stage-frame video")?.videoWidth ?? 0), { timeout: 20_000 }).toBeGreaterThan(0);

  // Present the attached deck: learners see the slide on their stage without any screen share.
  await hostPage.locator('[data-control="slides"]').click();
  await hostPage.locator(".deck-row", { hasText: "attached to this class" }).getByRole("button", { name: "Present" }).click();
  await expect(studentPage.locator(".stage-slide .slide")).toBeVisible({ timeout: 15_000 });
  const firstTitle = await hostPage.locator(".stage-slide .slide h2").innerText();
  await expect(studentPage.locator(".stage-slide .slide h2")).toHaveText(firstTitle);
  await expect(studentPage.locator(".slide-bar")).toContainText("Following the host");
  await hostPage.locator(".slide-bar").getByRole("button", { name: "Next" }).click();
  await expect(studentPage.locator(".stage-slide .slide-count")).toContainText("2 /", { timeout: 10_000 });
  await expect(studentPage.locator(".stage-slide .deck-notes")).toHaveCount(0);
  await shot(hostPage, "21-classroom-presenting", false);
  await hostPage.locator(".slide-bar").getByRole("button", { name: "Stop presenting" }).click();
  await expect(studentPage.locator(".stage-slide")).toHaveCount(0, { timeout: 10_000 });

  await hostPage.locator('[data-control="quiz"]').click();
  await hostPage.locator('select[aria-label="Question from the module bank"]').selectOption({ index: 1 });
  await hostPage.getByRole("button", { name: "Send to class" }).click();
  await expect(studentPage.locator(".quiz-card h3")).toBeVisible({ timeout: 15_000 });
  const answerIndex = await studentPage.evaluate(() => { const state = JSON.parse(localStorage.getItem("rolevia.preview.v8")); return state.classes.find(item => item.id === "cls-demo-live").quizzes.at(-1).answerIndex; });
  await studentPage.locator(".quiz-option").nth(answerIndex).click();
  await expect(studentPage.locator(".quiz-card")).toContainText("Answer recorded");
  await expect(hostPage.locator(".result-bars")).toContainText("1 of 1 answered", { timeout: 15_000 });
  await hostPage.getByRole("button", { name: "Close and reveal answer" }).click();
  await expect(studentPage.locator(".quiz-card")).toContainText("+10 points", { timeout: 15_000 });
  await shot(studentPage, "15-classroom-student-quiz-result", false);
  await studentPage.getByRole("button", { name: "Continue" }).click();

  await studentPage.locator('[data-control="chat"]').click();
  await studentPage.locator(".chat-form input").fill("Hello from the learner");
  await studentPage.locator(".chat-form button").click();
  await hostPage.locator('[data-control="chat"]').click();
  await expect(hostPage.locator(".chat-list")).toContainText("Hello from the learner", { timeout: 10_000 });

  await hostPage.locator('[data-control="record"]').click();
  await hostPage.locator(".modal").getByRole("button", { name: "Start recording" }).click();
  await expect(hostPage.locator(".rec-badge")).toBeVisible({ timeout: 15_000 });
  await expect(studentPage.locator(".rec-badge")).toBeVisible({ timeout: 10_000 });
  await shot(hostPage, "14-classroom-host-recording", false);
  await hostPage.waitForTimeout(6_000);
  await hostPage.locator('[data-control="record"]').click();
  const saveDialog = hostPage.locator(".modal", { hasText: "Recording saved on this device" });
  await expect(saveDialog).toBeVisible({ timeout: 30_000 });
  await expect(saveDialog.getByRole("link", { name: "Download .webm" })).toHaveAttribute("href", /^blob:/);
  const sizeLine = await saveDialog.locator("p.small").first().innerText();
  expect(sizeLine).not.toMatch(/^0 B/);
  await saveDialog.getByRole("button", { name: "Note: kept locally" }).click();
  await expect(hostPage.locator(".toast", { hasText: "kept on your device" })).toBeVisible();
  await saveDialog.locator(".modal-head .icon-button").click();

  await hostPage.locator(".room-top").getByRole("button", { name: "End class" }).click();
  await hostPage.locator(".modal").getByRole("button", { name: "End class" }).click();
  await expect(studentPage.locator(".gate-card h1")).toHaveText("Class ended", { timeout: 15_000 });
  await expect(hostPage.locator("h1")).toHaveText("Class details", { timeout: 15_000 });
  const detailCard = (heading) => hostPage.locator(".card", { has: hostPage.locator("h3", { hasText: heading }) });
  await expect(detailCard("Attendance")).toContainText("Ananya Iyer");
  await expect(detailCard("Live questions")).toContainText("1 answered · 1 correct");
  await expect(detailCard("Recordings")).toContainText("kept on the host's device");
  await expect(detailCard("Slides for this class")).toContainText("Draft");
  await detailCard("Slides for this class").getByRole("button", { name: "Publish slides" }).click();
  await expect(detailCard("Slides for this class")).toContainText("Published", { timeout: 15_000 });
  await shot(hostPage, "16-admin-class-detail");
  await open(studentPage, "/portal/classes");
  const endedCard = studentPage.locator(".class-card", { hasText: "Week 1 live workshop" });
  await expect(endedCard).toContainText("You attended · 1/1 correct");
  await endedCard.getByRole("link", { name: "Open slides" }).click();
  await expect(studentPage.locator(".deck-viewer")).toBeVisible();
  await expect(studentPage.locator(".deck-watermark")).toContainText("view only");
});
