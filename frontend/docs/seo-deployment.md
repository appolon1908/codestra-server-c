# SEO deployment contract

The Vite build now emits static HTML for every indexable locale route under
`dist/<locale>/.../index.html`. Configure the production reverse proxy to serve
those files before the SPA fallback and keep the application fallback for
interactive navigation.

For Caddy, the root redirect must run before `file_server`:

```caddyfile
codestra.co {
  redir / /en/ 308
  @sitemap path /sitemap.xml
  header @sitemap Content-Type application/xml
  root * /srv/codestra/dist
  try_files {path} {path}/index.html
  file_server
}
```

The application router renders `NotFound` for unknown localized paths. The
proxy must return a real 404 when no file or route exists; do not rewrite
unknown URLs to `/login`. Utility routes emitted by the prerender step are
marked `noindex,follow` and are not included in `public/sitemap.xml`.

The generated sitemap and route metadata share `scripts/seo-manifest.mjs`.
Run `npm run build` after changing route metadata so sitemap and prerendered
HTML are regenerated together.
