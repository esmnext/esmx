import { describe, expect, test } from 'vitest';
import {
    isESModule,
    isNotNullish,
    isObject,
    isValidConfirmHookResult,
    removeFromArray
} from './util';

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

describe('isNotNullish', () => {
    test('should return true for non-nullish values', () => {
        expect(isNotNullish(Number.NaN)).toBe(false);
        expect(isNotNullish(0)).toBe(true);
        expect(isNotNullish('')).toBe(true);
        expect(isNotNullish(false)).toBe(true);
        expect(isNotNullish({})).toBe(true);
        expect(isNotNullish([])).toBe(true);
    });
});

describe('isObject', () => {
    test('should return true for plain objects', () => {
        expect(isObject({})).toBe(true);
        expect(isObject({ key: 'value' })).toBe(true);
    });

    test('should return false for non-plain objects', () => {
        expect(isObject(null)).toBe(false);
        expect(isObject(undefined)).toBe(false);
        expect(isObject([])).toBe(false);
        expect(isObject('string')).toBe(false);
        expect(isObject(123)).toBe(false);
        expect(isObject(() => {})).toBe(false);
        expect(isObject(new Date())).toBe(false);
    });
});

describe('removeFromArray', () => {
    test('should remove first occurrence when duplicates exist', () => {
        const arr = [1, 2, 2, 3];
        removeFromArray(arr, 2);
        expect(arr).toEqual([1, 2, 3]);
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
    });

    test('should return true for string values', () => {
        expect(isValidConfirmHookResult('')).toBe(true);
        expect(isValidConfirmHookResult('test')).toBe(true);
    });

    test('should return true for plain objects', () => {
        expect(isValidConfirmHookResult({})).toBe(true);
        expect(isValidConfirmHookResult({ key: 'value' })).toBe(true);
    });

    test('should return false for invalid types', () => {
        expect(isValidConfirmHookResult(null)).toBe(false);
        expect(isValidConfirmHookResult(undefined)).toBe(false);
        expect(isValidConfirmHookResult(123)).toBe(false);
        expect(isValidConfirmHookResult([])).toBe(false);
        expect(isValidConfirmHookResult(() => {})).toBe(true);
    });
});
