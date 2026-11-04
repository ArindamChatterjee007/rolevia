// AI assistant settings card (profile and admin account) and the practice coach used across modules.
import { h, icon, toast, busy, modal } from "../ui.js";
import { ctx } from "../context.js";
import { PROVIDERS, getAiConfig, saveAiConfig, forgetAiConfig, aiReady, aiKind, hasLocalAssistant, chat, testConnection, extractJson, openAssistant, endLocalConversation } from "./providers.js";

export function aiSettingsCard({ compact = false } = {}) {
  const host = h("div", { class: "card ai-settings" });
  const render = () => {
    const saved = getAiConfig();
    const localOk = hasLocalAssistant();
    let provider = saved?.provider ?? "chatgpt-web";
    if (provider === "builtin" && !localOk) provider = "chatgpt-web";
    const status = h("div");
    const keyInput = h("input", { class: "input", type: "password", autocomplete: "off", spellcheck: false, value: saved?.key ?? "", "aria-label": "API key" });
    const modelInput = h("input", { class: "input", value: saved?.model || PROVIDERS[provider].defaultModel || "", "aria-label": "Model", spellcheck: false });
    const baseInput = h("input", { class: "input", value: saved?.baseUrl ?? "", placeholder: "https://api.example.com/v1", "aria-label": "Base URL", spellcheck: false });
    const help = h("p", { class: "small muted" });
    const keyField = h("label", { class: "field" }, h("span", { class: "field-label" }, "API key (kept in this browser only)"), keyInput);
    const modelField = h("label", { class: "field" }, h("span", { class: "field-label" }, "Model"), modelInput);
    const baseField = h("label", { class: "field" }, h("span", { class: "field-label" }, "Base URL"), baseInput);
    const keyLink = h("a", { class: "link-button", target: "_blank", rel: "noopener noreferrer" }, "Get a key");
    const option = (key) => h("option", { value: key, selected: key === provider }, PROVIDERS[key].label);
    const select = h("select", { class: "input", "aria-label": "AI assistant", onChange: () => { provider = select.value; if (!saved || saved.provider !== provider) modelInput.value = PROVIDERS[provider].defaultModel ?? ""; paint(); } },
      h("optgroup", { label: "No key needed" }, ["chatgpt-web", "gemini-web", ...(localOk ? ["builtin"] : []), "other-web"].map(option)),
      h("optgroup", { label: "Advanced: your own API key" }, ["gemini", "openai", "compatible"].map(option)));
    const save = h("button", { class: "button primary small", type: "button" });
    const selectField = h("label", { class: "field" }, h("span", { class: "field-label" }, "Assistant"), select);
    const paint = () => {
      const info = PROVIDERS[provider];
      help.textContent = info.help;
      selectField.classList.toggle("span-2", info.kind !== "api");
      keyField.hidden = info.kind !== "api"; modelField.hidden = info.kind !== "api"; baseField.hidden = provider !== "compatible";
      keyInput.placeholder = info.keyPlaceholder ?? "";
      if (info.keyUrl) { keyLink.href = info.keyUrl; keyLink.hidden = false; } else keyLink.hidden = true;
      save.replaceChildren(icon("check", 14), info.kind === "handoff" ? "Save" : "Save and test");
      status.replaceChildren();
    };
    paint();
    save.addEventListener("click", async (event) => {
      const info = PROVIDERS[provider];
      busy(event.currentTarget, true, info.kind === "handoff" ? "Saving" : "Checking");
      try {
        const config = saveAiConfig({ provider, key: keyInput.value, model: modelInput.value, baseUrl: baseInput.value });
        if (info.kind === "handoff") toast(info.url ? `Saved. Rolevia will open ${info.short} with each practice ready; your account, your plan.` : "Saved. Rolevia will copy each practice prompt for you to paste.", "success", 6000);
        else if (info.kind === "local") {
          const progress = h("div", { class: "alert info" }, icon("info", 16), h("span", {}, "Preparing the built-in assistant…"));
          status.replaceChildren(progress);
          await testConnection(config, undefined, (loaded) => { progress.lastChild.textContent = loaded < 1 ? `Downloading the built-in assistant… ${Math.round(loaded * 100)}% (a few GB, once; keep this tab open)` : "Starting the built-in assistant…"; });
          toast("Ready. The built-in assistant runs on this computer, with no account.", "success");
        } else { await testConnection(config); toast("Connected. Your AI assistant is ready across Rolevia.", "success"); }
        render();
      } catch (error) { status.replaceChildren(h("div", { class: "alert error" }, icon("info", 16), h("span", {}, error.message))); busy(event.currentTarget, false, info.kind === "handoff" ? "Save" : "Save and test"); }
    });
    const forget = saved ? h("button", { class: "link-button danger", type: "button", onClick: () => { forgetAiConfig(); toast("AI assistant choice removed from this browser.", "info"); render(); } }, "Remove") : null;
    const ready = saved ? aiReady(saved) : false;
    host.replaceChildren(
      h("div", { class: "card-head" }, h("h3", {}, icon("spark", 18), "Your AI assistant"), saved ? h("span", { class: `tag ${ready ? "good" : "pending"}` }, ready ? `Ready · ${PROVIDERS[saved.provider].label}` : "Saved · not available in this browser") : h("span", { class: "tag" }, "Not chosen yet")),
      compact ? null : h("p", { class: "small muted" }, "Choose the assistant you already use. Rolevia prepares every practice, mock interview and lab brief for it; you sign in to your own ChatGPT or Gemini as usual and usage counts against your own plan. No API key is needed and Rolevia never sees your conversations."),
      h("div", { class: "form-grid two" }, selectField, modelField, keyField, baseField),
      h("div", { class: "form-actions start" }, help, keyLink), status,
      compact ? null : h("p", { class: "tiny muted" }, "ChatGPT inside Rolevia pages without a tab switch needs OpenAI's partner approval; until then the hand-off above is the route."),
      h("div", { class: "form-actions between" }, forget ?? h("span"), save));
  };
  render();
  return host;
}

// Builds the coach's instructions from the module's own material so questions stay on topic.
// compact: a shorter version that fits a URL for the hand-off to the learner's own ChatGPT or Gemini.
export function coachSystemPrompt({ module, course, mode = "practice", bank = null, compact = false }) {
  const lessons = (course?.weeks ?? []).flatMap(week => week.lessons);
  const clip = (value, max) => compact && String(value).length > max ? `${String(value).slice(0, max - 1).trimEnd()}…` : String(value);
  const checkpoints = lessons.flatMap(lesson => lesson.checkpoint.map(item => `Q: ${item.question}\nA: ${clip(item.answer, 160)}`)).slice(0, compact ? 6 : 24);
  const glossary = (course?.glossary ?? []).slice(0, compact ? 5 : Infinity).map(item => `${item.term}: ${clip(item.definition, 120)}`).join("\n");
  const interview = (course?.interview?.questions ?? bank?.questions ?? []).slice(0, compact ? 4 : 16).map(item => compact ? `Q: ${item.question}` : `Q: ${item.question}\nGuide: ${(item.answerGuide ?? []).join(" | ")}`);
  const scope = module ? `the Rolevia skill module "${module.title}" (tool: ${module.tool}). Outcomes: ${(module.outcomes ?? []).join("; ")}.` : "interview preparation for entry-level business roles.";
  return [
    `You are the Rolevia practice coach for ${scope} You speak British English, plainly and warmly, without emojis or em dashes.`,
    `Your job: run a practice drill. Ask ONE question at a time, wait for the learner's answer, then (1) say whether it is right, partly right or wrong, (2) give brief feedback that teaches the missing point using the reference material, (3) give a score from 1 to 5, and (4) ask the next question. Never reveal a model answer before the learner has tried. Vary question types: concept checks, small calculations from the reference figures, scenario decisions and interview-style questions.`,
    mode === "interview" ? "Act as a fair interviewer for an entry-level business role: ask the question, then evaluate the answer with the STAR structure in mind." : "Keep questions inside this module's material; if the learner asks something off-topic, answer in one line and return to practice.",
    "Never promise jobs, interviews or salaries. Never state anything about Rolevia's batches, fees or policies. If you are unsure of a fact, say so. Use fictional businesses only.",
    compact ? "After 8 questions, give a short summary: total score, two strengths, two things to revise." : "",
    checkpoints.length ? `REFERENCE QUESTIONS AND ANSWERS:\n${checkpoints.join("\n\n")}` : "",
    interview.length ? `${compact ? "INTERVIEW QUESTIONS" : "INTERVIEW QUESTIONS WITH ANSWER GUIDES"}:\n${interview.join("\n\n")}` : "",
    glossary ? `GLOSSARY:\n${glossary}` : "",
  ].filter(Boolean).join("\n\n");
}
// The prompt pasted or typed into the learner's own assistant: compact instructions plus the opening move.
export const handoffPrompt = (promptArgs) => `${coachSystemPrompt({ ...promptArgs, compact: true })}\n\nBegin now: greet me in one line and ask question 1.`;

const setupCard = () => h("div", { class: "card coach-setup" }, h("h3", {}, icon("spark", 18), "Practice with your AI coach"), h("p", { class: "small muted" }, "Choose the assistant you already use, ChatGPT or Gemini, and the coach will quiz you on this material, check your answers and keep going. No API key is needed."), h("a", { class: "button primary small", href: ctx.auth.type === "admin" ? "#/admin/account" : "#/portal/profile?focus=ai" }, icon("spark", 14), "Choose your AI assistant"));

// Hand-off drill: Rolevia prepares the prompt and opens the learner's own assistant in a new tab.
function handoffPanel({ prompt, config, intro, opener }) {
  const info = PROVIDERS[config.provider];
  const note = h("p", { class: "small muted", hidden: true });
  const openButton = h("button", { class: "button primary", type: "button", onClick: async () => {
    const result = await openAssistant({ prompt, config });
    note.hidden = false;
    note.textContent = result.prefilled ? `${info.short} opened in a new tab with the practice typed in. If it opened empty, paste: the prompt is on your clipboard.` : result.url ? `${info.short} opened in a new tab. Paste the prompt (it is on your clipboard) and send.` : result.copied ? "Prompt copied. Paste it into your assistant and send." : "Copy the prompt below and paste it into your assistant.";
    if (!result.copied && !result.prefilled) preview.hidden = false;
  } }, icon("play", 16), info.url ? `${opener} in ${info.short}` : "Copy the practice prompt");
  const preview = h("pre", { class: "ai-prompt", hidden: true, "aria-label": "Practice prompt" }, prompt);
  const showPrompt = h("button", { class: "link-button", type: "button", onClick: () => { preview.hidden = !preview.hidden; } }, "Show the prompt");
  return h("div", { class: "card coach" }, h("div", { class: "card-head" }, h("h3", {}, icon("spark", 18), "Practice with your AI coach"), h("span", { class: "tiny muted" }, `In your own ${info.short}`)), h("p", { class: "small muted" }, intro), h("ol", { class: "coach-steps" }, h("li", {}, `Open ${info.short}: you are signed in there as usual and the practice is ready.`), h("li", {}, "Answer one question at a time; the coach checks it, teaches the gap and scores you."), h("li", {}, "After eight questions you get a summary of what to revise.")), h("div", { class: "form-actions start" }, openButton, showPrompt), note, preview);
}

// Chat drill UI: in-page for the built-in assistant and API keys, hand-off for ChatGPT and Gemini accounts.
export function coachPanel({ system, promptArgs = null, opener = "Start practice", intro = "Your AI coach asks one question at a time, checks your answer and moves on. Answer in your own words." }) {
  const config = getAiConfig();
  if (!aiReady(config)) return setupCard();
  if (aiKind(config) === "handoff") return handoffPanel({ prompt: promptArgs ? handoffPrompt(promptArgs) : `${system}\n\nBegin now with your first question.`, config, intro, opener });
  // The on-device model has a small context window, so it gets the compact instructions.
  const instructions = aiKind(config) === "local" && promptArgs ? coachSystemPrompt({ ...promptArgs, compact: true }) : system;
  const messages = [];
  const conversation = `coach-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const log = h("div", { class: "coach-log", "aria-live": "polite" });
  const input = h("textarea", { class: "input", rows: 2, placeholder: "Type your answer…", "aria-label": "Your answer" });
  const send = h("button", { class: "button primary small", type: "button" }, icon("arrow", 14), "Send");
  const start = h("button", { class: "button primary", type: "button" }, icon("play", 16), opener);
  const composer = h("div", { class: "coach-composer", hidden: true }, input, send);
  const bubble = (role, content) => h("div", { class: `coach-msg ${role}` }, h("span", { class: "coach-who" }, role === "assistant" ? "Coach" : "You"), h("div", { class: "coach-text" }, content));
  const thinking = () => h("div", { class: "coach-msg assistant thinking" }, h("span", { class: "coach-who" }, "Coach"), h("div", { class: "coach-text" }, h("span", { class: "spinner" }), h("span", { class: "coach-wait" }, " thinking…")));
  const ask = async (userText) => {
    if (userText) { messages.push({ role: "user", content: userText }); log.append(bubble("user", userText)); }
    // The opening move stays in the transcript (unshown) so every provider sees one consistent history.
    else if (!messages.length) messages.push({ role: "user", content: "Begin the practice drill with your first question." });
    const pending = thinking(); log.append(pending); log.scrollTop = log.scrollHeight;
    send.disabled = true; input.disabled = true;
    try {
      const reply = await chat({ system: instructions, messages, temperature: 0.4, maxTokens: 500, conversation, onProgress: (loaded) => { pending.querySelector(".coach-wait").textContent = loaded < 1 ? ` downloading the built-in assistant… ${Math.round(loaded * 100)}%` : " starting…"; } });
      messages.push({ role: "assistant", content: reply });
      pending.replaceWith(bubble("assistant", reply));
    } catch (error) { pending.replaceWith(h("div", { class: "alert error" }, icon("info", 16), h("span", {}, error.message))); }
    finally { send.disabled = false; input.disabled = false; input.focus(); log.scrollTop = log.scrollHeight; }
  };
  start.addEventListener("click", () => { start.hidden = true; composer.hidden = false; ask(null); });
  send.addEventListener("click", () => { const value = input.value.trim(); if (!value) return; input.value = ""; ask(value); });
  input.addEventListener("keydown", (event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); send.click(); } });
  window.addEventListener("hashchange", () => endLocalConversation(conversation), { once: true });
  return h("div", { class: "card coach" }, h("div", { class: "card-head" }, h("h3", {}, icon("spark", 18), "Practice with your AI coach"), h("span", { class: "tiny muted" }, aiKind(config) === "local" ? "Runs on this computer" : "Runs on your own assistant")), h("p", { class: "small muted" }, intro), log, composer, start);
}

// Admin side: a review draft (scores + feedback) from the admin's own assistant; the admin edits and saves.
export const REVIEW_DRAFT_SYSTEM = "You are an assessor for a business-skills studio. Score each task strictly against its rubric or evidence requirement, as a whole number from 0 to the stated maximum, and write feedback the learner can act on: what was strong, what was missing against the rubric, one concrete improvement. Use British English, no emojis, no em dashes. Reply ONLY with JSON of the form {\"scores\": {\"<taskId>\": <points>}, \"feedback\": \"<2-4 sentences>\"}.";
export const reviewDraftPrompt = (pack, items) => `${pack}\n\nTask ids and maximums: ${items.map(item => `${item.taskId} (max ${item.maxPoints})`).join(", ")}`;
export function parseReviewDraft(reply) {
  const parsed = extractJson(reply);
  if (!parsed || typeof parsed.scores !== "object" || typeof parsed.feedback !== "string") throw new Error("That is not a usable draft. Expected JSON with scores and feedback; try again or score manually.");
  return parsed;
}
export async function draftLabReview(pack, items) {
  const reply = await chat({ system: REVIEW_DRAFT_SYSTEM, messages: [{ role: "user", content: reviewDraftPrompt(pack, items) }], temperature: 0.2, maxTokens: 400 });
  return parseReviewDraft(reply);
}
