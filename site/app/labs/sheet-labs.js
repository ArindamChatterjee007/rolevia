// Sheet-based lab definitions (datasets, task checks, reference solutions). Pure data and functions so the
// unit tests can prove that the reference solution passes every task and that wrong answers do not.
import { formulaUses, formulaReferencesCells, approx, isError } from "./sheet-engine.js";

const number = (accessor, ref) => { const value = accessor.value(ref); return typeof value === "number" ? value : Number.NaN; };
const text = (accessor, ref) => String(accessor.value(ref) ?? "").trim();
const everyCell = (cells, test) => { for (const ref of cells) { const result = test(ref); if (!result.ok) return { ok: false, detail: `${ref}: ${result.detail}` }; } return { ok: true }; };
const expectNumber = (accessor, ref, expected, { functions = null, needsRefs = true } = {}) => {
  const formula = accessor.formula(ref);
  if (!formula) return { ok: false, detail: "needs a formula starting with =" };
  if (functions && !formulaUses(formula, functions)) return { ok: false, detail: `use ${functions.join(" or ")}` };
  if (needsRefs && !formulaReferencesCells(formula)) return { ok: false, detail: "reference the cells instead of typing the numbers" };
  const value = number(accessor, ref);
  if (isError(accessor.value(ref))) return { ok: false, detail: `shows ${accessor.value(ref)}` };
  if (!approx(value, expected)) return { ok: false, detail: `shows ${Number.isNaN(value) ? accessor.display(ref) || "nothing" : value}, expected ${expected}` };
  return { ok: true };
};
const expectText = (accessor, ref, expected, { functions = null } = {}) => {
  const formula = accessor.formula(ref);
  if (!formula) return { ok: false, detail: "needs a formula starting with =" };
  if (functions && !formulaUses(formula, functions)) return { ok: false, detail: `use ${functions.join(" or ")}` };
  const actual = text(accessor, ref);
  return actual.toLowerCase() === expected.toLowerCase() ? { ok: true } : { ok: false, detail: `shows "${actual}", expected "${expected}"` };
};

// ---------- 01 Business Spreadsheets: Kiran Stationery register ----------
const registerRows = [
  ["K01", "2026-11-02", "North", "N1", "900"],
  ["K02", "2026-11-02", "South", "N2", "1500"],
  ["K03", "2026-11-03", "North ", "N2", "2,100"],
  ["K04", "2026-11-03", "south", "N1", "500"],
  ["K05", "2026-11-04", "North", "N1", "1200"],
  ["K06", "2026-11-04", "South", "N2", "1800"],
  ["K07", "2026-11-05", "north", "N2", "2400"],
  ["K08", "2026-11-05", "South", "N1", "700"],
];
const registerCells = { A1: "Order ID", B1: "Sale date", C1: "Region (raw)", D1: "Product", E1: "Sales (raw)", F1: "Region (clean)", G1: "Sales (number)", H1: "Flag", J1: "Total sales", J2: "North sales", J3: "Orders ≥ 1,500", K1: "", K2: "", K3: "" };
registerRows.forEach((row, index) => { const r = index + 2; registerCells[`A${r}`] = row[0]; registerCells[`B${r}`] = row[1]; registerCells[`C${r}`] = row[2]; registerCells[`D${r}`] = row[3]; registerCells[`E${r}`] = row[4]; });
const REGION_CLEAN = ["NORTH", "SOUTH", "NORTH", "SOUTH", "NORTH", "SOUTH", "NORTH", "SOUTH"];
const SALES = [900, 1500, 2100, 500, 1200, 1800, 2400, 700];
const taskCells = (col, from, to) => Array.from({ length: to - from + 1 }, (_, i) => `${col}${from + i}`);

export const spreadsheetsSheetLab = {
  id: "spreadsheets",
  title: "Clean and summarise the register",
  brief: "Kiran Stationery's register has untidy regions and one sales figure typed as text. Clean it with formulas in F and G (never overwrite the raw columns), then summarise it in K1:K3 and flag large orders in H.",
  columns: 11, rows: 10,
  widths: { A: "72px", B: "104px", C: "110px", D: "76px", E: "96px", F: "118px", G: "108px", H: "86px", I: "28px", J: "126px", K: "96px" },
  cells: registerCells,
  locked: ["A1", "B1", "C1", "D1", "E1", "F1", "G1", "H1", "J1", "J2", "J3", ...taskCells("A", 2, 9), ...taskCells("B", 2, 9), ...taskCells("C", 2, 9), ...taskCells("D", 2, 9), ...taskCells("E", 2, 9)],
  tasks: [
    { id: "clean-region", title: "Task 1: clean the region in F2:F9", hint: "Remove stray spaces and standardise the case, e.g. =TRIM(UPPER(C2)) or =PROPER(TRIM(C2)).", cells: taskCells("F", 2, 9), check: (a) => everyCell(taskCells("F", 2, 9), (ref) => { const formula = a.formula(ref); if (!formula) return { ok: false, detail: "needs a formula" }; if (!formulaUses(formula, ["TRIM"])) return { ok: false, detail: "use TRIM to remove the stray space" }; if (!formulaUses(formula, ["UPPER", "LOWER", "PROPER"])) return { ok: false, detail: "standardise the case with UPPER, LOWER or PROPER" }; const expected = REGION_CLEAN[Number(ref.slice(1)) - 2]; return text(a, ref).toLowerCase() === expected.toLowerCase() ? { ok: true } : { ok: false, detail: `shows "${text(a, ref)}"` }; }) },
    { id: "to-number", title: "Task 2: turn the sales text into numbers in G2:G9", hint: "=VALUE(E2) converts text such as \"2,100\" into 2100 so it can be added.", cells: taskCells("G", 2, 9), check: (a) => everyCell(taskCells("G", 2, 9), (ref) => expectNumber(a, ref, SALES[Number(ref.slice(1)) - 2], { functions: ["VALUE", "N"] })) },
    { id: "total", title: "Task 3: total sales in K1", hint: "=SUM(G2:G9) should give 11,100.", cells: ["K1"], check: (a) => expectNumber(a, "K1", 11100, { functions: ["SUM"] }) },
    { id: "north", title: "Task 4: North sales in K2", hint: "=SUMIFS(G2:G9, F2:F9, \"North\") adds only the rows whose cleaned region is North (6,600).", cells: ["K2"], check: (a) => expectNumber(a, "K2", 6600, { functions: ["SUMIFS", "SUMIF"] }) },
    { id: "large-count", title: "Task 5: count orders of 1,500 or more in K3", hint: "=COUNTIFS(G2:G9, \">=1500\") counts records, it does not add them (4 orders).", cells: ["K3"], check: (a) => expectNumber(a, "K3", 4, { functions: ["COUNTIFS", "COUNTIF"] }) },
    { id: "flag", title: "Task 6: flag Review or Routine in H2:H9", hint: "=IF(G2>=1500,\"Review\",\"Routine\"). Orders at exactly 1,500 are Review.", cells: taskCells("H", 2, 9), check: (a) => everyCell(taskCells("H", 2, 9), (ref) => expectText(a, ref, SALES[Number(ref.slice(1)) - 2] >= 1500 ? "Review" : "Routine", { functions: ["IF", "IFS"] })) },
  ],
  solution: Object.fromEntries([
    ...taskCells("F", 2, 9).map((ref) => [ref, `=TRIM(UPPER(C${ref.slice(1)}))`]),
    ...taskCells("G", 2, 9).map((ref) => [ref, `=VALUE(E${ref.slice(1)})`]),
    ...taskCells("H", 2, 9).map((ref) => [ref, `=IF(G${ref.slice(1)}>=1500,"Review","Routine")`]),
    ["K1", "=SUM(G2:G9)"], ["K2", '=SUMIFS(G2:G9,F2:F9,"North")'], ["K3", '=COUNTIFS(G2:G9,">=1500")'],
  ]),
};

// ---------- 08 Budgeting: Meera Foods snack packs ----------
export const budgetingSheetLab = {
  id: "budgeting",
  title: "Price to break even",
  brief: "Meera Foods sells snack packs at INR 500 with INR 270 of variable cost per pack and INR 12,000 of monthly fixed costs. Build the model with formulas that reference the input cells, so the numbers update when an input changes.",
  columns: 6, rows: 12,
  widths: { A: "236px", B: "120px", C: "28px", D: "180px", E: "110px", F: "40px" },
  cells: { A1: "Price per pack (INR)", B1: "500", A2: "Variable cost per pack (INR)", B2: "270", A3: "Fixed costs per month (INR)", B3: "12000", A4: "Contribution per pack (INR)", A5: "Planned packs", B5: "70", A6: "Break-even packs", A7: "Revenue (INR)", A8: "Operating result (INR)", A9: "Downside packs (80% of plan)", A10: "Downside result (INR)", D1: "Rule", E1: "Check", D2: "Contribution = price − variable cost", D3: "Break-even = fixed ÷ contribution, rounded up", D4: "Result = packs × contribution − fixed" },
  locked: ["A1", "B1", "A2", "B2", "A3", "B3", "A4", "A5", "B5", "A6", "A7", "A8", "A9", "A10", "D1", "E1", "D2", "D3", "D4"],
  tasks: [
    { id: "contribution", title: "Task 1: contribution per pack in B4", hint: "=B1-B2 gives 230. Formulas must reference the input cells, not typed numbers.", cells: ["B4"], check: (a) => expectNumber(a, "B4", 230) },
    { id: "break-even", title: "Task 2: break-even packs in B6", hint: "=ROUNDUP(B3/B4,0): 12,000 ÷ 230 = 52.17, so 53 whole packs are needed.", cells: ["B6"], check: (a) => expectNumber(a, "B6", 53, { functions: ["ROUNDUP", "CEILING"] }) },
    { id: "revenue", title: "Task 3: revenue in B7", hint: "=B1*B5 gives 35,000 for the planned 70 packs.", cells: ["B7"], check: (a) => expectNumber(a, "B7", 35000) },
    { id: "result", title: "Task 4: operating result in B8", hint: "=B5*B4-B3: 70 × 230 − 12,000 = 4,100.", cells: ["B8"], check: (a) => expectNumber(a, "B8", 4100) },
    { id: "downside", title: "Task 5: downside scenario in B9 and B10", hint: "B9 =B5*0.8 (56 packs); B10 =B9*B4-B3 (56 × 230 − 12,000 = 880). Still above zero, but only just.", cells: ["B9", "B10"], check: (a) => { const packs = expectNumber(a, "B9", 56); if (!packs.ok) return { ok: false, detail: `B9: ${packs.detail}` }; const result = expectNumber(a, "B10", 880); return result.ok ? result : { ok: false, detail: `B10: ${result.detail}` }; } },
  ],
  solution: { B4: "=B1-B2", B6: "=ROUNDUP(B3/B4,0)", B7: "=B1*B5", B8: "=B5*B4-B3", B9: "=B5*0.8", B10: "=B9*B4-B3" },
};

// ---------- 06 Hiring tracker: weighted scorecard ----------
// Weights sit in a row (B2:E2) aligned with the score columns, because SUMPRODUCT needs same-shaped ranges.
const CANDIDATE_ROWS = [6, 7, 8, 9];
export const hrSheetLab = {
  id: "hr-tracker",
  title: "Fair scorecard",
  brief: "Four candidates were scored 1 to 5 on four job-related criteria. Make the weights add up to 100%, compute a weighted total for each candidate with SUMPRODUCT, then find the leader and flag anyone below the 60 threshold.",
  columns: 8, rows: 13,
  widths: { A: "150px", B: "104px", C: "96px", D: "112px", E: "96px", F: "28px", G: "126px", H: "120px" },
  cells: {
    A1: "Criterion", B1: "Spreadsheet test", C1: "Written case", D1: "Structured interview", E1: "References",
    A2: "Weight", B2: "0.4", C2: "0.3", D2: "0.2", E2: "0.2",
    A3: "Weights total",
    A5: "Candidate", B5: "Sheet (1-5)", C5: "Case (1-5)", D5: "Interview (1-5)", E5: "Refs (1-5)", G5: "Weighted (of 100)", H5: "Threshold flag",
    A6: "Priya", B6: "4", C6: "3", D6: "4", E6: "5",
    A7: "Rohit", B7: "2", C7: "3", D7: "2", E7: "4",
    A8: "Meera", B8: "5", C8: "4", D8: "3", E8: "3",
    A9: "Daniel", B9: "3", C9: "5", D9: "4", E9: "2",
    A11: "Top score", A12: "Top candidate",
  },
  locked: ["A1", "B1", "C1", "D1", "E1", "A2", "A3", "A5", "B5", "C5", "D5", "E5", "G5", "H5", "A6", "B6", "C6", "D6", "E6", "A7", "B7", "C7", "D7", "E7", "A8", "B8", "C8", "D8", "E8", "A9", "B9", "C9", "D9", "E9", "A11", "A12"],
  tasks: [
    { id: "weights", title: "Task 1: make the weights sum to 100% (B2:E2) and show the total in B3", hint: "The weights currently add up to 110%. Adjust one weight (e.g. References to 0.1), then =SUM(B2:E2) in B3 must equal 1.", cells: ["B3", "E2"], check: (a) => { const total = expectNumber(a, "B3", 1, { functions: ["SUM"] }); if (!total.ok) return total; for (const ref of ["B2", "C2", "D2", "E2"]) { const w = number(a, ref); if (!(w > 0 && w < 1)) return { ok: false, detail: `${ref} must be a weight between 0 and 1` }; } return { ok: true }; } },
    { id: "weighted", title: "Task 2: weighted total of 100 for each candidate in G6:G9", hint: "=SUMPRODUCT(B6:E6,$B$2:$E$2)/5*100 converts a 1-5 score into a 0-100 weighted total. The two ranges must have the same shape. Fill down.", cells: ["G6", "G7", "G8", "G9"], check: (a) => everyCell(CANDIDATE_ROWS.map(row => `G${row}`), (ref) => { const formula = a.formula(ref); if (!formula) return { ok: false, detail: "needs a formula" }; if (!formulaUses(formula, ["SUMPRODUCT"])) return { ok: false, detail: "use SUMPRODUCT" }; const row = Number(ref.slice(1)); const weights = ["B2", "C2", "D2", "E2"].map(w => number(a, w)); const scores = ["B", "C", "D", "E"].map(col => number(a, `${col}${row}`)); const expected = scores.reduce((sum, score, index) => sum + score * weights[index], 0) / 5 * 100; const value = number(a, ref); if (isError(a.value(ref))) return { ok: false, detail: `shows ${a.value(ref)}: check that both ranges have the same shape` }; return approx(value, expected, 0.05) ? { ok: true } : { ok: false, detail: `shows ${Number.isNaN(value) ? a.display(ref) || "nothing" : value.toFixed(1)}, expected ${expected.toFixed(1)}` }; }) },
    { id: "top", title: "Task 3: the top weighted score in B11", hint: "=MAX(G6:G9).", cells: ["B11"], check: (a) => { const expected = Math.max(...CANDIDATE_ROWS.map(row => number(a, `G${row}`))); return Number.isNaN(expected) ? { ok: false, detail: "complete Task 2 first" } : expectNumber(a, "B11", expected, { functions: ["MAX", "LARGE"] }); } },
    { id: "top-name", title: "Task 4: the top candidate's name in B12", hint: "=INDEX(A6:A9, MATCH(B11, G6:G9, 0)) or =XLOOKUP(B11, G6:G9, A6:A9).", cells: ["B12"], check: (a) => { const scores = CANDIDATE_ROWS.map(row => number(a, `G${row}`)); if (scores.some(Number.isNaN)) return { ok: false, detail: "complete Task 2 first" }; const top = scores.indexOf(Math.max(...scores)); return expectText(a, "B12", String(a.value(`A${CANDIDATE_ROWS[top]}`)), { functions: ["INDEX", "XLOOKUP", "VLOOKUP"] }); } },
    { id: "flag", title: "Task 5: flag candidates below 60 in H6:H9", hint: "=IF(G6<60,\"Below threshold\",\"Proceed\"). A threshold applied to everyone is fairer than a gut feeling.", cells: ["H6", "H7", "H8", "H9"], check: (a) => everyCell(CANDIDATE_ROWS.map(row => `H${row}`), (ref) => { const row = Number(ref.slice(1)); const score = number(a, `G${row}`); if (Number.isNaN(score)) return { ok: false, detail: "complete Task 2 first" }; return expectText(a, ref, score < 60 ? "Below threshold" : "Proceed", { functions: ["IF", "IFS"] }); }) },
  ],
  solution: { E2: "0.1", B3: "=SUM(B2:E2)", G6: "=SUMPRODUCT(B6:E6,$B$2:$E$2)/5*100", G7: "=SUMPRODUCT(B7:E7,$B$2:$E$2)/5*100", G8: "=SUMPRODUCT(B8:E8,$B$2:$E$2)/5*100", G9: "=SUMPRODUCT(B9:E9,$B$2:$E$2)/5*100", B11: "=MAX(G6:G9)", B12: "=INDEX(A6:A9,MATCH(B11,G6:G9,0))", H6: '=IF(G6<60,"Below threshold","Proceed")', H7: '=IF(G7<60,"Below threshold","Proceed")', H8: '=IF(G8<60,"Below threshold","Proceed")', H9: '=IF(G9<60,"Below threshold","Proceed")' },
};

export const SHEET_LABS = { spreadsheets: spreadsheetsSheetLab, budgeting: budgetingSheetLab, "hr-tracker": hrSheetLab };
