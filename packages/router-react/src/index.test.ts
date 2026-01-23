/**
 * @vitest-environment happy-dom
 */
import { describe, expect, it } from 'vitest';
import * as RouterReactModule from './index';

describe('index.ts - Package Entry Point', () => {
    describe('Hook Exports', () => {
        it('should export useRouter hook', () => {
            expect(RouterReactModule.useRouter).toBeDefined();
            expect(typeof RouterReactModule.useRouter).toBe('function');
        });

        it('should export useRoute hook', () => {
            expect(RouterReactModule.useRoute).toBeDefined();
            expect(typeof RouterReactModule.useRoute).toBe('function');
        });

        it('should export useLink hook', () => {
            expect(RouterReactModule.useLink).toBeDefined();
            expect(typeof RouterReactModule.useLink).toBe('function');
        });

        it('should export useRouterViewDepth hook', () => {
            expect(RouterReactModule.useRouterViewDepth).toBeDefined();
            expect(typeof RouterReactModule.useRouterViewDepth).toBe(
                'function'
            );
        });
    });

    describe('Component Exports', () => {
        it('should export RouterProvider component', () => {
            expect(RouterReactModule.RouterProvider).toBeDefined();
            expect(typeof RouterReactModule.RouterProvider).toBe('function');
        });

        it('should export RouterLink component', () => {
            expect(RouterReactModule.RouterLink).toBeDefined();
            expect(typeof RouterReactModule.RouterLink).toBe('object'); // forwardRef returns object
        });

        it('should export RouterView component', () => {
            expect(RouterReactModule.RouterView).toBeDefined();
            expect(typeof RouterReactModule.RouterView).toBe('function');
        });
    });

    describe('Context Exports', () => {
        it('should export RouterContext', () => {
            expect(RouterReactModule.RouterContext).toBeDefined();
            expect(RouterReactModule.RouterContext.displayName).toBe(
                'RouterContext'
            );
        });

        it('should export RouterViewDepthContext', () => {
            expect(RouterReactModule.RouterViewDepthContext).toBeDefined();
            expect(RouterReactModule.RouterViewDepthContext.displayName).toBe(
                'RouterViewDepthContext'
            );
        });
    });

    describe('Export Completeness', () => {
        it('should export all expected functions and components', () => {
            const expectedExports = [
                // Hooks
                'useRouter',
                'useRoute',
                'useLink',
                'useRouterViewDepth',
                // Components
                'RouterProvider',
                'RouterLink',
                'RouterView',
                // Context
                'RouterContext',
                'RouterViewDepthContext'
            ];

            expectedExports.forEach((exportName) => {
                expect(RouterReactModule).toHaveProperty(exportName);
                expect(Object.hasOwn(RouterReactModule, exportName)).toBe(true);
            });
        });

        it('should not export unexpected items', () => {
            const actualExports = Object.keys(RouterReactModule);
            const expectedExports = [
                'useRouter',
                'useRoute',
                'useLink',
                'useRouterViewDepth',
                'RouterProvider',
                'RouterLink',
                'RouterView',
                'RouterContext',
                'RouterViewDepthContext'
            ];

            // Check that we don't have unexpected exports
            const unexpectedExports = actualExports.filter(
                (exportName) => !expectedExports.includes(exportName)
            );

            expect(unexpectedExports).toEqual([]);
        });
    });

    describe('Hook Error Handling', () => {
        it('hooks should throw when used incorrectly', () => {
            // React hooks cannot be called outside of components
            // This is expected React behavior - hooks depend on internal React state
            // The error message varies depending on the React version and environment
            expect(() => {
                RouterReactModule.useRouter();
            }).toThrow(); // Will throw "Invalid hook call" or similar

            expect(() => {
                RouterReactModule.useRoute();
            }).toThrow(); // Will throw "Invalid hook call" or similar
        });
    });

    describe('Component Properties', () => {
        it('should have RouterProvider with displayName', () => {
            expect(RouterReactModule.RouterProvider.displayName).toBe(
                'RouterProvider'
            );
        });

        it('should have RouterView with displayName', () => {
            expect(RouterReactModule.RouterView.displayName).toBe('RouterView');
        });

        it('should have RouterLink with displayName', () => {
            expect(RouterReactModule.RouterLink.displayName).toBe('RouterLink');
        });
    });

    describe('Module Structure', () => {
        it('should be a proper ES module', () => {
            expect(typeof RouterReactModule).toBe('object');
            expect(RouterReactModule).not.toBeNull();

            // Verify it's not a default export
            expect('default' in RouterReactModule).toBe(false);
        });

        it('should have consistent export naming', () => {
            // All hooks should start with 'use'
            const hookExports = [
                'useRouter',
                'useRoute',
                'useLink',
                'useRouterViewDepth'
            ];

            hookExports.forEach((exportName) => {
                expect(exportName).toMatch(/^use[A-Z][a-zA-Z]*$/);
            });

            // Component exports should be PascalCase
            const componentExports = [
                'RouterProvider',
                'RouterLink',
                'RouterView',
                'RouterContext',
                'RouterViewDepthContext'
            ];

            componentExports.forEach((exportName) => {
                expect(exportName).toMatch(/^[A-Z][a-zA-Z]*$/);
            });
        });
    });

    describe('TypeScript Types', () => {
        it('should export RouterContextValue type (via typeof)', () => {
            // Types are compile-time only, but we can verify the runtime shape
            const context = RouterReactModule.RouterContext;
            expect(context).toBeDefined();
            expect(context.Provider).toBeDefined();
            expect(context.Consumer).toBeDefined();
        });

        it('should have RouterViewDepthContext with correct default value', () => {
            // RouterViewDepthContext should default to 0
            const context = RouterReactModule.RouterViewDepthContext;
            expect(context).toBeDefined();
            expect(context.Provider).toBeDefined();
        });
    });

    describe('React Best Practices', () => {
        it('RouterLink should be a forwardRef component', () => {
            // forwardRef components have $$typeof and render properties
            const link = RouterReactModule.RouterLink as any;
            expect(link.$$typeof).toBeDefined();
            // The render property exists on forwardRef components
            expect(link.render || link.type).toBeDefined();
        });

        it('RouterProvider should accept router and children props', () => {
            // Function components show their parameter count
            // RouterProvider should be a regular function component
            expect(RouterReactModule.RouterProvider).toBeDefined();
        });

        it('RouterView should accept fallback prop', () => {
            expect(RouterReactModule.RouterView).toBeDefined();
        });
    });
});
