import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { chat, extractJson, PROVIDERS, HANDOFF_URL_LIMIT, handoffUrl, openAssistant, getAiConfig, saveAiConfig, aiReady, aiKind, endLocalConversation } from "../../site/app/ai/providers.js";
import { coachSystemPrompt, handoffPrompt, parseReviewDraft } from "../../site/app/ai/coach.js";
import { COURSE_CONTENT, INTERVIEW_GENERAL } from "../../site/app/content/modules/index.js";

test("provider layer builds Gemini and OpenAI-compatible requests from one message format and explains refusals", async () => {
  const calls = [];
  const fetchImpl = async (url, options) => {
    calls.push({ url, body: JSON.parse(options.body), headers: options.headers });
    if (url.includes("generativelanguage.googleapis.com")) return new Response(JSON.stringify({ candidates: [{ content: { parts: [{ text: "Question 1: what does one row represent?" }] } }] }), { status: 200 });
    if (url.endsWith("/chat/completions")) return new Response(JSON.stringify({ choices: [{ message: { content: "READY" } }] }), { status: 200 });
    return new Response("nope", { status: 404 });
  };
  const gemini = await chat({ config: { provider: "gemini", key: "AIza-test", model: "gemini-2.5-flash" }, system: "Coach.", messages: [{ role: "user", content: "Begin." }, { role: "assistant", content: "Hello." }, { role: "user", content: "Go on." }], fetchImpl });
  assert.equal(gemini, "Question 1: what does one row represent?");
  assert.match(calls[0].url, /models\/gemini-2\.5-flash:generateContent\?key=AIza-test$/);
  assert.equal(calls[0].body.systemInstruction.parts[0].text, "Coach.");
  assert.deepEqual(calls[0].body.contents.map(item => item.role), ["user", "model", "user"]);
  const openai = await chat({ config: { provider: "openai", key: "sk-test", model: "gpt-4o-mini", baseUrl: PROVIDERS.openai.baseUrl }, system: "Test.", messages: [{ role: "user", content: "Say READY." }], fetchImpl });
  assert.equal(openai, "READY");
  assert.equal(calls[1].headers.Authorization, "Bearer sk-test");
  assert.equal(calls[1].body.messages[0].role, "system");
  assert.equal(calls[1].body.model, "gpt-4o-mini");
  const compatible = await chat({ config: { provider: "compatible", key: "k", model: "local-model", baseUrl: "https://llm.example.com/v1" }, messages: [{ role: "user", content: "hi" }], fetchImpl });
  assert.equal(compatible, "READY");
  assert.equal(calls[2].url, "https://llm.example.com/v1/chat/completions");
  await assert.rejects(chat({ config: { provider: "chatgpt-web" }, messages: [{ role: "user", content: "hi" }], fetchImpl }), /opens in its own tab/);
  await assert.rejects(chat({ config: null, messages: [], fetchImpl }), /Pick one in Profile/);
  const denied = async () => new Response(JSON.stringify({ error: { message: "API key not valid" } }), { status: 403 });
  await assert.rejects(chat({ config: { provider: "gemini", key: "bad", model: "gemini-2.5-flash" }, messages: [{ role: "user", content: "hi" }], fetchImpl: denied }), /403.*API key not valid.*Check the key/);
  const quota = async () => new Response("{}", { status: 429 });
  await assert.rejects(chat({ config: { provider: "openai", key: "k", model: "m", baseUrl: PROVIDERS.openai.baseUrl }, messages: [{ role: "user", content: "hi" }], fetchImpl: quota }), /429.*quota/);
});

test("coach prompt is built from the module's own material and the review draft parser tolerates prose around JSON", () => {
  const prompt = coachSystemPrompt({ module: { title: "Business Spreadsheets", tool: "Google Sheets", outcomes: ["Clean dates"] }, course: { weeks: [{ lessons: [{ checkpoint: [{ question: "What is a row?", answer: "One completed order." }] }] }], glossary: [{ term: "Pivot", definition: "A summary table." }], interview: { questions: [{ question: "Explain SUMIFS.", answerGuide: ["Adds with conditions"] }] } } });
  assert.match(prompt, /Business Spreadsheets/);
  assert.match(prompt, /ONE question at a time/);
  assert.match(prompt, /Q: What is a row\?\nA: One completed order\./);
  assert.match(prompt, /Pivot: A summary table\./);
  assert.match(prompt, /Explain SUMIFS/);
  assert.match(prompt, /Never promise jobs/);
  assert.deepEqual(extractJson('Here you go:\n```json\n{"scores": {"t1": 16}, "feedback": "Good."}\n```'), { scores: { t1: 16 }, feedback: "Good." });
  assert.equal(extractJson("no json here"), null);
});

test("hand-off: ChatGPT gets the prompt in the URL up to the limit, Gemini and others rely on the clipboard; every module's compact prompt fits", async () => {
  const short = "Coach me.";
  assert.equal(handoffUrl("chatgpt-web", short), `https://chatgpt.com/?q=${encodeURIComponent(short)}`);
  assert.equal(handoffUrl("chatgpt-web", "x".repeat(HANDOFF_URL_LIMIT + 1)), "https://chatgpt.com/");
  assert.equal(handoffUrl("gemini-web", short), "https://gemini.google.com/app");
  assert.equal(handoffUrl("other-web", short), null);
  assert.equal(handoffUrl("gemini", short), null);
  const opened = []; const copied = [];
  const clipboard = { writeText: async (text) => { copied.push(text); } };
  const chatgpt = await openAssistant({ prompt: short, config: { provider: "chatgpt-web" }, open: (url) => opened.push(url), clipboard });
  assert.deepEqual([chatgpt.prefilled, chatgpt.copied, chatgpt.short], [true, true, "ChatGPT"]);
  const gemini = await openAssistant({ prompt: short, config: { provider: "gemini-web" }, open: (url) => opened.push(url), clipboard });
  assert.deepEqual([gemini.prefilled, gemini.copied, gemini.url], [false, true, "https://gemini.google.com/app"]);
  const other = await openAssistant({ prompt: short, config: { provider: "other-web" }, open: (url) => opened.push(url), clipboard: { writeText: async () => { throw new Error("denied"); } } });
  assert.deepEqual([other.url, other.copied], [null, false]);
  assert.deepEqual(opened, [`https://chatgpt.com/?q=${encodeURIComponent(short)}`, "https://gemini.google.com/app"]);
  assert.equal(copied.length, 2);
  await assert.rejects(openAssistant({ prompt: short, config: { provider: "gemini", key: "k" }, open: () => {}, clipboard }), /Choose ChatGPT or Gemini/);
  // Content growth must not silently push the typed-in prompt over the URL limit.
  const curriculum = JSON.parse(readFileSync(new URL("../../site/data/curriculum.json", import.meta.url), "utf8"));
  for (const module of curriculum.modules) {
    const prompt = handoffPrompt({ module, course: COURSE_CONTENT[module.id] });
    assert.ok(prompt.length <= HANDOFF_URL_LIMIT, `${module.id} hand-off prompt is ${prompt.length} characters`);
    assert.match(prompt, new RegExp(module.title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
    assert.match(prompt, /ONE question at a time/);
    assert.match(prompt, /Begin now: greet me in one line and ask question 1\.$/);
  }
  const interview = handoffPrompt({ module: null, course: null, mode: "interview", bank: { questions: INTERVIEW_GENERAL.sections.flatMap(section => section.questions) } });
  assert.ok(interview.length <= HANDOFF_URL_LIMIT);
  assert.match(interview, /STAR structure/);
});

test("the browser's built-in assistant: one session per conversation, system prompt as the first initial prompt, download progress reported, unavailable explained", async () => {
  const created = []; const sessions = []; const prompts = [];
  let availability = "downloadable";
  globalThis.LanguageModel = {
    availability: async () => availability,
    create: async (options) => {
      created.push(options);
      const listeners = {}; options.monitor?.({ addEventListener: (name, fn) => { listeners[name] = fn; } });
      listeners.downloadprogress?.({ loaded: 0.5 }); listeners.downloadprogress?.({ loaded: 1 });
      const session = { turns: [...options.initialPrompts], destroyed: false, prompt: async (text) => { prompts.push(text); session.turns.push({ role: "user", content: text }); const reply = `Reply ${prompts.length}`; session.turns.push({ role: "assistant", content: reply }); return reply; }, append: async (items) => { session.turns.push(...items); }, destroy: () => { session.destroyed = true; } };
      sessions.push(session);
      return session;
    },
  };
  try {
    const progress = [];
    const config = { provider: "builtin" };
    const messages = [];
    const first = await chat({ config, system: "Coach.", messages: [{ role: "user", content: "Begin." }], conversation: "c1", onProgress: (loaded) => progress.push(loaded) });
    assert.equal(first, "Reply 1");
    assert.deepEqual(progress, [0.5, 1]);
    assert.deepEqual(created[0].initialPrompts, [{ role: "system", content: "Coach." }]);
    assert.deepEqual(created[0].expectedInputs, [{ type: "text", languages: ["en"] }]);
    messages.push({ role: "user", content: "Begin." }, { role: "assistant", content: first }, { role: "user", content: "A row is an order." });
    const second = await chat({ config, system: "Coach.", messages, conversation: "c1" });
    assert.equal(second, "Reply 2");
    assert.equal(created.length, 1, "the same session continues the conversation");
    assert.deepEqual(prompts, ["Begin.", "A row is an order."]);
    // A failed turn leaves an extra user message in the caller's history: it is appended, not lost.
    messages.push({ role: "assistant", content: second }, { role: "user", content: "retry 1" }, { role: "user", content: "retry 2" });
    const third = await chat({ config, system: "Coach.", messages, conversation: "c1" });
    assert.equal(third, "Reply 3");
    assert.equal(created.length, 1);
    assert.deepEqual(sessions[0].turns.filter(turn => turn.role === "user").map(turn => turn.content), ["Begin.", "A row is an order.", "retry 1", "retry 2"]);
    // One-shot calls (no conversation) get their own session and release it.
    const single = await chat({ config, system: "Test.", messages: [{ role: "user", content: "READY?" }] });
    assert.equal(single, "Reply 4");
    assert.equal(created.length, 2);
    assert.equal(sessions[1].destroyed, true);
    endLocalConversation("c1");
    assert.equal(sessions[0].destroyed, true);
    availability = "unavailable";
    await assert.rejects(chat({ config, messages: [{ role: "user", content: "hi" }] }), /cannot run on this device/);
    assert.equal(aiReady(config), true);
    assert.equal(aiKind(config), "local");
  } finally { delete globalThis.LanguageModel; }
  assert.equal(aiReady({ provider: "builtin" }), false, "without the API the saved choice is not ready");
  await assert.rejects(chat({ config: { provider: "builtin" }, messages: [{ role: "user", content: "hi" }] }), /no built-in assistant/);
});

test("saved choices: hand-off needs no key, API providers do, the old chatgpt value migrates, and review drafts are validated", () => {
  const store = new Map();
  globalThis.localStorage = { getItem: (key) => store.get(key) ?? null, setItem: (key, value) => store.set(key, String(value)), removeItem: (key) => store.delete(key) };
  try {
    assert.equal(getAiConfig(), null);
    const chatgpt = saveAiConfig({ provider: "chatgpt-web" });
    assert.deepEqual([chatgpt.provider, chatgpt.key, aiReady(getAiConfig())], ["chatgpt-web", "", true]);
    assert.throws(() => saveAiConfig({ provider: "gemini", key: "" }), /Paste the API key/);
    assert.throws(() => saveAiConfig({ provider: "builtin" }), /no built-in assistant/);
    store.set("rolevia.ai.v1", JSON.stringify({ provider: "chatgpt", key: "", model: "" }));
    assert.equal(getAiConfig().provider, "chatgpt-web");
    assert.equal(PROVIDERS.gemini.kind, "api");
  } finally { delete globalThis.localStorage; }
  assert.deepEqual(parseReviewDraft('Sure:\n```json\n{"scores": {"t1": 16}, "feedback": "Good."}\n```'), { scores: { t1: 16 }, feedback: "Good." });
  assert.throws(() => parseReviewDraft("no json"), /not a usable draft/);
});
