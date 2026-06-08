# Single-domain deployment: landing + docs

The Esmx landing page (this micro-app hub) and the documentation site
(`examples/docs`, an Rspress build) are served from **one domain**. The hub owns
the home page and the live demo; the docs own everything else. Neither build is
modified to know about the other — a gateway splits traffic by path.

## Who owns which path

English is the default locale at the site root; Chinese lives under `/zh`. The
same split applies in both locales.

| Path | Served by |
| --- | --- |
| `/`, `/zh` | hub — landing page |
| `/demo/`, `/zh/demo/` | hub — demo dashboard |
| `/html/` `/lit/` `/vue2/` `/vue3/` `/react/` `/preact/` `/preact-htm/` `/solid/` `/svelte/` (and `/zh/...`) | hub — per-framework micro-app routes |
| `/ssr-micro-*/...` | hub — all client assets (chunks, importmap, runtime) |
| `/guide/...`, `/api/...`, `/blog/...` (and `/zh/...`) | docs |
| `/static/...`, `/favicon.ico`, `/robots.txt`, `/llms.txt`, `/logo.svg`, `/404.html` | docs |

Key facts that make the split unambiguous:

- The hub references **every** client asset under a `/ssr-micro-<name>/` prefix
  (see the built `index.html`), so hub assets never collide with the docs'
  `/static/` and root files.
- The only page paths both builds emit are `/` and `/zh` (each has an
  `index.html`). The hub wins both — that is the whole point of "replace the
  home page with the micro-app". The docs' own home is shadowed, which is why
  the landing's **Docs** link targets `/guide/start/introduction`, not `/`.

## Reverse-proxy gateway (recommended)

Run each build with its own server and let the gateway route between them. The
hub server (`esmx start`) correctly serves the `/ssr-micro-*/` assets for all
linked modules; the docs server (`rspress preview`) serves the static docs.

```nginx
upstream esmx_hub  { server 127.0.0.1:3000; }  # esmx start  (ssr-micro-hub)
upstream esmx_docs { server 127.0.0.1:4173; }  # rspress preview (examples/docs)

server {
    listen 80;
    server_name esmx.dev;

    # Hub client assets — one prefix covers the hub and every linked module.
    location ~ ^/ssr-micro-[a-z0-9-]+/ {
        proxy_pass http://esmx_hub;
    }

    # Hub pages: landing + demo + per-framework routes, in both locales.
    # Anchored so docs paths like /guide or /zh/guide fall through to the default.
    location ~ ^/(zh/)?(demo|html|lit|vue2|vue3|react|preact|preact-htm|solid|svelte)(/|$) {
        proxy_pass http://esmx_hub;
    }
    location = /    { proxy_pass http://esmx_hub; }
    location = /zh  { proxy_pass http://esmx_hub; }
    location = /zh/ { proxy_pass http://esmx_hub; }

    # Everything else is documentation.
    location / {
        proxy_pass http://esmx_docs;
    }
}
```

Build and run both sides:

```bash
# Hub (this package)
pnpm --filter ssr-micro-hub build
pnpm --filter ssr-micro-hub start      # listens on :3000

# Docs
pnpm --filter docs build
pnpm --filter docs preview             # listens on :4173 (adjust to match upstream)
```

## Static-hosting note

A pure static merge (copy `examples/docs/dist/client`, then overlay the hub
output so its `index.html` / `zh/index.html` win) is possible for the docs, but
the hub's `/ssr-micro-*/` assets are **not** bundled into a single directory —
they are served per linked module via Esmx module linking. Serving the hub
statically therefore requires mapping each module's `dist` to its
`/ssr-micro-<name>/` path. Unless you have that mapping in place, prefer the
reverse-proxy setup above, where `esmx start` handles it for you.
