export default {
  moduleId: "canva",
  summary: "Build a clear business story, reusable slide style and honest evidence chart, then practise revision and delivery. Finish with a five-slide fictional pitch, matching one-page brief, checked exports, asset record and measured rehearsal.",
  sessions: [
    {
      id: "canva-lab-s1",
      week: 1,
      title: "Plan the reader's decision before designing",
      minutes: 75,
      scenario: [
        "Fictional Kiran Stationery proposes a ten-kit desk-kit prototype plan for Sundar Study Centre. Priya, the coordinator, is asked to review the plan by 9 November 2026. The provisional INR 2000 scope covers ten kits at INR 180 for materials and packaging plus an INR 200 reserve. Labour, tax and delivery need checking before spending. P1 below is a constructed preference table dated 6 November, not a record of orders.",
        "Complete Order the story in the Canva simulation, then outline the assessed pitch in Canva Free using original text and basic shapes. The simulation uses problem, evidence, options, recommendation and decision. Your assessed five pages must cover audience and problem, proposal, evidence, costs or risks, and a specific next-step request. Keep three supporting points and one main job per page."
      ],
      dataset: {
        columns: ["P1 preference", "Fictional responses"],
        rows: [
          ["Desk kit", "15"],
          ["Separate items", "9"]
        ]
      },
      outcome: "An audience-specific decision sentence and five-slide outline with three supporting points and explicit evidence and cost boundaries.",
      tasks: [
        {
          id: "canva-lab-s1-t1",
          type: "short",
          prompt: "Build a source check beside your outline, adding the two P1 counts. How many fictional preference responses must be stated with the evidence?",
          answer: { kind: "number", value: 24, tolerance: 0 },
          explanation: "P1 contains 15 desk-kit preferences and 9 separate-item preferences. The sample total is 15 + 9 = 24 responses. This is a constructed preference count, not a customer or order count."
        },
        {
          id: "canva-lab-s1-t2",
          type: "short",
          prompt: "Which next-step request fits Priya's brief and the available evidence?",
          answer: {
            kind: "choice",
            options: [
              "Ask Priya to review the ten-kit plan by 9 November and confirm omitted costs before spending",
              "Ask Priya to launch immediately because 15 preferences prove 15 purchases",
              "Declare the full project approved because materials and packaging fit the provisional cap"
            ],
            answerIndex: 0
          },
          explanation: "The brief asks for a plan review, not a launch or an approved purchase. The fictional preferences do not establish demand, and labour, tax and delivery remain unpriced. A useful request preserves those boundaries."
        },
        {
          id: "canva-lab-s1-t3",
          type: "case",
          prompt: "Write a planning memo with the audience and decision sentence, five slide headlines and each slide's job. Explain three supporting points and the evidence or assumption behind each. Keep the request bounded by the cost scope and the fictional nature of P1.",
          rubric: [
            "Names Priya, the ten-kit prototype-plan review and the 9 November due date.",
            "Gives five distinct page roles: audience/problem, proposal, evidence, costs or risks, and next-step request.",
            "Uses the 15 of 24 fictional preferences as an idea to examine, not as purchase commitments.",
            "Checks 10 x INR 180 plus INR 200 reserve as INR 2000, with labour, tax and delivery still excluded."
          ],
          minWords: 120
        },
        {
          id: "canva-lab-s1-t4",
          type: "proof",
          prompt: "Attach the five-page outline from Canva Free or an export, with the planning memo and your simulation sequence recorded separately. Styling may remain simple at this stage.",
          mustShow: "Five message-led headlines, three supported points, the P1 source and sample total, a scoped cost statement and Priya's review request without implied approval."
        }
      ]
    },
    {
      id: "canva-lab-s2",
      week: 2,
      title: "Create a readable style and asset record",
      minutes: 90,
      scenario: [
        "Priya will view Kiran Stationery's deck on a projector and later read the exported brief. The desk-kit proposal and evidence boundaries are unchanged. Use the fictional asset register below to practise permission checks. One proposed image has no permission evidence. Its presence in a message does not establish that it may be reused.",
        "Complete the simulation's projector-style choice, then create a reusable base page in Canva Free. Use one heading style, one body style, aligned margins, a quiet background and a restrained accent. Try headings around 36 points and body text around 24 as starting settings, then inspect the actual viewing size. Keep source notes readable and distinguish categories with words, not colour alone."
      ],
      dataset: {
        columns: ["Asset ID", "Proposed asset", "Permission evidence"],
        rows: [
          ["A1", "Original pitch text", "Learner-authored text recorded"],
          ["A2", "Original preference chart", "Built from supplied fictional P1 table"],
          ["A3", "Image copied from a message", "No origin or permission record"],
          ["A4", "Original basic-shape composition", "Permitted basic-shape use recorded"]
        ]
      },
      outcome: "A reusable slide style with tested hierarchy, spacing and contrast, plus an asset log that removes or resolves unclear permissions.",
      tasks: [
        {
          id: "canva-lab-s2-t1",
          type: "short",
          prompt: "Choose the strongest starting style for Priya's projector view, then apply that reasoning in Canva Free.",
          answer: {
            kind: "choice",
            options: [
              "Large dark text on a light background, consistent alignment and direct labels beside colours",
              "Small pale text over a detailed photograph with colour as the only category key",
              "A different decorative font and background on every slide with tiny source notes"
            ],
            answerIndex: 0
          },
          explanation: "The first style gives the headline, evidence and labels a readable hierarchy. Consistent alignment and direct labels reduce interpretation effort. Font sizes still need checking at the actual presentation and export size."
        },
        {
          id: "canva-lab-s2-t2",
          type: "short",
          prompt: "Audit the supplied asset register before using it. How many proposed assets lack an origin or permission basis and must be resolved or removed?",
          answer: { kind: "number", value: 1, tolerance: 0 },
          explanation: "Only A3 has no origin or permission record, so the unresolved count is 1. A credit alone would not create permission; replace it with an original alternative unless suitable rights evidence is obtained."
        },
        {
          id: "canva-lab-s2-t3",
          type: "case",
          prompt: "Priya asks for a more decorative deck, including A3 and smaller caveats to create space. Write a design-review response and implement a readable alternative. Specify hierarchy, spacing, colour use and asset handling, and explain how you checked the result at normal viewing size.",
          rubric: [
            "Defines consistent heading, body, margin and source-note positions rather than changing styles page by page.",
            "Uses contrast and direct text labels, retaining the fictional-data and omitted-cost caveats at readable size.",
            "Removes or replaces A3 unless permission is established and records origin, permission basis and any credit for retained assets.",
            "Records an actual normal-size readability check and at least one change made from that observation."
          ],
          minWords: 120
        },
        {
          id: "canva-lab-s2-t4",
          type: "proof",
          prompt: "Attach two styled slides, the reusable style rules and the asset log. Include a brief before-and-after readability observation from your own design.",
          mustShow: "Consistent hierarchy and margins, readable source notes, labels that do not depend on colour alone, and A3 removed or supported by a documented permission basis."
        }
      ]
    },
    {
      id: "canva-lab-s3",
      week: 3,
      title: "Build an honest evidence slide",
      minutes: 90,
      scenario: [
        "Fictional Nila Study Corner asks Kavya to review a revision-card pack idea. P2 below is a constructed table dated 6 November 2026, with one preference per response. The Total row is a check, not another category. A draft headline calls the bundled responses purchases, and a draft bar chart starts above zero. Neither treatment faithfully represents the table.",
        "Check the counts and shares in Google Sheets, then build a simple bar chart in Canva Free with only the two preference categories. Use one zero baseline, direct values and the unit fictional responses. Place the source date, sample size and a no-purchase-commitment caveat beside the chart. Add the source table and workings to the developing one-page brief."
      ],
      dataset: {
        columns: ["P2 preference", "Fictional responses"],
        rows: [
          ["Bundled revision pack", "18"],
          ["Separate cards", "12"],
          ["Total, check only", "30"]
        ]
      },
      outcome: "A source-checked data-story slide and matching brief section with an honest chart, caption, denominator and evidence boundary.",
      tasks: [
        {
          id: "canva-lab-s3-t1",
          type: "short",
          prompt: "Calculate the bundled-pack share in your sheet and check the chart caption. Enter the percentage of P2 responses favouring the bundle, using percentage units.",
          answer: { kind: "number", value: 60, tolerance: 0.01 },
          explanation: "The two categories sum to 18 + 12 = 30 responses. The bundled share is 18 / 30 x 100 = 60%. Do not add the Total row again or interpret the responses as purchases."
        },
        {
          id: "canva-lab-s3-t2",
          type: "short",
          prompt: "Use the source table to check the gap shown by the two bars. How many more fictional responses favour bundled packs than separate cards? Enter a count, not a percentage.",
          answer: { kind: "number", value: 6, tolerance: 0 },
          explanation: "The count difference is 18 - 12 = 6 responses. The shares are 60% and 40%, a different measure with a 20-percentage-point gap. Label counts and percentages distinctly."
        },
        {
          id: "canva-lab-s3-t3",
          type: "case",
          prompt: "Kavya asks whether the headline can say that 18 customers committed to buy. Write a corrected caption and a design-review note explaining the claim change, denominator, chart scale and what additional evidence would be needed before making a demand claim.",
          rubric: [
            "States 18 of 30 fictional preferences, or 60%, rather than customers, orders or purchase commitments.",
            "Charts only 18 and 12 with one zero baseline, matching units and direct labels.",
            "Keeps the P2 label, 6 November date, sample size and limitation readable beside the chart.",
            "Requests actual demand or purchase evidence before a stronger claim and retains the source workings in the brief."
          ],
          minWords: 100
        },
        {
          id: "canva-lab-s3-t4",
          type: "proof",
          prompt: "Attach the evidence slide, checked source calculations and matching brief section. Inspect the exported slide as well as the editable design.",
          mustShow: "Two bars at 18 and 12, a common zero baseline, a checked total of 30, the 60% caption, source date and a readable fictional-preference limitation."
        }
      ]
    },
    {
      id: "canva-lab-s4",
      week: 4,
      title: "Export, inspect and measure the explanation",
      minutes: 105,
      scenario: [
        "Return to Kiran Stationery's ten-kit proposal for Priya. P1 contains 15 kit and nine separate-item fictional preferences. Materials and packaging cost INR 180 per kit, with INR 200 reserve, so the scoped cap is INR 2000. Labour, tax and delivery remain unpriced. A supplied draft omits the costs slide and incorrectly labels the INR 1800 direct subtotal as the full scoped cap.",
        "Build the complete five-slide deck and matching one-page brief in Canva Free, correcting the supplied draft errors. Export each as a separate PDF, reopen every page and inspect figures, captions, source notes and asset credits. Rehearse aloud using the planning table below, with a total limit of 180 seconds including transitions. Record actual elapsed time and a revision; the plan is not evidence that you completed a rehearsal."
      ],
      dataset: {
        columns: ["Presentation part", "Planned narration, seconds"],
        rows: [
          ["Slide 1: audience and problem", "25"],
          ["Slide 2: proposal", "30"],
          ["Slide 3: evidence", "45"],
          ["Slide 4: costs and risks", "40"],
          ["Slide 5: next-step request", "30"]
        ]
      },
      outcome: "A checked five-slide export and one-page brief, with consistent claims and costs, an asset record and a measured rehearsal log.",
      tasks: [
        {
          id: "canva-lab-s4-t1",
          type: "short",
          prompt: "Add the five planned narration durations before rehearsing. How many seconds of planned speech does the table contain?",
          answer: { kind: "number", value: 170, tolerance: 0 },
          explanation: "Planned narration totals 25 + 30 + 45 + 40 + 30 = 170 seconds. This is a planning calculation; your actual elapsed rehearsal time must be measured separately."
        },
        {
          id: "canva-lab-s4-t2",
          type: "short",
          prompt: "Using the 180-second overall limit, calculate how many seconds remain for transitions or a pause after the planned narration. Enter the allowance in seconds.",
          answer: { kind: "number", value: 10, tolerance: 0 },
          explanation: "The allowance is 180 - 170 = 10 seconds. If the actual spoken run exceeds the limit, revise and time it again instead of recording the planned value as an observed result."
        },
        {
          id: "canva-lab-s4-t3",
          type: "case",
          prompt: "Write an export-review and rehearsal handover for Priya. Explain how you repaired the missing page and cost label, checked agreement between the deck and brief, verified asset permissions and improved the spoken explanation after timing it. Include your actual observation rather than copying the plan.",
          rubric: [
            "Checks a five-page deck and one-page brief with the required roles, source notes and final review request.",
            "Separates INR 1800 direct cost from INR 200 reserve and INR 2000 scoped cap, retaining the omitted-cost caveat.",
            "Records inspection of both actual exports for clipped text, readable captions, consistent figures and asset credits.",
            "Records an observed rehearsal duration, one revision and a retest within 180 seconds including transitions."
          ],
          minWords: 120
        },
        {
          id: "canva-lab-s4-t4",
          type: "proof",
          prompt: "Attach the five-slide PDF, one-page brief PDF, source and asset records, and measured rehearsal log. Keep the editable design so any export fault can be repaired.",
          mustShow: "Correct page counts, consistent P1 and cost figures, readable caveats and credits, inspected exports and an actual timed rehearsal with a documented revision."
        }
      ]
    },
    {
      id: "canva-lab-s5",
      week: 5,
      title: "Clean the evidence before changing the headline",
      minutes: 105,
      scenario: [
        "Nila Study Corner supplies a new constructed preference intake P5 dated 20 November 2026. The second P503 row is a confirmed duplicate, P508 has a trailing space and P506 has no recorded preference. Every unique response ID represents one fictional form. Report shares only among valid, nonblank preferences, while disclosing the unresolved form and total unique forms.",
        "Keep Raw, Clean and Checks in Google Sheets, then update the chart and caption in Canva Free. Remove only the confirmed duplicate and trim the known label defect. Do not turn the blank into a preference. Kavya wants a stronger headline with the missing response hidden; your job is to keep the denominator and limitation visible, using the same readable style practised in the simulation."
      ],
      dataset: {
        columns: ["Response ID", "Preference"],
        rows: [
          ["P501", "Bundled revision pack"],
          ["P502", "Bundled revision pack"],
          ["P503", "Separate cards"],
          ["P504", "Bundled revision pack"],
          ["P505", "Separate cards"],
          ["P506", ""],
          ["P507", "Bundled revision pack"],
          ["P508", "Bundled revision pack "],
          ["P503", "Separate cards"]
        ]
      },
      outcome: "A cleaned preference table and revised chart whose denominator, missing response and fictional-data limitation are explicit.",
      tasks: [
        {
          id: "canva-lab-s5-t1",
          type: "short",
          prompt: "Clean P5 using the supplied evidence. How many valid, nonblank preferences remain for the chart's share denominator? Enter the checked count from your sheet.",
          answer: { kind: "number", value: 7, tolerance: 0 },
          explanation: "Nine raw rows less one duplicate give eight unique forms. One form, P506, has no preference, so 8 - 1 = 7 valid preferences. Preserve the blank in the source and disclose it rather than deleting its existence."
        },
        {
          id: "canva-lab-s5-t2",
          type: "short",
          prompt: "Calculate the bundled-pack share among valid preferences and check the revised caption. Enter the percentage to two decimal places.",
          answer: { kind: "number", value: 71.43, tolerance: 0.01 },
          explanation: "P501, P502, P504, P507 and trimmed P508 give five bundle preferences; two valid forms favour separate cards. The valid-response share is 5 / 7 x 100 = 71.4285...%, or 71.43%, not a share of all eight forms."
        },
        {
          id: "canva-lab-s5-t3",
          type: "case",
          prompt: "Kavya proposes the headline '71.43% of all respondents chose a bundle' and asks you to omit the blank form. Write a corrected caption and evidence handover. Explain the cleaning bridge, the selected denominator and why the result must not be presented as established demand.",
          rubric: [
            "Reconciles nine raw rows to eight unique forms and seven valid preferences, naming the duplicate and blank IDs.",
            "Checks five bundle and two separate-card preferences, with 71.43% explicitly limited to valid preferences.",
            "Discloses one unresolved preference among eight forms rather than describing the seven-form share as covering everyone.",
            "Keeps P5, its date and the constructed-data limitation visible and avoids purchase or demand claims."
          ],
          minWords: 120
        },
        {
          id: "canva-lab-s5-t4",
          type: "proof",
          prompt: "Attach the raw and clean source, cleaning log, revised slide and matching brief section. Keep the blank form visible in the evidence trail.",
          mustShow: "The nine-to-eight-to-seven count bridge, five and two chart values, the 71.43% valid-preference label, P506's unresolved status and a matching denominator in the brief."
        }
      ]
    },
    {
      id: "canva-lab-s6",
      week: 6,
      title: "Revise the proposal when the requested scope grows",
      minutes: 105,
      scenario: [
        "Kavya asks Nila Study Corner to increase its prototype from twelve revision packs to eighteen while keeping a provisional INR 1500 scope ceiling. Fictional cost assumptions C6, dated 21 November, are below. The reserve is one fixed allowance, not a per-pack charge. The ceiling row is a comparison limit, not a cost item. Labour, tax and delivery remain unpriced.",
        "Build the new cost calculation in Google Sheets and revise the costs slide, request slide and one-page brief in Canva Free. Kavya asks for the costed revision by 22 November, not for an automatic purchase. Compare the eighteen-pack request with keeping twelve packs under the same unit rates and fixed reserve. Keep both versions and the reason for your recommendation visible."
      ],
      dataset: {
        columns: ["C6 item", "Quantity", "Rate, INR", "Row role"],
        rows: [
          ["Paper", "18", "70", "Cost"],
          ["Printing", "18", "20", "Cost"],
          ["Packaging", "18", "10", "Cost"],
          ["Reserve", "1", "120", "Allowance"],
          ["Provisional scope ceiling", "1", "1500", "Limit, not a cost"]
        ]
      },
      outcome: "A costed scope comparison and revised presentation request that exposes the budget gap rather than hiding it in the design.",
      tasks: [
        {
          id: "canva-lab-s6-t1",
          type: "short",
          prompt: "Calculate the eighteen-pack estimate, including the single reserve but excluding the ceiling row. Enter the scoped estimate in INR used on your revised slide.",
          answer: { kind: "number", value: 1920, tolerance: 0.5 },
          explanation: "Direct cost is 18 x (70 + 20 + 10) = 18 x 100 = INR 1800. Adding the one-off INR 120 reserve gives INR 1920. The INR 1500 ceiling is not another expense to add."
        },
        {
          id: "canva-lab-s6-t2",
          type: "short",
          prompt: "Compare the eighteen-pack estimate with the stated scope ceiling. By how many INR does the proposal exceed the ceiling before any unpriced costs?",
          answer: { kind: "number", value: 420, tolerance: 0.5 },
          explanation: "The scoped estimate is INR 1920 and the ceiling INR 1500. The gap is 1920 - 1500 = INR 420. Unpriced labour, tax and delivery mean this is not a complete project-overrun calculation."
        },
        {
          id: "canva-lab-s6-t3",
          type: "case",
          prompt: "Write Kavya a revised proposal note and cost-slide headline. Compare eighteen packs with retaining twelve, explain the reserve and omitted costs, and recommend a reviewable next step by 22 November. Do not remove the reserve or a caveat merely to make the larger proposal appear affordable.",
          rubric: [
            "Shows eighteen packs at INR 1800 direct plus INR 120 reserve, totalling INR 1920 and exceeding the ceiling by INR 420.",
            "Checks twelve packs at INR 1200 direct plus INR 120 reserve, totalling INR 1320 within the stated scope.",
            "Treats the reserve once and keeps labour, tax and delivery unpriced in both options.",
            "Requests Kavya's review of scope or ceiling by 22 November without implying spending approval or hiding the gap."
          ],
          minWords: 120
        },
        {
          id: "canva-lab-s6-t4",
          type: "proof",
          prompt: "Attach the cost workbook, revised costs and request slides, matching brief and short change log. Check that the same version and quantities appear in every file.",
          mustShow: "The INR 1920 estimate and INR 420 gap, the INR 1320 twelve-pack alternative, one reserve per option, omitted-cost notes and a consistent review request."
        }
      ]
    },
    {
      id: "canva-lab-s7",
      week: 7,
      title: "Repair a persuasive but misleading draft",
      minutes: 105,
      scenario: [
        "Priya receives a new Kiran Stationery concept update using constructed P7 preferences dated 23 November 2026. The draft says 70% favour kits, calls the 12 kit preferences paid orders and uses bars starting at six responses. It also describes a materials-and-packaging estimate as a full project price despite unpriced labour, tax and delivery. These are review defects, not facts to repeat.",
        "Revisit the simulation's readability choice, then recreate the flawed chart on a clearly labelled audit page in Canva Free and build a corrected version. Check the source in Google Sheets. Use only original text, charts and basic shapes unless permission is documented for another asset. Update the brief at the same time and keep a before-and-after correction log."
      ],
      dataset: {
        columns: ["P7 preference", "Fictional responses"],
        rows: [
          ["Desk kit", "12"],
          ["Separate items", "8"],
          ["Total, check only", "20"]
        ]
      },
      outcome: "A corrected evidence slide and brief, with a traceable record of numeric, visual and wording repairs before final submission.",
      tasks: [
        {
          id: "canva-lab-s7-t1",
          type: "short",
          prompt: "Recalculate the kit-preference share from P7 and update the caption. What percentage should replace the draft's 70% headline?",
          answer: { kind: "number", value: 60, tolerance: 0.01 },
          explanation: "P7 has 12 + 8 = 20 responses. The kit share is 12 / 20 x 100 = 60%. The draft overstates that share by 70 - 60 = 10 percentage points."
        },
        {
          id: "canva-lab-s7-t2",
          type: "short",
          prompt: "Which corrected chart specification faithfully represents P7 in the revised slide?",
          answer: {
            kind: "choice",
            options: [
              "Two response bars at 12 and 8, with one zero baseline, direct labels and a fictional-source note",
              "Three preference bars at 12, 8 and 20, treating Total as another option",
              "Two unlabelled bars starting at six, captioned as paid customer orders"
            ],
            answerIndex: 0
          },
          explanation: "Only the two categories belong in the chart; Total is a check. A zero baseline preserves the comparison, and response labels retain the source meaning. Cropped bars and order wording would add claims the data cannot support."
        },
        {
          id: "canva-lab-s7-t3",
          type: "case",
          prompt: "Write Priya a review memo covering the wrong percentage, bar scale, purchase wording and full-price claim. State the repair and an evidence check for each, then describe how you verified that the corrected deck and brief remain readable and consistent after export.",
          rubric: [
            "Corrects 70% to 60% from 12 / 20 and records the ten-percentage-point overstatement.",
            "Uses two bars with a common zero baseline, direct response labels and no plotted Total category.",
            "Replaces paid-order language with fictional preferences and restores the unpriced labour, tax and delivery boundary.",
            "Checks both actual exports, matching captions and numbers, readable caveats and documented asset permissions."
          ],
          minWords: 120
        },
        {
          id: "canva-lab-s7-t4",
          type: "proof",
          prompt: "Attach the labelled audit slide, corrected slide and brief, source workings and correction log. Keep misleading draft text visibly marked as superseded.",
          mustShow: "The original and corrected percentage and scale, verified 12-and-8 data, restored preference and cost caveats, matching exports and a documented final readability check."
        }
      ]
    },
    {
      id: "canva-lab-s8",
      week: 8,
      title: "Capstone: deliver the pitch and matching brief",
      minutes: 120,
      scenario: [
        "Fictional Nila Study Corner asks Kavya to review a sixteen-pack revision-card prototype plan by 1 December 2026. P8 and C8 below are constructed sources dated 27 November. P8 records one preference per fictional response, not orders. C8 provides paper, printing, packaging and a fixed reserve; the INR 1800 ceiling applies only to that scope. Labour, tax and delivery need checking before spending.",
        "Build the final five-slide pitch and matching one-page brief in Canva Free. Use the simulation's story and readability habits, but retain the assessed roles: audience/problem, proposal, evidence, costs or risks, and next-step request. Chart only P8's two preference categories; use C8's cost and reserve rows for the estimate, not its ceiling row. Check every figure in Google Sheets, record asset rights, export both files and measure a spoken rehearsal of at most 180 seconds."
      ],
      dataset: {
        columns: ["Source", "Item", "Count or quantity", "Rate, INR", "Record type"],
        rows: [
          ["P8", "Bundled revision pack", "21", "Not applicable", "Preference"],
          ["P8", "Separate cards", "14", "Not applicable", "Preference"],
          ["C8", "Paper", "16", "70", "Cost"],
          ["C8", "Printing", "16", "20", "Cost"],
          ["C8", "Packaging", "16", "10", "Cost"],
          ["C8", "Fixed reserve", "1", "160", "Reserve"],
          ["C8", "Provisional scoped ceiling", "1", "1800", "Ceiling, not a cost"]
        ]
      },
      outcome: "A submitted five-slide pitch and one-page brief with a checked chart, clear review request, truthful cost scope, asset-rights evidence and measured spoken explanation.",
      tasks: [
        {
          id: "canva-lab-s8-t1",
          type: "short",
          prompt: "Check the P8 chart in your capstone deck against its two source counts. What percentage of the fictional responses favour bundled packs? Enter percentage units.",
          answer: { kind: "number", value: 60, tolerance: 0.01 },
          explanation: "P8 contains 21 + 14 = 35 fictional responses. The bundled share is 21 / 35 x 100 = 60%. C8 quantities are cost assumptions and must not enter the preference denominator."
        },
        {
          id: "canva-lab-s8-t2",
          type: "short",
          prompt: "Calculate C8's sixteen-pack scoped estimate including the single reserve. What INR amount must agree between your cost slide and one-page brief?",
          answer: { kind: "number", value: 1760, tolerance: 0.5 },
          explanation: "Direct costs are 16 x 70 + 16 x 20 + 16 x 10 = 1120 + 320 + 160 = INR 1600. Adding the fixed INR 160 reserve gives INR 1760. The INR 1800 ceiling is a limit, leaving INR 40 within this incomplete scope."
        },
        {
          id: "canva-lab-s8-t3",
          type: "case",
          prompt: "Submit a short decision brief for Kavya explaining the sixteen-pack idea, checked preference chart, cost scope and specific next-step request. Add a delivery note explaining one readability choice, how asset rights were checked and what your measured rehearsal led you to revise. Keep the brief consistent with all five slides.",
          rubric: [
            "Names the sixteen-pack plan and Kavya's review by 1 December without implying approval or established demand.",
            "Checks 21 and 14 responses, total 35 and a 60% bundled share with the P8 date and fictional-data caveat.",
            "Reconciles INR 1600 direct cost plus INR 160 reserve to INR 1760, with INR 40 scoped headroom and unpriced labour, tax and delivery.",
            "Explains a readability choice and records an origin, permission basis and any required credit for each asset.",
            "Reports an actual rehearsal duration within 180 seconds and a concrete revision rather than substituting planned timing."
          ],
          minWords: 120
        },
        {
          id: "canva-lab-s8-t4",
          type: "proof",
          prompt: "Submit the five-slide pitch and one-page brief as separate inspected PDFs, plus the editable design or restricted reviewer link. Include source workings, the asset log and a measured rehearsal record with notes for the spoken explanation. Reopen the delivered files to verify page counts, readability and access.",
          mustShow: "Five required slide roles, one matching brief, a zero-baseline checked chart, consistent INR 1760 scope and review request, readable caveats and credits, asset-rights records and an observed rehearsal within three minutes."
        }
      ]
    }
  ]
};
