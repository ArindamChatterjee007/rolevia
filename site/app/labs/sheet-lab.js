// Sheet lab component: a grid powered by sheet-engine.js, a formula bar, a task checklist with live checks and
// scoring, and an optional "work in Google Sheets" route through google-sheets.js. Tasks are declared as data:
// { id, title, hint, cells: ["F2", ...], check(ctx) → { ok, detail } } where ctx exposes value/formula/display.
import { h, icon, toast, busy, modal } from "../ui.js";
import { ctx } from "../context.js";
import { createSheet, indexToCol, toRef, parseRef, isError, formulaUses, formulaReferencesCells, approx } from "./sheet-engine.js";
import { sheetsConfigured, sheetsAuthUrl, sheetsToken, forgetSheetsToken, createLabSpreadsheet, readLabSpreadsheet } from "./google-sheets.js";

export const check = { formulaUses, formulaReferencesCells, approx, isError };

// Runs every task against a cell accessor; shared by the in-browser grid and the Google Sheets read-back.
export function evaluateTasks(tasks, accessor) {
  const results = tasks.map(task => { try { const result = task.check(accessor); return { id: task.id, title: task.title, ok: Boolean(result.ok), detail: result.detail ?? "" }; } catch (error) { return { id: task.id, title: task.title, ok: false, detail: error.message }; } });
  const passed = results.filter(result => result.ok).length;
  return { results, passed, total: tasks.length, score: Math.round((passed / tasks.length) * 100) };
}
export const sheetAccessor = (sheet) => ({ value: (ref) => sheet.value(ref), formula: (ref) => sheet.formula(ref), display: (ref) => sheet.display(ref), raw: (ref) => sheet.get(ref) });
export const cellMapAccessor = (cells) => ({ value: (ref) => cells[ref.toUpperCase()]?.value ?? "", formula: (ref) => cells[ref.toUpperCase()]?.formula ?? null, display: (ref) => String(cells[ref.toUpperCase()]?.value ?? ""), raw: (ref) => cells[ref.toUpperCase()]?.formula ?? String(cells[ref.toUpperCase()]?.value ?? "") });

export function sheetLab({ labId, title, brief, cells, tasks, columns = 8, rows = 14, locked = [], widths = {}, onComplete }) {
  const sheet = createSheet(cells);
  const lockedSet = new Set(locked.map(ref => ref.toUpperCase()));
  let selected = "A1";
  let editing = false;
  let best = 0;
  let saveTimer = null;
  const saveBest = (score) => { clearTimeout(saveTimer); saveTimer = setTimeout(() => onComplete(score), 700); };
  const root = h("div", { class: "sheet-lab" });
  const formulaInput = h("input", { class: "input sheet-formula", spellcheck: false, autocomplete: "off", "aria-label": "Formula bar", placeholder: "Type a value or a formula starting with =" });
  const cellLabel = h("span", { class: "sheet-cell-name" }, selected);
  const grid = h("div", { class: "sheet-grid", role: "grid", "aria-label": `${title} spreadsheet`, tabindex: 0 });
  const taskList = h("ol", { class: "sheet-tasks" });
  const scoreBox = h("div", { class: "sheet-score" });
  const googleBox = h("div", { class: "sheet-google" });

  const commit = (text) => { if (lockedSet.has(selected)) { toast("That cell is part of the source data. Work in the task cells.", "info"); return; } sheet.set(selected, text); editing = false; render(); report(); };
  const move = (dCol, dRow) => { const position = parseRef(selected); const col = Math.min(Math.max(1, position.col + dCol), columns); const row = Math.min(Math.max(1, position.row + dRow), rows); select(toRef(col, row)); };
  const select = (ref) => { selected = ref.toUpperCase(); cellLabel.textContent = selected; formulaInput.value = sheet.get(selected); render(); };
  formulaInput.addEventListener("keydown", (event) => { if (event.key === "Enter") { event.preventDefault(); commit(formulaInput.value); move(0, 1); formulaInput.value = sheet.get(selected); } if (event.key === "Escape") { formulaInput.value = sheet.get(selected); grid.focus(); } });
  formulaInput.addEventListener("input", () => { editing = true; });
  formulaInput.addEventListener("blur", () => { if (editing && formulaInput.value !== sheet.get(selected)) commit(formulaInput.value); });
  grid.addEventListener("keydown", (event) => {
    if (event.key === "ArrowDown") { event.preventDefault(); move(0, 1); } else if (event.key === "ArrowUp") { event.preventDefault(); move(0, -1); } else if (event.key === "ArrowLeft") { event.preventDefault(); move(-1, 0); } else if (event.key === "ArrowRight" || event.key === "Tab") { event.preventDefault(); move(event.shiftKey ? -1 : 1, 0); }
    else if (event.key === "Enter" || event.key === "F2") { event.preventDefault(); formulaInput.focus(); formulaInput.select(); }
    else if (event.key === "Delete" || event.key === "Backspace") { event.preventDefault(); commit(""); formulaInput.value = ""; }
    else if (event.key.length === 1 && !event.metaKey && !event.ctrlKey && !event.altKey) { event.preventDefault(); formulaInput.value = event.key; editing = true; formulaInput.focus(); }
  });

  const render = () => {
    const header = h("div", { class: "sheet-row sheet-head" }, h("div", { class: "sheet-corner" }), ...Array.from({ length: columns }, (_, c) => h("div", { class: "sheet-col", style: widths[indexToCol(c + 1)] ? { width: widths[indexToCol(c + 1)] } : null }, indexToCol(c + 1))));
    const body = Array.from({ length: rows }, (_, r) => h("div", { class: "sheet-row", role: "row" }, h("div", { class: "sheet-rownum" }, r + 1), ...Array.from({ length: columns }, (_, c) => {
      const ref = toRef(c + 1, r + 1);
      const value = sheet.value(ref);
      const text = sheet.display(ref);
      const classes = ["sheet-cell", ref === selected ? "selected" : "", lockedSet.has(ref) ? "locked" : "", sheet.isFormula(ref) ? "formula" : "", isError(value) ? "error" : "", typeof value === "number" ? "number" : "", typeof value === "boolean" ? "bool" : ""].filter(Boolean).join(" ");
      return h("div", { class: classes, role: "gridcell", "data-ref": ref, title: sheet.isFormula(ref) ? sheet.get(ref) : null, style: widths[indexToCol(c + 1)] ? { width: widths[indexToCol(c + 1)] } : null, onMousedown: (event) => { event.preventDefault(); select(ref); grid.focus(); }, onDblclick: () => { formulaInput.focus(); formulaInput.select(); } }, text);
    })));
    grid.replaceChildren(header, ...body);
  };
  const report = () => {
    const outcome = evaluateTasks(tasks, sheetAccessor(sheet));
    taskList.replaceChildren(...outcome.results.map((result, index) => h("li", { class: `sheet-task ${result.ok ? "done" : ""}` }, h("span", { class: "sheet-task-index" }, result.ok ? icon("check", 12) : index + 1), h("div", { class: "grow" }, h("strong", {}, result.title), h("p", { class: "tiny muted" }, tasks[index].hint), result.detail && !result.ok ? h("p", { class: "tiny detail" }, result.detail) : null), h("button", { class: "mini", type: "button", "aria-label": `Go to ${tasks[index].cells[0]}`, onClick: () => { select(tasks[index].cells[0]); grid.focus(); } }, tasks[index].cells[0]))));
    scoreBox.replaceChildren(h("strong", {}, `${outcome.passed} / ${outcome.total}`), h("span", { class: "tiny muted" }, " tasks complete"), h("div", { class: "bar" }, h("div", { class: "bar-fill", style: { width: `${outcome.score}%` } })));
    if (outcome.passed > 0 && outcome.score > best) { best = outcome.score; saveBest(outcome.score); }
    return outcome;
  };

  // Google Sheets route: create the workbook in the learner's Drive, then read it back for checking.
  const renderGoogle = () => {
    const configured = sheetsConfigured(ctx.config);
    const token = sheetsToken();
    const saved = JSON.parse(sessionStorage.getItem(`rolevia.lab.${labId}.gsheet`) ?? "null");
    if (!configured) { googleBox.replaceChildren(h("p", { class: "tiny muted" }, icon("info", 12), " Prefer real Google Sheets? The founder can switch on Google sign-in for labs (a free Google OAuth client ID in config.json); then this lab creates the workbook in your own Drive and checks it from here.")); return; }
    const connect = h("button", { class: "button ghost small", type: "button", onClick: () => { location.href = sheetsAuthUrl({ clientId: ctx.config.googleClientId, labId }); } }, icon("upload", 14), "Continue with Google");
    const create = h("button", { class: "button ghost small", type: "button", onClick: async (event) => { busy(event.currentTarget, true, "Creating"); try { const created = await createLabSpreadsheet({ token, title: `Rolevia lab: ${title}`, cells }); sessionStorage.setItem(`rolevia.lab.${labId}.gsheet`, JSON.stringify(created)); toast("Workbook created in your Google Drive.", "success"); renderGoogle(); } catch (error) { toast(error.message, "error", 8000); if (/401|403/.test(error.message)) forgetSheetsToken(); renderGoogle(); } } }, icon("spark", 14), "Create the workbook in my Google Drive");
    const checkButton = h("button", { class: "button primary small", type: "button", onClick: async (event) => { busy(event.currentTarget, true, "Checking"); try { const cellsRead = await readLabSpreadsheet({ token, spreadsheetId: saved.spreadsheetId }); const outcome = evaluateTasks(tasks, cellMapAccessor(cellsRead)); modal({ title: `Your Google Sheet: ${outcome.passed} of ${outcome.total} tasks`, body: h("ul", { class: "ticks" }, outcome.results.map(result => h("li", { class: result.ok ? "ok" : "miss" }, icon(result.ok ? "check" : "close", 14), `${result.title}${result.ok || !result.detail ? "" : `: ${result.detail}`}`))), actions: [{ label: "Close" }] }); if (outcome.score > best) { best = outcome.score; onComplete(outcome.score); } } catch (error) { toast(error.message, "error", 8000); if (/401|403/.test(error.message)) forgetSheetsToken(); } finally { busy(event.currentTarget, false); renderGoogle(); } } }, icon("check", 14), "Check my Google Sheet");
    googleBox.replaceChildren(h("div", { class: "sheet-google-row" }, h("span", { class: "tiny muted" }, "Work in real Google Sheets instead: "), !token ? connect : saved ? [h("a", { class: "button ghost small", href: saved.url, target: "_blank", rel: "noopener noreferrer" }, "Open my workbook"), checkButton] : create));
  };

  root.append(
    h("p", { class: "lab-brief" }, brief),
    h("div", { class: "sheet-toolbar" }, cellLabel, formulaInput, h("span", { class: "tiny muted sheet-help" }, "Enter commits · arrows move · Delete clears")),
    h("div", { class: "sheet-layout" }, h("div", { class: "sheet-grid-wrap" }, grid), h("aside", { class: "sheet-side" }, h("h4", {}, icon("clipboard", 16), "Tasks"), taskList, scoreBox, googleBox)));
  render(); report(); renderGoogle();
  return root;
}
