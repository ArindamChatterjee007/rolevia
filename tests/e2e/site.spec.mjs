import { test, expect } from "@playwright/test";
import { mkdirSync } from "node:fs";

const SHOTS = "test-results/screens";
mkdirSync(SHOTS, { recursive: true });
const shot = (page, name, fullPage = true) => page.screenshot({ path: `${SHOTS}/${name}.png`, fullPage });

async function open(page, route = "/") {
  await page.goto(`/?fast#${route}`);
  await page.waitForSelector("#splash", { state: "detached" });
}
const latestCode = (page) => page.evaluate(() => {
  const state = JSON.parse(localStorage.getItem("rolevia.preview.v3"));
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
async function adminLogin(page) {
  await open(page, "/admin/login");
  await page.fill("input[name=email]", "admin@rolevia.demo");
  await page.fill("input[name=password]", "Admin#2026");
  await page.click("button[type=submit]");
  await expect(page.locator("input[name=code]")).toBeVisible();
  await page.fill("input[name=code]", await latestCode(page));
  await page.click("button[type=submit]");
  await expect(page.locator("h1")).toHaveText("Overview");
}

test("public site renders the animated hero, company marquee, eight skills and stays mobile-safe", async ({ page }) => {
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  await open(page, "/");
  await expect(page.locator("h1.display")).toContainText("Business knowledge");
  await expect(page.locator(".orbit-chip")).toHaveCount(8);
  expect(await page.locator(".marquee .wordmark").count()).toBeGreaterThanOrEqual(12);
  await expect(page.locator(".marquee-wrap")).toContainText("No partnership, endorsement or placement is implied");
  await expect(page.locator(".skills-grid .skill-card")).toHaveCount(8);
  await expect(page.locator(".quotes-ticker .quote").first()).toBeVisible();
  await expect(page.locator(".teaser-row").first()).toContainText("#1");
  await shot(page, "01-home-desktop");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload();
  await page.waitForSelector("#splash", { state: "detached" });
  const widths = await page.evaluate(() => ({ viewport: window.innerWidth, content: document.documentElement.scrollWidth }));
  expect(widths.content).toBe(widths.viewport);
  await shot(page, "02-home-mobile", false);
  await open(page, "/pricing");
  await page.getByRole("button", { name: "International · USD" }).click();
  await expect(page.locator(".pricing-table")).toContainText("USD 49");
  await open(page, "/skills/business-ai");
  await expect(page.locator("h1")).toHaveText("AI for MBA & Business");
  await expect(page.locator(".price-big")).toHaveText("INR 2,999");
  expect(errors).toEqual([]);
});

test("registration pays first, a human verifies, credentials arrive by message, OTP sign-in forces a password change", async ({ page }) => {
  await open(page, "/register");
  await page.fill("input[name=name]", "Test Learner");
  await page.fill("input[name=email]", "test.learner@example.com");
  await page.fill("input[name=phone]", "+919800012345");
  await page.fill("input[name=city]", "Mumbai");
  await page.click("button[type=submit]");
  await expect(page.locator("h1")).toHaveText("Choose your skills.");
  await page.click(".choice[data-id=spreadsheets]");
  await page.click(".choice[data-id=budgeting]");
  await expect(page.locator(".plan-total")).toContainText("INR 4,998");
  await page.getByRole("button", { name: "Review and pay" }).click();
  await expect(page.locator("h1")).toHaveText("Review and pay.");
  await expect(page.locator(".order-summary")).toContainText("INR 4,998");
  await shot(page, "03-register-payment");
  await page.getByRole("button", { name: "Pay (preview)" }).click();
  await expect(page.locator(".status-badge")).toContainText("Awaiting human verification");
  await shot(page, "04-register-verification");

  await adminLogin(page);
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

  await open(page, "/portal/labs/business-ai");
  for (const label of ["Task: compare three CRM plans", "Audience: a non-technical founder", "Constraints: use only official pricing pages", "Acceptance: a table with source links"]) await page.locator(".choice-line", { hasText: label }).click();
  await page.getByRole("button", { name: "Send brief and read the answer" }).click();
  await page.locator(".ai-line", { hasText: "Plan B is 20% cheaper" }).click();
  await page.locator(".ai-line", { hasText: "2019 blog post" }).click();
  await page.getByRole("button", { name: "Check my review" }).click();
  await expect(page.locator(".lab-score strong")).toHaveText("100");
  await expect(page.locator(".lab-status")).toContainText("best 100/100 · +50 points");
  await shot(page, "07-lab-business-ai");

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
  await expect(page.locator(".assignment").first()).toBeVisible();
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

test("admin uploads a lesson, grades a submission, announces; the unlisted operations view needs its passphrase", async ({ page }) => {
  await adminLogin(page);
  await shot(page, "12-admin-overview");
  await open(page, "/admin/content");
  const addLesson = page.locator(".edit-row.new", { hasText: "Add a lesson" });
  await addLesson.locator("summary").click();
  await addLesson.locator("input[name=title]").fill("Week 1 / Recording: cleaning a register");
  await addLesson.locator("input[name=url]").fill("https://videos.example.com/spreadsheets-week-1");
  await addLesson.getByRole("button", { name: "Add lesson" }).click();
  await expect(page.locator(".toast", { hasText: "Lesson saved." })).toBeVisible();
  await expect(page.locator(".card", { hasText: "Lessons · Business Spreadsheets" })).toContainText("Recording: cleaning a register");
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
  await open(page, "/admin/alerts");
  await expect(page.locator("h1")).toHaveText("Device alerts");
  await page.getByRole("button", { name: "Sign out" }).click();

  await open(page, "/ops");
  await expect(page).toHaveURL(/#\/ops\/login/);
  await page.fill("input[name=passphrase]", "wrong-passphrase");
  await page.getByRole("button", { name: "Enter" }).click();
  await expect(page.locator(".alert.error")).toContainText("not right");
  await page.fill("input[name=passphrase]", "ROLEVIA-OPS-PREVIEW");
  await page.getByRole("button", { name: "Enter" }).click();
  await expect(page.locator("h1")).toHaveText("Operations snapshot");
  await expect(page.locator(".cohort")).toHaveCount(8);
  await expect(page.locator(".ops")).toContainText("Career-kit reserve to ring-fence");
  await shot(page, "13-ops-snapshot");
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
