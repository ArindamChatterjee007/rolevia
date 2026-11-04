export default {
  moduleId: "spreadsheets",
  summary: "Build from a clean register to tested formulas, reconciled pivots and a reusable handover. The final lab turns Kiran Stationery's messy fictional sales file into a checked workbook and a bounded stock-review note.",
  sessions: [
    {
      id: "spreadsheets-lab-s1",
      week: 1,
      title: "Preserve and clean the first register",
      minutes: 75,
      scenario: [
        "Priya at fictional Kiran Stationery needs a usable completed-order register. Each row represents one order, with sales in INR excluding tax and delivery. The second K103 row is a confirmed duplicate, not another order. The comma in 2,100 is a thousands separator; the space after North and lower-case south are label defects. All dates use year-month-day.",
        "Practise the cleaning helpers in Rolevia Sheets on its own starter records. Use its Google Sheets route when available, or start a blank Google Sheets workbook. Put this session's table in separate Raw and Clean tabs without overwriting the tool's Lab tab. Add Dictionary and Checks tabs, freeze the header, filter the whole table and log each repair. Enter figures from this session's workbook, not the starter exercise."
      ],
      dataset: {
        columns: ["Order ID", "Sale date", "Region", "Product", "Sales, INR"],
        rows: [
          ["K101", "2026-11-02", "North", "N1", "900"],
          ["K102", "2026-11-02", "South", "N2", "1500"],
          ["K103", "2026-11-03", "North ", "N2", "2,100"],
          ["K103", "2026-11-03", "North ", "N2", "2,100"],
          ["K104", "2026-11-03", "south", "N1", "500"]
        ]
      },
      outcome: "A preserved raw register, a four-order clean tab, a column dictionary and a cleaning log with independently checked totals.",
      tasks: [
        {
          id: "spreadsheets-lab-s1-t1",
          type: "short",
          prompt: "Clean the table in your workbook, removing only the confirmed duplicate. How many completed orders remain? Enter the resulting order count.",
          answer: { kind: "number", value: 4, tolerance: 0 },
          explanation: "There are five raw rows and one confirmed extra K103 row. The clean count is 5 - 1 = 4 orders. Normalising labels does not remove an order."
        },
        {
          id: "spreadsheets-lab-s1-t2",
          type: "short",
          prompt: "Convert the retained sales values to numbers and use SUM on Clean. What is the completed-sales total in INR after removing the duplicate?",
          hint: "Check that the retained K103 amount is numeric 2100, not merely formatted text.",
          answer: { kind: "number", value: 5000, tolerance: 0.5 },
          explanation: "The retained amounts are 900 + 1500 + 2100 + 500 = INR 5000. Converting both raw copies gives INR 7100; excluding the extra INR 2100 reconciles to the same INR 5000."
        },
        {
          id: "spreadsheets-lab-s1-t3",
          type: "case",
          prompt: "Write Priya a cleaning handover. Explain what a row means, why one K103 was excluded, how labels and numeric types were repaired, and how someone can verify that no legitimate order was lost. Include what you would do if a future amount or date were unknown.",
          rubric: [
            "Defines one row as one completed order and states the INR, tax and delivery boundaries.",
            "Records the duplicate ID, label repairs and numeric conversion while preserving Raw.",
            "Reconciles five raw rows to four orders and INR 7100 less INR 2100 to INR 5000.",
            "Keeps unknown values unresolved until source evidence is available rather than guessing or inserting zero."
          ],
          minWords: 100
        },
        {
          id: "spreadsheets-lab-s1-t4",
          type: "proof",
          prompt: "Attach the workbook or a restricted reviewer link with Raw, Clean, Dictionary and the repair log. Include the numeric check cells, not only a picture of a total.",
          mustShow: "Five unchanged source rows, four clean IDs, numeric sales, the affected label cells and a row-and-value reconciliation with expected and actual results."
        }
      ]
    },
    {
      id: "spreadsheets-lab-s2",
      week: 2,
      title: "Test formulas at the boundary",
      minutes: 90,
      scenario: [
        "Kiran Stationery's next six completed orders need a Review flag when sales are at least INR 1500. Priya also wants North's N2 sales and an order count. The product reference contains N1 = Notebook and N2 = Folder only. N9 has no confirmed match, so an exact lookup must expose that gap rather than invent a name. Amounts exclude tax and delivery.",
        "Build the IF, SUMIFS and COUNTIFS helpers in Rolevia Sheets using its starter task cells. Then use this separate table in Google Sheets for the formula workbook and exact-match lookup. Keep relative row references and fixed summary ranges distinct. On Checks, write expected values before recording actual results, with at least two tests for each of the four formula types."
      ],
      dataset: {
        columns: ["Order ID", "Sale date", "Region", "Product", "Sales, INR"],
        rows: [
          ["K201", "2026-11-05", "North", "N1", "1499"],
          ["K202", "2026-11-05", "North", "N2", "1500"],
          ["K203", "2026-11-06", "South", "N2", "2100"],
          ["K204", "2026-11-06", "South", "N1", "800"],
          ["K205", "2026-11-07", "North", "N2", "2400"],
          ["K206", "2026-11-07", "South", "N9", "500"]
        ]
      },
      outcome: "A formula workbook with review flags, conditional sums and counts, an exact lookup and visible boundary and missing-match tests.",
      tasks: [
        {
          id: "spreadsheets-lab-s2-t1",
          type: "short",
          prompt: "Build a SUMIFS check for Region = North and Product = N2 using this session's table. Enter the resulting sales value in INR.",
          answer: { kind: "number", value: 3900, tolerance: 0.5 },
          explanation: "Only K202 and K205 meet both conditions. Their sales are 1500 + 2400 = INR 3900. K201 is North but is N1, so it does not qualify."
        },
        {
          id: "spreadsheets-lab-s2-t2",
          type: "short",
          prompt: "Use COUNTIFS to count orders with sales of at least INR 1500, across all regions. How many should your IF formulas label Review?",
          answer: { kind: "number", value: 3, tolerance: 0 },
          explanation: "K202 at 1500, K203 at 2100 and K205 at 2400 qualify: 1 + 1 + 1 = 3 orders. A >1500 test wrongly excludes K202 and returns 2."
        },
        {
          id: "spreadsheets-lab-s2-t3",
          type: "case",
          prompt: "Priya asks you to hide N9's lookup error and use >1500 because the results look cleaner. Write a response defending the correct rules. Describe two expected-versus-actual tests for each required formula and distinguish a deliberate missing-code test from an unresolved business record.",
          rubric: [
            "Uses >=1500 and tests 1499 as Routine and 1500 as Review.",
            "Gives two SUMIFS tests and two COUNTIFS tests with independently derived expected results.",
            "Uses an exact lookup with N1 returning Notebook and N9 exposing a missing match.",
            "Keeps K206 and its unresolved reference visible and names a source check instead of inventing a label."
          ],
          minWords: 120
        },
        {
          id: "spreadsheets-lab-s2-t4",
          type: "proof",
          prompt: "Attach the formula workbook with the Products reference, row helpers and Checks tab. Retain formulas so a reviewer can inspect references and tests.",
          mustShow: "The six orders, INR 3900 North N2 result, three Review flags, N9's unresolved match and at least two labelled expected-versus-actual tests per formula type."
        }
      ]
    },
    {
      id: "spreadsheets-lab-s3",
      week: 3,
      title: "Turn the register into a management summary",
      minutes: 90,
      scenario: [
        "Priya wants to know which product deserves a stock check after Kiran Stationery's six completed orders on 9 to 11 November. N1 means Notebook and N2 means Folder. All amounts are INR sales excluding tax and delivery; there are no unit, stock or cost records. This is a new six-order sample, not a continuation of the earlier table.",
        "Use the spreadsheet practice tool to rehearse conditional totals, then build this table's product-by-region and date pivots in Google Sheets. Put Product in rows, Region in columns and numeric Sales in values, summarised by SUM. Keep the source and a separate Checks tab. Enter the figures from the built summary below."
      ],
      dataset: {
        columns: ["Order ID", "Sale date", "Region", "Product", "Sales, INR"],
        rows: [
          ["K301", "2026-11-09", "North", "N1", "1000"],
          ["K302", "2026-11-09", "South", "N2", "1800"],
          ["K303", "2026-11-10", "North", "N2", "2200"],
          ["K304", "2026-11-10", "South", "N1", "600"],
          ["K305", "2026-11-11", "North", "N1", "1400"],
          ["K306", "2026-11-11", "South", "N2", "3000"]
        ]
      },
      outcome: "A labelled management summary with product, region and date views, reconciled totals and a finding that stays within the available evidence.",
      tasks: [
        {
          id: "spreadsheets-lab-s3-t1",
          type: "short",
          prompt: "Build the product-by-region pivot and independently check its N2 row. What is N2's total recorded sales value in INR?",
          answer: { kind: "number", value: 7000, tolerance: 0.5 },
          explanation: "N2 uses K302, K303 and K306: 1800 + 2200 + 3000 = INR 7000. N1 contributes 1000 + 600 + 1400 = INR 3000, giving INR 10000 overall."
        },
        {
          id: "spreadsheets-lab-s3-t2",
          type: "short",
          prompt: "Calculate N2's share of this table's total sales value in a check cell. Enter the percentage as a number, such as 25 for 25%, not as a decimal ratio.",
          answer: { kind: "number", value: 70, tolerance: 0.01 },
          explanation: "The denominator is INR 10000 across all six orders. N2's share is 7000 / 10000 x 100 = 70%. This is sales-value share, not a share of units, orders or profit."
        },
        {
          id: "spreadsheets-lab-s3-t3",
          type: "case",
          prompt: "Write Priya a management note recommending one next stock-review action. Use the pivot and date totals, explain what the high N2 share does and does not mean, and identify information needed before choosing any reorder quantity.",
          rubric: [
            "Cites N2 at INR 7000 of INR 10000 and labels its 70% share as sales value.",
            "Reconciles North INR 4600 and South INR 5400 to the grand total.",
            "Uses date totals INR 2800, INR 2800 and INR 4400 without treating three days as a proven trend.",
            "Recommends a stock check and requests stock, unit demand and costs before setting a purchase quantity."
          ],
          minWords: 100
        },
        {
          id: "spreadsheets-lab-s3-t4",
          type: "proof",
          prompt: "Attach the workbook containing the two pivots, independent SUM or SUMIFS checks and the management note. Make the reporting period and currency readable.",
          mustShow: "All six source IDs, SUM aggregation, product and region totals, the sales-share denominator, date totals and a zero unexplained reconciliation difference."
        }
      ]
    },
    {
      id: "spreadsheets-lab-s4",
      week: 4,
      title: "Audit the range and test the next update",
      minutes: 90,
      scenario: [
        "Kiran Stationery's baseline report contains the first four rows below. Priya asks you to test the fifth row as a future update without changing the reviewed baseline. Each row is one completed order in INR excluding tax and delivery. A draft pivot still displays INR 5000 after the append because its source range stops at the old last row.",
        "Keep a baseline version and a separate update-test copy in Google Sheets. Add K405 only to the test copy, extend formulas and the pivot range, refresh and inspect the resulting numbers. Use the formula habits practised in Rolevia Sheets, but do not treat a successful refresh click as proof that the new row was included."
      ],
      dataset: {
        columns: ["Order ID", "Batch", "Region", "Product", "Sales, INR"],
        rows: [
          ["K401", "Baseline", "North", "N1", "900"],
          ["K402", "Baseline", "South", "N2", "1500"],
          ["K403", "Baseline", "North", "N2", "2100"],
          ["K404", "Baseline", "South", "N1", "500"],
          ["K405", "Append test", "North", "N1", "700"]
        ]
      },
      outcome: "A baseline audit and a separately verified update copy, with explicit instructions for filling helpers, extending ranges and checking a refresh.",
      tasks: [
        {
          id: "spreadsheets-lab-s4-t1",
          type: "short",
          prompt: "Append K405 in the update-test workbook and extend the total range. What completed-sales total in INR should the refreshed summary show?",
          answer: { kind: "number", value: 5700, tolerance: 0.5 },
          explanation: "Baseline sales are 900 + 1500 + 2100 + 500 = INR 5000. Adding K405 gives 5000 + 700 = INR 5700. The original baseline must still show INR 5000."
        },
        {
          id: "spreadsheets-lab-s4-t2",
          type: "short",
          prompt: "Calculate expected updated sales minus the stale pivot's INR 5000 in a Checks cell. What positive reconciliation difference exposes the omitted row?",
          answer: { kind: "number", value: 700, tolerance: 0.5 },
          explanation: "Expected sales are INR 5700, so 5700 - 5000 = INR 700 is missing from the stale pivot. That equals K405's amount; changing the displayed total manually would conceal the range error."
        },
        {
          id: "spreadsheets-lab-s4-t3",
          type: "case",
          prompt: "Write a handover procedure for Priya to add the next valid order. Explain how to preserve the reviewed version, fill row formulas, extend every relevant range and prove that the update changed the right groups. Describe what to do if totals still disagree after refreshing.",
          rubric: [
            "Separates the four-order baseline from the five-order update-test copy and records their versions.",
            "Extends total, conditional-formula and pivot ranges and fills row helpers into the appended row.",
            "Checks updated sales INR 5700, North INR 3700 and N1 INR 2100 against independent workings.",
            "Investigates source rows, filters and ranges when results differ rather than editing a summary to match."
          ],
          minWords: 120
        },
        {
          id: "spreadsheets-lab-s4-t4",
          type: "proof",
          prompt: "Attach the baseline and update-test evidence together with the handover procedure. Keep the stale result in the error log and the repaired result in the final check.",
          mustShow: "Separate version labels, K405 in the extended ranges, expected and actual group totals, the original INR 700 mismatch and the repaired reconciliation."
        }
      ]
    },
    {
      id: "spreadsheets-lab-s5",
      week: 5,
      title: "Report incomplete data without inventing it",
      minutes: 105,
      scenario: [
        "Leela at fictional Tara Office Supplies receives a December extract with a confirmed repeated T505 row. Each unique ID is one completed order. T503's amount is unknown and T506's region is unknown; neither can be inferred from neighbouring rows. Commas mean thousands, and label spaces and case may be normalised. Sales exclude tax and delivery.",
        "Preserve the seven raw rows and build a new Google Sheets cleaning workbook, using the helpers rehearsed in Rolevia Sheets. Remove only the confirmed duplicate. Keep incomplete orders visible in Clean, with an issue log. Calculate a subtotal of known amounts, not a supposedly complete sales total, and keep the unclassified region separate."
      ],
      dataset: {
        columns: ["Order ID", "Sale date", "Region", "Product", "Sales, INR"],
        rows: [
          ["T501", "2026-12-01", "North ", "N1", "1,200"],
          ["T502", "2026-12-01", "south", "N2", "1800"],
          ["T503", "2026-12-02", "North", "N2", ""],
          ["T504", "2026-12-02", "South", "N1", "600"],
          ["T505", "2026-12-03", "South", "N2", "2200"],
          ["T505", "2026-12-03", "South", "N2", "2200"],
          ["T506", "2026-12-03", "", "N1", "900"]
        ]
      },
      outcome: "A traceable incomplete-data report separating known-value totals, unclassified sales and unresolved source questions.",
      tasks: [
        {
          id: "spreadsheets-lab-s5-t1",
          type: "short",
          prompt: "After excluding the extra T505 row, sum all known sales amounts, including T506's known amount. What is the known-value subtotal in INR? Do not fill T503 with zero.",
          answer: { kind: "number", value: 6700, tolerance: 0.5 },
          explanation: "The known amounts are 1200 + 1800 + 600 + 2200 + 900 = INR 6700. T503 remains unknown, so INR 6700 is an incomplete subtotal, even though SUM may ignore its blank cell."
        },
        {
          id: "spreadsheets-lab-s5-t2",
          type: "short",
          prompt: "In your issue log, count unique retained orders with an unresolved amount or region after all authorised repairs. How many orders still need source evidence?",
          answer: { kind: "number", value: 2, tolerance: 0 },
          explanation: "T503 has an unknown amount and T506 an unknown region: 1 + 1 = 2 affected orders. The confirmed duplicate and repairable label differences are not unresolved after their documented fixes."
        },
        {
          id: "spreadsheets-lab-s5-t3",
          type: "case",
          prompt: "Leela wants a clean regional ranking today. Write a note explaining what can be reported now and what should wait. Include a row-and-value bridge, at least two data-quality risks with an action each, and a clear owner for the remaining source questions.",
          rubric: [
            "Reconciles seven raw rows to six retained IDs and known raw amounts INR 8900 less INR 2200 to INR 6700.",
            "Labels INR 6700 as incomplete because T503's amount is unknown, not zero.",
            "Keeps T506's INR 900 unclassified and explains why regional comparisons remain limited.",
            "Assigns Leela the source checks for T503's amount and T506's region without guessing either value."
          ],
          minWords: 120
        },
        {
          id: "spreadsheets-lab-s5-t4",
          type: "proof",
          prompt: "Attach the raw and clean tabs, known-value checks and issue log. Show unresolved items in the delivered workbook rather than removing them from the view.",
          mustShow: "Six retained IDs, T503's blank amount, T506's unclassified INR 900, the documented duplicate exclusion and the INR 6700 subtotal labelled incomplete."
        }
      ]
    },
    {
      id: "spreadsheets-lab-s6",
      week: 6,
      title: "Answer a stakeholder's growth request",
      minutes: 105,
      scenario: [
        "Tara Office Supplies supplies two complete seven-day reporting periods: A is 2 to 8 November and B is 9 to 15 November. The six rows below are all qualifying completed orders, with consistent INR amounts excluding tax and delivery. Leela asks whether the increase justifies doubling N2's next reorder. There is no stock, unit-demand or cost information.",
        "Build period and product views in Google Sheets with the same formula checks used in Rolevia Sheets. Keep the period definitions above the summary, and use period A as the percentage-change baseline. Compare the measured sales movement with the much stronger purchasing claim before drafting a response."
      ],
      dataset: {
        columns: ["Order ID", "Period", "Region", "Product", "Sales, INR"],
        rows: [
          ["T601", "A", "North", "N2", "2400"],
          ["T602", "A", "South", "N2", "3600"],
          ["T603", "A", "North", "N1", "2000"],
          ["T604", "B", "North", "N2", "3000"],
          ["T605", "B", "South", "N2", "4200"],
          ["T606", "B", "South", "N1", "1800"]
        ]
      },
      outcome: "A like-for-like period comparison and a stakeholder response distinguishing observed sales growth from an unsupported stock-order decision.",
      tasks: [
        {
          id: "spreadsheets-lab-s6-t1",
          type: "short",
          prompt: "Build a period summary and check period B with SUMIFS. What is period B's recorded completed-sales total in INR?",
          answer: { kind: "number", value: 9000, tolerance: 0.5 },
          explanation: "Period B contains T604, T605 and T606: 3000 + 4200 + 1800 = INR 9000. Period A is 2400 + 3600 + 2000 = INR 8000."
        },
        {
          id: "spreadsheets-lab-s6-t2",
          type: "short",
          prompt: "Calculate the percentage increase in total sales from A to B, using A as the baseline. Enter percentage units, such as 10 for 10%.",
          answer: { kind: "number", value: 12.5, tolerance: 0.01 },
          explanation: "The difference is 9000 - 8000 = INR 1000. Relative to period A, 1000 / 8000 x 100 = 12.5%. Dividing by period B would answer a different question."
        },
        {
          id: "spreadsheets-lab-s6-t3",
          type: "case",
          prompt: "Reply to Leela's request to double N2's reorder. State the checked overall and N2 movements, explain why those figures do not specify a purchase quantity, and propose the next information-gathering step before a stock decision.",
          rubric: [
            "States overall sales INR 8000 to INR 9000, a rise of INR 1000 or 12.5% on period A.",
            "Checks N2 at INR 6000 in A and INR 7200 in B, an increase of 20% on its own baseline.",
            "Identifies the matched seven-day scope and avoids translating sales value directly into units to reorder.",
            "Requests stock on hand, unit demand and costs, with Leela coordinating a stock review before purchasing."
          ],
          minWords: 120
        },
        {
          id: "spreadsheets-lab-s6-t4",
          type: "proof",
          prompt: "Attach the period and product summaries, change formulas and your stakeholder note. Keep baseline labels beside percentage results.",
          mustShow: "Both period definitions, all six orders, INR 17000 across periods, separately checked overall and N2 changes, and a recommendation with missing evidence named."
        }
      ]
    },
    {
      id: "spreadsheets-lab-s7",
      week: 7,
      title: "Find the quiet errors before handover",
      minutes: 105,
      scenario: [
        "Leela receives Tara Office Supplies' draft workbook with headers in row 1 and these six completed orders in rows 2 to 7. The total uses =SUM(E2:E6), and the Review helper uses >1500 even though the agreed rule is at least INR 1500. The draft therefore misses a record and mishandles a boundary while still looking plausible.",
        "Recreate the two faulty formulas in a labelled audit copy in Google Sheets, then repair them in a separate checked version. Use the boundary-testing approach from Rolevia Sheets. Retain the original formula, expected result, actual result and correction for each defect; do not change the raw order values."
      ],
      dataset: {
        columns: ["Order ID", "Sale date", "Region", "Product", "Sales, INR"],
        rows: [
          ["T701", "2026-12-07", "North", "N1", "900"],
          ["T702", "2026-12-07", "South", "N2", "1500"],
          ["T703", "2026-12-08", "North", "N2", "2100"],
          ["T704", "2026-12-08", "South", "N1", "500"],
          ["T705", "2026-12-09", "North", "N1", "1200"],
          ["T706", "2026-12-09", "South", "N2", "1800"]
        ]
      },
      outcome: "A repaired workbook and an error log proving that both the missing-row error and the review-threshold error were found and retested.",
      tasks: [
        {
          id: "spreadsheets-lab-s7-t1",
          type: "short",
          prompt: "Repair the sales total so it includes every source order. What checked total in INR should appear in the delivered workbook?",
          answer: { kind: "number", value: 8000, tolerance: 0.5 },
          explanation: "All six amounts sum to 900 + 1500 + 2100 + 500 + 1200 + 1800 = INR 8000. The old range gives INR 6200, omitting T706's INR 1800 in row 7."
        },
        {
          id: "spreadsheets-lab-s7-t2",
          type: "short",
          prompt: "After correcting the review rule and filling it across all six rows, how many orders should be flagged Review? Verify with COUNTIFS before entering the result.",
          answer: { kind: "number", value: 3, tolerance: 0 },
          explanation: "T702 at 1500, T703 at 2100 and T706 at 1800 qualify, giving 3. The strict >1500 rule counts only T703 and T706, or 2, even when its range includes all rows."
        },
        {
          id: "spreadsheets-lab-s7-t3",
          type: "case",
          prompt: "Write Leela an error-analysis memo explaining both defects and their separate effects. Show how your tests expose each one, how the repair was verified and what update instructions would prevent the same mistakes in the capstone workbook.",
          rubric: [
            "Identifies E2:E6 as omitting row 7 and reconciles INR 6200 plus INR 1800 to INR 8000.",
            "Explains why >1500 excludes T702 and why >=1500 correctly gives three Review flags.",
            "Records original and repaired formulas with independent expectations and actual results.",
            "Includes a last-row coverage test and threshold-edge tests in the future update procedure."
          ],
          minWords: 120
        },
        {
          id: "spreadsheets-lab-s7-t4",
          type: "proof",
          prompt: "Attach the audit copy, repaired workbook and test log. Show formula expressions and affected order IDs rather than only the final green checks.",
          mustShow: "Original and repaired ranges, the INR 1800 omitted row, T702's corrected boundary result and independent checks of INR 8000 and three Review orders."
        }
      ]
    },
    {
      id: "spreadsheets-lab-s8",
      week: 8,
      title: "Capstone: deliver the checked sales workbook",
      minutes: 120,
      scenario: [
        "Priya asks for Kiran Stationery's final fictional sales workbook and a stock-review note for 2 to 5 November 2026. Each unique ID is one completed order; sales exclude tax and delivery. Source clarification confirms that the second K803 is a duplicate, K807 belongs to North, commas mean thousands and K808's date follows day/month/year. N1 means Notebook and N2 means Folder.",
        "Use the formula habits developed in Rolevia Sheets and assemble the full workbook in Google Sheets or Microsoft Excel. Preserve Raw, create Clean, Dictionary, a cleaning log, Checks, Summary and Handover. Include IF, SUMIFS, COUNTIFS and an exact lookup with two tests each, a product-by-region pivot and update instructions. Keep this assessment version separate from earlier examples and update-test copies."
      ],
      dataset: {
        columns: ["Order ID", "Sale date", "Region", "Product", "Sales, INR"],
        rows: [
          ["K801", "2026-11-02", "North", "N1", "900"],
          ["K802", "2026-11-02", "South", "N2", "1500"],
          ["K803", "2026-11-03", "North ", "N2", "2,100"],
          ["K804", "2026-11-03", "South", "N1", "500"],
          ["K805", "2026-11-04", "North", "N1", "700"],
          ["K806", "2026-11-04", "south", "N2", "1800"],
          ["K807", "2026-11-05", "", "N1", "1200"],
          ["K808", "05/11/2026", "South", "N2", "2300"],
          ["K803", "2026-11-03", "North ", "N2", "2,100"]
        ]
      },
      outcome: "A submitted clean-data workbook, reconciled summary, traceable formula and cleaning checks, and a short decision note supported by the fictional sales evidence.",
      tasks: [
        {
          id: "spreadsheets-lab-s8-t1",
          type: "short",
          prompt: "Complete and audit your capstone workbook. After the documented duplicate exclusion and source-confirmed repairs, what is the clean completed-sales total in INR?",
          answer: { kind: "number", value: 11000, tolerance: 0.5 },
          explanation: "The eight retained amounts are 900 + 1500 + 2100 + 500 + 700 + 1800 + 1200 + 2300 = INR 11000. The converted raw total is INR 13100; excluding the extra K803 removes INR 2100."
        },
        {
          id: "spreadsheets-lab-s8-t2",
          type: "short",
          prompt: "Use SUMIFS to check the North total after applying the supplied region clarification for K807. Enter the amount in INR and compare it with your pivot.",
          answer: { kind: "number", value: 4900, tolerance: 0.5 },
          explanation: "North contains K801, K803, K805 and K807: 900 + 2100 + 700 + 1200 = INR 4900. South is INR 6100, so 4900 + 6100 = INR 11000. The blank region is repaired from evidence, not guessed."
        },
        {
          id: "spreadsheets-lab-s8-t3",
          type: "case",
          prompt: "Submit Priya's final decision note alongside the workbook. Recommend a specific next stock-review action, cite the product and regional checks, explain at least one limitation and describe how the next valid order should be added. Do not claim a purchase quantity or profit result from sales values alone.",
          rubric: [
            "Cites eight clean orders and reconciles raw INR 13100 less INR 2100 to clean INR 11000.",
            "Uses N2 INR 7700 of INR 11000, or 70% of sales value, and the INR 4900 plus INR 6100 regional check.",
            "Recommends Priya check N2 stock and requests unit demand, stock and cost evidence before a reorder quantity.",
            "Points to labelled checks, source-confirmed repairs and range-extension instructions in the submitted version."
          ],
          minWords: 120
        },
        {
          id: "spreadsheets-lab-s8-t4",
          type: "proof",
          prompt: "Submit the capstone workbook as a file or restricted reviewer link. Include the raw and clean data, dictionary, cleaning log, formula tests, pivot, decision note and update handover. Reopen the delivered version to check readability and reviewer access.",
          mustShow: "Eight retained IDs, source-confirmed repairs, visible formulas with two tests per type, reconciled regional and product totals, readable INR and date labels, the decision note and repeatable update instructions."
        }
      ]
    }
  ]
};
