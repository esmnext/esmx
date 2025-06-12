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
        expect(isNotNullish(Number.EPSILON)).toBe(true);
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
        expect(isNotNullish({ [Symbol.toStringTag]: 'Tag' })).toBe(true);
        expect(isNotNullish({ toString: () => '[object CustomObject]' })).toBe(
            true
        );
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
        // Number 构造函数的各种用法
        expect(isNotNullish(Number())).toBe(true); // Number() 返回 0
        expect(isNotNullish(Number(undefined))).toBe(false); // Number(undefined) 返回 NaN
        expect(isNotNullish(Number(null))).toBe(true); // Number(null) 返回 0
        expect(isNotNullish(Number(''))).toBe(true); // Number('') 返回 0
        expect(isNotNullish(Number('0'))).toBe(true); // Number('0') 返回 0
        expect(isNotNullish(Number('123'))).toBe(true); // Number('123') 返回 123

        // new Number 构造函数的各种用法
        expect(isNotNullish(new Number())).toBe(true); // new Number() 返回 Number 对象
        expect(isNotNullish(new Number(undefined))).toBe(false); // new Number(undefined) 包装 NaN
        expect(isNotNullish(new Number(null))).toBe(true); // new Number(null) 包装 0
        expect(isNotNullish(new Number(''))).toBe(true); // new Number('') 包装 0
        expect(isNotNullish(new Number('0'))).toBe(true); // new Number('0') 包装 0
        expect(isNotNullish(new Number('123'))).toBe(true); // new Number('123') 包装 123
    });

    test('should handle various NaN cases', () => {
        // 各种产生 NaN 的情况
        expect(isNotNullish(0 / 0)).toBe(false);
        expect(isNotNullish(Math.sqrt(-1))).toBe(false);
        expect(isNotNullish(Number.parseInt('abc'))).toBe(false);
        expect(isNotNullish(Number.parseFloat('abc'))).toBe(false);
        expect(isNotNullish(Number.NaN)).toBe(false);
        expect(isNotNullish(Number.NaN)).toBe(false);

        // 包装在 Number 对象中的 NaN
        expect(isNotNullish(new Number(Number.NaN))).toBe(false);
        expect(isNotNullish(new Number(0 / 0))).toBe(false);
        expect(isNotNullish(new Number(Number.parseInt('abc')))).toBe(false);
    });

    test('should handle complex objects', () => {
        // 自定义构造函数创建的对象
        class CustomClass {
            constructor(public value: number) {}
        }
        expect(isNotNullish(new CustomClass(123))).toBe(true);

        // 冻结和密封的对象
        const frozenObj = Object.freeze({ a: 1 });
        const sealedObj = Object.seal({ b: 2 });
        expect(isNotNullish(frozenObj)).toBe(true);
        expect(isNotNullish(sealedObj)).toBe(true);

        // 使用 defineProperty 创建的对象
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
        // 特殊值
        expect(isPlainObject(null)).toBe(false);
        expect(isPlainObject(void 0)).toBe(false);
        // 数组 & 类型化数组相关
        expect(isPlainObject([])).toBe(false);
        expect(isPlainObject(['a', 'b'])).toBe(false);
        expect(isPlainObject(new Array())).toBe(false);
        expect(isPlainObject(new Array(1, 2, 3))).toBe(false);
        expect(isPlainObject(new Array(1))).toBe(false);
        expect(isPlainObject(new Uint8Array(8))).toBe(false);
        expect(isPlainObject(new ArrayBuffer(8))).toBe(false);
        expect(isPlainObject(new DataView(new ArrayBuffer(8)))).toBe(false);
        // 字符串
        expect(isPlainObject('')).toBe(false);
        expect(isPlainObject('0')).toBe(false);
        expect(isPlainObject('1')).toBe(false);
        expect(isPlainObject('string')).toBe(false);
        expect(isPlainObject(new String(''))).toBe(false); // typeof (new String('')) === 'object'
        expect(isPlainObject(new String('0'))).toBe(false);
        expect(isPlainObject(new String('1'))).toBe(false);
        expect(isPlainObject(new String('string'))).toBe(false);
        // 布尔值
        expect(isPlainObject(true)).toBe(false);
        expect(isPlainObject(false)).toBe(false);
        expect(isPlainObject(new Boolean(true))).toBe(false);
        expect(isPlainObject(new Boolean(false))).toBe(false);
        // 数字 & bigint
        expect(isPlainObject(0)).toBe(false);
        expect(isPlainObject(0n)).toBe(false);
        expect(isPlainObject(123)).toBe(false);
        expect(isPlainObject(123n)).toBe(false);
        expect(isPlainObject(new Number('1'))).toBe(false);
        expect(isPlainObject(+'a')).toBe(false);
        expect(isPlainObject(Number.NaN)).toBe(false);
        expect(isPlainObject(new Number('a'))).toBe(false);
        // 函数
        expect(isPlainObject(() => {})).toBe(false);
        expect(isPlainObject(async () => {})).toBe(false);
        expect(isPlainObject(new Function('return 1;'))).toBe(false);
        expect(isPlainObject(AsyncFunction('return 1;'))).toBe(false);
        // 特殊对象
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
        // 确保包装对象被正确识别为非对象
        expect(isPlainObject(Object(42))).toBe(false); // 等同于 new Number(42)
        expect(isPlainObject(Object('str'))).toBe(false); // 等同于 new String('str')
        expect(isPlainObject(Object(true))).toBe(false); // 等同于 new Boolean(true)
        expect(isPlainObject(Object(Symbol('sym')))).toBe(false); // Symbol 包装对象
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

        // 对象创建的不同方式
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

        // Symbol 属性的对象应该被认为是空的
        expect(isNonEmptyPlainObject({ [Symbol.toStringTag]: 'Tag' })).toBe(
            false
        );
        expect(isNonEmptyPlainObject({ [Symbol('key')]: 'value' })).toBe(false);
    });

    test('should return false for non-objects', () => {
        // 特殊值
        expect(isNonEmptyPlainObject(null)).toBe(false);
        expect(isNonEmptyPlainObject(void 0)).toBe(false);

        // 原始类型
        expect(isNonEmptyPlainObject('')).toBe(false);
        expect(isNonEmptyPlainObject('non-empty')).toBe(false);
        expect(isNonEmptyPlainObject(0)).toBe(false);
        expect(isNonEmptyPlainObject(123)).toBe(false);
        expect(isNonEmptyPlainObject(0n)).toBe(false);
        expect(isNonEmptyPlainObject(123n)).toBe(false);
        expect(isNonEmptyPlainObject(true)).toBe(false);
        expect(isNonEmptyPlainObject(false)).toBe(false);
        expect(isNonEmptyPlainObject(Symbol('test'))).toBe(false);

        // 数组
        expect(isNonEmptyPlainObject([])).toBe(false);
        expect(isNonEmptyPlainObject(['a', 'b'])).toBe(false);

        // 函数
        expect(isNonEmptyPlainObject(() => {})).toBe(false);
        expect(isNonEmptyPlainObject(async () => {})).toBe(false);

        // 特殊对象类型
        expect(isNonEmptyPlainObject(new Date())).toBe(false);
        expect(isNonEmptyPlainObject(new Map())).toBe(false);
        expect(isNonEmptyPlainObject(new Set())).toBe(false);
        expect(isNonEmptyPlainObject(/test/)).toBe(false);
        expect(isNonEmptyPlainObject(new Error('test'))).toBe(false);
        expect(isNonEmptyPlainObject(Promise.resolve())).toBe(false);

        // 包装对象
        expect(isNonEmptyPlainObject(new String('test'))).toBe(false);
        expect(isNonEmptyPlainObject(new Number(123))).toBe(false);
        expect(isNonEmptyPlainObject(new Boolean(true))).toBe(false);
    });

    test('should handle objects with only inherited properties', () => {
        // 对象只有继承属性，没有自有属性
        const parentObj = { parentProp: 'value' };
        const childObj = Object.create(parentObj);
        expect(isNonEmptyPlainObject(childObj)).toBe(false);

        // 添加自有属性后应该返回 true
        childObj.ownProp = 'own';
        expect(isNonEmptyPlainObject(childObj)).toBe(true);
    });

    test('should handle edge cases', () => {
        // 对象具有非枚举属性
        const objWithNonEnum = {};
        Object.defineProperty(objWithNonEnum, 'nonEnum', {
            value: 'hidden',
            enumerable: false
        });
        expect(isNonEmptyPlainObject(objWithNonEnum)).toBe(false); // Object.keys 不会包含非枚举属性

        Object.defineProperty(objWithNonEnum, 'visible', {
            value: 'visible',
            enumerable: true
        });
        expect(isNonEmptyPlainObject(objWithNonEnum)).toBe(true); // 现在有可枚举属性了

        // 冻结的对象
        const frozenObj = Object.freeze({ prop: 'value' });
        expect(isNonEmptyPlainObject(frozenObj)).toBe(true);

        // 密封的对象
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
        // 空数组
        const emptyArr: any[] = [];
        removeFromArray(emptyArr, 1);
        expect(emptyArr).toEqual([]);

        // 单元素数组 - 移除存在的元素
        const singleArr = [42];
        removeFromArray(singleArr, 42);
        expect(singleArr).toEqual([]);

        // 单元素数组 - 移除不存在的元素
        const singleArr2 = [42];
        removeFromArray(singleArr2, 99);
        expect(singleArr2).toEqual([42]);

        // 所有元素都相同
        const sameArr = [5, 5, 5, 5];
        removeFromArray(sameArr, 5);
        expect(sameArr).toEqual([5, 5, 5]);

        // 包含 undefined 和 null
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
        // 稀疏数组 - 包含空槽的数组
        // biome-ignore lint/suspicious/noSparseArray: skip
        const sparseArr = [1, , 3, , 5];
        removeFromArray(sparseArr, void 0);
        // 长度不应该有变化，空槽不能视作是 undefined 占位
        expect(sparseArr).toHaveLength(5);
        // biome-ignore lint/suspicious/noSparseArray: skip
        expect(sparseArr).toEqual([1, , 3, , 5]);
    });

    test('should handle arrays with complex objects', () => {
        // 复杂对象数组
        const complexArr = [
            { id: 1, nested: { value: 'a' } },
            { id: 2, nested: { value: 'b' } },
            { id: 1, nested: { value: 'a' } } // 内容相同但引用不同
        ];
        const targetObj = complexArr[0];
        removeFromArray(complexArr, targetObj);
        expect(complexArr).toHaveLength(2);
        expect(complexArr[0]).toEqual({ id: 2, nested: { value: 'b' } });
        expect(complexArr[1]).toEqual({ id: 1, nested: { value: 'a' } });

        // 移除不存在的相似对象
        removeFromArray(complexArr, { id: 1, nested: { value: 'a' } });
        expect(complexArr).toHaveLength(2); // 没有变化
    });

    test('should handle arrays with different primitive types', () => {
        let mixedArr: any[] = [1, '1', true, 1n, Symbol('test')];

        // 移除数字 1
        removeFromArray(mixedArr, 1);
        expect(mixedArr).toEqual(['1', true, 1n, expect.any(Symbol)]);

        // 重置数组
        mixedArr = [1, '1', true, 1n, Symbol('test')];

        // 移除字符串 '1'
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

        // 尝试删除不存在的元素
        removeFromArray(mixedArray, 'nonexistent');
        expect(mixedArray).toHaveLength(originalLength);

        // 删除存在的元素
        removeFromArray(mixedArray, 42);
        expect(mixedArray).toHaveLength(originalLength - 1);
        expect(mixedArray.includes(42)).toBe(false);
    });

    test('should preserve array structure', () => {
        // 确保数组的其他属性保持不变
        const arr: any[] = [1, 2, 3];
        (arr as any).customProperty = 'test';

        removeFromArray(arr, 2);

        // 检查数组元素
        expect(arr.length).toBe(2);
        expect(arr[0]).toBe(1);
        expect(arr[1]).toBe(3);

        // 检查自定义属性是否保留
        expect(arr).toHaveProperty('customProperty', 'test');
        expect((arr as any).customProperty).toBe('test');
    });

    test('should handle array with getter/setter elements', () => {
        const arr: any[] = [1, 2, 3];

        // 添加带有 getter/setter 的元素
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
        expect(arr[1]).toBe('getter'); // getter 仍然存在
    });

    test('should handle strict equality in removeFromArray', () => {
        const obj1 = { id: 1 };
        const obj2 = { id: 1 }; // 内容相同但引用不同
        const arr = [obj1, obj2];

        // 只删除引用相同的对象
        removeFromArray(arr, obj1);
        expect(arr).toHaveLength(1);
        expect(arr[0]).toBe(obj2);

        // 内容相同但引用不同的对象不会被删除
        removeFromArray(arr, { id: 1 });
        expect(arr).toHaveLength(1);
    });
});

describe('isValidConfirmHookResult', () => {
    test('should return true for boolean values', () => {
        expect(isValidConfirmHookResult(true)).toBe(false);
        expect(isValidConfirmHookResult(false)).toBe(true);
        // 不接受 new Boolean() 包装的布尔值
        expect(isValidConfirmHookResult(new Boolean(true))).toBe(false);
        expect(isValidConfirmHookResult(new Boolean(false))).toBe(false);
    });

    test('should return true for string values', () => {
        expect(isValidConfirmHookResult('')).toBe(true);
        expect(isValidConfirmHookResult('0')).toBe(true);
        expect(isValidConfirmHookResult('1')).toBe(true);
        expect(isValidConfirmHookResult('test')).toBe(true);
        // 不接受 new String() 包装的字符串
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
        // 测试各种边界情况

        // Promise 相关 - 应该返回 false
        expect(isValidConfirmHookResult(Promise.resolve(true))).toBe(false);

        // Handle rejected promise to avoid unhandled rejection
        const rejectedPromise = Promise.reject(false);
        rejectedPromise.catch(() => {}); // Prevent unhandled rejection
        expect(isValidConfirmHookResult(rejectedPromise)).toBe(false);

        // 异步函数返回的是 Promise，但函数本身是有效的
        const asyncFn = async () => true;
        expect(isValidConfirmHookResult(asyncFn)).toBe(true);

        // 箭头函数和普通函数
        expect(isValidConfirmHookResult((x: number) => x > 0)).toBe(true);
        expect(isValidConfirmHookResult((x: number) => x > 0)).toBe(true);

        // 生成器函数
        expect(
            isValidConfirmHookResult(function* () {
                yield 1;
            })
        ).toBe(true);

        // 类构造函数
        class TestClass {}
        expect(isValidConfirmHookResult(TestClass)).toBe(true);
    });

    test('should handle objects with Symbol properties', () => {
        // 包含 Symbol 属性的对象
        const symKey = Symbol('key');
        const objWithSymbol = { [symKey]: 'value', regular: 'prop' };
        expect(isValidConfirmHookResult(objWithSymbol)).toBe(true);

        // Symbol.toStringTag 对象
        const objWithToStringTag = { [Symbol.toStringTag]: 'CustomObject' };
        expect(isValidConfirmHookResult(objWithToStringTag)).toBe(true);
    });

    test('should handle frozen and sealed objects', () => {
        // 冻结的对象
        const frozenObj = Object.freeze({ frozen: true });
        expect(isValidConfirmHookResult(frozenObj)).toBe(true);

        // 密封的对象
        const sealedObj = Object.seal({ sealed: true });
        expect(isValidConfirmHookResult(sealedObj)).toBe(true);

        // 不可扩展的对象
        const nonExtensibleObj = Object.preventExtensions({
            nonExtensible: true
        });
        expect(isValidConfirmHookResult(nonExtensibleObj)).toBe(true);
    });

    test('should handle function edge cases', () => {
        // 绑定函数
        const originalFn = function (this: any, x: number) {
            return this.value + x;
        };
        const boundFn = originalFn.bind({ value: 10 });
        expect(isValidConfirmHookResult(boundFn)).toBe(true);

        // 函数的 call 和 apply 方法
        expect(isValidConfirmHookResult(originalFn.call)).toBe(true);
        expect(isValidConfirmHookResult(originalFn.apply)).toBe(true);

        // 内置函数
        expect(isValidConfirmHookResult(console.log)).toBe(true);
        expect(isValidConfirmHookResult(Math.max)).toBe(true);
        expect(isValidConfirmHookResult(Array.prototype.push)).toBe(true);
    });

    test('should handle class and constructor edge cases', () => {
        // 类实例 - 根据实际实现，类实例通过 toString 检查被识别为对象
        class TestClass {
            constructor(public value: number) {}
        }
        expect(isValidConfirmHookResult(new TestClass(42))).toBe(true); // 类实例通过 isPlainObject 检查

        // 继承的类实例
        class ChildClass extends TestClass {}
        expect(isValidConfirmHookResult(new ChildClass(42))).toBe(true); // 同样被识别为对象

        // Error 实例
        expect(isValidConfirmHookResult(new Error('test'))).toBe(false);
        expect(isValidConfirmHookResult(new TypeError('test'))).toBe(false);
    });
});

// Performance and stress tests
describe('Performance Tests', () => {
    test('should handle large arrays efficiently in removeFromArray', () => {
        const largeArray = Array.from({ length: 10000 }, (_, i) => i);
        const target = 5000;

        const start = performance.now();
        removeFromArray(largeArray, target);
        const end = performance.now();

        expect(largeArray).toHaveLength(9999);
        expect(largeArray.includes(target)).toBe(false);
        expect(end - start).toBeLessThan(100); // 应该在100ms内完成
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
        expect(end - start).toBeLessThan(50); // 应该在50ms内完成
    });

    test('should handle rapid array modifications', () => {
        const arr = [1, 2, 3, 4, 5];
        const start = performance.now();

        // 快速进行多次删除操作
        removeFromArray(arr, 3);
        removeFromArray(arr, 1);
        removeFromArray(arr, 5);
        removeFromArray(arr, 99); // 不存在的元素

        const end = performance.now();
        expect(arr).toEqual([2, 4]);
        expect(end - start).toBeLessThan(10); // 应该非常快
    });
});

// Error handling and boundary tests
describe('Error Handling Tests', () => {
    test('should handle circular references in objects', () => {
        const circularObj: any = { name: 'circular' };
        circularObj.self = circularObj;

        // 这些函数应该能处理循环引用而不崩溃
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

        // 测试与 null 比较
        expect(isUrlEqual(url1, null)).toBe(false);

        // 测试与 undefined 比较（可选参数未提供）
        expect(isUrlEqual(url1, undefined)).toBe(false);

        // 测试省略第二个参数（自动为 undefined）
        expect(isUrlEqual(url1)).toBe(false);

        // 测试各种不同的 URL 与 null/undefined 比较
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
        expect(isUrlEqual(url1, url2)).toBe(true); // 两者的 hash 都是空字符串，应该相等
    });

    test('should ignore query parameter order', () => {
        const url1 = new URL('https://example.com/path?a=1&b=2&c=3');
        const url2 = new URL('https://example.com/path?c=3&a=1&b=2');
        expect(isUrlEqual(url1, url2)).toBe(true);
    });

    test('should handle duplicate query parameters correctly', () => {
        const url1 = new URL('https://example.com/path?a=1&a=2&b=3');
        const url2 = new URL('https://example.com/path?b=3&a=2&a=1');
        // url1 的 query `a` 应该是 2，但 url2 的 query `a` 应该是 1，因此它们应该是不相等的
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
        // 多个重复参数，不同顺序
        const url1 = new URL(
            'https://example.com/path?tag=red&tag=blue&category=tech&tag=green'
        );
        const url2 = new URL(
            'https://example.com/path?category=tech&tag=blue&tag=green&tag=red'
        );
        // query `tag` 一个是 green 一个是 red，因此不同
        expect(isUrlEqual(url1, url2)).toBe(false);

        // 参数值包含特殊字符
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
        // 主机名应该不区分大小写（由URL构造函数处理）
        const url1 = new URL('https://Example.Com/path');
        const url2 = new URL('https://example.com/path');
        expect(isUrlEqual(url1, url2)).toBe(true);

        // 路径区分大小写
        const url3 = new URL('https://example.com/Path');
        const url4 = new URL('https://example.com/path');
        expect(isUrlEqual(url3, url4)).toBe(false);

        // 查询参数区分大小写
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
        // 空查询参数值
        const url1 = new URL('https://example.com/path?a=&b=test');
        const url2 = new URL('https://example.com/path?b=test&a=');
        expect(isUrlEqual(url1, url2)).toBe(true);

        // 只有键没有值的参数
        const url3 = new URL('https://example.com/path?flag');
        const url4 = new URL('https://example.com/path?flag=');
        expect(isUrlEqual(url3, url4)).toBe(true);
    });

    test('should handle performance with many parameters', () => {
        // 构建包含大量参数的URL
        const params1 = new URLSearchParams();
        const params2 = new URLSearchParams();

        // 添加100个参数，顺序不同
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
        expect(end - start).toBeLessThan(50); // 应该在50ms内完成
    });

    test('should handle complex real-world scenarios', () => {
        // 模拟实际应用中的URL比较场景
        const baseUrl = 'https://api.example.com/v1/users';

        // 分页和过滤参数
        const url1 = new URL(
            `${baseUrl}?page=1&limit=20&sort=name&filter=active&tag=user&tag=admin`
        );
        const url2 = new URL(
            `${baseUrl}?limit=20&tag=user&page=1&tag=admin&filter=active&sort=name`
        );
        expect(isUrlEqual(url1, url2)).toBe(true);

        // OAuth参数
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
                toRaw: '/user/123'
            });
            const route2 = new Route({
                options,
                toType: RouteType.push,
                toRaw: '/user/456'
            });

            expect(isRouteMatched(route1, route2, 'route')).toBe(true);
        });

        test('should not match routes with different config', () => {
            const options = createOptions();
            const route1 = new Route({
                options,
                toType: RouteType.push,
                toRaw: '/user/123'
            });
            const route2 = new Route({
                options,
                toType: RouteType.push,
                toRaw: '/settings'
            });

            expect(isRouteMatched(route1, route2, 'route')).toBe(false);
        });

        test('should return false when second route is null', () => {
            const options = createOptions();
            const route1 = new Route({
                options,
                toType: RouteType.push,
                toRaw: '/user/123'
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
                toRaw: '/user/123?tab=profile'
            });
            const route2 = new Route({
                options,
                toType: RouteType.push,
                toRaw: '/user/123?tab=profile'
            });

            expect(isRouteMatched(route1, route2, 'exact')).toBe(true);
        });

        test('should not match routes with different fullPath', () => {
            const options = createOptions();
            const route1 = new Route({
                options,
                toType: RouteType.push,
                toRaw: '/user/123?tab=profile'
            });
            const route2 = new Route({
                options,
                toType: RouteType.push,
                toRaw: '/user/123?tab=settings'
            });

            expect(isRouteMatched(route1, route2, 'exact')).toBe(false);
        });

        test('should not match routes with same path but different query', () => {
            const options = createOptions();
            const route1 = new Route({
                options,
                toType: RouteType.push,
                toRaw: '/user/123'
            });
            const route2 = new Route({
                options,
                toType: RouteType.push,
                toRaw: '/user/123?tab=profile'
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
                toRaw: '/user/123/profile/settings'
            });
            const route2 = new Route({
                options,
                toType: RouteType.push,
                toRaw: '/user/123'
            });

            expect(isRouteMatched(route1, route2, 'include')).toBe(true);
        });

        test('should match when fullPaths are exactly the same', () => {
            const options = createOptions();
            const route1 = new Route({
                options,
                toType: RouteType.push,
                toRaw: '/user/123'
            });
            const route2 = new Route({
                options,
                toType: RouteType.push,
                toRaw: '/user/123'
            });

            expect(isRouteMatched(route1, route2, 'include')).toBe(true);
        });

        test('should not match when route1 fullPath does not start with route2 fullPath', () => {
            const options = createOptions();
            const route1 = new Route({
                options,
                toType: RouteType.push,
                toRaw: '/user/123'
            });
            const route2 = new Route({
                options,
                toType: RouteType.push,
                toRaw: '/user/456'
            });

            expect(isRouteMatched(route1, route2, 'include')).toBe(false);
        });

        test('should not match when route2 fullPath is longer', () => {
            const options = createOptions();
            const route1 = new Route({
                options,
                toType: RouteType.push,
                toRaw: '/user'
            });
            const route2 = new Route({
                options,
                toType: RouteType.push,
                toRaw: '/user/123'
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
                toRaw: '/user/123#section1'
            });
            const route2 = new Route({
                options,
                toType: RouteType.push,
                toRaw: '/user/123#section2'
            });

            expect(isRouteMatched(route1, route2, 'route')).toBe(true);
            expect(isRouteMatched(route1, route2, 'exact')).toBe(false);
        });

        test('should return false for invalid match type', () => {
            const options = createOptions();
            const route1 = new Route({
                options,
                toType: RouteType.push,
                toRaw: '/user/123'
            });
            const route2 = new Route({
                options,
                toType: RouteType.push,
                toRaw: '/user/123'
            });

            // @ts-expect-error - testing invalid match type
            expect(isRouteMatched(route1, route2, 'invalid')).toBe(false);
        });
    });
});
