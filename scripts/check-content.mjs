// Authoring aid: node scripts/check-content.mjs [moduleId ...]
// Imports each content module and prints schema problems. Syntax/structure only; nothing is built or served.
import { validateCourseContent, validateInterviewBank, validateLabProgramme } from "../site/app/content/modules/validate.mjs";
import { readFile } from "node:fs/promises";

const curriculum = JSON.parse(await readFile(new URL("../site/data/curriculum.json", import.meta.url), "utf8"));
const labIds = curriculum.modules.map(module => module.id);
const requested = process.argv.slice(2);
const targets = requested.length ? requested : [...labIds, "interview-general", ...labIds.map(id => `labs/${id}`)];
let failed = 0;
for (const id of targets) {
  try {
    const isLab = id.startsWith("labs/");
    const { default: content } = await import(isLab ? `../site/app/content/${id}.js` : `../site/app/content/modules/${id}.js`);
    const errors = isLab ? validateLabProgramme(content, { moduleId: id.slice(5) }) : id === "interview-general" ? validateInterviewBank(content) : validateCourseContent(content, { moduleId: id, labIds });
    if (errors.length) { failed += 1; console.log(`✘ ${id}: ${errors.length} problem(s)`); for (const error of errors.slice(0, 40)) console.log(`   - ${error}`); if (errors.length > 40) console.log(`   … ${errors.length - 40} more`); }
    else {
      if (isLab) { const tasks = content.sessions.reduce((sum, session) => sum + session.tasks.length, 0); console.log(`✓ ${id}: ok (8 sessions, ${tasks} tasks, ${content.sessions.reduce((sum, session) => sum + session.tasks.filter(task => task.type === "case").length, 0)} case tasks)`); continue; }
      const lessons = id === "interview-general" ? content.sections.reduce((sum, section) => sum + section.questions.length, 0) : content.weeks.reduce((sum, week) => sum + week.lessons.length, 0);
      console.log(`✓ ${id}: ok (${id === "interview-general" ? `${lessons} questions` : `${lessons} lessons, ${content.deck.slides.length} slides, ${content.interview.questions.length} interview questions`})`);
    }
  } catch (error) { failed += 1; console.log(`✘ ${id}: ${error.message.split("\n")[0]}`); }
}
process.exit(failed ? 1 : 0);
