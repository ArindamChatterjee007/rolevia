// Shared application context: backend adapter, catalogue, device identity and auth state.
const AUTH_KEY = "rolevia.auth.v1";
const DEVICE_KEY = "rolevia.device.v1";

export const ctx = {
  api: null,
  curriculum: null,
  quizBank: null,
  mode: "preview",
  device: null,
  auth: { token: null, type: null, user: null },
  navigate: null,
  listeners: new Set(),
};

export function describeDevice(agent = navigator.userAgent) {
  const browser = /Edg\//.test(agent) ? "Edge" : /OPR\//.test(agent) ? "Opera" : /Chrome\//.test(agent) ? "Chrome" : /Safari\//.test(agent) ? "Safari" : /Firefox\//.test(agent) ? "Firefox" : "Browser";
  const platform = /iPhone|iPad/.test(agent) ? "iOS" : /Android/.test(agent) ? "Android" : /Mac OS X/.test(agent) ? "macOS" : /Windows/.test(agent) ? "Windows" : /Linux/.test(agent) ? "Linux" : "device";
  return `${browser} on ${platform}`;
}

export function loadDevice() {
  let id = localStorage.getItem(DEVICE_KEY);
  if (!id) { id = crypto.randomUUID(); localStorage.setItem(DEVICE_KEY, id); }
  ctx.device = { id, label: describeDevice() };
  return ctx.device;
}

export function loadAuth() {
  try { ctx.auth = JSON.parse(localStorage.getItem(AUTH_KEY)) ?? { token: null, type: null, user: null }; } catch { ctx.auth = { token: null, type: null, user: null }; }
  return ctx.auth;
}

export function setAuth(auth) {
  ctx.auth = { token: null, type: null, user: null, ...auth };
  if (ctx.auth.token) localStorage.setItem(AUTH_KEY, JSON.stringify(ctx.auth)); else localStorage.removeItem(AUTH_KEY);
  for (const listener of ctx.listeners) listener(ctx.auth);
}

export const authed = (type) => Boolean(ctx.auth.token) && (!type || ctx.auth.type === type);
export const withSession = (payload = {}) => ({ token: ctx.auth.token, deviceId: ctx.device.id, ...payload });
