// Minimal static server for CI end-to-end tests. Serves ./site the way GitHub Pages would.
import { createServer } from "node:http";
import { createReadStream, statSync } from "node:fs";
import { extname, join, normalize, resolve, sep } from "node:path";

const root = resolve("site");
const types = {
  ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8", ".json": "application/json; charset=utf-8", ".svg": "image/svg+xml",
  ".woff2": "font/woff2", ".png": "image/png", ".txt": "text/plain; charset=utf-8", ".webmanifest": "application/manifest+json",
};
createServer((request, response) => {
  const pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
  let file = normalize(join(root, pathname === "/" ? "index.html" : pathname));
  if (!file.startsWith(root + sep) && file !== root) { response.writeHead(403).end(); return; }
  try {
    if (statSync(file).isDirectory()) file = join(file, "index.html");
    const stats = statSync(file);
    response.writeHead(200, { "content-type": types[extname(file)] ?? "application/octet-stream", "content-length": stats.size, "cache-control": "no-store" });
    createReadStream(file).pipe(response);
  } catch {
    response.writeHead(404, { "content-type": "text/plain" }).end("Not found");
  }
}).listen(4173, "127.0.0.1", () => console.log("Serving site/ at http://127.0.0.1:4173/"));
