export default {
  moduleId: "crm",
  summary: "Build a traceable fictional CRM from clean contacts to evidence-led stages, dated follow-ups and a sales-to-service handover. Finish with 20 linked opportunities, checked funnel figures and an audit trail a colleague can use.",
  sessions: [
    {
      id: "crm-lab-s1",
      week: 1,
      title: "Create records that keep their meaning",
      minutes: 75,
      scenario: [
        "Priya is preparing fictional case C1. The import below contains four company-contact pairs and one confirmed repeat of the first source row. Asha also has a second, separate training enquiry. A person, an organisation and a purchase discussion need different records, even when their names appear together.",
        "Build Companies, Contacts, Deals, Activities and a field dictionary in HubSpot CRM free tier or a Google Sheets practice workbook. Keep the raw import unchanged. Use stable IDs, label everything fictional and leave phone and email unused. Do not connect outreach or send messages. Record fields unavailable in the free tier in the workbook instead."
      ],
      dataset: {
        columns: ["Source row", "Company ID", "Fictional company", "Contact ID", "Contact", "Source note"],
        rows: [
          ["R01", "T01", "Sundar Traders", "C01", "Asha", "Original contact record"],
          ["R02", "T02", "Meera Foods", "C02", "Dev", "Original contact record"],
          ["R03", "T03", "Kiran Stationery", "C03", "Leela", "Original contact record"],
          ["R04", "T04", "Nila Services", "C04", "Nitin", "Original contact record"],
          ["R05", "T01", "Sundar Traders", "C01", "Asha", "Confirmed repeat of R01, not a new person"]
        ]
      },
      outcome: "A four-contact register with valid company links, a field dictionary and a recorded duplicate correction, ready for separate deal records.",
      tasks: [
        {
          id: "crm-lab-s1-t1",
          type: "short",
          prompt: "After building the cleaned contact register, how many unique contact IDs remain? Enter the count, not the number of raw import rows.",
          answer: { kind: "number", value: 4, tolerance: 0 },
          explanation: "C01, C02, C03 and C04 are four distinct IDs. Five raw rows minus the one confirmed repeat gives four contacts. Retain R05 in the raw import and log why it was excluded from the working register."
        },
        {
          id: "crm-lab-s1-t2",
          type: "short",
          prompt: "Asha's second enquiry concerns a separate training purchase. Which record action preserves both discussions without duplicating the person?",
          answer: {
            kind: "choice",
            options: ["Create another contact called Asha", "Create a new deal linked to C01 and T01", "Replace the first enquiry with the second"],
            answerIndex: 1
          },
          explanation: "A separate purchase discussion needs its own deal ID. Linking both deals to C01 and T01 preserves one contact history while keeping the two purchase discussions distinct."
        },
        {
          id: "crm-lab-s1-t3",
          type: "case",
          prompt: "Priya asks you to remove repeated records without losing the source trail. Build the register and write a short import decision note. Explain what happens to R05, how the second enquiry is recorded and which checks another learner should run before adding more contacts.",
          hint: "Check identity and links separately. A matching display name alone is not sufficient evidence to merge records.",
          rubric: [
            "Retains C01 to C04 once each and links them to T01 to T04 respectively.",
            "Keeps the raw R05 row and logs its exclusion, source, reason, date and reviewer.",
            "Creates a separate deal for the second enquiry while retaining C01 and T01.",
            "Defines company, contact, deal and activity fields, including stable ID and required-field rules.",
            "Labels the records fictional and leaves unnecessary contact details unused."
          ],
          minWords: 120
        },
        {
          id: "crm-lab-s1-t4",
          type: "proof",
          prompt: "Attach the practice workbook, a restricted-access CRM view or screenshots showing your register and import checks. Include the dictionary and correction note.",
          mustShow: "Four unique contact IDs, their company links, the separate second-enquiry deal, the retained raw import and the R05 correction trail."
        }
      ]
    },
    {
      id: "crm-lab-s2",
      week: 2,
      title: "Move deals only when evidence supports the stage",
      minutes: 90,
      scenario: [
        "Open Clean the pipeline and use the five fictional deals below, which are separate from case C1. Move them in the interactive simulation or reproduce them in HubSpot CRM free tier. The stage labels are Lead, Qualified, Proposal, Won and Lost. Proposal includes a qualified request for written terms, not only a quote already sent.",
        "For this simulation, no budget for the current purchase cycle closes that opportunity as Lost. A possible conversation next April does not keep the current deal qualified. Record a future review separately without contacting anyone. After moving the cards, use the displayed Won count and all five deals for the short-answer rate."
      ],
      dataset: {
        columns: ["Fictional deal", "Starting stage", "Recorded evidence"],
        rows: [
          ["Nimbus Retail", "Lead", "Discovery complete; budget confirmed; decision in three weeks"],
          ["Kiran Foods", "Lead", "No budget this year; asks for a conversation next April"],
          ["Orbit Fitness", "Proposal", "Signed practice order form received"],
          ["Lumen Clinics", "Qualified", "Requested a written quote after a qualified call"],
          ["Juniper Tours", "Lead", "Only replied to the first message; no qualification call"]
        ]
      },
      outcome: "An evidence-supported five-deal simulation, written stage-entry rules and a correctly labelled Won-of-all-deals rate.",
      tasks: [
        {
          id: "crm-lab-s2-t1",
          type: "short",
          prompt: "Move all five deals using the notes. What percentage of all five deals is Won? Enter percentage points, for example 25 for 25 per cent.",
          answer: { kind: "number", value: 20, tolerance: 0.01 },
          explanation: "Only Orbit Fitness has an accepted practice order. Won out of all deals is 1 / 5 x 100 = 20%. The three open deals and one Lost deal remain in the denominator. This is not a closed-deals-only rate."
        },
        {
          id: "crm-lab-s2-t2",
          type: "short",
          prompt: "Which stage should Lumen Clinics occupy under this lab's broad stage definitions, while its quote is still a requested draft?",
          answer: {
            kind: "choice",
            options: ["Lead", "Proposal", "Won", "Lost"],
            answerIndex: 1
          },
          explanation: "The qualified buyer requested written terms, which meets the broad Proposal entry rule. The activity note must still say that the quote has not been sent. Neither a request nor a draft establishes an accepted order."
        },
        {
          id: "crm-lab-s2-t3",
          type: "case",
          prompt: "A coordinator wants Kiran Foods kept Qualified because a future call is possible, and Lumen Clinics marked Won because it requested a quote. Write a correction memo and five stage-entry rules. Explain the current-cycle decision, the future review and the evidence needed before either record could be treated differently.",
          rubric: [
            "Assigns the five records to Qualified, Lost, Won, Proposal and Lead respectively using their evidence.",
            "Explains why Kiran Foods is Lost for this cycle and keeps any future review separate.",
            "Distinguishes a requested quote, delivered terms and an accepted practice order.",
            "Defines all five stages and records the proposed corrections rather than deleting closed deals.",
            "Labels the rate as one Won out of five deals and keeps all outreach simulated."
          ],
          minWords: 130
        },
        {
          id: "crm-lab-s2-t4",
          type: "proof",
          prompt: "Attach your completed simulation view or equivalent five-deal CRM view, with the stage rules and correction memo. Enter the resulting rate above yourself.",
          mustShow: "All five records in evidence-supported stages, one Won out of five, and a note that Lumen Clinics has requested rather than received its quote."
        }
      ]
    },
    {
      id: "crm-lab-s3",
      week: 3,
      title: "Turn follow-ups into a usable service handover",
      minutes: 90,
      scenario: [
        "Review this fictional action queue at the start of 13 November 2026. Overdue means due before that date and not completed. Due today is not yet overdue. D15 is already Won: its accepted order dated 9 November promises one stock-review meeting on 18 November and a checked count sheet on 20 November for INR 6,000.",
        "Leela at Kiran Stationery supplies the D15 source file; its format remains unknown. Kavya is the receiving service owner, but no acknowledgement is supplied. Build an action view and a handover in your CRM companion workbook. Keep sales ownership separate from service-action ownership and preserve original due dates when proposing a revised action."
      ],
      dataset: {
        columns: ["Deal", "Action owner", "Status", "Due date", "Completed date", "Action"],
        rows: [
          ["D08", "Priya", "Pending", "2026-11-11", "Not recorded", "Draft qualification questions"],
          ["D10", "Priya", "Completed", "2026-11-11", "2026-11-11", "Record scope clarification"],
          ["D11", "Rohit", "Pending", "2026-11-12", "Not recorded", "Prepare a sample stock-check sheet"],
          ["D12", "Rohit", "Pending", "2026-11-13", "Not recorded", "Check the requested terms"],
          ["D15", "Kavya", "Pending", "2026-11-12", "Not recorded", "Confirm Leela's source-file format"]
        ]
      },
      outcome: "A checked action queue and D15 handover showing agreed scope, dates, the receiving owner and unresolved preparation work.",
      tasks: [
        {
          id: "crm-lab-s3-t1",
          type: "short",
          prompt: "How many actions in this queue are overdue at the start of 13 November? Include sales and service actions, but exclude completed actions and actions due today.",
          answer: { kind: "number", value: 3, tolerance: 0 },
          explanation: "D08, D11 and D15 are pending with due dates before 13 November: 1 + 1 + 1 = 3. D10 is completed. D12 is due on the snapshot date, so it is not yet overdue under the stated rule."
        },
        {
          id: "crm-lab-s3-t2",
          type: "short",
          prompt: "Kavya is named in the handover but no receiving review is recorded. Which acknowledgement state is supported?",
          answer: {
            kind: "choice",
            options: ["Acknowledged because an owner is named", "Pending until an explicit simulated acknowledgement is recorded", "Completed because the sales deal is Won"],
            answerIndex: 1
          },
          explanation: "Naming the service owner assigns responsibility; it does not prove receipt or review. Keep acknowledgement pending until there is a dated practice record. Closing the sales deal also does not complete delivery work."
        },
        {
          id: "crm-lab-s3-t3",
          type: "case",
          prompt: "Kavya asks what she must deliver and what could prevent preparation. Write the D15 handover and a short action-queue update. Retain the missed 12 November format-check deadline, propose a dated escalation on 13 November and distinguish confirmed scope from open questions. Do not add a service or invent a reply from Leela.",
          rubric: [
            "States the INR 6,000 meeting on 18 November and checked count sheet due 20 November, linked to the accepted order.",
            "Names Leela, Kiran Stationery and receiving owner Kavya with acknowledgement still pending.",
            "Identifies the unknown file format and preserves the 12 November deadline beside the proposed escalation.",
            "Identifies D08, D11 and D15 as overdue, retaining their respective action owners.",
            "Separates factual activity notes, proposed next steps and unanswered questions without adding promised scope."
          ],
          minWords: 150
        },
        {
          id: "crm-lab-s3-t4",
          type: "proof",
          prompt: "Attach your action view, one dated activity note and the D15 handover. Use fictional records only and show the snapshot date.",
          mustShow: "The three overdue actions, original due dates, D15 scope and delivery dates, Kavya's format-check action, and a pending acknowledgement field."
        }
      ]
    },
    {
      id: "crm-lab-s4",
      week: 4,
      title: "Build the twenty-deal history and reconcile the funnel",
      minutes: 90,
      scenario: [
        "Expand this grouped case C1 seed into 20 individual deals, D01 to D20, each named Practice request followed by its number. Each listed amount is INR 6,000. All entered Lead on 2 November 2026; D06 to D20 became Qualified on 4 November; D11 to D19 reached Proposal on 6 November. D15 to D18 became Won and D19 became Lost on 9 November. D20 became Lost from Qualified on 6 November.",
        "Use the 10 November snapshot. Priya owns D01 to D10 and Rohit owns D11 to D20. Link C01/T01 to D01, D05, D09, D13, D17; C02/T02 to D02, D06, D10, D14, D18; C03/T03 to D03, D07, D11, D15, D19; and C04/T04 to D04, D08, D12, D16, D20. Use the contact register from week 1.",
        "Build dated history rows in the workbook or alongside HubSpot CRM free-tier records. Give every open deal a specific owner-led action due between 11 and 14 November; label learner-created actions as practice plans. Record closure evidence separately. The table is a compact seed, not permission to submit six grouped records as twenty opportunities."
      ],
      dataset: {
        columns: ["Deal IDs", "Count", "Current stage", "Reached Qualified", "Reached Proposal", "Amount each, INR"],
        rows: [
          ["D01 to D05", "5", "Lead", "No", "No", "6000"],
          ["D06 to D10", "5", "Qualified", "Yes", "No", "6000"],
          ["D11 to D14", "4", "Proposal", "Yes", "Yes", "6000"],
          ["D15 to D18", "4", "Won", "Yes", "Yes", "6000"],
          ["D19", "1", "Lost", "Yes", "Yes", "6000"],
          ["D20", "1", "Lost", "Yes", "No", "6000"]
        ]
      },
      outcome: "Twenty linked deal records and a dated history supporting a same-cohort conversion and a reconciled open-value report.",
      tasks: [
        {
          id: "crm-lab-s4-t1",
          type: "short",
          prompt: "Of the deals qualified on 4 November, what percentage had reached Proposal by 10 November? Use history, including subsequently closed deals. Enter percentage points.",
          answer: { kind: "number", value: 60, tolerance: 0.01 },
          explanation: "D06 to D20 gives 15 qualified deals. D11 to D19 gives 9 that reached Proposal: 4 current proposals + 4 Won + 1 Lost. Conversion is 9 / 15 x 100 = 60%. Current-stage counts alone cannot reconstruct this route."
        },
        {
          id: "crm-lab-s4-t2",
          type: "short",
          prompt: "After expanding the records, total only Lead, Qualified and Proposal amounts. What is the open listed value in INR at 10 November?",
          answer: { kind: "number", value: 84000, tolerance: 0.5 },
          explanation: "Open deals are 5 Lead + 5 Qualified + 4 Proposal = 14. Their listed value is 14 x INR 6,000 = INR 84,000. Add Won 24,000 and Lost 12,000 to reconcile all 20 deals to INR 120,000, not collected cash."
        },
        {
          id: "crm-lab-s4-t3",
          type: "case",
          prompt: "Rohit's draft says conversion is 4 current proposals divided by 5 current qualified deals, or 80%, and describes open value as cash available. Replace it with a short pipeline review. Define the cohort and dates, reconcile counts and values, and recommend one record-quality check without inventing a reason for lost deals.",
          rubric: [
            "Names D06 to D20 as the 15-deal cohort and D11 to D19 as the nine Proposal entrants by 10 November.",
            "Shows 9 / 15 = 60% and explains why the snapshot-based 4 / 5 answers a different question.",
            "Reconciles 20 deals and INR 84,000 open + 24,000 Won + 12,000 Lost = 120,000 listed value.",
            "Explains that listed amounts and accepted orders do not establish cash receipts.",
            "Proposes a specific completeness or evidence check with an owner and acknowledges the small fictional dataset."
          ],
          minWords: 150
        },
        {
          id: "crm-lab-s4-t4",
          type: "proof",
          prompt: "Attach the expanded pipeline, stage history and calculation view. Make the underlying IDs visible rather than supplying only totals.",
          mustShow: "D01 to D20 once each, valid contact links, owners, fourteen dated open actions, closure records, the 9-of-15 cohort and the INR 120,000 reconciliation."
        }
      ]
    },
    {
      id: "crm-lab-s5",
      week: 5,
      title: "Repair a messy opportunity import",
      minutes: 105,
      scenario: [
        "Nila Process Studio has a new fictional intake, case C3, at 17 November 2026. Keep X01 to X05 separate from C1 and the five-deal simulation. R04 is a confirmed repeat of R03 from the same import, not a second order. Several entered stages conflict with the source notes. The table's numeric amounts are listed values, not payments.",
        "Kavya has authorised Priya to take ownership of X03 on 17 November and prepare its requested terms by 18 November. Preserve the raw six-row import, build a corrected working pipeline and log each change. A stakeholder asks you to retain the optimistic Won entry and count both X03 rows because the resulting headline looks stronger."
      ],
      dataset: {
        columns: ["Source row", "Deal ID", "Amount, INR", "Entered stage", "Evidence", "Entered owner"],
        rows: [
          ["R01", "X01", "4500", "Lead", "Enquiry only; budget unknown", "Priya"],
          ["R02", "X02", "7500", "Won", "Need, budget and timing recorded; no order accepted", "Rohit"],
          ["R03", "X03", "9000", "Proposal", "Qualified buyer requested written terms; draft pending", "Unassigned"],
          ["R04", "X03", "9000", "Proposal", "Confirmed repeat of R03 and its source", "Unassigned"],
          ["R05", "X04", "12000", "Proposal", "Accepted practice order recorded on 16 November", "Rohit"],
          ["R06", "X05", "5000", "Qualified", "This request was cancelled on 16 November", "Priya"]
        ]
      },
      outcome: "A five-opportunity corrected intake with deduplicated values, evidence-supported stages and an owned X03 next action.",
      tasks: [
        {
          id: "crm-lab-s5-t1",
          type: "short",
          prompt: "After removing the confirmed repeat from the working copy and correcting stages, what is the open listed value in INR? Enter the figure from your corrected view.",
          answer: { kind: "number", value: 21000, tolerance: 0.5 },
          explanation: "Open records are X01 Lead at 4,500, X02 Qualified at 7,500 and one X03 Proposal at 9,000. Their total is INR 21,000. X04 is Won and X05 is Lost; neither belongs in open value."
        },
        {
          id: "crm-lab-s5-t2",
          type: "short",
          prompt: "Among the five unique opportunities, how many entered stage labels need correction? Do not count duplicate removal or owner assignment as stage changes.",
          answer: { kind: "number", value: 3, tolerance: 0 },
          explanation: "X02 changes Won to Qualified, X04 changes Proposal to Won, and X05 changes Qualified to Lost: three stage corrections. X01 and X03 already meet their entered stage rules. Removing R04 and assigning Priya are separate audit actions."
        },
        {
          id: "crm-lab-s5-t3",
          type: "case",
          prompt: "Write a response to the stakeholder and repair the working pipeline. Explain each stage correction and the duplicate decision, reconcile the cleaned values and apply Kavya's authorised X03 ownership action. Distinguish a correction supported by a source from an assumption chosen to improve the headline.",
          rubric: [
            "Keeps all six raw rows but only one X03 working record, with the confirmed-repeat source logged.",
            "Corrects X02 to Qualified, X04 to Won and X05 to Lost, citing each supplied event.",
            "Reconciles INR 21,000 open + 12,000 Won + 5,000 Lost = 38,000 across five unique opportunities.",
            "Records Priya as X03 owner and preparation of written terms by 18 November, linked to Kavya's authorisation.",
            "Retains old and new values, source, date and reviewer without claiming that corrections create sales or cash."
          ],
          minWords: 160
        },
        {
          id: "crm-lab-s5-t4",
          type: "proof",
          prompt: "Attach the raw import, corrected CRM or workbook view and change log. Keep this exercise separate from the twenty-deal capstone file.",
          mustShow: "Six retained source rows, five unique working deals, three stage corrections, the INR 38,000 total and Priya's dated X03 next action."
        }
      ]
    },
    {
      id: "crm-lab-s6",
      week: 6,
      title: "Handle a service request outside the accepted scope",
      minutes: 105,
      scenario: [
        "Continue Nila Process Studio's X04, not the capstone's D15. Its accepted practice order covers two inventory-note sessions and an included workbook. Kavya receives the service work. On 19 November, the fictional contact asks for an extra coaching session, but no change approval or payment evidence exists. The accepted order value must remain unchanged until a revised agreement is recorded.",
        "Build an accepted-versus-requested scope comparison in your CRM companion workbook. The extra session would cost INR 3,000 if approved. Its requested date falls between the existing sessions. Kavya needs the input-format and scheduling questions reviewed by 20 November, and her receiving acknowledgement is still pending. Do not send a quote or promise delivery outside this simulation."
      ],
      dataset: {
        columns: ["Scope item", "Quantity", "Price each, INR", "Approval state", "Service date"],
        rows: [
          ["Inventory-note session one", "1", "6000", "Accepted", "2026-11-24"],
          ["Inventory-note session two", "1", "6000", "Accepted", "2026-11-26"],
          ["Checked workbook included with sessions", "1", "0", "Accepted", "2026-11-26"],
          ["Extra coaching session", "1", "3000", "Requested only", "2026-11-25"]
        ]
      },
      outcome: "An X04 handover that preserves the accepted order and routes an unapproved scope change to a named reviewer before delivery.",
      tasks: [
        {
          id: "crm-lab-s6-t1",
          type: "short",
          prompt: "Total only accepted scope in the comparison you built. What listed order value in INR is supported now?",
          answer: { kind: "number", value: 12000, tolerance: 0.5 },
          explanation: "Accepted scope is 1 x 6,000 + 1 x 6,000 + 1 x 0 = INR 12,000. The included workbook adds no charge. The requested coaching session is excluded because no change approval exists."
        },
        {
          id: "crm-lab-s6-t2",
          type: "short",
          prompt: "If the extra coaching session were explicitly approved at the supplied price, by how much would the listed order value increase? Enter the increase in INR, not the revised total.",
          answer: { kind: "number", value: 3000, tolerance: 0.5 },
          explanation: "The proposed increase is 1 extra session x INR 3,000 = INR 3,000. The conditional revised total would be 12,000 + 3,000 = INR 15,000. Neither figure establishes approval, delivery capacity or a cash receipt."
        },
        {
          id: "crm-lab-s6-t3",
          type: "case",
          prompt: "A sales coordinator wants the extra session listed as agreed so the handover looks complete. Write the service handover and a change-review request instead. State the existing promises, the conditional value change, the schedule question and who must do what by 20 November. Explain what must remain pending.",
          rubric: [
            "Lists the two accepted sessions, included workbook and INR 12,000 value with their 24 and 26 November dates.",
            "Keeps the 25 November extra session requested, showing INR 3,000 additional and INR 15,000 only if approved.",
            "Names Kavya for the input-format and scheduling review by 20 November.",
            "Keeps change approval and receiving acknowledgement separate and pending until evidence exists.",
            "Requires a dated revised agreement before changing committed scope and makes no payment claim."
          ],
          minWords: 150
        },
        {
          id: "crm-lab-s6-t4",
          type: "proof",
          prompt: "Attach the scope comparison, change-review request and handover. Show which fields are confirmed and which are still pending.",
          mustShow: "Accepted value INR 12,000, the separate INR 3,000 request, delivery dates, Kavya's 20 November review action and pending approval and acknowledgement states."
        }
      ]
    },
    {
      id: "crm-lab-s7",
      week: 7,
      title: "Audit missing follow-up dates without hiding overdue work",
      minutes: 105,
      scenario: [
        "This is a six-record audit copy of C1 at the start of 14 November 2026, separate from the saved 10 November capstone snapshot. Missing means no date was entered, not that nothing is due. Overdue means a pending action with a due date before 14 November. D14's action was completed on 13 November and must not be counted as pending.",
        "The retained owner diary dated 10 November supplies the missing dates: D08 was due 12 November, D10 was due 13 November and D12 was due 14 November. Use these as correction evidence, not new deadlines. Priya asks for a before-and-after review and a daily required-field check. Preserve the original audit copy and do not report this six-record sample as the whole fourteen-deal open pipeline."
      ],
      dataset: {
        columns: ["Deal", "Owner", "Entered due date", "Source diary due date", "Action status", "Completion date"],
        rows: [
          ["D06", "Priya", "2026-11-13", "2026-11-13", "Pending", "Not recorded"],
          ["D08", "Priya", "Missing", "2026-11-12", "Pending", "Not recorded"],
          ["D10", "Priya", "Missing", "2026-11-13", "Pending", "Not recorded"],
          ["D11", "Rohit", "2026-11-14", "2026-11-14", "Pending", "Not recorded"],
          ["D12", "Rohit", "Missing", "2026-11-14", "Pending", "Not recorded"],
          ["D14", "Rohit", "2026-11-13", "2026-11-13", "Completed", "2026-11-13"]
        ]
      },
      outcome: "A source-backed date correction log and a before-and-after review that distinguishes missing information from overdue actions.",
      tasks: [
        {
          id: "crm-lab-s7-t1",
          type: "short",
          prompt: "Before correcting the working copy, what percentage of the six audited records has a missing entered due date? Enter percentage points and use all six audited records as the denominator.",
          answer: { kind: "number", value: 50, tolerance: 0.01 },
          explanation: "D08, D10 and D12 are missing dates: 3 / 6 x 100 = 50% of the audited sample. This is a field-completeness measure for six records, not a rate for all fourteen open opportunities."
        },
        {
          id: "crm-lab-s7-t2",
          type: "short",
          prompt: "Restore the three dates from the source diary. How many pending actions are then overdue at the start of 14 November?",
          answer: { kind: "number", value: 3, tolerance: 0 },
          explanation: "D06 is due 13 November, D08 due 12 November and D10 due 13 November: three pending overdue actions. D11 and D12 are due today; D14 is completed. Restoring dates exposes work that the missing fields had hidden."
        },
        {
          id: "crm-lab-s7-t3",
          type: "case",
          prompt: "The draft report says only one action is overdue, so the other five records need no attention. Repair the dates and write a replacement audit note without overstating the result. Explain the changing counts, retain source evidence and propose an owned daily check and dated follow-ups for the overdue actions.",
          rubric: [
            "Names D08, D10 and D12 and shows the missing-date count falling from three to zero in the six-record sample.",
            "Restores 12, 13 and 14 November respectively from the diary, retaining old values and the correction date.",
            "Explains why known overdue actions rise from one to three rather than treating missing dates as not due.",
            "Assigns Priya the required-field review and records proposed follow-ups without erasing original deadlines.",
            "Keeps completed D14 out of overdue work and does not extrapolate the sample to all open deals."
          ],
          minWords: 160
        },
        {
          id: "crm-lab-s7-t4",
          type: "proof",
          prompt: "Attach the untouched audit input, corrected action view, source-date log and revised audit note. Keep the report's observation date visible.",
          mustShow: "The six-record denominator, three restored dates, zero remaining missing dates, three pending overdue actions and the old-value/source/reviewer correction trail."
        }
      ]
    },
    {
      id: "crm-lab-s8",
      week: 8,
      title: "Submit the twenty-opportunity pipeline and handover",
      minutes: 120,
      scenario: [
        "Return to the saved case C1 snapshot of 10 November 2026, not the later audit copy or Nila intake. Submit D01 to D20 individually at INR 6,000 each, with the company-contact links and Priya/Rohit ownership established in week 4. The table below is the reference reconciliation. Grouped rows or the five-deal simulation alone do not meet the twenty-opportunity capstone.",
        "Retain the 2, 4, 6 and 9 November stage history, dated activity notes, closure evidence and all fourteen open next actions planned for 11 to 14 November. Include the Qualified-to-Proposal cohort calculation and an audit correction with before-and-after evidence. Label later audit observations separately so they cannot silently rewrite the earlier snapshot.",
        "Use D15 for the sales-to-service handover: INR 6,000 for one meeting on 18 November and a checked count sheet by 20 November. Kavya receives the work; Leela at Kiran Stationery supplies a source file whose format requires confirmation by 12 November. At this snapshot acknowledgement remains pending. Submit the workbook or HubSpot CRM free-tier evidence with a reader's index and fictional-only sharing."
      ],
      dataset: {
        columns: ["Stage at 10 November", "Deal IDs", "Count", "Listed amount each, INR"],
        rows: [
          ["Lead", "D01 to D05", "5", "6000"],
          ["Qualified", "D06 to D10", "5", "6000"],
          ["Proposal", "D11 to D14", "4", "6000"],
          ["Won", "D15 to D18", "4", "6000"],
          ["Lost", "D19 to D20", "2", "6000"]
        ]
      },
      outcome: "A review-ready capstone containing twenty fictional opportunities, clean activity notes, checked pipeline figures and a short sales-to-service handover.",
      tasks: [
        {
          id: "crm-lab-s8-t1",
          type: "short",
          prompt: "Check the Won records in the final reference snapshot against your pipeline. What is their combined listed order value in INR?",
          answer: { kind: "number", value: 24000, tolerance: 0.5 },
          explanation: "D15 to D18 are four Won opportunities at INR 6,000 each: 4 x 6,000 = INR 24,000. This is accepted listed order value. Payment records would be required to describe any part of it as received cash."
        },
        {
          id: "crm-lab-s8-t2",
          type: "short",
          prompt: "For this snapshot, what percentage of closed deals is Won? Use Won plus Lost in the denominator and enter percentage points to two decimal places.",
          answer: { kind: "number", value: 66.67, tolerance: 0.01 },
          explanation: "Closed deals are 4 Won + 2 Lost = 6. The closed-deal win rate is 4 / 6 x 100 = 66.67% to two decimals. Won out of all twenty would instead be 4 / 20 = 20%; keep the population in each label."
        },
        {
          id: "crm-lab-s8-t3",
          type: "case",
          prompt: "Submit a concise pipeline review and D15 sales-to-service handover for Rolevia review. Explain the reconciled population, same-cohort conversion, next-action coverage and one audited correction. State the service promises, receiving responsibilities and remaining uncertainty. End with one supported process improvement, not a prediction of sales or cash.",
          rubric: [
            "Accounts for twenty unique linked opportunities, 5/5/4/4/2 stages and INR 120,000 listed value, including INR 84,000 open.",
            "Shows 9 / 15 = 60% Qualified-to-Proposal conversion with cohort dates and labels both win-rate denominators correctly.",
            "Checks fourteen owned, dated open actions and six evidenced closures; traces one correction through before-and-after records.",
            "States D15's INR 6,000 scope, 18/20 November delivery dates, Kavya's 12 November format action and pending acknowledgement.",
            "Distinguishes facts from assumptions, uses fictional-only information and names an owner for a specific process check."
          ],
          minWords: 200
        },
        {
          id: "crm-lab-s8-t4",
          type: "proof",
          prompt: "Attach the full capstone as a workbook, export or restricted-access evidence pack. Include a reader's index so Rolevia can locate the pipeline, activity notes, calculations, audit and handover.",
          mustShow: "Twenty individual linked deals; owners, amounts, stages and dated actions; stage history and clean activity notes; cohort and value checks; a correction trail; and the D15 sales-to-service handover."
        }
      ]
    }
  ]
};
