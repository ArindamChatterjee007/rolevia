// HTTP adapter with the same method names as the preview backend. Used when config.apiBase is set.
import { ApiError } from "./store.js";

export function createHttpApi(baseUrl, { credentials = null } = {}) {
  const base = baseUrl.replace(/\/$/, "");
  const call = async (method, payload = {}) => {
    const response = await fetch(`${base}/api/${method}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload ?? {}) });
    let body;
    try { body = await response.json(); } catch { throw new ApiError("NETWORK", `The server returned an unreadable response (${response.status}).`); }
    if (!response.ok || body.error) { const error = body.error ?? { code: "SERVER_ERROR", message: `Request failed (${response.status}).` }; throw new ApiError(error.code, error.message, error.extra ?? {}); }
    return body.result;
  };
  return new Proxy({}, {
    get(_, method) {
      if (method === "previewCredentials") return () => credentials;
      if (method === "reloadFromStorage") return () => {};
      if (typeof method !== "string" || method.startsWith("_") || method === "then") return undefined;
      return (payload) => call(method, payload);
    },
  });
}
