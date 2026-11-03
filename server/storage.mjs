// Storage adapters for the production server. Both satisfy { get(), set(state), revision() } synchronously
// (the core keeps state in memory) and persist in the background.
import { readFileSync, writeFileSync, mkdirSync, existsSync, renameSync, copyFileSync } from "node:fs";
import { dirname } from "node:path";

// Writes go to a temporary file and are renamed into place, so a crash mid-write never leaves a half file.
// A file that exists but cannot be parsed is a hard error: re-seeding would silently erase every learner.
export function fileStorage(path) {
  let cached = null;
  if (existsSync(path)) {
    const raw = readFileSync(path, "utf8");
    try { cached = JSON.parse(raw); }
    catch (error) {
      const backup = `${path}.corrupt-${Date.now()}.bak`;
      copyFileSync(path, backup);
      throw new Error(`Stored state at ${path} is not valid JSON (${error.message}). A copy was kept at ${backup}; restore a good copy or move the file aside before starting.`);
    }
  }
  return {
    get: () => cached,
    set: (state) => {
      cached = state;
      mkdirSync(dirname(path), { recursive: true });
      const temporary = `${path}.tmp-${process.pid}`;
      writeFileSync(temporary, JSON.stringify(state));
      renameSync(temporary, path);
    },
    revision: () => cached?.rev ?? 0,
    flush: async () => {},
  };
}

// GitHub as the database: the whole state lives in one JSON file of a PRIVATE repository, written through
// the contents API with the last known blob SHA (optimistic concurrency). Writes are debounced and
// serialised; on a 409 the latest SHA is fetched and the write retried (single-server, last writer wins).
// Reads use the "object" media type for metadata and the "raw" media type for content, because the default
// JSON media type stops returning content once the file passes 1 MB.
export async function githubStorage({ repo, token, path = "data/rolevia-state.json", branch = "main", fetchImpl = globalThis.fetch, debounceMs = 1500, log = console.log }) {
  if (!repo || !token) throw new Error("GITHUB_REPO and GITHUB_TOKEN are required for GitHub storage.");
  const base = `https://api.github.com/repos/${repo}/contents/${path}`;
  const headers = { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28", "User-Agent": "rolevia-api" };
  let cached = null;
  let sha = null;
  let pending = null;
  let timer = null;
  let writing = Promise.resolve();

  const objectHeaders = { ...headers, Accept: "application/vnd.github.object+json" };
  const rawHeaders = { ...headers, Accept: "application/vnd.github.raw+json" };
  const readMeta = async () => {
    const response = await fetchImpl(`${base}?ref=${encodeURIComponent(branch)}`, { headers: objectHeaders });
    if (response.status === 404) return null;
    if (!response.ok) throw new Error(`GitHub read failed (${response.status}).`);
    return response.json();
  };
  const load = async () => {
    const meta = await readMeta();
    if (!meta) { cached = null; sha = null; return; }
    sha = meta.sha;
    let text;
    if (meta.encoding === "base64" && meta.content) text = Buffer.from(meta.content.replace(/\n/g, ""), "base64").toString("utf8");
    else {
      const response = await fetchImpl(`${base}?ref=${encodeURIComponent(branch)}`, { headers: rawHeaders });
      if (!response.ok) throw new Error(`GitHub raw read failed (${response.status}).`);
      text = await response.text();
    }
    try { cached = JSON.parse(text); }
    catch (error) { throw new Error(`State file ${path} in ${repo} is not valid JSON (${error.message}); refusing to start so it is not overwritten.`); }
  };
  const write = async (state, attempt = 0) => {
    const content = Buffer.from(JSON.stringify(state)).toString("base64");
    const response = await fetchImpl(base, { method: "PUT", headers: { ...headers, "Content-Type": "application/json" }, body: JSON.stringify({ message: `rolevia state rev ${state.rev ?? 0}`, content, branch, ...(sha ? { sha } : {}) }) });
    if (response.status === 409 || response.status === 422) {
      if (attempt >= 2) throw new Error(`GitHub write conflict persisted (${response.status}).`);
      const current = await readMeta().catch(() => null);
      sha = current?.sha ?? null;
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
