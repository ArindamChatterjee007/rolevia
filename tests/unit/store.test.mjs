import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createMockServer, memoryStorage, ApiError } from "../../site/app/store.js";
import { QUIZ_BANK } from "../../site/app/content/quiz-bank.js";
import { ASSIGNMENT_BRIEFS } from "../../site/app/content/assignments.js";

const curriculum = JSON.parse(await readFile(new URL("../../site/data/curriculum.json", import.meta.url), "utf8"));
const DAY = 24 * 60 * 60 * 1000;

async function server(start = Date.UTC(2026, 10, 3, 9)) {
  let clock = start;
  const api = await createMockServer({ storage: memoryStorage(), curriculum, quizBank: QUIZ_BANK, assignmentBriefs: ASSIGNMENT_BRIEFS, now: () => clock });
  return { api, tick: (ms) => { clock += ms; }, latestCode: (purpose = "code") => api._state().outbox.find(message => message.channel === "email" && message.body.includes("Code"))?.body.match(/Code (\d{6})/)?.[1] };
}
const device = (label) => ({ deviceId: `device-${label}`, deviceLabel: label });
async function signIn(api, identifier, password, dev, latestCode) {
  const challenge = await api.login({ identifier, password, ...dev });
  return api.verifyOtp({ challengeId: challenge.challengeId, code: latestCode(), ...dev });
}
async function adminToken(api, latestCode) {
  return (await signIn(api, "admin@rolevia.demo", "Admin#2026", device("admin-laptop"), latestCode)).token;
}
const rejects = (promise, code) => assert.rejects(promise, (error) => error instanceof ApiError && error.code === code);

test("content integrity: 8 modules, 64 reviewed questions, matching assignment briefs", () => {
  assert.equal(curriculum.modules.length, 8);
  for (const module of curriculum.modules) {
    assert.equal(QUIZ_BANK[module.id].length, 8, module.id);
    assert.ok(ASSIGNMENT_BRIEFS[module.id].acceptance.length === 3);
    for (const question of QUIZ_BANK[module.id]) {
      assert.equal(question.options.length, 4);
      assert.ok(question.answerIndex >= 0 && question.answerIndex < 4);
      assert.equal(new Set(question.options).size, 4, question.id);
    }
    assert.ok(module.priceINR >= 1999 && module.priceINR <= 2999);
  }
});

test("registration requires payment, then human verification issues the Student ID and temporary password", async () => {
  const { api, latestCode } = await server();
  await rejects(api.register({ name: "A", email: "bad", phone: "1", moduleIds: ["spreadsheets"], acceptedTerms: true }), "VALIDATION");
  const application = await api.register({ name: "Nisha Rao", email: "Nisha@Example.com", phone: "+91 98000 11111", city: "Hyderabad", moduleIds: ["spreadsheets", "budgeting"], acceptedTerms: true });
  assert.equal(application.quoteINR.subtotal, 2499 + 2499);
  assert.equal(application.quoteUSD.subtotal, 49 + 49);
  await rejects(api.login({ identifier: "nisha@example.com", password: "x", ...device("phone") }), "NOT_VERIFIED");
  await rejects(api.pay({ applicationId: application.applicationId, currency: "INR", outcome: "declined" }), "PAYMENT_DECLINED");
  const paid = await api.pay({ applicationId: application.applicationId, currency: "INR" });
  assert.equal(paid.status, "pending_verification");
  await rejects(api.login({ identifier: "nisha@example.com", password: "anything", ...device("phone") }), "NOT_VERIFIED");
  const admin = await adminToken(api, latestCode);
  const students = await api.adminStudents({ token: admin, deviceId: "device-admin-laptop" });
  const pending = students.find(student => student.email === "nisha@example.com");
  assert.equal(pending.status, "pending_verification");
  const issued = await api.adminVerify({ token: admin, deviceId: "device-admin-laptop", userId: pending.id });
  assert.match(issued.studentId, /^RV-26-\d{4}$/);
  const credentialMail = api._state().outbox.find(message => message.subject.includes("Student ID") && message.channel === "email");
  assert.ok(credentialMail.body.includes(issued.studentId) && credentialMail.body.includes(issued.previewTemporaryPassword));
  const session = await signIn(api, issued.studentId, issued.previewTemporaryPassword, device("phone"), latestCode);
  assert.equal(session.mustChangePassword, true);
  assert.deepEqual(session.user.modules, ["spreadsheets", "budgeting"]);
  await rejects(api.changePassword({ token: session.token, deviceId: "device-phone", currentPassword: issued.previewTemporaryPassword, newPassword: "short" }), "WEAK_PASSWORD");
  await api.changePassword({ token: session.token, deviceId: "device-phone", currentPassword: issued.previewTemporaryPassword, newPassword: "Nisha-2026!" });
  const me = await api.me({ token: session.token, deviceId: "device-phone" });
  assert.equal(me.user.mustChangePassword, false);
});

test("one-time codes expire, allow five attempts and cannot be reused", async () => {
  const { api, tick, latestCode } = await server();
  const challenge = await api.login({ identifier: "RV-26-0001", password: "Learn#2026", ...device("tab") });
  for (let attempt = 0; attempt < 5; attempt += 1) await rejects(api.verifyOtp({ challengeId: challenge.challengeId, code: "000000", ...device("tab") }), "OTP_INVALID");
  await rejects(api.verifyOtp({ challengeId: challenge.challengeId, code: latestCode(), ...device("tab") }), "OTP_LOCKED");
  const second = await api.login({ identifier: "RV-26-0001", password: "Learn#2026", ...device("tab") });
  tick(6 * 60 * 1000);
  await rejects(api.verifyOtp({ challengeId: second.challengeId, code: latestCode(), ...device("tab") }), "OTP_EXPIRED");
});

test("five wrong passwords lock the account for fifteen minutes", async () => {
  const { api, tick } = await server();
  for (let attempt = 0; attempt < 5; attempt += 1) await rejects(api.login({ identifier: "RV-26-0002", password: "wrong", ...device("x") }), "INVALID_CREDENTIALS");
  await rejects(api.login({ identifier: "RV-26-0002", password: "Learn#2026", ...device("x") }), "LOCKED");
  tick(16 * 60 * 1000);
  assert.ok((await api.login({ identifier: "RV-26-0002", password: "Learn#2026", ...device("x") })).challengeId);
});

test("only one device stays signed in; frequent switching triggers a security notice and an admin alert", async () => {
  const { api, latestCode } = await server();
  const first = await signIn(api, "RV-26-0001", "Learn#2026", device("laptop"), latestCode);
  assert.equal(first.deviceSwitches, 0);
  await rejects(api.me({ token: first.token, deviceId: "device-other" }), "DEVICE_MISMATCH");
  const again = await signIn(api, "RV-26-0001", "Learn#2026", device("laptop"), latestCode);
  assert.equal(again.deviceSwitches, 0, "re-login on the same device is not a switch");
  await rejects(api.me({ token: first.token, deviceId: "device-laptop" }), "SESSION_REVOKED");
  let latest = again;
  for (let index = 1; index <= 4; index += 1) {
    latest = await signIn(api, "RV-26-0001", "Learn#2026", device(index % 2 ? "phone" : "laptop"), latestCode);
    assert.equal(latest.deviceSwitches, index);
    assert.equal(latest.warned, false);
  }
  const fifth = await signIn(api, "RV-26-0001", "Learn#2026", device("tablet"), latestCode);
  assert.equal(fifth.deviceSwitches, 5);
  assert.equal(fifth.warned, true);
  const notifications = await api.notifications({ token: fifth.token, deviceId: "device-tablet" });
  assert.ok(notifications.some(item => item.kind === "security" && item.title.includes("multiple devices")));
  assert.ok(api._state().outbox.some(message => message.subject.includes("multiple devices")));
  const admin = await adminToken(api, latestCode);
  const alerts = await api.adminDeviceAlerts({ token: admin, deviceId: "device-admin-laptop" });
  assert.equal(alerts.filter(alert => alert.status === "open").length, 1);
  const sixth = await signIn(api, "RV-26-0001", "Learn#2026", device("laptop"), latestCode);
  assert.equal(sixth.warned, false, "the notice repeats only at every fifth switch");
});

test("daily quiz hides answers, scores once per module per day and feeds the leaderboard", async () => {
  const { api, latestCode, tick } = await server();
  const session = await signIn(api, "RV-26-0006", "Learn#2026", device("laptop"), latestCode);
  const auth = { token: session.token, deviceId: "device-laptop" };
  await rejects(api.dailyQuiz({ ...auth, moduleId: "crm" }), "NOT_ENROLLED");
  const quiz = await api.dailyQuiz({ ...auth, moduleId: "spreadsheets" });
  assert.equal(quiz.questions.length, 5);
  assert.ok(quiz.questions.every(question => question.answerIndex === undefined && question.explanation === undefined));
  const answers = Object.fromEntries(quiz.questions.map(question => [question.id, QUIZ_BANK.spreadsheets.find(item => item.id === question.id).answerIndex]));
  const before = (await api.dashboard(auth)).points;
  const result = await api.submitQuiz({ ...auth, moduleId: "spreadsheets", answers });
  assert.equal(result.score, 5);
  assert.equal(result.points, 50);
  assert.equal(result.totalPoints, before + 50 + result.streakBonus);
  await rejects(api.submitQuiz({ ...auth, moduleId: "spreadsheets", answers }), "ALREADY_DONE");
  tick(DAY);
  const tomorrow = await api.dailyQuiz({ ...auth, moduleId: "spreadsheets" });
  assert.equal(tomorrow.attempt, null);
  assert.equal(tomorrow.streak, 2, "yesterday's seeded quiz plus today's attempt");
  const board = await api.leaderboard({ ...auth, period: "week" });
  assert.ok(board.rows.length >= 6);
  assert.ok(board.rows.every((row, index) => index === 0 || board.rows[index - 1].points >= row.points));
  assert.ok(board.me.points >= 50);
});

test("labs award points for improvement only and assignments move through submission, grading and notifications", async () => {
  const { api, latestCode } = await server();
  const session = await signIn(api, "RV-26-0001", "Learn#2026", device("laptop"), latestCode);
  const auth = { token: session.token, deviceId: "device-laptop" };
  const first = await api.completeLab({ ...auth, labId: "business-ai", score: 60 });
  assert.equal(first.pointsAwarded, 30);
  const worse = await api.completeLab({ ...auth, labId: "business-ai", score: 40 });
  assert.equal(worse.pointsAwarded, 0);
  assert.equal(worse.best, 60);
  const better = await api.completeLab({ ...auth, labId: "business-ai", score: 100 });
  assert.equal(better.pointsAwarded, 20);
  await rejects(api.completeLab({ ...auth, labId: "trello", score: 90 }), "NOT_ENROLLED");
  const assignments = await api.assignments(auth);
  assert.equal(assignments.length, 5);
  const canva = assignments.find(item => item.moduleId === "canva");
  assert.equal(canva.submission, null);
  await rejects(api.submitAssignment({ ...auth, assignmentId: canva.id, text: "too short" }), "VALIDATION");
  await rejects(api.submitAssignment({ ...auth, assignmentId: canva.id, text: "x".repeat(50), link: "http://insecure.example" }), "VALIDATION");
  const submission = await api.submitAssignment({ ...auth, assignmentId: canva.id, text: "Built the five-slide pitch with a checked chart and a one-page brief for the fictional idea.", link: "https://example.com/deck" });
  const admin = await adminToken(api, latestCode);
  const queue = await api.adminSubmissions({ token: admin, deviceId: "device-admin-laptop" });
  assert.equal(queue[0].id, submission.id, "ungraded submissions sort first, newest first");
  const before = (await api.dashboard(auth)).points;
  await api.adminGrade({ token: admin, deviceId: "device-admin-laptop", submissionId: submission.id, score: 85, feedback: "Clear structure." });
  assert.equal((await api.dashboard(auth)).points, before + 85);
  await rejects(api.submitAssignment({ ...auth, assignmentId: canva.id, text: "y".repeat(50) }), "ALREADY_GRADED");
  const notifications = await api.notifications(auth);
  assert.ok(notifications.some(item => item.kind === "grade"));
  await api.adminGrade({ token: admin, deviceId: "device-admin-laptop", submissionId: submission.id, score: 90 });
  assert.equal((await api.dashboard(auth)).points, before + 90, "regrading adjusts points instead of double counting");
});

test("any five distinct paid modules unlock the career kit and included services cannot be sold again", async () => {
  const { api, latestCode } = await server();
  const session = await signIn(api, "RV-26-0003", "Learn#2026", device("laptop"), latestCode);
  const auth = { token: session.token, deviceId: "device-laptop" };
  assert.equal(session.user.kitUnlocked, false);
  await rejects(api.purchase({ ...auth, moduleIds: ["hr-tracker"] }), "VALIDATION");
  const purchase = await api.purchase({ ...auth, moduleIds: ["dashboards", "business-ai", "canva"] });
  assert.equal(purchase.payment.subtotal, 2999 + 2999 + 1999);
  assert.equal(purchase.user.modules.length, 5);
  assert.equal(purchase.user.kitUnlocked, true);
  await rejects(api.purchase({ ...auth, serviceIds: ["resume-writing"] }), "ALREADY_INCLUDED");
  const addon = await api.purchase({ ...auth, serviceIds: ["linkedin"] });
  assert.equal(addon.payment.subtotal, 999);
  const dashboard = await api.dashboard(auth);
  assert.equal(dashboard.kit.unlocked, true);
  assert.ok(dashboard.notifications.some(item => item.title === "Career kit unlocked"));
});

test("leaderboard issues one top-scorer badge that resolves publicly, and public rows hide full names", async () => {
  const { api, latestCode } = await server();
  const session = await signIn(api, "RV-26-0001", "Learn#2026", device("laptop"), latestCode);
  const board = await api.leaderboard({ token: session.token, deviceId: "device-laptop", period: "all" });
  assert.equal(board.rows[0].userId, "u-student-1");
  assert.ok(board.badge, "the demo top scorer receives a badge");
  const badge = await api.badge(board.badge.code);
  assert.equal(badge.name, "Ananya Iyer");
  assert.equal(badge.previewOnly, true);
  const publicRows = await api.publicLeaderboard();
  assert.equal(publicRows[0].name, "Ananya I.");
  await rejects(api.badge("RV-TOP-NOPE"), "NOT_FOUND");
});

test("admin content management validates links and the operations view needs the ops passphrase", async () => {
  const { api, latestCode } = await server();
  const admin = await adminToken(api, latestCode);
  const adminAuth = { token: admin, deviceId: "device-admin-laptop" };
  await rejects(api.adminUpsertLesson({ ...adminAuth, moduleId: "trello", lesson: { title: "Board walkthrough", url: "http://insecure" } }), "VALIDATION");
  const lesson = await api.adminUpsertLesson({ ...adminAuth, moduleId: "trello", lesson: { title: "Board walkthrough", url: "https://videos.example/board", minutes: 25, type: "video" } });
  assert.equal((await api.adminContent(adminAuth)).lessons.trello.at(-1).id, lesson.id);
  await api.adminAnnounce({ ...adminAuth, title: "Batch 1 dates", body: "Live workshop on Saturday." });
  const student = await signIn(api, "RV-26-0004", "Learn#2026", device("phone"), latestCode);
  const dashboard = await api.dashboard({ token: student.token, deviceId: "device-phone" });
  assert.equal(dashboard.announcements[0].title, "Batch 1 dates");
  await rejects(api.opsSummary({ token: admin, deviceId: "device-admin-laptop" }), "FORBIDDEN");
  await rejects(api.opsLogin({ passphrase: "wrong", ...device("founder") }), "INVALID_CREDENTIALS");
  const ops = await api.opsLogin({ passphrase: "ROLEVIA-OPS-PREVIEW", ...device("founder") });
  const summary = await api.opsSummary({ token: ops.token, deviceId: "device-founder" });
  assert.equal(summary.cohorts.length, 8);
  const inr = summary.byCurrency.find(row => row.currency === "INR");
  assert.equal(inr.bonusReserve, inr.moduleSales * 600);
  assert.equal(inr.referralReserve, inr.moduleSales * 300);
  await rejects(api.dashboard({ token: ops.token, deviceId: "device-founder" }), "FORBIDDEN");
});

test("referral codes are validated and reset tokens revoke every session", async () => {
  const { api, latestCode } = await server();
  await rejects(api.register({ name: "Guest User", email: "guest@example.com", phone: "+919800000099", moduleIds: ["crm"], referralCode: "RV-REF-NOPE", acceptedTerms: true }), "VALIDATION");
  const referred = await api.register({ name: "Guest User", email: "guest@example.com", phone: "+919800000099", moduleIds: ["crm"], referralCode: "RV-REF-00001", acceptedTerms: true });
  assert.ok(referred.applicationId);
  const session = await signIn(api, "RV-26-0001", "Learn#2026", device("laptop"), latestCode);
  const status = await api.referralStatus({ token: session.token, deviceId: "device-laptop" });
  assert.equal(status.referred, 1);
  assert.equal(status.qualified, 0);
  const challenge = await api.requestReset({ identifier: "RV-26-0001" });
  const resetMail = api._state().outbox.find(message => message.subject.includes("password reset") && message.channel === "email");
  await api.resetPassword({ challengeId: challenge.challengeId, code: resetMail.body.match(/Code (\d{6})/)[1], newPassword: "Fresh-2026-pass" });
  await rejects(api.me({ token: session.token, deviceId: "device-laptop" }), "SESSION_REVOKED");
  assert.ok((await api.login({ identifier: "RV-26-0001", password: "Fresh-2026-pass", ...device("laptop") })).challengeId);
});
