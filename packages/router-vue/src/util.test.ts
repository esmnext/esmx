/**
 * @vitest-environment happy-dom
 */

import type { Route, Router } from '@esmx/router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { computed, nextTick, ref, version } from 'vue';
import {
    createDependentProxy,
    createSymbolProperty,
    defineRouterProperties,
    isESModule,
    isVue2,
    resolveComponent
} from './util';

describe('util.ts - Utility Functions', () => {
    describe('isVue2', () => {
        it('should correctly identify Vue 2', () => {
            expect(isVue2).toBe(version.startsWith('2.'));
            expect(typeof isVue2).toBe('boolean');
        });

        it('should be consistent with Vue version check', () => {
            const expectedResult = version.startsWith('2.');
            expect(isVue2).toBe(expectedResult);
        });
    });

    describe('createSymbolProperty', () => {
        let testSymbol: symbol;
        let symbolProperty: ReturnType<typeof createSymbolProperty>;
        let testInstance: Record<string | symbol, unknown>;

        beforeEach(() => {
            testSymbol = Symbol('test-symbol');
            symbolProperty = createSymbolProperty<string>(testSymbol);
            testInstance = {};
        });

        describe('set method', () => {
            it('should set value using symbol as key', () => {
                const testValue = 'test-value';

                symbolProperty.set(testInstance, testValue);

                expect(testInstance[testSymbol]).toBe(testValue);
            });

            it('should handle different value types', () => {
                const stringValue = 'string-value';
                const numberValue = 42;
                const objectValue = { key: 'value' };
                const arrayValue = [1, 2, 3];

                const stringProperty = createSymbolProperty<string>(
                    Symbol('string')
                );
                const numberProperty = createSymbolProperty<number>(
                    Symbol('number')
                );
                const objectProperty = createSymbolProperty<object>(
                    Symbol('object')
                );
                const arrayProperty = createSymbolProperty<number[]>(
                    Symbol('array')
                );

                stringProperty.set(testInstance, stringValue);
                numberProperty.set(testInstance, numberValue);
                objectProperty.set(testInstance, objectValue);
                arrayProperty.set(testInstance, arrayValue);

                expect(stringProperty.get(testInstance)).toBe(stringValue);
                expect(numberProperty.get(testInstance)).toBe(numberValue);
                expect(objectProperty.get(testInstance)).toBe(objectValue);
                expect(arrayProperty.get(testInstance)).toBe(arrayValue);
            });

            it('should overwrite existing value', () => {
                const firstValue = 'first-value';
                const secondValue = 'second-value';

                symbolProperty.set(testInstance, firstValue);
                expect(symbolProperty.get(testInstance)).toBe(firstValue);

                symbolProperty.set(testInstance, secondValue);
                expect(symbolProperty.get(testInstance)).toBe(secondValue);
            });
        });

        describe('get method', () => {
            it('should return undefined for non-existent symbol', () => {
                const result = symbolProperty.get(testInstance);

                expect(result).toBeUndefined();
            });

            it('should return correct value after setting', () => {
                const testValue = 'retrieved-value';

                symbolProperty.set(testInstance, testValue);
                const result = symbolProperty.get(testInstance);

                expect(result).toBe(testValue);
            });

            it('should return undefined after value is deleted', () => {
                const testValue = 'temporary-value';

                symbolProperty.set(testInstance, testValue);
                delete testInstance[testSymbol];
                const result = symbolProperty.get(testInstance);

                expect(result).toBeUndefined();
            });
        });

        describe('symbol isolation', () => {
            it('should not interfere with different symbols', () => {
                const symbol1 = Symbol('symbol1');
                const symbol2 = Symbol('symbol2');
                const property1 = createSymbolProperty<string>(symbol1);
                const property2 = createSymbolProperty<string>(symbol2);

                const value1 = 'value1';
                const value2 = 'value2';

                property1.set(testInstance, value1);
                property2.set(testInstance, value2);

                expect(property1.get(testInstance)).toBe(value1);
                expect(property2.get(testInstance)).toBe(value2);
                expect(property1.get(testInstance)).not.toBe(value2);
                expect(property2.get(testInstance)).not.toBe(value1);
            });

            it('should work with multiple instances', () => {
                const instance1 = {};
                const instance2 = {};
                const testValue1 = 'instance1-value';
                const testValue2 = 'instance2-value';

                symbolProperty.set(instance1, testValue1);
                symbolProperty.set(instance2, testValue2);

                expect(symbolProperty.get(instance1)).toBe(testValue1);
                expect(symbolProperty.get(instance2)).toBe(testValue2);
            });
        });

        describe('type safety', () => {
            it('should maintain type information through generic', () => {
                interface TestInterface {
                    name: string;
                    count: number;
                }

                const interfaceSymbol = Symbol('interface');
                const interfaceProperty =
                    createSymbolProperty<TestInterface>(interfaceSymbol);
                const testObject: TestInterface = { name: 'test', count: 5 };

                interfaceProperty.set(testInstance, testObject);
                const result = interfaceProperty.get(testInstance);

                expect(result).toEqual(testObject);
                expect(result?.name).toBe('test');
                expect(result?.count).toBe(5);
            });
        });
    });

    describe('isESModule', () => {
        describe('should return true for ES modules', () => {
            it('should identify module with __esModule property', () => {
                const esModule = { __esModule: true };

                expect(isESModule(esModule)).toBe(true);
            });

            it('should identify module with Symbol.toStringTag', () => {
                const esModule = { [Symbol.toStringTag]: 'Module' };

                expect(isESModule(esModule)).toBe(true);
            });

            it('should identify module with both properties', () => {
                const esModule = {
                    __esModule: true,
                    [Symbol.toStringTag]: 'Module'
                };

                expect(isESModule(esModule)).toBe(true);
            });

            it('should handle truthy __esModule values', () => {
                const testCases = [
                    { __esModule: true },
                    { __esModule: 1 },
                    { __esModule: 'true' },
                    { __esModule: {} },
                    { __esModule: [] }
                ];

                testCases.forEach((moduleObj) => {
                    expect(isESModule(moduleObj)).toBe(true);
                });
            });
        });

        describe('should return false for non-ES modules', () => {
            it('should return false for null', () => {
                expect(isESModule(null)).toBe(false);
            });

            it('should return false for undefined', () => {
                expect(isESModule(undefined)).toBe(false);
            });

            it('should return false for plain objects', () => {
                const plainObject = { key: 'value' };

                expect(isESModule(plainObject)).toBe(false);
            });

            it('should return false for objects with falsy __esModule', () => {
                const testCases = [
                    { __esModule: false },
                    { __esModule: 0 },
                    { __esModule: '' },
                    { __esModule: null },
                    { __esModule: undefined }
                ];

                testCases.forEach((moduleObj) => {
                    expect(isESModule(moduleObj)).toBe(false);
                });
            });

            it('should return false for objects with wrong Symbol.toStringTag', () => {
                const testCases = [
                    { [Symbol.toStringTag]: 'Object' },
                    { [Symbol.toStringTag]: 'Function' },
                    { [Symbol.toStringTag]: 'Array' },
                    { [Symbol.toStringTag]: '' },
                    { [Symbol.toStringTag]: null }
                ];

                testCases.forEach((moduleObj) => {
                    expect(isESModule(moduleObj)).toBe(false);
                });
            });

            it('should return false for primitive values', () => {
                const primitives = [42, 'string', true, false, Symbol('test')];

                primitives.forEach((primitive) => {
                    expect(isESModule(primitive)).toBe(false);
                });
            });

            it('should return false for functions and arrays', () => {
                const nonObjects = [
                    () => {},
                    () => {},
                    [],
                    [1, 2, 3],
                    new Date()
                ];

                nonObjects.forEach((nonObj) => {
                    expect(isESModule(nonObj)).toBe(false);
                });
            });
        });
    });

    describe('resolveComponent', () => {
        describe('should return default export or module itself', () => {
            it('should return null for falsy values', () => {
                expect(resolveComponent(null)).toBeNull();
                expect(resolveComponent(undefined)).toBeNull();
                expect(resolveComponent(false)).toBeNull();
                expect(resolveComponent(0)).toBeNull();
                expect(resolveComponent('')).toBeNull();
            });

            it('should return default export if available', () => {
                const defaultExport = { name: 'DefaultComponent' };
                const module = {
                    __esModule: true,
                    default: defaultExport,
                    other: 'value'
                };

                expect(resolveComponent(module)).toBe(defaultExport);
            });

            it('should return the module itself if no default export', () => {
                const module = {
                    __esModule: true,
                    someExport: 'value',
                    otherExport: 42
                };

                expect(resolveComponent(module)).toBe(module);
            });

            it('should handle modules with Symbol.toStringTag', () => {
                const defaultExport = { name: 'SymbolDefaultComponent' };
                const module = {
                    [Symbol.toStringTag]: 'Module',
                    default: defaultExport
                };

                expect(resolveComponent(module)).toBe(defaultExport);
            });

            it('should return non-module objects as is', () => {
                const nonModule = { prop: 'value' };
                expect(resolveComponent(nonModule)).toBe(nonModule);
            });

            it('should handle various component types', () => {
                const functionComponent = () => ({ name: 'FunctionComponent' });
                expect(resolveComponent(functionComponent)).toBe(
                    functionComponent
                );

                class ClassComponent {
                    name = 'ClassComponent';
                }
                const classInstance = new ClassComponent();
                expect(resolveComponent(classInstance)).toBe(classInstance);
            });

            it('should return default when object has only default key', () => {
                const component = { default: 'DefaultComponent' };
                expect(resolveComponent(component)).toBe('DefaultComponent');
            });

            it('should return object when it has multiple keys including default', () => {
                const component = {
                    default: 'DefaultComponent',
                    other: 'otherValue'
                };
                expect(resolveComponent(component)).toBe(component);
            });

            it('should return object when it has multiple keys without default', () => {
                const component = {
                    prop1: 'value1',
                    prop2: 'value2'
                };
                expect(resolveComponent(component)).toBe(component);
            });

            it('should return object when it has single key that is not default', () => {
                const component = { custom: 'CustomComponent' };
                expect(resolveComponent(component)).toBe(component);
            });

            it('should return array as is', () => {
                const component = ['item1', 'item2'];
                expect(resolveComponent(component)).toBe(component);
            });

            it('should return object with single default key that is null', () => {
                const component = { default: null };
                expect(resolveComponent(component)).toBe(null);
            });

            it('should return object with single default key that is undefined', () => {
                const component = { default: undefined };
                expect(resolveComponent(component)).toBe(undefined);
            });
        });
    });

    describe('createDependentProxy', () => {
        it('should return original property values', () => {
            const original = { foo: 'bar', count: 42 };
            const dep = ref(false);
            const proxy = createDependentProxy(original, dep);

            expect(proxy.foo).toBe('bar');
            expect(proxy.count).toBe(42);
        });

        it('should handle method calls correctly', () => {
            const original = {
                items: [1, 2, 3],
                getItems() {
                    return this.items;
                }
            };
            const dep = ref(false);
            const proxy = createDependentProxy(original, dep);

            expect(proxy.getItems()).toEqual([1, 2, 3]);
            expect(proxy.getItems()).toBe(original.items);
        });

        it('should handle nested property access', () => {
            const original = {
                nested: {
                    value: 'nested-value'
                }
            };
            const dep = ref(false);
            const proxy = createDependentProxy(original, dep);

            expect(proxy.nested.value).toBe('nested-value');
        });

        it('should allow property modification', () => {
            const original = { value: 'original' };
            const dep = ref(false);
            const proxy = createDependentProxy(original, dep);

            proxy.value = 'modified';
            expect(proxy.value).toBe('modified');
            expect(original.value).toBe('modified');
        });

        it('should trigger computed updates when dependency changes', async () => {
            const original = { value: 'test' };
            const dep = ref(false);
            const proxy = createDependentProxy(original, dep);

            const computedValue = computed(() => {
                return proxy.value + '-' + String(dep.value);
            });

            expect(computedValue.value).toBe('test-false');

            dep.value = true;
            await nextTick();
            expect(computedValue.value).toBe('test-true');

            proxy.value = 'updated';
            dep.value = false;
            await nextTick();
            expect(computedValue.value).toBe('updated-false');
        });

        it('should handle special properties', () => {
            const symbol = Symbol('test');
            const original = {
                [symbol]: 'symbol-value'
            };
            const dep = ref(false);
            const proxy = createDependentProxy(original, dep);

            expect(proxy[symbol]).toBe('symbol-value');
        });

        it('should read the dependency on property access', () => {
            const original = { value: 'test' };
            const dep = ref(false);

            const spy = vi.fn();
            const depValue = dep.value; // 预先读取一次值
            vi.spyOn(dep, 'value', 'get').mockImplementation(() => {
                spy();
                return depValue;
            });

            const proxy = createDependentProxy(original, dep);

            proxy.value;
            expect(spy).toHaveBeenCalled();
        });
    });

    describe('defineRouterProperties', () => {
        it('should define $router and $route properties on target object', () => {
            const target = {};
            const mockRouter = { push: vi.fn() } as unknown as Router;
            const mockRoute = { path: '/test' } as unknown as Route;

            const routerGetter = vi.fn(function (this: any) {
                return mockRouter;
            });
            const routeGetter = vi.fn(function (this: any) {
                return mockRoute;
            });

            defineRouterProperties(target, routerGetter, routeGetter);

            expect(target).toHaveProperty('$router');
            expect(target).toHaveProperty('$route');
        });

        it('should call getter functions when accessing properties', () => {
            const target = {};
            const mockRouter = { push: vi.fn() } as unknown as Router;
            const mockRoute = { path: '/test' } as unknown as Route;

            const routerGetter = vi.fn(function (this: any) {
                return mockRouter;
            });
            const routeGetter = vi.fn(function (this: any) {
                return mockRoute;
            });

            defineRouterProperties(target, routerGetter, routeGetter);

            const router = (target as any).$router;
            const route = (target as any).$route;

            expect(routerGetter).toHaveBeenCalled();
            expect(routeGetter).toHaveBeenCalled();
            expect(router).toBe(mockRouter);
            expect(route).toBe(mockRoute);
        });

        it('should use correct this context in getter functions', () => {
            const target = { customProp: 'test' };
            const mockRouter = { push: vi.fn() } as unknown as Router;
            const mockRoute = { path: '/test' } as unknown as Route;

            const routerGetter = vi.fn(function (this: any) {
                return this.customProp ? mockRouter : ({} as Router);
            });
            const routeGetter = vi.fn(function (this: any) {
                return this.customProp ? mockRoute : ({} as Route);
            });

            defineRouterProperties(target, routerGetter, routeGetter);

            const router = (target as any).$router;
            const route = (target as any).$route;

            expect(router).toBe(mockRouter);
            expect(route).toBe(mockRoute);
        });

        it('should make properties non-enumerable by default', () => {
            const target = {};
            const mockRouter = { push: vi.fn() } as unknown as Router;
            const mockRoute = { path: '/test' } as unknown as Route;

            const routerGetter = vi.fn(function (this: any) {
                return mockRouter;
            });
            const routeGetter = vi.fn(function (this: any) {
                return mockRoute;
            });

            defineRouterProperties(target, routerGetter, routeGetter);

            const descriptors = Object.getOwnPropertyDescriptors(target);

            expect(descriptors.$router.enumerable).toBe(false);
            expect(descriptors.$route.enumerable).toBe(false);
        });

        it('should make properties non-configurable by default', () => {
            const target = {};
            const mockRouter = { push: vi.fn() } as unknown as Router;
            const mockRoute = { path: '/test' } as unknown as Route;

            const routerGetter = vi.fn(function (this: any) {
                return mockRouter;
            });
            const routeGetter = vi.fn(function (this: any) {
                return mockRoute;
            });

            defineRouterProperties(target, routerGetter, routeGetter);

            const descriptors = Object.getOwnPropertyDescriptors(target);

            expect(descriptors.$router.configurable).toBe(false);
            expect(descriptors.$route.configurable).toBe(false);
        });

        it('should make properties configurable when configurable option is true', () => {
            const target = {};
            const mockRouter = { push: vi.fn() } as unknown as Router;
            const mockRoute = { path: '/test' } as unknown as Route;

            const routerGetter = vi.fn(function (this: any) {
                return mockRouter;
            });
            const routeGetter = vi.fn(function (this: any) {
                return mockRoute;
            });

            defineRouterProperties(target, routerGetter, routeGetter, true);

            const descriptors = Object.getOwnPropertyDescriptors(target);

            expect(descriptors.$router.configurable).toBe(true);
            expect(descriptors.$route.configurable).toBe(true);
        });

        it('should define properties as getters', () => {
            const target = {};
            const mockRouter = { push: vi.fn() } as unknown as Router;
            const mockRoute = { path: '/test' } as unknown as Route;

            const routerGetter = vi.fn(function (this: any) {
                return mockRouter;
            });
            const routeGetter = vi.fn(function (this: any) {
                return mockRoute;
            });

            defineRouterProperties(target, routerGetter, routeGetter);

            const descriptors = Object.getOwnPropertyDescriptors(target);

            expect(typeof descriptors.$router.get).toBe('function');
            expect(typeof descriptors.$route.get).toBe('function');
            expect(descriptors.$router.set).toBeUndefined();
            expect(descriptors.$route.set).toBeUndefined();
        });

        it('should call getter each time property is accessed', () => {
            const target = {};
            const mockRouter = { push: vi.fn() } as unknown as Router;

            const routerGetter = vi.fn(function (this: any) {
                return mockRouter;
            });
            const routeGetter = vi.fn(function (this: any) {
                return { path: '/test' } as Route;
            });

            defineRouterProperties(target, routerGetter, routeGetter);

            (target as any).$router;
            (target as any).$router;
            (target as any).$router;

            expect(routerGetter).toHaveBeenCalledTimes(3);
        });

        it('should work with different target objects', () => {
            const targets = [
                {},
                { existingProp: 'value' },
                Object.create(null),
                new (class Test {})()
            ];

            const mockRouter = { push: vi.fn() } as unknown as Router;
            const mockRoute = { path: '/test' } as unknown as Route;

            const routerGetter = vi.fn(function (this: any) {
                return mockRouter;
            });
            const routeGetter = vi.fn(function (this: any) {
                return mockRoute;
            });

            targets.forEach((target) => {
                defineRouterProperties(target, routerGetter, routeGetter);

                expect(target).toHaveProperty('$router');
                expect(target).toHaveProperty('$route');

                const router = (target as any).$router;
                const route = (target as any).$route;

                expect(router).toBe(mockRouter);
                expect(route).toBe(mockRoute);
            });
        });

        it('should preserve existing properties on target object', () => {
            const target = {
                existingProp: 'value',
                $existingRouter: 'should not be affected'
            };

            const mockRouter = { push: vi.fn() } as unknown as Router;
            const mockRoute = { path: '/test' } as unknown as Route;

            const routerGetter = vi.fn(function (this: any) {
                return mockRouter;
            });
            const routeGetter = vi.fn(function (this: any) {
                return mockRoute;
            });

            defineRouterProperties(target, routerGetter, routeGetter);

            expect(target.existingProp).toBe('value');
            expect(target.$existingRouter).toBe('should not be affected');
            expect(target).toHaveProperty('$router');
            expect(target).toHaveProperty('$route');
        });

        it('should handle getter functions that return undefined', () => {
            const target = {};

            const routerGetter = vi.fn(function (this: any) {
                return undefined as any;
            });
            const routeGetter = vi.fn(function (this: any) {
                return undefined as any;
            });

            defineRouterProperties(target, routerGetter, routeGetter);

            const router = (target as any).$router;
            const route = (target as any).$route;

            expect(router).toBeUndefined();
            expect(route).toBeUndefined();
            expect(routerGetter).toHaveBeenCalled();
            expect(routeGetter).toHaveBeenCalled();
        });

        it('should handle getter functions that throw errors', () => {
            const target = {};

            const routerGetter = vi.fn(function (this: any) {
                throw new Error('Router error');
            });
            const routeGetter = vi.fn(function (this: any) {
                throw new Error('Route error');
            });

            defineRouterProperties(target, routerGetter, routeGetter);

            expect(() => (target as any).$router).toThrow('Router error');
            expect(() => (target as any).$route).toThrow('Route error');
        });

        it('should work with arrow functions as getters', () => {
            const target = {};
            const mockRouter = { push: vi.fn() } as unknown as Router;
            const mockRoute = { path: '/test' } as unknown as Route;
            const context = { customContext: 'test' };

            const routerGetter = vi.fn(() => mockRouter);
            const routeGetter = vi.fn(() => mockRoute);

            defineRouterProperties.call(
                context,
                target,
                routerGetter,
                routeGetter
            );

            const router = (target as any).$router;
            const route = (target as any).$route;

            expect(router).toBe(mockRouter);
            expect(route).toBe(mockRoute);
            expect(routerGetter).toHaveBeenCalled();
            expect(routeGetter).toHaveBeenCalled();
        });
    });
});
