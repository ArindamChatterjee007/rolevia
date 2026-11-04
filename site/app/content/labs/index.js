// Eight-week lab programmes per module: scenarios, datasets, checked tasks and reviewed case work.
// Delivered through the API to enrolled learners only; never served as static files by the live server.
import spreadsheets from "./spreadsheets.js";
import dashboards from "./dashboards.js";
import businessAi from "./business-ai.js";
import canva from "./canva.js";
import crm from "./crm.js";
import hrTracker from "./hr-tracker.js";
import trello from "./trello.js";
import budgeting from "./budgeting.js";

export const LAB_PROGRAMMES = { spreadsheets, dashboards, "business-ai": businessAi, canva, crm, "hr-tracker": hrTracker, trello, budgeting };
