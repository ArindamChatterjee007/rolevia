export default {
  moduleId: "trello",
  tagline: "Turn a fictional workshop plan into small, owned tasks, visible blockers and a handover that tells the truth about unfinished work.",
  weeks: [
    {
      week: 1,
      theme: "A scoped backlog and a usable task board",
      lessons: [
        {
          id: "trello-w1-l1",
          title: "Break down a project",
          minutes: 60,
          objective: "Write a fictional workshop brief and break its launch pack into exactly 15 deliverable tasks with clear boundaries.",
          sections: [
            {
              heading: "Define the output and its boundaries",
              body: [
                "Plan a fictional stock-records workshop for Kiran Stationery, with a proposed event date of 30 November 2026. Your project produces a review-ready launch pack, not a real event. It excludes actual bookings, payments, invitations and attendee data collection. Write the outcome, intended audience, exclusions and reviewer in a short brief. Use Trello (free plan) or the supplied task-board template; the coordination method matters more than decorative covers or a particular screen layout."
              ],
              bullets: [
                "Project output: a checked launch pack with a clear handover and any unfinished work named.",
                "Practice boundaries: fictional records only, no real outreach or purchases.",
                "Review authority: Priya reviews the overall scope; each card names its output reviewer.",
                "Backlog size: exactly 15 deliverable tasks, with risks and decisions recorded separately."
              ]
            },
            {
              heading: "Start with decisions that later work depends on",
              body: [
                "The first five tasks establish the workshop's purpose and constraints. Give each a stable ID so it remains recognisable if its title changes. The owner is the person accountable for moving the task forward, not necessarily everyone who contributes. The due date is the planned acceptance date. Read each completion test before starting work; it should describe an output someone can inspect. All dates in the seed backlog below are fictional November 2026 dates."
              ],
              table: {
                columns: ["ID", "Deliverable", "Owner", "Due", "Accepted when"],
                rows: [
                  ["T01", "Scope brief", "Priya", "3 November", "Outcome, exclusions and reviewer are agreed."],
                  ["T02", "Audience-needs note", "Rohit", "4 November", "Audience tasks and learning needs are stated."],
                  ["T03", "Draft cost limit", "Meera", "5 November", "INR totals are checked and assumptions labelled."],
                  ["T04", "Fictional venue comparison", "Priya", "7 November", "Two options are compared and one is selected."],
                  ["T05", "Session agenda", "Rohit", "9 November", "Session times total the stated workshop duration."]
                ]
              }
            },
            {
              heading: "Make communication and preparation inspectable",
              body: [
                "The next five tasks create practical materials. Keep each card focused on one output rather than a vague promise to organise everything. A checklist can describe the work needed, but the acceptance criterion states what must be true at the end. For example, ticking Draft instructions does not show that the location or arrival information is correct. Keep invitation and registration artefacts as drafts using fictional entries so no learner mistakes the exercise for an active event."
              ],
              table: {
                columns: ["ID", "Deliverable", "Owner", "Due", "Accepted when"],
                rows: [
                  ["T06", "Invitation draft", "Meera", "11 November", "Purpose, date and draft status are clear."],
                  ["T07", "Registration template", "Priya", "13 November", "Fields are tested using fictional entries only."],
                  ["T08", "Attendee instructions", "Rohit", "18 November", "Date, place, arrival and help instructions are checked."],
                  ["T09", "Workshop slide draft", "Meera", "18 November", "Claims trace to the fictional source material."],
                  ["T10", "Expense-log template", "Priya", "19 November", "Categories, totals and receipt-status fields work."]
                ]
              }
            },
            {
              heading: "Include review and handover work in the backlog",
              body: [
                "A project plan needs time to check outputs and transfer responsibility, not just time to draft them. The final five tasks make that work visible. Do not create extra task cards for every risk or meeting note, because the assignment requires a 15-task board. Keep a separate risk register and decision log in the board description or an attached practice document. Save the brief and this complete backlog as the first artefact before building the board."
              ],
              table: {
                columns: ["ID", "Deliverable", "Owner", "Due", "Accepted when"],
                rows: [
                  ["T11", "Facilitator run-sheet", "Rohit", "19 November", "Sequence, owners and contingency steps are listed."],
                  ["T12", "Materials quantity check", "Meera", "20 November", "Counts trace to agreed activities and audience."],
                  ["T13", "Pack rehearsal notes", "Priya", "22 November", "A simulated run-through and its issues are recorded."],
                  ["T14", "Feedback-form draft", "Rohit", "23 November", "Questions match the aims and include a privacy note."],
                  ["T15", "Final launch-pack index", "Meera", "25 November", "Required outputs are accepted and follow-ups are owned."]
                ]
              }
            }
          ],
          practice: null,
          checkpoint: [
            {
              question: "Why keep T08 in the card title or description after renaming Attendee instructions?",
              answer: "The stable ID keeps dependency notes, review comments and change decisions connected to the same task. A clearer title can change without forcing everyone to reinterpret references across the board."
            },
            {
              question: "The plan needs three recorded risks as well as 15 task cards. How can both requirements be met?",
              answer: "Keep the 15 cards for deliverable tasks and place the risk register in a separate document or board description. Link each risk to affected task IDs, with an owner and response, rather than inflating the task count with risk-only cards."
            }
          ]
        },
        {
          id: "trello-w1-l2",
          title: "Build the board",
          minutes: 60,
          objective: "Create a 15-card board with defined lists, owners, dates, checklists, acceptance criteria and visible dependencies using free-plan features.",
          sections: [
            {
              heading: "Give every list an agreed meaning",
              body: [
                "Create Backlog, Doing, Review, Blocked and Done lists. Backlog holds work not yet started, Doing holds active work, Review holds drafts awaiting acceptance, and Done requires the stated checks to pass. Blocked means a known obstacle prevents progress and needs an owner and next check. Use labels for categories such as Materials or Communication, not as the only way to express status. Write the list rules where the team can find them before moving cards."
              ],
              steps: [
                "Create one board or template view and add the five named lists.",
                "Create T01 through T15 once each, using the backlog's owners, dates and acceptance tests.",
                "Use clear text labels that remain understandable without colour.",
                "Keep risk and decision notes outside the 15 deliverable-card count."
              ]
            },
            {
              heading: "Make a card usable without a meeting",
              body: [
                "Open a card and put the deliverable, accountable owner, acceptance date and completion test together. Add a checklist for drafting, checking, review and evidence. A reviewer is not automatically a second owner; name both roles when they differ. If a practice collaborator is not a board member, write the fictional owner in the description rather than inviting a real person. Keep supporting references simple, such as Evidence E08, and mark missing material pending instead of pretending an attachment exists."
              ],
              table: {
                columns: ["Card part", "Example for T08"],
                rows: [
                  ["Deliverable", "One attendee-instructions sheet"],
                  ["Accountable owner", "Rohit"],
                  ["Acceptance date", "18 November 2026"],
                  ["Reviewer", "Priya"],
                  ["Checklist", "Draft, verify facts, request review, record evidence"],
                  ["Acceptance test", "Date, place, arrival and help instructions are checked."],
                  ["Evidence state", "E08 draft, acceptance pending"]
                ]
              }
            },
            {
              heading: "Record sequencing and realistic estimates",
              body: [
                "Dependencies explain which output is needed before another task can proceed. Record the predecessor ID on the dependent card and name the person who can resolve a delay. A due date alone does not express that relationship. For the later change exercise, estimate T08 at four hours, including two hours for an optional illustrated map. Estimate T09 at five hours, including one hour of optional visual polish. These are fictional planning assumptions, not measured productivity claims."
              ],
              table: {
                columns: ["Dependent tasks", "Needed first", "Reason"],
                rows: [
                  ["T04, T10", "T03", "Venue choice and expense fields use the cost assumptions."],
                  ["T05, T07, T14", "T02", "Agenda and forms need the audience requirements."],
                  ["T06", "T04 and T05", "Invitation details need the venue choice and agenda."],
                  ["T08", "T04", "Instructions need the selected venue information."],
                  ["T09, T11", "T05", "Slides and run-sheet follow the agreed agenda."],
                  ["T12, T13", "T09; T13 also needs T08 and T11", "Materials and rehearsal need the relevant drafts."],
                  ["T15", "T01 through T14", "The final pack requires accepted component outputs."]
                ]
              },
              callout: {
                type: "tip",
                title: "Keep the free-plan workflow simple",
                text: "Use descriptions, checklists and task IDs for dependencies. The course does not require automatic dependency scheduling, paid fields or automation."
              }
            },
            {
              heading: "Limit active work deliberately",
              body: [
                "Set a team policy of at most three cards in Doing. This work-in-progress limit encourages finishing or resolving current work before starting more. The interactive lab enforces its limit, but your Trello practice board uses a manual team rule rather than an assumed automatic restriction. Moving a card to Blocked does not make the team's obligation disappear. Review blocked and waiting-review work as well as Doing so the limit cannot be used to hide an overloaded plan."
              ],
              steps: [
                "Write Doing limit: 3 in the board's working rules.",
                "Before pulling a card, check capacity, dependencies and the next acceptance step.",
                "Move a blocked card only when there is a real simulated obstacle and a written reason.",
                "Save the board rules and 15 completed card descriptions as the Week 1 B artefact."
              ]
            }
          ],
          practice: {
            labId: "trello",
            instruction: "Open Respect the WIP limit. Move three cards to Doing, then try a fourth to observe the rejection. Record what the lab enforces and which equivalent check your own free-plan board must perform manually."
          },
          checkpoint: [
            {
              question: "A card lists two people but each expects the other to request review. How should the card be clarified?",
              answer: "Name one accountable owner for moving the task forward and list the other person's contribution or reviewer role separately. Add the next action and date so sharing the work does not leave responsibility ambiguous."
            },
            {
              question: "The lab rejects a fourth Doing card. Should you assume the same restriction is automatic on your own free-plan board?",
              answer: "No. The lab implements its own limit. Record the three-card rule on the practice board and check it manually unless a separately verified feature enforces it. The team still needs to review blocked and waiting-review work."
            }
          ]
        }
      ]
    },
    {
      week: 2,
      theme: "Honest status, explicit trade-offs and a clear handover",
      lessons: [
        {
          id: "trello-w2-l1",
          title: "Track work honestly",
          minutes: 60,
          objective: "Report a reconciled board snapshot, distinguish risks from blockers and record owned next steps without overstating progress.",
          sections: [
            {
              heading: "Review the board from finished work backwards",
              body: [
                "Start a status review with accepted outputs, then inspect Review, Doing and Blocked before pulling new work. A task's age or due date does not make it complete. For this worked snapshot, assume fictional evidence E01 through E07 supports acceptance of T01 through T07 on 16 November. In your own submission, use only accepted outputs you can actually show. If an artefact is unfinished, keep it in the appropriate list rather than copying the example's completion status."
              ],
              table: {
                columns: ["List on 16 November 2026", "Task IDs", "Count"],
                rows: [
                  ["Done", "T01 to T07", "7"],
                  ["Doing", "T09, T10, T11", "3"],
                  ["Review", "T08", "1"],
                  ["Blocked", "T12, T13", "2"],
                  ["Backlog", "T14, T15", "2"]
                ]
              },
              bullets: [
                "The five list counts total 15 cards.",
                "Seven outputs are accepted and eight tasks remain unfinished.",
                "A card count is not an effort-weighted measure of project completion."
              ]
            },
            {
              heading: "Distinguish a risk from an existing blocker",
              body: [
                "A risk is a possible future problem; a blocker is already preventing a task from progressing. In the worked snapshot, T12 lacks the activity details from T09, and T13 cannot rehearse the unfinished slide pack. Record those obstacles on their cards with the dependency owner and next check. Keep potential problems in the separate risk register below. If a risk occurs, update the affected task and its response rather than leaving the issue hidden in an old planning note."
              ],
              table: {
                columns: ["Risk", "Owner", "Planned response"],
                rows: [
                  ["Venue information may change", "Priya", "Keep an alternative option and recheck affected instructions."],
                  ["A reviewer may be unavailable", "Rohit", "Agree a backup reviewer and reserve a review slot."],
                  ["Printing estimates may exceed the cost limit", "Meera", "Compare a simpler pack and seek approval before spending."]
                ]
              },
              steps: [
                "For T12, record the missing activity details and ask Meera for the T09 update by 17 November.",
                "For T13, Priya checks the slide and instruction readiness on 17 November before confirming rehearsal.",
                "Give each risk a dated review and update it when its likelihood or response changes.",
                "Do not move work to Done merely to make the visible blocker count smaller."
              ]
            },
            {
              heading: "Write a status update that supports a decision",
              body: [
                "A useful update combines the snapshot, its main obstacle and the next decision needed. State seven accepted tasks and eight remaining, then identify the two blocked tasks and their dependency on the slide draft. Ask for the specific input or review needed to release them. Do not describe the project as almost finished because the board looks busy. Keep the date, owner and next check beside the request so the reader knows what response would help."
              ],
              callout: {
                type: "example",
                title: "A short practice update",
                text: "16 November: 7 of 15 tasks accepted; 8 remain. Doing 3, Review 1, Blocked 2, Backlog 2. T12 and T13 need the T09 draft. Meera will provide an update by 17 November; Priya will confirm the rehearsal plan after checking it."
              },
              bullets: [
                "Separate accepted work from drafts, even when drafts are nearly ready.",
                "Mention overdue work honestly and record any approved date change.",
                "Use counts to reconcile the board, not to imply that all tasks require equal effort."
              ]
            },
            {
              heading: "Use small checks to keep the board current",
              body: [
                "Choose a regular review point and ask each owner for evidence of what changed. Compare the card with its output before moving it, and keep the latest decision in the description or activity note. The lab is a useful rehearsal for moving work and recording blockers, but it does not collect every field your assignment needs. Transfer the lesson to your own board by adding owners, dates, dependencies and acceptance evidence that the miniature exercise cannot represent."
              ],
              steps: [
                "Check that every Doing card has a realistic next step and that there are no more than three.",
                "Inspect Review cards for a named reviewer and requested response date.",
                "Inspect Blocked cards for a reason, dependency owner and next check.",
                "Recount all lists and save the dated status update as the Week 2 A artefact."
              ]
            }
          ],
          practice: {
            labId: "trello",
            instruction: "Repeat Respect the WIP limit. Record one plausible simulated blocker with a written reason and finish at least two cards. In your workbook, state the acceptance evidence you assumed and add an owner and next-check date for the blocker."
          },
          checkpoint: [
            {
              question: "Does seven accepted cards out of fifteen prove that seven-fifteenths of the project's effort is finished?",
              answer: "No. Cards may represent different amounts of work. The count accurately describes accepted outputs, but effort or schedule conclusions need estimates, dependencies and remaining-work evidence rather than treating every card as equal."
            },
            {
              question: "A printing-cost risk becomes a confirmed quote above the approved limit. What should change on the board?",
              answer: "Record the confirmed issue on affected cards and identify whether it blocks their next step. Assign an owner to seek an approved response, retain the risk history and update dates or scope only after the relevant decision."
            }
          ]
        },
        {
          id: "trello-w2-l2",
          title: "Handle change and close",
          minutes: 60,
          objective: "Document a late request, assess its time and scope effects, update affected cards and prepare an honest project handover.",
          sections: [
            {
              heading: "Assess a request before accepting it",
              body: [
                "On 16 November, the fictional organiser requests a bilingual attendee-instructions sheet. Estimate three additional hours within T08, including a language review. The event date and available work time stay unchanged. Optional work has not started: T08 contains a two-hour illustrated map and T09 contains one hour of visual polish. Removing those optional items releases three hours. Record this as a proposed scope exchange, not as free extra capacity or evidence that translation will always take this long."
              ],
              table: {
                columns: ["Change item", "Estimated hours", "Effect"],
                rows: [
                  ["Add bilingual instructions and review to T08", "+3", "New required content"],
                  ["Remove optional illustrated map from T08", "-2", "Keep checked text directions"],
                  ["Remove optional visual polish from T09", "-1", "Keep clear, checked slides"],
                  ["Net change", "0", "Total planned effort stays unchanged"]
                ]
              }
            },
            {
              heading: "Record the decision and update the real work",
              body: [
                "In the simulation, Priya approves the exchange on 16 November. T08 changes from four estimated hours to five, while T09 changes from five to four, so their combined estimate remains nine hours. Update their descriptions and acceptance criteria, not just a meeting note. T08 must return from Review to Doing for the new content. First complete T10's draft and move it from Doing to Review with evidence E10, leaving room under the three-card Doing limit."
              ],
              steps: [
                "Log the request, estimate, removed scope, approver, decision date and affected IDs.",
                "Add language-review acceptance evidence to T08 and record that the optional map was removed.",
                "Remove only the optional polish from T09; keep its factual checks and readability requirements.",
                "Move T10 to Review only after its draft checks pass, then return T08 to Doing.",
                "Recheck dependencies and dates, and communicate the accepted change to Rohit and Meera."
              ],
              callout: {
                type: "warning",
                title: "Approval does not complete the task",
                text: "A recorded scope decision authorises the changed work. It does not show that the new instructions are written or reviewed, so T08 cannot be marked Done on approval alone."
              }
            },
            {
              heading: "Hand over completed and pending work separately",
              body: [
                "After the two list moves, the example still has seven Done, three Doing, one Review, two Blocked and two Backlog cards. The card identities changed even though the counts did not. Use a handover index that names each output, its latest evidence reference, acceptance state and next owner. Required unfinished work prevents project closure, but it does not prevent an honest handover of the current plan. State explicitly that this was a fictional workshop-planning exercise, not an event delivered."
              ],
              bullets: [
                "T08 is Doing with revised instructions and language review still required.",
                "T10 is Review with E10 available; acceptance remains pending.",
                "T12 and T13 retain their blocker checks until the needed drafts arrive.",
                "T15 cannot be accepted until its required component outputs pass review."
              ]
            },
            {
              heading: "Finish the fifteen-task assignment pack",
              body: [
                "Submit the brief, 15-card board, risk register, dated status update, late-change record and handover index together. Check the assignment's acceptance list against your files rather than assuming a neat board is enough. Each card needs its own owner, due date, checklist and completion test. Each claim of acceptance needs inspectable evidence; otherwise mark work pending. Conclude with one lesson about sequencing or review that your example supports, without claiming the fictional workshop actually took place."
              ],
              steps: [
                "Count exactly 15 deliverable cards and confirm that risk notes did not create extra tasks.",
                "Check all owners, dates, checklists, acceptance criteria and dependency references.",
                "Include at least three risks with owners and responses plus a reconciled status snapshot.",
                "Show the late request's time and scope effects, simulated decision and changed card details.",
                "Name accepted outputs and pending work separately in the Week 2 B handover."
              ]
            }
          ],
          practice: null,
          checkpoint: [
            {
              question: "T08 moves from Review to Doing while T10 moves from Doing to Review. Why is a counts-only update insufficient?",
              answer: "The totals stay unchanged, but ownership needs and required work have changed. The update should identify the changed cards, T08's new acceptance criteria and T10's pending review so the team can act on the actual state."
            },
            {
              question: "If the optional work had already been completed, could its original three-hour estimate fund the new request?",
              answer: "No. Time already spent is not available future capacity. Re-estimate the remaining work and seek another approved scope, date or capacity decision rather than counting finished optional work as time that can still be saved."
            }
          ]
        }
      ]
    }
  ],
  deck: {
    title: "Task-board workshop: finish, explain and hand over",
    slides: [
      {
        kind: "title",
        title: "Make work understandable at a glance",
        subtitle: "A 60-minute workshop using a fictional launch pack",
        illustration: "trello",
        notes: "Allow 3 minutes. Explain that learners are planning fictional work, not sending invitations or booking a real event. Ask what information they need before accepting a task from another person."
      },
      {
        kind: "content",
        title: "Our working route",
        bullets: [
          "Turn the brief into 15 deliverable cards.",
          "Check list rules, ownership, dependencies and acceptance.",
          "Practise a WIP limit and a useful status update.",
          "Assess a late request and leave a traceable handover."
        ],
        notes: "Allow 4 minutes. Ask learners to open the brief and their board, then identify one excluded activity. Keep the distinction between the larger assignment and the five-card lab visible."
      },
      {
        kind: "content",
        title: "A checklist and acceptance are different",
        bullets: [
          "Checklist: the actions needed to prepare the output.",
          "Acceptance: the observable conditions the finished output must meet.",
          "Owner: the person accountable for the next step.",
          "Reviewer: the person checking the required evidence."
        ],
        notes: "Allow 6 minutes. Read T08's completion test and ask pairs to improve an unclear checklist item. Have them explain who requests review and who supplies it."
      },
      {
        kind: "steps",
        title: "Build a board with working rules",
        steps: [
          "Use Backlog, Doing, Review, Blocked and Done with written meanings.",
          "Create each task ID once and add its owner, date and acceptance test.",
          "Record predecessor IDs and the evidence needed to move forward.",
          "Set Doing to a manual team limit of three cards."
        ],
        notes: "Allow 6 minutes. Demonstrate using descriptions and checklists without paid scheduling features. Ask learners to find a dependency that cannot be understood from a due date alone."
      },
      {
        kind: "question",
        title: "Poll: capacity is already full",
        question: {
          prompt: "Three cards are in Doing and an urgent new task arrives. What should the coordinator review before starting it?",
          options: ["Only the card colour", "Current work and an explicit priority trade-off", "How to hide a Doing card", "Whether to remove all due dates"],
          answerIndex: 1,
          explanation: "Review active work, available capacity and priorities. Finish, legitimately pause or agree a trade-off before pulling more work; moving labels alone does not create capacity."
        },
        notes: "Allow 3 minutes. Ask what information would make a priority trade-off defensible. Reinforce that a blocker must describe a real simulated obstacle, not a way to disguise overload."
      },
      {
        kind: "steps",
        title: "Test the lab's WIP rule",
        steps: [
          "Move three lab cards to Doing and try a fourth.",
          "Record a plausible blocker and its written reason.",
          "Complete at least two simulated tasks with stated acceptance assumptions.",
          "Transfer the owner and next-check habits to your own board."
        ],
        notes: "Allow 7 minutes. Give learners time to observe the rejected fourth card and practise a blocked move. Explain that the lab enforces a rule which their free-plan board must not be assumed to enforce automatically."
      },
      {
        kind: "content",
        title: "An honest snapshot names unfinished work",
        bullets: [
          "Done 7, Doing 3, Review 1, Blocked 2, Backlog 2: total 15.",
          "Seven outputs are accepted; eight tasks remain.",
          "T12 and T13 need the T09 draft and owned next checks.",
          "Card counts do not measure equal units of effort."
        ],
        notes: "Allow 6 minutes. Ask pairs to write a short request that would help release the blockers. Require them to name the owner, needed output and next-check date instead of saying the team should work faster."
      },
      {
        kind: "question",
        title: "Poll: what counts actually show",
        question: {
          prompt: "The board has seven accepted cards out of fifteen, with very different task sizes. Which conclusion is supported?",
          options: ["Nearly half the effort is complete", "The deadline is secure", "Seven outputs have been accepted", "Only small tasks remain"],
          answerIndex: 2,
          explanation: "The count supports seven accepted outputs. Different task sizes mean it cannot establish the fraction of total effort finished, the remaining effort or whether the deadline is secure."
        },
        notes: "Allow 3 minutes. Ask learners what evidence they would need to estimate remaining effort instead of counting cards. Keep the distinction between accepted outputs and effort-weighted progress explicit."
      },
      {
        kind: "steps",
        title: "Assess the bilingual-instructions request",
        steps: [
          "Estimate the added content and review at three hours.",
          "Identify unstarted optional work: map two hours, polish one hour.",
          "Record the proposed scope exchange and ask Priya for a simulated decision.",
          "Update T08 and T09: five plus four hours still totals nine.",
          "Move T10 to Review before pulling revised T08 into Doing."
        ],
        notes: "Allow 7 minutes. Have learners check both the arithmetic and whether the removed work is genuinely unstarted. Ask which acceptance criteria must change and which factual checks must remain."
      },
      {
        kind: "question",
        title: "Poll: new acceptance criteria",
        question: {
          prompt: "A card previously marked Done receives an approved new requirement. What must happen before the revised output is called complete?",
          options: ["Reopen the required work and check the new criteria", "Keep Done because the old output passed", "Delete the earlier acceptance evidence", "Rename the owner without changing the work"],
          answerIndex: 0,
          explanation: "The earlier evidence proves only the earlier scope. Preserve it, reopen the necessary work and obtain acceptance against the revised criteria."
        },
        notes: "Allow 4 minutes. Ask why approval of a change and acceptance of its output are different events. Invite a learner to describe the history they would retain."
      },
      {
        kind: "content",
        title: "A handover is not automatic closure",
        bullets: [
          "List accepted outputs with their actual evidence references.",
          "Name pending work, blockers, owners and dates separately.",
          "Retain the risk register and scope-decision history.",
          "State that the exercise planned a workshop rather than delivered one."
        ],
        notes: "Allow 6 minutes. Ask pairs to inspect one handover entry for evidence and one for a pending action. Clarify that the assignment pack can be complete while its fictional project still has transparently recorded future work."
      },
      {
        kind: "summary",
        title: "Make the next decision easier",
        bullets: [
          "Keep tasks small, owned and testable.",
          "Respect capacity and expose dependencies instead of hiding delays.",
          "Reconcile status and explain what is still required.",
          "Record approved trade-offs and hand over evidence, not confidence alone."
        ],
        notes: "Allow 5 minutes. Invite each learner to name one card they will improve before submission. End with a short explanation of a change they can support with the board's evidence."
      }
    ]
  },
  interview: {
    intro: "Use your fictional board to explain coordination habits: breaking down work, making responsibility visible, reporting delays and recording decisions. Describe the artefacts you actually prepared, and distinguish planning a workshop from delivering an event.",
    questions: [
      {
        question: "How do a task checklist and acceptance criteria differ?",
        type: "concept",
        answerGuide: [
          "Describe the checklist as the actions used to prepare the output.",
          "Describe acceptance criteria as observable conditions the output must satisfy.",
          "Use one practice card to show why completed drafting does not necessarily mean accepted work."
        ],
        tip: "Give a concrete completion test rather than saying the task must be good quality."
      },
      {
        question: "Why might a team limit work in progress even when many tasks are waiting?",
        type: "concept",
        answerGuide: [
          "Explain the purpose of focusing limited capacity on finishing current work.",
          "Describe how waiting reviews and blockers still consume attention.",
          "State whether the limit is a manual team policy or a verified tool restriction."
        ],
        tip: "Do not imply that changing a list automatically creates more capacity."
      },
      {
        question: "A task has two contributors and neither is updating its status. What would you do?",
        type: "scenario",
        answerGuide: [
          "Clarify the accountable owner while retaining the other person's contribution.",
          "Agree the next output, due date and reviewer with the people involved.",
          "Record the decision on the card and check progress at the agreed review point."
        ],
        tip: "Focus on making responsibility explicit rather than assigning blame."
      },
      {
        question: "A late request is approved but the removed optional work has already been done. How would you update the plan?",
        type: "scenario",
        answerGuide: [
          "Explain that completed work does not release future time.",
          "Re-estimate remaining effort and identify the effect on scope, dates or capacity.",
          "Seek a revised decision from the responsible reviewer and update the affected cards."
        ],
        tip: "Show the difference between original estimates and work that is still avoidable."
      },
      {
        question: "Walk me through the status update you would prepare from a small task board.",
        type: "practical",
        answerGuide: [
          "State the snapshot date and reconcile all task IDs across the lists.",
          "Separate accepted outputs from unfinished work and avoid effort claims based only on card counts.",
          "Identify the main blockers, dependency owners and next-check dates.",
          "Finish with a specific decision or input needed from the reader."
        ],
        tip: "Make the requested response clear enough for someone to act without another meeting."
      },
      {
        question: "How would you hand over a project board that still contains unfinished tasks?",
        type: "practical",
        answerGuide: [
          "Index accepted outputs with inspectable evidence references.",
          "List pending work, dependencies, next owners and dates separately.",
          "Include the risk register and approved change decisions.",
          "State which closure conditions remain unmet rather than calling the project complete."
        ],
        tip: "Be clear that an honest handover can happen before final project closure."
      },
      {
        question: "Tell me about a time you made a blocker easier for someone else to resolve.",
        type: "behavioural",
        answerGuide: [
          "Describe the fictional task and the specific missing input or decision.",
          "Explain how you identified the dependency owner and requested a dated next step.",
          "Show what changed on the board and what evidence supported the update.",
          "If the blocker remained open, explain how you kept it visible."
        ],
        tip: "A precise escalation is useful evidence even if you did not control the final response."
      },
      {
        question: "Describe how you handled feedback that changed an output's acceptance criteria.",
        type: "behavioural",
        answerGuide: [
          "State the original output and the reviewer's requested change.",
          "Describe the impact check and the recorded decision about scope or timing.",
          "Explain how you revised the card, preserved earlier evidence and sought another review.",
          "Report the actual practice result without claiming that the fictional event took place."
        ],
        tip: "Separate approval to do changed work from acceptance after that work is checked."
      }
    ]
  },
  glossary: [
    { term: "Backlog", definition: "The set of defined tasks not yet started, with enough information to decide what is ready to be pulled into active work." },
    { term: "Card", definition: "A record for one deliverable task, containing its owner, date, work steps, acceptance criteria and supporting references." },
    { term: "List", definition: "A board column with an agreed workflow meaning, such as Doing or Review, used consistently by the people maintaining the board." },
    { term: "Acceptance criteria", definition: "Observable conditions an output must satisfy before its responsible reviewer considers the task complete." },
    { term: "WIP limit", definition: "A limit on work in progress, such as three cards in Doing, used to manage capacity; it may be a manual policy rather than an automatic tool feature." },
    { term: "Dependency", definition: "An output, input or decision that another task needs before it can proceed, recorded using stable task IDs and responsible owners." },
    { term: "Blocker", definition: "An obstacle already preventing work from progressing, recorded with a reason, a responsible person and a dated next check." },
    { term: "Risk", definition: "A possible future problem that needs an owner, a planned response and review, even before it affects current work." },
    { term: "Scope trade-off", definition: "An explicit, approved exchange of included work to accommodate a change within stated time or capacity constraints." },
    { term: "Handover", definition: "A transfer of outputs, evidence, decisions and pending responsibilities that allows another person to continue the work without assuming everything is finished." }
  ]
};
