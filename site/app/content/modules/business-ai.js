export default {
  moduleId: "business-ai",
  tagline: "Use AI for bounded business tasks, then verify the evidence, recalculate the numbers and own the final communication.",
  weeks: [
    {
      week: 1,
      theme: "Write useful briefs and check the evidence behind an answer",
      lessons: [
        {
          id: "business-ai-w1-l1",
          title: "Give AI a useful brief",
          minutes: 60,
          objective: "Write three reusable business prompts with a task, audience, constraints and acceptance checks, using fictional inputs only.",
          sections: [
            {
              heading: "Give the task a clear boundary",
              body: [
                "Work with an AI assistant such as ChatGPT or a comparable tool, or use supplied example outputs if account access is unavailable. The assistant can produce useful drafts and can also be wrong. Our fictional brief R1 asks Meera Foods to compare two dispatch-scheduling services for 80 bookings a month and two staff users. The comparison budget is INR 5,000 before tax and carrier charges. Exporting booking records is required; a lower price cannot replace that requirement."
              ],
              table: {
                columns: ["Brief R1 field", "Requirement"],
                rows: [
                  ["Audience", "Priya, the fictional operations coordinator"],
                  ["Task", "Compare Kiran Dispatch and Sundar Dispatch"],
                  ["Volume and access", "80 bookings per month; two staff users"],
                  ["Comparison ceiling", "INR 5000 before tax and carrier charges"],
                  ["Required feature", "Export of booking records"],
                  ["Decision boundary", "A checked shortlist, not purchase approval"]
                ]
              },
              callout: {
                type: "definition",
                title: "Acceptance criteria",
                text: "Acceptance criteria are observable checks that an output must pass before you use it, such as a source reference for every factual claim and a separately verified calculation."
              }
            },
            {
              heading: "Prompt one: a checked comparison",
              body: [
                "A useful prompt makes the output testable rather than simply asking it to sound professional. State the decision, the reader and the allowed evidence. Specify the comparison fields and say how missing information should appear. Then write the acceptance checks before you read the draft, so a fluent answer does not quietly lower your standard. Keep this prompt as a reusable pattern, replacing the fictional documents and criteria only when you have safe, authorised inputs."
              ],
              callout: {
                type: "example",
                title: "Comparison prompt",
                text: "For Meera Foods' coordinator, compare Kiran Dispatch and Sundar Dispatch using fictional R1, A1 and B1 only. Return a table of price, user access and record export with source IDs. Mark missing facts unverified. Check every R1 requirement and give a conditional shortlist, not approval."
              },
              steps: [
                "Name the task and audience, then attach or paste only the fictional source text provided for this exercise.",
                "Define the output columns and preserve monthly units, currency and excluded charges.",
                "Require a source ID for each factual comparison and an unverified label for unsupported claims.",
                "Require an explicit check against every essential criterion, including record export.",
                "Reject an output that invents evidence, conceals a gap or treats a shortlist as an approved purchase."
              ]
            },
            {
              heading: "Prompt two: analysis with visible workings",
              body: [
                "Ask for the calculation steps, not just a recommendation. Visible workings help you locate an error, but they are not independent proof that the answer is right. You will recalculate the amounts in Google Sheets during week two. Keep the assumed volume separate from the source fees so it can be changed without rewriting the evidence. Ask the assistant to distinguish a modelled cost difference from a measured saving that a business has actually achieved."
              ],
              callout: {
                type: "example",
                title: "Analysis prompt",
                text: "For Meera Foods' coordinator, model 80 monthly bookings using A1 at INR 1200 plus INR 40 per booking and B1 at INR 1800 plus INR 30. Show workings, the cost difference and its percentage baseline. Use fictional inputs only. I will check every number in a sheet; do not claim realised savings."
              },
              bullets: [
                "Acceptance: fee, volume, units and exclusions remain visible.",
                "Acceptance: each numeric claim has workings and a planned independent check.",
                "Acceptance: an estimate is labelled as an estimate, not an observed business outcome."
              ]
            },
            {
              heading: "Prompt three: communication from checked evidence",
              body: [
                "Communication is a separate task from analysis. Only pass the checked comparison and corrected figures into the final drafting step. Tell the assistant who will read the message, what decision is needed and what remains uncertain. A concise message should not remove a limitation that could change the decision. Reuse this pattern for a memo, email or slide outline, while keeping the same approved facts and clearly naming the human review that still takes place."
              ],
              callout: {
                type: "example",
                title: "Communication prompt",
                text: "Using only the checked fictional matrix and cost sheet, draft a memo of at most 120 words for Priya. State the conditional shortlist, figures, missing export evidence and next action. Do not invent approval, owners or results. Disclose AI drafting assistance and retain uncertainty. I will review before use."
              },
              bullets: [
                "Acceptance: every amount and status agrees with the checked evidence pack.",
                "Acceptance: the request is specific and the decision remains conditional where required.",
                "Acceptance: the draft discloses AI assistance without claiming unmeasured time or revenue gains."
              ]
            },
            {
              heading: "Keep confidential information out of the workflow",
              body: [
                "Use only the fictional records in this module. Never paste confidential data, real customer histories, resumes, credentials, employer documents or private messages into an assistant. Removing names alone may leave dates, locations or other details that identify a person or business. Do not rely on a friendly response or a suggested privacy setting as permission to upload sensitive material. If a practice task needs context, create a fully invented example rather than adapting a confidential record."
              ],
              steps: [
                "Inspect every planned input before sending it, including copied tables, attachments and hidden notes.",
                "Use the fictional R1, A1 and B1 material, not documents from work or other people.",
                "If an input is sensitive or its status is unclear, stop and replace it with a genuinely invented example.",
                "Keep any final communication as a practice draft; this course does not require sending messages to real recipients."
              ],
              callout: {
                type: "warning",
                title: "No account is needed to practise review",
                text: "If you cannot access an assistant, apply the same criteria to the example drafts in the lessons and lab. You can practise briefing, verification and correction without uploading anything."
              }
            }
          ],
          practice: {
            labId: "business-ai",
            instruction: "Open Brief and verify. Select the brief elements that make its task bounded and checkable, leaving out requests to guess or impress. Explain each choice using task, audience, constraints and acceptance checks."
          },
          checkpoint: [
            {
              question: "Why should record export remain an acceptance check even if one option has the lowest quoted cost?",
              answer: "R1 identifies export as essential. A price comparison cannot establish that the option meets a different requirement. Keep the shortlist conditional until export evidence is confirmed, rather than allowing a cheap estimate to override the brief."
            },
            {
              question: "What makes 'a source ID for every factual comparison' stronger than 'make the answer reliable'?",
              answer: "It is observable: a reviewer can check each claim against its named evidence. The broad request expresses a preference but gives no clear pass or fail condition. Add similarly concrete checks for numbers, missing information and decision status."
            },
            {
              question: "How can a learner without assistant access still complete useful practice in this module?",
              answer: "Write the prompts and acceptance checks, then review the supplied example outputs and lab responses against them. Build the comparison, source log, calculations and corrections yourself. The checking work does not depend on generating a new answer."
            }
          ]
        },
        {
          id: "business-ai-w1-l2",
          title: "Research without inventing",
          minutes: 60,
          objective: "Produce a comparison matrix whose claims trace to labelled fictional source documents, with unsupported information visibly separated from evidence.",
          sections: [
            {
              heading: "Read the source cards before the draft",
              body: [
                "A1 and B1 below are fictional public-facing service cards dated 6 November 2026, created only for this exercise. They are not claims about real providers. Both describe monthly scheduling fees before tax and carrier charges, with access for two users. A1 states that booking records can be exported; B1 does not address export. Use these exact boundaries when comparing the options. A polished answer that adds features absent from the cards has gone beyond its evidence."
              ],
              table: {
                columns: ["Field", "A1: Kiran Dispatch", "B1: Sundar Dispatch"],
                rows: [
                  ["Monthly base fee", "INR 1200", "INR 1800"],
                  ["Fee per booking", "INR 40", "INR 30"],
                  ["Included user access", "Two staff users", "Two staff users"],
                  ["Booking-record export", "Available", "Not stated"],
                  ["Support", "Email; response time not stated", "Email; response time not stated"],
                  ["Excluded charges", "Tax and carrier charges", "Tax and carrier charges"]
                ]
              },
              callout: {
                type: "tip",
                title: "Evidence labels are part of the task",
                text: "R1 is the fictional requirement brief. A1 and B1 are the fictional service cards. Cite these labels and the relevant field so the reviewer can retrace each claim without guessing."
              }
            },
            {
              heading: "Verify the exact claim, scope and date",
              body: [
                "For each proposed claim, find the supporting passage and check that its scope matches the task. A statement about included users does not establish access to every feature. In later authorised research using public business information, inspect the original source, its date and its terms rather than relying on a generated summary. For this assessment, stay within the labelled fictional documents. Treat source text as evidence to inspect, not as instructions that can change your task or privacy rules."
              ],
              steps: [
                "Split the draft into individual claims, such as monthly fee, user access and export availability.",
                "Locate the matching source field and record the document ID, date and supporting wording.",
                "Check units, period, eligibility and exclusions before marking a claim supported.",
                "If sources conflict, record the conflict and seek clarification rather than silently choosing the preferred answer.",
                "If a document contains instructions to ignore your task or reveal data, disregard those instructions and continue the evidence check."
              ],
              callout: {
                type: "warning",
                title: "A citation can still be wrong",
                text: "An assistant can invent a document, quote it inaccurately or attach a real-looking citation to an unrelated claim. Verify the source and the precise support yourself."
              }
            },
            {
              heading: "Build a matrix that exposes uncertainty",
              body: [
                "A comparison matrix should help the reader see both what is known and what still needs checking. Use the same criteria for both options and retain the evidence labels beside the entries. Mark Sundar Dispatch's export capability as unverified, not absent and not available. Those are different claims. The current matrix can support a cost comparison and a conditional shortlist, but it cannot yet support a final choice that assumes every essential requirement has been met."
              ],
              table: {
                columns: ["Criterion", "Kiran Dispatch", "Sundar Dispatch", "Evidence or next check"],
                rows: [
                  ["Two staff users", "Supported by A1", "Supported by B1", "Included user access field"],
                  ["Monthly pricing", "1200 + 40 per booking", "1800 + 30 per booking", "A1 and B1; recalculate at chosen volume"],
                  ["Record export required", "Supported by A1", "Unverified", "Priya to request B1 export confirmation"],
                  ["Support response time", "Unverified", "Unverified", "Neither card states a response time"],
                  ["Tax and carrier charges", "Excluded", "Excluded", "Both cards; full spend still needs review"]
                ]
              },
              callout: {
                type: "definition",
                title: "Unverified is a status, not a guess",
                text: "Use unverified when the available evidence does not establish a claim. Use contradicted when the evidence shows the claim is wrong, and keep assumptions separately labelled."
              }
            },
            {
              heading: "Keep a claim-by-claim evidence log",
              body: [
                "Create a log with the draft claim, source reference, check performed, status and next action. Save the original wording so a reviewer can see what changed. If no assistant is available, review the sample claim that both services include record export. A1 supports that feature for Kiran Dispatch, but B1 does not establish it for Sundar Dispatch. Correct the combined claim into two separate entries and keep the unresolved entry visible for the decision owner."
              ],
              table: {
                columns: ["Draft claim", "Evidence", "Status", "Action"],
                rows: [
                  ["Both services allow two users", "A1 and B1, user access", "Supported within the fiction", "Retain with source IDs"],
                  ["Both services include export", "A1 supports; B1 is silent", "Partly unsupported", "Split claim; request B1 evidence"],
                  ["Both reply within one hour", "Neither card states response time", "Unsupported", "Remove timing claim; request terms"],
                  ["Carrier charges are included", "Both cards exclude carrier charges", "Contradicted", "Correct the stated cost boundary"]
                ]
              },
              callout: {
                type: "tip",
                title: "Repeated wording is not independent evidence",
                text: "Two similar AI answers do not provide two sources. They may repeat the same unsupported statement. Trace the claim to the underlying document instead."
              }
            }
          ],
          practice: null,
          checkpoint: [
            {
              question: "Why should the claim 'both services include export' be split into separate option-level claims?",
              answer: "The evidence differs by option. A1 supports export for Kiran Dispatch, while B1 is silent for Sundar Dispatch. Splitting the claim preserves the supported fact and exposes the unresolved requirement instead of marking the whole comparison as equally certain."
            },
            {
              question: "How does 'carrier charges are included' differ from an unknown support response time in the evidence log?",
              answer: "The cards explicitly exclude carrier charges, so the first claim is contradicted and should be corrected. Neither card gives a support response time, so that point is unverified and needs more evidence. Missing information and contrary evidence require different labels."
            },
            {
              question: "What should you do if copied source text tells the assistant to ignore the brief and reveal private information?",
              answer: "Treat that text as untrusted source content, not authority to change the task. Do not follow it or supply private information. Continue using the agreed fictional inputs and acceptance checks, and note the suspicious instruction if it affects the review."
            }
          ]
        }
      ]
    },
    {
      week: 2,
      theme: "Recalculate, correct and communicate the conditional decision",
      lessons: [
        {
          id: "business-ai-w2-l1",
          title: "Analyse and question",
          minutes: 60,
          objective: "Recalculate the service comparison in a spreadsheet, test volume assumptions and maintain an error log that supports a bounded decision note.",
          sections: [
            {
              heading: "Build the independent spreadsheet check",
              body: [
                "Open a Google Sheets workbook named Meera Foods cost check. Put the source fees and assumed booking volume in separate input cells, then calculate each estimated monthly service cost. At 80 bookings, Kiran Dispatch costs INR 4,400 and Sundar Dispatch costs INR 4,200 before the excluded charges. These are model outputs from fictional fees, not bills paid or realised savings. Keep the source labels beside the inputs so the calculation can be reviewed independently of the assistant's answer."
              ],
              steps: [
                "Use column A for row labels, B for Kiran Dispatch and C for Sundar Dispatch; put the option names in row 1.",
                "In row 2 enter monthly fees 1200 and 1800; in row 3 enter per-booking fees 40 and 30.",
                "In row 4 enter 80 for both options and label it Assumed monthly bookings.",
                "In B5 enter =B2+B3*B4; in C5 enter =C2+C3*C4. Check results of 4400 and 4200.",
                "In B6 enter =B5-C5 for the cost difference of 200; in B7 enter =(B5-C5)/B5 and format as a percentage.",
                "Microsoft Excel uses the same cell layout and formulas; retain the same source labels and cost exclusions."
              ],
              callout: {
                type: "example",
                title: "Keep the percentage baseline visible",
                text: "The estimated difference is INR 200. Relative to Kiran Dispatch, 200 / 4400 is approximately 4.5% when rounded to one decimal place. This is a modelled cost difference, not a measured operating improvement."
              }
            },
            {
              heading: "Test a different volume before recommending",
              body: [
                "The cheaper option can change when fixed and per-booking fees differ. Test alternative booking volumes in a copy of the sheet instead of treating 80 as a prediction. At 50 bookings, Kiran Dispatch costs less; at 60 the estimated service costs are equal. This sensitivity check shows which assumption drives the comparison. It does not settle the missing export requirement or the excluded charges, so keep those checks separate from the arithmetic."
              ],
              table: {
                columns: ["Bookings per month", "Kiran cost, INR", "Sundar cost, INR", "Cost comparison only"],
                rows: [
                  ["50", "3200", "3300", "Kiran lower by 100"],
                  ["60", "3600", "3600", "Equal estimated service cost"],
                  ["80", "4400", "4200", "Sundar lower by 200"],
                  ["100", "5200", "4800", "Sundar lower by 400"]
                ]
              },
              callout: {
                type: "tip",
                title: "Ask what would change your answer",
                text: "Identify the assumptions that could reverse the shortlist, such as booking volume or a required feature. Test them explicitly instead of asking the assistant to repeat its recommendation more confidently."
              }
            },
            {
              heading: "Record errors and unresolved claims separately",
              body: [
                "Review this sample draft as if it came from an assistant: Sundar Dispatch costs INR 4,000 at 80 bookings, is 20% cheaper and includes record export. The sheet corrects the cost and percentage, while the source cards leave export unresolved. Save the original draft and record each correction separately. Do not mark the entire answer verified because one number was repaired. A useful error log shows which issues are resolved, which remain open and what evidence is still needed."
              ],
              table: {
                columns: ["Original draft claim", "Independent check", "Corrected status", "Action"],
                rows: [
                  ["Sundar costs INR 4000", "1800 + 30 x 80 = 4200", "Arithmetic error resolved", "Use estimated cost INR 4200"],
                  ["Sundar is 20% cheaper", "200 / 4400 is about 4.5%", "Baseline calculation corrected", "State baseline and rounding"],
                  ["Sundar includes export", "B1 does not state export", "Unverified", "Priya requests written confirmation"],
                  ["The service halves staff work", "No timing evidence was supplied", "Unsupported outcome claim", "Remove; no measured saving stated"]
                ]
              },
              callout: {
                type: "warning",
                title: "Keep ownership with the reviewer",
                text: "The assistant's explanation of its own answer is another draft, not an independent audit. Use the source cards and your own spreadsheet checks before accepting a correction."
              }
            },
            {
              heading: "Write a decision note that can change",
              body: [
                "The evidence supports a conditional shortlist, not an unconditional purchase. At the assumed 80 bookings, Sundar Dispatch has the lower estimated service cost, but its export capability remains unverified. Keep Kiran Dispatch under consideration because its card supports the required export feature. Record what new evidence would change the next step, such as a confirmed export limitation or a lower booking forecast. A useful decision note makes that dependency visible instead of hiding it beneath a confident recommendation."
              ],
              bullets: [
                "Current cost model: Sundar INR 4,200; Kiran INR 4,400 at 80 bookings, before excluded charges.",
                "Essential open check: whether Sundar supports booking-record export.",
                "Next action: Priya requests export evidence before a purchase decision.",
                "Alternative: retain Kiran for review if Sundar cannot meet the essential requirement.",
                "Boundary: no measured time savings, approved spending or operational results are claimed."
              ],
              callout: {
                type: "example",
                title: "Keep the lab and case separate",
                text: "The lab compares a different set of fictional plans. Recalculate its percentage using its own baseline and inspect its source claims; do not substitute the Meera Foods figures."
              }
            }
          ],
          practice: {
            labId: "business-ai",
            instruction: "Return to Brief and verify and review the sample answer. Flag the incorrect percentage and the unsupported source claim. Recalculate the lab's percentage independently and record the corrected baseline and rounding."
          },
          checkpoint: [
            {
              question: "At 50 bookings, why does the cost-only preference change from the 80-booking case?",
              answer: "Kiran's lower monthly fee matters more at the smaller volume: 1200 + 40 x 50 = INR 3,200, compared with 1800 + 30 x 50 = INR 3,300. The comparison depends on volume, so 80 bookings must remain a stated assumption rather than a fixed fact about future demand."
            },
            {
              question: "Which baseline produces the claim that Sundar's modelled cost is about 4.5% lower at 80 bookings?",
              answer: "Use Kiran's INR 4,400 as the comparison baseline: the INR 200 difference divided by INR 4,400 is about 4.5%. State the baseline and rounding. Dividing by Sundar's cost would answer a different percentage question."
            },
            {
              question: "Why does correcting Sundar's estimated cost to INR 4,200 not make the entire comparison ready for approval?",
              answer: "It resolves one arithmetic error, but record export is still unverified and the cost excludes tax and carrier charges. Keep those issues open and the decision conditional. Numerical accuracy does not establish feature suitability or spending approval."
            }
          ]
        },
        {
          id: "business-ai-w2-l2",
          title: "Communicate the decision",
          minutes: 60,
          objective: "Submit a reviewed decision pack with a consistent memo, stakeholder email, meeting summary and slide outline that disclose AI assistance and uncertainty.",
          sections: [
            {
              heading: "Draft the memo from the checked pack",
              body: [
                "Use the comparison matrix, cost sheet and correction log as the source for communication, not the original unreviewed output. A short memo should state the decision needed, the checked comparison and the open condition. Read every number against the sheet and every feature against its source card. The example below remains conditional because the missing export evidence could change the choice. It also labels the amounts as estimates and discloses the assistance used in drafting.",
                "For Meera Foods, shortlist Sundar Dispatch conditionally at 80 bookings per month: estimated service cost is INR 4,200 versus Kiran Dispatch's INR 4,400. Both exclude tax and carrier charges. Sundar's record export remains unverified, so Priya should request written confirmation before a purchase decision. Retain Kiran for review if Sundar cannot meet that requirement. These are fictional model estimates, not measured savings. AI assisted drafting; the figures and source claims were reviewed by a person."
              ],
              callout: {
                type: "tip",
                title: "Say what is pending",
                text: "A recommendation can be useful while a decision remains pending. Name the blocking check and the responsible person rather than removing the caveat to make the memo sound decisive."
              }
            },
            {
              heading: "Write the stakeholder email as a request",
              body: [
                "The email should help a reader act, not reproduce the whole analysis. Use a subject that names the decision or evidence request. Keep the amounts, assumptions and conditional status identical to the memo. In this fictional communication exercise, Priya will seek export confirmation by 8 November 2026 and Rohit will check excluded charges by the same date. These are invented practice actions, not messages to send to real people or evidence that any service has been purchased.",
                "Subject: Dispatch comparison, evidence needed before a decision. Priya, the checked 80-booking model estimates INR 4,200 for Sundar Dispatch and INR 4,400 for Kiran Dispatch, excluding tax and carrier charges. Please confirm Sundar's record-export capability by 8 November; Rohit will review excluded charges. The shortlist remains conditional and no purchase is approved. The fictional matrix and cost sheet support these figures. AI assisted the draft, which has been reviewed for evidence and consistency."
              ],
              steps: [
                "Use a subject naming the evidence request, not a claim that the decision is already complete.",
                "Include the checked figures, the open requirement, the owner and the fictional due date.",
                "Check the draft against the memo, matrix and spreadsheet before saving it in the communication kit.",
                "Keep it as a fictional practice email; do not send it to any real recipient."
              ]
            },
            {
              heading: "Summarise the meeting without inventing agreement",
              body: [
                "For the communication exercise, use these fictional meeting facts from 6 November 2026: Priya and Rohit reviewed the cost model, requested the missing export evidence and left purchase approval pending. The assigned follow-ups are listed below. Keep discussion, action and decision status separate in the summary. If you ask an assistant to organise the notes, check that it has not promoted a suggestion into agreement or added an owner, deadline or commitment absent from the meeting record."
              ],
              table: {
                columns: ["Item", "Status", "Owner", "Due date or evidence"],
                rows: [
                  ["80-booking cost model", "Reviewed in fictional meeting", "Priya and Rohit", "Cost sheet and A1/B1"],
                  ["Sundar export capability", "Confirmation requested", "Priya", "8 November 2026"],
                  ["Tax and carrier charges", "Further check required", "Rohit", "8 November 2026"],
                  ["Purchase decision", "Pending required evidence", "Priya", "No approval recorded"]
                ]
              },
              callout: {
                type: "warning",
                title: "No implied completion",
                text: "The action to request evidence is not evidence that the feature exists. Keep the task open until the fictional follow-up supplies the required confirmation, and do not invent that confirmation."
              }
            },
            {
              heading: "Make a short slide outline with the same facts",
              body: [
                "The slide outline should help someone explain the decision in a few clear stages. Start with the requirement, then show the comparison and checked cost model, and finish with the conditional request. Keep source labels and uncertainty near the claim they qualify. Do not add a dramatic benefit statement just because the slide needs a headline. Every communication in the kit should describe the same version of the decision pack and the same outstanding evidence."
              ],
              steps: [
                "Slide 1: the R1 need, 80 bookings, two users and required record export.",
                "Slide 2: the A1/B1 comparison, with Sundar export marked unverified.",
                "Slide 3: checked estimated service costs of INR 4400 and INR 4200, with exclusions and volume assumption.",
                "Slide 4: conditional shortlist, Priya's export check, Rohit's charge review and pending approval."
              ],
              callout: {
                type: "tip",
                title: "Run a consistency pass",
                text: "Compare the option names, volume, costs, exclusions, owners, dates and decision status across the memo, email, meeting summary and outline. A changed fact must be updated everywhere it appears."
              }
            },
            {
              heading: "Submit the complete checked decision pack",
              body: [
                "Bring the work together so a reviewer can trace each conclusion back to evidence and see your contribution. Include the prompt, comparison matrix, source checks, spreadsheet calculations, memo and correction log, followed by the communication kit. Record unresolved discrepancies honestly rather than marking them complete for presentation. State that AI supported drafting and that you reviewed the material. The assessment values task clarity, evidence, accurate calculations, useful communication and safe information handling, not the confidence of the assistant's prose."
              ],
              steps: [
                "Include the task prompt with audience, constraints and acceptance checks, plus your other reusable prompt patterns.",
                "Attach the labelled fictional sources and the checked comparison with unsupported claims visible.",
                "Provide the cost sheet, baseline calculation and volume tests with source references.",
                "Keep the original draft claims beside corrections and unresolved actions in the error log.",
                "Submit the memo, stakeholder email, meeting summary and slide outline as one consistent reviewed set.",
                "Check that all inputs are fictional, AI assistance is disclosed and no unmeasured savings or invented approval appears."
              ],
              callout: {
                type: "definition",
                title: "Human accountability",
                text: "You remain responsible for deciding whether the evidence is sufficient, correcting the output and explaining the final recommendation. Using an assistant does not transfer those responsibilities to the tool."
              }
            }
          ],
          practice: null,
          checkpoint: [
            {
              question: "Which facts should stay identical across the memo, email and slide outline for this case?",
              answer: "Keep the two options, 80-booking assumption, INR 4,400 and INR 4,200 estimates, excluded charges and unverified Sundar export aligned. The shortlist remains conditional and purchase approval pending. Any owner or deadline included must agree with the fictional meeting facts."
            },
            {
              question: "The draft email says 'please activate Sundar today'. Why does that fail the checked decision pack?",
              answer: "It changes a conditional shortlist into an instruction to proceed, even though export is unverified and excluded charges need review. Replace it with the agreed evidence request and keep approval pending. Communication must not bypass the unresolved acceptance criteria."
            },
            {
              question: "What should your correction log retain after the final memo no longer contains the original arithmetic error?",
              answer: "Keep the original claim, the independent calculation, the corrected value and its resolved status. Also retain separate open issues, such as missing export evidence. The clean final memo communicates the result; the log explains how the result was checked and repaired."
            }
          ]
        }
      ]
    }
  ],
  deck: {
    title: "Live workshop: brief, verify and communicate a decision",
    slides: [
      {
        kind: "title",
        title: "Useful AI work has human checks",
        subtitle: "0-3 minutes: a fictional business-decision workshop",
        illustration: "business-ai",
        notes: "Today we will use a bounded comparison to practise reviewing an assistant's work rather than simply accepting a fluent answer. Learners may use the supplied example outputs without opening an assistant account."
      },
      {
        kind: "content",
        title: "Our 60-minute route",
        subtitle: "3-5 minutes: agree the evidence trail",
        bullets: [
          "5-19 minutes: define the brief and acceptance checks.",
          "19-33 minutes: compare sources and recalculate costs.",
          "33-47 minutes: challenge assumptions and correct errors.",
          "47-60 minutes: review the communication kit and decision status."
        ],
        notes: "Ask learners to keep R1, A1, B1 and their cost sheet visible. The final recommendation must remain explainable even if the assistant is no longer available."
      },
      {
        kind: "content",
        title: "A bounded task, not a confidence contest",
        subtitle: "5-10 minutes: define the brief",
        bullets: [
          "Task: compare two fictional dispatch-scheduling options.",
          "Audience: Priya, an operations coordinator.",
          "Constraints: fictional sources only; 80 bookings and two users.",
          "Acceptance: checked costs, source references and required record export."
        ],
        notes: "Ask learners to name the essential feature before looking at prices. Remind them never to paste confidential records, credentials, resumes or employer documents into the assistant."
      },
      {
        kind: "steps",
        title: "Write the three reusable prompts",
        subtitle: "10-16 minutes: brief-writing activity",
        steps: [
          "Write a comparison prompt with fields, source labels and missing-evidence rules.",
          "Write an analysis prompt requiring workings, units and a percentage baseline.",
          "Write a communication prompt using checked evidence only.",
          "List observable pass or fail checks before reviewing any answer."
        ],
        notes: "Give learners three minutes to improve one prompt and its acceptance criteria. Ask someone to replace a vague request such as be accurate with a check another person can actually perform."
      },
      {
        kind: "question",
        title: "Live poll: the essential criterion",
        subtitle: "16-19 minutes: vote, then identify the next action",
        question: {
          prompt: "Sundar has the lower modelled cost, but required record export is unverified. What is the correct decision status?",
          options: ["Approved purchase", "All requirements met", "Conditional shortlist pending evidence", "Export is no longer needed"],
          answerIndex: 2,
          explanation: "A lower cost does not establish the required feature. Keep the shortlist conditional and request export evidence before a purchase decision."
        },
        notes: "Ask for a vote and discuss which criterion the price result cannot answer. Emphasise that a clear unresolved condition is more useful than an unsupported final decision."
      },
      {
        kind: "steps",
        title: "Trace the comparison claims",
        subtitle: "19-25 minutes: source-review activity",
        steps: [
          "Split the draft into option-level claims.",
          "Locate the supporting field in A1 or B1.",
          "Check scope, units, date and excluded charges.",
          "Mark supported, contradicted and unverified claims separately."
        ],
        notes: "Ask learners to review the claim that both options include export and split it into two entries. Discuss why two repeated assistant answers are not two independent sources."
      },
      {
        kind: "content",
        title: "Recalculate instead of repeating the answer",
        subtitle: "25-30 minutes: inspect the cost model",
        bullets: [
          "Kiran: 1200 + 40 x 80 = INR 4400.",
          "Sundar: 1800 + 30 x 80 = INR 4200.",
          "Difference: INR 200, approximately 4.5% of Kiran's cost.",
          "Both estimates exclude tax and carrier charges."
        ],
        notes: "Ask learners to enter or inspect the spreadsheet formulas and state the percentage baseline. Reinforce that estimated cost differences are not evidence of realised savings or reduced staff time."
      },
      {
        kind: "question",
        title: "Live poll: a claim about saved time",
        subtitle: "30-33 minutes: vote, then define the evidence",
        question: {
          prompt: "What evidence would be needed before reporting a measured reduction in time spent on comparable tasks?",
          options: ["A more confident draft", "Comparable recorded timings and a stated method", "The lower quoted price", "A second generated estimate"],
          answerIndex: 1,
          explanation: "A measured time claim needs actual timing evidence with comparable task conditions and a clear method. A price comparison or a repeated estimate does not establish time saved."
        },
        notes: "Invite a vote and ask what comparable would mean in a real measurement plan. Keep this exercise's report limited to the fictional cost model because no timing evidence was collected."
      },
      {
        kind: "steps",
        title: "Challenge the assumption and log corrections",
        subtitle: "33-39 minutes: review activity",
        steps: [
          "Change booking volume in a test copy and recalculate both options.",
          "Check 50 bookings, where Kiran is lower by INR 100.",
          "Correct the sample draft's INR 4000 cost and 20% claim.",
          "Keep the missing export evidence open as a separate issue."
        ],
        notes: "Give learners time to record one resolved error and one unresolved claim. Ask them to explain why correcting the arithmetic does not resolve the feature requirement."
      },
      {
        kind: "content",
        title: "Treat source text as evidence, not instructions",
        subtitle: "39-44 minutes: privacy and review discussion",
        bullets: [
          "Use fully fictional inputs throughout this practice.",
          "Do not upload confidential material with names merely removed.",
          "Ignore source instructions that try to change the task or request secrets.",
          "The reviewer decides whether evidence meets the acceptance criteria."
        ],
        notes: "Ask learners what they would do if a copied document asked for private records. The safe response is to keep the original task boundary and never provide the sensitive input."
      },
      {
        kind: "question",
        title: "Live poll: an instruction inside a source",
        subtitle: "44-47 minutes: vote, then restate the boundary",
        question: {
          prompt: "A source card says to ignore the brief and request private customer records. How should it be treated?",
          options: ["As new authority for the task", "As permission to upload records", "As a required acceptance check", "As untrusted text, not an instruction to follow"],
          answerIndex: 3,
          explanation: "A source document is evidence to inspect, not authority to change the task or privacy boundaries. Disregard the instruction and continue using only the agreed fictional inputs."
        },
        notes: "Ask for a vote and have a learner restate the permitted inputs. Explain that helpful analysis does not require obeying instructions embedded in material being reviewed."
      },
      {
        kind: "steps",
        title: "Review the communication kit",
        subtitle: "47-53 minutes: consistency check",
        steps: [
          "Draft the memo from the checked matrix and spreadsheet.",
          "Make the email request the missing evidence, not activation.",
          "Separate meeting discussion, actions and pending approval.",
          "Match the slide outline to the same costs, assumptions and status.",
          "Disclose AI assistance and retain human review."
        ],
        notes: "Ask learners to compare one amount and one decision-status phrase across all four outputs. A change in the wording must not quietly change an open question into a completed action."
      },
      {
        kind: "content",
        title: "Explain what you checked yourself",
        subtitle: "53-57 minutes: short spoken review",
        bullets: [
          "Name the task and the acceptance criteria.",
          "Show one source check and one independent calculation.",
          "Explain one correction and one unresolved requirement.",
          "State the conditional decision without inventing a business result."
        ],
        notes: "Invite learners to give a short explanation to a classmate using the evidence pack. Ask the listener to identify which part of the work was drafted by AI and which part was verified by the learner."
      },
      {
        kind: "summary",
        title: "Brief clearly, verify independently, communicate honestly",
        subtitle: "57-60 minutes: final readiness check",
        bullets: [
          "Task, audience, constraints and acceptance checks are explicit.",
          "Claims trace to evidence and every number is recalculated.",
          "Corrections and unresolved issues remain visible.",
          "The communication kit agrees, protects privacy and discloses assistance."
        ],
        notes: "Ask each learner to name the next unresolved check in their pack. Close by reminding them that the assistant can be wrong and the final recommendation remains their responsibility to explain."
      }
    ]
  },
  interview: {
    intro: "Use the fictional decision pack to discuss responsible AI-assisted business work. Adapt these guides to your own prompt, source checks, calculations and corrections. Do not invent real workplace use, measured savings or results that the exercise did not establish.",
    questions: [
      {
        question: "How do a prompt and acceptance criteria serve different purposes?",
        type: "concept",
        answerGuide: [
          "The prompt describes the task, audience, inputs and required output.",
          "Acceptance criteria define the observable checks the output must pass.",
          "Explain why a well-written prompt still needs independent verification.",
          "Use a source-reference or calculation check from your actual practice pack."
        ],
        tip: "Give one concrete pass or fail condition rather than only saying the answer should be accurate."
      },
      {
        question: "How do you distinguish a fact, an assumption and an unsupported claim?",
        type: "concept",
        answerGuide: [
          "A supported fact traces to evidence that matches its scope.",
          "An assumption is a stated input or condition used for analysis, such as 80 bookings.",
          "An unsupported claim lacks sufficient evidence and must not be presented as established.",
          "Explain how each category appears differently in your comparison or memo."
        ],
        tip: "Show the labels in your evidence log so the distinction is operational, not just verbal."
      },
      {
        question: "A colleague suggests pasting a confidential report into an assistant after removing names. What would you do?",
        type: "scenario",
        answerGuide: [
          "Do not paste the confidential report or assume name removal makes it safe.",
          "Explain that dates, business details or other information may remain sensitive.",
          "Use a fully invented example for this practice task instead.",
          "For real work, follow the applicable authorisation and data-handling rules before considering any tool."
        ],
        tip: "State the safe alternative clearly without describing sensitive data as harmless."
      },
      {
        question: "The cheapest option lacks evidence for an essential feature. How would you present the recommendation?",
        type: "scenario",
        answerGuide: [
          "Keep the cost comparison separate from the feature requirement.",
          "Mark the feature unverified and name the evidence needed to resolve it.",
          "Present a conditional shortlist rather than an approved purchase.",
          "State what would change the choice and retain a suitable alternative for review."
        ],
        tip: "Use the unresolved export check from the fictional case as a bounded example."
      },
      {
        question: "Show how you would verify a comparison sentence that makes claims about two options.",
        type: "practical",
        answerGuide: [
          "Split the sentence into individual claims for each option.",
          "Locate the relevant field in each labelled source and check its date and scope.",
          "Record supported, contradicted or unverified status separately.",
          "Revise the sentence so it does not spread one option's evidence to the other."
        ],
        tip: "Keep the original wording in the log so the reviewer can see what changed."
      },
      {
        question: "Demonstrate the spreadsheet check for the service-cost comparison and its percentage difference.",
        type: "practical",
        answerGuide: [
          "Separate monthly fee, per-booking fee and assumed volume as labelled inputs.",
          "Calculate each cost with a formula and trace the inputs to A1 or B1.",
          "Subtract the costs and divide by the explicitly named comparison baseline.",
          "Test another volume and state the excluded charges and unresolved feature requirement."
        ],
        tip: "Explain what the model estimates without presenting it as a measured saving."
      },
      {
        question: "Tell me about an AI-output correction you made during this exercise.",
        type: "behavioural",
        answerGuide: [
          "Identify the actual sample claim or generated output you reviewed.",
          "Describe the independent source or spreadsheet check you performed.",
          "Show the correction and whether any related issue remained unresolved.",
          "Explain how you updated the final communication without inventing an operational impact."
        ],
        tip: "If you used supplied outputs rather than a live assistant, say so plainly."
      },
      {
        question: "How did you keep the memo, email and meeting summary consistent?",
        type: "behavioural",
        answerGuide: [
          "Use one checked evidence pack as the source for all drafts.",
          "Compare option names, costs, assumptions, owners, dates and decision status.",
          "Retain missing-evidence warnings and distinguish requests from completed actions.",
          "Describe the disclosure and human review you actually performed."
        ],
        tip: "Point to one consistency check instead of claiming that AI made every output correct."
      }
    ]
  },
  glossary: [
    { term: "Prompt", definition: "The instruction and context given to an assistant, including the task, audience, permitted inputs, constraints and requested output." },
    { term: "Acceptance criteria", definition: "Observable conditions an output must meet before it is used, such as supported claims, checked calculations and visible uncertainty." },
    { term: "Hallucination", definition: "An invented or inaccurate statement produced by an AI assistant, sometimes expressed confidently or accompanied by a plausible-looking citation." },
    { term: "Source verification", definition: "Checking that an original source exists and supports the precise claim, scope, units and period being reported." },
    { term: "Unverified claim", definition: "A statement not established by the available evidence. It should remain labelled and unresolved rather than being presented as fact." },
    { term: "Assumption", definition: "A stated input or condition used for analysis but not established as an observed outcome, such as an expected booking volume." },
    { term: "Independent cross-check", definition: "A check made using separate source evidence or a separately constructed calculation rather than repeating the assistant's answer." },
    { term: "Sensitivity check", definition: "A recalculation using a changed assumption to see whether the estimate or preferred option would change." },
    { term: "Correction log", definition: "A record of original claims, evidence checks, corrections, unresolved issues and next actions, retained alongside the final reviewed output." },
    { term: "Data privacy", definition: "Responsible handling of personal and confidential information. This module uses fictional inputs only and never requires uploading sensitive records." },
    { term: "Conditional recommendation", definition: "A proposed next step that explicitly depends on further evidence or approval, rather than presenting an unresolved choice as final." },
    { term: "AI disclosure", definition: "An honest statement of how an assistant contributed and what a person reviewed, without claiming unmeasured benefits or human-only authorship." }
  ]
};
