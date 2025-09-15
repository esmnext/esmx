import { assert, describe, test } from 'vitest';
import { buildImportsMap } from './import-map';
import type { ImportMapManifest } from './import-map';

describe('buildImportsMap', () => {
    test('should return empty object for empty manifests', () => {
        const result = buildImportsMap([], (name, file) => `${name}/${file}`);
        assert.deepEqual(result, {});
    });

    test('should only process non package exports', () => {
        const manifests: ImportMapManifest[] = [
            {
                name: 'test-module',
                imports: {},
                exports: {
                    component: {
                        name: 'component',
                        pkg: false,
                        file: 'component.js',
                        identifier: 'test-module/component'
                    },
                    vue: {
                        name: 'vue',
                        pkg: true,
                        file: 'vue.js',
                        identifier: 'test-module/vue'
                    }
                },
                scopes: {}
            }
        ];

        const result = buildImportsMap(
            manifests,
            (name, file) => `${name}/${file}`
        );

        assert.deepEqual(result, {
            'test-module/component': 'test-module/component.js'
        });
    });

    test('should handle user imports with existing identifiers', () => {
        const manifests: ImportMapManifest[] = [
            {
                name: 'test-module',
                imports: {
                    'custom-name': 'test-module/component'
                },
                exports: {
                    component: {
                        name: 'component',
                        pkg: false,
                        file: 'component.js',
                        identifier: 'test-module/component'
                    }
                },
                scopes: {}
            }
        ];

        const result = buildImportsMap(
            manifests,
            (name, file) => `${name}/${file}`
        );

        assert.deepEqual(result, {
            'test-module/component': 'test-module/component.js',
            'test-module/custom-name': 'test-module/component.js'
        });
    });

    test('should handle user imports with non existing identifiers', () => {
        const manifests: ImportMapManifest[] = [
            {
                name: 'test-module',
                imports: {
                    external: 'https://cdn.com/lib.js'
                },
                exports: {
                    component: {
                        name: 'component',
                        pkg: false,
                        file: 'component.js',
                        identifier: 'test-module/component'
                    }
                },
                scopes: {}
            }
        ];

        const result = buildImportsMap(
            manifests,
            (name, file) => `${name}/${file}`
        );

        assert.deepEqual(result, {
            'test-module/component': 'test-module/component.js',
            'test-module/external': 'https://cdn.com/lib.js'
        });
    });

    test('should create aliases for index suffixes', () => {
        const manifests: ImportMapManifest[] = [
            {
                name: 'test-module',
                imports: {},
                exports: {
                    'src/index': {
                        name: 'src/index',
                        pkg: false,
                        file: 'src/index.js',
                        identifier: 'test-module/src/index'
                    }
                },
                scopes: {}
            }
        ];

        const result = buildImportsMap(
            manifests,
            (name, file) => `${name}/${file}`
        );

        assert.deepEqual(result, {
            'test-module/src/index': 'test-module/src/index.js',
            'test-module/src': 'test-module/src/index.js'
        });
    });

    test('should handle multiple manifests', () => {
        const manifests: ImportMapManifest[] = [
            {
                name: 'module-a',
                imports: {},
                exports: {
                    utils: {
                        name: 'utils',
                        pkg: false,
                        file: 'utils.js',
                        identifier: 'module-a/utils'
                    }
                },
                scopes: {}
            },
            {
                name: 'module-b',
                imports: {
                    shared: 'module-a/utils'
                },
                exports: {},
                scopes: {}
            }
        ];

        const result = buildImportsMap(
            manifests,
            (name, file) => `${name}/${file}`
        );

        assert.deepEqual(result, {
            'module-a/utils': 'module-a/utils.js',
            'module-b/shared': 'module-a/utils.js'
        });
    });

    test('should prioritize user imports', () => {
        const manifests: ImportMapManifest[] = [
            {
                name: 'test-module',
                imports: {
                    react: 'preact',
                    vue: './custom/vue.js'
                },
                exports: {
                    react: {
                        name: 'react',
                        pkg: false,
                        file: 'react.js',
                        identifier: 'test-module/react'
                    },
                    vue: {
                        name: 'vue',
                        pkg: false,
                        file: 'vue.js',
                        identifier: 'test-module/vue'
                    }
                },
                scopes: {}
            }
        ];

        const result = buildImportsMap(
            manifests,
            (name, file) => `${name}/${file}`
        );

        assert.deepEqual(result, {
            'test-module/react': 'preact',
            'test-module/vue': './custom/vue.js'
        });
    });

    test('should handle mixed user import types', () => {
        const manifests: ImportMapManifest[] = [
            {
                name: 'test-module',
                imports: {
                    'url-import': 'https://example.com/lib.js',
                    'relative-import': './local/file.js',
                    'identifier-import': 'test-module/component'
                },
                exports: {
                    component: {
                        name: 'component',
                        pkg: false,
                        file: 'component.js',
                        identifier: 'test-module/component'
                    }
                },
                scopes: {}
            }
        ];

        const result = buildImportsMap(
            manifests,
            (name, file) => `${name}/${file}`
        );

        assert.deepEqual(result, {
            'test-module/component': 'test-module/component.js',
            'test-module/url-import': 'https://example.com/lib.js',
            'test-module/relative-import': './local/file.js',
            'test-module/identifier-import': 'test-module/component.js'
        });
    });

    test('should handle empty exports', () => {
        const manifests: ImportMapManifest[] = [
            {
                name: 'test-module',
                imports: {
                    external: 'https://cdn.com/lib.js'
                },
                exports: {},
                scopes: {}
            }
        ];

        const result = buildImportsMap(
            manifests,
            (name, file) => `${name}/${file}`
        );

        assert.deepEqual(result, {
            'test-module/external': 'https://cdn.com/lib.js'
        });
    });

    test('should handle empty imports', () => {
        const manifests: ImportMapManifest[] = [
            {
                name: 'test-module',
                imports: {},
                exports: {
                    component: {
                        name: 'component',
                        pkg: false,
                        file: 'component.js',
                        identifier: 'test-module/component'
                    }
                },
                scopes: {}
            }
        ];

        const result = buildImportsMap(
            manifests,
            (name, file) => `${name}/${file}`
        );

        assert.deepEqual(result, {
            'test-module/component': 'test-module/component.js'
        });
    });

    test('should handle duplicate alias creation', () => {
        const manifests: ImportMapManifest[] = [
            {
                name: 'test-module',
                imports: {},
                exports: {
                    'src/components/index': {
                        name: 'src/components/index',
                        pkg: false,
                        file: 'src/components/index.js',
                        identifier: 'test-module/src/components/index'
                    }
                },
                scopes: {}
            }
        ];

        const result = buildImportsMap(
            manifests,
            (name, file) => `${name}/${file}`
        );

        assert.deepEqual(result, {
            'test-module/src/components/index':
                'test-module/src/components/index.js',
            'test-module/src/components': 'test-module/src/components/index.js'
        });
    });

    test('should handle cross-module references', () => {
        const manifests: ImportMapManifest[] = [
            {
                name: 'module-a',
                imports: {},
                exports: {
                    utils: {
                        name: 'utils',
                        pkg: false,
                        file: 'utils.js',
                        identifier: 'module-a/utils'
                    }
                },
                scopes: {}
            },
            {
                name: 'module-b',
                imports: {
                    shared: 'module-a/utils'
                },
                exports: {},
                scopes: {}
            }
        ];

        const result = buildImportsMap(
            manifests,
            (name, file) => `${name}/${file}`
        );

        assert.deepEqual(result, {
            'module-a/utils': 'module-a/utils.js',
            'module-b/shared': 'module-a/utils.js'
        });
    });

    test('should handle cross-module non-existent references', () => {
        const manifests: ImportMapManifest[] = [
            {
                name: 'module-a',
                imports: {},
                exports: {
                    utils: {
                        name: 'utils',
                        pkg: false,
                        file: 'utils.js',
                        identifier: 'module-a/utils'
                    }
                },
                scopes: {}
            },
            {
                name: 'module-b',
                imports: {
                    external: 'module-a/non-existent'
                },
                exports: {},
                scopes: {}
            }
        ];

        const result = buildImportsMap(
            manifests,
            (name, file) => `${name}/${file}`
        );

        assert.deepEqual(result, {
            'module-a/utils': 'module-a/utils.js',
            'module-b/external': 'module-a/non-existent'
        });
    });

    test('should handle identifier conflicts across modules', () => {
        const manifests: ImportMapManifest[] = [
            {
                name: 'module-a',
                imports: {},
                exports: {
                    utils: {
                        name: 'utils',
                        pkg: false,
                        file: 'utils-a.js',
                        identifier: 'module-a/utils'
                    }
                },
                scopes: {}
            },
            {
                name: 'module-b',
                imports: {},
                exports: {
                    utils: {
                        name: 'utils',
                        pkg: false,
                        file: 'utils-b.js',
                        identifier: 'module-b/utils'
                    }
                },
                scopes: {}
            }
        ];

        const result = buildImportsMap(
            manifests,
            (name, file) => `${name}/${file}`
        );

        assert.deepEqual(result, {
            'module-a/utils': 'module-a/utils-a.js',
            'module-b/utils': 'module-b/utils-b.js'
        });
    });

    test('should handle user imports referencing aliased identifiers', () => {
        const manifests: ImportMapManifest[] = [
            {
                name: 'test-module',
                imports: {
                    'alias-test': 'test-module/src/index'
                },
                exports: {
                    'src/index': {
                        name: 'src/index',
                        pkg: false,
                        file: 'src/index.js',
                        identifier: 'test-module/src/index'
                    }
                },
                scopes: {}
            }
        ];

        const result = buildImportsMap(
            manifests,
            (name, file) => `${name}/${file}`
        );

        assert.deepEqual(result, {
            'test-module/src/index': 'test-module/src/index.js',
            'test-module/src': 'test-module/src/index.js',
            'test-module/alias-test': 'test-module/src/index.js'
        });
    });

    test('should handle nested index aliases', () => {
        const manifests: ImportMapManifest[] = [
            {
                name: 'test-module',
                imports: {},
                exports: {
                    'src/components/utils/index': {
                        name: 'src/components/utils/index',
                        pkg: false,
                        file: 'src/components/utils/index.js',
                        identifier: 'test-module/src/components/utils/index'
                    }
                },
                scopes: {}
            }
        ];

        const result = buildImportsMap(
            manifests,
            (name, file) => `${name}/${file}`
        );

        assert.deepEqual(result, {
            'test-module/src/components/utils/index':
                'test-module/src/components/utils/index.js',
            'test-module/src/components/utils':
                'test-module/src/components/utils/index.js'
        });
    });
});
