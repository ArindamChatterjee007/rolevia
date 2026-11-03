// Schema check for structured course material (site/app/content/modules/<moduleId>.js).
// Used by the unit tests on CI and by scripts/check-content.mjs while authoring.
// Rules are deliberately strict: this material is sold to learners and read aloud in live classes.

export const ILLUSTRATIONS = ["spreadsheets", "dashboards", "business-ai", "canva", "crm", "hr-tracker", "trello", "budgeting", "live-class", "interview", "labs", "welcome"];
export const SLIDE_KINDS = ["title", "content", "steps", "question", "summary", "image"];
export const CALLOUT_TYPES = ["tip", "warning", "example", "definition"];
export const INTERVIEW_TYPES = ["concept", "scenario", "practical", "behavioural"];
// Marketing claims that must never appear inside course material.
const FORBIDDEN = /\b(guarantee[ds]?|placement|hiring partner|partnered|assured|100%)\b/i;

const isText = (value, min, max) => typeof value === "string" && value.trim().length >= min && value.trim().length <= max;
const each = (list, fn) => list.flatMap((item, index) => fn(item, index));

function checkText(path, value, min, max) {
  const errors = [];
  if (!isText(value, min, max)) errors.push(`${path}: expected text of ${min}-${max} characters`);
  else if (FORBIDDEN.test(value)) errors.push(`${path}: contains a forbidden claim word (${value.match(FORBIDDEN)[0]})`);
  else if (/https?:\/\//i.test(value)) errors.push(`${path}: links belong in admin materials, not in the text`);
  return errors;
}
const checkList = (path, list, min, max, itemMin, itemMax) => {
  if (!Array.isArray(list) || list.length < min || list.length > max) return [`${path}: expected ${min}-${max} items`];
  return each(list, (item, index) => checkText(`${path}[${index}]`, item, itemMin, itemMax));
};

export function validateSection(path, section) {
  const errors = [];
  if (!section || typeof section !== "object") return [`${path}: expected an object`];
  errors.push(...checkText(`${path}.heading`, section.heading, 3, 80));
  errors.push(...checkList(`${path}.body`, section.body, 1, 4, 40, 700));
  if (section.bullets !== undefined) errors.push(...checkList(`${path}.bullets`, section.bullets, 2, 8, 3, 160));
  if (section.steps !== undefined) errors.push(...checkList(`${path}.steps`, section.steps, 2, 8, 8, 220));
  if (section.callout !== undefined) {
    const callout = section.callout ?? {};
    if (!CALLOUT_TYPES.includes(callout.type)) errors.push(`${path}.callout.type: one of ${CALLOUT_TYPES.join("|")}`);
    errors.push(...checkText(`${path}.callout.title`, callout.title, 3, 80), ...checkText(`${path}.callout.text`, callout.text, 20, 400));
  }
  if (section.table !== undefined) {
    const table = section.table ?? {};
    if (!Array.isArray(table.columns) || table.columns.length < 2 || table.columns.length > 5) errors.push(`${path}.table.columns: 2-5 columns`);
    if (!Array.isArray(table.rows) || table.rows.length < 1 || table.rows.length > 8) errors.push(`${path}.table.rows: 1-8 rows`);
    else table.rows.forEach((row, index) => { if (!Array.isArray(row) || row.length !== table.columns?.length) errors.push(`${path}.table.rows[${index}]: must have ${table.columns?.length} cells`); else row.forEach((cell, cellIndex) => { if (!isText(String(cell), 1, 80)) errors.push(`${path}.table.rows[${index}][${cellIndex}]: cell text 1-80 characters`); }); });
  }
  return errors;
}

export function validateSlide(path, slide, { allowImage = false, illustrations = ILLUSTRATIONS } = {}) {
  const errors = [];
  if (!slide || typeof slide !== "object") return [`${path}: expected an object`];
  if (!SLIDE_KINDS.includes(slide.kind) || (slide.kind === "image" && !allowImage)) errors.push(`${path}.kind: one of ${SLIDE_KINDS.filter(kind => allowImage || kind !== "image").join("|")}`);
  errors.push(...checkText(`${path}.title`, slide.title, 2, 90));
  if (slide.subtitle !== undefined) errors.push(...checkText(`${path}.subtitle`, slide.subtitle, 3, 140));
  if (["content", "summary"].includes(slide.kind)) errors.push(...checkList(`${path}.bullets`, slide.bullets, 2, 6, 3, 140));
  if (slide.kind === "steps") errors.push(...checkList(`${path}.steps`, slide.steps, 2, 6, 8, 160));
  if (slide.kind === "question") {
    const question = slide.question ?? {};
    errors.push(...checkText(`${path}.question.prompt`, question.prompt, 10, 240));
    errors.push(...checkList(`${path}.question.options`, question.options, 4, 4, 1, 120));
    if (Array.isArray(question.options) && new Set(question.options).size !== question.options.length) errors.push(`${path}.question.options: must be distinct`);
    if (!Number.isInteger(question.answerIndex) || question.answerIndex < 0 || question.answerIndex > 3) errors.push(`${path}.question.answerIndex: 0-3`);
    errors.push(...checkText(`${path}.question.explanation`, question.explanation, 20, 300));
  }
  if (slide.illustration !== undefined && !illustrations.includes(slide.illustration)) errors.push(`${path}.illustration: one of ${illustrations.join("|")}`);
  if (slide.notes !== undefined) errors.push(...checkText(`${path}.notes`, slide.notes, 20, 600));
  return errors;
}

export function validateDeck(path, deck, { requireNotes = true } = {}) {
  const errors = [];
  if (!deck || typeof deck !== "object") return [`${path}: expected an object`];
  errors.push(...checkText(`${path}.title`, deck.title, 4, 90));
  if (!Array.isArray(deck.slides) || deck.slides.length < 8 || deck.slides.length > 18) return [...errors, `${path}.slides: 8-18 slides`];
  deck.slides.forEach((slide, index) => {
    errors.push(...validateSlide(`${path}.slides[${index}]`, slide));
    if (requireNotes && slide.notes === undefined) errors.push(`${path}.slides[${index}].notes: presenter notes are required`);
  });
  if (deck.slides[0]?.kind !== "title") errors.push(`${path}.slides[0]: first slide must be a title slide`);
  if (deck.slides.at(-1)?.kind !== "summary") errors.push(`${path}.slides: last slide must be a summary slide`);
  if (!deck.slides.some(slide => slide.kind === "question")) errors.push(`${path}.slides: include at least one question slide`);
  return errors;
}

export function validateCourseContent(content, { moduleId, labIds = [] }) {
  const errors = [];
  if (!content || typeof content !== "object") return ["content: expected an object"];
  if (content.moduleId !== moduleId) errors.push(`moduleId: expected ${moduleId}`);
  errors.push(...checkText("tagline", content.tagline, 20, 160));
  if (!Array.isArray(content.weeks) || content.weeks.length !== 2) errors.push("weeks: expected exactly 2 weeks");
  const lessonIds = new Set();
  (content.weeks ?? []).forEach((week, weekIndex) => {
    const path = `weeks[${weekIndex}]`;
    if (week?.week !== weekIndex + 1) errors.push(`${path}.week: expected ${weekIndex + 1}`);
    errors.push(...checkText(`${path}.theme`, week?.theme, 4, 90));
    if (!Array.isArray(week?.lessons) || week.lessons.length < 2 || week.lessons.length > 4) { errors.push(`${path}.lessons: 2-4 lessons`); return; }
    week.lessons.forEach((lesson, lessonIndex) => {
      const lpath = `${path}.lessons[${lessonIndex}]`;
      const expectedId = `${moduleId}-w${weekIndex + 1}-l${lessonIndex + 1}`;
      if (lesson?.id !== expectedId) errors.push(`${lpath}.id: expected ${expectedId}`);
      if (lessonIds.has(lesson?.id)) errors.push(`${lpath}.id: duplicate`); lessonIds.add(lesson?.id);
      errors.push(...checkText(`${lpath}.title`, lesson?.title, 4, 90));
      if (!Number.isInteger(lesson?.minutes) || lesson.minutes < 15 || lesson.minutes > 60) errors.push(`${lpath}.minutes: integer 15-60`);
      errors.push(...checkText(`${lpath}.objective`, lesson?.objective, 20, 240));
      if (!Array.isArray(lesson?.sections) || lesson.sections.length < 2 || lesson.sections.length > 6) errors.push(`${lpath}.sections: 2-6 sections`);
      else lesson.sections.forEach((section, sectionIndex) => errors.push(...validateSection(`${lpath}.sections[${sectionIndex}]`, section)));
      if (lesson?.practice !== null && lesson?.practice !== undefined) {
        if (!labIds.includes(lesson.practice?.labId)) errors.push(`${lpath}.practice.labId: one of ${labIds.join("|")}`);
        errors.push(...checkText(`${lpath}.practice.instruction`, lesson.practice?.instruction, 20, 300));
      }
      if (!Array.isArray(lesson?.checkpoint) || lesson.checkpoint.length < 2 || lesson.checkpoint.length > 4) errors.push(`${lpath}.checkpoint: 2-4 questions`);
      else lesson.checkpoint.forEach((item, itemIndex) => errors.push(...checkText(`${lpath}.checkpoint[${itemIndex}].question`, item?.question, 10, 200), ...checkText(`${lpath}.checkpoint[${itemIndex}].answer`, item?.answer, 10, 400)));
    });
  });
  if (lessonIds.size && (lessonIds.size < 4 || lessonIds.size > 8)) errors.push("lessons: 4-8 lessons across both weeks");
  errors.push(...validateDeck("deck", content.deck));
  const interview = content.interview ?? {};
  errors.push(...checkText("interview.intro", interview.intro, 40, 400));
  if (!Array.isArray(interview.questions) || interview.questions.length < 8 || interview.questions.length > 12) errors.push("interview.questions: 8-12 questions");
  else {
    interview.questions.forEach((item, index) => {
      const path = `interview.questions[${index}]`;
      errors.push(...checkText(`${path}.question`, item?.question, 10, 220));
      if (!INTERVIEW_TYPES.includes(item?.type)) errors.push(`${path}.type: one of ${INTERVIEW_TYPES.join("|")}`);
      errors.push(...checkList(`${path}.answerGuide`, item?.answerGuide, 3, 6, 10, 220));
      errors.push(...checkText(`${path}.tip`, item?.tip, 10, 220));
    });
    for (const type of INTERVIEW_TYPES) if (!interview.questions.some(item => item?.type === type)) errors.push(`interview.questions: include at least one ${type} question`);
  }
  if (!Array.isArray(content.glossary) || content.glossary.length < 6 || content.glossary.length > 12) errors.push("glossary: 6-12 terms");
  else content.glossary.forEach((item, index) => errors.push(...checkText(`glossary[${index}].term`, item?.term, 2, 40), ...checkText(`glossary[${index}].definition`, item?.definition, 20, 240)));
  return errors;
}

// General (cross-module) interview bank: site/app/content/modules/interview-general.js
export function validateInterviewBank(bank) {
  const errors = [];
  if (!bank || typeof bank !== "object") return ["bank: expected an object"];
  errors.push(...checkText("intro", bank.intro, 40, 500));
  if (!Array.isArray(bank.sections) || bank.sections.length < 3 || bank.sections.length > 6) return [...errors, "sections: 3-6 sections"];
  bank.sections.forEach((section, sectionIndex) => {
    const path = `sections[${sectionIndex}]`;
    errors.push(...checkText(`${path}.title`, section?.title, 4, 80), ...checkText(`${path}.summary`, section?.summary, 20, 300));
    if (!Array.isArray(section?.questions) || section.questions.length < 4 || section.questions.length > 8) { errors.push(`${path}.questions: 4-8 questions`); return; }
    section.questions.forEach((item, index) => {
      const qpath = `${path}.questions[${index}]`;
      errors.push(...checkText(`${qpath}.question`, item?.question, 10, 220), ...checkList(`${qpath}.answerGuide`, item?.answerGuide, 3, 6, 10, 220), ...checkText(`${qpath}.tip`, item?.tip, 10, 220));
    });
  });
  if (!Array.isArray(bank.starStories) || bank.starStories.length < 2 || bank.starStories.length > 4) errors.push("starStories: 2-4 worked examples");
  else bank.starStories.forEach((story, index) => { for (const key of ["situation", "task", "action", "result"]) errors.push(...checkText(`starStories[${index}].${key}`, story?.[key], 20, 400)); errors.push(...checkText(`starStories[${index}].title`, story?.title, 4, 90)); });
  return errors;
}
