// Lab programmes: eight weekly sessions per module. Short tasks are checked at once; case answers and evidence
// go to Rolevia's review queue and come back with points and written feedback.
import { h, icon, ring, toast, busy, formatDate, readFileRecord, formatBytes, modal } from "../ui.js";
import { ctx, withSession } from "../context.js";
import { errorBox, empty } from "./components.js";
import { portalShell, load, user, moduleById } from "./portal.js";
import { LABS } from "./labs.js";
import { illustration } from "./deck.js";

const statusTag = (status) => ({ complete: h("span", { class: "tag good" }, "Complete"), under_review: h("span", { class: "tag pending" }, "Under review"), in_progress: h("span", { class: "tag" }, "In progress"), not_started: h("span", { class: "tag muted" }, "Not started") }[status] ?? null);

export async function labProgrammePage({ id }) {
  const meta = moduleById(id);
  const lab = LABS.find(item => item.id === id);
  if (!meta) return portalShell(empty("Lab not found.", h("a", { class: "button ghost", href: "#/portal/labs" }, "All labs")), { active: "labs", title: "Lab", user: user() });
  const content = await load(async () => {
    let data;
    try { data = await ctx.api.labProgramme(withSession({ moduleId: id })); }
    catch (error) { if (error.code === "NOT_ENROLLED") return empty(`Add ${meta.title} to your plan to open its lab programme.`, h("a", { class: "button primary", href: "#/portal/addons" }, "Add the module")); throw error; }
    const next = data.sessions.find(session => !["complete", "under_review"].includes(session.status));
    return h("div", { class: `stack accent-${meta.accent}` },
      h("a", { class: "back-link", href: "#/portal/labs" }, icon("arrow", 14), "All labs"),
      h("div", { class: "learn-head" }, h("div", {}, h("p", { class: "eyebrow" }, `${meta.title} · lab programme`), h("h2", {}, "Eight weeks of practice"), h("p", { class: "muted" }, data.summary ?? "Weekly lab sessions with checked tasks and reviewed case work.")), illustration(id, { class: "learn-art" })),
      h("div", { class: "overview-hero" }, h("div", {}, h("p", { class: "lead" }, next ? `Next: week ${next.week}, ${next.title}` : "All eight sessions submitted."), h("p", { class: "small muted" }, `Short tasks are checked immediately. Case answers and evidence are reviewed by Rolevia within ${data.reviewDays} business days and come back with points and written feedback.`), h("div", { class: "form-actions start" }, next ? h("a", { class: "button primary", href: `#/portal/labs/${id}/session/${next.week}` }, icon("play", 16), `Open week ${next.week}`) : null, lab ? h("a", { class: "button ghost", href: `#/portal/labs/${id}/tool` }, icon("lab", 16), `Practice tool: ${lab.title}`) : null)), h("div", { class: "overview-progress" }, ring(data.progress.total ? data.progress.done / data.progress.total : 0, { size: 96, stroke: 8, label: "sessions" }), h("span", { class: "tiny muted" }, `${data.progress.done}/${data.progress.total} sessions · ${data.progress.earned}/${data.progress.possible} points`))),
      h("ol", { class: "session-list" }, data.sessions.map(session => h("li", { class: `session-row ${session.status}` }, h("a", { href: `#/portal/labs/${id}/session/${session.week}` }, h("span", { class: "session-week" }, `W${session.week}`), h("div", { class: "grow" }, h("strong", {}, session.title), h("span", { class: "tiny muted block" }, `${session.minutes} min · ${session.tasks.length} tasks · ${session.earned}/${session.possible} points`)), statusTag(session.status), icon("arrow", 16))))));
  });
  return portalShell(content, { active: "labs", title: "Lab programme", user: user() });
}

export async function labSessionPage({ id, week }) {
  const meta = moduleById(id);
  if (!meta) return portalShell(empty("Lab not found."), { active: "labs", title: "Lab", user: user() });
  const content = await load(async () => {
    const data = await ctx.api.labProgramme(withSession({ moduleId: id }));
    const session = data.sessions.find(item => item.week === Number(week));
    if (!session) return empty("That session does not exist.", h("a", { class: "button ghost", href: `#/portal/labs/${id}` }, "Back to the programme"));
    const lab = LABS.find(item => item.id === id);
    const host = h("div", { class: "stack" });
    const render = (current) => {
      const previous = data.sessions.find(item => item.week === current.week - 1);
      const nextSession = data.sessions.find(item => item.week === current.week + 1);
      host.replaceChildren(
        h("a", { class: "back-link", href: `#/portal/labs/${id}` }, icon("arrow", 14), `${meta.title} lab programme`),
        h("header", { class: "reader-head" }, h("p", { class: "eyebrow" }, `Week ${current.week} of ${data.sessions.length} · about ${current.minutes} minutes`), h("h2", {}, current.title), statusTag(current.status)),
        h("section", { class: "reader-section" }, h("h3", {}, h("span", { class: "reader-index" }, icon("book", 16)), "Scenario"), ...current.scenario.map(paragraph => h("p", {}, paragraph)), current.dataset ? h("div", { class: "table-wrap" }, h("table", { class: "data-table reader-table" }, h("thead", {}, h("tr", {}, current.dataset.columns.map(column => h("th", {}, column)))), h("tbody", {}, current.dataset.rows.map(row => h("tr", {}, row.map(cell => h("td", {}, String(cell)))))))) : null, h("p", { class: "small muted" }, h("strong", {}, "By the end: "), current.outcome), lab ? h("p", { class: "tiny muted" }, "Build it in the ", h("a", { href: `#/portal/labs/${id}/tool`, target: "_blank", rel: "noopener" }, `${lab.title} practice tool`), " or in your own tool, then enter your answers here.") : null),
        ...current.tasks.map((task, index) => taskCard(task, index, current, (updated) => { Object.assign(current, updated); render(current); })),
        h("div", { class: "reader-actions" }, previous ? h("a", { class: "button ghost small", href: `#/portal/labs/${id}/session/${previous.week}` }, h("span", { class: "icon-flip" }, icon("arrow", 14)), `Week ${previous.week}`) : h("span"), h("span", { class: "tiny muted" }, `${current.progress.done}/${current.progress.total} tasks · ${current.earned}/${current.possible} points`), nextSession ? h("a", { class: "button ghost small", href: `#/portal/labs/${id}/session/${nextSession.week}` }, `Week ${nextSession.week}`, icon("arrow", 14)) : h("a", { class: "button ghost small", href: `#/portal/labs/${id}` }, "Programme overview")));
    };
    const submit = async (taskId, value, onDone) => {
      try { const result = await ctx.api.submitLabTasks(withSession({ moduleId: id, sessionId: session.id, answers: { [taskId]: value } })); onDone(result.session); return result.results[taskId]; }
      catch (error) { toast(error.message, "error", 7000); return null; }
    };
    function taskCard(task, index, current, onUpdated) {
      const body = [];
      if (task.type === "short") {
        const input = task.kind === "choice"
          ? h("div", { class: "slide-options compact" }, task.options.map((option, optionIndex) => h("button", { type: "button", class: `slide-option ${task.correct && Number(task.value) === optionIndex ? "correct" : ""}`, disabled: Boolean(task.correct), onClick: async () => { const result = await submit(task.id, optionIndex, onUpdated); if (result && !result.correct) toast("Not quite. Check the scenario and try again.", "info"); } }, h("span", { class: "slide-option-letter" }, String.fromCharCode(65 + optionIndex)), h("span", {}, option))))
          : h("form", { class: "answer-row", novalidate: true, onSubmit: async (event) => { event.preventDefault(); const field = event.currentTarget.querySelector("input"); const button = event.currentTarget.querySelector("button"); busy(button, true, "Checking"); const result = await submit(task.id, field.value, onUpdated); busy(button, false, "Check"); if (result && !result.correct) { toast("Not quite. Check your working and try again.", "info"); field.focus(); field.select(); } } }, h("input", { class: "input", name: "value", inputmode: task.kind === "number" ? "decimal" : "text", placeholder: task.kind === "number" ? "Enter the figure" : "Type your answer", value: task.correct ? task.value : "", disabled: Boolean(task.correct), "aria-label": `Answer for task ${index + 1}` }), h("button", { class: "button primary small", type: "submit", disabled: Boolean(task.correct) }, task.correct ? "Correct" : "Check"));
        body.push(input, task.correct ? h("div", { class: "slide-explanation good" }, h("strong", {}, `Correct (+${task.points} points). `), task.explanation) : task.attempts ? h("p", { class: "tiny muted" }, `${task.attempts} attempt${task.attempts === 1 ? "" : "s"} so far. ${task.hint ?? ""}`) : task.hint ? h("p", { class: "tiny muted" }, `Hint: ${task.hint}`) : null);
      } else if (task.type === "case") {
        const area = h("textarea", { class: "input", rows: 8, placeholder: `Write at least ${task.minWords} words. Refer to the scenario figures.`, disabled: task.status === "reviewed" }, task.value ?? "");
        const counter = h("span", { class: "tiny muted" }, `${(task.value ?? "").trim().split(/\s+/).filter(Boolean).length} words`);
        area.addEventListener("input", () => { counter.textContent = `${area.value.trim().split(/\s+/).filter(Boolean).length} words`; });
        body.push(h("div", { class: "rubric" }, h("strong", { class: "tiny" }, "A strong answer:"), h("ul", { class: "reader-bullets small" }, task.rubric.map(item => h("li", {}, item)))), area, h("div", { class: "form-actions between" }, counter, task.status === "reviewed" ? h("span", { class: "tag good" }, `Reviewed · ${task.earned}/${task.points} points`) : h("button", { class: "button primary small", type: "button", onClick: async (event) => { busy(event.currentTarget, true, "Submitting"); const result = await submit(task.id, area.value, onUpdated); if (result) toast(`Submitted. Rolevia reviews case answers within ${data.reviewDays} business days; points and feedback appear here.`, "success", 7000); else busy(event.currentTarget, false, task.status ? "Resubmit" : "Submit for review"); } }, task.status === "under_review" ? "Resubmit (replaces your answer)" : "Submit for review")), task.status === "under_review" ? h("p", { class: "tiny muted" }, `Submitted ${formatDate(task.submittedAt)} · under review. You can replace it until it is reviewed.`) : null, task.feedback ? h("div", { class: "callout tip" }, h("strong", {}, "Feedback: "), h("p", {}, task.feedback)) : null);
      } else {
        const urlInput = h("input", { class: "input", type: "url", placeholder: "https://… (view link to your sheet, board or document)", value: task.url ?? "", disabled: task.status === "reviewed" });
        const fileInput = h("input", { class: "input", type: "file", disabled: task.status === "reviewed" });
        body.push(h("p", { class: "small muted" }, h("strong", {}, "Must show: "), task.mustShow), h("div", { class: "form-grid two" }, h("label", { class: "field" }, h("span", { class: "field-label" }, "Link"), urlInput), h("label", { class: "field" }, h("span", { class: "field-label" }, "or a file (up to 400 KB)"), fileInput)), h("div", { class: "form-actions between" }, task.status === "reviewed" ? h("span", { class: "tag good" }, `Reviewed · ${task.earned}/${task.points} points`) : h("button", { class: "button primary small", type: "button", onClick: async (event) => { busy(event.currentTarget, true, "Submitting"); const file = fileInput.files[0] ? await readFileRecord(fileInput.files[0]) : null; const result = await submit(task.id, urlInput.value.trim() ? urlInput.value.trim() : file, onUpdated); if (result) toast("Evidence submitted for review.", "success"); else busy(event.currentTarget, false, "Submit evidence"); } }, task.status === "under_review" ? "Replace evidence" : "Submit evidence"), task.value && task.status ? h("span", { class: "tiny muted" }, `On file: ${task.value}`) : null), task.feedback ? h("div", { class: "callout tip" }, h("strong", {}, "Feedback: "), h("p", {}, task.feedback)) : null);
      }
      return h("section", { class: `reader-section task-card ${task.type} ${task.correct || task.status === "reviewed" ? "done" : ""}` }, h("h3", {}, h("span", { class: "reader-index" }, task.correct || task.status === "reviewed" ? icon("check", 14) : index + 1), `Task ${index + 1} · ${{ short: "Check your figure", case: "Case answer, reviewed by Rolevia", proof: "Evidence" }[task.type]}`, h("span", { class: "tiny muted task-points" }, `${task.points} points`)), h("p", { class: "task-prompt" }, task.prompt), ...body);
    }
    render(session);
    return host;
  });
  return portalShell(content, { active: "labs", title: `Lab · week ${week}`, user: user() });
}

// The interactive practice tool for a module (Rolevia Sheets lab, AI workbench or simulation).
export async function labToolPage({ id }) {
  const lab = LABS.find(item => item.id === id);
  if (!lab) return portalShell(empty("Practice tool not found.", h("a", { class: "button ghost", href: "#/portal/labs" }, "All labs")), { active: "labs", title: "Lab", user: user() });
  const content = await load(async () => {
    const data = await ctx.api.dashboard(withSession());
    if (!data.modules.some(module => module.id === id)) return empty(`Add ${moduleById(id).title} to your plan to open this practice tool.`, h("a", { class: "button primary", href: "#/portal/addons" }, "Add the module"));
    const status = h("div", { class: "lab-status" });
    const node = lab.render(async (score) => {
      try { const result = await ctx.api.completeLab(withSession({ labId: id, score })); status.replaceChildren(h("span", { class: "tag good" }, `Saved · best ${result.best}/100 · ${Math.round(result.best / 2)} points from this lab${result.pointsAwarded > 0 ? ` (+${result.pointsAwarded} just now)` : ""}`)); } catch (error) { status.replaceChildren(errorBox(error)); }
    });
    return h("div", { class: "lab-page" }, h("a", { class: "back-link", href: `#/portal/labs/${id}` }, icon("arrow", 14), `${moduleById(id).title} lab programme`), h("div", { class: "learn-head" }, h("div", {}, h("p", { class: "eyebrow" }, `${moduleById(id).title} · practice tool`), h("h2", {}, lab.title), h("p", { class: "muted" }, lab.summary)), status), h("div", { class: "card lab-card-frame" }, node));
  });
  return portalShell(content, { active: "labs", title: "Practice tool", user: user() });
}
