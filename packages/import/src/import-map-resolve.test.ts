import { describe, expect, it } from 'vitest';
import { createImportMapResolver } from './import-map-resolve';
import type { ImportMap } from './types';

describe('createImportMapResolver', () => {
    describe('basic import resolution', () => {
        it('resolves imports correctly on Windows', () => {
            const base = 'file:///C:/projects/app';

            const importMap: ImportMap = {
                imports: {
                    lodash: 'https://cdn.skypack.dev/lodash',
                    'utils/': 'file:///C:/projects/app/src/utils/',
                    './components/': './components/'
                }
            };

            const resolver = createImportMapResolver(base, importMap);

            expect(resolver('lodash', 'file:///C:/projects/app/index.js')).toBe(
                'https://cdn.skypack.dev/lodash'
            );

            expect(
                resolver('utils/math.js', 'file:///C:/projects/app/index.js')
            ).toBe('file:///C:/projects/app/src/utils/math.js');

            expect(
                resolver(
                    './components/button.js',
                    'file:///C:/projects/app/index.js'
                )
            ).toBe('file:///C:/projects/app/components/button.js');
        });

        it('resolves imports correctly on Unix', () => {
            const base = 'file:///opt/projects/app';

            const importMap: ImportMap = {
                imports: {
                    lodash: 'https://cdn.skypack.dev/lodash',
                    'utils/': 'file:///opt/projects/app/src/utils/',
                    './components/': './components/'
                }
            };

            const resolver = createImportMapResolver(base, importMap);

            expect(
                resolver('lodash', 'file:///opt/projects/app/index.js')
            ).toBe('https://cdn.skypack.dev/lodash');

            expect(
                resolver('utils/math.js', 'file:///opt/projects/app/index.js')
            ).toBe('file:///opt/projects/app/src/utils/math.js');

            expect(
                resolver(
                    './components/button.js',
                    'file:///opt/projects/app/index.js'
                )
            ).toBe('file:///opt/projects/app/components/button.js');
        });
    });

    describe('scopes resolution', () => {
        it('resolves imports from different scopes', () => {
            const base = 'file:///opt/projects/app';

            const importMap: ImportMap = {
                imports: {
                    'components/': 'file:///opt/projects/app/src/components/',
                    lodash: 'https://cdn.skypack.dev/lodash@4.17.21'
                },
                scopes: {
                    'file:///opt/projects/app/src/admin/': {
                        'components/':
                            'file:///opt/projects/app/src/admin/components/',
                        lodash: 'https://cdn.skypack.dev/lodash@4.17.15'
                    }
                }
            };

            const resolver = createImportMapResolver(base, importMap);

            expect(
                resolver(
                    'components/button.js',
                    'file:///opt/projects/app/index.js'
                )
            ).toBe('file:///opt/projects/app/src/components/button.js');
            expect(
                resolver('lodash', 'file:///opt/projects/app/index.js')
            ).toBe('https://cdn.skypack.dev/lodash@4.17.21');

            expect(
                resolver(
                    'components/button.js',
                    'file:///opt/projects/app/src/admin/index.js'
                )
            ).toBe('file:///opt/projects/app/src/admin/components/button.js');
            expect(
                resolver(
                    'lodash',
                    'file:///opt/projects/app/src/admin/index.js'
                )
            ).toBe('https://cdn.skypack.dev/lodash@4.17.15');
        });
    });

    describe('real world scenarios', () => {
        it('resolves server-side rendering project imports', () => {
            const base = 'file:///opt/projects/example/server-app';

            const importMap: ImportMap = {
                imports: {
                    'app/server/entry':
                        'file:///opt/projects/example/server-app/dist/server/exports/src/entry.server.mjs'
                },
                scopes: {
                    'file:///opt/projects/example/server-app/dist/server/': {}
                }
            };

            const resolver = createImportMapResolver(base, importMap);

            expect(
                resolver(
                    'app/server/entry',
                    'file:///opt/projects/example/server-app/index.js'
                )
            ).toBe(
                'file:///opt/projects/example/server-app/dist/server/exports/src/entry.server.mjs'
            );

            expect(
                resolver(
                    'app/server/entry',
                    'file:///opt/projects/example/server-app/dist/server/main.js'
                )
            ).toBe(
                'file:///opt/projects/example/server-app/dist/server/exports/src/entry.server.mjs'
            );
        });
    });

    describe('unresolved specifiers', () => {
        it('returns null for unresolved specifiers', () => {
            const base = 'file:///opt/projects/app';

            const importMap: ImportMap = {
                imports: {
                    'utils/': 'file:///opt/projects/app/src/utils/'
                }
            };

            const resolver = createImportMapResolver(base, importMap);

            expect(
                resolver(
                    'components/button.js',
                    'file:///opt/projects/app/index.js'
                )
            ).toBe(null);
        });
    });

    describe('edge cases', () => {
        it('handles empty import map', () => {
            const base = 'file:///opt/projects/app';
            const importMap: ImportMap = {};

            const resolver = createImportMapResolver(base, importMap);

            expect(
                resolver('lodash', 'file:///opt/projects/app/index.js')
            ).toBe(null);
        });

        it('handles spaces in paths', () => {
            const base = 'file:///opt/projects/My%20Project/app';

            const importMap: ImportMap = {
                imports: {
                    'components/':
                        'file:///opt/projects/My%20Project/app/src/my%20components/'
                }
            };

            const resolver = createImportMapResolver(base, importMap);

            expect(
                resolver(
                    'components/button.js',
                    'file:///opt/projects/My%20Project/app/index.js'
                )
            ).toBe(
                'file:///opt/projects/My%20Project/app/src/my%20components/button.js'
            );
        });

        it('handles Unicode characters in paths', () => {
            const base = 'file:///opt/projects/%E5%9B%BD%E9%99%85%E5%8C%96/app';

            const importMap: ImportMap = {
                imports: {
                    '国际化/':
                        'file:///opt/projects/%E5%9B%BD%E9%99%85%E5%8C%96/app/src/%E5%9B%BD%E9%99%85%E5%8C%96/'
                }
            };

            const resolver = createImportMapResolver(base, importMap);

            expect(
                resolver(
                    '国际化/zh.js',
                    'file:///opt/projects/%E5%9B%BD%E9%99%85%E5%8C%96/app/index.js'
                )
            ).toBe(
                'file:///opt/projects/%E5%9B%BD%E9%99%85%E5%8C%96/app/src/%E5%9B%BD%E9%99%85%E5%8C%96/zh.js'
            );
        });
    });
});
