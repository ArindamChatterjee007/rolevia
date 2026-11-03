import test from "node:test";
import assert from "node:assert/strict";
import { createSheet, formulaUses, formulaReferencesCells } from "../../site/app/labs/sheet-engine.js";
import { SHEET_LABS } from "../../site/app/labs/sheet-labs.js";
import { createLabSpreadsheet, readLabSpreadsheet } from "../../site/app/labs/google-sheets.js";

const accessor = (sheet) => ({ value: (ref) => sheet.value(ref), formula: (ref) => sheet.formula(ref), display: (ref) => sheet.display(ref), raw: (ref) => sheet.get(ref) });

test("sheet engine: arithmetic, text, criteria functions, lookups, errors and circular references behave like a spreadsheet", () => {
  const sheet = createSheet({ A1: "Region", B1: "Sales", A2: " north ", B2: "900", A3: "South", B3: "1500", A4: "North", B4: "2,100", A5: "south", B5: "500",
    C2: "=TRIM(UPPER(A2))", C3: "=TRIM(UPPER(A3))", C4: "=TRIM(UPPER(A4))", C5: "=TRIM(UPPER(A5))", D2: "=VALUE(B2)", D3: "=VALUE(B3)", D4: "=VALUE(B4)", D5: "=VALUE(B5)" });
  const cases = [
    ["=SUM(D2:D5)", 5000], ['=SUMIFS(D2:D5,C2:C5,"North")', 3000], ['=SUMIF(C2:C5,"south",D2:D5)', 2000], ['=COUNTIFS(D2:D5,">=1500")', 2], ['=COUNTIF(C2:C5,"S*")', 2],
    ['=IF(D4>=1500,"Review","Routine")', "Review"], ["=ROUNDUP(12000/230,0)", 53], ["=ROUND(2.345,2)", 2.35], ["=AVERAGE(D2:D5)", 1250], ["=MAX(D2:D5)-MIN(D2:D5)", 1600],
    ['=VLOOKUP("SOUTH",C2:D5,2,FALSE)', 1500], ["=INDEX(A2:A5,MATCH(MAX(D2:D5),D2:D5,0))", "North"], ["=XLOOKUP(2100,D2:D5,C2:C5)", "NORTH"], ["=SUMPRODUCT(D2:D3,D4:D5)", 2640000],
    ['=TEXT(0.2567,"0.0%")', "25.7%"], ['=A3&"-"&B3', "South-1500"], ["=LEN(TRIM(A2))", 5], ['=IFERROR(1/0,"n/a")', "n/a"], ['=IFERROR(VLOOKUP("x",C2:D5,2,FALSE),"missing")', "missing"],
    ["=2^3*2", 16], ["=(1+2)*3", 9], ["=-D2+10", -890], ["=5>=5", true], ['="a"<>"A"', false], ["=1/0", "#DIV/0!"], ["=FOO(1)", "#NAME?"], ["=SUMPRODUCT(B2:C2,B2:B3)", "#VALUE!"], ["=VLOOKUP(1,D2:D5,3,FALSE)", "#REF!"], ["=MATCH(9,D2:D5,0)", "#N/A"], ["=10%*200", 20],
  ];
  for (const [formula, expected] of cases) assert.equal(sheet.evaluate(formula), expected, formula);
  const loop = createSheet({ A1: "=B1+1", B1: "=A1+1", C1: "=A1" });
  assert.equal(loop.value("A1"), "#CIRC!");
  assert.equal(loop.value("C1"), "#CIRC!");
  loop.set("B1", "5");
  assert.equal(loop.value("A1"), 6, "recalculates after an edit clears the cycle");
  assert.equal(formulaUses("=SUMIFS(G2:G9,F2:F9,\"North\")", ["SUMIFS"]), true);
  assert.equal(formulaUses("=sum(G2:G9)", ["SUMIFS"]), false);
  assert.equal(formulaReferencesCells("=500-270"), false);
  assert.equal(formulaReferencesCells("=B1-B2"), true);
  assert.equal(formulaReferencesCells('="A1 is text"'), false);
});

test("sheet labs: blank sheets pass nothing, reference solutions pass every task, hard-coded numbers and wrong functions are rejected", () => {
  for (const [id, lab] of Object.entries(SHEET_LABS)) {
    const blank = createSheet(lab.cells);
    assert.equal(lab.tasks.filter(task => task.check(accessor(blank)).ok).length, 0, `${id}: nothing passes on the blank sheet`);
    const solved = createSheet({ ...lab.cells, ...lab.solution });
    for (const task of lab.tasks) { const result = task.check(accessor(solved)); assert.ok(result.ok, `${id} ${task.id}: ${result.detail}`); }
    for (const ref of lab.locked) assert.ok(!(ref in lab.solution), `${id}: solution must not write into locked cell ${ref}`);
    assert.ok(lab.tasks.every(task => task.cells.every(ref => !lab.locked.includes(ref))), `${id}: task cells are editable`);
  }
  const typed = createSheet({ ...SHEET_LABS.budgeting.cells, B4: "230", B6: "=53", B7: "=500*70" });
  const [contribution, breakEven, revenue] = SHEET_LABS.budgeting.tasks.map(task => task.check(accessor(typed)));
  assert.match(contribution.detail, /formula/);
  assert.match(breakEven.detail, /ROUNDUP/);
  assert.match(revenue.detail, /reference the cells/);
  const wrongFunction = createSheet({ ...SHEET_LABS.spreadsheets.cells, K2: "=SUM(G2:G9)" });
  assert.match(SHEET_LABS.spreadsheets.tasks[3].check(accessor(wrongFunction)).detail, /SUMIFS/);
  const hr = createSheet({ ...SHEET_LABS["hr-tracker"].cells, ...SHEET_LABS["hr-tracker"].solution });
  assert.deepEqual(["G6", "G7", "G8", "G9"].map(ref => hr.value(ref)), [76, 50, 82, 74]);
  assert.equal(hr.value("B12"), "Meera");
  assert.equal(hr.value("H7"), "Below threshold");
  const mismatched = createSheet({ ...SHEET_LABS["hr-tracker"].cells, E2: "0.1", B3: "=SUM(B2:E2)", G6: "=SUMPRODUCT(B6:E6,$B$2:$B$5)/5*100" });
  assert.match(SHEET_LABS["hr-tracker"].tasks[1].check(accessor(mismatched)).detail, /same shape/);
});

test("google sheets bridge: creates the workbook from the cell map and reads values plus formulas back into a checkable map", async () => {
  const calls = [];
  const fetchImpl = async (url, options = {}) => {
    calls.push({ url, options });
    assert.equal(options.headers.Authorization, "Bearer tok-1");
    if (url.endsWith("/v4/spreadsheets")) { const body = JSON.parse(options.body); return new Response(JSON.stringify({ spreadsheetId: "sheet-1", spreadsheetUrl: "https://docs.google.com/spreadsheets/d/sheet-1/edit", body }), { status: 200 }); }
    if (url.includes("valueRenderOption=UNFORMATTED_VALUE")) return new Response(JSON.stringify({ values: [["Order ID", "Sales (raw)"], ["K01", 900], ["K02", "", 2100]] }), { status: 200 });
    if (url.includes("valueRenderOption=FORMULA")) return new Response(JSON.stringify({ values: [["Order ID", "Sales (raw)"], ["K01", "=VALUE(E2)"], ["K02", "", "=SUM(A1:A2)"]] }), { status: 200 });
    return new Response("nope", { status: 404 });
  };
  const created = await createLabSpreadsheet({ token: "tok-1", title: "Rolevia lab", cells: { A1: "Order ID", B1: "Sales (raw)", A2: "K01", B2: "900", C3: "=SUM(B2:B2)" }, fetchImpl });
  assert.equal(created.spreadsheetId, "sheet-1");
  const sent = JSON.parse(calls[0].options.body);
  const rows = sent.sheets[0].data[0].rowData;
  assert.equal(rows[0].values[0].userEnteredValue.stringValue, "Order ID");
  assert.equal(rows[1].values[1].userEnteredValue.numberValue, 900);
  assert.equal(rows[2].values[2].userEnteredValue.formulaValue, "=SUM(B2:B2)");
  assert.equal(sent.sheets[0].properties.gridProperties.frozenRowCount, 1);
  const cells = await readLabSpreadsheet({ token: "tok-1", spreadsheetId: "sheet-1", fetchImpl });
  assert.equal(cells.B2.value, 900);
  assert.equal(cells.B2.formula, "=VALUE(E2)");
  assert.equal(cells.C3.value, 2100);
  assert.equal(cells.C3.formula, "=SUM(A1:A2)");
  assert.equal(cells.A1.formula, null);
  assert.equal(cells.B3, undefined, "empty cells are not reported");
  const denied = async () => new Response(JSON.stringify({ error: { message: "insufficient scope" } }), { status: 403 });
  await assert.rejects(readLabSpreadsheet({ token: "tok-1", spreadsheetId: "sheet-1", fetchImpl: denied }), /403.*insufficient scope/);
});
