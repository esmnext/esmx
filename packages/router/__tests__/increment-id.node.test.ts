import { beforeEach, describe, expect, test } from 'vitest';
import { IncrementId } from '../src/increment-id';

describe('IncrementId', () => {
    let incrementId: IncrementId;

    beforeEach(() => {
        incrementId = new IncrementId();
    });

    describe('initial state', () => {
        test('should initialize with a value of 0', () => {
            expect(incrementId.equal(0)).toBe(true);
        });

        test('should not be equal to non-zero values', () => {
            expect(incrementId.equal(1)).toBe(false);
            expect(incrementId.equal(-1)).toBe(false);
            expect(incrementId.equal(100)).toBe(false);
        });
    });

    describe('equal method', () => {
        test('should correctly compare equal values', () => {
            expect(incrementId.equal(0)).toBe(true);

            incrementId.next(); // value becomes 1
            expect(incrementId.equal(1)).toBe(true);

            incrementId.next(); // value becomes 2
            expect(incrementId.equal(2)).toBe(true);
        });

        test('should correctly identify unequal values', () => {
            expect(incrementId.equal(1)).toBe(false);
            expect(incrementId.equal(-1)).toBe(false);

            incrementId.next(); // value becomes 1
            expect(incrementId.equal(0)).toBe(false);
            expect(incrementId.equal(2)).toBe(false);
        });

        test('should handle boundary values', () => {
            expect(incrementId.equal(Number.MAX_SAFE_INTEGER)).toBe(false);
            expect(incrementId.equal(Number.MIN_SAFE_INTEGER)).toBe(false);
            expect(incrementId.equal(Number.POSITIVE_INFINITY)).toBe(false);
            expect(incrementId.equal(Number.NEGATIVE_INFINITY)).toBe(false);
        });

        test('should handle special numeric values', () => {
            expect(incrementId.equal(Number.NaN)).toBe(false);
            expect(incrementId.equal(0.5)).toBe(false);
            expect(incrementId.equal(-0.5)).toBe(false);
        });
    });

    describe('next method', () => {
        test('should start generating IDs from 1', () => {
            const firstId = incrementId.next();
            expect(firstId).toBe(1);
        });

        test('should generate incrementing IDs', () => {
            const id1 = incrementId.next();
            const id2 = incrementId.next();
            const id3 = incrementId.next();

            expect(id1).toBe(1);
            expect(id2).toBe(2);
            expect(id3).toBe(3);
        });

        test('should generate a continuous sequence of unique IDs', () => {
            const ids: number[] = [];
            for (let i = 0; i < 100; i++) {
                ids.push(incrementId.next());
            }

            const uniqueIds = new Set(ids);
            expect(uniqueIds.size).toBe(ids.length);

            expect(ids).toEqual(Array.from({ length: 100 }, (_, i) => i + 1));
        });

        test('equal method should reflect the new value after generation', () => {
            expect(incrementId.equal(0)).toBe(true);

            const id1 = incrementId.next();
            expect(incrementId.equal(id1)).toBe(true);
            expect(incrementId.equal(0)).toBe(false);

            const id2 = incrementId.next();
            expect(incrementId.equal(id2)).toBe(true);
            expect(incrementId.equal(id1)).toBe(false);
        });

        test('should return the generated ID value', () => {
            for (let i = 1; i <= 10; i++) {
                const generatedId = incrementId.next();
                expect(generatedId).toBe(i);
                expect(incrementId.equal(i)).toBe(true);
            }
        });
    });

    describe('large scale generation test', () => {
        test('should be able to generate a large number of IDs without errors', () => {
            const count = 10000;
            const ids: number[] = [];

            for (let i = 0; i < count; i++) {
                ids.push(incrementId.next());
            }

            expect(ids.length).toBe(count);
            expect(ids[0]).toBe(1);
            expect(ids[count - 1]).toBe(count);
        });
    });
});

describe('multiple instances independence', () => {
    test('different instances should count independently', () => {
        const id1 = new IncrementId();
        const id2 = new IncrementId();

        const firstId1 = id1.next();
        const firstId2 = id2.next();
        const secondId1 = id1.next();
        const secondId2 = id2.next();

        expect(firstId1).toBe(1);
        expect(firstId2).toBe(1);
        expect(secondId1).toBe(2);
        expect(secondId2).toBe(2);

        expect(id1.equal(2)).toBe(true);
        expect(id2.equal(2)).toBe(true);
        expect(id1.equal(1)).toBe(false);
        expect(id2.equal(1)).toBe(false);
    });

    test('should be able to create multiple independent instances', () => {
        const instances = Array.from({ length: 5 }, () => new IncrementId());

        instances.forEach((instance) => {
            expect(instance.next()).toBe(1);
        });

        instances.forEach((instance) => {
            expect(instance.next()).toBe(2);
            expect(instance.equal(2)).toBe(true);
        });
    });
});

describe('edge cases and error handling', () => {
    let incrementId: IncrementId;

    beforeEach(() => {
        incrementId = new IncrementId();
    });

    test('equal method should handle non-numeric arguments', () => {
        // TypeScript catches these errors at compile time, but this tests the runtime behavior
        expect(incrementId.equal(null as any)).toBe(false);
        expect(incrementId.equal(undefined as any)).toBe(false);
        expect(incrementId.equal('1' as any)).toBe(false);
        expect(incrementId.equal({} as any)).toBe(false);
        expect(incrementId.equal([] as any)).toBe(false);
    });

    test('should handle a large number of calls without overflow (within reasonable limits)', () => {
        for (let i = 0; i < 1000; i++) {
            const id = incrementId.next();
            expect(id).toBe(i + 1);
            expect(incrementId.equal(id)).toBe(true);
        }
    });
});
