import type {
    Esmx,
    ParsedModuleConfig,
    ParsedModuleConfigEnvironment
} from '@esmx/core';
import { describe, expect, test } from 'vitest';

import { createExternalPredicate } from '../src/vite/config';

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

describe('createExternalPredicate', () => {
    const env: ParsedModuleConfigEnvironment = {
        imports: { vue: 'my-app/vue' },
        exports: {},
        scopes: { '': { react: 'my-app/react' } }
    };

    test('externalizes bare specifiers exposed via scopes and imports', () => {
        const esmx = makeEsmx(env);

        const isExternal = createExternalPredicate(esmx, 'client');

        expect(isExternal('react')).toBe(true);
        expect(isExternal('vue')).toBe(true);
    });

    test('externalizes linked module deps and their subpaths', () => {
        const esmx = makeEsmx(env);

        const isExternal = createExternalPredicate(esmx, 'client');

        expect(isExternal('remote-a')).toBe(true);
        expect(isExternal('remote-a/src/routes')).toBe(true);
    });

    test('does not externalize the module itself or relative/absolute ids', () => {
        const esmx = makeEsmx(env);

        const isExternal = createExternalPredicate(esmx, 'client');

        expect(isExternal('my-app')).toBe(false);
        expect(isExternal('./local')).toBe(false);
        expect(isExternal('/abs/local')).toBe(false);
        expect(isExternal('lodash')).toBe(false);
    });

    test('externalizes node: builtins on every target', () => {
        const esmx = makeEsmx(env);

        const isExternal = createExternalPredicate(esmx, 'client');

        expect(isExternal('node:fs')).toBe(true);
    });

    test('node target externalizes all bare third-party deps', () => {
        const esmx = makeEsmx(env);

        const isExternal = createExternalPredicate(esmx, 'node');

        expect(isExternal('lodash')).toBe(true);
        expect(isExternal('./local')).toBe(false);
        expect(isExternal('/abs/local')).toBe(false);
    });
});
