export default {
  moduleId: "hr-tracker",
  tagline: "Build a careful fictional hiring tracker, record job-related evidence and explain recruitment progress without hiding uncertainty.",
  weeks: [
    {
      week: 1,
      theme: "A clear workflow and a reliable applicant register",
      lessons: [
        {
          id: "hr-tracker-w1-l1",
          title: "Define the hiring process",
          minutes: 60,
          objective: "Write a fictional role brief and hiring workflow with job-related criteria, stage-entry rules and responsible owners.",
          sections: [
            {
              heading: "Define the work before evaluating people",
              body: [
                "Our fictional role is operations support trainee at Kiran Stationery. The work involves updating a tracker, writing clear follow-up notes and explaining a simple process. Create a Role tab in Google Sheets with these tasks, the evidence you would request and who reviews it. This is a classroom simulation, not an actual vacancy or hiring decision. Do not collect real applications, identification documents or personal information to make the exercise feel more realistic."
              ],
              table: {
                columns: ["Role task", "Practice evidence", "Reviewer"],
                rows: [
                  ["Maintain accurate records", "A small tracker update with source checks", "Rohit"],
                  ["Communicate next steps", "A short written follow-up sample", "Rohit"],
                  ["Explain a process", "A simple process map with owners", "Rohit"]
                ]
              },
              callout: {
                type: "tip",
                title: "Start with a role brief",
                text: "A useful role brief connects each criterion to work the person would do. It does not award points for familiarity, personal similarity or an impressive-sounding background."
              }
            },
            {
              heading: "Write stage-entry and exit rules",
              body: [
                "A stage tells the coordinator what work is pending, while a date records an event that actually happened in the simulation. Define stages before entering applicants so every reviewer uses the same meaning. Interview can include a completed interview awaiting a decision; its completion date must still be recorded separately. Keep Offer and Accepted distinct because sending an offer does not establish acceptance. Preserve terminal outcomes so applicants do not disappear from the final reconciliation."
              ],
              table: {
                columns: ["Stage", "Meaning", "Responsible owner"],
                rows: [
                  ["Applied", "Application recorded; screening pending", "Priya"],
                  ["Screening", "Initial review started; next assessment pending", "Priya"],
                  ["Interview", "Assessment underway or awaiting a recorded decision", "Rohit"],
                  ["Offer", "Practice offer issued; acceptance pending", "Priya"],
                  ["Accepted", "Practice acceptance recorded", "Priya"],
                  ["Not progressed", "Recorded decision ends this application", "Rohit"],
                  ["Withdrawn", "Fictional applicant withdraws from this process", "Priya"]
                ]
              }
            },
            {
              heading: "Make scoring definitions understandable",
              body: [
                "For the fifteen-applicant assignment, use three equally weighted criteria: tracker accuracy, written communication and process mapping. Define what evidence earns each score before looking at an applicant. On a five-point scale, one means major omissions, three means usable work with specific corrections and five means accurate, complete work with clear checks. Scores of two and four sit between these anchors and need a written reason. Missing evidence remains pending; it is not automatically a poor score or a reason to invent an average.",
                "Fair scorecard is a separate four-candidate spreadsheet lab, available in the browser and openable in Google Sheets. Its four job-related criteria are Spreadsheet test, Written case, Structured interview and References. Weights occupy the row B2:E2, initially 0.4, 0.3, 0.2 and 0.2. Task 1 corrects References in E2 to 0.1 and checks =SUM(B2:E2) in B3: one whole, displayed as 100 per cent, not the original 110 per cent. Keep this weighted lab separate from the assignment's three-criterion average."
              ],
              steps: [
                "Write a short task and expected output for each of the three assignment criteria.",
                "Describe the one, three and five anchors using observable work rather than personality.",
                "Ask a second learner to score the same sample and discuss unclear definitions.",
                "Record the agreed rubric version before using it across the fictional applicant set."
              ]
            },
            {
              heading: "Plan safe ownership and escalation",
              body: [
                "Priya coordinates the tracker and follow-ups, while Rohit reviews evidence and unresolved discrepancies. This split makes it clear who can correct a clerical issue and who must resolve a judgement question. Keep access limited to the people doing the exercise, and share only fictional records. If a source is unclear, record the question and reviewer rather than selecting the value that improves the report. Your Week 1 A artefact combines the role brief, criteria and workflow."
              ],
              bullets: [
                "Keep a named reviewer and review date for every unresolved issue.",
                "Do not include caste, religion, family details, photographs or unrelated personal characteristics in the practice tracker.",
                "Keep simulated decisions separate from any real recruitment process.",
                "Record workflow changes before applying them to later applicant records."
              ]
            },
            {
              heading: "Common mistakes and how to avoid them",
              body: [
                "A clear process is agreed before anyone is scored. Check that the criteria describe work, that stage labels refer to evidence and that the spreadsheet's weighting policy is understandable to another reviewer."
              ],
              bullets: [
                "A personal impression becomes a criterion → replace it with an observable work task and scoring anchor.",
                "Offer is treated as Accepted → require a separate recorded acceptance event.",
                "Weights change to favour a candidate → agree them from role needs and log the lab's input correction against that policy.",
                "The lab is treated as the three-criterion assignment → keep its four weighted criteria and separate dataset clearly labelled."
              ]
            },
            {
              heading: "What good looks like",
              body: [
                "Give a reviewer the role brief, workflow and scoring definitions. They should be able to check each item below without relying on informal explanations or knowledge of the fictional applicants."
              ],
              bullets: [
                "The role brief links each of the three assignment criteria to a task, sample and named reviewer.",
                "The rubric defines observable anchors at one, three and five and records its agreed version.",
                "All seven stages have entry rules, including distinct Offer and Accepted states.",
                "Ownership and escalation are documented, and unrelated personal fields are absent.",
                "The lab's B2:E2 weights total one using SUM in B3; the correction from 110 to 100 per cent is recorded."
              ]
            }
          ],
          practice: {
            labId: "hr-tracker",
            instruction: "Open Fair scorecard. Task 1: change References E2 from 0.2 to 0.1 and enter =SUM(B2:E2) in B3; confirm 1, displayed as 100 per cent. Explain why the original weights totalled 110 per cent. Keep this lab separate from the three-criterion assignment."
          },
          checkpoint: [
            {
              question: "Two reviewers interpret a score of four differently. What should happen before they score the full applicant set?",
              answer: "Compare their reasoning on the same practice sample, clarify the observable difference between the anchors and record the agreed rubric version. Calibration reduces inconsistent scoring before it spreads across the tracker."
            },
            {
              question: "Why should Offer and Accepted remain separate even when there is only one fictional vacancy?",
              answer: "An issued offer may still be pending or declined. Acceptance is a different event, needed for this course's time-to-fill measure and onboarding handover. Combining the stages could make an unfilled role appear filled."
            }
          ]
        },
        {
          id: "hr-tracker-w1-l2",
          title: "Track candidates carefully",
          minutes: 60,
          objective: "Create exactly 15 fictional applicant records with validated stages, actual event dates, owners, follow-ups and a traceable correction log.",
          sections: [
            {
              heading: "Set up a tracker with a stable row structure",
              body: [
                "Create Tracker, History, Scorecard, Summary and Audit tabs beside Role in Google Sheets. In Tracker, place applicant IDs A01 through A15 in rows 2 through 16, with one applicant per row and role ID R01 throughout. Use IDs instead of names because names are unnecessary for this exercise. Keep all dates as date values, not mixed text. Put the role approval date, 2 November 2026, in Role cell B2 and label it clearly in A2."
              ],
              table: {
                columns: ["Tracker columns", "Contents"],
                rows: [
                  ["A, B", "Applicant ID, role ID"],
                  ["C", "Current stage"],
                  ["D, E, F", "Applied, screened, interview completed dates"],
                  ["G, H", "Offer issued, offer accepted dates"],
                  ["I", "Responsible owner"],
                  ["J, K", "Next action, next-action date"],
                  ["L", "Fictional evidence reference"],
                  ["M", "Date entered current stage"]
                ]
              },
              callout: {
                type: "tip",
                title: "An unambiguous date",
                text: "Enter =DATE(2026,11,2) for the approval date and display dates as yyyy-mm-dd. The same DATE formula works in Google Sheets and Microsoft Excel with English formula settings."
              }
            },
            {
              heading: "Add validation and useful views",
              body: [
                "Select C2:C16 in Google Sheets and use Data, Data validation to create a dropdown from the seven agreed stage names. Set invalid entries to be rejected rather than merely warned about. Apply a valid-date rule to date fields, allowing blanks for events that have not happened. Add a filter and freeze the header row so the meaning of each column stays visible. Validation supports consistency, but it does not prove that the selected stage matches the evidence."
              ],
              steps: [
                "Use Data, Create a filter and View, Freeze, 1 row in Google Sheets.",
                "Microsoft Excel equivalent: Data, Data Validation, List with a Stop error alert; use Data, Filter and View, Freeze Panes, Freeze Top Row.",
                "Try an invalid stage on a copy, confirm it is rejected and record the test result.",
                "Use =COUNTIF($A$2:$A$16,A2) beside each ID; every result should be 1.",
                "Check that all 15 IDs are present as well as unique; a count alone cannot detect a missing ID replaced by a duplicate."
              ]
            },
            {
              heading: "Enter the fictional event history",
              body: [
                "Use 21 November 2026 as the snapshot. All 15 applicants applied on 3 November. A04 through A14 were screened on 5 November; A06 through A11 completed interviews on 10 November. A09 and A10 received offers on 12 November, and A10 accepted on 20 November. A11 was not progressed on 11 November, A12 through A14 on 6 November, and A15 withdrew on 4 November. Preserve these dated transitions in History and leave other event dates blank."
              ],
              table: {
                columns: ["Current stage", "Applicant IDs", "Count"],
                rows: [
                  ["Applied", "A01 to A03", "3"],
                  ["Screening", "A04 to A05", "2"],
                  ["Interview", "A06 to A08", "3"],
                  ["Offer", "A09", "1"],
                  ["Accepted", "A10", "1"],
                  ["Not progressed", "A11 to A14", "4"],
                  ["Withdrawn", "A15", "1"]
                ]
              },
              bullets: [
                "Use the event that caused the current stage as its entry date in column M.",
                "Record a planned interview as a next action, not an interview-completed date.",
                "A blank acceptance date on an open offer is expected, not a zero-day hiring result."
              ]
            },
            {
              heading: "Keep follow-ups and corrections auditable",
              body: [
                "Assign the stage owner from the workflow and add a specific follow-up due after the snapshot for each active record. A09, for example, needs Priya to check the practice offer response by 23 November. A10 needs a separate onboarding action rather than another interview reminder. When a date or stage is wrong, compare it with the fictional source, log the old and new values and name the reviewer. Do not quietly adjust a date to improve a metric."
              ],
              steps: [
                "Check application, screening, interview, offer and acceptance dates in sequence where events exist.",
                "Record applicant ID, field, old value, new value, source, correction date and reviewer in Audit.",
                "For an unresolved discrepancy, keep the original value, flag it and assign Rohit a review date.",
                "Save the validated tracker, history and test evidence as the Week 1 B artefact."
              ]
            },
            {
              heading: "Common mistakes and how to avoid them",
              body: [
                "The tracker must describe events that happened in the simulation, not events somebody expects. Use stable IDs and dated sources so that a filter, sort or clerical correction cannot silently change the story."
              ],
              bullets: [
                "Fifteen nonblank rows are treated as fifteen distinct applicants → check every expected ID and its COUNTIF result.",
                "A booked interview is entered as completed → put the planned date in next actions until completion evidence exists.",
                "A pending acceptance becomes a zero date → leave it blank and retain the Offer stage.",
                "A date is corrected without a trail → retain the old and new values, source, reviewer and correction date."
              ]
            },
            {
              heading: "What good looks like",
              body: [
                "Use a test copy for invalid entries and give the saved tracker to another learner for review. These checks cover record integrity as well as the practical information needed for follow-up."
              ],
              bullets: [
                "A01 to A15 occur once each under R01, and the header row and filters remain usable.",
                "Invalid stages are rejected and date fields contain actual dates or justified blanks.",
                "The seven stage counts reconcile as 3 + 2 + 3 + 1 + 1 + 4 + 1 = 15 at 21 November.",
                "Active records have owners and dated next actions; A09's response check is due on 23 November.",
                "The audit preserves source-backed corrections and flags unresolved discrepancies for Rohit."
              ]
            }
          ],
          practice: {
            labId: "hr-tracker",
            instruction: "Open Fair scorecard. Task 1: correct B2:E2 and check their SUM in B3. Task 2: enter =SUMPRODUCT(B6:E6,$B$2:$E$2)/5*100 in G6 and fill through G9. Check both ranges are 1x4 rows and Priya, Rohit, Meera and Daniel each retain their own scores."
          },
          checkpoint: [
            {
              question: "An interview is booked for 24 November but has not happened. Where should that date go?",
              answer: "Put it in the next-action date with a description such as Attend practice interview. Leave the interview-completed field blank until the event occurs. Otherwise the summary would count scheduled work as completed assessment."
            },
            {
              question: "The tracker contains 15 nonblank IDs. Why is that not enough to prove the applicant register is complete?",
              answer: "A duplicate could replace a missing applicant while the count stays 15. Check each expected ID from A01 to A15 and confirm each occurs once, then reconcile the current-stage totals to the same set."
            }
          ]
        }
      ]
    },
    {
      week: 2,
      theme: "Consistent evidence and an honest recruitment summary",
      lessons: [
        {
          id: "hr-tracker-w2-l1",
          title: "Record fair evidence",
          minutes: 60,
          objective: "Apply one job-relevant scorecard consistently, record observable evidence and escalate missing or conflicting assessments without inventing scores.",
          sections: [
            {
              heading: "Use the same assessment conditions",
              body: [
                "Before reviewing a sample, confirm that the task, time allowed and expected output are comparable for everyone in the practice set. Use the same rubric version and record any agreed adjustment to the process without treating it as a negative trait. Do not change criteria after seeing which applicant scores well. Your role is to document evidence and exceptions clearly, not to make a real selection decision or use a spreadsheet total as a substitute for responsible review."
              ],
              steps: [
                "Use rows 2:7 for A06 to A11: A ID, B rubric version, C accuracy, D communication, E process, F average, G evidence, H reviewer.",
                "Use the three criteria agreed in the assignment role brief with equal weighting.",
                "Record when each work sample was assessed and whether any part is missing.",
                "Ask Rohit to review exceptions before including them in a comparison."
              ]
            },
            {
              heading: "Write evidence that another reviewer can inspect",
              body: [
                "An evidence note describes what the sample contains and why that matches a scoring anchor. For tracker accuracy, a useful note might say that the applicant corrected the supplied date inconsistency and documented the source. It should not describe whether the reviewer liked the applicant. Keep the work sample reference beside the score so the next reviewer can inspect the same material. If the note and score disagree, flag the mismatch instead of averaging it away.",
                "If no work-sample pack is supplied, create six short fictional responses, one for each interviewed ID A06 through A11. Include a tracker correction, follow-up message and process map for each response. Label these as learner-created examples and score what is written using the agreed anchors. Do not invent scores for other applicants whose assessment evidence is not supplied. The seeded stage decisions remain separate case inputs, not outcomes inferred from your invented samples; flag any mismatch for the reviewer."
              ],
              table: {
                columns: ["Criterion", "Evidence note", "Follow-up"],
                rows: [
                  ["Tracker accuracy", "Corrected the date and recorded its practice source", "Check against accuracy anchor"],
                  ["Written communication", "Named the action and owner but omitted a due date", "Explain effect on the score"],
                  ["Process mapping", "Included a reviewer and a route for unresolved issues", "Retain the sample reference"]
                ]
              }
            },
            {
              heading: "Calculate scores without hiding missing evidence",
              body: [
                "For three available scores of 4, 3 and 5, the total is 12 and the equal-weight average is 4.00. In Google Sheets, if those scores occupy C2:E2, use the formula below to prevent a partial average being presented as complete. Microsoft Excel uses the same formula. A tie is not an invitation to add an unrelated personal preference; follow a pre-agreed, job-related review step and keep the evidence behind that step visible.",
                "In the separate four-criterion lab, use =SUMPRODUCT(B6:E6,$B$2:$E$2)/5*100 in G6 and fill through G9. Both ranges must have the same shape: one row of four cells, or 1x4. Corrected weights total one, so SUMPRODUCT gives a weighted mean on the one-to-five scale; dividing by five and multiplying by 100 gives the lab's total out of 100. Do not compare an unscaled value such as 3.80 with the 60-point threshold. Confirm all four scores are present and valid before interpreting any ranking."
              ],
              steps: [
                "In F2 use =IF(COUNT(C2:E2)=3,AVERAGE(C2:E2),\"Pending evidence\") for the three-score average, then copy down the applicant rows.",
                "Google Sheets: select C2:E7, then Data, Data validation, Custom formula is: =OR(C2=\"\",AND(ISNUMBER(C2),C2=INT(C2),C2>=1,C2<=5)).",
                "Set the rule to reject invalid entries; leave unassessed scores blank.",
                "Microsoft Excel equivalent: Data, Data Validation, Whole number, Between 1 and 5, with a Stop error alert.",
                "Display numeric averages to two decimal places without changing the underlying values.",
                "On a test copy, check complete and incomplete rows, then try 1.5 to confirm that non-whole scores are rejected."
              ],
              callout: {
                type: "warning",
                title: "A blank is not a score",
                text: "An average of two available samples can look stronger than a complete three-sample assessment. Keep missing evidence visible and resolve it through the agreed review process."
              }
            },
            {
              heading: "Review disagreement and retain the trail",
              body: [
                "Use a separate practice copy to test a disagreement between a score and its written evidence. Ask the reviewer to identify the relevant anchor, compare the sample and record the resolution. Preserve the earlier entry in Audit rather than hiding that a correction occurred. Keep the scope of your conclusion narrow: the exercise shows a more traceable evaluation, not that bias has been removed from every decision. Save the rubric, scored samples and review log together."
              ],
              bullets: [
                "Name the applicant and criterion, not a personal label for the applicant.",
                "Record what changed, who approved it and which evidence supports the revision.",
                "Keep unresolved issues pending for Rohit with a dated next action.",
                "Submit the consistent evaluation sheet as the Week 2 A artefact."
              ]
            },
            {
              heading: "Common mistakes and how to avoid them",
              body: [
                "A formula can be numerically correct while answering the wrong assessment question. Check completeness, scale and rubric consistency before using an average or weighted total in a comparison."
              ],
              bullets: [
                "Two scores are presented as a complete three-criterion average → keep the overall result pending until evidence is complete.",
                "A one-to-five weighted mean is compared with 60 → convert to the lab's scale out of 100 first.",
                "Copied formulas shift the weights → lock $B$2:$E$2 and keep both SUMPRODUCT ranges as 1x4 rows.",
                "A tied score is broken by personal preference → use the pre-agreed job-related review and retain its evidence."
              ]
            },
            {
              heading: "What good looks like",
              body: [
                "A reviewer should be able to move from each score to a sample and an anchor. Test the calculation and the missing-evidence route on a copy, keeping the result of both tests in the review log."
              ],
              bullets: [
                "Each scored applicant uses the same task conditions, rubric version and one-to-five whole-number anchors.",
                "Every criterion score has an inspectable work-sample reference and a job-related evidence note.",
                "The assignment returns 4.00 for 4, 3 and 5, and Pending evidence for an incomplete row.",
                "The lab's G6:G9 formulas use aligned fixed weights and give 76, 50, 82 and 74 on the threshold's scale.",
                "Corrections, ties and unresolved disagreements retain a reviewer, reason and next-review date."
              ]
            }
          ],
          practice: {
            labId: "hr-tracker",
            instruction: "Open Fair scorecard. Task 1: correct B2:E2 and SUM in B3. Task 2: SUMPRODUCT totals in G6:G9. Task 3: MAX in B11. Task 4: INDEX/MATCH or XLOOKUP in B12 using A6:A9 and G6:G9. Task 5: IF below 60 in H6:H9. Check 76, 50, 82 and 74 by hand."
          },
          checkpoint: [
            {
              question: "One applicant has scores of 4 and 5 but no process-mapping sample. Why not report 4.50 as a complete score?",
              answer: "That average covers only two criteria and is not comparable with the agreed three-criterion score. Mark evidence pending, request the missing sample through the practice process and calculate the final average only when the required evidence exists."
            },
            {
              question: "Two complete scorecards have the same average. What is an appropriate next review step?",
              answer: "Use the pre-agreed job-related tie review, such as a closer inspection of the same accuracy evidence or a consistent additional task. Document the reason and reviewer; do not introduce personal familiarity or a new criterion after seeing the tie."
            }
          ]
        },
        {
          id: "hr-tracker-w2-l2",
          title: "Report and hand over",
          minutes: 60,
          objective: "Reconcile all 15 applicants, calculate interview-to-offer conversion and time-to-fill, and prepare an owned onboarding checklist.",
          sections: [
            {
              heading: "Separate current status from completed events",
              body: [
                "Build a Summary tab with one row per current stage. In Google Sheets, put the stage name in A2 and use the count formula below in B2, then repeat for each stage. The seven counts should total 15. This snapshot describes where applicants are now. For conversion, count completed interview and offer events instead: A06 through A11 were interviewed, even though several are now in later or terminal stages. State the snapshot date beside both views."
              ],
              steps: [
                "Use =COUNTIF(Tracker!$C$2:$C$16,A2) for each current-stage count; Microsoft Excel uses the same formula.",
                "Sum the seven stage counts and compare the result with the 15 unique applicant IDs.",
                "Put completed interviews in Summary B11 using =COUNT(Tracker!F2:F16); the result is 6.",
                "Put offers issued in Summary B12 using =COUNT(Tracker!G2:G16); the result is 2."
              ]
            },
            {
              heading: "Define recruitment metrics before reporting them",
              body: [
                "For this role's cohort, two of the six interviewed applicants received offers by 21 November. Interview-to-offer conversion is 2 divided by 6, displayed as 33.3% to one decimal place. Time-to-fill means elapsed calendar days from role approval to offer acceptance, excluding the approval date. The role was approved on 2 November and A10 accepted on 20 November, giving 18 days. Do not substitute the application date, the offer date or a working-day calculation without changing the definition."
              ],
              steps: [
                "Use =IF(B11=0,\"Not available\",B12/B11) for conversion and format numeric results as a percentage.",
                "In the seeded tracker, A10 is on row 11; use =IF(Tracker!H11=\"\",\"Not yet filled\",Tracker!H11-Role!B2).",
                "Format the elapsed-day result as a number, not a calendar date; the same formulas work in Microsoft Excel.",
                "Check the 18-day result manually and retain the approval and acceptance evidence references."
              ],
              callout: {
                type: "warning",
                title: "Protect the meaning of a blank",
                text: "An unfilled role has no completed time-to-fill. Report Not yet filled and, if useful, a separately labelled age as at the snapshot date rather than replacing missing acceptance with zero."
              }
            },
            {
              heading: "Make onboarding responsibilities visible",
              body: [
                "An accepted practice offer begins a different workflow. Create an onboarding checklist for A10 that names an owner, due date, completion evidence and status for each item. Keep all tasks simulated and do not request actual personal documents or activate real account access. The checklist should make outstanding work visible rather than imply that acceptance means everything is ready. Ask the receiving coordinator to review the plan and note any unresolved responsibility before calling the handover acknowledged."
              ],
              table: {
                columns: ["Simulated task", "Owner", "Due date", "Evidence or status"],
                rows: [
                  ["Confirm proposed start arrangements", "Priya", "23 November 2026", "Practice confirmation, pending"],
                  ["Prepare role orientation checklist", "Rohit", "24 November 2026", "Draft checklist reference"],
                  ["List required equipment and access", "Kavya", "24 November 2026", "Fictional requirements only, pending"],
                  ["Review handover and open questions", "Priya", "25 November 2026", "Receiving review, pending"]
                ]
              }
            },
            {
              heading: "Assemble the fifteen-applicant audit",
              body: [
                "Your final pack contains the role brief, workflow, validated tracker, scorecard, summary, onboarding checklist and audit trail. Include the two metric definitions and show exactly which records produce them. Reviewers should be able to follow a correction from the original evidence to the final value. A small, honest summary is preferable to a polished report with hidden gaps. Finish by explaining one data-quality check and one issue that would need a responsible person's review outside this simulation.",
                "If you include the separate lab results, label the four-candidate dataset and its weighting version. MAX returns a number, not a name or decision. A name lookup must use the same total range and an exact match; a first-match lookup can hide a tie. Use IF's below-60 flag as a prompt to review evidence, not as an automatic rejection. Keep these practice results separate from the seeded offer and acceptance events in the fifteen-applicant tracker."
              ],
              steps: [
                "Confirm exactly 15 fictional applicants for R01, with unique IDs, owners and appropriate dates.",
                "Check that the rubric is consistent and that missing or conflicting evidence stays visible.",
                "Reconcile 3 + 2 + 3 + 1 + 1 + 4 + 1 = 15 current-stage records.",
                "Include the 2 / 6 conversion, the checked 18-day time-to-fill and the owned onboarding checklist.",
                "Save the recruitment summary and complete audit pack as the Week 2 B artefact."
              ]
            },
            {
              heading: "Common mistakes and how to avoid them",
              body: [
                "A summary must preserve the meaning of its source records. Distinguish current status, completed events, formula rankings and authorised decisions rather than compressing them into one attractive result."
              ],
              bullets: [
                "Only three current Interview records form the denominator → count all six applicants with completed interview events.",
                "A blank acceptance date produces zero days → report Not yet filled until an acceptance is evidenced.",
                "A MAX result is treated as a person's name → use an exact-match lookup and inspect ties separately.",
                "An accepted offer implies onboarding is finished → show each preparation task's owner, due date and actual status."
              ]
            },
            {
              heading: "What good looks like",
              body: [
                "Ask the reviewer to trace one metric and one onboarding action back to their sources. The report is ready when its numbers, definitions and remaining work can all be checked from the saved pack."
              ],
              bullets: [
                "The summary names R01, the 21 November snapshot and 15 unique applicants across seven reconciled stages.",
                "The offer conversion shows two offers from six interviewed applicants: 2 / 6, about 33.3%.",
                "Time-to-fill shows 20 November minus 2 November = 18 elapsed calendar days with source references.",
                "A10's onboarding checklist names owners, due dates, evidence and pending states without real personal documents.",
                "Any lab ranking is separately labelled, checked for ties and distinguished from the seeded recruitment decisions."
              ]
            }
          ],
          practice: {
            labId: "hr-tracker",
            instruction: "Open Fair scorecard. Task 1: verify B2:E2 with SUM in B3. Task 2: check SUMPRODUCT totals in G6:G9. Task 3: MAX in B11. Task 4: exact-match name in B12 from A6:A9 and G6:G9. Task 5: IF below 60 in H6:H9. Report Meera's 82, Rohit's flag and review limits."
          },
          checkpoint: [
            {
              question: "Only three applicants currently sit in Interview. Why does the conversion calculation use six interviewed applicants?",
              answer: "A09, A10 and A11 also completed interviews before moving to Offer, Accepted or Not progressed. Event dates identify the full interviewed cohort; the current-stage label shows only the present position. Using three would omit valid interviewed applicants."
            },
            {
              question: "A second practice role has no accepted offer at the snapshot. How should its time-to-fill be reported?",
              answer: "Report Not yet filled because the acceptance event has not occurred. You may show elapsed age from approval to the snapshot as a separate measure, but it is not a completed time-to-fill and should not be mixed into an average of filled roles."
            }
          ]
        },
        {
          id: "hr-tracker-w2-l3",
          title: "Case study: Nila Office Supplies end to end",
          minutes: 60,
          objective: "Build and check a four-candidate weighted scorecard, find the highest total and its name, and hand over threshold flags with evidence and limitations.",
          sections: [
            {
              heading: "Agree the role, evidence and weights",
              body: [
                "Nila Office Supplies is fictional. Its practice coordinator Kavya reviews Priya, Rohit, Meera and Daniel using the same sample tasks and one-to-five anchors. These candidates are separate from the fifteen-applicant assignment. Use the lab's four criteria: Spreadsheet test, Written case, Structured interview and References. References means supplied fictional job-related evidence notes, not an invitation to collect contact details or approach real people. Retain the same assessment conditions and rubric for everyone.",
                "The starting weights in B2:E2 are 0.4, 0.3, 0.2 and 0.2. Enter =SUM(B2:E2) in B3: 0.4 + 0.3 + 0.2 + 0.2 = 1.1, or 110 per cent. The case's agreed policy is 40%, 30%, 20% and 10%, so correct References E2 to 0.1 and log the old value, new value and reason. Now B3 returns 0.4 + 0.3 + 0.2 + 0.1 = 1, displayed as 100 per cent. This repairs a policy-input error; it is not a change made to favour the highest scorer.",
                "Keep names in A6:A9 and their four scores in B6:E9 in criterion order. G6:G9 hold weighted totals; H6:H9 hold threshold flags. B11 is the top score and B12 the top name. Record fictional evidence IDs S01 to S04 beside the four names in a separate review note so the lab's supplied score cells remain unchanged. The table in the next section reproduces the supplied scores and the corrected results."
              ]
            },
            {
              heading: "Calculate four totals without hiding the scale",
              body: [
                "Enter =SUMPRODUCT(B6:E6,$B$2:$E$2)/5*100 in G6 and fill through G9. B6:E6 and $B$2:$E$2 are both 1x4 rows; equal length alone is insufficient if one range is a column. Each score is multiplied by its matching criterion weight. Dollar signs keep the weight row fixed while the score row changes. With weights totalling one, divide the weighted mean by five and multiply by 100 to compare it with the 60-point threshold. Check all four scores are present and valid first.",
                "Check the arithmetic independently. Rohit: (0.8 + 0.9 + 0.4 + 0.4) / 5 x 100 = 50. Meera: (2.0 + 1.2 + 0.6 + 0.3) / 5 x 100 = 82. Daniel: (1.2 + 1.5 + 0.8 + 0.2) / 5 x 100 = 74. Keep unrounded totals for comparisons and use display formatting only for readability. Do not alter the supplied scores to reach an expected ranking."
              ],
              table: {
                columns: ["Candidate / row", "Scores in B:E", "Weighted mean", "Total in G", "Below 60?"],
                rows: [
                  ["Priya / 6", "4, 3, 4, 5", "3.80", "76", "No"],
                  ["Rohit / 7", "2, 3, 2, 4", "2.50", "50", "Yes"],
                  ["Meera / 8", "5, 4, 3, 3", "4.10", "82", "No"],
                  ["Daniel / 9", "3, 5, 4, 2", "3.70", "74", "No"]
                ]
              },
              callout: {
                type: "example",
                title: "Priya's total, one term at a time",
                text: "(4 x 0.4 + 3 x 0.3 + 4 x 0.2 + 5 x 0.1) / 5 x 100 = (1.6 + 0.9 + 0.8 + 0.5) / 5 x 100 = 3.8 / 5 x 100 = 76. A plain average would apply different weights and answer a different question."
              }
            },
            {
              heading: "Find the top result and hand it over responsibly",
              body: [
                "The highest corrected total is 82 for Meera. Rohit's 50 is the only result below 60; three are at or above the threshold, so 1 + 3 = 4 candidates reconcile. This flag routes work for review rather than making a selection decision. Kavya's 22 November 2026 handover records the rubric version, weight correction, four evidence IDs and arithmetic checks. She must review Rohit's spreadsheet-test and structured-interview evidence by 23 November; any unresolved sample remains pending."
              ],
              steps: [
                "For Task 3, enter =MAX(G6:G9) in B11 and confirm 82 from the same four complete totals.",
                "For Task 4, enter =INDEX(A6:A9,MATCH(B11,G6:G9,0)) in B12 to return Meera using an exact match.",
                "Alternatively, =XLOOKUP(B11,G6:G9,A6:A9,\"Check totals\",0) returns the same name with an exact match.",
                "For Task 5, enter =IF(G6<60,\"Review below threshold\",\"At or above threshold\") in H6 and fill through H9.",
                "Check =COUNTIF(G6:G9,B11) in a review note: the result is 1. If greater than 1, list all tied names and use the agreed review rule.",
                "Hand over the evidence and flags to Kavya; do not turn the top name or threshold into an automatic offer or rejection."
              ]
            },
            {
              heading: "Common mistakes and how to avoid them",
              body: [
                "Before interpreting a ranking, verify the inputs, the formula layout and the meaning of a flag. The same arithmetic error repeated across four rows can look consistent without being correct."
              ],
              bullets: [
                "The initial 110 per cent is accepted → correct References E2 to 0.1 and verify SUM(B2:E2) returns one in B3.",
                "SUMPRODUCT mixes a row and a column → use B6:E6 with $B$2:$E$2 so both ranges are 1x4 rows.",
                "A first-match lookup hides a tie → count occurrences of the maximum and review all tied candidates.",
                "Below 60 is treated as automatic rejection → retain the evidence, review owner and next action instead."
              ]
            },
            {
              heading: "What good looks like",
              body: [
                "A reviewer should be able to reproduce the weighted scorecard without changing the agreed criteria or choosing a preferred candidate. Use the saved formulas and evidence IDs to support every check below."
              ],
              bullets: [
                "B2:E2 contains 0.4, 0.3, 0.2 and 0.1; B3 uses SUM and returns one with the E2 correction logged.",
                "Each candidate has four valid scores; G6:G9 contain SUMPRODUCT formulas with matching 1x4 ranges and fixed weights.",
                "Corrected totals reconcile to Priya 76, Rohit 50, Meera 82 and Daniel 74 using the supplied scores.",
                "B11 uses MAX to return 82; B12 uses an exact-match lookup to return Meera, and the maximum occurs once.",
                "IF in H6:H9 flags only Rohit below 60; a score of exactly 60 would be at or above the threshold.",
                "Kavya's handover includes the rubric, evidence, weight correction, flags, review date and interpretation limits."
              ]
            }
          ],
          practice: {
            labId: "hr-tracker",
            instruction: "Open Fair scorecard. Task 1: correct E2 and SUM(B2:E2) in B3. Task 2: SUMPRODUCT in G6:G9. Task 3: MAX in B11. Task 4: exact-match name in B12 from A6:A9 and G6:G9. Task 5: IF flags in H6:H9. Check Meera at 82 and Rohit below 60; retain the formulas."
          },
          checkpoint: [
            {
              question: "How does Priya's corrected weighted mean of 3.80 become a comparable total of 76?",
              answer: "Corrected weights total one, so SUMPRODUCT gives 4 x 0.4 + 3 x 0.3 + 4 x 0.2 + 5 x 0.1 = 3.80 on the one-to-five scale. Divide by five and multiply by 100: 3.80 / 5 x 100 = 76. Compare 76, not 3.80, with the 60-point threshold."
            },
            {
              question: "What should the top-result and threshold checks return after correcting References to 0.1?",
              answer: "G6:G9 returns 76, 50, 82 and 74. MAX in B11 gives 82; an exact-match lookup in B12 returns Meera and a tie check finds one occurrence. IF in H6:H9 flags only Rohit's 50 below 60. These are review aids, not offer or rejection decisions."
            },
            {
              question: "Why must the two ranges in the G6 SUMPRODUCT formula both be 1x4 rows?",
              answer: "SUMPRODUCT pairs corresponding entries. B6:E6 and $B$2:$E$2 each contain one row of four cells in the same criterion order. A four-cell column has a different shape and cannot be substituted directly. Lock the weight row before filling down so only each candidate's score row changes."
            }
          ]
        }
      ]
    }
  ],
  deck: {
    title: "Hiring tracker workshop: evidence before averages",
    slides: [
      {
        kind: "title",
        title: "Make progress visible and reviewable",
        subtitle: "A 60-minute workshop with 15 fictional applicants",
        illustration: "hr-tracker",
        notes: "Allow 3 minutes. Explain that this is a coordination and reporting exercise, not a real hiring decision. Ask learners to keep real candidate information out of discussion and shared files."
      },
      {
        kind: "content",
        title: "Our working route",
        bullets: [
          "Connect role tasks to observable evidence.",
          "Check stages, dates and the 15-applicant register.",
          "Practise consistent scoring and a missing-evidence check.",
          "Reconcile the summary and prepare an onboarding handover."
        ],
        notes: "Allow 4 minutes. Ask learners to open the role brief and tracker side by side. Invite one person to explain what the coordinator owns and what needs the reviewer's judgement."
      },
      {
        kind: "content",
        title: "A criterion needs a task and an anchor",
        bullets: [
          "The assignment uses tracker accuracy, written communication and process mapping.",
          "Use the same task conditions and rubric version across the practice set.",
          "Describe scores through observable work, not personal impressions.",
          "Calibrate disagreements before scoring the full set."
        ],
        notes: "Allow 6 minutes. Read one sample note and ask pairs to place it against an anchor. Discuss wording that different reviewers could interpret differently and improve it together. Keep the assignment's three criteria distinct from the lab's four weighted criteria."
      },
      {
        kind: "steps",
        title: "Inspect the tracker structure",
        steps: [
          "Find A01 to A15, each once, under role R01.",
          "Test the stage dropdown on a practice copy.",
          "Distinguish scheduled actions from completed-event dates.",
          "Check the source and audit trail for one date change."
        ],
        notes: "Allow 6 minutes. Demonstrate the Google Sheets validation route and state the Microsoft Excel equivalent. Have learners test one invalid stage without damaging their saved submission."
      },
      {
        kind: "question",
        title: "Poll: an interview is only scheduled",
        question: {
          prompt: "An interview is booked but not completed. Which field should hold its planned date?",
          options: ["Offer accepted date", "Interview completed date", "Next-action date", "Role approval date"],
          answerIndex: 2,
          explanation: "A planned interview belongs in next actions. Entering it as completed would inflate the event count used in the recruitment summary."
        },
        notes: "Allow 3 minutes. Ask learners which metric could be affected by recording a future interview as complete. Use the answer to reinforce the difference between planning and evidence."
      },
      {
        kind: "steps",
        title: "Run the fair-scorecard exercise",
        steps: [
          "Task 1: correct References E2 to 0.1; =SUM(B2:E2) in B3 must return one, displayed as 100 per cent.",
          "Task 2: use =SUMPRODUCT(B6:E6,$B$2:$E$2)/5*100 in G6 and fill to G9; both ranges are 1x4 rows.",
          "Task 3: use =MAX(G6:G9) in B11; Task 4: use an exact-match lookup over A6:A9 and G6:G9 in B12.",
          "Task 5: use IF below 60 in H6:H9; Meera leads at 82 and Rohit is flagged at 50.",
          "Explain one limitation of using a small simulated scorecard rather than making a decision from the ranking."
        ],
        notes: "Allow 7 minutes. Demonstrate the four-criterion spreadsheet in the browser or Google Sheets, then let learners check one row independently. Distinguish its weighted total from the assignment's equal-weight average. Neither a top name nor a threshold flag authorises a real selection decision."
      },
      {
        kind: "content",
        title: "A score needs its evidence",
        bullets: [
          "Keep applicant ID, criterion, rubric version and work-sample reference together.",
          "Explain why the observed work matches the selected anchor.",
          "Show missing evidence as pending, not as zero or a complete average.",
          "Send unresolved disagreement to Rohit with a review date."
        ],
        notes: "Allow 6 minutes. Show a three-criterion row with one blank and ask learners to test the pending-evidence formula. Review one complete row manually before moving to the poll."
      },
      {
        kind: "question",
        title: "Poll: incomplete assessment",
        question: {
          prompt: "Scores of 4 and 5 are available, but the third required work sample is missing. What should the overall result show?",
          options: ["Pending evidence", "A complete score of 4.50", "A complete score of zero", "An automatic decision"],
          answerIndex: 0,
          explanation: "The agreed comparison requires three criteria. Preserve the two available scores, flag the missing sample and keep the overall assessment pending."
        },
        notes: "Allow 3 minutes. Ask why averaging only the visible numbers could make comparisons misleading. Invite learners to state the next action and reviewer for the missing sample."
      },
      {
        kind: "steps",
        title: "Build two different summary views",
        steps: [
          "Reconcile seven current-stage counts to all 15 applicants.",
          "Count six unique applicants with completed interview dates.",
          "Count two of that cohort with offers: 2 / 6, about 33.3%.",
          "Check 20 November minus 2 November: 18 elapsed calendar days to fill."
        ],
        notes: "Allow 7 minutes. Trace A11 through Interview to Not progressed so learners see why current labels cannot replace event history. Check both the denominator and the time-to-fill date convention aloud."
      },
      {
        kind: "question",
        title: "Poll: two interview rounds",
        question: {
          prompt: "One applicant completes two interview rounds for the same role. How many applicants should they add to the interview-to-offer denominator?",
          options: ["Zero applicants", "Two applicants", "Three applicants", "One applicant"],
          answerIndex: 3,
          explanation: "This metric counts unique interviewed applicants, not interview meetings. Keep round-level notes separately without duplicating the applicant in the denominator."
        },
        notes: "Allow 4 minutes. Ask learners to distinguish a count of meetings from a count of people. Explain that both can be useful, but they must not share an ambiguous label."
      },
      {
        kind: "content",
        title: "Acceptance starts another checklist",
        bullets: [
          "A10 needs an owned onboarding plan, not an assumed ready status.",
          "Name the task, owner, due date and evidence or pending state.",
          "Keep equipment and access requirements fictional.",
          "Submit the role brief, tracker, scorecard, summary and audit trail together."
        ],
        notes: "Allow 6 minutes. Ask pairs to review one onboarding item and identify who receives the work. Check that their handover does not request real personal documents or imply access has been activated."
      },
      {
        kind: "summary",
        title: "Report what the records support",
        bullets: [
          "Define the role, criteria and workflow before entering scores.",
          "Keep stages consistent and distinguish actual dates from plans.",
          "Use the correct cohort and elapsed-day convention.",
          "Retain corrections, unresolved issues and receiving ownership."
        ],
        notes: "Allow 5 minutes. Invite each learner to name one source-to-summary check they can demonstrate. Finish by asking how they would describe the fictional project honestly in an interview."
      }
    ]
  },
  interview: {
    intro: "Prepare to discuss careful recruitment coordination, not authority to make hiring decisions. Use your fictional tracker to explain consistent records, job-related evidence, clear metrics and appropriate escalation. Refer to the exact checks you performed.",
    questions: [
      {
        question: "How do a current applicant stage and a completed-event date serve different purposes?",
        type: "concept",
        answerGuide: [
          "Describe the stage as the applicant's present workflow position.",
          "Describe event dates as evidence of what happened and when.",
          "Explain why an applicant now Accepted still belongs in a completed-interview cohort."
        ],
        tip: "Use one fictional applicant's path rather than reciting a list of stages."
      },
      {
        question: "What must be defined before you compare time-to-fill across roles?",
        type: "concept",
        answerGuide: [
          "State the start event, end event and calendar-day convention.",
          "Separate completed roles from roles that remain unfilled.",
          "Check that the compared records use the same definitions and valid source dates."
        ],
        tip: "Do not substitute application dates for role approval without relabelling the measure."
      },
      {
        question: "A reviewer asks for an unrelated personal field in your practice tracker. How would you respond?",
        type: "scenario",
        answerGuide: [
          "Ask what job-related purpose the proposed field would serve.",
          "Explain that the exercise uses only fictional, necessary information and observable work evidence.",
          "Refer an unresolved request to the responsible reviewer rather than quietly collecting extra information."
        ],
        tip: "Keep the response respectful and focused on relevance and data minimisation."
      },
      {
        question: "Two interview notes conflict about the same work sample. What would you do before publishing a score?",
        type: "scenario",
        answerGuide: [
          "Identify the exact criterion, sample and rubric version involved.",
          "Ask the reviewers to compare the observable evidence against the same anchor.",
          "Record the resolution or leave the assessment pending with an owner and review date."
        ],
        tip: "Avoid presenting an average of conflicting judgements as if the conflict had been resolved."
      },
      {
        question: "Show how you would test a small applicant tracker before handing it over.",
        type: "practical",
        answerGuide: [
          "Check all expected applicant IDs are present once for the correct role.",
          "Test stage validation and inspect completed-event dates against the practice source.",
          "Reconcile current-stage counts and verify active follow-ups have owners and dates.",
          "Demonstrate one logged correction and one unresolved-issue flag."
        ],
        tip: "Show a deliberately tested invalid entry as well as a valid one."
      },
      {
        question: "How would you explain a recruitment summary to a manager who has not seen the workbook?",
        type: "practical",
        answerGuide: [
          "State the role, cohort, snapshot date and total applicant count first.",
          "Separate the current-status view from completed interview and offer events.",
          "Show the conversion numerator and denominator plus the time-to-fill dates.",
          "Finish with pending actions, ownership and any limitations in the evidence."
        ],
        tip: "Explain the meaning of each metric before reading out its value."
      },
      {
        question: "Tell me about a date or formula error you corrected in a practice report.",
        type: "behavioural",
        answerGuide: [
          "Identify the fictional task and the check that exposed the error.",
          "Describe how you verified the correct value rather than choosing a convenient number.",
          "Explain the audit entry and the recalculation after correction.",
          "State one prevention step and distinguish observed results from assumptions."
        ],
        tip: "If the exercise supplied the error deliberately, include that context."
      },
      {
        question: "Describe a time you paused a judgement because the evidence was incomplete.",
        type: "behavioural",
        answerGuide: [
          "Explain what decision or comparison depended on the missing evidence.",
          "Show how you marked it pending and named the person who could resolve it.",
          "Describe the next action, communication and eventual review if one occurred.",
          "Be honest if the practice exercise ended before the issue was resolved."
        ],
        tip: "A well-documented unresolved issue can be a stronger example than an invented successful ending."
      },
      {
        question: "A weighted scorecard produces a top name, but the starting weights total 110 per cent. What would you do before sharing the ranking?",
        type: "scenario",
        answerGuide: [
          "Pause interpretation and check B2:E2 with SUM in B3 against the agreed role-based weighting policy.",
          "Correct References E2 from 0.2 to 0.1 as the case policy requires, rather than choosing weights to preserve a preferred ranking.",
          "Recalculate G6:G9 with same-shaped SUMPRODUCT ranges and the scale conversion, then rerun MAX, the exact-match lookup and IF flags.",
          "Record the correction and ask the responsible reviewer to check the evidence and any changed comparison."
        ],
        tip: "Even if the top name stays the same, incorrect weights distort the totals and must be corrected before interpretation."
      },
      {
        question: "Demonstrate how the four-candidate lab finds a top total, its name and candidates needing threshold review.",
        type: "practical",
        answerGuide: [
          "Task 1: correct E2 to 0.1 and check =SUM(B2:E2) in B3 returns one; retain all supplied scores.",
          "Task 2: use =SUMPRODUCT(B6:E6,$B$2:$E$2)/5*100 in G6 and fill to G9 for totals 76, 50, 82 and 74.",
          "Task 3: =MAX(G6:G9) in B11 gives 82; Task 4: an exact-match INDEX/MATCH or XLOOKUP over A6:A9 and G6:G9 in B12 returns Meera.",
          "Task 5: use IF(G6<60,...) in H6 and fill to H9; only Rohit is flagged, while exactly 60 would not be below the threshold.",
          "Check for tied maxima and hand over the rubric and evidence without treating the spreadsheet as a selection decision."
        ],
        tip: "Explain the matching 1x4 ranges and why the weighted mean is divided by five and multiplied by 100 before comparison with 60."
      }
    ]
  },
  glossary: [
    { term: "Role brief", definition: "A description of the work, required evidence and review responsibilities used to define job-related criteria before assessment." },
    { term: "Applicant ID", definition: "A stable identifier for one fictional applicant in the defined role process, retained across stage changes and scorecard records." },
    { term: "Stage", definition: "A defined current position in a workflow, such as Interview or Offer; it is separate from the history of completed events." },
    { term: "Data validation", definition: "A spreadsheet rule that restricts allowed values, such as agreed stage names or valid dates, without proving that the chosen value is factually correct." },
    { term: "Scorecard", definition: "A structured record of the same job-related criteria, scoring definitions and observable evidence for each assessed applicant." },
    { term: "Scoring anchor", definition: "A written description of observable performance at a score level, used to make reviewers' interpretations more consistent." },
    { term: "Calibration", definition: "A review of how different assessors apply the same rubric to shared evidence, used to clarify inconsistent interpretations." },
    { term: "Interview-to-offer conversion", definition: "The proportion of unique interviewed applicants in a defined cohort who receive an offer within the stated observation period." },
    { term: "Time-to-fill", definition: "In this course, elapsed calendar days from role approval to offer acceptance, excluding the approval date; unfilled roles have no completed value." },
    { term: "Audit trail", definition: "A record of original values, corrections, evidence, dates and reviewers that makes changes and unresolved issues traceable." },
    { term: "Onboarding checklist", definition: "An owned, dated list of preparation tasks after acceptance, with evidence of completion or a clear pending status." }
  ]
};
