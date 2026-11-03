export default {
  moduleId: "crm",
  tagline: "Keep fictional customer records clear, move deals with evidence and give the next person a usable handover.",
  weeks: [
    {
      week: 1,
      theme: "Clean records and an evidence-led pipeline",
      lessons: [
        {
          id: "crm-w1-l1",
          title: "Understand CRM records",
          minutes: 60,
          objective: "Create a clean contact register and explain how contacts, companies, deals and activities connect without duplicating their meaning.",
          sections: [
            {
              heading: "Begin with the work, not the software",
              body: [
                "A customer relationship management system helps a team remember what happened and what should happen next. In this course, every record is fictional. Use HubSpot CRM (free tier) if you have suitable access, or build the same records in the supplied practice workbook. Neither route requires messages, connected email or automation. Your first output is a clean contact register that another learner can understand without asking you to explain every row."
              ],
              steps: [
                "Create separate workbook tabs or record groups for Companies, Contacts, Deals and Activities.",
                "Add a Dictionary tab describing each field, its format and whether it is required.",
                "Keep all outreach disconnected; practise notes and next actions without sending them.",
                "If a field is unavailable in the free tier, record it in the workbook rather than buying an upgrade."
              ]
            },
            {
              heading: "Give each kind of record one purpose",
              body: [
                "Think of a company as the organisation, a contact as a person, a deal as a specific purchase discussion and an activity as an event. A contact may discuss several separate purchases, so a new discussion does not automatically need a new contact. Give each record a stable ID and use those IDs to connect it to related records. Keep changing information, such as a discussion note, out of the company name field."
              ],
              table: {
                columns: ["Record", "Example", "Useful fields"],
                rows: [
                  ["Company", "T01, Sundar Traders", "Company ID, fictional name"],
                  ["Contact", "C01, Asha", "Contact ID, company ID, role in discussion"],
                  ["Deal", "D01, Practice request 01", "Deal ID, contact ID, amount, stage, owner"],
                  ["Activity", "A001, simulated discovery note", "Activity ID, deal ID, date, fact, next action"]
                ]
              },
              callout: {
                type: "definition",
                title: "A stable ID",
                text: "An ID identifies the record even when its name changes. It is not a score, a row number after sorting or permission to create a second copy."
              }
            },
            {
              heading: "Build a small, clean contact register",
              body: [
                "Create the four company and contact pairs shown below. Leave phone and email fields unused because this exercise needs neither. Put a short fictional role beside each contact, such as stock coordinator, and document that you invented it for practice. Before adding another person, search the existing IDs and compare the source information. Keep a note of any correction so a reviewer can trace what changed rather than finding only the latest version."
              ],
              table: {
                columns: ["Company ID", "Fictional company", "Contact ID", "Fictional contact"],
                rows: [
                  ["T01", "Sundar Traders", "C01", "Asha"],
                  ["T02", "Meera Foods", "C02", "Dev"],
                  ["T03", "Kiran Stationery", "C03", "Leela"],
                  ["T04", "Nila Services", "C04", "Nitin"]
                ]
              },
              bullets: [
                "Use one spelling for each company and retain the same ID in every related record.",
                "A blank means unknown or not needed, not permission to invent a real contact detail.",
                "Record the source as Fictional case C1 so the register cannot be mistaken for live sales data."
              ]
            },
            {
              heading: "Check the register before extending it",
              body: [
                "Ask a classmate to trace C03 to T03 and explain the relationship using only your fields. Then test a mistaken company link on a copy and record how you spotted it. This small check is more useful than adding many records quickly. Keep the original practice input separate from corrected working data. A tidy register is ready for the next lesson when every contact has an unambiguous company link and every field has a clear meaning."
              ],
              steps: [
                "Check that all four company IDs and all four contact IDs are unique.",
                "Confirm that each contact points to a company that exists in the company register.",
                "Record any changed value, the reason, the practice source, the date and your name.",
                "Save the register and dictionary as the Week 1 A artefact."
              ]
            }
          ],
          practice: null,
          checkpoint: [
            {
              question: "Asha discusses a second, separate training request. Which existing link should the new deal retain?",
              answer: "Retain contact C01 and company T01, then give the separate purchase discussion its own deal ID. This preserves one contact history while keeping the two amounts, decisions and next actions distinct."
            },
            {
              question: "A company changes its display name in the practice case. Why should its ID stay unchanged?",
              answer: "The ID keeps existing contacts, deals and activities connected to the same organisation. Update the display name with a dated correction note instead of breaking the links or creating a second company without evidence."
            }
          ]
        },
        {
          id: "crm-w1-l2",
          title: "Build a pipeline",
          minutes: 60,
          objective: "Build exactly 20 fictional opportunities with consistent stages, linked records, amounts, owners, stage history and dated next actions.",
          sections: [
            {
              heading: "Agree what each stage means",
              body: [
                "A stage is a shared rule, not an owner's mood. Write an entry condition before moving any deal. Our broad Proposal stage starts when a qualified buyer requests written terms, and the activity note distinguishes a requested draft from delivered terms. A narrower stage called Proposal sent would require delivery evidence. The lab uses the broad label. Use Won and Lost as closed states, and retain the reason and evidence instead of deleting the opportunity."
              ],
              table: {
                columns: ["Stage", "Entry evidence in this case"],
                rows: [
                  ["Lead", "A fictional enquiry exists; qualification is not complete."],
                  ["Qualified", "Need, budget and decision timing are recorded."],
                  ["Proposal", "A qualified buyer requests written terms; record draft status."],
                  ["Won", "An accepted practice order is recorded."],
                  ["Lost", "A recorded decision ends this purchase discussion."]
                ]
              }
            },
            {
              heading: "Seed exactly 20 distinct opportunities",
              body: [
                "Use fictional case C1 to create D01 through D20, named Practice request 01 through Practice request 20. Each represents a separate training request, not another copy of the same order. Give every request a listed amount of INR 6,000. Priya owns D01 through D10 and Rohit owns D11 through D20. Apply the contact and company links below. Keep the currency in a separate field so the amount remains numeric and can be totalled."
              ],
              table: {
                columns: ["Company", "Contact", "Deal IDs"],
                rows: [
                  ["T01", "C01", "D01, D05, D09, D13, D17"],
                  ["T02", "C02", "D02, D06, D10, D14, D18"],
                  ["T03", "C03", "D03, D07, D11, D15, D19"],
                  ["T04", "C04", "D04, D08, D12, D16, D20"]
                ]
              },
              steps: [
                "Add Deal ID, title, company ID, contact ID, amount, currency, stage and owner.",
                "Add last activity date, next action and next-action date for open deals.",
                "Confirm there are 20 unique deal IDs, even though contacts and companies repeat.",
                "Label the whole dataset Fictional case C1, snapshot 10 November 2026."
              ]
            },
            {
              heading: "Keep a history, not just a snapshot",
              body: [
                "All 20 requests entered Lead on 2 November 2026. D06 through D20 became Qualified on 4 November. D11 through D19 reached Proposal on 6 November. On 9 November, D15 through D18 became Won and D19 became Lost. D20 became Lost directly from Qualified on 6 November. Record each transition as a separate history row with deal ID, date, old stage, new stage and fictional evidence reference. The table shows the resulting snapshot."
              ],
              table: {
                columns: ["Current stage on 10 November", "Deal IDs", "Count"],
                rows: [
                  ["Lead", "D01 to D05", "5"],
                  ["Qualified", "D06 to D10", "5"],
                  ["Proposal", "D11 to D14", "4"],
                  ["Won", "D15 to D18", "4"],
                  ["Lost", "D19 to D20", "2"]
                ]
              },
              callout: {
                type: "tip",
                title: "Preserve the route",
                text: "A deal now marked Won has still passed through earlier stages. A current-stage count cannot replace the history needed for a conversion calculation."
              }
            },
            {
              heading: "Give open work a next action",
              body: [
                "There are 14 open deals in the snapshot. Give each a specific practice action due between 11 and 14 November, owned by its existing sales owner. For example, D08 can require Rohit's input while Priya remains accountable for the deal. Distinguish the action owner from the helper in the note. For closed deals, retain closure evidence and route any service work into the handover rather than presenting it as another open sales opportunity."
              ],
              steps: [
                "Filter Lead, Qualified and Proposal and check every visible row for an owner and dated action.",
                "Write actions as a verb and output, such as Draft the stock-review agenda for approval.",
                "Record a reason for each Lost decision and an accepted-order reference for each Won decision.",
                "Save the pipeline, stage definitions and history as the Week 1 B artefact."
              ]
            }
          ],
          practice: {
            labId: "crm",
            instruction: "Open Clean the pipeline. Read all five notes, move each deal to the stage supported by its evidence and record your reasons in the workbook. Check that the total stays five; do not add these lab deals to case C1."
          },
          checkpoint: [
            {
              question: "D19 is Lost on the snapshot. Should its earlier Proposal entry disappear from the history?",
              answer: "No. D19 reached Proposal before the discussion ended, so that entry remains valid. Retaining it lets the review count stage progression correctly and investigate why a proposal did not lead to an accepted order."
            },
            {
              question: "Priya owns D08 but needs an answer from Rohit. How can the next action avoid ambiguous responsibility?",
              answer: "Keep Priya as deal owner and name who must produce the next output, by which date. Note Rohit's requested input separately. A helper's involvement does not silently transfer responsibility for following up or updating the deal."
            }
          ]
        }
      ]
    },
    {
      week: 2,
      theme: "Useful follow-ups, handovers and funnel reviews",
      lessons: [
        {
          id: "crm-w2-l1",
          title: "Follow up professionally",
          minutes: 60,
          objective: "Write factual activity notes, organise dated follow-ups and prepare a sales-to-service handover for one closed-won practice deal.",
          sections: [
            {
              heading: "Separate an event from its interpretation",
              body: [
                "An activity note should let someone reconstruct the discussion without guessing. Record the date, related deal, channel used in the simulation, what the fictional contact said and the resulting action. Keep interpretations clearly labelled. Requested a sample is an event; likely to purchase is your judgement. Do not write unnecessary personal details or paste invented conversations as if they were real. The note should support the stage and next action without becoming a transcript of everything imagined."
              ],
              callout: {
                type: "example",
                title: "An original practice note",
                text: "10 November 2026, D11: simulated call with Leela. Asked for a sample stock-check sheet before reviewing terms. Rohit to prepare one labelled example by 12 November. Pricing decision remains open."
              },
              bullets: [
                "Use a separate activity ID so later notes do not overwrite earlier events.",
                "Link the note to the deal and contact rather than copying it into every company field.",
                "Record an unanswered question as unanswered, not as a favourable response."
              ]
            },
            {
              heading: "Review follow-ups without creating pressure",
              body: [
                "Review due actions at a regular time and distinguish completed, overdue and not-yet-due work. An overdue date is a signal to investigate, not proof that the contact is uninterested. If an action changes, preserve the original due date and explain the new one in the history. In this course you draft follow-ups only. A real team would need approved contact permissions and communication rules before sending anything, and practice records must never be treated as permission to contact someone."
              ],
              steps: [
                "Use the snapshot date, not today's date, to identify which practice actions are due.",
                "Read the latest activity before drafting a reminder or changing a date.",
                "Draft a short message with context, one clear request and a proposed next step.",
                "Record whether the action was completed, rescheduled with a reason or escalated to its owner."
              ]
            },
            {
              heading: "Transfer the promise, not just the deal value",
              body: [
                "Use D15 for the handover exercise. Its fictional accepted order includes one stock-review meeting on 18 November and a checked count sheet by 20 November, for INR 6,000. Kavya is the receiving service owner; Leela is the contact at Kiran Stationery. The source-file format is still unconfirmed. Describe these facts together so the service owner can see what was agreed, what is missing and which action must happen before the planned meeting."
              ],
              table: {
                columns: ["Handover field", "Practice entry"],
                rows: [
                  ["Accepted scope", "One stock-review meeting and one checked count sheet"],
                  ["Dates", "Meeting 18 November; sheet due 20 November 2026"],
                  ["Receiving owner", "Kavya"],
                  ["Unresolved question", "Which source-file format will Leela supply?"],
                  ["Next action", "Kavya to confirm format by 12 November 2026"],
                  ["Evidence", "D15 accepted practice order dated 9 November 2026"]
                ]
              }
            },
            {
              heading: "Check that the handover can be used",
              body: [
                "Read the handover aloud as if you were receiving the work for the first time. Can you identify the customer contact, promised outputs, dates and open questions without searching unrelated notes? Ask a classmate to play Kavya and point out anything they cannot act on. Record that review as a simulation, not an actual service acceptance. Keep a receiving-owner acknowledgement field and mark it pending unless the practice review has explicitly supplied that acknowledgement."
              ],
              steps: [
                "Compare the handover with the accepted practice order and remove any extra promises.",
                "Check the meeting date, delivery date and earlier preparation action in sequence.",
                "Retain only fictional information needed for delivery and use controlled sharing for the workbook.",
                "Save the activity notes, follow-up draft and D15 handover as the Week 2 A artefact."
              ]
            }
          ],
          practice: null,
          checkpoint: [
            {
              question: "A contact replies before the scheduled follow-up date. What should happen to the original action record?",
              answer: "Record the new activity, then mark the original action completed or superseded with a reason. Set a new action if needed. Do not erase the old note, because the history explains why the plan changed."
            },
            {
              question: "Kavya has not reviewed the D15 handover yet. What should its acknowledgement field show?",
              answer: "Mark acknowledgement pending and give the request an owner and review date. Writing accepted without evidence would hide a delivery risk even if the scope and dates elsewhere in the handover are correct."
            }
          ]
        },
        {
          id: "crm-w2-l2",
          title: "Read the funnel",
          minutes: 60,
          objective: "Reconcile the 20-opportunity pipeline, calculate a same-cohort stage conversion and recommend one supported process improvement.",
          sections: [
            {
              heading: "Define the group before calculating a rate",
              body: [
                "A cohort is a defined group followed through time. For case C1, use the 15 deals that entered Qualified on 4 November and observe them through 10 November. Nine of those same deals later reached Proposal, including deals now Won or Lost. The conversion is 9 divided by 15, or 60%. Record both dates and IDs beside the calculation. Four deals currently in Proposal is a snapshot count, not the number that ever reached it."
              ],
              steps: [
                "List the denominator IDs: D06 through D20, all qualified on 4 November.",
                "From their histories, list the numerator IDs: D11 through D19 reached Proposal by 10 November.",
                "Calculate 9 / 15 and format the result as 60%, retaining the counts beside it.",
                "If no deals enter a chosen cohort, report conversion as not available rather than dividing by zero."
              ]
            },
            {
              heading: "Reconcile counts and listed values",
              body: [
                "Reconciliation checks whether different views describe the same records. The current stages contain 5 plus 5 plus 4 plus 4 plus 2 deals, giving 20. Open stages contain 14 deals at INR 6,000 each, so their listed value is INR 84,000. Won value is INR 24,000 and Lost value is INR 12,000. Together these total INR 120,000. None of these labels tells you when cash arrives; payment records would be needed for that conclusion."
              ],
              table: {
                columns: ["Snapshot group", "Count", "Listed value, INR"],
                rows: [
                  ["Open: Lead, Qualified, Proposal", "14", "84,000"],
                  ["Won", "4", "24,000"],
                  ["Lost", "2", "12,000"],
                  ["All opportunities", "20", "120,000"]
                ]
              },
              callout: {
                type: "warning",
                title: "Name the denominator",
                text: "Won out of all 20 deals is 4 / 20 = 20%. Won out of the six closed deals is 4 / 6, about 66.7%. These answer different questions; never label both simply win rate."
              }
            },
            {
              heading: "Recommend a process change supported by evidence",
              body: [
                "For a small audit exercise, use a copy of the pipeline and temporarily leave the next-action dates for D08, D10 and D12 blank. Identify the three gaps, restore justified dates and keep before-and-after evidence in the correction log. Recommend checking required follow-up fields during the daily review. This recommendation follows from an observed data-quality problem. It does not show that sales will increase, and a short practice period cannot establish the cause of every lost deal."
              ],
              bullets: [
                "Observation: three open records in the audit copy lacked a next-action date.",
                "Action: restore the dates with evidence and assign the daily check to Priya.",
                "Verification: rerun the missing-date filter and record the remaining count.",
                "Limitation: this checks record completeness, not the quality of future customer decisions."
              ]
            },
            {
              heading: "Assemble the twenty-opportunity handover",
              body: [
                "Your final submission combines the register, pipeline, stage history, dated activity notes, D15 handover and short review. Check it against the assignment rather than treating a lab score as a substitute for the project. Make a reader's first page state the fictional case, snapshot date, currency and where to find each artefact. Finish with one supported improvement and one limitation. You should be able to trace any reported number back to identified deal records."
              ],
              steps: [
                "Count exactly 20 unique deals and verify all contact and company links.",
                "Check every open deal for an amount, owner and dated next action; keep closure evidence for closed deals.",
                "Include the 9 / 15 conversion, the 20-record reconciliation and the documented audit correction.",
                "Check D15 scope, dates, receiving owner, unresolved question and next action against its order.",
                "Rehearse a short explanation of what you checked, what you changed and what the figures cannot prove."
              ]
            }
          ],
          practice: {
            labId: "crm",
            instruction: "Repeat Clean the pipeline and read its Won-of-five display. Write the numerator and denominator beside your result, then explain why that snapshot rate differs from case C1's Qualified-to-Proposal history calculation."
          },
          checkpoint: [
            {
              question: "Why is the Proposal snapshot count of four unsuitable as the numerator in case C1's stage-conversion review?",
              answer: "It excludes the four Won deals and one Lost deal that also reached Proposal. The same-cohort history gives nine qualifying deals out of 15, or 60%. A current-stage total answers where deals are now, not where they have been."
            },
            {
              question: "After restoring three missing dates, what evidence supports saying the record-completeness issue was addressed?",
              answer: "Keep the three affected IDs, the dated correction log and the result of the same missing-date filter before and after repair. A zero remaining count supports completeness for that snapshot, not a claim about higher sales or future behaviour."
            }
          ]
        }
      ]
    }
  ],
  deck: {
    title: "CRM workshop: from enquiry to useful handover",
    slides: [
      {
        kind: "title",
        title: "Make the next action visible",
        subtitle: "A 60-minute workshop using fictional case C1",
        illustration: "crm",
        notes: "Allow 3 minutes. Ask learners to describe a time when unclear notes made a handover difficult, without naming real customers. Explain that today uses fictional records and no outreach."
      },
      {
        kind: "content",
        title: "Our working route",
        bullets: [
          "Connect contacts, companies, deals and activities.",
          "Move stages only when their evidence is present.",
          "Write one usable handover and check a cohort calculation.",
          "Leave with a clear checklist for the 20-opportunity assignment."
        ],
        notes: "Allow 4 minutes. Show the blank workbook or free-tier record groups and ask learners to locate their stage history. Explain that lab practice and the larger assignment use separate datasets."
      },
      {
        kind: "content",
        title: "One record, one purpose",
        bullets: [
          "T01 identifies the company, not its latest discussion.",
          "C01 identifies Asha, even when she discusses several requests.",
          "D01 identifies one purchase discussion with its own amount and stage.",
          "Activities preserve dated events without overwriting the deal's history."
        ],
        notes: "Allow 6 minutes. Trace T01 to C01 and D01 on screen, then ask a learner to trace a second deal. Use the remaining time to check one contact-company link in pairs."
      },
      {
        kind: "steps",
        title: "Write a stage-entry rule",
        steps: [
          "Name the stage and its observable entry condition.",
          "Read the fictional evidence before changing the current stage.",
          "Add the transition date and evidence to the history.",
          "Retain closure reasons and earlier stages when a discussion ends."
        ],
        notes: "Allow 6 minutes. Compare the broad Proposal label with a narrower Proposal sent rule. Ask learners to explain how the chosen wording changes the evidence they need."
      },
      {
        kind: "question",
        title: "Poll: a second purchase discussion",
        question: {
          prompt: "C01 already exists. Asha starts a separate purchase discussion with its own decision date. What should be added?",
          options: ["A second copy of C01", "A new company ID", "A new linked deal", "A new spelling of Asha"],
          answerIndex: 2,
          explanation: "A separate purchase discussion needs its own deal. The existing contact and company links preserve a coherent relationship history."
        },
        notes: "Allow 3 minutes. Collect a vote before revealing the answer, then ask what would go wrong if the two discussions shared one amount and next-action field."
      },
      {
        kind: "steps",
        title: "Check the practice pipeline",
        steps: [
          "Confirm D01 to D20 are unique and each amount is INR 6,000.",
          "Reconcile current-stage counts: 5, 5, 4, 4 and 2.",
          "Check owners and dated next actions for all 14 open records.",
          "Try the five-deal lab and explain each move from its note."
        ],
        notes: "Allow 7 minutes. Give learners time to inspect their own pipeline, then use the lab for a short demonstration. Keep lab deals separate so the assignment remains exactly 20 opportunities."
      },
      {
        kind: "content",
        title: "Hand over D15 without adding promises",
        bullets: [
          "Scope: one stock-review meeting and one checked count sheet.",
          "Dates: 18 and 20 November 2026; receiving owner: Kavya.",
          "Open question: source-file format from Leela.",
          "Next action: Kavya confirms the format by 12 November."
        ],
        notes: "Allow 6 minutes. Ask pairs to play the sales and service owners and identify what they still need to know. Mark acknowledgement pending unless the simulated receiving owner explicitly supplies it."
      },
      {
        kind: "question",
        title: "Poll: the plan changed early",
        question: {
          prompt: "A reply arrives on 10 November before a follow-up due on 12 November. How should the history be updated?",
          options: ["Erase the earlier action", "Record the reply and review the action", "Ignore the reply until it is due", "Change the company ID"],
          answerIndex: 1,
          explanation: "The new activity may complete or supersede the action. Record that reason and any new next step while keeping the earlier history."
        },
        notes: "Allow 3 minutes. Ask learners which facts belong in the reply note and which belong in the action field. Emphasise that a changed plan is not a reason to erase evidence."
      },
      {
        kind: "steps",
        title: "Calculate a cohort conversion",
        steps: [
          "Select D06 to D20, qualified on 4 November: 15 deals.",
          "Observe the same group through 10 November.",
          "Count D11 to D19 as ever reaching Proposal: 9 deals.",
          "Report 9 / 15 = 60%, with the dates and IDs beside the rate."
        ],
        notes: "Allow 7 minutes. Have learners trace D19 from Qualified through Proposal to Lost before calculating. Ask why excluding that Lost deal would change the question being answered."
      },
      {
        kind: "question",
        title: "Poll: which denominator is missing?",
        question: {
          prompt: "A review says win rate is about 66.7% using four Won and two Lost deals. What must its label make clear?",
          options: ["It measures collected cash", "It includes all open deals", "It uses company count", "It uses closed deals only"],
          answerIndex: 3,
          explanation: "Four wins divided by six closed deals is about 66.7%. Four wins divided by all 20 opportunities is 20%, a different measure."
        },
        notes: "Allow 4 minutes. Let learners name the denominator before voting. Contrast the closed-deal rate with the lab's Won-out-of-all-deals display without calling either a cash forecast."
      },
      {
        kind: "content",
        title: "Make the review traceable",
        bullets: [
          "Open value is INR 84,000; all listed values total INR 120,000.",
          "Keep the audit copy and correction log for the three missing dates.",
          "Recommend a daily completeness check, not an unsupported sales prediction.",
          "Include the register, history, notes, handover and short review."
        ],
        notes: "Allow 6 minutes. Ask each pair to locate one figure's underlying records and one logged correction. Invite them to explain a limitation before sharing their recommendation."
      },
      {
        kind: "summary",
        title: "A colleague should be able to continue the work",
        bullets: [
          "Use stable record links and evidence-led stages.",
          "Keep dated actions and preserve what changed.",
          "Transfer scope, dates, ownership and unresolved questions.",
          "Name the cohort and reconcile counts before interpreting a rate."
        ],
        notes: "Allow 5 minutes. Ask every learner to state one check they will run before submitting. Close by having them describe the project as fictional practice rather than live customer work."
      }
    ]
  },
  interview: {
    intro: "Use these prompts to explain a sales-support practice project honestly. Show how you organise records, check evidence and help the next owner continue the work. Adapt the guides to what you actually built, and identify fictional data clearly.",
    questions: [
      {
        question: "Why keep stage history when a deal already has a current-stage field?",
        type: "concept",
        answerGuide: [
          "Explain that the current stage shows the position at one snapshot date.",
          "Use the history to show when the deal reached earlier stages, including stages before closure.",
          "Connect that history to same-cohort conversion and an audit of stage changes."
        ],
        tip: "Use one deal's route to explain the distinction instead of listing software features."
      },
      {
        question: "How would you explain listed pipeline value to someone asking how much cash is available?",
        type: "concept",
        answerGuide: [
          "Define listed open value as amounts attached to opportunities still in progress.",
          "Explain that acceptance, invoicing and collection are separate events.",
          "Ask for payment records and timing before discussing available cash."
        ],
        tip: "Be clear about which source would answer the cash question."
      },
      {
        question: "A practice owner wants to keep an ended discussion open to make the pipeline look larger. What would you do?",
        type: "scenario",
        answerGuide: [
          "Compare the recorded decision with the agreed Lost-stage definition.",
          "Explain the effect of an incorrect stage on open counts and follow-up work.",
          "Record the evidence and raise an unresolved disagreement to the named reviewer."
        ],
        tip: "Describe a calm evidence-based conversation rather than accusing the person of bad intent."
      },
      {
        question: "The receiving service owner is unavailable before a promised date. How would you handle the handover?",
        type: "scenario",
        answerGuide: [
          "Check the accepted scope, promised dates and required preparation actions.",
          "Flag the ownership gap promptly and ask the responsible lead to appoint a receiving owner.",
          "Keep acknowledgement pending and record any approved change without inventing a new commitment."
        ],
        tip: "Separate what you can update from decisions that require authority."
      },
      {
        question: "Walk me through an audit of a twenty-opportunity practice pipeline.",
        type: "practical",
        answerGuide: [
          "Check unique deal IDs and valid links to contact and company records.",
          "Verify stage evidence, numeric amounts, owners and dated actions for open deals.",
          "Reconcile current-stage counts and values to the same snapshot.",
          "Retain a correction log and identify any unresolved questions."
        ],
        tip: "Demonstrate one complete check rather than claiming that you checked everything."
      },
      {
        question: "How would you calculate a stage-conversion rate that another reviewer can reproduce?",
        type: "practical",
        answerGuide: [
          "Name the entry stage, entry period, cohort IDs and observation end date.",
          "Count which of those same IDs reached the next stage using dated history.",
          "Show numerator divided by denominator and label a zero denominator as not available.",
          "Keep current-stage counts separate from cumulative progression."
        ],
        tip: "Show the underlying IDs alongside the percentage."
      },
      {
        question: "Tell me about a record-quality mistake you found in your practice project.",
        type: "behavioural",
        answerGuide: [
          "State that the project used fictional records and describe the specific issue.",
          "Explain the source check that established the correct value.",
          "Describe your logged correction and the repeat check that confirmed it.",
          "Finish with a small prevention step, without claiming an unmeasured business benefit."
        ],
        tip: "If you used a deliberately seeded error, say so plainly."
      },
      {
        question: "Describe how you improved a handover after another learner reviewed it.",
        type: "behavioural",
        answerGuide: [
          "Explain what the receiving learner could not understand or act on.",
          "Identify the missing scope, ownership, date or evidence field.",
          "Describe the revision and how you asked the reviewer to check it again.",
          "State the limits of the simulation and what remained pending."
        ],
        tip: "Give credit to the reviewer while being specific about your own revision."
      }
    ]
  },
  glossary: [
    { term: "Contact", definition: "A person record linked to a fictional organisation and related purchase discussions; it is separate from the discussions themselves." },
    { term: "Company", definition: "An organisation record used to connect its contacts and deals without repeating the organisation's details in every activity." },
    { term: "Deal", definition: "A specific potential transaction with its own ID, amount, stage, owner and decision history." },
    { term: "Activity", definition: "A dated record of an event, such as a simulated discussion or a received practice document, linked to the relevant deal." },
    { term: "Pipeline", definition: "A view of opportunities organised by agreed stages; listed open values are not the same as collected cash." },
    { term: "Stage history", definition: "The dated sequence of stage changes and supporting evidence retained even after a deal is closed." },
    { term: "Next action", definition: "A specific piece of follow-up work with an accountable owner and date, based on the latest recorded evidence." },
    { term: "Cohort", definition: "A defined group of records followed across a stated period so the numerator and denominator describe the same population." },
    { term: "Stage conversion", definition: "The share of a defined entry-stage cohort that reaches a specified later stage within the observation period." },
    { term: "Sales-to-service handover", definition: "A transfer of agreed scope, promised dates, receiving ownership, evidence, open questions and next actions from sales work to delivery work." }
  ]
};
