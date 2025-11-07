/**
 * @vitest-environment happy-dom
 */
import { describe, expect, it } from 'vitest';
import * as RouterVueModule from './index';

describe('index.ts - Package Entry Point', () => {
    describe('Composition API Exports', () => {
        it('should export useRouter function', () => {
            expect(RouterVueModule.useRouter).toBeDefined();
            expect(typeof RouterVueModule.useRouter).toBe('function');
        });

        it('should export useRoute function', () => {
            expect(RouterVueModule.useRoute).toBeDefined();
            expect(typeof RouterVueModule.useRoute).toBe('function');
        });

        it('should export useProvideRouter function', () => {
            expect(RouterVueModule.useProvideRouter).toBeDefined();
            expect(typeof RouterVueModule.useProvideRouter).toBe('function');
        });

        it('should export useLink function', () => {
            expect(RouterVueModule.useLink).toBeDefined();
            expect(typeof RouterVueModule.useLink).toBe('function');
        });
    });

    describe('Options API Exports', () => {
        it('should export getRouter function', () => {
            expect(RouterVueModule.getRouter).toBeDefined();
            expect(typeof RouterVueModule.getRouter).toBe('function');
        });

        it('should export getRoute function', () => {
            expect(RouterVueModule.getRoute).toBeDefined();
            expect(typeof RouterVueModule.getRoute).toBe('function');
        });
    });

    describe('Component Exports', () => {
        it('should export RouterLink component', () => {
            expect(RouterVueModule.RouterLink).toBeDefined();
            expect(typeof RouterVueModule.RouterLink).toBe('object');
            expect(RouterVueModule.RouterLink.name).toBe('RouterLink');
            expect(typeof RouterVueModule.RouterLink.setup).toBe('function');
        });

        it('should export RouterView component', () => {
            expect(RouterVueModule.RouterView).toBeDefined();
            expect(typeof RouterVueModule.RouterView).toBe('object');
            expect(RouterVueModule.RouterView.name).toBe('RouterView');
            expect(typeof RouterVueModule.RouterView.setup).toBe('function');
        });
    });

    describe('Plugin Exports', () => {
        it('should export RouterPlugin', () => {
            expect(RouterVueModule.RouterPlugin).toBeDefined();
            expect(typeof RouterVueModule.RouterPlugin).toBe('object');
            expect(typeof RouterVueModule.RouterPlugin.install).toBe(
                'function'
            );
        });
    });

    describe('Export Completeness', () => {
        it('should export all expected functions and components', () => {
            const expectedExports = [
                // Composition API
                'useRouter',
                'useRoute',
                'useProvideRouter',
                'useLink',
                'useRouterViewDepth',
                // Options API
                'getRouter',
                'getRoute',
                // Components
                'RouterLink',
                'RouterView',
                // Plugin
                'RouterPlugin'
            ];

            expectedExports.forEach((exportName) => {
                expect(RouterVueModule).toHaveProperty(exportName);
                expect(
                    RouterVueModule[exportName as keyof typeof RouterVueModule]
                ).toBeDefined();
            });
        });

        it('should not export unexpected items', () => {
            const actualExports = Object.keys(RouterVueModule);
            const expectedExports = [
                'useRouter',
                'useRoute',
                'useProvideRouter',
                'useLink',
                'useRouterViewDepth',
                'getRouter',
                'getRoute',
                'RouterLink',
                'RouterView',
                'RouterPlugin'
            ];

            // Check that we don't have unexpected exports
            const unexpectedExports = actualExports.filter(
                (exportName) => !expectedExports.includes(exportName)
            );

            expect(unexpectedExports).toEqual([]);
        });
    });

    describe('Function Signatures', () => {
        it('should have correct function signatures for Composition API', () => {
            // These should throw expected errors when called without proper context
            expect(() => {
                RouterVueModule.useRouter();
            }).toThrow(
                '[@esmx/router-vue] Must be used within setup() or other composition functions'
            );

            expect(() => {
                RouterVueModule.useRoute();
            }).toThrow(
                '[@esmx/router-vue] Must be used within setup() or other composition functions'
            );

            expect(() => {
                RouterVueModule.useLink({
                    to: '/test',
                    type: 'push',
                    exact: 'include'
                });
            }).toThrow(
                '[@esmx/router-vue] Must be used within setup() or other composition functions'
            );
        });

        it('should have correct function signatures for Options API', () => {
            expect(() => {
                RouterVueModule.getRouter({} as Record<string, unknown>);
            }).toThrow(
                '[@esmx/router-vue] Router context not found. Please ensure useProvideRouter() is called in a parent component.'
            );

            expect(() => {
                RouterVueModule.getRoute({} as Record<string, unknown>);
            }).toThrow(
                '[@esmx/router-vue] Router context not found. Please ensure useProvideRouter() is called in a parent component.'
            );
        });
    });

    describe('Component Properties', () => {
        it('should have RouterLink with correct properties', () => {
            const { RouterLink } = RouterVueModule;

            expect(RouterLink.name).toBe('RouterLink');
            expect(RouterLink.props).toBeDefined();
            expect(RouterLink.setup).toBeDefined();

            // Check required props
            expect(RouterLink.props.to).toBeDefined();
            expect(RouterLink.props.to.required).toBe(true);

            // Check default props
            expect(RouterLink.props.type.default).toBe('push');
            expect(RouterLink.props.exact.default).toBe('include');
            expect(RouterLink.props.tag.default).toBe('a');
            expect(RouterLink.props.event.default).toBe('click');
        });

        it('should have RouterView with correct properties', () => {
            const { RouterView } = RouterVueModule;

            expect(RouterView.name).toBe('RouterView');
            expect(RouterView.setup).toBeDefined();
            // RouterView should not have props
            expect(RouterView.props).toBeUndefined();
        });
    });

    describe('Plugin Interface', () => {
        it('should have RouterPlugin with install method', () => {
            const { RouterPlugin } = RouterVueModule;

            expect(RouterPlugin.install).toBeDefined();
            expect(typeof RouterPlugin.install).toBe('function');

            // Test plugin install signature - should throw for null input
            expect(() => {
                RouterPlugin.install(null);
            }).toThrow('[@esmx/router-vue] Invalid Vue app instance');
        });
    });

    describe('Module Structure', () => {
        it('should be a proper ES module', () => {
            // Check that the module exports are properly structured
            expect(typeof RouterVueModule).toBe('object');
            expect(RouterVueModule).not.toBeNull();

            // Verify it's not a default export
            expect('default' in RouterVueModule).toBe(false);
        });

        it('should have consistent export naming', () => {
            // All function exports should be camelCase
            const functionExports = [
                'useRouter',
                'useRoute',
                'useProvideRouter',
                'useLink',
                'getRouter',
                'getRoute'
            ];

            functionExports.forEach((exportName) => {
                expect(exportName).toMatch(/^[a-z][a-zA-Z]*$/);
            });

            // Component exports should be PascalCase
            const componentExports = [
                'RouterLink',
                'RouterView',
                'RouterPlugin'
            ];

            componentExports.forEach((exportName) => {
                expect(exportName).toMatch(/^[A-Z][a-zA-Z]*$/);
            });
        });
    });

    describe('TypeScript Integration', () => {
        it('should provide proper TypeScript types', () => {
            // These checks verify that TypeScript types are properly exported
            // The actual type checking is done by the TypeScript compiler

            // Verify functions have proper types
            expect(typeof RouterVueModule.useRouter).toBe('function');
            expect(typeof RouterVueModule.useRoute).toBe('function');
            expect(typeof RouterVueModule.getRouter).toBe('function');
            expect(typeof RouterVueModule.getRoute).toBe('function');

            // Verify components have proper structure
            expect(RouterVueModule.RouterLink).toHaveProperty('name');
            expect(RouterVueModule.RouterLink).toHaveProperty('props');
            expect(RouterVueModule.RouterLink).toHaveProperty('setup');

            expect(RouterVueModule.RouterView).toHaveProperty('name');
            expect(RouterVueModule.RouterView).toHaveProperty('setup');
        });
    });
});
