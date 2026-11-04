export default {
  moduleId: "budgeting",
  summary: "Build a fictional service budget from a checked cost map to pricing, whole-unit break-even and monthly scenarios. Test cash timing, messy inputs and actual-versus-plan differences before submitting a formula-linked model and a conditional management memo.",
  sessions: [
    {
      id: "budgeting-lab-s1",
      week: 1,
      title: "Define the service unit and classify its costs",
      minutes: 75,
      scenario: [
        "Meera Print Services is a fictional business preparing workshop packs. One unit is one completed pack-preparation service. Model November 2026 in INR at 70 planned packs, within a zero-to-90-pack activity range. The supplied fixed costs apply to that month and range; variable costs apply to each completed pack. Build a Costs tab and source-labelled numeric inputs in Google Sheets or Microsoft Excel.",
        "Open Price to break even in Rolevia Sheets, also openable in Google Sheets. Its compact practice sheet is labelled Meera Foods snack packs, a separate fictional case using identical numbers. Rehearse formulas there, but label your service workbook Meera Print Services. Lab inputs are price B1 = 500, variable cost B2 = 270, fixed costs B3 = 12000 and planned packs B5 = 70. Do not confuse this layout with the course's multi-tab Inputs sheet."
      ],
      dataset: {
        columns: ["Item", "Amount", "Classification", "Unit", "Fictional source"],
        rows: [
          ["Workspace", "6000", "Fixed cost", "INR per month", "B1 workspace note"],
          ["Administration support", "4000", "Fixed cost", "INR per month", "B1 support note"],
          ["Utilities allowance", "2000", "Fixed cost", "INR per month", "B1 utilities note"],
          ["Materials", "180", "Variable cost", "INR per completed pack", "B1 materials note"],
          ["Delivery", "60", "Variable cost", "INR per completed pack", "B1 delivery note"],
          ["Handling", "30", "Variable cost", "INR per completed pack", "B1 handling note"],
          ["Service price", "500", "Price input", "INR per completed pack", "B1 price assumption"],
          ["Planned volume", "70", "Volume input", "Completed packs in November", "B1 demand assumption"]
        ]
      },
      outcome: "A checked service cost map with consistent units and traceable fixed and variable inputs for the monthly model.",
      tasks: [
        {
          id: "budgeting-lab-s1-t1",
          type: "short",
          prompt: "Sum the fixed cost lines in your Costs tab. What monthly fixed-cost total in INR should reconcile to the compact lab's B3 input?",
          answer: { kind: "number", value: 12000, tolerance: 0.5 },
          explanation: "Workspace 6,000 + administration support 4,000 + utilities allowance 2,000 = INR 12,000 per month. These are monthly costs within the stated activity range, not charges to multiply by every pack."
        },
        {
          id: "budgeting-lab-s1-t2",
          type: "short",
          prompt: "Sum only the per-pack variable cost lines. What variable cost in INR per completed pack should reconcile to the compact lab's B2 input?",
          answer: { kind: "number", value: 270, tolerance: 0.5 },
          explanation: "Materials 180 + delivery 60 + handling 30 = INR 270 per completed pack. At 70 packs those variable costs would total 70 x 270 = INR 18,900. Do not include monthly fixed costs or the selling price in this per-pack total."
        },
        {
          id: "budgeting-lab-s1-t3",
          type: "case",
          prompt: "Meera asks for a cost map she can review before discussing price. Build it and write an assumptions note. Explain the unit and month, why fixed costs must not be charged per pack, what changes beyond 90 packs would need checking and why a sale does not prove that payment has arrived. State the model's exclusions.",
          rubric: [
            "Defines one completed pack-preparation service, November 2026 and INR consistently.",
            "Reconciles fixed costs to INR 12,000 per month and variable costs to INR 270 per pack with source labels.",
            "Keeps price and volume separate from costs, with numeric inputs rather than currency text in calculation cells.",
            "States the zero-to-90-pack range and excludes tax, finance charges, equipment purchases and owner pay.",
            "Distinguishes delivered-service revenue from cash receipts and identifies assumptions needing review before expansion."
          ],
          minWords: 130
        },
        {
          id: "budgeting-lab-s1-t4",
          type: "proof",
          prompt: "Attach the Costs and Inputs views with your assumptions note. Include the compact lab input labels if you use it for the formula rehearsal.",
          mustShow: "Six cost lines with sources and units, fixed costs of INR 12,000, variable costs of INR 270 per pack, price 500, planned volume 70 and the stated activity range."
        }
      ]
    },
    {
      id: "budgeting-lab-s2",
      week: 2,
      title: "Price one pack and test both sides of break-even",
      minutes: 90,
      scenario: [
        "Use Meera Print Services' base price and costs to build unit economics. In the compact Rolevia Sheets lab, enter =B1-B2 in B4 and =ROUNDUP(B3/B4,0) in B6. Keep the supplied inputs B1 = 500, B2 = 270, B3 = 12000 and B5 = 70 unchanged. The service is sold in whole packs, so the break-even threshold must cover fixed costs without rounding down.",
        "Run the additional test rows below in a separate Google Sheets or Microsoft Excel copy; the in-browser lab's source inputs are locked. In the test copy, guard the division when contribution is zero or negative and report No finite break-even. Save expected and observed results, then retain the base assumptions separately from your experiments. The model does not establish what customers will pay."
      ],
      dataset: {
        columns: ["Test case", "Price, INR", "Variable cost, INR", "Fixed costs, INR", "Packs"],
        rows: [
          ["Base", "500", "270", "12000", "70"],
          ["Below the whole-pack threshold", "500", "270", "12000", "52"],
          ["At the whole-pack threshold", "500", "270", "12000", "53"],
          ["Zero contribution", "270", "270", "12000", "70"],
          ["Negative contribution", "250", "270", "12000", "70"]
        ]
      },
      outcome: "A linked unit-economics sheet with contribution, whole-pack break-even and documented boundary and non-positive-contribution tests.",
      tasks: [
        {
          id: "budgeting-lab-s2-t1",
          type: "short",
          prompt: "Enter the contribution formula in B4 using the base inputs. What is contribution in INR per pack, before monthly fixed costs?",
          answer: { kind: "number", value: 230, tolerance: 0.5 },
          explanation: "Contribution per pack is price less variable cost: INR 500 - INR 270 = INR 230. Monthly operating profit requires multiplying this contribution by completed packs and subtracting the month's fixed costs once."
        },
        {
          id: "budgeting-lab-s2-t2",
          type: "short",
          prompt: "Use the base inputs to calculate the minimum whole number of packs that covers the modelled monthly fixed costs. Enter the rounded-up quantity from B6.",
          answer: { kind: "number", value: 53, tolerance: 0 },
          explanation: "12,000 / 230 = about 52.17 packs, so round upward to 53. Check both sides: 52 x 230 - 12,000 = INR -40; 53 x 230 - 12,000 = INR 190. Fifty-two packs leave some fixed costs uncovered."
        },
        {
          id: "budgeting-lab-s2-t3",
          type: "case",
          prompt: "Meera's draft rounds break-even down to 52 packs and claims a positive per-pack contribution means the month is profitable. Write a correction note with your formula tests. Explain the 52/53 boundary and what the zero- and negative-contribution rows should report. Keep pricing assumptions separate from evidence of demand.",
          rubric: [
            "Calculates contribution as 500 - 270 = INR 230 and distinguishes it from monthly operating profit.",
            "Shows 12,000 / 230 and rounds up to 53 whole packs, not down to 52.",
            "Checks operating results of INR -40 at 52 packs and INR 190 at 53 packs.",
            "Uses a non-positive-contribution guard and explains why positive fixed costs have no finite break-even in those tests.",
            "Retains expected and observed formula results, original inputs and the limitation that price acceptance is untested."
          ],
          minWords: 140
        },
        {
          id: "budgeting-lab-s2-t4",
          type: "proof",
          prompt: "Attach the unit-economics formula view and test log. Include the separate test copy so changed test inputs cannot be mistaken for the submitted base case.",
          mustShow: "Linked contribution and ROUNDUP formulas, the 53-pack threshold, 52/53 boundary results and guarded zero/negative-contribution tests."
        }
      ]
    },
    {
      id: "budgeting-lab-s3",
      week: 3,
      title: "Build comparable monthly demand scenarios",
      minutes: 90,
      scenario: [
        "Build base, lower and higher monthly service scenarios in Google Sheets or Microsoft Excel. Hold price, unit variable cost and fixed costs constant so only volume changes. Link the shared inputs with fixed references when copying formulas. Revenue is price times packs; contribution is revenue less variable costs; operating result is contribution less fixed costs.",
        "The separate compact lab downside starts from 70 planned packs and retains 80 per cent after a 20 per cent demand fall. Use B7 =B1*B5 for base revenue, B8 =B5*B4-B3 for the base result, B9 =B5*80% for downside packs and B10 =B9*B4-B3 for its result. Do not overwrite B5 or relabel the 50-pack lower case as the same test."
      ],
      dataset: {
        columns: ["Scenario", "Volume input", "Price, INR", "Variable cost, INR", "Fixed costs, INR", "Volume rule"],
        rows: [
          ["Base", "70", "500", "270", "12000", "Use all 70 packs"],
          ["Lower", "50", "500", "270", "12000", "Use all 50 packs"],
          ["Higher", "90", "500", "270", "12000", "Use all 90 packs"],
          ["Separate lab downside", "70", "500", "270", "12000", "20% fall; retain 80% of these starting packs"]
        ]
      },
      outcome: "A linked three-scenario monthly budget and a separately labelled 20 per cent downside test with independently checked results.",
      tasks: [
        {
          id: "budgeting-lab-s3-t1",
          type: "short",
          prompt: "Calculate the lower scenario's monthly operating result in INR. Enter a negative number for a loss and subtract fixed costs only once.",
          answer: { kind: "number", value: -500, tolerance: 0.5 },
          explanation: "At 50 packs, revenue is 50 x 500 = 25,000 and variable costs are 50 x 270 = 13,500. Contribution is 11,500; less fixed costs 12,000 gives INR -500. Positive unit contribution does not by itself cover monthly fixed costs."
        },
        {
          id: "budgeting-lab-s3-t2",
          type: "short",
          prompt: "Complete B9 and B10 for the separate 20 per cent demand fall from 70 planned packs. What operating result in INR should B10 show?",
          answer: { kind: "number", value: 880, tolerance: 0.5 },
          explanation: "A 20% fall retains 70 x 0.8 = 56 packs. Contribution is 56 x (500 - 270) = INR 12,880. Subtract 12,000 fixed costs to get INR 880. The 50-pack case is a different assumption and returns a different result."
        },
        {
          id: "budgeting-lab-s3-t3",
          type: "case",
          prompt: "Meera asks which demand assumptions would fail to cover costs. Write a scenario comparison and correct a draft that labels 50 packs as the 20 per cent downside. Explain the base, lower and higher results, the separate lab test and one assumption that would invalidate a simple volume-only comparison.",
          rubric: [
            "Shows operating results of INR 4,100 at 70 packs, INR -500 at 50 and INR 8,700 at 90.",
            "Uses shared price 500, variable cost 270 and fixed costs 12,000 with correctly locked formula references.",
            "Separates 56 packs and INR 880 under the 20 per cent lab fall from the named 50-pack lower scenario.",
            "Relates the 50-pack loss to the unchanged 53-pack whole-unit threshold.",
            "Names a cost or capacity assumption that needs review and does not treat scenario labels as demand probabilities."
          ],
          minWords: 150
        },
        {
          id: "budgeting-lab-s3-t4",
          type: "proof",
          prompt: "Attach the linked scenario budget and compact lab result view. Show formulas, shared inputs and the separate labels for the two downside assumptions.",
          mustShow: "70/50/90-pack scenarios with results 4100/-500/8700, plus B9 at 56 and B10 at 880 without overwriting the 70-pack base input."
        }
      ]
    },
    {
      id: "budgeting-lab-s4",
      week: 4,
      title: "Find the funding gap before the month ends",
      minutes: 90,
      scenario: [
        "Return to Meera Print Services' base 70-pack November model: price INR 500, unit variable cost INR 270 and fixed costs INR 12,000. All packs are delivered in November, but only 60 per cent of their sales value is collected then; the rest is due in December. Build a separate Cash tab in Google Sheets or Microsoft Excel rather than treating the compact lab's operating result as a cash balance.",
        "Use the weekly schedule below. Week 1 starts with INR 4,000 and its fixed-cost payment precedes any receipt. In weeks 2 to 4, each receipt arrives before that week's variable-cost payment. Carry each closing balance into the next opening balance. Negative balances show an unfunded plan, not permission to overdraw. There are no other receipts, payments or approved financing flows."
      ],
      dataset: {
        columns: ["Week", "Opening cash rule", "Receipts, INR", "Payments, INR", "Within-week timing"],
        rows: [
          ["1", "4000", "0", "12000", "Payment before any receipt"],
          ["2", "Carry prior closing balance", "7000", "6300", "Receipt before payment"],
          ["3", "Carry prior closing balance", "7000", "6300", "Receipt before payment"],
          ["4", "Carry prior closing balance", "7000", "6300", "Receipt before payment"]
        ]
      },
      outcome: "A carried-forward weekly cash schedule identifying the peak funding need separately from month-end cash and operating profit.",
      tasks: [
        {
          id: "budgeting-lab-s4-t1",
          type: "short",
          prompt: "Calculate the weekly balances and inspect the stated payment order. What is the largest unfunded cash shortfall in INR? Enter its positive size, not a negative balance.",
          answer: { kind: "number", value: 8000, tolerance: 0.5 },
          explanation: "Week 1 closes at 4,000 + 0 - 12,000 = INR -8,000. Each later week adds 7,000 - 6,300 = 700, so balances improve to -7,300, -6,600 and -5,900. Under the stated within-week order, the largest shortfall is INR 8,000."
        },
        {
          id: "budgeting-lab-s4-t2",
          type: "short",
          prompt: "What is the unfunded month-end cash balance in INR after all four weeks? Enter a signed value and do not add an assumed loan.",
          answer: { kind: "number", value: -5900, tolerance: 0.5 },
          explanation: "Receipts total 3 x 7,000 = 21,000. Payments total 12,000 + 3 x 6,300 = 30,900. Opening 4,000 + receipts 21,000 - payments 30,900 = INR -5,900. This closing gap is smaller than the earlier INR 8,000 funding need."
        },
        {
          id: "budgeting-lab-s4-t3",
          type: "case",
          prompt: "Meera's memo says the INR 4,100 operating profit can pay the first bill and requests only the month-end shortfall. Write a corrected funding-review request. Explain revenue, receipts, payments and the peak gap, state the timing assumptions and propose a decision needed before week 1 without inventing funding or earlier collections.",
          rubric: [
            "Reconciles INR 35,000 revenue to INR 21,000 November receipts and INR 14,000 due in December.",
            "Shows INR 30,900 payments and carried balances of -8000, -7300, -6600 and -5900.",
            "Identifies INR 8,000 needed before the first payment, distinct from the INR 5,900 month-end shortfall.",
            "Explains why INR 4,100 operating profit is not an available cash receipt or approved funding source.",
            "Requests a funding or payment-timing decision before week 1 and states receipt-order assumptions without fabricating approval."
          ],
          minWords: 160
        },
        {
          id: "budgeting-lab-s4-t4",
          type: "proof",
          prompt: "Attach the Cash tab with formulas and the corrected funding-review memo. Keep any proposed financing outside the unfunded base schedule.",
          mustShow: "Opening cash of 4000, carried weekly balances, receipts of 21000, payments of 30900, the 8000 peak shortfall and a separately labelled operating result."
        }
      ]
    },
    {
      id: "budgeting-lab-s5",
      week: 5,
      title: "Audit a duplicated cost line in a new estimate",
      minutes: 105,
      scenario: [
        "Meera Print Services prepares a separate fictional December estimate, case B2. Do not overwrite November case B1. The import contains a confirmed repeated materials source M01. Each amount is numeric, but the units differ. Preserve the raw import and build a cleaned cost map, input sheet and estimate in Google Sheets or Microsoft Excel.",
        "The proposed service price is INR 520 and planned demand is 60 completed packs. The new cost assumptions apply from zero to 90 packs and retain the original exclusions. The coordinator has counted both materials rows, making contribution appear much smaller. Correct only the confirmed duplicate; different cost lines are not duplicates merely because both are variable. The price and demand are planning assumptions, not approved orders."
      ],
      dataset: {
        columns: ["Source ID", "Item", "Amount", "Unit", "Source status"],
        rows: [
          ["F01", "Workspace", "6500", "INR per month", "Verified fictional cost note"],
          ["F02", "Administration support", "4000", "INR per month", "Verified fictional cost note"],
          ["F03", "Utilities allowance", "2500", "INR per month", "Verified fictional cost note"],
          ["M01", "Materials", "190", "INR per completed pack", "Original fictional materials note"],
          ["M01", "Materials", "190", "INR per completed pack", "Confirmed repeat of the same source, not an extra charge"],
          ["V02", "Delivery", "65", "INR per completed pack", "Separate fictional delivery cost"],
          ["V03", "Handling", "35", "INR per completed pack", "Separate fictional handling cost"],
          ["P01", "Proposed price", "520", "INR per completed pack", "Unapproved planning price"],
          ["Q01", "Planned volume", "60", "Completed packs in December", "Demand assumption"]
        ]
      },
      outcome: "A source-backed corrected December estimate with deduplicated unit costs, checked break-even and a clear distinction from the original budget.",
      tasks: [
        {
          id: "budgeting-lab-s5-t1",
          type: "short",
          prompt: "After excluding the confirmed repeated M01 from the working cost map, what is the variable cost in INR per completed pack?",
          answer: { kind: "number", value: 290, tolerance: 0.5 },
          explanation: "Count materials once: 190 + delivery 65 + handling 35 = INR 290 per pack. Counting M01 twice would give INR 480 and understate contribution. The three monthly costs belong in the fixed-cost total instead."
        },
        {
          id: "budgeting-lab-s5-t2",
          type: "short",
          prompt: "Using the cleaned December costs and proposed price, what is the minimum whole-pack break-even quantity? Calculate it in your separate estimate, not the locked base lab.",
          answer: { kind: "number", value: 57, tolerance: 0 },
          explanation: "Fixed costs are 6,500 + 4,000 + 2,500 = INR 13,000. Contribution is 520 - 290 = INR 230. Break-even is 13,000 / 230 = about 56.52, rounded up to 57 packs. At 56 packs the result is -120; at 57 it is 110, both INR."
        },
        {
          id: "budgeting-lab-s5-t3",
          type: "case",
          prompt: "Write a cost-audit memo and revised December estimate for Meera. Explain the duplicate evidence, corrected fixed and unit costs, break-even and the 60-pack result. Preserve the original import and show how the correction flows through formulas. State which commercial assumptions still need review before the estimate can be used as a plan.",
          rubric: [
            "Retains the raw repeated M01 rows and records why only one enters the working model.",
            "Reconciles fixed costs to INR 13,000 and variable costs to INR 290 without mixing monthly and per-pack units.",
            "Shows INR 230 contribution, 57 whole packs at break-even and 60 x 230 - 13,000 = INR 800 operating profit.",
            "Uses linked formulas and an old/new/source/date correction trail rather than typing corrected results over the model.",
            "Labels December separately and states unapproved price, untested demand, capacity range and excluded costs."
          ],
          minWords: 160
        },
        {
          id: "budgeting-lab-s5-t4",
          type: "proof",
          prompt: "Attach the raw and cleaned cost views, corrected estimate and audit memo. Keep November's original assumptions unchanged.",
          mustShow: "The M01 duplicate trail, INR 13,000 fixed and INR 290 variable inputs, formula-linked contribution, 57-pack break-even and the INR 800 result at 60 packs."
        }
      ]
    },
    {
      id: "budgeting-lab-s6",
      week: 6,
      title: "Evaluate a discount request beyond the original capacity range",
      minutes: 105,
      scenario: [
        "Meera Print Services receives a fictional bulk request from Kiran Stationery. Keep this option review separate from the November base budget. The price would fall to INR 450. Ninety packs fit the existing cost range, but 110 packs require an additional INR 3,000 of fixed support cost. The expanded estimate assumes the same unit cost applies up to 120 packs; that assumption and the extra capacity are not yet approved.",
        "Build the three options in a Google Sheets or Microsoft Excel copy, linking each row to its stated cost regime. Do not extend the original zero-to-90-pack model unchanged to 110 packs. No revised collection terms or payment schedule are supplied. A higher operating result alone therefore does not establish funding, demand or delivery feasibility."
      ],
      dataset: {
        columns: ["Option", "Price, INR", "Completed packs", "Variable cost, INR", "Fixed costs, INR", "Capacity ceiling, packs"],
        rows: [
          ["Original base", "500", "70", "270", "12000", "90"],
          ["Discount within existing capacity", "450", "90", "270", "12000", "90"],
          ["Expanded discount request, conditional", "450", "110", "270", "15000", "120"]
        ]
      },
      outcome: "A conditional pricing and capacity comparison that quantifies the incremental result while identifying unapproved cost and cash assumptions.",
      tasks: [
        {
          id: "budgeting-lab-s6-t1",
          type: "short",
          prompt: "Model the 90-pack discounted option at INR 450. What monthly operating result in INR does it produce under the existing capacity costs?",
          answer: { kind: "number", value: 4200, tolerance: 0.5 },
          explanation: "Discounted contribution is 450 - 270 = INR 180 per pack. At 90 packs the result is 90 x 180 - 12,000 = 16,200 - 12,000 = INR 4,200. Selling twenty more packs than base raises profit by only INR 100 because the unit price is lower."
        },
        {
          id: "budgeting-lab-s6-t2",
          type: "short",
          prompt: "Using its additional fixed cost, how much more operating profit would the conditional 110-pack option produce than the 90-pack discounted option? Enter the increase in INR.",
          answer: { kind: "number", value: 600, tolerance: 0.5 },
          explanation: "The expanded result is 110 x (450 - 270) - 15,000 = INR 4,800. Compared with INR 4,200 at 90 packs, the increase is 4,800 - 4,200 = INR 600. Ignoring the extra fixed cost would overstate the expanded result by INR 3,000."
        },
        {
          id: "budgeting-lab-s6-t3",
          type: "case",
          prompt: "Meera wants to accept 110 packs because the result is highest. Write a conditional option recommendation comparing the base, 90-pack discount and expanded request. Explain the extra cost, capacity boundary and modest incremental benefit. Request the missing operational and cash evidence rather than inventing terms or treating the extra support as already approved.",
          rubric: [
            "Shows base profit INR 4,100, the 90-pack discounted result INR 4,200 and the conditional expanded result INR 4,800.",
            "Reconciles the expanded option's INR 600 increase after the additional INR 3,000 fixed cost.",
            "Distinguishes the original 90-pack capacity from the conditional 120-pack cost regime and requests verification.",
            "States that collection terms and payment timing are missing, so operating profit cannot establish cash readiness.",
            "Makes a conditional recommendation with named review responsibilities rather than assuming demand, capacity or approval."
          ],
          minWords: 170
        },
        {
          id: "budgeting-lab-s6-t4",
          type: "proof",
          prompt: "Attach the linked option comparison and decision memo. Show the expanded cost regime and missing-information questions beside the results.",
          mustShow: "Three separate costed options, INR 4,200 and INR 4,800 discounted results, the INR 600 increment and explicit capacity, approval and cash-timing conditions."
        }
      ]
    },
    {
      id: "budgeting-lab-s7",
      week: 7,
      title: "Explain an adverse variance without inventing its cause",
      minutes: 105,
      scenario: [
        "Return to Meera Print Services' November base plan and fictional actual note A1. Keep Actual separate from Plan so the original assumptions remain visible. Define variance as actual minus plan. The new data records fewer completed packs and a higher variable cost per pack; it provides no evidence explaining why either changed.",
        "A draft report has carried the planned profit into the Actual column and calls lower total variable spending better cost control. Build a linked actual result and a volume/unit-cost variance bridge in Google Sheets or Microsoft Excel. Correct the misleading comparison and keep the source, old figure, new figure, date and reviewer in the audit trail. Actual collection dates are not supplied."
      ],
      dataset: {
        columns: ["Version", "Completed packs", "Price, INR", "Variable cost per pack, INR", "Fixed costs, INR", "Source"],
        rows: [
          ["Plan", "70", "500", "270", "12000", "Original November B1 assumptions"],
          ["Actual", "65", "500", "275", "12000", "Fictional actual note A1"]
        ]
      },
      outcome: "A checked actual-versus-plan report with a reconciled variance bridge, corrected interpretation and a retained formula-error audit.",
      tasks: [
        {
          id: "budgeting-lab-s7-t1",
          type: "short",
          prompt: "Calculate operating profit from the actual inputs, not the plan references. What is the actual result in INR?",
          answer: { kind: "number", value: 2625, tolerance: 0.5 },
          explanation: "Actual revenue is 65 x 500 = INR 32,500 and variable costs are 65 x 275 = INR 17,875. Profit is 32,500 - 17,875 - 12,000 = INR 2,625. The unchanged planned result of INR 4,100 is not the actual result."
        },
        {
          id: "budgeting-lab-s7-t2",
          type: "short",
          prompt: "Using actual minus plan, what is the operating-profit variance in INR? Enter a signed value, with a negative figure for an adverse profit difference.",
          answer: { kind: "number", value: -1475, tolerance: 0.5 },
          explanation: "Planned profit is 70 x (500 - 270) - 12,000 = INR 4,100. Actual minus plan is 2,625 - 4,100 = INR -1,475. The bridge is -5 packs x 230 = -1,150, plus -(275 - 270) x 65 = -325; together -1,475."
        },
        {
          id: "budgeting-lab-s7-t3",
          type: "case",
          prompt: "Write a corrected actual-versus-plan memo for Meera. Explain the stale plan reference, the volume and unit-cost effects and why lower total variable spending is not evidence of improved unit-cost control. State what needs investigation and why the operating variance cannot be used as an actual cash balance.",
          rubric: [
            "Calculates actual revenue INR 32,500, variable costs INR 17,875 and operating profit INR 2,625 from actual inputs.",
            "Defines actual minus plan and shows INR -1,475 against the retained INR 4,100 plan.",
            "Reconciles INR -1,150 from volume and INR -325 from unit cost to the total profit variance.",
            "Explains that variable cost per pack rose from 270 to 275 despite lower total spending, without inventing a cause.",
            "Records the formula-reference correction and requests source and collection-timing review rather than claiming an actual cash result."
          ],
          minWords: 170
        },
        {
          id: "budgeting-lab-s7-t4",
          type: "proof",
          prompt: "Attach the Plan and Actual views, formula checks, variance bridge and correction memo. Keep the original planned figures visible.",
          mustShow: "Actual profit 2625, retained plan 4100, actual-minus-plan variance -1475, volume/unit-cost components -1150 and -325, and the source-backed formula correction."
        }
      ]
    },
    {
      id: "budgeting-lab-s8",
      week: 8,
      title: "Submit the service price, monthly budget and downside decision",
      minutes: 120,
      scenario: [
        "Submit Meera Print Services' November 2026 case B1, not the December or expanded-capacity exercises. Price one completed workshop-pack preparation service and retain the cost map, source-labelled inputs, unit economics, monthly scenarios, Cash, Actual, tests and Memo together. Use Google Sheets or Microsoft Excel for the full workbook. The compact Rolevia Sheets lab remains a formula rehearsal with B1/B2/B3/B5 as its input addresses.",
        "The base cash schedule starts with INR 4,000. Week 1 pays INR 12,000 before any receipt. Weeks 2, 3 and 4 each receive INR 7,000 before paying INR 6,300. The remaining base sales receipts are due in December. Do not insert unapproved financing. Retain the 50-pack lower case separately from the 20 per cent lab demand fall, and keep the original plan visible beside actuals.",
        "Actual price and fixed costs stay at the base values; actual volume and unit variable cost are listed below. State the zero-to-90-pack capacity range and exclude tax, finance charges, equipment purchases and owner pay. Keep zero/negative-contribution and 52/53-pack boundary tests in a separate test view. The final memo must make a conditional decision request, not claim that demand, collections or additional funding are established."
      ],
      dataset: {
        columns: ["Input", "Value", "Unit or fictional source"],
        rows: [
          ["Service price", "500", "INR per completed pack; B1"],
          ["Variable cost", "270", "INR per completed pack; B1 cost map"],
          ["Fixed costs", "12000", "INR per month; B1 cost map"],
          ["Base demand", "70", "Completed packs in November"],
          ["Lower demand", "50", "Completed packs in November"],
          ["Higher demand", "90", "Completed packs in November"],
          ["Separate lab demand fall", "20", "Per cent of the base volume"],
          ["Opening cash", "4000", "INR at the start of November"],
          ["Share of base sales collected in November", "0.6", "Decimal share; balance due in December"],
          ["Actual volume", "65", "Completed packs; fictional actual note A1"],
          ["Actual variable cost", "275", "INR per completed pack; actual note A1"],
          ["Capacity ceiling", "90", "Packs under the original cost assumptions"]
        ]
      },
      outcome: "A review-ready service-pricing capstone with checked monthly scenarios, whole-pack break-even, cash timing, actual variance and a clear downside recommendation.",
      tasks: [
        {
          id: "budgeting-lab-s8-t1",
          type: "short",
          prompt: "Check the submitted service model against the base inputs. What minimum whole-pack quantity covers the monthly fixed costs at the proposed INR 500 price?",
          answer: { kind: "number", value: 53, tolerance: 0 },
          explanation: "Contribution is 500 - 270 = INR 230 per pack. Divide 12,000 by 230 to get about 52.17 and round up to 53. The test results are INR -40 at 52 packs and INR 190 at 53, confirming the first whole-pack threshold."
        },
        {
          id: "budgeting-lab-s8-t2",
          type: "short",
          prompt: "What operating result in INR does the final 50-pack lower-demand scenario produce? Use its stated volume, not the separate 20 per cent lab shock.",
          answer: { kind: "number", value: -500, tolerance: 0.5 },
          explanation: "The lower case produces 50 x (500 - 270) - 12,000 = 11,500 - 12,000 = INR -500. The separate shock retains 70 x 0.8 = 56 packs and produces INR 880; these scenarios must not share a label."
        },
        {
          id: "budgeting-lab-s8-t3",
          type: "case",
          prompt: "Submit a one-page management memo for Rolevia review. Defend the proposed price using contribution and break-even, compare demand scenarios, distinguish profit from the timed cash requirement and explain the checked actual variance. State assumptions, exclusions, one unresolved risk and the next review decision needed before treating the model as an operating plan.",
          rubric: [
            "Shows INR 230 contribution and 12,000 / 230 rounded up to 53 packs, supported by the 52/53 boundary and non-positive tests.",
            "Reports base/lower/higher operating results of INR 4,100/-500/8,700 and separates the 56-pack, INR 880 lab downside.",
            "Reconciles INR 21,000 receipts and 30,900 payments, distinguishing the INR 8,000 early funding need from the 5,900 closing gap.",
            "Shows actual profit INR 2,625 and actual-minus-plan INR -1,475, reconciled to volume and unit-cost effects.",
            "States sources, month, units, capacity and excluded costs, and makes a conditional demand or cash-timing review request."
          ],
          minWords: 220
        },
        {
          id: "budgeting-lab-s8-t4",
          type: "proof",
          prompt: "Attach the full formula-linked workbook and memo, with a reader's index. Include the cost map, assumptions, scenario rows, cash schedule, actual comparison and test log rather than only a final profit screenshot.",
          mustShow: "A source-backed service price and monthly budget; contribution and whole-pack break-even formulas; lower-demand and separate lab tests; carried cash balances; retained plan and actual variance; formula checks; and a conditional decision memo."
        }
      ]
    }
  ]
};
