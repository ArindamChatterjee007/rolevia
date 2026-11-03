export default {
  moduleId: "spreadsheets",
  tagline: "Build a sales workbook that another person can read, test and update without guessing what your numbers mean.",
  weeks: [
    {
      week: 1,
      theme: "Organise the register and test the calculations",
      lessons: [
        {
          id: "spreadsheets-w1-l1",
          title: "Organise a business sheet",
          minutes: 60,
          objective: "Produce a clean sales register, a column dictionary and a cleaning log while keeping the original fictional records unchanged.",
          sections: [
            {
              heading: "Give the workbook a clear purpose",
              body: [
                "Kiran Stationery wants to review recorded sales before planning its next stock check. Your first job is to make the records usable, not to make a colourful report. Use Google Sheets by default, or Microsoft Excel if you already have access. Create separate Raw, Clean, Dictionary and Checks tabs. Keep the original file unchanged and label the workbook as fictional practice. A reader should know where each figure came from and what one row represents."
              ],
              steps: [
                "Open a blank Google Sheets workbook and name it Kiran Stationery sales practice.",
                "Place the supplied records in Raw, with headers in the first row; duplicate this tab and rename the copy Clean.",
                "Add Dictionary and Checks tabs; record the source filename, reporting period and the date you copied it.",
                "Select the header row in Clean, then use View > Freeze > 1 row and Data > Create a filter.",
                "Microsoft Excel: use View > Freeze Panes > Freeze Top Row and Data > Filter; keep the same tab structure."
              ],
              callout: {
                type: "definition",
                title: "Row meaning",
                text: "In this teaching register, one row is one completed order. If a later file contains several product lines per order, record that different row meaning before counting orders."
              }
            },
            {
              heading: "Write the column dictionary before cleaning",
              body: [
                "A dictionary explains the meaning, type and permitted values of each column. Order IDs are text labels, even if they contain digits, so keep any leading zeroes. Sales are numeric amounts in INR, not strings containing a currency symbol. This example contains only completed orders and excludes tax and delivery charges. Those boundaries matter: a total can be correctly added yet still answer the wrong business question if its meaning is unclear."
              ],
              table: {
                columns: ["Column", "Meaning", "Type and rule"],
                rows: [
                  ["A: Order ID", "Unique completed order", "Text; must not be blank"],
                  ["B: Sale date", "Date the order was completed", "Valid date; display YYYY-MM-DD"],
                  ["C: Region", "Selling region", "North or South in this example"],
                  ["D: Product", "Product code from the reference list", "Text; N1 or N2"],
                  ["E: Sales", "Order amount excluding tax and delivery", "Number; currency INR"]
                ]
              },
              callout: {
                type: "tip",
                title: "One currency at a time",
                text: "Use an INR label for this register. Do not mix INR and USD amounts in one total or invent an exchange rate; a separate USD exercise needs its own stated assumptions."
              }
            },
            {
              heading: "Clean meaning, not just appearance",
              body: [
                "Work on the copy and record each change with its order ID, old value, new value and reason. Trimming a trailing space can repair a region label, but it cannot tell you which region a blank belongs to. Ask for the fictional source evidence, or mark the value unresolved. Treat ambiguous dates in the same way. Changing the display format does not prove that a date was interpreted correctly when it was imported."
              ],
              steps: [
                "Filter each column to inspect blanks and unexpected labels; select the whole table before sorting so row values stay together.",
                "For text labels, use Data > Data cleanup > Trim whitespace on the selected label columns, then inspect the results.",
                "Confirm the source date convention. For a confirmed 3 November 2026 text value, enter =DATE(2026,11,3) in a helper cell and compare it with the source.",
                "Copy the checked helper date into Clean using Paste special > Values only, then use Format > Number > Custom date and time to display YYYY-MM-DD.",
                "For text amount 2,100, confirm the comma means thousands. Test =VALUE(\"2,100\") in a helper cell; expect 2100 before copying it into Clean using Paste special > Values only.",
                "Review repeated order IDs against Raw; remove a confirmed duplicate only from Clean and log the excluded row.",
                "Microsoft Excel: use TRIM in a helper column for spaces and Format Cells for date display; the same date checks still apply."
              ],
              callout: {
                type: "warning",
                title: "A blank is not automatically zero",
                text: "An unknown sales amount is not a zero-value order. Track unresolved records separately and explain their treatment before reporting a complete sales total."
              }
            },
            {
              heading: "Keep a small checked example beside you",
              body: [
                "Use this miniature register to learn the formulas in the next lesson. Enter the headers in Clean row 1 and these four records in rows 2 to 5, using the column order in the dictionary. They are verified teaching records, separate from the interactive lab. Their sales total is INR 5,000. If your supplied assessment file has more rows, keep its own evidence and totals rather than replacing them with this small example."
              ],
              table: {
                columns: ["Order ID", "Sale date", "Region", "Product", "Sales, INR"],
                rows: [
                  ["K01", "2026-11-02", "North", "N1", "900"],
                  ["K02", "2026-11-02", "South", "N2", "1500"],
                  ["K03", "2026-11-03", "North", "N2", "2100"],
                  ["K04", "2026-11-03", "South", "N1", "500"]
                ]
              },
              callout: {
                type: "example",
                title: "A traceable cleaning bridge",
                text: "In a copy, repeating K03 once creates five rows totalling INR 7,100. Removing that confirmed duplicate excludes INR 2,100 and leaves four rows totalling INR 5,000. Keep the original copy and log the exclusion."
              }
            }
          ],
          practice: {
            labId: "spreadsheets",
            instruction: "Open Clean the register. Match each flagged row to its specific repair. Record which repairs need source evidence, especially the blank region; the lab uses a different dataset from the lesson."
          },
          checkpoint: [
            {
              question: "Why should order ID 0042 stay as text even though it contains only digits?",
              answer: "It is an identifier, not a quantity. Converting it to a number can remove the leading zeroes and break a match to another record. Set the ID column to text and preserve the original label."
            },
            {
              question: "A source shows 04/05/2026 without stating its date convention. What evidence do you need?",
              answer: "Confirm whether the source uses day/month or month/day, using its documentation or a known dated record. Formatting alone cannot choose between 4 May and 5 April. Mark the date unresolved until the convention is established."
            },
            {
              question: "What should a cleaning log record when a region changes from 'South ' to 'South'?",
              answer: "Record the order ID, original label, corrected label and the reason, trailing whitespace removed. This makes the repair traceable and distinguishes a formatting change from an unsupported change to business meaning."
            }
          ]
        },
        {
          id: "spreadsheets-w1-l2",
          title: "Use practical formulas",
          minutes: 60,
          objective: "Create IF, SUMIFS, COUNTIFS and exact-match lookup formulas, with two labelled tests for each and a checked source total.",
          sections: [
            {
              heading: "Translate a rule into an IF test",
              body: [
                "Priya wants to review orders of INR 1,500 or more before preparing the sales note. This is a checking rule, not a discount or a judgement about a customer. Put Review flag in F1 and enter the formula below in F2. Copy it down through F5. A relative reference changes from E2 to E3 as you copy, so each row checks its own sales amount rather than repeatedly checking the first order."
              ],
              steps: [
                "In Clean!F2 enter =IF(E2>=1500,\"Review\",\"Routine\") and copy it to F5.",
                "Read the four results against their amounts: Routine, Review, Review, Routine.",
                "On Checks, put 1499 in B2 and 1500 in B3; use the same IF rule with B2 and B3 as the input references.",
                "Record expected results Routine and Review before comparing them with the formula outputs."
              ],
              callout: {
                type: "tip",
                title: "Test the boundary",
                text: "Testing 1499 and 1500 checks the exact edge of this rule. Testing only a very large value would not reveal an accidental use of > instead of >=."
              }
            },
            {
              heading: "Separate adding from counting",
              body: [
                "SUMIFS adds amounts for records that meet all stated conditions. COUNTIFS counts records meeting those conditions; it does not add their sales. Use ranges with the same first and last row so conditions line up with the correct amounts. In this example each record is one order, so a record count is also an order count. That would not be true in a file with several product lines for each order."
              ],
              steps: [
                "On Checks, enter =SUMIFS(Clean!$E$2:$E$5,Clean!$C$2:$C$5,\"North\",Clean!$D$2:$D$5,\"N2\"). Expect 2100.",
                "Change the product criterion to N1 in a second test. Expect 900 for North and N1.",
                "Enter =COUNTIFS(Clean!$C$2:$C$5,\"North\",Clean!$E$2:$E$5,\">=1500\"). Expect 1.",
                "Repeat the count with West instead of North. Expect 0, because no teaching record meets that region condition."
              ],
              callout: {
                type: "definition",
                title: "Absolute reference",
                text: "The dollar signs in $E$2:$E$5 keep both column and row references fixed when a formula is copied. The formula syntax used here is the same in Google Sheets and Microsoft Excel with English function names."
              }
            },
            {
              heading: "Use an exact lookup with an honest failure",
              body: [
                "Create a Products tab with Product in A1 and Name in B1. Enter N1 and Notebook in row 2, then N2 and Folder in row 3. This small reference list translates codes without retyping names across the register. An exact match should find the requested code or expose its absence. Before relying on it, check that each code appears only once in the reference list, since a lookup can otherwise return the first conflicting entry."
              ],
              steps: [
                "Add Product name in Clean!G1, then enter =VLOOKUP(D2,Products!$A$2:$B$3,2,FALSE) in G2.",
                "Copy through G5 and check that N1 becomes Notebook and N2 becomes Folder.",
                "On Checks, test =VLOOKUP(\"N1\",Products!$A$2:$B$3,2,FALSE); expect Notebook.",
                "Test N9 in a second copy of the lookup; expect #N/A, then label the test as a deliberately missing code."
              ],
              callout: {
                type: "warning",
                title: "Do not hide missing matches",
                text: "FALSE requests an exact match. Do not remove it or replace a missing match with zero to make the workbook look finished. Resolve the reference data or label the issue clearly."
              }
            },
            {
              heading: "Build the checked formula workbook",
              body: [
                "A test is useful when someone can see the input, the expected answer and the actual result separately. Create a test table on Checks before adding decorative formatting. Keep the hand-calculated expectation independent of the formula you are testing. An expected value linked to that same formula will always agree, even when both are wrong. Finish this lesson with at least two labelled tests for each required formula and a separate total check."
              ],
              table: {
                columns: ["Formula", "Test one", "Test two"],
                rows: [
                  ["IF", "1499: Routine", "1500: Review"],
                  ["SUMIFS", "North, N2: 2100", "North, N1: 900"],
                  ["COUNTIFS", "North, sales >=1500: 1", "West, sales >=1500: 0"],
                  ["Exact lookup", "N1: Notebook", "N9: #N/A, missing-code test"],
                  ["Sales total", "900 + 1500 + 2100 + 500 = 5000", "SUM(Clean!E2:E5) = 5000"]
                ]
              },
              callout: {
                type: "tip",
                title: "Keep tests readable",
                text: "Use columns for test name, input, expected, actual and pass or investigate. A deliberately missing-code test can pass because the lookup correctly exposes the missing code."
              }
            }
          ],
          practice: null,
          checkpoint: [
            {
              question: "What error would a test at exactly INR 1,500 catch in the review rule?",
              answer: "It catches a mistaken > comparison. The rule includes INR 1,500, so the result must be Review. Using > would incorrectly classify that boundary amount as Routine, even though higher test amounts still pass."
            },
            {
              question: "Why are fixed ranges useful when copying the regional SUMIFS tests?",
              answer: "They stop the data ranges from shifting as the formula is copied. Keep the criteria and amount ranges aligned, then deliberately change the region or product criterion. Otherwise a formula may omit a record while still returning a plausible amount."
            },
            {
              question: "An exact lookup returns #N/A for N9 in a labelled test. Has that test necessarily failed?",
              answer: "No. If N9 was deliberately absent from the reference list, #N/A is the expected result and the test passes. An unexpected missing code in live practice data needs investigation rather than being silently replaced with a value."
            }
          ]
        }
      ]
    },
    {
      week: 2,
      theme: "Summarise the story and make the workbook reusable",
      lessons: [
        {
          id: "spreadsheets-w2-l1",
          title: "Summarise the story",
          minutes: 60,
          objective: "Build a product-by-region pivot, compare consistent periods and write a management summary supported by the checked register.",
          sections: [
            {
              heading: "Build the management summary tab",
              body: [
                "A pivot groups the detailed records and calculates a summary without replacing the source. Start with one question: how much recorded sales value came from each product in each region? Include every clean record and the header row in the source range. Keep the pivot on a separate Summary tab so a reader can move between a finding and its supporting rows. Check the aggregation setting rather than assuming a numeric-looking field will be summed."
              ],
              steps: [
                "Select Clean!A1:E5, then choose Insert > Pivot table in Google Sheets and place it on a new sheet named Summary.",
                "Add Product under Rows, Region under Columns and Sales under Values.",
                "Set Sales to summarise by SUM; leave all teaching records included and show totals.",
                "Label the result Recorded completed sales, INR, 2 to 3 November 2026.",
                "Microsoft Excel: choose Insert > PivotTable, then use the same row, column and value fields; check Value Field Settings is Sum."
              ],
              callout: {
                type: "warning",
                title: "Count is not sales value",
                text: "A count of four records and a sum of INR 5,000 answer different questions. If the pivot offers a count unexpectedly, inspect the source values and choose the intended measure."
              }
            },
            {
              heading: "Read the table before writing a conclusion",
              body: [
                "Read across a product row to compare regions, then down a region column to compare products. For these teaching records, N2 contributes more sales value than N1 in both regions. That does not establish which product earns more profit, because there are no cost figures. Use the reference list to translate N1 and N2 for a non-technical reader. Keep the codes visible somewhere so the labels remain traceable to the original records."
              ],
              table: {
                columns: ["Product", "North, INR", "South, INR", "Total, INR"],
                rows: [
                  ["N1, Notebook", "900", "500", "1400"],
                  ["N2, Folder", "2100", "1500", "3600"],
                  ["Total", "3000", "2000", "5000"]
                ]
              },
              callout: {
                type: "example",
                title: "Use the right denominator",
                text: "N2 is INR 3,600 out of INR 5,000 recorded sales, or 72%. That is a share of sales value, not a share of units, orders or profit. Label the measure explicitly."
              }
            },
            {
              heading: "Compare periods without changing the question",
              body: [
                "For a second view, copy the pivot and group the sales by sale date. The two dates in this example have totals of INR 2,400 and INR 2,600. The difference is INR 200, but two days do not establish a durable trend. In a larger assessment file, compare periods with matching definitions and coverage. A partial month should not be presented as a like-for-like comparison with a complete month without a visible explanation."
              ],
              steps: [
                "Create a second summary with Sale date as the row field and the sum of Sales as the value.",
                "Confirm the dates are recognised as dates and appear in chronological order.",
                "Check 2 November against K01 plus K02, and 3 November against K03 plus K04.",
                "Note whether each period is complete; write one observed difference without inventing its cause."
              ],
              callout: {
                type: "tip",
                title: "Keep comparison conditions steady",
                text: "Use the same currency, order status and included regions when comparing periods. If any of those change, state the change before interpreting the difference."
              }
            },
            {
              heading: "Prepare a useful management summary",
              body: [
                "Place the reporting question, covered period and checked total above the pivot. Beneath it, write a finding, a limitation and a practical next step. A useful note for Kiran Stationery is to check N2 stock before the next reorder because it contributes INR 3,600 of INR 5,000 recorded sales. State that stock levels, costs and longer-term demand are absent. This turns the summary into a bounded decision aid rather than an unsupported sales forecast."
              ],
              bullets: [
                "Finding: N2 contributes INR 3,600 of the INR 5,000 recorded sales value.",
                "Limitation: this is a four-order teaching sample with no stock or cost data.",
                "Next step: Priya checks available N2 stock before recommending a reorder quantity.",
                "Assumption to test: the recorded mix is relevant to the next stock review."
              ],
              callout: {
                type: "definition",
                title: "Reconciliation",
                text: "Reconciliation means comparing independently obtained totals under the same rules, then explaining any difference. It is not editing one total until it matches the other."
              }
            }
          ],
          practice: {
            labId: "spreadsheets",
            instruction: "Revisit Clean the register and finish the regional summary. Independently add the retained South amounts, then compare your result with the lab feedback. Keep the lab calculation separate from the Kiran Stationery example."
          },
          checkpoint: [
            {
              question: "Why can the four-order example support a sales comparison but not a profit ranking?",
              answer: "The register contains sales amounts but no product costs or other expenses. N2 has greater recorded sales value, yet its profit could be lower. A profit comparison needs a defined cost basis and the missing cost evidence."
            },
            {
              question: "How would you independently check the total for 3 November in this example?",
              answer: "Find the source records dated 3 November, K03 at INR 2,100 and K04 at INR 500. Add them to obtain INR 2,600, then compare that value with the dated summary. Check the date interpretation as well as the addition."
            },
            {
              question: "What should change in a summary label if one reporting month is still incomplete?",
              answer: "Label it as month-to-date and show the last included date. Do not imply it covers the full month. Either compare equivalent elapsed periods or explain that the different coverage limits the comparison."
            }
          ]
        },
        {
          id: "spreadsheets-w2-l2",
          title: "Check and hand over",
          minutes: 60,
          objective: "Audit the workbook, test an update and deliver the clean-data tab, summary, test evidence and decision note required for assessment.",
          sections: [
            {
              heading: "Reconcile the cleaning trail and the report",
              body: [
                "Begin the final audit with scope, not colour. Confirm that Raw, Clean and Summary describe the same reporting period and currency, allowing only documented exclusions. For a duplicate-only teaching copy, INR 7,100 less the excluded INR 2,100 reconciles to INR 5,000. Also check the row counts. Where missing amounts prevent a complete total, record the unresolved count and reporting limitation instead of pretending that a numerical reconciliation proves the file is complete."
              ],
              table: {
                columns: ["Check", "Teaching expectation", "Evidence to keep"],
                rows: [
                  ["Clean records", "4 included orders", "Order ID list"],
                  ["Clean sales total", "INR 5000", "SUM and independent addition"],
                  ["Regional totals", "3000 + 2000 = 5000", "Regional formula checks"],
                  ["Product totals", "1400 + 3600 = 5000", "Product pivot"],
                  ["Formula tests", "At least 2 per required formula", "Expected and actual results"]
                ]
              },
              callout: {
                type: "warning",
                title: "Separate unresolved work",
                text: "A total can reconcile while an unknown region still affects regional reporting. Record unresolved classifications and disclose which comparisons they limit."
              }
            },
            {
              heading: "Test the next update in a copy",
              body: [
                "A reusable workbook must handle the next valid record without silently losing it. Make an update-test copy and add K05, dated 4 November 2026, North, N1, with sales of INR 700. The new total should be INR 5,700. The original workbook must remain unchanged during this test. Fixed ranges ending at row 5 will not include the new row, so the handover needs an explicit range-extension and refresh procedure."
              ],
              steps: [
                "In the update-test copy, add K05 in Clean row 6 and fill the review and lookup formulas into that row.",
                "Extend all relevant SUMIFS, COUNTIFS and total ranges to include row 6.",
                "In the Google Sheets pivot editor, change the source range to include row 6 and inspect the refreshed result.",
                "Check the new total of 5700, North total of 3700 and N1 total of 2100.",
                "Microsoft Excel: use PivotTable Analyse > Change Data Source if needed, then Refresh; inspect formula ranges separately.",
                "Record the successful update steps; keep the original four-order evidence distinct from the test copy."
              ],
              callout: {
                type: "tip",
                title: "A successful refresh is observable",
                text: "Do not stop at clicking Refresh. Confirm the new order appears in the source range and changes the expected region, product and grand totals."
              }
            },
            {
              heading: "Write a decision note with boundaries",
              body: [
                "Use a short note that another person can act on without searching the workbook for its meaning. State the question, cite the source figures, explain a limitation and name the next check. Keep observations separate from assumptions. For the teaching example, recommending a stock check is supported; recommending an exact purchase quantity is not, because the file contains neither stock on hand nor unit demand. Use the checked original version, not the update-test copy, for this note."
              ],
              callout: {
                type: "example",
                title: "A bounded handover note",
                text: "N2 accounts for INR 3,600 of INR 5,000 recorded sales on 2 to 3 November. Priya should check N2 stock by 6 November before proposing a reorder. This assumes the small sample is relevant to that review; stock, costs and longer-term demand still need checking."
              },
              bullets: [
                "Identify the workbook version and the Summary cells or table containing the cited figures.",
                "Name one supported action, one assumption and the information still missing.",
                "Describe this as fictional practice; do not imply that a real business used the recommendation."
              ]
            },
            {
              heading: "Assemble the reusable reporting workbook",
              body: [
                "Your assessment submission should let a reviewer retrace the work from raw records to the decision note. Include the clean-data tab, column dictionary, cleaning log, formula tests and product-by-region pivot. Add a brief handover explaining how to paste new records, extend ranges and check results. Review access before sharing and use fictional records only. The finished workbook is evidence of the work you performed, not evidence that an untested business recommendation achieved a result."
              ],
              steps: [
                "Check that IF, SUMIFS, COUNTIFS and the exact-match lookup each have two labelled expected-versus-actual tests.",
                "Confirm the original data remain available, all changes are logged and unresolved items are visible.",
                "Open the workbook as a reader: check labels, number formats, formula results and the decision note.",
                "Add the update instructions, file version and your source references to a Handover tab.",
                "Save or share the workbook with appropriate access, then reopen the delivered version to confirm the evidence is present."
              ],
              callout: {
                type: "tip",
                title: "Explain the work in plain language",
                text: "Practise describing one repair, one formula test, one reconciled pivot and one limitation. Point to the cells that support each explanation."
              }
            }
          ],
          practice: null,
          checkpoint: [
            {
              question: "After adding K05 for INR 700, what three totals demonstrate that the update reached the right groups?",
              answer: "The grand total becomes INR 5,700, North becomes INR 3,700 and N1 becomes INR 2,100. Checking all three helps reveal a new record that was omitted, assigned to the wrong group or included only in part of the workbook."
            },
            {
              question: "Why should the update-test copy not silently become the evidence for the original decision note?",
              answer: "It contains an added fictional test order that was not in the original reporting scope. Keep versions clearly labelled, or deliberately update the note and its scope. Otherwise the cited figures and the delivered source no longer describe the same records."
            },
            {
              question: "What handover information would help Rohit update the workbook next week without guessing?",
              answer: "State where new records belong, which formulas and pivot ranges must expand, how to refresh and which totals to recheck. Include the dictionary, reporting boundaries and unresolved items so Rohit preserves the same meanings as well as the calculations."
            }
          ]
        }
      ]
    }
  ],
  deck: {
    title: "Live workshop: from register to checked decision note",
    slides: [
      {
        kind: "title",
        title: "A workbook you can explain",
        subtitle: "0-3 minutes: a practical sales-reporting workshop",
        illustration: "spreadsheets",
        notes: "Today we will turn a small fictional register into a checked management note. Ask learners to open their practice copy and identify the Raw and Clean tabs before we change anything."
      },
      {
        kind: "content",
        title: "Our 60-minute route",
        subtitle: "3-5 minutes: agree the work and evidence",
        bullets: [
          "5-19 minutes: inspect the register and define the fields.",
          "19-33 minutes: build formulas and test a missing match.",
          "33-47 minutes: build and interpret the summary.",
          "47-60 minutes: test an update and explain the handover."
        ],
        notes: "We will keep a visible Checks tab throughout the session. Ask each learner to name one piece of evidence they expect a reviewer to find at the end."
      },
      {
        kind: "content",
        title: "Know what a number means",
        subtitle: "5-10 minutes: inspect the dictionary",
        bullets: [
          "One teaching row is one completed order.",
          "Sales are INR amounts excluding tax and delivery.",
          "An ID is text; a sale date must be a recognised date.",
          "Unknown values stay visible until evidence resolves them."
        ],
        notes: "Ask learners to read the dictionary as if they were receiving the workbook for the first time. Discuss how a correct total could still mislead if the currency or included charges were not stated."
      },
      {
        kind: "steps",
        title: "Inspect and preserve",
        subtitle: "10-16 minutes: guided cleaning activity",
        steps: [
          "Keep Raw unchanged and work on Clean.",
          "Inspect labels, blanks, dates and numeric text.",
          "Record each change with its ID, evidence and reason.",
          "Verify the four teaching amounts add to INR 5,000."
        ],
        notes: "Give learners three minutes to inspect their copy and write one cleaning-log entry. Ask someone to explain why an unresolved blank needs a different treatment from a removable space."
      },
      {
        kind: "question",
        title: "Live poll: keep records together",
        subtitle: "16-19 minutes: vote, then explain",
        question: {
          prompt: "You want the largest sale first while preserving each order's details. What should you sort?",
          options: ["Only the Sales cells", "The complete table by Sales", "Only the order IDs", "Each column separately"],
          answerIndex: 1,
          explanation: "Sort the complete table so the date, region and product remain attached to their order. Sorting just the amounts can silently assign another order's value to a record."
        },
        notes: "Ask for a vote before revealing the answer. Demonstrate how sorting only one column breaks the relationship between an order ID and its amount, even when the grand total stays unchanged."
      },
      {
        kind: "steps",
        title: "Build and test the calculations",
        subtitle: "19-25 minutes: work in the formula workbook",
        steps: [
          "Apply the IF review rule and test both sides of its boundary.",
          "Use SUMIFS to add matching sales and COUNTIFS to count matching records.",
          "Keep ranges aligned and fix references where copying must not move them.",
          "Record the expected answer before inspecting the calculated result."
        ],
        notes: "Let learners enter one regional formula and compare it with a hand calculation. Ask why a count and a currency total need different labels even when they come from the same rows."
      },
      {
        kind: "content",
        title: "Lookup results need evidence too",
        subtitle: "25-30 minutes: reference-list exercise",
        bullets: [
          "N1 maps to Notebook and N2 maps to Folder.",
          "Use an exact match and a fixed reference range.",
          "Check reference keys for duplicates before trusting the result.",
          "Keep a missing-code test separate from unresolved source errors."
        ],
        notes: "Ask learners to test both a known code and an absent code. Explain that a lookup can behave as designed while the reference list itself is incomplete or contradictory."
      },
      {
        kind: "question",
        title: "Live poll: a conflicting reference list",
        subtitle: "30-33 minutes: vote, then inspect",
        question: {
          prompt: "The Products tab lists N1 twice with different names. What should happen before using its lookup results?",
          options: ["Keep the shorter name", "Accept the first match", "Resolve the conflicting key", "Add the two names together"],
          answerIndex: 2,
          explanation: "A reference key should identify one intended entry. An exact lookup may return the first match, so resolve the conflicting source entries rather than treating a returned value as proof of correctness."
        },
        notes: "Pause for a vote and ask what evidence would settle the conflict. Reinforce that formula correctness and source correctness are separate checks."
      },
      {
        kind: "steps",
        title: "Build the management view",
        subtitle: "33-39 minutes: guided pivot build",
        steps: [
          "Select the clean table and insert a pivot on Summary.",
          "Group by product and region, using the sum of Sales.",
          "Compare the grand total with the independent INR 5,000 check.",
          "Add the reporting period, currency and source reference."
        ],
        notes: "Give learners time to build the pivot rather than watching only the demonstration. Ask them to point to a source record that contributes to one chosen summary cell."
      },
      {
        kind: "content",
        title: "Say what the summary can support",
        subtitle: "39-44 minutes: write a finding",
        bullets: [
          "N2 contributes INR 3,600 of the INR 5,000 teaching total.",
          "The file describes sales value, not profit or stock availability.",
          "Recommend checking stock before proposing a reorder quantity.",
          "Keep the small sample and missing evidence visible."
        ],
        notes: "Ask learners to draft a two-sentence note with one finding and one limitation. Read one example aloud and replace any unsupported cause or forecast with a specific next check."
      },
      {
        kind: "question",
        title: "Live poll: a check that cannot disagree",
        subtitle: "44-47 minutes: vote, then improve the test",
        question: {
          prompt: "The Expected cell links directly to the formula in Actual. What is the main weakness of this test?",
          options: ["It has too few colours", "It will always disagree", "It checks two currencies", "It is not independent"],
          answerIndex: 3,
          explanation: "Expected and Actual repeat the same calculation, so they can agree while sharing the same error. Work out the expected result separately from the input records or a small controlled case."
        },
        notes: "Ask learners to vote, then rewrite one expected value from the source records. Discuss why agreement is useful only when the comparison can expose a mistake."
      },
      {
        kind: "steps",
        title: "Run the update test",
        subtitle: "47-53 minutes: add a record in a copy",
        steps: [
          "Create an update-test copy and add K05, North, N1, INR 700.",
          "Extend formula and pivot source ranges, then refresh.",
          "Check grand total 5700, North 3700 and N1 2100.",
          "Keep the original reporting version and the test version distinct."
        ],
        notes: "Give learners four minutes to run the test and note any range that did not expand. Ask them to explain the expected changes before they inspect the refreshed numbers."
      },
      {
        kind: "content",
        title: "Practise the handover",
        subtitle: "53-57 minutes: explain your work to a classmate",
        bullets: [
          "Show one source repair and its log entry.",
          "Show one formula test and one reconciled summary total.",
          "Explain one recommendation and its missing evidence.",
          "Tell the next reader how to add records and recheck the report."
        ],
        notes: "Invite learners to give a short handover to a classmate, using cells rather than broad claims. Ask listeners to identify one instruction that would otherwise require guessing."
      },
      {
        kind: "summary",
        title: "A clear workbook has a visible checking trail",
        subtitle: "57-60 minutes: final assessment readiness check",
        bullets: [
          "Preserve Raw, define fields and log the cleaning.",
          "Test all four required formulas with expected and actual results.",
          "Reconcile the product-by-region summary to the source.",
          "Submit the decision note and tested update instructions."
        ],
        notes: "Ask learners to identify their next unfinished acceptance check. Close by reminding them that a readable workbook explains both its useful finding and the limits of the available records."
      }
    ]
  },
  interview: {
    intro: "Use your fictional workbook as evidence for entry-level reporting and business-support discussions. Adapt these guides to work you actually completed. Explain the checking process and its limits rather than implying that a real business adopted your recommendation.",
    questions: [
      {
        question: "How do you decide what belongs in a spreadsheet column dictionary?",
        type: "concept",
        answerGuide: [
          "Define what one row represents before describing individual fields.",
          "Record each column's meaning, data type, permitted values and units.",
          "Include boundaries such as completed orders only and excluded charges.",
          "Explain how the dictionary prevents inconsistent cleaning and reporting."
        ],
        tip: "Use a field from your own practice workbook to make the explanation concrete."
      },
      {
        question: "What is the difference between a correct formula and a trustworthy result?",
        type: "concept",
        answerGuide: [
          "A formula may follow its syntax while using the wrong range or business rule.",
          "Check source meaning, completeness and reference data as well as calculation logic.",
          "Use independent expected values and boundary tests to expose errors.",
          "Describe an unresolved issue openly instead of hiding it with formatting."
        ],
        tip: "Separate source quality, formula logic and reporting interpretation in your answer."
      },
      {
        question: "A colleague adds new orders, but the management summary stays unchanged. How would you investigate?",
        type: "scenario",
        answerGuide: [
          "Confirm the added records belong in the reported period and meet the inclusion rules.",
          "Inspect formula ranges and the pivot source range for the new rows.",
          "Refresh the pivot where required and inspect any active filters.",
          "Check the expected grand total and affected groups before updating the handover."
        ],
        tip: "Describe a controlled check rather than promising that Refresh will solve every issue."
      },
      {
        question: "You receive a file with several product lines for each order. What changes in your reporting approach?",
        type: "scenario",
        answerGuide: [
          "Update the row definition to one product line rather than one order.",
          "Check whether the sales field contains line value or a repeated order total.",
          "Do not treat a simple row count as an order count.",
          "Define a distinct-order method and reconcile it to the source IDs."
        ],
        tip: "Explain the risk of double counting before discussing a particular tool feature."
      },
      {
        question: "Show how you would test a review rule that starts at a stated sales threshold.",
        type: "practical",
        answerGuide: [
          "State whether the boundary amount is included in the rule.",
          "Prepare values just below, exactly at and above the threshold.",
          "Write expected labels independently and compare them with IF outputs.",
          "Explain how a mistaken comparison operator would appear in the results."
        ],
        tip: "Use small labelled cases so the interviewer can check the reasoning without a large file."
      },
      {
        question: "Demonstrate an exact-match lookup and explain your missing-code test.",
        type: "practical",
        answerGuide: [
          "Show the reference list with a unique code and a clear return column.",
          "Explain the exact-match argument and fixed lookup range.",
          "Test a known code and a deliberately absent code.",
          "Distinguish a passing failure-case test from a genuine unresolved source problem."
        ],
        tip: "Do not conceal an error value before explaining what it tells you."
      },
      {
        question: "Tell me about a time in this practice task when checking changed your approach.",
        type: "behavioural",
        answerGuide: [
          "Name the actual fictional exercise and the check you were attempting.",
          "Describe the discrepancy or uncertainty you genuinely observed.",
          "Explain the repair, retest or unresolved note you created.",
          "State what the revised evidence shows without inventing a business impact."
        ],
        tip: "If no error occurred, describe a useful preventive check rather than fabricating a mistake."
      },
      {
        question: "How did you make your workbook understandable to someone who did not build it?",
        type: "behavioural",
        answerGuide: [
          "Describe the tab structure, dictionary and consistent labels you used.",
          "Show the source-to-summary checking trail and the short decision note.",
          "Explain how you tested the next-record update in a separate copy.",
          "Mention any feedback you actually received, or explain your own reader review."
        ],
        tip: "Point to a specific handover instruction instead of only saying the workbook is user-friendly."
      }
    ]
  },
  glossary: [
    { term: "Column dictionary", definition: "A written description of each field's meaning, type, permitted values and units, used to keep cleaning and reporting consistent." },
    { term: "Data type", definition: "The kind of value a field holds, such as text, number or date. Display formatting alone does not establish the underlying type." },
    { term: "Duplicate", definition: "A repeated record confirmed to represent the same event under the dataset's rules, not merely two rows with some matching values." },
    { term: "Relative reference", definition: "A cell reference that changes position when a formula is copied, allowing each row to use its own input." },
    { term: "Absolute reference", definition: "A reference fixed with dollar signs so its specified row or column does not shift when the formula is copied." },
    { term: "Exact-match lookup", definition: "A lookup that returns data for the requested key only, rather than choosing an approximate match when that key is absent." },
    { term: "Pivot summary", definition: "A grouped view of source records that calculates measures such as sums or counts without replacing the detailed register." },
    { term: "Reconciliation", definition: "A comparison of independently obtained figures under the same rules, with differences investigated and explained." },
    { term: "Boundary test", definition: "A test at the edge of a rule, often alongside values just below and above it, used to check whether the condition is applied correctly." },
    { term: "Audit trail", definition: "The retained records, change notes and checks that allow another reader to trace a reported result back to its source." }
  ]
};
