import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createApp } from "../../server/api.mjs";

const once = (socket, event) => new Promise((resolve, reject) => { socket.addEventListener(event, resolve, { once: true }); socket.addEventListener("error", reject, { once: true }); });
const nextMessage = (socket) => new Promise(resolve => socket.addEventListener("message", (event) => resolve(JSON.parse(event.data)), { once: true }));

test("HTTP API serves the same methods as the preview, hides internals, and relays class signalling with authorisation", async () => {
  const dir = mkdtempSync(join(tmpdir(), "rolevia-"));
  const app = await createApp({ env: { ROLEVIA_PREVIEW: "1", ROLEVIA_STATE_FILE: join(dir, "state.json"), ROLEVIA_STORAGE: "file" }, log: () => {} });
  await new Promise(resolve => app.server.listen(0, "127.0.0.1", resolve));
  const port = app.server.address().port;
  const base = `http://127.0.0.1:${port}`;
  const post = async (method, payload) => { const response = await fetch(`${base}/api/${method}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload ?? {}) }); return { status: response.status, body: await response.json() }; };
  try {
    assert.equal((await fetch(`${base}/healthz`)).status, 200);
    assert.match(await (await fetch(`${base}/`)).text(), /Rolevia/);
    assert.equal((await (await fetch(`${base}/config.json`)).json()).signalUrl, "/ws");
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
    studentSocket.send(JSON.stringify({ type: "hello", payload: { name: "Ananya" } }));
    const hello = await heard;
    assert.equal(hello.type, "hello");
    assert.equal(hello.from, "u-student-1");
    const direct = nextMessage(studentSocket);
    hostSocket.send(JSON.stringify({ type: "signal", to: "u-student-1", payload: { description: { type: "offer", sdp: "v=0" } } }));
    assert.equal((await direct).payload.description.type, "offer");
    const left = nextMessage(studentSocket);
    hostSocket.close();
    const gone = await left;
    assert.equal(gone.type, "peer-left");
    assert.equal(gone.payload.peerId, "u-admin-2");
    studentSocket.close();
    assert.equal(app.core._state().classes.find(item => item.id === "cls-demo-live").status, "scheduled");
  } finally { await app.close(); }
});
