// Original Rolevia learning content. Drafted with an AI research lane (requested model GPT-6 Astra, runtime identity unverified),
// then checked by the coordinator for arithmetic, structure and claims. Fictional data only.
export const ASSIGNMENT_BRIEFS = {
  "spreadsheets": {
    "title": "Business Spreadsheets: Checked Shop Workbook",
    "brief": "Use the supplied fictional shop's messy sales file in Google Sheets or Excel. Build a reusable workbook with preserved raw data, a clean-data tab, checked formulas and a management summary. Finish with a short decision note that distinguishes the observed finding from assumptions.",
    "acceptance": [
      "Create one transaction per clean-data row, standardise dates, provide a column dictionary and document duplicate or missing-value handling while preserving the raw tab.",
      "Use IF, SUMIFS, COUNTIFS and an exact-match lookup; include at least two labelled test cases for each formula and reconcile the sales total.",
      "Provide a product-by-region pivot summary and a decision note containing one supported recommendation, one assumption and the relevant source figures."
    ],
    "maxScore": 100
  },
  "dashboards": {
    "title": "Dashboard Building: Sales-Team Report",
    "brief": "In Google Data Studio, connect the supplied fictional sales CSV or Google Sheet and build a one-page dashboard for a sales manager. Define three KPIs, add two filters and use the report to support one recommendation. Include source checks rather than treating attractive charts as proof of accuracy.",
    "acceptance": [
      "Show exactly three KPIs with definitions, units and reporting periods; include scorecards and a labelled comparison chart tied to the source.",
      "Provide working date and region filters; document expected and observed results for a combined-filter test and a no-records test.",
      "Complete a five-point validation checklist covering source connection, KPI definitions, all KPI-to-source reconciliations, filter behaviour and missing/empty-data handling; add one supported recommendation."
    ],
    "maxScore": 100
  },
  "business-ai": {
    "title": "AI for MBA & Business: Checked Decision Pack",
    "brief": "Use ChatGPT, a comparable assistant or supplied example outputs to assess two fictional service options. Prepare a business prompt, checked comparison matrix, spreadsheet cross-check, short decision memo and correction log. Finish with a stakeholder email, meeting summary and slide outline. Use only fictional records and distinguish supplied evidence from assumptions.",
    "acceptance": [
      "Submit a prompt naming the task, audience, constraints and acceptance checks; use fictional inputs only, never customer data, resumes, credentials or employer documents.",
      "Trace comparison claims to labelled fictional source documents, mark unsupported claims, recalculate all numeric claims in a spreadsheet and log corrections or unresolved discrepancies.",
      "Submit a memo, stakeholder email, meeting summary and slide outline that agree on the decision, flag uncertainty, disclose AI assistance and avoid unmeasured savings claims."
    ],
    "maxScore": 100
  },
  "canva": {
    "title": "Canva for Business Communication: Fictional Business Pitch",
    "brief": "In Canva Free, create a five-slide pitch and matching one-page brief for a fictional business idea. Use an audience-specific story, consistent design and one chart checked against a fictional data table. Finish with a clear next-step request and rehearse a three-minute explanation using only original or appropriately licensed assets.",
    "acceptance": [
      "Submit five slides covering audience/problem, proposal, evidence, costs or risks, and a specific next-step request; include a matching one-page brief.",
      "Use consistent headings, fonts and spacing; provide one labelled chart with units, an honest caption and a matching fictional source table.",
      "Export both deliverables, proofread them, document a rehearsal lasting at most three minutes and list asset origins, licences and required attribution."
    ],
    "maxScore": 100
  },
  "crm": {
    "title": "CRM & Sales Pipeline: Twenty-Opportunity Handover",
    "brief": "Use HubSpot CRM or the supplied practice workbook to manage 20 fictional opportunities. Separate contacts, companies, deals and activities; define a simple pipeline; and record meaningful follow-ups. Submit the pipeline, clean activity notes, a short funnel review and a sales-to-service handover. Do not scrape real prospects, send messages or activate automation.",
    "acceptance": [
      "Record exactly 20 unique fictional opportunities with contact/company links, stage history, amounts, owners and dated next actions for open deals.",
      "Provide dated activity notes and a handover naming the receiving owner, agreed scope, promised dates, unresolved questions and next action for one closed-won practice deal.",
      "Report one stage-conversion percentage with an explicit same-cohort denominator, reconcile opportunity counts and recommend one evidence-backed process improvement."
    ],
    "maxScore": 100
  },
  "hr-tracker": {
    "title": "Hiring Tracker & HR Reporting: Fifteen-Applicant Audit",
    "brief": "In Google Sheets or Excel, build a tracker for 15 fictional applicants to one fictional role. Define the workflow and job-related criteria, record stage dates and follow-ups, and apply a consistent interview scorecard. Submit a recruitment summary, onboarding checklist and audit trail. Do not use real candidate documents or make actual hiring decisions.",
    "acceptance": [
      "Include exactly 15 fictional applicant IDs, a role brief, defined stages and owners, validated stage fields, stage dates and dated follow-ups where required.",
      "Use one job-relevant scorecard with consistent criteria and scoring definitions; record observable evidence, log corrections and flag unresolved discrepancies for a named reviewer.",
      "Reconcile all 15 records in a recruitment summary, define and check interview-to-offer conversion and time-to-fill, and include an onboarding checklist with owners."
    ],
    "maxScore": 100
  },
  "trello": {
    "title": "Task & Project Boards: Fifteen-Task Workshop Launch",
    "brief": "Plan a fictional workshop launch in Trello Free or the supplied task-board template. Break the work into 15 deliverable tasks, make ownership and dependencies visible, and maintain a risk list. Show one realistic status update, respond to one late scope change and prepare a short handover without claiming that the workshop actually happened.",
    "acceptance": [
      "Create exactly 15 task cards across clearly defined lists; give each an owner, due date, checklist and testable acceptance criteria.",
      "Record dependencies, at least three risks with owners and responses, and a status update whose completed and remaining counts match the board.",
      "Document one late-change request, its time/scope impact and a simulated decision; update affected cards and link acceptance evidence or mark work pending in the handover."
    ],
    "maxScore": 100
  },
  "budgeting": {
    "title": "Business Budgeting & Unit Economics: Service Pricing Model",
    "brief": "In Google Sheets or Excel, price a fictional service and build a one-month budget. Separate revenue, contribution, profit and cash. Compare base, lower and higher demand, show the break-even quantity, and write a one-page management memo explaining assumptions, cash risks and one actual-versus-plan difference using fictional actuals.",
    "acceptance": [
      "Label price, volume, fixed costs, variable cost per sale and cash-payment timing; separate assumptions from formulas and trace every input to fictional data.",
      "Choose a positive-contribution price; show checked contribution per sale, break-even quantity and monthly profit for all three demand scenarios, rounding fractional break-even sales upward.",
      "Provide a cash schedule and one-page memo explaining lower-demand impact, possible funding gaps and one checked actual-minus-plan variance, with excluded costs stated."
    ],
    "maxScore": 100
  }
};
