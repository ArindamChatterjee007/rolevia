// Composite class recording in the host's browser: screen share (or camera grid) + mixed audio,
// encoded with MediaRecorder and buffered in IndexedDB so long sessions do not sit in memory.

const DB_NAME = "rolevia-recordings";
const STORE = "chunks";

function openDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => { const db = request.result; if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE, { keyPath: "key", autoIncrement: true }).createIndex("recording", "recordingId"); };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
const tx = (db, mode, run) => new Promise((resolve, reject) => { const transaction = db.transaction(STORE, mode); const store = transaction.objectStore(STORE); const request = run(store); transaction.oncomplete = () => resolve(request?.result); transaction.onerror = () => reject(transaction.error); });

export async function listStoredRecordings() {
  const db = await openDb();
  const rows = (await tx(db, "readonly", store => store.getAll())) ?? [];
  const groups = new Map();
  for (const row of rows) { const group = groups.get(row.recordingId) ?? { recordingId: row.recordingId, classId: row.classId, size: 0, startedAt: row.startedAt, chunks: 0 }; group.size += row.blob.size; group.chunks += 1; groups.set(row.recordingId, group); }
  return [...groups.values()];
}
export async function assembleRecording(recordingId) {
  const db = await openDb();
  const rows = (await tx(db, "readonly", store => store.index("recording").getAll(recordingId))) ?? [];
  rows.sort((a, b) => a.key - b.key);
  return new Blob(rows.map(row => row.blob), { type: rows[0]?.blob.type || "video/webm" });
}
export async function deleteRecording(recordingId) {
  const db = await openDb();
  const rows = (await tx(db, "readonly", store => store.index("recording").getAll(recordingId))) ?? [];
  await tx(db, "readwrite", store => { for (const row of rows) store.delete(row.key); return null; });
}

export function createCompositeRecorder({ classId, canvasSize = [1280, 720], fps = 15, onTick, onError }) {
  const [width, height] = canvasSize;
  const canvas = document.createElement("canvas");
  canvas.width = width; canvas.height = height;
  const context = canvas.getContext("2d");
  let sources = { screen: null, tiles: [] };
  let recorder = null;
  let audioContext = null;
  let destination = null;
  const audioSources = new Map();
  let timer = null;
  let startedAt = 0;
  let recordingId = null;
  let bytes = 0;
  let failure = null;
  let db = null;
  const writes = new Set();

  const drawVideo = (video, x, y, w, h) => {
    if (!video || video.readyState < 2 || !video.videoWidth) { context.fillStyle = "#0f1b1a"; context.fillRect(x, y, w, h); return; }
    const scale = Math.min(w / video.videoWidth, h / video.videoHeight);
    const dw = video.videoWidth * scale, dh = video.videoHeight * scale;
    context.fillStyle = "#0b1413"; context.fillRect(x, y, w, h);
    context.drawImage(video, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
  };
  const label = (text, x, y) => { context.font = "600 22px Manrope, sans-serif"; const widthText = context.measureText(text).width; context.fillStyle = "rgba(11,20,19,0.75)"; context.fillRect(x, y - 28, widthText + 20, 36); context.fillStyle = "#f4f7f2"; context.fillText(text, x + 10, y); };
  const paint = () => {
    context.fillStyle = "#0b1413"; context.fillRect(0, 0, width, height);
    const tiles = sources.tiles.filter(tile => tile.video);
    if (sources.screen) {
      drawVideo(sources.screen, 0, 0, width, height);
      const pip = tiles[0];
      if (pip) { drawVideo(pip.video, width - 336, height - 204, 320, 180); label(pip.label, width - 330, height - 34); }
      label("Screen share", 16, 40);
    } else {
      const count = Math.max(1, Math.min(tiles.length, 6));
      const cols = count <= 1 ? 1 : count <= 4 ? 2 : 3;
      const rows = Math.ceil(count / cols);
      const cw = width / cols, ch = height / rows;
      tiles.slice(0, count).forEach((tile, index) => { const x = (index % cols) * cw, y = Math.floor(index / cols) * ch; drawVideo(tile.video, x + 4, y + 4, cw - 8, ch - 8); label(tile.label, x + 16, y + ch - 20); });
    }
    const elapsed = Math.round((Date.now() - startedAt) / 1000);
    context.fillStyle = "#ff7b7b"; context.beginPath(); context.arc(width - 30, 30, 9, 0, Math.PI * 2); context.fill();
    context.font = "700 20px Manrope, sans-serif"; context.fillStyle = "#f4f7f2"; context.fillText(`REC ${String(Math.floor(elapsed / 60)).padStart(2, "0")}:${String(elapsed % 60).padStart(2, "0")}`, width - 150, 38);
  };

  const syncAudio = (streams) => {
    if (!audioContext) return;
    const active = new Set();
    for (const stream of streams) for (const track of stream.getAudioTracks()) {
      active.add(track.id);
      if (!audioSources.has(track.id)) { try { const node = audioContext.createMediaStreamSource(new MediaStream([track])); node.connect(destination); audioSources.set(track.id, node); } catch { /* track not mixable */ } }
    }
    for (const [id, node] of audioSources) if (!active.has(id)) { node.disconnect(); audioSources.delete(id); }
  };

  return {
    get active() { return Boolean(recorder && recorder.state !== "inactive"); },
    get failure() { return failure; },
    get recordingId() { return recordingId; },
    get bytes() { return bytes; },
    get elapsedSeconds() { return startedAt ? Math.round((Date.now() - startedAt) / 1000) : 0; },
    update({ screen = null, tiles = [], audioStreams = [] }) { sources = { screen, tiles }; syncAudio(audioStreams); },
    async start() {
      if (this.active) return recordingId;
      db = await openDb();
      recordingId = `rec-${Date.now().toString(36)}`;
      startedAt = Date.now(); bytes = 0;
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
      await audioContext.resume().catch(() => {});
      destination = audioContext.createMediaStreamDestination();
      syncAudio([]);
      paint();
      timer = setInterval(() => { paint(); onTick?.(this.elapsedSeconds, bytes); }, 1000 / fps);
      const stream = new MediaStream([...canvas.captureStream(fps).getVideoTracks(), ...destination.stream.getAudioTracks()]);
      const mimeType = ["video/webm;codecs=vp9,opus", "video/webm;codecs=vp8,opus", "video/webm"].find(type => MediaRecorder.isTypeSupported(type)) ?? "";
      recorder = new MediaRecorder(stream, { mimeType: mimeType || undefined, videoBitsPerSecond: 1_200_000, audioBitsPerSecond: 64_000 });
      failure = null;
      recorder.ondataavailable = (event) => {
        if (!event.data?.size) return;
        // A failed chunk write (quota, private mode) must surface immediately rather than yield a silently truncated file.
        const write = tx(db, "readwrite", store => store.add({ recordingId, classId, startedAt, at: Date.now(), blob: event.data }))
          .then(() => { bytes += event.data.size; })
          .catch(error => { if (!failure) { failure = error instanceof Error ? error : new Error(String(error?.message ?? "storage write failed")); onError?.(failure); } });
        writes.add(write); write.finally(() => writes.delete(write));
      };
      recorder.onerror = (event) => { if (!failure) { failure = event.error ?? new Error("The browser stopped the recorder."); onError?.(failure); } };
      recorder.start(4000);
      return recordingId;
    },
    async stop() {
      if (!recorder) return null;
      const finished = new Promise(resolve => { recorder.onstop = resolve; });
      recorder.stop();
      await finished;
      await Promise.all([...writes]);
      clearInterval(timer);
      for (const node of audioSources.values()) node.disconnect();
      audioSources.clear();
      await audioContext?.close().catch(() => {});
      const durationSeconds = Math.round((Date.now() - startedAt) / 1000);
      const id = recordingId;
      recorder = null; audioContext = null; destination = null;
      const blob = await assembleRecording(id);
      return { recordingId: id, blob, size: blob.size, durationSeconds, mimeType: blob.type, name: `${classId}-${new Date(startedAt).toISOString().replace(/[:.]/g, "-")}.webm` };
    },
  };
}
