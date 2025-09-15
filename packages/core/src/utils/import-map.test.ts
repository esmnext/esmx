import { assert, describe, test } from 'vitest';
import { buildImportsMap, buildScopesMap, getImportMap } from './import-map';
import type { GetImportMapOptions, ImportMapManifest } from './import-map';

describe('buildImportsMap', () => {
    test('should return empty object for empty manifests', () => {
        const result = buildImportsMap([], (name, file) => `${name}/${file}`);
        assert.deepEqual(result, {});
    });

    test('should process all exports including package exports', () => {
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
            'test-module/component': 'test-module/component.js',
            'test-module/vue': 'test-module/vue.js'
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

describe('buildScopesMap', () => {
    test('should return empty object for empty manifests', () => {
        const imports = {};
        const manifests: ImportMapManifest[] = [];
        const result = buildScopesMap(
            imports,
            manifests,
            (name, scope) => `${name}/${scope}`
        );
        assert.deepEqual(result, {});
    });

    test('should return empty object when manifests have no scopes', () => {
        const imports = {
            'test-module/component': 'test-module/component.js'
        };
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
        const result = buildScopesMap(
            imports,
            manifests,
            (name, scope) => `${name}/${scope}`
        );
        assert.deepEqual(result, {});
    });

    test('should build scopes map with basic scope configuration', () => {
        const imports = {
            'test-module/component': 'test-module/component.js',
            'test-module/utils': 'test-module/utils.js'
        };
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
                    utils: {
                        name: 'utils',
                        pkg: false,
                        file: 'utils.js',
                        identifier: 'test-module/utils'
                    }
                },
                scopes: {
                    node_modules: {
                        react: 'test-module/component',
                        lodash: 'test-module/utils'
                    }
                }
            }
        ];
        const result = buildScopesMap(
            imports,
            manifests,
            (name, scope) => `${name}/${scope}`
        );
        assert.deepEqual(result, {
            'test-module//node_modules': {
                react: 'test-module/component.js',
                lodash: 'test-module/utils.js'
            }
        });
    });

    test('should handle scope with non-existent identifiers', () => {
        const imports = {
            'test-module/component': 'test-module/component.js'
        };
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
                scopes: {
                    node_modules: {
                        react: 'test-module/component',
                        'non-existent': 'test-module/non-existent'
                    }
                }
            }
        ];
        const result = buildScopesMap(
            imports,
            manifests,
            (name, scope) => `${name}/${scope}`
        );
        assert.deepEqual(result, {
            'test-module//node_modules': {
                react: 'test-module/component.js',
                'non-existent': 'test-module/non-existent'
            }
        });
    });

    test('should handle scope with external URLs', () => {
        const imports = {
            'test-module/component': 'test-module/component.js'
        };
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
                scopes: {
                    node_modules: {
                        react: 'https://cdn.com/react.js',
                        'local-component': 'test-module/component'
                    }
                }
            }
        ];
        const result = buildScopesMap(
            imports,
            manifests,
            (name, scope) => `${name}/${scope}`
        );
        assert.deepEqual(result, {
            'test-module//node_modules': {
                react: 'https://cdn.com/react.js',
                'local-component': 'test-module/component.js'
            }
        });
    });

    test('should use scope path from imports when available', () => {
        const imports = {
            'test-module/node_modules': 'test-module/node_modules/index.js',
            'test-module/component': 'test-module/component.js'
        };
        const manifests: ImportMapManifest[] = [
            {
                name: 'test-module',
                imports: {},
                exports: {
                    node_modules: {
                        name: 'node_modules',
                        pkg: false,
                        file: 'node_modules/index.js',
                        identifier: 'test-module/node_modules'
                    },
                    component: {
                        name: 'component',
                        pkg: false,
                        file: 'component.js',
                        identifier: 'test-module/component'
                    }
                },
                scopes: {
                    node_modules: {
                        react: 'test-module/component'
                    }
                }
            }
        ];
        const result = buildScopesMap(
            imports,
            manifests,
            (name, scope) => `${name}/${scope}`
        );
        assert.deepEqual(result, {
            'test-module/test-module/node_modules/index.js': {
                react: 'test-module/component.js'
            }
        });
    });

    test('should fall back to scope path when not found in imports', () => {
        const imports = {
            'test-module/component': 'test-module/component.js'
        };
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
                scopes: {
                    node_modules: {
                        react: 'test-module/component'
                    }
                }
            }
        ];
        const result = buildScopesMap(
            imports,
            manifests,
            (name, scope) => `${name}/${scope}`
        );
        assert.deepEqual(result, {
            'test-module//node_modules': {
                react: 'test-module/component.js'
            }
        });
    });

    test('should handle multiple scopes in single manifest', () => {
        const imports = {
            'test-module/component': 'test-module/component.js',
            'test-module/utils': 'test-module/utils.js'
        };
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
                    utils: {
                        name: 'utils',
                        pkg: false,
                        file: 'utils.js',
                        identifier: 'test-module/utils'
                    }
                },
                scopes: {
                    node_modules: {
                        react: 'test-module/component'
                    },
                    vendor: {
                        lodash: 'test-module/utils'
                    }
                }
            }
        ];
        const result = buildScopesMap(
            imports,
            manifests,
            (name, scope) => `${name}/${scope}`
        );
        assert.deepEqual(result, {
            'test-module//node_modules': {
                react: 'test-module/component.js'
            },
            'test-module//vendor': {
                lodash: 'test-module/utils.js'
            }
        });
    });

    test('should handle multiple manifests with scopes', () => {
        const imports = {
            'module-a/component': 'module-a/component.js',
            'module-b/utils': 'module-b/utils.js'
        };
        const manifests: ImportMapManifest[] = [
            {
                name: 'module-a',
                imports: {},
                exports: {
                    component: {
                        name: 'component',
                        pkg: false,
                        file: 'component.js',
                        identifier: 'module-a/component'
                    }
                },
                scopes: {
                    node_modules: {
                        react: 'module-a/component'
                    }
                }
            },
            {
                name: 'module-b',
                imports: {},
                exports: {
                    utils: {
                        name: 'utils',
                        pkg: false,
                        file: 'utils.js',
                        identifier: 'module-b/utils'
                    }
                },
                scopes: {
                    vendor: {
                        lodash: 'module-b/utils'
                    }
                }
            }
        ];
        const result = buildScopesMap(
            imports,
            manifests,
            (name, scope) => `${name}/${scope}`
        );
        assert.deepEqual(result, {
            'module-a//node_modules': {
                react: 'module-a/component.js'
            },
            'module-b//vendor': {
                lodash: 'module-b/utils.js'
            }
        });
    });

    test('should handle empty scope specifier map', () => {
        const imports = {
            'test-module/component': 'test-module/component.js'
        };
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
                scopes: {
                    './node_modules': {}
                }
            }
        ];
        const result = buildScopesMap(
            imports,
            manifests,
            (name, scope) => `${name}/${scope}`
        );
        assert.deepEqual(result, {
            'test-module//./node_modules': {}
        });
    });

    test('should handle undefined scopes property', () => {
        const imports = {
            'test-module/component': 'test-module/component.js'
        };
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
                scopes: undefined as any
            }
        ];
        const result = buildScopesMap(
            imports,
            manifests,
            (name, scope) => `${name}/${scope}`
        );
        assert.deepEqual(result, {});
    });
});

describe('getImportMap', () => {
    test('should return empty import map for empty manifests', () => {
        const options: GetImportMapOptions = {
            manifests: [],
            getFile: (name, file) => `${name}/${file}`,
            getScope: (name, scope) => `${name}/${scope}`
        };
        const result = getImportMap(options);
        assert.deepEqual(result, {
            imports: {},
            scopes: {}
        });
    });

    test('should build complete import map with imports and scopes', () => {
        const options: GetImportMapOptions = {
            manifests: [
                {
                    name: 'test-module',
                    imports: {
                        'custom-react': 'test-module/component'
                    },
                    exports: {
                        component: {
                            name: 'component',
                            pkg: false,
                            file: 'component.js',
                            identifier: 'test-module/component'
                        },
                        utils: {
                            name: 'utils',
                            pkg: false,
                            file: 'utils.js',
                            identifier: 'test-module/utils'
                        }
                    },
                    scopes: {
                        node_modules: {
                            react: 'test-module/component',
                            lodash: 'test-module/utils'
                        }
                    }
                }
            ],
            getFile: (name, file) => `${name}/${file}`,
            getScope: (name, scope) => `${name}/${scope}`
        };
        const result = getImportMap(options);
        assert.deepEqual(result, {
            imports: {
                'test-module/component': 'test-module/component.js',
                'test-module/utils': 'test-module/utils.js',
                'test-module/custom-react': 'test-module/component.js'
            },
            scopes: {
                'test-module//node_modules': {
                    react: 'test-module/component.js',
                    lodash: 'test-module/utils.js'
                }
            }
        });
    });

    test('should handle complex multi-module scenario', () => {
        const options: GetImportMapOptions = {
            manifests: [
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
                    scopes: {
                        node_modules: {
                            react: 'module-a/utils'
                        }
                    }
                },
                {
                    name: 'module-b',
                    imports: {
                        shared: 'module-a/utils'
                    },
                    exports: {
                        component: {
                            name: 'component',
                            pkg: false,
                            file: 'component.js',
                            identifier: 'module-b/component'
                        }
                    },
                    scopes: {
                        vendor: {
                            lodash: 'module-a/utils'
                        }
                    }
                }
            ],
            getFile: (name, file) => `${name}/${file}`,
            getScope: (name, scope) => `${name}/${scope}`
        };
        const result = getImportMap(options);
        assert.deepEqual(result, {
            imports: {
                'module-a/utils': 'module-a/utils.js',
                'module-b/component': 'module-b/component.js',
                'module-b/shared': 'module-a/utils.js'
            },
            scopes: {
                'module-a//node_modules': {
                    react: 'module-a/utils.js'
                },
                'module-b//vendor': {
                    lodash: 'module-a/utils.js'
                }
            }
        });
    });

    test('should handle manifests with only exports', () => {
        const options: GetImportMapOptions = {
            manifests: [
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
            ],
            getFile: (name, file) => `${name}/${file}`,
            getScope: (name, scope) => `${name}/${scope}`
        };
        const result = getImportMap(options);
        assert.deepEqual(result, {
            imports: {
                'test-module/component': 'test-module/component.js'
            },
            scopes: {}
        });
    });

    test('should handle manifests with only imports', () => {
        const options: GetImportMapOptions = {
            manifests: [
                {
                    name: 'test-module',
                    imports: {
                        external: 'https://cdn.com/lib.js'
                    },
                    exports: {},
                    scopes: {}
                }
            ],
            getFile: (name, file) => `${name}/${file}`,
            getScope: (name, scope) => `${name}/${scope}`
        };
        const result = getImportMap(options);
        assert.deepEqual(result, {
            imports: {
                'test-module/external': 'https://cdn.com/lib.js'
            },
            scopes: {}
        });
    });

    test('should handle manifests with only scopes', () => {
        const options: GetImportMapOptions = {
            manifests: [
                {
                    name: 'test-module',
                    imports: {},
                    exports: {},
                    scopes: {
                        node_modules: {
                            react: 'https://cdn.com/react.js'
                        }
                    }
                }
            ],
            getFile: (name, file) => `${name}/${file}`,
            getScope: (name, scope) => `${name}/${scope}`
        };
        const result = getImportMap(options);
        assert.deepEqual(result, {
            imports: {},
            scopes: {
                'test-module//node_modules': {
                    react: 'https://cdn.com/react.js'
                }
            }
        });
    });

    test('should handle custom getFile and getScope functions', () => {
        const options: GetImportMapOptions = {
            manifests: [
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
                    scopes: {
                        node_modules: {
                            react: 'test-module/component'
                        }
                    }
                }
            ],
            getFile: (name, file) => `/custom/path/${name}/${file}`,
            getScope: (name, scope) => `custom-scope-${name}-${scope}`
        };
        const result = getImportMap(options);
        assert.deepEqual(result, {
            imports: {
                'test-module/component': '/custom/path/test-module/component.js'
            },
            scopes: {
                'custom-scope-test-module-/node_modules': {
                    react: '/custom/path/test-module/component.js'
                }
            }
        });
    });

    test('should handle edge case with undefined scopes in manifests', () => {
        const options: GetImportMapOptions = {
            manifests: [
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
                    scopes: undefined as any
                }
            ],
            getFile: (name, file) => `${name}/${file}`,
            getScope: (name, scope) => `${name}/${scope}`
        };
        const result = getImportMap(options);
        assert.deepEqual(result, {
            imports: {
                'test-module/component': 'test-module/component.js'
            },
            scopes: {}
        });
    });

    test('should handle mixed scenarios with external URLs and local modules', () => {
        const options: GetImportMapOptions = {
            manifests: [
                {
                    name: 'test-module',
                    imports: {
                        'external-react': 'https://cdn.com/react.js',
                        'local-alias': 'test-module/component'
                    },
                    exports: {
                        component: {
                            name: 'component',
                            pkg: false,
                            file: 'component.js',
                            identifier: 'test-module/component'
                        }
                    },
                    scopes: {
                        node_modules: {
                            'external-lib': 'https://cdn.com/lodash.js',
                            'local-lib': 'test-module/component'
                        }
                    }
                }
            ],
            getFile: (name, file) => `${name}/${file}`,
            getScope: (name, scope) => `${name}/${scope}`
        };
        const result = getImportMap(options);
        assert.deepEqual(result, {
            imports: {
                'test-module/component': 'test-module/component.js',
                'test-module/external-react': 'https://cdn.com/react.js',
                'test-module/local-alias': 'test-module/component.js'
            },
            scopes: {
                'test-module//node_modules': {
                    'external-lib': 'https://cdn.com/lodash.js',
                    'local-lib': 'test-module/component.js'
                }
            }
        });
    });

    test('should handle index path aliases in complete import map', () => {
        const options: GetImportMapOptions = {
            manifests: [
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
                    scopes: {
                        src: {
                            main: 'test-module/src/index'
                        }
                    }
                }
            ],
            getFile: (name, file) => `${name}/${file}`,
            getScope: (name, scope) => `${name}/${scope}`
        };
        const result = getImportMap(options);
        assert.deepEqual(result, {
            imports: {
                'test-module/src/index': 'test-module/src/index.js',
                'test-module/src': 'test-module/src/index.js'
            },
            scopes: {
                'test-module/test-module/src/index.js': {
                    main: 'test-module/src/index.js'
                }
            }
        });
    });
});
