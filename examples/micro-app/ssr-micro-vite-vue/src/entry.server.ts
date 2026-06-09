import type { RenderContext } from '@esmx/core';
import { renderHost } from 'ssr-micro-shared/src/index';

import { routes } from './routes';

// Standalone server entry: render this micro-app on its own (the hub renders it
// via its own host when composed). Shared host = single source of truth.
export default (rc: RenderContext) =>
    renderHost(rc, routes, { standalone: true });
