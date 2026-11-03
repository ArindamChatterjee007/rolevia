// Rolevia preview backend.
// This module simulates the server the production site will call over HTTPS. It runs in the
// browser (localStorage) for the GitHub Pages preview and in Node for unit tests. Every rule here
// (registration -> payment -> verification -> ID/password -> OTP -> one active device) is the
// contract for the real backend described in docs/ARCHITECTURE.md. Nothing in preview mode sends
// real email/SMS or charges money: messages land in the on-screen preview inbox instead.

export class ApiError extends Error {
  constructor(code, message, extra = {}) {
    super(message);
    this.code = code;
    this.extra = extra;
  }
}

import { validateSlide } from "./content/modules/validate.mjs";

const encoder = new TextEncoder();
export const STATE_VERSION = 8;
// Company names shown on the public site as research targets (nominative use). Logos are trademarks: one can be
// attached only together with a record of the owner's written permission, which the public API then exposes.
export const DEFAULT_COMPANIES = ["Accenture", "Genpact", "Amazon", "Freshworks", "HubSpot", "Unilever", "Deloitte", "Infosys", "Zoho", "Swiggy", "Razorpay", "Tata Consultancy Services", "Wipro", "HCLTech", "Capgemini", "Cognizant", "Flipkart", "Zomato", "PhonePe", "ICICI Bank", "HDFC Bank", "Mahindra", "EY", "KPMG", "Nykaa", "Meesho", "Urban Company", "Tech Mahindra"];
export const MAX_LOGO_BYTES = 60 * 1024;
export const seedCompanies = (now) => DEFAULT_COMPANIES.map((name, index) => ({ id: `co-${index + 1}`, name, careersUrl: "", logo: null, permission: null, visible: true, order: index + 1, updatedAt: now }));
export const MAX_DECK_SLIDES = 40;
const OTP_TTL_MS = 5 * 60 * 1000;
const SESSION_IDLE_MS = 7 * 24 * 60 * 60 * 1000;
const LOCK_AFTER_FAILURES = 5;
const LOCK_MS = 15 * 60 * 1000;
const SAFE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";

export const SERVICE_IDS = ["resume-audit", "resume-writing", "linkedin", "cover-letter", "mock", "career-pack"];
export const PERMISSIONS = ["students", "verify", "alerts", "payments", "content", "grading", "announce", "audit", "tasks", "classes"];
export const ROLES = {
  lead: { label: "Programme lead", permissions: PERMISSIONS, summary: "Owns the whole admin console: verification, payments, content, grading, classes, alerts, audit and task assignment." },
  content: { label: "Learning & content manager", permissions: ["content", "grading", "announce", "tasks", "classes"], summary: "Uploads lessons and assignments, schedules and hosts live classes, grades submissions, publishes announcements." },
  success: { label: "Student success & verification", permissions: ["students", "verify", "alerts", "payments", "tasks"], summary: "Verifies paid registrations, issues credentials, reviews device alerts and payments." },
};
export const MAX_ATTACHMENT_BYTES = 400 * 1024;
export const MAX_TOTAL_ATTACHMENT_BYTES = 2 * 1024 * 1024;
export const KIT_SERVICE_IDS = ["interview", "resume-audit", "resume-writing"];
export const LAB_IDS = ["spreadsheets", "dashboards", "business-ai", "canva", "crm", "hr-tracker", "trello", "budgeting"];
export const LIVE_QUIZ_POINTS = { correct: 10, participation: 2 };
export const CLASS_JOIN_WINDOW_MS = 15 * 60 * 1000;
export const CLASS_AUTO_END_GRACE_MS = 60 * 60 * 1000;
export const DEFAULT_PAYMENT_INSTRUCTIONS = "Pay by bank transfer or UPI using the details our team sends you, quoting your payment reference. Nothing is activated until a person confirms the payment (within 1 business day).";
export const DEFAULT_ICE_SERVERS = [{ urls: ["stun:stun.l.google.com:19302", "stun:stun1.l.google.com:19302"] }];

export async function sha256(text) {
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(text));
  return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, "0")).join("");
}

export function randomCode(length = 6) {
  const values = crypto.getRandomValues(new Uint32Array(length));
  return Array.from(values, value => String(value % 10)).join("");
}

export function randomToken(length = 10, alphabet = SAFE_ALPHABET) {
  const values = crypto.getRandomValues(new Uint32Array(length));
  return Array.from(values, value => alphabet[value % alphabet.length]).join("");
}

export function hashString(text) {
  let hash = 2166136261;
  for (const char of text) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619) >>> 0;
  }
  return hash;
}

export function seededShuffle(items, seed) {
  let state = seed >>> 0;
  const random = () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let value = Math.imul(state ^ (state >>> 15), 1 | state);
    value = (value + Math.imul(value ^ (value >>> 7), 61 | value)) ^ value;
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(random() * (index + 1));
    [copy[index], copy[swap]] = [copy[swap], copy[index]];
  }
  return copy;
}

export const dateKey = (timestamp) => new Date(timestamp).toISOString().slice(0, 10);
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_PATTERN = /^\+?[0-9]{8,15}$/;
const maskEmail = (email) => email.replace(/^(.)(.*)(@.*)$/, (_, first, middle, domain) => `${first}${"•".repeat(Math.min(middle.length, 6))}${domain}`);
const maskPhone = (phone) => phone.replace(/.(?=.{2})/g, "•");

export function memoryStorage(initial = null) {
  let value = initial;
  return { get: () => value, set: (next) => { value = next; }, revision: () => value?.rev ?? 0 };
}

// Browser adapter: whole state in one key plus a tiny revision key so other tabs can detect staleness cheaply.
export function browserStorage(key, localStorage) {
  return {
    get: () => {
      try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : null; } catch { return null; }
    },
    set: (state) => { localStorage.setItem(key, JSON.stringify(state)); localStorage.setItem(`${key}:rev`, String(state.rev ?? 0)); },
    revision: () => Number(localStorage.getItem(`${key}:rev`) ?? 0),
  };
}

export async function createMockServer({ storage, curriculum, quizBank = {}, assignmentBriefs = {}, courseContent = {}, interviewBank = null, now = () => Date.now(), latency = () => 0, deliver = null, seedMode = "demo", opsPassphrase = null, iceServers = DEFAULT_ICE_SERVERS, payments = "preview", paymentInstructions = "" }) {
  const modulesById = new Map(curriculum.modules.map(module => [module.id, module]));
  const servicesById = new Map(curriculum.services.map(service => [service.id, service]));
  const interview = curriculum.interviewCourse;
  let state = storage.get();
  if (!state || !Number.isInteger(state.version) || state.version < 6) {
    state = seedMode === "empty" ? await emptySeed(now(), opsPassphrase, curriculum, courseContent) : await seed(curriculum, assignmentBriefs, now(), courseContent);
    storage.set(state);
  } else if (state.version < STATE_VERSION) {
    // Older stored state is upgraded in place; real learner data is never thrown away by a re-seed.
    state = migrateState(state, { courseContent, now: now() });
    storage.set(state);
  }

  const persist = () => { state.rev = (state.rev ?? 0) + 1; storage.set(state); };
  const reloadIfStale = () => { if (storage.revision && storage.revision() !== (state.rev ?? 0)) { const fresh = storage.get(); if (fresh && fresh.version === state.version) state = fresh; } };
  const wait = () => new Promise(resolve => setTimeout(() => { reloadIfStale(); resolve(); }, latency()));
  const audit = (actor, action, meta = {}) => { state.auditLog.unshift({ at: now(), actor, action, meta }); state.auditLog = state.auditLog.slice(0, 500); };
  const send = (user, channel, subject, body) => {
    const message = { id: crypto.randomUUID(), to: channel === "sms" ? user.phone : user.email, channel, subject, body, at: now() };
    state.outbox.unshift(message);
    state.outbox = state.outbox.slice(0, 60);
    try { deliver?.(message); } catch { /* delivery hooks must never break the request */ }
  };
  const notify = (user, kind, title, body) => {
    user.notifications.unshift({ id: crypto.randomUUID(), kind, title, body, at: now(), read: false });
    user.notifications = user.notifications.slice(0, 40);
  };
  const price = (item, currency) => item[`price${currency}`];
  const findUser = (predicate) => state.users.find(predicate);
  const publicUser = (user) => {
    const { passHash, salt, failedLogins, lockUntil, ...rest } = user;
    const role = user.type === "admin" ? ROLES[user.role] ?? ROLES.lead : null;
    return { ...rest, kitUnlocked: kitUnlocked(user), points: totalPoints(user.id), roleLabel: role?.label ?? null, permissions: role?.permissions ?? [] };
  };
  const hasPermission = (user, permission) => user.type === "admin" && (ROLES[user.role] ?? ROLES.lead).permissions.includes(permission);
  function requireAdmin(token, deviceId, permission) {
    const result = requireSession(token, deviceId, ["admin"]);
    if (permission && !hasPermission(result.user, permission)) throw new ApiError("FORBIDDEN", `Your role (${ROLES[result.user.role]?.label ?? "admin"}) does not include ${permission}. Ask the programme lead.`);
    return result;
  }
  const attachmentBytes = () => [...state.submissions.map(item => item.file?.dataUrl?.length ?? 0), ...Object.values(state.content.lessons).flat().map(item => item.attachment?.dataUrl?.length ?? 0)].reduce((sum, value) => sum + value, 0);
  function normaliseFile(file) {
    if (!file || !file.name) return null;
    const record = { name: String(file.name).slice(0, 120), size: Number(file.size) || 0, type: String(file.type ?? "").slice(0, 80), sha256: file.sha256 ? String(file.sha256).slice(0, 64) : null, dataUrl: null, stored: false };
    if (file.dataUrl) {
      if (!/^data:[\w.+/-]+;base64,/.test(file.dataUrl)) throw new ApiError("VALIDATION", "Unsupported file encoding.");
      record.size = Math.max(record.size, Math.floor((file.dataUrl.length - file.dataUrl.indexOf(",") - 1) * 3 / 4));
      if (record.size > MAX_ATTACHMENT_BYTES) throw new ApiError("FILE_TOO_LARGE", "Preview stores files up to 400 KB. Share larger files with an https link; production uses private cloud storage.");
      if (attachmentBytes() + file.dataUrl.length > MAX_TOTAL_ATTACHMENT_BYTES) throw new ApiError("STORAGE_FULL", "Preview storage for attachments is full. Use a link for this file.");
      record.dataUrl = file.dataUrl;
      record.stored = true;
    }
    return record;
  }
  function createTask({ title, type, role, refId = null, assigneeId = null, createdBy = "system", dueAt = null, link = "" }) {
    if (state.tasks.some(task => task.status !== "done" && task.type === type && task.refId === refId && refId)) return null;
    const task = { id: crypto.randomUUID(), title: String(title).slice(0, 140), type, role, refId, assigneeId, createdBy, status: "open", createdAt: now(), dueAt: dueAt ?? now() + 2 * 24 * 60 * 60 * 1000, completedAt: null, completedBy: null, link, notes: "" };
    state.tasks.unshift(task);
    state.tasks = state.tasks.slice(0, 400);
    return task;
  }
  function completeTasks(type, refId, by) {
    for (const task of state.tasks) if (task.type === type && task.refId === refId && task.status !== "done") { task.status = "done"; task.completedAt = now(); task.completedBy = by; }
  }
  const distinctPaidModules = (user) => new Set(user.modules).size;
  const kitUnlocked = (user) => user.status === "active" && distinctPaidModules(user) >= curriculum.careerBonus.qualifyingModules;
  const totalPoints = (userId, since = 0) => state.pointEvents.filter(event => event.userId === userId && event.at >= since).reduce((sum, event) => sum + event.points, 0);
  const addPoints = (userId, points, type, ref) => { if (points !== 0) state.pointEvents.push({ id: crypto.randomUUID(), userId, points, type, ref, at: now() }); };
  // Structured course material (lessons, interview questions, glossary) is sold content: it reaches the browser
  // only through these APIs for enrolled learners. Admin "materials" (recordings, worksheets) sit beside it.
  const courseFor = (moduleId) => courseContent[moduleId] ?? null;
  const structuredLessons = (moduleId) => (courseFor(moduleId)?.weeks ?? []).flatMap(week => week.lessons.map(lesson => ({ ...lesson, week: week.week })));
  const lessonCount = (moduleId) => structuredLessons(moduleId).length + (state.content.lessons[moduleId] ?? []).length;
  const lessonsDone = (user, moduleId) => [...structuredLessons(moduleId), ...(state.content.lessons[moduleId] ?? [])].filter(lesson => user.completedLessons.includes(lesson.id)).length;
  const requireDeck = (deckId) => { const deck = state.decks.find(item => item.id === deckId); if (!deck) throw new ApiError("NOT_FOUND", "Slide deck not found."); return deck; };
  // reveal: include answers/explanations (study mode after publication, or the host); notes: presenter notes (host/admin only).
  const deckView = (deck, { reveal = false, notes = false, slides = true } = {}) => ({
    id: deck.id, moduleId: deck.moduleId, moduleTitle: modulesById.get(deck.moduleId)?.title ?? deck.moduleId, title: deck.title, status: deck.status, source: deck.source, slideCount: deck.slides.length,
    classIds: state.classes.filter(item => item.deckId === deck.id).map(item => item.id), updatedAt: deck.updatedAt, publishedAt: deck.publishedAt ?? null, createdBy: deck.createdBy,
    slides: slides ? deck.slides.map(slide => ({ ...slide, notes: notes ? slide.notes ?? "" : undefined, question: slide.question ? { ...slide.question, answerIndex: reveal ? slide.question.answerIndex : null, explanation: reveal ? slide.question.explanation : null } : undefined })) : undefined,
  });
  function normaliseDeck(input, existing, admin) {
    const errors = {};
    if (!input?.title || String(input.title).trim().length < 4) errors.title = "Give the deck a title (at least 4 characters).";
    if (!modulesById.has(input?.moduleId)) errors.moduleId = "Choose the skill module.";
    const rawSlides = Array.isArray(input?.slides) ? input.slides : [];
    if (rawSlides.length < 1) errors.slides = "Add at least one slide.";
    if (rawSlides.length > MAX_DECK_SLIDES) errors.slides = `Up to ${MAX_DECK_SLIDES} slides per deck.`;
    const slides = rawSlides.map((slide, index) => {
      const previous = existing?.slides.find(item => item.id === slide.id);
      const clean = { id: previous?.id ?? slide.id ?? `s-${randomToken(6).toLowerCase()}`, kind: slide.kind, title: String(slide.title ?? "").trim().slice(0, 90) };
      if (slide.subtitle) clean.subtitle = String(slide.subtitle).trim().slice(0, 140);
      if (["content", "summary"].includes(slide.kind)) clean.bullets = (Array.isArray(slide.bullets) ? slide.bullets : String(slide.bullets ?? "").split("\n")).map(item => String(item).trim()).filter(Boolean).slice(0, 6);
      if (slide.kind === "steps") clean.steps = (Array.isArray(slide.steps) ? slide.steps : String(slide.steps ?? "").split("\n")).map(item => String(item).trim()).filter(Boolean).slice(0, 6);
      if (slide.kind === "question") clean.question = { prompt: String(slide.question?.prompt ?? "").trim(), options: (slide.question?.options ?? []).map(option => String(option).trim()).filter(Boolean).slice(0, 4), answerIndex: Number(slide.question?.answerIndex), explanation: String(slide.question?.explanation ?? "").trim() };
      if (slide.illustration) clean.illustration = String(slide.illustration);
      if (slide.notes) clean.notes = String(slide.notes).trim().slice(0, 600);
      if (slide.kind === "image") {
        const image = slide.image === null ? null : slide.image?.dataUrl || slide.image?.name ? normaliseFile(slide.image) : previous?.image ?? null;
        if (!image?.dataUrl) errors[`slides.${index}.image`] = "Upload an image (PNG, JPG or SVG, up to 400 KB).";
        else if (!/^data:image\//.test(image.dataUrl)) errors[`slides.${index}.image`] = "Only image files can be used on a slide.";
        clean.image = image;
        if (slide.caption) clean.caption = String(slide.caption).trim().slice(0, 200);
      }
      const problems = validateSlide(`slides.${index}`, clean, { allowImage: true });
      if (problems.length) errors[`slides.${index}`] = problems[0].replace(/^slides\.\d+\./, "");
      return clean;
    });
    if (Object.keys(errors).length) throw new ApiError("VALIDATION", Object.values(errors)[0], { fields: errors });
    return { title: String(input.title).trim().slice(0, 90), moduleId: input.moduleId, slides, updatedAt: now(), updatedBy: admin.id };
  }

  // Payments: "preview" simulates a card; "manual" (live server without a payment provider) records a quote,
  // emails transfer instructions and grants nothing until an admin with the payments permission confirms it.
  const instructionsText = () => String(paymentInstructions || DEFAULT_PAYMENT_INSTRUCTIONS).slice(0, 1000);
  function activateRegistration(user, payment) {
    user.modules = [...new Set([...user.modules, ...payment.grants.moduleIds])];
    user.pendingModules = [];
    user.status = "pending_verification";
    user.paidAt = now();
    send(user, "email", "Payment received: verification in progress", `We received ${payment.currency} ${payment.subtotal} for ${payment.items.length} skill module(s). Our team verifies every registration within 1 business day, then sends your Student ID and a temporary password.`);
    createTask({ title: `Verify registration: ${user.name} (${payment.items.length} module${payment.items.length === 1 ? "" : "s"}, ${payment.currency} ${payment.subtotal})`, type: "verify", role: "success", refId: user.id, dueAt: now() + 24 * 60 * 60 * 1000, link: "#/admin/students" });
  }
  function applyAddons(user, payment) {
    for (const id of payment.grants.moduleIds) if (!user.modules.includes(id)) user.modules.push(id);
    user.addons.push(...payment.grants.serviceIds.map(id => ({ id, paymentId: payment.id, at: now(), status: "scheduled" })));
    send(user, "email", "Receipt: your Rolevia add-ons", `We received ${payment.currency} ${payment.subtotal} for ${payment.items.map(item => item.title).join(", ")}.`);
    if (kitUnlocked(user) && !user.kitNotifiedAt) { user.kitNotifiedAt = now(); notify(user, "achievement", "Career kit unlocked", "Interview Ready, a resume review and a done-for-you resume are now included at no extra charge."); }
  }
  function requestManualPayment(user, quote, grants, purpose) {
    const payment = { id: `PAY-${randomToken(8).toUpperCase()}`, userId: user.id, items: quote.items, subtotal: quote.subtotal, currency: quote.currency, method: "manual-transfer", status: "awaiting_confirmation", at: now(), preview: false, purpose, grants };
    state.payments.unshift(payment);
    send(user, "email", `How to pay ${quote.currency} ${quote.subtotal} to Rolevia`, `${instructionsText()} Amount: ${quote.currency} ${quote.subtotal} for ${quote.items.map(item => item.title).join(", ")}. Quote payment reference ${payment.id} with your transfer.`);
    createTask({ title: `Confirm payment: ${user.name} (${quote.currency} ${quote.subtotal})`, type: "payment", role: "success", refId: payment.id, dueAt: now() + 2 * 24 * 60 * 60 * 1000, link: "#/admin/payments" });
    audit(user.id, "payment_requested", { paymentId: payment.id, amount: quote.subtotal, currency: quote.currency });
    return payment;
  }

  async function setPassword(user, password) {
    if (typeof password !== "string" || password.length < 8 || !/[0-9]/.test(password) || !/[A-Za-z]/.test(password)) {
      throw new ApiError("WEAK_PASSWORD", "Use at least 8 characters with letters and numbers.");
    }
    user.salt = randomToken(16);
    user.passHash = await sha256(`${user.salt}:${password}`);
  }
  const checkPassword = async (user, password) => user.passHash === await sha256(`${user.salt}:${password}`);

  function requireSession(token, deviceId, types = ["student"], { allowPendingPassword = false } = {}) {
    const session = state.sessions.find(item => item.token === token);
    if (!session) throw new ApiError("AUTH_REQUIRED", "Please sign in.");
    if (session.revokedAt) throw new ApiError("SESSION_REVOKED", "You were signed out because this account signed in on another device.", { reason: session.revokedReason });
    if (session.deviceId !== deviceId) throw new ApiError("DEVICE_MISMATCH", "This session belongs to a different device.");
    if (now() - session.lastSeen > SESSION_IDLE_MS) { session.revokedAt = now(); session.revokedReason = "expired"; persist(); throw new ApiError("SESSION_EXPIRED", "Your session expired. Sign in again."); }
    const user = findUser(item => item.id === session.userId);
    if (!user || !types.includes(user.type)) throw new ApiError("FORBIDDEN", "This area needs a different account.");
    if (user.status === "suspended") throw new ApiError("SUSPENDED", "This account is suspended. Contact support.");
    if (user.mustChangePassword && !allowPendingPassword) throw new ApiError("PASSWORD_CHANGE_REQUIRED", "Set a new password before continuing.");
    session.lastSeen = now();
    return { session, user };
  }
  const requireModule = (user, moduleId) => {
    if (!modulesById.has(moduleId)) throw new ApiError("NOT_FOUND", "Unknown skill module.");
    if (user.type === "student" && !user.modules.includes(moduleId)) throw new ApiError("NOT_ENROLLED", "This skill module is not in your plan yet.");
  };

  function createOtp(user, purpose) {
    state.otps = state.otps.filter(otp => otp.expiresAt > now() - 60 * 60 * 1000);
    const otp = { id: crypto.randomUUID(), userId: user.id, code: randomCode(), purpose, expiresAt: now() + OTP_TTL_MS, attempts: 0, consumedAt: null };
    state.otps.push(otp);
    const label = purpose === "login" ? "sign-in" : "password reset";
    send(user, "email", `Your Rolevia ${label} code`, `Code ${otp.code}. It expires in 5 minutes. Never share this code; Rolevia staff will not ask for it.`);
    send(user, "sms", `Rolevia ${label} code`, `${otp.code} is your Rolevia ${label} code. Valid for 5 minutes.`);
    return { challengeId: otp.id, channels: [maskEmail(user.email), maskPhone(user.phone)], expiresAt: otp.expiresAt };
  }
  function consumeOtp(challengeId, code, purpose) {
    const otp = state.otps.find(item => item.id === challengeId && item.purpose === purpose);
    if (!otp || otp.consumedAt) throw new ApiError("OTP_INVALID", "Start the sign-in again to receive a new code.");
    if (otp.expiresAt < now()) throw new ApiError("OTP_EXPIRED", "That code expired. Request a new one.");
    if (otp.attempts >= 5) throw new ApiError("OTP_LOCKED", "Too many attempts. Start the sign-in again.");
    if (String(code).trim() !== otp.code) { otp.attempts += 1; persist(); throw new ApiError("OTP_INVALID", `That code is not right. ${5 - otp.attempts} attempts left.`); }
    otp.consumedAt = now();
    return findUser(user => user.id === otp.userId);
  }

  function openSession(user, deviceId, deviceLabel) {
    const active = state.sessions.filter(session => session.userId === user.id && !session.revokedAt);
    let replacedOtherDevice = false;
    for (const session of active) {
      if (session.deviceId !== deviceId) replacedOtherDevice = true;
      session.revokedAt = now();
      session.revokedReason = session.deviceId !== deviceId ? "new_device_login" : "re_login";
    }
    let warned = false;
    if (replacedOtherDevice) {
      user.deviceSwitches += 1;
      user.deviceHistory.unshift({ at: now(), to: deviceLabel, from: active.find(session => session.deviceId !== deviceId)?.deviceLabel ?? "another device" });
      user.deviceHistory = user.deviceHistory.slice(0, 20);
      if (user.deviceSwitches >= state.settings.deviceSwitchThreshold && user.deviceSwitches % state.settings.deviceSwitchThreshold === 0) {
        warned = true;
        notify(user, "security", "You are using multiple devices", `Your account signed in from a new device ${user.deviceSwitches} times. Rolevia allows one active device at a time. If this was not you, change your password now.`);
        send(user, "email", "Security notice: multiple devices", `Your Rolevia account has switched devices ${user.deviceSwitches} times. Only one active device is allowed. If this was not you, change your password immediately.`);
        if (user.type === "student") {
          const alert = { id: crypto.randomUUID(), userId: user.id, count: user.deviceSwitches, at: now(), status: "open" };
          state.deviceAlerts.unshift(alert);
          createTask({ title: `Review device alert: ${user.name} (${user.deviceSwitches} switches)`, type: "alert", role: "success", refId: alert.id, link: "#/admin/alerts" });
        }
        audit("system", "device_alert", { userId: user.id, count: user.deviceSwitches });
      }
    }
    const session = { token: `${crypto.randomUUID()}${randomToken(12)}`, userId: user.id, deviceId, deviceLabel, createdAt: now(), lastSeen: now(), revokedAt: null, revokedReason: null };
    state.sessions.push(session);
    state.sessions = state.sessions.filter(item => !item.revokedAt || now() - item.revokedAt < 30 * 24 * 60 * 60 * 1000);
    return { session, warned };
  }

  function quoteFor(moduleIds, serviceIds, currency) {
    if (!["INR", "USD"].includes(currency)) throw new ApiError("BAD_CURRENCY", "Choose INR or USD.");
    const modules = [...new Set(moduleIds)].map(id => modulesById.get(id) ?? (() => { throw new ApiError("NOT_FOUND", `Unknown module ${id}`); })());
    const services = [...new Set(serviceIds)].map(id => servicesById.get(id) ?? (id === "interview" ? interview : null) ?? (() => { throw new ApiError("NOT_FOUND", `Unknown service ${id}`); })());
    const items = [
      ...modules.map(module => ({ id: module.id, kind: "module", title: module.title, amount: price(module, currency) })),
      ...services.map(service => ({ id: service.id, kind: "service", title: service.title ?? service.name, amount: price(service, currency) })),
    ];
    const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
    const kitValue = KIT_SERVICE_IDS.reduce((sum, id) => sum + price(id === "interview" ? interview : servicesById.get(id), currency), 0);
    return { currency, items, subtotal, taxNote: "Applicable taxes are added at checkout and itemised on the receipt.", kitProgress: modules.length, kitRequired: curriculum.careerBonus.qualifyingModules, kitValue };
  }

  function leaderboardRows(period) {
    const since = period === "week" ? now() - 7 * 24 * 60 * 60 * 1000 : 0;
    const rows = state.users.filter(user => user.type === "student" && user.status === "active").map(user => {
      const events = state.pointEvents.filter(event => event.userId === user.id && event.at >= since);
      const sum = (type) => events.filter(event => event.type === type).reduce((total, event) => total + event.points, 0);
      return { userId: user.id, studentId: user.studentId, name: user.name, avatar: user.avatar, city: user.city, modules: user.modules.length, points: events.reduce((total, event) => total + event.points, 0), quiz: sum("quiz") + sum("streak"), labs: sum("lab"), assignments: sum("assignment"), lessons: sum("lesson"), live: sum("live"), firstEventAt: events[0]?.at ?? Number.MAX_SAFE_INTEGER };
    }).sort((a, b) => b.points - a.points || a.firstEventAt - b.firstEventAt);
    rows.forEach((row, index) => { row.rank = index + 1; });
    return rows;
  }
  function ensureBadge(period) {
    const [top] = leaderboardRows(period);
    if (!top || top.points === 0) return null;
    const monthKey = new Date(now()).toISOString().slice(0, 7).replace("-", "");
    const code = `RV-${period === "week" ? "WK" : "TOP"}-${monthKey}-${top.studentId.replace(/[^A-Z0-9]/gi, "").slice(-6)}`;
    let badge = state.badges.find(item => item.code === code);
    if (!badge) {
      badge = { code, userId: top.userId, kind: period === "week" ? "Weekly Top Scorer" : "Top Scorer", issuedAt: now(), points: top.points };
      state.badges.unshift(badge);
      const user = findUser(item => item.id === top.userId);
      if (user) notify(user, "achievement", `You are the ${badge.kind}`, "Open the leaderboard to share your badge on LinkedIn.");
      persist();
    }
    return badge;
  }

  function requireClass(classId) {
    const item = state.classes.find(entry => entry.id === classId);
    if (!item) throw new ApiError("NOT_FOUND", "Class not found.");
    return item;
  }
  function closeAttendance(item, userId) {
    for (const entry of item.attendance) if (entry.userId === userId && !entry.leftAt) { entry.leftAt = now(); entry.seconds += Math.round((entry.leftAt - entry.joinedAt) / 1000); }
  }
  function closeQuiz(item, quiz) {
    quiz.closedAt = now();
    const counts = quiz.options.map((_, index) => Object.values(quiz.responses).filter(response => response.answerIndex === index).length);
    const correct = counts[quiz.answerIndex] ?? 0;
    quiz.results = { counts, correct, total: Object.keys(quiz.responses).length };
    for (const [userId, response] of Object.entries(quiz.responses)) {
      const points = response.answerIndex === quiz.answerIndex ? LIVE_QUIZ_POINTS.correct : LIVE_QUIZ_POINTS.participation;
      addPoints(userId, points, "live", `${item.id}:${quiz.id}`);
    }
  }
  function endLiveClass(item, by) {
    item.status = "ended";
    item.endedAt = now();
    for (const entry of item.attendance) if (!entry.leftAt) closeAttendance(item, entry.userId);
    for (const quiz of item.quizzes) if (!quiz.closedAt) closeQuiz(item, quiz);
    completeTasks("class", item.id, by);
    const deck = item.deckId ? state.decks.find(entry => entry.id === item.deckId) : null;
    if (deck && deck.status !== "published") createTask({ title: `Publish slides after class: ${deck.title}`, type: "deck", role: "content", refId: deck.id, assigneeId: item.hostId, createdBy: "system", dueAt: now() + 24 * 60 * 60 * 1000, link: `#/admin/decks/${deck.id}` });
  }
  // A host who loses connection or forgets to end the class must not leave it "live" forever.
  function sweepClasses() {
    let changed = false;
    for (const item of state.classes) {
      if (item.status !== "live" || !item.startedAt || now() <= item.startedAt + item.durationMinutes * 60 * 1000 + CLASS_AUTO_END_GRACE_MS) continue;
      endLiveClass(item, "system");
      audit("system", "class_auto_ended", { classId: item.id });
      changed = true;
    }
    if (changed) persist();
  }
  const quizView = (quiz, user, item) => {
    const open = !quiz.closedAt && quiz.sentAt + quiz.seconds * 1000 > now();
    const mine = quiz.responses[user.id] ?? null;
    const isHost = user.type === "admin";
    return { id: quiz.id, classId: item.id, question: quiz.question, options: quiz.options, seconds: quiz.seconds, sentAt: quiz.sentAt, closesAt: quiz.sentAt + quiz.seconds * 1000, closedAt: quiz.closedAt, open, answered: Object.keys(quiz.responses).length, counts: isHost || quiz.closedAt ? quiz.options.map((_, index) => Object.values(quiz.responses).filter(response => response.answerIndex === index).length) : null, answerIndex: isHost || quiz.closedAt ? quiz.answerIndex : null, explanation: isHost || quiz.closedAt ? quiz.explanation : null, myAnswer: mine?.answerIndex ?? null, myPoints: quiz.closedAt && mine ? (mine.answerIndex === quiz.answerIndex ? LIVE_QUIZ_POINTS.correct : LIVE_QUIZ_POINTS.participation) : null, results: quiz.results };
  };
  const openQuizFor = (item, user) => { const quiz = item.quizzes.find(entry => !entry.closedAt && entry.sentAt + entry.seconds * 1000 > now()); return quiz ? quizView(quiz, user, item) : null; };
  const classView = (item, user) => {
    const module = modulesById.get(item.moduleId);
    const attended = user.type === "student" ? item.attendance.some(entry => entry.userId === user.id) : null;
    const myQuizzes = user.type === "student" ? item.quizzes.filter(quiz => quiz.responses[user.id]) : [];
    const myCorrect = myQuizzes.filter(quiz => quiz.responses[user.id].answerIndex === quiz.answerIndex).length;
    const canJoin = item.status === "live" || (item.status === "scheduled" && item.startsAt - now() <= CLASS_JOIN_WINDOW_MS && user.type === "student") || (user.type === "admin" && item.status === "scheduled");
    const deck = item.deckId ? state.decks.find(entry => entry.id === item.deckId) : null;
    return { id: item.id, moduleId: item.moduleId, moduleTitle: module?.title ?? item.moduleId, title: item.title, description: item.description, startsAt: item.startsAt, durationMinutes: item.durationMinutes, mode: item.mode, externalUrl: item.externalUrl, hostId: item.hostId, hostName: item.hostName, status: item.status, startedAt: item.startedAt, endedAt: item.endedAt, recordingUrl: item.recordingUrl, recordingCount: item.recordings.length, attendanceCount: new Set(item.attendance.map(entry => entry.userId)).size, quizCount: item.quizzes.length, chatCount: item.chatCount, attended, myQuizzes: myQuizzes.length, myCorrect, canJoin, isHost: user.type === "admin" && item.hostId === user.id, deckId: deck?.id ?? null, deckTitle: deck?.title ?? null, deckStatus: deck?.status ?? null, deckSlides: deck?.slides.length ?? 0 };
  };

  const api = {
    // ---------- public ----------
    async catalogue() { await wait(); return curriculum; },
    // Public: names always; a logo only when a permission record exists (the UI falls back to a monogram chip).
    async companies() {
      await wait();
      return (state.companies ?? []).filter(company => company.visible).sort((a, b) => a.order - b.order).map(company => ({ id: company.id, name: company.name, careersUrl: company.careersUrl || null, logo: company.logo && company.permission ? company.logo.dataUrl : null, permissionNote: company.permission ? `Logo shown with permission (${company.permission.reference})` : null }));
    },
    async quote({ moduleIds = [], serviceIds = [], currency = "INR" }) { await wait(); return quoteFor(moduleIds, serviceIds, currency); },
    async publicLeaderboard() {
      await wait();
      return leaderboardRows("all").slice(0, 5).map(row => ({ rank: row.rank, name: row.name.replace(/^(\S+)\s+(\S).*$/, "$1 $2."), points: row.points, modules: row.modules, city: row.city }));
    },
    async badge(code) {
      await wait();
      ensureBadge("all"); ensureBadge("week");
      const badge = state.badges.find(item => item.code === code);
      if (!badge) throw new ApiError("NOT_FOUND", "No badge with that code.");
      const user = findUser(item => item.id === badge.userId);
      return { ...badge, name: user.name, modules: user.modules.map(id => modulesById.get(id).title), studentId: user.studentId, previewOnly: true };
    },
    async requestContactCode({ email, phone }) {
      await wait();
      const normalisedEmail = String(email ?? "").trim().toLowerCase();
      if (!EMAIL_PATTERN.test(normalisedEmail)) throw new ApiError("VALIDATION", "Enter a valid email address.", { field: "email" });
      if (!PHONE_PATTERN.test(String(phone ?? "").replace(/[\s-]/g, ""))) throw new ApiError("VALIDATION", "Enter a valid mobile number with country code.", { field: "phone" });
      const existing = findUser(user => user.email === normalisedEmail);
      if (existing && !["pending_payment", "rejected"].includes(existing.status)) throw new ApiError("DUPLICATE", "An account with this email already exists. Sign in instead.", { field: "email" });
      state.otps = state.otps.filter(otp => otp.expiresAt > now() - 60 * 60 * 1000);
      const otp = { id: crypto.randomUUID(), userId: null, contact: normalisedEmail, code: randomCode(), purpose: "contact", expiresAt: now() + OTP_TTL_MS, attempts: 0, consumedAt: null };
      state.otps.push(otp);
      const pseudo = { email: normalisedEmail, phone: String(phone).replace(/[\s-]/g, "") };
      send(pseudo, "email", "Confirm your email for Rolevia registration", `Code ${otp.code}. Enter it on the registration page within 5 minutes to confirm this address.`);
      send(pseudo, "sms", "Rolevia registration code", `${otp.code} is your Rolevia registration code. Valid for 5 minutes.`);
      persist();
      return { challengeId: otp.id, channels: [maskEmail(normalisedEmail), maskPhone(pseudo.phone)], expiresAt: otp.expiresAt };
    },
    async register({ name, email, phone, city, education = "", graduationYear = "", currentStatus = "", preferredSlot = "", goal = "", moduleIds = [], referralCode = "", acceptedTerms = false, contactChallengeId = null, contactCode = "" }) {
      await wait();
      const errors = {};
      if (typeof name !== "string" || name.trim().length < 2) errors.name = "Enter your full name.";
      if (!EMAIL_PATTERN.test(String(email))) errors.email = "Enter a valid email address.";
      if (!PHONE_PATTERN.test(String(phone).replace(/[\s-]/g, ""))) errors.phone = "Enter a valid mobile number with country code.";
      if (!String(city ?? "").trim()) errors.city = "Enter your city.";
      if (!["mba", "pgdm", "graduate", "other"].includes(education)) errors.education = "Choose your highest qualification.";
      if (graduationYear && !(Number(graduationYear) >= 1990 && Number(graduationYear) <= 2030)) errors.graduationYear = "Enter a valid year.";
      if (!["student", "fresher", "working", "switching"].includes(currentStatus)) errors.currentStatus = "Tell us your current situation.";
      if (!["weekday-evening", "weekend-morning", "weekend-evening"].includes(preferredSlot)) errors.preferredSlot = "Pick a live-session slot you can usually attend.";
      if (String(goal ?? "").trim().length < 10) errors.goal = "Describe your goal in a sentence (10+ characters).";
      if (!acceptedTerms) errors.acceptedTerms = "Please accept the proposed terms to continue.";
      if (Object.keys(errors).length) throw new ApiError("VALIDATION", Object.values(errors)[0], { fields: errors });
      const contactOtp = state.otps.find(otp => otp.id === contactChallengeId && otp.purpose === "contact");
      if (!contactOtp || contactOtp.contact !== String(email).trim().toLowerCase()) throw new ApiError("CONTACT_UNVERIFIED", "Confirm your email with the code we sent before continuing.");
      if (!contactOtp.consumedAt) {
        if (contactOtp.expiresAt < now()) throw new ApiError("OTP_EXPIRED", "That confirmation code expired. Request a new one.");
        if (String(contactCode).trim() !== contactOtp.code) { contactOtp.attempts += 1; persist(); if (contactOtp.attempts >= 5) throw new ApiError("OTP_LOCKED", "Too many attempts. Request a new code."); throw new ApiError("OTP_INVALID", "That confirmation code is not right."); }
        contactOtp.consumedAt = now();
      }
      const uniqueModules = [...new Set(moduleIds)];
      if (!uniqueModules.length) throw new ApiError("VALIDATION", "Choose at least one skill module.");
      for (const id of uniqueModules) if (!modulesById.has(id)) throw new ApiError("NOT_FOUND", `Unknown module ${id}`);
      const normalisedEmail = String(email).trim().toLowerCase();
      const existing = findUser(user => user.email === normalisedEmail);
      if (existing && !["pending_payment", "rejected"].includes(existing.status)) throw new ApiError("DUPLICATE", "An account with this email already exists. Sign in instead.");
      const referrer = referralCode ? findUser(user => user.referralCode === referralCode.trim().toUpperCase()) : null;
      if (referralCode && !referrer) throw new ApiError("VALIDATION", "That referral code was not found.");
      const user = existing ?? blankUser({ type: "student", createdAt: now() });
      Object.assign(user, { name: name.trim(), email: normalisedEmail, phone: String(phone).replace(/[\s-]/g, ""), city: String(city ?? "").trim(), profile: { education, graduationYear: String(graduationYear ?? ""), currentStatus, preferredSlot, goal: String(goal).trim().slice(0, 300) }, contactVerifiedAt: now(), pendingModules: uniqueModules, referredBy: referrer?.id ?? null, status: "pending_payment" });
      if (!existing) state.users.push(user);
      audit(user.id, "register", { modules: uniqueModules });
      persist();
      return { applicationId: user.id, reference: `APP-${user.id.slice(0, 8).toUpperCase()}`, quoteINR: quoteFor(uniqueModules, [], "INR"), quoteUSD: quoteFor(uniqueModules, [], "USD") };
    },
    async pay({ applicationId, currency = "INR", outcome = "success", method = "preview-card" }) {
      await wait();
      const user = findUser(item => item.id === applicationId && item.type === "student");
      if (!user || user.status !== "pending_payment") throw new ApiError("NOT_FOUND", "No payment is due for this application.");
      const quote = quoteFor(user.pendingModules, [], currency);
      const reference = `APP-${user.id.slice(0, 8).toUpperCase()}`;
      user.currency = currency;
      if (payments === "manual") {
        const existing = state.payments.find(item => item.userId === user.id && item.status === "awaiting_confirmation" && item.purpose === "registration");
        const payment = existing ?? requestManualPayment(user, quote, { moduleIds: [...user.pendingModules], serviceIds: [] }, "registration");
        persist();
        return { payment, status: user.status, reference, manual: true, instructions: instructionsText() };
      }
      const payment = { id: `PAY-${randomToken(8).toUpperCase()}`, userId: user.id, items: quote.items, subtotal: quote.subtotal, currency, method, status: outcome === "success" ? "succeeded" : "declined", at: now(), preview: true, purpose: "registration", grants: { moduleIds: [...user.pendingModules], serviceIds: [] } };
      state.payments.unshift(payment);
      if (outcome !== "success") { persist(); throw new ApiError("PAYMENT_DECLINED", "The preview payment was declined. Try again or use another method.", { paymentId: payment.id }); }
      activateRegistration(user, payment);
      audit(user.id, "payment_succeeded", { paymentId: payment.id, amount: quote.subtotal, currency });
      persist();
      return { payment, status: user.status, reference };
    },
    async applicationStatus(applicationId) {
      await wait();
      const user = findUser(item => item.id === applicationId);
      if (!user) throw new ApiError("NOT_FOUND", "Application not found.");
      return { status: user.status, studentId: user.studentId, modules: user.modules.length || user.pendingModules.length };
    },

    // ---------- authentication ----------
    async login({ identifier, password, deviceId, deviceLabel, expectedType = "student" }) {
      await wait();
      const needle = String(identifier ?? "").trim().toLowerCase();
      const user = findUser(item => item.studentId?.toLowerCase() === needle || item.adminId?.toLowerCase() === needle || item.email === needle);
      if (!user || user.type !== expectedType) throw new ApiError("INVALID_CREDENTIALS", "We could not match that ID or password.");
      if (user.lockUntil && user.lockUntil > now()) throw new ApiError("LOCKED", `Too many attempts. Try again in ${Math.ceil((user.lockUntil - now()) / 60000)} minutes.`);
      if (user.status === "pending_payment" || user.status === "pending_verification") throw new ApiError("NOT_VERIFIED", "Your registration is being verified. We will email your Student ID and password once approved.");
      if (user.status === "suspended") throw new ApiError("SUSPENDED", "This account is suspended. Contact support.");
      if (!(await checkPassword(user, password ?? ""))) {
        user.failedLogins = (user.failedLogins ?? 0) + 1;
        if (user.failedLogins >= LOCK_AFTER_FAILURES) { user.lockUntil = now() + LOCK_MS; user.failedLogins = 0; audit(user.id, "lockout"); }
        persist();
        throw new ApiError("INVALID_CREDENTIALS", "We could not match that ID or password.");
      }
      user.failedLogins = 0;
      const challenge = createOtp(user, "login");
      audit(user.id, "otp_sent", { deviceLabel });
      persist();
      return { ...challenge, accountType: user.type };
    },
    async verifyOtp({ challengeId, code, deviceId, deviceLabel = "Unknown device" }) {
      await wait();
      if (!deviceId) throw new ApiError("VALIDATION", "Missing device identity.");
      const user = consumeOtp(challengeId, code, "login");
      const { session, warned } = openSession(user, deviceId, deviceLabel);
      audit(user.id, "login", { deviceLabel, deviceSwitches: user.deviceSwitches });
      persist();
      return { token: session.token, user: publicUser(user), mustChangePassword: user.mustChangePassword, deviceSwitches: user.deviceSwitches, threshold: state.settings.deviceSwitchThreshold, warned };
    },
    async me({ token, deviceId }) {
      await wait();
      const previousSeen = state.sessions.find(item => item.token === token)?.lastSeen ?? 0;
      const { session, user } = requireSession(token, deviceId, ["student", "admin"], { allowPendingPassword: true });
      // Background polls must not write on every call: a write from an idle tab can overwrite another tab's
      // change made in the same instant. Record activity at most once a minute.
      if (now() - previousSeen >= 60 * 1000) persist(); else session.lastSeen = previousSeen;
      return { user: publicUser(user), session: { deviceLabel: session.deviceLabel, createdAt: session.createdAt, lastSeen: session.lastSeen }, unread: user.notifications.filter(item => !item.read).length, threshold: state.settings.deviceSwitchThreshold };
    },
    async logout({ token }) {
      await wait();
      const session = state.sessions.find(item => item.token === token);
      if (session && !session.revokedAt) { session.revokedAt = now(); session.revokedReason = "logout"; persist(); }
      return { ok: true };
    },
    async changePassword({ token, deviceId, currentPassword, newPassword }) {
      await wait();
      const { user } = requireSession(token, deviceId, ["student", "admin"], { allowPendingPassword: true });
      if (!(await checkPassword(user, currentPassword ?? ""))) throw new ApiError("INVALID_CREDENTIALS", "Your current password is not right.");
      await setPassword(user, newPassword);
      user.mustChangePassword = false;
      audit(user.id, "password_changed");
      persist();
      return { ok: true };
    },
    async requestReset({ identifier }) {
      await wait();
      const needle = String(identifier ?? "").trim().toLowerCase();
      const user = findUser(item => item.studentId?.toLowerCase() === needle || item.email === needle);
      if (!user || user.status !== "active") return { challengeId: null, channels: [] };
      const challenge = createOtp(user, "reset");
      persist();
      return challenge;
    },
    async resetPassword({ challengeId, code, newPassword }) {
      await wait();
      const user = consumeOtp(challengeId, code, "reset");
      await setPassword(user, newPassword);
      user.mustChangePassword = false;
      for (const session of state.sessions) if (session.userId === user.id && !session.revokedAt) { session.revokedAt = now(); session.revokedReason = "password_reset"; }
      audit(user.id, "password_reset");
      persist();
      return { ok: true };
    },

    // ---------- student portal ----------
    async dashboard({ token, deviceId }) {
      await wait();
      const { user } = requireSession(token, deviceId);
      const modules = user.modules.map(id => {
        const done = lessonsDone(user, id);
        const labRun = state.labRuns.find(run => run.userId === user.id && run.labId === id);
        return { id, title: modulesById.get(id).title, tool: modulesById.get(id).tool, lessons: lessonCount(id), done, labScore: labRun?.score ?? null, quizToday: state.quizAttempts.some(attempt => attempt.userId === user.id && attempt.moduleId === id && attempt.date === dateKey(now())) };
      });
      const streak = computeStreak(user.id);
      return { user: publicUser(user), modules, streak, points: totalPoints(user.id), weekPoints: totalPoints(user.id, now() - 7 * 24 * 60 * 60 * 1000), announcements: state.content.announcements.slice(0, 3), notifications: user.notifications.slice(0, 5), kit: { unlocked: kitUnlocked(user), count: distinctPaidModules(user), required: curriculum.careerBonus.qualifyingModules }, devices: { switches: user.deviceSwitches, threshold: state.settings.deviceSwitchThreshold, history: user.deviceHistory.slice(0, 5) }, rank: leaderboardRows("all").find(row => row.userId === user.id)?.rank ?? null };
    },
    async lessons({ token, deviceId, moduleId }) {
      await wait();
      const { user } = requireSession(token, deviceId, ["student", "admin"]);
      requireModule(user, moduleId);
      const course = courseFor(moduleId);
      const done = (id) => user.completedLessons.includes(id);
      return {
        module: modulesById.get(moduleId),
        materials: (state.content.lessons[moduleId] ?? []).map(lesson => ({ ...lesson, done: done(lesson.id) })),
        lessons: (state.content.lessons[moduleId] ?? []).map(lesson => ({ ...lesson, done: done(lesson.id) })),
        course: course ? { tagline: course.tagline, weeks: course.weeks.map(week => ({ ...week, lessons: week.lessons.map(lesson => ({ ...lesson, done: done(lesson.id) })) })), interview: course.interview, glossary: course.glossary } : null,
        decks: state.decks.filter(deck => deck.moduleId === moduleId && (deck.status === "published" || user.type === "admin")).map(deck => deckView(deck, { slides: false })),
        classes: state.classes.filter(item => item.moduleId === moduleId && item.status !== "cancelled").map(item => classView(item, user)).sort((a, b) => a.startsAt - b.startsAt),
        progress: { done: lessonsDone(user, moduleId), total: lessonCount(moduleId) },
      };
    },
    async completeLesson({ token, deviceId, lessonId }) {
      await wait();
      const { user } = requireSession(token, deviceId);
      const entry = Object.entries(state.content.lessons).find(([, lessons]) => lessons.some(lesson => lesson.id === lessonId));
      const structured = entry ? null : curriculum.modules.find(module => structuredLessons(module.id).some(lesson => lesson.id === lessonId));
      if (!entry && !structured) throw new ApiError("NOT_FOUND", "Lesson not found.");
      requireModule(user, entry ? entry[0] : structured.id);
      if (!user.completedLessons.includes(lessonId)) { user.completedLessons.push(lessonId); addPoints(user.id, 5, "lesson", lessonId); }
      persist();
      return { points: totalPoints(user.id), completed: user.completedLessons };
    },
    // Published decks for study (enrolled learners) or any deck for admins with the content permission.
    async deck({ token, deviceId, deckId }) {
      await wait();
      const { user } = requireSession(token, deviceId, ["student", "admin"]);
      const deck = requireDeck(deckId);
      if (user.type === "admin") { if (!hasPermission(user, "content") && !hasPermission(user, "classes")) throw new ApiError("FORBIDDEN", "Your role does not include course content."); return deckView(deck, { reveal: true, notes: true }); }
      requireModule(user, deck.moduleId);
      if (deck.status !== "published") throw new ApiError("NOT_PUBLISHED", "These slides are not published yet. Your instructor shares them after the class.");
      return { ...deckView(deck, { reveal: true }), watermark: `${user.name} · ${user.studentId} · view only` };
    },
    async interviewPrep({ token, deviceId }) {
      await wait();
      const { user } = requireSession(token, deviceId);
      return { general: interviewBank, modules: user.modules.map(id => ({ id, title: modulesById.get(id)?.title ?? id, interview: courseFor(id)?.interview ?? null })).filter(item => item.interview) };
    },
    async dailyQuiz({ token, deviceId, moduleId }) {
      await wait();
      const { user } = requireSession(token, deviceId);
      requireModule(user, moduleId);
      const today = dateKey(now());
      const attempt = state.quizAttempts.find(item => item.userId === user.id && item.moduleId === moduleId && item.date === today);
      const bank = quizBank[moduleId] ?? [];
      if (bank.length < 3) throw new ApiError("NO_CONTENT", "Today's quiz for this module is being prepared.");
      const questions = seededShuffle(bank, hashString(`${today}:${moduleId}`)).slice(0, 5).map(({ answerIndex, explanation, ...question }) => question);
      return { date: today, moduleId, questions, attempt: attempt ? { score: attempt.score, total: attempt.total, points: attempt.points } : null, streak: computeStreak(user.id) };
    },
    async submitQuiz({ token, deviceId, moduleId, answers }) {
      await wait();
      const { user } = requireSession(token, deviceId);
      requireModule(user, moduleId);
      const today = dateKey(now());
      if (state.quizAttempts.some(item => item.userId === user.id && item.moduleId === moduleId && item.date === today)) throw new ApiError("ALREADY_DONE", "You already completed today's quiz for this module.");
      const bank = quizBank[moduleId] ?? [];
      const questions = seededShuffle(bank, hashString(`${today}:${moduleId}`)).slice(0, 5);
      const review = questions.map(question => ({ id: question.id, correct: Number(answers?.[question.id]) === question.answerIndex, answerIndex: question.answerIndex, explanation: question.explanation }));
      const score = review.filter(item => item.correct).length;
      const previousStreak = computeStreak(user.id, today);
      const streakBonus = previousStreak >= 1 && !state.quizAttempts.some(item => item.userId === user.id && item.date === today) ? Math.min(previousStreak, 5) * 2 : 0;
      const points = score * 10;
      state.quizAttempts.push({ id: crypto.randomUUID(), userId: user.id, moduleId, date: today, score, total: questions.length, points, at: now() });
      addPoints(user.id, points, "quiz", `${moduleId}:${today}`);
      if (streakBonus) addPoints(user.id, streakBonus, "streak", today);
      persist();
      return { score, total: questions.length, points, streakBonus, review, streak: computeStreak(user.id), totalPoints: totalPoints(user.id) };
    },
    async completeLab({ token, deviceId, labId, score }) {
      await wait();
      const { user } = requireSession(token, deviceId);
      if (!LAB_IDS.includes(labId)) throw new ApiError("NOT_FOUND", "Unknown lab.");
      requireModule(user, labId);
      const clamped = Math.max(0, Math.min(100, Math.round(Number(score) || 0)));
      const existing = state.labRuns.find(run => run.userId === user.id && run.labId === labId);
      const newPoints = Math.round(clamped / 2);
      const previous = existing ? Math.round(existing.score / 2) : 0;
      if (!existing) state.labRuns.push({ id: crypto.randomUUID(), userId: user.id, labId, score: clamped, completedAt: now(), attempts: 1 });
      else { existing.attempts += 1; existing.score = Math.max(existing.score, clamped); existing.completedAt = now(); }
      if (newPoints > previous) addPoints(user.id, newPoints - previous, "lab", labId);
      persist();
      return { score: clamped, best: existing ? existing.score : clamped, pointsAwarded: Math.max(0, newPoints - previous), totalPoints: totalPoints(user.id) };
    },
    async assignments({ token, deviceId }) {
      await wait();
      const { user } = requireSession(token, deviceId);
      return state.content.assignments.filter(assignment => user.modules.includes(assignment.moduleId)).map(assignment => ({ ...assignment, moduleTitle: modulesById.get(assignment.moduleId).title, submission: state.submissions.find(item => item.assignmentId === assignment.id && item.userId === user.id) ?? null }));
    },
    async submitAssignment({ token, deviceId, assignmentId, text = "", link = "", file = null }) {
      await wait();
      const { user } = requireSession(token, deviceId);
      const assignment = state.content.assignments.find(item => item.id === assignmentId);
      if (!assignment) throw new ApiError("NOT_FOUND", "Assignment not found.");
      requireModule(user, assignment.moduleId);
      const fileRecord = normaliseFile(file);
      if (String(text).trim().length < 40 && !link && !fileRecord) throw new ApiError("VALIDATION", "Describe your work in at least 40 characters or attach a link or file.", { fields: { text: "Add at least 40 characters, a link or a file." } });
      if (link && !/^https:\/\/[^\s]+$/i.test(link)) throw new ApiError("VALIDATION", "Links must start with https://", { fields: { link: "Links must start with https://" } });
      let submission = state.submissions.find(item => item.assignmentId === assignmentId && item.userId === user.id);
      if (submission?.gradedAt) throw new ApiError("ALREADY_GRADED", "This assignment is already graded.");
      if (!submission) { submission = { id: crypto.randomUUID(), assignmentId, userId: user.id }; state.submissions.push(submission); }
      Object.assign(submission, { text: String(text).slice(0, 3000), link, file: fileRecord, fileName: fileRecord?.name ?? "", submittedAt: now(), score: null, feedback: null, gradedAt: null });
      createTask({ title: `Grade: ${assignment.title} by ${user.name}`, type: "grade", role: "content", refId: submission.id, link: "#/admin/grading" });
      audit(user.id, "assignment_submitted", { assignmentId, file: fileRecord?.name ?? null });
      persist();
      return submission;
    },
    async leaderboard({ token, deviceId, period = "all" }) {
      await wait();
      const { user } = requireSession(token, deviceId, ["student", "admin"]);
      const rows = leaderboardRows(period);
      const badge = ensureBadge(period);
      return { period, rows: rows.slice(0, 25), me: rows.find(row => row.userId === user.id) ?? null, badge: badge && badge.userId === user.id ? badge : null, topper: badge ? { ...badge, name: findUser(item => item.id === badge.userId)?.name } : null };
    },
    async updateProfile({ token, deviceId, name, bio, linkedin, avatar }) {
      await wait();
      const { user } = requireSession(token, deviceId, ["student", "admin"]);
      if (name !== undefined) { if (String(name).trim().length < 2) throw new ApiError("VALIDATION", "Name is too short."); user.name = String(name).trim().slice(0, 60); }
      if (bio !== undefined) user.bio = String(bio).slice(0, 280);
      if (linkedin !== undefined) { if (linkedin && !/^https:\/\/(www\.)?linkedin\.com\//i.test(linkedin)) throw new ApiError("VALIDATION", "Use a https://www.linkedin.com/ profile link."); user.linkedin = linkedin; }
      if (avatar !== undefined) { if (avatar && (!avatar.startsWith("data:image/") || avatar.length > 120000)) throw new ApiError("VALIDATION", "Use a smaller image."); user.avatar = avatar || null; }
      persist();
      return publicUser(user);
    },
    async purchase({ token, deviceId, moduleIds = [], serviceIds = [], outcome = "success" }) {
      await wait();
      const { user } = requireSession(token, deviceId);
      const newModules = [...new Set(moduleIds)].filter(id => !user.modules.includes(id));
      const requestedServices = [...new Set(serviceIds)];
      for (const id of requestedServices) if (kitUnlocked(user) && KIT_SERVICE_IDS.includes(id)) throw new ApiError("ALREADY_INCLUDED", "That benefit is already included in your career kit.");
      if (!newModules.length && !requestedServices.length) throw new ApiError("VALIDATION", "Nothing new to add.");
      const quote = quoteFor(newModules, requestedServices, user.currency ?? "INR");
      const grants = { moduleIds: newModules, serviceIds: requestedServices };
      if (payments === "manual") {
        const payment = requestManualPayment(user, quote, grants, "addon");
        persist();
        return { payment, user: publicUser(user), manual: true, instructions: instructionsText() };
      }
      const payment = { id: `PAY-${randomToken(8).toUpperCase()}`, userId: user.id, items: quote.items, subtotal: quote.subtotal, currency: quote.currency, method: "preview-card", status: outcome === "success" ? "succeeded" : "declined", at: now(), preview: true, purpose: "addon", grants };
      state.payments.unshift(payment);
      if (outcome !== "success") { persist(); throw new ApiError("PAYMENT_DECLINED", "The preview payment was declined.", { paymentId: payment.id }); }
      applyAddons(user, payment);
      audit(user.id, "addon_purchase", { paymentId: payment.id });
      persist();
      return { payment, user: publicUser(user) };
    },
    async notifications({ token, deviceId }) {
      await wait();
      const { user } = requireSession(token, deviceId, ["student", "admin"]);
      return user.notifications;
    },
    async markNotificationsRead({ token, deviceId }) {
      await wait();
      const { user } = requireSession(token, deviceId, ["student", "admin"]);
      for (const item of user.notifications) item.read = true;
      persist();
      return { ok: true };
    },
    async referralStatus({ token, deviceId }) {
      await wait();
      const { user } = requireSession(token, deviceId);
      const referred = state.users.filter(item => item.referredBy === user.id);
      const qualified = referred.filter(item => item.status === "active" && item.paidAt && now() - item.paidAt >= 7 * 24 * 60 * 60 * 1000);
      return { code: user.referralCode, referred: referred.length, qualified: qualified.length, required: curriculum.referral.qualifyingPeople, percent: curriculum.referral.refundPercent };
    },

    // ---------- admin ----------
    async adminOverview({ token, deviceId }) {
      await wait();
      const { user: admin } = requireAdmin(token, deviceId);
      const myTasks = state.tasks.filter(task => task.status !== "done" && (task.assigneeId === admin.id || (!task.assigneeId && hasPermission(admin, task.role === "content" ? "grading" : task.role === "success" ? "verify" : "tasks"))));
      const students = state.users.filter(user => user.type === "student");
      const count = (status) => students.filter(user => user.status === status).length;
      return { me: publicUser(admin), myTasks: myTasks.slice(0, 8), openTasks: state.tasks.filter(task => task.status !== "done").length, pendingVerification: count("pending_verification"), pendingPayment: count("pending_payment"), active: count("active"), suspended: count("suspended"), ungraded: state.submissions.filter(item => !item.gradedAt).length, openAlerts: state.deviceAlerts.filter(alert => alert.status === "open").length, revenue: hasPermission(admin, "payments") ? ["INR", "USD"].map(currency => ({ currency, amount: state.payments.filter(payment => payment.status === "succeeded" && payment.currency === currency).reduce((sum, payment) => sum + payment.subtotal, 0) })) : null, recentAudit: hasPermission(admin, "audit") ? state.auditLog.slice(0, 12) : null };
    },
    async adminStudents({ token, deviceId }) {
      await wait();
      requireAdmin(token, deviceId, "students");
      return state.users.filter(user => user.type === "student").map(user => ({ ...publicUser(user), moduleTitles: (user.modules.length ? user.modules : user.pendingModules).map(id => modulesById.get(id)?.title ?? id), payments: state.payments.filter(payment => payment.userId === user.id) }));
    },
    async adminVerify({ token, deviceId, userId }) {
      await wait();
      const { user: admin } = requireAdmin(token, deviceId, "verify");
      const user = findUser(item => item.id === userId && item.type === "student");
      if (!user || user.status !== "pending_verification") throw new ApiError("INVALID_STATE", "This registration is not awaiting verification.");
      state.counters.studentSeq += 1;
      user.studentId = `RV-${String(new Date(now()).getFullYear()).slice(-2)}-${String(state.counters.studentSeq).padStart(4, "0")}`;
      const temporaryPassword = `${randomToken(4)}-${randomToken(4)}-${randomCode(2)}`;
      await setPassword(user, temporaryPassword);
      user.mustChangePassword = true;
      user.status = "active";
      user.verifiedAt = now();
      user.referralCode = `RV-REF-${randomToken(5).toUpperCase()}`;
      send(user, "email", "Your Rolevia Student ID and temporary password", `Welcome, ${user.name}. Student ID: ${user.studentId}. Temporary password: ${temporaryPassword}. Sign in at the student portal; we will send a one-time code to this email or your phone, and you will set a new password on first sign-in. One device can stay signed in at a time.`);
      send(user, "sms", "Rolevia Student ID", `Your Student ID is ${user.studentId}. Your temporary password was sent by email.`);
      notify(user, "welcome", "Welcome to Rolevia", "Your plan is active. Start with the first lesson or try today's quiz.");
      completeTasks("verify", user.id, admin.id);
      audit(admin.id, "verify_student", { userId, studentId: user.studentId });
      persist();
      return { studentId: user.studentId, previewTemporaryPassword: temporaryPassword };
    },
    async adminSetStatus({ token, deviceId, userId, status, reason = "" }) {
      await wait();
      const { user: admin } = requireAdmin(token, deviceId, "students");
      const user = findUser(item => item.id === userId && item.type === "student");
      if (!user) throw new ApiError("NOT_FOUND", "Student not found.");
      if (!["active", "suspended", "rejected"].includes(status)) throw new ApiError("VALIDATION", "Unknown status.");
      if (status === "active" && !user.studentId) throw new ApiError("INVALID_STATE", "Verify the registration to issue credentials first.");
      user.status = status;
      if (status !== "active") for (const session of state.sessions) if (session.userId === user.id && !session.revokedAt) { session.revokedAt = now(); session.revokedReason = status; }
      if (status === "rejected") { send(user, "email", "About your Rolevia registration", `We could not verify your registration. ${reason || "Please reply to this email so we can help."}`); completeTasks("verify", user.id, admin.id); }
      audit(admin.id, `set_status_${status}`, { userId, reason });
      persist();
      return publicUser(user);
    },
    async adminResolveAlert({ token, deviceId, alertId }) {
      await wait();
      const { user: admin } = requireAdmin(token, deviceId, "alerts");
      const alert = state.deviceAlerts.find(item => item.id === alertId);
      if (!alert) throw new ApiError("NOT_FOUND", "Alert not found.");
      alert.status = "resolved";
      completeTasks("alert", alert.id, admin.id);
      audit(admin.id, "resolve_alert", { alertId });
      persist();
      return alert;
    },
    async adminDeviceAlerts({ token, deviceId }) {
      await wait();
      requireAdmin(token, deviceId, "alerts");
      return state.deviceAlerts.map(alert => ({ ...alert, student: publicUser(findUser(user => user.id === alert.userId)) }));
    },
    async adminPayments({ token, deviceId }) {
      await wait();
      requireAdmin(token, deviceId, "payments");
      return state.payments.map(payment => ({ ...payment, student: findUser(user => user.id === payment.userId)?.name ?? "Unknown" })).sort((a, b) => (a.status === "awaiting_confirmation" ? -1 : 0) - (b.status === "awaiting_confirmation" ? -1 : 0) || b.at - a.at);
    },
    async adminConfirmPayment({ token, deviceId, paymentId, action = "confirm" }) {
      await wait();
      const { user: admin } = requireAdmin(token, deviceId, "payments");
      const payment = state.payments.find(item => item.id === paymentId);
      if (!payment || payment.status !== "awaiting_confirmation") throw new ApiError("INVALID_STATE", "This payment is not awaiting confirmation.");
      const user = findUser(item => item.id === payment.userId);
      if (!user) throw new ApiError("NOT_FOUND", "Student not found.");
      payment.reviewedBy = admin.id;
      payment.reviewedAt = now();
      if (action === "decline") {
        payment.status = "declined";
        send(user, "email", "We could not confirm your payment", `Reference ${payment.id}: we could not match a transfer of ${payment.currency} ${payment.subtotal}. Reply to this email with your transfer proof and we will check again.`);
      } else {
        payment.status = "succeeded";
        if (payment.purpose === "registration") { if (user.status === "pending_payment") activateRegistration(user, payment); }
        else applyAddons(user, payment);
      }
      completeTasks("payment", payment.id, admin.id);
      audit(admin.id, action === "decline" ? "payment_declined" : "payment_confirmed", { paymentId, userId: user.id, amount: payment.subtotal, currency: payment.currency });
      persist();
      return { ...payment, student: user.name };
    },
    async adminContent({ token, deviceId }) {
      await wait();
      requireAdmin(token, deviceId, "content");
      return { lessons: state.content.lessons, assignments: state.content.assignments, announcements: state.content.announcements };
    },
    async adminUpsertLesson({ token, deviceId, moduleId, lesson }) {
      await wait();
      const { user: admin } = requireAdmin(token, deviceId, "content");
      if (!modulesById.has(moduleId)) throw new ApiError("NOT_FOUND", "Unknown module.");
      if (!lesson?.title || String(lesson.title).trim().length < 3) throw new ApiError("VALIDATION", "Give the lesson a title.", { fields: { title: "At least 3 characters." } });
      if (lesson.url && !/^https:\/\//i.test(lesson.url)) throw new ApiError("VALIDATION", "Lesson links must use https://", { fields: { url: "Use an https:// link." } });
      const list = state.content.lessons[moduleId] ??= [];
      const existing = list.find(item => item.id === lesson.id);
      const attachment = lesson.attachment === null ? null : lesson.attachment ? normaliseFile(lesson.attachment) : existing?.attachment ?? null;
      const record = { id: existing?.id ?? `${moduleId}-l${Date.now().toString(36)}`, title: String(lesson.title).trim().slice(0, 120), type: ["video", "reading", "task"].includes(lesson.type) ? lesson.type : "video", minutes: Math.max(1, Math.min(240, Number(lesson.minutes) || 30)), url: lesson.url ?? "", attachment, summary: String(lesson.summary ?? "").slice(0, 600), output: String(lesson.output ?? "").slice(0, 160), order: Number(lesson.order) || list.length + 1, updatedBy: admin.id, updatedAt: now() };
      if (existing) Object.assign(existing, record); else list.push(record);
      list.sort((a, b) => a.order - b.order);
      audit(admin.id, "upsert_lesson", { moduleId, lessonId: record.id });
      persist();
      return record;
    },
    async adminDeleteLesson({ token, deviceId, moduleId, lessonId }) {
      await wait();
      const { user: admin } = requireAdmin(token, deviceId, "content");
      state.content.lessons[moduleId] = (state.content.lessons[moduleId] ?? []).filter(lesson => lesson.id !== lessonId);
      audit(admin.id, "delete_lesson", { moduleId, lessonId });
      persist();
      return { ok: true };
    },
    async adminUpsertAssignment({ token, deviceId, assignment }) {
      await wait();
      const { user: admin } = requireAdmin(token, deviceId, "content");
      if (!modulesById.has(assignment?.moduleId)) throw new ApiError("NOT_FOUND", "Unknown module.");
      if (!assignment.title || String(assignment.title).trim().length < 3) throw new ApiError("VALIDATION", "Give the assignment a title.");
      const existing = state.content.assignments.find(item => item.id === assignment.id);
      const record = { id: existing?.id ?? `asg-${Date.now().toString(36)}`, moduleId: assignment.moduleId, title: String(assignment.title).trim().slice(0, 120), brief: String(assignment.brief ?? "").slice(0, 1200), acceptance: Array.isArray(assignment.acceptance) ? assignment.acceptance.slice(0, 5).map(item => String(item).slice(0, 160)) : [], maxScore: Math.max(10, Math.min(100, Number(assignment.maxScore) || 100)), dueAt: Number(assignment.dueAt) || now() + 14 * 24 * 60 * 60 * 1000 };
      if (existing) Object.assign(existing, record); else state.content.assignments.push(record);
      audit(admin.id, "upsert_assignment", { assignmentId: record.id });
      persist();
      return record;
    },
    async adminSubmissions({ token, deviceId }) {
      await wait();
      requireAdmin(token, deviceId, "grading");
      return state.submissions.map(submission => ({ ...submission, student: findUser(user => user.id === submission.userId)?.name ?? "Unknown", assignment: state.content.assignments.find(item => item.id === submission.assignmentId) ?? null })).sort((a, b) => (a.gradedAt ? 1 : 0) - (b.gradedAt ? 1 : 0) || b.submittedAt - a.submittedAt);
    },
    async adminGrade({ token, deviceId, submissionId, score, feedback = "" }) {
      await wait();
      const { user: admin } = requireAdmin(token, deviceId, "grading");
      const submission = state.submissions.find(item => item.id === submissionId);
      if (!submission) throw new ApiError("NOT_FOUND", "Submission not found.");
      const assignment = state.content.assignments.find(item => item.id === submission.assignmentId);
      const clamped = Math.max(0, Math.min(assignment?.maxScore ?? 100, Math.round(Number(score))));
      if (Number.isNaN(clamped)) throw new ApiError("VALIDATION", "Enter a numeric score.");
      const previous = submission.score ?? 0;
      Object.assign(submission, { score: clamped, feedback: String(feedback).slice(0, 1200), gradedAt: now(), gradedBy: admin.id });
      addPoints(submission.userId, clamped - previous, "assignment", submission.assignmentId);
      const student = findUser(user => user.id === submission.userId);
      if (student) notify(student, "grade", `Graded: ${assignment?.title ?? "assignment"}`, `Score ${clamped}/${assignment?.maxScore ?? 100}. ${feedback ? "Feedback is ready." : ""}`);
      completeTasks("grade", submission.id, admin.id);
      audit(admin.id, "grade", { submissionId, score: clamped });
      persist();
      return submission;
    },
    async adminAnnounce({ token, deviceId, title, body }) {
      await wait();
      const { user: admin } = requireAdmin(token, deviceId, "announce");
      if (!title || String(title).trim().length < 3) throw new ApiError("VALIDATION", "Give the announcement a title.");
      const announcement = { id: crypto.randomUUID(), title: String(title).trim().slice(0, 120), body: String(body ?? "").slice(0, 800), at: now() };
      state.content.announcements.unshift(announcement);
      for (const user of state.users) if (user.type === "student" && user.status === "active") notify(user, "announcement", announcement.title, announcement.body.slice(0, 140));
      audit(admin.id, "announce", { id: announcement.id });
      persist();
      return announcement;
    },
    async adminAudit({ token, deviceId }) {
      await wait();
      requireAdmin(token, deviceId, "audit");
      return state.auditLog.slice(0, 100);
    },
    async adminTracker({ token, deviceId }) {
      await wait();
      const { user: admin } = requireAdmin(token, deviceId, "tasks");
      const admins = state.users.filter(user => user.type === "admin").map(user => ({ id: user.id, name: user.name, adminId: user.adminId, role: user.role, roleLabel: ROLES[user.role]?.label, status: user.status }));
      const students = state.users.filter(user => user.type === "student");
      const pipeline = students.filter(user => user.status !== "rejected").map(user => {
        const payment = state.payments.find(item => item.userId === user.id && item.status === "succeeded");
        const canSeeStudents = hasPermission(admin, "students");
        const canSeePayments = hasPermission(admin, "payments");
        return { id: user.id, name: user.name, email: canSeeStudents ? user.email : null, city: user.city, status: user.status, modules: (user.modules.length ? user.modules : user.pendingModules).map(id => modulesById.get(id)?.title ?? id), paid: Boolean(payment), paymentId: canSeePayments ? payment?.id ?? null : null, currency: canSeePayments ? payment?.currency ?? user.currency : null, amount: canSeePayments ? payment?.subtotal ?? null : null, contactVerified: Boolean(user.contactVerifiedAt), registeredAt: user.createdAt, waitingSince: user.status === "pending_verification" ? user.paidAt : user.status === "pending_payment" ? user.createdAt : null, studentId: canSeeStudents ? user.studentId : null, preferredSlot: user.profile?.preferredSlot ?? "", referredBy: canSeeStudents && user.referredBy ? findUser(item => item.id === user.referredBy)?.name ?? null : null };
      }).sort((a, b) => ["pending_verification", "pending_payment", "active", "suspended"].indexOf(a.status) - ["pending_verification", "pending_payment", "active", "suspended"].indexOf(b.status) || b.registeredAt - a.registeredAt);
      const progress = students.filter(user => user.status === "active").map(user => {
        const lessons = { length: user.modules.reduce((sum, id) => sum + lessonCount(id), 0) };
        const done = user.modules.reduce((sum, id) => sum + lessonsDone(user, id), 0);
        const assignments = state.content.assignments.filter(item => user.modules.includes(item.moduleId));
        const graded = state.submissions.filter(item => item.userId === user.id && item.gradedAt).length;
        const submitted = state.submissions.filter(item => item.userId === user.id).length;
        const lastEvent = Math.max(user.verifiedAt ?? 0, ...state.pointEvents.filter(event => event.userId === user.id).map(event => event.at), ...state.sessions.filter(session => session.userId === user.id).map(session => session.lastSeen));
        const attended = state.classes.filter(item => item.status === "ended" && item.attendance.some(entry => entry.userId === user.id)).length;
        return { id: user.id, name: user.name, studentId: user.studentId, modules: user.modules.length, lessonsDone: done, lessonsTotal: lessons.length, quizDays: new Set(state.quizAttempts.filter(item => item.userId === user.id).map(item => item.date)).size, labs: state.labRuns.filter(run => run.userId === user.id).length, labsTotal: user.modules.length, assignmentsGraded: graded, assignmentsSubmitted: submitted, assignmentsTotal: assignments.length, classesAttended: attended, classesHeld: state.classes.filter(item => item.status === "ended" && user.modules.includes(item.moduleId)).length, livePoints: state.pointEvents.filter(event => event.userId === user.id && event.type === "live").reduce((sum, event) => sum + event.points, 0), points: totalPoints(user.id), weekPoints: totalPoints(user.id, now() - 7 * 24 * 60 * 60 * 1000), lastActive: lastEvent || null, deviceSwitches: user.deviceSwitches, kitUnlocked: kitUnlocked(user) };
      }).sort((a, b) => b.points - a.points);
      const tasks = state.tasks.map(task => ({ ...task, assignee: admins.find(item => item.id === task.assigneeId)?.name ?? null, mine: task.assigneeId === admin.id || (!task.assigneeId && (hasPermission(admin, task.role === "content" ? "grading" : task.role === "success" ? "verify" : "tasks") || task.role === admin.role)), overdue: task.status !== "done" && task.dueAt < now() }));
      return { me: publicUser(admin), admins, roles: ROLES, pipeline, progress, tasks, summary: { openTasks: tasks.filter(task => task.status !== "done").length, overdue: tasks.filter(task => task.overdue).length, awaitingVerification: pipeline.filter(row => row.status === "pending_verification").length, unpaid: pipeline.filter(row => row.status === "pending_payment").length, active: progress.length } };
    },
    async adminCreateTask({ token, deviceId, title, role = "lead", assigneeId = null, dueAt = null, link = "" }) {
      await wait();
      const { user: admin } = requireAdmin(token, deviceId, "tasks");
      if (!String(title ?? "").trim() || String(title).trim().length < 4) throw new ApiError("VALIDATION", "Give the task a clear title.", { fields: { title: "At least 4 characters." } });
      if (!ROLES[role]) throw new ApiError("VALIDATION", "Unknown role.");
      if (assigneeId && !findUser(user => user.id === assigneeId && user.type === "admin")) throw new ApiError("NOT_FOUND", "Assignee not found.");
      if (!hasPermission(admin, "audit") && (role !== admin.role || (assigneeId && assigneeId !== admin.id))) throw new ApiError("FORBIDDEN", "Only the programme lead creates tasks for other roles or people. You can add tasks for your own role or yourself.");
      if (link && !/^(#\/|https:\/\/)/.test(link)) throw new ApiError("VALIDATION", "Links must be an in-app route (#/...) or https://", { fields: { link: "Use #/admin/... or https://" } });
      const task = createTask({ title: String(title).trim(), type: "custom", role, refId: null, assigneeId, createdBy: admin.id, dueAt: Number(dueAt) || null, link });
      audit(admin.id, "create_task", { taskId: task.id, role, assigneeId });
      persist();
      return task;
    },
    async adminUpdateTask({ token, deviceId, taskId, action, notes }) {
      await wait();
      const { user: admin } = requireAdmin(token, deviceId, "tasks");
      const task = state.tasks.find(item => item.id === taskId);
      if (!task) throw new ApiError("NOT_FOUND", "Task not found.");
      const systemPermission = { verify: "verify", grade: "grading", alert: "alerts" }[task.type];
      if (systemPermission && !hasPermission(admin, systemPermission)) throw new ApiError("FORBIDDEN", `This task belongs to the ${ROLES[task.role]?.label ?? task.role} role.`);
      if (systemPermission && action === "done") throw new ApiError("INVALID_STATE", "System tasks complete automatically when the verification, grade or alert review is done.");
      if (task.type === "custom" && task.assigneeId && task.assigneeId !== admin.id && !hasPermission(admin, "audit") && action !== "claim") throw new ApiError("FORBIDDEN", "This task is assigned to someone else.");
      if (action === "claim") { task.assigneeId = admin.id; task.status = "in_progress"; }
      else if (action === "done") { task.status = "done"; task.completedAt = now(); task.completedBy = admin.id; }
      else if (action === "reopen") { task.status = "open"; task.completedAt = null; task.completedBy = null; }
      else if (action === "assign") { if (!hasPermission(admin, "audit")) throw new ApiError("FORBIDDEN", "Only the programme lead reassigns tasks."); task.assigneeId = notes?.assigneeId ?? null; task.status = task.assigneeId ? "in_progress" : "open"; }
      else throw new ApiError("VALIDATION", "Unknown task action.");
      if (typeof notes === "string") task.notes = notes.slice(0, 500);
      audit(admin.id, `task_${action}`, { taskId });
      persist();
      return task;
    },

    // ---------- live classes ----------
    async classes({ token, deviceId }) {
      await wait();
      sweepClasses();
      const { user } = requireSession(token, deviceId, ["student", "admin"]);
      const visible = state.classes.filter(item => item.status !== "cancelled" && (user.type === "admin" || user.modules.includes(item.moduleId)));
      return visible.map(item => classView(item, user)).sort((a, b) => a.startsAt - b.startsAt);
    },
    async classAccess({ token, deviceId, classId }) {
      await wait();
      sweepClasses();
      const { user } = requireSession(token, deviceId, ["student", "admin"]);
      const item = requireClass(classId);
      const host = user.type === "admin" && (item.hostId === user.id || hasPermission(user, "classes"));
      if (user.type === "student" && !user.modules.includes(item.moduleId)) throw new ApiError("NOT_ENROLLED", "This class belongs to a module that is not in your plan.");
      if (!host && item.status !== "live" && !(item.status === "scheduled" && item.startsAt - now() <= CLASS_JOIN_WINDOW_MS)) throw new ApiError("NOT_OPEN", item.status === "ended" ? "This class has ended." : "The class room opens 15 minutes before the start time.");
      // Hosts get the question bank without answer keys; keys stay on the server until the host closes a question.
      const questionBank = host ? (quizBank[item.moduleId] ?? []).map(({ id, question }) => ({ id, question })) : [];
      // Hosts can present any deck of the module (drafts included); learners receive slides only while following live.
      const decks = host ? state.decks.filter(deck => deck.moduleId === item.moduleId).map(deck => deckView(deck, { slides: false })) : [];
      return { room: { id: item.id, peerId: user.id, name: user.name, role: host ? "host" : "participant", avatar: user.avatar, iceServers }, class: classView(item, user), openQuiz: openQuizFor(item, user), questionBank, decks };
    },
    async classDeck({ token, deviceId, classId, deckId }) {
      await wait();
      const { user } = requireSession(token, deviceId, ["student", "admin"]);
      const item = requireClass(classId);
      const deck = requireDeck(deckId);
      if (deck.moduleId !== item.moduleId) throw new ApiError("FORBIDDEN", "That deck belongs to a different module.");
      const host = user.type === "admin" && (item.hostId === user.id || hasPermission(user, "classes"));
      if (host) return deckView(deck, { reveal: true, notes: true });
      if (!user.modules.includes(item.moduleId)) throw new ApiError("NOT_ENROLLED", "This class is not in your plan.");
      if (deck.status === "published") return deckView(deck, { reveal: true });
      if (item.status !== "live") throw new ApiError("NOT_PUBLISHED", "These slides are shown during the live class and published by the instructor afterwards.");
      return deckView(deck, { reveal: false });
    },
    async joinClass({ token, deviceId, classId }) {
      await wait();
      const access = await api.classAccess({ token, deviceId, classId });
      const item = requireClass(classId);
      const { user } = requireSession(token, deviceId, ["student", "admin"]);
      if (user.type === "student") {
        const open = item.attendance.find(entry => entry.userId === user.id && !entry.leftAt);
        if (!open) item.attendance.push({ userId: user.id, name: user.name, joinedAt: now(), leftAt: null, seconds: 0 });
      }
      audit(user.id, "join_class", { classId });
      persist();
      return access;
    },
    async leaveClass({ token, deviceId, classId }) {
      await wait();
      const { user } = requireSession(token, deviceId, ["student", "admin"]);
      const item = requireClass(classId);
      closeAttendance(item, user.id);
      persist();
      return { ok: true };
    },
    async classQuizAnswer({ token, deviceId, classId, quizId, answerIndex }) {
      await wait();
      const { user } = requireSession(token, deviceId);
      const item = requireClass(classId);
      if (!user.modules.includes(item.moduleId)) throw new ApiError("NOT_ENROLLED", "This class is not in your plan.");
      const quiz = item.quizzes.find(entry => entry.id === quizId);
      if (!quiz) throw new ApiError("NOT_FOUND", "Quiz not found.");
      if (quiz.closedAt || quiz.sentAt + quiz.seconds * 1000 < now()) throw new ApiError("QUIZ_CLOSED", "This question is closed.");
      if (quiz.responses[user.id]) throw new ApiError("ALREADY_DONE", "You already answered this question.");
      const index = Number(answerIndex);
      if (!Number.isInteger(index) || index < 0 || index >= quiz.options.length) throw new ApiError("VALIDATION", "Choose one of the options.");
      quiz.responses[user.id] = { answerIndex: index, at: now(), name: user.name };
      persist();
      return { ok: true, answered: Object.keys(quiz.responses).length };
    },
    async classQuizStatus({ token, deviceId, classId, quizId }) {
      await wait();
      const { user } = requireSession(token, deviceId, ["student", "admin"]);
      const item = requireClass(classId);
      if (user.type === "student" && !user.modules.includes(item.moduleId)) throw new ApiError("NOT_ENROLLED", "This class is not in your plan.");
      const quiz = item.quizzes.find(entry => entry.id === quizId);
      if (!quiz) throw new ApiError("NOT_FOUND", "Quiz not found.");
      return quizView(quiz, user, item);
    },
    // ---------- slide decks (admin) ----------
    async adminDecks({ token, deviceId }) {
      await wait();
      const { user: admin } = requireAdmin(token, deviceId, "content");
      return { decks: state.decks.map(deck => deckView(deck, { slides: false })).sort((a, b) => b.updatedAt - a.updatedAt), modules: curriculum.modules.map(module => ({ id: module.id, title: module.title })), classes: state.classes.filter(item => ["scheduled", "live"].includes(item.status)).map(item => classView(item, admin)) };
    },
    async adminDeck({ token, deviceId, deckId }) {
      await wait();
      requireAdmin(token, deviceId, "content");
      return deckView(requireDeck(deckId), { reveal: true, notes: true });
    },
    async adminUpsertDeck({ token, deviceId, deck }) {
      await wait();
      const { user: admin } = requireAdmin(token, deviceId, "content");
      const existing = deck?.id ? state.decks.find(item => item.id === deck.id) : null;
      if (deck?.id && !existing) throw new ApiError("NOT_FOUND", "Slide deck not found.");
      const clean = normaliseDeck(deck, existing, admin);
      if (existing && existing.moduleId !== clean.moduleId && state.classes.some(item => item.deckId === existing.id)) throw new ApiError("INVALID_STATE", "Detach the deck from its classes before moving it to another module.");
      const record = existing ?? { id: `deck-${randomToken(8).toLowerCase()}`, status: "draft", source: "admin", createdBy: admin.id, createdAt: now(), publishedAt: null };
      Object.assign(record, clean);
      if (!existing) state.decks.unshift(record);
      audit(admin.id, existing ? "update_deck" : "create_deck", { deckId: record.id, slides: record.slides.length });
      persist();
      return deckView(record, { reveal: true, notes: true });
    },
    async adminSetDeckStatus({ token, deviceId, deckId, status }) {
      await wait();
      const { user: admin } = requireAdmin(token, deviceId, "content");
      const deck = requireDeck(deckId);
      if (!["draft", "published"].includes(status)) throw new ApiError("VALIDATION", "Unknown deck status.");
      if (deck.status === status) return deckView(deck, { reveal: true, notes: true });
      deck.status = status;
      deck.updatedAt = now();
      if (status === "published") {
        deck.publishedAt = now();
        deck.publishedBy = admin.id;
        completeTasks("deck", deck.id, admin.id);
        for (const student of state.users) if (student.type === "student" && student.status === "active" && student.modules.includes(deck.moduleId)) notify(student, "content", `Slides published: ${deck.title}`, `${modulesById.get(deck.moduleId)?.title ?? deck.moduleId}: open the Slides tab of the module to read them (view only).`);
      }
      audit(admin.id, status === "published" ? "publish_deck" : "unpublish_deck", { deckId });
      persist();
      return deckView(deck, { reveal: true, notes: true });
    },
    async adminDeleteDeck({ token, deviceId, deckId }) {
      await wait();
      const { user: admin } = requireAdmin(token, deviceId, "content");
      const deck = requireDeck(deckId);
      if (state.classes.some(item => item.deckId === deck.id && item.status === "live")) throw new ApiError("INVALID_STATE", "This deck is being used in a live class.");
      for (const item of state.classes) if (item.deckId === deck.id) item.deckId = null;
      state.decks = state.decks.filter(item => item.id !== deck.id);
      audit(admin.id, "delete_deck", { deckId });
      persist();
      return { ok: true };
    },
    async adminClasses({ token, deviceId }) {
      await wait();
      sweepClasses();
      const { user: admin } = requireAdmin(token, deviceId, "classes");
      return { classes: state.classes.map(item => classView(item, admin)).sort((a, b) => b.startsAt - a.startsAt), decks: state.decks.map(deck => deckView(deck, { slides: false })), hosts: state.users.filter(user => user.type === "admin" && user.status === "active" && hasPermission(user, "classes")).map(user => ({ id: user.id, name: user.name, roleLabel: ROLES[user.role]?.label })), questionBank: Object.fromEntries(curriculum.modules.map(module => [module.id, (quizBank[module.id] ?? []).map(({ id, question }) => ({ id, question }))])) };
    },
    async adminClassDetail({ token, deviceId, classId }) {
      await wait();
      sweepClasses();
      const { user: admin } = requireAdmin(token, deviceId, "classes");
      const item = requireClass(classId);
      return { ...classView(item, admin), attendance: item.attendance.map(entry => ({ ...entry, seconds: entry.leftAt ? entry.seconds : Math.round((now() - entry.joinedAt) / 1000) })), quizzes: item.quizzes.map(quiz => ({ ...quizView(quiz, admin, item), responses: Object.entries(quiz.responses).map(([userId, response]) => ({ userId, name: response.name, answerIndex: response.answerIndex, correct: response.answerIndex === quiz.answerIndex, at: response.at })) })), recordings: item.recordings };
    },
    async adminUpsertClass({ token, deviceId, cls }) {
      await wait();
      const { user: admin } = requireAdmin(token, deviceId, "classes");
      const errors = {};
      if (!modulesById.has(cls?.moduleId)) errors.moduleId = "Choose the skill module.";
      if (!cls?.title || String(cls.title).trim().length < 4) errors.title = "Give the class a clear title.";
      const startsAt = Number(cls?.startsAt);
      if (!Number.isFinite(startsAt) || startsAt <= 0) errors.startsAt = "Pick a start date and time.";
      const duration = Number(cls?.durationMinutes) || 60;
      if (duration < 15 || duration > 240) errors.durationMinutes = "Between 15 and 240 minutes.";
      const mode = cls?.mode === "external" ? "external" : "builtin";
      if (mode === "external" && !/^https:\/\/[^\s]+$/i.test(cls?.externalUrl ?? "")) errors.externalUrl = "Paste the https:// meeting link.";
      const host = cls?.hostId ? findUser(user => user.id === cls.hostId && user.type === "admin") : admin;
      if (!host || host.status !== "active" || !hasPermission(host, "classes")) errors.hostId = "Choose an active host whose role includes live classes.";
      const deck = cls?.deckId ? state.decks.find(item => item.id === cls.deckId) : null;
      if (cls?.deckId && !deck) errors.deckId = "Choose an existing slide deck.";
      if (deck && deck.moduleId !== cls.moduleId) errors.deckId = "The deck must belong to the same module as the class.";
      if (Object.keys(errors).length) throw new ApiError("VALIDATION", Object.values(errors)[0], { fields: errors });
      const existing = state.classes.find(item => item.id === cls.id);
      if (existing && ["ended", "cancelled"].includes(existing.status)) throw new ApiError("INVALID_STATE", "Ended or cancelled classes cannot be edited.");
      const record = existing ?? { id: `cls-${randomToken(8).toLowerCase()}`, status: "scheduled", createdBy: admin.id, createdAt: now(), startedAt: null, endedAt: null, attendance: [], quizzes: [], recordings: [], recordingUrl: "", chatCount: 0 };
      Object.assign(record, { moduleId: cls.moduleId, title: String(cls.title).trim().slice(0, 120), description: String(cls.description ?? "").slice(0, 600), startsAt, durationMinutes: duration, mode, externalUrl: mode === "external" ? cls.externalUrl : "", hostId: host.id, hostName: host.name, deckId: deck?.id ?? null, updatedAt: now() });
      if (!existing) {
        state.classes.unshift(record);
        createTask({ title: `Host live class: ${record.title}`, type: "class", role: "content", refId: record.id, assigneeId: host.id, createdBy: admin.id, dueAt: startsAt, link: `#/admin/classes/${record.id}` });
        for (const student of state.users) if (student.type === "student" && student.status === "active" && student.modules.includes(record.moduleId)) notify(student, "class", `Live class scheduled: ${record.title}`, `${modulesById.get(record.moduleId).title} · ${new Date(startsAt).toUTCString()} (${duration} min). Join from Live classes.`);
      } else {
        const task = state.tasks.find(entry => entry.type === "class" && entry.refId === record.id && entry.status !== "done");
        if (task) { task.dueAt = startsAt; task.assigneeId = host.id; task.title = `Host live class: ${record.title}`; }
      }
      audit(admin.id, existing ? "update_class" : "create_class", { classId: record.id });
      persist();
      return classView(record, admin);
    },
    async adminSetClassStatus({ token, deviceId, classId, status }) {
      await wait();
      const { user: admin } = requireAdmin(token, deviceId, "classes");
      const item = requireClass(classId);
      if (!["live", "ended", "cancelled"].includes(status)) throw new ApiError("VALIDATION", "Unknown class status.");
      if (status === "live") { if (item.status !== "scheduled") throw new ApiError("INVALID_STATE", "Only scheduled classes can start."); item.status = "live"; item.startedAt = now(); for (const student of state.users) if (student.type === "student" && student.status === "active" && student.modules.includes(item.moduleId)) notify(student, "class", `Live now: ${item.title}`, "Your class has started. Join from Live classes."); }
      if (status === "ended") { if (item.status !== "live") throw new ApiError("INVALID_STATE", "Only live classes can end."); endLiveClass(item, admin.id); }
      if (status === "cancelled") { if (item.status === "ended") throw new ApiError("INVALID_STATE", "Ended classes cannot be cancelled."); item.status = "cancelled"; completeTasks("class", item.id, admin.id); }
      audit(admin.id, `class_${status}`, { classId });
      persist();
      return classView(item, admin);
    },
    async adminPushQuiz({ token, deviceId, classId, questionId = null, question = "", options = [], answerIndex = 0, seconds = 45 }) {
      await wait();
      const { user: admin } = requireAdmin(token, deviceId, "classes");
      const item = requireClass(classId);
      if (item.status !== "live") throw new ApiError("INVALID_STATE", "Start the class before sending a live question.");
      if (item.quizzes.some(quiz => !quiz.closedAt && quiz.sentAt + quiz.seconds * 1000 > now())) throw new ApiError("INVALID_STATE", "Close the current question before sending another.");
      let record;
      if (questionId) {
        const bankQuestion = (quizBank[item.moduleId] ?? []).find(entry => entry.id === questionId);
        if (!bankQuestion) throw new ApiError("NOT_FOUND", "Question not found in this module's bank.");
        record = { question: bankQuestion.question, options: bankQuestion.options, answerIndex: bankQuestion.answerIndex, explanation: bankQuestion.explanation, source: questionId };
      } else {
        const cleanOptions = (Array.isArray(options) ? options : []).map(option => String(option).trim()).filter(Boolean).slice(0, 6);
        if (String(question).trim().length < 5) throw new ApiError("VALIDATION", "Write the question.", { fields: { question: "At least 5 characters." } });
        if (cleanOptions.length < 2) throw new ApiError("VALIDATION", "Give at least two options.", { fields: { options: "Two to six options, one per line." } });
        const index = Number(answerIndex);
        if (!Number.isInteger(index) || index < 0 || index >= cleanOptions.length) throw new ApiError("VALIDATION", "Mark which option is correct.", { fields: { answerIndex: "Choose the correct option." } });
        record = { question: String(question).trim().slice(0, 300), options: cleanOptions, answerIndex: index, explanation: "", source: "custom" };
      }
      const quiz = { id: `lq-${randomToken(6).toLowerCase()}`, ...record, seconds: Math.max(10, Math.min(300, Number(seconds) || 45)), sentAt: now(), sentBy: admin.id, closedAt: null, responses: {}, results: null };
      item.quizzes.push(quiz);
      audit(admin.id, "push_quiz", { classId, quizId: quiz.id });
      persist();
      return quizView(quiz, admin, item);
    },
    async adminCloseQuiz({ token, deviceId, classId, quizId }) {
      await wait();
      const { user: admin } = requireAdmin(token, deviceId, "classes");
      const item = requireClass(classId);
      const quiz = item.quizzes.find(entry => entry.id === quizId);
      if (!quiz) throw new ApiError("NOT_FOUND", "Quiz not found.");
      if (!quiz.closedAt) closeQuiz(item, quiz);
      audit(admin.id, "close_quiz", { classId, quizId });
      persist();
      return quizView(quiz, admin, item);
    },
    async adminAddRecording({ token, deviceId, classId, url = "", name = "", size = 0, durationSeconds = 0, storage: where = "link" }) {
      await wait();
      const { user: admin } = requireAdmin(token, deviceId, "classes");
      const item = requireClass(classId);
      if (url && !/^https:\/\/[^\s]+$/i.test(url)) throw new ApiError("VALIDATION", "Recording links must start with https://", { fields: { url: "Use an https:// link (Google Drive, GitHub release, etc.)." } });
      if (!url && !name) throw new ApiError("VALIDATION", "Add a link or a file name.");
      const recording = { id: crypto.randomUUID(), url, name: String(name).slice(0, 120), size: Number(size) || 0, durationSeconds: Math.round(Number(durationSeconds) || 0), storage: ["drive", "github", "local", "link"].includes(where) ? where : "link", at: now(), addedBy: admin.id };
      item.recordings.push(recording);
      if (url) item.recordingUrl = url;
      audit(admin.id, "add_recording", { classId, storage: recording.storage });
      persist();
      return recording;
    },
    async adminNoteChat({ token, deviceId, classId, count }) {
      await wait();
      requireAdmin(token, deviceId, "classes");
      const item = requireClass(classId);
      item.chatCount = Math.max(item.chatCount, Number(count) || 0);
      persist();
      return { ok: true };
    },

    // ---------- operations (unlisted) ----------
    async opsLogin({ passphrase, deviceId, deviceLabel = "Unknown device" }) {
      await wait();
      const ops = findUser(user => user.type === "ops");
      if (!ops) throw new ApiError("INVALID_CREDENTIALS", "That passphrase is not right.");
      if (ops.lockUntil && ops.lockUntil > now()) throw new ApiError("LOCKED", `Too many attempts. Try again in ${Math.ceil((ops.lockUntil - now()) / 60000)} minutes.`);
      if (!(await checkPassword(ops, passphrase ?? ""))) {
        ops.failedLogins = (ops.failedLogins ?? 0) + 1;
        if (ops.failedLogins >= LOCK_AFTER_FAILURES) { ops.lockUntil = now() + LOCK_MS; ops.failedLogins = 0; audit(ops.id, "lockout"); }
        persist();
        throw new ApiError("INVALID_CREDENTIALS", "That passphrase is not right.");
      }
      ops.failedLogins = 0;
      const { session } = openSession(ops, deviceId, deviceLabel);
      audit(ops.id, "ops_login", { deviceLabel });
      persist();
      return { token: session.token };
    },
    async opsSummary({ token, deviceId }) {
      await wait();
      requireSession(token, deviceId, ["ops"]);
      const students = state.users.filter(user => user.type === "student");
      const funnel = ["pending_payment", "pending_verification", "active", "suspended", "rejected"].map(status => ({ status, count: students.filter(user => user.status === status).length }));
      const succeeded = state.payments.filter(payment => payment.status === "succeeded");
      const byCurrency = ["INR", "USD"].map(currency => {
        const payments = succeeded.filter(payment => payment.currency === currency);
        return { currency, gross: payments.reduce((sum, payment) => sum + payment.subtotal, 0), moduleSales: payments.reduce((sum, payment) => sum + payment.items.filter(item => item.kind === "module").length, 0), serviceSales: payments.reduce((sum, payment) => sum + payment.items.filter(item => item.kind === "service").length, 0), kitsUnlocked: students.filter(user => user.currency === currency && kitUnlocked(user)).length, learners: students.filter(user => user.currency === currency && user.status === "active").length };
      });
      const cohorts = curriculum.modules.map(module => ({ id: module.id, title: module.title, enrolled: students.filter(user => user.status === "active" && user.modules.includes(module.id)).length, limit: curriculum.skillFormat.proposedCohortLimit }));
      return { funnel, byCurrency, cohorts, openAlerts: state.deviceAlerts.filter(alert => alert.status === "open").length, ungraded: state.submissions.filter(item => !item.gradedAt).length, notes: state.opsNotes, generatedAt: now() };
    },
    async opsCompanies({ token, deviceId }) {
      await wait();
      requireSession(token, deviceId, ["ops"]);
      return (state.companies ?? []).sort((a, b) => a.order - b.order).map(company => ({ ...company, logo: company.logo ? { name: company.logo.name, size: company.logo.size, type: company.logo.type, dataUrl: company.logo.dataUrl } : null }));
    },
    async opsUpsertCompany({ token, deviceId, company }) {
      await wait();
      const { user } = requireSession(token, deviceId, ["ops"]);
      const errors = {};
      const name = String(company?.name ?? "").trim();
      if (name.length < 2 || name.length > 60) errors.name = "Company name: 2 to 60 characters.";
      if (company?.careersUrl && !/^https:\/\/[^\s]+$/i.test(company.careersUrl)) errors.careersUrl = "Careers link must start with https://";
      const existing = company?.id ? (state.companies ?? []).find(item => item.id === company.id) : null;
      if (company?.id && !existing) throw new ApiError("NOT_FOUND", "Company not found.");
      let logo = existing?.logo ?? null;
      if (company?.logo === null) logo = null;
      else if (company?.logo?.dataUrl) {
        const file = normaliseFile(company.logo);
        if (!file?.dataUrl || !/^data:image\/(png|jpeg|svg\+xml|webp);base64,/.test(file.dataUrl)) errors.logo = "Upload a PNG, JPG, SVG or WebP file.";
        else if (file.size > MAX_LOGO_BYTES) errors.logo = "Logo files must be 60 KB or smaller.";
        else logo = file;
      }
      let permission = existing?.permission ?? null;
      if (company?.permission === null) permission = null;
      else if (company?.permission) {
        const grantedBy = String(company.permission.grantedBy ?? "").trim();
        const reference = String(company.permission.reference ?? "").trim();
        const date = String(company.permission.date ?? "").trim();
        if (grantedBy.length < 3 || reference.length < 3 || !/^\d{4}-\d{2}-\d{2}$/.test(date)) errors.permission = "Record who granted permission, a reference (email subject, letter or licence id) and the date.";
        else permission = { grantedBy: grantedBy.slice(0, 120), reference: reference.slice(0, 160), date, recordedBy: user.id, recordedAt: now() };
      }
      // A logo without a permission record is kept privately but never published.
      if (Object.keys(errors).length) throw new ApiError("VALIDATION", Object.values(errors)[0], { fields: errors });
      state.companies ??= [];
      const record = existing ?? { id: `co-${randomToken(6).toLowerCase()}`, order: state.companies.length + 1, visible: true };
      Object.assign(record, { name, careersUrl: company?.careersUrl ? String(company.careersUrl).trim() : "", logo, permission, visible: company?.visible !== false, updatedAt: now() });
      if (!existing) state.companies.push(record);
      audit(user.id, existing ? "update_company" : "create_company", { companyId: record.id, logo: Boolean(logo), permission: Boolean(permission) });
      persist();
      return record;
    },
    async opsDeleteCompany({ token, deviceId, companyId }) {
      await wait();
      const { user } = requireSession(token, deviceId, ["ops"]);
      const before = (state.companies ?? []).length;
      state.companies = (state.companies ?? []).filter(item => item.id !== companyId);
      if (state.companies.length === before) throw new ApiError("NOT_FOUND", "Company not found.");
      audit(user.id, "delete_company", { companyId });
      persist();
      return { ok: true };
    },
    async opsTeam({ token, deviceId }) {
      await wait();
      requireSession(token, deviceId, ["ops"]);
      return { roles: ROLES, admins: state.users.filter(user => user.type === "admin").map(user => ({ id: user.id, adminId: user.adminId, name: user.name, email: user.email, phone: user.phone, role: user.role, roleLabel: ROLES[user.role]?.label, status: user.status, mustChangePassword: user.mustChangePassword, lastSignIn: state.sessions.filter(session => session.userId === user.id).map(session => session.createdAt).sort((a, b) => b - a)[0] ?? null, openTasks: state.tasks.filter(task => task.assigneeId === user.id && task.status !== "done").length, createdAt: user.createdAt })) };
    },
    async opsCreateAdmin({ token, deviceId, name, email, phone, role }) {
      await wait();
      const { user: ops } = requireSession(token, deviceId, ["ops"]);
      const errors = {};
      if (!String(name ?? "").trim() || String(name).trim().length < 2) errors.name = "Enter the person's name.";
      const normalisedEmail = String(email ?? "").trim().toLowerCase();
      if (!EMAIL_PATTERN.test(normalisedEmail)) errors.email = "Enter a valid email address.";
      if (!PHONE_PATTERN.test(String(phone ?? "").replace(/[\s-]/g, ""))) errors.phone = "Enter a mobile number with country code.";
      if (!ROLES[role]) errors.role = "Choose a role.";
      if (findUser(user => user.email === normalisedEmail)) errors.email = "That email already has an account.";
      if (Object.keys(errors).length) throw new ApiError("VALIDATION", Object.values(errors)[0], { fields: errors });
      state.counters.adminSeq += 1;
      const temporaryPassword = `${randomToken(4)}-${randomToken(4)}-${randomCode(2)}`;
      const admin = blankUser({ type: "admin", role, adminId: `RV-ADM-${String(state.counters.adminSeq).padStart(3, "0")}`, name: String(name).trim().slice(0, 60), email: normalisedEmail, phone: String(phone).replace(/[\s-]/g, ""), status: "active", mustChangePassword: true, createdAt: now() });
      await setPassword(admin, temporaryPassword);
      state.users.push(admin);
      send(admin, "email", "Your Rolevia admin access", `Hello ${admin.name}. Admin ID: ${admin.adminId}. Role: ${ROLES[role].label}. Temporary password: ${temporaryPassword}. Sign in at the admin console with a one-time code and set a new password on first sign-in.`);
      audit(ops.id, "create_admin", { adminId: admin.adminId, role });
      persist();
      return { adminId: admin.adminId, previewTemporaryPassword: temporaryPassword, role: ROLES[role].label };
    },
    async opsResetAdmin({ token, deviceId, adminUserId }) {
      await wait();
      const { user: ops } = requireSession(token, deviceId, ["ops"]);
      const admin = findUser(user => user.id === adminUserId && user.type === "admin");
      if (!admin) throw new ApiError("NOT_FOUND", "Admin not found.");
      const temporaryPassword = `${randomToken(4)}-${randomToken(4)}-${randomCode(2)}`;
      await setPassword(admin, temporaryPassword);
      admin.mustChangePassword = true;
      for (const session of state.sessions) if (session.userId === admin.id && !session.revokedAt) { session.revokedAt = now(); session.revokedReason = "password_reset"; }
      send(admin, "email", "Your Rolevia admin password was reset", `Admin ID: ${admin.adminId}. Temporary password: ${temporaryPassword}. Set a new password at first sign-in.`);
      audit(ops.id, "reset_admin", { adminId: admin.adminId });
      persist();
      return { adminId: admin.adminId, previewTemporaryPassword: temporaryPassword };
    },
    async opsSetAdmin({ token, deviceId, adminUserId, status, role }) {
      await wait();
      const { user: ops } = requireSession(token, deviceId, ["ops"]);
      const admin = findUser(user => user.id === adminUserId && user.type === "admin");
      if (!admin) throw new ApiError("NOT_FOUND", "Admin not found.");
      if (status) { if (!["active", "suspended"].includes(status)) throw new ApiError("VALIDATION", "Unknown status."); admin.status = status; if (status !== "active") for (const session of state.sessions) if (session.userId === admin.id && !session.revokedAt) { session.revokedAt = now(); session.revokedReason = "suspended"; } }
      if (role) { if (!ROLES[role]) throw new ApiError("VALIDATION", "Unknown role."); admin.role = role; }
      audit(ops.id, "update_admin", { adminId: admin.adminId, status, role });
      persist();
      return publicUser(admin);
    },
    async opsSaveNote({ token, deviceId, text }) {
      await wait();
      requireSession(token, deviceId, ["ops"]);
      if (!String(text).trim()) throw new ApiError("VALIDATION", "Write something first.");
      state.opsNotes.unshift({ id: crypto.randomUUID(), text: String(text).slice(0, 1000), at: now() });
      state.opsNotes = state.opsNotes.slice(0, 50);
      persist();
      return state.opsNotes;
    },

    // ---------- preview helpers (not part of the production API) ----------
    async previewInbox() { await wait(); return state.outbox; },
    async previewForeignLogin({ userId }) {
      await wait();
      const user = findUser(item => item.id === userId && item.status === "active");
      if (!user) throw new ApiError("NOT_FOUND", "Sign in first.");
      const { warned } = openSession(user, `preview-device-${randomToken(6)}`, "Simulated other device");
      audit(user.id, "preview_foreign_login", { deviceSwitches: user.deviceSwitches });
      persist();
      return { deviceSwitches: user.deviceSwitches, threshold: state.settings.deviceSwitchThreshold, warned };
    },
    async previewReset() { state = await seed(curriculum, assignmentBriefs, now()); persist(); return { ok: true }; },
    previewCredentials() { return state.settings.previewCredentials; },
    reloadFromStorage() { reloadIfStale(); },
    _state: () => state,
  };

  function computeStreak(userId, excludingDate = null) {
    const days = new Set(state.quizAttempts.filter(attempt => attempt.userId === userId && attempt.date !== excludingDate).map(attempt => attempt.date));
    let streak = 0;
    let cursor = excludingDate ? new Date(excludingDate) : new Date(dateKey(now()));
    if (excludingDate || !days.has(dateKey(cursor.getTime()))) cursor.setUTCDate(cursor.getUTCDate() - 1);
    while (days.has(dateKey(cursor.getTime()))) { streak += 1; cursor.setUTCDate(cursor.getUTCDate() - 1); }
    return streak;
  }

  return api;
}

function blankUser(overrides = {}) {
  return { id: crypto.randomUUID(), type: "student", studentId: null, adminId: null, role: null, profile: null, contactVerifiedAt: null, name: "", email: "", phone: "", city: "", currency: "INR", passHash: null, salt: null, mustChangePassword: false, status: "pending_payment", modules: [], pendingModules: [], addons: [], completedLessons: [], avatar: null, bio: "", linkedin: "", notifications: [], deviceSwitches: 0, deviceHistory: [], failedLogins: 0, lockUntil: null, referralCode: null, referredBy: null, createdAt: Date.now(), verifiedAt: null, paidAt: null, kitNotifiedAt: null, ...overrides };
}

// Seed data is fictional preview content so every screen has something to show.
// Workshop decks shipped with the course material. Preview: published, except the deck of the upcoming demo
// class which stays a draft so the present → publish workflow can be demonstrated. Production: all drafts.
function seedDecks(curriculum, courseContent, now, { status = "draft", draftIds = [] } = {}) {
  return curriculum.modules.filter(module => courseContent[module.id]?.deck).map(module => ({
    id: `deck-${module.id}-workshop`, moduleId: module.id, title: courseContent[module.id].deck.title, source: "seed",
    slides: courseContent[module.id].deck.slides.map((slide, index) => ({ id: `${module.id}-s${index + 1}`, ...slide })),
    status: draftIds.includes(module.id) ? "draft" : status, createdBy: "system", createdAt: now, updatedAt: now, publishedAt: status === "published" && !draftIds.includes(module.id) ? now : null,
  }));
}

// Upgrades stored state from older versions without discarding data.
export function migrateState(state, { courseContent = {}, now = Date.now() } = {}) {
  const next = { ...state };
  if (next.version < 7) {
    next.decks = next.decks ?? [];
    const present = new Set(next.decks.map(deck => deck.moduleId));
    for (const [moduleId, content] of Object.entries(courseContent)) if (content?.deck && !present.has(moduleId)) next.decks.push({ id: `deck-${moduleId}-workshop`, moduleId, title: content.deck.title, source: "seed", slides: content.deck.slides.map((slide, index) => ({ id: `${moduleId}-s${index + 1}`, ...slide })), status: "draft", createdBy: "system", createdAt: now, updatedAt: now, publishedAt: null });
    next.classes = (next.classes ?? []).map(item => ({ deckId: null, ...item }));
    next.version = 7;
  }
  if (next.version < 8) {
    next.companies = next.companies ?? seedCompanies(now);
    next.version = 8;
  }
  return next;
}

async function seed(curriculum, assignmentBriefs, now, courseContent = {}) {
  const day = 24 * 60 * 60 * 1000;
  const previewCredentials = {
    student: { id: "RV-26-0001", password: "Learn#2026" },
    students: [
      { id: "RV-26-0001", name: "Ananya Iyer", note: "5 modules · career kit unlocked · leaderboard #1" },
      { id: "RV-26-0002", name: "Rohit Menon", note: "3 modules · enrolled in the demo live class module" },
      { id: "RV-26-0003", name: "Priya Sharma", note: "2 modules" },
    ],
    admins: [
      { adminId: "RV-ADM-001", name: "Arindam Chatterjee", email: "arindam@rolevia.demo", phone: "+910000000001", role: "lead", password: "Lead-Arindam-2026" },
      { adminId: "RV-ADM-002", name: "Ayush", email: "ayush@rolevia.demo", phone: "+910000000002", role: "content", password: "Content-Ayush-2026" },
      { adminId: "RV-ADM-003", name: "Souvik", email: "souvik@rolevia.demo", phone: "+910000000003", role: "success", password: "Success-Souvik-2026" },
    ],
    ops: { passphrase: "ROLEVIA-OPS-PREVIEW" },
  };
  const studentAuth = { salt: "seed-student", passHash: await sha256(`seed-student:${previewCredentials.student.password}`) };
  const opsAuth = { salt: "seed-ops", passHash: await sha256(`seed-ops:${previewCredentials.ops.passphrase}`) };
  const people = [
    ["Ananya Iyer", "ananya@example.com", "+919800000001", "Bengaluru", ["spreadsheets", "dashboards", "business-ai", "canva", "budgeting"], 28],
    ["Rohit Menon", "rohit@example.com", "+919800000002", "Kochi", ["spreadsheets", "crm", "business-ai"], 21],
    ["Priya Sharma", "priya@example.com", "+919800000003", "Pune", ["hr-tracker", "spreadsheets"], 17],
    ["Daniel Okafor", "daniel@example.com", "+2348000000004", "Lagos", ["business-ai", "trello", "budgeting"], 12],
    ["Meera Krishnan", "meera@example.com", "+919800000005", "Chennai", ["canva", "crm"], 9],
    ["Arjun Das", "arjun@example.com", "+919800000006", "Kolkata", ["spreadsheets"], 4],
  ];
  const users = people.map(([name, email, phone, city, modules, daysAgo], index) => blankUser({ id: `u-student-${index + 1}`, studentId: `RV-26-${String(index + 1).padStart(4, "0")}`, name, email, phone, city, modules, status: "active", currency: city === "Lagos" ? "USD" : "INR", createdAt: now - daysAgo * day, verifiedAt: now - (daysAgo - 1) * day, paidAt: now - daysAgo * day, referralCode: `RV-REF-${String(index + 1).padStart(5, "0")}`, ...studentAuth }));
  users[0].bio = "MBA 2025. Learning reporting and AI habits for an operations role.";
  users[0].profile = { education: "mba", graduationYear: "2025", currentStatus: "fresher", preferredSlot: "weekend-morning", goal: "Move into an operations analyst role within six months." };
  users.forEach(user => { user.contactVerifiedAt = user.createdAt; });
  for (const [index, admin] of previewCredentials.admins.entries()) {
    users.push(blankUser({ id: `u-admin-${index + 1}`, type: "admin", adminId: admin.adminId, role: admin.role, name: admin.name, email: admin.email, phone: admin.phone, status: "active", mustChangePassword: true, createdAt: now - 30 * day, salt: `seed-admin-${index + 1}`, passHash: await sha256(`seed-admin-${index + 1}:${admin.password}`) }));
  }
  users.push(blankUser({ id: "u-ops", type: "ops", name: "Founder Operations", email: "ops@rolevia.demo", phone: "+910000000001", status: "active", ...opsAuth }));
  const lessons = {};
  for (const module of curriculum.modules) {
    lessons[module.id] = module.sessions.map(([week, title, detail, output], index) => ({ id: `${module.id}-l${index + 1}`, title: `${week} / ${title}`, type: index % 2 === 0 ? "video" : "task", minutes: index % 2 === 0 ? 60 : 55, url: "", summary: detail, output, order: index + 1 }));
  }
  const assignments = curriculum.modules.map(module => {
    const brief = assignmentBriefs[module.id];
    return { id: `asg-${module.id}`, moduleId: module.id, title: brief?.title ?? `${module.title}: final project`, brief: brief?.brief ?? module.capstone, acceptance: brief?.acceptance ?? [module.assessment], maxScore: brief?.maxScore ?? 100, dueAt: now + 14 * day };
  });
  const pointEvents = [];
  const addEvent = (userId, points, type, ref, at) => pointEvents.push({ id: crypto.randomUUID(), userId, points, type, ref, at });
  const quizAttempts = [];
  const labRuns = [];
  const submissions = [];
  users.filter(user => user.type === "student").forEach((user, index) => {
    const activity = [6, 5, 4, 3, 2, 1][index];
    for (let dayOffset = 1; dayOffset <= activity; dayOffset += 1) {
      const at = now - dayOffset * day;
      const moduleId = user.modules[dayOffset % user.modules.length];
      const score = Math.max(2, 5 - ((dayOffset + index) % 3));
      quizAttempts.push({ id: crypto.randomUUID(), userId: user.id, moduleId, date: dateKey(at), score, total: 5, points: score * 10, at });
      addEvent(user.id, score * 10, "quiz", `${moduleId}:${dateKey(at)}`, at);
    }
    user.modules.slice(0, 2).forEach((moduleId, position) => {
      const score = [92, 78, 85, 70, 64, 58][index] - position * 10;
      labRuns.push({ id: crypto.randomUUID(), userId: user.id, labId: moduleId, score, completedAt: now - (index + 1) * day, attempts: 1 });
      addEvent(user.id, Math.round(score / 2), "lab", moduleId, now - (index + 1) * day);
      (lessons[moduleId] ?? []).slice(0, 2).forEach(lesson => { user.completedLessons.push(lesson.id); addEvent(user.id, 5, "lesson", lesson.id, now - (index + 2) * day); });
    });
    if (index < 3) {
      const assignment = assignments.find(item => item.moduleId === user.modules[0]);
      const graded = index < 2;
      const score = [88, 76][index] ?? null;
      submissions.push({ id: crypto.randomUUID(), assignmentId: assignment.id, userId: user.id, text: "Submitted the final project workbook with a checks tab, summary and a short decision note using the fictional dataset.", link: "https://example.com/preview-submission", file: { name: "final-project.xlsx", size: 48213, type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", sha256: null, dataUrl: null, stored: false }, fileName: "final-project.xlsx", submittedAt: now - 2 * day, score: graded ? score : null, feedback: graded ? "Clear checks and a readable summary. Label the assumptions on the summary tab next time." : null, gradedAt: graded ? now - day : null, gradedBy: graded ? "u-admin-2" : null });
      if (graded) addEvent(user.id, score, "assignment", assignment.id, now - day);
    }
  });
  const ungraded = submissions.find(item => !item.gradedAt);
  const tasks = [
    { id: crypto.randomUUID(), title: `Grade: ${assignments.find(item => item.id === ungraded.assignmentId).title} by ${users.find(user => user.id === ungraded.userId).name}`, type: "grade", role: "content", refId: ungraded.id, assigneeId: null, createdBy: "system", status: "open", createdAt: now - 2 * day, dueAt: now, completedAt: null, completedBy: null, link: "#/admin/grading", notes: "" },
    { id: crypto.randomUUID(), title: "Upload week 1 recordings for Business Spreadsheets", type: "custom", role: "content", refId: null, assigneeId: "u-admin-2", createdBy: "u-admin-1", status: "in_progress", createdAt: now - day, dueAt: now + 3 * day, completedAt: null, completedBy: null, link: "#/admin/content", notes: "Recording exported; upload link pending." },
    { id: crypto.randomUUID(), title: "Confirm live-session calendar for batch 1", type: "custom", role: "success", refId: null, assigneeId: "u-admin-3", createdBy: "u-admin-1", status: "open", createdAt: now - day, dueAt: now + 5 * day, completedAt: null, completedBy: null, link: "", notes: "" },
  ];
  const classes = [
    { id: "cls-demo-live", moduleId: "spreadsheets", title: "Week 1 live workshop: cleaning a sales register", description: "Bring the practice file. We clean the register together, then run two live questions.", startsAt: now + 10 * 60 * 1000, durationMinutes: 60, mode: "builtin", externalUrl: "", hostId: "u-admin-2", hostName: "Ayush", status: "scheduled", createdBy: "u-admin-1", createdAt: now - day, updatedAt: now - day, startedAt: null, endedAt: null, attendance: [], quizzes: [], recordings: [], recordingUrl: "", chatCount: 0 },
    { id: "cls-demo-past", moduleId: "business-ai", title: "Kick-off: briefing an AI assistant well", description: "Introductory session with a live poll and two checked examples.", startsAt: now - 3 * day, durationMinutes: 60, mode: "builtin", externalUrl: "", hostId: "u-admin-2", hostName: "Ayush", status: "ended", createdBy: "u-admin-1", createdAt: now - 5 * day, updatedAt: now - 3 * day, startedAt: now - 3 * day, endedAt: now - 3 * day + 55 * 60 * 1000, attendance: [{ userId: "u-student-1", name: "Ananya Iyer", joinedAt: now - 3 * day, leftAt: now - 3 * day + 54 * 60 * 1000, seconds: 3240 }, { userId: "u-student-2", name: "Rohit Menon", joinedAt: now - 3 * day + 2 * 60 * 1000, leftAt: now - 3 * day + 50 * 60 * 1000, seconds: 2880 }], quizzes: [{ id: "lq-demo1", question: "Which element makes an AI brief checkable?", options: ["A confident tone", "Acceptance criteria with sources", "Longer paragraphs", "A request to impress"], answerIndex: 1, explanation: "Acceptance criteria tell you how to verify the answer.", source: "custom", seconds: 45, sentAt: now - 3 * day + 20 * 60 * 1000, sentBy: "u-admin-2", closedAt: now - 3 * day + 21 * 60 * 1000, responses: { "u-student-1": { answerIndex: 1, at: now - 3 * day + 20 * 60 * 1000 + 15000, name: "Ananya Iyer" }, "u-student-2": { answerIndex: 0, at: now - 3 * day + 20 * 60 * 1000 + 22000, name: "Rohit Menon" } }, results: { counts: [1, 1, 0, 0], correct: 1, total: 2 } }], recordings: [{ id: "rec-demo", url: "https://example.com/preview-recording", name: "kickoff-recording.webm", size: 182000000, durationSeconds: 3300, storage: "link", at: now - 3 * day + 60 * 60 * 1000, addedBy: "u-admin-2" }], recordingUrl: "https://example.com/preview-recording", chatCount: 14 },
  ];
  addEvent("u-student-1", 10, "live", "cls-demo-past:lq-demo1", now - 3 * day + 21 * 60 * 1000);
  addEvent("u-student-2", 2, "live", "cls-demo-past:lq-demo1", now - 3 * day + 21 * 60 * 1000);
  tasks.push({ id: crypto.randomUUID(), title: "Host live class: Week 1 live workshop: cleaning a sales register", type: "class", role: "content", refId: "cls-demo-live", assigneeId: "u-admin-2", createdBy: "u-admin-1", status: "open", createdAt: now - day, dueAt: now + 10 * 60 * 1000, completedAt: null, completedBy: null, link: "#/admin/classes/cls-demo-live", notes: "" });
  const decks = seedDecks(curriculum, courseContent, now - day, { status: "published", draftIds: ["spreadsheets"] });
  for (const item of classes) item.deckId = decks.find(deck => deck.moduleId === item.moduleId)?.id ?? null;
  return {
    version: STATE_VERSION,
    rev: 0,
    settings: { deviceSwitchThreshold: 5, previewCredentials },
    tasks, classes, decks, companies: seedCompanies(now),
    users, payments: users.filter(user => user.type === "student").map(user => ({ id: `PAY-SEED${user.id.slice(-1)}`, userId: user.id, items: user.modules.map(id => ({ id, kind: "module", title: curriculum.modules.find(module => module.id === id).title, amount: curriculum.modules.find(module => module.id === id)[`price${user.currency}`] })), subtotal: user.modules.reduce((sum, id) => sum + curriculum.modules.find(module => module.id === id)[`price${user.currency}`], 0), currency: user.currency, method: "preview-card", status: "succeeded", at: user.paidAt, preview: true })),
    sessions: [], otps: [], outbox: [], deviceAlerts: [], badges: [], opsNotes: [{ id: crypto.randomUUID(), text: "Preview data only. Replace with the live backend before any real enrollment.", at: now }],
    content: { lessons, assignments, announcements: [{ id: "ann-1", title: "Welcome to the Rolevia preview", body: "Everything here uses fictional data. Try today's quiz, open a lab and check the leaderboard.", at: now - day }, { id: "ann-2", title: "Live workshop calendar", body: "Dates and time zones are confirmed by email before each two-week module starts.", at: now - 3 * day }] },
    submissions, quizAttempts, labRuns, pointEvents, auditLog: [{ at: now, actor: "system", action: "seed", meta: {} }], counters: { studentSeq: 6, adminSeq: 3 },
  };
}


// Production seed: no fictional people. Admin accounts are created from the operations view.
async function emptySeed(now, opsPassphrase, curriculum, courseContent = {}) {
  if (!opsPassphrase || String(opsPassphrase).length < 12) throw new Error("An operations passphrase of at least 12 characters is required to start with an empty database.");
  const ops = blankUser({ id: "u-ops", type: "ops", name: "Founder Operations", email: "ops@rolevia.local", phone: "+910000000000", status: "active", salt: randomToken(16) });
  ops.passHash = await sha256(`${ops.salt}:${opsPassphrase}`);
  return { version: STATE_VERSION, rev: 0, settings: { deviceSwitchThreshold: 5, previewCredentials: null }, tasks: [], classes: [], decks: seedDecks(curriculum, courseContent, now), companies: seedCompanies(now), users: [ops], payments: [], sessions: [], otps: [], outbox: [], deviceAlerts: [], badges: [], opsNotes: [], content: { lessons: {}, assignments: [], announcements: [] }, submissions: [], quizAttempts: [], labRuns: [], pointEvents: [], auditLog: [{ at: now, actor: "system", action: "init", meta: {} }], counters: { studentSeq: 0, adminSeq: 0 } };
}
