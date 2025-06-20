import { describe, expect, test } from 'vitest';
import { parsedOptions } from './options';
import { Route } from './route';
import type { RouterParsedOptions } from './types';
import { RouteType, RouterMode } from './types';
import {
    isNonEmptyPlainObject,
    isNotNullish,
    isPlainObject,
    isRouteMatched,
    isUrlEqual,
    isValidConfirmHookResult,
    removeFromArray
} from './util';

const AsyncFunction = (async () => {}).constructor;

// There are differences between literals and object wrappers:
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String#string_primitives_and_string_objects

describe('isNotNullish', () => {
    test('should return true for non-nullish values', () => {
        // Special values
        expect(isNotNullish(null)).toBe(false);
        expect(isNotNullish(void 0)).toBe(false);
        // Numbers & bigint
        expect(isNotNullish(+'a')).toBe(false);
        expect(isNotNullish(Number.NaN)).toBe(false);
        expect(isNotNullish(Number('a'))).toBe(false);
        expect(isNotNullish(new Number('a'))).toBe(false);
        expect(isNotNullish(0)).toBe(true);
        expect(isNotNullish(123)).toBe(true);
        expect(isNotNullish(123n)).toBe(true);
        expect(isNotNullish(0n)).toBe(true);
        expect(isNotNullish(new Number('1'))).toBe(true);
        expect(isNotNullish(Number.POSITIVE_INFINITY)).toBe(true);
        expect(isNotNullish(Number.NEGATIVE_INFINITY)).toBe(true);
        expect(isNotNullish(Number.EPSILON)).toBe(true);
        // Strings
        expect(isNotNullish('')).toBe(true);
        expect(isNotNullish('0')).toBe(true);
        expect(isNotNullish('1')).toBe(true);
        expect(isNotNullish('test')).toBe(true);
        expect(isNotNullish(new String(''))).toBe(true);
        expect(isNotNullish(new String('0'))).toBe(true);
        expect(isNotNullish(new String('1'))).toBe(true);
        expect(isNotNullish(new String('test'))).toBe(true);
        // Boolean values
        expect(isNotNullish(true)).toBe(true);
        expect(isNotNullish(false)).toBe(true);
        expect(isNotNullish(new Boolean(true))).toBe(true);
        expect(isNotNullish(new Boolean(false))).toBe(true);
        // Object
        expect(isNotNullish({})).toBe(true);
        expect(isNotNullish({ key: 'value' })).toBe(true);
        expect(isNotNullish(new Object())).toBe(true);
        expect(isNotNullish(Object.create(null))).toBe(true);
        expect(isNotNullish(Object.create({}))).toBe(true);
        expect(isNotNullish(Object.create(Object.prototype))).toBe(true);
        expect(isNotNullish({ __proto__: null })).toBe(true);
        expect(isNotNullish({ [Symbol.toStringTag]: 'Tag' })).toBe(true);
        expect(isNotNullish({ toString: () => '[object CustomObject]' })).toBe(
            true
        );
        // Arrays & typed arrays related
        expect(isNotNullish([])).toBe(true);
        expect(isNotNullish(['a', 'b'])).toBe(true);
        expect(isNotNullish(new Array())).toBe(true);
        expect(isNotNullish(new Array(1, 2, 3))).toBe(true);
        expect(isNotNullish(new Array(1))).toBe(true);
        expect(isNotNullish(new Uint8Array(8))).toBe(true);
        expect(isNotNullish(new ArrayBuffer(8))).toBe(true);
        expect(isNotNullish(new DataView(new ArrayBuffer(8)))).toBe(true);
        // Functions
        expect(isNotNullish(() => {})).toBe(true);
        expect(isNotNullish(async () => {})).toBe(true);
        expect(isNotNullish(new Function('return 1;'))).toBe(true);
        expect(isNotNullish(AsyncFunction('return 1;'))).toBe(true);
        // Special objects
        expect(isNotNullish(new Date())).toBe(true);
        expect(isNotNullish(Symbol('test'))).toBe(true);
        expect(isNotNullish(new Map())).toBe(true);
        expect(isNotNullish(new Set())).toBe(true);
        expect(isNotNullish(new WeakMap())).toBe(true);
        expect(isNotNullish(new WeakSet())).toBe(true);
        expect(isNotNullish(/test/)).toBe(true);
        expect(isNotNullish(new Error('test'))).toBe(true);
        expect(isNotNullish(Promise.resolve())).toBe(true);
        expect(isNotNullish(new URL('https://example.com'))).toBe(true);
        expect(isNotNullish(new URLSearchParams('key=value'))).toBe(true);
        expect(isNotNullish(new Blob(['test']))).toBe(true);
        expect(isNotNullish(new File(['test'], 'file.txt'))).toBe(true);
        expect(isNotNullish(Math)).toBe(true);
        expect(isNotNullish(JSON)).toBe(true);
        expect(isNotNullish(console)).toBe(true);
    });

    test('should handle edge cases with Number constructor', () => {
        // Various usages of Number constructor
        expect(isNotNullish(Number())).toBe(true); // Number() returns 0
        expect(isNotNullish(Number(undefined))).toBe(false); // Number(undefined) returns NaN
        expect(isNotNullish(Number(null))).toBe(true); // Number(null) returns 0
        expect(isNotNullish(Number(''))).toBe(true); // Number('') returns 0
        expect(isNotNullish(Number('0'))).toBe(true); // Number('0') returns 0
        expect(isNotNullish(Number('123'))).toBe(true); // Number('123') returns 123

        // Various usages of new Number constructor
        expect(isNotNullish(new Number())).toBe(true); // new Number() returns Number object
        expect(isNotNullish(new Number(undefined))).toBe(false); // new Number(undefined) wraps NaN
        expect(isNotNullish(new Number(null))).toBe(true); // new Number(null) wraps 0
        expect(isNotNullish(new Number(''))).toBe(true); // new Number('') wraps 0
        expect(isNotNullish(new Number('0'))).toBe(true); // new Number('0') wraps 0
        expect(isNotNullish(new Number('123'))).toBe(true); // new Number('123') wraps 123
    });

    test('should handle various NaN cases', () => {
        // Various situations that produce NaN
        expect(isNotNullish(0 / 0)).toBe(false);
        expect(isNotNullish(Math.sqrt(-1))).toBe(false);
        expect(isNotNullish(Number.parseInt('abc'))).toBe(false);
        expect(isNotNullish(Number.parseFloat('abc'))).toBe(false);
        expect(isNotNullish(Number.NaN)).toBe(false);
        expect(isNotNullish(Number.NaN)).toBe(false);

        // NaN wrapped in Number objects
        expect(isNotNullish(new Number(Number.NaN))).toBe(false);
        expect(isNotNullish(new Number(0 / 0))).toBe(false);
        expect(isNotNullish(new Number(Number.parseInt('abc')))).toBe(false);
    });

    test('should handle complex objects', () => {
        // Objects created by custom constructors
        class CustomClass {
            constructor(public value: number) {}
        }
        expect(isNotNullish(new CustomClass(123))).toBe(true);

        // Frozen and sealed objects
        const frozenObj = Object.freeze({ a: 1 });
        const sealedObj = Object.seal({ b: 2 });
        expect(isNotNullish(frozenObj)).toBe(true);
        expect(isNotNullish(sealedObj)).toBe(true);

        // Objects created using defineProperty
        const objWithDescriptor = {};
        Object.defineProperty(objWithDescriptor, 'prop', {
            value: 'test',
            writable: false
        });
        expect(isNotNullish(objWithDescriptor)).toBe(true);
    });
});

describe('isPlainObject', () => {
    test('should return true for plain objects', () => {
        expect(isPlainObject({})).toBe(true);
        expect(isPlainObject({ key: 'value' })).toBe(true);
        expect(isPlainObject(new Object())).toBe(true);
        expect(isPlainObject(Object.create(null))).toBe(true);
        expect(isPlainObject(Object.create({}))).toBe(true);
        expect(isPlainObject(Object.create(Object.prototype))).toBe(true);
        expect(isPlainObject(Object.create({ parent: 'value' }))).toBe(true);
        expect(isPlainObject({ __proto__: null })).toBe(true);
        expect(isPlainObject({ [Symbol.toStringTag]: 'Tag' })).toBe(true);
        expect(isPlainObject({ toString: () => '[object CustomObject]' })).toBe(
            true
        );
        expect(isPlainObject(Math)).toBe(true);
        expect(isPlainObject(JSON)).toBe(true);
        class TestClass {}
        expect(isPlainObject(new TestClass())).toBe(true);
    });

    test('should return false for non-plain objects', () => {
        // Special values
        expect(isPlainObject(null)).toBe(false);
        expect(isPlainObject(void 0)).toBe(false);
        // Arrays & typed arrays related
        expect(isPlainObject([])).toBe(false);
        expect(isPlainObject(['a', 'b'])).toBe(false);
        expect(isPlainObject(new Array())).toBe(false);
        expect(isPlainObject(new Array(1, 2, 3))).toBe(false);
        expect(isPlainObject(new Array(1))).toBe(false);
        expect(isPlainObject(new Uint8Array(8))).toBe(false);
        expect(isPlainObject(new ArrayBuffer(8))).toBe(false);
        expect(isPlainObject(new DataView(new ArrayBuffer(8)))).toBe(false);
        // Strings
        expect(isPlainObject('')).toBe(false);
        expect(isPlainObject('0')).toBe(false);
        expect(isPlainObject('1')).toBe(false);
        expect(isPlainObject('string')).toBe(false);
        expect(isPlainObject(new String(''))).toBe(false); // typeof (new String('')) === 'object'
        expect(isPlainObject(new String('0'))).toBe(false);
        expect(isPlainObject(new String('1'))).toBe(false);
        expect(isPlainObject(new String('string'))).toBe(false);
        // Boolean values
        expect(isPlainObject(true)).toBe(false);
        expect(isPlainObject(false)).toBe(false);
        expect(isPlainObject(new Boolean(true))).toBe(false);
        expect(isPlainObject(new Boolean(false))).toBe(false);
        // Numbers & bigint
        expect(isPlainObject(0)).toBe(false);
        expect(isPlainObject(0n)).toBe(false);
        expect(isPlainObject(123)).toBe(false);
        expect(isPlainObject(123n)).toBe(false);
        expect(isPlainObject(new Number('1'))).toBe(false);
        expect(isPlainObject(+'a')).toBe(false);
        expect(isPlainObject(Number.NaN)).toBe(false);
        expect(isPlainObject(new Number('a'))).toBe(false);
        // Functions
        expect(isPlainObject(() => {})).toBe(false);
        expect(isPlainObject(async () => {})).toBe(false);
        expect(isPlainObject(new Function('return 1;'))).toBe(false);
        expect(isPlainObject(AsyncFunction('return 1;'))).toBe(false);
        // Special objects
        expect(isPlainObject(new Date())).toBe(false);
        expect(isPlainObject(Symbol('test'))).toBe(false);
        expect(isPlainObject(new Map())).toBe(false);
        expect(isPlainObject(new Set())).toBe(false);
        expect(isPlainObject(new WeakMap())).toBe(false);
        expect(isPlainObject(new WeakSet())).toBe(false);
        expect(isPlainObject(/test/)).toBe(false);
        expect(isPlainObject(new Error('test'))).toBe(false);
        expect(isPlainObject(Promise.resolve())).toBe(false);
        expect(isPlainObject(new URL('https://example.com'))).toBe(false);
        expect(isPlainObject(new URLSearchParams('key=value'))).toBe(false);
        expect(isPlainObject(new Blob(['test']))).toBe(false);
        expect(isPlainObject(new File(['test'], 'file.txt'))).toBe(false);
    });

    test('should distinguish between objects and boxed primitives', () => {
        expect(isPlainObject(Object(42))).toBe(false); // Equivalent to new Number(42)
        expect(isPlainObject(Object('str'))).toBe(false); // Equivalent to new String('str')
        expect(isPlainObject(Object(true))).toBe(false); // Equivalent to new Boolean(true)
        expect(isPlainObject(Object(Symbol('sym')))).toBe(false); // Symbol wrapper object
    });
});

describe('isNonEmptyPlainObject', () => {
    test('should return true for non-empty plain objects', () => {
        expect(isNonEmptyPlainObject({ key: 'value' })).toBe(true);
        expect(isNonEmptyPlainObject({ a: 1, b: 2 })).toBe(true);
        expect(isNonEmptyPlainObject({ nested: { value: 'test' } })).toBe(true);
        expect(
            isNonEmptyPlainObject({ toString: () => '[object CustomObject]' })
        ).toBe(true);

        const obj = new Object() as any;
        obj.prop = 'value';
        expect(isNonEmptyPlainObject(obj)).toBe(true);

        const objWithProto = Object.create({ parent: 'value' });
        objWithProto.own = 'property';
        expect(isNonEmptyPlainObject(objWithProto)).toBe(true);

        class TestClass {}
        const instance = new TestClass() as any;
        instance.prop = 'value';
        expect(isNonEmptyPlainObject(instance)).toBe(true);
    });

    test('should return false for empty objects', () => {
        expect(isNonEmptyPlainObject({})).toBe(false);
        expect(isNonEmptyPlainObject(new Object())).toBe(false);
        expect(isNonEmptyPlainObject(Object.create(null))).toBe(false);
        expect(isNonEmptyPlainObject(Object.create({}))).toBe(false);
        expect(isNonEmptyPlainObject(Object.create(Object.prototype))).toBe(
            false
        );
        expect(isNonEmptyPlainObject({ __proto__: null })).toBe(false);

        class TestClass {}
        expect(isNonEmptyPlainObject(new TestClass())).toBe(false);

        // Objects with Symbol properties should be considered empty
        expect(isNonEmptyPlainObject({ [Symbol.toStringTag]: 'Tag' })).toBe(
            false
        );
        expect(isNonEmptyPlainObject({ [Symbol('key')]: 'value' })).toBe(false);
    });

    test('should return false for non-objects', () => {
        // Special values
        expect(isNonEmptyPlainObject(null)).toBe(false);
        expect(isNonEmptyPlainObject(void 0)).toBe(false);

        // Primitive types
        expect(isNonEmptyPlainObject('')).toBe(false);
        expect(isNonEmptyPlainObject('non-empty')).toBe(false);
        expect(isNonEmptyPlainObject(0)).toBe(false);
        expect(isNonEmptyPlainObject(123)).toBe(false);
        expect(isNonEmptyPlainObject(0n)).toBe(false);
        expect(isNonEmptyPlainObject(123n)).toBe(false);
        expect(isNonEmptyPlainObject(true)).toBe(false);
        expect(isNonEmptyPlainObject(false)).toBe(false);
        expect(isNonEmptyPlainObject(Symbol('test'))).toBe(false);

        // Arrays
        expect(isNonEmptyPlainObject([])).toBe(false);
        expect(isNonEmptyPlainObject(['a', 'b'])).toBe(false);

        // Functions
        expect(isNonEmptyPlainObject(() => {})).toBe(false);
        expect(isNonEmptyPlainObject(async () => {})).toBe(false);

        // Special object types
        expect(isNonEmptyPlainObject(new Date())).toBe(false);
        expect(isNonEmptyPlainObject(new Map())).toBe(false);
        expect(isNonEmptyPlainObject(new Set())).toBe(false);
        expect(isNonEmptyPlainObject(/test/)).toBe(false);
        expect(isNonEmptyPlainObject(new Error('test'))).toBe(false);
        expect(isNonEmptyPlainObject(Promise.resolve())).toBe(false);

        // Wrapper objects
        expect(isNonEmptyPlainObject(new String('test'))).toBe(false);
        expect(isNonEmptyPlainObject(new Number(123))).toBe(false);
        expect(isNonEmptyPlainObject(new Boolean(true))).toBe(false);
    });

    test('should handle objects with only inherited properties', () => {
        // Objects with only inherited properties, no own properties
        const parentObj = { parentProp: 'value' };
        const childObj = Object.create(parentObj);
        expect(isNonEmptyPlainObject(childObj)).toBe(false);

        childObj.ownProp = 'own';
        expect(isNonEmptyPlainObject(childObj)).toBe(true);
    });

    test('should handle edge cases', () => {
        // Objects with non-enumerable properties
        const objWithNonEnum = {};
        Object.defineProperty(objWithNonEnum, 'nonEnum', {
            value: 'hidden',
            enumerable: false
        });
        expect(isNonEmptyPlainObject(objWithNonEnum)).toBe(false); // Object.keys will not include non-enumerable properties

        Object.defineProperty(objWithNonEnum, 'visible', {
            value: 'visible',
            enumerable: true
        });
        expect(isNonEmptyPlainObject(objWithNonEnum)).toBe(true); // Now has enumerable properties

        // Frozen objects
        const frozenObj = Object.freeze({ prop: 'value' });
        expect(isNonEmptyPlainObject(frozenObj)).toBe(true);

        // Sealed objects
        const sealedObj = Object.seal({ prop: 'value' });
        expect(isNonEmptyPlainObject(sealedObj)).toBe(true);
    });
});

describe('removeFromArray', () => {
    test('should remove first occurrence when duplicates exist', () => {
        const arr = [1, 2, 2, 3];
        removeFromArray(arr, 2);
        expect(arr).toEqual([1, 2, 3]);

        // `new Number(2)` is not the same as `2`
        const num = new Number(2);
        let arrWithObj = [1, num, 2, 3];
        removeFromArray(arrWithObj, 2);
        expect(arrWithObj).toEqual([1, num, 3]);
        arrWithObj = [1, num, 2, 3];
        removeFromArray(arrWithObj, num);
        expect(arrWithObj).toEqual([1, 2, 3]);
        arrWithObj = [1, 2, num, 3];
        removeFromArray(arrWithObj, num);
        expect(arrWithObj).toEqual([1, 2, 3]);
        arrWithObj = [1, 2, num, 3];
        removeFromArray(arrWithObj, 2);
        expect(arrWithObj).toEqual([1, num, 3]);

        arrWithObj = [1, num, num, 3];
        removeFromArray(arrWithObj, num);
        expect(arrWithObj).toEqual([1, num, 3]);
    });

    test('should remove existing element from array', () => {
        const arr = [1, 2, 3];
        removeFromArray(arr, 2);
        expect(arr).toEqual([1, 3]);
    });

    test('should do nothing when element not found', () => {
        const arr = [1, 2, 3];
        removeFromArray(arr, 4);
        expect(arr).toEqual([1, 2, 3]);
    });

    test('should work with object references', () => {
        const obj1 = { id: 1 };
        const obj2 = { id: 2 };
        const arr = [obj1, obj2];
        removeFromArray(arr, obj1);
        expect(arr).toEqual([obj2]);
    });

    test('should handle edge cases', () => {
        // Empty array
        const emptyArr: any[] = [];
        removeFromArray(emptyArr, 1);
        expect(emptyArr).toEqual([]);

        const singleArr = [42];
        removeFromArray(singleArr, 42);
        expect(singleArr).toEqual([]);

        const singleArr2 = [42];
        removeFromArray(singleArr2, 99);
        expect(singleArr2).toEqual([42]);

        const sameArr = [5, 5, 5, 5];
        removeFromArray(sameArr, 5);
        expect(sameArr).toEqual([5, 5, 5]);

        // Contains undefined and null
        const nullishArr = [1, null, void 0, 2];
        removeFromArray(nullishArr, null);
        expect(nullishArr).toEqual([1, void 0, 2]);

        const nullishArr2 = [1, null, void 0, 2];
        removeFromArray(nullishArr2, void 0);
        expect(nullishArr2).toEqual([1, null, 2]);
    });

    test('should handle NaN correctly', () => {
        const nanArr = [1, Number.NaN, 2, Number.NaN];
        removeFromArray(nanArr, Number.NaN);
        expect(nanArr).toEqual([1, 2, Number.NaN]);
    });

    test('should handle sparse arrays', () => {
        // Sparse array - array with empty slots
        // biome-ignore lint/suspicious/noSparseArray: skip
        const sparseArr = [1, , 3, , 5];
        removeFromArray(sparseArr, void 0);
        // Length should not change, empty slots cannot be treated as undefined placeholders
        expect(sparseArr).toHaveLength(5);
        // biome-ignore lint/suspicious/noSparseArray: skip
        expect(sparseArr).toEqual([1, , 3, , 5]);
    });

    test('should handle arrays with complex objects', () => {
        // Complex object array
        const complexArr = [
            { id: 1, nested: { value: 'a' } },
            { id: 2, nested: { value: 'b' } },
            { id: 1, nested: { value: 'a' } } // Same content but different reference
        ];
        const targetObj = complexArr[0];
        removeFromArray(complexArr, targetObj);
        expect(complexArr).toHaveLength(2);
        expect(complexArr[0]).toEqual({ id: 2, nested: { value: 'b' } });
        expect(complexArr[1]).toEqual({ id: 1, nested: { value: 'a' } });

        // Remove non-existing similar object
        removeFromArray(complexArr, { id: 1, nested: { value: 'a' } });
        expect(complexArr).toHaveLength(2); // No change
    });

    test('should handle arrays with different primitive types', () => {
        let mixedArr: any[] = [1, '1', true, 1n, Symbol('test')];

        // Remove number 1
        removeFromArray(mixedArr, 1);
        expect(mixedArr).toEqual(['1', true, 1n, expect.any(Symbol)]);

        mixedArr = [1, '1', true, 1n, Symbol('test')];

        // Remove string '1'
        removeFromArray(mixedArr, '1');
        expect(mixedArr).toEqual([1, true, 1n, expect.any(Symbol)]);

        const mixedArray: any[] = [
            'string',
            42,
            true,
            null,
            undefined,
            { obj: 'value' },
            [1, 2, 3],
            Symbol('test'),
            () => 'fn',
            new Date(),
            /regex/,
            new Map(),
            new Set()
        ];

        const originalLength = mixedArray.length;

        removeFromArray(mixedArray, 'nonexistent');
        expect(mixedArray).toHaveLength(originalLength);

        // Delete existing element
        removeFromArray(mixedArray, 42);
        expect(mixedArray).toHaveLength(originalLength - 1);
        expect(mixedArray.includes(42)).toBe(false);
    });

    test('should preserve array structure', () => {
        const arr: any[] = [1, 2, 3];
        (arr as any).customProperty = 'test';

        removeFromArray(arr, 2);

        expect(arr.length).toBe(2);
        expect(arr[0]).toBe(1);
        expect(arr[1]).toBe(3);

        expect(arr).toHaveProperty('customProperty', 'test');
        expect((arr as any).customProperty).toBe('test');
    });

    test('should handle array with getter/setter elements', () => {
        const arr: any[] = [1, 2, 3];

        // Add element with getter/setter
        Object.defineProperty(arr, '1', {
            get() {
                return 'getter';
            },
            set() {
                /* setter */
            },
            enumerable: true
        });

        removeFromArray(arr, 'getter');
        expect(arr).toHaveLength(2);
        expect(arr[0]).toBe(1);
        expect(arr[1]).toBe('getter'); // getter still exists
    });

    test('should handle strict equality in removeFromArray', () => {
        const obj1 = { id: 1 };
        const obj2 = { id: 1 }; // Same content but different reference
        const arr = [obj1, obj2];

        removeFromArray(arr, obj1);
        expect(arr).toHaveLength(1);
        expect(arr[0]).toBe(obj2);

        // Objects with same content but different reference will not be deleted
        removeFromArray(arr, { id: 1 });
        expect(arr).toHaveLength(1);
    });
});

describe('isValidConfirmHookResult', () => {
    test('should return true for boolean values', () => {
        expect(isValidConfirmHookResult(true)).toBe(false);
        expect(isValidConfirmHookResult(false)).toBe(true);
        // Does not accept new Boolean() wrapped boolean values
        expect(isValidConfirmHookResult(new Boolean(true))).toBe(false);
        expect(isValidConfirmHookResult(new Boolean(false))).toBe(false);
    });

    test('should return true for string values', () => {
        expect(isValidConfirmHookResult('')).toBe(true);
        expect(isValidConfirmHookResult('0')).toBe(true);
        expect(isValidConfirmHookResult('1')).toBe(true);
        expect(isValidConfirmHookResult('test')).toBe(true);
        // Does not accept new String() wrapped strings
        expect(isValidConfirmHookResult(new String(''))).toBe(false);
        expect(isValidConfirmHookResult(new String('0'))).toBe(false);
        expect(isValidConfirmHookResult(new String('1'))).toBe(false);
        expect(isValidConfirmHookResult(new String('test'))).toBe(false);
    });

    test('should return true for function values', () => {
        expect(isValidConfirmHookResult(() => {})).toBe(true);
        expect(isValidConfirmHookResult(async () => {})).toBe(true);
        expect(isValidConfirmHookResult(new Function('return 1;'))).toBe(true);
        expect(isValidConfirmHookResult(AsyncFunction('return 1;'))).toBe(true);
    });

    test('should return true for plain objects', () => {
        expect(isValidConfirmHookResult({})).toBe(true);
        expect(isValidConfirmHookResult({ key: 'value' })).toBe(true);
        expect(isValidConfirmHookResult(new Object())).toBe(true);
        expect(isValidConfirmHookResult(Object.create(null))).toBe(true);
        expect(isValidConfirmHookResult(Object.create({}))).toBe(true);
        expect(isValidConfirmHookResult(Object.create(Object.prototype))).toBe(
            true
        );
        expect(isValidConfirmHookResult({ __proto__: null })).toBe(true);
        expect(isValidConfirmHookResult({ [Symbol.toStringTag]: 'Tag' })).toBe(
            true
        );
        expect(
            isValidConfirmHookResult({
                toString: () => '[object CustomObject]'
            })
        ).toBe(true);
        expect(isValidConfirmHookResult(Math)).toBe(true);
        expect(isValidConfirmHookResult(JSON)).toBe(true);
    });

    test('should return false for invalid types', () => {
        // Special values
        expect(isValidConfirmHookResult(null)).toBe(false);
        expect(isValidConfirmHookResult(void 0)).toBe(false);
        // Numbers & bigint
        expect(isValidConfirmHookResult(123)).toBe(false);
        expect(isValidConfirmHookResult(0)).toBe(false);
        expect(isValidConfirmHookResult(123n)).toBe(false);
        expect(isValidConfirmHookResult(0n)).toBe(false);
        expect(isValidConfirmHookResult(new Number('1'))).toBe(false);
        expect(isValidConfirmHookResult(+'a')).toBe(false);
        expect(isValidConfirmHookResult(Number.NaN)).toBe(false);
        expect(isValidConfirmHookResult(new Number('a'))).toBe(false);
        // Arrays
        expect(isValidConfirmHookResult([])).toBe(false);
        expect(isValidConfirmHookResult(['a', 'b'])).toBe(false);
        expect(isValidConfirmHookResult(new Array())).toBe(false);
        expect(isValidConfirmHookResult(new Array(1, 2, 3))).toBe(false);
        expect(isValidConfirmHookResult(new Array(1))).toBe(false);
        expect(isValidConfirmHookResult(new Uint8Array(8))).toBe(false);
        expect(isValidConfirmHookResult(new ArrayBuffer(8))).toBe(false);
        expect(isValidConfirmHookResult(new DataView(new ArrayBuffer(8)))).toBe(
            false
        );
        // Special objects
        expect(isValidConfirmHookResult(new Date())).toBe(false);
        expect(isValidConfirmHookResult(Symbol('test'))).toBe(false);
        expect(isValidConfirmHookResult(new Map())).toBe(false);
        expect(isValidConfirmHookResult(new Set())).toBe(false);
        expect(isValidConfirmHookResult(new WeakMap())).toBe(false);
        expect(isValidConfirmHookResult(new WeakSet())).toBe(false);
        expect(isValidConfirmHookResult(/test/)).toBe(false);
        expect(isValidConfirmHookResult(new Error('test'))).toBe(false);
        expect(isValidConfirmHookResult(Promise.resolve())).toBe(false);
        expect(isValidConfirmHookResult(new URL('https://example.com'))).toBe(
            false
        );
        expect(isValidConfirmHookResult(new URLSearchParams('key=value'))).toBe(
            false
        );
        expect(isValidConfirmHookResult(new Blob(['test']))).toBe(false);
        expect(isValidConfirmHookResult(new File(['test'], 'file.txt'))).toBe(
            false
        );
    });

    test('should handle edge cases for confirmation hook results', () => {
        // Promise related - should return false
        expect(isValidConfirmHookResult(Promise.resolve(true))).toBe(false);

        // Handle rejected promise to avoid unhandled rejection
        const rejectedPromise = Promise.reject(false);
        rejectedPromise.catch(() => {}); // Prevent unhandled rejection
        expect(isValidConfirmHookResult(rejectedPromise)).toBe(false);

        // Async functions return Promise, but the function itself is valid
        const asyncFn = async () => true;
        expect(isValidConfirmHookResult(asyncFn)).toBe(true);

        // Arrow functions and regular functions
        expect(isValidConfirmHookResult((x: number) => x > 0)).toBe(true);
        expect(isValidConfirmHookResult((x: number) => x > 0)).toBe(true);

        // Generator function
        expect(
            isValidConfirmHookResult(function* () {
                yield 1;
            })
        ).toBe(true);

        // Class constructor
        class TestClass {}
        expect(isValidConfirmHookResult(TestClass)).toBe(true);
    });

    test('should handle objects with Symbol properties', () => {
        // Objects containing Symbol properties
        const symKey = Symbol('key');
        const objWithSymbol = { [symKey]: 'value', regular: 'prop' };
        expect(isValidConfirmHookResult(objWithSymbol)).toBe(true);

        // Symbol.toStringTag object
        const objWithToStringTag = { [Symbol.toStringTag]: 'CustomObject' };
        expect(isValidConfirmHookResult(objWithToStringTag)).toBe(true);
    });

    test('should handle frozen and sealed objects', () => {
        // Frozen objects
        const frozenObj = Object.freeze({ frozen: true });
        expect(isValidConfirmHookResult(frozenObj)).toBe(true);

        // Sealed objects
        const sealedObj = Object.seal({ sealed: true });
        expect(isValidConfirmHookResult(sealedObj)).toBe(true);

        // Non-extensible object
        const nonExtensibleObj = Object.preventExtensions({
            nonExtensible: true
        });
        expect(isValidConfirmHookResult(nonExtensibleObj)).toBe(true);
    });

    test('should handle function edge cases', () => {
        // Bound function
        const originalFn = function (this: any, x: number) {
            return this.value + x;
        };
        const boundFn = originalFn.bind({ value: 10 });
        expect(isValidConfirmHookResult(boundFn)).toBe(true);

        // Function call and apply methods
        expect(isValidConfirmHookResult(originalFn.call)).toBe(true);
        expect(isValidConfirmHookResult(originalFn.apply)).toBe(true);

        // Built-in functions
        expect(isValidConfirmHookResult(console.log)).toBe(true);
        expect(isValidConfirmHookResult(Math.max)).toBe(true);
        expect(isValidConfirmHookResult(Array.prototype.push)).toBe(true);
    });

    test('should handle class and constructor edge cases', () => {
        // Class instance - according to actual implementation, class instances are identified as objects through toString check
        class TestClass {
            constructor(public value: number) {}
        }
        expect(isValidConfirmHookResult(new TestClass(42))).toBe(true); // Class instance passes isPlainObject check

        // Inherited class instance
        class ChildClass extends TestClass {}
        expect(isValidConfirmHookResult(new ChildClass(42))).toBe(true); // Also identified as object

        // Error instances
        expect(isValidConfirmHookResult(new Error('test'))).toBe(false);
        expect(isValidConfirmHookResult(new TypeError('test'))).toBe(false);
    });
});

describe('Performance Tests', () => {
    test('should handle large arrays efficiently in removeFromArray', () => {
        const largeArray = Array.from({ length: 10000 }, (_, i) => i);
        const target = 5000;

        const start = performance.now();
        removeFromArray(largeArray, target);
        const end = performance.now();

        expect(largeArray).toHaveLength(9999);
        expect(largeArray.includes(target)).toBe(false);
        expect(end - start).toBeLessThan(100); // Should complete within 100ms
    });

    test('should handle multiple rapid calls to utility functions', () => {
        const iterations = 1000;
        const start = performance.now();

        for (let i = 0; i < iterations; ++i) {
            isNotNullish(i);
            isPlainObject({ value: i });
            isValidConfirmHookResult(false);
        }

        const end = performance.now();
        expect(end - start).toBeLessThan(50); // Should complete within 50ms
    });

    test('should handle rapid array modifications', () => {
        const arr = [1, 2, 3, 4, 5];
        const start = performance.now();

        // Perform multiple delete operations quickly
        removeFromArray(arr, 3);
        removeFromArray(arr, 1);
        removeFromArray(arr, 5);
        removeFromArray(arr, 99); // Non-existing element

        const end = performance.now();
        expect(arr).toEqual([2, 4]);
        expect(end - start).toBeLessThan(10); // Should be very fast
    });
});

// Error handling and boundary tests
describe('Error Handling Tests', () => {
    test('should handle circular references in objects', () => {
        const circularObj: any = { name: 'circular' };
        circularObj.self = circularObj;

        // These functions should handle circular references without crashing
        expect(() => isPlainObject(circularObj)).not.toThrow();
        expect(() => isValidConfirmHookResult(circularObj)).not.toThrow();
        expect(() => isNotNullish(circularObj)).not.toThrow();

        expect(isPlainObject(circularObj)).toBe(true);
        expect(isValidConfirmHookResult(circularObj)).toBe(true);
        expect(isNotNullish(circularObj)).toBe(true);
    });
});

describe('isUrlEqual', () => {
    test('should return false when url2 is null or undefined', () => {
        const url1 = new URL('https://example.com/path');

        // Test comparison with null
        expect(isUrlEqual(url1, null)).toBe(false);

        // Test comparison with undefined (optional parameter not provided)
        expect(isUrlEqual(url1, undefined)).toBe(false);

        // Test omitting second parameter (automatically undefined)
        expect(isUrlEqual(url1)).toBe(false);

        const urlWithQuery = new URL('https://example.com/path?a=1&b=2');
        expect(isUrlEqual(urlWithQuery, null)).toBe(false);
        expect(isUrlEqual(urlWithQuery, undefined)).toBe(false);
        expect(isUrlEqual(urlWithQuery)).toBe(false);

        const urlWithHash = new URL('https://example.com/path#section');
        expect(isUrlEqual(urlWithHash, null)).toBe(false);
        expect(isUrlEqual(urlWithHash)).toBe(false);

        const urlWithUserInfo = new URL('https://user:pass@example.com/path');
        expect(isUrlEqual(urlWithUserInfo, null)).toBe(false);
        expect(isUrlEqual(urlWithUserInfo)).toBe(false);
    });

    test('should return true for identical URL objects', () => {
        const url1 = new URL('https://example.com/path?a=1&b=2');
        const url2 = new URL('https://example.com/path?a=1&b=2');
        expect(isUrlEqual(url1, url2)).toBe(true);
    });

    test('should return true for same reference', () => {
        const url = new URL('https://example.com/path');
        expect(isUrlEqual(url, url)).toBe(true);
    });

    test('should return false for different protocols', () => {
        const url1 = new URL('http://example.com/path');
        const url2 = new URL('https://example.com/path');
        expect(isUrlEqual(url1, url2)).toBe(false);
    });

    test('should return false for different hostnames', () => {
        const url1 = new URL('https://example.com/path');
        const url2 = new URL('https://test.com/path');
        expect(isUrlEqual(url1, url2)).toBe(false);
    });

    test('should return false for different ports', () => {
        const url1 = new URL('https://example.com:8080/path');
        const url2 = new URL('https://example.com:9090/path');
        expect(isUrlEqual(url1, url2)).toBe(false);
    });

    test('should return false for different pathnames', () => {
        const url1 = new URL('https://example.com/path1');
        const url2 = new URL('https://example.com/path2');
        expect(isUrlEqual(url1, url2)).toBe(false);
    });

    test('should return false for different hashes', () => {
        const url1 = new URL('https://example.com/path#section1');
        const url2 = new URL('https://example.com/path#section2');
        expect(isUrlEqual(url1, url2)).toBe(false);
    });

    test('should handle empty hashes correctly', () => {
        const url1 = new URL('https://example.com/path');
        const url2 = new URL('https://example.com/path#');
        expect(isUrlEqual(url1, url2)).toBe(true); // Both hashes are empty strings, should be equal
    });

    test('should ignore query parameter order', () => {
        const url1 = new URL('https://example.com/path?a=1&b=2&c=3');
        const url2 = new URL('https://example.com/path?c=3&a=1&b=2');
        expect(isUrlEqual(url1, url2)).toBe(true);
    });

    test('should handle duplicate query parameters correctly', () => {
        const url1 = new URL('https://example.com/path?a=1&a=2&b=3');
        const url2 = new URL('https://example.com/path?b=3&a=2&a=1');
        // url1's query `a` should be 2, but url2's query `a` should be 1, so they should not be equal
        expect(isUrlEqual(url1, url2)).toBe(false);
    });

    test('should return false for different duplicate parameter values', () => {
        const url1 = new URL('https://example.com/path?a=1&a=2');
        const url2 = new URL('https://example.com/path?a=1&a=3');
        expect(isUrlEqual(url1, url2)).toBe(false);
    });

    test('should return false for different number of duplicate parameters', () => {
        const url1 = new URL('https://example.com/path?a=1&a=2');
        const url2 = new URL('https://example.com/path?a=1');
        expect(isUrlEqual(url1, url2)).toBe(false);
    });

    test('should handle complex query parameter scenarios', () => {
        const url1 = new URL(
            'https://example.com/path?tag=red&tag=blue&category=tech&tag=green'
        );
        const url2 = new URL(
            'https://example.com/path?category=tech&tag=blue&tag=green&tag=red'
        );
        // query `tag` one is green and one is red, so they are different
        expect(isUrlEqual(url1, url2)).toBe(false);

        const url3 = new URL(
            'https://example.com/path?search=hello%20world&filter=a%26b'
        );
        const url4 = new URL(
            'https://example.com/path?filter=a%26b&search=hello%20world'
        );
        expect(isUrlEqual(url3, url4)).toBe(true);
    });

    test('should handle empty query parameters', () => {
        const url1 = new URL('https://example.com/path?');
        const url2 = new URL('https://example.com/path');
        expect(isUrlEqual(url1, url2)).toBe(true);

        const url3 = new URL('https://example.com/path?a=');
        const url4 = new URL('https://example.com/path?a=');
        expect(isUrlEqual(url3, url4)).toBe(true);
    });

    test('should handle URLs with userinfo', () => {
        const url1 = new URL('https://user:pass@example.com/path');
        const url2 = new URL('https://user:pass@example.com/path');
        expect(isUrlEqual(url1, url2)).toBe(true);

        const url3 = new URL('https://user1:pass@example.com/path');
        const url4 = new URL('https://user2:pass@example.com/path');
        expect(isUrlEqual(url3, url4)).toBe(false);
    });

    test('should handle default ports correctly', () => {
        const url1 = new URL('https://example.com/path');
        const url2 = new URL('https://example.com:443/path');
        expect(isUrlEqual(url1, url2)).toBe(true);

        const url3 = new URL('http://example.com/path');
        const url4 = new URL('http://example.com:80/path');
        expect(isUrlEqual(url3, url4)).toBe(true);
    });

    test('should handle trailing slashes in pathnames', () => {
        const url1 = new URL('https://example.com/path/');
        const url2 = new URL('https://example.com/path');
        expect(isUrlEqual(url1, url2)).toBe(false);
    });

    test('should handle case sensitivity correctly', () => {
        // Hostname should be case-insensitive (handled by URL constructor)
        const url1 = new URL('https://Example.Com/path');
        const url2 = new URL('https://example.com/path');
        expect(isUrlEqual(url1, url2)).toBe(true);

        // Paths are case-sensitive
        const url3 = new URL('https://example.com/Path');
        const url4 = new URL('https://example.com/path');
        expect(isUrlEqual(url3, url4)).toBe(false);

        // Query parameters are case-sensitive
        const url5 = new URL('https://example.com/path?Key=Value');
        const url6 = new URL('https://example.com/path?key=value');
        expect(isUrlEqual(url5, url6)).toBe(false);
    });

    test('should handle special characters in URLs', () => {
        const url1 = new URL(
            'https://example.com/path with spaces?q=hello world'
        );
        const url2 = new URL(
            'https://example.com/path%20with%20spaces?q=hello%20world'
        );
        expect(isUrlEqual(url1, url2)).toBe(true);

        const url3 = new URL('https://example.com/path?unicode=测试');
        const url4 = new URL(
            'https://example.com/path?unicode=%E6%B5%8B%E8%AF%95'
        );
        expect(isUrlEqual(url3, url4)).toBe(true);
    });

    test('should handle edge cases with empty values', () => {
        // Empty query parameter values
        const url1 = new URL('https://example.com/path?a=&b=test');
        const url2 = new URL('https://example.com/path?b=test&a=');
        expect(isUrlEqual(url1, url2)).toBe(true);

        // Parameters with only keys but no values
        const url3 = new URL('https://example.com/path?flag');
        const url4 = new URL('https://example.com/path?flag=');
        expect(isUrlEqual(url3, url4)).toBe(true);
    });

    test('should handle performance with many parameters', () => {
        // Build URL with many parameters
        const params1 = new URLSearchParams();
        const params2 = new URLSearchParams();

        // Add 100 parameters in different order
        for (let i = 0; i < 100; i++) {
            params1.append(`param${i}`, `value${i}`);
            params2.append(`param${99 - i}`, `value${99 - i}`);
        }

        const url1 = new URL(`https://example.com/path?${params1}`);
        const url2 = new URL(`https://example.com/path?${params2}`);

        const start = performance.now();
        const result = isUrlEqual(url1, url2);
        const end = performance.now();

        expect(result).toBe(true);
        expect(end - start).toBeLessThan(50); // Should complete within 50ms
    });

    test('should handle complex real-world scenarios', () => {
        const baseUrl = 'https://api.example.com/v1/users';

        // Pagination and filter parameters
        const url1 = new URL(
            `${baseUrl}?page=1&limit=20&sort=name&filter=active&tag=user&tag=admin`
        );
        const url2 = new URL(
            `${baseUrl}?limit=20&tag=user&page=1&tag=admin&filter=active&sort=name`
        );
        expect(isUrlEqual(url1, url2)).toBe(true);

        // OAuth parameters
        const oauthUrl1 = new URL(
            'https://oauth.example.com/authorize?client_id=123&redirect_uri=https%3A%2F%2Fapp.com%2Fcallback&scope=read%20write&state=random123'
        );
        const oauthUrl2 = new URL(
            'https://oauth.example.com/authorize?scope=read%20write&state=random123&client_id=123&redirect_uri=https%3A%2F%2Fapp.com%2Fcallback'
        );
        expect(isUrlEqual(oauthUrl1, oauthUrl2)).toBe(true);
    });
});

describe('isRouteMatched', () => {
    const createOptions = (): RouterParsedOptions => {
        return parsedOptions({
            base: new URL('http://localhost:3000/'),
            routes: [
                { path: '/user/:id', component: 'UserComponent' },
                { path: '/settings', component: 'SettingsComponent' }
            ]
        });
    };

    describe('route match type', () => {
        test('should match routes with same config', () => {
            const options = createOptions();
            const route1 = new Route({
                options,
                toType: RouteType.push,
                toInput: '/user/123'
            });
            const route2 = new Route({
                options,
                toType: RouteType.push,
                toInput: '/user/456'
            });

            expect(isRouteMatched(route1, route2, 'route')).toBe(true);
        });

        test('should not match routes with different config', () => {
            const options = createOptions();
            const route1 = new Route({
                options,
                toType: RouteType.push,
                toInput: '/user/123'
            });
            const route2 = new Route({
                options,
                toType: RouteType.push,
                toInput: '/settings'
            });

            expect(isRouteMatched(route1, route2, 'route')).toBe(false);
        });

        test('should return false when second route is null', () => {
            const options = createOptions();
            const route1 = new Route({
                options,
                toType: RouteType.push,
                toInput: '/user/123'
            });

            expect(isRouteMatched(route1, null, 'route')).toBe(false);
        });
    });

    describe('exact match type', () => {
        test('should match routes with same fullPath', () => {
            const options = createOptions();
            const route1 = new Route({
                options,
                toType: RouteType.push,
                toInput: '/user/123?tab=profile'
            });
            const route2 = new Route({
                options,
                toType: RouteType.push,
                toInput: '/user/123?tab=profile'
            });

            expect(isRouteMatched(route1, route2, 'exact')).toBe(true);
        });

        test('should not match routes with different fullPath', () => {
            const options = createOptions();
            const route1 = new Route({
                options,
                toType: RouteType.push,
                toInput: '/user/123?tab=profile'
            });
            const route2 = new Route({
                options,
                toType: RouteType.push,
                toInput: '/user/123?tab=settings'
            });

            expect(isRouteMatched(route1, route2, 'exact')).toBe(false);
        });

        test('should not match routes with same path but different query', () => {
            const options = createOptions();
            const route1 = new Route({
                options,
                toType: RouteType.push,
                toInput: '/user/123'
            });
            const route2 = new Route({
                options,
                toType: RouteType.push,
                toInput: '/user/123?tab=profile'
            });

            expect(isRouteMatched(route1, route2, 'exact')).toBe(false);
        });
    });

    describe('include match type', () => {
        test('should match when route1 fullPath starts with route2 fullPath', () => {
            const options = createOptions();
            const route1 = new Route({
                options,
                toType: RouteType.push,
                toInput: '/user/123/profile/settings'
            });
            const route2 = new Route({
                options,
                toType: RouteType.push,
                toInput: '/user/123'
            });

            expect(isRouteMatched(route1, route2, 'include')).toBe(true);
        });

        test('should match when fullPaths are exactly the same', () => {
            const options = createOptions();
            const route1 = new Route({
                options,
                toType: RouteType.push,
                toInput: '/user/123'
            });
            const route2 = new Route({
                options,
                toType: RouteType.push,
                toInput: '/user/123'
            });

            expect(isRouteMatched(route1, route2, 'include')).toBe(true);
        });

        test('should not match when route1 fullPath does not start with route2 fullPath', () => {
            const options = createOptions();
            const route1 = new Route({
                options,
                toType: RouteType.push,
                toInput: '/user/123'
            });
            const route2 = new Route({
                options,
                toType: RouteType.push,
                toInput: '/user/456'
            });

            expect(isRouteMatched(route1, route2, 'include')).toBe(false);
        });

        test('should not match when route2 fullPath is longer', () => {
            const options = createOptions();
            const route1 = new Route({
                options,
                toType: RouteType.push,
                toInput: '/user'
            });
            const route2 = new Route({
                options,
                toType: RouteType.push,
                toInput: '/user/123'
            });

            expect(isRouteMatched(route1, route2, 'include')).toBe(false);
        });
    });

    describe('edge cases', () => {
        test('should handle root path correctly', () => {
            const options = createOptions();
            const route1 = new Route({ options });
            const route2 = new Route({ options });

            expect(isRouteMatched(route1, route2, 'route')).toBe(true);
            expect(isRouteMatched(route1, route2, 'exact')).toBe(true);
            expect(isRouteMatched(route1, route2, 'include')).toBe(true);
        });

        test('should handle hash in fullPath', () => {
            const options = createOptions();
            const route1 = new Route({
                options,
                toType: RouteType.push,
                toInput: '/user/123#section1'
            });
            const route2 = new Route({
                options,
                toType: RouteType.push,
                toInput: '/user/123#section2'
            });

            expect(isRouteMatched(route1, route2, 'route')).toBe(true);
            expect(isRouteMatched(route1, route2, 'exact')).toBe(false);
        });

        test('should return false for invalid match type', () => {
            const options = createOptions();
            const route1 = new Route({
                options,
                toType: RouteType.push,
                toInput: '/user/123'
            });
            const route2 = new Route({
                options,
                toType: RouteType.push,
                toInput: '/user/123'
            });

            // @ts-expect-error - testing invalid match type
            expect(isRouteMatched(route1, route2, 'invalid')).toBe(false);
        });
    });
});
