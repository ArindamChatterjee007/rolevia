// The learner's own AI assistant. The choice lives only in this browser (localStorage) and nothing passes
// through Rolevia. Three kinds of assistant:
//   handoff  ChatGPT or Gemini in the learner's own account: Rolevia prepares the prompt, opens the assistant
//            in a new tab (typed in where the site allows it) and copies the prompt as a fallback. No key.
//   local    The assistant built into the browser (Chrome 148+ desktop, Gemini Nano): runs on the device,
//            no account, no key, offline after a one-time download.
//   api      Advanced: the learner's own API key for Gemini, OpenAI or any compatible endpoint; requests go
//            straight from the browser to that provider and are billed to the learner.
// In-page ChatGPT without a tab switch ("Continue with ChatGPT") needs OpenAI's partner approval; the
// application is the founder's action and the config key `openaiClientId` is reserved for it.
const STORAGE_KEY = "rolevia.ai.v1";
// Longest prompt placed in a URL; longer prompts rely on the clipboard copy.
export const HANDOFF_URL_LIMIT = 4500;

export const PROVIDERS = {
  "chatgpt-web": { kind: "handoff", label: "ChatGPT (your account)", short: "ChatGPT", url: "https://chatgpt.com/", prefill: (prompt) => `https://chatgpt.com/?q=${encodeURIComponent(prompt)}`, help: "Rolevia opens ChatGPT in a new tab with the practice already typed in. You stay signed in to your own ChatGPT, free or paid, and usage counts against your plan. No key, nothing to install." },
  "gemini-web": { kind: "handoff", label: "Google Gemini (your account)", short: "Gemini", url: "https://gemini.google.com/app", prefill: null, help: "Rolevia copies the practice prompt and opens Gemini in a new tab: paste it (Ctrl+V, or long-press on a phone) and send. Your Google account, your plan, no key." },
  "other-web": { kind: "handoff", label: "Another assistant (copy and paste)", short: "your assistant", url: null, prefill: null, help: "Rolevia copies the practice prompt for you to paste into Claude, Copilot, Perplexity or any assistant you prefer." },
  builtin: { kind: "local", label: "Built into this browser (no account)", short: "the built-in assistant", help: "Runs on this computer inside Chrome, with no account and no key, offline after a one-time download of a few GB. Needs Chrome 148 or newer on a laptop or desktop with 16 GB memory and 22 GB free space. Answers are shorter and simpler than ChatGPT or Gemini." },
  gemini: { kind: "api", label: "Google Gemini API key", short: "Gemini", defaultModel: "gemini-2.5-flash", keyUrl: "https://aistudio.google.com/app/apikey", help: "Advanced. Free tier available: sign in with your Google account at Google AI Studio, create an API key and paste it here. The coach then runs inside Rolevia pages.", keyPlaceholder: "AIza…" },
  openai: { kind: "api", label: "OpenAI API key", short: "OpenAI", defaultModel: "gpt-4o-mini", baseUrl: "https://api.openai.com/v1", keyUrl: "https://platform.openai.com/api-keys", help: "Advanced. Pay-as-you-go API account at platform.openai.com (separate from a ChatGPT subscription). Create a key and paste it here.", keyPlaceholder: "sk-…" },
  compatible: { kind: "api", label: "Other OpenAI-compatible endpoint", short: "your endpoint", defaultModel: "", baseUrl: "", keyUrl: null, help: "Advanced. Any provider that offers the OpenAI chat-completions format: enter its base URL, model name and key.", keyPlaceholder: "API key" },
};
const LEGACY = { chatgpt: "chatgpt-web" };

export const hasLocalAssistant = () => typeof globalThis.LanguageModel !== "undefined";
export const aiKind = (config) => PROVIDERS[config?.provider]?.kind ?? null;

export function getAiConfig() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null");
    if (!saved) return null;
    const provider = LEGACY[saved.provider] ?? saved.provider;
    return PROVIDERS[provider] ? { ...saved, provider } : null;
  } catch { return null; }
}
export function saveAiConfig(config) {
  const provider = PROVIDERS[config.provider] ? config.provider : null;
  if (!provider) throw new Error("Choose an assistant.");
  const info = PROVIDERS[provider];
  const clean = { provider, key: "", model: "", baseUrl: "", savedAt: Date.now() };
  if (info.kind === "api") {
    clean.key = String(config.key ?? "").trim();
    clean.model = String(config.model ?? "").trim() || info.defaultModel;
    clean.baseUrl = String(config.baseUrl ?? info.baseUrl ?? "").trim().replace(/\/$/, "");
    if (!clean.key) throw new Error("Paste the API key for this provider.");
    if (provider === "compatible" && !/^https:\/\//.test(clean.baseUrl)) throw new Error("Enter the provider's https:// base URL.");
    if (provider === "compatible" && !clean.model) throw new Error("Enter the model name.");
  }
  if (info.kind === "local" && !hasLocalAssistant()) throw new Error("This browser has no built-in assistant. Use Chrome 148 or newer on a laptop or desktop, or choose ChatGPT or Gemini.");
  localStorage.setItem(STORAGE_KEY, JSON.stringify(clean));
  return clean;
}
export const forgetAiConfig = () => localStorage.removeItem(STORAGE_KEY);
// Ready means the assistant can be used from this browser right now.
export const aiReady = (config = getAiConfig()) => {
  const kind = aiKind(config);
  return kind === "handoff" || (kind === "local" && hasLocalAssistant()) || (kind === "api" && Boolean(config.key));
};

const text = (value) => String(value ?? "").trim();

// ---------- hand-off: the learner's own ChatGPT or Gemini in a new tab ----------
export function handoffUrl(provider, prompt) {
  const info = PROVIDERS[provider];
  if (!info || info.kind !== "handoff" || !info.url) return null;
  return info.prefill && prompt.length <= HANDOFF_URL_LIMIT ? info.prefill(prompt) : info.url;
}
// Must be called inside a click handler: the window opens synchronously, the clipboard write follows.
export async function openAssistant({ prompt, config = getAiConfig(), open = (url) => globalThis.open(url, "_blank", "noopener,noreferrer"), clipboard = globalThis.navigator?.clipboard }) {
  const info = PROVIDERS[config?.provider];
  if (!info || info.kind !== "handoff") throw new Error("Choose ChatGPT or Gemini in your profile first.");
  const url = handoffUrl(config.provider, prompt);
  const prefilled = Boolean(url && info.prefill && url !== info.url);
  if (url) open(url);
  let copied = false;
  try { await clipboard?.writeText(prompt); copied = true; } catch { copied = false; }
  return { url, prefilled, copied, short: info.short, label: info.label };
}

// ---------- local: the browser's built-in assistant (Prompt API) ----------
const LOCAL_OPTIONS = { expectedInputs: [{ type: "text", languages: ["en"] }], expectedOutputs: [{ type: "text", languages: ["en"] }] };
const localSessions = new Map();
const toTurn = (message) => ({ role: message.role === "assistant" ? "assistant" : "user", content: text(message.content) });
export async function localAvailability() {
  if (!hasLocalAssistant()) return "unsupported";
  try { return await globalThis.LanguageModel.availability(LOCAL_OPTIONS); } catch { return "unavailable"; }
}
async function localChat({ messages, system, conversation, onProgress, signal }) {
  const LanguageModel = globalThis.LanguageModel;
  if (!LanguageModel) throw new Error("This browser has no built-in assistant. Use Chrome 148 or newer on a laptop or desktop, or choose ChatGPT or Gemini in your profile.");
  const availability = await LanguageModel.availability(LOCAL_OPTIONS);
  if (availability === "unavailable") throw new Error("The built-in assistant cannot run on this device (it needs a laptop or desktop with 16 GB memory, 22 GB free space and a capable graphics chip). Choose ChatGPT or Gemini in your profile.");
  const history = messages.slice(0, -1).map(toTurn);
  const last = toTurn(messages.at(-1) ?? { role: "user", content: "" });
  let entry = conversation ? localSessions.get(conversation) : null;
  if (entry && entry.system !== system) entry = null;
  if (entry && entry.turns !== history.length) {
    const missing = history.slice(entry.turns);
    if (missing.length && entry.turns < history.length && typeof entry.session.append === "function") { await entry.session.append(missing, { signal }); entry.turns = history.length; }
    else { entry.session.destroy?.(); entry = null; }
  }
  if (!entry) {
    let session;
    try { session = await LanguageModel.create({ ...LOCAL_OPTIONS, signal, initialPrompts: [...(system ? [{ role: "system", content: system }] : []), ...history], monitor(monitor) { monitor.addEventListener("downloadprogress", (event) => onProgress?.(Number(event.loaded) || 0)); } }); }
    catch (error) { throw friendlyLocalError(error); }
    entry = { session, system, turns: history.length };
    if (conversation) localSessions.set(conversation, entry);
  }
  let reply;
  try { reply = text(await entry.session.prompt(last.content, { signal })); }
  catch (error) { throw friendlyLocalError(error); }
  entry.turns = history.length + 2;
  if (!conversation) entry.session.destroy?.();
  if (!reply) throw new Error("The built-in assistant returned an empty reply.");
  return reply;
}
// The on-device model is small: explain its limits in plain words instead of surfacing DOMException names.
function friendlyLocalError(error) {
  const message = String(error?.message ?? error);
  if (error?.name === "QuotaExceededError" || /too large|quota/i.test(message)) return new Error("The built-in assistant ran out of room for this conversation. Start a new drill, or choose ChatGPT or Gemini in your profile for longer sessions.");
  if (error?.name === "NotSupportedError" || error?.name === "NotAllowedError") return new Error("The built-in assistant could not start on this device. Choose ChatGPT or Gemini in your profile.");
  if (error?.name === "AbortError") return new Error("Stopped.");
  return error instanceof Error ? error : new Error(message);
}
export function endLocalConversation(conversation) {
  const entry = localSessions.get(conversation);
  if (entry) { entry.session.destroy?.(); localSessions.delete(conversation); }
}

// ---------- api: the learner's own key ----------
async function fail(response, provider) {
  let detail = "";
  try { const body = await response.json(); detail = body.error?.message ?? body.error?.status ?? ""; } catch { /* no body */ }
  const hint = response.status === 401 || response.status === 403 ? " Check the key in your profile." : response.status === 429 ? " The provider is rate-limiting or out of quota; wait a minute or check your plan." : response.status === 404 ? " Check the model name." : "";
  throw new Error(`${PROVIDERS[provider]?.label ?? "The provider"} refused the request (${response.status})${detail ? `: ${detail}` : ""}.${hint}`);
}

// messages: [{ role: "user"|"assistant", content }]; system: instructions. Returns the assistant's text.
// conversation: optional stable id so the local assistant keeps one session across turns.
export async function chat({ messages, system = "", temperature = 0.3, maxTokens = 700, config = getAiConfig(), fetchImpl = globalThis.fetch, conversation = null, onProgress = null, signal = undefined }) {
  if (!config) throw new Error("No AI assistant is chosen. Pick one in Profile & security.");
  const kind = aiKind(config);
  if (kind === "handoff") throw new Error(`${PROVIDERS[config.provider].label} opens in its own tab; use the Open button.`);
  if (kind === "local") return localChat({ messages, system, conversation, onProgress, signal });
  if (config.provider === "gemini") {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(config.model)}:generateContent?key=${encodeURIComponent(config.key)}`;
    const body = { contents: messages.map(message => ({ role: message.role === "assistant" ? "model" : "user", parts: [{ text: text(message.content) }] })), generationConfig: { temperature, maxOutputTokens: maxTokens } };
    if (system) body.systemInstruction = { parts: [{ text: system }] };
    const response = await fetchImpl(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body), signal });
    if (!response.ok) await fail(response, "gemini");
    const data = await response.json();
    const reply = data.candidates?.[0]?.content?.parts?.map(part => part.text ?? "").join("") ?? "";
    if (!reply) throw new Error(data.promptFeedback?.blockReason ? `Gemini blocked the request (${data.promptFeedback.blockReason}).` : "Gemini returned an empty reply.");
    return reply.trim();
  }
  const base = config.baseUrl || PROVIDERS.openai.baseUrl;
  const response = await fetchImpl(`${base}/chat/completions`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${config.key}` }, body: JSON.stringify({ model: config.model, temperature, max_tokens: maxTokens, messages: [...(system ? [{ role: "system", content: system }] : []), ...messages.map(message => ({ role: message.role, content: text(message.content) }))] }), signal });
  if (!response.ok) await fail(response, config.provider);
  const data = await response.json();
  const reply = data.choices?.[0]?.message?.content ?? "";
  if (!reply) throw new Error("The provider returned an empty reply.");
  return reply.trim();
}

export async function testConnection(config, fetchImpl, onProgress) {
  const reply = await chat({ messages: [{ role: "user", content: "Reply with the single word READY." }], system: "You are a connection test. Reply with exactly one word.", temperature: 0, maxTokens: 10, config, fetchImpl, onProgress });
  return reply.length > 0;
}

// Pull a JSON object out of a model reply that may wrap it in prose or code fences.
export function extractJson(reply) {
  const match = String(reply ?? "").match(/\{[\s\S]*\}/);
  if (!match) return null;
  try { return JSON.parse(match[0]); } catch { return null; }
}
