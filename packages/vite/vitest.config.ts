import path from 'node:path';
import url from 'node:url';

import { defineConfig } from 'vitest/config';

// The manifest plugin value-imports buildManifestProtocolFields from
// @esmx/core. Resolve the package to its TypeScript source so tests run
// against the current code without requiring a rebuilt core dist.
const coreSource = path.resolve(
    path.dirname(url.fileURLToPath(import.meta.url)),
    '../core/src/index.ts'
);

export default defineConfig({
    resolve: {
        alias: {
            '@esmx/core': coreSource
        }
    }
});
