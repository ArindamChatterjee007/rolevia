export default {
  moduleId: "trello",
  summary: "Coordinate a fictional workshop launch pack from a fifteen-task backlog to an honest handover. Practise WIP limits, dependencies, evidence checks, risk reviews and late scope decisions before submitting a board with clear owners and explicit trade-offs.",
  sessions: [
    {
      id: "trello-lab-s1",
      week: 1,
      title: "Turn the workshop brief into fifteen deliverables",
      minutes: 90,
      scenario: [
        "Kiran Stationery is planning a fictional stock-records workshop for 30 November 2026. Your output is a review-ready launch pack, not an event delivered. Actual bookings, payments, invitations and attendee data collection are outside scope. Priya reviews the brief. Build in Trello free plan or the supplied task-board template, using fictional owners in descriptions rather than inviting real people.",
        "Expand each grouped seed row into three separate cards. IDs, deliverables, owners and dates correspond in the order shown. Give each card one accountable owner, a due date, a draft/check/review/evidence checklist and an observable acceptance test. Keep risks and decisions in a separate register, not extra deliverable cards. Preserve these fifteen IDs throughout the programme."
      ],
      dataset: {
        columns: ["Task IDs", "Deliverables in ID order", "Owners in ID order", "Due dates, November 2026", "Card count"],
        rows: [
          ["T01, T02, T03", "Scope brief; audience-needs note; draft cost limit", "Priya; Rohit; Meera", "3; 4; 5", "3"],
          ["T04, T05, T06", "Fictional venue comparison; session agenda; invitation draft", "Priya; Rohit; Meera", "7; 9; 11", "3"],
          ["T07, T08, T09", "Registration template; attendee instructions; workshop slide draft", "Priya; Rohit; Meera", "13; 18; 18", "3"],
          ["T10, T11, T12", "Expense-log template; facilitator run-sheet; materials quantity check", "Priya; Rohit; Meera", "19; 19; 20", "3"],
          ["T13, T14, T15", "Pack rehearsal notes; feedback-form draft; final launch-pack index", "Priya; Rohit; Meera", "22; 23; 25", "3"]
        ]
      },
      outcome: "A bounded workshop brief and fifteen distinct, owned deliverable cards with dates, checklists and testable completion conditions.",
      tasks: [
        {
          id: "trello-lab-s1-t1",
          type: "short",
          prompt: "Expand the grouped seed on your board. How many deliverable cards should there be, excluding risk and decision notes?",
          answer: { kind: "number", value: 15, tolerance: 0 },
          explanation: "Five seed groups x three cards each = fifteen cards, T01 to T15. The five grouped rows are not five deliverables. Risk and decision records stay outside this count so that the board remains traceable to its agreed scope."
        },
        {
          id: "trello-lab-s1-t2",
          type: "short",
          prompt: "What is the term for the observable condition an output must satisfy before it can be accepted as Done? Enter the term, not a checklist of drafting activities.",
          hint: "It is a completion test that a reviewer can apply to the output.",
          answer: { kind: "text", accepted: ["acceptance criterion", "acceptance criteria", "completion test"] },
          explanation: "An acceptance criterion describes what must be true of the finished output. For T08, checking date, place, arrival and help instructions is more testable than a checklist item that merely says Write instructions."
        },
        {
          id: "trello-lab-s1-t3",
          type: "case",
          prompt: "Priya asks for a plan that another coordinator could inspect without a meeting. Write the workshop-pack brief and build the fifteen cards. Explain the scope boundary, ownership and acceptance approach, using T08 as a worked card. Keep the future workshop date separate from evidence that the launch pack is ready.",
          rubric: [
            "States a review-ready launch pack, its audience, the proposed 30 November workshop date and explicit exclusions.",
            "Creates T01 to T15 once each with the seeded deliverables, owners and due dates.",
            "Gives every card a named reviewer, a practical checklist and an observable acceptance condition.",
            "Shows T08 as checked attendee instructions rather than a vague activity or an actual invitation sent.",
            "Keeps risk and decision records outside the fifteen-card count and uses fictional information only."
          ],
          minWords: 140
        },
        {
          id: "trello-lab-s1-t4",
          type: "proof",
          prompt: "Attach the brief and board export, restricted-access view or template file. Include an expanded T08 card showing its fields and acceptance test.",
          mustShow: "Fifteen individual task IDs with owners and dates, the launch-pack scope boundary, and an inspectable T08 checklist, reviewer and acceptance criterion."
        }
      ]
    },
    {
      id: "trello-lab-s2",
      week: 2,
      title: "Use WIP capacity without hiding unfinished work",
      minutes: 90,
      scenario: [
        "Open Respect the WIP limit. Its five-card simulation has Backlog, Doing, Blocked and Done, with a Doing limit of three. Reproduce the snapshot below by moving the first three cards to Doing. The practice titles refer only to simulated work; do not send invitations, make bookings or buy anything. Record the evidence behind a move rather than treating a button click as completed work.",
        "On your separate fifteen-card Trello free-plan board, add Review between Doing and Done and write a manual Doing limit of three. The simulation enforces its limit, but the free-plan board needs your own checks. Record predecessor IDs on dependent cards. T08 needs T04, T09 and T11 need T05, T13 needs T08/T09/T11, and T15 needs accepted T01 to T14."
      ],
      dataset: {
        columns: ["Simulation card", "Snapshot list", "Supplied practice evidence"],
        rows: [
          ["Confirm venue", "Doing", "Fictional venue comparison checked and accepted; evidence V01"],
          ["Send invitations", "Doing", "Practice invitation draft incomplete; nothing sent"],
          ["Prepare slides", "Doing", "Slide draft unfinished; acceptance pending"],
          ["Order catering", "Backlog", "Fictional quantity input missing; not ready to start"],
          ["Book photographer", "Backlog", "Practice comparison brief ready; no real booking permitted"]
        ]
      },
      outcome: "A tested WIP movement sequence and a fifteen-card board with explicit list rules, dependency references and a manual three-card Doing limit.",
      tasks: [
        {
          id: "trello-lab-s2-t1",
          type: "short",
          prompt: "With the first three simulation cards in Doing and a limit of three, how many Doing slots are available before anything legitimately leaves that list?",
          answer: { kind: "number", value: 0, tolerance: 0 },
          explanation: "Available Doing capacity is the limit minus the active count: 3 - 3 = 0 slots. A ready Backlog card cannot be pulled yet. Moving unfinished work elsewhere without a real reason would hide the problem rather than create capacity."
        },
        {
          id: "trello-lab-s2-t2",
          type: "short",
          prompt: "Which move sequence is supported by the supplied evidence and keeps Doing within its limit before starting the ready photographer-comparison practice card?",
          answer: {
            kind: "choice",
            options: ["Pull the new card as a fourth Doing item", "Record V01, move Confirm venue to Done, then pull the ready card", "Mark the unfinished slides Done to free a slot", "Mark any active card Blocked without a reason"],
            answerIndex: 1
          },
          explanation: "Confirm venue has accepted practice evidence, so it can legitimately leave Doing. The active count changes 3 - 1 + 1 = 3 after the new card is pulled. The other proposed moves either exceed the limit or misrepresent unfinished work."
        },
        {
          id: "trello-lab-s2-t3",
          type: "case",
          prompt: "A coordinator says moving an inconvenient card to Blocked always creates capacity. Write the board's working rules and demonstrate a legitimate movement sequence. Explain readiness, acceptance, real blockers and the difference between the simulation's enforced limit and your Trello board's manual policy. Update dependency fields on the fifteen-card board.",
          rubric: [
            "Defines Backlog, Doing, Review, Blocked and Done distinctly on the full board.",
            "Keeps Doing at three or fewer using the accepted V01 move, not an invented blocker or false completion.",
            "Requires a blocker reason, resolution owner and next-check date while keeping blocked obligations visible.",
            "Records the supplied predecessor IDs and checks readiness as well as available Doing slots.",
            "Explains that Trello free-plan WIP checks are manual and that all simulation actions remain fictional."
          ],
          minWords: 150
        },
        {
          id: "trello-lab-s2-t4",
          type: "proof",
          prompt: "Attach the simulation movement evidence and your fifteen-card board rules. Include a card showing owner, due date, predecessor and acceptance fields.",
          mustShow: "A legitimate 3-to-2-to-3 Doing sequence, the manual limit of three, five list definitions on the full board and stable dependency IDs."
        }
      ]
    },
    {
      id: "trello-lab-s3",
      week: 3,
      title: "Report the board rather than a hopeful percentage",
      minutes: 90,
      scenario: [
        "Use this fictional Kiran Stationery snapshot dated 16 November 2026. In the worked case, E01 to E07 support acceptance of T01 to T07. T12 lacks T09's activity details; T13 cannot rehearse the unfinished slides and also needs checked instructions and a run-sheet. Build a status view in Trello or the board template and keep the reason, owner and next check on each blocked card.",
        "Meera must update the T09 draft by 17 November; Priya then checks rehearsal readiness. Keep a separate risk register for possible venue-information changes, reviewer unavailability and printing estimates exceeding the cost limit. A risk is a possible future problem; the current missing slide details are already a blocker. Do not turn accepted-card counts into a claim about effort completed."
      ],
      dataset: {
        columns: ["List", "Task IDs", "Count"],
        rows: [
          ["Done", "T01 to T07", "7"],
          ["Doing", "T09, T10, T11", "3"],
          ["Review", "T08", "1"],
          ["Blocked", "T12, T13", "2"],
          ["Backlog", "T14, T15", "2"]
        ]
      },
      outcome: "A reconciled status report with named blocker actions and a separate owned risk register, without overstating accepted work.",
      tasks: [
        {
          id: "trello-lab-s3-t1",
          type: "short",
          prompt: "How many tasks remain unfinished in this snapshot? Count every list other than Done, including Review.",
          answer: { kind: "number", value: 8, tolerance: 0 },
          explanation: "Unfinished work is 3 Doing + 1 Review + 2 Blocked + 2 Backlog = 8 tasks. Add the 7 Done tasks to reconcile all 15. Waiting for review does not make T08 accepted."
        },
        {
          id: "trello-lab-s3-t2",
          type: "short",
          prompt: "What percentage of the fifteen cards is accepted as Done? Enter percentage points to two decimal places. Label this as a card share, not an effort measure.",
          answer: { kind: "number", value: 46.67, tolerance: 0.01 },
          explanation: "7 accepted cards / 15 total cards x 100 = 46.67% to two decimals. Different cards can require different amounts of work. This percentage reports accepted outputs only; no effort-weighted completion can be calculated from these counts."
        },
        {
          id: "trello-lab-s3-t3",
          type: "case",
          prompt: "Priya needs a concise status update and a decision request for tomorrow's review. Reconcile all lists, explain the T12/T13 blockers and name the missing input and owner. Add three risks with owners, responses and review dates. Correct a draft claim that the project has completed nearly half of its effort.",
          rubric: [
            "Reconciles 7 Done + 3 Doing + 1 Review + 2 Blocked + 2 Backlog = 15 and states eight unfinished tasks.",
            "Labels 46.67% as accepted-card share rather than effort completed.",
            "Names T12/T13, the T09 dependency and Meera's 17 November update, with Priya checking rehearsal readiness.",
            "Records three potential risks separately, each with an owner, response and review date.",
            "Makes a specific request for input or review and keeps pending outputs out of Done."
          ],
          minWords: 150
        },
        {
          id: "trello-lab-s3-t4",
          type: "proof",
          prompt: "Attach the dated board snapshot, status update and risk register. Show the blocker details on the affected cards, not only in your memo.",
          mustShow: "Fifteen reconciled cards, eight unfinished tasks, T12/T13 blocker owners and dates, and at least three owned risks outside the task-card count."
        }
      ]
    },
    {
      id: "trello-lab-s4",
      week: 4,
      title: "Make the late bilingual request an explicit scope exchange",
      minutes: 90,
      scenario: [
        "On 16 November, the fictional organiser requests bilingual attendee instructions. Priya approves adding three hours to T08, including language review, while removing its unstarted two-hour illustrated map and T09's unstarted one-hour visual polish. Checked text directions and factual slide checks remain required. The workshop date and total available effort are unchanged.",
        "Before the change, T08 is in Review and Doing contains T09, T10 and T11. T10's expense-log draft has now passed its draft checks, with fictional evidence E10, so it can move to Review. Make that legitimate move before returning T08 to Doing. Update descriptions, estimates and acceptance criteria on the existing cards; do not create a sixteenth deliverable."
      ],
      dataset: {
        columns: ["Task", "Original hours", "Added required hours", "Removed unstarted hours", "Required acceptance after change"],
        rows: [
          ["T08 Attendee instructions", "4", "3", "2", "Bilingual text, checked directions and language review"],
          ["T09 Workshop slide draft", "5", "0", "1", "Clear slides with factual checks; optional polish removed"]
        ]
      },
      outcome: "A dated approved change record and revised T08/T09 cards that preserve capacity, required checks and an honest acceptance state.",
      tasks: [
        {
          id: "trello-lab-s4-t1",
          type: "short",
          prompt: "Update the estimate on T08 using the agreed addition and removal. What is its revised total in person-hours?",
          answer: { kind: "number", value: 5, tolerance: 0.01 },
          explanation: "T08 changes from 4 hours to 4 + 3 - 2 = 5 hours. The two removed hours were unstarted optional work, so they are avoidable future effort. Required language review remains inside the added three hours."
        },
        {
          id: "trello-lab-s4-t2",
          type: "short",
          prompt: "Across T08 and T09 together, what is the net change in planned person-hours? Enter a signed number, with zero if the total is unchanged.",
          answer: { kind: "number", value: 0, tolerance: 0.01 },
          explanation: "The net change is +3 - 2 - 1 = 0 hours. T08 becomes 5 and T09 becomes 4, so their combined estimate is still 9 hours. An unchanged total does not mean unchanged scope or unchanged review needs."
        },
        {
          id: "trello-lab-s4-t3",
          type: "case",
          prompt: "A coordinator says the unchanged hour total means no board update is needed. Write the change decision and handover note, revise T08/T09 and explain the safe list-move sequence. State who approved what, which checks remain and why approval does not put the revised instructions in Done.",
          rubric: [
            "Records the request, Priya's 16 November approval and the +3 -2 -1 = 0 hour scope exchange.",
            "Updates T08 to five hours and T09 to four, removing only the specified unstarted optional work.",
            "Adds language-review acceptance to T08 while retaining checked directions and T09's factual checks.",
            "Moves evidenced T10 to Review before T08 returns to Doing, keeping Doing at three or fewer.",
            "Keeps revised work pending until accepted and names the affected owners and unchanged fifteen-card scope."
          ],
          minWords: 160
        },
        {
          id: "trello-lab-s4-t4",
          type: "proof",
          prompt: "Attach the before-and-after T08/T09 cards, approved change record and list-move evidence. Preserve the original estimates in the decision trail.",
          mustShow: "Original and revised scope, T08 at five hours, T09 at four, Priya's dated approval, E10 supporting the first move and no more than three Doing cards."
        }
      ]
    },
    {
      id: "trello-lab-s5",
      week: 5,
      title: "Clean an imported board with false completions",
      minutes: 105,
      scenario: [
        "Nila Learning Studio sends a new fictional five-output briefing-pack board, separate from the fifteen-card capstone. The import below contains a confirmed duplicate N03 and two unsupported Done labels. Estimates include drafting and review. Preserve the six raw import rows and build a corrected five-card board in Trello or the template.",
        "N04 needs accepted N02 and N03; N05 needs accepted N04. N03 is blocked because the room number is unknown. Priya must obtain the fictional room decision by 10:00 on 20 November 2026 before Meera can finish the instructions. Do not invent confirmation, count a duplicate as extra scope or move work to Done just to improve the headline."
      ],
      dataset: {
        columns: ["Import row", "Task ID", "Entered list", "Estimated hours", "Logged hours", "Evidence"],
        rows: [
          ["R01", "N01 Brief", "Done", "2", "2", "Brief checked and accepted; E31"],
          ["R02", "N02 Agenda", "Done", "3", "2", "Draft complete; review still missing"],
          ["R03", "N03 Instructions", "Blocked", "3", "1", "Room unknown; instructions unfinished"],
          ["R04", "N03 Instructions", "Backlog", "3", "0", "Confirmed duplicate of R03, not another output"],
          ["R05", "N04 Rehearsal", "Backlog", "2", "0", "Needs accepted agenda and instructions"],
          ["R06", "N05 Handover index", "Done", "2", "0", "No index exists; waiting for accepted rehearsal"]
        ]
      },
      outcome: "A corrected five-card board with deduplicated effort, evidence-supported status and an owned blocker-resolution request.",
      tasks: [
        {
          id: "trello-lab-s5-t1",
          type: "short",
          prompt: "After removing the confirmed duplicate from the working board, what is the total original estimated effort for the five distinct outputs, in person-hours?",
          answer: { kind: "number", value: 12, tolerance: 0.01 },
          explanation: "Count N03 only once: 2 + 3 + 3 + 2 + 2 = 12 person-hours. The raw six-row sum would be 15 because it includes the duplicated three-hour estimate. Logged work is a different measure and is not added to the original estimate."
        },
        {
          id: "trello-lab-s5-t2",
          type: "short",
          prompt: "After checking the supplied evidence, how many distinct outputs can remain in Done? A complete draft awaiting review is not yet accepted.",
          answer: { kind: "number", value: 1, tolerance: 0 },
          explanation: "Only N01 has accepted evidence E31. N02 belongs in Review, N03 stays Blocked, and N04/N05 remain in Backlog. One accepted output plus four unfinished outputs reconciles the corrected five-card scope."
        },
        {
          id: "trello-lab-s5-t3",
          type: "case",
          prompt: "The coordinator wants to merge only the duplicate title and leave both Done labels untouched. Write a corrective status note and repair the board. Explain the five-card count, effort total, two reopened statuses and predecessor rules. Give N03 a practical resolution request without pretending its blocker has already cleared.",
          rubric: [
            "Retains six raw rows but only N01 to N05 once each, with the duplicate decision logged.",
            "Keeps N01 Done, moves N02 to Review and N05 to Backlog, and leaves N03 Blocked and N04 Backlog.",
            "Reconciles the five-output original estimate to twelve hours without double-counting N03 or adding logged hours again.",
            "Keeps N04 dependent on accepted N02/N03 and N05 dependent on accepted N04.",
            "Names Priya's room-confirmation action by 10:00 on 20 November and keeps the resolution pending."
          ],
          minWords: 160
        },
        {
          id: "trello-lab-s5-t4",
          type: "proof",
          prompt: "Attach the raw import, corrected five-card board and correction log. Show the blocked card and its predecessor relationships clearly.",
          mustShow: "One accepted output, four unfinished outputs, twelve estimated hours, the retained duplicate audit and N03's named, dated blocker action."
        }
      ]
    },
    {
      id: "trello-lab-s6",
      week: 6,
      title: "Test whether a new request really fits the time available",
      minutes: 105,
      scenario: [
        "For a separate Nila Learning Studio pack, the table records remaining person-hours including review. The available team time before 20 November is nine hours. The coordinator requests two additional hours of bilingual notes within the slide task. Optional slide polish has not started and can be removed only with approval. Required accuracy, rehearsal and handover checks cannot simply be skipped.",
        "Create a small comparison beside the board rather than turning estimate rows into extra cards. Instructions and slides must be accepted before rehearsal; the handover follows accepted rehearsal. A Doing slot does not add person-hours or resolve a dependency. The nine-hour total also does not prove that each owner's calendar fits, so record that scheduling check as a condition of any plan."
      ],
      dataset: {
        columns: ["Item", "Hours", "Kind", "Owner or condition"],
        rows: [
          ["Instructions", "3", "Required remaining work", "Rohit"],
          ["Slides", "2", "Required remaining work", "Meera"],
          ["Rehearsal", "2", "Required remaining work", "Priya; after accepted instructions and slides"],
          ["Handover", "1", "Required remaining work", "Meera; after accepted rehearsal"],
          ["Slide visual polish", "2", "Unstarted optional work", "Meera; removal needs approval"],
          ["Bilingual notes request", "2", "Proposed additional work", "Meera; acceptance not yet agreed"],
          ["Available team time", "9", "Capacity, not work to add", "Before the 20 November deadline"]
        ]
      },
      outcome: "A checked capacity comparison and conditional scope decision that identifies any remaining hour gap without discarding required quality checks.",
      tasks: [
        {
          id: "trello-lab-s6-t1",
          type: "short",
          prompt: "If the bilingual request is accepted and all optional polish is removed, how many required person-hours remain? Do not add the capacity row as work.",
          answer: { kind: "number", value: 10, tolerance: 0.01 },
          explanation: "Original required work is 3 + 2 + 2 + 1 = 8 hours. Add the requested 2 hours to obtain 10. Optional polish is excluded from this scenario, and the 9-hour capacity row is a limit, not another task estimate."
        },
        {
          id: "trello-lab-s6-t2",
          type: "short",
          prompt: "After removing the optional polish but accepting the requested notes, how many person-hours above the available time would the plan still require?",
          answer: { kind: "number", value: 1, tolerance: 0.01 },
          explanation: "Required work after the change is 10 hours and available time is 9, leaving 10 - 9 = 1 hour unsupported. Removing two optional hours does not fully solve this plan because the original ten-hour plan already exceeded capacity by one."
        },
        {
          id: "trello-lab-s6-t3",
          type: "case",
          prompt: "The coordinator says the new request fits because two hours of polish can be removed. Write a decision memo comparing at least two options. Recommend a conditional path, quantify its remaining work and capacity gap, and name the approval and owner-calendar checks needed before updating the board. Preserve required quality and dependency checks.",
          rubric: [
            "Shows eight original required hours, ten with the request and a one-hour gap against nine available hours.",
            "Compares at least two explicit options, such as deferring the request with optional removal versus seeking approved time or a later deadline.",
            "Quantifies the recommended option and requests scope or capacity approval instead of assuming it exists.",
            "Retains required review, rehearsal and handover work in the dependency sequence.",
            "Names who checks each owner's schedule and records the decision date, affected task and unresolved conditions."
          ],
          minWords: 170
        },
        {
          id: "trello-lab-s6-t4",
          type: "proof",
          prompt: "Attach the option comparison and proposed board update, with an explicit pending decision state wherever approval is not supplied.",
          mustShow: "The eight-hour baseline, ten-hour requested scope, nine-hour capacity, one-hour gap and a conditional decision retaining owners, dependencies and acceptance checks."
        }
      ]
    },
    {
      id: "trello-lab-s7",
      week: 7,
      title: "Turn an occurred risk into an owned blocker",
      minutes: 105,
      scenario: [
        "Return to Kiran Stationery's fifteen-card board after the bilingual change. The table is the starting snapshot on 19 November 2026. T10 has now been accepted with E10; E01 to E07 remain accepted. T08 and T09 are overdue against their original 18 November dates. Keep those dates visible rather than silently resetting them.",
        "The agreed venue's room allocation changes, but the new room number is unknown. The venue choice itself is unchanged, so T04's accepted comparison remains valid. T08's unfinished arrival instructions are now genuinely blocked. Move T08 from Doing to Blocked and ask Priya for confirmation by 10:00 on 20 November. T12/T13 retain their existing blockers; Rohit must recheck T11's run-sheet against the eventual room details."
      ],
      dataset: {
        columns: ["Starting list", "Task IDs", "Count", "Evidence or pending work"],
        rows: [
          ["Done", "T01 to T07, T10", "8", "E01 to E07 and E10 accepted in this practice snapshot"],
          ["Doing", "T08, T09", "2", "Instructions and slides unfinished; original due date 18 November"],
          ["Review", "T11", "1", "Run-sheet awaiting acceptance"],
          ["Blocked", "T12, T13", "2", "Materials and rehearsal still need the relevant accepted drafts"],
          ["Backlog", "T14, T15", "2", "Feedback draft and final index not accepted"]
        ]
      },
      outcome: "An updated blocker record and handover that preserve overdue dates, distinguish occurred risks from potential risks and keep unfinished work visible.",
      tasks: [
        {
          id: "trello-lab-s7-t1",
          type: "short",
          prompt: "Move T08 to Blocked for the missing room number, without moving any other card. How many cards are now Blocked?",
          answer: { kind: "number", value: 3, tolerance: 0 },
          explanation: "T12 and T13 were already Blocked. Adding T08 gives 2 + 1 = 3 blocked cards. Doing falls from two to one, but the team still owns the same fifteen deliverables. A real blocker changes status, not scope."
        },
        {
          id: "trello-lab-s7-t2",
          type: "short",
          prompt: "After that move, how many of the fifteen deliverables remain unfinished? Count everything outside Done, even when a Doing slot has become free.",
          answer: { kind: "number", value: 7, tolerance: 0 },
          explanation: "Fifteen total minus eight accepted = seven unfinished. The updated lists also give 1 Doing + 1 Review + 3 Blocked + 2 Backlog = 7. Moving T08 into Blocked creates neither a completed output nor permission to close T15."
        },
        {
          id: "trello-lab-s7-t3",
          type: "case",
          prompt: "A draft handover calls the launch pack ready because only one card remains in Doing. Replace it with an honest escalation and handover. Explain the room issue, original overdue dates, T11's review needs and T15's unmet prerequisites. Propose new check dates without presenting them as approved deadline changes.",
          rubric: [
            "Reconciles the updated board as eight Done, one Doing, one Review, three Blocked and two Backlog.",
            "Records the room risk as an actual T08 blocker with Priya's 20 November, 10:00 confirmation request.",
            "Retains T08/T09's original 18 November due dates and labels any proposed revised dates as pending approval.",
            "Assigns Rohit a T11 recheck and keeps T12/T13 dependencies and T15's required acceptance gate visible.",
            "States seven unfinished tasks and refuses to equate a low Doing count with project readiness."
          ],
          minWords: 170
        },
        {
          id: "trello-lab-s7-t4",
          type: "proof",
          prompt: "Attach the updated fifteen-card board, room-risk history and handover index. Show both completed outputs and pending work with their next owners.",
          mustShow: "T08's real blocker and dated owner, three Blocked cards, seven unfinished tasks, preserved overdue dates and an unaccepted T15 final index."
        }
      ]
    },
    {
      id: "trello-lab-s8",
      week: 8,
      title: "Submit the workshop board, risks and late-change response",
      minutes: 120,
      scenario: [
        "Submit the Kiran Stationery fictional workshop launch pack with exactly T01 to T15, using the owners and dates established in week 1. Include each card's deliverable, reviewer, checklist, acceptance criterion, predecessor IDs and evidence state. The scope remains planning for the proposed 30 November workshop, not delivery of an actual event. The five-card simulation and Nila exercises are not substitutes for this capstone.",
        "Use the reference snapshot below for the fixed short-answer checks. In your submission, claim Done only for outputs with inspectable acceptance evidence; if your board differs, report its actual state and explain the difference. Keep at least three owned risks with responses and review dates, a reconciled status update, the bilingual change decision and the later room-blocker response.",
        "The late change adds three hours to T08 and removes two unstarted map hours from T08 and one polish hour from T09. Preserve the approved 16 November decision and revised acceptance tests. The room confirmation and overdue work remain open in the reference snapshot. Submit a handover index that identifies both accepted and pending outputs, next owners and the conditions preventing T15 from closing."
      ],
      dataset: {
        columns: ["Reference list at 19 November", "Task IDs", "Count", "Meaning"],
        rows: [
          ["Done", "T01 to T07, T10", "8", "Accepted practice outputs"],
          ["Doing", "T09", "1", "Slide work still active"],
          ["Review", "T11", "1", "Run-sheet acceptance pending"],
          ["Blocked", "T08, T12, T13", "3", "Room and draft dependencies unresolved"],
          ["Backlog", "T14, T15", "2", "Required outputs not yet accepted"]
        ]
      },
      outcome: "A review-ready fifteen-task capstone board with clear owners, risks, an evidenced late-change response and an honest handover of completed and pending work.",
      tasks: [
        {
          id: "trello-lab-s8-t1",
          type: "short",
          prompt: "For the reference snapshot, what percentage of all fifteen cards is accepted? Enter percentage points to two decimal places and label the result as accepted-card share.",
          answer: { kind: "number", value: 53.33, tolerance: 0.01 },
          explanation: "Eight accepted cards / fifteen total cards x 100 = 53.33% to two decimals. Seven cards remain unfinished. This measures accepted-card share, not effort completed, delivery readiness or whether the future workshop has happened."
        },
        {
          id: "trello-lab-s8-t2",
          type: "short",
          prompt: "How many reference cards are waiting in Review or Blocked combined, excluding both active Doing and unstarted Backlog?",
          answer: { kind: "number", value: 4, tolerance: 0 },
          explanation: "Review contains T11, one card, and Blocked contains T08, T12 and T13, three cards. Waiting in these two lists totals 1 + 3 = 4. They remain obligations even though only one card occupies Doing."
        },
        {
          id: "trello-lab-s8-t3",
          type: "case",
          prompt: "Submit a coordinator's handover for Rolevia review. Explain the fifteen-task plan, current evidence-backed status, main risks and dependency constraints. Argue how the bilingual request was handled within the effort limit, describe the room-blocker response and state what must happen before the pack can close. Distinguish proposed dates, approved decisions and accepted outputs.",
          rubric: [
            "Accounts for fifteen unique deliverables with owners, dates, checklists, reviewers, acceptance conditions and predecessor IDs.",
            "Includes at least three risks with owners, responses and review dates, plus an owned response to the occurred room issue.",
            "Shows +3 -2 -1 = 0 hours, T08 at five and T09 at four, with approval, revised checks and a WIP-safe move sequence.",
            "Reconciles a dated evidence-backed board, separates accepted from pending work and avoids treating card counts as effort.",
            "Names next owners and checks for unfinished work, preserves overdue dates and keeps T15 pending until required outputs are accepted."
          ],
          minWords: 220
        },
        {
          id: "trello-lab-s8-t4",
          type: "proof",
          prompt: "Attach the complete board export, restricted-access Trello view or template pack with a reader's index. Include the brief, risk list, status update, late-change record and handover evidence.",
          mustShow: "Fifteen detailed cards with owners and dependencies; WIP rules; at least three owned risks; the approved bilingual scope trade-off; the room-blocker response; and a handover separating accepted outputs from pending work."
        }
      ]
    }
  ]
};
