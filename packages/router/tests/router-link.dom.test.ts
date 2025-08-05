/**
 * @vitest-environment happy-dom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Router } from '../src/router';
import { createLinkResolver } from '../src/router-link';
import type { RouterLinkProps, RouterLinkType } from '../src/types';
import { createRouter } from './util';

describe('router-link.ts - RouterLink DOM Environment Tests', () => {
    let router: Router;

    beforeEach(async () => {
        window.location.href = 'https://example.com/';

        router = createRouter({
            routes: [
                { path: '/', component: 'Home' },
                { path: '/about', component: 'About' },
                { path: '/user/:id', component: 'User' },
                { path: '/user/:id/profile', component: 'UserProfile' },
                { path: '/external', component: 'External' }
            ]
        });

        await router.push('/');
    });

    describe('🔗 createLinkResolver Basic Functionality', () => {
        it('should resolve basic string path link', () => {
            const props: RouterLinkProps = {
                to: '/about'
            };

            const result = createLinkResolver(router, props);

            expect(result.route.path).toBe('/about');
            expect(result.type).toBe('push');
            expect(result.tag).toBe('a');
            expect(result.attributes.href).toBe('https://example.com/about');
            expect(result.attributes.class).toBe('router-link');
            expect(result.isExternal).toBe(false);
        });

        it('should resolve route location object', () => {
            const props: RouterLinkProps = {
                to: {
                    path: '/user/123',
                    query: { tab: 'profile' },
                    hash: 'section1'
                }
            };

            const result = createLinkResolver(router, props);

            expect(result.route.path).toBe('/user/123');
            expect(result.route.params.id).toBe('123');
            expect(result.route.query.tab).toBe('profile');
            expect(result.route.url.hash).toBe('#section1');
            expect(result.attributes.href).toBe(
                'https://example.com/user/123?tab=profile#section1'
            );
        });

        it('should handle external URLs', () => {
            const props: RouterLinkProps = {
                to: 'https://google.com/search'
            };

            const result = createLinkResolver(router, props);

            expect(result.isExternal).toBe(true);
            expect(result.attributes.href).toBe('https://google.com/search');
            expect(result.attributes.rel).toBe('external nofollow');
        });

        it('should set custom tag', () => {
            const props: RouterLinkProps = {
                to: '/about',
                tag: 'button'
            };

            const result = createLinkResolver(router, props);

            expect(result.tag).toBe('button');
        });
    });

    describe('🎯 Navigation Type Handling', () => {
        it('should use default push type', () => {
            const props: RouterLinkProps = {
                to: '/about'
            };

            const result = createLinkResolver(router, props);

            expect(result.type).toBe('push');
        });

        it('should handle explicit type setting', () => {
            const linkTypes = [
                'push',
                'replace',
                'pushWindow',
                'replaceWindow',
                'pushLayer'
            ] as const;

            linkTypes.forEach((type) => {
                const props: RouterLinkProps = {
                    to: '/about',
                    type
                };

                const result = createLinkResolver(router, props);

                expect(result.type).toBe(type);
            });
        });

        it('should handle deprecated replace property with warning', () => {
            const consoleSpy = vi
                .spyOn(console, 'warn')
                .mockImplementation(() => {});
            const props: RouterLinkProps = {
                to: '/about',
                replace: true
            };

            const result = createLinkResolver(router, props);

            expect(result.type).toBe('replace');
            expect(consoleSpy).toHaveBeenCalledWith(
                expect.stringContaining(
                    '[RouterLink] The `replace` property is deprecated'
                )
            );
            consoleSpy.mockRestore();
        });

        it('should prioritize type over deprecated replace property', () => {
            const consoleSpy = vi
                .spyOn(console, 'warn')
                .mockImplementation(() => {});
            const props: RouterLinkProps = {
                to: '/about',
                type: 'push',
                replace: true
            };

            const result = createLinkResolver(router, props);

            expect(result.type).toBe('replace'); // replace prop takes precedence
            expect(consoleSpy).toHaveBeenCalled();
            consoleSpy.mockRestore();
        });
    });

    describe('🎨 CSS Class and Active State Handling', () => {
        it('should generate base CSS class', () => {
            const props: RouterLinkProps = {
                to: '/about'
            };

            const result = createLinkResolver(router, props);

            expect(result.attributes.class).toBe('router-link');
        });

        it('should add active class for active routes', async () => {
            await router.push('/user/123');
            const props: RouterLinkProps = {
                to: '/user/123'
            };

            const result = createLinkResolver(router, props);

            expect(result.isActive).toBe(true);
            expect(result.attributes.class).toBe(
                'router-link router-link-active router-link-exact-active'
            );
        });

        it('should add exact active class for exact matches', async () => {
            await router.push('/user/123');
            const props: RouterLinkProps = {
                to: '/user/123'
            };

            const result = createLinkResolver(router, props);

            expect(result.isExactActive).toBe(true);
            expect(result.attributes.class).toBe(
                'router-link router-link-active router-link-exact-active'
            );
        });

        it('should use custom active class', async () => {
            await router.push('/about');
            const props: RouterLinkProps = {
                to: '/about',
                activeClass: 'my-active-class'
            };

            const result = createLinkResolver(router, props);

            expect(result.attributes.class).toBe(
                'router-link my-active-class router-link-exact-active'
            );
        });

        it('should handle parent route matching', async () => {
            await router.push('/user/123/profile');

            const parentProps: RouterLinkProps = {
                to: '/user/123'
            };
            const exactProps: RouterLinkProps = {
                to: '/user/123/profile'
            };

            const parentResult = createLinkResolver(router, parentProps);
            const exactResult = createLinkResolver(router, exactProps);

            expect(parentResult.isActive).toBe(true);
            expect(parentResult.isExactActive).toBe(false);
            expect(exactResult.isActive).toBe(true);
            expect(exactResult.isExactActive).toBe(true);
        });
    });

    describe('🖱️ Event Handling', () => {
        it('should handle default click event', () => {
            const props: RouterLinkProps = {
                to: '/about'
            };

            const result = createLinkResolver(router, props);
            const handlers = result.getEventHandlers();

            expect(handlers).toHaveProperty('click');
            expect(typeof handlers.click).toBe('function');
        });

        it('should handle single custom event type', () => {
            const props: RouterLinkProps = {
                to: '/about',
                event: 'mousedown'
            };

            const result = createLinkResolver(router, props);
            const handlers = result.getEventHandlers();

            expect(handlers).toHaveProperty('mousedown');
            expect(typeof handlers.mousedown).toBe('function');
        });

        it('should handle multiple event types', () => {
            const props: RouterLinkProps = {
                to: '/about',
                event: ['click', 'keydown', 'touchstart']
            };

            const result = createLinkResolver(router, props);
            const handlers = result.getEventHandlers();

            expect(handlers).toHaveProperty('click');
            expect(handlers).toHaveProperty('keydown');
            expect(handlers).toHaveProperty('touchstart');
            expect(Object.keys(handlers)).toHaveLength(3);
        });

        it('should filter out invalid event types', () => {
            const props: RouterLinkProps = {
                to: '/about',
                event: ['click', 'keydown'] as string[]
            };

            const result = createLinkResolver(router, props);
            const handlers = result.getEventHandlers();

            expect(Object.keys(handlers)).toEqual(['click', 'keydown']);
        });

        it('should use name transform function for event handlers', () => {
            const props: RouterLinkProps = {
                to: '/about',
                event: ['click', 'keydown']
            };

            const result = createLinkResolver(router, props);
            const handlers = result.getEventHandlers(
                (eventType) =>
                    `on${eventType.charAt(0).toUpperCase() + eventType.slice(1)}`
            );

            expect(handlers).toHaveProperty('onClick');
            expect(handlers).toHaveProperty('onKeydown');
            expect(Object.keys(handlers)).toEqual(['onClick', 'onKeydown']);
        });

        it('should fallback to click when no valid events provided', () => {
            const props: RouterLinkProps = {
                to: '/about',
                event: [null, undefined, '', '  '] as string[]
            };

            const result = createLinkResolver(router, props);
            const handlers = result.getEventHandlers();

            expect(Object.keys(handlers)).toEqual(['click']);
        });

        it('should support React event naming convention', () => {
            const props: RouterLinkProps = {
                to: '/about',
                event: ['click', 'mouseenter']
            };
            const result = createLinkResolver(router, props);

            const handlers = result.getEventHandlers(
                (type) => `on${type.charAt(0).toUpperCase()}${type.slice(1)}`
            );

            expect(handlers).toHaveProperty('onClick');
            expect(handlers).toHaveProperty('onMouseenter');
            expect(typeof handlers.onClick).toBe('function');
            expect(typeof handlers.onMouseenter).toBe('function');
        });

        it('should support Vue event naming convention', () => {
            const props: RouterLinkProps = {
                to: '/about',
                event: ['click', 'mouseenter']
            };
            const result = createLinkResolver(router, props);

            const handlers = result.getEventHandlers(); // Default transform

            expect(handlers).toHaveProperty('click');
            expect(handlers).toHaveProperty('mouseenter');
            expect(typeof handlers.click).toBe('function');
            expect(typeof handlers.mouseenter).toBe('function');
        });
    });

    describe('🪟 Window Navigation Attributes', () => {
        it('should set target="_blank" for pushWindow', () => {
            const props: RouterLinkProps = {
                to: '/about',
                type: 'pushWindow'
            };

            const result = createLinkResolver(router, props);

            expect(result.attributes.target).toBe('_blank');
            expect(result.attributes.rel).toBe('noopener noreferrer');
        });

        it('should not set target for replaceWindow', () => {
            const props: RouterLinkProps = {
                to: '/about',
                type: 'replaceWindow'
            };

            const result = createLinkResolver(router, props);

            expect(result.attributes.target).toBeUndefined();
            expect(result.attributes.rel).toBeUndefined();
        });

        it('should combine window and external rel attributes', () => {
            const props: RouterLinkProps = {
                to: 'https://google.com',
                type: 'pushWindow'
            };

            const result = createLinkResolver(router, props);

            expect(result.attributes.rel).toBe(
                'noopener noreferrer external nofollow'
            );
        });
    });

    describe('🚀 Navigation Function', () => {
        it('should call router.push for push type', async () => {
            const routerPushSpy = vi
                .spyOn(router, 'push')
                .mockResolvedValue(router.route);
            const props: RouterLinkProps = {
                to: '/about',
                type: 'push'
            };

            const result = createLinkResolver(router, props);
            await result.navigate(new MouseEvent('click'));

            expect(routerPushSpy).toHaveBeenCalledWith('/about');
            routerPushSpy.mockRestore();
        });

        it('should call router.replace for replace type', async () => {
            const routerReplaceSpy = vi
                .spyOn(router, 'replace')
                .mockResolvedValue(router.route);
            const props: RouterLinkProps = {
                to: '/about',
                type: 'replace'
            };

            const result = createLinkResolver(router, props);
            await result.navigate(new MouseEvent('click'));

            expect(routerReplaceSpy).toHaveBeenCalledWith('/about');
            routerReplaceSpy.mockRestore();
        });

        it('should call router.pushWindow for pushWindow type', async () => {
            const routerPushWindowSpy = vi
                .spyOn(router, 'pushWindow')
                .mockResolvedValue(router.route);
            const props: RouterLinkProps = {
                to: '/about',
                type: 'pushWindow'
            };

            const result = createLinkResolver(router, props);
            await result.navigate(new MouseEvent('click'));

            expect(routerPushWindowSpy).toHaveBeenCalledWith('/about');
            routerPushWindowSpy.mockRestore();
        });

        it('should call router.replaceWindow for replaceWindow type', async () => {
            const routerReplaceWindowSpy = vi
                .spyOn(router, 'replaceWindow')
                .mockResolvedValue(router.route);
            const props: RouterLinkProps = {
                to: '/about',
                type: 'replaceWindow'
            };

            const result = createLinkResolver(router, props);
            await result.navigate(new MouseEvent('click'));

            expect(routerReplaceWindowSpy).toHaveBeenCalledWith('/about');
            routerReplaceWindowSpy.mockRestore();
        });

        it('should call router.pushLayer for pushLayer type', async () => {
            const routerPushLayerSpy = vi
                .spyOn(router, 'pushLayer')
                .mockResolvedValue({
                    type: 'close',
                    route: router.route
                });
            const props: RouterLinkProps = {
                to: '/about',
                type: 'pushLayer'
            };

            const result = createLinkResolver(router, props);
            await result.navigate(new MouseEvent('click'));

            expect(routerPushLayerSpy).toHaveBeenCalledWith('/about');
            routerPushLayerSpy.mockRestore();
        });

        it('should handle pushLayer with layer options', async () => {
            const routerPushLayerSpy = vi
                .spyOn(router, 'pushLayer')
                .mockResolvedValue({
                    type: 'close',
                    route: router.route
                });
            const layerOptions = { zIndex: 1000 };
            const props: RouterLinkProps = {
                to: '/about',
                type: 'pushLayer',
                layerOptions
            };

            const result = createLinkResolver(router, props);
            await result.navigate(new MouseEvent('click'));

            expect(routerPushLayerSpy).toHaveBeenCalledWith({
                path: '/about',
                layer: layerOptions
            });
            routerPushLayerSpy.mockRestore();
        });

        it('should handle pushLayer with object route and layer options', async () => {
            const routerPushLayerSpy = vi
                .spyOn(router, 'pushLayer')
                .mockResolvedValue({
                    type: 'close',
                    route: router.route
                });
            const layerOptions = { zIndex: 1000 };
            const props: RouterLinkProps = {
                to: { path: '/about', query: { tab: 'info' } },
                type: 'pushLayer',
                layerOptions
            };

            const result = createLinkResolver(router, props);
            await result.navigate(new MouseEvent('click'));

            expect(routerPushLayerSpy).toHaveBeenCalledWith({
                path: '/about',
                query: { tab: 'info' },
                layer: layerOptions
            });
            routerPushLayerSpy.mockRestore();
        });

        it('should handle complex layer options', async () => {
            const props: RouterLinkProps = {
                to: {
                    path: '/user/123',
                    query: { tab: 'profile' }
                },
                type: 'pushLayer',
                layerOptions: {
                    zIndex: 1000,
                    autoPush: true,
                    push: true,
                    routerOptions: {
                        routes: [
                            { path: '/user/:id', component: 'UserProfile' }
                        ]
                    }
                }
            };

            const result = createLinkResolver(router, props);
            const routerPushLayerSpy = vi
                .spyOn(router, 'pushLayer')
                .mockResolvedValue({
                    type: 'close',
                    route: router.route
                });

            await result.navigate(new MouseEvent('click'));

            expect(routerPushLayerSpy).toHaveBeenCalledWith({
                path: '/user/123',
                query: { tab: 'profile' },
                layer: {
                    zIndex: 1000,
                    autoPush: true,
                    push: true,
                    routerOptions: {
                        routes: [
                            { path: '/user/:id', component: 'UserProfile' }
                        ]
                    }
                }
            });
            routerPushLayerSpy.mockRestore();
        });

        it('should fallback to push for unknown type', async () => {
            const routerPushSpy = vi
                .spyOn(router, 'push')
                .mockResolvedValue(router.route);
            const props: RouterLinkProps = {
                to: '/about',
                type: 'unknown' as RouterLinkType
            };

            const result = createLinkResolver(router, props);
            await result.navigate(new MouseEvent('click'));

            expect(routerPushSpy).toHaveBeenCalledWith('/about');
            routerPushSpy.mockRestore();
        });
    });

    describe('🛡️ Mouse Event Guard', () => {
        // Create a real MouseEvent in happy-dom environment
        function createMouseEvent(
            props: {
                metaKey?: boolean;
                altKey?: boolean;
                ctrlKey?: boolean;
                shiftKey?: boolean;
                button?: number;
            } = {}
        ): MouseEvent {
            return new MouseEvent('click', {
                metaKey: props.metaKey || false,
                altKey: props.altKey || false,
                ctrlKey: props.ctrlKey || false,
                shiftKey: props.shiftKey || false,
                button: props.button !== undefined ? props.button : 0,
                bubbles: true,
                cancelable: true
            });
        }

        it('should prevent navigation when metaKey is pressed', async () => {
            const routerPushSpy = vi
                .spyOn(router, 'push')
                .mockResolvedValue(router.route);
            const props: RouterLinkProps = { to: '/about' };
            const result = createLinkResolver(router, props);
            const event = createMouseEvent({ metaKey: true });

            await result.navigate(event);

            expect(routerPushSpy).not.toHaveBeenCalled();
            routerPushSpy.mockRestore();
        });

        it('should prevent navigation when ctrlKey is pressed', async () => {
            const routerPushSpy = vi
                .spyOn(router, 'push')
                .mockResolvedValue(router.route);
            const props: RouterLinkProps = { to: '/about' };
            const result = createLinkResolver(router, props);
            const event = createMouseEvent({ ctrlKey: true });

            await result.navigate(event);

            expect(routerPushSpy).not.toHaveBeenCalled();
            routerPushSpy.mockRestore();
        });

        it('should prevent navigation when altKey is pressed', async () => {
            const routerPushSpy = vi
                .spyOn(router, 'push')
                .mockResolvedValue(router.route);
            const props: RouterLinkProps = { to: '/about' };
            const result = createLinkResolver(router, props);
            const event = createMouseEvent({ altKey: true });

            await result.navigate(event);

            expect(routerPushSpy).not.toHaveBeenCalled();
            routerPushSpy.mockRestore();
        });

        it('should prevent navigation when shiftKey is pressed', async () => {
            const routerPushSpy = vi
                .spyOn(router, 'push')
                .mockResolvedValue(router.route);
            const props: RouterLinkProps = { to: '/about' };
            const result = createLinkResolver(router, props);
            const event = createMouseEvent({ shiftKey: true });

            await result.navigate(event);

            expect(routerPushSpy).not.toHaveBeenCalled();
            routerPushSpy.mockRestore();
        });

        it('should prevent navigation when defaultPrevented is true', async () => {
            const routerPushSpy = vi
                .spyOn(router, 'push')
                .mockResolvedValue(router.route);
            const props: RouterLinkProps = { to: '/about' };
            const result = createLinkResolver(router, props);
            const event = createMouseEvent();
            event.preventDefault(); // Make defaultPrevented true

            await result.navigate(event);

            expect(routerPushSpy).not.toHaveBeenCalled();
            routerPushSpy.mockRestore();
        });

        it('should prevent navigation on right click (button !== 0)', async () => {
            const routerPushSpy = vi
                .spyOn(router, 'push')
                .mockResolvedValue(router.route);
            const props: RouterLinkProps = { to: '/about' };
            const result = createLinkResolver(router, props);
            const event = createMouseEvent({ button: 2 }); // Right click

            await result.navigate(event);

            expect(routerPushSpy).not.toHaveBeenCalled();
            routerPushSpy.mockRestore();
        });

        it('should allow navigation on left click with no modifier keys', async () => {
            const routerPushSpy = vi
                .spyOn(router, 'push')
                .mockResolvedValue(router.route);
            const props: RouterLinkProps = { to: '/about' };
            const result = createLinkResolver(router, props);
            const event = createMouseEvent({
                button: 0,
                metaKey: false,
                ctrlKey: false,
                altKey: false,
                shiftKey: false
            });

            await result.navigate(event);

            expect(routerPushSpy).toHaveBeenCalledWith('/about');
            routerPushSpy.mockRestore();
        });

        it('should call preventDefault on valid events', async () => {
            const props: RouterLinkProps = { to: '/about' };
            const result = createLinkResolver(router, props);
            const event = createMouseEvent();
            const preventDefaultSpy = vi.spyOn(event, 'preventDefault');

            await result.navigate(event);

            expect(preventDefaultSpy).toHaveBeenCalled();
            preventDefaultSpy.mockRestore();
        });

        it('should handle event without preventDefault method (Weex compatibility)', async () => {
            const routerPushSpy = vi
                .spyOn(router, 'push')
                .mockResolvedValue(router.route);
            const props: RouterLinkProps = { to: '/about' };
            const result = createLinkResolver(router, props);

            const event = new MouseEvent('click', {
                metaKey: false,
                altKey: false,
                ctrlKey: false,
                shiftKey: false,
                button: 0,
                bubbles: true,
                cancelable: true
            });
            Object.defineProperty(event, 'preventDefault', {
                value: undefined
            });

            await result.navigate(event);

            expect(routerPushSpy).toHaveBeenCalledWith('/about');
            routerPushSpy.mockRestore();
        });

        it('should work without event parameter', async () => {
            const routerPushSpy = vi
                .spyOn(router, 'push')
                .mockResolvedValue(router.route);
            const props: RouterLinkProps = { to: '/about' };
            const result = createLinkResolver(router, props);

            await result.navigate(new MouseEvent('click'));

            expect(routerPushSpy).toHaveBeenCalledWith('/about');
            routerPushSpy.mockRestore();
        });
    });

    describe('🔄 Integration Tests', () => {
        it('should integrate all features correctly', async () => {
            await router.push('/user/123');
            const consoleSpy = vi
                .spyOn(console, 'warn')
                .mockImplementation(() => {});

            const props: RouterLinkProps = {
                to: '/user/123',
                replace: true, // Test deprecated prop
                activeClass: 'custom-active',
                event: ['click', 'keydown'],
                tag: 'button'
            };

            const result = createLinkResolver(router, props);
            const handlers = result.getEventHandlers(
                (name) => `on${name.charAt(0).toUpperCase() + name.slice(1)}`
            );

            expect(result.type).toBe('replace');
            expect(result.tag).toBe('button');
            expect(result.isActive).toBe(true);
            expect(result.isExactActive).toBe(true);
            expect(result.attributes.class).toBe(
                'router-link custom-active router-link-exact-active'
            );
            expect(handlers).toHaveProperty('onClick');
            expect(handlers).toHaveProperty('onKeydown');
            expect(consoleSpy).toHaveBeenCalledWith(
                expect.stringContaining(
                    '[RouterLink] The `replace` property is deprecated'
                )
            );

            consoleSpy.mockRestore();
        });

        it('should handle complex routing scenarios', async () => {
            const complexRoute = {
                path: '/user/456',
                query: { tab: 'settings', mode: 'edit' },
                hash: 'profile-section',
                state: { previousPage: 'dashboard' }
            };

            const props: RouterLinkProps = {
                to: complexRoute,
                type: 'pushLayer',
                layerOptions: { zIndex: 1500, autoPush: false }
            };

            const result = createLinkResolver(router, props);

            expect(result.route.path).toBe('/user/456');
            expect(result.route.params.id).toBe('456');
            expect(result.route.query.tab).toBe('settings');
            expect(result.route.query.mode).toBe('edit');
            expect(result.route.url.hash).toBe('#profile-section');
            expect(result.type).toBe('pushLayer');
            expect(result.attributes.href).toBe(
                'https://example.com/user/456?tab=settings&mode=edit#profile-section'
            );
        });

        it('should properly handle exact matching with different route configurations', async () => {
            await router.push('/user/123/profile');

            const exactSameRoute = createLinkResolver(router, {
                to: '/user/123/profile'
            });
            expect(exactSameRoute.isActive).toBe(true);
            expect(exactSameRoute.isExactActive).toBe(true);

            const differentUserRoute = createLinkResolver(router, {
                to: '/user/456/profile'
            });
            expect(differentUserRoute.isActive).toBe(false);
            expect(differentUserRoute.isExactActive).toBe(false);

            const differentRoute = createLinkResolver(router, { to: '/about' });
            expect(differentRoute.isActive).toBe(false);
            expect(differentRoute.isExactActive).toBe(false);
        });
    });

    describe('🧪 Edge Cases and Error Handling', () => {
        it('should handle empty string as route', () => {
            const props: RouterLinkProps = {
                to: ''
            };

            const result = createLinkResolver(router, props);

            expect(result.route.path).toBe('/');
            expect(result.attributes.href).toBe('https://example.com/');
        });

        it('should handle undefined and null values gracefully', () => {
            const props: RouterLinkProps = {
                to: '/about',
                activeClass: undefined,
                event: undefined,
                tag: undefined
            };

            const result = createLinkResolver(router, props);
            const handlers = result.getEventHandlers();

            expect(result.tag).toBe('a'); // Default value
            expect(Object.keys(handlers)).toEqual(['click']); // Default event
            expect(result.attributes.class).toBe('router-link'); // No custom active class
        });

        it('should handle route with special characters', () => {
            const props: RouterLinkProps = {
                to: '/user/测试用户/profile?search=测试&type=用户'
            };

            const result = createLinkResolver(router, props);

            // URLs are encoded, so we check for encoded characters
            expect(result.attributes.href).toContain(
                '%E6%B5%8B%E8%AF%95%E7%94%A8%E6%88%B7'
            ); // 测试用户
            expect(result.attributes.href).toContain(
                'search=%E6%B5%8B%E8%AF%95'
            ); // search=测试
        });

        it('should handle very long event arrays', () => {
            const manyEvents = Array.from(
                { length: 100 },
                (_, i) => `event${i}`
            );
            const props: RouterLinkProps = {
                to: '/about',
                event: manyEvents
            };

            const result = createLinkResolver(router, props);
            const handlers = result.getEventHandlers();

            expect(Object.keys(handlers)).toHaveLength(100);
            expect(handlers).toHaveProperty('event0');
            expect(handlers).toHaveProperty('event99');
        });

        it('should handle protocol-relative URLs correctly', () => {
            const props: RouterLinkProps = {
                to: '//google.com/path'
            };

            const result = createLinkResolver(router, props);

            expect(result.isExternal).toBe(true);
            expect(result.attributes.href).toBe('https://google.com/path');
            expect(result.attributes.rel).toContain('external');
        });

        it('should handle protocol-relative URLs to same domain as internal', () => {
            const props: RouterLinkProps = {
                to: '//example.com/path'
            };

            const result = createLinkResolver(router, props);

            expect(result.isExternal).toBe(false);
            expect(result.attributes.href).toBe('https://example.com/path');
            expect(result.attributes.rel).toBeUndefined();
        });

        it('should handle root-relative URLs correctly', () => {
            const props: RouterLinkProps = {
                to: '/absolute/path'
            };

            const result = createLinkResolver(router, props);

            expect(result.isExternal).toBe(false);
            expect(result.attributes.href).toBe(
                'https://example.com/absolute/path'
            );
        });
    });

    afterEach(() => {
        router.destroy();
    });
});
