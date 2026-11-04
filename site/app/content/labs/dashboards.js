export default {
  moduleId: "dashboards",
  summary: "Develop a reporting view from a decision and source checklist into tested scorecards, charts and controls. Finish with a fictional sales-team dashboard containing three defined KPIs, two filters and a five-point validation record.",
  sessions: [
    {
      id: "dashboards-lab-s1",
      week: 1,
      title: "Define the decision and qualifying records",
      minutes: 75,
      scenario: [
        "Priya at fictional Sundar Traders wants to review completed November sales before setting the next regional plan. Each source row is one unique order. Sales are INR amounts excluding tax and delivery. Use completion dates from 1 to 30 November 2026 inclusive and Status = Completed for every KPI. Keep October, cancelled and pending records in the source as useful exclusion tests.",
        "Complete the KPI-selection step in the Build an honest dashboard simulation using its own brief. Its lead data are separate from this order table. Enter this session's source in Google Sheets, check field types and define completed sales, completed order count and average completed order value. Prepare to connect that source to Looker Studio without making the source publicly accessible."
      ],
      dataset: {
        columns: ["Order ID", "Sale date", "Region", "Status", "Sales, INR"],
        rows: [
          ["S01", "2026-10-31", "North", "Completed", "800"],
          ["S02", "2026-11-02", "North", "Completed", "1200"],
          ["S03", "2026-11-03", "North", "Completed", "1800"],
          ["S04", "2026-11-03", "South", "Completed", "2400"],
          ["S05", "2026-11-04", "South", "Cancelled", "900"],
          ["S06", "2026-11-04", "North", "Pending", "600"]
        ]
      },
      outcome: "A checked source sheet and three KPI definitions stating the decision, calculation, unit, qualifying records and reporting period.",
      tasks: [
        {
          id: "dashboards-lab-s1-t1",
          type: "short",
          prompt: "Build a source check in Google Sheets for November completed sales. What amount in INR should the future sales scorecard display?",
          answer: { kind: "number", value: 5400, tolerance: 0.5 },
          explanation: "S02, S03 and S04 qualify: 1200 + 1800 + 2400 = INR 5400. S01 is outside November, and S05 and S06 are not completed. Adding the entire source would give the wrong scope."
        },
        {
          id: "dashboards-lab-s1-t2",
          type: "short",
          prompt: "Apply exactly the same date and status conditions to the unique order IDs. How many completed November orders belong in the order-count KPI?",
          answer: { kind: "number", value: 3, tolerance: 0 },
          explanation: "The included IDs are S02, S03 and S04, so the count is 3. One row is one unique order here; a future source with multiple lines per order would require a different counting check."
        },
        {
          id: "dashboards-lab-s1-t3",
          type: "case",
          prompt: "Write Priya a reporting brief before designing the dashboard. Define exactly three KPIs, name the source checks required before connection and explain why the view cannot establish profit or the cause of a regional difference.",
          rubric: [
            "Names Priya's regional sales-review decision and the November Completed-only scope.",
            "Defines sales as a sum, orders as a distinct ID count and average order value as sales divided by qualifying orders.",
            "Checks unique IDs, numeric INR sales, date types and the intended source tab before connection.",
            "Uses the source expectations INR 5400 and three orders, while identifying absent cost and causal evidence."
          ],
          minWords: 120
        },
        {
          id: "dashboards-lab-s1-t4",
          type: "proof",
          prompt: "Attach the source sheet, KPI dictionary and connection checklist, plus a note on your simulation KPI choices. Keep the simulation's figures separate from this source.",
          mustShow: "Six source rows, three qualifying IDs, independent sales and count checks, field types, the source version and three definitions with common status and date rules."
        }
      ]
    },
    {
      id: "dashboards-lab-s2",
      week: 2,
      title: "Build the first one-page reporting view",
      minutes: 90,
      scenario: [
        "Continue Sundar Traders' November report using the complete source below. Priya needs completed sales, completed orders and average order value, followed by a regional comparison. The report must use the same Completed-only rule and November dates in every component. North and South are categories, not points in a time sequence.",
        "Complete the simulation's monthly-trend chart choice, then build this separate order report in Looker Studio from Google Sheets. Add three scorecards and a labelled regional comparison with a shared zero baseline. Check the unrounded figures before formatting currency. Keep the question, period, source name and completion rule readable on one page."
      ],
      dataset: {
        columns: ["Order ID", "Sale date", "Region", "Status", "Sales, INR"],
        rows: [
          ["S01", "2026-10-31", "North", "Completed", "800"],
          ["S02", "2026-11-02", "North", "Completed", "1200"],
          ["S03", "2026-11-03", "North", "Completed", "1800"],
          ["S04", "2026-11-03", "South", "Completed", "2400"],
          ["S05", "2026-11-04", "South", "Cancelled", "900"],
          ["S06", "2026-11-04", "North", "Pending", "600"]
        ]
      },
      outcome: "A readable dashboard draft with three consistently scoped scorecards and a regional chart checked against the source.",
      tasks: [
        {
          id: "dashboards-lab-s2-t1",
          type: "short",
          prompt: "Build average order value as qualifying sales divided by qualifying orders. What INR-per-order value should the all-region November scorecard show?",
          answer: { kind: "number", value: 1800, tolerance: 0.5 },
          explanation: "Completed November sales are 1200 + 1800 + 2400 = INR 5400 across three orders. Average order value is 5400 / 3 = INR 1800, not the unweighted mean of regional averages."
        },
        {
          id: "dashboards-lab-s2-t2",
          type: "short",
          prompt: "Choose the most defensible chart for comparing North and South's completed November sales values on this page.",
          answer: {
            kind: "choice",
            options: [
              "Horizontal bars with Region as the category, INR values and one zero baseline",
              "A line connecting North to South as successive points in time",
              "A pie mixing the sales amounts and order counts as slices"
            ],
            answerIndex: 0
          },
          explanation: "Region is a category, so bars compare its values directly. North is 1200 + 1800 = INR 3000 and South is INR 2400. A time line would imply an order that these region labels do not have."
        },
        {
          id: "dashboards-lab-s2-t3",
          type: "case",
          prompt: "Priya suggests showing the simple average of regional average order values and calling South the weaker region. Write a design-review response explaining the correct overall average, the chart choice and a more careful interpretation of the regional evidence.",
          rubric: [
            "Calculates overall average order value as INR 5400 divided by three, giving INR 1800.",
            "Explains that averaging North INR 1500 and South INR 2400 gives a misleading INR 1950 for this KPI.",
            "Uses a zero-baseline regional bar chart with consistent dates, status conditions and INR labels.",
            "Notes South has one order with a higher average value and avoids a performance judgement without targets or context."
          ],
          minWords: 120
        },
        {
          id: "dashboards-lab-s2-t4",
          type: "proof",
          prompt: "Attach the Looker Studio draft or screenshots plus its calculation settings and source checks. Include the page context, not only cropped scorecards.",
          mustShow: "Three cards showing INR 5400, three orders and INR 1800 per order; regional bars of INR 3000 and INR 2400; readable period, units and completion rule."
        }
      ]
    },
    {
      id: "dashboards-lab-s3",
      week: 3,
      title: "Test filters, boundaries and empty selections",
      minutes: 105,
      scenario: [
        "Priya wants to inspect dates and regions without changing the report's definition of a completed order. Keep the source below unchanged. The opening view is 1 to 30 November 2026, all regions. A date selection includes both its start and end date. The report must not keep an earlier value when no completed records qualify.",
        "In Looker Studio, add a date-range control and a Region dropdown. Make all three scorecards and the regional chart respond to both. Use Google Sheets to calculate each expectation before clicking the controls, then record actual observations in a test log. The practice simulation rehearses metric reasoning, but these control tests belong in your own report."
      ],
      dataset: {
        columns: ["Order ID", "Sale date", "Region", "Status", "Sales, INR"],
        rows: [
          ["S01", "2026-10-31", "North", "Completed", "800"],
          ["S02", "2026-11-02", "North", "Completed", "1200"],
          ["S03", "2026-11-03", "North", "Completed", "1800"],
          ["S04", "2026-11-03", "South", "Completed", "2400"],
          ["S05", "2026-11-04", "South", "Cancelled", "900"],
          ["S06", "2026-11-04", "North", "Pending", "600"]
        ]
      },
      outcome: "An interactive report with reproducible date, region, combined-selection, no-records and reset checks.",
      tasks: [
        {
          id: "dashboards-lab-s3-t1",
          type: "short",
          prompt: "Select North and 2 to 3 November inclusive in your report. Reconcile the result to the source and enter the completed-sales amount in INR.",
          answer: { kind: "number", value: 3000, tolerance: 0.5 },
          explanation: "North includes S02 on 2 November and S03 on 3 November. The inclusive range gives 1200 + 1800 = INR 3000. Excluding the end date would incorrectly remove S03."
        },
        {
          id: "dashboards-lab-s3-t2",
          type: "short",
          prompt: "Select 4 November only, all regions. Which interpretation should the average-order-value card communicate under the Completed-only rule?",
          answer: {
            kind: "choice",
            options: [
              "The average is unavailable because no completed orders qualify",
              "The average is INR 0 because every selected order was completed for no charge",
              "The average remains INR 1800 because that was the previous valid result"
            ],
            answerIndex: 0
          },
          explanation: "The two 4 November rows are Cancelled and Pending, so zero completed orders qualify. Sales divided by zero orders does not define an average. An explicit no-records state is different from a known zero-value completed order."
        },
        {
          id: "dashboards-lab-s3-t3",
          type: "case",
          prompt: "Write Priya a filter-test report covering North on 3 November, North on 31 October, all regions on 4 November and the reset to November. Give expected and observed values for each KPI, explain any mismatch and describe how a reader can recognise the active selection.",
          rubric: [
            "Expects North on 3 November to show INR 1800, one order and INR 1800 per order.",
            "Expects North on 31 October to show INR 800, one order and INR 800 per order.",
            "Records no completed orders and an unavailable average on 4 November, without stale values.",
            "Checks reset to INR 5400, three orders and INR 1800, with actual observations and visible filter labels."
          ],
          minWords: 120
        },
        {
          id: "dashboards-lab-s3-t4",
          type: "proof",
          prompt: "Attach your report and test log with screenshots of the combined selection, empty selection and reset. Record what the report actually displayed, even when a test failed.",
          mustShow: "Both control labels, their scope across all components, source-derived expectations, observed values, an inclusive end-date test and a no-records state without stale averages."
        }
      ]
    },
    {
      id: "dashboards-lab-s4",
      week: 4,
      title: "Reconcile all three KPIs after a source update",
      minutes: 105,
      scenario: [
        "Sundar Traders adds S07, a genuine completed zero-value order on 5 November. The other six records are unchanged. Priya's draft still shows the old average of INR 1800 because its order count has not incorporated the update. The November sales amount alone cannot reveal this problem, since adding zero does not change that sum.",
        "Update the Google Sheets source, refresh the Looker Studio report and complete five validation points: source connection, KPI definitions, KPI reconciliation, filter behaviour, and missing or empty data. Test 5 November separately from 4 November. Keep version and check-date evidence so the reviewed report is not confused with an earlier screenshot."
      ],
      dataset: {
        columns: ["Order ID", "Sale date", "Region", "Status", "Sales, INR"],
        rows: [
          ["S01", "2026-10-31", "North", "Completed", "800"],
          ["S02", "2026-11-02", "North", "Completed", "1200"],
          ["S03", "2026-11-03", "North", "Completed", "1800"],
          ["S04", "2026-11-03", "South", "Completed", "2400"],
          ["S05", "2026-11-04", "South", "Cancelled", "900"],
          ["S06", "2026-11-04", "North", "Pending", "600"],
          ["S07", "2026-11-05", "South", "Completed", "0"]
        ]
      },
      outcome: "A refreshed dashboard with every KPI reconciled, zero and no-records states distinguished, and a five-point validation checklist supported by evidence.",
      tasks: [
        {
          id: "dashboards-lab-s4-t1",
          type: "short",
          prompt: "Refresh the updated source and count all completed November orders, including genuine zero-value orders. What should the order-count card show?",
          answer: { kind: "number", value: 4, tolerance: 0 },
          explanation: "S02, S03, S04 and S07 qualify. The count is 3 previous orders + 1 zero-value order = 4. Filtering out zero sales would silently change the agreed order definition."
        },
        {
          id: "dashboards-lab-s4-t2",
          type: "short",
          prompt: "Recalculate the updated November average order value from the checked total and count. What is the correct INR-per-order figure?",
          answer: { kind: "number", value: 1350, tolerance: 0.5 },
          explanation: "Sales remain 1200 + 1800 + 2400 + 0 = INR 5400, but there are four orders. The average is 5400 / 4 = INR 1350. Keeping INR 1800 would use the stale count of three."
        },
        {
          id: "dashboards-lab-s4-t3",
          type: "case",
          prompt: "Write a release note for Priya explaining why the unchanged sales card did not prove the report was current. Cover all five validation points and compare the expected states for 5 November, 4 November and the default November view.",
          rubric: [
            "Explains the unchanged INR 5400 sales sum alongside the revised count of four and average of INR 1350.",
            "Tests 5 November as INR 0, one completed order and INR 0 average, distinct from 4 November's no-records state.",
            "Records evidence for source connection, definitions, reconciliation, filter behaviour and missing or empty data.",
            "Includes source version, check date, observed results and an action for any unresolved mismatch."
          ],
          minWords: 120
        },
        {
          id: "dashboards-lab-s4-t4",
          type: "proof",
          prompt: "Attach the updated report, source checks and completed five-point checklist. Include separate evidence for the zero-value order and no-records selection.",
          mustShow: "S07 in the source, four qualifying orders, the INR 1350 average, date and region tests, two distinct empty-or-zero behaviours and the reviewed version date."
        }
      ]
    },
    {
      id: "dashboards-lab-s5",
      week: 5,
      title: "Handle duplicate and incomplete funnel cohorts",
      minutes: 105,
      scenario: [
        "Leela at fictional Tara Learning Kits receives a cohort extract checked on 15 April 2026. Each unique cohort ID represents qualified leads from one first-enquiry month and region; customers are that cohort's first purchases within 30 days. The second F503 is a confirmed duplicate. F504's customer count is unknown, and F505's observation window is still open. Trim the space in South but do not fill the missing count.",
        "Use the dashboard simulation to rehearse conversion checks, then build an audited funnel view from this new table in Google Sheets and Looker Studio. For all three KPIs, include only unique, closed-window cohorts with both counts known. Keep excluded cohorts in an issue log. Label the report as a complete-record subset, not the whole business, and calculate conversion from the included totals."
      ],
      dataset: {
        columns: ["Cohort ID", "First-enquiry month", "Region", "Qualified leads", "Customers within 30 days", "Window"],
        rows: [
          ["F501", "2026-01-01", "North", "100", "15", "Closed"],
          ["F502", "2026-01-01", "South", "80", "8", "Closed"],
          ["F503", "2026-02-01", "North", "150", "30", "Closed"],
          ["F504", "2026-02-01", "South ", "120", "", "Closed"],
          ["F503", "2026-02-01", "North", "150", "30", "Closed"],
          ["F505", "2026-03-01", "South", "200", "30", "Open"]
        ]
      },
      outcome: "A clearly scoped funnel report with duplicate handling, completeness exclusions and a conversion rate calculated from matching eligible cohorts.",
      tasks: [
        {
          id: "dashboards-lab-s5-t1",
          type: "short",
          prompt: "Build the eligible-cohort source and its lead total. How many qualified leads belong in the audited three-KPI view after the stated exclusions?",
          answer: { kind: "number", value: 330, tolerance: 0 },
          explanation: "Only F501, F502 and one F503 qualify: 100 + 80 + 150 = 330 leads. F504 is incomplete and F505 has an open window; excluding their customers but retaining their leads would mismatch the ratio."
        },
        {
          id: "dashboards-lab-s5-t2",
          type: "short",
          prompt: "Calculate conversion from eligible customers divided by eligible leads. Enter the percentage to two decimal places, using percentage units rather than a decimal ratio.",
          answer: { kind: "number", value: 16.06, tolerance: 0.01 },
          explanation: "Eligible customers total 15 + 8 + 30 = 53. Conversion is 53 / 330 x 100 = 16.0606...%, or 16.06%. The excluded South cohorts mean this is not a complete business-wide rate."
        },
        {
          id: "dashboards-lab-s5-t3",
          type: "case",
          prompt: "Leela wants to compare regional follow-up using this extract. Write a source-quality memo explaining the eligible subset, the excluded records and the effect on interpretation. Give a specific corrective action for each unresolved issue before a broader regional decision.",
          rubric: [
            "Removes only the extra F503 and includes F501, F502 and F503 consistently in all three KPIs.",
            "Checks 330 leads, 53 customers and 16.06% conversion using the same cohort scope.",
            "Keeps F504's missing count and F505's open observation window visible instead of treating either as zero.",
            "Explains South's incomplete coverage and asks Leela to resolve F504 and wait for F505's full window before broader comparisons."
          ],
          minWords: 120
        },
        {
          id: "dashboards-lab-s5-t4",
          type: "proof",
          prompt: "Attach the source, eligible-cohort view, exclusion log and checked funnel report. Keep the original rows available for a reviewer to retrace the scope.",
          mustShow: "The duplicate exclusion, three eligible cohort IDs, matching numerator and denominator, a complete-record-subset label and open actions for the two excluded unique cohorts."
        }
      ]
    },
    {
      id: "dashboards-lab-s6",
      week: 6,
      title: "Respond to a stakeholder's causal claim",
      minutes: 105,
      scenario: [
        "Tara Learning Kits now supplies a separate complete cohort table. Each row is one unique month-region cohort, and all 30-day observation windows are closed. Qualified leads belong to one cohort only; customers are the subset making a first purchase within 30 days. Leela wants the headline to say a new follow-up script caused March's improvement, but the source contains no script-use or comparison-group evidence.",
        "Build three funnel KPIs and a chronological conversion trend in Looker Studio, with cohort-date and Region filters. Use Google Sheets for independent selected-total checks. Apply the simulation's distinction between a time trend and a category comparison. Keep the same cohort window across all components and write a headline that the source can actually support."
      ],
      dataset: {
        columns: ["First-enquiry month", "Region", "Qualified leads", "Customers within 30 days"],
        rows: [
          ["2026-01-01", "North", "100", "10"],
          ["2026-01-01", "South", "100", "20"],
          ["2026-02-01", "North", "200", "30"],
          ["2026-02-01", "South", "100", "20"],
          ["2026-03-01", "North", "300", "60"],
          ["2026-03-01", "South", "100", "20"]
        ]
      },
      outcome: "A filtered cohort dashboard and a stakeholder response separating an observed change from an untested explanation.",
      tasks: [
        {
          id: "dashboards-lab-s6-t1",
          type: "short",
          prompt: "Select March and all regions in the built report. What is the checked 30-day conversion percentage? Enter percentage units.",
          answer: { kind: "number", value: 20, tolerance: 0.01 },
          explanation: "March has 300 + 100 = 400 leads and 60 + 20 = 80 customers. Its conversion is 80 / 400 x 100 = 20%. This describes the March cohort, not the cause of its result."
        },
        {
          id: "dashboards-lab-s6-t2",
          type: "short",
          prompt: "Reset to January through March, all regions. Calculate combined conversion from the totals and enter the percentage rounded to two decimal places.",
          answer: { kind: "number", value: 17.78, tolerance: 0.01 },
          explanation: "Leads total 100 + 100 + 200 + 100 + 300 + 100 = 900. Customers total 10 + 20 + 30 + 20 + 60 + 20 = 160. The combined rate is 160 / 900 x 100 = 17.7777...%, or 17.78%."
        },
        {
          id: "dashboards-lab-s6-t3",
          type: "case",
          prompt: "Draft a revised dashboard headline and a note to Leela about the claimed effect of the script. State the January-to-March movement, explain what could change the mix of results and propose an evidence check before attributing an effect to the script.",
          rubric: [
            "States January conversion as 30 / 200 = 15% and March as 80 / 400 = 20%, a five-percentage-point difference.",
            "Keeps the completed 30-day cohort definition and distinguishes percentage points from relative percentage change.",
            "Does not attribute the change to the script without evidence of use and a suitable comparison.",
            "Requests script-use, lead-source mix or comparable cohort evidence and assigns Leela a follow-up review."
          ],
          minWords: 120
        },
        {
          id: "dashboards-lab-s6-t4",
          type: "proof",
          prompt: "Attach the funnel dashboard, source calculations and stakeholder note. Show the March selection and the January-to-March reset with their active filters.",
          mustShow: "Three KPIs, a chronological labelled trend, date and region controls, March 400 leads and 80 customers, overall 900 and 160, and a headline without an unsupported causal claim."
        }
      ]
    },
    {
      id: "dashboards-lab-s7",
      week: 7,
      title: "Correct the misleading conversion tile",
      minutes: 105,
      scenario: [
        "Leela finds another Tara Learning Kits draft with the monthly tiles shown below. The first two columns of counts are the verified source; the displayed percentages are draft outputs to audit, not additional source truth. All cohorts are unique and have completed the same 30-day observation window. There is no April source cohort.",
        "Revisit the mismatch step in Build an honest dashboard using its own counts. Then recreate and repair this separate draft in Looker Studio, calculating rates from the source rather than typing a corrected label. Save the original mismatch and test March, February plus March, April and the full reset. Keep independent expectations beside actual observations."
      ],
      dataset: {
        columns: ["First-enquiry month", "Qualified leads", "Customers within 30 days", "Draft displayed rate, %"],
        rows: [
          ["2026-01-01", "200", "30", "15"],
          ["2026-02-01", "250", "45", "18"],
          ["2026-03-01", "300", "60", "25"]
        ]
      },
      outcome: "A corrected rate calculation and an audit log showing the original error, independent workings and repeatable selection tests.",
      tasks: [
        {
          id: "dashboards-lab-s7-t1",
          type: "short",
          prompt: "Rebuild March's rate from its verified counts. What percentage should replace the draft 25% tile? Enter the corrected percentage, not the size of the error.",
          answer: { kind: "number", value: 20, tolerance: 0.01 },
          explanation: "March conversion is 60 / 300 x 100 = 20%. The 25% tile overstates it by 25 - 20 = 5 percentage points. A reverse check at 25% would imply 75 customers, not the recorded 60."
        },
        {
          id: "dashboards-lab-s7-t2",
          type: "short",
          prompt: "Build the combined rate for all three cohorts using summed customers and summed leads. What percentage should the reset view show?",
          answer: { kind: "number", value: 18, tolerance: 0.01 },
          explanation: "Customers total 30 + 45 + 60 = 135; leads total 200 + 250 + 300 = 750. Combined conversion is 135 / 750 x 100 = 18%. Averaging the corrected monthly rates gives about 17.67%, which weights unequal cohorts equally."
        },
        {
          id: "dashboards-lab-s7-t3",
          type: "case",
          prompt: "Write an error-analysis handover for Leela. Explain why editing the visible March label is insufficient, specify the calculation and source settings to inspect, and give expected selection results that would reveal a stale value or an incorrect denominator after the repair.",
          rubric: [
            "Corrects March to 20% from 60 / 300 and records the original five-percentage-point overstatement.",
            "Uses summed customers divided by summed leads under matching cohort filters instead of averaging displayed rates.",
            "Checks February plus March as 550 leads, 105 customers and approximately 19.09% conversion.",
            "Tests April as no records with an unavailable rate and reset as 750 leads, 135 customers and 18%, retaining actual results."
          ],
          minWords: 120
        },
        {
          id: "dashboards-lab-s7-t4",
          type: "proof",
          prompt: "Attach the repaired dashboard, original tile evidence and expected-versus-observed test log. Include the calculated field and its filter scope.",
          mustShow: "The original 25% tile, its 20% correction from source counts, the aggregated ratio formula and March, combined-month, no-records and reset test evidence."
        }
      ]
    },
    {
      id: "dashboards-lab-s8",
      week: 8,
      title: "Capstone: submit the verified sales dashboard",
      minutes: 120,
      scenario: [
        "Priya asks for Sundar Traders' final fictional sales-team dashboard using this new source. Each row is one unique order, with INR sales excluding tax and delivery. Define exactly three KPIs: completed sales, completed order count and average completed order value. The default is 1 to 30 November 2026 inclusive, all regions. The October, December and non-completed records are deliberate scope tests.",
        "Build in Looker Studio from a checked Google Sheets source, applying the reasoning practised in the simulation. Include date and Region filters, a labelled regional bar chart and a five-point checklist covering source connection, definitions, reconciliation, filter behaviour, and missing or empty data. Test North on 3 November, the 30 November boundary, 12 November with no completed orders and reset. Submit actual observations, not only expected figures."
      ],
      dataset: {
        columns: ["Order ID", "Sale date", "Region", "Status", "Sales, INR"],
        rows: [
          ["D801", "2026-11-01", "North", "Completed", "1200"],
          ["D802", "2026-11-03", "North", "Completed", "1800"],
          ["D803", "2026-11-03", "South", "Completed", "2400"],
          ["D804", "2026-11-10", "South", "Completed", "600"],
          ["D805", "2026-11-12", "North", "Cancelled", "900"],
          ["D806", "2026-11-12", "South", "Pending", "1500"],
          ["D807", "2026-10-31", "North", "Completed", "800"],
          ["D808", "2026-11-30", "North", "Completed", "2000"],
          ["D809", "2026-12-01", "South", "Completed", "1000"]
        ]
      },
      outcome: "A submitted one-page sales dashboard with three defined KPIs, two working filters, five evidence-backed validation points and a supported interpretation.",
      tasks: [
        {
          id: "dashboards-lab-s8-t1",
          type: "short",
          prompt: "Complete the capstone report and reconcile its default November completed-sales card to the source. What is the correct total in INR?",
          answer: { kind: "number", value: 8000, tolerance: 0.5 },
          explanation: "D801, D802, D803, D804 and D808 qualify: 1200 + 1800 + 2400 + 600 + 2000 = INR 8000. The 30 November order is included; October, December, Cancelled and Pending rows are not."
        },
        {
          id: "dashboards-lab-s8-t2",
          type: "short",
          prompt: "Check the default average order value against the qualifying source rows. Enter the correct INR-per-order figure from your completed report.",
          answer: { kind: "number", value: 1600, tolerance: 0.5 },
          explanation: "Five unique completed November orders contribute INR 8000. Average order value is 8000 / 5 = INR 1600. The numerator and denominator must respond to the same status and date conditions."
        },
        {
          id: "dashboards-lab-s8-t3",
          type: "case",
          prompt: "Submit a management interpretation for Priya, who asks whether to reduce South's support based on its lower sales total. Cite the checked regional figures and counts, explain the limit of that comparison and recommend a proportionate next evidence check. State how the submitted report was validated.",
          rubric: [
            "Reconciles North INR 5000 across three orders and South INR 3000 across two to INR 8000 across five.",
            "Avoids inferring effort, profit or the cause of the difference from this order sample alone.",
            "Recommends reviewing targets, source completeness or pipeline context before changing regional support.",
            "References all five validation points, observed combined and empty selections, reset behaviour and the reviewed source version."
          ],
          minWords: 120
        },
        {
          id: "dashboards-lab-s8-t4",
          type: "proof",
          prompt: "Submit the one-page dashboard with restricted reviewer access, or an evidence file containing full-page and filter-state captures. Include its source, calculation settings, five-point checklist, expected-versus-observed log and management interpretation. Verify the delivered evidence can be opened.",
          mustShow: "Exactly three defined KPIs, two filters, a zero-baseline regional chart, independent source reconciliation, combined and end-date tests, no-records and reset states, source freshness and a bounded recommendation."
        }
      ]
    }
  ]
};
