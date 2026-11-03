import { createHttpApi } from "./http-api.js";
import { consumeDriveRedirect } from "./classroom/drive.js";
import { createRouter } from "./router.js";
import { ctx, loadDevice, loadAuth, setAuth, withSession } from "./context.js";
import { h } from "./ui.js";
import { previewDrawer, sessionLostOverlay } from "./pages/components.js";
import { homePage, skillsPage, skillDetailPage, pricingPage, demoPage, publicLeaderboardPage, faqPage, badgePage, notFoundPage } from "./pages/public.js";
import { registerPage, loginPage, resetPage, adminLoginPage, opsLoginPage } from "./pages/auth.js";
import { guard, dashboardPage, mySkillsPage, labsPage, labPage, quizPage, assignmentsPage, leaderboardPage, addonsPage, profilePage, notificationsPage } from "./pages/portal.js";
import { learnPage, slidesPage, interviewPrepPage } from "./pages/learn.js";
import { adminDecksPage, adminDeckEditorPage } from "./pages/decks.js";
import { adminGuard, adminOverviewPage, adminStudentsPage, adminContentPage, adminGradingPage, adminAlertsPage, adminPaymentsPage, adminAnnouncePage, adminAuditPage, adminTrackerPage, adminAccountPage } from "./pages/admin.js";
import { opsGuard, opsPage } from "./pages/ops.js";
import { studentClassesPage, adminClassesPage, adminClassDetailPage } from "./pages/classes.js";
import { classroomGuard, classroomPage } from "./pages/classroom.js";

const outlet = document.getElementById("app");
const splash = document.getElementById("splash");
const guarded = (check, render) => async (params, query, path) => check() ?? render(params, query, path);

const STORAGE_KEY = "rolevia.preview.v7";

async function boot() {
  consumeDriveRedirect();
  loadDevice();
  loadAuth();
  const params = new URLSearchParams(location.search);
  const [curriculumResponse, configResponse] = await Promise.all([fetch("data/curriculum.json", { cache: "no-store" }), fetch("config.json", { cache: "no-store" }).catch(() => null)]);
  ctx.curriculum = await curriculumResponse.json();
  ctx.config = { ...ctx.config, ...(configResponse?.ok ? await configResponse.json().catch(() => ({})) : {}) };
  // Backend overrides are a developer convenience only: on a public origin a crafted link could otherwise
  // point sign-in requests at an attacker's server.
  const localDev = ["localhost", "127.0.0.1", "[::1]"].includes(location.hostname);
  if (localDev && params.get("api")) ctx.config.apiBase = params.get("api");
  if (localDev && params.get("signal")) ctx.config.signalUrl = params.get("signal");
  const testMode = params.has("fast");
  ctx.testMode = testMode;
  if (ctx.config.apiBase) { ctx.mode = "live"; ctx.api = createHttpApi(ctx.config.apiBase); document.body.dataset.mode = "live"; }
  else {
    // Preview only: the in-browser backend and the quiz answer keys are never downloaded in live mode.
    const [{ createMockServer, browserStorage }, { QUIZ_BANK }, { ASSIGNMENT_BRIEFS }, { COURSE_CONTENT, INTERVIEW_GENERAL }] = await Promise.all([import("./store.js"), import("./content/quiz-bank.js"), import("./content/assignments.js"), import("./content/modules/index.js")]);
    ctx.api = await createMockServer({ storage: browserStorage(STORAGE_KEY, localStorage), curriculum: ctx.curriculum, quizBank: QUIZ_BANK, assignmentBriefs: ASSIGNMENT_BRIEFS, courseContent: COURSE_CONTENT, interviewBank: INTERVIEW_GENERAL, latency: () => (testMode ? 0 : 220 + Math.random() * 320) });
  }

  const router = createRouter([
    { path: "/", render: homePage },
    { path: "/skills", render: skillsPage },
    { path: "/skills/:id", render: skillDetailPage },
    { path: "/pricing", render: pricingPage },
    { path: "/demo", render: demoPage },
    { path: "/leaderboard", render: publicLeaderboardPage },
    { path: "/faq", render: faqPage },
    { path: "/badge/:code", render: badgePage },
    { path: "/register", render: registerPage },
    { path: "/login", render: (params, query) => (ctx.auth.type === "student" ? "/portal" : loginPage(params, query)) },
    { path: "/reset", render: resetPage },
    { path: "/portal", render: guarded(guard, dashboardPage) },
    { path: "/portal/skills", render: guarded(guard, mySkillsPage) },
    { path: "/portal/learn/:moduleId", render: guarded(guard, learnPage) },
    { path: "/portal/slides/:deckId", render: guarded(guard, slidesPage) },
    { path: "/portal/interview", render: guarded(guard, interviewPrepPage) },
    { path: "/portal/labs", render: guarded(guard, labsPage) },
    { path: "/portal/labs/:id", render: guarded(guard, labPage) },
    { path: "/portal/quiz", render: guarded(guard, quizPage) },
    { path: "/portal/assignments", render: guarded(guard, assignmentsPage) },
    { path: "/portal/leaderboard", render: guarded(guard, leaderboardPage) },
    { path: "/portal/addons", render: guarded(guard, addonsPage) },
    { path: "/portal/profile", render: guarded(guard, profilePage) },
    { path: "/portal/notifications", render: guarded(guard, notificationsPage) },
    { path: "/portal/classes", render: guarded(guard, studentClassesPage) },
    { path: "/classroom/:id", render: guarded(classroomGuard, classroomPage) },
    { path: "/admin/login", render: (params, query) => (ctx.auth.type === "admin" ? "/admin" : adminLoginPage(params, query)) },
    { path: "/admin", render: guarded(adminGuard, adminOverviewPage) },
    { path: "/admin/students", render: guarded(adminGuard, adminStudentsPage) },
    { path: "/admin/content", render: guarded(adminGuard, adminContentPage) },
    { path: "/admin/grading", render: guarded(adminGuard, adminGradingPage) },
    { path: "/admin/alerts", render: guarded(adminGuard, adminAlertsPage) },
    { path: "/admin/payments", render: guarded(adminGuard, adminPaymentsPage) },
    { path: "/admin/announce", render: guarded(adminGuard, adminAnnouncePage) },
    { path: "/admin/audit", render: guarded(adminGuard, adminAuditPage) },
    { path: "/admin/tracker", render: guarded(adminGuard, adminTrackerPage) },
    { path: "/admin/account", render: guarded(adminGuard, adminAccountPage) },
    { path: "/admin/classes", render: guarded(adminGuard, adminClassesPage) },
    { path: "/admin/classes/:id", render: guarded(adminGuard, adminClassDetailPage) },
    { path: "/admin/decks", render: guarded(adminGuard, adminDecksPage) },
    { path: "/admin/decks/:id", render: guarded(adminGuard, adminDeckEditorPage) },
    { path: "/ops/login", render: (params, query) => (ctx.auth.type === "ops" ? "/ops" : opsLoginPage(params, query)) },
    { path: "/ops", render: guarded(opsGuard, opsPage) },
    { path: "*", render: notFoundPage },
  ], { outlet, onNavigate: ({ path }) => { document.title = `${titleFor(path)} · Rolevia`; document.body.dataset.area = path.startsWith("/classroom") ? "classroom" : path.startsWith("/portal") ? "portal" : path.startsWith("/admin") ? "admin" : path.startsWith("/ops") ? "ops" : "public"; } });
  ctx.navigate = router.navigate;

  if (ctx.mode === "preview") document.body.append(previewDrawer());
  let overlayShown = false;
  const sessionLost = (error) => { setAuth({}); if (overlayShown) return; overlayShown = true; document.body.append(sessionLostOverlay(error?.extra?.reason ?? error?.code, () => { overlayShown = false; })); };
  window.addEventListener("storage", (event) => { if (event.key === `${STORAGE_KEY}:rev`) ctx.api.reloadFromStorage(); });
  document.addEventListener("rolevia:session-lost", (event) => sessionLost(event.detail));
  const checkSession = async () => {
    if (!ctx.auth.token || ctx.auth.type === "ops") return;
    try { const me = await ctx.api.me(withSession()); if (me.user) ctx.auth.user = me.user; }
    catch (error) { if (["SESSION_REVOKED", "SESSION_EXPIRED", "DEVICE_MISMATCH", "AUTH_REQUIRED"].includes(error.code)) sessionLost(error); }
  };
  document.addEventListener("rolevia:check-session", checkSession);
  setInterval(checkSession, testMode ? 1500 : 15000);
  document.addEventListener("visibilitychange", () => { if (!document.hidden) checkSession(); });

  await router.render();
  splash.classList.add("done");
  setTimeout(() => splash.remove(), 600);
}

function titleFor(path) {
  if (path === "/") return "Business Skills Studio";
  const [, first, second] = path.split("/");
  const names = { skills: "Skills", pricing: "Pricing", demo: "Free demo", leaderboard: "Leaderboard", faq: "Before you enroll", register: "Register", login: "Sign in", reset: "Reset password", portal: second ? `Portal · ${second}` : "Student portal", admin: second ? `Admin · ${second}` : "Admin console", ops: "Operations", badge: "Badge", classroom: "Live class" };
  return names[first] ?? "Rolevia";
}

boot().catch(error => {
  console.error(error);
  splash?.remove();
  outlet.replaceChildren(h("div", { class: "container section narrow center" }, h("h1", {}, "Something went wrong while loading."), h("p", { class: "muted" }, error.message), h("button", { class: "button primary", type: "button", onClick: () => location.reload() }, "Reload")));
});
