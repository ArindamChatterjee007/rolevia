import { h, icon, money, avatar, ring, skeleton, toast, busy, field, formData, confetti, formatDate, formatTime, relative, downscaleImage, modal, readFileRecord, formatBytes, showFieldErrors } from "../ui.js";
import { ctx, setAuth, withSession } from "../context.js";
import { brand, errorBox, empty, previewBanner, copyButton, linkedinShareUrl, linkedinCertificationUrl } from "./components.js";
import { LABS } from "./labs.js";
import { illustration } from "./deck.js";

const NAV = [["#/portal", "Dashboard", "grid", "dashboard"], ["#/portal/skills", "My skills", "book", "skills"], ["#/portal/classes", "Live classes", "play", "classes"], ["#/portal/labs", "Labs", "lab", "labs"], ["#/portal/quiz", "Daily quiz", "quiz", "quiz"], ["#/portal/assignments", "Assignments", "clipboard", "assignments"], ["#/portal/interview", "Interview prep", "spark", "interview"], ["#/portal/leaderboard", "Leaderboard", "trophy", "leaderboard"], ["#/portal/addons", "Add-ons & kit", "wallet", "addons"], ["#/portal/profile", "Profile & security", "user", "profile"]];

export function portalShell(content, { active, title, user }) {
  const sidebar = h("aside", { class: "portal-side" }, brand(30), h("nav", { class: "portal-nav", "aria-label": "Portal" }, NAV.map(([href, label, iconName, key]) => h("a", { href, class: key === active ? "active" : "" }, icon(iconName, 18), label))), h("div", { class: "portal-side-foot" }, h("div", { class: "device-pill" }, icon("device", 14), ctx.device.label), h("button", { class: "button ghost small block", type: "button", onClick: signOut }, icon("logout", 14), "Sign out")));
  const header = h("header", { class: "portal-top" }, h("button", { class: "icon-button portal-toggle", type: "button", "aria-label": "Toggle navigation", onClick: () => page.classList.toggle("nav-open") }, icon("menu")), h("h1", {}, title), h("div", { class: "portal-top-actions" }, h("a", { class: "icon-button", href: "#/portal/notifications", "aria-label": "Notifications" }, icon("bell")), h("a", { href: "#/portal/profile", class: "avatar-link", "aria-label": "Profile" }, avatar(user, 36))));
  const page = h("div", { class: "portal" }, previewBanner(), h("div", { class: "portal-frame" }, sidebar, h("div", { class: "portal-body" }, header, h("main", { id: "main", class: "portal-main" }, content))));
  return page;
}

export async function signOut() {
  try { await ctx.api.logout({ token: ctx.auth.token }); } catch { /* already gone */ }
  setAuth({});
  toast("Signed out.", "success");
  location.hash = "#/";
}

export async function load(render) {
  const host = h("div", {}, skeleton(5, "page-skeleton"));
  Promise.resolve().then(render).then(node => host.replaceChildren(node)).catch(error => { if (error.code === "PASSWORD_CHANGE_REQUIRED") { if (!location.hash.startsWith("#/portal/profile")) location.hash = "#/portal/profile?first=1"; return; } if (error.code === "SESSION_REVOKED" || error.code === "AUTH_REQUIRED" || error.code === "SESSION_EXPIRED" || error.code === "DEVICE_MISMATCH") { document.dispatchEvent(new CustomEvent("rolevia:session-lost", { detail: error })); return; } host.replaceChildren(errorBox(error)); });
  return host;
}

export const guard = () => ctx.auth.token && ctx.auth.type === "student" ? null : `/login?next=${encodeURIComponent(location.hash.replace(/^#/, "") || "/portal")}`;
export const user = () => ctx.auth.user;
export const moduleById = (id) => ctx.curriculum.modules.find(module => module.id === id);

export async function dashboardPage() {
  const content = await load(async () => {
    const data = await ctx.api.dashboard(withSession());
    setAuth({ ...ctx.auth, user: data.user });
    const first = data.user.name.split(" ")[0];
    return h("div", { class: "dash" },
      h("section", { class: "dash-hero" }, h("div", {}, h("p", { class: "eyebrow" }, `${new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}`), h("h2", {}, `Good to see you, ${first}.`), h("p", { class: "muted" }, data.modules.length ? "Pick up where you left off, or try today's quiz for points." : "Add your first skill module to start learning.")), h("div", { class: "dash-stats" }, h("div", { class: "stat" }, h("strong", {}, data.points), h("span", {}, "points")), h("div", { class: "stat" }, h("strong", {}, data.rank ? `#${data.rank}` : "—"), h("span", {}, "rank")), h("div", { class: "stat" }, h("strong", {}, data.streak), h("span", {}, "day streak")), h("div", { class: "stat" }, h("strong", {}, `${data.kit.count}/${data.kit.required}`), h("span", {}, "career kit")))),
      h("section", { class: "grid-2" },
        h("div", { class: "card" }, h("div", { class: "card-head" }, h("h3", {}, "Your skill modules"), h("a", { class: "link-button", href: "#/portal/addons" }, "Add a module")), data.modules.length ? h("div", { class: "module-list" }, data.modules.map(module => h("a", { class: "module-row", href: `#/portal/learn/${module.id}` }, ring(module.lessons ? module.done / module.lessons : 0, { size: 56, stroke: 6, label: "lessons complete" }), h("div", { class: "grow" }, h("strong", {}, module.title), h("small", { class: "muted" }, `${module.tool} · ${module.done}/${module.lessons} lessons · lab ${module.labScore === null ? "not started" : `${module.labScore}/100`}`)), h("span", { class: `tag ${module.quizToday ? "good" : ""}` }, module.quizToday ? "Quiz done" : "Quiz today")))) : empty("No modules yet.", h("a", { class: "button primary", href: "#/portal/addons" }, "Browse skills"))),
        h("div", { class: "stack" },
          h("div", { class: `card kit-card ${data.kit.unlocked ? "unlocked" : ""}` }, h("h3", {}, icon("star", 18), data.kit.unlocked ? "Career kit unlocked" : "Career kit"), h("div", { class: "kit-progress-bar" }, h("div", { style: { width: `${Math.min(100, (data.kit.count / data.kit.required) * 100)}%` } })), h("p", { class: "small muted" }, data.kit.unlocked ? "Interview Ready, a resume review and a done-for-you resume are included. Schedule them from Add-ons & kit." : `${data.kit.required - data.kit.count} more distinct module${data.kit.required - data.kit.count === 1 ? "" : "s"} unlock Interview Ready and resume support at no extra charge.`)),
          h("div", { class: "card" }, h("h3", {}, icon("shield", 18), "Device security"), h("p", { class: "small" }, `Signed in on ${ctx.device.label}. One active device at a time.`), h("div", { class: "device-meter" }, Array.from({ length: data.devices.threshold }, (_, index) => h("span", { class: index < data.devices.switches % data.devices.threshold || (data.devices.switches > 0 && data.devices.switches % data.devices.threshold === 0 && index < data.devices.threshold) ? "on" : "" }))), h("p", { class: "tiny muted" }, `${data.devices.switches} device switch${data.devices.switches === 1 ? "" : "es"} recorded. A security notice is sent every ${data.devices.threshold}.`), data.devices.history.length ? h("ul", { class: "history" }, data.devices.history.slice(0, 3).map(item => h("li", {}, `${relative(item.at)} · ${item.from} → ${item.to}`))) : null))),
      h("section", { class: "grid-2" },
        h("div", { class: "card" }, h("h3", {}, "Announcements"), data.announcements.map(item => h("div", { class: "announce" }, h("strong", {}, item.title), h("p", { class: "small muted" }, item.body), h("span", { class: "tiny muted" }, formatDate(item.at))))),
        h("div", { class: "card" }, h("div", { class: "card-head" }, h("h3", {}, "Recent notifications"), h("a", { class: "link-button", href: "#/portal/notifications" }, "All")), data.notifications.length ? data.notifications.map(item => h("div", { class: `notice ${item.read ? "" : "unread"}` }, h("strong", {}, item.title), h("p", { class: "small muted" }, item.body), h("span", { class: "tiny muted" }, relative(item.at)))) : h("p", { class: "muted small" }, "Nothing new."))));
  });
  return portalShell(content, { active: "dashboard", title: "Dashboard", user: user() });
}

export async function mySkillsPage() {
  const content = await load(async () => {
    const data = await ctx.api.dashboard(withSession());
    return h("div", { class: "cards-grid" }, data.modules.map(module => { const meta = moduleById(module.id); return h("a", { class: `card skill-tile accent-${meta.accent}`, href: `#/portal/learn/${module.id}` }, illustration(module.id, { class: "tile-art" }), h("span", { class: "code" }, meta.code), h("h3", {}, meta.title), h("p", { class: "muted small" }, meta.label), ring(module.lessons ? module.done / module.lessons : 0, { size: 64, stroke: 6, label: "complete" }), h("span", { class: "tiny muted" }, `${module.done}/${module.lessons} lessons`)); }), h("a", { class: "card add-tile", href: "#/portal/addons" }, icon("spark", 28), h("strong", {}, "Add a skill module"), h("span", { class: "small muted" }, "Any 5 unlock the career kit")));
  });
  return portalShell(content, { active: "skills", title: "My skills", user: user() });
}

export async function labsPage() {
  const content = await load(async () => {
    const data = await ctx.api.dashboard(withSession());
    return h("div", {}, h("p", { class: "muted" }, "Hands-on exercises with instant feedback. Labs award up to 50 points each; your best score counts."), h("div", { class: "cards-grid" }, LABS.map(lab => { const meta = moduleById(lab.id); const owned = data.modules.find(module => module.id === lab.id); return h(owned ? "a" : "div", { class: `card lab-tile accent-${meta.accent} ${owned ? "" : "locked"}`, href: owned ? `#/portal/labs/${lab.id}` : null }, illustration(lab.id, { class: "tile-art" }), h("span", { class: "lab-icon" }, icon(owned ? lab.icon : "lock", 22)), h("h3", {}, lab.title), h("p", { class: "muted small" }, lab.summary), h("span", { class: "tiny" }, owned ? (owned.labScore === null ? "Not started" : `Best score ${owned.labScore}/100`) : `Included with ${meta.title}`)); })));
  });
  return portalShell(content, { active: "labs", title: "Interactive labs", user: user() });
}

export async function labPage({ id }) {
  const lab = LABS.find(item => item.id === id);
  if (!lab) return portalShell(empty("Lab not found.", h("a", { class: "button ghost", href: "#/portal/labs" }, "All labs")), { active: "labs", title: "Lab", user: user() });
  const content = await load(async () => {
    const data = await ctx.api.dashboard(withSession());
    if (!data.modules.some(module => module.id === id)) return empty(`Add ${moduleById(id).title} to your plan to open this lab.`, h("a", { class: "button primary", href: "#/portal/addons" }, "Add the module"));
    const status = h("div", { class: "lab-status" });
    const node = lab.render(async (score) => {
      try { const result = await ctx.api.completeLab(withSession({ labId: id, score })); status.replaceChildren(h("span", { class: "tag good" }, `Saved · best ${result.best}/100 · +${result.pointsAwarded} points`)); if (result.pointsAwarded > 0) confetti(1400); } catch (error) { status.replaceChildren(errorBox(error)); }
    });
    return h("div", { class: "lab-page" }, h("a", { class: "back-link", href: "#/portal/labs" }, icon("arrow", 14), "All labs"), h("div", { class: "learn-head" }, h("div", {}, h("p", { class: "eyebrow" }, moduleById(id).title), h("h2", {}, lab.title), h("p", { class: "muted" }, lab.summary)), status), h("div", { class: "card lab-card-frame" }, node));
  });
  return portalShell(content, { active: "labs", title: "Lab", user: user() });
}

export async function quizPage(_, query) {
  const content = await load(async () => {
    const data = await ctx.api.dashboard(withSession());
    if (!data.modules.length) return empty("Add a skill module to unlock daily quizzes.", h("a", { class: "button primary", href: "#/portal/addons" }, "Browse skills"));
    let moduleId = data.modules.some(module => module.id === query.module) ? query.module : (data.modules.find(module => !module.quizToday) ?? data.modules[0]).id;
    const host = h("div", { class: "quiz-host" });
    const tabs = h("div", { class: "chip-row" }, data.modules.map(module => h("button", { type: "button", class: `chip ${module.id === moduleId ? "on" : ""} ${module.quizToday ? "done" : ""}`, onClick: () => { moduleId = module.id; tabs.querySelectorAll(".chip").forEach(chip => chip.classList.toggle("on", chip.textContent.startsWith(module.title))); renderQuiz(); } }, module.title, module.quizToday ? icon("check", 12) : null)));
    const renderQuiz = async () => {
      host.replaceChildren(skeleton(4));
      try {
        const quiz = await ctx.api.dailyQuiz(withSession({ moduleId }));
        if (quiz.attempt) { host.replaceChildren(h("div", { class: "card center" }, h("p", { class: "eyebrow" }, "Done for today"), h("h3", {}, `${quiz.attempt.score}/${quiz.attempt.total} correct · +${quiz.attempt.points} points`), h("p", { class: "muted" }, "Tomorrow brings a new set. Daily quizzes are optional, but a streak earns bonus points."), h("p", { class: "small" }, `Current streak: ${quiz.streak} day${quiz.streak === 1 ? "" : "s"}`))); return; }
        const answers = {};
        const form = h("form", { class: "quiz", novalidate: true, onSubmit: async (event) => {
          event.preventDefault();
          if (Object.keys(answers).length < quiz.questions.length) { toast("Answer every question first.", "info"); return; }
          const button = form.querySelector("button[type=submit]"); busy(button, true, "Scoring");
          try {
            const result = await ctx.api.submitQuiz(withSession({ moduleId, answers }));
            if (result.score >= 4) confetti();
            host.replaceChildren(h("div", { class: "card quiz-result pop" }, h("p", { class: "eyebrow" }, "Result"), h("h3", {}, `${result.score}/${result.total} correct`), h("p", { class: "muted" }, `+${result.points} points${result.streakBonus ? ` and +${result.streakBonus} streak bonus` : ""}. Streak: ${result.streak} day${result.streak === 1 ? "" : "s"}.`), h("div", { class: "review" }, quiz.questions.map((question, index) => { const item = result.review.find(entry => entry.id === question.id); return h("div", { class: `review-item ${item.correct ? "good" : "bad"}` }, h("strong", {}, `${index + 1}. ${question.question}`), h("p", { class: "small" }, icon(item.correct ? "check" : "close", 14), ` Correct answer: ${question.options[item.answerIndex]}`), h("p", { class: "small muted" }, item.explanation)); })), h("a", { class: "button ghost", href: "#/portal/leaderboard" }, "See the leaderboard")));
            data.modules.find(module => module.id === moduleId).quizToday = true;
          } catch (error) { toast(error.message, "error"); busy(button, false); }
        } }, quiz.questions.map((question, index) => h("fieldset", { class: "question pop", style: { "--i": index } }, h("legend", {}, `${index + 1}. ${question.question}`), question.options.map((option, optionIndex) => h("label", { class: "option" }, h("input", { type: "radio", name: question.id, value: optionIndex, onChange: () => { answers[question.id] = optionIndex; } }), h("span", {}, option))))), h("div", { class: "form-actions" }, h("span", { class: "small muted" }, `${quiz.date} · 5 questions · 10 points each`), h("button", { class: "button primary", type: "submit" }, "Submit answers", icon("arrow", 16))));
        host.replaceChildren(form);
      } catch (error) { host.replaceChildren(errorBox(error)); }
    };
    renderQuiz();
    return h("div", {}, h("p", { class: "muted" }, "One short quiz per module per day. Not mandatory, but consistent practice earns points and streak bonuses."), tabs, host);
  });
  return portalShell(content, { active: "quiz", title: "Daily quiz", user: user() });
}

export async function assignmentsPage() {
  const content = await load(async () => {
    const items = await ctx.api.assignments(withSession());
    if (!items.length) return empty("No assignments yet for your modules.");
    return h("div", { class: "stack" }, items.map(item => {
      const body = h("div", { class: "assignment-body" });
      const summaryTag = h("span", { class: "tag" });
      const updateTag = () => { const current = item.submission; summaryTag.className = `tag ${current?.gradedAt ? "good" : current ? "" : "pending"}`; summaryTag.textContent = current?.gradedAt ? "Graded" : current ? "Submitted" : "Open"; };
      const renderBody = () => {
        updateTag();
        const submission = item.submission;
        if (submission?.gradedAt) body.replaceChildren(...[h("div", { class: "grade good" }, h("strong", {}, `${submission.score}/${item.maxScore}`), h("span", {}, "graded ", formatDate(submission.gradedAt))), submission.feedback ? h("p", { class: "small" }, h("strong", {}, "Feedback: "), submission.feedback) : null, submission.file ? h("p", { class: "tiny muted" }, `Submitted file: ${submission.file.name} (${formatBytes(submission.file.size)})`, submission.file.dataUrl ? [" · ", h("a", { class: "link-button small", href: submission.file.dataUrl, download: submission.file.name }, "Download")] : null) : null].filter(Boolean));
        else {
          let fileRecord = null;
          const fileMeta = h("div", { class: "file-meta" }, submission?.file ? [icon("clipboard", 14), `${submission.file.name} · ${formatBytes(submission.file.size)}${submission.file.stored ? " · stored" : " · name only"}`] : h("span", { class: "tiny muted" }, "PDF, XLSX, CSV, PPTX, DOCX or images. Files up to 400 KB are stored in the preview; larger files are recorded by name, so add a link too."));
          const fileInput = h("input", { type: "file", accept: ".xlsx,.csv,.pdf,.pptx,.docx,.png,.jpg,.jpeg", onChange: async (event) => { const file = event.target.files[0]; if (!file) { fileRecord = null; return; } try { fileRecord = await readFileRecord(file); fileMeta.replaceChildren(icon("clipboard", 14), `${fileRecord.name} · ${formatBytes(fileRecord.size)} · ${fileRecord.dataUrl ? "will be stored" : "name and checksum only (over 400 KB)"}`, h("span", { class: "tiny muted" }, ` sha256 ${fileRecord.sha256.slice(0, 12)}…`)); } catch { toast("Could not read that file.", "error"); } } });
          const form = h("form", { class: "form-grid", novalidate: true, onSubmit: async (event) => { event.preventDefault(); const values = formData(form); const button = form.querySelector("button[type=submit]"); busy(button, true, "Submitting"); try { item.submission = await ctx.api.submitAssignment(withSession({ assignmentId: item.id, text: values.text, link: values.link, file: fileRecord })); toast("Submitted. Your mentor will grade it.", "success"); renderBody(); } catch (error) { if (!showFieldErrors(form, error.extra?.fields ?? {})) toast(error.message, "error"); busy(button, false); } } },
            submission ? h("p", { class: "small tag" }, `Submitted ${relative(submission.submittedAt)} · awaiting grading · you can update it`) : null,
            field({ label: "Describe your work", name: "text", type: "textarea", value: submission?.text ?? "", rows: 4, placeholder: "What you built, how you checked it and what you would improve." }),
            field({ label: "Link (optional, https)", name: "link", type: "url", value: submission?.link ?? "", placeholder: "https://" }),
            h("div", { class: "field" }, h("span", { class: "field-label" }, "File (optional)"), h("div", { class: "file-drop" }, fileInput, fileMeta)),
            h("div", { class: "form-actions" }, h("button", { class: "button primary", type: "submit" }, submission ? "Update submission" : "Submit", icon("upload", 16))));
          body.replaceChildren(form);
        }
      };
      renderBody();
      return h("details", { class: "card assignment", open: !item.submission?.gradedAt }, h("summary", {}, h("div", {}, h("p", { class: "eyebrow" }, item.moduleTitle), h("strong", {}, item.title), h("span", { class: "tiny muted block" }, `Due ${formatDate(item.dueAt)} · ${item.maxScore} points`)), summaryTag), h("p", { class: "small" }, item.brief), item.acceptance?.length ? h("ul", { class: "ticks small" }, item.acceptance.map(line => h("li", {}, icon("check", 14), line))) : null, body);
    }));
  });
  return portalShell(content, { active: "assignments", title: "Assignments", user: user() });
}

export async function leaderboardPage(_, query) {
  const content = await load(async () => {
    let period = query.period === "week" ? "week" : "all";
    const host = h("div", {});
    const render = async () => {
      host.replaceChildren(skeleton(6));
      const data = await ctx.api.leaderboard(withSession({ period }));
      const max = Math.max(1, ...data.rows.map(row => row.points));
      const badgeUrl = data.badge ? `${location.origin}${location.pathname}#/badge/${data.badge.code}` : null;
      host.replaceChildren(...[
        data.topper ? h("div", { class: "topper-card" }, h("div", { class: "badge-seal small" }, icon("trophy", 26)), h("div", { class: "grow" }, h("p", { class: "eyebrow" }, data.topper.kind), h("strong", {}, data.topper.name), h("span", { class: "small muted" }, ` · ${data.topper.points} points`)), data.badge ? h("div", { class: "share-row" }, previewShareLink(linkedinShareUrl(badgeUrl), "Share on LinkedIn", "primary"), previewShareLink(linkedinCertificationUrl({ name: `Rolevia ${data.badge.kind}`, certId: data.badge.code, certUrl: badgeUrl, issued: data.badge.issuedAt }), "Add to LinkedIn profile", "ghost"), copyButton(badgeUrl, "Copy badge link"), h("span", { class: "tiny muted block" }, "Preview badges live only in this browser; production badges are verified on the server.")) : h("span", { class: "tiny muted" }, "Reach #1 to earn a shareable badge.")) : null,
        h("div", { class: "board" }, data.rows.map((row, index) => h("div", { class: `board-row pop ${row.userId === ctx.auth.user.id ? "me" : ""}`, style: { "--i": index } }, h("span", { class: `rank r${row.rank}` }, `#${row.rank}`), avatar(row, 36), h("div", { class: "grow" }, h("div", { class: "board-name" }, h("strong", {}, row.name), h("small", { class: "muted" }, ` · ${row.city} · ${row.modules} modules`)), h("div", { class: "bar" }, h("div", { class: "bar-fill", style: { width: `${(row.points / max) * 100}%` } })), h("div", { class: "tiny muted" }, `quiz ${row.quiz} · labs ${row.labs} · assignments ${row.assignments} · live ${row.live ?? 0} · lessons ${row.lessons}`)), h("strong", { class: "points" }, `${row.points} pts`)))),
        data.me ? h("p", { class: "small muted center" }, `You are #${data.me.rank} with ${data.me.points} points${period === "week" ? " this week" : ""}.`) : null].filter(Boolean));
    };
    const toggle = h("div", { class: "segmented", role: "group", "aria-label": "Period" }, [["all", "All time"], ["week", "This week"]].map(([value, label]) => h("button", { type: "button", class: value === period ? "active" : "", onClick: (event) => { period = value; toggle.querySelectorAll("button").forEach(button => button.classList.toggle("active", button === event.currentTarget)); render(); } }, label)));
    render();
    return h("div", {}, h("p", { class: "muted" }, "Points: 10 per correct quiz answer, streak bonuses, up to 50 per lab, graded assignment scores, 10 per correct live-class question (2 for taking part) and 5 per lesson. Badges can be shared on LinkedIn."), toggle, host);
  });
  return portalShell(content, { active: "leaderboard", title: "Leaderboard", user: user() });
}

export async function addonsPage() {
  const content = await load(async () => {
    const data = await ctx.api.dashboard(withSession());
    const { modules, services, interviewCourse, careerBonus } = ctx.curriculum;
    const currency = data.user.currency ?? "INR";
    const owned = new Set(data.user.modules);
    const selected = new Set();
    const total = h("div", { class: "plan-total" });
    const refreshTotal = () => { const picks = modules.filter(module => selected.has(module.id)); total.replaceChildren(h("span", {}, `${picks.length} new module${picks.length === 1 ? "" : "s"}`), h("strong", {}, money(picks.reduce((sum, module) => sum + module[`price${currency}`], 0), currency)), h("span", { class: "small muted" }, owned.size + picks.length >= careerBonus.qualifyingModules && !data.kit.unlocked ? " · unlocks the career kit" : "")); grid.querySelectorAll(".choice").forEach(card => card.classList.toggle("selected", selected.has(card.dataset.id))); };
    const grid = h("div", { class: "choice-grid" }, modules.map(module => owned.has(module.id) ? h("div", { class: `choice owned accent-${module.accent}` }, h("span", { class: "choice-check" }, icon("check", 14)), h("span", { class: "code" }, module.code), h("strong", {}, module.title), h("small", { class: "muted" }, "In your plan")) : h("button", { type: "button", class: `choice accent-${module.accent}`, dataset: { id: module.id }, "aria-pressed": "false", onClick: (event) => { if (selected.has(module.id)) selected.delete(module.id); else selected.add(module.id); event.currentTarget.setAttribute("aria-pressed", String(selected.has(module.id))); refreshTotal(); } }, h("span", { class: "choice-check" }, icon("check", 14)), h("span", { class: "code" }, module.code), h("strong", {}, module.title), h("small", { class: "muted" }, module.tool), h("span", { class: "price" }, money(module[`price${currency}`], currency)))));
    refreshTotal();
    const buyModules = h("button", { class: "button primary", type: "button", onClick: async (event) => { if (!selected.size) { toast("Choose a module first.", "info"); return; } busy(event.currentTarget, true, "Processing"); try { const result = await ctx.api.purchase(withSession({ moduleIds: [...selected] })); setAuth({ ...ctx.auth, user: result.user }); toast(result.manual ? "Request saved. Payment instructions were emailed; the modules unlock once our team confirms the transfer." : "Added to your plan. Receipt sent to the preview inbox.", "success", result.manual ? 8000 : 4000); document.dispatchEvent(new CustomEvent("rolevia:inbox-refresh")); location.hash = result.manual ? "#/portal/addons?keep=1" : "#/portal/skills"; } catch (error) { toast(error.message, "error"); busy(event.currentTarget, false); } } }, icon("lock", 16), ctx.config.payments === "manual" ? "Request to add (pay by transfer)" : "Pay and add (preview)");
    const kitRows = [{ id: "interview", name: interviewCourse.title, scope: "2-week course with one personal mock interview", price: interviewCourse[`price${currency}`] }, ...services.filter(service => ["resume-audit", "resume-writing"].includes(service.id)).map(service => ({ id: service.id, name: service.name, scope: service.scope, price: service[`price${currency}`] }))];
    const otherServices = services.filter(service => !["resume-audit", "resume-writing"].includes(service.id));
    const serviceRow = (service, included) => { const bought = data.user.addons.find(addon => addon.id === service.id); return h("div", { class: "service-row" }, h("div", { class: "grow" }, h("strong", {}, service.name), h("p", { class: "small muted" }, service.scope)), included ? h("span", { class: "tag good" }, "Included · schedule by email") : bought ? h("span", { class: "tag" }, "Purchased") : h("button", { class: "button ghost small", type: "button", onClick: async (event) => { busy(event.currentTarget, true, "Processing"); try { const result = await ctx.api.purchase(withSession({ serviceIds: [service.id] })); setAuth({ ...ctx.auth, user: result.user }); toast(result.manual ? `${service.name} requested. Payment instructions were emailed; it is added once our team confirms the transfer.` : `${service.name} added. Receipt in the preview inbox.`, "success", result.manual ? 8000 : 4000); location.hash = "#/portal/addons?keep=1"; } catch (error) { toast(error.message, "error"); busy(event.currentTarget, false); } } }, `Add · ${money(service.price, currency)}`)); };
    return h("div", { class: "stack" },
      h("div", { class: "card" }, h("h3", {}, "Add skill modules"), h("p", { class: "small muted" }, `Billing currency ${currency}. Any ${careerBonus.qualifyingModules} distinct paid modules unlock the career kit.`), grid, h("div", { class: "form-actions between" }, total, buyModules)),
      h("div", { class: `card kit-card ${data.kit.unlocked ? "unlocked" : ""}` }, h("h3", {}, icon("star", 18), data.kit.unlocked ? "Your career kit is included" : `Career kit · ${data.kit.count}/${data.kit.required} modules`), kitRows.map(service => serviceRow(service, data.kit.unlocked)), data.kit.unlocked ? h("p", { class: "tiny muted" }, "Our coach emails you to schedule Interview Ready, the mock and your resume work.") : h("p", { class: "tiny muted" }, "Standalone prices apply until the kit unlocks. Do not buy overlapping services unless you want extra work.")),
      h("div", { class: "card" }, h("h3", {}, "Other career services"), otherServices.map(service => serviceRow({ id: service.id, name: service.name, scope: service.scope, price: service[`price${currency}`] }, false))));
  });
  return portalShell(content, { active: "addons", title: "Add-ons & career kit", user: user() });
}

export async function profilePage(_, query) {
  const content = await load(async () => {
    const me = await ctx.api.me(withSession());
    const profile = me.user;
    const preview = h("div", { class: "avatar-preview" }, avatar(profile, 96));
    let avatarData;
    const profileForm = h("form", { class: "form-grid", novalidate: true, onSubmit: async (event) => { event.preventDefault(); const values = formData(profileForm); const button = profileForm.querySelector("button[type=submit]"); busy(button, true, "Saving"); try { const updated = await ctx.api.updateProfile(withSession({ name: values.name, bio: values.bio, linkedin: values.linkedin, avatar: avatarData })); setAuth({ ...ctx.auth, user: updated }); toast("Profile saved.", "success"); busy(button, false, "Save profile"); } catch (error) { toast(error.message, "error"); busy(button, false); } } },
      h("div", { class: "avatar-row" }, preview, h("label", { class: "button ghost small" }, icon("upload", 14), "Upload picture", h("input", { type: "file", accept: "image/*", hidden: true, onChange: async (event) => { const file = event.target.files[0]; if (!file) return; try { avatarData = await downscaleImage(file, 160); preview.replaceChildren(h("img", { class: "avatar", src: avatarData, alt: "New profile picture", width: 96, height: 96 })); } catch { toast("Could not read that image.", "error"); } } })), h("button", { class: "link-button", type: "button", onClick: () => { avatarData = ""; preview.replaceChildren(avatar({ ...profile, avatar: null }, 96)); } }, "Remove")),
      field({ label: "Full name", name: "name", value: profile.name, required: true }), field({ label: "Short bio", name: "bio", type: "textarea", value: profile.bio ?? "", rows: 3, placeholder: "What you are learning and where you want to apply it." }), field({ label: "LinkedIn profile", name: "linkedin", type: "url", value: profile.linkedin ?? "", placeholder: "https://www.linkedin.com/in/..." }),
      h("div", { class: "form-actions" }, h("button", { class: "button primary", type: "submit" }, "Save profile")));
    const passwordForm = h("form", { class: "form-grid", novalidate: true, onSubmit: async (event) => { event.preventDefault(); const values = formData(passwordForm); const button = passwordForm.querySelector("button[type=submit]"); if (values.password !== values.confirm) { toast("New passwords do not match.", "error"); return; } busy(button, true, "Updating"); try { await ctx.api.changePassword(withSession({ currentPassword: values.current, newPassword: values.password })); toast("Password changed.", "success"); passwordForm.reset(); busy(button, false, "Change password"); if (query.first) location.hash = "#/portal"; } catch (error) { toast(error.message, "error"); busy(button, false); } } },
      field({ label: "Current password", name: "current", type: "password", required: true, autocomplete: "current-password" }), field({ label: "New password", name: "password", type: "password", required: true, autocomplete: "new-password", hint: "At least 8 characters with letters and numbers." }), field({ label: "Confirm new password", name: "confirm", type: "password", required: true, autocomplete: "new-password" }),
      h("div", { class: "form-actions" }, h("button", { class: "button primary", type: "submit" }, "Change password")));
    return h("div", { class: "grid-2" },
      h("div", { class: "stack" }, query.first ? h("div", { class: "alert info" }, icon("shield", 16), h("span", {}, "First sign-in: please replace your temporary password now.")) : null, h("div", { class: "card" }, h("h3", {}, "Profile"), h("p", { class: "small muted" }, `Student ID ${profile.studentId} · ${profile.email} · ${profile.phone}`), profileForm)),
      h("div", { class: "stack" }, h("div", { class: "card" }, h("h3", {}, icon("lock", 18), "Password"), passwordForm), h("div", { class: "card" }, h("h3", {}, icon("device", 18), "Active device"), h("p", { class: "small" }, `${me.session.deviceLabel} · signed in ${formatTime(me.session.createdAt)} · last activity ${relative(me.session.lastSeen)}`), h("p", { class: "small muted" }, `Device switches recorded: ${profile.deviceSwitches}. A security notice is sent every ${me.threshold}.`), h("button", { class: "button ghost small", type: "button", onClick: () => modal({ title: "Sign out this device?", body: h("p", {}, "You can sign in again any time with a new one-time code."), actions: [{ label: "Sign out", variant: "danger", onClick: signOut }] }) }, icon("logout", 14), "Sign out"))));
  });
  return portalShell(content, { active: "profile", title: "Profile & security", user: user() });
}

export async function notificationsPage() {
  const content = await load(async () => {
    const items = await ctx.api.notifications(withSession());
    ctx.api.markNotificationsRead(withSession()).catch(() => {});
    return items.length ? h("div", { class: "stack" }, items.map(item => h("div", { class: `card notice-card ${item.kind}` }, h("div", { class: "card-head" }, h("strong", {}, item.title), h("span", { class: "tiny muted" }, formatTime(item.at))), h("p", { class: "small" }, item.body)))) : empty("No notifications yet.");
  });
  return portalShell(content, { active: "dashboard", title: "Notifications", user: user() });
}

function previewShareLink(href, label, variant) {
  return h("a", { class: `button ${variant} small`, href, target: "_blank", rel: "noopener noreferrer", onClick: (event) => {
    event.preventDefault();
    modal({ title: "Sharing from the preview", body: h("div", {}, h("p", {}, "This preview runs in your browser only, so the badge link will not resolve for other people yet. In production the badge is verified on the server before sharing."), h("p", { class: "small muted" }, "Continue to LinkedIn only if you understand this is a demonstration.")), actions: [{ label: "Continue to LinkedIn", onClick: () => { window.open(href, "_blank", "noopener,noreferrer"); } }] });
  } }, label.includes("Share") ? icon("linkedin", 14) : null, label);
}
