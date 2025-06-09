import { describe, expect, test } from 'vitest';
import {
    isESModule,
    isNotNullish,
    isObject,
    isValidConfirmHookResult,
    removeFromArray
} from './util';

const AsyncFunction = (async () => {}).constructor;

describe('isESModule', () => {
    test('should return true for ES module', () => {
        const esModule = { __esModule: true };
        expect(isESModule(esModule)).toBe(true);
    });

    test('should return true for module with Symbol.toStringTag', () => {
        const module = { [Symbol.toStringTag]: 'Module' };
        expect(isESModule(module)).toBe(true);
    });

    test('should return false for non-ES module', () => {
        const obj = {};
        expect(isESModule(obj)).toBe(false);
    });
});

// 字面量和对象包装是存在区别的：
// https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/String#字符串原始值和字符串对象

describe('isNotNullish', () => {
    test('should return true for non-nullish values', () => {
        // 特殊值
        expect(isNotNullish(null)).toBe(false);
        expect(isNotNullish(void 0)).toBe(false);
        // 数字 & bigint
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
        // 字符串
        expect(isNotNullish('')).toBe(true);
        expect(isNotNullish('0')).toBe(true);
        expect(isNotNullish('1')).toBe(true);
        expect(isNotNullish('test')).toBe(true);
        expect(isNotNullish(new String(''))).toBe(true);
        expect(isNotNullish(new String('0'))).toBe(true);
        expect(isNotNullish(new String('1'))).toBe(true);
        expect(isNotNullish(new String('test'))).toBe(true);
        // 布尔值
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
        // 数组 & 类型化数组相关
        expect(isNotNullish([])).toBe(true);
        expect(isNotNullish(['a', 'b'])).toBe(true);
        expect(isNotNullish(new Array())).toBe(true);
        expect(isNotNullish(new Array(1, 2, 3))).toBe(true);
        expect(isNotNullish(new Array(1))).toBe(true);
        expect(isNotNullish(new Uint8Array(8))).toBe(true);
        expect(isNotNullish(new ArrayBuffer(8))).toBe(true);
        expect(isNotNullish(new DataView(new ArrayBuffer(8)))).toBe(true);
        // 函数
        expect(isNotNullish(() => {})).toBe(true);
        expect(isNotNullish(async () => {})).toBe(true);
        expect(isNotNullish(() => {})).toBe(true);
        expect(isNotNullish(async () => {})).toBe(true);
        expect(isNotNullish(new Function('return 1;'))).toBe(true);
        expect(isNotNullish(AsyncFunction('return 1;'))).toBe(true);
        // 特殊对象
        expect(isNotNullish(new Date())).toBe(true);
        expect(isNotNullish(Symbol('test'))).toBe(true);
        expect(isNotNullish(new Map())).toBe(true);
        expect(isNotNullish(new Set())).toBe(true);
        expect(isNotNullish(new WeakMap())).toBe(true);
        expect(isNotNullish(new WeakSet())).toBe(true);
        expect(isNotNullish(/test/)).toBe(true);
        expect(isNotNullish(/test/)).toBe(true);
        expect(isNotNullish(new Error('test'))).toBe(true);
        expect(isNotNullish(Promise.resolve())).toBe(true);
        expect(isNotNullish(new URL('https://example.com'))).toBe(true);
        expect(isNotNullish(new URLSearchParams('key=value'))).toBe(true);
        expect(isNotNullish(new Blob(['test']))).toBe(true);
        expect(isNotNullish(new File(['test'], 'file.txt'))).toBe(true);
        expect(isNotNullish(Math)).toBe(true);
        expect(isNotNullish(JSON)).toBe(true);
    });
});

describe('isObject', () => {
    test('should return true for plain objects', () => {
        expect(isObject({})).toBe(true);
        expect(isObject({ key: 'value' })).toBe(true);
        expect(isObject(new Object())).toBe(true);
        expect(isObject(Object.create(null))).toBe(true);
        expect(isObject(Object.create({}))).toBe(true);
        expect(isObject(Object.create(Object.prototype))).toBe(true);
        expect(isObject({ __proto__: null })).toBe(true);
        expect(isObject({ [Symbol.toStringTag]: 'Tag' })).toBe(true);
        expect(isObject(Math)).toBe(true);
        expect(isObject(JSON)).toBe(true);
    });

    test('should return false for non-plain objects', () => {
        // 特殊值
        expect(isObject(null)).toBe(false);
        expect(isObject(void 0)).toBe(false);
        // 数组 & 类型化数组相关
        expect(isObject([])).toBe(false);
        expect(isObject(['a', 'b'])).toBe(false);
        expect(isObject(new Array())).toBe(false);
        expect(isObject(new Array(1, 2, 3))).toBe(false);
        expect(isObject(new Array(1))).toBe(false);
        expect(isObject(new Uint8Array(8))).toBe(false);
        expect(isObject(new ArrayBuffer(8))).toBe(false);
        expect(isObject(new DataView(new ArrayBuffer(8)))).toBe(false);
        // 字符串
        expect(isObject('')).toBe(false);
        expect(isObject('0')).toBe(false);
        expect(isObject('1')).toBe(false);
        expect(isObject('string')).toBe(false);
        expect(isObject(new String(''))).toBe(false); // typeof (new String('')) === 'object'
        expect(isObject(new String('0'))).toBe(false);
        expect(isObject(new String('1'))).toBe(false);
        expect(isObject(new String('string'))).toBe(false);
        // 布尔值
        expect(isObject(true)).toBe(false);
        expect(isObject(false)).toBe(false);
        expect(isObject(new Boolean(true))).toBe(false);
        expect(isObject(new Boolean(false))).toBe(false);
        // 数字 & bigint
        expect(isObject(0)).toBe(false);
        expect(isObject(0n)).toBe(false);
        expect(isObject(123)).toBe(false);
        expect(isObject(123n)).toBe(false);
        expect(isObject(new Number('1'))).toBe(false);
        expect(isObject(+'a')).toBe(false);
        expect(isObject(Number.NaN)).toBe(false);
        expect(isObject(new Number('a'))).toBe(false);
        // 函数
        expect(isObject(() => {})).toBe(false);
        expect(isObject(async () => {})).toBe(false);
        expect(isObject(() => {})).toBe(false);
        expect(isObject(async () => {})).toBe(false);
        expect(isObject(new Function('return 1;'))).toBe(false);
        expect(isObject(AsyncFunction('return 1;'))).toBe(false);
        // 特殊对象
        expect(isObject(new Date())).toBe(false);
        expect(isObject(Symbol('test'))).toBe(false);
        expect(isObject(new Map())).toBe(false);
        expect(isObject(new Set())).toBe(false);
        expect(isObject(new WeakMap())).toBe(false);
        expect(isObject(new WeakSet())).toBe(false);
        expect(isObject(/test/)).toBe(false);
        expect(isObject(/test/)).toBe(false);
        expect(isObject(new Error('test'))).toBe(false);
        expect(isObject(Promise.resolve())).toBe(false);
        expect(isObject(new URL('https://example.com'))).toBe(false);
        expect(isObject(new URLSearchParams('key=value'))).toBe(false);
        expect(isObject(new Blob(['test']))).toBe(false);
        expect(isObject(new File(['test'], 'file.txt'))).toBe(false);
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
});

describe('isValidConfirmHookResult', () => {
    test('should return true for boolean values', () => {
        expect(isValidConfirmHookResult(true)).toBe(false);
        expect(isValidConfirmHookResult(false)).toBe(true);
        expect(isValidConfirmHookResult(new Boolean(true))).toBe(false);
        expect(isValidConfirmHookResult(new Boolean(false))).toBe(true);
    });

    test('should return true for string values', () => {
        expect(isValidConfirmHookResult('')).toBe(true);
        expect(isValidConfirmHookResult('0')).toBe(true);
        expect(isValidConfirmHookResult('1')).toBe(true);
        expect(isValidConfirmHookResult('test')).toBe(true);
        expect(isValidConfirmHookResult(new String(''))).toBe(true);
        expect(isValidConfirmHookResult(new String('0'))).toBe(true);
        expect(isValidConfirmHookResult(new String('1'))).toBe(true);
        expect(isValidConfirmHookResult(new String('test'))).toBe(true);
    });

    test('should return true for function values', () => {
        expect(isValidConfirmHookResult(() => {})).toBe(true);
        expect(isValidConfirmHookResult(async () => {})).toBe(true);
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
        expect(isValidConfirmHookResult(Math)).toBe(true);
        expect(isValidConfirmHookResult(JSON)).toBe(true);
    });

    test('should return false for invalid types', () => {
        // 特殊值
        expect(isValidConfirmHookResult(null)).toBe(false);
        expect(isValidConfirmHookResult(void 0)).toBe(false);
        // 数字 & bigint
        expect(isValidConfirmHookResult(123)).toBe(false);
        expect(isValidConfirmHookResult(0)).toBe(false);
        expect(isValidConfirmHookResult(123n)).toBe(false);
        expect(isValidConfirmHookResult(0n)).toBe(false);
        expect(isValidConfirmHookResult(new Number('1'))).toBe(false);
        expect(isValidConfirmHookResult(+'a')).toBe(false);
        expect(isValidConfirmHookResult(Number.NaN)).toBe(false);
        expect(isValidConfirmHookResult(new Number('a'))).toBe(false);
        // 数组
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
        // 特殊对象
        expect(isValidConfirmHookResult(new Date())).toBe(false);
        expect(isValidConfirmHookResult(Symbol('test'))).toBe(false);
        expect(isValidConfirmHookResult(new Map())).toBe(false);
        expect(isValidConfirmHookResult(new Set())).toBe(false);
        expect(isValidConfirmHookResult(new WeakMap())).toBe(false);
        expect(isValidConfirmHookResult(new WeakSet())).toBe(false);
        expect(isValidConfirmHookResult(/test/)).toBe(false);
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
});
