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
const ADMINS = { lead: ["RV-ADM-001", "Lead-Arindam-2026"], content: ["RV-ADM-002", "Content-Ayush-2026"], success: ["RV-ADM-003", "Success-Souvik-2026"] };
async function adminToken(api, latestCode, role = "lead") {
  const [adminId, password] = ADMINS[role];
  const challenge = await api.login({ identifier: adminId, password, ...device("admin-laptop"), expectedType: "admin" });
  const session = await api.verifyOtp({ challengeId: challenge.challengeId, code: latestCode(), ...device("admin-laptop") });
  if (session.mustChangePassword) await api.changePassword({ token: session.token, deviceId: "device-admin-laptop", currentPassword: password, newPassword: password });
  return session.token;
}
const DETAILS = { name: "Nisha Rao", email: "Nisha@Example.com", phone: "+91 98000 11111", city: "Hyderabad", education: "mba", graduationYear: "2025", currentStatus: "fresher", preferredSlot: "weekend-morning", goal: "Move into a reporting role within six months.", acceptedTerms: true };
const contactCode = (api, email) => api._state().otps.find(otp => otp.purpose === "contact" && otp.contact === email.toLowerCase()).code;
async function registered(api, moduleIds, overrides = {}) {
  const details = { ...DETAILS, ...overrides };
  const challenge = await api.requestContactCode({ email: details.email, phone: details.phone });
  return api.register({ ...details, moduleIds, contactChallengeId: challenge.challengeId, contactCode: contactCode(api, details.email) });
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
  assert.equal(curriculum.economics, undefined, "internal cost assumptions must not ship in the public data file");
});

test("seeded preview accounts use placeholder contact details only", async () => {
  const { api } = await server();
  for (const user of api._state().users) {
    assert.ok(/^\+\d{12,13}$/.test(user.phone) && user.phone.includes("0000000"), `${user.name} phone must be a placeholder`);
    assert.match(user.email, /@(example\.com|rolevia\.demo)$/, `${user.name} email must be a placeholder`);
  }
});

test("registration requires payment, then human verification issues the Student ID and temporary password", async () => {
  const { api, latestCode } = await server();
  await rejects(api.register({ name: "A", email: "bad", phone: "1", moduleIds: ["spreadsheets"], acceptedTerms: true }), "VALIDATION");
  await rejects(api.register({ ...DETAILS, moduleIds: ["spreadsheets"] }), "CONTACT_UNVERIFIED");
  const challenge = await api.requestContactCode({ email: DETAILS.email, phone: DETAILS.phone });
  await rejects(api.register({ ...DETAILS, moduleIds: ["spreadsheets"], contactChallengeId: challenge.challengeId, contactCode: "000000" }), "OTP_INVALID");
  const application = await api.register({ ...DETAILS, moduleIds: ["spreadsheets", "budgeting"], contactChallengeId: challenge.challengeId, contactCode: contactCode(api, DETAILS.email) });
  assert.equal(application.quoteINR.subtotal, 2499 + 2499);
  assert.equal(application.quoteUSD.subtotal, 49 + 49);
  await rejects(api.login({ identifier: "nisha@example.com", password: "x", ...device("phone") }), "NOT_VERIFIED");
  await rejects(api.pay({ applicationId: application.applicationId, currency: "INR", outcome: "declined" }), "PAYMENT_DECLINED");
  const paid = await api.pay({ applicationId: application.applicationId, currency: "INR" });
  assert.equal(paid.status, "pending_verification");
  await rejects(api.login({ identifier: "nisha@example.com", password: "anything", ...device("phone") }), "NOT_VERIFIED");
  const content = await adminToken(api, latestCode, "content");
  await rejects(api.adminStudents({ token: content, deviceId: "device-admin-laptop" }), "FORBIDDEN");
  const contentOverview = await api.adminOverview({ token: content, deviceId: "device-admin-laptop" });
  assert.equal(contentOverview.revenue, null, "content role must not see revenue");
  assert.equal(contentOverview.recentAudit, null, "content role must not see the audit log");
  const contentTracker = await api.adminTracker({ token: content, deviceId: "device-admin-laptop" });
  assert.ok(contentTracker.pipeline.length > 0);
  assert.ok(contentTracker.pipeline.every(row => row.email === null && row.amount === null && row.paymentId === null), "content role must not see contact details or amounts");
  await rejects(api.adminCreateTask({ token: content, deviceId: "device-admin-laptop", title: "Verify someone", role: "success" }), "FORBIDDEN");
  await rejects(api.login({ identifier: "RV-ADM-002", password: "Content-Ayush-2026", ...device("phone") }), "INVALID_CREDENTIALS");
  const admin = await adminToken(api, latestCode, "success");
  const students = await api.adminStudents({ token: admin, deviceId: "device-admin-laptop" });
  const pending = students.find(student => student.email === "nisha@example.com");
  assert.equal(pending.status, "pending_verification");
  assert.equal(pending.profile.preferredSlot, "weekend-morning");
  const tracker = await api.adminTracker({ token: admin, deviceId: "device-admin-laptop" });
  const verifyTask = tracker.tasks.find(task => task.type === "verify" && task.refId === pending.id);
  assert.equal(verifyTask.status, "open");
  assert.equal(verifyTask.mine, true, "verification tasks route to the success role");
  await rejects(api.adminUpdateTask({ token: content, deviceId: "device-admin-laptop", taskId: verifyTask.id, action: "claim" }), "FORBIDDEN");
  await rejects(api.adminUpdateTask({ token: admin, deviceId: "device-admin-laptop", taskId: verifyTask.id, action: "done" }), "INVALID_STATE");
  const issued = await api.adminVerify({ token: admin, deviceId: "device-admin-laptop", userId: pending.id });
  assert.equal((await api.adminTracker({ token: admin, deviceId: "device-admin-laptop" })).tasks.find(task => task.id === verifyTask.id).status, "done");
  assert.match(issued.studentId, /^RV-26-\d{4}$/);
  const credentialMail = api._state().outbox.find(message => message.subject.includes("Student ID") && message.channel === "email");
  assert.ok(credentialMail.body.includes(issued.studentId) && credentialMail.body.includes(issued.previewTemporaryPassword));
  const session = await signIn(api, issued.studentId, issued.previewTemporaryPassword, device("phone"), latestCode);
  assert.equal(session.mustChangePassword, true);
  assert.deepEqual(session.user.modules, ["spreadsheets", "budgeting"]);
  await rejects(api.dashboard({ token: session.token, deviceId: "device-phone" }), "PASSWORD_CHANGE_REQUIRED");
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
  const admin = await adminToken(api, latestCode, "success");
  const alerts = await api.adminDeviceAlerts({ token: admin, deviceId: "device-admin-laptop" });
  assert.equal(alerts.filter(alert => alert.status === "open").length, 1);
  const alertTask = (await api.adminTracker({ token: admin, deviceId: "device-admin-laptop" })).tasks.find(task => task.type === "alert" && task.refId === alerts[0].id);
  assert.equal(alertTask.role, "success");
  await api.adminResolveAlert({ token: admin, deviceId: "device-admin-laptop", alertId: alerts[0].id });
  assert.equal((await api.adminTracker({ token: admin, deviceId: "device-admin-laptop" })).tasks.find(task => task.id === alertTask.id).status, "done");
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
  await rejects(api.submitAssignment({ ...auth, assignmentId: canva.id, text: "x".repeat(50), file: { name: "big.pdf", size: 900 * 1024, type: "application/pdf", dataUrl: `data:application/pdf;base64,${"A".repeat(100)}` } }), "FILE_TOO_LARGE");
  const submission = await api.submitAssignment({ ...auth, assignmentId: canva.id, text: "Built the five-slide pitch with a checked chart and a one-page brief for the fictional idea.", link: "https://example.com/deck", file: { name: "pitch.pdf", size: 2048, type: "application/pdf", sha256: "ab".repeat(32), dataUrl: `data:application/pdf;base64,${"QUJD".repeat(20)}` } });
  assert.equal(submission.file.stored, true);
  assert.equal(submission.fileName, "pitch.pdf");
  const success = await adminToken(api, latestCode, "success");
  await rejects(api.adminSubmissions({ token: success, deviceId: "device-admin-laptop" }), "FORBIDDEN");
  const admin = await adminToken(api, latestCode, "content");
  const queue = await api.adminSubmissions({ token: admin, deviceId: "device-admin-laptop" });
  assert.equal(queue[0].id, submission.id, "ungraded submissions sort first, newest first");
  assert.equal(queue[0].file.dataUrl.startsWith("data:application/pdf"), true);
  const gradeTask = (await api.adminTracker({ token: admin, deviceId: "device-admin-laptop" })).tasks.find(task => task.type === "grade" && task.refId === submission.id);
  assert.equal(gradeTask.mine, true, "grading tasks route to the content role");
  const before = (await api.dashboard(auth)).points;
  await api.adminGrade({ token: admin, deviceId: "device-admin-laptop", submissionId: submission.id, score: 85, feedback: "Clear structure." });
  assert.equal((await api.dashboard(auth)).points, before + 85);
  await rejects(api.submitAssignment({ ...auth, assignmentId: canva.id, text: "y".repeat(50) }), "ALREADY_GRADED");
  const notifications = await api.notifications(auth);
  assert.ok(notifications.some(item => item.kind === "grade"));
  await api.adminGrade({ token: admin, deviceId: "device-admin-laptop", submissionId: submission.id, score: 90 });
  assert.equal((await api.dashboard(auth)).points, before + 90, "regrading adjusts points instead of double counting");
  assert.equal((await api.adminTracker({ token: admin, deviceId: "device-admin-laptop" })).tasks.find(task => task.id === gradeTask.id).status, "done");
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

test("admin content management validates links and attachments; roles gate pages; the operations view manages the team", async () => {
  const { api, latestCode } = await server();
  const success = await adminToken(api, latestCode, "success");
  await rejects(api.adminUpsertLesson({ token: success, deviceId: "device-admin-laptop", moduleId: "trello", lesson: { title: "Board walkthrough" } }), "FORBIDDEN");
  await rejects(api.adminAudit({ token: success, deviceId: "device-admin-laptop" }), "FORBIDDEN");
  const admin = await adminToken(api, latestCode, "content");
  const adminAuth = { token: admin, deviceId: "device-admin-laptop" };
  await rejects(api.adminUpsertLesson({ ...adminAuth, moduleId: "trello", lesson: { title: "Board walkthrough", url: "http://insecure" } }), "VALIDATION");
  const lesson = await api.adminUpsertLesson({ ...adminAuth, moduleId: "trello", lesson: { title: "Board walkthrough", url: "https://videos.example/board", minutes: 25, type: "video", attachment: { name: "board-slides.pdf", size: 1500, type: "application/pdf", dataUrl: `data:application/pdf;base64,${"QUJD".repeat(10)}` } } });
  assert.equal((await api.adminContent(adminAuth)).lessons.trello.at(-1).id, lesson.id);
  assert.equal(lesson.attachment.stored, true);
  const kept = await api.adminUpsertLesson({ ...adminAuth, moduleId: "trello", lesson: { id: lesson.id, title: "Board walkthrough (updated)" } });
  assert.equal(kept.attachment.name, "board-slides.pdf", "editing without a new file keeps the attachment");
  const removed = await api.adminUpsertLesson({ ...adminAuth, moduleId: "trello", lesson: { id: lesson.id, title: "Board walkthrough", attachment: null } });
  assert.equal(removed.attachment, null);
  const lead = await adminToken(api, latestCode, "lead");
  const task = await api.adminCreateTask({ token: lead, deviceId: "device-admin-laptop", title: "Upload week 2 slides", role: "content", assigneeId: "u-admin-2", link: "#/admin/content" });
  assert.equal(task.assigneeId, "u-admin-2");
  await rejects(api.adminUpdateTask({ ...adminAuth, taskId: task.id, action: "assign", notes: { assigneeId: null } }), "FORBIDDEN");
  const done = await api.adminUpdateTask({ ...adminAuth, taskId: task.id, action: "done", notes: "Uploaded." });
  assert.equal(done.status, "done");
  await api.adminAnnounce({ ...adminAuth, title: "Batch 1 dates", body: "Live workshop on Saturday." });
  const student = await signIn(api, "RV-26-0004", "Learn#2026", device("phone"), latestCode);
  const dashboard = await api.dashboard({ token: student.token, deviceId: "device-phone" });
  assert.equal(dashboard.announcements[0].title, "Batch 1 dates");
  await rejects(api.opsSummary({ token: admin, deviceId: "device-admin-laptop" }), "FORBIDDEN");
  await rejects(api.opsLogin({ passphrase: "wrong", ...device("founder") }), "INVALID_CREDENTIALS");
  const ops = await api.opsLogin({ passphrase: "ROLEVIA-OPS-PREVIEW", ...device("founder") });
  const team = await api.opsTeam({ token: ops.token, deviceId: "device-founder" });
  assert.deepEqual(team.admins.map(item => item.adminId), ["RV-ADM-001", "RV-ADM-002", "RV-ADM-003"]);
  assert.deepEqual(team.admins.map(item => item.role), ["lead", "content", "success"]);
  await rejects(api.opsCreateAdmin({ token: ops.token, deviceId: "device-founder", name: "New Admin", email: "ayush@rolevia.demo", phone: "+919800000777", role: "content" }), "VALIDATION");
  const created = await api.opsCreateAdmin({ token: ops.token, deviceId: "device-founder", name: "Fourth Person", email: "fourth@rolevia.demo", phone: "+919800000777", role: "success" });
  assert.equal(created.adminId, "RV-ADM-004");
  await rejects(api.login({ identifier: "RV-ADM-004", password: created.previewTemporaryPassword, ...device("fourth") }), "INVALID_CREDENTIALS");
  const fourthChallenge = await api.login({ identifier: "RV-ADM-004", password: created.previewTemporaryPassword, ...device("fourth"), expectedType: "admin" });
  const fourth = await api.verifyOtp({ challengeId: fourthChallenge.challengeId, code: latestCode(), ...device("fourth") });
  assert.equal(fourth.mustChangePassword, true);
  await rejects(api.adminOverview({ token: fourth.token, deviceId: "device-fourth" }), "PASSWORD_CHANGE_REQUIRED");
  assert.equal(fourth.user.roleLabel, "Student success & verification");
  await api.opsSetAdmin({ token: ops.token, deviceId: "device-founder", adminUserId: fourth.user.id, status: "suspended" });
  await rejects(api.me({ token: fourth.token, deviceId: "device-fourth" }), "SESSION_REVOKED");
  const summary = await api.opsSummary({ token: ops.token, deviceId: "device-founder" });
  assert.equal(summary.cohorts.length, 8);
  const inr = summary.byCurrency.find(row => row.currency === "INR");
  assert.ok(inr.moduleSales > 0 && inr.learners > 0);
  assert.equal(inr.bonusReserve, undefined, "reserve economics are not exposed by the preview API");
  for (let attempt = 0; attempt < 5; attempt += 1) await rejects(api.opsLogin({ passphrase: "nope", ...device("founder") }), "INVALID_CREDENTIALS");
  await rejects(api.opsLogin({ passphrase: "ROLEVIA-OPS-PREVIEW", ...device("founder") }), "LOCKED");
  await rejects(api.dashboard({ token: ops.token, deviceId: "device-founder" }), "FORBIDDEN");
});

test("referral codes are validated and reset tokens revoke every session", async () => {
  const { api, latestCode } = await server();
  await rejects(registered(api, ["crm"], { name: "Guest User", email: "guest@example.com", phone: "+919800000099", referralCode: "RV-REF-NOPE" }), "VALIDATION");
  const referred = await registered(api, ["crm"], { name: "Guest User", email: "guest2@example.com", phone: "+919800000099", referralCode: "RV-REF-00001" });
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

test("live classes: scheduling, access window, attendance, live quiz scoring, recordings and role gating", async () => {
  const { api, latestCode, tick } = await server();
  const success = await adminToken(api, latestCode, "success");
  await rejects(api.adminClasses({ token: success, deviceId: "device-admin-laptop" }), "FORBIDDEN");
  const host = await adminToken(api, latestCode, "content");
  const hostAuth = { token: host, deviceId: "device-admin-laptop" };
  await rejects(api.adminUpsertClass({ ...hostAuth, cls: { moduleId: "crm", title: "x", startsAt: null } }), "VALIDATION");
  await rejects(api.adminUpsertClass({ ...hostAuth, cls: { moduleId: "crm", title: "External session", startsAt: Date.UTC(2026, 10, 10, 9), mode: "external", externalUrl: "http://insecure" } }), "VALIDATION");
  const startsAt = Date.UTC(2026, 10, 3, 12);
  const scheduled = await api.adminUpsertClass({ ...hostAuth, cls: { moduleId: "crm", title: "CRM pipeline clinic", description: "Bring your pipeline.", startsAt, durationMinutes: 45, mode: "builtin" } });
  assert.equal(scheduled.status, "scheduled");
  assert.equal(scheduled.hostId, "u-admin-2");
  const list = await api.adminClasses(hostAuth);
  assert.ok(list.hosts.some(item => item.id === "u-admin-2") && !list.hosts.some(item => item.id === "u-admin-3"), "only roles with the classes permission can host");
  assert.equal(list.questionBank.crm.length, 8);
  const tracker = await api.adminTracker(hostAuth);
  assert.ok(tracker.tasks.some(task => task.type === "class" && task.refId === scheduled.id && task.assigneeId === "u-admin-2"));

  const rohit = await signIn(api, "RV-26-0002", "Learn#2026", device("rohit"), latestCode); // crm + spreadsheets + business-ai
  const priya = await signIn(api, "RV-26-0003", "Learn#2026", device("priya"), latestCode); // hr-tracker + spreadsheets
  const rohitAuth = { token: rohit.token, deviceId: "device-rohit" };
  const priyaAuth = { token: priya.token, deviceId: "device-priya" };
  assert.ok((await api.classes(rohitAuth)).some(item => item.id === scheduled.id));
  assert.ok(!(await api.classes(priyaAuth)).some(item => item.id === scheduled.id), "classes are visible only to enrolled learners");
  assert.ok((await api.notifications(rohitAuth)).some(item => item.kind === "class" && item.title.includes("CRM pipeline clinic")));
  await rejects(api.classAccess({ ...rohitAuth, classId: scheduled.id }), "NOT_OPEN");
  await rejects(api.classAccess({ ...priyaAuth, classId: scheduled.id }), "NOT_ENROLLED");
  tick(2 * 60 * 60 * 1000 + 50 * 60 * 1000); // 10 minutes before start
  const waiting = await api.classAccess({ ...rohitAuth, classId: scheduled.id });
  assert.equal(waiting.room.role, "participant");
  assert.equal((await api.classAccess({ ...hostAuth, classId: scheduled.id })).room.role, "host");
  await rejects(api.adminPushQuiz({ ...hostAuth, classId: scheduled.id, questionId: "crm-q1" }), "INVALID_STATE");
  await api.adminSetClassStatus({ ...hostAuth, classId: scheduled.id, status: "live" });
  const joined = await api.joinClass({ ...rohitAuth, classId: scheduled.id });
  assert.equal(joined.class.status, "live");
  await api.joinClass({ ...rohitAuth, classId: scheduled.id });
  assert.equal((await api.adminClassDetail({ ...hostAuth, classId: scheduled.id })).attendance.length, 1, "re-joining does not duplicate attendance");

  await rejects(api.adminPushQuiz({ ...hostAuth, classId: scheduled.id, question: "Poll?", options: ["Only one"], answerIndex: 0 }), "VALIDATION");
  const quiz = await api.adminPushQuiz({ ...hostAuth, classId: scheduled.id, questionId: "crm-q4", seconds: 60 });
  assert.equal(quiz.answerIndex, 3, "the host sees the answer key");
  const asStudent = await api.classQuizStatus({ ...rohitAuth, classId: scheduled.id, quizId: quiz.id });
  assert.equal(asStudent.answerIndex, null, "learners never receive the answer key while open");
  await rejects(api.adminPushQuiz({ ...hostAuth, classId: scheduled.id, questionId: "crm-q5" }), "INVALID_STATE");
  await rejects(api.classQuizAnswer({ ...priyaAuth, classId: scheduled.id, quizId: quiz.id, answerIndex: 3 }), "NOT_ENROLLED");
  await rejects(api.classQuizAnswer({ ...rohitAuth, classId: scheduled.id, quizId: quiz.id, answerIndex: 9 }), "VALIDATION");
  const before = (await api.dashboard(rohitAuth)).points;
  await api.classQuizAnswer({ ...rohitAuth, classId: scheduled.id, quizId: quiz.id, answerIndex: 3 });
  await rejects(api.classQuizAnswer({ ...rohitAuth, classId: scheduled.id, quizId: quiz.id, answerIndex: 1 }), "ALREADY_DONE");
  assert.equal((await api.classQuizStatus({ ...hostAuth, classId: scheduled.id, quizId: quiz.id })).counts[3], 1);
  const closed = await api.adminCloseQuiz({ ...hostAuth, classId: scheduled.id, quizId: quiz.id });
  assert.deepEqual(closed.results, { counts: [0, 0, 0, 1], correct: 1, total: 1 });
  assert.equal((await api.dashboard(rohitAuth)).points, before + 10);
  await api.adminCloseQuiz({ ...hostAuth, classId: scheduled.id, quizId: quiz.id });
  assert.equal((await api.dashboard(rohitAuth)).points, before + 10, "closing twice never awards twice");
  await rejects(api.classQuizAnswer({ ...rohitAuth, classId: scheduled.id, quizId: quiz.id, answerIndex: 3 }), "QUIZ_CLOSED");
  const poll = await api.adminPushQuiz({ ...hostAuth, classId: scheduled.id, question: "Which stage needs the most attention?", options: ["Lead", "Qualified", "Proposal"], answerIndex: 2, seconds: 30 });
  await api.classQuizAnswer({ ...rohitAuth, classId: scheduled.id, quizId: poll.id, answerIndex: 0 });
  tick(31 * 1000);
  await rejects(api.classQuizAnswer({ ...rohitAuth, classId: scheduled.id, quizId: poll.id, answerIndex: 2 }), "QUIZ_CLOSED");

  await rejects(api.adminAddRecording({ ...hostAuth, classId: scheduled.id, url: "http://insecure/video" }), "VALIDATION");
  await api.adminAddRecording({ ...hostAuth, classId: scheduled.id, url: "https://drive.google.com/file/d/abc/view", name: "clinic.webm", size: 120000, durationSeconds: 2700, storage: "drive" });
  const leaderboard = await api.leaderboard({ ...rohitAuth, period: "all" });
  assert.equal(leaderboard.me.live, 10, "live points appear as their own leaderboard column before the open poll closes");
  const ended = await api.adminSetClassStatus({ ...hostAuth, classId: scheduled.id, status: "ended" });
  assert.equal(ended.status, "ended");
  assert.equal((await api.dashboard(rohitAuth)).points, before + 12, "ending the class closes the open poll and awards participation points");
  const detail = await api.adminClassDetail({ ...hostAuth, classId: scheduled.id });
  assert.ok(detail.attendance.every(entry => entry.leftAt), "ending the class closes attendance");
  assert.equal(detail.recordings.length, 1);
  assert.equal(detail.recordingUrl, "https://drive.google.com/file/d/abc/view");
  assert.equal((await api.adminTracker(hostAuth)).tasks.find(task => task.type === "class" && task.refId === scheduled.id).status, "done");
  const mine = (await api.classes(rohitAuth)).find(item => item.id === scheduled.id);
  assert.equal(mine.attended, true);
  assert.equal(mine.myQuizzes, 2);
  assert.equal(mine.myCorrect, 1);
  await rejects(api.classAccess({ ...rohitAuth, classId: scheduled.id }), "NOT_OPEN");
  await rejects(api.adminUpsertClass({ ...hostAuth, cls: { ...scheduled, title: "Renamed after ending" } }), "INVALID_STATE");
  const progress = (await api.adminTracker(hostAuth)).progress.find(row => row.id === "u-student-2");
  assert.equal(progress.classesAttended, 2);
  assert.equal(progress.livePoints, 14);
});

test("empty production seed has no fictional people and needs a strong operations passphrase", async () => {
  await assert.rejects(createMockServer({ storage: memoryStorage(), curriculum, seedMode: "empty", opsPassphrase: "short" }));
  const api = await createMockServer({ storage: memoryStorage(), curriculum, quizBank: QUIZ_BANK, assignmentBriefs: ASSIGNMENT_BRIEFS, seedMode: "empty", opsPassphrase: "a-long-founder-passphrase" });
  assert.equal(api._state().users.length, 1);
  assert.equal(api.previewCredentials(), null);
  assert.equal((await api.publicLeaderboard()).length, 0);
  const ops = await api.opsLogin({ passphrase: "a-long-founder-passphrase", ...device("founder") });
  const created = await api.opsCreateAdmin({ token: ops.token, deviceId: "device-founder", name: "First Admin", email: "first@rolevia.example", phone: "+910000000099", role: "lead" });
  assert.equal(created.adminId, "RV-ADM-001");
});
