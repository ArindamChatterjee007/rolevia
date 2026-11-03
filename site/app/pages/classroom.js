import { h, icon, avatar, toast, busy, modal, field, formData, formatBytes, confetti, showFieldErrors } from "../ui.js";
import { ctx, withSession, setAuth } from "../context.js";
import { brand, errorBox } from "./components.js";
import { createLocalTransport, createSocketTransport } from "../classroom/transport.js";
import { createRoom, getCameraStream, getScreenStream } from "../classroom/rtc.js";
import { createCompositeRecorder, listStoredRecordings, assembleRecording, deleteRecording } from "../classroom/recorder.js";
import { driveConfigured, driveAuthUrl, driveToken, uploadToDrive, shareDriveFileWithLink } from "../classroom/drive.js";

export const classroomGuard = () => (ctx.auth.token && ["student", "admin"].includes(ctx.auth.type) ? null : `/login?next=${encodeURIComponent(location.hash.replace(/^#/, ""))}`);

const clock = (seconds) => `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;

export async function classroomPage({ id }, query) {
  const page = h("div", { class: "classroom" });
  const splash = (content) => page.replaceChildren(h("div", { class: "classroom-gate" }, h("div", { class: "gate-card" }, brand(34), content)));
  splash(h("p", { class: "muted" }, "Opening the class room…"));
  let access;
  try { access = await ctx.api.classAccess(withSession({ classId: id })); }
  catch (error) {
    if (error.code === "PASSWORD_CHANGE_REQUIRED") { location.hash = ctx.auth.type === "admin" ? "#/admin/account?first=1" : "#/portal/profile?first=1"; return page; }
    if (["SESSION_REVOKED", "AUTH_REQUIRED", "SESSION_EXPIRED", "DEVICE_MISMATCH"].includes(error.code)) { setAuth({}); location.hash = `#/login?next=${encodeURIComponent(`/classroom/${id}`)}`; return page; }
    splash(h("div", { class: "stack" }, errorBox(error), h("a", { class: "button ghost", href: ctx.auth.type === "admin" ? "#/admin/classes" : "#/portal/classes" }, "Back to classes")));
    return page;
  }
  if (query.resume === "recording" && access.room.role === "host") { splash(await resumeRecordingPanel(access)); return page; }
  renderPrejoin(page, access);
  return page;
}

function renderPrejoin(page, access) {
  const { room, class: cls } = access;
  const isHost = room.role === "host";
  const builtin = cls.mode === "builtin";
  const preview = h("video", { class: "prejoin-video", autoplay: true, playsinline: true, muted: true });
  const toggles = { mic: true, camera: true };
  let stream = null;
  const status = h("p", { class: "small muted" }, builtin ? "Requesting camera and microphone…" : "This class uses an external meeting link for video. Rolevia keeps chat, hands and live questions here.");
  const applyToggles = () => { if (!stream) return; stream.getAudioTracks().forEach(track => { track.enabled = toggles.mic; }); stream.getVideoTracks().forEach(track => { track.enabled = toggles.camera; }); };
  const toggleButton = (key, label, iconName) => h("button", { class: `button ghost small ${toggles[key] ? "" : "off"}`, type: "button", "aria-pressed": String(toggles[key]), onClick: (event) => { toggles[key] = !toggles[key]; applyToggles(); event.currentTarget.classList.toggle("off", !toggles[key]); event.currentTarget.setAttribute("aria-pressed", String(toggles[key])); } }, icon(iconName, 14), label);
  const join = h("button", { class: "button primary large", type: "button", disabled: builtin, onClick: async (event) => {
    busy(event.currentTarget, true, "Joining");
    try {
      if (isHost && cls.status === "scheduled") await ctx.api.adminSetClassStatus(withSession({ classId: cls.id, status: "live" }));
      const joined = await ctx.api.joinClass(withSession({ classId: cls.id }));
      renderRoom(page, joined, stream, toggles);
    } catch (error) { toast(error.message, "error", 6000); busy(event.currentTarget, false, "Join class"); }
  } }, icon("play", 16), isHost && cls.status === "scheduled" ? "Start class and join" : "Join class");
  const withoutCamera = h("button", { class: "link-button", type: "button", hidden: true, onClick: () => { stream = null; join.disabled = false; status.textContent = "Joining without camera or microphone: you can still watch, chat and answer questions."; } }, "Join without camera");
  page.replaceChildren(h("div", { class: "classroom-gate" }, h("div", { class: "gate-card wide" },
    h("div", { class: "gate-head" }, brand(30), h("span", { class: `tag ${cls.status === "live" ? "live" : "pending"}` }, cls.status === "live" ? "Live now" : "Scheduled")),
    h("p", { class: "eyebrow" }, cls.moduleTitle), h("h1", {}, cls.title), h("p", { class: "muted small" }, `Host ${cls.hostName} · ${cls.durationMinutes} min · you join as ${isHost ? "host" : room.name}`),
    builtin ? h("div", { class: "prejoin-grid" }, h("div", { class: "prejoin-preview" }, preview), h("div", { class: "stack" }, h("div", { class: "form-actions start" }, toggleButton("mic", "Microphone", "bell"), toggleButton("camera", "Camera", "eye")), status, withoutCamera, h("p", { class: "tiny muted" }, "One active device per account. Your camera and microphone stay on this device; the host may record the class and will say so in the room."))) : h("div", { class: "stack" }, status, cls.externalUrl ? h("a", { class: "button ghost", href: cls.externalUrl, target: "_blank", rel: "noopener noreferrer" }, "Open the meeting link") : null),
    h("div", { class: "form-actions" }, h("a", { class: "button ghost", href: isHost ? "#/admin/classes" : "#/portal/classes" }, "Back"), join))));
  if (builtin) {
    getCameraStream().then(media => { stream = media; preview.srcObject = media; applyToggles(); status.textContent = "Camera ready. Check your framing, then join."; join.disabled = false; })
      .catch(error => { status.textContent = `Camera/microphone unavailable: ${error.message}`; withoutCamera.hidden = false; join.disabled = true; });
  }
}

function renderRoom(page, access, localStream, toggles) {
  const { room: roomInfo, class: cls } = access;
  const isHost = roomInfo.role === "host";
  const builtin = cls.mode === "builtin";
  const signalUrl = ctx.config.signalUrl;
  const connection = h("span", { class: "tiny muted" }, "Connecting"); // declared before the transport, which reports status synchronously
  const onTransportStatus = (state, detail) => {
    connection.textContent = state === "open" ? "Connected" : state === "closed" && !detail?.terminal ? "Reconnecting" : state;
    if (state !== "closed" || !detail?.terminal || ended) return;
    const reason = detail.code === 4000 ? "This account joined the class from another tab or device, so this one was disconnected." : detail.code === 4001 ? "Your access to this class ended (signed out elsewhere, or the class closed)." : `The class connection was lost (${detail.reason || "signalling server unreachable"}).`;
    toast(reason, "error", 8000);
    cleanup();
    location.hash = isHost ? `#/admin/classes/${cls.id}` : "#/portal/classes";
  };
  const transport = signalUrl ? createSocketTransport({ url: signalUrl, roomId: cls.id, peerId: roomInfo.peerId, token: ctx.auth.token, deviceId: ctx.device.id, onStatus: onTransportStatus }) : createLocalTransport({ roomId: cls.id, peerId: roomInfo.peerId, role: roomInfo.role, name: roomInfo.name });
  const room = createRoom({ transport, self: { id: roomInfo.peerId, name: roomInfo.name, role: roomInfo.role, avatar: roomInfo.avatar }, iceServers: ctx.config.iceServers ?? roomInfo.iceServers, media: builtin, heartbeatMs: ctx.testMode ? 1500 : 4000, staleMs: ctx.testMode ? 6000 : 14000, log: ctx.testMode ? (...args) => console.warn("[rtc]", ...args) : () => {} });

  // ---------- state ----------
  const chat = [];
  let activeQuiz = access.openQuiz;
  let quizTimer = null;
  let pinned = null;
  let panel = "people";
  let ended = false;
  let recorder = null;
  let recordingTimer = null;
  const videoCache = new Map();
  const startedAt = Date.now();

  // ---------- layout ----------
  if (transport.kind === "local") connection.textContent = "Same-browser preview room";
  const elapsed = h("span", { class: "room-clock" }, "00:00");
  const stage = h("div", { class: "room-stage" });
  const tiles = h("div", { class: "room-tiles" });
  const panelBody = h("div", { class: "panel-body" });
  const panelTabs = h("div", { class: "panel-tabs", role: "tablist" });
  const quizOverlay = h("div", { class: "quiz-overlay", hidden: true });
  const recBadge = h("span", { class: "rec-badge", hidden: true }, h("span", { class: "rec-dot" }), "REC 00:00");
  const controls = h("div", { class: "room-controls" });
  const sidePanel = h("aside", { class: "room-panel" }, panelTabs, panelBody);
  const header = h("header", { class: "room-top" }, h("div", { class: "room-title" }, brand(26), h("div", {}, h("strong", {}, cls.title), h("span", { class: "tiny muted block" }, `${cls.moduleTitle} · host ${cls.hostName}`))), h("div", { class: "room-top-right" }, recBadge, h("span", { class: "tag live" }, "Live"), elapsed, connection, isHost ? h("button", { class: "button danger small", type: "button", onClick: endClass }, "End class") : h("button", { class: "button ghost small", type: "button", onClick: leaveRoom }, icon("logout", 14), "Leave")));
  page.replaceChildren(h("div", { class: "room" }, header, h("div", { class: "room-main" }, h("div", { class: "room-center" }, stage, tiles, quizOverlay), sidePanel), controls));
  const clockTimer = setInterval(() => { elapsed.textContent = clock(Math.round((Date.now() - startedAt) / 1000)); }, 1000);

  // ---------- video tiles ----------
  const videoFor = (key, stream, muted) => {
    let video = videoCache.get(key);
    if (!video) { video = h("video", { autoplay: true, playsinline: true, muted, dataset: { key } }); videoCache.set(key, video); }
    if (video.srcObject !== stream) { video.srcObject = stream; video.play?.().catch(() => {}); }
    return video;
  };
  const participants = () => {
    const self = { id: roomInfo.peerId, name: `${roomInfo.name} (you)`, role: roomInfo.role, avatar: roomInfo.avatar, state: room.state, self: true, camera: room.localStream, screen: room.screenStream };
    const others = [...room.peers.values()].map(peer => { const screen = peer.screenStreamId ? peer.streams.get(peer.screenStreamId) : null; const camera = [...peer.streams.values()].find(stream => stream.id !== peer.screenStreamId) ?? null; return { id: peer.id, name: peer.name, role: peer.role, avatar: peer.avatar, state: peer.state ?? {}, self: false, camera, screen, pc: peer.pc }; });
    return [self, ...others].sort((a, b) => (a.role === "host" ? -1 : 0) - (b.role === "host" ? -1 : 0));
  };
  const tile = (person, { large = false } = {}) => {
    const stream = person.camera;
    const hasVideo = stream && person.state?.camera !== false && stream.getVideoTracks().length;
    return h("div", { class: `tile ${large ? "large" : ""} ${person.role === "host" ? "is-host" : ""} ${person.state?.hand ? "hand" : ""}`, dataset: { peer: person.id }, onClick: () => { if (!large) { pinned = pinned === person.id ? null : person.id; renderStage(); } } },
      hasVideo ? videoFor(`${person.id}:cam`, stream, person.self) : h("div", { class: "tile-placeholder" }, avatar(person, large ? 96 : 56), person.self && !stream ? h("span", { class: "tiny muted" }, "No camera") : null),
      stream && !person.self && !hasVideo ? h("audio", { autoplay: true, srcObject: stream }) : null,
      h("div", { class: "tile-name" }, person.state?.hand ? "✋ " : "", person.name, person.role === "host" ? h("span", { class: "tile-role" }, "Host") : null, person.state?.mic === false ? icon("close", 12) : null));
  };
  const renderStage = () => {
    const people = participants();
    const sharer = people.find(person => person.screen);
    const featured = sharer ? { ...sharer, camera: sharer.screen, name: `${sharer.name} · screen`, state: { camera: true } } : people.find(person => person.id === pinned) ?? people.find(person => person.role === "host") ?? people[0];
    stage.replaceChildren(featured ? h("div", { class: "stage-frame" }, featured.camera && featured.state?.camera !== false ? videoFor(`stage:${featured.id}:${sharer ? "screen" : "cam"}`, featured.camera, featured.self) : h("div", { class: "tile-placeholder large" }, avatar(featured, 120), h("p", { class: "muted" }, featured.name)), h("div", { class: "stage-label" }, featured.name)) : h("div", { class: "stage-empty" }, h("p", { class: "muted" }, "Waiting for participants…")));
    tiles.replaceChildren(...people.map(person => tile(person)));
    if (recorder?.active) recorder.update({ screen: sharer ? videoCache.get(`stage:${sharer.id}:screen`) : null, tiles: people.filter(person => person.camera).map(person => ({ video: videoCache.get(`${person.id}:cam`), label: person.name.replace(" (you)", "") })), audioStreams: [room.localStream, ...people.filter(person => !person.self && person.camera).map(person => person.camera)].filter(Boolean) });
    renderPanel();
  };

  // ---------- side panel ----------
  const setPanel = (next) => { panel = next; renderPanel(); };
  const renderPanel = () => {
    panelTabs.replaceChildren(...[["people", `People · ${room.peers.size + 1}`], ["chat", chat.length ? `Chat · ${chat.length}` : "Chat"], ["quiz", isHost ? "Live quiz" : "Questions"]].map(([key, label]) => h("button", { type: "button", role: "tab", class: key === panel ? "active" : "", "aria-selected": String(key === panel), onClick: () => setPanel(key) }, label)), h("button", { type: "button", class: "panel-close", "aria-label": "Close panel", onClick: () => sidePanel.classList.remove("open") }, icon("close", 16)));
    if (panel === "people") renderPeople(); else if (panel === "chat") renderChat(); else renderQuizPanel();
  };
  const renderPeople = () => {
    panelBody.replaceChildren(h("div", { class: "stack" }, h("ul", { class: "roster" }, participants().map(person => h("li", {}, avatar(person, 32), h("div", { class: "grow" }, h("strong", {}, person.name), h("span", { class: "tiny muted block" }, [person.role === "host" ? "Host" : "Learner", person.state?.mic === false ? "muted" : "mic on", person.state?.camera === false ? "camera off" : null, person.state?.sharing ? "sharing" : null].filter(Boolean).join(" · "))), person.state?.hand ? h("span", { class: "tag pending" }, "✋ Hand") : null, isHost && !person.self && person.state?.mic !== false ? h("button", { class: "mini", type: "button", onClick: () => room.broadcast("request", { action: "mute" }, person.id) }, "Ask to mute") : null))),
      cls.mode === "external" && cls.externalUrl ? h("a", { class: "button ghost small block", href: cls.externalUrl, target: "_blank", rel: "noopener noreferrer" }, "Open the meeting link") : null,
      h("p", { class: "tiny muted" }, transport.kind === "local" ? "Preview: this room connects tabs in the same browser. The production signalling server connects devices anywhere." : "Audio and video travel peer-to-peer, encrypted. Chat, questions, reactions and connection messages pass through Rolevia's signalling server, which verifies who sent them.")));
  };
  const chatList = h("div", { class: "chat-list" });
  const renderChat = () => {
    chatList.replaceChildren(...chat.map(message => h("div", { class: `chat-msg ${message.self ? "self" : ""}` }, h("span", { class: "chat-from" }, message.from), h("span", { class: "chat-text" }, message.text))));
    const form = h("form", { class: "chat-form", novalidate: true, onSubmit: (event) => { event.preventDefault(); const text = form.querySelector("input").value.trim(); if (!text) return; const message = { from: roomInfo.name, text: text.slice(0, 500), self: true, at: Date.now() }; chat.push(message); room.broadcast("chat", { text: message.text }); form.reset(); renderChat(); } }, h("input", { class: "input", placeholder: "Message everyone", "aria-label": "Chat message", maxlength: 500 }), h("button", { class: "button primary small", type: "submit" }, "Send"));
    panelBody.replaceChildren(chatList, form);
    chatList.scrollTop = chatList.scrollHeight;
  };

  // ---------- live quiz ----------
  const bankByModule = isHost ? (access.questionBank ?? []) : [];
  const renderQuizPanel = () => {
    if (!isHost) { panelBody.replaceChildren(activeQuiz ? h("p", { class: "small" }, "A question is on your screen. Answer before the timer ends.") : h("p", { class: "muted small" }, "When the host sends a question it appears on your screen. Correct answers earn 10 points, taking part earns 2.")); return; }
    if (activeQuiz) {
      const results = h("div", { class: "result-bars" });
      const paintResults = (quiz) => results.replaceChildren(...quiz.options.map((option, index) => { const count = quiz.counts?.[index] ?? 0; const total = Math.max(1, quiz.answered); return h("div", { class: `result-bar ${quiz.closedAt && index === quiz.answerIndex ? "correct" : ""}` }, h("span", { class: "result-label" }, option), h("div", { class: "bar" }, h("div", { class: "bar-fill", style: { width: `${(count / total) * 100}%` } })), h("span", { class: "result-count" }, count)); }), h("p", { class: "tiny muted" }, `${quiz.answered} of ${room.peers.size} answered`));
      paintResults(activeQuiz);
      panelBody.replaceChildren(h("div", { class: "stack" }, h("p", { class: "eyebrow" }, activeQuiz.closedAt ? "Closed" : "Live question"), h("strong", {}, activeQuiz.question), results, activeQuiz.closedAt ? h("button", { class: "button ghost small", type: "button", onClick: () => { activeQuiz = null; renderQuizPanel(); } }, "Send another question") : h("button", { class: "button primary small", type: "button", onClick: () => closeQuiz() }, "Close and reveal answer")));
      panelBody.paintResults = paintResults;
      return;
    }
    const bankSelect = h("select", { class: "input", "aria-label": "Question from the module bank" }, h("option", { value: "" }, "Choose a question from the bank…"), bankByModule.map(question => h("option", { value: question.id }, question.question.slice(0, 90))));
    const seconds = h("select", { class: "input", "aria-label": "Timer" }, [30, 45, 60, 90].map(value => h("option", { value, selected: value === 45 }, `${value} seconds`)));
    const customForm = h("form", { class: "form-grid", novalidate: true, onSubmit: async (event) => { event.preventDefault(); const values = formData(customForm); const options = String(values.options).split("\n").map(line => line.trim()).filter(Boolean); await sendQuiz({ question: values.question, options, answerIndex: Number(values.answerIndex) - 1, seconds: Number(seconds.value) }, customForm); } },
      field({ label: "Your own question", name: "question", type: "textarea", rows: 2, placeholder: "What should the summary tab show first?" }), field({ label: "Options (one per line, 2-6)", name: "options", type: "textarea", rows: 3 }), field({ label: "Correct option number", name: "answerIndex", type: "number", value: 1, min: 1, max: 6 }),
      h("div", { class: "form-actions" }, h("button", { class: "button ghost small", type: "submit" }, "Send custom question")));
    panelBody.replaceChildren(h("div", { class: "stack" }, h("p", { class: "small muted" }, "The question appears on every participant's screen with a countdown. Answers are scored when you close it."), h("label", { class: "field" }, h("span", { class: "field-label" }, "Timer"), seconds), h("label", { class: "field" }, h("span", { class: "field-label" }, "From the module question bank"), bankSelect), h("button", { class: "button primary small", type: "button", onClick: async (event) => { if (!bankSelect.value) { toast("Pick a question first.", "info"); return; } busy(event.currentTarget, true, "Sending"); await sendQuiz({ questionId: bankSelect.value, seconds: Number(seconds.value) }); } }, icon("quiz", 14), "Send to class"), h("details", { class: "edit-row new" }, h("summary", {}, "Write a custom question or poll"), customForm)));
  };
  async function sendQuiz(payload, form) {
    try {
      const quiz = await ctx.api.adminPushQuiz(withSession({ classId: cls.id, ...payload }));
      activeQuiz = quiz;
      room.broadcast("quiz", { quiz: { ...quiz, answerIndex: null, counts: null, explanation: null } });
      scheduleAutoClose(quiz);
      renderQuizPanel();
      toast("Question sent to everyone in the room.", "success");
    } catch (error) { if (!form || !showFieldErrors(form, error.extra?.fields ?? {})) toast(error.message, "error"); renderQuizPanel(); }
  }
  function scheduleAutoClose(quiz) { clearTimeout(quizTimer); quizTimer = setTimeout(() => { if (activeQuiz?.id === quiz.id && !activeQuiz.closedAt) closeQuiz(); }, Math.max(0, quiz.closesAt - Date.now()) + 800); }
  async function closeQuiz() {
    if (!activeQuiz) return;
    try {
      const closed = await ctx.api.adminCloseQuiz(withSession({ classId: cls.id, quizId: activeQuiz.id }));
      activeQuiz = closed;
      room.broadcast("quiz-close", { quiz: closed });
      renderQuizPanel();
    } catch (error) { toast(error.message, "error"); }
  }
  async function refreshQuizCounts() {
    if (!isHost || !activeQuiz) return;
    try { activeQuiz = await ctx.api.classQuizStatus(withSession({ classId: cls.id, quizId: activeQuiz.id })); panelBody.paintResults?.(activeQuiz); } catch { /* ignore */ }
  }
  let overlayTimer = null;
  const showQuizOverlay = (quiz) => {
    activeQuiz = quiz;
    clearInterval(overlayTimer);
    const countdown = h("span", { class: "quiz-countdown" });
    const tick = () => { const left = Math.max(0, Math.round((quiz.closesAt - Date.now()) / 1000)); countdown.textContent = `${left}s`; if (left === 0) { clearInterval(overlayTimer); countdown.textContent = "Time is up"; options.querySelectorAll("button").forEach(button => { button.disabled = true; }); } };
    const status = h("p", { class: "small muted" }, "Choose one answer.");
    const options = h("div", { class: "quiz-options" }, quiz.options.map((option, index) => h("button", { class: "quiz-option", type: "button", disabled: quiz.myAnswer !== null, onClick: async (event) => { options.querySelectorAll("button").forEach(button => { button.disabled = true; }); event.currentTarget.classList.add("chosen"); try { await ctx.api.classQuizAnswer(withSession({ classId: cls.id, quizId: quiz.id, answerIndex: index })); status.textContent = "Answer recorded. Waiting for the host to reveal the result."; room.broadcast("answered", { quizId: quiz.id }); } catch (error) { status.textContent = error.message; } } }, h("span", { class: "quiz-letter" }, String.fromCharCode(65 + index)), option)));
    if (quiz.myAnswer !== null) { options.children[quiz.myAnswer]?.classList.add("chosen"); status.textContent = "Answer recorded. Waiting for the host to reveal the result."; }
    quizOverlay.replaceChildren(h("div", { class: "quiz-card pop" }, h("div", { class: "quiz-head" }, h("span", { class: "eyebrow" }, "Live question"), countdown), h("h3", {}, quiz.question), options, status));
    quizOverlay.hidden = false;
    tick(); overlayTimer = setInterval(tick, 500);
    setPanel("quiz");
  };
  const showQuizResult = async (closed) => {
    clearInterval(overlayTimer);
    let mine = closed;
    try { mine = await ctx.api.classQuizStatus(withSession({ classId: cls.id, quizId: closed.id })); } catch { /* fall back to host payload */ }
    const correct = mine.myAnswer !== null && mine.myAnswer === mine.answerIndex;
    if (correct) confetti(1200);
    quizOverlay.replaceChildren(h("div", { class: `quiz-card pop ${mine.myAnswer === null ? "" : correct ? "good" : "bad"}` }, h("div", { class: "quiz-head" }, h("span", { class: "eyebrow" }, "Result"), h("span", { class: "tag good" }, mine.myPoints !== null ? `+${mine.myPoints} points` : "Not answered")), h("h3", {}, mine.question), h("p", { class: "small" }, h("strong", {}, "Correct answer: "), mine.options[mine.answerIndex]), mine.explanation ? h("p", { class: "small muted" }, mine.explanation) : null, h("div", { class: "result-bars" }, mine.options.map((option, index) => { const count = mine.counts?.[index] ?? 0; const total = Math.max(1, mine.answered); return h("div", { class: `result-bar ${index === mine.answerIndex ? "correct" : ""} ${index === mine.myAnswer ? "mine" : ""}` }, h("span", { class: "result-label" }, option), h("div", { class: "bar" }, h("div", { class: "bar-fill", style: { width: `${(count / total) * 100}%` } })), h("span", { class: "result-count" }, count)); })), h("button", { class: "button ghost small", type: "button", onClick: () => { quizOverlay.hidden = true; activeQuiz = null; renderPanel(); } }, "Continue")));
    quizOverlay.hidden = false;
  };

  // ---------- controls ----------
  const controlButton = (key, label, iconName, onClick, { danger = false } = {}) => h("button", { class: `control ${danger ? "danger" : ""}`, type: "button", dataset: { control: key }, "aria-label": label, title: label, onClick }, icon(iconName, 20), h("span", {}, label));
  const renderControls = () => {
    const state = room.state;
    controls.replaceChildren(...[
      builtin && room.localStream ? controlButton("mic", state.mic ? "Mute" : "Unmute", "bell", () => { room.setState({ mic: !room.state.mic }); renderControls(); renderStage(); }) : null,
      builtin && room.localStream ? controlButton("camera", state.camera ? "Camera off" : "Camera on", "eye", () => { room.setState({ camera: !room.state.camera }); renderControls(); renderStage(); }) : null,
      builtin ? controlButton("share", state.sharing ? "Stop sharing" : "Share screen", "upload", async () => { try { if (room.screenStream) room.stopScreenShare(); else await room.startScreenShare(() => getScreenStream({ testFallback: ctx.testMode })); } catch (error) { toast(error.name === "NotAllowedError" ? "Screen sharing was cancelled." : error.message, "info"); } renderControls(); renderStage(); }) : null,
      controlButton("hand", state.hand ? "Lower hand" : "Raise hand", "flag", () => { room.setState({ hand: !room.state.hand }); if (room.state.hand) room.broadcast("reaction", { emoji: "✋" }); renderControls(); renderStage(); }),
      controlButton("react", "Thumbs up", "star", () => { room.broadcast("reaction", { emoji: "👍" }); floatReaction("👍", roomInfo.name); }),
      isHost && builtin ? controlButton("record", recorder?.active ? "Stop recording" : "Record", "play", toggleRecording, { danger: Boolean(recorder?.active) }) : null,
      controlButton("chat", "Chat", "mail", () => { setPanel("chat"); sidePanel.classList.add("open"); }),
      isHost ? controlButton("quiz", "Live quiz", "quiz", () => { setPanel("quiz"); sidePanel.classList.add("open"); }) : null,
      controlButton("leave", isHost ? "End class" : "Leave", "logout", isHost ? endClass : leaveRoom, { danger: true })].filter(Boolean));
    const classes = { mic: !state.mic, camera: !state.camera, share: state.sharing, hand: state.hand, record: recorder?.active };
    for (const [key, on] of Object.entries(classes)) controls.querySelector(`[data-control="${key}"]`)?.classList.toggle("on", Boolean(on));
  };
  const floatReaction = (emoji, from) => { const bubble = h("div", { class: "reaction" }, emoji, h("small", {}, from)); page.querySelector(".room-center").append(bubble); setTimeout(() => bubble.remove(), 2200); };

  // ---------- recording ----------
  async function toggleRecording() {
    if (!recorder) recorder = createCompositeRecorder({ classId: cls.id, onTick: (seconds) => { recBadge.lastChild.textContent = `REC ${clock(seconds)}`; }, onError: async (error) => { toast(`Recording problem: ${error.message}. Stopping and saving what was captured so far.`, "error", 9000); if (recorder?.active) await toggleRecording(); } });
    if (recorder.active) {
      clearInterval(recordingTimer);
      const result = await recorder.stop();
      recBadge.hidden = true;
      room.broadcast("recording", { on: false });
      renderControls();
      if (result) saveRecordingDialog(result);
      return;
    }
    modal({ title: "Record this class?", body: h("div", {}, h("p", {}, "The recording combines the shared screen (or the camera grid) with everyone's audio and is saved on this device while the class runs. Participants are told that recording is on."), h("p", { class: "small muted" }, "After you stop, you can download the file, upload it to Google Drive and attach the link to the class.")), actions: [{ label: "Start recording", onClick: async () => { try { await recorder.start(); renderStage(); recBadge.hidden = false; room.broadcast("recording", { on: true }); recordingTimer = setInterval(renderStage, 2000); renderControls(); toast("Recording started.", "success"); } catch (error) { toast(`Recording failed: ${error.message}`, "error"); } } }] });
  }
  function saveRecordingDialog(result) {
    const url = URL.createObjectURL(result.blob);
    const linkForm = h("form", { class: "form-grid", novalidate: true, onSubmit: async (event) => { event.preventDefault(); const values = formData(linkForm); try { await ctx.api.adminAddRecording(withSession({ classId: cls.id, url: values.url, name: result.name, size: result.size, durationSeconds: result.durationSeconds, storage: values.url.includes("drive.google.com") ? "drive" : values.url.includes("github.com") ? "github" : "link" })); toast("Recording link attached to the class.", "success"); dialog.close(); } catch (error) { if (!showFieldErrors(linkForm, error.extra?.fields ?? {})) toast(error.message, "error"); } } }, field({ label: "Paste the shared link (Google Drive, GitHub release…)", name: "url", type: "url", placeholder: "https://drive.google.com/file/d/…/view" }), h("div", { class: "form-actions" }, h("button", { class: "button primary small", type: "submit" }, "Attach link")));
    const progress = h("div", { class: "bar" }, h("div", { class: "bar-fill", style: { width: "0%" } }));
    const driveButton = driveConfigured(ctx.config) ? h("button", { class: "button ghost small", type: "button", onClick: async (event) => {
      const token = driveToken();
      if (!token) { location.href = driveAuthUrl({ clientId: ctx.config.googleClientId, state: cls.id }); return; }
      busy(event.currentTarget, true, "Uploading");
      try { const uploaded = await uploadToDrive({ blob: result.blob, name: result.name, token, onProgress: (ratio) => { progress.firstChild.style.width = `${Math.round(ratio * 100)}%`; } }); await ctx.api.adminAddRecording(withSession({ classId: cls.id, url: uploaded.url, name: result.name, size: result.size, durationSeconds: result.durationSeconds, storage: "drive" })); await deleteRecording(result.recordingId).catch(() => {}); toast("Uploaded to your Google Drive and attached. Share it with enrolled students from Drive, or make it link-viewable below.", "success", 8000); dialog.close(); modal({ title: "Make the Drive link viewable?", body: h("p", {}, "Anyone with the link will be able to watch. Keep it restricted if you prefer to share with specific student emails from Google Drive."), actions: [{ label: "Anyone with the link", onClick: () => shareDriveFileWithLink({ fileId: uploaded.id, token }).then(() => toast("Link sharing enabled.", "success")).catch(error => toast(error.message, "error")) }, { label: "Keep restricted", variant: "ghost" }] }); }
      catch (error) { toast(error.message, "error", 8000); busy(event.currentTarget, false, "Upload to Google Drive"); }
    } }, icon("upload", 14), "Upload to Google Drive") : null;
    const dialog = modal({ title: "Recording saved on this device", body: h("div", { class: "stack" },
      h("p", { class: "small" }, `${formatBytes(result.size)} · ${clock(result.durationSeconds)} · ${result.mimeType || "video/webm"}`),
      h("div", { class: "form-actions start" }, h("a", { class: "button primary small", href: url, download: result.name }, icon("upload", 14), "Download .webm"), driveButton, h("button", { class: "button ghost small", type: "button", onClick: async () => { await ctx.api.adminAddRecording(withSession({ classId: cls.id, name: result.name, size: result.size, durationSeconds: result.durationSeconds, storage: "local" })); toast("Noted on the class: recording kept on your device.", "success"); } }, "Note: kept locally")),
      driveButton ? progress : h("p", { class: "tiny muted" }, "Direct Google Drive upload is off (no googleClientId in config.json). Download the file, upload it to Drive or a GitHub release, then paste the link below."),
      linkForm,
      h("p", { class: "tiny muted" }, "The file also stays in this browser's storage until you delete it. To retry later, open the class details page and use \"Stored recordings on this device\".")), actions: [] });
  }

  // ---------- room events ----------
  room.on("peer", (peer) => { renderStage(); if (!peer.announced) { peer.announced = true; toast(`${peer.name} joined.`, "info", 2500); if (isHost && activeQuiz && !activeQuiz.closedAt) room.broadcast("quiz", { quiz: { ...activeQuiz, answerIndex: null, counts: null, explanation: null } }, peer.id); if (recorder?.active) room.broadcast("recording", { on: true }, peer.id); } });
  room.on("stream", renderStage);
  room.on("state", renderStage);
  room.on("leave", (peer) => { renderStage(); toast(`${peer.name} left.`, "info", 2000); });
  // Host-only instructions are honoured only when the sender's verified role is host (stamped by the relay in
  // production; self-declared only in the same-browser preview).
  const HOST_ONLY = new Set(["quiz", "quiz-close", "request", "recording", "ended"]);
  room.on("message", async ({ from, type, payload }) => {
    if (HOST_ONLY.has(type) && from.role !== "host") return;
    if (type === "chat") { chat.push({ from: from.name, text: String(payload.text ?? "").slice(0, 500), self: false, at: Date.now() }); if (panel === "chat") renderChat(); else renderPanel(); }
    else if (type === "quiz" && !isHost) showQuizOverlay(payload.quiz);
    else if (type === "answered" && isHost) refreshQuizCounts();
    else if (type === "quiz-close" && !isHost) showQuizResult(payload.quiz);
    else if (type === "reaction") floatReaction(payload.emoji, from.name);
    else if (type === "request" && payload.action === "mute" && room.state.mic) { room.setState({ mic: false }); renderControls(); renderStage(); toast("The host asked you to mute.", "info"); }
    else if (type === "recording") { toast(payload.on ? "The host is recording this class." : "Recording stopped.", "info", 5000); recBadge.hidden = !payload.on; if (payload.on) recBadge.lastChild.textContent = "Recording"; }
    else if (type === "ended" && !isHost) { ended = true; cleanup(); page.replaceChildren(h("div", { class: "classroom-gate" }, h("div", { class: "gate-card" }, brand(30), h("h1", {}, "Class ended"), h("p", { class: "muted" }, "Thanks for joining. Points from live questions are on the leaderboard; the recording link appears on the class card when the host adds it."), h("a", { class: "button primary", href: "#/portal/classes" }, "Back to Live classes")))); }
  });

  function cleanup() { clearInterval(clockTimer); clearInterval(quizTimer); clearInterval(overlayTimer); clearInterval(recordingTimer); room.leave(); window.removeEventListener("beforeunload", onUnload); }
  async function leaveRoom() {
    if (recorder?.active) { toast("Stop the recording before leaving.", "info"); return; }
    cleanup();
    try { await ctx.api.leaveClass(withSession({ classId: cls.id })); } catch { /* ignore */ }
    location.hash = isHost ? `#/admin/classes/${cls.id}` : "#/portal/classes";
  }
  function endClass() {
    modal({ title: "End the class for everyone?", body: h("p", {}, "Attendance and quiz results are saved. Participants are returned to their class list."), actions: [{ label: "End class", variant: "danger", onClick: async () => { if (recorder?.active) { const result = await recorder.stop(); recBadge.hidden = true; saveRecordingDialog(result); } try { await ctx.api.adminNoteChat(withSession({ classId: cls.id, count: chat.length })); await ctx.api.adminSetClassStatus(withSession({ classId: cls.id, status: "ended" })); } catch (error) { toast(error.message, "error"); return; } room.broadcast("ended", {}); await new Promise(resolve => setTimeout(resolve, 300)); cleanup(); toast("Class ended. Attendance and results are on the class page.", "success"); location.hash = `#/admin/classes/${cls.id}`; } }] });
  }
  const onUnload = (event) => {
    if (recorder?.active) { event.preventDefault(); event.returnValue = ""; return; } // browser asks before discarding a live recording
    room.leave();
  };
  window.addEventListener("beforeunload", onUnload);
  const stopOnRouteChange = () => {
    if (location.hash.startsWith(`#/classroom/${cls.id}`) || ended) return;
    window.removeEventListener("hashchange", stopOnRouteChange);
    // Leaving by back button or link while recording: finish the file first so it is never stranded.
    if (recorder?.active) { clearInterval(recordingTimer); recorder.stop().then(result => { recBadge.hidden = true; if (result) saveRecordingDialog(result); }).catch(error => toast(`Recording could not be finalised: ${error.message}`, "error", 9000)); }
    cleanup();
    ctx.api.leaveClass(withSession({ classId: cls.id })).catch(() => {});
  };
  window.addEventListener("hashchange", stopOnRouteChange);

  // ---------- go ----------
  if (localStream) { localStream.getAudioTracks().forEach(track => { track.enabled = toggles.mic; }); localStream.getVideoTracks().forEach(track => { track.enabled = toggles.camera; }); }
  room.join(localStream).then(() => { room.setState({ mic: Boolean(localStream) && toggles.mic, camera: Boolean(localStream) && toggles.camera }); renderControls(); renderStage(); if (activeQuiz && !isHost) showQuizOverlay(activeQuiz); if (activeQuiz && isHost) scheduleAutoClose(activeQuiz); });
  renderControls(); renderStage();
}

async function resumeRecordingPanel(access) {
  const stored = (await listStoredRecordings().catch(() => [])).filter(item => item.classId === access.class.id);
  const list = h("div", { class: "stack" });
  for (const item of stored) {
    const blob = await assembleRecording(item.recordingId);
    const url = URL.createObjectURL(blob);
    const token = driveToken();
    list.append(h("div", { class: "card" }, h("strong", {}, `Recording ${item.recordingId}`), h("p", { class: "small muted" }, `${formatBytes(blob.size)} · ${item.chunks} chunks`), h("div", { class: "form-actions start" }, h("a", { class: "button primary small", href: url, download: `${access.class.id}-${item.recordingId}.webm` }, "Download"), token && driveConfigured(ctx.config) ? h("button", { class: "button ghost small", type: "button", onClick: async (event) => { busy(event.currentTarget, true, "Uploading"); try { const uploaded = await uploadToDrive({ blob, name: `${access.class.id}-${item.recordingId}.webm`, token }); await ctx.api.adminAddRecording(withSession({ classId: access.class.id, url: uploaded.url, name: `${item.recordingId}.webm`, size: blob.size, storage: "drive" })); await deleteRecording(item.recordingId); toast("Uploaded and attached.", "success"); location.hash = `#/admin/classes/${access.class.id}`; } catch (error) { toast(error.message, "error"); busy(event.currentTarget, false, "Upload to Google Drive"); } } }, "Upload to Google Drive") : null, h("button", { class: "button ghost small", type: "button", onClick: async () => { await deleteRecording(item.recordingId); location.reload(); } }, "Delete from this device"))));
  }
  return h("div", { class: "stack" }, h("h1", {}, "Stored recordings"), h("p", { class: "muted small" }, driveToken() ? "Google Drive is connected for this tab." : "Recordings are kept in this browser until you delete them."), stored.length ? list : h("p", { class: "muted" }, "No stored recordings for this class."), h("a", { class: "button ghost", href: `#/admin/classes/${access.class.id}` }, "Back to the class"));
}
