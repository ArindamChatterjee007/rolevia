// Original Rolevia learning content. Drafted with an AI research lane (requested model GPT-6 Astra, runtime identity unverified),
// then checked by the coordinator for arithmetic, structure and claims. Fictional data only.
export const QUIZ_BANK = {
  "spreadsheets": [
    {
      "id": "spreadsheets-q1",
      "question": "Which layout makes a fictional sales register easiest to filter and summarise in Excel or Google Sheets?",
      "options": [
        "One transaction per row, with clear column headers.",
        "Several transactions per cell, separated by coloured text.",
        "One merged heading inside each group of transactions.",
        "Different column meanings on different parts of the sheet."
      ],
      "answerIndex": 0,
      "explanation": "Consistent rows and clearly defined columns support reliable filtering, formulas and summaries.",
      "difficulty": "easy"
    },
    {
      "id": "spreadsheets-q2",
      "question": "Two practice rows share the same order ID, date, product and amount. What should you do before removing either row?",
      "options": [
        "Delete both rows because repeated values are always invalid.",
        "Average the two amounts and overwrite the source file.",
        "Give one row a new ID without checking evidence.",
        "Check the raw record and the duplicate-handling rule."
      ],
      "answerIndex": 3,
      "explanation": "Confirm duplication before deleting data, preserve the raw file and document the cleaning decision.",
      "difficulty": "easy"
    },
    {
      "id": "spreadsheets-q3",
      "question": "A fictional shop awards loyalty points using =IF(B2>=1000,10,0). If B2 contains 1200, how many points should the test return?",
      "options": [
        "0 points",
        "10 points",
        "20 points",
        "100 points"
      ],
      "answerIndex": 1,
      "explanation": "The sale meets the threshold, so the formula awards 10 points.",
      "difficulty": "easy"
    },
    {
      "id": "spreadsheets-q4",
      "question": "A fictional register contains East/Pen: INR 600; East/Book: INR 400; West/Pen: INR 300; East/Pen: INR 200. What should SUMIFS return for East and Pen?",
      "options": [
        "INR 600",
        "INR 1,200",
        "INR 800",
        "INR 900"
      ],
      "answerIndex": 2,
      "explanation": "Only rows matching both the specified region and product belong in this total.",
      "difficulty": "medium"
    },
    {
      "id": "spreadsheets-q5",
      "question": "Which pivot layout compares fictional sales totals by product and region?",
      "options": [
        "Rows: order ID; columns: date; values: average price.",
        "Rows: product; columns: region; values: sum of sales.",
        "Rows: salesperson; columns: price; values: count of dates.",
        "Rows: region; columns: order ID; values: minimum sales."
      ],
      "answerIndex": 1,
      "explanation": "Product rows and region columns organise the comparison; summed sales provide the required measure.",
      "difficulty": "easy"
    },
    {
      "id": "spreadsheets-q6",
      "question": "A checked fictional pivot shows East sales of INR 12,000 and West sales of INR 8,000 for the same month. What share of their combined sales came from East?",
      "options": [
        "40%",
        "50%",
        "60%",
        "80%"
      ],
      "answerIndex": 2,
      "explanation": "East represents 60% of the combined sales for the two regions.",
      "difficulty": "medium"
    },
    {
      "id": "spreadsheets-q7",
      "question": "A practice pivot totals INR 9,500, but its intended source totals INR 10,000. What should you do before handing over the workbook?",
      "options": [
        "Check included rows, active filters and numeric data types.",
        "Replace the pivot total with the larger number manually.",
        "Publish the pivot because the difference is fairly small.",
        "Delete source rows until both totals become the same."
      ],
      "answerIndex": 0,
      "explanation": "Investigate the mismatch instead of changing figures to create an artificial agreement.",
      "difficulty": "easy"
    },
    {
      "id": "spreadsheets-q8",
      "question": "A checked fictional summary shows Product P's sales fell for two months, but contains no evidence about causes. Which handover note is justified?",
      "options": [
        "Customers stopped buying because every competing product is now cheaper.",
        "The sales team caused the decline and must be replaced.",
        "Product P will recover next month without any further action.",
        "Product P's sales fell; investigate possible causes before choosing an action."
      ],
      "answerIndex": 3,
      "explanation": "Report the observed pattern and separate it from explanations that still need evidence.",
      "difficulty": "easy"
    }
  ],
  "dashboards": [
    {
      "id": "dashboards-q1",
      "question": "For a fictional sales team's monthly completed-sales KPI, which definition matches the intended measure?",
      "options": [
        "The value of whichever sales rows happen to be visible.",
        "The total of every numeric column in the practice source.",
        "The sum of completed-order amounts within the selected month.",
        "The number of contacts created since the report first began."
      ],
      "answerIndex": 2,
      "explanation": "A useful KPI definition identifies the measure, qualifying records and reporting period.",
      "difficulty": "easy"
    },
    {
      "id": "dashboards-q2",
      "question": "For this fictional exercise, average order value is completed-sales amount divided by completed-order count. Sales of INR 24,000 across 60 completed orders give which value?",
      "options": [
        "INR 300",
        "INR 400",
        "INR 500",
        "INR 600"
      ],
      "answerIndex": 1,
      "explanation": "The average completed order is worth INR 400.",
      "difficulty": "easy"
    },
    {
      "id": "dashboards-q3",
      "question": "In Google Data Studio, which chart most clearly compares fictional sales totals across four product categories?",
      "options": [
        "A labelled bar chart with a common zero baseline.",
        "A line chart ordered by the spelling of product names.",
        "A map assigning products to invented geographic positions.",
        "A scorecard showing only the total across all products."
      ],
      "answerIndex": 0,
      "explanation": "Bars support direct comparisons between categories without implying a time sequence or geographic relationship.",
      "difficulty": "easy"
    },
    {
      "id": "dashboards-q4",
      "question": "A fictional scorecard displays completed sales of INR 50,000 for May only. Which label accurately describes it?",
      "options": [
        "Next month's sales target (INR): 50,000",
        "May completed order count (orders): 50,000",
        "Lifetime completed sales (INR): 50,000",
        "May completed sales (INR): 50,000"
      ],
      "answerIndex": 3,
      "explanation": "The label should identify the correct measure, period and unit.",
      "difficulty": "easy"
    },
    {
      "id": "dashboards-q5",
      "question": "Fictional sales data contain May/East: INR 6,000; May/West: INR 4,000; June/East: INR 8,000. With May and East selected together, what should the sales scorecard show?",
      "options": [
        "INR 10,000",
        "INR 6,000",
        "INR 14,000",
        "INR 18,000"
      ],
      "answerIndex": 1,
      "explanation": "Both filters apply together, leaving only the May sales from East.",
      "difficulty": "medium"
    },
    {
      "id": "dashboards-q6",
      "question": "A valid filter combination matches no practice records. What is the clearest dashboard response?",
      "options": [
        "Keep the last nonempty result and remove its date.",
        "Show the unfiltered total beneath the selected filter labels.",
        "Show a clear no-records message for the selected filters.",
        "Add an invented row so every chart remains populated."
      ],
      "answerIndex": 2,
      "explanation": "An explicit empty-state message prevents missing records from being mistaken for stale results or verified zero sales.",
      "difficulty": "easy"
    },
    {
      "id": "dashboards-q7",
      "question": "The fictional source contains 40 orders, but the report shows 42 orders under identical filters. What should you do before sharing?",
      "options": [
        "Change the source count to match the report count.",
        "Round both counts until the difference is less visible.",
        "Hide the order metric and call the dashboard verified.",
        "Check duplicated rows and aggregation, then reconcile the count."
      ],
      "answerIndex": 3,
      "explanation": "Every KPI needs source reconciliation; a polished report does not establish numerical accuracy.",
      "difficulty": "medium"
    },
    {
      "id": "dashboards-q8",
      "question": "A verified fictional dashboard shows sales below target in one region. Which recommendation stays within the evidence?",
      "options": [
        "Review that region's pipeline before selecting a corrective action.",
        "Replace its manager because the chart proves poor leadership.",
        "Promise higher sales next month without checking the pipeline.",
        "Raise every price because the chart proves low prices."
      ],
      "answerIndex": 0,
      "explanation": "The dashboard identifies a performance gap, not its cause or a guaranteed remedy.",
      "difficulty": "easy"
    }
  ],
  "business-ai": [
    {
      "id": "business-ai-q1",
      "question": "Which prompt gives ChatGPT or a comparable assistant the clearest bounded business task?",
      "options": [
        "Tell me everything about business and choose the most interesting details.",
        "Draft a 120-word manager memo using this fictional table; cite supporting rows.",
        "Create something impressive about these figures and fill any missing details.",
        "Give a confident answer about this business without asking for context."
      ],
      "answerIndex": 1,
      "explanation": "The prompt specifies an audience, output, length limit, evidence source and a checkable requirement.",
      "difficulty": "easy"
    },
    {
      "id": "business-ai-q2",
      "question": "Which input may be used for this module's AI practice?",
      "options": [
        "Real customer records with names removed but detailed purchase histories retained.",
        "Applicant resumes shared privately because the assistant seems trustworthy and helpful.",
        "An employer report with credentials hidden inside a separate uploaded attachment.",
        "Invented customer records and invented amounts with no real personal information."
      ],
      "answerIndex": 3,
      "explanation": "Use fictional inputs only. Never upload customer data, resumes, credentials, employer documents or other secrets.",
      "difficulty": "easy"
    },
    {
      "id": "business-ai-q3",
      "question": "In a practice exercise, an AI draft cites a report as evidence. How should you verify the citation?",
      "options": [
        "Open the cited source and check it supports the exact claim.",
        "Accept it whenever the title sounds professional and relevant.",
        "Ask for the same answer until the wording stops changing.",
        "Treat several copied summaries as separate proof of the claim."
      ],
      "answerIndex": 0,
      "explanation": "A plausible title or working link does not prove that the source supports the claim.",
      "difficulty": "easy"
    },
    {
      "id": "business-ai-q4",
      "question": "A fictional source sheet omits Service B's cancellation terms. How should the checked comparison matrix record them?",
      "options": [
        "Copy Service A's cancellation terms to keep entries consistent.",
        "Estimate cancellation terms from Service B's stated monthly fee.",
        "Mark the terms unverified and identify the missing evidence.",
        "Report no cancellation fee because none appears in the sheet."
      ],
      "answerIndex": 2,
      "explanation": "Missing information is not evidence that a fee or restriction does not exist.",
      "difficulty": "medium"
    },
    {
      "id": "business-ai-q5",
      "question": "An AI draft reports a surplus of INR 8,500 from fictional revenue of INR 12,000 and total costs of INR 4,500. Which checked result belongs in the correction log?",
      "options": [
        "Surplus: INR 6,500",
        "Surplus: INR 7,500",
        "Surplus: INR 8,500",
        "Surplus: INR 9,500"
      ],
      "answerIndex": 1,
      "explanation": "Record the corrected surplus of INR 7,500 and retain the original error for traceability.",
      "difficulty": "medium"
    },
    {
      "id": "business-ai-q6",
      "question": "A fictional pilot recorded 12 orders before a revised email and 18 afterward, with no control group. Which conclusion is justified?",
      "options": [
        "The revised email alone caused every additional recorded order.",
        "The revised email guarantees more orders in every future market.",
        "The result proves that no other business factors changed.",
        "Orders increased, but the email's causal effect remains unproven."
      ],
      "answerIndex": 3,
      "explanation": "A before-and-after change alone does not isolate the effect of the revised email.",
      "difficulty": "medium"
    },
    {
      "id": "business-ai-q7",
      "question": "You used AI to draft a fictional stakeholder email, reviewed it personally and did not measure savings. Which handover statement is honest?",
      "options": [
        "AI cut delivery time by half during this communication task.",
        "The email proves that AI increased the business's monthly revenue.",
        "AI helped draft this email; I reviewed it, but savings are unmeasured.",
        "The email was written without AI assistance or any human editing."
      ],
      "answerIndex": 2,
      "explanation": "Describe the assistance and review accurately; do not invent time savings, revenue gains or human-only authorship.",
      "difficulty": "easy"
    },
    {
      "id": "business-ai-q8",
      "question": "A fictional meeting ends with a proposed launch date but no approval. How should the meeting summary describe it?",
      "options": [
        "Proposed launch date; approval pending from the named decision owner.",
        "Confirmed launch date; approval implied by discussion during the meeting.",
        "Completed launch date; team participation counts as evidence of delivery.",
        "Guaranteed launch date; remaining approvals need not appear in writing."
      ],
      "answerIndex": 0,
      "explanation": "A proposal, an approval and a completed action are different states and should be reported separately.",
      "difficulty": "easy"
    }
  ],
  "canva": [
    {
      "id": "canva-q1",
      "question": "A fictional café owner must decide whether to test a breakfast offer. What should you establish before designing the pitch in Canva Free?",
      "options": [
        "Which animation will appear on every slide in the deck.",
        "Which decorative image will fill the largest empty space.",
        "Which decision the owner needs and which evidence supports it.",
        "Which premium template has the greatest number of layouts."
      ],
      "answerIndex": 2,
      "explanation": "The audience's decision and supporting evidence should shape the presentation before visual styling begins.",
      "difficulty": "easy"
    },
    {
      "id": "canva-q2",
      "question": "Which five-slide order best supports a decision about a fictional business idea?",
      "options": [
        "Audience problem; proposed idea; evidence; costs and risks; next-step request.",
        "Team photos; template credits; decorative chart; general slogan; closing thanks.",
        "Final request; unrelated history; team photos; repeated slogan; template credits.",
        "Product colours; font choices; image choices; animation settings; closing thanks."
      ],
      "answerIndex": 0,
      "explanation": "A decision-focused story connects the problem, proposal, evidence, trade-offs and requested next step.",
      "difficulty": "easy"
    },
    {
      "id": "canva-q3",
      "question": "Which choice makes a five-slide fictional pitch more consistent and readable?",
      "options": [
        "Use a different heading size and alignment on every slide.",
        "Use low-contrast text so the background feels visually softer.",
        "Shrink all body text to fit as many details as possible.",
        "Reuse a small set of fonts, colours and spacing rules."
      ],
      "answerIndex": 3,
      "explanation": "Consistent visual rules reduce distraction and help the audience follow the message.",
      "difficulty": "easy"
    },
    {
      "id": "canva-q4",
      "question": "A fictional pitch has pale grey text on a white background. Which edit most directly improves readability?",
      "options": [
        "Add more decorative shapes behind the existing text.",
        "Use darker text while keeping the background plain.",
        "Add a slow entrance animation to every sentence.",
        "Replace clear headings with longer decorative captions."
      ],
      "answerIndex": 1,
      "explanation": "Stronger text-background contrast makes the content easier to distinguish.",
      "difficulty": "easy"
    },
    {
      "id": "canva-q5",
      "question": "A fictional survey has 40 responses: 24 prefer Option A and 16 prefer Option B. Which chart caption matches these data?",
      "options": [
        "Option A received 40% of the 40 responses.",
        "Option A received 50% of the 40 responses.",
        "Option A received 60% of the 40 responses.",
        "Option A received 80% of the 40 responses."
      ],
      "answerIndex": 2,
      "explanation": "Option A received 60% of responses; the caption should also retain the sample size.",
      "difficulty": "medium"
    },
    {
      "id": "canva-q6",
      "question": "A bar chart compares fictional monthly sales of INR 90,000 and INR 100,000. Which design avoids exaggerating the difference?",
      "options": [
        "Start the vertical axis at zero and show both values.",
        "Start the vertical axis at 89,000 and hide tick labels.",
        "Draw the second bar twice as tall without an axis.",
        "Use different scales for each bar without a visible note."
      ],
      "answerIndex": 0,
      "explanation": "A common zero baseline keeps bar lengths proportional to the values being compared.",
      "difficulty": "easy"
    },
    {
      "id": "canva-q7",
      "question": "Before exporting a fictional presentation using supplied images, which asset check is necessary?",
      "options": [
        "Confirm each chosen image appears somewhere in a public search.",
        "Confirm a free template makes every uploaded image freely reusable.",
        "Confirm credits can replace permission for every image you choose.",
        "Confirm licences permit the intended use and required credits are included."
      ],
      "answerIndex": 3,
      "explanation": "Check permissions and required attribution; finding an image online does not grant reuse rights.",
      "difficulty": "easy"
    },
    {
      "id": "canva-q8",
      "question": "Your rehearsal for a three-minute fictional pitch lasts five minutes. What is the best next step?",
      "options": [
        "Keep all content and speak much faster without pausing.",
        "Remove nonessential detail, retain the request and rehearse again.",
        "Skip the evidence without checking what the recommendation needs.",
        "Keep the timing hidden and export without another practice run."
      ],
      "answerIndex": 1,
      "explanation": "Reduce content deliberately while preserving the decision, evidence and next-step request.",
      "difficulty": "easy"
    }
  ],
  "crm": [
    {
      "id": "crm-q1",
      "question": "In a fictional HubSpot CRM exercise, which item is a deal rather than a contact, company or activity?",
      "options": [
        "Mira, the contact person at a fictional workshop venue.",
        "A proposed INR 20,000 training purchase awaiting a decision.",
        "Cedar Works, the fictional company discussing its training requirements.",
        "A follow-up call recorded after a fictional planning meeting."
      ],
      "answerIndex": 1,
      "explanation": "A deal represents a potential transaction; contacts, companies and activities describe different record types.",
      "difficulty": "easy"
    },
    {
      "id": "crm-q2",
      "question": "Two imported fictional contacts have the same supplied contact ID. What should you do before consolidating them?",
      "options": [
        "Create extra copies so each salesperson can edit independently.",
        "Delete both records and remove all related activity history.",
        "Compare the records and merge only after confirming duplication.",
        "Change one ID randomly to make the records look distinct."
      ],
      "answerIndex": 2,
      "explanation": "Check identity and conflicting fields before merging, and preserve useful activity history.",
      "difficulty": "easy"
    },
    {
      "id": "crm-q3",
      "question": "A fictional pipeline defines Proposal sent as a proposal delivered in the simulation. Which opportunity meets that stage definition?",
      "options": [
        "An opportunity with proposal delivery recorded in the practice log.",
        "An opportunity whose owner only plans to write a proposal tomorrow.",
        "An opportunity with an introductory question but no proposal prepared yet.",
        "An opportunity marked Closed lost after the fictional buyer declined."
      ],
      "answerIndex": 0,
      "explanation": "Use observable stage-entry evidence rather than intentions or optimism.",
      "difficulty": "easy"
    },
    {
      "id": "crm-q4",
      "question": "Three fictional open opportunities are worth INR 5,000, INR 8,000 and INR 7,000. Another worth INR 4,000 is Closed lost. What is the total listed value of the open pipeline?",
      "options": [
        "INR 16,000",
        "INR 19,000",
        "INR 24,000",
        "INR 20,000"
      ],
      "answerIndex": 3,
      "explanation": "Open-pipeline value includes open opportunities only; it is not received cash or guaranteed revenue.",
      "difficulty": "medium"
    },
    {
      "id": "crm-q5",
      "question": "Which activity note gives a teammate the clearest next action in a fictional CRM practice file?",
      "options": [
        "Useful discussion; details and ownership can be decided sometime later.",
        "2 June: demo requested; owner Mira; draft agenda by 4 June.",
        "Promising contact; follow up soon if someone on the team is free.",
        "Very positive meeting; success is certain, so further notes are unnecessary."
      ],
      "answerIndex": 1,
      "explanation": "A useful note records the event, next action, responsible owner and due date.",
      "difficulty": "easy"
    },
    {
      "id": "crm-q6",
      "question": "A fictional deal closes with two onboarding sessions included, not unlimited support. What should the sales-to-service handover state?",
      "options": [
        "The service team can infer scope from the deal amount.",
        "Unlimited support is included because the sale has already closed.",
        "Delivery can begin without an owner because the buyer is happy.",
        "The two-session scope, promised dates, receiving owner and open questions."
      ],
      "answerIndex": 3,
      "explanation": "A handover should preserve the agreed scope and identify responsibilities without inventing additional commitments.",
      "difficulty": "easy"
    },
    {
      "id": "crm-q7",
      "question": "Of the same 20 fictional opportunities that entered Qualification, 8 later reached Proposal during the tracked period. What percentage reached Proposal?",
      "options": [
        "20%",
        "25%",
        "40%",
        "60%"
      ],
      "answerIndex": 2,
      "explanation": "The conversion rate is 40%, using the same qualification cohort as the denominator.",
      "difficulty": "medium"
    },
    {
      "id": "crm-q8",
      "question": "A checked practice pipeline shows 6 of 20 open opportunities lack a next-action date. Which improvement directly addresses this gap?",
      "options": [
        "Assign a dated next action and owner to each of the six.",
        "Increase every opportunity amount until the pipeline looks more promising.",
        "Move the six opportunities to Closed won without any new evidence.",
        "Remove activity history so the missing dates are harder to notice."
      ],
      "answerIndex": 0,
      "explanation": "Dated, owned next actions address the observed follow-up gap without changing unrelated sales evidence.",
      "difficulty": "easy"
    }
  ],
  "hr-tracker": [
    {
      "id": "hr-tracker-q1",
      "question": "For a fictional recruiting-coordinator role, which selection criterion is job-related and observable?",
      "options": [
        "Lives in the same neighbourhood as the interviewer.",
        "Shares the hiring manager's favourite weekend hobbies.",
        "Has a surname that sounds familiar to the team.",
        "Maintains an accurate tracker in a standardised practice task."
      ],
      "answerIndex": 3,
      "explanation": "Assess relevant skills using observable evidence rather than personal similarity or unrelated characteristics.",
      "difficulty": "easy"
    },
    {
      "id": "hr-tracker-q2",
      "question": "Why assign a responsible owner to each stage of a fictional hiring process?",
      "options": [
        "So one person is accountable for moving that stage forward.",
        "So stage dates can be omitted from every applicant record.",
        "So each interviewer can replace the agreed criteria independently.",
        "So applicants need not receive a consistent assessment process."
      ],
      "answerIndex": 0,
      "explanation": "Clear ownership supports follow-ups, handovers and appropriate escalation when a stage is blocked.",
      "difficulty": "easy"
    },
    {
      "id": "hr-tracker-q3",
      "question": "Which Google Sheets or Excel rule best prevents inconsistent stage names in a fictional applicant tracker?",
      "options": [
        "Let each reviewer invent a new abbreviation for every stage.",
        "Use colour alone and leave every stage cell completely blank.",
        "Use a dropdown restricted to the agreed list of stages.",
        "Place the stage and all notes together in one free-text cell."
      ],
      "answerIndex": 2,
      "explanation": "A validated stage list prevents spelling variations from splitting counts and confusing reports.",
      "difficulty": "easy"
    },
    {
      "id": "hr-tracker-q4",
      "question": "A fictional workflow requires application before screening and screening before interview. Which entry breaks that date sequence?",
      "options": [
        "Applied 2 June; screened 4 June; interviewed 8 June.",
        "Applied 6 June; screened 4 June; interviewed 8 June.",
        "Applied 1 June; screened 3 June; interviewed 7 June.",
        "Applied 3 June; screened 5 June; interviewed 9 June."
      ],
      "answerIndex": 1,
      "explanation": "Screening is dated before application in this record; check the source and document any correction.",
      "difficulty": "medium"
    },
    {
      "id": "hr-tracker-q5",
      "question": "How should interviewers compare fictional applicants for the same role?",
      "options": [
        "Change the criteria after seeing which candidate feels most familiar.",
        "Give extra points for personal interests unrelated to the job.",
        "Use different maximum scores for each applicant without recording why.",
        "Use the same job-related criteria and clearly described scoring scale."
      ],
      "answerIndex": 3,
      "explanation": "Consistent criteria and scoring definitions make comparisons more transparent and reduce arbitrary judgement.",
      "difficulty": "easy"
    },
    {
      "id": "hr-tracker-q6",
      "question": "Which note from a fictional interview records observable, job-relevant evidence?",
      "options": [
        "The applicant seems like someone our team would enjoy socialising with.",
        "The applicant's personal background feels more familiar than other applicants' backgrounds.",
        "In the practice task, the applicant correctly updated all five stage dates.",
        "The applicant appears confident, so the accuracy check is probably unnecessary."
      ],
      "answerIndex": 2,
      "explanation": "Record demonstrated performance against the criterion, not impressions about personality or personal background.",
      "difficulty": "easy"
    },
    {
      "id": "hr-tracker-q7",
      "question": "Of 12 fictional applicants interviewed for the same role, 3 received offers. What is the interview-to-offer conversion rate?",
      "options": [
        "25%",
        "20%",
        "30%",
        "40%"
      ],
      "answerIndex": 0,
      "explanation": "The conversion rate is 25%; interviewed applicants form the denominator for this metric.",
      "difficulty": "medium"
    },
    {
      "id": "hr-tracker-q8",
      "question": "For this exercise, time-to-fill is elapsed calendar days from role approval to offer acceptance, excluding the approval date. A fictional role is approved on 3 June and its offer accepted on 18 June. What is time-to-fill?",
      "options": [
        "12 days",
        "15 days",
        "18 days",
        "21 days"
      ],
      "answerIndex": 1,
      "explanation": "Using the stated definition, time-to-fill is 15 calendar days; consistent date rules make comparisons meaningful.",
      "difficulty": "medium"
    }
  ],
  "trello": [
    {
      "id": "trello-q1",
      "question": "A fictional workshop brief includes only the agenda and attendee-information sheet. Which task is within scope?",
      "options": [
        "Draft the workshop agenda for the organiser's review.",
        "Design a new online shop for the organiser.",
        "Launch a year-long membership scheme for the organiser.",
        "Build a permanent booking application for the organiser."
      ],
      "answerIndex": 0,
      "explanation": "A scoped backlog contains tasks that directly support the agreed deliverables.",
      "difficulty": "easy"
    },
    {
      "id": "trello-q2",
      "question": "Which fictional workshop backlog item has a clear, checkable deliverable?",
      "options": [
        "Make the workshop successful in every possible way.",
        "Improve everything connected with the overall attendee experience.",
        "Draft a one-page agenda listing session times and owners.",
        "Keep the team happy throughout the entire project."
      ],
      "answerIndex": 2,
      "explanation": "A specific output and required contents make completion easier to assess.",
      "difficulty": "easy"
    },
    {
      "id": "trello-q3",
      "question": "In Trello Free or the supplied task-board template, which card is best prepared for handover?",
      "options": [
        "Title, colour label and an unspecified request to finish soon.",
        "Deliverable, owner, due date, checklist and explicit acceptance criteria.",
        "Title, decorative cover image and no named responsible person.",
        "Long discussion history with no agreed deliverable or due date."
      ],
      "answerIndex": 1,
      "explanation": "A usable card explains what to deliver, who owns it, when it is due and how completion is checked.",
      "difficulty": "easy"
    },
    {
      "id": "trello-q4",
      "question": "A fictional board uses To do, Doing, Review and Done lists. A draft is finished but awaits its required approval. Which list should hold it?",
      "options": [
        "To do",
        "Doing",
        "Done",
        "Review"
      ],
      "answerIndex": 3,
      "explanation": "Review holds completed drafts awaiting acceptance; Done requires the stated completion checks.",
      "difficulty": "easy"
    },
    {
      "id": "trello-q5",
      "question": "For a fictional workshop, venue layout confirmation must happen before seating can be planned. Confirmation is delayed. What should the seating card show?",
      "options": [
        "A blocker, its dependency owner and a dated next check.",
        "A completed status so the board appears to stay on schedule.",
        "A removed due date and no note about the dependency.",
        "A larger checklist with no explanation of the actual delay."
      ],
      "answerIndex": 0,
      "explanation": "Visible dependencies and owned next checks make blocked work actionable without disguising its status.",
      "difficulty": "easy"
    },
    {
      "id": "trello-q6",
      "question": "A 15-task practice board has 6 tasks Done, 5 Doing and 4 To do. Which status update is accurate?",
      "options": [
        "Ten tasks are complete, with five tasks still remaining.",
        "Eleven tasks are complete, with four tasks still remaining.",
        "Six tasks are complete, with nine tasks still remaining.",
        "Nine tasks are complete, with six tasks still remaining."
      ],
      "answerIndex": 2,
      "explanation": "Only Done tasks count as complete; Doing tasks still belong in the remaining-work total.",
      "difficulty": "easy"
    },
    {
      "id": "trello-q7",
      "question": "A late fictional workshop request adds two hours of work, but the deadline and team capacity cannot change. What should you do?",
      "options": [
        "Add the work without discussing effects on the existing scope.",
        "Seek an agreed scope trade-off or defer the new request.",
        "Promise delivery and hide the extra work from the board.",
        "Mark existing tasks complete so the new request appears to fit."
      ],
      "answerIndex": 1,
      "explanation": "A fixed deadline and capacity require an explicit scope decision, not an unsupported delivery promise.",
      "difficulty": "medium"
    },
    {
      "id": "trello-q8",
      "question": "What is the best evidence that a fictional workshop project is ready for closure?",
      "options": [
        "The board has attractive labels even though acceptance checks are missing.",
        "The team feels confident even though required deliverables remain unreviewed.",
        "The deadline has arrived even though blockers have no recorded owners.",
        "Required deliverables are accepted; remaining follow-ups have named handover owners."
      ],
      "answerIndex": 3,
      "explanation": "Closure depends on accepted outputs and explicit handover responsibilities, not appearance, confidence or elapsed time.",
      "difficulty": "easy"
    }
  ],
  "budgeting": [
    {
      "id": "budgeting-q1",
      "question": "A fictional service pays INR 1,000 each month for workspace whether it serves 0 or 50 customers. How should this cost be classified within that range?",
      "options": [
        "A variable cost per completed sale.",
        "A sales receipt collected from customers.",
        "A fixed cost for the stated month.",
        "A contribution earned on each sale."
      ],
      "answerIndex": 2,
      "explanation": "The monthly amount stays unchanged within the stated activity range, so it is a fixed cost.",
      "difficulty": "easy"
    },
    {
      "id": "budgeting-q2",
      "question": "This exercise records revenue when the service is delivered. A fictional INR 10,000 service is delivered and invoiced in June, then paid in July. Which statement is correct?",
      "options": [
        "June has INR 10,000 revenue and no receipt from this invoice.",
        "June has no revenue and INR 10,000 cash from this invoice.",
        "July has INR 10,000 new revenue and no cash from this invoice.",
        "Both months have INR 10,000 revenue from this same invoice."
      ],
      "answerIndex": 0,
      "explanation": "Revenue timing and cash receipt timing can differ; an invoice should not be counted as immediate cash.",
      "difficulty": "medium"
    },
    {
      "id": "budgeting-q3",
      "question": "A fictional service sells for INR 1,000 per booking and has INR 400 variable cost per booking. What is contribution per booking, before fixed costs?",
      "options": [
        "INR 400",
        "INR 1,400",
        "INR 1,000",
        "INR 600"
      ],
      "answerIndex": 3,
      "explanation": "Contribution per booking is INR 600 and is available to cover fixed costs before profit.",
      "difficulty": "easy"
    },
    {
      "id": "budgeting-q4",
      "question": "A fictional service has monthly fixed costs of INR 12,000 and contribution of INR 600 per booking. How many bookings cover those fixed costs exactly?",
      "options": [
        "10 bookings",
        "20 bookings",
        "25 bookings",
        "30 bookings"
      ],
      "answerIndex": 1,
      "explanation": "The service breaks even at 20 bookings under these stated cost assumptions.",
      "difficulty": "medium"
    },
    {
      "id": "budgeting-q5",
      "question": "A fictional service contributes INR 600 per booking and has INR 12,000 monthly fixed costs. At 15 bookings, what is its monthly operating result if there are no other costs?",
      "options": [
        "INR 3,000 profit",
        "INR 6,000 profit",
        "INR 3,000 loss",
        "INR 6,000 loss"
      ],
      "answerIndex": 2,
      "explanation": "The lower-demand scenario produces a loss; positive contribution per sale does not guarantee monthly profit.",
      "difficulty": "medium"
    },
    {
      "id": "budgeting-q6",
      "question": "For a fictional service, price, variable cost per booking and monthly fixed costs stay unchanged. What should differ between lower, base and higher demand scenarios?",
      "options": [
        "Booking quantity and the resulting revenue, variable costs and profit.",
        "Historical source data and the definition of a completed booking.",
        "Monthly fixed costs despite the unchanged fixed-cost assumption.",
        "The reporting currency and the number of months being modelled."
      ],
      "answerIndex": 0,
      "explanation": "Change the demand assumption while keeping unrelated assumptions consistent, so the scenario comparison remains meaningful.",
      "difficulty": "easy"
    },
    {
      "id": "budgeting-q7",
      "question": "A fictional budget planned INR 4,000 for delivery costs; actual delivery costs were INR 4,600. Defining variance as actual minus plan, what is the cost variance?",
      "options": [
        "INR 600 favourable",
        "INR 400 favourable",
        "INR 400 adverse",
        "INR 600 adverse"
      ],
      "answerIndex": 3,
      "explanation": "Actual delivery costs exceeded the budget; this is an adverse cost variance.",
      "difficulty": "medium"
    },
    {
      "id": "budgeting-q8",
      "question": "A fictional service forecasts a profit, but customers pay 30 days after delivery while suppliers require advance payment. What should its management memo flag?",
      "options": [
        "Profit guarantees enough cash for every advance payment.",
        "A possible cash shortfall before customer payments arrive.",
        "All customer invoices must be recorded as immediate cash.",
        "Supplier payment dates cannot affect the cash forecast."
      ],
      "answerIndex": 1,
      "explanation": "A profitable service can still face a cash gap when payments go out before receipts arrive.",
      "difficulty": "easy"
    }
  ]
};
