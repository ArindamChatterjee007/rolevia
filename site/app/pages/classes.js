import { h, icon, skeleton, toast, busy, field, formData, formatTime, formatDate, relative, modal, showFieldErrors, formatBytes } from "../ui.js";
import { ctx, withSession } from "../context.js";
import { errorBox, empty } from "./components.js";
import { portalShell } from "./portal.js";
import { adminShell, adminLoad, can } from "./admin.js";
import { listStoredRecordings } from "../classroom/recorder.js";

const statusTag = (item) => h("span", { class: `tag ${item.status === "live" ? "live" : item.status === "scheduled" ? "pending" : item.status === "ended" ? "good" : "bad"}` }, item.status === "live" ? "Live now" : item.status);
const when = (item) => `${formatTime(item.startsAt)} · ${item.durationMinutes} min`;

function classCard(item, { forAdmin = false, onChanged } = {}) {
  const actions = [];
  if (forAdmin) {
    if (item.status === "scheduled") actions.push(h("button", { class: "button primary small", type: "button", onClick: async (event) => { busy(event.currentTarget, true, "Starting"); try { await ctx.api.adminSetClassStatus(withSession({ classId: item.id, status: "live" })); location.hash = `#/classroom/${item.id}`; } catch (error) { toast(error.message, "error"); busy(event.currentTarget, false); } } }, icon("play", 14), "Start class"));
    if (item.status === "live") actions.push(h("a", { class: "button primary small", href: `#/classroom/${item.id}` }, icon("play", 14), "Open room"));
    actions.push(h("a", { class: "button ghost small", href: `#/admin/classes/${item.id}` }, "Details"));
  } else if (item.canJoin) {
    actions.push(h("a", { class: "button primary small", href: `#/classroom/${item.id}` }, icon("play", 14), item.status === "live" ? "Join now" : "Enter waiting room"));
  }
  if (item.mode === "external" && item.externalUrl && item.status !== "ended") actions.push(h("a", { class: "button ghost small", href: item.externalUrl, target: "_blank", rel: "noopener noreferrer" }, "Meeting link"));
  if (item.recordingUrl) actions.push(h("a", { class: "button ghost small", href: item.recordingUrl, target: "_blank", rel: "noopener noreferrer" }, icon("play", 14), "Watch recording"));
  return h("div", { class: `card class-card ${item.status}` },
    h("div", { class: "card-head" }, h("div", {}, h("p", { class: "eyebrow" }, item.moduleTitle), h("h3", {}, item.title), h("p", { class: "small muted" }, `${when(item)} · host ${item.hostName}${item.mode === "external" ? " · external meeting" : " · built-in video"}`)), statusTag(item)),
    item.description ? h("p", { class: "small" }, item.description) : null,
    h("div", { class: "class-meta" }, item.status === "ended" ? [h("span", { class: "tag" }, `${item.attendanceCount} attended`), h("span", { class: "tag" }, `${item.quizCount} live question${item.quizCount === 1 ? "" : "s"}`), item.attended !== null ? h("span", { class: `tag ${item.attended ? "good" : ""}` }, item.attended ? `You attended · ${item.myCorrect}/${item.myQuizzes} correct` : "Not attended") : null] : item.status === "live" ? h("span", { class: "tag live" }, "In progress") : h("span", { class: "tiny muted" }, `Starts ${relative(item.startsAt).replace(" ago", "")}${item.startsAt > Date.now() ? " from now" : ""}`)),
    actions.length ? h("div", { class: "form-actions start" }, actions) : null);
}

export async function studentClassesPage() {
  const content = await portalLoad(async () => {
    const classes = await ctx.api.classes(withSession());
    const live = classes.filter(item => item.status === "live");
    const upcoming = classes.filter(item => item.status === "scheduled");
    const past = classes.filter(item => item.status === "ended").reverse();
    return h("div", { class: "stack" },
      h("p", { class: "muted" }, "Live classes run inside Rolevia with video, screen sharing, chat and live questions. Points from live questions count on the leaderboard."),
      live.length ? h("section", {}, h("h3", { class: "section-title" }, icon("bolt", 18), "Live now"), h("div", { class: "stack" }, live.map(item => classCard(item)))) : null,
      h("section", {}, h("h3", { class: "section-title" }, icon("play", 18), "Upcoming"), upcoming.length ? h("div", { class: "stack" }, upcoming.map(item => classCard(item))) : empty("No classes scheduled for your modules yet.")),
      h("section", {}, h("h3", { class: "section-title" }, icon("book", 18), "Past classes and recordings"), past.length ? h("div", { class: "stack" }, past.map(item => classCard(item))) : h("p", { class: "muted small" }, "Recordings appear here after a class ends.")));
  });
  return portalShell(content, { active: "classes", title: "Live classes", user: ctx.auth.user });
}

async function portalLoad(render) {
  const host = h("div", {}, skeleton(4, "page-skeleton"));
  Promise.resolve().then(render).then(node => host.replaceChildren(node)).catch(error => { if (["SESSION_REVOKED", "AUTH_REQUIRED", "SESSION_EXPIRED", "DEVICE_MISMATCH"].includes(error.code)) { document.dispatchEvent(new CustomEvent("rolevia:session-lost", { detail: error })); return; } if (error.code === "PASSWORD_CHANGE_REQUIRED") { location.hash = "#/portal/profile?first=1"; return; } host.replaceChildren(errorBox(error)); });
  return host;
}

// ---------- admin ----------
function classForm(data, existing = {}, onSaved) {
  const toLocal = (timestamp) => { const date = new Date(timestamp); const pad = (value) => String(value).padStart(2, "0"); return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`; };
  const form = h("form", { class: "form-grid two", novalidate: true, onSubmit: async (event) => {
    event.preventDefault();
    const values = formData(form);
    const button = form.querySelector("button[type=submit]");
    busy(button, true, "Saving");
    try {
      const saved = await ctx.api.adminUpsertClass(withSession({ cls: { ...existing, ...values, startsAt: values.startsAt ? new Date(values.startsAt).getTime() : null } }));
      toast(existing.id ? "Class updated." : "Class scheduled. Students in the module were notified.", "success");
      onSaved?.(saved);
    } catch (error) { if (!showFieldErrors(form, error.extra?.fields ?? {})) toast(error.message, "error"); busy(button, false); }
  } },
    field({ label: "Skill module", name: "moduleId", type: "select", value: existing.moduleId ?? ctx.curriculum.modules[0].id, options: ctx.curriculum.modules.map(module => ({ value: module.id, label: module.title })) }),
    field({ label: "Host", name: "hostId", type: "select", value: existing.hostId ?? ctx.auth.user.id, options: data.hosts.map(host => ({ value: host.id, label: `${host.name} · ${host.roleLabel}` })) }),
    field({ label: "Class title", name: "title", value: existing.title ?? "", required: true, placeholder: "Week 1 live workshop: cleaning a sales register" }),
    field({ label: "Start (your local time)", name: "startsAt", type: "datetime-local", value: existing.startsAt ? toLocal(existing.startsAt) : toLocal(Date.now() + 60 * 60 * 1000), required: true }),
    field({ label: "Duration (minutes)", name: "durationMinutes", type: "number", value: existing.durationMinutes ?? 60, min: 15, max: 240 }),
    field({ label: "Where", name: "mode", type: "select", value: existing.mode ?? "builtin", options: [{ value: "builtin", label: "Built-in Rolevia video room" }, { value: "external", label: "External meeting link + Rolevia quiz/chat" }] }),
    field({ label: "External meeting link (only for external mode)", name: "externalUrl", type: "url", value: existing.externalUrl ?? "", placeholder: "https://meet.google.com/..." }),
    field({ label: "Description for students", name: "description", type: "textarea", value: existing.description ?? "", rows: 2 }),
    h("div", { class: "form-actions" }, h("button", { class: "button primary small", type: "submit" }, existing.id ? "Save changes" : "Schedule class")));
  return form;
}

export async function adminClassesPage() {
  const content = await adminLoad(async () => {
    const host = h("div", { class: "stack" });
    const render = async () => {
      const data = await ctx.api.adminClasses(withSession());
      const groups = [["Live now", data.classes.filter(item => item.status === "live")], ["Upcoming", data.classes.filter(item => item.status === "scheduled").sort((a, b) => a.startsAt - b.startsAt)], ["Past", data.classes.filter(item => item.status === "ended")], ["Cancelled", data.classes.filter(item => item.status === "cancelled")]];
      host.replaceChildren(
        h("div", { class: "card" }, h("h3", {}, icon("play", 18), "Schedule a live class"), h("p", { class: "small muted" }, "Students enrolled in the module are notified and can join from Live classes 15 minutes before the start. The host starts the class from this page or from the task tracker."), classForm(data, {}, render)),
        ...groups.filter(([, items]) => items.length).map(([label, items]) => h("section", {}, h("h3", { class: "section-title" }, label), h("div", { class: "stack" }, items.map(item => classCard(item, { forAdmin: true, onChanged: render }))))),
        data.classes.length ? null : empty("No classes yet."));
    };
    await render();
    return host;
  });
  return adminShell(content, { active: "classes", title: "Live classes" });
}

export async function adminClassDetailPage({ id }) {
  const content = await adminLoad(async () => {
    const host = h("div", { class: "stack" });
    const render = async () => {
      const [detail, data, stored] = await Promise.all([ctx.api.adminClassDetail(withSession({ classId: id })), ctx.api.adminClasses(withSession()), listStoredRecordings().then(items => items.filter(item => item.classId === id)).catch(() => [])]);
      const endHere = async (event) => { busy(event.currentTarget, true, "Ending"); try { await ctx.api.adminSetClassStatus(withSession({ classId: id, status: "ended" })); toast("Class ended. Attendance and open questions were closed.", "success"); render(); } catch (error) { toast(error.message, "error"); busy(event.currentTarget, false); } };
      const recordingForm = h("form", { class: "form-grid two", novalidate: true, onSubmit: async (event) => { event.preventDefault(); const values = formData(recordingForm); const button = recordingForm.querySelector("button[type=submit]"); busy(button, true, "Saving"); try { await ctx.api.adminAddRecording(withSession({ classId: id, url: values.url, name: values.name, storage: values.storage })); toast("Recording link saved. Students see it on the class card.", "success"); render(); } catch (error) { if (!showFieldErrors(recordingForm, error.extra?.fields ?? {})) toast(error.message, "error"); busy(button, false); } } },
        field({ label: "Recording link (https)", name: "url", type: "url", required: true, placeholder: "https://drive.google.com/file/d/.../view" }), field({ label: "Label", name: "name", placeholder: "Week 1 recording" }), field({ label: "Stored in", name: "storage", type: "select", value: "drive", options: [{ value: "drive", label: "Google Drive" }, { value: "github", label: "GitHub release / repository" }, { value: "link", label: "Other link" }] }),
        h("div", { class: "form-actions" }, h("button", { class: "button primary small", type: "submit" }, "Attach link")));
      host.replaceChildren(...[
        h("a", { class: "back-link", href: "#/admin/classes" }, icon("arrow", 14), "All classes"),
        classCard(detail, { forAdmin: true, onChanged: render }),
        detail.status === "live" ? h("div", { class: "alert info" }, icon("bolt", 16), h("span", { class: "grow" }, "This class is live. End it from inside the room when you finish; attendance and quiz results are saved automatically. If the room was lost, end it here."), h("button", { class: "button danger small", type: "button", onClick: endHere }, "End class now")) : null,
        ["scheduled"].includes(detail.status) ? h("div", { class: "card" }, h("h3", {}, "Edit schedule"), classForm(data, detail, render), h("button", { class: "link-button danger", type: "button", onClick: () => modal({ title: "Cancel this class?", body: h("p", {}, "Students will no longer see it. Use this for a cancelled session, not for a finished one."), actions: [{ label: "Cancel class", variant: "danger", onClick: async () => { await ctx.api.adminSetClassStatus(withSession({ classId: id, status: "cancelled" })); location.hash = "#/admin/classes"; } }] }) }, "Cancel class")) : null,
        h("div", { class: "card" }, h("div", { class: "card-head" }, h("h3", {}, icon("user", 18), `Attendance (${detail.attendance.length})`), h("span", { class: "tiny muted" }, "Recorded when learners join from their own account")), detail.attendance.length ? h("div", { class: "table-wrap" }, h("table", { class: "data-table" }, h("thead", {}, h("tr", {}, ["Student", "Joined", "Left", "Minutes"].map(label => h("th", {}, label)))), h("tbody", {}, detail.attendance.map(entry => h("tr", {}, h("td", {}, entry.name), h("td", {}, formatTime(entry.joinedAt)), h("td", {}, entry.leftAt ? formatTime(entry.leftAt) : h("span", { class: "tag live" }, "in room")), h("td", {}, Math.round(entry.seconds / 60))))))) : h("p", { class: "muted small" }, "No one has joined yet.")),
        h("div", { class: "card" }, h("h3", {}, icon("quiz", 18), `Live questions (${detail.quizzes.length})`), detail.quizzes.length ? detail.quizzes.map(quiz => h("div", { class: "quiz-summary" }, h("strong", {}, quiz.question), h("div", { class: "result-bars" }, quiz.options.map((option, index) => { const count = quiz.counts?.[index] ?? 0; const total = Math.max(1, quiz.answered); return h("div", { class: `result-bar ${index === quiz.answerIndex ? "correct" : ""}` }, h("span", { class: "result-label" }, option), h("div", { class: "bar" }, h("div", { class: "bar-fill", style: { width: `${(count / total) * 100}%` } })), h("span", { class: "result-count" }, count)); })), h("p", { class: "tiny muted" }, `${quiz.answered} answered · ${quiz.results?.correct ?? 0} correct · sent ${formatTime(quiz.sentAt)}`), quiz.responses.length ? h("p", { class: "tiny muted" }, quiz.responses.map(response => `${response.name}: ${response.correct ? "✓" : "✗"}`).join(" · ")) : null)) : h("p", { class: "muted small" }, "No live questions sent yet.")),
        h("div", { class: "card" }, h("h3", {}, icon("play", 18), "Recordings"), stored.length ? h("div", { class: "alert info" }, icon("upload", 16), h("span", { class: "grow" }, `${stored.length} recording${stored.length === 1 ? "" : "s"} from this class ${stored.length === 1 ? "is" : "are"} still stored in this browser.`), h("a", { class: "button ghost small", href: `#/classroom/${id}?resume=recording` }, "Stored recordings on this device")) : null, detail.recordings.length ? h("ul", { class: "history" }, detail.recordings.map(recording => h("li", {}, recording.url ? h("a", { href: recording.url, target: "_blank", rel: "noopener noreferrer" }, recording.name || recording.url) : `${recording.name} (kept on the host's device)`, h("span", { class: "tiny muted" }, ` · ${recording.storage} · ${recording.size ? formatBytes(recording.size) : ""} ${recording.durationSeconds ? `· ${recording.durationSeconds < 60 ? `${Math.round(recording.durationSeconds)} s` : `${Math.round(recording.durationSeconds / 60)} min`}` : ""} · ${formatDate(recording.at)}`)))) : h("p", { class: "muted small" }, "Record from inside the room (host only), then download or upload it and attach the link here."), recordingForm, h("p", { class: "tiny muted" }, "Storage guidance: keep recordings in Google Drive (restricted to enrolled students) or a GitHub release; attach the https link here so students see it on the class card."))].filter(Boolean));
    };
    await render();
    return host;
  });
  return adminShell(content, { active: "classes", title: "Class details" });
}

export { can };
