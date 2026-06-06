// Type boundary for the aggregated micro-app routes.
//
// The hub composes routes from every framework sub-app by importing their
// `src/routes` modules. Those modules pull in framework-specific sources
// (React/Preact/Solid JSX and Vue SFCs) that cannot all be type-checked by a
// single `tsc` program — and `tsc -b` project references can't help either,
// since the Vue sub-apps require `vue-tsc` rather than `tsc`.
//
// Each sub-app already type-checks its own sources via its own `lint:type`.
// A `paths` entry in tsconfig.json redirects the `ssr-micro-*/src/routes`
// imports to this declaration so the hub validates its own aggregation logic
// without re-compiling sibling internals.
//
// This is type-only: esmx/rspack does not consume tsconfig `paths`, so the real
// route modules are bundled at build/runtime as usual.
import type { RouteConfig } from '@esmx/router';

export const routes: RouteConfig[];
