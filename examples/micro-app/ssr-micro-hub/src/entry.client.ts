import { hydrateHost } from 'ssr-micro-shared/index';

import { routes } from './routes';

// Client hydration delegated to the shared host helper (same one each remote
// uses standalone). Hub mode mounts the full cross-remote router.
await hydrateHost(routes);
