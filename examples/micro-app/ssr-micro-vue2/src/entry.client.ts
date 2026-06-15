import { hydrateHost } from 'ssr-micro-shared/index';

import { routes } from './routes';

// Standalone client entry: hydrate this micro-app on its own.
await hydrateHost(routes, { standalone: true });
