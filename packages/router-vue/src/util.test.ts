/**
 * @vitest-environment happy-dom
 */
import { beforeEach, describe, expect, it } from 'vitest';
import { version } from 'vue';
import {
    createSymbolProperty,
    isESModule,
    isVue3,
    resolveComponent
} from './util';

describe('util.ts - Utility Functions', () => {
    describe('isVue3', () => {
        it('should correctly identify Vue 3', () => {
            // Since we're testing in a Vue 3 environment, isVue3 should be true
            expect(isVue3).toBe(version.startsWith('3.'));
            expect(typeof isVue3).toBe('boolean');
        });

        it('should be consistent with Vue version check', () => {
            // Verify the logic is correct
            const expectedResult = version.startsWith('3.');
            expect(isVue3).toBe(expectedResult);
        });
    });

    describe('createSymbolProperty', () => {
        let testSymbol: symbol;
        let symbolProperty: ReturnType<typeof createSymbolProperty>;
        let testInstance: Record<string | symbol, any>;

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
                const primitives = ['string', 42, true, false, Symbol('test')];

                primitives.forEach((primitive) => {
                    expect(isESModule(primitive)).toBe(false);
                });
            });
        });
    });

    describe('resolveComponent', () => {
        describe('should return null for falsy inputs', () => {
            const falsyValues = [null, undefined, false, 0, '', Number.NaN];

            falsyValues.forEach((value) => {
                it(`should return null for ${value}`, () => {
                    expect(resolveComponent(value)).toBeNull();
                });
            });
        });

        describe('should handle ES modules', () => {
            it('should return default export when available', () => {
                const defaultComponent = { name: 'DefaultComponent' };
                const esModule = {
                    __esModule: true,
                    default: defaultComponent,
                    namedExport: { name: 'NamedComponent' }
                };

                const result = resolveComponent(esModule);

                expect(result).toBe(defaultComponent);
            });

            it('should return the module itself when no default export', () => {
                const esModule = {
                    __esModule: true,
                    namedExport: { name: 'NamedComponent' }
                };

                const result = resolveComponent(esModule);

                expect(result).toBe(esModule);
            });

            it('should prefer default export over module when both exist', () => {
                const defaultComponent = { name: 'DefaultComponent' };
                const esModule = {
                    __esModule: true,
                    default: defaultComponent,
                    name: 'ModuleComponent'
                };

                const result = resolveComponent(esModule);

                expect(result).toBe(defaultComponent);
                expect(result).not.toBe(esModule);
            });

            it('should handle modules with Symbol.toStringTag', () => {
                const defaultComponent = { name: 'SymbolTagComponent' };
                const esModule = {
                    [Symbol.toStringTag]: 'Module',
                    default: defaultComponent
                };

                const result = resolveComponent(esModule);

                expect(result).toBe(defaultComponent);
            });

            it('should handle falsy default export', () => {
                const falsyDefaults = [null, undefined, false, 0, ''];

                falsyDefaults.forEach((falsyDefault) => {
                    const esModule = {
                        __esModule: true,
                        default: falsyDefault,
                        fallback: { name: 'FallbackComponent' }
                    };

                    const result = resolveComponent(esModule);

                    // Should return the module itself when default is falsy
                    expect(result).toBe(esModule);
                });
            });
        });

        describe('should handle non-ES modules', () => {
            it('should return component directly for non-ES modules', () => {
                const component = { name: 'RegularComponent' };

                const result = resolveComponent(component);

                expect(result).toBe(component);
            });

            it('should return function components directly', () => {
                const functionComponent = () => ({ name: 'FunctionComponent' });

                const result = resolveComponent(functionComponent);

                expect(result).toBe(functionComponent);
            });

            it('should return class components directly', () => {
                class ClassComponent {
                    name = 'ClassComponent';
                }

                const result = resolveComponent(ClassComponent);

                expect(result).toBe(ClassComponent);
            });
        });

        describe('edge cases', () => {
            it('should handle circular references in modules', () => {
                const esModule: any = {
                    __esModule: true
                };
                esModule.default = esModule; // Circular reference

                const result = resolveComponent(esModule);

                expect(result).toBe(esModule);
            });

            it('should handle deeply nested default exports', () => {
                const actualComponent = { name: 'DeepComponent' };
                const esModule = {
                    __esModule: true,
                    default: {
                        default: {
                            default: actualComponent
                        }
                    }
                };

                const result = resolveComponent(esModule);

                // Should only resolve one level of default
                expect(result).toEqual({
                    default: {
                        default: actualComponent
                    }
                });
            });

            it('should handle modules with both __esModule and Symbol.toStringTag', () => {
                const defaultComponent = { name: 'BothPropertiesComponent' };
                const esModule = {
                    __esModule: true,
                    [Symbol.toStringTag]: 'Module',
                    default: defaultComponent
                };

                const result = resolveComponent(esModule);

                expect(result).toBe(defaultComponent);
            });
        });
    });
});
