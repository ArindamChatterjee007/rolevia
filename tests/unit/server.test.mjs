import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createApp } from "../../server/api.mjs";

const once = (socket, event) => new Promise((resolve, reject) => { socket.addEventListener(event, resolve, { once: true }); socket.addEventListener("error", reject, { once: true }); });
const nextMessage = (socket) => new Promise(resolve => socket.addEventListener("message", (event) => resolve(JSON.parse(event.data)), { once: true }));
const closeCode = (socket) => new Promise(resolve => socket.addEventListener("close", (event) => resolve(event.code), { once: true }));
const silence = (socket, ms = 300) => new Promise(resolve => { const listener = (event) => { clearTimeout(timer); resolve(JSON.parse(event.data)); }; const timer = setTimeout(() => { socket.removeEventListener("message", listener); resolve(null); }, ms); socket.addEventListener("message", listener, { once: true }); });

test("HTTP API serves the same methods as the preview, hides internals, and relays class signalling with authorisation", async () => {
  const dir = mkdtempSync(join(tmpdir(), "rolevia-"));
  const app = await createApp({ env: { ROLEVIA_PREVIEW: "1", ROLEVIA_STATE_FILE: join(dir, "state.json"), ROLEVIA_STORAGE: "file" }, log: () => {}, heartbeatMs: 150 });
  await new Promise(resolve => app.server.listen(0, "127.0.0.1", resolve));
  const port = app.server.address().port;
  const base = `http://127.0.0.1:${port}`;
  const post = async (method, payload) => { const response = await fetch(`${base}/api/${method}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload ?? {}) }); return { status: response.status, body: await response.json() }; };
  try {
    assert.equal((await fetch(`${base}/healthz`)).status, 200);
    assert.match(await (await fetch(`${base}/`)).text(), /Rolevia/);
    const config = await (await fetch(`${base}/config.json`)).json();
    assert.equal(config.signalUrl, "/ws");
    assert.equal(config.apiBase, "/", "the served site must talk to this API, not boot the in-browser preview");
    assert.equal(config.payments, "preview");
    assert.equal((await fetch(`${base}/%`)).status, 400, "a malformed path is a client error, not a crash");
    assert.equal((await fetch(`${base}/..%2F..%2Fpackage.json`)).status, 403);
    assert.equal((await fetch(`${base}/healthz`)).status, 200, "the server keeps answering afterwards");
    assert.equal((await post("constructor")).status, 404);
    assert.equal((await fetch(`${base}/app/content/modules/spreadsheets.js`)).status, 200, "the preview may serve content files (the in-browser backend needs them)");
    assert.equal((await post("catalogue")).body.result.modules.length, 8);
    for (const method of ["_state", "previewReset", "previewInbox", "reloadFromStorage", "nope"]) assert.equal((await post(method)).status, 404, method);
    const bad = await post("login", { identifier: "RV-26-0001", password: "wrong", deviceId: "d1", deviceLabel: "test" });
    assert.equal(bad.status, 401);
    assert.equal(bad.body.error.code, "INVALID_CREDENTIALS");
    const challenge = await post("login", { identifier: "RV-26-0001", password: "Learn#2026", deviceId: "d1", deviceLabel: "test" });
    assert.equal(challenge.status, 200);
    const code = app.core._state().outbox.find(message => message.channel === "email").body.match(/Code (\d{6})/)[1];
    const session = await post("verifyOtp", { challengeId: challenge.body.result.challengeId, code, deviceId: "d1", deviceLabel: "test" });
    assert.equal(session.body.result.user.studentId, "RV-26-0001");
    const dashboard = await post("dashboard", { token: session.body.result.token, deviceId: "d1" });
    assert.equal(dashboard.body.result.modules.length, 5);
    const hostChallenge = await post("login", { identifier: "RV-ADM-002", password: "Content-Ayush-2026", deviceId: "d2", deviceLabel: "host", expectedType: "admin" });
    const hostCode = app.core._state().outbox.find(message => message.channel === "email").body.match(/Code (\d{6})/)[1];
    const hostSession = await post("verifyOtp", { challengeId: hostChallenge.body.result.challengeId, code: hostCode, deviceId: "d2", deviceLabel: "host" });
    await post("changePassword", { token: hostSession.body.result.token, deviceId: "d2", currentPassword: "Content-Ayush-2026", newPassword: "Content-Ayush-2026" });

    const wsUrl = (peer, token, deviceId) => `ws://127.0.0.1:${port}/ws?room=cls-demo-live&peer=${peer}&token=${encodeURIComponent(token)}&device=${deviceId}`;
    const rejected = new WebSocket(wsUrl("u-student-1", "not-a-token", "d1"));
    await assert.rejects(once(rejected, "open"), "unauthorised sockets must not be upgraded");
    const hostSocket = new WebSocket(wsUrl("u-admin-2", hostSession.body.result.token, "d2"));
    await once(hostSocket, "open");
    const studentSocket = new WebSocket(wsUrl("u-student-1", session.body.result.token, "d1"));
    await once(studentSocket, "open");
    const heard = nextMessage(hostSocket);
    studentSocket.send(JSON.stringify({ type: "hello", from: "u-admin-2", role: "host", name: "Fake Host", payload: { name: "Ananya", role: "host" } }));
    const hello = await heard;
    assert.equal(hello.type, "hello");
    assert.equal(hello.from, "u-student-1", "the relay overwrites a forged sender");
    assert.equal(hello.role, "participant", "the relay overwrites a forged role");
    assert.equal(hello.name, "Ananya Iyer", "the relay stamps the verified display name");
    const direct = nextMessage(studentSocket);
    hostSocket.send(JSON.stringify({ type: "signal", to: "u-student-1", payload: { description: { type: "offer", sdp: "v=0" } } }));
    const offer = await direct;
    assert.equal(offer.payload.description.type, "offer");
    assert.equal(offer.role, "host");
    // A learner cannot evict anyone: client-sent peer-left is dropped and the next real message is a chat.
    const afterForged = nextMessage(hostSocket);
    studentSocket.send(JSON.stringify({ type: "peer-left", payload: { peerId: "u-admin-2" } }));
    studentSocket.send(JSON.stringify({ type: "chat", payload: { text: "hi" } }));
    assert.equal((await afterForged).type, "chat");
    // Reconnecting the same peer replaces the old socket without telling the room that the peer left.
    const quiet = silence(studentSocket, 400);
    const replacedClose = closeCode(hostSocket);
    const hostSocket2 = new WebSocket(wsUrl("u-admin-2", hostSession.body.result.token, "d2"));
    await once(hostSocket2, "open");
    assert.equal(await replacedClose, 4000, "the older connection is told it was replaced");
    assert.equal(await quiet, null, "no peer-left is announced for a replaced connection");
    // Oversize frames are refused; dropping the current socket does announce the departure.
    const tooBig = closeCode(hostSocket2);
    const leftAfterOversize = nextMessage(studentSocket);
    hostSocket2.send(JSON.stringify({ type: "chat", payload: { text: "x".repeat(70 * 1024) } }));
    assert.equal(await tooBig, 1009);
    assert.equal((await leftAfterOversize).type, "peer-left");
    // Access is re-checked on every heartbeat: signing out elsewhere closes the socket.
    const hostSocket3 = new WebSocket(wsUrl("u-admin-2", hostSession.body.result.token, "d2"));
    await once(hostSocket3, "open");
    const revoked = closeCode(hostSocket3);
    const left = nextMessage(studentSocket);
    await post("logout", { token: hostSession.body.result.token, deviceId: "d2" });
    assert.equal(await revoked, 4001);
    const gone = await left;
    assert.equal(gone.type, "peer-left");
    assert.equal(gone.payload.peerId, "u-admin-2");
    studentSocket.close();
    assert.equal(app.core._state().classes.find(item => item.id === "cls-demo-live").status, "scheduled");
  } finally { await app.close(); }
});

test("live mode serves live config, refuses preview methods and never grants modules on a client-side payment", async () => {
  const dir = mkdtempSync(join(tmpdir(), "rolevia-live-"));
  const app = await createApp({ env: { ROLEVIA_PREVIEW: "", ROLEVIA_OPS_PASSPHRASE: "a-long-founder-passphrase", ROLEVIA_PAYMENT_INSTRUCTIONS: "UPI rolevia@bank, quote the reference.", ROLEVIA_STATE_FILE: join(dir, "state.json"), ROLEVIA_STORAGE: "file" }, log: () => {} });
  await new Promise(resolve => app.server.listen(0, "127.0.0.1", resolve));
  const base = `http://127.0.0.1:${app.server.address().port}`;
  const post = async (method, payload) => { const response = await fetch(`${base}/api/${method}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload ?? {}) }); return { status: response.status, body: await response.json() }; };
  try {
    const config = await (await fetch(`${base}/config.json`)).json();
    assert.equal(config.mode, "live");
    assert.equal(config.apiBase, "/");
    assert.equal(config.payments, "manual");
    for (const method of ["previewInbox", "previewCredentials", "previewReset", "_state"]) assert.equal((await post(method)).status, 404, method);
    for (const path of ["/app/content/modules/spreadsheets.js", "/app/content/quiz-bank.js", "/app/content/modules/index.js"]) assert.equal((await fetch(`${base}${path}`)).status, 404, `${path} must not be served as a static file in live mode`);
    assert.equal((await fetch(`${base}/app/main.js`)).status, 200, "application code is still served");
    assert.equal(app.core._state().decks.length, 8, "workshop decks are seeded as drafts in production");
    assert.ok(app.core._state().decks.every(deck => deck.status === "draft"));
    const contact = await post("requestContactCode", { email: "first@learner.example", phone: "+919800000777" });
    const code = app.core._state().otps.find(otp => otp.purpose === "contact" && otp.contact === "first@learner.example").code;
    const application = await post("register", { name: "First Learner", email: "first@learner.example", phone: "+919800000777", city: "Pune", education: "mba", graduationYear: "2025", currentStatus: "fresher", preferredSlot: "weekend-morning", goal: "Move into an analyst role.", acceptedTerms: true, moduleIds: ["spreadsheets"], contactChallengeId: contact.body.result.challengeId, contactCode: code });
    assert.equal(application.status, 200, JSON.stringify(application.body));
    const paid = await post("pay", { applicationId: application.body.result.applicationId, currency: "INR", outcome: "success" });
    assert.equal(paid.status, 200);
    assert.equal(paid.body.result.manual, true);
    assert.equal(paid.body.result.status, "pending_payment", "no module is granted by a client-side success in live mode");
    assert.equal(paid.body.result.payment.status, "awaiting_confirmation");
    assert.match(paid.body.result.instructions, /rolevia@bank/);
    assert.deepEqual(app.core._state().users.find(user => user.id === application.body.result.applicationId).modules, []);
  } finally { await app.close(); }
});
