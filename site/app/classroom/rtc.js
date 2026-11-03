// WebRTC mesh room with "perfect negotiation" per peer pair, camera/mic/screen tracks, presence,
// heartbeat pruning and a generic broadcast channel for chat, quiz and reactions.

// Platform objects cannot cross BroadcastChannel (structured clone) and should not be trusted on the wire.
const plainDescription = (description) => ({ type: description.type, sdp: description.sdp });
const plainCandidate = (candidate) => ({ candidate: candidate.candidate, sdpMid: candidate.sdpMid, sdpMLineIndex: candidate.sdpMLineIndex, usernameFragment: candidate.usernameFragment ?? undefined });

export function createRoom({ transport, self, iceServers = [], media = true, heartbeatMs = 4000, staleMs = 14000, log = () => {} }) {
  const peers = new Map();
  const handlers = { peer: new Set(), stream: new Set(), leave: new Set(), message: new Set(), state: new Set() };
  const emit = (name, ...args) => { for (const handler of handlers[name]) handler(...args); };
  let localStream = null;
  let screenStream = null;
  let localState = { mic: true, camera: true, hand: false, sharing: false };
  let heartbeat = null;
  let closed = false;

  const presence = () => ({ name: self.name, role: self.role, avatar: self.avatar ?? null, state: localState, media, screenStreamId: screenStream?.id ?? null, cameraStreamId: localStream?.id ?? null });
  const addPeer = (id, info) => {
    let peer = peers.get(id);
    if (!peer) { peer = { id, streams: new Map(), pc: null, makingOffer: false, ignoreOffer: false, pendingCandidates: [], queue: Promise.resolve(), lastSeen: Date.now(), state: {} }; peers.set(id, peer); }
    Object.assign(peer, { name: info.name, role: info.role, avatar: info.avatar, state: info.state ?? peer.state, media: info.media !== false, screenStreamId: info.screenStreamId ?? null, cameraStreamId: info.cameraStreamId ?? null, lastSeen: Date.now() });
    return peer;
  };
  const polite = (peerId) => self.id < peerId;

  function ensureConnection(peer) {
    if (!media || !peer.media || peer.pc) return peer.pc;
    const pc = new RTCPeerConnection({ iceServers });
    peer.pc = pc;
    for (const track of localStream?.getTracks() ?? []) pc.addTrack(track, localStream);
    for (const track of screenStream?.getTracks() ?? []) pc.addTrack(track, screenStream);
    pc.onicecandidate = ({ candidate }) => { if (candidate) transport.send("signal", { candidate: plainCandidate(candidate) }, peer.id); };
    pc.ontrack = ({ track, streams }) => {
      const stream = streams[0] ?? new MediaStream([track]);
      peer.streams.set(stream.id, stream);
      track.onended = () => { peer.streams.delete(stream.id); emit("stream", peer); };
      stream.onremovetrack = () => { if (!stream.getTracks().length) { peer.streams.delete(stream.id); emit("stream", peer); } };
      emit("stream", peer);
    };
    pc.onnegotiationneeded = async () => {
      try {
        peer.makingOffer = true;
        await pc.setLocalDescription();
        transport.send("signal", { description: plainDescription(pc.localDescription) }, peer.id);
      } catch (error) { log("negotiation failed", error); } finally { peer.makingOffer = false; }
    };
    pc.onconnectionstatechange = () => { log(`peer ${peer.id} ${pc.connectionState}`); if (pc.connectionState === "failed") pc.restartIce(); emit("peer", peer); };
    return pc;
  }

  async function handleSignal(peer, { description, candidate }) {
    const pc = ensureConnection(peer);
    if (!pc) return;
    try {
      if (description) {
        const offerCollision = description.type === "offer" && (peer.makingOffer || pc.signalingState !== "stable");
        peer.ignoreOffer = !polite(peer.id) && offerCollision;
        if (peer.ignoreOffer) return;
        await pc.setRemoteDescription(description);
        for (const pending of peer.pendingCandidates.splice(0)) await pc.addIceCandidate(pending).catch(() => {});
        if (description.type === "offer") { await pc.setLocalDescription(); transport.send("signal", { description: plainDescription(pc.localDescription) }, peer.id); }
      } else if (candidate) {
        if (!pc.remoteDescription) { peer.pendingCandidates.push(candidate); return; }
        try { await pc.addIceCandidate(candidate); } catch (error) { if (!peer.ignoreOffer) throw error; }
      }
    } catch (error) { log("signal error", error); }
  }

  const unsubscribe = transport.subscribe(async (message) => {
    if (closed) return;
    const { from, type, payload } = message;
    // Identity stamped by the relay (message.role / message.name) wins over anything the sender claims.
    const identity = (info) => ({ ...info, role: message.role ?? info?.role, name: message.name || info?.name });
    if (type === "hello") { const peer = addPeer(from, identity(payload)); transport.send("welcome", presence(), from); ensureConnection(peer); emit("peer", peer); return; }
    if (type === "welcome") { const peer = addPeer(from, identity(payload)); ensureConnection(peer); emit("peer", peer); return; }
    const peer = peers.get(from);
    // An unknown pinger (e.g. after a reconnect) is greeted with hello so both sides add each other and negotiate.
    if (type === "ping") { if (peer) peer.lastSeen = Date.now(); else transport.send("hello", presence(), from); return; }
    if (type === "peer-left") { dropPeer(from, "left"); return; }
    if (!peer) return;
    peer.lastSeen = Date.now();
    if (type === "signal") { peer.queue = peer.queue.then(() => handleSignal(peer, payload)).catch(() => {}); return; }
    if (type === "state") { peer.state = payload.state; peer.screenStreamId = payload.screenStreamId ?? null; peer.cameraStreamId = payload.cameraStreamId ?? peer.cameraStreamId; emit("state", peer); emit("stream", peer); return; }
    if (type === "bye") { dropPeer(from, "left"); return; }
    emit("message", { from: peer, type, payload, at: message.at });
  });

  function dropPeer(id, reason) {
    const peer = peers.get(id);
    if (!peer) return;
    peer.pc?.close();
    peers.delete(id);
    emit("leave", peer, reason);
  }

  const room = {
    peers,
    get localStream() { return localStream; },
    get screenStream() { return screenStream; },
    get state() { return localState; },
    on(name, handler) { handlers[name].add(handler); return () => handlers[name].delete(handler); },
    async join(stream) {
      localStream = stream ?? null;
      localState = { ...localState, mic: Boolean(stream?.getAudioTracks().some(track => track.enabled)), camera: Boolean(stream?.getVideoTracks().some(track => track.enabled)) };
      await transport.ready;
      transport.send("hello", presence());
      heartbeat = setInterval(() => {
        transport.send("ping", {});
        for (const peer of [...peers.values()]) if (Date.now() - peer.lastSeen > staleMs) dropPeer(peer.id, "timeout");
      }, heartbeatMs);
    },
    setState(partial) {
      localState = { ...localState, ...partial };
      if (localStream) { for (const track of localStream.getAudioTracks()) track.enabled = localState.mic; for (const track of localStream.getVideoTracks()) track.enabled = localState.camera; }
      transport.send("state", { state: localState, screenStreamId: screenStream?.id ?? null, cameraStreamId: localStream?.id ?? null });
    },
    async startScreenShare(getStream) {
      if (screenStream) return screenStream;
      screenStream = await getStream();
      for (const peer of peers.values()) { const pc = ensureConnection(peer); if (pc) for (const track of screenStream.getTracks()) pc.addTrack(track, screenStream); }
      screenStream.getVideoTracks()[0]?.addEventListener("ended", () => room.stopScreenShare());
      room.setState({ sharing: true });
      return screenStream;
    },
    stopScreenShare() {
      if (!screenStream) return;
      const stopping = screenStream;
      screenStream = null;
      for (const peer of peers.values()) { if (!peer.pc) continue; for (const sender of peer.pc.getSenders()) if (sender.track && stopping.getTracks().includes(sender.track)) peer.pc.removeTrack(sender); }
      for (const track of stopping.getTracks()) track.stop();
      room.setState({ sharing: false });
    },
    broadcast(type, payload = {}, to = null) { transport.send(type, payload, to); },
    leave() {
      if (closed) return;
      closed = true;
      clearInterval(heartbeat);
      transport.send("bye", {});
      for (const peer of peers.values()) peer.pc?.close();
      peers.clear();
      for (const track of [...(localStream?.getTracks() ?? []), ...(screenStream?.getTracks() ?? [])]) track.stop();
      unsubscribe();
      setTimeout(() => transport.close(), 150);
    },
  };
  return room;
}

// videoDeviceId / audioDeviceId select an external camera or microphone; omitted means the browser default.
export async function getCameraStream({ video = true, audio = true, videoDeviceId = null, audioDeviceId = null } = {}) {
  if (!navigator.mediaDevices?.getUserMedia) throw new Error("This browser does not support camera and microphone access.");
  return navigator.mediaDevices.getUserMedia({
    video: video ? { width: { ideal: 640 }, height: { ideal: 360 }, frameRate: { ideal: 24 }, ...(videoDeviceId ? { deviceId: { exact: videoDeviceId } } : {}) } : false,
    audio: audio ? { echoCancellation: true, noiseSuppression: true, ...(audioDeviceId ? { deviceId: { exact: audioDeviceId } } : {}) } : false,
  });
}

export async function listMediaDevices() {
  if (!navigator.mediaDevices?.enumerateDevices) return { cameras: [], microphones: [] };
  const devices = await navigator.mediaDevices.enumerateDevices();
  const label = (device, index, kind) => device.label || `${kind} ${index + 1}`;
  return {
    cameras: devices.filter(device => device.kind === "videoinput").map((device, index) => ({ id: device.deviceId, label: label(device, index, "Camera") })),
    microphones: devices.filter(device => device.kind === "audioinput").map((device, index) => ({ id: device.deviceId, label: label(device, index, "Microphone") })),
  };
}

export async function getScreenStream({ testFallback = false } = {}) {
  try {
    if (!navigator.mediaDevices?.getDisplayMedia) throw new Error("Screen sharing is not supported in this browser.");
    return await navigator.mediaDevices.getDisplayMedia({ video: { frameRate: { ideal: 10 } }, audio: false });
  } catch (error) {
    if (!testFallback) throw error;
    // Automated test runs cannot show the screen picker: synthesise a moving slide so renegotiation is still exercised.
    const canvas = document.createElement("canvas");
    canvas.width = 640; canvas.height = 360;
    const context = canvas.getContext("2d");
    let frame = 0;
    const draw = () => { context.fillStyle = "#163a37"; context.fillRect(0, 0, 640, 360); context.fillStyle = "#dfed9d"; context.font = "bold 32px sans-serif"; context.fillText(`Simulated screen · frame ${frame += 1}`, 40, 180); };
    draw();
    const timer = setInterval(draw, 250);
    const stream = canvas.captureStream(10);
    stream.getVideoTracks()[0].addEventListener("ended", () => clearInterval(timer));
    stream.simulated = true;
    return stream;
  }
}
