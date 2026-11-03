// Real-time transports for the classroom. Both deliver the same envelope:
// { room, from, role, name, to?, type, payload, at }. The preview uses BroadcastChannel (same browser, any
// number of tabs; identity is self-declared because every tab belongs to the same person). Production uses
// the WebSocket relay in server/signal.mjs, which stamps from/role/name from the verified session and
// announces peer-left events.

// Close codes after which reconnecting is pointless: another connection replaced this one, or access was revoked.
const TERMINAL_CLOSE_CODES = new Set([4000, 4001, 1008]);
const MAX_RECONNECT_ATTEMPTS = 6;

export function createLocalTransport({ roomId, peerId, role = "participant", name = "" }) {
  const channel = new BroadcastChannel(`rolevia-class-${roomId}`);
  const listeners = new Set();
  channel.onmessage = (event) => {
    const message = event.data;
    if (!message || message.from === peerId) return;
    if (message.to && message.to !== peerId) return;
    for (const listener of listeners) listener(message);
  };
  return {
    kind: "local",
    ready: Promise.resolve(),
    send(type, payload = {}, to = null) { channel.postMessage({ room: roomId, from: peerId, role, name, to, type, payload, at: Date.now() }); },
    subscribe(listener) { listeners.add(listener); return () => listeners.delete(listener); },
    close() { channel.close(); listeners.clear(); },
  };
}

export function createSocketTransport({ url, roomId, peerId, token, deviceId, onStatus }) {
  const listeners = new Set();
  let socket = null;
  let closed = false;
  let queue = [];
  let attempts = 0;
  let resolveReady;
  const ready = new Promise(resolve => { resolveReady = resolve; });
  const connect = () => {
    const target = new URL(url, location.href);
    if (target.protocol === "https:") target.protocol = "wss:";
    else if (target.protocol === "http:") target.protocol = "ws:";
    target.searchParams.set("room", roomId);
    target.searchParams.set("peer", peerId);
    target.searchParams.set("token", token);
    target.searchParams.set("device", deviceId);
    socket = new WebSocket(target.href);
    onStatus?.("connecting");
    socket.onopen = () => { attempts = 0; onStatus?.("open"); for (const message of queue) socket.send(JSON.stringify(message)); queue = []; resolveReady(); };
    socket.onmessage = (event) => { try { const message = JSON.parse(event.data); if (message.to && message.to !== peerId) return; for (const listener of listeners) listener(message); } catch { /* ignore malformed */ } };
    socket.onclose = (event) => {
      if (closed) { onStatus?.("closed"); return; }
      attempts += 1;
      if (TERMINAL_CLOSE_CODES.has(event.code) || attempts > MAX_RECONNECT_ATTEMPTS) { closed = true; onStatus?.("closed", { code: event.code, reason: event.reason || (attempts > MAX_RECONNECT_ATTEMPTS ? "signalling server unreachable" : ""), terminal: true }); return; }
      onStatus?.("closed", { code: event.code, reason: event.reason, terminal: false });
      setTimeout(connect, Math.min(8000, 500 * 2 ** attempts));
    };
    socket.onerror = () => { onStatus?.("error"); };
  };
  connect();
  return {
    kind: "socket",
    ready,
    send(type, payload = {}, to = null) { const message = { room: roomId, from: peerId, to, type, payload, at: Date.now() }; if (socket?.readyState === WebSocket.OPEN) socket.send(JSON.stringify(message)); else queue.push(message); },
    subscribe(listener) { listeners.add(listener); return () => listeners.delete(listener); },
    close() { closed = true; socket?.close(); listeners.clear(); },
  };
}
