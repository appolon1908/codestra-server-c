import { createServer } from "node:http";
import { existsSync, statSync, createReadStream } from "node:fs";
import { join, normalize, extname } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../dist/", import.meta.url));
const portIndex = process.argv.indexOf("--port");
const port = Number(process.env.PORT ?? (portIndex >= 0 ? process.argv[portIndex + 1] : 4173));
const types = { ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript", ".json": "application/json", ".xml": "application/xml", ".txt": "text/plain; charset=utf-8", ".png": "image/png", ".webp": "image/webp", ".avif": "image/avif", ".svg": "image/svg+xml", ".woff2": "font/woff2" };

createServer((req, res) => {
  const requestUrl = new URL(req.url ?? "/", `http://${req.headers.host ?? "localhost"}`);
  if (requestUrl.pathname === "/") {
    res.writeHead(308, { Location: `/en/${requestUrl.search}` });
    return res.end();
  }
  if (requestUrl.pathname === "/healthz") {
    res.writeHead(200, { "Content-Type": "text/plain" });
    return res.end("ok");
  }
  if (requestUrl.pathname === "/api/v1/localization/country" || requestUrl.pathname === "/api/v1/localization/config") {
    res.writeHead(200, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({ country_code: "US", suggested_locale: "en", supported: true, locales: ["en", "es", "fr"] }));
  }
  if (requestUrl.pathname.startsWith("/api/")) {
    res.writeHead(202, { "Content-Type": "application/json" });
    return res.end("{}");
  }
  const safePath = normalize(requestUrl.pathname).replace(/^\.\.(?:\/|\\)/, "");
  let target = join(root, safePath);
  if (existsSync(target) && statSync(target).isDirectory()) {
    target = join(target, "index.html");
  }
  if (!existsSync(target) || !statSync(target).isFile()) {
    res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
    return res.end("<!doctype html><title>Not found</title><h1>Page not found</h1>");
  }
  res.writeHead(200, { "Content-Type": types[extname(target)] ?? "application/octet-stream", "Cache-Control": extname(target) === ".html" ? "no-cache" : "public, max-age=31536000, immutable" });
  createReadStream(target).pipe(res);
}).listen(port, "127.0.0.1", () => console.log(`Serving prerendered dist on http://127.0.0.1:${port}`));
