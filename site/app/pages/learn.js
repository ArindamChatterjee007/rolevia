// Learn: structured course material per module (tabs), lesson reader, view-only slides and interview prep.
// Material arrives through the API for enrolled learners only; nothing on these pages offers a file download.
import { h, icon, ring, toast, busy, formatDate, modal, formatBytes } from "../ui.js";
import { ctx, withSession } from "../context.js";
import { errorBox, empty } from "./components.js";
import { portalShell, load, user, moduleById } from "./portal.js";
import { LABS } from "./labs.js";
import { classCard } from "./classes.js";
import { deckViewer, illustration } from "./deck.js";

const TABS = [["overview", "Overview", "grid"], ["lessons", "Lessons", "book"], ["slides", "Slides", "play"], ["lab", "Practice lab", "lab"], ["interview", "Interview questions", "spark"], ["classes", "Live classes", "bell"], ["glossary", "Glossary", "clipboard"]];
const setQuery = (moduleId, params) => history.replaceState(null, "", `${location.pathname}${location.search}#/portal/learn/${moduleId}?${new URLSearchParams(params)}`);
const slug = (text) => String(text).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export function renderSection(section, index) {
  const id = `s-${index + 1}-${slug(section.heading)}`;
  return h("section", { class: "reader-section", id },
    h("h3", {}, h("span", { class: "reader-index" }, index + 1), section.heading),
    ...(section.body ?? []).map(paragraph => h("p", {}, paragraph)),
    section.bullets ? h("ul", { class: "reader-bullets" }, section.bullets.map(item => h("li", {}, item))) : null,
    section.steps ? h("ol", { class: "reader-steps" }, section.steps.map(item => h("li", {}, item))) : null,
    section.callout ? h("aside", { class: `callout ${section.callout.type}` }, h("strong", {}, { tip: "Tip", warning: "Watch out", example: "Example", definition: "Definition" }[section.callout.type] ?? "Note", ": ", section.callout.title), h("p", {}, section.callout.text)) : null,
    section.table ? h("div", { class: "table-wrap" }, h("table", { class: "data-table reader-table" }, h("thead", {}, h("tr", {}, section.table.columns.map(column => h("th", {}, column)))), h("tbody", {}, section.table.rows.map(row => h("tr", {}, row.map(cell => h("td", {}, String(cell)))))))) : null);
}

function lessonReader(data, moduleId, lesson, all) {
  const position = all.findIndex(item => item.id === lesson.id);
  const previous = all[position - 1];
  const next = all[position + 1];
  const lab = LABS.find(item => item.id === lesson.practice?.labId);
  const complete = h("button", { class: `button ${lesson.done ? "ghost" : "primary"}`, type: "button", disabled: lesson.done, onClick: async (event) => {
    busy(event.currentTarget, true, "Saving");
    try { await ctx.api.completeLesson(withSession({ lessonId: lesson.id })); toast("Lesson marked complete: +5 points.", "success"); location.hash = next ? `#/portal/learn/${moduleId}?lesson=${next.id}` : `#/portal/learn/${moduleId}?tab=lessons`; }
    catch (error) { toast(error.message, "error"); busy(event.currentTarget, false); }
  } }, icon("check", 16), lesson.done ? "Completed" : next ? "Mark complete and continue" : "Mark complete");
  const toc = h("nav", { class: "reader-toc", "aria-label": "Sections" }, h("strong", { class: "tiny muted" }, "In this lesson"), h("ol", {}, lesson.sections.map((section, index) => h("li", {}, h("a", { href: `#/portal/learn/${moduleId}?lesson=${lesson.id}`, onClick: (event) => { event.preventDefault(); document.getElementById(`s-${index + 1}-${slug(section.heading)}`)?.scrollIntoView({ behavior: "smooth", block: "start" }); } }, section.heading))), lesson.practice ? h("li", {}, h("a", { href: "#practice", onClick: (event) => { event.preventDefault(); document.getElementById("practice")?.scrollIntoView({ behavior: "smooth" }); } }, "Practice")) : null, h("li", {}, h("a", { href: "#checkpoint", onClick: (event) => { event.preventDefault(); document.getElementById("checkpoint")?.scrollIntoView({ behavior: "smooth" }); } }, "Checkpoint"))));
  return h("div", { class: "reader" },
    h("a", { class: "back-link", href: `#/portal/learn/${moduleId}?tab=lessons` }, icon("arrow", 14), "All lessons"),
    h("header", { class: "reader-head" }, h("p", { class: "eyebrow" }, `Week ${lesson.week} · Lesson ${position + 1} of ${all.length} · ${lesson.minutes} min`), h("h2", {}, lesson.title), h("p", { class: "lead" }, lesson.objective)),
    h("div", { class: "reader-grid" }, toc, h("div", { class: "reader-body" },
      lesson.sections.map(renderSection),
      lesson.practice && lab ? h("section", { class: "reader-section practice", id: "practice" }, h("h3", {}, h("span", { class: "reader-index" }, icon("lab", 16)), "Practice in the lab"), h("div", { class: "practice-card" }, illustration("labs", { class: "practice-art" }), h("div", {}, h("strong", {}, lab.title), h("p", {}, lesson.practice.instruction), h("a", { class: "button primary small", href: `#/portal/labs/${lab.id}` }, icon("lab", 14), "Open the lab")))) : null,
      h("section", { class: "reader-section", id: "checkpoint" }, h("h3", {}, h("span", { class: "reader-index" }, icon("quiz", 16)), "Checkpoint"), h("p", { class: "small muted" }, "Answer in your own words first, then open the model answer."), lesson.checkpoint.map(item => h("details", { class: "checkpoint" }, h("summary", {}, item.question), h("p", {}, item.answer)))),
      h("div", { class: "reader-actions" }, previous ? h("a", { class: "button ghost small", href: `#/portal/learn/${moduleId}?lesson=${previous.id}` }, h("span", { class: "icon-flip" }, icon("arrow", 14)), "Previous") : h("span"), complete, next ? h("a", { class: "button ghost small", href: `#/portal/learn/${moduleId}?lesson=${next.id}` }, "Next lesson", icon("arrow", 14)) : h("span")))));
}

function materialViewer(material) {
  const file = material.attachment;
  const type = file?.type ?? "";
  let body;
  if (!file?.dataUrl) body = h("p", { class: "muted" }, "This material is listed by name only in the preview. Your instructor shares a view link for the real file.");
  else if (type.startsWith("image/")) body = h("img", { class: "material-image", src: file.dataUrl, alt: file.name, draggable: false });
  else if (type === "application/pdf") body = h("iframe", { class: "material-frame", src: `${file.dataUrl}#toolbar=0&navpanes=0`, title: file.name });
  else body = h("p", { class: "muted" }, `Preview is not available for ${file.name}. Ask your instructor to share it as a view link.`);
  modal({ title: material.title, body: h("div", { class: "material-view", onContextmenu: (event) => event.preventDefault() }, body, h("p", { class: "tiny muted" }, `${file ? `${file.name} · ${formatBytes(file.size)} · ` : ""}View only. Course material stays inside Rolevia.`)), actions: [{ label: "Close" }] });
}

function overviewTab(data, meta, lessons) {
  const next = lessons.find(lesson => !lesson.done) ?? lessons[0];
  return h("div", { class: "stack" },
    h("div", { class: "overview-hero" }, h("div", {}, h("p", { class: "lead" }, data.course?.tagline ?? meta.label), h("p", { class: "small muted" }, meta.bestFor), next ? h("a", { class: "button primary", href: `#/portal/learn/${meta.id}?lesson=${next.id}` }, icon("play", 16), data.progress.done ? `Continue: ${next.title}` : `Start: ${next.title}`) : null), h("div", { class: "overview-progress" }, ring(data.progress.total ? data.progress.done / data.progress.total : 0, { size: 96, stroke: 8, label: "complete" }), h("span", { class: "tiny muted" }, `${data.progress.done}/${data.progress.total} lessons`))),
    h("div", { class: "grid-2" },
      h("div", { class: "card" }, h("h3", {}, icon("check", 18), "What you will be able to do"), h("ul", { class: "ticks" }, meta.outcomes.map(item => h("li", {}, icon("check", 14), item))), h("p", { class: "tiny muted" }, `Prerequisite: ${meta.prerequisite}`)),
      h("div", { class: "card" }, h("h3", {}, icon("clipboard", 18), "Final project"), h("p", { class: "small" }, meta.capstone), h("p", { class: "small muted" }, `Assessed on: ${meta.assessment}`), h("a", { class: "link-button", href: "#/portal/assignments" }, "Open assignments"))),
    data.course ? h("div", { class: "card" }, h("h3", {}, icon("book", 18), "Two-week plan"), h("div", { class: "week-grid" }, data.course.weeks.map(week => h("div", { class: "week" }, h("p", { class: "eyebrow" }, `Week ${week.week}`), h("strong", {}, week.theme), h("ol", { class: "week-lessons" }, week.lessons.map(lesson => h("li", { class: lesson.done ? "done" : "" }, h("a", { href: `#/portal/learn/${meta.id}?lesson=${lesson.id}` }, lesson.title), h("span", { class: "tiny muted" }, ` · ${lesson.minutes} min`)))))))) : null);
}

function lessonsTab(data, meta, lessons) {
  return h("div", { class: "stack" },
    data.course ? data.course.weeks.map(week => h("section", { class: "card" }, h("div", { class: "card-head" }, h("div", {}, h("p", { class: "eyebrow" }, `Week ${week.week}`), h("h3", {}, week.theme))), h("div", { class: "lesson-list" }, week.lessons.map(lesson => { const position = lessons.findIndex(item => item.id === lesson.id) + 1; return h("a", { class: `lesson ${lesson.done ? "done" : ""}`, href: `#/portal/learn/${meta.id}?lesson=${lesson.id}` }, h("span", { class: "lesson-index" }, lesson.done ? icon("check", 14) : position), h("div", { class: "grow" }, h("strong", {}, lesson.title), h("p", { class: "small muted" }, lesson.objective), h("span", { class: "tiny muted" }, `${lesson.minutes} min · ${lesson.sections.length} sections${lesson.practice ? " · lab practice" : ""} · ${lesson.checkpoint.length} checkpoint questions`)), icon("arrow", 16)); }))))
      : h("div", { class: "card" }, h("p", { class: "muted" }, "Structured lessons for this module are being prepared.")),
    h("section", { class: "card" }, h("div", { class: "card-head" }, h("h3", {}, icon("play", 18), "Recordings and materials from your instructor"), h("span", { class: "tiny muted" }, "View only, inside Rolevia")), data.materials.length ? h("div", { class: "lesson-list" }, data.materials.map(material => h("div", { class: `lesson ${material.done ? "done" : ""}` }, h("span", { class: "lesson-index" }, icon(material.type === "video" ? "play" : material.type === "task" ? "clipboard" : "book", 14)), h("div", { class: "grow" }, h("strong", {}, material.title), material.summary ? h("p", { class: "small muted" }, material.summary) : null, h("span", { class: "tiny muted" }, `${material.type} · ${material.minutes} min${material.output ? ` · you create: ${material.output}` : ""}`)), material.url ? h("a", { class: "button ghost small", href: material.url, target: "_blank", rel: "noopener noreferrer" }, "Open recording") : material.attachment ? h("button", { class: "button ghost small", type: "button", onClick: () => materialViewer(material) }, icon("eye", 14), "View") : h("span", { class: "tiny muted" }, "Added before the batch starts")))) : h("p", { class: "muted small" }, "Recordings and worksheets appear here when your instructor adds them.")));
}

function slidesTab(data, meta) {
  const pending = data.classes.filter(item => item.deckId && item.deckStatus !== "published");
  return h("div", { class: "stack" },
    data.decks.length ? h("div", { class: "cards-grid" }, data.decks.map(deck => h("a", { class: `card deck-card accent-${meta.accent}`, href: `#/portal/slides/${deck.id}` }, illustration(meta.id, { class: "deck-card-art" }), h("h3", {}, deck.title), h("p", { class: "small muted" }, `${deck.slideCount} slides · published ${formatDate(deck.publishedAt ?? deck.updatedAt)}`), h("span", { class: "button ghost small" }, icon("play", 14), "Open slides")))) : h("div", { class: "card" }, h("p", { class: "muted" }, "No slides are published for this module yet. Your instructor shares the workshop slides after the live class.")),
    pending.length ? h("div", { class: "alert info" }, icon("info", 16), h("span", {}, `${pending.length} deck${pending.length === 1 ? " is" : "s are"} shown live in class and published afterwards: ${pending.map(item => item.deckTitle).join(", ")}.`)) : null,
    h("p", { class: "tiny muted" }, "Slides open inside Rolevia with your name on them. There is no download; come back any time during your access period."));
}

function labTab(data, meta, lessons) {
  const lab = LABS.find(item => item.id === meta.id);
  const linked = lessons.filter(lesson => lesson.practice?.labId === meta.id);
  return h("div", { class: "card lab-promo" }, illustration("labs", { class: "lab-promo-art" }), h("div", { class: "stack" }, h("p", { class: "eyebrow" }, "Interactive lab"), h("h3", {}, lab?.title ?? "Practice lab"), h("p", { class: "small" }, lab?.summary), linked.length ? h("p", { class: "small muted" }, `Used in: ${linked.map(lesson => lesson.title).join(" · ")}`) : null, h("p", { class: "tiny muted" }, "Labs award up to 50 points; your best score counts on the leaderboard."), h("a", { class: "button primary", href: `#/portal/labs/${meta.id}` }, icon("lab", 16), "Open the lab")));
}

export function interviewList(interview) {
  return h("div", { class: "stack" }, interview.intro ? h("p", { class: "muted" }, interview.intro) : null, h("div", { class: "qa-list" }, interview.questions.map((item, index) => h("details", { class: "qa" }, h("summary", {}, h("span", { class: "qa-index" }, index + 1), h("span", { class: "grow" }, item.question), item.type ? h("span", { class: `tag ${item.type}` }, item.type) : null), h("div", { class: "qa-body" }, h("p", { class: "tiny muted" }, "Answer guide: adapt these points to your own example."), h("ul", { class: "reader-bullets" }, item.answerGuide.map(point => h("li", {}, point))), item.tip ? h("p", { class: "qa-tip" }, h("strong", {}, "Tip: "), item.tip) : null)))));
}

function interviewTab(data) {
  return h("div", { class: "stack" }, data.course?.interview ? interviewList(data.course.interview) : h("div", { class: "card" }, h("p", { class: "muted" }, "Interview questions for this module are being prepared.")), h("a", { class: "button ghost", href: "#/portal/interview" }, icon("spark", 16), "General interview preparation"));
}

function glossaryTab(data) {
  return data.course?.glossary ? h("div", { class: "card" }, h("dl", { class: "glossary" }, data.course.glossary.map(item => [h("dt", {}, item.term), h("dd", {}, item.definition)]))) : h("div", { class: "card" }, h("p", { class: "muted" }, "The glossary is being prepared."));
}

export async function learnPage({ moduleId }, query = {}) {
  const content = await load(async () => {
    const data = await ctx.api.lessons(withSession({ moduleId }));
    const meta = moduleById(moduleId) ?? data.module;
    const lessons = (data.course?.weeks ?? []).flatMap(week => week.lessons.map(lesson => ({ ...lesson, week: week.week })));
    if (query.lesson) {
      const lesson = lessons.find(item => item.id === query.lesson);
      if (!lesson) return empty("That lesson does not exist.", h("a", { class: "button ghost", href: `#/portal/learn/${moduleId}?tab=lessons` }, "All lessons"));
      return lessonReader(data, moduleId, lesson, lessons);
    }
    let active = TABS.some(([key]) => key === query.tab) ? query.tab : "overview";
    const panel = h("div", { class: "learn-panel" });
    const tabs = h("div", { class: "learn-tabs", role: "tablist" });
    const render = () => {
      tabs.replaceChildren(...TABS.map(([key, label, iconName]) => h("button", { type: "button", role: "tab", class: key === active ? "active" : "", "aria-selected": String(key === active), "data-tab": key, onClick: () => { active = key; setQuery(moduleId, { tab: key }); render(); } }, icon(iconName, 16), label, key === "slides" && data.decks.length ? h("span", { class: "count" }, data.decks.length) : null, key === "classes" && data.classes.some(item => item.status === "live") ? h("span", { class: "count live" }, "live") : null)));
      panel.replaceChildren({ overview: () => overviewTab(data, meta, lessons), lessons: () => lessonsTab(data, meta, lessons), slides: () => slidesTab(data, meta), lab: () => labTab(data, meta, lessons), interview: () => interviewTab(data), classes: () => h("div", { class: "stack" }, data.classes.length ? data.classes.map(item => classCard(item)) : h("div", { class: "card" }, h("p", { class: "muted" }, "No live class is scheduled for this module yet.")), h("a", { class: "button ghost", href: "#/portal/classes" }, "All live classes")), glossary: () => glossaryTab(data) }[active]());
    };
    render();
    return h("div", { class: `learn accent-${meta.accent}` },
      h("a", { class: "back-link", href: "#/portal/skills" }, icon("arrow", 14), "My skills"),
      h("div", { class: "learn-head" }, h("div", {}, h("p", { class: "eyebrow" }, `Skill ${meta.code} · ${meta.tool}`), h("h2", {}, meta.title), h("p", { class: "muted" }, meta.label)), illustration(meta.id, { class: "learn-art" })),
      tabs, panel);
  });
  return portalShell(content, { active: "skills", title: "Learn", user: user() });
}

export async function slidesPage({ deckId }) {
  const content = await load(async () => {
    let deck;
    try { deck = await ctx.api.deck(withSession({ deckId })); }
    catch (error) { return h("div", { class: "stack" }, errorBox(error), h("a", { class: "button ghost", href: "#/portal/skills" }, "Back to my skills")); }
    const meta = moduleById(deck.moduleId);
    const viewer = deckViewer(deck, { watermark: deck.watermark, accent: meta ? `accent-${meta.accent}` : "" });
    return h("div", { class: "stack" }, h("a", { class: "back-link", href: `#/portal/learn/${deck.moduleId}?tab=slides` }, icon("arrow", 14), meta?.title ?? "Module"), h("div", { class: "card-head" }, h("div", {}, h("p", { class: "eyebrow" }, "Published slides · view only"), h("h2", {}, deck.title)), h("span", { class: "tiny muted" }, "Use the arrow keys or the buttons. Questions reveal their answer when you choose.")), viewer.element);
  });
  return portalShell(content, { active: "skills", title: "Slides", user: user() });
}

export async function interviewPrepPage() {
  const content = await load(async () => {
    const data = await ctx.api.interviewPrep(withSession());
    const general = data.general;
    return h("div", { class: "stack" },
      h("div", { class: "overview-hero" }, h("div", {}, h("p", { class: "lead" }, general?.intro ?? "Interview preparation for business roles."), h("p", { class: "small muted" }, "Model answers are guides, not scripts: adapt every point to your own evidence from the modules.")), illustration("interview", { class: "hero-art" })),
      general ? h("div", { class: "stack" }, general.sections.map(section => h("section", { class: "card" }, h("h3", {}, section.title), h("p", { class: "small muted" }, section.summary), interviewList({ questions: section.questions }))), h("section", { class: "card" }, h("h3", {}, icon("star", 18), "Worked STAR examples"), h("div", { class: "star-grid" }, general.starStories.map(story => h("article", { class: "star" }, h("strong", {}, story.title), [["Situation", story.situation], ["Task", story.task], ["Action", story.action], ["Result", story.result]].map(([label, text]) => h("p", {}, h("span", { class: "star-label" }, label), text))))))) : null,
      data.modules.length ? h("section", { class: "card" }, h("h3", {}, icon("book", 18), "Questions from your modules"), data.modules.map(module => h("details", { class: "module-qa" }, h("summary", {}, h("strong", {}, module.title), h("span", { class: "tiny muted" }, ` · ${module.interview.questions.length} questions`)), interviewList(module.interview)))) : null);
  });
  return portalShell(content, { active: "interview", title: "Interview prep", user: user() });
}
