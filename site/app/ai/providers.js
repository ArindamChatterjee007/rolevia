// The learner's own AI assistant. Settings live only in this browser (localStorage); requests go straight from
// the browser to the provider the learner chose, billed to their account. Rolevia never receives the key, the
// prompts or the replies. Providers: Gemini (free tier via Google AI Studio), OpenAI API key, any
// OpenAI-compatible endpoint, and "Continue with ChatGPT" once OpenAI approves Rolevia as a partner.
const STORAGE_KEY = "rolevia.ai.v1";

export const PROVIDERS = {
  gemini: { label: "Google Gemini", defaultModel: "gemini-2.5-flash", keyUrl: "https://aistudio.google.com/app/apikey", keyHelp: "Free tier available. Sign in with your Google account at Google AI Studio, create an API key and paste it here.", keyPlaceholder: "AIza…" },
  openai: { label: "OpenAI (API key)", defaultModel: "gpt-4o-mini", baseUrl: "https://api.openai.com/v1", keyUrl: "https://platform.openai.com/api-keys", keyHelp: "Pay-as-you-go API account at platform.openai.com (separate from a ChatGPT Plus subscription). Create a key and paste it here.", keyPlaceholder: "sk-…" },
  compatible: { label: "Other OpenAI-compatible endpoint", defaultModel: "", baseUrl: "", keyUrl: null, keyHelp: "Any provider that offers the OpenAI chat-completions format: enter its base URL, model name and key.", keyPlaceholder: "API key" },
  chatgpt: { label: "Continue with ChatGPT", defaultModel: "", keyUrl: null, keyHelp: "Uses your ChatGPT Plus or Pro plan. Available once OpenAI approves Rolevia for its partner programme; until then choose Gemini or an API key.", keyPlaceholder: "" },
};

export function getAiConfig() {
  try { const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null"); return saved && PROVIDERS[saved.provider] ? saved : null; } catch { return null; }
}
export function saveAiConfig(config) {
  const provider = PROVIDERS[config.provider] ? config.provider : null;
  if (!provider) throw new Error("Choose a provider.");
  const clean = { provider, key: String(config.key ?? "").trim(), model: String(config.model ?? "").trim() || PROVIDERS[provider].defaultModel, baseUrl: String(config.baseUrl ?? PROVIDERS[provider].baseUrl ?? "").trim().replace(/\/$/, ""), savedAt: Date.now() };
  if (provider !== "chatgpt" && !clean.key) throw new Error("Paste the API key for this provider.");
  if (provider === "compatible" && !/^https:\/\//.test(clean.baseUrl)) throw new Error("Enter the provider's https:// base URL.");
  if (provider === "compatible" && !clean.model) throw new Error("Enter the model name.");
  localStorage.setItem(STORAGE_KEY, JSON.stringify(clean));
  return clean;
}
export const forgetAiConfig = () => localStorage.removeItem(STORAGE_KEY);
// Ready means a request can be made now (ChatGPT needs the partner approval + client id).
export const aiReady = (config = getAiConfig(), siteConfig = {}) => Boolean(config && (config.provider === "chatgpt" ? siteConfig.openaiClientId : config.key));

const text = (value) => String(value ?? "").trim();
async function fail(response, provider) {
  let detail = "";
  try { const body = await response.json(); detail = body.error?.message ?? body.error?.status ?? ""; } catch { /* no body */ }
  const hint = response.status === 401 || response.status === 403 ? " Check the key in your profile." : response.status === 429 ? " The provider is rate-limiting or out of quota; wait a minute or check your plan." : response.status === 404 ? " Check the model name." : "";
  throw new Error(`${PROVIDERS[provider]?.label ?? "The provider"} refused the request (${response.status})${detail ? `: ${detail}` : ""}.${hint}`);
}

// messages: [{ role: "user"|"assistant", content }]; system: instructions. Returns the assistant's text.
export async function chat({ messages, system = "", temperature = 0.3, maxTokens = 700, config = getAiConfig(), fetchImpl = globalThis.fetch }) {
  if (!config) throw new Error("No AI assistant is connected. Set one up in Profile & security.");
  if (config.provider === "gemini") {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(config.model)}:generateContent?key=${encodeURIComponent(config.key)}`;
    const body = { contents: messages.map(message => ({ role: message.role === "assistant" ? "model" : "user", parts: [{ text: text(message.content) }] })), generationConfig: { temperature, maxOutputTokens: maxTokens } };
    if (system) body.systemInstruction = { parts: [{ text: system }] };
    const response = await fetchImpl(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (!response.ok) await fail(response, "gemini");
    const data = await response.json();
    const reply = data.candidates?.[0]?.content?.parts?.map(part => part.text ?? "").join("") ?? "";
    if (!reply) throw new Error(data.promptFeedback?.blockReason ? `Gemini blocked the request (${data.promptFeedback.blockReason}).` : "Gemini returned an empty reply.");
    return reply.trim();
  }
  if (config.provider === "chatgpt") throw new Error("Continue with ChatGPT is not available yet. Choose Gemini or an API key in your profile.");
  const base = config.baseUrl || PROVIDERS.openai.baseUrl;
  const response = await fetchImpl(`${base}/chat/completions`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${config.key}` }, body: JSON.stringify({ model: config.model, temperature, max_tokens: maxTokens, messages: [...(system ? [{ role: "system", content: system }] : []), ...messages.map(message => ({ role: message.role, content: text(message.content) }))] }) });
  if (!response.ok) await fail(response, config.provider);
  const data = await response.json();
  const reply = data.choices?.[0]?.message?.content ?? "";
  if (!reply) throw new Error("The provider returned an empty reply.");
  return reply.trim();
}

export async function testConnection(config, fetchImpl) {
  const reply = await chat({ messages: [{ role: "user", content: "Reply with the single word READY." }], system: "You are a connection test. Reply with exactly one word.", temperature: 0, maxTokens: 10, config, fetchImpl });
  return reply.length > 0;
}

// Pull a JSON object out of a model reply that may wrap it in prose or code fences.
export function extractJson(reply) {
  const match = String(reply ?? "").match(/\{[\s\S]*\}/);
  if (!match) return null;
  try { return JSON.parse(match[0]); } catch { return null; }
}
