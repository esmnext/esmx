import type { RenderContext } from '@esmx/core';
import { renderHost } from 'ssr-micro-shared/src/index';

import { routes } from './routes';

// The hub composes every remote's routes; rendering is delegated to the shared
// host helper (the same one each remote uses standalone — single source of
// truth). Hub mode keeps the full cross-remote navigation.
export default (rc: RenderContext) => renderHost(rc, routes);
