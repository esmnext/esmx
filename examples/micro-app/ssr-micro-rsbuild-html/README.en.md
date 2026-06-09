# ssr-micro-html

HTML sub-app built with native HTML + TypeScript.

## Description

This package demonstrates how to create a framework-agnostic pure HTML micro-app by implementing the `mount`, `unmount`, and `renderToString` methods from `@esmx/router`'s `RouterMicroAppOptions` interface.

## File Structure

- `src/app.ts` - App factory function returning `RouterMicroAppOptions`
- `src/routes.ts` - Route configuration
- `src/entry.node.ts` - Node.js entry configuration

## Routes

- `/html` - HTML micro-app page
