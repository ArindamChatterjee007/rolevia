// Rolevia Sheets: a small spreadsheet engine for interactive labs. Learners type real formulas (SUM, SUMIFS,
// IF, VLOOKUP, ROUNDUP, ...) into a grid that behaves like Google Sheets or Excel for the functions taught in
// the modules. Deterministic (no TODAY/RAND), so tasks can be checked automatically on CI.

const ERRORS = new Set(["#DIV/0!", "#REF!", "#NAME?", "#VALUE!", "#N/A", "#NUM!", "#CIRC!"]);
export const isError = (value) => typeof value === "string" && ERRORS.has(value);
const error = (code) => code;

export const colToIndex = (letters) => letters.toUpperCase().split("").reduce((sum, letter) => sum * 26 + letter.charCodeAt(0) - 64, 0);
export const indexToCol = (index) => { let out = ""; let n = index; while (n > 0) { const rem = (n - 1) % 26; out = String.fromCharCode(65 + rem) + out; n = Math.floor((n - 1) / 26); } return out; };
export const parseRef = (ref) => { const match = /^\$?([A-Za-z]{1,2})\$?(\d{1,4})$/.exec(ref); return match ? { col: colToIndex(match[1]), row: Number(match[2]) } : null; };
export const toRef = (col, row) => `${indexToCol(col)}${row}`;
export const rangeCells = (a, b) => {
  const from = parseRef(a), to = parseRef(b);
  if (!from || !to) return [];
  const cells = [];
  for (let row = Math.min(from.row, to.row); row <= Math.max(from.row, to.row); row += 1) for (let col = Math.min(from.col, to.col); col <= Math.max(from.col, to.col); col += 1) cells.push(toRef(col, row));
  return cells;
};

// ---------- tokenizer ----------
function tokenize(source) {
  const tokens = [];
  let i = 0;
  while (i < source.length) {
    const ch = source[i];
    if (/\s/.test(ch)) { i += 1; continue; }
    if (ch === '"') { let j = i + 1, text = ""; while (j < source.length) { if (source[j] === '"') { if (source[j + 1] === '"') { text += '"'; j += 2; continue; } break; } text += source[j]; j += 1; } if (j >= source.length) throw error("#VALUE!"); tokens.push({ type: "string", value: text }); i = j + 1; continue; }
    if (/[0-9.]/.test(ch)) { const match = /^\d*\.?\d+(?:e[+-]?\d+)?%?/i.exec(source.slice(i)); if (!match) throw error("#VALUE!"); const raw = match[0]; tokens.push({ type: "number", value: raw.endsWith("%") ? Number(raw.slice(0, -1)) / 100 : Number(raw) }); i += raw.length; continue; }
    const range = /^\$?[A-Za-z]{1,2}\$?\d{1,4}:\$?[A-Za-z]{1,2}\$?\d{1,4}/.exec(source.slice(i));
    if (range) { const [a, b] = range[0].split(":"); tokens.push({ type: "range", a: a.replace(/\$/g, ""), b: b.replace(/\$/g, "") }); i += range[0].length; continue; }
    const word = /^[A-Za-z_][A-Za-z0-9_.]*/.exec(source.slice(i));
    if (word) {
      const text = word[0];
      const next = source.slice(i + text.length).trimStart();
      if (next.startsWith("(")) tokens.push({ type: "func", name: text.toUpperCase() });
      else if (/^TRUE$/i.test(text)) tokens.push({ type: "bool", value: true });
      else if (/^FALSE$/i.test(text)) tokens.push({ type: "bool", value: false });
      else if (parseRef(text)) tokens.push({ type: "ref", ref: text.replace(/\$/g, "").toUpperCase() });
      else throw error("#NAME?");
      i += text.length; continue;
    }
    if (ch === "$") { const ref = /^\$?[A-Za-z]{1,2}\$?\d{1,4}/.exec(source.slice(i)); if (ref) { tokens.push({ type: "ref", ref: ref[0].replace(/\$/g, "").toUpperCase() }); i += ref[0].length; continue; } }
    const two = source.slice(i, i + 2);
    if (["<=", ">=", "<>"].includes(two)) { tokens.push({ type: "op", value: two }); i += 2; continue; }
    if ("+-*/^&=<>(),:;".includes(ch)) { tokens.push({ type: "op", value: ch === ";" ? "," : ch }); i += 1; continue; }
    throw error("#VALUE!");
  }
  return tokens;
}

// ---------- parser (precedence climbing) ----------
function parse(tokens) {
  let pos = 0;
  const peek = () => tokens[pos];
  const take = () => tokens[pos++];
  const expect = (value) => { const token = take(); if (!token || token.type !== "op" || token.value !== value) throw error("#VALUE!"); };
  const levels = [["=", "<>", "<", ">", "<=", ">="], ["&"], ["+", "-"], ["*", "/"], ["^"]];
  const binary = (level) => {
    if (level === levels.length) return unary();
    let left = binary(level + 1);
    while (peek()?.type === "op" && levels[level].includes(peek().value)) { const op = take().value; const right = binary(level + 1); left = { type: "binary", op, left, right }; }
    return left;
  };
  const unary = () => {
    if (peek()?.type === "op" && (peek().value === "-" || peek().value === "+")) { const op = take().value; return { type: "unary", op, operand: unary() }; }
    return primary();
  };
  const primary = () => {
    const token = take();
    if (!token) throw error("#VALUE!");
    if (token.type === "number" || token.type === "string" || token.type === "bool") return { type: "literal", value: token.value };
    if (token.type === "ref") return { type: "ref", ref: token.ref };
    if (token.type === "range") return { type: "range", a: token.a.toUpperCase(), b: token.b.toUpperCase() };
    if (token.type === "func") { expect("("); const args = []; if (!(peek()?.type === "op" && peek().value === ")")) { args.push(binary(0)); while (peek()?.type === "op" && peek().value === ",") { take(); args.push(binary(0)); } } expect(")"); return { type: "call", name: token.name, args }; }
    if (token.type === "op" && token.value === "(") { const inner = binary(0); expect(")"); return inner; }
    throw error("#VALUE!");
  };
  const ast = binary(0);
  if (pos !== tokens.length) throw error("#VALUE!");
  return ast;
}

// ---------- evaluation helpers ----------
const isBlank = (value) => value === null || value === undefined || value === "";
const toNumber = (value) => {
  if (typeof value === "number") return value;
  if (typeof value === "boolean") return value ? 1 : 0;
  if (isBlank(value)) return 0;
  if (isError(value)) throw value;
  const text = String(value).trim().replace(/^INR\s*/i, "").replace(/,/g, "");
  if (/^-?\d*\.?\d+%$/.test(text)) return Number(text.slice(0, -1)) / 100;
  if (/^-?\d*\.?\d+(e[+-]?\d+)?$/i.test(text)) return Number(text);
  throw error("#VALUE!");
};
export function formatNumber(value) {
  if (!Number.isFinite(value)) return "#NUM!";
  const rounded = Math.round(value * 1e9) / 1e9;
  if (Number.isInteger(rounded)) return String(rounded);
  return String(Number(rounded.toFixed(6)));
}
const toText = (value) => { if (isBlank(value)) return ""; if (typeof value === "boolean") return value ? "TRUE" : "FALSE"; if (typeof value === "number") return formatNumber(value); return String(value); };
const toBool = (value) => { if (typeof value === "boolean") return value; if (typeof value === "number") return value !== 0; if (isBlank(value)) return false; if (typeof value === "string") { if (/^true$/i.test(value)) return true; if (/^false$/i.test(value)) return false; throw error("#VALUE!"); } throw error("#VALUE!"); };
const numericCells = (values) => values.filter(value => typeof value === "number");
const escapeRegex = (text) => text.replace(/[.+^${}()|[\]\\]/g, "\\$&");
const wildcard = (text) => new RegExp(`^${escapeRegex(text).replace(/\*/g, ".*").replace(/\?/g, ".")}$`, "i");
const looksNumeric = (value) => typeof value === "number" || (typeof value === "string" && /^-?\d*\.?\d+%?$/.test(value.trim().replace(/,/g, "")));

// Criteria for SUMIF/COUNTIF-style functions: ">=1500", "<>North", "N*", 1500, "North".
function criterion(raw) {
  if (typeof raw === "number" || typeof raw === "boolean") return (value) => !isBlank(value) && compare(value, raw) === 0;
  const text = String(raw ?? "");
  const match = /^(<=|>=|<>|<|>|=)?(.*)$/s.exec(text);
  const op = match[1] ?? "=";
  const target = match[2];
  const numeric = /^-?\d*\.?\d+$/.test(target.trim()) ? Number(target) : null;
  if (numeric === null) {
    if (op === "=") { if (target === "") return (value) => isBlank(value); const pattern = wildcard(target); return (value) => !isBlank(value) && !isError(value) && pattern.test(toText(value)); }
    if (op === "<>") { const pattern = wildcard(target); return (value) => (isBlank(value) ? target !== "" : !pattern.test(toText(value))); }
    return (value) => { if (isBlank(value) || isError(value) || typeof value === "number") return false; const left = toText(value).toLowerCase(), right = target.toLowerCase(); return { "<": left < right, ">": left > right, "<=": left <= right, ">=": left >= right }[op]; };
  }
  return (value) => {
    if (isBlank(value) || isError(value) || !looksNumeric(value)) return op === "<>";
    const left = toNumber(value);
    return { "=": left === numeric, "<>": left !== numeric, "<": left < numeric, ">": left > numeric, "<=": left <= numeric, ">=": left >= numeric }[op];
  };
}
function compare(a, b) {
  if (typeof a === "number" && typeof b === "number") return a - b;
  if (typeof a === "boolean" || typeof b === "boolean") return Number(toBool(a)) - Number(toBool(b));
  if (typeof a === "number" && typeof b === "string") return looksNumeric(b) ? a - toNumber(b) : -1;
  if (typeof a === "string" && typeof b === "number") return looksNumeric(a) ? toNumber(a) - b : 1;
  return toText(a).toLowerCase().localeCompare(toText(b).toLowerCase());
}
const lookupMatch = (needle, haystack, exact = true) => {
  if (exact) return haystack.findIndex(value => !isBlank(value) && compare(value, needle) === 0);
  let best = -1;
  haystack.forEach((value, index) => { if (!isBlank(value) && compare(value, needle) <= 0) best = index; });
  return best;
};
const pairsOf = (args) => { if (args.length % 2 !== 0) throw error("#VALUE!"); const pairs = []; for (let i = 0; i < args.length; i += 2) pairs.push([Array.isArray(args[i]) ? args[i] : [args[i]], criterion(args[i + 1])]); return pairs; };
const asRange = (value) => (Array.isArray(value) ? value : [value]);

const FUNCTIONS = {
  SUM: (args) => numericCells(args.flat()).reduce((sum, value) => sum + value, 0),
  AVERAGE: (args) => { const values = numericCells(args.flat()); if (!values.length) throw error("#DIV/0!"); return values.reduce((sum, value) => sum + value, 0) / values.length; },
  COUNT: (args) => numericCells(args.flat()).length,
  COUNTA: (args) => args.flat().filter(value => !isBlank(value)).length,
  COUNTBLANK: (args) => args.flat().filter(value => isBlank(value)).length,
  MIN: (args) => { const values = numericCells(args.flat()); return values.length ? Math.min(...values) : 0; },
  MAX: (args) => { const values = numericCells(args.flat()); return values.length ? Math.max(...values) : 0; },
  ABS: ([value]) => Math.abs(toNumber(value)),
  ROUND: ([value, places = 0]) => { const factor = 10 ** toNumber(places); return Math.round(toNumber(value) * factor + Number.EPSILON) / factor; },
  ROUNDUP: ([value, places = 0]) => { const factor = 10 ** toNumber(places); const n = toNumber(value) * factor; return (n >= 0 ? Math.ceil(n - 1e-9) : Math.floor(n + 1e-9)) / factor; },
  ROUNDDOWN: ([value, places = 0]) => { const factor = 10 ** toNumber(places); const n = toNumber(value) * factor; return (n >= 0 ? Math.floor(n + 1e-9) : Math.ceil(n - 1e-9)) / factor; },
  INT: ([value]) => Math.floor(toNumber(value)),
  MOD: ([a, b]) => { const divisor = toNumber(b); if (divisor === 0) throw error("#DIV/0!"); const n = toNumber(a); return n - divisor * Math.floor(n / divisor); },
  SQRT: ([value]) => { const n = toNumber(value); if (n < 0) throw error("#NUM!"); return Math.sqrt(n); },
  POWER: ([a, b]) => toNumber(a) ** toNumber(b),
  IF: ([condition, yes = true, no = false]) => (toBool(condition) ? yes : no),
  IFS: (args) => { for (let i = 0; i + 1 < args.length; i += 2) if (toBool(args[i])) return args[i + 1]; throw error("#N/A"); },
  IFERROR: ([value, fallback = ""]) => (isError(value) ? fallback : value),
  AND: (args) => args.flat().filter(value => !isBlank(value)).every(toBool),
  OR: (args) => args.flat().filter(value => !isBlank(value)).some(toBool),
  NOT: ([value]) => !toBool(value),
  TRUE: () => true,
  FALSE: () => false,
  ISBLANK: ([value]) => isBlank(value),
  ISNUMBER: ([value]) => typeof value === "number",
  ISTEXT: ([value]) => typeof value === "string" && !isError(value),
  ISERROR: ([value]) => isError(value),
  SUMIF: ([range, crit, sumRange]) => { const test = criterion(crit); const values = asRange(sumRange ?? range); return asRange(range).reduce((sum, value, index) => (test(value) && typeof values[index] === "number" ? sum + values[index] : sum), 0); },
  COUNTIF: ([range, crit]) => asRange(range).filter(criterion(crit)).length,
  AVERAGEIF: ([range, crit, avgRange]) => { const test = criterion(crit); const values = asRange(avgRange ?? range); const picked = asRange(range).map((value, index) => (test(value) ? values[index] : null)).filter(value => typeof value === "number"); if (!picked.length) throw error("#DIV/0!"); return picked.reduce((sum, value) => sum + value, 0) / picked.length; },
  SUMIFS: ([sumRange, ...pairs]) => { const tests = pairsOf(pairs); return asRange(sumRange).reduce((sum, value, index) => (typeof value === "number" && tests.every(([range, test]) => test(range[index])) ? sum + value : sum), 0); },
  COUNTIFS: (args) => { const tests = pairsOf(args); const length = tests[0]?.[0].length ?? 0; let count = 0; for (let index = 0; index < length; index += 1) if (tests.every(([range, test]) => test(range[index]))) count += 1; return count; },
  AVERAGEIFS: ([avgRange, ...pairs]) => { const tests = pairsOf(pairs); const picked = asRange(avgRange).filter((value, index) => typeof value === "number" && tests.every(([range, test]) => test(range[index]))); if (!picked.length) throw error("#DIV/0!"); return picked.reduce((sum, value) => sum + value, 0) / picked.length; },
  SUMPRODUCT: (args, meta) => { const ranges = args.map(asRange); const length = ranges[0].length; const width = meta.width(0); if (ranges.some((range, index) => range.length !== length || meta.width(index) !== width)) throw error("#VALUE!"); let total = 0; for (let index = 0; index < length; index += 1) total += ranges.reduce((product, range) => product * (typeof range[index] === "number" ? range[index] : 0), 1); return total; },
  VLOOKUP: ([needle, table, column, approx = false], meta) => { const cols = meta.width(1); const col = toNumber(column); if (col < 1 || col > cols) throw error("#REF!"); const rows = table.length / cols; const first = Array.from({ length: rows }, (_, r) => table[r * cols]); const found = lookupMatch(needle, first, !toBool(approx)); if (found < 0) throw error("#N/A"); return table[found * cols + col - 1]; },
  HLOOKUP: ([needle, table, rowIndex, approx = false], meta) => { const cols = meta.width(1); const rows = table.length / cols; const row = toNumber(rowIndex); if (row < 1 || row > rows) throw error("#REF!"); const found = lookupMatch(needle, table.slice(0, cols), !toBool(approx)); if (found < 0) throw error("#N/A"); return table[(row - 1) * cols + found]; },
  XLOOKUP: ([needle, lookup, result, notFound]) => { const found = lookupMatch(needle, asRange(lookup), true); if (found < 0) { if (notFound !== undefined) return notFound; throw error("#N/A"); } return asRange(result)[found]; },
  MATCH: ([needle, range, type = 1]) => { const found = lookupMatch(needle, asRange(range), toNumber(type) === 0); if (found < 0) throw error("#N/A"); return found + 1; },
  INDEX: ([range, rowIndex, colIndex = 1], meta) => { const list = asRange(range); const cols = meta.width(0); const row = toNumber(rowIndex); const col = toNumber(colIndex); const rows = list.length / cols; if (row < 1 || row > rows || col < 1 || col > cols) throw error("#REF!"); return list[(row - 1) * cols + col - 1]; },
  RANK: ([value, range, order = 0]) => { const n = toNumber(value); const values = numericCells(asRange(range)).sort((a, b) => (toNumber(order) === 0 ? b - a : a - b)); const index = values.indexOf(n); if (index < 0) throw error("#N/A"); return index + 1; },
  LARGE: ([range, k]) => { const values = numericCells(asRange(range)).sort((a, b) => b - a); const index = toNumber(k) - 1; if (index < 0 || index >= values.length) throw error("#NUM!"); return values[index]; },
  SMALL: ([range, k]) => { const values = numericCells(asRange(range)).sort((a, b) => a - b); const index = toNumber(k) - 1; if (index < 0 || index >= values.length) throw error("#NUM!"); return values[index]; },
  TRIM: ([value]) => toText(value).trim().replace(/\s+/g, " "),
  CLEAN: ([value]) => toText(value).replace(/[\x00-\x1f]/g, ""),
  UPPER: ([value]) => toText(value).toUpperCase(),
  LOWER: ([value]) => toText(value).toLowerCase(),
  PROPER: ([value]) => toText(value).toLowerCase().replace(/(^|[^a-z])([a-z])/g, (_, before, letter) => before + letter.toUpperCase()),
  LEN: ([value]) => toText(value).length,
  LEFT: ([value, count = 1]) => toText(value).slice(0, toNumber(count)),
  RIGHT: ([value, count = 1]) => { const text = toText(value); const n = toNumber(count); return n === 0 ? "" : text.slice(-n); },
  MID: ([value, start, count]) => toText(value).substr(toNumber(start) - 1, toNumber(count)),
  FIND: ([needle, text, start = 1]) => { const index = toText(text).indexOf(toText(needle), toNumber(start) - 1); if (index < 0) throw error("#VALUE!"); return index + 1; },
  SUBSTITUTE: ([text, from, to]) => toText(text).split(toText(from)).join(toText(to)),
  CONCAT: (args) => args.flat().map(toText).join(""),
  CONCATENATE: (args) => args.flat().map(toText).join(""),
  TEXTJOIN: ([separator, ignoreEmpty, ...rest]) => rest.flat().filter(value => !(toBool(ignoreEmpty) && isBlank(value))).map(toText).join(toText(separator)),
  VALUE: ([value]) => toNumber(value),
  N: ([value]) => (typeof value === "number" ? value : typeof value === "boolean" ? Number(value) : 0),
  TEXT: ([value, pattern]) => { const n = toNumber(value); const format = toText(pattern); if (format.endsWith("%")) { const decimals = (format.split(".")[1] ?? "").replace(/%/g, "").length; return `${(n * 100).toFixed(decimals)}%`; } const decimals = (format.split(".")[1] ?? "").length; const fixed = Math.abs(n).toFixed(decimals); const [whole, fraction] = fixed.split("."); const grouped = format.includes(",") ? whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",") : whole; return `${n < 0 ? "-" : ""}${grouped}${fraction !== undefined ? `.${fraction}` : ""}`; },
};
export const FUNCTION_NAMES = Object.keys(FUNCTIONS);

// ---------- sheet ----------
export function createSheet(initial = {}) {
  const raw = new Map();
  const cache = new Map();
  const visiting = new Set();
  const literalValue = (text) => {
    if (text === "") return "";
    if (/^(true|false)$/i.test(text)) return /^true$/i.test(text);
    if (/^-?\d*\.?\d+(e[+-]?\d+)?$/i.test(text.trim())) return Number(text);
    if (/^-?\d*\.?\d+%$/.test(text.trim())) return Number(text.trim().slice(0, -1)) / 100;
    return text;
  };
  function valueOf(ref) {
    const key = ref.toUpperCase();
    if (cache.has(key)) return cache.get(key);
    if (visiting.has(key)) return "#CIRC!";
    const text = raw.get(key) ?? "";
    let value;
    if (text.startsWith("=")) { visiting.add(key); try { value = evaluate(text.slice(1)); } catch (caught) { value = isError(caught) ? caught : "#VALUE!"; } finally { visiting.delete(key); } }
    else value = literalValue(text);
    cache.set(key, value);
    return value;
  }
  function evaluate(expression) {
    const ast = parse(tokenize(expression));
    const node = (item, widths) => {
      switch (item.type) {
        case "literal": return item.value;
        case "ref": { const value = valueOf(item.ref); if (value === "#CIRC!") throw error("#CIRC!"); return value; }
        case "range": { const from = parseRef(item.a), to = parseRef(item.b); widths?.push(Math.abs(to.col - from.col) + 1); return rangeCells(item.a, item.b).map(ref => { const value = valueOf(ref); if (value === "#CIRC!") throw error("#CIRC!"); return value; }); }
        case "unary": { const value = node(item.operand); if (Array.isArray(value)) throw error("#VALUE!"); if (isError(value)) throw value; return item.op === "-" ? -toNumber(value) : toNumber(value); }
        case "binary": {
          const left = node(item.left), right = node(item.right);
          if (Array.isArray(left) || Array.isArray(right)) throw error("#VALUE!");
          if (isError(left)) throw left; if (isError(right)) throw right;
          switch (item.op) {
            case "+": return toNumber(left) + toNumber(right);
            case "-": return toNumber(left) - toNumber(right);
            case "*": return toNumber(left) * toNumber(right);
            case "/": { const divisor = toNumber(right); if (divisor === 0) throw error("#DIV/0!"); return toNumber(left) / divisor; }
            case "^": return toNumber(left) ** toNumber(right);
            case "&": return toText(left) + toText(right);
            case "=": return compare(left, right) === 0;
            case "<>": return compare(left, right) !== 0;
            case "<": return compare(left, right) < 0;
            case ">": return compare(left, right) > 0;
            case "<=": return compare(left, right) <= 0;
            case ">=": return compare(left, right) >= 0;
            default: throw error("#VALUE!");
          }
        }
        case "call": {
          const fn = FUNCTIONS[item.name];
          if (!fn) throw error("#NAME?");
          // Each argument records the width of the range it produced (INDEX and VLOOKUP need the table shape).
          // Error-tolerant functions receive an error value instead of the throw, like real spreadsheets.
          const tolerant = ["IFERROR", "ISERROR", "IF", "IFS", "AND", "OR", "ISBLANK", "COUNTA", "COUNTBLANK"].includes(item.name);
          const argWidths = [];
          const args = item.args.map(arg => { const local = []; try { const value = node(arg, local); argWidths.push(local[0] ?? 1); return value; } catch (caught) { if (tolerant && isError(caught)) { argWidths.push(1); return caught; } throw caught; } });
          if (!tolerant) for (const arg of args) { if (isError(arg)) throw arg; if (Array.isArray(arg)) for (const value of arg) if (isError(value)) throw value; }
          else if (["IF", "IFS", "AND", "OR"].includes(item.name)) { const first = item.name === "IF" || item.name === "IFS" ? [args[0]] : args.flat(); for (const value of first) if (isError(value)) throw value; }
          const result = fn(args, { width: (index) => argWidths[index] ?? 1 });
          if (typeof result === "number" && !Number.isFinite(result)) throw error("#NUM!");
          return result;
        }
        default: throw error("#VALUE!");
      }
    };
    const result = node(ast);
    if (Array.isArray(result)) return result.length === 1 ? result[0] : "#VALUE!";
    return result;
  }
  const sheet = {
    get(ref) { return raw.get(ref.toUpperCase()) ?? ""; },
    set(ref, text) { const key = ref.toUpperCase(); if (text === "" || text === null || text === undefined) raw.delete(key); else raw.set(key, String(text)); cache.clear(); },
    value: valueOf,
    display(ref) { const value = valueOf(ref); return typeof value === "number" ? formatNumber(value) : toText(value); },
    isFormula(ref) { return (raw.get(ref.toUpperCase()) ?? "").startsWith("="); },
    formula(ref) { const text = raw.get(ref.toUpperCase()) ?? ""; return text.startsWith("=") ? text : null; },
    refs() { return [...raw.keys()]; },
    snapshot() { return Object.fromEntries(raw); },
    load(entries) { raw.clear(); for (const [ref, text] of Object.entries(entries ?? {})) if (text !== "" && text !== null && text !== undefined) raw.set(ref.toUpperCase(), String(text)); cache.clear(); },
    evaluate(expression) { try { return evaluate(String(expression).replace(/^=/, "")); } catch (caught) { return isError(caught) ? caught : "#VALUE!"; } },
  };
  sheet.load(initial);
  return sheet;
}

// Task-check helpers: formula uses one of the named functions, references cells (not only typed constants).
export const formulaUses = (formula, names) => { if (!formula) return false; const upper = formula.toUpperCase(); return names.some(name => new RegExp(`\\b${name}\\s*\\(`).test(upper)); };
export const formulaReferencesCells = (formula) => Boolean(formula) && /\$?[A-Z]{1,2}\$?\d{1,4}/i.test(String(formula).replace(/"[^"]*"/g, ""));
export const approx = (a, b, tolerance = 0.005) => typeof a === "number" && Math.abs(a - b) <= tolerance;
