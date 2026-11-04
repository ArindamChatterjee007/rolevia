// AI assistant settings card (profile and admin account) and the practice coach used across modules.
import { h, icon, toast, busy, modal } from "../ui.js";
import { ctx } from "../context.js";
import { PROVIDERS, getAiConfig, saveAiConfig, forgetAiConfig, aiReady, chat, testConnection, extractJson } from "./providers.js";

export function aiSettingsCard({ compact = false } = {}) {
  const host = h("div", { class: "card ai-settings" });
  const render = () => {
    const saved = getAiConfig();
    let provider = saved?.provider ?? "gemini";
    const status = h("div");
    const keyInput = h("input", { class: "input", type: "password", autocomplete: "off", spellcheck: false, value: saved?.key ?? "", "aria-label": "API key" });
    const modelInput = h("input", { class: "input", value: saved?.model ?? PROVIDERS[provider].defaultModel, "aria-label": "Model", spellcheck: false });
    const baseInput = h("input", { class: "input", value: saved?.baseUrl ?? "", placeholder: "https://api.example.com/v1", "aria-label": "Base URL", spellcheck: false });
    const help = h("p", { class: "small muted" });
    const keyField = h("label", { class: "field" }, h("span", { class: "field-label" }, "API key (kept in this browser only)"), keyInput);
    const modelField = h("label", { class: "field" }, h("span", { class: "field-label" }, "Model"), modelInput);
    const baseField = h("label", { class: "field" }, h("span", { class: "field-label" }, "Base URL"), baseInput);
    const keyLink = h("a", { class: "link-button", target: "_blank", rel: "noopener noreferrer" }, "Get a key");
    const select = h("select", { class: "input", "aria-label": "AI provider", onChange: () => { provider = select.value; if (!saved || saved.provider !== provider) { modelInput.value = PROVIDERS[provider].defaultModel; } paint(); } }, Object.entries(PROVIDERS).map(([key, item]) => h("option", { value: key, selected: key === provider }, item.label)));
    const paint = () => {
      const info = PROVIDERS[provider];
      help.textContent = info.keyHelp;
      keyField.hidden = provider === "chatgpt"; modelField.hidden = provider === "chatgpt"; baseField.hidden = provider !== "compatible";
      keyInput.placeholder = info.keyPlaceholder;
      if (info.keyUrl) { keyLink.href = info.keyUrl; keyLink.hidden = false; } else keyLink.hidden = true;
    };
    paint();
    const save = h("button", { class: "button primary small", type: "button", onClick: async (event) => {
      busy(event.currentTarget, true, "Checking");
      try {
        const config = saveAiConfig({ provider, key: keyInput.value, model: modelInput.value, baseUrl: baseInput.value });
        if (provider !== "chatgpt") { await testConnection(config); toast("Connected. Your AI assistant is ready across Rolevia.", "success"); }
        else toast("Saved. Continue with ChatGPT activates once OpenAI approves Rolevia; until then choose Gemini or an API key.", "info", 7000);
        render();
      } catch (error) { status.replaceChildren(h("div", { class: "alert error" }, icon("info", 16), h("span", {}, error.message))); busy(event.currentTarget, false, "Save and test"); }
    } }, icon("check", 14), "Save and test");
    const forget = saved ? h("button", { class: "link-button danger", type: "button", onClick: () => { forgetAiConfig(); toast("AI assistant disconnected from this browser.", "info"); render(); } }, "Disconnect") : null;
    host.replaceChildren(
      h("div", { class: "card-head" }, h("h3", {}, icon("spark", 18), "Your AI assistant"), saved ? h("span", { class: `tag ${aiReady(saved, ctx.config) ? "good" : "pending"}` }, aiReady(saved, ctx.config) ? `Connected · ${PROVIDERS[saved.provider].label}` : "Saved · not active yet") : h("span", { class: "tag" }, "Not connected")),
      compact ? null : h("p", { class: "small muted" }, "Connect the assistant you already use. Practice coaching, the AI workbench and other assistant features then run on your own account: requests go from your browser straight to the provider, usage is billed to you, and Rolevia never sees your key or your conversations."),
      h("div", { class: "form-grid two" }, h("label", { class: "field" }, h("span", { class: "field-label" }, "Provider"), select), modelField, keyField, baseField),
      h("div", { class: "form-actions start" }, help, keyLink), status,
      h("div", { class: "form-actions between" }, forget ?? h("span"), save));
  };
  render();
  return host;
}

// Builds the coach's instructions from the module's own material so questions stay on topic.
export function coachSystemPrompt({ module, course, mode = "practice", bank = null }) {
  const lessons = (course?.weeks ?? []).flatMap(week => week.lessons);
  const checkpoints = lessons.flatMap(lesson => lesson.checkpoint.map(item => `Q: ${item.question}\nA: ${item.answer}`)).slice(0, 24);
  const glossary = (course?.glossary ?? []).map(item => `${item.term}: ${item.definition}`).join("\n");
  const interview = (course?.interview?.questions ?? bank?.questions ?? []).map(item => `Q: ${item.question}\nGuide: ${(item.answerGuide ?? []).join(" | ")}`).slice(0, 16);
  const scope = module ? `the Rolevia skill module "${module.title}" (tool: ${module.tool}). Outcomes: ${(module.outcomes ?? []).join("; ")}.` : "interview preparation for entry-level business roles.";
  return [
    `You are the Rolevia practice coach for ${scope} You speak British English, plainly and warmly, without emojis or em dashes.`,
    `Your job: run a practice drill. Ask ONE question at a time, wait for the learner's answer, then (1) say whether it is right, partly right or wrong, (2) give brief feedback that teaches the missing point using the reference material, (3) give a score from 1 to 5, and (4) ask the next question. Never reveal a model answer before the learner has tried. Vary question types: concept checks, small calculations from the reference figures, scenario decisions and interview-style questions.`,
    mode === "interview" ? "Act as a fair interviewer for an entry-level business role: ask the question, then evaluate the answer with the STAR structure in mind." : "Keep questions inside this module's material; if the learner asks something off-topic, answer in one line and return to practice.",
    "Never promise jobs, interviews or salaries. Never state anything about Rolevia's batches, fees or policies. If you are unsure of a fact, say so. Use fictional businesses only.",
    checkpoints.length ? `REFERENCE QUESTIONS AND ANSWERS:\n${checkpoints.join("\n\n")}` : "",
    interview.length ? `INTERVIEW QUESTIONS WITH ANSWER GUIDES:\n${interview.join("\n\n")}` : "",
    glossary ? `GLOSSARY:\n${glossary}` : "",
  ].filter(Boolean).join("\n\n");
}

// Chat drill UI. Falls back to a set-up prompt when no assistant is connected.
export function coachPanel({ system, opener = "Start practice", intro = "Your AI coach asks one question at a time, checks your answer and moves on. Answer in your own words." }) {
  if (!aiReady(getAiConfig(), ctx.config)) {
    const saved = getAiConfig();
    return h("div", { class: "card coach-setup" }, h("h3", {}, icon("spark", 18), "Practice with your AI coach"), h("p", { class: "small muted" }, saved ? "Your saved assistant is not active yet. Choose Gemini or an API key in your profile to practise now." : "Connect the AI assistant you already use (Gemini has a free tier) and the coach will quiz you on this material, check your answers and keep going."), h("a", { class: "button primary small", href: ctx.auth.type === "admin" ? "#/admin/account" : "#/portal/profile#ai" }, icon("spark", 14), "Set up your AI assistant"));
  }
  const messages = [];
  const log = h("div", { class: "coach-log", "aria-live": "polite" });
  const input = h("textarea", { class: "input", rows: 2, placeholder: "Type your answer…", "aria-label": "Your answer" });
  const send = h("button", { class: "button primary small", type: "button" }, icon("arrow", 14), "Send");
  const start = h("button", { class: "button primary", type: "button" }, icon("play", 16), opener);
  const composer = h("div", { class: "coach-composer", hidden: true }, input, send);
  const bubble = (role, content) => h("div", { class: `coach-msg ${role}` }, h("span", { class: "coach-who" }, role === "assistant" ? "Coach" : "You"), h("div", { class: "coach-text" }, content));
  const thinking = () => h("div", { class: "coach-msg assistant thinking" }, h("span", { class: "coach-who" }, "Coach"), h("div", { class: "coach-text" }, h("span", { class: "spinner" }), " thinking…"));
  const ask = async (userText) => {
    if (userText) { messages.push({ role: "user", content: userText }); log.append(bubble("user", userText)); }
    const pending = thinking(); log.append(pending); log.scrollTop = log.scrollHeight;
    send.disabled = true; input.disabled = true;
    try {
      const reply = await chat({ system, messages: messages.length ? messages : [{ role: "user", content: "Begin the practice drill with your first question." }], temperature: 0.4, maxTokens: 500 });
      messages.push({ role: "assistant", content: reply });
      pending.replaceWith(bubble("assistant", reply));
    } catch (error) { pending.replaceWith(h("div", { class: "alert error" }, icon("info", 16), h("span", {}, error.message))); }
    finally { send.disabled = false; input.disabled = false; input.focus(); log.scrollTop = log.scrollHeight; }
  };
  start.addEventListener("click", () => { start.hidden = true; composer.hidden = false; ask(null); });
  send.addEventListener("click", () => { const value = input.value.trim(); if (!value) return; input.value = ""; ask(value); });
  input.addEventListener("keydown", (event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); send.click(); } });
  return h("div", { class: "card coach" }, h("div", { class: "card-head" }, h("h3", {}, icon("spark", 18), "Practice with your AI coach"), h("span", { class: "tiny muted" }, "Runs on your own assistant")), h("p", { class: "small muted" }, intro), log, composer, start);
}

// Admin side: draft a lab review (scores + feedback) with the admin's own assistant; the admin edits and saves.
export async function draftLabReview(pack, items) {
  const system = "You are an assessor for a business-skills studio. Score each task strictly against its rubric or evidence requirement, as a whole number from 0 to the stated maximum, and write feedback the learner can act on: what was strong, what was missing against the rubric, one concrete improvement. Use British English, no emojis, no em dashes. Reply ONLY with JSON of the form {\"scores\": {\"<taskId>\": <points>}, \"feedback\": \"<2-4 sentences>\"}.";
  const reply = await chat({ system, messages: [{ role: "user", content: `${pack}\n\nTask ids and maximums: ${items.map(item => `${item.taskId} (max ${item.maxPoints})`).join(", ")}` }], temperature: 0.2, maxTokens: 400 });
  const parsed = extractJson(reply);
  if (!parsed || typeof parsed.scores !== "object" || typeof parsed.feedback !== "string") throw new Error("The assistant did not return a usable draft. Try again or score manually.");
  return parsed;
}
