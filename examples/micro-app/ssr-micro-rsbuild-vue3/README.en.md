# ssr-micro-vue3

Vue 3 sub-app built with Vue 3.5 + SSR.

## Description

This package demonstrates how to integrate a Vue 3 application into a micro-frontend architecture using `createSSRApp` and `@vue/server-renderer` for server-side rendering.

## File Structure

- `src/app.ts` - App factory function creating SSR Vue instance
- `src/app.vue` - Vue root component
- `src/routes.ts` - Route configuration
- `src/entry.node.ts` - Node.js entry configuration

## Routes

- `/vue3` - Vue 3 micro-app page
