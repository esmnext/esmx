import type { RouteConfig } from '@esmx/router';
import { Router, RouterMode } from '@esmx/router';
/**
 * @vitest-environment happy-dom
 */
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createApp, defineComponent, h, nextTick } from 'vue';
import { RouterLink } from './router-link';
import { useProvideRouter } from './use';

describe('router-link.ts - RouterLink Component', () => {
    let router: Router;
    let app: ReturnType<typeof createApp>;
    let container: HTMLElement;

    beforeEach(async () => {
        // Create DOM container
        container = document.createElement('div');
        container.id = 'test-app';
        document.body.appendChild(container);

        // Create test routes
        const routes: RouteConfig[] = [
            {
                path: '/',
                component: defineComponent({
                    name: 'Home',
                    template: '<div>Home Page</div>'
                }),
                meta: { title: 'Home' }
            },
            {
                path: '/about',
                component: defineComponent({
                    name: 'About',
                    template: '<div>About Page</div>'
                }),
                meta: { title: 'About' }
            },
            {
                path: '/contact',
                component: defineComponent({
                    name: 'Contact',
                    template: '<div>Contact Page</div>'
                }),
                meta: { title: 'Contact' }
            }
        ];

        // Create router instance
        router = new Router({
            root: '#test-app',
            routes,
            mode: RouterMode.memory,
            base: new URL('http://localhost:8000/')
        });

        // Initialize router and wait for it to be ready
        await router.replace('/');
        await nextTick();
    });

    afterEach(async () => {
        // Clean up
        if (app) {
            app.unmount();
        }
        if (router) {
            try {
                // Wait for any pending navigation to complete before destroying
                await new Promise((resolve) => setTimeout(resolve, 0));
                router.destroy();
            } catch (error) {
                // Ignore router destruction errors, as they might be expected
                // when navigation tasks are cancelled during cleanup
                if (
                    !(error instanceof Error) ||
                    !error.message.includes('RouteTaskCancelledError')
                ) {
                    console.warn('Router destruction error:', error);
                }
            }
        }
        if (container.parentNode) {
            container.parentNode.removeChild(container);
        }
        // Wait for cleanup
        await nextTick();
    });

    describe('Component Definition', () => {
        it('should have correct component name', () => {
            expect(RouterLink.name).toBe('RouterLink');
        });

        it('should have properly configured props', () => {
            const props = RouterLink.props;

            // Verify required props
            expect(props.to).toBeDefined();
            expect(props.to.required).toBe(true);

            // Verify default values
            expect(props.type).toBeDefined();
            expect(props.type.default).toBe('push');

            expect(props.exact).toBeDefined();
            expect(props.exact.default).toBe('include');

            expect(props.tag).toBeDefined();
            expect(props.tag.default).toBe('a');

            expect(props.event).toBeDefined();
            expect(props.event.default).toBe('click');

            expect(props.replace).toBeDefined();
            expect(props.replace.default).toBe(false);
        });

        it('should have setup function defined', () => {
            expect(RouterLink.setup).toBeDefined();
            expect(typeof RouterLink.setup).toBe('function');
        });
    });

    describe('Component Rendering', () => {
        it('should render basic router link', async () => {
            const TestApp = defineComponent({
                setup() {
                    useProvideRouter(router);
                    return () =>
                        h(RouterLink, { to: '/about' }, () => 'About Link');
                }
            });

            app = createApp(TestApp);
            app.mount(container);
            await nextTick();

            const linkElement = container.querySelector('a');
            expect(linkElement).toBeTruthy();
            expect(linkElement?.textContent).toBe('About Link');
        });

        it('should render router link with custom attributes', async () => {
            const TestApp = defineComponent({
                setup() {
                    useProvideRouter(router);
                    return () =>
                        h(
                            RouterLink,
                            {
                                to: '/about',
                                'data-test': 'custom-attr',
                                title: 'Custom Title'
                            },
                            () => 'Link with Attributes'
                        );
                }
            });

            app = createApp(TestApp);
            app.mount(container);
            await nextTick();

            const linkElement = container.querySelector('a');
            expect(linkElement).toBeTruthy();
            expect(linkElement?.getAttribute('data-test')).toBe('custom-attr');
            expect(linkElement?.getAttribute('title')).toBe('Custom Title');
        });

        it('should render with custom tag', async () => {
            const TestApp = defineComponent({
                setup() {
                    useProvideRouter(router);
                    return () =>
                        h(
                            RouterLink,
                            {
                                to: '/contact',
                                tag: 'button'
                            },
                            () => 'Contact Button'
                        );
                }
            });

            app = createApp(TestApp);
            app.mount(container);
            await nextTick();

            const buttonElement = container.querySelector('button');
            expect(buttonElement).toBeTruthy();
            expect(buttonElement?.textContent).toBe('Contact Button');
        });

        it('should render with active class when route matches', async () => {
            // Navigate to /about first and wait for completion
            await router.push('/about');
            await nextTick();

            const TestApp = defineComponent({
                setup() {
                    useProvideRouter(router);
                    return () =>
                        h(
                            RouterLink,
                            {
                                to: '/about',
                                activeClass: 'active-link'
                            },
                            () => 'Current Page'
                        );
                }
            });

            app = createApp(TestApp);
            app.mount(container);
            await nextTick();

            const linkElement = container.querySelector('a');
            expect(linkElement).toBeTruthy();
            expect(linkElement?.classList.contains('active-link')).toBe(true);
        });

        it('should handle different navigation types', async () => {
            const TestApp = defineComponent({
                setup() {
                    useProvideRouter(router);
                    return () =>
                        h('div', [
                            h(
                                RouterLink,
                                {
                                    to: '/about',
                                    type: 'push'
                                },
                                () => 'Push Link'
                            ),
                            h(
                                RouterLink,
                                {
                                    to: '/contact',
                                    type: 'replace'
                                },
                                () => 'Replace Link'
                            )
                        ]);
                }
            });

            app = createApp(TestApp);
            app.mount(container);
            await nextTick();

            const links = container.querySelectorAll('a');
            expect(links).toHaveLength(2);
            expect(links[0]?.textContent).toBe('Push Link');
            expect(links[1]?.textContent).toBe('Replace Link');
        });
    });

    describe('Navigation Functionality', () => {
        it('should navigate when clicked', async () => {
            const TestApp = defineComponent({
                setup() {
                    useProvideRouter(router);
                    return () =>
                        h(
                            RouterLink,
                            { to: '/about' },
                            () => 'Navigate to About'
                        );
                }
            });

            app = createApp(TestApp);
            app.mount(container);
            await nextTick();

            const linkElement = container.querySelector('a');
            expect(linkElement).toBeTruthy();

            // Simulate click and wait for navigation
            const clickPromise = new Promise<void>((resolve) => {
                router.afterEach(() => resolve());
            });

            linkElement?.click();
            await clickPromise;
            await nextTick();

            // Check if navigation occurred
            expect(router.route.path).toBe('/about');
        });

        it('should handle custom events', async () => {
            const TestApp = defineComponent({
                setup() {
                    useProvideRouter(router);
                    return () =>
                        h(
                            RouterLink,
                            {
                                to: '/contact',
                                event: 'mouseenter'
                            },
                            () => 'Hover to Navigate'
                        );
                }
            });

            app = createApp(TestApp);
            app.mount(container);
            await nextTick();

            const linkElement = container.querySelector('a');
            expect(linkElement).toBeTruthy();

            // Simulate mouseenter event and wait for navigation
            const navigationPromise = new Promise<void>((resolve) => {
                router.afterEach(() => resolve());
            });

            const event = new MouseEvent('mouseenter', { bubbles: true });
            linkElement?.dispatchEvent(event);
            await navigationPromise;
            await nextTick();

            // Check if navigation occurred
            expect(router.route.path).toBe('/contact');
        });

        it('should handle object-based route navigation', async () => {
            const TestApp = defineComponent({
                setup() {
                    useProvideRouter(router);
                    return () =>
                        h(
                            RouterLink,
                            {
                                to: { path: '/about', query: { tab: 'info' } }
                            },
                            () => 'About with Query'
                        );
                }
            });

            app = createApp(TestApp);
            app.mount(container);
            await nextTick();

            const linkElement = container.querySelector('a');
            expect(linkElement).toBeTruthy();

            // Simulate click and wait for navigation
            const navigationPromise = new Promise<void>((resolve) => {
                router.afterEach(() => resolve());
            });

            linkElement?.click();
            await navigationPromise;
            await nextTick();

            // Check if navigation occurred with query
            expect(router.route.path).toBe('/about');
            expect(router.route.query.tab).toBe('info');
        });

        it('should handle custom navigation handler', async () => {
            let customHandlerCalled = false;
            let receivedEventName = '';
            const TestApp = defineComponent({
                setup() {
                    useProvideRouter(router);
                    return () =>
                        h(
                            RouterLink,
                            {
                                to: '/about',
                                beforeNavigate: (
                                    event: Event,
                                    eventName: string
                                ) => {
                                    customHandlerCalled = true;
                                    receivedEventName = eventName;
                                    event.preventDefault();
                                }
                            },
                            () => 'Custom Handler Link'
                        );
                }
            });

            app = createApp(TestApp);
            app.mount(container);
            await nextTick();

            const linkElement = container.querySelector('a');
            expect(linkElement).toBeTruthy();

            // Simulate click
            linkElement?.click();
            await nextTick();

            // Check if custom handler was called with correct event name
            expect(customHandlerCalled).toBe(true);
            expect(receivedEventName).toBe('click');
        });
    });

    describe('Props Validation', () => {
        it('should accept string as to prop', async () => {
            const TestApp = defineComponent({
                setup() {
                    useProvideRouter(router);
                    return () =>
                        h(RouterLink, { to: '/about' }, () => 'String Route');
                }
            });

            expect(() => {
                app = createApp(TestApp);
                app.mount(container);
            }).not.toThrow();
        });

        it('should accept object as to prop', async () => {
            const TestApp = defineComponent({
                setup() {
                    useProvideRouter(router);
                    return () =>
                        h(
                            RouterLink,
                            {
                                to: { path: '/contact' }
                            },
                            () => 'Object Route'
                        );
                }
            });

            expect(() => {
                app = createApp(TestApp);
                app.mount(container);
            }).not.toThrow();
        });

        it('should handle array of events', async () => {
            const TestApp = defineComponent({
                setup() {
                    useProvideRouter(router);
                    return () =>
                        h(
                            RouterLink,
                            {
                                to: '/about',
                                event: ['click', 'keydown']
                            },
                            () => 'Multi Event Link'
                        );
                }
            });

            app = createApp(TestApp);
            app.mount(container);
            await nextTick();

            const linkElement = container.querySelector('a');
            expect(linkElement).toBeTruthy();

            // Test click event
            const clickPromise = new Promise<void>((resolve) => {
                router.afterEach(() => resolve());
            });

            linkElement?.click();
            await clickPromise;
            await nextTick();
            expect(router.route.path).toBe('/about');

            // Reset route and test keydown event
            await router.push('/');
            await nextTick();

            const keydownPromise = new Promise<void>((resolve) => {
                router.afterEach(() => resolve());
            });

            const keyEvent = new KeyboardEvent('keydown', { key: 'Enter' });
            linkElement?.dispatchEvent(keyEvent);
            await keydownPromise;
            await nextTick();
            expect(router.route.path).toBe('/about');
        });
    });

    describe('Error Handling', () => {
        it('should throw error when router context is missing', () => {
            const TestApp = defineComponent({
                setup() {
                    // No useProvideRouter call - missing router context
                    return () =>
                        h(RouterLink, { to: '/about' }, () => 'No Router');
                }
            });

            expect(() => {
                app = createApp(TestApp);
                app.mount(container);
            }).toThrow();
        });
    });

    describe('Slot Rendering', () => {
        it('should render default slot content', async () => {
            const TestApp = defineComponent({
                setup() {
                    useProvideRouter(router);
                    return () =>
                        h(
                            RouterLink,
                            { to: '/about' },
                            {
                                default: () =>
                                    h(
                                        'span',
                                        { class: 'link-text' },
                                        'Custom Content'
                                    )
                            }
                        );
                }
            });

            app = createApp(TestApp);
            app.mount(container);
            await nextTick();

            const spanElement = container.querySelector('span.link-text');
            expect(spanElement).toBeTruthy();
            expect(spanElement?.textContent).toBe('Custom Content');
        });

        it('should render complex slot content', async () => {
            const TestApp = defineComponent({
                setup() {
                    useProvideRouter(router);
                    return () =>
                        h(
                            RouterLink,
                            { to: '/contact' },
                            {
                                default: () => [
                                    h('i', { class: 'icon' }, '→'),
                                    h('span', 'Contact Us')
                                ]
                            }
                        );
                }
            });

            app = createApp(TestApp);
            app.mount(container);
            await nextTick();

            const iconElement = container.querySelector('i.icon');
            const spanElement = container.querySelector('span');
            expect(iconElement).toBeTruthy();
            expect(spanElement).toBeTruthy();
            expect(iconElement?.textContent).toBe('→');
            expect(spanElement?.textContent).toBe('Contact Us');
        });
    });

    describe('Active State Management', () => {
        it('should apply active class with exact matching', async () => {
            // Navigate to exact route and wait for completion
            await router.push('/about');
            await nextTick();

            const TestApp = defineComponent({
                setup() {
                    useProvideRouter(router);
                    return () =>
                        h('div', [
                            h(
                                RouterLink,
                                {
                                    to: '/about',
                                    exact: 'exact',
                                    activeClass: 'exact-active'
                                },
                                () => 'Exact Match'
                            ),
                            h(
                                RouterLink,
                                {
                                    to: '/about/sub',
                                    exact: 'exact',
                                    activeClass: 'exact-active'
                                },
                                () => 'Not Exact'
                            )
                        ]);
                }
            });

            app = createApp(TestApp);
            app.mount(container);
            await nextTick();

            const links = container.querySelectorAll('a');
            expect(links[0]?.classList.contains('exact-active')).toBe(true);
            expect(links[1]?.classList.contains('exact-active')).toBe(false);
        });

        it('should apply active class with include matching', async () => {
            // Navigate to a route and wait for completion
            await router.push('/about');
            await nextTick();

            const TestApp = defineComponent({
                setup() {
                    useProvideRouter(router);
                    return () =>
                        h(
                            RouterLink,
                            {
                                to: '/about',
                                exact: 'include',
                                activeClass: 'include-active'
                            },
                            () => 'Include Match'
                        );
                }
            });

            app = createApp(TestApp);
            app.mount(container);
            await nextTick();

            const linkElement = container.querySelector('a');
            // Should be active because current route '/about' matches exactly
            expect(linkElement?.classList.contains('include-active')).toBe(
                true
            );
        });
    });
});
