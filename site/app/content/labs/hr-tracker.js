export default {
  moduleId: "hr-tracker",
  summary: "Build a fictional hiring workflow, a validated applicant register and evidence-led scorecards. Practise corrections, missing-data reviews and recruitment metrics before submitting a fifteen-applicant tracker with an auditable summary and onboarding plan.",
  sessions: [
    {
      id: "hr-tracker-lab-s1",
      week: 1,
      title: "Agree the workflow before scoring anyone",
      minutes: 75,
      scenario: [
        "Kiran Stationery's fictional operations support trainee role involves accurate tracker updates, clear written follow-ups and simple process maps. Priya coordinates the workflow and Rohit reviews evidence. Draft a role brief and stage-entry rules before entering applicants. The eventual fifteen-applicant capstone uses these three criteria with equal weighting, not the separate four-criterion lab weights.",
        "Open Fair scorecard in Rolevia Sheets, also openable in Google Sheets. This separate Nila Office Supplies exercise uses the agreed weights below. They occupy B2:E2, but References E2 was entered incorrectly. Put a SUM formula in B3, repair the input against the policy and retain an audit note. Do not alter weights after seeing whom they favour. All people and assessments are fictional."
      ],
      dataset: {
        columns: ["Criterion", "Lab cell", "Entered weight", "Agreed weight"],
        rows: [
          ["Spreadsheet test", "B2", "0.4", "0.4"],
          ["Written case", "C2", "0.3", "0.3"],
          ["Structured interview", "D2", "0.2", "0.2"],
          ["References", "E2", "0.2", "0.1"]
        ]
      },
      outcome: "A job-related role brief, owned stage workflow and corrected lab weight row with a policy-based audit note.",
      tasks: [
        {
          id: "hr-tracker-lab-s1-t1",
          type: "short",
          prompt: "Before correcting References, calculate =SUM(B2:E2) in B3. What decimal total does the entered weight row produce? Enter a decimal, not percentage points.",
          answer: { kind: "number", value: 1.1, tolerance: 0.0001 },
          explanation: "0.4 + 0.3 + 0.2 + 0.2 = 1.1, or 110 per cent. A complete weight allocation for this policy must total one. Repair the incorrect source input rather than silently dividing the inflated total away."
        },
        {
          id: "hr-tracker-lab-s1-t2",
          type: "short",
          prompt: "Keep the first three agreed weights unchanged. What decimal value must References E2 contain so that B3 totals one? Make the correction in the tool and enter that weight.",
          answer: { kind: "number", value: 0.1, tolerance: 0.0001 },
          explanation: "The first three weights total 0.4 + 0.3 + 0.2 = 0.9. References must be 1 - 0.9 = 0.1. The corrected row sums to one and matches the supplied policy, rather than a preferred candidate's results."
        },
        {
          id: "hr-tracker-lab-s1-t3",
          type: "case",
          prompt: "Rohit asks for a process he can apply consistently. Write the fictional role brief, three job-related scoring criteria and a workflow using Applied, Screening, Interview, Offer, Accepted, Not progressed and Withdrawn. Assign owners, distinguish an issued offer from acceptance and explain the separate lab weight correction.",
          rubric: [
            "Links tracker accuracy, written communication and process mapping to observable work samples and equal weighting.",
            "Defines observable one, three and five scoring anchors before evaluating the fictional applicants.",
            "Gives all seven stages entry rules and owners, including separate evidence for Offer and Accepted.",
            "Logs E2 changing from 0.2 to 0.1 against the four-criterion lab policy without mixing it into the capstone average.",
            "Keeps missing evidence pending and excludes real applications and unrelated personal information."
          ],
          minWords: 150
        },
        {
          id: "hr-tracker-lab-s1-t4",
          type: "proof",
          prompt: "Attach the role brief and workflow, plus a view of the corrected Rolevia Sheets or Google Sheets weight row and its audit note.",
          mustShow: "Job-related criteria, stage owners and entry rules; B2:E2 at 0.4, 0.3, 0.2, 0.1; SUM in B3 returning one; and the original E2 value and correction reason."
        }
      ]
    },
    {
      id: "hr-tracker-lab-s2",
      week: 2,
      title: "Build fifteen records with dates you can trust",
      minutes: 90,
      scenario: [
        "Build the capstone's R01 tracker in Google Sheets or Microsoft Excel, separately from the fixed four-candidate Rolevia Sheets lab. Expand the grouped seed below into A01 to A15, one applicant per row. Use Role, Tracker, History, Scorecard, Summary and Audit tabs. The fictional role was approved on 2 November 2026; store that date in Role B2. The snapshot is 21 November.",
        "All fifteen applied on 3 November. A04 to A14 were screened on 5 November; A06 to A11 completed interviews on 10 November. A09 and A10 received offers on 12 November; A10 accepted on 20 November. A11 was not progressed on 11 November, A12 to A14 on 6 November, and A15 withdrew on 4 November. Other event dates remain blank. Record history separately from current status.",
        "Use the seven agreed stage names in a dropdown that rejects invalid entries. Store dates as dates, freeze the header and add a filter. Keep applicant ID, role ID, stage, event dates, stage-entry date, owner, next action, due date and evidence reference. A planned interview belongs in next actions until completion evidence exists. Use fictional IDs rather than collecting personal records."
      ],
      dataset: {
        columns: ["Applicant IDs", "Count", "Current stage", "Applied date", "Stage-entry date", "Owner"],
        rows: [
          ["A01 to A03", "3", "Applied", "2026-11-03", "2026-11-03", "Priya"],
          ["A04 to A05", "2", "Screening", "2026-11-03", "2026-11-05", "Priya"],
          ["A06 to A08", "3", "Interview", "2026-11-03", "2026-11-10", "Rohit"],
          ["A09", "1", "Offer", "2026-11-03", "2026-11-12", "Priya"],
          ["A10", "1", "Accepted", "2026-11-03", "2026-11-20", "Priya"],
          ["A11", "1", "Not progressed", "2026-11-03", "2026-11-11", "Rohit"],
          ["A12 to A14", "3", "Not progressed", "2026-11-03", "2026-11-06", "Rohit"],
          ["A15", "1", "Withdrawn", "2026-11-03", "2026-11-04", "Priya"]
        ]
      },
      outcome: "A fifteen-applicant tracker with valid stage labels, dated event history, stable IDs and owned follow-ups.",
      tasks: [
        {
          id: "hr-tracker-lab-s2-t1",
          type: "short",
          prompt: "Expand the grouped seed and reconcile every expected applicant ID. How many distinct applicant records should the tracker contain, including accepted and terminal outcomes?",
          answer: { kind: "number", value: 15, tolerance: 0 },
          explanation: "3 + 2 + 3 + 1 + 1 + 1 + 3 + 1 = 15 applicants. Not progressed contains four applicants across two seed rows. Check A01 to A15 individually as well: fifteen nonblank rows alone would not detect a duplicate replacing a missing ID."
        },
        {
          id: "hr-tracker-lab-s2-t2",
          type: "short",
          prompt: "For this exercise, recruitment-active means Applied, Screening, Interview or Offer. How many records need an active recruitment next action? Keep Accepted onboarding separate.",
          answer: { kind: "number", value: 9, tolerance: 0 },
          explanation: "Recruitment-active records are 3 Applied + 2 Screening + 3 Interview + 1 Offer = 9. A10 needs onboarding work instead. The four Not progressed records and one Withdrawn record remain in the tracker without being counted as active recruitment."
        },
        {
          id: "hr-tracker-lab-s2-t3",
          type: "case",
          prompt: "Priya needs a tracker a colleague can use without interpreting colour codes. Build it and write a quality-check note. Explain how you test stage validation, ID completeness and date sequence, and how you record planned interviews and follow-ups without turning them into completed events.",
          hint: "Test an invalid stage on a copy. A valid dropdown choice still needs supporting event evidence.",
          rubric: [
            "Expands A01 to A15 once each under R01 and checks both uniqueness and the complete expected ID set.",
            "Retains supplied event dates and histories, using true date values and blanks for events that did not occur.",
            "Demonstrates rejection of an invalid stage and checks chronological event order on a test copy.",
            "Gives nine active records an owner, specific action and due date after the snapshot, with onboarding separately labelled.",
            "Records source references and audit fields while keeping planned interviews out of completion dates."
          ],
          minWords: 140
        },
        {
          id: "hr-tracker-lab-s2-t4",
          type: "proof",
          prompt: "Attach the tracker and history with the validation-test note. Show individual applicant rows rather than submitting only the grouped seed.",
          mustShow: "Fifteen unique IDs, seven valid stage labels, dated history, nine active follow-ups, justified blank event dates and an invalid-stage rejection test."
        }
      ]
    },
    {
      id: "hr-tracker-lab-s3",
      week: 3,
      title: "Calculate a weighted score without making a decision",
      minutes: 90,
      scenario: [
        "Return to Nila Office Supplies' four fictional candidates in Fair scorecard. Keep this dataset separate from A01 to A15. Each candidate used the same task conditions and one-to-five anchors. References means supplied fictional job-related notes, not real reference calls. Confirm the corrected weights B2:E2 are 0.4, 0.3, 0.2 and 0.1 before interpreting any result.",
        "In Rolevia Sheets or the Google Sheets copy, use =SUMPRODUCT(B6:E6,$B$2:$E$2)/5*100 in G6 and fill through G9. Both ranges are rows of four cells; keep the weights fixed. Use MAX in B11 and an exact-match name lookup in B12. In H6:H9 the practice checker expects IF labels Below threshold for totals below 60 and Proceed otherwise. Proceed is only a lab label, not an offer or selection decision."
      ],
      dataset: {
        columns: ["Candidate and row", "Spreadsheet test", "Written case", "Structured interview", "References"],
        rows: [
          ["Priya, row 6", "4", "3", "4", "5"],
          ["Rohit, row 7", "2", "3", "2", "4"],
          ["Meera, row 8", "5", "4", "3", "3"],
          ["Daniel, row 9", "3", "5", "4", "2"]
        ]
      },
      outcome: "A formula-linked weighted scorecard with checked totals, an exact-match top name and threshold flags routed to evidence review.",
      tasks: [
        {
          id: "hr-tracker-lab-s3-t1",
          type: "short",
          prompt: "Calculate Priya's total in G6 with the corrected weights. What is her weighted total out of 100, rather than her unscaled one-to-five mean?",
          answer: { kind: "number", value: 76, tolerance: 0.01 },
          explanation: "(4 x 0.4 + 3 x 0.3 + 4 x 0.2 + 5 x 0.1) / 5 x 100 = (1.6 + 0.9 + 0.8 + 0.5) / 5 x 100 = 76. The weighted mean is 3.8, but the threshold uses the scaled total."
        },
        {
          id: "hr-tracker-lab-s3-t2",
          type: "short",
          prompt: "Complete all four totals and use MAX in B11. What is the highest weighted total out of 100? Enter the number returned by the formula.",
          answer: { kind: "number", value: 82, tolerance: 0.01 },
          explanation: "The totals are 76, 50, 82 and 74, so MAX returns 82. Meera's calculation is (5 x 0.4 + 4 x 0.3 + 3 x 0.2 + 3 x 0.1) / 5 x 100 = 4.1 / 5 x 100 = 82. A maximum is a score, not a decision."
        },
        {
          id: "hr-tracker-lab-s3-t3",
          type: "case",
          prompt: "Kavya asks whether the top name should automatically receive an offer and the below-60 result should automatically be rejected. Write a scorecard handover instead. Explain the four totals, flags, formula scale and checks, and give Kavya an evidence-review action due 23 November 2026. State what an incomplete sample would change.",
          rubric: [
            "Reports Priya 76, Rohit 50, Meera 82 and Daniel 74 using the fixed corrected weight row.",
            "Explains aligned SUMPRODUCT ranges and the division by five followed by multiplication by 100.",
            "Uses an exact-match lookup for Meera and checks whether the maximum occurs more than once.",
            "Flags only Rohit below 60 and assigns Kavya a dated evidence review rather than an automatic rejection.",
            "Keeps incomplete evidence pending and separates scorecard results from the fifteen-applicant case's seeded decisions."
          ],
          minWords: 150
        },
        {
          id: "hr-tracker-lab-s3-t4",
          type: "proof",
          prompt: "Attach a formula view of the scorecard and the handover note. Show the original score inputs unchanged and retain the weight-correction audit.",
          mustShow: "B2:E2 and SUM in B3; SUMPRODUCT formulas in G6:G9; MAX in B11; an exact-match name in B12; IF flags in H6:H9; and a dated evidence-review action."
        }
      ]
    },
    {
      id: "hr-tracker-lab-s4",
      week: 4,
      title: "Report event-based metrics and plan onboarding",
      minutes: 90,
      scenario: [
        "Use the fifteen-applicant R01 cohort at 21 November 2026. The table lists its six completed interviews, including applicants now in later or terminal stages. Build the Summary tab in your tracker workbook. Treat Not recorded as a blank date cell when entering the supplied data; do not enter zero or a planned date.",
        "Interview-to-offer conversion means applicants offered divided by applicants with completed interviews in this same cohort by the snapshot. Time-to-fill means elapsed calendar days from role approval to acceptance, excluding the approval date. A10 needs simulated onboarding: Priya confirms start arrangements by 23 November, Rohit drafts orientation by 24 November and Kavya lists equipment needs by 24 November. No actual documents or account access are required."
      ],
      dataset: {
        columns: ["Applicant", "Interview completed", "Offer issued", "Offer accepted", "Role approved"],
        rows: [
          ["A06", "2026-11-10", "Not recorded", "Not recorded", "2026-11-02"],
          ["A07", "2026-11-10", "Not recorded", "Not recorded", "2026-11-02"],
          ["A08", "2026-11-10", "Not recorded", "Not recorded", "2026-11-02"],
          ["A09", "2026-11-10", "2026-11-12", "Not recorded", "2026-11-02"],
          ["A10", "2026-11-10", "2026-11-12", "2026-11-20", "2026-11-02"],
          ["A11", "2026-11-10", "Not recorded", "Not recorded", "2026-11-02"]
        ]
      },
      outcome: "A defined recruitment-metric summary and owned A10 onboarding checklist that distinguish completed events from current stage labels.",
      tasks: [
        {
          id: "hr-tracker-lab-s4-t1",
          type: "short",
          prompt: "Calculate interview-to-offer conversion from the completed events. Enter percentage points to two decimal places, including interviewed applicants no longer in the Interview stage.",
          answer: { kind: "number", value: 33.33, tolerance: 0.01 },
          explanation: "A09 and A10 received offers, while A06 to A11 all completed interviews. The conversion is 2 / 6 x 100 = 33.33%. Using only the three currently in Interview would omit later-stage and terminal records from the cohort."
        },
        {
          id: "hr-tracker-lab-s4-t2",
          type: "short",
          prompt: "Use date subtraction in the workbook. What is R01's time-to-fill in elapsed calendar days from approval to A10's acceptance, excluding the approval date?",
          answer: { kind: "number", value: 18, tolerance: 0 },
          explanation: "20 November minus 2 November = 18 elapsed calendar days. The 12 November offer date is not the endpoint, and the 3 November application date is not the start. An unaccepted offer has no completed time-to-fill."
        },
        {
          id: "hr-tracker-lab-s4-t3",
          type: "case",
          prompt: "Priya's draft uses the three current Interview records as the denominator and treats a blank acceptance date as zero days. Replace it with a defined metric note and an A10 onboarding handover. Explain both corrections, keep A09's response pending and list the simulated preparation tasks with owners, due dates and evidence states.",
          rubric: [
            "Names A06 to A11 as six completed interviews and A09/A10 as two offers, showing 2 / 6 = 33.33%.",
            "States the R01 cohort and 21 November snapshot rather than using current-stage counts as event counts.",
            "Shows 20 November minus 2 November = 18 calendar days and leaves unaccepted offers without a completed fill metric.",
            "Includes at least three onboarding tasks with the supplied owners and dates, retaining pending evidence states.",
            "Keeps A09's offer response separate from A10 onboarding and requires receiving review before acknowledgement."
          ],
          minWords: 160
        },
        {
          id: "hr-tracker-lab-s4-t4",
          type: "proof",
          prompt: "Attach the Summary calculations, source event view and onboarding checklist. Keep date formulas and blank-event handling visible.",
          mustShow: "The six-interview/two-offer population, 18-day approval-to-acceptance calculation, an explicit blank-acceptance rule and owned pending onboarding tasks."
        }
      ]
    },
    {
      id: "hr-tracker-lab-s5",
      week: 5,
      title: "Repair a second intake without inventing events",
      minutes: 105,
      scenario: [
        "Nila Office Supplies sends a new fictional intake on 22 November 2026. Keep B01 to B05 separate from both R01 and the weighted lab. The six-row import contains a confirmed duplicate and three distinct record-quality problems. Preserve the raw file and use the source notes to decide what can be corrected and what must be escalated.",
        "A coordinator wants to keep the scheduled interview as completed and retain the Offer label so the report looks further advanced. Rohit is the reviewer for unresolved discrepancies and will check them by 23 November. Priya owns scheduling follow-ups. The source does not resolve B04's date conflict, so do not choose whichever date produces a better metric."
      ],
      dataset: {
        columns: ["Source row", "Applicant", "Entered stage", "Applied date", "Entered interview date", "Source note"],
        rows: [
          ["R01", "B01", "Applied", "2026-11-20", "Not recorded", "Application only; screening not started"],
          ["R02", "B02", "Interview", "2026-11-20", "2026-11-24", "Interview booked for 24 November; no completion evidence"],
          ["R03", "B02", "Interview", "2026-11-20", "2026-11-24", "Confirmed repeat of R02 and its source"],
          ["R04", "B03", "Offer", "2026-11-20", "2026-11-21", "Interview completed; decision pending; no offer issued"],
          ["R05", "B04", "Screening", "2026-11-22", "Not recorded", "Screening entered as 21 November; receipt says applied 22 November"],
          ["R06", "B05", "Withdrawn", "2026-11-20", "Not recorded", "Withdrawal recorded on 21 November"]
        ]
      },
      outcome: "A deduplicated intake with corrected event and stage fields, a retained source trail and an explicitly unresolved date discrepancy.",
      tasks: [
        {
          id: "hr-tracker-lab-s5-t1",
          type: "short",
          prompt: "After excluding the confirmed repeat from the working tracker, how many unique applicants remain? Do not delete the duplicate from the raw source file.",
          answer: { kind: "number", value: 5, tolerance: 0 },
          explanation: "The unique IDs are B01, B02, B03, B04 and B05. Six imported rows minus one confirmed repeat gives five working applicants. Preserve R03 in the raw import and record its relationship to R02."
        },
        {
          id: "hr-tracker-lab-s5-t2",
          type: "short",
          prompt: "At the 22 November snapshot, how many completed interviews are actually supported by the source notes after deduplication and date correction?",
          answer: { kind: "number", value: 1, tolerance: 0 },
          explanation: "Only B03 has a completed interview, dated 21 November. B02's 24 November appointment is planned, not completed. The other three applicants have no completed-interview evidence, so the supported count is one."
        },
        {
          id: "hr-tracker-lab-s5-t3",
          type: "case",
          prompt: "Repair the working intake and write a discrepancy memo to Rohit. Explain duplicate handling, B02's planned interview, B03's unsupported Offer label and B04's unresolved date sequence. Identify what Priya can update now and what needs review by 23 November, retaining the old values and source references.",
          rubric: [
            "Retains six raw rows and five unique working applicants, logging R03 as a repeat of R02.",
            "Clears B02's completed-interview date and records the 24 November appointment as Priya's scheduling action.",
            "Changes B03 from Offer to Interview because only interview completion and a pending decision are evidenced.",
            "Flags B04's conflicting dates for Rohit by 23 November without inventing a corrected event date.",
            "Records old and new values, reasons, sources, correction dates and reviewer responsibility using fictional-only data."
          ],
          minWords: 160
        },
        {
          id: "hr-tracker-lab-s5-t4",
          type: "proof",
          prompt: "Attach the raw intake, corrected working view and discrepancy log. Make unresolved fields visible rather than presenting the import as entirely verified.",
          mustShow: "Five unique applicants, one supported completed interview, B02's planned appointment, B03's corrected stage and B04's owned unresolved date issue."
        }
      ]
    },
    {
      id: "hr-tracker-lab-s6",
      week: 6,
      title: "Handle missing evidence and tied assessments",
      minutes: 105,
      scenario: [
        "Kavya reviews a new Nila Office Supplies sample, C01 to C04, using the same three equally weighted criteria as the capstone: tracker accuracy, written communication and process mapping. These are fictional samples under rubric R1, scored in whole numbers from one to five. The Missing entry means the written sample has not arrived; it is not a score of zero.",
        "Build this separate sheet in Google Sheets or Microsoft Excel. Calculate an average only when all three valid scores are present, using a COUNT guard. Kavya asks whether a first-match lookup can choose between tied results and whether the missing score can be filled with an average. Prepare a response with a consistent evidence-review step due 24 November 2026, rather than a selection decision."
      ],
      dataset: {
        columns: ["Applicant", "Tracker accuracy", "Written communication", "Process mapping", "Sample reference", "Evidence state"],
        rows: [
          ["C01", "4", "3", "5", "S21", "All three fictional samples available"],
          ["C02", "5", "4", "3", "S22", "All three fictional samples available"],
          ["C03", "4", "Missing", "4", "S23", "Written sample not received"],
          ["C04", "3", "3", "3", "S24", "All three fictional samples available"]
        ]
      },
      outcome: "A guarded assessment sheet showing complete averages, all tied top results and an owned missing-evidence review.",
      tasks: [
        {
          id: "hr-tracker-lab-s6-t1",
          type: "short",
          prompt: "What should the overall assessment cell show for C03 under the rule that all three criteria must have valid evidence?",
          answer: {
            kind: "choice",
            options: ["4.00 from the two available scores", "Pending evidence", "0.00 as an automatic poor result", "A copied score from C01"],
            answerIndex: 1
          },
          explanation: "C03 has only two evidenced scores. Averaging those two hides the missing written sample, while entering zero invents a judgement. The COUNT guard must leave the overall assessment pending until the missing evidence is reviewed."
        },
        {
          id: "hr-tracker-lab-s6-t2",
          type: "short",
          prompt: "Calculate the complete three-score averages and inspect ties. How many applicants share the highest complete average? Exclude C03's pending result.",
          answer: { kind: "number", value: 2, tolerance: 0 },
          explanation: "C01: (4 + 3 + 5) / 3 = 4. C02: (5 + 4 + 3) / 3 = 4. C04: (3 + 3 + 3) / 3 = 3. Two applicants share the maximum of 4. A first-match lookup would hide one of them."
        },
        {
          id: "hr-tracker-lab-s6-t3",
          type: "case",
          prompt: "Write Kavya a review plan that refuses to fill C03's missing score or choose a tied applicant by row order. Show the valid results, explain the formula guard and propose a further job-related review applied consistently to both tied applicants. Name the owner, due date and evidence that would close the pending item.",
          rubric: [
            "Shows C01 and C02 at 4.00, C04 at 3.00 and C03 pending rather than a partial or invented average.",
            "Uses a three-score COUNT guard with one-to-five whole-number validation and leaves missing input blank.",
            "Lists both tied IDs instead of using the first name returned by a lookup as a decision.",
            "Proposes the same job-related follow-up conditions and rubric for both tied applicants, excluding personal preferences.",
            "Assigns Kavya the 24 November review and states the missing written sample and audit evidence required."
          ],
          minWords: 150
        },
        {
          id: "hr-tracker-lab-s6-t4",
          type: "proof",
          prompt: "Attach the assessment sheet with formulas, the tie check and Kavya's review plan. Include a test showing an incomplete row stays pending.",
          mustShow: "Complete averages of 4, 4 and 3, C03 pending, both tied IDs, a completeness guard, valid score rules and an owned dated evidence request."
        }
      ]
    },
    {
      id: "hr-tracker-lab-s7",
      week: 7,
      title: "Find the denominator and date errors in a management report",
      minutes: 105,
      scenario: [
        "Priya prepares a fictional Kiran Stationery report across four practice roles at 26 November 2026. Keep this multi-role review separate from the R01 capstone summary. The draft averages the Reported days column even though some roles have no accepted offer and one figure starts at the offer date rather than the approval date.",
        "For completed time-to-fill, use acceptance minus approval in elapsed calendar days, excluding the approval date. Include only filled roles in the average. Pending acceptance means no completed fill result; open-role age may be shown separately as snapshot minus approval. Build a corrected report in the tracker workbook and retain the original draft for the audit."
      ],
      dataset: {
        columns: ["Role", "Approval date", "Offer issued", "Acceptance date", "Snapshot date", "Reported days"],
        rows: [
          ["R01", "2026-11-02", "2026-11-12", "2026-11-20", "2026-11-26", "18"],
          ["R02", "2026-11-10", "2026-11-18", "Pending", "2026-11-26", "0"],
          ["R03", "2026-11-06", "2026-11-20", "2026-11-25", "2026-11-26", "5"],
          ["R04", "2026-11-14", "2026-11-24", "Pending", "2026-11-26", "12"]
        ]
      },
      outcome: "A corrected multi-role metric report separating completed time-to-fill from open-role age, with a dated source-to-report audit.",
      tasks: [
        {
          id: "hr-tracker-lab-s7-t1",
          type: "short",
          prompt: "Recalculate completed time-to-fill using the defined start and endpoint. What is the mean across filled roles only, in calendar days?",
          answer: { kind: "number", value: 18.5, tolerance: 0.01 },
          explanation: "R01 takes 20 - 2 = 18 days in November. R03 takes 25 - 6 = 19 days. The filled-role mean is (18 + 19) / 2 = 18.5 days. R02 and R04 have no acceptance and must not enter this completed-time average."
        },
        {
          id: "hr-tracker-lab-s7-t2",
          type: "short",
          prompt: "How many roles must remain without a completed time-to-fill result at this snapshot, even though a draft reported a number for each?",
          answer: { kind: "number", value: 2, tolerance: 0 },
          explanation: "R02 and R04 have pending acceptance: two unfilled roles. Their open ages are 26 - 10 = 16 and 26 - 14 = 12 days respectively, but those ages are not completed time-to-fill values."
        },
        {
          id: "hr-tracker-lab-s7-t3",
          type: "case",
          prompt: "The manager wants one average from all four Reported days values. Write a corrected metric memo and an audit plan. Identify each wrong definition, show the supported mean and separately labelled open ages, and assign Priya checks before the next report on 27 November. Explain why a faster-looking number is not evidence of a better process.",
          rubric: [
            "Defines the 26 November snapshot and the filled-role population as R01 and R03 only.",
            "Shows 18 and 19 elapsed days and the two-role average of 18.5 days.",
            "Identifies R02's false zero, R03's offer-date start and R04's open age incorrectly presented as completed time.",
            "Labels R02 at 16 open days and R04 at 12 open days separately, retaining acceptance as pending.",
            "Assigns Priya a source-date and denominator check by 27 November and preserves the draft, corrections and reviewer trail."
          ],
          minWords: 170
        },
        {
          id: "hr-tracker-lab-s7-t4",
          type: "proof",
          prompt: "Attach the original draft and corrected formula report with the metric dictionary and correction log. Show which records enter each calculation.",
          mustShow: "Two filled roles averaging 18.5 days, two unfilled roles with separate ages, guarded date calculations and the three reporting-definition corrections."
        }
      ]
    },
    {
      id: "hr-tracker-lab-s8",
      week: 8,
      title: "Submit the fifteen-applicant recruitment audit pack",
      minutes: 120,
      scenario: [
        "Submit the fictional R01 operations support trainee tracker for Kiran Stationery at 21 November 2026. Use the fifteen individual A01 to A15 records built in week 2, not the four-candidate weighted lab or later intakes. The table below is a grouped reconciliation only. Keep the role brief, workflow, history, scorecard, summary, onboarding checklist and Audit tab together with a reader's index.",
        "Retain role approval on 2 November, applications on 3 November, A04 to A14 screenings on 5 November and A06 to A11 completed interviews on 10 November. A09/A10 offers were issued on 12 November and A10 accepted on 20 November. A11 ended on 11 November, A12 to A14 ended on 6 November and A15 withdrew on 4 November. Preserve blank dates where events did not happen.",
        "Use the three equally weighted criteria and agreed anchors. Create and label six short fictional work-sample sets for A06 to A11 if no sample pack is supplied, then score only their observable content. Keep other assessments pending. These learner-created samples do not replace the seeded stage decisions; escalate any mismatch. Submit formula tests, evidence references and controlled fictional-only access, not real candidate documents."
      ],
      dataset: {
        columns: ["Applicant IDs", "Count", "Current stage", "Completed interviews", "Offers issued", "Acceptances"],
        rows: [
          ["A01 to A03", "3", "Applied", "0", "0", "0"],
          ["A04 to A05", "2", "Screening", "0", "0", "0"],
          ["A06 to A08", "3", "Interview", "3", "0", "0"],
          ["A09", "1", "Offer", "1", "1", "0"],
          ["A10", "1", "Accepted", "1", "1", "1"],
          ["A11", "1", "Not progressed", "1", "0", "0"],
          ["A12 to A14", "3", "Not progressed", "0", "0", "0"],
          ["A15", "1", "Withdrawn", "0", "0", "0"]
        ]
      },
      outcome: "A review-ready fifteen-applicant capstone with fair criteria, checked formulas, recruitment metrics, owned onboarding and a traceable audit trail.",
      tasks: [
        {
          id: "hr-tracker-lab-s8-t1",
          type: "short",
          prompt: "Verify the final tracker against the reference snapshot. How many applicants are recruitment-active in Applied, Screening, Interview or Offer and therefore need recruitment next actions?",
          answer: { kind: "number", value: 9, tolerance: 0 },
          explanation: "3 Applied + 2 Screening + 3 Interview + 1 Offer = 9 active recruitment records. Add 1 Accepted + 4 Not progressed + 1 Withdrawn to reconcile all 15. Accepted onboarding is a separate workflow, not a tenth active recruitment record."
        },
        {
          id: "hr-tracker-lab-s8-t2",
          type: "short",
          prompt: "From the event counts in the final reference table, calculate interview-to-offer conversion. Enter percentage points to two decimal places and keep later-stage applicants in the interview cohort.",
          answer: { kind: "number", value: 33.33, tolerance: 0.01 },
          explanation: "Completed interviews total 3 + 1 + 1 + 1 = 6; offers total 1 + 1 = 2. Conversion is 2 / 6 x 100 = 33.33%. The three currently in Interview are not the full population of completed interviews."
        },
        {
          id: "hr-tracker-lab-s8-t3",
          type: "case",
          prompt: "Submit the recruitment summary and audit narrative for Rolevia review. Explain the fifteen-record reconciliation, consistent scoring and missing-evidence rules, event-based conversion and time-to-fill. Describe one tested error and its correction, an issue requiring escalation and the owned A10 onboarding handover. Keep recommendations within this fictional exercise.",
          rubric: [
            "Reconciles fifteen unique R01 applicants across 3/2/3/1/1/4/1 stage counts and retains nine owned recruitment follow-ups.",
            "Uses three job-related criteria, consistent anchors and traceable samples, with guarded averages and unresolved assessments pending.",
            "Shows two offers from six interviews and 20 November minus 2 November = 18 elapsed days, with definitions and source IDs.",
            "Traces an error through original evidence, old/new values, tests and reviewer approval; assigns an unresolved issue for review.",
            "Provides an owned, dated A10 onboarding checklist with pending evidence states and excludes real personal documents."
          ],
          minWords: 220
        },
        {
          id: "hr-tracker-lab-s8-t4",
          type: "proof",
          prompt: "Attach the complete workbook or restricted-access evidence pack, including the actual fifteen applicant rows and a reader's index. A scorecard screenshot alone does not meet this capstone.",
          mustShow: "Fifteen individual records and history; role and workflow; consistent scorecard with sample evidence; validation and formula tests; defined recruitment metrics; an audit trail; and A10's owned onboarding checklist."
        }
      ]
    }
  ]
};
