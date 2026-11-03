export default {
  moduleId: "dashboards",
  tagline: "Turn a clean source sheet into a one-page report whose measures, filters and recommendations can be checked.",
  weeks: [
    {
      week: 1,
      theme: "Start with a decision and build the first reporting view",
      lessons: [
        {
          id: "dashboards-w1-l1",
          title: "Start with a decision",
          minutes: 60,
          objective: "Define three sales KPIs and connect a fictional source, producing a checklist that records scope, field types and reporting rules.",
          sections: [
            {
              heading: "Write the reporting question first",
              body: [
                "Use Looker Studio to help Priya at fictional Sundar Traders review completed sales by region. The decision is which regional records and pipeline need attention before setting the next sales plan. Start from that question, not a favourite chart. You need basic spreadsheet skills and access to a learning account that can read the source. Use the supplied fictional data through Google Sheets; this exercise needs no paid connector."
              ],
              bullets: [
                "Audience: a sales manager reviewing recorded activity.",
                "Question: how do completed sales, order count and order value differ by region?",
                "Default period: 1 to 30 November 2026, using the order completion date.",
                "Boundary: fictional practice, with no evidence about profit or individual performance."
              ],
              callout: {
                type: "definition",
                title: "KPI",
                text: "A key performance indicator is a defined measure used to review a specific business question. Its calculation, unit, qualifying records and reporting period must be explicit."
              }
            },
            {
              heading: "Define exactly three measures",
              body: [
                "The dashboard will show completed sales, completed order count and average completed order value. Keep the same status rule and date range for all three so the figures can be interpreted together. Count only records whose Status is Completed. In this example each row is one order and every OrderID is unique. An average should divide the included sales total by the included order count, not average the regional averages without considering their different counts."
              ],
              table: {
                columns: ["KPI", "Definition", "Unit", "Empty selection"],
                rows: [
                  ["Completed sales", "Sum Sales for Completed orders in the selected dates", "INR", "Show no records, not a stale value"],
                  ["Completed orders", "Distinct OrderID count under the same conditions", "Orders", "Zero records or a clear no-data state"],
                  ["Average order value", "Completed sales divided by completed orders", "INR per order", "Not available when the count is zero"]
                ]
              },
              callout: {
                type: "warning",
                title: "Distinct count does not repair the source",
                text: "Counting distinct IDs can avoid counting a repeated ID twice, but duplicated sales rows can still inflate the sales sum. Check the source for one valid row per order before connecting it."
              }
            },
            {
              heading: "Inspect the fictional source records",
              body: [
                "Create a Google Sheets tab named Source with these five headers in columns A to E and the six records in rows 2 to 7. Format SaleDate as a date and Sales as a number. The November completed records are S02, S03 and S04, totalling INR 5,400 across three orders. S01 belongs to October, while S05 and S06 are not completed. Keep those excluded records so you can test whether the report applies its rules correctly."
              ],
              table: {
                columns: ["OrderID", "SaleDate", "Region", "Status", "Sales, INR"],
                rows: [
                  ["S01", "2026-10-31", "North", "Completed", "800"],
                  ["S02", "2026-11-02", "North", "Completed", "1200"],
                  ["S03", "2026-11-03", "North", "Completed", "1800"],
                  ["S04", "2026-11-03", "South", "Completed", "2400"],
                  ["S05", "2026-11-04", "South", "Cancelled", "900"],
                  ["S06", "2026-11-04", "North", "Pending", "600"]
                ]
              },
              callout: {
                type: "example",
                title: "A source-to-report expectation",
                text: "For November completed orders, sales are INR 5,400, order count is 3 and average order value is INR 1,800. The source's unfiltered INR 7,700 is not the expected dashboard sales total."
              }
            },
            {
              heading: "Connect the source and record its settings",
              body: [
                "Create a blank report and add the Google Sheets source you just prepared. Select the intended workbook and Source worksheet, not an old copy with similar names. In the field list, inspect names, types and default aggregations before adding charts. Record the source filename, worksheet, row meaning and last checked date in your checklist. A successful connection only means the report can read something; it does not prove that the correct records or types were selected."
              ],
              steps: [
                "Create a blank Looker Studio report, choose Add data and select the Google Sheets connector.",
                "Grant only the access needed for the learning source, select the workbook and Source tab, and use the first row as headers.",
                "Confirm OrderID, Region and Status are text; SaleDate is Date; Sales is numeric with Sum as its intended aggregation.",
                "Add the source to the report and inspect a small table of its fields against the six source rows.",
                "Record the connection, field types and source scope in your KPI and source checklist.",
                "Microsoft Excel route: save the fictional table as CSV, import it into Google Sheets and check types again before connecting."
              ],
              callout: {
                type: "tip",
                title: "Keep the source private",
                text: "Use fictional records and restricted sharing. Do not publish a sheet to the open web just to make a connection work; first check that the learning account has the intended access."
              }
            },
            {
              heading: "Common mistakes and how to avoid them",
              body: [
                "The first reporting errors often happen before a chart exists. Write down what qualifies for each measure and prove that the connected source can supply it."
              ],
              bullets: [
                "Choosing a favourite chart first → name the reader's decision and select measures that answer it.",
                "Treating all INR 7,700 as November completed sales → exclude October, cancelled and pending records under the stated rule.",
                "Assuming connection means correct data → inspect the selected worksheet, field types and sample rows.",
                "Using distinct count to hide duplicate rows → resolve duplicates before summing sales as well as counting orders."
              ]
            },
            {
              heading: "What good looks like",
              body: [
                "A reviewer can use this checklist to approve the reporting setup before you spend time arranging charts. Each item needs visible evidence."
              ],
              bullets: [
                "The audience, reporting question and fictional source are named.",
                "Exactly three KPIs state their calculation, unit, qualifying records and period.",
                "The source checklist records the workbook, tab, row meaning, field types and check date.",
                "The source expectation is INR 5,400, three orders and INR 1,800 per order for November completed records.",
                "Excluded source rows remain available for testing, and sharing stays restricted."
              ]
            }
          ],
          practice: {
            labId: "dashboards",
            instruction: "Open Build an honest dashboard. Task 1: choose three decision KPIs for its sales scenario. Task 2: pick the chart for its monthly trend. Explain why the lab's KPI choices differ from this lesson's completed-order measures and identify the evidence each would need."
          },
          checkpoint: [
            {
              question: "Why is INR 7,700 not the expected November completed-sales total for the teaching source?",
              answer: "It includes every source row, including October's INR 800 and November's cancelled INR 900 and pending INR 600. Excluding those records under the stated rules leaves INR 5,400. The expected total must follow the KPI definition, not simply add the entire file."
            },
            {
              question: "What should you verify if SaleDate appears as a text field after connecting?",
              answer: "Check the source values and date convention, convert them to real dates in the source and refresh or reconnect the field metadata as needed. A text label that looks like a date may not support reliable date controls or chronological grouping."
            },
            {
              question: "What extra source information would be needed to calculate the lab's 90-day retention measure?",
              answer: "You would need a defined starting cohort and evidence of which members meet the retention rule after 90 days. Monthly leads and customer counts alone cannot establish retention. A useful KPI idea is not evidence that the displayed source can calculate it."
            }
          ]
        },
        {
          id: "dashboards-w1-l2",
          title: "Build the report",
          minutes: 60,
          objective: "Create a first dashboard draft with three correctly aggregated scorecards, a labelled regional comparison and readable reporting context.",
          sections: [
            {
              heading: "Plan a one-page reading order",
              body: [
                "Place the reporting question and covered period at the top, then the three scorecards, followed by a regional comparison and a short interpretation. Leave room for date and region controls in the next lesson. A manager should see the overall result before exploring detail. Avoid extra headline measures that distract from the three agreed KPIs. Use consistent labels and enough space around charts so their units and conditions remain visible when the page is shared."
              ],
              bullets: [
                "Top: question, fictional source name and reporting period.",
                "Middle: completed sales, completed orders and average order value.",
                "Below: a regional comparison with values and units.",
                "Footer: status rule, source freshness and one interpretation with a limitation."
              ],
              callout: {
                type: "tip",
                title: "Design for the reader's question",
                text: "A one-page report is not a storage place for every chart you can create. Keep only the views needed to understand the agreed question and check its answer."
              }
            },
            {
              heading: "Build all three scorecards with the same scope",
              body: [
                "Add one scorecard for each agreed measure. Apply an include filter where Status equals Completed to every scorecard and later to the comparison chart. Use SaleDate as the date-range field and begin with November 2026. For average order value, create an aggregated calculation from the sales sum and distinct order count. Keep the result as currency per order, not a percentage. A report that mixes qualifying records across scorecards creates an average that cannot be interpreted reliably."
              ],
              steps: [
                "Insert a scorecard, choose the Source data and set its metric to Sales with Sum aggregation.",
                "Add an include filter for Status equal to Completed; set SaleDate as the date-range dimension and November 2026 as the initial period.",
                "Duplicate the scorecard and change the metric to OrderID with Count Distinct aggregation; label it Completed orders.",
                "Create Average order value using SUM(Sales) / COUNT_DISTINCT(OrderID); use the field picker for the source names.",
                "Show that calculated metric in the third scorecard, with the same Completed filter and SaleDate scope.",
                "Compare the unrounded results with 5400, 3 and 1800 before applying readable number formats."
              ],
              callout: {
                type: "warning",
                title: "No denominator, no average",
                text: "When no orders qualify, the average is not available. Keep a clear no-data state or explanatory note rather than replacing an undefined average with an invented value."
              }
            },
            {
              heading: "Make the regional comparison readable",
              body: [
                "Add a horizontal bar chart with Region as the dimension and the sum of Sales as the metric. Apply the same Completed filter and date scope as the scorecards. The November values should be INR 3,000 for North and INR 2,400 for South. Use a common zero baseline and show direct value labels where they remain readable. A region comparison is a category comparison; it should not imply a time sequence simply because the labels can be sorted."
              ],
              steps: [
                "Insert a horizontal bar chart and select Region as its dimension and Sum of Sales as its metric.",
                "Apply the Completed status filter and SaleDate date-range dimension used by the scorecards.",
                "Set a common zero baseline, show values and label the chart Completed sales by region, INR.",
                "Check each bar against its source orders; North uses S02 and S03, while South uses S04.",
                "Remove unnecessary decoration and inspect the chart at the size a reader will actually use."
              ],
              callout: {
                type: "example",
                title: "Different views answer different questions",
                text: "A line chart is useful for the lab's ordered monthly trend. A regional bar chart suits this assessment question. Choose the chart from the comparison, not from a rule that one chart is always best."
              }
            },
            {
              heading: "Explain averages and labels accurately",
              body: [
                "North has two completed November orders worth INR 3,000, so its average order value is INR 1,500. South has one worth INR 2,400. The overall average is INR 5,400 divided by three, or INR 1,800. Taking a simple mean of INR 1,500 and INR 2,400 would give INR 1,950 and wrongly give the regions equal weight. Keep the same calculation when controls change the included records, and retain currency and period labels beside the result."
              ],
              table: {
                columns: ["Scope", "Sales, INR", "Orders", "Average, INR per order"],
                rows: [
                  ["North, November", "3000", "2", "1500"],
                  ["South, November", "2400", "1", "2400"],
                  ["All regions, November", "5400", "3", "1800"]
                ]
              },
              callout: {
                type: "tip",
                title: "Round for display, not for checking",
                text: "Reconcile the underlying numbers first. Choose a consistent display precision afterwards, and document any rounding so a small display difference is not mistaken for a source error."
              }
            },
            {
              heading: "Common mistakes and how to avoid them",
              body: [
                "A readable page still needs consistent calculations. Inspect how each component obtains its value before accepting the appearance of agreement."
              ],
              bullets: [
                "Averaging regional averages → divide combined sales by the combined qualifying order count.",
                "Filtering only a headline card → apply the same completion rule and dates to every relevant component.",
                "Using a line to imply regional sequence → use bars for categories and a chronological line for a time trend.",
                "Rounding until values look equal → reconcile unrounded values first, then choose a stated display precision."
              ]
            },
            {
              heading: "What good looks like",
              body: [
                "Tick these against the report in viewing mode and its calculation settings. A draft is useful when its structure and its numbers can both be inspected."
              ],
              bullets: [
                "Three scorecards share the Completed filter and SaleDate reporting scope.",
                "The overall values are INR 5,400, three orders and INR 1,800 per order before display rounding.",
                "The regional bars show North INR 3,000 and South INR 2,400 on a shared zero baseline.",
                "Headings, units, reporting period and source context are readable at normal size.",
                "The average uses total sales divided by qualifying orders and has a clear no-denominator treatment."
              ]
            }
          ],
          practice: {
            labId: "dashboards",
            instruction: "Open Build an honest dashboard. Task 1: justify the three decision KPIs rather than adding decorative measures. Task 2: select the monthly-trend chart and explain its ordered time axis. Keep the lab's scenario separate from your regional completed-sales report."
          },
          checkpoint: [
            {
              question: "Why would averaging the two regional average order values give the wrong overall result here?",
              answer: "The regions contain different numbers of orders. A simple mean gives each region equal weight, producing INR 1,950. Dividing the combined INR 5,400 by the combined three orders correctly gives INR 1,800."
            },
            {
              question: "A scorecard is filtered to Completed, but its comparison chart includes every status. What needs changing?",
              answer: "Apply the same Completed status rule to the chart and verify its date scope. Otherwise the bars and headline sales describe different populations. Recheck the regional amounts and their total after correcting the settings."
            },
            {
              question: "Why should you compare raw values before formatting scorecards to whole rupees?",
              answer: "Formatting can hide small differences or make separate calculations appear equal. Check the unrounded source and report results first, then use an agreed display precision. Record rounding as a presentation choice rather than a correction to the data."
            }
          ]
        }
      ]
    },
    {
      week: 2,
      theme: "Test the controls and reconcile every reported measure",
      lessons: [
        {
          id: "dashboards-w2-l1",
          title: "Make it usable",
          minutes: 60,
          objective: "Add date and region controls, document combined-filter and no-records tests, and distinguish missing data from genuine zero values.",
          sections: [
            {
              heading: "Add two controls with a clear scope",
              body: [
                "Add a date-range control and a region dropdown to the one-page report. Controls should affect all three scorecards and the comparison chart, not only the item nearest them on the page. Keep their labels visible and test them in viewing mode as a reader would. Use the same data source across these components and remove chart-specific dates that override the intended control. The default opening view should return to the agreed November period and all regions."
              ],
              steps: [
                "Insert a date-range control and set its default to 1 to 30 November 2026.",
                "Confirm each chart uses SaleDate as its date-range dimension; set its default date range to Auto so the date control, rather than a fixed chart range, governs it.",
                "Insert a dropdown control using Region and label it Region.",
                "Check that all scorecards and the comparison chart use the same compatible source and respond to both controls.",
                "Switch to viewing mode, change each control and test clearing the region selection and resetting the date range."
              ],
              callout: {
                type: "tip",
                title: "State what the reader is seeing",
                text: "Keep selected dates and region visible. A screenshot without its filter context can make a correct number look like an incorrect company-wide total."
              }
            },
            {
              heading: "Write expectations before clicking",
              body: [
                "Build a small test log with filter state, expected values, observed values and result. Calculate the expected result from source rows before using the dashboard. Test a combined date and region selection, then reset it and confirm the opening view returns. This catches controls that work individually but have an unexpected scope when combined. Keep screenshots or short observations with the log, including the filter labels, so another person can repeat the same test."
              ],
              table: {
                columns: ["Date selection", "Region", "Expected sales, INR", "Expected orders", "Expected average, INR"],
                rows: [
                  ["November 2026", "All", "5400", "3", "1800"],
                  ["November 2026", "North", "3000", "2", "1500"],
                  ["November 2026", "South", "2400", "1", "2400"],
                  ["31 October 2026 only", "North", "800", "1", "800"],
                  ["3 November 2026 only", "North", "1800", "1", "1800"]
                ]
              },
              callout: {
                type: "example",
                title: "Test an inclusive end date",
                text: "With North selected and dates from 2 to 3 November, both S02 and S03 should be included. If S03 disappears, inspect the date type and boundary settings rather than changing the expected result."
              }
            },
            {
              heading: "Treat no records and zero sales differently",
              body: [
                "Select 4 November only. The source has pending and cancelled records on that date but no completed orders, so the report should not retain an earlier completed-sales value. Record the actual no-data display and add a nearby explanation if the chart cannot show a custom message. A genuine completed order worth zero would be different: it would contribute one order and zero sales. Do not turn missing data into a business result merely to keep every scorecard filled."
              ],
              steps: [
                "Select 4 November 2026 only, with all regions, and confirm no completed records qualify.",
                "Record the observed empty-state behaviour for each scorecard and the chart.",
                "Use a clear no-records label or an adjacent note explaining the empty display; do not keep stale values.",
                "Clear the test selections and verify the November totals return to 5400, 3 and 1800."
              ],
              callout: {
                type: "definition",
                title: "Zero versus missing",
                text: "Zero is a known numeric amount. Missing means the amount or qualifying record is unavailable. An average over no orders is undefined, not the same as an average of zero-value orders."
              }
            },
            {
              heading: "Inspect gaps before trusting an interactive view",
              body: [
                "A missing date can make an otherwise valid order disappear from a date-controlled report. A missing amount can leave the order count intact while reducing the sales sum and average. Check these cases in a separate test copy, not by corrupting the source you plan to submit. Restore the verified source afterwards and record your observations. The interactive view is ready only when a reader can distinguish a valid empty selection from an unresolved source-quality problem."
              ],
              table: {
                columns: ["Test condition", "Risk", "Responsible response"],
                rows: [
                  ["Blank SaleDate", "Order may fall outside date controls", "Resolve the source date or disclose exclusion"],
                  ["Blank Sales", "Count and sales describe unequal completeness", "Resolve amount; do not assume zero"],
                  ["Blank Region", "Regional totals may hide unclassified orders", "Show or document the unclassified group"],
                  ["No qualifying records", "Empty result may be mistaken for failure", "Explain the selected state and how to reset"]
                ]
              },
              callout: {
                type: "warning",
                title: "Do not force a tidy result",
                text: "Never fill a missing region with the largest region or replace an unknown amount with zero. Record the uncertainty and how it affects the reported measures."
              }
            },
            {
              heading: "Common mistakes and how to avoid them",
              body: [
                "Interactive controls can produce a convincing but inconsistent page. Test what every component actually shows, including selections that return no records."
              ],
              bullets: [
                "Testing only one card after filtering → check all three scorecards and the comparison chart for the same selection.",
                "Leaving fixed dates on a chart → remove overrides that prevent the date control from governing it.",
                "Filling an empty average with zero → show no records when there is no denominator, and distinguish a genuine zero-value order.",
                "Keeping evidence without filter labels → record the exact dates, region, expected values, observations and reset result."
              ]
            },
            {
              heading: "What good looks like",
              body: [
                "These checks should be supported by observations from viewing mode. Expected figures alone do not prove that the controls worked."
              ],
              bullets: [
                "Date and Region controls visibly affect all intended report components.",
                "November plus North gives INR 3,000, two orders and INR 1,500 per order.",
                "The 4 November selection shows no qualifying completed records and no stale average.",
                "Resetting restores November, all regions and the 5400, 3 and 1800 headline values.",
                "Missing-date, missing-sales and missing-region risks are logged separately from valid empty selections."
              ]
            }
          ],
          practice: {
            labId: "dashboards",
            instruction: "Return to Build an honest dashboard. Task 3: check each tile's customers divided by leads and select the inconsistent conversion. Record its numerator, denominator and displayed rate. Then apply the same scope check to your report's separate date-and-region tests."
          },
          checkpoint: [
            {
              question: "What does a reset test add beyond checking the date and region controls once?",
              answer: "It verifies that the reader can return to the agreed starting scope and that no hidden selection remains. After resetting to November and all regions, the teaching report should again show INR 5,400, three orders and INR 1,800 per order."
            },
            {
              question: "Why can a blank sales amount distort average order value even when order IDs are complete?",
              answer: "The count can include the order while the sales sum ignores its missing amount. The resulting average uses a complete denominator and an incomplete numerator. Resolve or disclose the missing amount rather than treating that average as fully verified."
            },
            {
              question: "How does a known zero-value completed order differ from a selection with no completed orders?",
              answer: "The zero-value order is a real included record, so it increases the order count and has a known sales amount of zero. With no completed orders there is no denominator for average order value. The report should preserve that distinction."
            }
          ]
        },
        {
          id: "dashboards-w2-l2",
          title: "Check the numbers",
          minutes: 60,
          objective: "Reconcile all three KPIs, complete a five-point validation checklist and present a verified dashboard with one supported recommendation.",
          sections: [
            {
              heading: "Calculate an independent source check",
              body: [
                "Create a Checks tab beside the Source tab in Google Sheets. Calculate the November completed-sales total and order count directly from the source conditions, then divide those checked figures for the average. Because the teaching source has unique order IDs and one row per order, COUNTIFS gives the same order count as the report's distinct count. If that row meaning changes, revise the check instead of assuming row count still represents orders."
              ],
              steps: [
                "In Checks!B2 enter =SUMIFS(Source!$E$2:$E$7,Source!$D$2:$D$7,\"Completed\",Source!$B$2:$B$7,\">=\"&DATE(2026,11,1),Source!$B$2:$B$7,\"<\"&DATE(2026,12,1)).",
                "In B3 enter =COUNTIFS(Source!$D$2:$D$7,\"Completed\",Source!$B$2:$B$7,\">=\"&DATE(2026,11,1),Source!$B$2:$B$7,\"<\"&DATE(2026,12,1)).",
                "In B4 enter =B2/B3 after confirming B3 is not zero; expect 5400, 3 and 1800 in B2:B4.",
                "For the combined North test, add Source!$C$2:$C$7,\"North\" as another condition pair in both source formulas.",
                "Record source and report results together, including the exact filter state; these formulas also work in Microsoft Excel."
              ],
              callout: {
                type: "tip",
                title: "Check every KPI",
                text: "Matching the sales scorecard alone is not enough. Reconcile order count and average order value as well, because each can have a different aggregation or filter error."
              }
            },
            {
              heading: "Complete the five-point validation checklist",
              body: [
                "A validation checklist records what was tested and what evidence passed, not just a row of ticks. Use these five headings and attach your source calculations, settings notes and filter observations. Record unresolved issues with an owner and a next check. Do not call the report verified while a material mismatch remains unexplained. Once it passes, note the version and source-check date so a later data refresh is not confused with the version you reviewed."
              ],
              table: {
                columns: ["Point", "What to verify", "Evidence"],
                rows: [
                  ["1. Source connection", "Correct file, tab, field types and row meaning", "Source checklist and sample-row comparison"],
                  ["2. KPI definitions", "Three measures with units, status rule and period", "Definition table and calculation settings"],
                  ["3. KPI reconciliation", "Sales, orders and average agree with source", "Expected and observed values for all three"],
                  ["4. Filter behaviour", "Date, region, combined selection and reset", "Reproducible test log"],
                  ["5. Missing and empty data", "No stale values or hidden source gaps", "No-records test and missing-value notes"]
                ]
              },
              callout: {
                type: "warning",
                title: "Freshness is part of the evidence",
                text: "If the source changed after your checks, refresh the report and rerun the affected tests. A previous screenshot does not validate a newer dataset."
              }
            },
            {
              heading: "Make a recommendation without inventing a cause",
              body: [
                "The checked November view shows North at INR 3,000 across two completed orders and South at INR 2,400 across one. That supports a question about order activity, but it does not explain the difference. There are no targets, staffing measures or complete pipeline records in the teaching source. Recommend that Priya reviews South's order capture and pending pipeline before setting regional actions. State the small sample and missing context so the note remains proportionate to the evidence."
              ],
              bullets: [
                "Observation: South has one completed November order compared with North's two.",
                "Context: South's average order value is higher, so order count and sales value tell different parts of the story.",
                "Recommendation: check South's order capture and pipeline before deciding an action.",
                "Limitation: this six-row source does not establish regional demand or performance causes."
              ],
              callout: {
                type: "tip",
                title: "Show the route to your conclusion",
                text: "When presenting, identify the selected dates and region, point to the source checks and then explain the recommendation. Let the reader distinguish the measured finding from the next question."
              }
            },
            {
              heading: "Deliver the verified one-page dashboard",
              body: [
                "Submit the dashboard with exactly three defined KPIs, working date and region controls, and a labelled comparison chart. Include the five-point checklist and the test log with expected and observed results for a combined selection and a no-records selection. Check access from the intended viewer's perspective without making the source public. Add the supported recommendation and explain the source boundaries. Keep a dated version of the checked report so your assessment evidence can be revisited."
              ],
              steps: [
                "Open the report in viewing mode and confirm the default November, all-regions state.",
                "Recheck all three headline values and the regional chart against the source checks.",
                "Repeat the combined-filter, no-records and reset tests; retain actual observations rather than expected values alone.",
                "Review labels, units, contrast, empty-state notes and the recommendation at normal reading size.",
                "Share with the intended reviewer using restricted access, and include the checklist, source references and checked version date."
              ],
              callout: {
                type: "example",
                title: "Use the lab as a separate checking exercise",
                text: "The lab's tiles use monthly leads and customers, not this lesson's order data. Check each displayed conversion against its own numerator and denominator; do not copy the lesson's KPI values into that exercise."
              }
            },
            {
              heading: "Common mistakes and how to avoid them",
              body: [
                "A final check should be able to reveal an error. Retain the independent workings, exact report state and version that make each conclusion reproducible."
              ],
              bullets: [
                "Copying the scorecard into Expected → calculate from source rows independently before comparing values.",
                "Signing off after checking only sales → reconcile order count and average as well as the sales total.",
                "Reusing old evidence after a refresh → rerun affected tests and date the new checked version.",
                "Explaining South's lower count as poor demand → state the observation and request missing pipeline evidence before assigning a cause."
              ]
            },
            {
              heading: "What good looks like",
              body: [
                "The delivered dashboard and its checking pack should let another reader repeat the test and understand the limits of the recommendation."
              ],
              bullets: [
                "All three KPIs reconcile independently under the default and combined-filter selections.",
                "Each of the five validation points has settings, workings or observed test evidence attached.",
                "No-records behaviour and reset results are documented with visible filter context.",
                "The checked version, source date, access settings and unresolved issues are recorded.",
                "The recommendation cites a checked observation and states the missing evidence rather than inventing a cause."
              ]
            }
          ],
          practice: {
            labId: "dashboards",
            instruction: "Return to Build an honest dashboard. Task 3: recalculate every tile's customers divided by leads, select the inconsistent tile and record its displayed and checked conversion rates. Revisit Tasks 1 and 2 to confirm the KPI and chart choices support the stated decision."
          },
          checkpoint: [
            {
              question: "Why is COUNTIFS a valid order-count cross-check for this source but not automatically for every sales file?",
              answer: "Here each row is one order and all IDs are unique, so matching-row count equals order count. A line-item file or duplicated IDs would break that equivalence. Confirm the row meaning and use an appropriate distinct-order check when needed."
            },
            {
              question: "What must happen if the source is updated after you save the validation screenshots?",
              answer: "Refresh the report, confirm the new source scope and rerun affected reconciliations and control tests. Save the new version and check date. The earlier screenshots remain evidence for the earlier data, not for the updated report."
            },
            {
              question: "What evidence makes a five-point checklist stronger than five unqualified ticks?",
              answer: "Include the tested settings, filter states, expected and observed values, source references and any unresolved issues. Another reader should be able to repeat the checks. A tick alone does not show what was tested or which version passed."
            }
          ]
        },
        {
          id: "dashboards-w2-l3",
          title: "Case study: Tara Learning Kits end to end",
          minutes: 60,
          objective: "Build and defend a three-KPI funnel view, correct a misleading conversion tile and deliver a tested recommendation using a fictional cohort table.",
          sections: [
            {
              heading: "Define the decision and the cohort source",
              body: [
                "Fictional Tara Learning Kits asks Leela whether its enquiry follow-up deserves a closer review. Source F1, checked on 30 April 2026, groups unique qualified leads by first-enquiry month. Each lead appears in one cohort only. Customers are the subset of that cohort making a first purchase within 30 days; all three cohorts have completed that observation window. These are constructed practice records, not real customer data.",
                "Choose three KPIs for this case: qualified leads, converted customers and conversion rate. The first two are counts; conversion is converted customers divided by qualified leads for the same selected cohorts. The table contains no revenue, cost or retention evidence, so it cannot support those measures. Enter the three monthly source rows in Google Sheets; calculate the total separately rather than loading it as a fourth month."
              ],
              table: {
                columns: ["First-enquiry month, 2026", "Qualified leads", "Customers within 30 days", "Checked conversion"],
                rows: [
                  ["January", "200", "30", "30 / 200 x 100 = 15%"],
                  ["February", "250", "45", "45 / 250 x 100 = 18%"],
                  ["March", "300", "60", "60 / 300 x 100 = 20%"],
                  ["Total, check only", "750", "135", "135 / 750 x 100 = 18%"]
                ]
              }
            },
            {
              heading: "Build the view and repair the conversion tile",
              body: [
                "Use a real month date field, such as 1 January 2026, for each cohort. In Looker Studio, create scorecards for SUM(Leads), SUM(Customers) and SUM(Customers) / SUM(Leads), formatting the final ratio as a percentage. Do not multiply by 100 again when using percentage formatting. Add a chronological line chart of monthly conversion with a labelled percentage axis and source note.",
                "Independent checks give 200 + 250 + 300 = 750 leads and 30 + 45 + 60 = 135 customers. Combined conversion is 135 / 750 = 0.18, displayed as 18%. The simple mean (15 + 18 + 20) / 3 is about 17.7%, but it gives unequal cohorts equal weight. Recompute the ratio from totals whenever the selected months change."
              ],
              callout: {
                type: "example",
                title: "A plausible tile can still be wrong",
                text: "A draft March tile says 25% beside 300 leads and 60 customers. Its check is 60 / 300 x 100 = 20%, so the tile overstates conversion by 5 percentage points. At 25%, those 300 leads would imply 75 customers, not the recorded 60."
              },
              steps: [
                "Connect only the three monthly rows, with Leads and Customers numeric and the cohort month recognised as a date.",
                "Apply the same cohort-date selection to the three scorecards and the trend chart.",
                "Replace the draft March rate with the calculated ratio; retain its original value and the correction in a test log.",
                "Label the trend as 30-day conversion by first-enquiry month, not purchases made within each calendar month."
              ]
            },
            {
              heading: "Test selections and deliver a bounded finding",
              body: [
                "For March only, expect 300 leads, 60 customers and 20%. For February plus March, expect 250 + 300 = 550 leads and 45 + 60 = 105 customers; 105 / 550 x 100 is about 19.1%, rounded to one decimal place. Selecting April finds no source cohort, so show no records and an unavailable conversion, not the previous rate. Reset to January through March and confirm 750, 135 and 18% return.",
                "Handover note: the fictional January-to-March cohorts show conversion rising from 15% to 20%, a difference of 5 percentage points. Leela should inspect follow-up records and lead-source mix before recommending a process change. The table does not show which action caused the difference or whether the customers were profitable. Include F1, definitions, corrected tile evidence, filter tests and the source-check date with the report."
              ],
              bullets: [
                "Keep observed filter results beside the independent expectations and retain any unresolved mismatch.",
                "Use the same completed 30-day window for every cohort and show it beside the chart.",
                "A relative increase from 15% to 20% is (20 - 15) / 15 x 100, about 33.3%, not 5%.",
                "Treat further follow-up analysis as the next action, not proof that a particular sales method worked."
              ]
            },
            {
              heading: "Common mistakes and how to avoid them",
              body: [
                "This case tests denominator discipline as well as chart choice. Correct the data story before making the page look more polished."
              ],
              bullets: [
                "Loading the total as another month → connect only January, February and March, keeping the total as an independent check.",
                "Averaging the displayed rates → divide 135 customers by 750 leads for the combined 18% rate.",
                "Accepting the March 25% tile → recompute 60 / 300 and log the 20% correction.",
                "Calling a 5-point rise a 5% rise → distinguish percentage points from the relative increase of about 33.3%.",
                "Attributing the trend to follow-up alone → request lead-source and process evidence before making a causal claim."
              ]
            },
            {
              heading: "What good looks like",
              body: [
                "The finished case should satisfy these reproducible checks. A reviewer should not need access to your memory of how the chart was configured."
              ],
              bullets: [
                "The default scorecards show 750 qualified leads, 135 converted customers and 18% conversion.",
                "The trend shows January 15%, February 18% and March 20% in chronological order with the cohort rule visible.",
                "The incorrect March tile is documented and corrected from 25% to 20% using its own counts.",
                "March, February-plus-March, April no-records and reset tests have expected and observed results.",
                "The handover names F1, the check date, the follow-up action and the missing causal and cost evidence."
              ]
            }
          ],
          practice: {
            labId: "dashboards",
            instruction: "Open Build an honest dashboard. Task 1: choose three KPIs for the lab's decision. Task 2: choose the monthly-trend chart. Task 3: recompute each tile's conversion and select the mismatch. Use the lab's leads and customers, not Tara's case figures, and record your workings."
          },
          checkpoint: [
            {
              question: "Why is Tara's combined conversion 18% rather than the simple mean of its three monthly rates?",
              answer: "There are 30 + 45 + 60 = 135 customers from 200 + 250 + 300 = 750 leads. Dividing 135 by 750 gives 18%. The monthly cohorts differ in size, so averaging 15%, 18% and 20% gives each cohort equal weight and produces about 17.7%, answering a different question."
            },
            {
              question: "How can you prove that the draft March tile's 25% does not match 300 leads and 60 customers?",
              answer: "Compute 60 / 300 x 100 = 20%. As a reverse check, 25% of 300 is 75 customers, 15 more than recorded. Correct the ratio, preserve the mismatch in the log and verify that the tile uses the same cohort as its numerator and denominator."
            },
            {
              question: "What can Leela conclude from the rise from 15% to 20%, and what should remain open?",
              answer: "The recorded cohort conversion rose by 5 percentage points, about 33.3% relative to January's 15%. That observation does not identify a cause or establish profit. Review lead-source mix and follow-up evidence before recommending a process change, keeping the same 30-day conversion rule."
            }
          ]
        }
      ]
    }
  ],
  deck: {
    title: "Live workshop: build and defend a one-page sales report",
    slides: [
      {
        kind: "title",
        title: "A dashboard that can answer back",
        subtitle: "0-3 minutes: define, build and verify",
        illustration: "dashboards",
        notes: "Today we will build a small fictional report and challenge every headline value. Ask learners to open the six-row source and their report draft so we can move between evidence and presentation."
      },
      {
        kind: "content",
        title: "Our 60-minute route",
        subtitle: "3-5 minutes: agree the outcome",
        bullets: [
          "5-19 minutes: define the decision, KPIs and source.",
          "19-33 minutes: build scorecards and a comparison.",
          "33-47 minutes: test controls and empty states.",
          "47-60 minutes: reconcile, recommend and hand over."
        ],
        notes: "The result is a checked reporting view, not a collection of decorative charts. Ask learners which piece of evidence they would want before relying on someone else's dashboard."
      },
      {
        kind: "content",
        title: "Three measures, one consistent scope",
        subtitle: "5-10 minutes: define the reporting question",
        bullets: [
          "Completed sales: sum of qualifying Sales amounts, in INR.",
          "Completed orders: distinct qualifying OrderID count.",
          "Average order value: qualifying sales divided by qualifying orders.",
          "Use the same completion rule, dates and region for all three."
        ],
        notes: "Ask learners to state the denominator of average order value aloud. Explain why the pending and cancelled source records are useful tests rather than clutter to delete."
      },
      {
        kind: "steps",
        title: "Connect and inspect the source",
        subtitle: "10-16 minutes: guided source check",
        steps: [
          "Connect the intended Google Sheets workbook and Source tab.",
          "Check text IDs, real dates and numeric sales.",
          "Compare the six source records with a report table.",
          "Record the expected November totals: 5400, 3 and 1800."
        ],
        notes: "Give learners time to inspect their field types and the selected worksheet. Ask them to identify a row that must not contribute to the default November completed-sales figure."
      },
      {
        kind: "question",
        title: "Live poll: can this source measure the KPI?",
        subtitle: "16-19 minutes: vote, then identify the gap",
        question: {
          prompt: "A file contains monthly revenue only. Which additional evidence is needed before reporting 90-day retention?",
          options: ["A larger chart title", "A second currency format", "Cohort membership and later status", "A total of monthly revenue"],
          answerIndex: 2,
          explanation: "Retention needs a defined starting group and evidence about that group's later status under a stated rule. Revenue totals alone cannot supply either part of that calculation."
        },
        notes: "Ask for a vote and then name the missing data rather than guessing a rate. Relate this to the lab, where a useful KPI choice still needs suitable evidence before it can be calculated."
      },
      {
        kind: "steps",
        title: "Build the first reporting view",
        subtitle: "19-25 minutes: scorecards and a comparison",
        steps: [
          "Add Sales Sum, OrderID Count Distinct and the calculated average.",
          "Apply Status equals Completed consistently.",
          "Use SaleDate for the reporting period.",
          "Add regional sales bars with units, labels and a common zero baseline."
        ],
        notes: "Let learners build or inspect each component and check its filters. Ask one person to explain how the regional chart connects to the headline total rather than treating them as separate pictures."
      },
      {
        kind: "content",
        title: "An average needs its count",
        subtitle: "25-30 minutes: inspect the regional calculation",
        bullets: [
          "North: INR 3,000 across two orders, average INR 1,500.",
          "South: INR 2,400 across one order, average INR 2,400.",
          "Together: INR 5,400 across three orders, average INR 1,800.",
          "Do not give unequal groups equal weight by averaging their averages."
        ],
        notes: "Ask learners to calculate the overall average from the source totals before viewing the scorecard. Discuss why a neatly displayed number can still use the wrong aggregation."
      },
      {
        kind: "question",
        title: "Live poll: incompatible populations",
        subtitle: "30-33 minutes: vote, then repair the definition",
        question: {
          prompt: "A report divides completed sales by a count that includes pending orders. What is the problem?",
          options: ["The numerator and denominator use different records", "The font is too large", "The currency should be removed", "Counts cannot be used in averages"],
          answerIndex: 0,
          explanation: "The count must refer to the same qualifying completed orders as the sales sum. Including pending orders changes the population and understates the intended average."
        },
        notes: "Pause for a vote and ask learners to inspect the scope of their own calculated measure. Reinforce that an attractive formula name does not establish a correct business definition."
      },
      {
        kind: "steps",
        title: "Test controls as a reader",
        subtitle: "33-39 minutes: interactive testing",
        steps: [
          "Add date and region controls and check every component responds.",
          "Select November and North; compare 3000, 2 and 1500 with the source.",
          "Select 4 November only and inspect the no-records state.",
          "Reset and confirm the default totals return."
        ],
        notes: "Give learners time to write expected and observed results, not just click the controls. Ask them to keep the selected dates and region visible in their evidence."
      },
      {
        kind: "content",
        title: "Empty data is a result to explain",
        subtitle: "39-44 minutes: inspect missing and zero values",
        bullets: [
          "No completed records means no defined average order value.",
          "A known zero-value order still counts as a record.",
          "Missing dates can remove records from date-controlled views.",
          "Missing amounts can distort an average while the count looks normal."
        ],
        notes: "Ask learners to distinguish a valid empty selection from a source-quality issue. Discuss what a reader would infer if an old nonempty value remained on screen after the controls changed."
      },
      {
        kind: "question",
        title: "Live poll: a missing amount",
        subtitle: "44-47 minutes: vote, then explain the risk",
        question: {
          prompt: "One completed order has a blank amount but remains in the count. What should the reviewer investigate?",
          options: ["Whether the chart needs animation", "An incomplete sales numerator", "Whether all dates should be hidden", "A need to round the order count"],
          answerIndex: 1,
          explanation: "The numerator may omit an unknown sales amount while the denominator includes the order. Resolve or disclose the gap before treating the average as a complete measure."
        },
        notes: "Ask for a vote and invite learners to explain the issue without using technical jargon. Emphasise that replacing the blank with zero changes its meaning rather than verifying it."
      },
      {
        kind: "steps",
        title: "Run the five-point verification",
        subtitle: "47-53 minutes: evidence review",
        steps: [
          "Confirm source connection, field types and row meaning.",
          "Check all three KPI definitions and units.",
          "Reconcile every KPI to independent source calculations.",
          "Record combined-filter and reset behaviour.",
          "Document no-records and missing-data handling."
        ],
        notes: "Let learners mark each point with actual evidence or an unresolved action. Ask them to name the version and source date to which their checks apply."
      },
      {
        kind: "content",
        title: "Present one proportionate recommendation",
        subtitle: "53-57 minutes: short spoken handover",
        bullets: [
          "State the selected period and the question.",
          "Show the checked source figures behind the observation.",
          "Recommend a specific follow-up, not an invented explanation.",
          "Name the small sample and missing business context."
        ],
        notes: "Ask learners to give a short report to a classmate using one observed difference. Challenge any claim about demand, staff performance or profit that the source cannot establish."
      },
      {
        kind: "summary",
        title: "A useful dashboard is also a testable report",
        subtitle: "57-60 minutes: assessment readiness",
        bullets: [
          "Exactly three defined KPIs and a labelled comparison.",
          "Date and region controls tested together and reset.",
          "All three figures reconciled to the source.",
          "Five-point checklist, empty-state evidence and one supported recommendation."
        ],
        notes: "Ask each learner to identify the next check they need to finish. Close by distinguishing a report that looks complete from a report whose evidence has been reviewed."
      }
    ]
  },
  interview: {
    intro: "Use the fictional dashboard to explain your approach to entry-level reporting work. Show definitions, source checks and test evidence you actually produced. Treat the report as a practice artefact, and keep measured observations separate from possible business explanations.",
    questions: [
      {
        question: "What makes a KPI definition usable by someone who did not build the report?",
        type: "concept",
        answerGuide: [
          "State the business question and why the measure is relevant.",
          "Specify the calculation, qualifying records, unit and reporting period.",
          "Define the denominator and empty-state treatment where a ratio is used.",
          "Show a source example that another person can reproduce."
        ],
        tip: "Use one of your three actual definitions rather than listing dashboard terminology."
      },
      {
        question: "How do dimensions and measures play different roles in a dashboard?",
        type: "concept",
        answerGuide: [
          "A dimension groups records, such as Region or SaleDate.",
          "A measure calculates a value, such as summed sales or an order count.",
          "Explain why the selected aggregation must match the business definition.",
          "Use your regional comparison to show how grouping and calculation work together."
        ],
        tip: "Keep the explanation tied to the source columns and one visible chart."
      },
      {
        question: "A date control changes two scorecards but not the third. How would you investigate?",
        type: "scenario",
        answerGuide: [
          "Check whether all scorecards use the intended compatible source.",
          "Inspect the date-range dimension and any fixed date override on the unchanged card.",
          "Review control scope and chart-specific settings.",
          "Retest the combined selection and reset after correcting the configuration."
        ],
        tip: "Explain how you would verify the repair instead of stopping at a settings change."
      },
      {
        question: "A manager asks for a retention KPI, but your source has only monthly sales totals. What would you say?",
        type: "scenario",
        answerGuide: [
          "Explain that the requested measure needs a defined cohort and later-status evidence.",
          "Identify the missing fields and the proposed retention rule.",
          "Avoid inventing a percentage from revenue changes.",
          "Offer to report supported sales measures while the missing source is clarified."
        ],
        tip: "Frame the limitation as a precise data requirement, not just a refusal to build a chart."
      },
      {
        question: "Show how you would reconcile all three scorecards for one combined filter selection.",
        type: "practical",
        answerGuide: [
          "Write the exact dates, region and completion rule first.",
          "Identify the matching source records and independently add their sales.",
          "Count qualifying orders under the source's row meaning and calculate the average.",
          "Record expected and observed values for every scorecard and investigate any difference."
        ],
        tip: "Keep the selected control state visible so the check can be repeated."
      },
      {
        question: "Demonstrate how you test a no-records selection without confusing it with zero sales.",
        type: "practical",
        answerGuide: [
          "Choose a valid date and region combination with no qualifying source records.",
          "Inspect all components for stale values or misleading zero averages.",
          "Explain the difference between no records and a known zero-value order.",
          "Reset the controls and verify the original values return."
        ],
        tip: "Use an actual observed empty-state result from your test log."
      },
      {
        question: "Tell me how you handled a limitation in the data while building this report.",
        type: "behavioural",
        answerGuide: [
          "Describe a real limitation from the fictional exercise, such as absent cost or cohort data.",
          "Explain which interpretation the missing information prevented.",
          "Show the note, source requirement or follow-up you recorded.",
          "Describe the supported conclusion you could still present without overstating it."
        ],
        tip: "Do not invent a stakeholder reaction or business result to make the example sound larger."
      },
      {
        question: "How did you decide your dashboard was ready to hand over?",
        type: "behavioural",
        answerGuide: [
          "Describe the five-point checklist and the evidence attached to each point.",
          "Show all-KPI reconciliations and combined-filter, no-records and reset tests.",
          "Explain your reader review of labels, scope, access and source freshness.",
          "State any unresolved issue rather than describing an unfinished report as verified."
        ],
        tip: "Refer to the version you checked, since later source changes require fresh validation."
      },
      {
        question: "A draft shows 25% conversion from 300 leads and 60 customers. How would you explain and resolve the discrepancy?",
        type: "scenario",
        answerGuide: [
          "Recalculate 60 / 300 x 100 = 20%, then reverse-check that 25% would require 75 customers.",
          "Inspect the numerator, denominator, cohort dates and calculation instead of changing a source value to fit the tile.",
          "Record the original 25% and corrected 20% with the source reference and tested filter state.",
          "Explain that the discrepancy is 5 percentage points and retest related views before handover."
        ],
        tip: "Describe the discrepancy in plain language while keeping the source counts unchanged."
      },
      {
        question: "Demonstrate how to combine Tara's monthly conversion rates and choose a chart for the trend.",
        type: "practical",
        answerGuide: [
          "Add the cohorts to obtain 750 leads and 135 customers, then calculate 135 / 750 = 18%.",
          "Explain why averaging 15%, 18% and 20% gives a different result when cohort sizes differ.",
          "Use a chronological line chart with a labelled percentage axis and the completed 30-day observation rule.",
          "Test March alone at 20%, February plus March at about 19.1%, and reset to the combined 18%."
        ],
        tip: "Show both the totals and the ratio formula so the combined rate is reproducible."
      }
    ]
  },
  glossary: [
    { term: "KPI", definition: "A defined measure used to review a business question, with a stated calculation, unit, qualifying population and period." },
    { term: "Dimension", definition: "A field used to group or describe records, such as region, product or date, rather than a quantity being summed." },
    { term: "Metric", definition: "A calculated measure displayed in a report, such as sales sum, order count or average order value." },
    { term: "Aggregation", definition: "The rule used to combine records into a reported value, such as sum, count, distinct count or average." },
    { term: "Scorecard", definition: "A compact display of one headline metric that still needs a clear definition, unit and reporting scope." },
    { term: "Filter scope", definition: "The set of report components and records affected by a control or condition. Inconsistent scope can make neighbouring charts disagree." },
    { term: "Distinct count", definition: "The number of different identifiers in qualifying records. It does not by itself remove duplicated amounts from a separate sales sum." },
    { term: "Weighted average", definition: "An average that reflects each group's size. Overall order value is total qualifying sales divided by total qualifying orders." },
    { term: "No-records state", definition: "The display shown when a valid filter selection matches no qualifying records, distinct from records whose measured value is zero." },
    { term: "Source freshness", definition: "How current the report's underlying records are, including when the source was updated and when the displayed results were last checked." }
  ]
};
