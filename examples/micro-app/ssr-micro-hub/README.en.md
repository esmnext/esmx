# ssr-micro-hub

Micro-frontend Hub app that aggregates all sub-app routes.

## Description

This package serves as the entry point of the micro-frontend architecture, responsible for:

1. Linking all sub-apps (`ssr-micro-html`, `ssr-micro-vue2`, `ssr-micro-vue3`, `ssr-micro-react`)
2. Merging all sub-app route configurations
3. Providing a home page with navigation
4. Enabling runtime module sharing via Esmx Import Map

## File Structure

- `src/entry.node.ts` - Node.js entry configuration linking all sub-apps
- `src/entry.server.ts` - Server-side rendering entry
- `src/entry.client.ts` - Client-side entry
- `src/routes.ts` - Merged routes from all sub-apps
- `src/home.ts` - Home page component

## Routes

- `/` - Home page (navigation cards)
- `/html` - HTML sub-app
- `/vue2` - Vue 2 sub-app
- `/vue3` - Vue 3 sub-app
- `/react` - React sub-app

## Start

```bash
pnpm start
```

Visit http://localhost:3000
