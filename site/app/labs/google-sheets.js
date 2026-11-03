// Google Sheets bridge for labs: with the founder's Google OAuth client ID configured, a learner signs in with
// their own Google account, Rolevia creates the lab workbook in THEIR Drive (Sheets API), and "Check my sheet"
// reads the cells back so the same task checks run against their real Google Sheet. Nothing is stored by Rolevia.
const TOKEN_KEY = "rolevia.google.sheets.token.v1";
const NONCE_KEY = "rolevia.google.sheets.nonce.v1";
const SCOPES = ["https://www.googleapis.com/auth/spreadsheets", "https://www.googleapis.com/auth/drive.file"];

export const sheetsConfigured = (config) => Boolean(config?.googleClientId);
const randomNonce = () => Array.from(crypto.getRandomValues(new Uint8Array(16)), byte => byte.toString(16).padStart(2, "0")).join("");

export function sheetsAuthUrl({ clientId, labId }) {
  const nonce = randomNonce();
  sessionStorage.setItem(NONCE_KEY, nonce);
  const params = new URLSearchParams({ client_id: clientId, redirect_uri: `${location.origin}${location.pathname}`, response_type: "token", scope: SCOPES.join(" "), include_granted_scopes: "true", prompt: "consent", state: `sheets:${nonce}:${labId}` });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
}
// Called at boot for `#access_token=...&state=sheets:<nonce>:<labId>`; returns the lab id to resume, or null.
export function consumeSheetsRedirect() {
  if (!/^#(.*&)?access_token=/.test(location.hash)) return null;
  const params = new URLSearchParams(location.hash.slice(1));
  const [kind, nonce = "", labId = ""] = (params.get("state") ?? "").split(":");
  if (kind !== "sheets") return null;
  const expected = sessionStorage.getItem(NONCE_KEY);
  sessionStorage.removeItem(NONCE_KEY);
  const token = params.get("access_token");
  const valid = Boolean(token) && Boolean(expected) && nonce === expected && /^[\w-]+$/.test(labId);
  if (valid) sessionStorage.setItem(TOKEN_KEY, JSON.stringify({ token, expiresAt: Date.now() + Number(params.get("expires_in") ?? 3600) * 1000 }));
  history.replaceState(null, "", `${location.pathname}${location.search}${valid ? `#/portal/labs/${labId}?google=1` : "#/portal/labs"}`);
  return valid ? labId : null;
}
export function sheetsToken() {
  try { const saved = JSON.parse(sessionStorage.getItem(TOKEN_KEY)); return saved && saved.expiresAt > Date.now() + 30_000 ? saved.token : null; } catch { return null; }
}
export const forgetSheetsToken = () => sessionStorage.removeItem(TOKEN_KEY);

const authHeaders = (token) => ({ Authorization: `Bearer ${token}`, "Content-Type": "application/json" });
const fail = async (response, action) => { let detail = ""; try { detail = (await response.json()).error?.message ?? ""; } catch { /* no body */ } throw new Error(`Google Sheets ${action} failed (${response.status})${detail ? `: ${detail}` : ""}.`); };

// Creates a spreadsheet in the learner's Drive from a cell map ({ A1: "Region", B2: "900" }) and returns its id and URL.
export async function createLabSpreadsheet({ token, title, cells, fetchImpl = globalThis.fetch }) {
  const rows = [];
  for (const [ref, text] of Object.entries(cells)) {
    const match = /^([A-Z]{1,2})(\d+)$/.exec(ref.toUpperCase());
    if (!match) continue;
    const col = match[1].split("").reduce((sum, letter) => sum * 26 + letter.charCodeAt(0) - 64, 0) - 1;
    const row = Number(match[2]) - 1;
    rows[row] ??= [];
    rows[row][col] = String(text);
  }
  const rowData = Array.from({ length: rows.length }, (_, r) => ({ values: Array.from({ length: Math.max(0, ...rows.map(cells => cells?.length ?? 0)) }, (_, c) => { const text = rows[r]?.[c]; if (text === undefined) return {}; const numeric = /^-?\d*\.?\d+$/.test(text); return { userEnteredValue: text.startsWith("=") ? { formulaValue: text } : numeric ? { numberValue: Number(text) } : { stringValue: text } }; }) }));
  const response = await fetchImpl("https://sheets.googleapis.com/v4/spreadsheets", { method: "POST", headers: authHeaders(token), body: JSON.stringify({ properties: { title }, sheets: [{ properties: { title: "Lab", gridProperties: { frozenRowCount: 1 } }, data: [{ startRow: 0, startColumn: 0, rowData }] }] }) });
  if (!response.ok) await fail(response, "workbook creation");
  const body = await response.json();
  return { spreadsheetId: body.spreadsheetId, url: body.spreadsheetUrl ?? `https://docs.google.com/spreadsheets/d/${body.spreadsheetId}/edit` };
}

// Reads a rectangular range twice (values and formulas) and returns a cell map compatible with the lab checks.
export async function readLabSpreadsheet({ token, spreadsheetId, range = "Lab!A1:K40", fetchImpl = globalThis.fetch }) {
  const base = `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(spreadsheetId)}/values/${encodeURIComponent(range)}`;
  const [values, formulas] = await Promise.all([
    fetchImpl(`${base}?valueRenderOption=UNFORMATTED_VALUE`, { headers: authHeaders(token) }),
    fetchImpl(`${base}?valueRenderOption=FORMULA`, { headers: authHeaders(token) }),
  ]);
  if (!values.ok) await fail(values, "read");
  if (!formulas.ok) await fail(formulas, "formula read");
  const valueRows = (await values.json()).values ?? [];
  const formulaRows = (await formulas.json()).values ?? [];
  const col = (index) => { let out = ""; let n = index + 1; while (n > 0) { const rem = (n - 1) % 26; out = String.fromCharCode(65 + rem) + out; n = Math.floor((n - 1) / 26); } return out; };
  const cells = {};
  valueRows.forEach((row, r) => row.forEach((value, c) => { if (value === "" || value === null || value === undefined) return; const formula = formulaRows[r]?.[c]; cells[`${col(c)}${r + 1}`] = { value, formula: typeof formula === "string" && formula.startsWith("=") ? formula : null }; }));
  return cells;
}
