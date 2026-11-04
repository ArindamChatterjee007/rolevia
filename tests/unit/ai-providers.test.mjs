import test from "node:test";
import assert from "node:assert/strict";
import { chat, extractJson, PROVIDERS } from "../../site/app/ai/providers.js";
import { coachSystemPrompt } from "../../site/app/ai/coach.js";

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
  await assert.rejects(chat({ config: { provider: "chatgpt", key: "" }, messages: [{ role: "user", content: "hi" }], fetchImpl }), /not available yet/);
  await assert.rejects(chat({ config: null, messages: [], fetchImpl }), /Set one up in Profile/);
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
