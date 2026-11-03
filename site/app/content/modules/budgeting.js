export default {
  moduleId: "budgeting",
  tagline: "Build a checked service budget and explain what its price, contribution, profit and cash figures do and do not tell you.",
  weeks: [
    {
      week: 1,
      theme: "A cost map and a checked service price",
      lessons: [
        {
          id: "budgeting-w1-l1",
          title: "Classify the money",
          minutes: 60,
          objective: "Define one service unit and reporting month, classify costs and separate operating results from cash-payment timing.",
          sections: [
            {
              heading: "Choose a unit, a month and a currency",
              body: [
                "Our fictional business, Meera Print Services, prepares workshop packs. One sale means one completed pack-preparation service, priced at INR 500 in case B1. Model November 2026 only and use INR throughout. These operating figures are not currency conversions of course fees. Begin in Google Sheets with separate inputs and calculations so another learner can see what was assumed. The exercise develops a small planning model, not an accounting opinion or a decision to spend real money."
              ],
              bullets: [
                "Unit: one completed workshop-pack preparation service.",
                "Period: November 2026; all worked amounts are INR.",
                "Volume assumptions: 70 base, 50 lower and 90 higher completed packs.",
                "Capacity assumption: the stated cost structure applies from zero to 90 packs in the month."
              ]
            },
            {
              heading: "Classify each cost within the stated range",
              body: [
                "Fixed costs stay unchanged over the stated month and activity range, while variable costs rise with each completed pack. Enter the six fictional cost lines below on a Costs tab, with Item in column A, Amount in B, Type in C, Unit in D and Source in E. The fixed amounts total INR 12,000 per month. The variable amounts total INR 270 per pack. Keep the units visible so a monthly amount is not accidentally treated as a per-sale charge."
              ],
              table: {
                columns: ["Item", "Amount, INR", "Type", "Unit", "Fictional source"],
                rows: [
                  ["Workspace", "6,000", "Fixed", "Per month", "B1 workspace note"],
                  ["Administration support", "4,000", "Fixed", "Per month", "B1 support note"],
                  ["Utilities allowance", "2,000", "Fixed", "Per month", "B1 utilities note"],
                  ["Materials", "180", "Variable", "Per completed pack", "B1 materials note"],
                  ["Delivery", "60", "Variable", "Per completed pack", "B1 delivery note"],
                  ["Handling", "30", "Variable", "Per completed pack", "B1 handling note"]
                ]
              }
            },
            {
              heading: "Separate earning money from receiving it",
              body: [
                "For this exercise, revenue is recorded when the service is delivered. Cash is recorded when money is received or paid. Case B1 assumes all modelled packs are delivered in November, but only 60% of their sales value is collected that month; the rest is due in December. All November modelled costs are paid in November. These timing assumptions belong beside the cost map because a profitable month can still need funding before customer receipts arrive."
              ],
              table: {
                columns: ["Measure", "What it describes"],
                rows: [
                  ["Revenue", "Value of completed services in the reporting month"],
                  ["Contribution", "Revenue less variable costs"],
                  ["Operating profit", "Contribution less the modelled fixed costs"],
                  ["Cash balance", "Opening cash plus receipts less payments at a point in time"]
                ]
              },
              callout: {
                type: "warning",
                title: "Keep the timing visible",
                text: "A completed service, an issued invoice and a cash receipt are different events. This case assumes the service is delivered before the remaining payment is collected."
              }
            },
            {
              heading: "Build an input sheet that can be audited",
              body: [
                "Create Inputs, Unit, Budget, Cash, Actual and Memo tabs beside Costs. On Inputs, put labels in column A, values in B, units in C and fictional source references in D. Link the cost totals rather than typing them again. Use Google Sheets Format, Number to display currency and percentages while keeping numeric cells numeric. In Microsoft Excel, use Home, Number for the equivalent display formats. Keep a note of excluded costs so the model's boundaries remain clear.",
                "The separate Price to break even lab uses one compact sheet in the browser, also openable in Google Sheets. Its input addresses are B1 price, B2 variable cost per pack, B3 fixed costs and B5 planned packs. Do not copy the multi-tab assignment's input addresses into that lab: read the labels and use the exact task cells given in the practice instructions."
              ],
              table: {
                columns: ["Input cell", "Meaning", "Value or formula"],
                rows: [
                  ["B2", "Price per pack", "500, fictional B1 price assumption"],
                  ["B3", "Variable cost per pack", "=SUM(Costs!B5:B7)"],
                  ["B4", "Monthly fixed costs", "=SUM(Costs!B2:B4)"],
                  ["B5", "Base volume", "70"],
                  ["B6", "Lower volume", "50"],
                  ["B7", "Higher volume", "90"],
                  ["B8", "Opening November cash", "4000"],
                  ["B9", "Share collected in November", "60%"]
                ]
              },
              bullets: [
                "The displayed Costs table starts at row 1 with headers, so its six input lines occupy rows 2 through 7.",
                "The model excludes tax, finance charges, one-off equipment purchases and owner pay.",
                "Source labels identify fictional teaching assumptions, not verified market quotations."
              ]
            },
            {
              heading: "Common mistakes and how to avoid them",
              body: [
                "Start by checking units and timing rather than rushing into formulas. A number can be accurate on its source note and still be wrong in the model if it is entered as the wrong type of cost or period."
              ],
              bullets: [
                "Monthly workspace cost is charged per pack → label fixed costs per month and variable costs per completed pack.",
                "A price cell contains the text INR 500 → enter numeric 500 and show the currency through formatting and labels.",
                "Delivered sales are treated as money received → keep collection timing and revenue separate.",
                "The lab is given the assignment's cell references → read each sheet's labels and use the correct layout."
              ]
            },
            {
              heading: "What good looks like",
              body: [
                "Ask a reviewer to trace the inputs back to the six fictional source lines. The cost map is ready when its amounts, units, timing and exclusions can all be checked from the workbook."
              ],
              bullets: [
                "The model states one pack-preparation service, November 2026, INR and a zero-to-90-pack activity range.",
                "Fixed costs reconcile as 6,000 + 4,000 + 2,000 = INR 12,000 per month.",
                "Variable costs reconcile as 180 + 60 + 30 = INR 270 per completed pack.",
                "Inputs remain numeric, source-labelled and linked to Costs, with price 500 and base volume 70.",
                "The 60% November collection assumption, December balance and excluded costs are visible."
              ]
            }
          ],
          practice: {
            labId: "budgeting",
            instruction: "Open Price to break even. Check its inputs: B1 price 500, B2 variable cost 270, B3 fixed costs 12000 and B5 packs 70. Task 1: enter =B1-B2 in B4 and confirm 230 per pack. Explain why B3 is not subtracted again for every pack."
          },
          checkpoint: [
            {
              question: "Why enter 500 as a number and show INR through formatting rather than typing INR 500 into the price cell?",
              answer: "A numeric value can be used reliably in formulas, while mixed text may be ignored or cause an error. Currency formatting shows the unit without changing the underlying number, and the separate unit label makes the meaning explicit."
            },
            {
              question: "A request for 120 packs arrives, beyond the stated capacity range. Which assumption needs review before extending the budget?",
              answer: "Review whether the same fixed and per-pack costs still apply beyond 90 packs. Extra space, equipment or support could change the cost structure. Do not copy the existing model further without recording and checking new capacity assumptions."
            }
          ]
        },
        {
          id: "budgeting-w1-l2",
          title: "Price a simple service",
          minutes: 60,
          objective: "Calculate contribution per sale and a whole-unit break-even quantity, then test the formulas around the break-even boundary.",
          sections: [
            {
              heading: "Calculate what one sale contributes",
              body: [
                "Contribution per pack is price less variable cost per pack. For case B1, INR 500 minus INR 270 leaves INR 230 to cover fixed costs and then operating profit. Put this calculation in Unit cell B2 and label it in A2. A positive contribution does not mean the monthly business is profitable, because the total contribution must first cover INR 12,000 of fixed costs. Keep the unit calculation separate from the monthly calculation to avoid subtracting fixed costs twice."
              ],
              steps: [
                "In Unit B2, enter =Inputs!B2-Inputs!B3 and confirm the result is 230.",
                "In Unit B3, enter =B2/Inputs!B2 and display a percentage: the contribution margin is 46%.",
                "Label that percentage Contribution margin, not Profit margin.",
                "Microsoft Excel uses the same formulas; only the number-format controls differ."
              ]
            },
            {
              heading: "Round the break-even quantity in the right direction",
              body: [
                "Break-even asks how many completed packs cover the modelled fixed costs. Divide INR 12,000 by INR 230 to get about 52.17 packs. Because the service is sold in whole packs, round upward to 53. Rounding to 52 would leave some fixed costs uncovered. This is a minimum whole-unit threshold under the stated assumptions, not a forecast of demand or proof that buyers will accept the chosen price. Keep the unrounded calculation available for review."
              ],
              steps: [
                "In Unit B4, enter =IF(B2<=0,\"No finite break-even\",ROUNDUP(Inputs!B4/B2,0)).",
                "Confirm the result is 53 packs when contribution is 230 and fixed costs are 12000.",
                "Use the same ROUNDUP and IF formula in Microsoft Excel with English formula settings.",
                "Label the result Minimum whole packs to cover modelled monthly fixed costs."
              ],
              callout: {
                type: "definition",
                title: "Why the guard matters",
                text: "With positive fixed costs and contribution at zero or below, selling more units cannot cover those costs in this model. Report no finite break-even rather than dividing by zero or presenting a negative sales target."
              }
            },
            {
              heading: "Test the boundary, not just the main example",
              body: [
                "A formula can look plausible while referencing the wrong cell. Check the two quantities around the whole-unit threshold using contribution multiplied by volume, less fixed costs. At 52 packs the result is a loss of INR 40; at 53 it is a profit of INR 190. Also test a zero-contribution price on a copy and confirm the break-even warning appears. Restore the original inputs before saving the checked unit-economics sheet as your Week 1 B artefact."
              ],
              table: {
                columns: ["Test volume", "Total contribution, INR", "Fixed costs, INR", "Operating result, INR"],
                rows: [
                  ["52", "11,960", "12,000", "-40"],
                  ["53", "12,190", "12,000", "190"],
                  ["70", "16,100", "12,000", "4,100"]
                ]
              }
            },
            {
              heading: "Treat price as a decision with assumptions",
              body: [
                "The INR 500 price is a fictional case assumption, not a claim about what a market will pay. A useful pricing note explains the service included, the per-sale costs, the capacity range and the costs left outside the model. Compare a proposed price with contribution and break-even before recommending further investigation. If the price equals the INR 270 variable cost, contribution is zero; if it falls below that cost, each additional sale increases the modelled loss before fixed costs."
              ],
              bullets: [
                "Keep the positive-contribution base price of INR 500 for the assignment model.",
                "Use a copy for boundary tests so experiments do not silently change the submitted assumptions.",
                "Record the expected and observed result for each formula test.",
                "Do not describe a mathematically positive contribution as evidence of actual customer demand."
              ]
            },
            {
              heading: "Common mistakes and how to avoid them",
              body: [
                "Pricing arithmetic needs both a unit check and a boundary test. Explain what the result means before recommending any next step, especially when contribution is positive but fixed costs remain uncovered."
              ],
              bullets: [
                "52.17 packs are rounded to 52 → use ROUNDUP and verify that the whole-unit threshold covers fixed costs.",
                "INR 230 contribution is called monthly profit → multiply by volume, then subtract monthly fixed costs once.",
                "Zero contribution is divided into fixed costs → use a guard and report No finite break-even.",
                "A correct answer is typed into a result cell → reference the input cells so a changed assumption recalculates."
              ]
            },
            {
              heading: "What good looks like",
              body: [
                "A reviewer should be able to change an input on a copy and observe the correct response. Use the saved expected and observed results to show that you tested the logic, not only the base example."
              ],
              bullets: [
                "Linked price less variable cost returns INR 230 per pack and a clearly labelled 46% contribution margin.",
                "The whole-pack break-even formula returns 53 from 12,000 / 230, about 52.17 before rounding.",
                "Boundary checks show 52 packs at INR -40 and 53 packs at INR 190.",
                "The assignment's zero-contribution test displays a warning rather than a divide-by-zero result.",
                "Original inputs are restored, and the pricing note states capacity, excluded costs and untested demand."
              ]
            }
          ],
          practice: {
            labId: "budgeting",
            instruction: "Open Price to break even. Task 1: enter =B1-B2 in B4. Task 2: enter =ROUNDUP(B3/B4,0) in B6 and confirm 53 packs. Use the supplied inputs, then test 52 and 53 packs on your workbook copy and retain expected and observed results."
          },
          checkpoint: [
            {
              question: "Why does checking both 52 and 53 packs provide stronger evidence than checking only the displayed break-even number?",
              answer: "It tests the boundary directly: 52 packs leave a loss of INR 40, while 53 leave INR 190 after fixed costs. This confirms that the formula rounded upward and that the reported whole-unit threshold actually covers the modelled costs."
            },
            {
              question: "What should a break-even formula report if price is INR 270 and variable cost is also INR 270?",
              answer: "Contribution is zero, so no finite quantity covers the positive fixed costs in this model. The formula should display a clear warning instead of dividing by zero, and the pricing assumptions need review before recommending a plan."
            }
          ]
        }
      ]
    },
    {
      week: 2,
      theme: "Three scenarios, cash timing and a decision memo",
      lessons: [
        {
          id: "budgeting-w2-l1",
          title: "Build a useful budget",
          minutes: 60,
          objective: "Build linked base, lower and higher demand scenarios and check their revenue, costs, contribution and monthly operating results.",
          sections: [
            {
              heading: "Keep scenarios comparable",
              body: [
                "A scenario changes a stated assumption so you can inspect its consequences. Use 70 packs for base demand, 50 for lower demand and 90 for higher demand. Hold price at INR 500, variable cost at INR 270 per pack and fixed costs at INR 12,000 for each case. This isolates the volume effect within the stated capacity range. The labels describe alternatives, not probabilities, and the base case is not automatically the most likely outcome."
              ],
              table: {
                columns: ["Scenario", "Packs", "Revenue, INR", "Variable costs, INR", "Profit or loss, INR"],
                rows: [
                  ["Base", "70", "35,000", "18,900", "4,100"],
                  ["Lower", "50", "25,000", "13,500", "-500"],
                  ["Higher", "90", "45,000", "24,300", "8,700"]
                ]
              }
            },
            {
              heading: "Link the monthly formulas to the inputs",
              body: [
                "On Budget, use columns A through F for Scenario, Volume, Revenue, Variable costs, Contribution and Operating profit. Put the base, lower and higher cases in rows 2, 3 and 4. Link each volume to its Inputs cell. In the formulas, dollar signs keep the price and cost references fixed when you copy down; the volume row changes with each scenario. This avoids separate hand-typed models that can drift apart after an input is revised."
              ],
              steps: [
                "Set B2 to =Inputs!B5, B3 to =Inputs!B6 and B4 to =Inputs!B7.",
                "In C2 use =B2*Inputs!$B$2; in D2 use =B2*Inputs!$B$3.",
                "In E2 use =C2-D2; in F2 use =E2-Inputs!$B$4.",
                "Copy C2:F2 down through row 4, then check every formula's references.",
                "The same formulas and absolute-reference notation work in Microsoft Excel."
              ]
            },
            {
              heading: "Reconcile the results and question the assumptions",
              body: [
                "Check each row independently as volume multiplied by INR 230 contribution, less INR 12,000 fixed costs. The lower case produces a loss of INR 500 even though every pack makes a positive contribution. Compare the 50-pack case with the 53-pack whole-unit threshold and explain the gap in words. Then ask what could invalidate the comparison, such as a changed delivery price or extra capacity costs. Keep these questions separate from the figures supported by the current inputs."
              ],
              bullets: [
                "Base: 70 multiplied by 230, less 12000, gives 4100.",
                "Lower: 50 multiplied by 230, less 12000, gives -500.",
                "Higher: 90 multiplied by 230, less 12000, gives 8700.",
                "Contribution per pack and break-even stay at INR 230 and 53 packs in all three unchanged-cost scenarios."
              ],
              callout: {
                type: "tip",
                title: "Use a simple reasonableness check",
                text: "Each extra pack contributes INR 230 under these assumptions. Moving from 70 to 90 packs adds 20 packs and INR 4,600 profit, taking the result from INR 4,100 to INR 8,700."
              }
            },
            {
              heading: "Label a downside test precisely",
              body: [
                "The interactive lab asks for a separate demand fall of 20% from the planned packs. From 70 packs, this leaves 56, not the 50 packs in our named lower scenario. With contribution of INR 230 and fixed costs of INR 12,000, the 56-pack result is INR 880. Keep the shock percentage and starting volume beside that calculation. Different downside assumptions can legitimately produce different answers, but an unexplained change of baseline makes the comparison misleading."
              ],
              steps: [
                "For lab Task 5, use =B5*80% in B9: 70 multiplied by 0.8 gives 56 packs.",
                "Use =B9*B4-B3 in B10: 56 multiplied by 230, less 12000, gives 880.",
                "Record this as a separate 20% demand test, not a substitute for the 50-pack lower scenario.",
                "Save the three linked scenario rows and their checks as the Week 2 A artefact."
              ]
            },
            {
              heading: "Common mistakes and how to avoid them",
              body: [
                "Comparable scenarios need shared cost assumptions and clearly labelled changes. Inspect the copied formulas before interpreting the result, then explain which single assumption changed and which ones stayed fixed."
              ],
              bullets: [
                "Copied prices drift down the Inputs tab → lock shared price and cost references with dollar signs.",
                "A 20% fall keeps only 20% of demand → retain 80% of 70, giving 56 packs.",
                "The 56-pack lab test is labelled the 50-pack lower case → keep both assumptions and their different results visible.",
                "A volume scenario also changes price without notice → isolate the volume effect or explicitly label every changed input."
              ]
            },
            {
              heading: "What good looks like",
              body: [
                "A reviewer should be able to reproduce every row from the shared inputs. Compare each operating result with a separate volume-times-contribution check before saving the scenario sheet."
              ],
              bullets: [
                "Base, lower and higher rows link to 70, 50 and 90 packs while sharing price 500, variable cost 270 and fixed costs 12000.",
                "The rows return revenue of INR 35,000, INR 25,000 and INR 45,000 with variable costs of 18,900, 13,500 and 24,300.",
                "Operating results reconcile to INR 4,100, INR -500 and INR 8,700 after subtracting fixed costs once.",
                "The separate lab downside shows 70 x 0.8 = 56 packs and 56 x 230 - 12,000 = INR 880.",
                "Formula references, capacity limits and the distinction between scenarios and forecasts are documented."
              ]
            }
          ],
          practice: {
            labId: "budgeting",
            instruction: "Open Price to break even. Task 1: B4 =B1-B2. Task 2: B6 =ROUNDUP(B3/B4,0). Task 3: B7 =B1*B5. Task 4: B8 =B5*B4-B3. Task 5: B9 =B5*80% and B10 =B9*B4-B3. Check 56 packs and INR 880; keep this separate from the 50-pack lower scenario."
          },
          checkpoint: [
            {
              question: "When copying the scenario formulas downward, why should the price reference stay fixed while the volume row changes?",
              answer: "Every scenario uses the same price assumption, but each row has a different volume. An absolute price reference preserves that shared input; a changing volume reference lets the formula calculate the correct scenario instead of repeatedly using the base quantity."
            },
            {
              question: "Why should the lab's 20% demand reduction from 70 packs not be labelled as the budget's 50-pack lower case?",
              answer: "A 20% reduction leaves 56 packs, while the named lower scenario uses 50. Their results are INR 880 and a loss of INR 500 respectively. Label the starting quantity and shock so different assumptions are not mistaken for calculation errors."
            }
          ]
        },
        {
          id: "budgeting-w2-l2",
          title: "Explain the decision",
          minutes: 60,
          objective: "Prepare a cash schedule and one-page memo explaining assumptions, lower-demand risk, funding needs and a checked actual-minus-plan variance.",
          sections: [
            {
              heading: "Schedule receipts and payments separately",
              body: [
                "For the base case, revenue is INR 35,000 but November receipts are only 60% of that amount, or INR 21,000. The remaining INR 14,000 is due in December. Opening cash is INR 4,000 and November cost payments total INR 30,900. Use the fictional weekly schedule below to calculate each closing balance as opening balance plus receipts less payments. Carry each week's closing balance into the next week rather than restarting from the month's opening cash."
              ],
              table: {
                columns: ["Week", "Receipts, INR", "Payments, INR", "Unfunded closing balance, INR"],
                rows: [
                  ["1", "0", "12,000", "-8,000"],
                  ["2", "7,000", "6,300", "-7,300"],
                  ["3", "7,000", "6,300", "-6,600"],
                  ["4", "7,000", "6,300", "-5,900"]
                ]
              },
              steps: [
                "On Cash, use columns A to E for Week, Opening balance, Receipts, Payments and Closing balance.",
                "For week 1 in row 2, set B2 to =Inputs!B8 and E2 to =B2+C2-D2.",
                "For week 2, set B3 to =E2 and E3 to =B3+C3-D3; continue the same pattern for later weeks.",
                "Check that receipts total 21000 and payments total 12000 + 18900 = 30900; Microsoft Excel uses the same formulas."
              ]
            },
            {
              heading: "Find the funding need before the month ends",
              body: [
                "Week 1's fixed-cost payment occurs before any receipt, leaving an unmet cash need of INR 8,000. In weeks 2 through 4, assume each INR 7,000 receipt arrives before the INR 6,300 variable-cost instalment. Under that ordering, the largest shortfall is INR 8,000 even though month-end shows INR 5,900. Negative balances represent an unfunded plan, not permission to overdraw. Ask for an approved funding or payment-timing decision before treating the plan as feasible, and recheck daily timing if the sequence changes."
              ],
              bullets: [
                "A month-end figure can hide a larger earlier funding gap.",
                "The schedule assumes no other receipts, payments or opening receivables.",
                "Do not add an unapproved loan or earlier customer payment simply to remove a negative balance.",
                "If INR 8,000 funding were approved before week 1, it would be a separate cash flow, not sales revenue."
              ]
            },
            {
              heading: "Explain an actual-minus-plan difference",
              body: [
                "Fictional actual note A1 records 65 completed packs at INR 500, variable cost of INR 275 per pack and fixed costs of INR 12,000. Actual revenue is INR 32,500 and variable costs are INR 17,875, leaving operating profit of INR 2,625. Define variance as actual minus plan. Compared with planned profit of INR 4,100, the variance is minus INR 1,475, an adverse profit difference. Keep actual inputs on their own tab so the original plan remains visible."
              ],
              table: {
                columns: ["Measure", "Plan", "Actual", "Actual minus plan"],
                rows: [
                  ["Completed packs", "70", "65", "-5 packs"],
                  ["Revenue, INR", "35,000", "32,500", "-2,500"],
                  ["Variable cost per pack, INR", "270", "275", "+5"],
                  ["Operating profit, INR", "4,100", "2,625", "-1,475"]
                ]
              },
              callout: {
                type: "example",
                title: "Reconcile the profit difference",
                text: "Five fewer packs at planned contribution of INR 230 reduce profit by INR 1,150. An extra INR 5 cost on 65 actual packs reduces it by INR 325. Together, INR 1,150 + INR 325 = INR 1,475 adverse."
              }
            },
            {
              heading: "Write the one-page management memo",
              body: [
                "Open the memo with the decision and the assumptions that make it conditional. Explain that INR 500 produces positive contribution, but the lower-demand case loses money and the base cash schedule needs attention before delivery starts. Include the checked actual variance without inventing why demand was lower. State the excluded costs and the capacity limit. End with a specific review request, such as confirming fictional collection terms and funding timing, rather than a confident recommendation unsupported by the model."
              ],
              steps: [
                "State the service unit, month, currency, source assumptions and excluded costs.",
                "Report INR 230 contribution, 53-pack break-even and all three scenario profits or losses.",
                "Explain the 50-pack loss of INR 500 and the base case's INR 8,000 early funding need.",
                "Show actual profit of INR 2,625 and the checked INR 1,475 adverse variance against plan.",
                "Submit the cost map, input links, formula tests, scenarios, cash schedule and one-page memo as the final pack."
              ]
            },
            {
              heading: "Common mistakes and how to avoid them",
              body: [
                "The memo should help a reader make a timed decision, not simply repeat a profit figure. Separate cash needs, operating results and variance explanations so that a favourable number cannot hide a different problem."
              ],
              bullets: [
                "Month-end shortfall is treated as the peak funding need → inspect every dated balance and the order of payments and receipts.",
                "An assumed loan removes the shortfall → leave funding unapproved and request a responsible decision before treating it as available.",
                "Actuals overwrite the plan → retain both versions and calculate actual minus plan consistently.",
                "Lower total variable spending is called better cost control → check volume and per-pack cost separately."
              ]
            },
            {
              heading: "What good looks like",
              body: [
                "A reviewer should be able to trace the memo to the profit model, cash schedule and actual inputs. Use the checks below to confirm that the recommendation includes both evidence and a clear limit on what is known."
              ],
              bullets: [
                "Base receipts reconcile to INR 21,000 in November and INR 14,000 due in December, against INR 35,000 revenue.",
                "Cash balances carry forward correctly and show INR -8,000 at the earliest low point and INR -5,900 at month-end.",
                "The funding request states the timing assumptions and does not insert an unapproved receipt or loan.",
                "Actual profit is INR 2,625 and its INR -1,475 variance reconciles to 1,150 volume plus 325 unit-cost effects.",
                "The memo states excluded costs, capacity, scenario risks and a specific review request without inventing causes."
              ]
            }
          ],
          practice: {
            labId: "budgeting",
            instruction: "Open Price to break even. Task 1: check B4 contribution. Task 2: check B6 break-even. Task 3: calculate B7 revenue. Task 4: calculate B8 result. Task 5: calculate B9/B10 downside. Use cell references; explain why INR 4,100 and INR 880 are operating results, not cash."
          },
          checkpoint: [
            {
              question: "Why is the month-end shortfall of INR 5,900 not the full funding requirement in this cash schedule?",
              answer: "The week 1 payment occurs before any receipts, creating a larger shortfall of INR 8,000. Later receipts reduce it. A funding plan must consider the lowest balance under the stated payment order, not only the closing balance at month-end."
            },
            {
              question: "Actual total variable costs are lower than plan, yet variable cost per pack has risen. How can both be true?",
              answer: "Actual volume fell to 65, so fewer packs incurred costs. Total variable costs are INR 17,875 rather than INR 18,900, but each pack costs INR 275 rather than INR 270. Lower total spending does not by itself prove improved unit-cost control."
            }
          ]
        },
        {
          id: "budgeting-w2-l3",
          title: "Case study: Meera Print Services end to end",
          minutes: 60,
          objective: "Complete a cell-linked service budget, reconcile base and downside results, test whole-pack break-even and explain the separate cash decision.",
          sections: [
            {
              heading: "Set up the inputs and state the boundaries",
              body: [
                "Bring fictional case B1 together using the compact lab layout, not the assignment's Inputs tab addresses. Put price 500 in B1, variable cost per pack 270 in B2, monthly fixed costs 12000 in B3 and planned packs 70 in B5. The variable input comes from 180 + 60 + 30 = INR 270; fixed costs come from 6,000 + 4,000 + 2,000 = INR 12,000. Keep these as numeric inputs with visible INR and pack labels. All services are assumed delivered in November 2026.",
                "Meera's planning question is whether 70 packs cover the modelled operating costs and what changes if demand is 20% lower. Capacity remains zero to 90 packs, and tax, finance charges, equipment purchases and owner pay remain excluded. The arithmetic tests the assumptions; it does not establish customer demand or authorise spending. Keep the unchanged base inputs visible while calculating the downside in its own cells."
              ]
            },
            {
              heading: "Build linked formulas and reconcile the base case",
              body: [
                "Enter formulas, not the expected answers, in every result cell below. For 70 packs, revenue is 70 x 500 = INR 35,000 and variable costs are 70 x 270 = INR 18,900. Their difference is INR 16,100 contribution, also 70 x 230. Subtract INR 12,000 fixed costs once to obtain INR 4,100 operating profit. If an input changes, all dependent results must recalculate without retyping the answers."
              ],
              table: {
                columns: ["Lab task", "Cell", "Formula", "Expected result"],
                rows: [
                  ["Task 1: contribution per pack", "B4", "=B1-B2", "INR 230"],
                  ["Task 2: whole-pack break-even", "B6", "=ROUNDUP(B3/B4,0)", "53 packs"],
                  ["Task 3: revenue", "B7", "=B1*B5", "INR 35,000"],
                  ["Task 4: operating result", "B8", "=B5*B4-B3", "INR 4,100"],
                  ["Task 5: downside packs", "B9", "=B5*80%", "56 packs"],
                  ["Task 5: downside result", "B10", "=B9*B4-B3", "INR 880"]
                ]
              },
              callout: {
                type: "example",
                title: "Check the threshold on both sides",
                text: "12,000 / 230 is about 52.17 packs, so ROUNDUP returns 53. At 52 packs: 52 x 230 - 12,000 = INR -40. At 53: 53 x 230 - 12,000 = INR 190. The first whole-pack quantity that covers these costs is 53, not 52."
              }
            },
            {
              heading: "Compare downside and cash before recommending a plan",
              body: [
                "A 20% demand fall keeps 80% of 70: 70 x 0.8 = 56 packs. Revenue becomes 56 x 500 = INR 28,000; variable costs become 56 x 270 = INR 15,120. Contribution is 28,000 - 15,120 = INR 12,880, so the result is 12,880 - 12,000 = INR 880. The profit reduction is 4,100 - 880 = INR 3,220, also 14 fewer packs x INR 230. The separate 50-pack lower scenario still loses INR 500; do not relabel it as this downside.",
                "Return to the base cash assumptions for the decision note. November receipts are 35,000 x 60% = INR 21,000, with INR 14,000 due in December. Opening cash 4,000 + receipts 21,000 - payments 30,900 leaves INR -5,900 at month-end. The first INR 12,000 payment precedes receipts, so the earlier gap is 12,000 - 4,000 = INR 8,000. Keep that funding request separate from the positive INR 4,100 operating result."
              ],
              steps: [
                "Retain the base and downside formulas with their input labels and independent arithmetic checks.",
                "On a copy, change one input and verify linked results move; restore the case inputs afterwards.",
                "Use the assignment's guarded break-even formula if testing zero or negative contribution; do not divide blindly.",
                "Write a conditional memo asking the reviewer to check demand evidence, collection terms and the INR 8,000 early funding need."
              ]
            },
            {
              heading: "Common mistakes and how to avoid them",
              body: [
                "This compact sheet is useful only if the relationships remain intact. Inspect formulas and labels before reading out a profit number, then explain which decisions still need evidence beyond the spreadsheet."
              ],
              bullets: [
                "230 or 4100 is typed as a result → use the task's input-cell references so later changes flow through.",
                "Fixed costs are subtracted per pack and again per month → calculate unit contribution first, then subtract fixed costs once.",
                "The downside overwrites B5 with 56 → retain planned 70 in B5 and calculate 80% of it in B9.",
                "A profitable model is called cash-ready → check the dated schedule and flag the INR 8,000 early gap.",
                "52 packs are accepted as break-even → test 52 and 53 to expose the INR 40 shortfall below the threshold."
              ]
            },
            {
              heading: "What good looks like",
              body: [
                "Ask a reviewer to tick the sheet and memo together. A complete answer shows the calculations, the checks and the unresolved decision, without confusing a modelled operating result with money available to spend."
              ],
              bullets: [
                "B1, B2, B3 and B5 contain numeric inputs 500, 270, 12000 and 70 with units and fictional sources.",
                "B4, B6, B7, B8, B9 and B10 contain cell-linked formulas rather than typed results.",
                "Base revenue 35,000 less variable costs 18,900 gives contribution 16,100 and operating profit 4,100, all INR.",
                "Break-even is 53 whole packs, supported by the INR -40 and INR 190 boundary checks.",
                "The 56-pack downside gives contribution INR 12,880 and result INR 880, a decrease of INR 3,220 from base.",
                "The memo separates base cash timing and the INR 8,000 early gap from operating profit and states excluded costs."
              ]
            }
          ],
          practice: {
            labId: "budgeting",
            instruction: "Open Price to break even. Task 1: B4 =B1-B2. Task 2: B6 =ROUNDUP(B3/B4,0). Task 3: B7 =B1*B5. Task 4: B8 =B5*B4-B3. Task 5: B9 =B5*80% and B10 =B9*B4-B3. Check 230, 53, 35000, 4100, 56 and 880; keep formulas, not typed answers."
          },
          checkpoint: [
            {
              question: "Which two linked formulas establish contribution and whole-pack break-even in the compact sheet?",
              answer: "B4 uses =B1-B2, giving INR 230. B6 uses =ROUNDUP(B3/B4,0), giving 53 packs from about 52.17. Test the boundary: 52 x 230 - 12,000 = INR -40, while 53 x 230 - 12,000 = INR 190. These checks confirm upward rounding and the correct input links."
            },
            {
              question: "How do the base and 20% downside operating results reconcile without changing fixed costs?",
              answer: "At 70 packs, revenue 35,000 - variable costs 18,900 = contribution 16,100; less 12,000 gives INR 4,100. At 56 packs, revenue 28,000 - variable costs 15,120 = contribution 12,880; less 12,000 gives INR 880. The decrease of 3,220 equals 14 fewer packs x 230."
            },
            {
              question: "Why does positive base operating profit not resolve the first payment in this case?",
              answer: "The first INR 12,000 payment is due before receipts, but opening cash is only INR 4,000, leaving an INR 8,000 gap. Profit records delivered services, not when customers pay. Later receipts reduce the gap but cannot fund an earlier payment without an approved arrangement."
            }
          ]
        }
      ]
    }
  ],
  deck: {
    title: "Budgeting workshop: a price is only the beginning",
    slides: [
      {
        kind: "title",
        title: "Check the unit, the month and the cash",
        subtitle: "A 60-minute workshop using fictional case B1",
        illustration: "budgeting",
        notes: "Allow 3 minutes. State the service unit, November period and INR currency before showing any calculation. Explain that the exercise is a fictional planning model with explicitly excluded costs."
      },
      {
        kind: "content",
        title: "Our working route",
        bullets: [
          "Trace fixed and per-pack costs to the fictional case notes.",
          "Calculate contribution and test a rounded break-even quantity.",
          "Compare three demand scenarios and a separate lab downside.",
          "Check cash timing and explain one actual-minus-plan difference."
        ],
        notes: "Allow 4 minutes. Ask learners to open Inputs and Costs and locate the source of one number. Explain why the plan and actual tabs must stay separate."
      },
      {
        kind: "content",
        title: "Keep units beside the numbers",
        bullets: [
          "Price: INR 500 per completed pack.",
          "Variable costs: 180 + 60 + 30 = INR 270 per pack.",
          "Fixed costs: 6000 + 4000 + 2000 = INR 12,000 per month.",
          "The cost assumptions apply only within the stated zero-to-90-pack range."
        ],
        notes: "Allow 6 minutes. Have learners classify each source line and independently total both groups. Ask what could change if demand exceeded the stated capacity range."
      },
      {
        kind: "steps",
        title: "Build and test the unit model",
        steps: [
          "Subtract 270 from 500: contribution is INR 230 per pack.",
          "Divide 12000 by 230: break-even is about 52.17 packs before rounding.",
          "Round upward to 53 whole packs.",
          "Test 52 packs at a loss of INR 40 and 53 at a profit of INR 190.",
          "Use a guarded formula when contribution is zero or negative."
        ],
        notes: "Allow 6 minutes. Let learners calculate the two boundary tests before showing the results. Explain that the threshold covers modelled costs but does not establish customer demand."
      },
      {
        kind: "question",
        title: "Poll: a whole-unit threshold",
        question: {
          prompt: "The unrounded break-even quantity is about 52.17 indivisible packs. Which minimum whole quantity covers the modelled costs?",
          options: ["52 packs", "50 packs", "51 packs", "53 packs"],
          answerIndex: 3,
          explanation: "Rounding upward gives 53 packs. At 52, contribution is only INR 11,960 against INR 12,000 fixed costs, leaving a loss of INR 40."
        },
        notes: "Allow 3 minutes. Ask learners to justify their vote using the boundary check rather than a memorised rounding rule. Clarify why ordinary rounding to the nearest whole number would be wrong here."
      },
      {
        kind: "steps",
        title: "Compare demand without changing everything",
        steps: [
          "Keep price, per-pack cost and fixed costs linked to shared inputs.",
          "Check 50 packs: INR 500 loss; 70 packs: INR 4,100 profit.",
          "Check 90 packs: INR 8,700 profit.",
          "In lab Tasks 1 to 4, calculate contribution, break-even, revenue and result with cell references.",
          "In Task 5, use =B5*80% in B9 and =B9*B4-B3 in B10: 56 packs and INR 880, separate from the 50-pack lower scenario."
        ],
        notes: "Allow 7 minutes. Give learners time to check one scenario and enter the lab's linked downside formulas, not typed answers. Ask them to explain why two different downside assumptions need not give the same result."
      },
      {
        kind: "content",
        title: "Profit and cash use different timing",
        bullets: [
          "Base revenue is INR 35,000; November receipts are INR 21,000.",
          "INR 14,000 remains due in December.",
          "Opening cash is INR 4,000; November payments total INR 30,900.",
          "The unfunded month-end balance is INR -5,900 despite INR 4,100 operating profit."
        ],
        notes: "Allow 6 minutes. Reconcile receipts and payments separately from the profit calculation. Ask learners to locate the source assumption that explains why the two results differ."
      },
      {
        kind: "question",
        title: "Poll: the payment comes first",
        question: {
          prompt: "Opening cash is INR 4,000 and the first INR 12,000 payment is due before receipts. What funding gap exists at that point?",
          options: ["INR 4,100", "INR 8,000", "INR 5,900", "INR 21,000"],
          answerIndex: 1,
          explanation: "The payment exceeds opening cash by INR 8,000. A later receipt cannot fund an earlier payment unless a separately approved arrangement covers the timing gap."
        },
        notes: "Allow 3 minutes. Ask why the month-end deficit is not the answer to this timing question. Remind learners that a negative forecast is a need to resolve, not assumed borrowing permission."
      },
      {
        kind: "steps",
        title: "Explain the actual profit difference",
        steps: [
          "Use fictional actuals: 65 packs, price 500, per-pack cost 275, fixed costs 12000.",
          "Calculate revenue 32500 less variable costs 17875 less fixed costs 12000: profit 2625.",
          "Subtract planned profit 4100: variance is -1475.",
          "Reconcile the difference: 1150 from volume plus 325 from unit cost, both adverse."
        ],
        notes: "Allow 7 minutes. Ask pairs to check the profit calculation and the separate explanation of its variance. Keep the cause of lower demand open because the fictional figures alone do not establish it."
      },
      {
        kind: "question",
        title: "Poll: lower spending, higher unit cost",
        question: {
          prompt: "Actual total variable spending falls while cost per pack rises. What can explain both observations?",
          options: ["Fixed costs became revenue", "Every cost became favourable", "Fewer packs were completed", "Cash timing changed the pack count"],
          answerIndex: 2,
          explanation: "Lower volume can reduce total variable spending even when each pack costs more. Compare quantity and unit cost separately before interpreting a total-cost movement."
        },
        notes: "Allow 4 minutes. Have learners point to the 70-to-65 volume change and the 270-to-275 unit-cost change. Discuss why an unqualified favourable label would hide part of the story."
      },
      {
        kind: "content",
        title: "Write a conditional, useful memo",
        bullets: [
          "State the decision, unit, period, currency and excluded costs.",
          "Show contribution, whole-unit break-even and all three scenario results.",
          "Flag the INR 8,000 early cash need and the collection assumptions.",
          "Explain the checked variance and name the next review needed."
        ],
        notes: "Allow 6 minutes. Ask learners to draft the opening and final request of their memo. Replace unsupported certainty with a named assumption or a specific evidence check."
      },
      {
        kind: "summary",
        title: "A useful budget is explainable and checkable",
        bullets: [
          "Separate inputs, units and calculations.",
          "Test contribution and both sides of the break-even boundary.",
          "Keep scenario assumptions and cash timing explicit.",
          "Preserve the original plan and explain actual differences honestly."
        ],
        notes: "Allow 5 minutes. Invite learners to state one formula test and one limitation they will show in the assignment. Close by distinguishing a checked fictional model from evidence that a real service will succeed."
      }
    ]
  },
  interview: {
    intro: "Use the fictional service model to explain basic business-finance reasoning in plain language. Walk through inputs, checks and limitations rather than claiming accounting expertise. Your strongest evidence is a calculation another person can reproduce and a decision note that keeps uncertainty visible.",
    questions: [
      {
        question: "Why can a service have positive contribution per sale and still report a monthly loss?",
        type: "concept",
        answerGuide: [
          "Define contribution as price less variable cost per sale.",
          "Explain that total contribution must cover the month's fixed costs before operating profit appears.",
          "Use the 50-pack example: INR 11,500 contribution less INR 12,000 fixed costs gives a loss of INR 500."
        ],
        tip: "Keep per-sale and monthly units explicit throughout the explanation."
      },
      {
        question: "How would you distinguish contribution margin from profit margin?",
        type: "concept",
        answerGuide: [
          "Describe contribution margin as contribution divided by revenue before fixed costs.",
          "Explain that profit margin uses profit after the costs included in its stated definition.",
          "Use the model's 230 / 500 = 46% only as a contribution margin and identify excluded costs."
        ],
        tip: "Avoid using the word margin alone when several definitions are possible."
      },
      {
        question: "A manager wants to extend your 90-pack capacity model to 120 packs. What would you check first?",
        type: "scenario",
        answerGuide: [
          "Identify the original activity range and the assumptions held constant within it.",
          "Ask whether space, staffing, materials or delivery terms change beyond that range.",
          "Build a separately labelled scenario only after recording the revised assumptions."
        ],
        tip: "Do not treat a spreadsheet's ability to calculate a number as evidence that the operation can deliver it."
      },
      {
        question: "The monthly forecast looks profitable but the first payment cannot be funded. How would you communicate that?",
        type: "scenario",
        answerGuide: [
          "Show the dated opening cash, receipt and payment schedule.",
          "Identify the largest unfunded point and explain the timing assumptions behind it.",
          "Request an approved funding or timing decision without inserting an invented loan or receipt.",
          "Keep the operating-profit result separate from the cash issue."
        ],
        tip: "State when the decision is needed, not just the month-end deficit."
      },
      {
        question: "How would you test a break-even formula for an indivisible service unit?",
        type: "practical",
        answerGuide: [
          "Check price, per-unit variable cost and monthly fixed-cost references.",
          "Guard against zero or negative contribution before dividing.",
          "Round the required quantity upward and test the whole quantities immediately below and at the threshold.",
          "Keep expected and observed results with the assumptions used."
        ],
        tip: "A boundary test is more convincing than showing only one successful base-case calculation."
      },
      {
        question: "Walk me through an actual-minus-plan variance from your practice budget.",
        type: "practical",
        answerGuide: [
          "State the measure, units and actual-minus-plan convention.",
          "Show actual profit of INR 2,625 against planned profit of INR 4,100.",
          "Explain the INR 1,475 adverse difference using the checked volume and unit-cost effects.",
          "Separate observed numeric effects from causes that still need investigation."
        ],
        tip: "Preserve the plan rather than overwriting it with actual inputs before comparing."
      },
      {
        question: "Tell me about an assumption you challenged while building a practice model.",
        type: "behavioural",
        answerGuide: [
          "Describe the fictional task and the assumption that seemed insufficiently supported.",
          "Explain the source check or scenario you used to examine its effect.",
          "State what changed in the model or what limitation you added.",
          "Report only measured practice results, not an invented financial saving."
        ],
        tip: "Choose one assumption you can trace from input to decision note."
      },
      {
        question: "Describe how you explained a calculation error or funding risk to a non-finance teammate.",
        type: "behavioural",
        answerGuide: [
          "State the context and why the issue mattered to the planned decision.",
          "Describe the plain-language example or table you used.",
          "Explain the check, correction or review request you recorded.",
          "Say how you confirmed understanding without overstating the outcome."
        ],
        tip: "Use clear units and one worked example rather than a long list of finance terms."
      },
      {
        question: "A proposed price falls to INR 480 while cost stays INR 270, fixed costs INR 12,000 and planned volume 70. What changes would you report?",
        type: "scenario",
        answerGuide: [
          "Use a separately labelled copy: contribution becomes 480 - 270 = INR 210 per pack, not INR 230.",
          "Round 12,000 / 210 upward to 58 packs for break-even under the unchanged cost assumptions.",
          "At 70 packs, revenue is INR 33,600 and contribution INR 14,700, leaving INR 2,700 operating profit.",
          "At 56 packs, 56 x 210 - 12,000 = INR -240; flag that downside loss without assuming a lower price increases demand."
        ],
        tip: "Show the changed input and dependent formulas, then state which assumptions still need evidence."
      },
      {
        question: "Demonstrate the five Price to break even tasks without typing any calculated answers into result cells.",
        type: "practical",
        answerGuide: [
          "Task 1 uses =B1-B2 in B4 for INR 230 contribution per pack from the labelled input cells.",
          "Task 2 uses =ROUNDUP(B3/B4,0) in B6 for 53 packs; verify 52 leaves INR -40 and 53 leaves INR 190.",
          "Task 3 uses =B1*B5 in B7 for INR 35,000 revenue, not collected cash.",
          "Task 4 uses =B5*B4-B3 in B8 for INR 4,100 operating profit after fixed costs are subtracted once.",
          "Task 5 uses =B5*80% in B9 and =B9*B4-B3 in B10 for 56 packs and INR 880, without overwriting the base volume."
        ],
        tip: "Change one input on a copy and inspect the formula links, then restore the original case assumptions."
      }
    ]
  },
  glossary: [
    { term: "Revenue", definition: "For this exercise, the value of completed services in the reporting month, whether or not payment has already arrived." },
    { term: "Fixed cost", definition: "A cost that stays unchanged within the stated time period and activity range; it may change if that range or arrangement changes." },
    { term: "Variable cost", definition: "A cost linked to each unit of activity, such as the fictional material, delivery and handling cost per completed pack." },
    { term: "Contribution per sale", definition: "Price less variable cost per sale, available to cover fixed costs and then operating profit." },
    { term: "Contribution margin", definition: "Contribution divided by revenue, expressed as a percentage before fixed costs; it is not the same as profit margin." },
    { term: "Operating profit", definition: "Revenue less the variable and fixed operating costs included in the model, with any excluded costs stated explicitly." },
    { term: "Break-even quantity", definition: "The quantity whose total contribution covers modelled fixed costs; indivisible units require upward rounding when the calculation is fractional." },
    { term: "Scenario", definition: "A labelled set of assumptions used to explore possible results, not a statement that the result will occur." },
    { term: "Cash schedule", definition: "A dated plan of opening cash, receipts and payments that reveals when funding may be needed, including before month-end." },
    { term: "Funding gap", definition: "An amount by which planned payments exceed available cash at a stated time, requiring a separately approved response." },
    { term: "Variance", definition: "A difference between actual and planned values; this course uses actual minus plan and interprets the sign according to the measure." },
    { term: "Assumption", definition: "An explicitly stated input or rule used in the model, with its source and limits recorded so another person can review or change it." }
  ]
};
