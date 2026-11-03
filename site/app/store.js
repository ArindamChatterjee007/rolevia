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

const encoder = new TextEncoder();
const OTP_TTL_MS = 5 * 60 * 1000;
const SESSION_IDLE_MS = 7 * 24 * 60 * 60 * 1000;
const LOCK_AFTER_FAILURES = 5;
const LOCK_MS = 15 * 60 * 1000;
const SAFE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";

export const SERVICE_IDS = ["resume-audit", "resume-writing", "linkedin", "cover-letter", "mock", "career-pack"];
export const KIT_SERVICE_IDS = ["interview", "resume-audit", "resume-writing"];
export const LAB_IDS = ["spreadsheets", "dashboards", "business-ai", "canva", "crm", "hr-tracker", "trello", "budgeting"];

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
  return { get: () => value, set: (next) => { value = next; } };
}

export function browserStorage(key, localStorage) {
  return {
    get: () => {
      try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : null; } catch { return null; }
    },
    set: (state) => localStorage.setItem(key, JSON.stringify(state)),
  };
}

export async function createMockServer({ storage, curriculum, quizBank = {}, assignmentBriefs = {}, now = () => Date.now(), latency = () => 0 }) {
  const modulesById = new Map(curriculum.modules.map(module => [module.id, module]));
  const servicesById = new Map(curriculum.services.map(service => [service.id, service]));
  const interview = curriculum.interviewCourse;
  let state = storage.get();
  if (!state || state.version !== 3) {
    state = await seed(curriculum, assignmentBriefs, now());
    storage.set(state);
  }

  const persist = () => storage.set(state);
  const wait = () => new Promise(resolve => setTimeout(resolve, latency()));
  const audit = (actor, action, meta = {}) => { state.auditLog.unshift({ at: now(), actor, action, meta }); state.auditLog = state.auditLog.slice(0, 500); };
  const send = (user, channel, subject, body) => {
    state.outbox.unshift({ id: crypto.randomUUID(), to: channel === "sms" ? user.phone : user.email, channel, subject, body, at: now() });
    state.outbox = state.outbox.slice(0, 60);
  };
  const notify = (user, kind, title, body) => {
    user.notifications.unshift({ id: crypto.randomUUID(), kind, title, body, at: now(), read: false });
    user.notifications = user.notifications.slice(0, 40);
  };
  const price = (item, currency) => item[`price${currency}`];
  const findUser = (predicate) => state.users.find(predicate);
  const publicUser = (user) => {
    const { passHash, salt, failedLogins, lockUntil, ...rest } = user;
    return { ...rest, kitUnlocked: kitUnlocked(user), points: totalPoints(user.id) };
  };
  const distinctPaidModules = (user) => new Set(user.modules).size;
  const kitUnlocked = (user) => user.status === "active" && distinctPaidModules(user) >= curriculum.careerBonus.qualifyingModules;
  const totalPoints = (userId, since = 0) => state.pointEvents.filter(event => event.userId === userId && event.at >= since).reduce((sum, event) => sum + event.points, 0);
  const addPoints = (userId, points, type, ref) => { if (points !== 0) state.pointEvents.push({ id: crypto.randomUUID(), userId, points, type, ref, at: now() }); };

  async function setPassword(user, password) {
    if (typeof password !== "string" || password.length < 8 || !/[0-9]/.test(password) || !/[A-Za-z]/.test(password)) {
      throw new ApiError("WEAK_PASSWORD", "Use at least 8 characters with letters and numbers.");
    }
    user.salt = randomToken(16);
    user.passHash = await sha256(`${user.salt}:${password}`);
  }
  const checkPassword = async (user, password) => user.passHash === await sha256(`${user.salt}:${password}`);

  function requireSession(token, deviceId, types = ["student"]) {
    const session = state.sessions.find(item => item.token === token);
    if (!session) throw new ApiError("AUTH_REQUIRED", "Please sign in.");
    if (session.revokedAt) throw new ApiError("SESSION_REVOKED", "You were signed out because this account signed in on another device.", { reason: session.revokedReason });
    if (session.deviceId !== deviceId) throw new ApiError("DEVICE_MISMATCH", "This session belongs to a different device.");
    if (now() - session.lastSeen > SESSION_IDLE_MS) { session.revokedAt = now(); session.revokedReason = "expired"; persist(); throw new ApiError("SESSION_EXPIRED", "Your session expired. Sign in again."); }
    const user = findUser(item => item.id === session.userId);
    if (!user || !types.includes(user.type)) throw new ApiError("FORBIDDEN", "This area needs a different account.");
    if (user.status === "suspended") throw new ApiError("SUSPENDED", "This account is suspended. Contact support.");
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
        state.deviceAlerts.unshift({ id: crypto.randomUUID(), userId: user.id, count: user.deviceSwitches, at: now(), status: "open" });
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
      return { userId: user.id, studentId: user.studentId, name: user.name, avatar: user.avatar, city: user.city, modules: user.modules.length, points: events.reduce((total, event) => total + event.points, 0), quiz: sum("quiz") + sum("streak"), labs: sum("lab"), assignments: sum("assignment"), lessons: sum("lesson"), firstEventAt: events[0]?.at ?? Number.MAX_SAFE_INTEGER };
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

  const api = {
    // ---------- public ----------
    async catalogue() { await wait(); return curriculum; },
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
    async register({ name, email, phone, city, moduleIds = [], referralCode = "", acceptedTerms = false }) {
      await wait();
      if (typeof name !== "string" || name.trim().length < 2) throw new ApiError("VALIDATION", "Enter your full name.");
      if (!EMAIL_PATTERN.test(String(email))) throw new ApiError("VALIDATION", "Enter a valid email address.");
      if (!PHONE_PATTERN.test(String(phone).replace(/[\s-]/g, ""))) throw new ApiError("VALIDATION", "Enter a valid mobile number with country code.");
      if (!acceptedTerms) throw new ApiError("VALIDATION", "Please accept the proposed terms to continue.");
      const uniqueModules = [...new Set(moduleIds)];
      if (!uniqueModules.length) throw new ApiError("VALIDATION", "Choose at least one skill module.");
      for (const id of uniqueModules) if (!modulesById.has(id)) throw new ApiError("NOT_FOUND", `Unknown module ${id}`);
      const normalisedEmail = String(email).trim().toLowerCase();
      const existing = findUser(user => user.email === normalisedEmail);
      if (existing && existing.status !== "pending_payment") throw new ApiError("DUPLICATE", "An account with this email already exists. Sign in instead.");
      const referrer = referralCode ? findUser(user => user.referralCode === referralCode.trim().toUpperCase()) : null;
      if (referralCode && !referrer) throw new ApiError("VALIDATION", "That referral code was not found.");
      const user = existing ?? blankUser({ type: "student", createdAt: now() });
      Object.assign(user, { name: name.trim(), email: normalisedEmail, phone: String(phone).replace(/[\s-]/g, ""), city: String(city ?? "").trim(), pendingModules: uniqueModules, referredBy: referrer?.id ?? null, status: "pending_payment" });
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
      const payment = { id: `PAY-${randomToken(8).toUpperCase()}`, userId: user.id, items: quote.items, subtotal: quote.subtotal, currency, method, status: outcome === "success" ? "succeeded" : "declined", at: now(), preview: true };
      state.payments.unshift(payment);
      if (outcome !== "success") { persist(); throw new ApiError("PAYMENT_DECLINED", "The preview payment was declined. Try again or use another method.", { paymentId: payment.id }); }
      user.modules = [...new Set([...user.modules, ...user.pendingModules])];
      user.pendingModules = [];
      user.currency = currency;
      user.status = "pending_verification";
      user.paidAt = now();
      send(user, "email", "Payment received: verification in progress", `We received ${currency} ${quote.subtotal} for ${quote.items.length} skill module(s). Our team verifies every registration within 1 business day, then sends your Student ID and a temporary password.`);
      audit(user.id, "payment_succeeded", { paymentId: payment.id, amount: quote.subtotal, currency });
      persist();
      return { payment, status: user.status, reference: `APP-${user.id.slice(0, 8).toUpperCase()}` };
    },
    async applicationStatus(applicationId) {
      await wait();
      const user = findUser(item => item.id === applicationId);
      if (!user) throw new ApiError("NOT_FOUND", "Application not found.");
      return { status: user.status, studentId: user.studentId, modules: user.modules.length || user.pendingModules.length };
    },

    // ---------- authentication ----------
    async login({ identifier, password, deviceId, deviceLabel }) {
      await wait();
      const needle = String(identifier ?? "").trim().toLowerCase();
      const user = findUser(item => item.studentId?.toLowerCase() === needle || item.email === needle);
      if (!user) throw new ApiError("INVALID_CREDENTIALS", "We could not match that ID or password.");
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
      const { session, user } = requireSession(token, deviceId, ["student", "admin"]);
      persist();
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
      const { user } = requireSession(token, deviceId, ["student", "admin"]);
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
        const lessons = state.content.lessons[id] ?? [];
        const done = lessons.filter(lesson => user.completedLessons.includes(lesson.id)).length;
        const labRun = state.labRuns.find(run => run.userId === user.id && run.labId === id);
        return { id, title: modulesById.get(id).title, tool: modulesById.get(id).tool, lessons: lessons.length, done, labScore: labRun?.score ?? null, quizToday: state.quizAttempts.some(attempt => attempt.userId === user.id && attempt.moduleId === id && attempt.date === dateKey(now())) };
      });
      const streak = computeStreak(user.id);
      persist();
      return { user: publicUser(user), modules, streak, points: totalPoints(user.id), weekPoints: totalPoints(user.id, now() - 7 * 24 * 60 * 60 * 1000), announcements: state.content.announcements.slice(0, 3), notifications: user.notifications.slice(0, 5), kit: { unlocked: kitUnlocked(user), count: distinctPaidModules(user), required: curriculum.careerBonus.qualifyingModules }, devices: { switches: user.deviceSwitches, threshold: state.settings.deviceSwitchThreshold, history: user.deviceHistory.slice(0, 5) }, rank: leaderboardRows("all").find(row => row.userId === user.id)?.rank ?? null };
    },
    async lessons({ token, deviceId, moduleId }) {
      await wait();
      const { user } = requireSession(token, deviceId, ["student", "admin"]);
      requireModule(user, moduleId);
      return { module: modulesById.get(moduleId), lessons: (state.content.lessons[moduleId] ?? []).map(lesson => ({ ...lesson, done: user.completedLessons.includes(lesson.id) })) };
    },
    async completeLesson({ token, deviceId, lessonId }) {
      await wait();
      const { user } = requireSession(token, deviceId);
      const entry = Object.entries(state.content.lessons).find(([, lessons]) => lessons.some(lesson => lesson.id === lessonId));
      if (!entry) throw new ApiError("NOT_FOUND", "Lesson not found.");
      requireModule(user, entry[0]);
      if (!user.completedLessons.includes(lessonId)) { user.completedLessons.push(lessonId); addPoints(user.id, 5, "lesson", lessonId); }
      persist();
      return { points: totalPoints(user.id) };
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
    async submitAssignment({ token, deviceId, assignmentId, text = "", link = "", fileName = "" }) {
      await wait();
      const { user } = requireSession(token, deviceId);
      const assignment = state.content.assignments.find(item => item.id === assignmentId);
      if (!assignment) throw new ApiError("NOT_FOUND", "Assignment not found.");
      requireModule(user, assignment.moduleId);
      if (String(text).trim().length < 40 && !link && !fileName) throw new ApiError("VALIDATION", "Describe your work in at least 40 characters or attach a link or file.");
      if (link && !/^https:\/\/[^\s]+$/i.test(link)) throw new ApiError("VALIDATION", "Links must start with https://");
      let submission = state.submissions.find(item => item.assignmentId === assignmentId && item.userId === user.id);
      if (submission?.gradedAt) throw new ApiError("ALREADY_GRADED", "This assignment is already graded.");
      if (!submission) { submission = { id: crypto.randomUUID(), assignmentId, userId: user.id }; state.submissions.push(submission); }
      Object.assign(submission, { text: String(text).slice(0, 3000), link, fileName: String(fileName).slice(0, 120), submittedAt: now(), score: null, feedback: null, gradedAt: null });
      audit(user.id, "assignment_submitted", { assignmentId });
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
      const payment = { id: `PAY-${randomToken(8).toUpperCase()}`, userId: user.id, items: quote.items, subtotal: quote.subtotal, currency: quote.currency, method: "preview-card", status: outcome === "success" ? "succeeded" : "declined", at: now(), preview: true };
      state.payments.unshift(payment);
      if (outcome !== "success") { persist(); throw new ApiError("PAYMENT_DECLINED", "The preview payment was declined.", { paymentId: payment.id }); }
      user.modules.push(...newModules);
      user.addons.push(...requestedServices.map(id => ({ id, paymentId: payment.id, at: now(), status: "scheduled" })));
      send(user, "email", "Receipt: your Rolevia add-ons", `We received ${quote.currency} ${quote.subtotal} for ${quote.items.map(item => item.title).join(", ")}.`);
      if (kitUnlocked(user) && !user.kitNotifiedAt) { user.kitNotifiedAt = now(); notify(user, "achievement", "Career kit unlocked", "Interview Ready, a resume review and a done-for-you resume are now included at no extra charge."); }
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
      requireSession(token, deviceId, ["admin"]);
      const students = state.users.filter(user => user.type === "student");
      const count = (status) => students.filter(user => user.status === status).length;
      return { pendingVerification: count("pending_verification"), pendingPayment: count("pending_payment"), active: count("active"), suspended: count("suspended"), ungraded: state.submissions.filter(item => !item.gradedAt).length, openAlerts: state.deviceAlerts.filter(alert => alert.status === "open").length, revenue: ["INR", "USD"].map(currency => ({ currency, amount: state.payments.filter(payment => payment.status === "succeeded" && payment.currency === currency).reduce((sum, payment) => sum + payment.subtotal, 0) })), recentAudit: state.auditLog.slice(0, 12) };
    },
    async adminStudents({ token, deviceId }) {
      await wait();
      requireSession(token, deviceId, ["admin"]);
      return state.users.filter(user => user.type === "student").map(user => ({ ...publicUser(user), moduleTitles: (user.modules.length ? user.modules : user.pendingModules).map(id => modulesById.get(id)?.title ?? id), payments: state.payments.filter(payment => payment.userId === user.id) }));
    },
    async adminVerify({ token, deviceId, userId }) {
      await wait();
      const { user: admin } = requireSession(token, deviceId, ["admin"]);
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
      audit(admin.id, "verify_student", { userId, studentId: user.studentId });
      persist();
      return { studentId: user.studentId, previewTemporaryPassword: temporaryPassword };
    },
    async adminSetStatus({ token, deviceId, userId, status, reason = "" }) {
      await wait();
      const { user: admin } = requireSession(token, deviceId, ["admin"]);
      const user = findUser(item => item.id === userId && item.type === "student");
      if (!user) throw new ApiError("NOT_FOUND", "Student not found.");
      if (!["active", "suspended", "rejected"].includes(status)) throw new ApiError("VALIDATION", "Unknown status.");
      if (status === "active" && !user.studentId) throw new ApiError("INVALID_STATE", "Verify the registration to issue credentials first.");
      user.status = status;
      if (status !== "active") for (const session of state.sessions) if (session.userId === user.id && !session.revokedAt) { session.revokedAt = now(); session.revokedReason = status; }
      if (status === "rejected") send(user, "email", "About your Rolevia registration", `We could not verify your registration. ${reason || "Please reply to this email so we can help."}`);
      audit(admin.id, `set_status_${status}`, { userId, reason });
      persist();
      return publicUser(user);
    },
    async adminResolveAlert({ token, deviceId, alertId }) {
      await wait();
      const { user: admin } = requireSession(token, deviceId, ["admin"]);
      const alert = state.deviceAlerts.find(item => item.id === alertId);
      if (!alert) throw new ApiError("NOT_FOUND", "Alert not found.");
      alert.status = "resolved";
      audit(admin.id, "resolve_alert", { alertId });
      persist();
      return alert;
    },
    async adminDeviceAlerts({ token, deviceId }) {
      await wait();
      requireSession(token, deviceId, ["admin"]);
      return state.deviceAlerts.map(alert => ({ ...alert, student: publicUser(findUser(user => user.id === alert.userId)) }));
    },
    async adminPayments({ token, deviceId }) {
      await wait();
      requireSession(token, deviceId, ["admin"]);
      return state.payments.map(payment => ({ ...payment, student: findUser(user => user.id === payment.userId)?.name ?? "Unknown" }));
    },
    async adminContent({ token, deviceId }) {
      await wait();
      requireSession(token, deviceId, ["admin"]);
      return { lessons: state.content.lessons, assignments: state.content.assignments, announcements: state.content.announcements };
    },
    async adminUpsertLesson({ token, deviceId, moduleId, lesson }) {
      await wait();
      const { user: admin } = requireSession(token, deviceId, ["admin"]);
      if (!modulesById.has(moduleId)) throw new ApiError("NOT_FOUND", "Unknown module.");
      if (!lesson?.title || String(lesson.title).trim().length < 3) throw new ApiError("VALIDATION", "Give the lesson a title.");
      if (lesson.url && !/^https:\/\//i.test(lesson.url)) throw new ApiError("VALIDATION", "Lesson links must use https://");
      const list = state.content.lessons[moduleId] ??= [];
      const existing = list.find(item => item.id === lesson.id);
      const record = { id: existing?.id ?? `${moduleId}-l${Date.now().toString(36)}`, title: String(lesson.title).trim().slice(0, 120), type: ["video", "reading", "task"].includes(lesson.type) ? lesson.type : "video", minutes: Math.max(1, Math.min(240, Number(lesson.minutes) || 30)), url: lesson.url ?? "", summary: String(lesson.summary ?? "").slice(0, 600), output: String(lesson.output ?? "").slice(0, 160), order: Number(lesson.order) || list.length + 1 };
      if (existing) Object.assign(existing, record); else list.push(record);
      list.sort((a, b) => a.order - b.order);
      audit(admin.id, "upsert_lesson", { moduleId, lessonId: record.id });
      persist();
      return record;
    },
    async adminDeleteLesson({ token, deviceId, moduleId, lessonId }) {
      await wait();
      const { user: admin } = requireSession(token, deviceId, ["admin"]);
      state.content.lessons[moduleId] = (state.content.lessons[moduleId] ?? []).filter(lesson => lesson.id !== lessonId);
      audit(admin.id, "delete_lesson", { moduleId, lessonId });
      persist();
      return { ok: true };
    },
    async adminUpsertAssignment({ token, deviceId, assignment }) {
      await wait();
      const { user: admin } = requireSession(token, deviceId, ["admin"]);
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
      requireSession(token, deviceId, ["admin"]);
      return state.submissions.map(submission => ({ ...submission, student: findUser(user => user.id === submission.userId)?.name ?? "Unknown", assignment: state.content.assignments.find(item => item.id === submission.assignmentId) ?? null })).sort((a, b) => (a.gradedAt ? 1 : 0) - (b.gradedAt ? 1 : 0) || b.submittedAt - a.submittedAt);
    },
    async adminGrade({ token, deviceId, submissionId, score, feedback = "" }) {
      await wait();
      const { user: admin } = requireSession(token, deviceId, ["admin"]);
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
      audit(admin.id, "grade", { submissionId, score: clamped });
      persist();
      return submission;
    },
    async adminAnnounce({ token, deviceId, title, body }) {
      await wait();
      const { user: admin } = requireSession(token, deviceId, ["admin"]);
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
      requireSession(token, deviceId, ["admin"]);
      return state.auditLog.slice(0, 100);
    },

    // ---------- operations (unlisted) ----------
    async opsLogin({ passphrase, deviceId, deviceLabel = "Unknown device" }) {
      await wait();
      const ops = findUser(user => user.type === "ops");
      if (!ops || !(await checkPassword(ops, passphrase ?? ""))) throw new ApiError("INVALID_CREDENTIALS", "That passphrase is not right.");
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
        const moduleSales = payments.reduce((sum, payment) => sum + payment.items.filter(item => item.kind === "module").length, 0);
        const economics = curriculum.economics[currency];
        const kitCost = economics.bonusFulfilment.reduce((sum, [, value]) => sum + value, 0);
        const kitsUnlocked = students.filter(user => user.currency === currency && kitUnlocked(user)).length;
        return { currency, gross: payments.reduce((sum, payment) => sum + payment.subtotal, 0), moduleSales, bonusReserve: moduleSales * economics.careerBonusReserve, referralReserve: moduleSales * economics.referralReserve, kitsUnlocked, kitLiability: kitsUnlocked * kitCost, processingAllowance: Math.round(payments.reduce((sum, payment) => sum + payment.subtotal, 0) * economics.paymentFeePercent) / 100 };
      });
      const cohorts = curriculum.modules.map(module => ({ id: module.id, title: module.title, enrolled: students.filter(user => user.status === "active" && user.modules.includes(module.id)).length, limit: curriculum.skillFormat.proposedCohortLimit }));
      return { funnel, byCurrency, cohorts, openAlerts: state.deviceAlerts.filter(alert => alert.status === "open").length, ungraded: state.submissions.filter(item => !item.gradedAt).length, notes: state.opsNotes, generatedAt: now() };
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
  return { id: crypto.randomUUID(), type: "student", studentId: null, name: "", email: "", phone: "", city: "", currency: "INR", passHash: null, salt: null, mustChangePassword: false, status: "pending_payment", modules: [], pendingModules: [], addons: [], completedLessons: [], avatar: null, bio: "", linkedin: "", notifications: [], deviceSwitches: 0, deviceHistory: [], failedLogins: 0, lockUntil: null, referralCode: null, referredBy: null, createdAt: Date.now(), verifiedAt: null, paidAt: null, kitNotifiedAt: null, ...overrides };
}

// Seed data is fictional preview content so every screen has something to show.
async function seed(curriculum, assignmentBriefs, now) {
  const day = 24 * 60 * 60 * 1000;
  const previewCredentials = { student: { id: "RV-26-0001", password: "Learn#2026" }, admin: { email: "admin@rolevia.demo", password: "Admin#2026" }, ops: { passphrase: "ROLEVIA-OPS-PREVIEW" } };
  const studentAuth = { salt: "seed-student", passHash: await sha256(`seed-student:${previewCredentials.student.password}`) };
  const adminAuth = { salt: "seed-admin", passHash: await sha256(`seed-admin:${previewCredentials.admin.password}`) };
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
  users.push(blankUser({ id: "u-admin", type: "admin", name: "Programme Admin", email: "admin@rolevia.demo", phone: "+910000000000", status: "active", ...adminAuth }));
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
      submissions.push({ id: crypto.randomUUID(), assignmentId: assignment.id, userId: user.id, text: "Submitted the final project workbook with a checks tab, summary and a short decision note using the fictional dataset.", link: "https://example.com/preview-submission", fileName: "final-project.xlsx", submittedAt: now - 2 * day, score: graded ? score : null, feedback: graded ? "Clear checks and a readable summary. Label the assumptions on the summary tab next time." : null, gradedAt: graded ? now - day : null, gradedBy: graded ? "u-admin" : null });
      if (graded) addEvent(user.id, score, "assignment", assignment.id, now - day);
    }
  });
  return {
    version: 3,
    settings: { deviceSwitchThreshold: 5, previewCredentials },
    users, payments: users.filter(user => user.type === "student").map(user => ({ id: `PAY-SEED${user.id.slice(-1)}`, userId: user.id, items: user.modules.map(id => ({ id, kind: "module", title: curriculum.modules.find(module => module.id === id).title, amount: curriculum.modules.find(module => module.id === id)[`price${user.currency}`] })), subtotal: user.modules.reduce((sum, id) => sum + curriculum.modules.find(module => module.id === id)[`price${user.currency}`], 0), currency: user.currency, method: "preview-card", status: "succeeded", at: user.paidAt, preview: true })),
    sessions: [], otps: [], outbox: [], deviceAlerts: [], badges: [], opsNotes: [{ id: crypto.randomUUID(), text: "Preview data only. Replace with the live backend before any real enrollment.", at: now }],
    content: { lessons, assignments, announcements: [{ id: "ann-1", title: "Welcome to the Rolevia preview", body: "Everything here uses fictional data. Try today's quiz, open a lab and check the leaderboard.", at: now - day }, { id: "ann-2", title: "Live workshop calendar", body: "Dates and time zones are confirmed by email before each two-week module starts.", at: now - 3 * day }] },
    submissions, quizAttempts, labRuns, pointEvents, auditLog: [{ at: now, actor: "system", action: "seed", meta: {} }], counters: { studentSeq: 6 },
  };
}

