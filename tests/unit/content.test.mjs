import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { COURSE_CONTENT, INTERVIEW_GENERAL } from "../../site/app/content/modules/index.js";
import { validateCourseContent, validateInterviewBank } from "../../site/app/content/modules/validate.mjs";

const curriculum = JSON.parse(await readFile(new URL("../../site/data/curriculum.json", import.meta.url), "utf8"));
const labIds = curriculum.modules.map(module => module.id);

test("every skill module ships structured lessons, a workshop deck, interview questions and a glossary that pass the schema", () => {
  const seen = new Set();
  for (const module of curriculum.modules) {
    const content = COURSE_CONTENT[module.id];
    assert.ok(content, `${module.id} has course content`);
    const errors = validateCourseContent(content, { moduleId: module.id, labIds });
    assert.deepEqual(errors, [], `${module.id}: ${errors.slice(0, 5).join(" | ")}`);
    for (const week of content.weeks) for (const lesson of week.lessons) { assert.ok(!seen.has(lesson.id), `duplicate lesson id ${lesson.id}`); seen.add(lesson.id); }
    assert.ok(content.weeks.flatMap(week => week.lessons).filter(lesson => lesson.practice).length >= 2, `${module.id}: at least two lessons practise in the lab`);
    assert.equal(content.deck.slides[0].illustration, module.id, `${module.id}: title slide uses the module illustration`);
  }
  assert.equal(seen.size >= 32, true, "at least four lessons per module");
});

test("the general interview bank passes its schema and covers behavioural preparation", () => {
  assert.deepEqual(validateInterviewBank(INTERVIEW_GENERAL), []);
  assert.ok(INTERVIEW_GENERAL.sections.some(section => /STAR|behavioural/i.test(section.title)));
});

test("every module ships an eight-week lab programme with checkable tasks and reviewed case work", async () => {
  const { LAB_PROGRAMMES } = await import("../../site/app/content/labs/index.js");
  const { validateLabProgramme } = await import("../../site/app/content/modules/validate.mjs");
  for (const module of curriculum.modules) {
    const programme = LAB_PROGRAMMES[module.id];
    assert.ok(programme, `${module.id} has a lab programme`);
    const errors = validateLabProgramme(programme, { moduleId: module.id });
    assert.deepEqual(errors, [], `${module.id}: ${errors.slice(0, 5).join(" | ")}`);
    const tasks = programme.sessions.flatMap(session => session.tasks);
    assert.ok(tasks.filter(task => task.type === "short").length >= 16, `${module.id}: at least 16 checkable tasks`);
    assert.ok(tasks.filter(task => task.type === "case").length >= 8, `${module.id}: at least one case per week`);
    assert.ok(programme.sessions[7].tasks.some(task => task.type === "proof"), `${module.id}: the capstone week asks for evidence`);
  }
});
