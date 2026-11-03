// Rolevia production server: the same domain logic as the browser preview (site/app/store.js) behind an
// HTTP API, with pluggable storage (JSON file or a private GitHub repository), WebSocket signalling for
// live classes, optional outgoing-message webhook, and static hosting of site/.
//
//   PORT=8080 ROLEVIA_STORAGE=github GITHUB_REPO=owner/private-repo GITHUB_TOKEN=... \
//   ROLEVIA_OPS_PASSPHRASE=... node server/api.mjs
//
// Secrets come from the environment only. Never commit them.
import { createServer } from "node:http";
import { createReadStream, statSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { extname, join, normalize, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { createMockServer, ApiError } from "../site/app/store.js";
import { QUIZ_BANK } from "../site/app/content/quiz-bank.js";
import { ASSIGNMENT_BRIEFS } from "../site/app/content/assignments.js";
import { COURSE_CONTENT, INTERVIEW_GENERAL } from "../site/app/content/modules/index.js";
import { fileStorage, githubStorage } from "./storage.mjs";
import { attachSignalling } from "./signal.mjs";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const site = join(root, "site");
const BLOCKED = new Set(["_state", "reloadFromStorage", "previewReset", "previewForeignLogin", "previewCredentials", "previewInbox"]);
const types = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".json": "application/json; charset=utf-8", ".svg": "image/svg+xml", ".woff2": "font/woff2", ".png": "image/png", ".txt": "text/plain; charset=utf-8" };

export async function createApp(options = {}) {
  const env = { ...process.env, ...options.env };
  const log = options.log ?? ((line) => console.log(line));
  const curriculum = JSON.parse(await readFile(join(site, "data", "curriculum.json"), "utf8"));
  const storage = options.storage ?? (env.ROLEVIA_STORAGE === "github"
    ? await githubStorage({ repo: env.GITHUB_REPO, token: env.GITHUB_TOKEN, path: env.GITHUB_STATE_PATH, branch: env.GITHUB_BRANCH || "main", log })
    : fileStorage(env.ROLEVIA_STATE_FILE || join(root, "data", "rolevia-state.json")));
  const preview = env.ROLEVIA_PREVIEW === "1";
  const webhook = env.ROLEVIA_NOTIFY_WEBHOOK;
  const deliver = webhook ? (message) => fetch(webhook, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(message) }).catch(error => log(`[notify] ${error.message}`)) : null;
  // Without a payment provider the live server never grants anything on a client-side "success": students
  // receive transfer instructions and an admin with the payments permission confirms each payment.
  const paymentsMode = preview ? "preview" : "manual";
  const core = await createMockServer({ storage, curriculum, quizBank: QUIZ_BANK, assignmentBriefs: ASSIGNMENT_BRIEFS, courseContent: COURSE_CONTENT, interviewBank: INTERVIEW_GENERAL, deliver, seedMode: preview ? "demo" : "empty", opsPassphrase: env.ROLEVIA_OPS_PASSPHRASE, iceServers: env.ROLEVIA_ICE_SERVERS ? JSON.parse(env.ROLEVIA_ICE_SERVERS) : undefined, payments: paymentsMode, paymentInstructions: env.ROLEVIA_PAYMENT_INSTRUCTIONS || "" });
  const allowOrigin = env.ROLEVIA_ALLOW_ORIGIN || "";
  const config = () => ({ apiBase: "/", signalUrl: "/ws", googleClientId: env.ROLEVIA_GOOGLE_CLIENT_ID || "", iceServers: env.ROLEVIA_ICE_SERVERS ? JSON.parse(env.ROLEVIA_ICE_SERVERS) : [{ urls: ["stun:stun.l.google.com:19302"] }], mode: preview ? "preview" : "live", payments: paymentsMode });

  const server = createServer((request, response) => {
    handle(request, response).catch(error => {
      log(`[http] ${request.method} ${request.url}: ${error.stack ?? error.message}`);
      if (!response.headersSent) response.writeHead(500, { "content-type": "application/json" });
      response.end(JSON.stringify({ error: { code: "SERVER_ERROR", message: "Unexpected server error." } }));
    });
  });
  async function handle(request, response) {
    const url = new URL(request.url, "http://localhost");
    const cors = allowOrigin && request.headers.origin === allowOrigin ? { "access-control-allow-origin": allowOrigin, "access-control-allow-headers": "content-type", "access-control-allow-methods": "POST, GET, OPTIONS" } : {};
    if (request.method === "OPTIONS") { response.writeHead(204, cors).end(); return; }
    if (url.pathname.startsWith("/api/")) {
      const method = url.pathname.slice(5);
      if (request.method !== "POST" || BLOCKED.has(method) || !Object.hasOwn(core, method) || typeof core[method] !== "function" || (!preview && method.startsWith("preview"))) { response.writeHead(404, { "content-type": "application/json", ...cors }).end(JSON.stringify({ error: { code: "NOT_FOUND", message: "Unknown API method." } })); return; }
      let payload = {};
      try { payload = JSON.parse(await readBody(request, 6 * 1024 * 1024)) || {}; } catch (error) { response.writeHead(400, { "content-type": "application/json", ...cors }).end(JSON.stringify({ error: { code: "BAD_REQUEST", message: error.message } })); return; }
      try { const result = await core[method](payload); response.writeHead(200, { "content-type": "application/json", "cache-control": "no-store", ...cors }).end(JSON.stringify({ result: result ?? null })); }
      catch (error) { const status = error instanceof ApiError ? statusFor(error.code) : 500; if (status === 500) log(`[api] ${method}: ${error.stack ?? error.message}`); response.writeHead(status, { "content-type": "application/json", ...cors }).end(JSON.stringify({ error: { code: error.code ?? "SERVER_ERROR", message: error instanceof ApiError ? error.message : "Unexpected server error.", extra: error.extra ?? {} } })); }
      return;
    }
    if (url.pathname === "/config.json") { response.writeHead(200, { "content-type": "application/json", "cache-control": "no-store" }).end(JSON.stringify(config())); return; }
    if (url.pathname === "/healthz") { response.writeHead(200, { "content-type": "application/json" }).end(JSON.stringify({ ok: true, storage: options.storage ? "custom" : env.ROLEVIA_STORAGE === "github" ? "github" : "file", preview })); return; }
    // Paid course material and quiz answer keys live under /app/content/; outside the preview they reach the
    // browser only through the API, never as static files.
    if (!preview && /^\/app\/content\//.test(url.pathname)) { response.writeHead(404, { "content-type": "text/plain" }).end("Not found"); return; }
    serveStatic(url.pathname, response);
  }
  // The relay stamps identity, role and display name from the session so no participant can claim to be the host.
  const authorize = async ({ room, peer, token, device }) => {
    const access = await core.classAccess({ token, deviceId: device, classId: room });
    if (access.room.peerId !== peer) throw new ApiError("FORBIDDEN", "Peer identity mismatch.");
    return { room, peer, role: access.room.role, name: access.room.name };
  };
  const signalling = attachSignalling(server, { log, authorize, heartbeatMs: options.heartbeatMs });
  return { server, core, storage, signalling, close: async () => { signalling.close(); await storage.flush?.(); await new Promise(resolve => server.close(resolve)); } };
}

function serveStatic(pathname, response) {
  let decoded;
  try { decoded = decodeURIComponent(pathname === "/" ? "index.html" : pathname); } catch { response.writeHead(400, { "content-type": "text/plain" }).end("Bad request"); return; }
  let file = normalize(join(site, decoded));
  if (!file.startsWith(site + sep) && file !== site) { response.writeHead(403).end(); return; }
  try {
    if (statSync(file).isDirectory()) file = join(file, "index.html");
    const stats = statSync(file);
    response.writeHead(200, { "content-type": types[extname(file)] ?? "application/octet-stream", "content-length": stats.size, "cache-control": extname(file) === ".html" || extname(file) === ".json" ? "no-store" : "public, max-age=3600" });
    createReadStream(file).pipe(response);
  } catch { response.writeHead(404, { "content-type": "text/plain" }).end("Not found"); }
}
const statusFor = (code) => ({ AUTH_REQUIRED: 401, SESSION_REVOKED: 401, SESSION_EXPIRED: 401, DEVICE_MISMATCH: 401, INVALID_CREDENTIALS: 401, LOCKED: 429, FORBIDDEN: 403, SUSPENDED: 403, PASSWORD_CHANGE_REQUIRED: 403, NOT_FOUND: 404, VALIDATION: 400, DUPLICATE: 409, INVALID_STATE: 409, ALREADY_DONE: 409, ALREADY_GRADED: 409, ALREADY_INCLUDED: 409, QUIZ_CLOSED: 409, PAYMENT_DECLINED: 402, FILE_TOO_LARGE: 413, STORAGE_FULL: 507 }[code] ?? 400);
function readBody(request, limit) {
  return new Promise((resolve, reject) => { let size = 0; const chunks = []; request.on("data", chunk => { size += chunk.length; if (size > limit) { reject(new Error("Request body too large.")); request.destroy(); return; } chunks.push(chunk); }); request.on("end", () => resolve(Buffer.concat(chunks).toString("utf8") || "{}")); request.on("error", reject); });
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const port = Number(process.env.PORT || 8080);
  const app = await createApp();
  app.server.listen(port, () => console.log(`Rolevia API + site on http://0.0.0.0:${port} (${process.env.ROLEVIA_STORAGE === "github" ? "GitHub storage" : "file storage"}${process.env.ROLEVIA_PREVIEW === "1" ? ", preview seed" : ""})`));
  for (const signal of ["SIGINT", "SIGTERM"]) process.on(signal, async () => { await app.close(); process.exit(0); });
}
