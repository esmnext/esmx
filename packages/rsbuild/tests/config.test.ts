import type {
    Esmx,
    ParsedModuleConfig,
    ParsedModuleConfigEnvironment
} from '@esmx/core';
import { describe, expect, test } from 'vitest';

import { createIsExternal } from '../src/rsbuild/config';

function makeLink(name: string) {
    return {
        name,
        root: `/abs/${name}`,
        client: `/abs/${name}/client`,
        clientManifestJson: `/abs/${name}/client/manifest.json`,
        server: `/abs/${name}/server`,
        serverManifestJson: `/abs/${name}/server/manifest.json`
    };
}

function makeEsmx(env: ParsedModuleConfigEnvironment): Esmx {
    // Partial fixture: only the fields the predicate under test reads.
    const moduleConfig = {
        name: 'my-app',
        root: '/app',
        lib: false,
        links: {
            'my-app': makeLink('my-app'),
            'remote-a': makeLink('remote-a')
        },
        environments: { client: env, server: env }
    } as unknown as ParsedModuleConfig;
    return {
        name: 'my-app',
        root: '/app',
        isProd: false,
        moduleConfig
    } as unknown as Esmx;
}

describe('createIsExternal', () => {
    const env: ParsedModuleConfigEnvironment = {
        imports: { vue: 'my-app/vue' },
        exports: {},
        scopes: { '': { react: 'my-app/react' } }
    };

    test('externalizes bare specifiers exposed via scopes and imports', () => {
        const esmx = makeEsmx(env);

        const isExternal = createIsExternal(esmx, 'client');

        expect(isExternal('react')).toBe(true);
        expect(isExternal('vue')).toBe(true);
    });

    test('externalizes linked module deps and their subpaths', () => {
        const esmx = makeEsmx(env);

        const isExternal = createIsExternal(esmx, 'client');

        expect(isExternal('remote-a')).toBe(true);
        expect(isExternal('remote-a/src/routes')).toBe(true);
    });

    test('leaves the module itself and unknown deps to the bundler', () => {
        const esmx = makeEsmx(env);

        const isExternal = createIsExternal(esmx, 'client');

        // Self is never external; unknown third-party deps are handled by
        // nodeExternals (node target) / bundled (browser), not this predicate.
        expect(isExternal('my-app')).toBe(false);
        expect(isExternal('lodash')).toBe(false);
    });
});
