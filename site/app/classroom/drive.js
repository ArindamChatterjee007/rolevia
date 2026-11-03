// Optional direct upload of class recordings to the host's own Google Drive (OAuth 2.0 implicit flow,
// scope drive.file). Requires config.googleClientId and the site origin registered as an authorised
// JavaScript origin. Without it, recordings are downloaded and the host pastes a Drive link manually.

const TOKEN_KEY = "rolevia.drive.token.v1";
const NONCE_KEY = "rolevia.drive.nonce.v1";
const SCOPE = "https://www.googleapis.com/auth/drive.file";

export function driveConfigured(config) { return Boolean(config?.googleClientId); }

const randomNonce = () => Array.from(crypto.getRandomValues(new Uint8Array(16)), byte => byte.toString(16).padStart(2, "0")).join("");

// The OAuth state carries a one-time nonce so a crafted link cannot plant someone else's token in this browser.
export function driveAuthUrl({ clientId, state }) {
  const redirect = `${location.origin}${location.pathname}`;
  const nonce = randomNonce();
  sessionStorage.setItem(NONCE_KEY, nonce);
  const params = new URLSearchParams({ client_id: clientId, redirect_uri: redirect, response_type: "token", scope: SCOPE, include_granted_scopes: "true", prompt: "consent", state: `${nonce}:${state}` });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
}

// Called at boot: Google returns `#access_token=...&state=<nonce>:<classId>`; keep the token only when the
// nonce matches the one this tab issued, then restore the route.
export function consumeDriveRedirect() {
  if (!/^#(.*&)?access_token=/.test(location.hash)) return null;
  const params = new URLSearchParams(location.hash.slice(1));
  if ((params.get("state") ?? "").startsWith("sheets:")) return null; // belongs to the labs' Google Sheets flow
  const token = params.get("access_token");
  const expiresIn = Number(params.get("expires_in") ?? 3600);
  const [nonce = "", classId = ""] = (params.get("state") ?? "").split(":");
  const expected = sessionStorage.getItem(NONCE_KEY);
  sessionStorage.removeItem(NONCE_KEY);
  const valid = Boolean(token) && Boolean(expected) && nonce === expected && /^[\w-]+$/.test(classId);
  if (valid) sessionStorage.setItem(TOKEN_KEY, JSON.stringify({ token, expiresAt: Date.now() + expiresIn * 1000 }));
  history.replaceState(null, "", `${location.pathname}${location.search}${valid ? `#/classroom/${classId}?resume=recording` : "#/admin/classes"}`);
  return valid ? classId : null;
}

export function driveToken() {
  try { const saved = JSON.parse(sessionStorage.getItem(TOKEN_KEY)); return saved && saved.expiresAt > Date.now() + 30_000 ? saved.token : null; } catch { return null; }
}

export async function uploadToDrive({ blob, name, token, onProgress }) {
  const start = await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable&fields=id,name,size,webViewLink", { method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json; charset=UTF-8", "X-Upload-Content-Type": blob.type || "video/webm", "X-Upload-Content-Length": String(blob.size) }, body: JSON.stringify({ name, mimeType: blob.type || "video/webm", description: "Rolevia class recording" }) });
  if (!start.ok) throw new Error(`Google Drive refused the upload (${start.status}). Sign in again and retry.`);
  const sessionUrl = start.headers.get("location");
  const chunk = 8 * 1024 * 1024;
  let offset = 0;
  let final = null;
  while (offset < blob.size) {
    const end = Math.min(offset + chunk, blob.size);
    const response = await fetch(sessionUrl, { method: "PUT", headers: { "Content-Range": `bytes ${offset}-${end - 1}/${blob.size}`, "Content-Type": blob.type || "video/webm" }, body: blob.slice(offset, end) });
    if (response.status === 308) { const range = response.headers.get("range"); offset = range ? Number(range.split("-")[1]) + 1 : end; }
    else if (response.ok) { final = await response.json(); offset = blob.size; }
    else throw new Error(`Upload interrupted at ${Math.round((offset / blob.size) * 100)}% (${response.status}). Retry from the recording panel.`);
    onProgress?.(Math.min(1, offset / blob.size));
  }
  return { id: final.id, url: final.webViewLink ?? `https://drive.google.com/file/d/${final.id}/view`, size: Number(final.size ?? blob.size) };
}

export async function shareDriveFileWithLink({ fileId, token }) {
  const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}/permissions`, { method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify({ role: "reader", type: "anyone" }) });
  if (!response.ok) throw new Error(`Could not change sharing (${response.status}). Share it from Google Drive instead.`);
  return true;
}
