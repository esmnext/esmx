# React Demo

A modern React application built with Esmx framework.

## Build Configuration for Vercel

This project uses pnpm workspace. For Vercel deployment:

1. **Enable pnpm in Vercel**: Go to Project Settings > General > Install Command and set it to `pnpm install`
2. **Or use the vercel.json** configuration file which is already set up

## Build Commands

- `npm run dev` - Start development server
- `npm run build` - Build for production (includes type declarations)
- `npm run build:dts` - Generate TypeScript declaration files
- `npm run build:ssr` - Build SSR bundle
- `npm run preview` - Preview production build
- `npm run start` - Start production server

## Dependencies

This project uses workspace dependencies (`@esmx/core` and `@esmx/rspack`). Make sure these are available in your npm registry or use pnpm workspace.
