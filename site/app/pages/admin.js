import { h, icon, money, skeleton, toast, busy, field, formData, formatTime, relative, modal } from "../ui.js";
import { ctx, setAuth, withSession } from "../context.js";
import { brand, errorBox, empty, previewBanner, copyButton } from "./components.js";
import { signOut } from "./portal.js";

const NAV = [["#/admin", "Overview", "grid", "overview"], ["#/admin/students", "Students & verification", "user", "students"], ["#/admin/content", "Lessons & assignments", "book", "content"], ["#/admin/grading", "Grading queue", "clipboard", "grading"], ["#/admin/alerts", "Device alerts", "shield", "alerts"], ["#/admin/payments", "Payments", "wallet", "payments"], ["#/admin/announce", "Announcements", "bell", "announce"], ["#/admin/audit", "Audit log", "eye", "audit"]];

export const adminGuard = () => ctx.auth.token && ctx.auth.type === "admin" ? null : "/admin/login";

function shell(content, { active, title }) {
  const page = h("div", { class: "portal admin" }, previewBanner(), h("div", { class: "portal-frame" },
    h("aside", { class: "portal-side" }, brand(30), h("span", { class: "side-tag" }, "Admin console"), h("nav", { class: "portal-nav", "aria-label": "Admin" }, NAV.map(([href, label, iconName, key]) => h("a", { href, class: key === active ? "active" : "" }, icon(iconName, 18), label))), h("div", { class: "portal-side-foot" }, h("button", { class: "button ghost small block", type: "button", onClick: signOut }, icon("logout", 14), "Sign out"))),
    h("div", { class: "portal-body" }, h("header", { class: "portal-top" }, h("button", { class: "icon-button portal-toggle", type: "button", "aria-label": "Toggle navigation", onClick: () => page.classList.toggle("nav-open") }, icon("menu")), h("h1", {}, title), h("span", { class: "tag" }, ctx.auth.user?.name ?? "Admin")), h("main", { id: "main", class: "portal-main" }, content))));
  return page;
}

async function load(render) {
  const host = h("div", {}, skeleton(5, "page-skeleton"));
  Promise.resolve().then(render).then(node => host.replaceChildren(node)).catch(error => { if (["SESSION_REVOKED", "AUTH_REQUIRED", "SESSION_EXPIRED", "DEVICE_MISMATCH", "FORBIDDEN"].includes(error.code)) { setAuth({}); location.hash = "#/admin/login"; return; } host.replaceChildren(errorBox(error)); });
  return host;
}
const moduleTitle = (id) => ctx.curriculum.modules.find(module => module.id === id)?.title ?? id;
const statusTag = (status) => h("span", { class: `tag ${status === "active" ? "good" : status === "pending_verification" ? "pending" : status === "suspended" || status === "rejected" ? "bad" : ""}` }, status.replace("_", " "));

export async function adminOverviewPage() {
  const content = await load(async () => {
    const data = await ctx.api.adminOverview(withSession());
    return h("div", { class: "stack" },
      h("div", { class: "stat-grid" }, [[data.pendingVerification, "awaiting verification", "#/admin/students"], [data.pendingPayment, "registered, unpaid", "#/admin/students"], [data.active, "active students", "#/admin/students"], [data.ungraded, "ungraded submissions", "#/admin/grading"], [data.openAlerts, "open device alerts", "#/admin/alerts"]].map(([value, label, href]) => h("a", { class: "stat-card", href }, h("strong", { class: "stat-value" }, value), h("span", { class: "stat-label" }, label)))),
      h("div", { class: "grid-2" }, h("div", { class: "card" }, h("h3", {}, "Preview revenue (succeeded payments)"), data.revenue.map(row => h("div", { class: "order-line" }, h("span", {}, row.currency), h("strong", {}, money(row.amount, row.currency)))), h("p", { class: "tiny muted" }, "Fictional preview payments. Production figures come from the payment provider's settled records.")), h("div", { class: "card" }, h("h3", {}, "Recent activity"), h("ul", { class: "history" }, data.recentAudit.map(item => h("li", {}, h("span", { class: "tiny muted" }, formatTime(item.at)), ` · ${item.action} `, h("span", { class: "tiny muted" }, item.actor)))))));
  });
  return shell(content, { active: "overview", title: "Overview" });
}

export async function adminStudentsPage() {
  const content = await load(async () => {
    const host = h("div", { class: "stack" });
    const render = async () => {
      const students = await ctx.api.adminStudents(withSession());
      const pending = students.filter(student => student.status === "pending_verification");
      host.replaceChildren(
        h("div", { class: "card" }, h("h3", {}, icon("shield", 18), `Verification queue (${pending.length})`), pending.length ? pending.map(student => h("div", { class: "queue-row" }, h("div", { class: "grow" }, h("strong", {}, student.name), h("p", { class: "small muted" }, `${student.email} · ${student.phone} · ${student.city || "city not given"}`), h("p", { class: "small" }, student.moduleTitles.join(", ")), h("p", { class: "tiny muted" }, `Paid ${student.payments.filter(payment => payment.status === "succeeded").map(payment => `${payment.currency} ${payment.subtotal} (${payment.id})`).join(", ") || "no succeeded payment"} · registered ${relative(student.createdAt)}`)), h("div", { class: "stack-actions" }, h("button", { class: "button primary small", type: "button", onClick: async (event) => { busy(event.currentTarget, true, "Issuing"); try { const result = await ctx.api.adminVerify(withSession({ userId: student.id })); document.dispatchEvent(new CustomEvent("rolevia:inbox-refresh")); modal({ title: "Credentials issued", body: h("div", {}, h("p", {}, `Student ID ${result.studentId} and a temporary password were sent by email and SMS (preview inbox).`), h("p", { class: "tiny muted" }, `Preview only: temporary password ${result.previewTemporaryPassword}. Production never displays passwords to staff.`)), actions: [{ label: "Done" }] }); render(); } catch (error) { toast(error.message, "error"); busy(event.currentTarget, false); } } }, icon("check", 14), "Verify and issue ID"), h("button", { class: "button ghost small", type: "button", onClick: () => modal({ title: "Reject registration?", body: h("p", {}, "The student receives an email asking them to reply for help."), actions: [{ label: "Reject", variant: "danger", onClick: async () => { await ctx.api.adminSetStatus(withSession({ userId: student.id, status: "rejected", reason: "Payment or details could not be verified." })); render(); } }] }) }, "Reject")))) : h("p", { class: "muted small" }, "Nothing waiting. New paid registrations appear here.")),
        h("div", { class: "card" }, h("h3", {}, `All students (${students.length})`), h("div", { class: "table-wrap" }, h("table", { class: "data-table" }, h("thead", {}, h("tr", {}, ["Student", "ID", "Modules", "Status", "Devices", "Points", ""].map(label => h("th", {}, label)))), h("tbody", {}, students.map(student => h("tr", {}, h("td", {}, h("strong", {}, student.name), h("br"), h("span", { class: "tiny muted" }, student.email)), h("td", {}, student.studentId ?? "—"), h("td", {}, student.moduleTitles.length), h("td", {}, statusTag(student.status)), h("td", {}, `${student.deviceSwitches} switch${student.deviceSwitches === 1 ? "" : "es"}`), h("td", {}, student.points), h("td", {}, student.status === "active" ? h("button", { class: "mini", type: "button", onClick: async () => { await ctx.api.adminSetStatus(withSession({ userId: student.id, status: "suspended", reason: "Admin action" })); toast("Suspended.", "info"); render(); } }, "Suspend") : student.status === "suspended" ? h("button", { class: "mini", type: "button", onClick: async () => { await ctx.api.adminSetStatus(withSession({ userId: student.id, status: "active" })); toast("Reactivated.", "success"); render(); } }, "Reactivate") : null))))))));
    };
    await render();
    return host;
  });
  return shell(content, { active: "students", title: "Students & verification" });
}

export async function adminContentPage(_, query) {
  const content = await load(async () => {
    let moduleId = ctx.curriculum.modules.some(module => module.id === query.module) ? query.module : ctx.curriculum.modules[0].id;
    const host = h("div", { class: "stack" });
    const render = async () => {
      const data = await ctx.api.adminContent(withSession());
      const lessons = data.lessons[moduleId] ?? [];
      const assignments = data.assignments.filter(item => item.moduleId === moduleId);
      const lessonForm = (lesson = {}) => { const form = h("form", { class: "form-grid two", novalidate: true, onSubmit: async (event) => { event.preventDefault(); const values = formData(form); const button = form.querySelector("button[type=submit]"); busy(button, true, "Saving"); try { await ctx.api.adminUpsertLesson(withSession({ moduleId, lesson: { ...lesson, ...values } })); toast("Lesson saved.", "success"); render(); } catch (error) { toast(error.message, "error"); busy(button, false); } } }, field({ label: "Title", name: "title", value: lesson.title ?? "", required: true }), field({ label: "Type", name: "type", type: "select", value: lesson.type ?? "video", options: [{ value: "video", label: "Video" }, { value: "reading", label: "Reading" }, { value: "task", label: "Task" }] }), field({ label: "Minutes", name: "minutes", type: "number", value: lesson.minutes ?? 30, min: 1, max: 240 }), field({ label: "Order", name: "order", type: "number", value: lesson.order ?? lessons.length + 1, min: 1 }), field({ label: "Content link (https, e.g. private video or document)", name: "url", type: "url", value: lesson.url ?? "", placeholder: "https://" }), field({ label: "What the learner creates", name: "output", value: lesson.output ?? "" }), field({ label: "Summary", name: "summary", type: "textarea", value: lesson.summary ?? "", rows: 2 }), h("div", { class: "form-actions" }, h("button", { class: "button primary small", type: "submit" }, lesson.id ? "Save changes" : "Add lesson"))); return form; };
      const assignmentForm = (assignment = {}) => { const form = h("form", { class: "form-grid two", novalidate: true, onSubmit: async (event) => { event.preventDefault(); const values = formData(form); const button = form.querySelector("button[type=submit]"); busy(button, true, "Saving"); try { await ctx.api.adminUpsertAssignment(withSession({ assignment: { ...assignment, ...values, moduleId, acceptance: String(values.acceptance).split("\n").map(line => line.trim()).filter(Boolean), dueAt: values.dueAt ? new Date(values.dueAt).getTime() : assignment.dueAt } })); toast("Assignment saved.", "success"); render(); } catch (error) { toast(error.message, "error"); busy(button, false); } } }, field({ label: "Title", name: "title", value: assignment.title ?? "", required: true }), field({ label: "Max score", name: "maxScore", type: "number", value: assignment.maxScore ?? 100, min: 10, max: 100 }), field({ label: "Due date", name: "dueAt", type: "date", value: assignment.dueAt ? new Date(assignment.dueAt).toISOString().slice(0, 10) : "" }), field({ label: "Brief", name: "brief", type: "textarea", value: assignment.brief ?? "", rows: 3 }), field({ label: "Acceptance criteria (one per line)", name: "acceptance", type: "textarea", value: (assignment.acceptance ?? []).join("\n"), rows: 3 }), h("div", { class: "form-actions" }, h("button", { class: "button primary small", type: "submit" }, assignment.id ? "Save changes" : "Add assignment"))); return form; };
      host.replaceChildren(
        h("div", { class: "chip-row" }, ctx.curriculum.modules.map(module => h("button", { type: "button", class: `chip ${module.id === moduleId ? "on" : ""}`, onClick: () => { moduleId = module.id; render(); } }, module.title))),
        h("div", { class: "card" }, h("div", { class: "card-head" }, h("h3", {}, icon("book", 18), `Lessons · ${moduleTitle(moduleId)}`), h("span", { class: "tag" }, `${lessons.length} lesson${lessons.length === 1 ? "" : "s"}`)), h("p", { class: "tiny muted" }, "Upload recordings to private storage (or an unlisted video host) and paste the https link here. Preview stores links only."), lessons.map(lesson => h("details", { class: "edit-row" }, h("summary", {}, h("span", { class: "code" }, lesson.order), h("strong", {}, lesson.title), h("span", { class: "tiny muted" }, ` · ${lesson.type} · ${lesson.minutes} min${lesson.url ? " · link added" : " · no link yet"}`)), lessonForm(lesson), h("button", { class: "link-button danger", type: "button", onClick: () => modal({ title: "Delete lesson?", body: h("p", {}, lesson.title), actions: [{ label: "Delete", variant: "danger", onClick: async () => { await ctx.api.adminDeleteLesson(withSession({ moduleId, lessonId: lesson.id })); render(); } }] }) }, "Delete lesson"))), h("details", { class: "edit-row new" }, h("summary", {}, icon("upload", 14), "Add a lesson"), lessonForm())),
        h("div", { class: "card" }, h("div", { class: "card-head" }, h("h3", {}, icon("clipboard", 18), "Assignments"), h("span", { class: "tag" }, assignments.length)), assignments.map(assignment => h("details", { class: "edit-row" }, h("summary", {}, h("strong", {}, assignment.title), h("span", { class: "tiny muted" }, ` · ${assignment.maxScore} points`)), assignmentForm(assignment))), h("details", { class: "edit-row new" }, h("summary", {}, icon("upload", 14), "Add an assignment"), assignmentForm())));
    };
    await render();
    return host;
  });
  return shell(content, { active: "content", title: "Lessons & assignments" });
}

export async function adminGradingPage() {
  const content = await load(async () => {
    const host = h("div", { class: "stack" });
    const render = async () => {
      const submissions = await ctx.api.adminSubmissions(withSession());
      host.replaceChildren(submissions.length ? h("div", { class: "stack" }, submissions.map(submission => { const form = h("form", { class: "grade-form", novalidate: true, onSubmit: async (event) => { event.preventDefault(); const values = formData(form); const button = form.querySelector("button[type=submit]"); busy(button, true, "Saving"); try { await ctx.api.adminGrade(withSession({ submissionId: submission.id, score: values.score, feedback: values.feedback })); toast("Graded. Points added to the leaderboard.", "success"); render(); } catch (error) { toast(error.message, "error"); busy(button, false); } } }, field({ label: `Score / ${submission.assignment?.maxScore ?? 100}`, name: "score", type: "number", value: submission.score ?? "", min: 0, max: submission.assignment?.maxScore ?? 100, required: true }), field({ label: "Feedback", name: "feedback", type: "textarea", value: submission.feedback ?? "", rows: 2 }), h("div", { class: "form-actions" }, h("button", { class: "button primary small", type: "submit" }, submission.gradedAt ? "Update grade" : "Save grade"))); return h("div", { class: `card ${submission.gradedAt ? "graded" : ""}` }, h("div", { class: "card-head" }, h("div", {}, h("p", { class: "eyebrow" }, submission.assignment ? moduleTitle(submission.assignment.moduleId) : "Assignment"), h("strong", {}, `${submission.student} · ${submission.assignment?.title ?? "deleted assignment"}`)), h("span", { class: `tag ${submission.gradedAt ? "good" : "pending"}` }, submission.gradedAt ? `Graded ${submission.score}` : "Ungraded")), h("p", { class: "small" }, submission.text), submission.link ? h("a", { class: "link-button small", href: submission.link, target: "_blank", rel: "noopener noreferrer" }, submission.link) : null, submission.fileName ? h("p", { class: "tiny muted" }, `File: ${submission.fileName}`) : null, h("p", { class: "tiny muted" }, `Submitted ${formatTime(submission.submittedAt)}`), form); })) : empty("No submissions yet."));
    };
    await render();
    return host;
  });
  return shell(content, { active: "grading", title: "Grading queue" });
}

export async function adminAlertsPage() {
  const content = await load(async () => {
    const host = h("div", {});
    const render = async () => {
      const alerts = await ctx.api.adminDeviceAlerts(withSession());
      host.replaceChildren(h("p", { class: "muted small" }, "A security alert opens each time a student reaches the device-switch threshold. Review, contact the student if needed, then resolve."), alerts.length ? h("div", { class: "stack" }, alerts.map(alert => h("div", { class: `card ${alert.status === "open" ? "warn-card" : ""}` }, h("div", { class: "card-head" }, h("div", {}, h("strong", {}, alert.student.name), h("span", { class: "small muted" }, ` · ${alert.student.studentId} · ${alert.count} device switches`)), alert.status === "open" ? h("button", { class: "button ghost small", type: "button", onClick: async () => { await ctx.api.adminResolveAlert(withSession({ alertId: alert.id })); toast("Alert resolved.", "success"); render(); } }, "Resolve") : h("span", { class: "tag good" }, "Resolved")), h("p", { class: "tiny muted" }, formatTime(alert.at)), h("ul", { class: "history" }, alert.student.deviceHistory.slice(0, 5).map(item => h("li", {}, `${formatTime(item.at)} · ${item.from} → ${item.to}`)))))) : empty("No device alerts."));
    };
    await render();
    return host;
  });
  return shell(content, { active: "alerts", title: "Device alerts" });
}

export async function adminPaymentsPage() {
  const content = await load(async () => {
    const payments = await ctx.api.adminPayments(withSession());
    return h("div", { class: "card" }, h("div", { class: "table-wrap" }, h("table", { class: "data-table" }, h("thead", {}, h("tr", {}, ["Payment", "Student", "Items", "Amount", "Status", "When"].map(label => h("th", {}, label)))), h("tbody", {}, payments.map(payment => h("tr", {}, h("td", {}, payment.id), h("td", {}, payment.student), h("td", {}, payment.items.map(item => item.title).join(", ")), h("td", {}, money(payment.subtotal, payment.currency)), h("td", {}, h("span", { class: `tag ${payment.status === "succeeded" ? "good" : "bad"}` }, payment.status)), h("td", {}, formatTime(payment.at))))))), h("p", { class: "tiny muted" }, "Preview payments are simulated. Production records come from payment-provider webhooks and are reconciled before verification."));
  });
  return shell(content, { active: "payments", title: "Payments" });
}

export async function adminAnnouncePage() {
  const content = await load(async () => {
    const host = h("div", { class: "stack" });
    const render = async () => {
      const data = await ctx.api.adminContent(withSession());
      const form = h("form", { class: "form-grid", novalidate: true, onSubmit: async (event) => { event.preventDefault(); const values = formData(form); const button = form.querySelector("button[type=submit]"); busy(button, true, "Publishing"); try { await ctx.api.adminAnnounce(withSession(values)); toast("Announcement published to all active students.", "success"); render(); } catch (error) { toast(error.message, "error"); busy(button, false); } } }, field({ label: "Title", name: "title", required: true }), field({ label: "Message", name: "body", type: "textarea", rows: 3 }), h("div", { class: "form-actions" }, h("button", { class: "button primary", type: "submit" }, icon("bell", 16), "Publish")));
      host.replaceChildren(h("div", { class: "card" }, h("h3", {}, "New announcement"), form), h("div", { class: "card" }, h("h3", {}, "Published"), data.announcements.map(item => h("div", { class: "announce" }, h("strong", {}, item.title), h("p", { class: "small muted" }, item.body), h("span", { class: "tiny muted" }, formatTime(item.at))))));
    };
    await render();
    return host;
  });
  return shell(content, { active: "announce", title: "Announcements" });
}

export async function adminAuditPage() {
  const content = await load(async () => {
    const log = await ctx.api.adminAudit(withSession());
    return h("div", { class: "card" }, h("div", { class: "card-head" }, h("h3", {}, "Last 100 events"), copyButton(JSON.stringify(log, null, 2), "Copy JSON")), h("ul", { class: "history" }, log.map(item => h("li", {}, h("span", { class: "tiny muted" }, formatTime(item.at)), ` · ${item.action} · `, h("span", { class: "tiny muted" }, `${item.actor} ${JSON.stringify(item.meta)}`)))));
  });
  return shell(content, { active: "audit", title: "Audit log" });
}
