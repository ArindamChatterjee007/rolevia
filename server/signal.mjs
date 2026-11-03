// WebSocket signalling relay for live classes: one room per class, messages relayed to the room or to a
// named peer, peer-left announcements, and access checks through the core API before a socket joins and
// again on every heartbeat (a revoked session, suspension or ended class closes the socket).
// Every relayed envelope carries the server-verified identity: `from`, `role` and `name` cannot be forged.
import { WebSocketServer } from "ws";

const MAX_PAYLOAD_BYTES = 64 * 1024;
const CLOSE_REPLACED = 4000;
const CLOSE_REVOKED = 4001;

export function attachSignalling(httpServer, { authorize, path = "/ws", log = () => {}, heartbeatMs = 15000 }) {
  const wss = new WebSocketServer({ noServer: true, maxPayload: MAX_PAYLOAD_BYTES });
  const rooms = new Map();

  httpServer.on("upgrade", async (request, socket, head) => {
    const url = new URL(request.url, "http://localhost");
    if (url.pathname !== path) { socket.destroy(); return; }
    const params = Object.fromEntries(url.searchParams);
    let identity;
    try { identity = await authorize(params); } catch (error) { log(`[ws] rejected: ${error.message}`); socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n"); socket.destroy(); return; }
    wss.handleUpgrade(request, socket, head, (ws) => wss.emit("connection", ws, { ...identity, params }));
  });

  wss.on("connection", (ws, identity) => {
    const { room, peer, role = "participant", name = "" } = identity;
    if (!rooms.has(room)) rooms.set(room, new Map());
    const members = rooms.get(room);
    members.get(peer)?.close(CLOSE_REPLACED, "replaced by a newer connection");
    members.set(peer, ws);
    ws.isAlive = true;
    ws.identity = identity;
    ws.on("pong", () => { ws.isAlive = true; });
    ws.on("message", (raw) => {
      let message;
      try { message = JSON.parse(raw); } catch { return; }
      if (!message || typeof message.type !== "string" || message.type === "peer-left") return;
      const envelope = JSON.stringify({ ...message, from: peer, role, name, room, at: Date.now() });
      if (message.to) { const target = members.get(String(message.to)); if (target && target !== ws && target.readyState === target.OPEN) target.send(envelope); return; }
      for (const [id, client] of members) if (id !== peer && client.readyState === client.OPEN) client.send(envelope);
    });
    ws.on("close", () => {
      if (members.get(peer) !== ws) return; // replaced by a newer socket of the same peer: nobody left
      members.delete(peer);
      const envelope = JSON.stringify({ room, from: peer, role, name, type: "peer-left", payload: { peerId: peer }, at: Date.now() });
      for (const client of members.values()) if (client.readyState === client.OPEN) client.send(envelope);
      if (!members.size) rooms.delete(room);
    });
  });

  const heartbeat = setInterval(() => {
    for (const ws of wss.clients) {
      if (!ws.isAlive) { ws.terminate(); continue; }
      ws.isAlive = false;
      ws.ping();
      authorize(ws.identity.params).catch(error => { log(`[ws] access revoked for ${ws.identity.peer}: ${error.message}`); ws.close(CLOSE_REVOKED, "access revoked"); });
    }
  }, heartbeatMs);
  return { wss, rooms, close: () => { clearInterval(heartbeat); wss.close(); } };
}
