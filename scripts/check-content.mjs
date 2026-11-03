// Authoring aid: node scripts/check-content.mjs [moduleId ...]
// Imports each content module and prints schema problems. Syntax/structure only; nothing is built or served.
import { validateCourseContent, validateInterviewBank } from "../site/app/content/modules/validate.mjs";
import { readFile } from "node:fs/promises";

const curriculum = JSON.parse(await readFile(new URL("../site/data/curriculum.json", import.meta.url), "utf8"));
const labIds = curriculum.modules.map(module => module.id);
const requested = process.argv.slice(2);
const targets = requested.length ? requested : [...labIds, "interview-general"];
let failed = 0;
for (const id of targets) {
  try {
    const { default: content } = await import(`../site/app/content/modules/${id}.js`);
    const errors = id === "interview-general" ? validateInterviewBank(content) : validateCourseContent(content, { moduleId: id, labIds });
    if (errors.length) { failed += 1; console.log(`✘ ${id}: ${errors.length} problem(s)`); for (const error of errors.slice(0, 40)) console.log(`   - ${error}`); if (errors.length > 40) console.log(`   … ${errors.length - 40} more`); }
    else {
      const lessons = id === "interview-general" ? content.sections.reduce((sum, section) => sum + section.questions.length, 0) : content.weeks.reduce((sum, week) => sum + week.lessons.length, 0);
      console.log(`✓ ${id}: ok (${id === "interview-general" ? `${lessons} questions` : `${lessons} lessons, ${content.deck.slides.length} slides, ${content.interview.questions.length} interview questions`})`);
    }
  } catch (error) { failed += 1; console.log(`✘ ${id}: ${error.message.split("\n")[0]}`); }
}
process.exit(failed ? 1 : 0);
