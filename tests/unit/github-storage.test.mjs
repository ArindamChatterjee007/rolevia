import test from "node:test";
import assert from "node:assert/strict";
import { githubStorage } from "../../server/storage.mjs";

function fakeGitHub({ initial = null, conflictOnce = false } = {}) {
  let content = initial;
  let sha = initial ? "sha-0" : null;
  let writes = 0;
  const calls = [];
  const fetchImpl = async (url, options = {}) => {
    calls.push({ url, method: options.method ?? "GET", headers: options.headers });
    assert.equal(options.headers.Authorization, "Bearer secret-token");
    if (!options.method || options.method === "GET") {
      if (!content) return new Response("not found", { status: 404 });
      return new Response(JSON.stringify({ sha, content: Buffer.from(JSON.stringify(content)).toString("base64") }), { status: 200 });
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
