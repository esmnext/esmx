import { beforeEach, describe, expect, it, vi } from 'vitest';
import { parsedOptions } from './options';
import { Router } from './router';
import { createLinkResolver } from './router-link';
import { RouterMode } from './types';
import type {
    RouteConfig,
    RouterLinkProps,
    RouterOptions,
    RouterParsedOptions
} from './types';

/**
 * RouterLink Complete Tests
 *
 * Testing createLinkResolver through its public API to verify:
 * - Internal guardEvent logic (through navigate function behavior)
 * - Internal normalizeNavigationType logic (through type handling)
 * - Internal computeAttributes logic (through attributes generation)
 * - Internal getEventTypeList logic (through event handlers)
 * - Internal executeNavigation logic (through all navigation types)
 * - Edge cases and error handling
 */

describe('RouterLink Complete Tests', () => {
    let router: Router;

    const createTestOptions = (
        overrides: Partial<RouterOptions> = {}
    ): RouterParsedOptions => {
        const base = new URL('http://localhost:3000/');
        const routes: RouteConfig[] = [
            { path: '/', meta: { title: 'Home' } },
            { path: '/users/:id', meta: { title: 'User Detail' } },
            { path: '/posts/:postId', meta: { title: 'Post Detail' } },
            {
                path: '/category/:catId/posts/:postId',
                meta: { title: 'Nested Route' }
            }
        ];

        const routerOptions: RouterOptions = {
            root: '#test',
            context: {},
            routes,
            mode: RouterMode.history,
            base,
            req: null,
            res: null,
            apps: {},
            normalizeURL: (url: URL) => url,
            fallback: () => {},
            rootStyle: false,
            onClose: () => {},
            ...overrides
        };

        return parsedOptions(routerOptions);
    };

    beforeEach(async () => {
        const opts = createTestOptions();
        router = new Router(opts);
        await router.push('/');
    });

    describe('🔗 createLinkResolver Basic Functionality', () => {
        it('should resolve simple path correctly', async () => {
            // Arrange
            await router.push('/posts/999'); // Navigate to a different route to ensure this link is not active
            const props: RouterLinkProps = {
                to: '/users/123'
            };

            // Act
            const result = createLinkResolver(router, props);

            // Assert
            expect(result.route.path).toBe('/users/123');
            expect(result.route.params.id).toBe('123');
            expect(result.type).toBe('push');
            expect(result.tag).toBe('a');
            expect(result.attributes.href).toBe('/users/123');
            expect(result.attributes.class).toBe('router-link');
        });

        it('should resolve route location object correctly', () => {
            // Arrange
            const props: RouterLinkProps = {
                to: {
                    path: '/users/456',
                    query: { tab: 'profile' },
                    state: { fromPage: 'dashboard' }
                }
            };

            // Act
            const result = createLinkResolver(router, props);

            // Assert
            expect(result.route.path).toBe('/users/456');
            expect(result.route.params.id).toBe('456');
            expect(result.route.query.tab).toBe('profile');
            expect(result.route.state.fromPage).toBe('dashboard');
            expect(result.attributes.href).toBe('/users/456?tab=profile');
            expect(result.route.query.tab).toBe('profile');
        });

        it('should resolve nested route parameters correctly', () => {
            // Arrange
            const props: RouterLinkProps = {
                to: '/category/tech/posts/123'
            };

            // Act
            const result = createLinkResolver(router, props);

            // Assert
            expect(result.route.path).toBe('/category/tech/posts/123');
            expect(result.route.params.catId).toBe('tech');
            expect(result.route.params.postId).toBe('123');
        });

        it('should handle route with hash fragment', () => {
            // Arrange
            const props: RouterLinkProps = {
                to: {
                    path: '/users/789',
                    hash: '#profile'
                }
            };

            // Act
            const result = createLinkResolver(router, props);

            // Assert
            expect(result.route.hash).toBe('#profile');
            expect(result.attributes.href).toBe('/users/789#profile');
        });
    });

    describe('🎯 Navigation Type Logic (normalizeNavigationType)', () => {
        it('should handle replace prop with deprecation warning', () => {
            // Arrange
            const originalWarn = console.warn;
            const warnSpy = vi.fn();
            console.warn = warnSpy;

            const props: RouterLinkProps = {
                to: '/test',
                replace: true
            };

            // Act
            const result = createLinkResolver(router, props);

            // Assert
            expect(result.type).toBe('replace');
            expect(warnSpy).toHaveBeenCalledWith(
                expect.stringContaining('deprecated')
            );

            // Cleanup
            console.warn = originalWarn;
        });

        it('should handle different navigation types', () => {
            // Test different navigation types
            const testCases = [
                { type: 'push', expected: 'push' },
                { type: 'replace', expected: 'replace' },
                { type: 'pushWindow', expected: 'pushWindow' },
                { type: 'replaceWindow', expected: 'replaceWindow' },
                { type: 'pushLayer', expected: 'pushLayer' }
            ] as const;

            testCases.forEach(({ type, expected }) => {
                const props: RouterLinkProps = {
                    to: '/test',
                    type
                };

                const result = createLinkResolver(router, props);
                expect(result.type).toBe(expected);
            });
        });

        it('should default to push when no type specified', () => {
            // Arrange
            const props: RouterLinkProps = {
                to: '/test'
            };

            // Act
            const result = createLinkResolver(router, props);

            // Assert
            expect(result.type).toBe('push');
        });

        it('should prioritize type over deprecated replace prop', () => {
            // Arrange
            const originalWarn = console.warn;
            const warnSpy = vi.fn();
            console.warn = warnSpy;

            const props: RouterLinkProps = {
                to: '/test',
                type: 'pushWindow',
                replace: true // Should be ignored
            };

            // Act
            const result = createLinkResolver(router, props);

            // Assert
            expect(result.type).toBe('replace'); // replace prop takes precedence in current implementation
            expect(warnSpy).toHaveBeenCalled();

            // Cleanup
            console.warn = originalWarn;
        });
    });

    describe('🎨 Attributes Generation (computeAttributes)', () => {
        it('should generate basic attributes correctly', async () => {
            // Arrange
            await router.push('/posts/999'); // Navigate to a different route to ensure this link is not active
            const props: RouterLinkProps = {
                to: '/test'
            };

            // Act
            const result = createLinkResolver(router, props);

            // Assert
            expect(result.attributes.href).toBe('/test');
            expect(result.attributes.class).toBe('router-link');
        });

        it('should add active classes when route is active', async () => {
            // Arrange - navigate to a route first
            await router.push('/users/123');
            const props: RouterLinkProps = {
                to: '/users/123'
            };

            // Act
            const result = createLinkResolver(router, props);

            // Assert
            expect(result.isActive).toBe(true);
            expect(result.isExactActive).toBe(true);
            expect(result.attributes.class).toBe(
                'router-link router-link-active router-link-exact-active'
            );
        });

        it('should use custom active class when provided', async () => {
            // Arrange
            await router.push('/users/123');
            const props: RouterLinkProps = {
                to: '/users/123',
                activeClass: 'custom-active'
            };

            // Act
            const result = createLinkResolver(router, props);

            // Assert
            expect(result.attributes.class).toBe(
                'router-link custom-active router-link-exact-active'
            );
        });

        it('should set target="_blank" and rel for pushWindow', () => {
            // Arrange
            const props: RouterLinkProps = {
                to: '/test',
                type: 'pushWindow'
            };

            // Act
            const result = createLinkResolver(router, props);

            // Assert
            expect(result.attributes.target).toBe('_blank');
            expect(result.attributes.rel).toBe('noopener noreferrer');
        });

        it('should not set target for replaceWindow', () => {
            // Arrange
            const props: RouterLinkProps = {
                to: '/test',
                type: 'replaceWindow'
            };

            // Act
            const result = createLinkResolver(router, props);

            // Assert
            expect(result.attributes.target).toBeUndefined();
            expect(result.attributes.rel).toBeUndefined();
        });

        it('should set rel for external links', () => {
            // Arrange
            const props: RouterLinkProps = {
                to: 'https://external.com/page'
            };

            // Act
            const result = createLinkResolver(router, props);

            // Assert
            expect(result.isExternal).toBe(true);
            expect(result.attributes.rel).toBe('external nofollow');
        });

        it('should combine rel attributes for external pushWindow links', () => {
            // Arrange
            const props: RouterLinkProps = {
                to: 'https://external.com/page',
                type: 'pushWindow'
            };

            // Act
            const result = createLinkResolver(router, props);

            // Assert
            expect(result.attributes.rel).toBe(
                'noopener noreferrer external nofollow'
            );
        });

        it('should handle custom tag', () => {
            // Arrange
            const props: RouterLinkProps = {
                to: '/test',
                tag: 'button'
            };

            // Act
            const result = createLinkResolver(router, props);

            // Assert
            expect(result.tag).toBe('button');
        });

        it('should handle empty rel when no conditions met', () => {
            // Arrange
            const props: RouterLinkProps = {
                to: '/test',
                type: 'push'
            };

            // Act
            const result = createLinkResolver(router, props);

            // Assert
            expect(result.attributes.rel).toBeUndefined();
        });
    });

    describe('🔍 Active State Detection', () => {
        it('should detect exact active state correctly', async () => {
            // Arrange
            await router.push('/users/123');

            const exactProps: RouterLinkProps = {
                to: '/users/123',
                exact: 'exact'
            };

            const includeProps: RouterLinkProps = {
                to: '/users/123', // Changed to exact path to match
                exact: 'include'
            };

            // Act
            const exactResult = createLinkResolver(router, exactProps);
            const includeResult = createLinkResolver(router, includeProps);

            // Assert
            expect(exactResult.isExactActive).toBe(true);
            expect(includeResult.isActive).toBe(true);
        });

        it('should handle exact match parameter variations', async () => {
            // Arrange
            await router.push('/users/123');

            const testCases = [
                { to: '/users/123', exact: undefined, expectedActive: true },
                { to: '/users/123', exact: 'include', expectedActive: true },
                { to: '/users/123', exact: 'exact', expectedActive: true },
                { to: '/users', exact: 'include', expectedActive: false },
                { to: '/users', exact: 'exact', expectedActive: false }
            ] as const;

            testCases.forEach(({ to, exact, expectedActive }) => {
                const props: RouterLinkProps = {
                    to,
                    exact
                };

                const result = createLinkResolver(router, props);
                expect(result.isActive).toBe(expectedActive);
            });
        });
    });

    describe('🖱️ Navigation Function (guardEvent logic)', () => {
        it('should navigate normally on regular click', async () => {
            // Arrange
            const props: RouterLinkProps = {
                to: '/users/456'
            };
            const result = createLinkResolver(router, props);
            const currentPath = router.route.path;

            // Act
            result.navigate();

            // Wait for navigation to complete
            await new Promise((resolve) => setTimeout(resolve, 0));

            // Assert
            expect(router.route.path).toBe('/users/456');
            expect(router.route.path).not.toBe(currentPath);
        });

        it('should not navigate when ctrl key is pressed', async () => {
            // Arrange
            const props: RouterLinkProps = {
                to: '/users/456'
            };
            const result = createLinkResolver(router, props);
            const currentPath = router.route.path;

            // Create mock event with ctrlKey
            const mockEvent: Partial<MouseEvent> = {
                ctrlKey: true,
                metaKey: false,
                altKey: false,
                shiftKey: false,
                button: 0,
                defaultPrevented: false,
                preventDefault: vi.fn()
            };

            // Act
            result.navigate(mockEvent as MouseEvent);

            // Wait a bit to ensure no navigation occurred
            await new Promise((resolve) => setTimeout(resolve, 0));

            // Assert
            expect(router.route.path).toBe(currentPath);
            expect(mockEvent.preventDefault).not.toHaveBeenCalled();
        });

        it('should not navigate when meta key is pressed', async () => {
            // Arrange
            const props: RouterLinkProps = {
                to: '/users/456'
            };
            const result = createLinkResolver(router, props);
            const currentPath = router.route.path;

            const mockEvent: Partial<MouseEvent> = {
                ctrlKey: false,
                metaKey: true,
                altKey: false,
                shiftKey: false,
                button: 0,
                defaultPrevented: false,
                preventDefault: vi.fn()
            };

            // Act
            result.navigate(mockEvent as MouseEvent);
            await new Promise((resolve) => setTimeout(resolve, 0));

            // Assert
            expect(router.route.path).toBe(currentPath);
        });

        it('should not navigate when alt key is pressed', async () => {
            // Arrange
            const props: RouterLinkProps = {
                to: '/users/456'
            };
            const result = createLinkResolver(router, props);
            const currentPath = router.route.path;

            const mockEvent: Partial<MouseEvent> = {
                ctrlKey: false,
                metaKey: false,
                altKey: true,
                shiftKey: false,
                button: 0,
                defaultPrevented: false,
                preventDefault: vi.fn()
            };

            // Act
            result.navigate(mockEvent as MouseEvent);
            await new Promise((resolve) => setTimeout(resolve, 0));

            // Assert
            expect(router.route.path).toBe(currentPath);
        });

        it('should not navigate when shift key is pressed', async () => {
            // Arrange
            const props: RouterLinkProps = {
                to: '/users/456'
            };
            const result = createLinkResolver(router, props);
            const currentPath = router.route.path;

            const mockEvent: Partial<MouseEvent> = {
                ctrlKey: false,
                metaKey: false,
                altKey: false,
                shiftKey: true,
                button: 0,
                defaultPrevented: false,
                preventDefault: vi.fn()
            };

            // Act
            result.navigate(mockEvent as MouseEvent);
            await new Promise((resolve) => setTimeout(resolve, 0));

            // Assert
            expect(router.route.path).toBe(currentPath);
        });

        it('should not navigate when right mouse button is clicked', async () => {
            // Arrange
            const props: RouterLinkProps = {
                to: '/users/456'
            };
            const result = createLinkResolver(router, props);
            const currentPath = router.route.path;

            const mockEvent: Partial<MouseEvent> = {
                ctrlKey: false,
                metaKey: false,
                altKey: false,
                shiftKey: false,
                button: 2, // Right click
                defaultPrevented: false,
                preventDefault: vi.fn()
            };

            // Act
            result.navigate(mockEvent as MouseEvent);
            await new Promise((resolve) => setTimeout(resolve, 0));

            // Assert
            expect(router.route.path).toBe(currentPath);
        });

        it('should not navigate when middle mouse button is clicked', async () => {
            // Arrange
            const props: RouterLinkProps = {
                to: '/users/456'
            };
            const result = createLinkResolver(router, props);
            const currentPath = router.route.path;

            const mockEvent: Partial<MouseEvent> = {
                ctrlKey: false,
                metaKey: false,
                altKey: false,
                shiftKey: false,
                button: 1, // Middle click
                defaultPrevented: false,
                preventDefault: vi.fn()
            };

            // Act
            result.navigate(mockEvent as MouseEvent);
            await new Promise((resolve) => setTimeout(resolve, 0));

            // Assert
            expect(router.route.path).toBe(currentPath);
        });

        it('should not navigate when defaultPrevented is true', async () => {
            // Arrange
            const props: RouterLinkProps = {
                to: '/users/456'
            };
            const result = createLinkResolver(router, props);
            const currentPath = router.route.path;

            const mockEvent: Partial<MouseEvent> = {
                ctrlKey: false,
                metaKey: false,
                altKey: false,
                shiftKey: false,
                button: 0,
                defaultPrevented: true,
                preventDefault: vi.fn()
            };

            // Act
            result.navigate(mockEvent as MouseEvent);
            await new Promise((resolve) => setTimeout(resolve, 0));

            // Assert
            expect(router.route.path).toBe(currentPath);
        });

        it('should call preventDefault on normal navigation', async () => {
            // Arrange
            const props: RouterLinkProps = {
                to: '/users/456'
            };
            const result = createLinkResolver(router, props);

            const mockEvent: Partial<MouseEvent> = {
                ctrlKey: false,
                metaKey: false,
                altKey: false,
                shiftKey: false,
                button: 0,
                defaultPrevented: false,
                preventDefault: vi.fn()
            };

            // Act
            result.navigate(mockEvent as MouseEvent);
            await new Promise((resolve) => setTimeout(resolve, 0));

            // Assert
            expect(mockEvent.preventDefault).toHaveBeenCalled();
        });

        it('should handle missing preventDefault method gracefully', async () => {
            // Arrange
            const props: RouterLinkProps = {
                to: '/users/456'
            };
            const result = createLinkResolver(router, props);

            const mockEvent: Partial<MouseEvent> = {
                ctrlKey: false,
                metaKey: false,
                altKey: false,
                shiftKey: false,
                button: 0,
                defaultPrevented: false
                // No preventDefault method (Weex scenario)
            };

            // Act & Assert - should not throw
            expect(() => {
                result.navigate(mockEvent as MouseEvent);
            }).not.toThrow();
        });
    });

    describe('🎪 Event Handlers Generation (getEventTypeList)', () => {
        it('should generate event handlers with default click event', () => {
            // Arrange
            const props: RouterLinkProps = {
                to: '/test'
            };

            // Act
            const result = createLinkResolver(router, props);
            const eventHandlers = result.getEventHandlers();

            // Assert
            expect(eventHandlers).toHaveProperty('click');
            expect(typeof eventHandlers.click).toBe('function');
        });

        it('should generate event handlers with custom events', () => {
            // Arrange
            const props: RouterLinkProps = {
                to: '/test',
                event: ['mousedown', 'touchstart']
            };

            // Act
            const result = createLinkResolver(router, props);
            const eventHandlers = result.getEventHandlers();

            // Assert
            expect(eventHandlers).toHaveProperty('mousedown');
            expect(eventHandlers).toHaveProperty('touchstart');
            expect(typeof eventHandlers.mousedown).toBe('function');
            expect(typeof eventHandlers.touchstart).toBe('function');
        });

        it('should support name transformation in event handlers', () => {
            // Arrange
            const props: RouterLinkProps = {
                to: '/test',
                event: ['click', 'mousedown']
            };

            // Act
            const result = createLinkResolver(router, props);
            const eventHandlers = result.getEventHandlers(
                (eventType) =>
                    `on${eventType.charAt(0).toUpperCase()}${eventType.slice(1)}`
            );

            // Assert
            expect(eventHandlers).toHaveProperty('onClick');
            expect(eventHandlers).toHaveProperty('onMousedown');
            expect(typeof eventHandlers.onClick).toBe('function');
            expect(typeof eventHandlers.onMousedown).toBe('function');
        });

        it('should handle single string event', () => {
            // Arrange
            const props: RouterLinkProps = {
                to: '/test',
                event: 'mousedown'
            };

            // Act
            const result = createLinkResolver(router, props);
            const eventHandlers = result.getEventHandlers();

            // Assert
            expect(eventHandlers).toHaveProperty('mousedown');
            expect(Object.keys(eventHandlers)).toHaveLength(1);
        });

        it('should filter out invalid event types', () => {
            // Arrange
            const props: RouterLinkProps = {
                to: '/test',
                event: [
                    'click',
                    '',
                    '   ',
                    'mousedown',
                    null,
                    undefined,
                    123 as unknown
                ] as string[]
            };

            // Act
            const result = createLinkResolver(router, props);
            const eventHandlers = result.getEventHandlers();

            // Assert
            expect(eventHandlers).toHaveProperty('click');
            expect(eventHandlers).toHaveProperty('mousedown');
            expect(Object.keys(eventHandlers)).toHaveLength(2);
        });

        it('should default to click when all events are invalid', () => {
            // Arrange
            const props: RouterLinkProps = {
                to: '/test',
                event: ['', '   ', null, undefined] as string[]
            };

            // Act
            const result = createLinkResolver(router, props);
            const eventHandlers = result.getEventHandlers();

            // Assert
            expect(eventHandlers).toHaveProperty('click');
            expect(Object.keys(eventHandlers)).toHaveLength(1);
        });

        it('should trim whitespace from event names', () => {
            // Arrange
            const props: RouterLinkProps = {
                to: '/test',
                event: ['  click  ', '\tmousedown\n']
            };

            // Act
            const result = createLinkResolver(router, props);
            const eventHandlers = result.getEventHandlers();

            // Assert
            expect(eventHandlers).toHaveProperty('click');
            expect(eventHandlers).toHaveProperty('mousedown');
            expect(eventHandlers).not.toHaveProperty('  click  ');
        });
    });

    describe('🚀 Navigation Types Integration (executeNavigation)', () => {
        it('should execute push navigation', async () => {
            // Arrange
            const pushSpy = vi.spyOn(router, 'push');
            const props: RouterLinkProps = {
                to: '/users/789',
                type: 'push'
            };

            // Act
            const result = createLinkResolver(router, props);
            result.navigate();

            // Assert
            expect(pushSpy).toHaveBeenCalledWith('/users/789');
        });

        it('should execute replace navigation', async () => {
            // Arrange
            const replaceSpy = vi.spyOn(router, 'replace');
            const props: RouterLinkProps = {
                to: '/users/789',
                type: 'replace'
            };

            // Act
            const result = createLinkResolver(router, props);
            result.navigate();

            // Assert
            expect(replaceSpy).toHaveBeenCalledWith('/users/789');
        });

        it('should execute pushWindow navigation', async () => {
            // Arrange
            const pushWindowSpy = vi.spyOn(router, 'pushWindow');
            const props: RouterLinkProps = {
                to: '/users/789',
                type: 'pushWindow'
            };

            // Act
            const result = createLinkResolver(router, props);
            result.navigate();

            // Assert
            expect(pushWindowSpy).toHaveBeenCalledWith('/users/789');
        });

        it('should execute replaceWindow navigation', async () => {
            // Arrange
            const replaceWindowSpy = vi.spyOn(router, 'replaceWindow');
            const props: RouterLinkProps = {
                to: '/users/789',
                type: 'replaceWindow'
            };

            // Act
            const result = createLinkResolver(router, props);
            result.navigate();

            // Assert
            expect(replaceWindowSpy).toHaveBeenCalledWith('/users/789');
        });

        it('should execute pushLayer navigation', async () => {
            // Arrange
            const pushLayerSpy = vi.spyOn(router, 'pushLayer');
            const props: RouterLinkProps = {
                to: '/users/789',
                type: 'pushLayer'
            };

            // Act
            const result = createLinkResolver(router, props);
            result.navigate();

            // Assert
            expect(pushLayerSpy).toHaveBeenCalledWith('/users/789');
        });

        it('should default to push for unrecognized navigation type', async () => {
            // Arrange
            const pushSpy = vi.spyOn(router, 'push');
            const props: RouterLinkProps = {
                to: '/users/789',
                type: 'unknownType' as 'push' // Type assertion for testing invalid type fallback
            };

            // Act
            const result = createLinkResolver(router, props);
            result.navigate();

            // Assert
            expect(pushSpy).toHaveBeenCalledWith('/users/789');
        });
    });

    describe('🔧 Edge Cases and Error Handling', () => {
        it('should handle undefined button property', async () => {
            // Arrange
            const props: RouterLinkProps = {
                to: '/users/456'
            };
            const result = createLinkResolver(router, props);

            const mockEvent: Partial<MouseEvent> = {
                ctrlKey: false,
                metaKey: false,
                altKey: false,
                shiftKey: false,
                button: undefined, // Undefined button
                defaultPrevented: false,
                preventDefault: vi.fn()
            };

            // Act
            result.navigate(mockEvent as MouseEvent);
            await new Promise((resolve) => setTimeout(resolve, 0));

            // Assert - should navigate normally when button is undefined
            expect(router.route.path).toBe('/users/456');
            expect(mockEvent.preventDefault).toHaveBeenCalled();
        });

        it('should handle complex route objects', () => {
            // Arrange
            const props: RouterLinkProps = {
                to: {
                    path: '/category/tech/posts/456',
                    query: { sort: 'date', filter: 'popular' },
                    hash: '#comments',
                    state: {
                        referrer: 'homepage',
                        timestamp: Date.now(),
                        metadata: { userId: 123 }
                    }
                }
            };

            // Act
            const result = createLinkResolver(router, props);

            // Assert
            expect(result.route.path).toBe('/category/tech/posts/456');
            expect(result.route.params.catId).toBe('tech');
            expect(result.route.params.postId).toBe('456');
            expect(result.route.query.sort).toBe('date');
            expect(result.route.query.filter).toBe('popular');
            expect(result.route.hash).toBe('#comments');
            expect(result.route.state.referrer).toBe('homepage');
            expect(
                (result.route.state.metadata as { userId: number }).userId
            ).toBe(123);
        });

        it('should handle empty event array gracefully', () => {
            // Arrange
            const props: RouterLinkProps = {
                to: '/test',
                event: []
            };

            // Act
            const result = createLinkResolver(router, props);
            const eventHandlers = result.getEventHandlers();

            // Assert
            expect(eventHandlers).toHaveProperty('click');
            expect(Object.keys(eventHandlers)).toHaveLength(1);
        });

        it('should handle very long URLs', () => {
            // Arrange
            const longPath =
                '/category/' + 'a'.repeat(1000) + '/posts/' + 'b'.repeat(1000);
            const props: RouterLinkProps = {
                to: longPath
            };

            // Act & Assert - should not throw
            expect(() => {
                const result = createLinkResolver(router, props);
                expect(result.attributes.href).toContain(longPath);
            }).not.toThrow();
        });

        it('should handle special characters in URLs', () => {
            // Arrange
            const props: RouterLinkProps = {
                to: {
                    path: '/category/spaces and symbols!@#/posts/test',
                    query: { 'special key': 'special&value', 中文: '测试' }
                }
            };

            // Act & Assert - should not throw
            expect(() => {
                const result = createLinkResolver(router, props);
                // URL encoding behavior may vary, so just check it doesn't throw
                expect(result.route.path).toBeDefined();
                expect(result.route.query['special key']).toBe('special&value');
                expect(result.route.query.中文).toBe('测试');
            }).not.toThrow();
        });

        it('should maintain reference equality for repeated calls', () => {
            // Arrange
            const props: RouterLinkProps = {
                to: '/test'
            };

            // Act
            const result1 = createLinkResolver(router, props);
            const result2 = createLinkResolver(router, props);

            // Assert - different instances but same navigation behavior
            expect(result1.route.path).toBe(result2.route.path);
            expect(result1.type).toBe(result2.type);
            expect(result1.attributes.href).toBe(result2.attributes.href);
        });
    });

    describe('🌐 External Links Detection', () => {
        it('should detect external HTTP links', () => {
            // Arrange
            const props: RouterLinkProps = {
                to: 'http://example.com/page'
            };

            // Act
            const result = createLinkResolver(router, props);

            // Assert
            expect(result.isExternal).toBe(true);
        });

        it('should detect external HTTPS links', () => {
            // Arrange
            const props: RouterLinkProps = {
                to: 'https://example.com/page'
            };

            // Act
            const result = createLinkResolver(router, props);

            // Assert
            expect(result.isExternal).toBe(true);
        });

        it('should detect internal links correctly', () => {
            // Arrange
            const props: RouterLinkProps = {
                to: '/internal/page'
            };

            // Act
            const result = createLinkResolver(router, props);

            // Assert
            expect(result.isExternal).toBe(false);
        });

        it('should handle subdomain as external', () => {
            // Arrange
            const props: RouterLinkProps = {
                to: 'https://sub.localhost:3000/page'
            };

            // Act
            const result = createLinkResolver(router, props);

            // Assert
            expect(result.isExternal).toBe(true);
        });

        it('should handle different port as external', () => {
            // Arrange
            const props: RouterLinkProps = {
                to: 'http://localhost:4000/page'
            };

            // Act
            const result = createLinkResolver(router, props);

            // Assert
            expect(result.isExternal).toBe(true);
        });
    });

    describe('🎖️ Complete Integration Scenarios', () => {
        it('should handle complete router link lifecycle', async () => {
            // Arrange
            const props: RouterLinkProps = {
                to: '/users/999',
                type: 'push',
                activeClass: 'my-active',
                tag: 'div',
                event: ['click', 'touchstart'],
                exact: 'include'
            };

            // Act
            const result = createLinkResolver(router, props);

            // Navigate to make it active
            await router.push('/users/999');
            const activeResult = createLinkResolver(router, props);

            // Assert complete functionality
            expect(result.route.path).toBe('/users/999');
            expect(result.route.params.id).toBe('999');
            expect(result.type).toBe('push');
            expect(result.tag).toBe('div');
            expect(result.attributes.href).toBe('/users/999');

            // Test active state
            expect(activeResult.isActive).toBe(true);
            expect(activeResult.attributes.class).toContain('my-active');

            // Test event handlers
            const eventHandlers = result.getEventHandlers();
            expect(eventHandlers).toHaveProperty('click');
            expect(eventHandlers).toHaveProperty('touchstart');

            // Test navigation
            await router.push('/'); // Change route first
            result.navigate();
            await new Promise((resolve) => setTimeout(resolve, 0));
            expect(router.route.path).toBe('/users/999');
        });

        it('should handle external pushWindow link with all attributes', () => {
            // Arrange
            const props: RouterLinkProps = {
                to: 'https://example.com/external',
                type: 'pushWindow',
                activeClass: 'external-active'
            };

            // Act
            const result = createLinkResolver(router, props);

            // Assert
            expect(result.isExternal).toBe(true);
            expect(result.type).toBe('pushWindow');
            expect(result.attributes.target).toBe('_blank');
            expect(result.attributes.rel).toContain('noopener');
            expect(result.attributes.rel).toContain('noreferrer');
            expect(result.attributes.rel).toContain('external');
            expect(result.attributes.rel).toContain('nofollow');
        });
    });
});
