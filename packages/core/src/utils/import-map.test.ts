import { assert, expect, test } from 'vitest';
import { getImportMap } from './import-map';

test('should return empty import map when no manifests provided', async () => {
    assert.deepEqual(
        getImportMap({
            manifests: [],
            getScope(name) {
                return `/${name}/`;
            },
            getFile(name, file) {
                return `${name}/${file}`;
            }
        }),
        {
            imports: {},
            scopes: {}
        }
    );
});

test('should generate import map with remote exports and module scopes', async () => {
    const result = getImportMap({
        manifests: [
            {
                name: 'ssr-vue2-remote',
                imports: {},
                exports: {
                    'src/entry.server': {
                        name: 'src/entry.server',
                        rewrite: true,
                        file: 'src/entry.server.mjs',
                        identifier: 'ssr-vue2-remote/src/entry.server'
                    },
                    vue: {
                        name: 'vue',
                        rewrite: false,
                        file: 'vue.mjs',
                        identifier: 'ssr-vue2-remote/vue'
                    },
                    'src/components/index': {
                        name: 'src/components/index',
                        rewrite: true,
                        file: 'src/components/index.mjs',
                        identifier: 'ssr-vue2-remote/src/components/index'
                    }
                }
            },
            {
                name: 'ssr-vue2-host',
                imports: {
                    vue: 'ssr-vue2-remote/vue'
                },
                exports: {}
            }
        ],
        getScope(name) {
            return `/${name}/`;
        },
        getFile(name, file) {
            return `${name}/${file}`;
        }
    });
    assert.deepEqual(result, {
        imports: {
            'ssr-vue2-remote/src/entry.server':
                'ssr-vue2-remote/src/entry.server.mjs',
            'ssr-vue2-remote/vue': 'ssr-vue2-remote/vue.mjs',
            'ssr-vue2-remote/src/components/index':
                'ssr-vue2-remote/src/components/index.mjs',
            'ssr-vue2-remote/src/components':
                'ssr-vue2-remote/src/components/index.mjs'
        },
        scopes: {
            '/ssr-vue2-host/': {
                vue: 'ssr-vue2-remote/vue.mjs'
            },
            '/ssr-vue2-remote/': { vue: 'ssr-vue2-remote/vue.mjs' }
        }
    });
});
test('should generate import map with remote exports and module scopes', async () => {
    const result = getImportMap({
        manifests: [
            {
                name: 'ssr-vue2-remote',
                imports: {},
                exports: {
                    vue: {
                        name: 'vue',
                        rewrite: false,
                        file: 'vue.mjs',
                        identifier: 'ssr-vue2-remote/vue'
                    }
                }
            },
            {
                name: 'ssr-vue2-host',
                imports: {
                    vue: 'ssr-vue2-remote/vue3'
                },
                exports: {}
            }
        ],
        getScope(name) {
            return `/${name}/`;
        },
        getFile(name, file) {
            return `${name}/${file}`;
        }
    });
    assert.deepEqual(result, {
        imports: { 'ssr-vue2-remote/vue': 'ssr-vue2-remote/vue.mjs' },
        scopes: {
            '/ssr-vue2-remote/': { vue: 'ssr-vue2-remote/vue.mjs' },
            '/ssr-vue2-host/': { vue: 'ssr-vue2-remote/vue3' }
        }
    });
});

test('should throw error when encountering legacy format manifests', async () => {
    // 模拟旧版本的清单格式，其中 exports 的值是字符串而不是对象
    const legacyManifest = {
        name: 'legacy-module',
        imports: {},
        exports: {
            'legacy-export': 'legacy-module/legacy-file.js'
        } as any
    };

    const expectedErrorMessage =
        'Detected incompatible legacy manifest format in legacy-module. Please upgrade your ESMX dependencies first, then rebuild and redeploy your service.';

    expect(() => {
        getImportMap({
            manifests: [legacyManifest],
            getScope(name) {
                return `/${name}/`;
            },
            getFile(name, file) {
                return `${name}/${file}`;
            }
        });
    }).toThrowError(expectedErrorMessage);
});
