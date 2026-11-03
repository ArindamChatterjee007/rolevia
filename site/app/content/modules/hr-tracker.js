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
                "Use three equally weighted criteria: tracker accuracy, written communication and process mapping. Define what evidence earns each score before looking at an applicant. On a five-point scale, one means major omissions, three means usable work with specific corrections and five means accurate, complete work with clear checks. Scores of two and four sit between these anchors and need a written reason. Missing evidence remains pending; it is not automatically a poor score or a reason to invent an average."
              ],
              steps: [
                "Write a short task and expected output for each of the three criteria.",
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
            }
          ],
          practice: {
            labId: "hr-tracker",
            instruction: "Open Fair scorecard. Remove the criteria that do not describe job-related work. In your role brief, explain why the three remaining work samples are relevant; inspect the scores without treating the exercise as a real hiring decision."
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
            }
          ],
          practice: null,
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
                "Use the three criteria agreed in the role brief with equal weighting.",
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
                "For three available scores of 4, 3 and 5, the total is 12 and the equal-weight average is 4.00. In Google Sheets, if those scores occupy C2:E2, use the formula below to prevent a partial average being presented as complete. Microsoft Excel uses the same formula. A tie is not an invitation to add an unrelated personal preference; follow a pre-agreed, job-related review step and keep the evidence behind that step visible."
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
            }
          ],
          practice: {
            labId: "hr-tracker",
            instruction: "Complete Fair scorecard using only its three job-related criteria. Recalculate each displayed average by hand, identify the strongest supported score and record why the simulation is evidence practice rather than a real selection decision."
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
                "Your final pack contains the role brief, workflow, validated tracker, scorecard, summary, onboarding checklist and audit trail. Include the two metric definitions and show exactly which records produce them. Reviewers should be able to follow a correction from the original evidence to the final value. A small, honest summary is preferable to a polished report with hidden gaps. Finish by explaining one data-quality check and one issue that would need a responsible person's review outside this simulation."
              ],
              steps: [
                "Confirm exactly 15 fictional applicants for R01, with unique IDs, owners and appropriate dates.",
                "Check that the rubric is consistent and that missing or conflicting evidence stays visible.",
                "Reconcile 3 + 2 + 3 + 1 + 1 + 4 + 1 = 15 current-stage records.",
                "Include the 2 / 6 conversion, the checked 18-day time-to-fill and the owned onboarding checklist.",
                "Save the recruitment summary and complete audit pack as the Week 2 B artefact."
              ]
            }
          ],
          practice: null,
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
          "Tracker accuracy, written communication and process mapping are the three criteria.",
          "Use the same task conditions and rubric version across the practice set.",
          "Describe scores through observable work, not personal impressions.",
          "Calibrate disagreements before scoring the full set."
        ],
        notes: "Allow 6 minutes. Read one sample note and ask pairs to place it against an anchor. Discuss wording that different reviewers could interpret differently and improve it together."
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
          "Keep only the three job-related work samples in the lab.",
          "Calculate the equal-weight averages independently.",
          "Match the displayed result to the evidence, not personal similarity.",
          "Write one limitation of using a small simulated scorecard."
        ],
        notes: "Allow 7 minutes. Give learners time to finish the lab and explain their calculation to a neighbour. Remind them that the lab's suggested advancement is a simulation, not permission to assess real people."
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
