import { beforeEach, describe, expect, test } from 'vitest';
import { IncrementId } from './increment-id';

describe('IncrementId', () => {
    let incrementId: IncrementId;

    beforeEach(() => {
        incrementId = new IncrementId();
    });

    describe('初始状态', () => {
        test('应该初始化为 0', () => {
            expect(incrementId.equal(0)).toBe(true);
        });

        test('应该不等于非零值', () => {
            expect(incrementId.equal(1)).toBe(false);
            expect(incrementId.equal(-1)).toBe(false);
            expect(incrementId.equal(100)).toBe(false);
        });
    });

    describe('equal 方法', () => {
        test('应该正确比较相等的值', () => {
            expect(incrementId.equal(0)).toBe(true);

            incrementId.generate(); // 值变为 1
            expect(incrementId.equal(1)).toBe(true);

            incrementId.generate(); // 值变为 2
            expect(incrementId.equal(2)).toBe(true);
        });

        test('应该正确识别不相等的值', () => {
            expect(incrementId.equal(1)).toBe(false);
            expect(incrementId.equal(-1)).toBe(false);

            incrementId.generate(); // 值变为 1
            expect(incrementId.equal(0)).toBe(false);
            expect(incrementId.equal(2)).toBe(false);
        });

        test('应该处理边界值', () => {
            expect(incrementId.equal(Number.MAX_SAFE_INTEGER)).toBe(false);
            expect(incrementId.equal(Number.MIN_SAFE_INTEGER)).toBe(false);
            expect(incrementId.equal(Number.POSITIVE_INFINITY)).toBe(false);
            expect(incrementId.equal(Number.NEGATIVE_INFINITY)).toBe(false);
        });

        test('应该处理特殊数值', () => {
            expect(incrementId.equal(Number.NaN)).toBe(false);
            expect(incrementId.equal(0.5)).toBe(false);
            expect(incrementId.equal(-0.5)).toBe(false);
        });
    });

    describe('generate 方法', () => {
        test('应该从 1 开始生成', () => {
            const firstId = incrementId.generate();
            expect(firstId).toBe(1);
        });

        test('应该递增生成 ID', () => {
            const id1 = incrementId.generate();
            const id2 = incrementId.generate();
            const id3 = incrementId.generate();

            expect(id1).toBe(1);
            expect(id2).toBe(2);
            expect(id3).toBe(3);
        });

        test('应该连续生成唯一 ID', () => {
            const ids: number[] = [];
            for (let i = 0; i < 100; i++) {
                ids.push(incrementId.generate());
            }

            // 检查所有 ID 都是唯一的
            const uniqueIds = new Set(ids);
            expect(uniqueIds.size).toBe(ids.length);

            // 检查 ID 是连续的
            expect(ids).toEqual(Array.from({ length: 100 }, (_, i) => i + 1));
        });

        test('生成后 equal 方法应该反映新值', () => {
            expect(incrementId.equal(0)).toBe(true);

            const id1 = incrementId.generate();
            expect(incrementId.equal(id1)).toBe(true);
            expect(incrementId.equal(0)).toBe(false);

            const id2 = incrementId.generate();
            expect(incrementId.equal(id2)).toBe(true);
            expect(incrementId.equal(id1)).toBe(false);
        });

        test('应该返回生成的 ID 值', () => {
            for (let i = 1; i <= 10; i++) {
                const generatedId = incrementId.generate();
                expect(generatedId).toBe(i);
                expect(incrementId.equal(i)).toBe(true);
            }
        });
    });

    describe('大量生成测试', () => {
        test('应该能够生成大量 ID 而不出错', () => {
            const count = 10000;
            const ids: number[] = [];

            for (let i = 0; i < count; i++) {
                ids.push(incrementId.generate());
            }

            expect(ids.length).toBe(count);
            expect(ids[0]).toBe(1);
            expect(ids[count - 1]).toBe(count);
        });
    });
});

describe('多个实例的独立性', () => {
    test('不同实例应该独立计数', () => {
        const id1 = new IncrementId();
        const id2 = new IncrementId();

        const firstId1 = id1.generate();
        const firstId2 = id2.generate();
        const secondId1 = id1.generate();
        const secondId2 = id2.generate();

        expect(firstId1).toBe(1);
        expect(firstId2).toBe(1);
        expect(secondId1).toBe(2);
        expect(secondId2).toBe(2);

        expect(id1.equal(2)).toBe(true);
        expect(id2.equal(2)).toBe(true);
        expect(id1.equal(1)).toBe(false);
        expect(id2.equal(1)).toBe(false);
    });

    test('应该能够创建多个独立的实例', () => {
        const instances = Array.from({ length: 5 }, () => new IncrementId());

        // 每个实例都从 1 开始
        instances.forEach((instance) => {
            expect(instance.generate()).toBe(1);
        });

        // 每个实例都独立计数
        instances.forEach((instance) => {
            expect(instance.generate()).toBe(2);
            expect(instance.equal(2)).toBe(true);
        });
    });
});

describe('边界情况和错误处理', () => {
    let incrementId: IncrementId;

    beforeEach(() => {
        incrementId = new IncrementId();
    });

    test('equal 方法应该处理非数字参数', () => {
        // TypeScript 会在编译时捕获这些错误，但在运行时测试行为
        expect(incrementId.equal(null as any)).toBe(false);
        expect(incrementId.equal(undefined as any)).toBe(false);
        expect(incrementId.equal('1' as any)).toBe(false);
        expect(incrementId.equal({} as any)).toBe(false);
        expect(incrementId.equal([] as any)).toBe(false);
    });

    test('应该能处理大量调用而不溢出（在合理范围内）', () => {
        // 测试相对较大的数值，但不到会导致性能问题的程度
        for (let i = 0; i < 1000; i++) {
            const id = incrementId.generate();
            expect(id).toBe(i + 1);
            expect(incrementId.equal(id)).toBe(true);
        }
    });
});
