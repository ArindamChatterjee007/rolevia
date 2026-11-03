// Storage adapters for the production server. Both satisfy { get(), set(state), revision() } synchronously
// (the core keeps state in memory) and persist in the background.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname } from "node:path";

export function fileStorage(path) {
  let cached = null;
  if (existsSync(path)) { try { cached = JSON.parse(readFileSync(path, "utf8")); } catch { cached = null; } }
  return {
    get: () => cached,
    set: (state) => { cached = state; mkdirSync(dirname(path), { recursive: true }); writeFileSync(path, JSON.stringify(state)); },
    revision: () => cached?.rev ?? 0,
    flush: async () => {},
  };
}

// GitHub as the database: the whole state lives in one JSON file of a PRIVATE repository, written through
// the contents API with the last known blob SHA (optimistic concurrency). Writes are debounced and
// serialised; on a 409 the latest SHA is fetched and the write retried (single-server, last writer wins).
export async function githubStorage({ repo, token, path = "data/rolevia-state.json", branch = "main", fetchImpl = globalThis.fetch, debounceMs = 1500, log = console.log }) {
  if (!repo || !token) throw new Error("GITHUB_REPO and GITHUB_TOKEN are required for GitHub storage.");
  const base = `https://api.github.com/repos/${repo}/contents/${path}`;
  const headers = { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28", "User-Agent": "rolevia-api" };
  let cached = null;
  let sha = null;
  let pending = null;
  let timer = null;
  let writing = Promise.resolve();

  const load = async () => {
    const response = await fetchImpl(`${base}?ref=${encodeURIComponent(branch)}`, { headers });
    if (response.status === 404) { cached = null; sha = null; return; }
    if (!response.ok) throw new Error(`GitHub read failed (${response.status}).`);
    const body = await response.json();
    sha = body.sha;
    cached = JSON.parse(Buffer.from(body.content.replace(/\n/g, ""), "base64").toString("utf8"));
  };
  const write = async (state, attempt = 0) => {
    const content = Buffer.from(JSON.stringify(state)).toString("base64");
    const response = await fetchImpl(base, { method: "PUT", headers: { ...headers, "Content-Type": "application/json" }, body: JSON.stringify({ message: `rolevia state rev ${state.rev ?? 0}`, content, branch, ...(sha ? { sha } : {}) }) });
    if (response.status === 409 || response.status === 422) {
      if (attempt >= 2) throw new Error(`GitHub write conflict persisted (${response.status}).`);
      const current = await fetchImpl(`${base}?ref=${encodeURIComponent(branch)}`, { headers });
      sha = current.ok ? (await current.json()).sha : null;
      return write(state, attempt + 1);
    }
    if (!response.ok) throw new Error(`GitHub write failed (${response.status}).`);
    sha = (await response.json()).content.sha;
  };
  const flush = () => {
    clearTimeout(timer); timer = null;
    if (!pending) return writing;
    const state = pending; pending = null;
    writing = writing.then(() => write(state)).catch(error => { log(`[storage] ${error.message}`); pending ??= state; });
    return writing;
  };
  await load();
  return {
    get: () => cached,
    set: (state) => { cached = state; pending = state; if (!timer) timer = setTimeout(flush, debounceMs); },
    revision: () => cached?.rev ?? 0,
    flush,
    get sha() { return sha; },
  };
}
