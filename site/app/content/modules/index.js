// Structured course material: one file per skill module plus the general interview bank.
// Served to enrolled learners through the API only; the live server never exposes this folder as static files.
import spreadsheets from "./spreadsheets.js";
import dashboards from "./dashboards.js";
import businessAi from "./business-ai.js";
import canva from "./canva.js";
import crm from "./crm.js";
import hrTracker from "./hr-tracker.js";
import trello from "./trello.js";
import budgeting from "./budgeting.js";
import interviewGeneral from "./interview-general.js";

export const COURSE_CONTENT = { spreadsheets, dashboards, "business-ai": businessAi, canva, crm, "hr-tracker": hrTracker, trello, budgeting };
export const INTERVIEW_GENERAL = interviewGeneral;
