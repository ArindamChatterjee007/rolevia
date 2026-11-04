// AI workbench lab (Business AI module). Rolevia is the front end; the model is the learner's own.
// The brief runs on the assistant the learner connected in their profile (site/app/ai/providers.js), or the
// learner pastes a reply from any assistant.
// The scored skills are the ones the module teaches: a complete brief and line-by-line verification.
import { h, icon, toast, busy } from "../ui.js";
import { ctx } from "../context.js";
import { getAiConfig, aiReady, chat } from "../ai/providers.js";

const BRIEF_FIELDS = [
  ["role", "Role for the assistant", "You are an operations analyst helping a small retail business…", /\b(you are|act as|as a|role)\b/i],
  ["goal", "Goal (one sentence, with the decision it supports)", "Summarise last month's sales by region so the owner can decide where to add stock.", /\b(so that|so the|decide|decision|because|in order to)\b/i],
  ["context", "Context and data (fictional only, never confidential)", "Eight orders from Kiran Stationery, two regions, sales in INR excluding tax…", /\d/],
  ["constraints", "Constraints", "Use only the data given; say \"unknown\" when a figure is missing; INR, no currency conversion.", /\b(only|do not|don't|never|must|unknown|limit)\b/i],
  ["format", "Output format", "A table with Region, Orders, Sales (INR) and one paragraph of three sentences.", /\b(table|list|bullet|paragraph|json|columns?|rows?|sentences?|words?)\b/i],
  ["acceptance", "Acceptance criteria (how you will check the answer)", "Totals must match my SUM; every claim must point to a row; no figure may be invented.", /\b(match|check|verify|source|cite|evidence|must|equal|reconcile)\b/i],
];
const SAMPLE_DATA = "Kiran Stationery orders (fictional): K01 North N1 900; K02 South N2 1500; K03 North N2 2100; K04 South N1 500; K05 North N1 1200; K06 South N2 1800; K07 North N2 2400; K08 South N1 700. Sales in INR excluding tax. True totals: North 6,600 (4 orders), South 4,500 (4 orders), all 11,100.";

export function scoreBrief(values) {
  const checks = BRIEF_FIELDS.map(([key, label, , pattern]) => { const text = String(values[key] ?? "").trim(); const present = text.length >= 12; const specific = present && pattern.test(text); return { key, label, present, specific }; });
  const points = checks.reduce((sum, item) => sum + (item.present ? 4 : 0) + (item.specific ? 3 : 0), 0); // max 42
  const privacyOk = !/\b(password|aadhaar|pan\s*card|salary of|phone number|account number)\b/i.test(Object.values(values).join(" "));
  return { checks, score: Math.min(40, Math.round((points / 42) * 40)) + (privacyOk ? 0 : -10), privacyOk };
}
export function composePrompt(values) {
  return BRIEF_FIELDS.map(([key, label]) => `${label.split(" (")[0]}: ${String(values[key] ?? "").trim()}`).join("\n\n");
}
// Verification scoring: the learner marks each line of the reply as supported, unsupported or needs-evidence.
// Lines containing numbers must have a decision; unsupported claims must be flagged; a verification note is required.
export function scoreVerification(lines, marks, note) {
  const numeric = lines.map((line, index) => ({ index, hasNumber: /\d/.test(line), mark: marks[index] ?? null }));
  const decided = numeric.filter(item => item.mark).length;
  const numericDecided = numeric.filter(item => item.hasNumber).every(item => item.mark);
  const flaggedAny = numeric.some(item => item.mark === "unsupported" || item.mark === "evidence");
  const noteOk = String(note ?? "").trim().length >= 40 && /\b(sum|total|row|source|check|recalculat|match|compare)/i.test(note);
  let score = 0;
  if (lines.length) score += Math.round((decided / lines.length) * 15);
  if (numericDecided && lines.length) score += 10;
  if (flaggedAny) score += 5;
  if (noteOk) score += 10;
  return { score: Math.min(40, score), decided, total: lines.length, numericDecided, flaggedAny, noteOk };
}
const splitLines = (text) => String(text ?? "").split(/\n+/).map(line => line.trim()).filter(line => line.length > 2).slice(0, 24);

export function aiLab(onComplete) {
  const root = h("div", { class: "ai-lab" });
  const values = {};
  const state = { reply: "", marks: {}, note: "", ran: false, provider: aiReady(getAiConfig(), ctx.config) ? "assistant" : "paste" };
  let best = 0;
  const briefScore = h("div", { class: "ai-score" });
  const replyBox = h("textarea", { class: "input", rows: 10, placeholder: "The assistant's reply appears here (or paste it).", "aria-label": "Assistant reply", onInput: (event) => { state.reply = event.target.value; renderVerify(); } });
  const verifyHost = h("div", { class: "stack" });
  const total = h("div", { class: "ai-total" });

  const report = () => {
    const brief = scoreBrief(values);
    const verification = scoreVerification(splitLines(state.reply), state.marks, state.note);
    const runPoints = state.reply.trim().length > 40 ? 20 : 0;
    const score = Math.max(0, Math.min(100, brief.score + runPoints + verification.score));
    total.replaceChildren(h("strong", {}, `${score} / 100`), h("span", { class: "tiny muted" }, ` · brief ${Math.max(0, brief.score)}/40 · run ${runPoints}/20 · verification ${verification.score}/40`), h("div", { class: "bar" }, h("div", { class: "bar-fill", style: { width: `${score}%` } })));
    if (score > best && (runPoints > 0 || brief.score >= 30)) { best = score; onComplete(score); }
    return { brief, verification, score };
  };

  // Step 1: brief builder
  const fields = BRIEF_FIELDS.map(([key, label, placeholder]) => h("label", { class: "field" }, h("span", { class: "field-label" }, label), h("textarea", { class: "input", rows: 2, placeholder, "data-field": key, onInput: (event) => { values[key] = event.target.value; renderBrief(); } })));
  const renderBrief = () => {
    const result = scoreBrief(values);
    briefScore.replaceChildren(...[h("ul", { class: "ticks compact" }, result.checks.map(item => h("li", { class: item.specific ? "ok" : item.present ? "half" : "miss" }, icon(item.specific ? "check" : "info", 12), `${item.label.split(" (")[0]}: ${item.specific ? "specific" : item.present ? "present, make it checkable" : "missing"}`))), result.privacyOk ? null : h("p", { class: "alert error" }, "Never put passwords, ID numbers, salaries or phone numbers into a brief.")].filter(Boolean));
    report();
  };
  const useSample = h("button", { class: "link-button", type: "button", onClick: () => { values.context = SAMPLE_DATA; root.querySelector('[data-field="context"]').value = SAMPLE_DATA; renderBrief(); } }, "Insert the fictional sample data");
  const promptPreview = h("pre", { class: "ai-prompt", "aria-label": "Composed prompt" });
  const copyPrompt = h("button", { class: "button ghost small", type: "button", onClick: async () => { const text = composePrompt(values); promptPreview.textContent = text; try { await navigator.clipboard.writeText(text); toast("Brief copied. Paste it into your assistant, then paste the reply below.", "success"); } catch { toast("Select the brief and copy it manually.", "info"); } } }, icon("clipboard", 14), "Copy the brief");

  // Step 2: run with the learner's connected assistant (set up once in the profile); paste is the fallback.
  const providerBox = h("div", { class: "stack" });
  const renderProvider = () => {
    const ready = aiReady(getAiConfig(), ctx.config);
    const tabs = h("div", { class: "chip-row" }, [["assistant", ready ? "Run with my assistant" : "My assistant (not connected)"], ["paste", "Paste a reply"]].map(([key, label]) => h("button", { type: "button", class: `chip ${state.provider === key ? "on" : ""}`, onClick: () => { state.provider = key; renderProvider(); } }, label)));
    let body;
    if (state.provider === "paste") body = h("p", { class: "small muted" }, "Copy the brief, run it in the assistant you use, then paste the full reply below. Nothing is sent anywhere by Rolevia.");
    else if (!ready) body = h("div", { class: "alert info" }, icon("info", 16), h("span", {}, "Connect your AI assistant once in ", h("a", { href: "#/portal/profile#ai" }, "Profile & security"), " and this lab runs the brief for you on your own account. Until then, paste the reply."));
    else body = h("div", { class: "form-actions start" }, h("button", { class: "button primary small", type: "button", onClick: async (event) => {
      if (scoreBrief(values).score < 20) { toast("Complete the brief first: the assistant needs the goal, context and acceptance criteria.", "info"); return; }
      busy(event.currentTarget, true, "Running");
      try { state.reply = await chat({ system: "You are a careful business assistant. Follow the brief exactly; when data is missing say unknown rather than inventing a figure.", messages: [{ role: "user", content: composePrompt(values) }], temperature: 0.2, maxTokens: 700 }); state.ran = true; replyBox.value = state.reply; renderVerify(); toast("Reply received. Now verify it line by line.", "success"); }
      catch (error) { toast(error.message, "error", 9000); }
      finally { busy(event.currentTarget, false, "Run the brief"); }
    } }, icon("bolt", 14), "Run the brief"), h("span", { class: "tiny muted" }, "Uses your connected assistant; usage is billed to your account."));
    providerBox.replaceChildren(tabs, body);
  };

  // Step 3: verify
  const renderVerify = () => {
    const lines = splitLines(state.reply);
    if (!lines.length) { verifyHost.replaceChildren(h("p", { class: "muted small" }, "Paste or receive a reply above, then mark each line: supported by the data, unsupported, or needs evidence.")); report(); return; }
    const noteBox = h("textarea", { class: "input", rows: 3, placeholder: "How you checked: e.g. recalculated the totals with SUM, compared each regional figure with the rows, the South count was wrong…", value: state.note, onInput: (event) => { state.note = event.target.value; report(); } });
    verifyHost.replaceChildren(
      h("p", { class: "small muted" }, "Every line with a number needs a decision. The assistant can be fluent and wrong; your job is the evidence."),
      h("ol", { class: "verify-lines" }, lines.map((line, index) => h("li", { class: state.marks[index] ?? "" }, h("span", { class: "verify-text" }, line), h("div", { class: "verify-marks" }, [["supported", "Supported"], ["unsupported", "Unsupported"], ["evidence", "Needs evidence"]].map(([mark, label]) => h("button", { type: "button", class: `mini ${state.marks[index] === mark ? "on" : ""}`, onClick: () => { state.marks[index] = mark; renderVerify(); } }, label)))))),
      h("label", { class: "field" }, h("span", { class: "field-label" }, "Verification note"), noteBox));
    report();
  };

  root.append(
    h("p", { class: "lab-brief" }, "Three steps: write a complete brief, run it with your own assistant, then verify the reply line by line. Points reward the brief and the verification, not the assistant's prose."),
    h("section", { class: "lab-step" }, h("h4", {}, h("span", { class: "step-num" }, "1"), "Write the brief"), h("div", { class: "form-grid two" }, fields), useSample, briefScore, h("div", { class: "form-actions start" }, copyPrompt), promptPreview),
    h("section", { class: "lab-step" }, h("h4", {}, h("span", { class: "step-num" }, "2"), "Run it with your assistant"), providerBox, replyBox),
    h("section", { class: "lab-step" }, h("h4", {}, h("span", { class: "step-num" }, "3"), "Verify the reply"), verifyHost),
    total);
  renderBrief(); renderProvider(); renderVerify();
  return root;
}
