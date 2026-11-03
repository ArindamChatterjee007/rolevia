// WebSocket signalling relay for live classes: one room per class, messages relayed to the room or to a
// named peer, peer-left announcements, and access checks through the core API before a socket joins.
import { WebSocketServer } from "ws";

export function attachSignalling(httpServer, { authorize, path = "/ws", log = () => {} }) {
  const wss = new WebSocketServer({ noServer: true });
  const rooms = new Map();

  httpServer.on("upgrade", async (request, socket, head) => {
    const url = new URL(request.url, "http://localhost");
    if (url.pathname !== path) { socket.destroy(); return; }
    const params = Object.fromEntries(url.searchParams);
    let identity;
    try { identity = await authorize(params); } catch (error) { log(`[ws] rejected: ${error.message}`); socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n"); socket.destroy(); return; }
    wss.handleUpgrade(request, socket, head, (ws) => wss.emit("connection", ws, identity));
  });

  wss.on("connection", (ws, identity) => {
    const { room, peer } = identity;
    if (!rooms.has(room)) rooms.set(room, new Map());
    const members = rooms.get(room);
    members.get(peer)?.close(4000, "replaced by a newer connection");
    members.set(peer, ws);
    ws.isAlive = true;
    ws.on("pong", () => { ws.isAlive = true; });
    ws.on("message", (raw) => {
      let message;
      try { message = JSON.parse(raw); } catch { return; }
      if (!message || typeof message.type !== "string") return;
      const envelope = JSON.stringify({ ...message, from: peer, room, at: Date.now() });
      if (message.to) { members.get(message.to)?.send(envelope); return; }
      for (const [id, client] of members) if (id !== peer && client.readyState === client.OPEN) client.send(envelope);
    });
    ws.on("close", () => {
      if (members.get(peer) === ws) members.delete(peer);
      const envelope = JSON.stringify({ room, from: peer, type: "peer-left", payload: { peerId: peer }, at: Date.now() });
      for (const client of members.values()) if (client.readyState === client.OPEN) client.send(envelope);
      if (!members.size) rooms.delete(room);
    });
  });

  const heartbeat = setInterval(() => { for (const ws of wss.clients) { if (!ws.isAlive) { ws.terminate(); continue; } ws.isAlive = false; ws.ping(); } }, 15000);
  return { wss, rooms, close: () => { clearInterval(heartbeat); wss.close(); } };
}
