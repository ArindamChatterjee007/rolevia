import test from "node:test";
import assert from "node:assert/strict";
import { githubStorage } from "../../server/storage.mjs";

function fakeGitHub({ initial = null, conflictOnce = false, large = false } = {}) {
  let content = initial;
  let sha = initial ? "sha-0" : null;
  let writes = 0;
  const calls = [];
  const fetchImpl = async (url, options = {}) => {
    calls.push({ url, method: options.method ?? "GET", headers: options.headers });
    assert.equal(options.headers.Authorization, "Bearer secret-token");
    if (!options.method || options.method === "GET") {
      if (!content) return new Response("not found", { status: 404 });
      const text = JSON.stringify(content);
      // Mirror the contents API: the raw media type returns the file body; the object media type returns
      // metadata, with base64 content only below 1 MB (empty content + encoding "none" above it).
      if (options.headers.Accept === "application/vnd.github.raw+json") return new Response(text, { status: 200 });
      assert.equal(options.headers.Accept, "application/vnd.github.object+json", "metadata reads must use the object media type");
      if (large) return new Response(JSON.stringify({ sha, size: text.length, encoding: "none", content: "" }), { status: 200 });
      return new Response(JSON.stringify({ sha, size: text.length, encoding: "base64", content: Buffer.from(text).toString("base64") }), { status: 200 });
    }
    const body = JSON.parse(options.body);
    if (conflictOnce && writes === 0) { writes += 1; return new Response("conflict", { status: 409 }); }
    if ((body.sha ?? null) !== sha) return new Response("sha mismatch", { status: 409 });
    writes += 1;
    content = JSON.parse(Buffer.from(body.content, "base64").toString("utf8"));
    sha = `sha-${writes}`;
    return new Response(JSON.stringify({ content: { sha } }), { status: 201 });
  };
  return { fetchImpl, calls, get content() { return content; }, get sha() { return sha; }, get writes() { return writes; } };
}

test("github storage loads existing state, writes with the current sha, debounces and recovers from a conflict", async () => {
  const github = fakeGitHub({ initial: { version: 6, rev: 3, users: [] }, conflictOnce: true });
  const storage = await githubStorage({ repo: "owner/private", token: "secret-token", fetchImpl: github.fetchImpl, debounceMs: 5, log: () => {} });
  assert.equal(storage.get().rev, 3);
  assert.equal(storage.revision(), 3);
  storage.set({ version: 6, rev: 4, users: [1] });
  storage.set({ version: 6, rev: 5, users: [1, 2] });
  await storage.flush();
  assert.equal(github.content.rev, 5, "only the latest debounced state is written");
  assert.equal(github.writes, 2, "one conflicted attempt, one successful write");
  assert.equal(storage.sha, github.sha);
  assert.ok(github.calls.every(call => call.url.startsWith("https://api.github.com/repos/owner/private/contents/data/rolevia-state.json")));
});

test("github storage starts empty when the file does not exist yet and creates it on first write", async () => {
  const github = fakeGitHub();
  const storage = await githubStorage({ repo: "owner/private", token: "secret-token", fetchImpl: github.fetchImpl, debounceMs: 5, log: () => {} });
  assert.equal(storage.get(), null);
  storage.set({ version: 6, rev: 1 });
  await storage.flush();
  assert.equal(github.content.rev, 1);
  assert.equal(github.writes, 1);
});

test("github storage requires a repository and token", async () => {
  await assert.rejects(githubStorage({ repo: "", token: "" }), /GITHUB_REPO and GITHUB_TOKEN/);
});

test("github storage reads files above 1 MB through the raw media type and refuses to start on corrupt JSON", async () => {
  const github = fakeGitHub({ initial: { version: 6, rev: 9, users: [{ id: "u1" }] }, large: true });
  const storage = await githubStorage({ repo: "owner/private", token: "secret-token", fetchImpl: github.fetchImpl, debounceMs: 5, log: () => {} });
  assert.equal(storage.get().rev, 9);
  assert.equal(storage.sha, "sha-0");
  assert.ok(github.calls.some(call => call.headers.Accept === "application/vnd.github.raw+json"), "content came from the raw endpoint");
  storage.set({ version: 6, rev: 10, users: [{ id: "u1" }, { id: "u2" }] });
  await storage.flush();
  assert.equal(github.content.rev, 10);

  const corrupt = fakeGitHub({ initial: { version: 6 } });
  const broken = async (url, options) => { const response = await corrupt.fetchImpl(url, options); return options?.headers?.Accept === "application/vnd.github.raw+json" || !options?.headers ? response : new Response(JSON.stringify({ sha: "sha-0", size: 5, encoding: "base64", content: Buffer.from("{oops").toString("base64") }), { status: 200 }); };
  await assert.rejects(githubStorage({ repo: "owner/private", token: "secret-token", fetchImpl: broken, log: () => {} }), /not valid JSON/);
});
