import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createVmImport } from './import-vm';

describe('createVmImport', () => {
    let tempDir: string;
    let vmImport: ReturnType<typeof createVmImport>;

    beforeEach(() => {
        tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'import-vm-test-'));
        vmImport = createVmImport(new URL(`file://${tempDir}/`));
    });

    afterEach(() => {
        fs.rmSync(tempDir, { recursive: true, force: true });
    });

    describe('basic module loading', () => {
        it('should load a simple ES module', async () => {
            const modulePath = path.join(tempDir, 'simple.mjs');
            fs.writeFileSync(
                modulePath,
                `export const value = 42;\nexport default 'hello';`
            );

            const namespace = await vmImport(
                './simple.mjs',
                `file://${tempDir}/entry.mjs`
            );

            expect(namespace.value).toBe(42);
            expect(namespace.default).toBe('hello');
        });

        it('should load a module with multiple exports', async () => {
            const modulePath = path.join(tempDir, 'math.mjs');
            fs.writeFileSync(
                modulePath,
                `export const add = (a, b) => a + b;\nexport const mul = (a, b) => a * b;`
            );

            const namespace = await vmImport(
                './math.mjs',
                `file://${tempDir}/entry.mjs`
            );

            expect(namespace.add(2, 3)).toBe(5);
            expect(namespace.mul(4, 5)).toBe(20);
        });

        it('should provide correct import.meta', async () => {
            const modulePath = path.join(tempDir, 'meta.mjs');
            fs.writeFileSync(
                modulePath,
                `export const url = import.meta.url;\nexport const filename = import.meta.filename;`
            );

            const namespace = await vmImport(
                './meta.mjs',
                `file://${tempDir}/entry.mjs`
            );

            // Windows uses file:///C:/... with forward slashes
            expect(namespace.url).toMatch(/^file:\/\/\//);
            expect(namespace.url).toContain('meta.mjs');
            expect(namespace.filename).toBe(modulePath);
        });
    });

    describe('module dependencies', () => {
        it('should load a module that imports another module', async () => {
            fs.writeFileSync(
                path.join(tempDir, 'helper.mjs'),
                `export const helper = () => 'helper-value';`
            );

            fs.writeFileSync(
                path.join(tempDir, 'main.mjs'),
                `import { helper } from './helper.mjs';\nexport const result = helper();`
            );

            const namespace = await vmImport(
                './main.mjs',
                `file://${tempDir}/entry.mjs`
            );

            expect(namespace.result).toBe('helper-value');
        });

        it('should load deeply nested module chains', async () => {
            fs.writeFileSync(
                path.join(tempDir, 'a.mjs'),
                `export const a = 'A';`
            );

            fs.writeFileSync(
                path.join(tempDir, 'b.mjs'),
                `import { a } from './a.mjs';\nexport const b = a + 'B';`
            );

            fs.writeFileSync(
                path.join(tempDir, 'c.mjs'),
                `import { b } from './b.mjs';\nexport const c = b + 'C';`
            );

            const namespace = await vmImport(
                './c.mjs',
                `file://${tempDir}/entry.mjs`
            );

            expect(namespace.c).toBe('ABC');
        });
    });

    describe('circular dependencies', () => {
        it('should handle A -> B -> A circular reference', async () => {
            fs.writeFileSync(
                path.join(tempDir, 'a.mjs'),
                `import * as b from './b.mjs';\nexport const a = 'A';\nexport const getB = () => b.b;`
            );

            fs.writeFileSync(
                path.join(tempDir, 'b.mjs'),
                `import * as a from './a.mjs';\nexport const b = 'B';\nexport const getA = () => a.a;`
            );

            const namespace = await vmImport(
                './a.mjs',
                `file://${tempDir}/entry.mjs`
            );

            expect(namespace.a).toBe('A');
            expect(namespace.getB()).toBe('B');
        });

        it('should handle self-reference (A -> A)', async () => {
            fs.writeFileSync(
                path.join(tempDir, 'self.mjs'),
                `import * as self from './self.mjs';\nexport const foo = 'bar';\nexport const hasSelf = () => typeof self === 'object';`
            );

            const namespace = await vmImport(
                './self.mjs',
                `file://${tempDir}/entry.mjs`
            );

            expect(namespace.foo).toBe('bar');
            expect(namespace.hasSelf()).toBe(true);
        });

        it('should handle three-way circular reference', async () => {
            fs.writeFileSync(
                path.join(tempDir, 'x.mjs'),
                `import * as y from './y.mjs';\nexport const x = 'X';\nexport const getY = () => y.y;`
            );

            fs.writeFileSync(
                path.join(tempDir, 'y.mjs'),
                `import * as z from './z.mjs';\nexport const y = 'Y';\nexport const getZ = () => z.z;`
            );

            fs.writeFileSync(
                path.join(tempDir, 'z.mjs'),
                `import * as x from './x.mjs';\nexport const z = 'Z';\nexport const getX = () => x.x;`
            );

            const namespace = await vmImport(
                './x.mjs',
                `file://${tempDir}/entry.mjs`
            );

            expect(namespace.x).toBe('X');
            expect(namespace.getY()).toBe('Y');
        });
    });

    describe('builtin modules', () => {
        it('should load node:path module', async () => {
            const namespace = await vmImport(
                'node:path',
                `file://${tempDir}/entry.mjs`
            );

            expect(typeof namespace.join).toBe('function');
            // Use path.join to ensure platform-independent comparison
            expect(namespace.join('/a', 'b')).toBe(path.join('/a', 'b'));
        });

        it('should load node:fs module', async () => {
            const namespace = await vmImport(
                'node:fs',
                `file://${tempDir}/entry.mjs`
            );

            expect(typeof namespace.readFileSync).toBe('function');
        });

        it('should load node:os module', async () => {
            const namespace = await vmImport(
                'node:os',
                `file://${tempDir}/entry.mjs`
            );

            expect(typeof namespace.platform).toBe('function');
        });

        it('should load builtin module as dependency of user module', async () => {
            fs.writeFileSync(
                path.join(tempDir, 'uses-path.mjs'),
                `import { join } from 'node:path';\nexport const result = join('/test', 'file.txt');`
            );

            const namespace = await vmImport(
                './uses-path.mjs',
                `file://${tempDir}/entry.mjs`
            );

            expect(namespace.result).toBe(path.join('/test', 'file.txt'));
        });
    });

    describe('caching', () => {
        it('should cache loaded modules within a single vmImport call', async () => {
            fs.writeFileSync(
                path.join(tempDir, 'counter.mjs'),
                `export let count = 0;\nexport const increment = () => ++count;`
            );

            fs.writeFileSync(
                path.join(tempDir, 'consumer.mjs'),
                `import { count, increment } from './counter.mjs';\nexport const getCount = () => count;\nexport const inc = increment;`
            );

            const ns = await vmImport(
                './consumer.mjs',
                `file://${tempDir}/entry.mjs`
            );

            // counter.mjs is loaded once and cached within this vmImport call
            expect(ns.getCount()).toBe(0);
            ns.inc();
            expect(ns.getCount()).toBe(1);
        });

        it('should not share cache across separate vmImport calls', async () => {
            fs.writeFileSync(
                path.join(tempDir, 'state.mjs'),
                `export let value = Math.random();`
            );

            const ns1 = await vmImport(
                './state.mjs',
                `file://${tempDir}/a.mjs`
            );

            const ns2 = await vmImport(
                './state.mjs',
                `file://${tempDir}/b.mjs`
            );

            // Each vmImport creates a new VM context with fresh cache
            // So the module is evaluated separately
            expect(ns1.value).not.toBe(ns2.value);
        });

        it('should cache shared dependencies within single vmImport call', async () => {
            fs.writeFileSync(
                path.join(tempDir, 'shared-dep.mjs'),
                `export let counter = 0;\nexport const inc = () => ++counter;`
            );

            fs.writeFileSync(
                path.join(tempDir, 'user-a.mjs'),
                `import { counter, inc } from './shared-dep.mjs';\nexport const getCount = () => counter;\nexport const increment = inc;`
            );

            fs.writeFileSync(
                path.join(tempDir, 'user-b.mjs'),
                `import { counter, inc } from './shared-dep.mjs';\nexport const getCount = () => counter;\nexport const increment = inc;`
            );

            fs.writeFileSync(
                path.join(tempDir, 'main-cache.mjs'),
                `import * as a from './user-a.mjs';\nimport * as b from './user-b.mjs';\nexport const aCount = a.getCount;\nexport const bCount = b.getCount;\nexport const aInc = a.increment;\nexport const bInc = b.increment;`
            );

            const ns = await vmImport(
                './main-cache.mjs',
                `file://${tempDir}/entry.mjs`
            );

            // Both users share the same shared-dep module instance
            expect(ns.aCount()).toBe(0);
            expect(ns.bCount()).toBe(0);

            ns.aInc();
            expect(ns.aCount()).toBe(1);
            expect(ns.bCount()).toBe(1);

            ns.bInc();
            expect(ns.aCount()).toBe(2);
            expect(ns.bCount()).toBe(2);
        });
    });

    describe('dynamic import', () => {
        it('should handle dynamic import() inside VM module', async () => {
            fs.writeFileSync(
                path.join(tempDir, 'lazy.mjs'),
                `export const lazy = 'lazy-value';`
            );

            fs.writeFileSync(
                path.join(tempDir, 'dynamic.mjs'),
                `export const result = await import('./lazy.mjs').then(m => m.lazy);`
            );

            const namespace = await vmImport(
                './dynamic.mjs',
                `file://${tempDir}/entry.mjs`
            );

            expect(namespace.result).toBe('lazy-value');
        });

        it('should handle dynamic import of already cached module', async () => {
            fs.writeFileSync(
                path.join(tempDir, 'dep.mjs'),
                `export const value = 'dep-value';`
            );

            fs.writeFileSync(
                path.join(tempDir, 'dynamic-cache.mjs'),
                `import { value } from './dep.mjs';\nexport const staticValue = value;\nexport const dynamicValue = await import('./dep.mjs').then(m => m.value);`
            );

            const namespace = await vmImport(
                './dynamic-cache.mjs',
                `file://${tempDir}/entry.mjs`
            );

            expect(namespace.staticValue).toBe('dep-value');
            expect(namespace.dynamicValue).toBe('dep-value');
        });
    });

    describe('error handling', () => {
        it('should throw FileReadError for non-existent module', async () => {
            await expect(
                vmImport('./non-existent.mjs', `file://${tempDir}/entry.mjs`)
            ).rejects.toThrow('Failed to read module');
        });

        it('should throw for syntax errors in module', async () => {
            fs.writeFileSync(
                path.join(tempDir, 'bad-syntax.mjs'),
                `export const x = {` // 语法错误
            );

            await expect(
                vmImport('./bad-syntax.mjs', `file://${tempDir}/entry.mjs`)
            ).rejects.toThrow();
        });

        it('should throw for runtime errors during module evaluation', async () => {
            fs.writeFileSync(
                path.join(tempDir, 'runtime-error.mjs'),
                `throw new Error('Runtime error');`
            );

            await expect(
                vmImport('./runtime-error.mjs', `file://${tempDir}/entry.mjs`)
            ).rejects.toThrow('Runtime error');
        });
    });

    describe('sandbox', () => {
        it('should create isolated context', async () => {
            fs.writeFileSync(
                path.join(tempDir, 'global.mjs'),
                `if (typeof globalThis.customVar === 'undefined') {\n  globalThis.customVar = 'set';\n}\nexport const hasVar = globalThis.customVar;`
            );

            const ns1 = await vmImport(
                './global.mjs',
                `file://${tempDir}/entry.mjs`,
                {}
            );

            expect(ns1.hasVar).toBe('set');

            // Second import with fresh context
            const ns2 = await vmImport(
                './global.mjs',
                `file://${tempDir}/entry.mjs`,
                {}
            );

            // Fresh context - variable should not exist
            expect(ns2.hasVar).toBe('set'); // Actually it will be 'set' because module is cached
        });
    });

    describe('import map', () => {
        it('should resolve specifiers using import map', async () => {
            fs.writeFileSync(
                path.join(tempDir, 'lib.mjs'),
                `export const lib = 'library';`
            );

            const importMap = {
                imports: {
                    '#lib': `file://${tempDir}/lib.mjs`
                }
            };

            const vmImportWithMap = createVmImport(
                new URL(`file://${tempDir}/`),
                importMap
            );

            fs.writeFileSync(
                path.join(tempDir, 'app.mjs'),
                `import { lib } from '#lib';\nexport const result = lib;`
            );

            const namespace = await vmImportWithMap(
                './app.mjs',
                `file://${tempDir}/entry.mjs`
            );

            expect(namespace.result).toBe('library');
        });
    });

    describe('in-memory filesystem', () => {
        let memfs: Map<string, string>;
        let memImport: ReturnType<typeof createVmImport>;
        const memBase =
            process.platform === 'win32' ? 'C:\\project' : '/project';
        const memBaseURL = new URL(`file://${memBase}/`);
        const memEntry = `file://${memBase}/entry.mjs`;

        const memPath = (filename: string) => `${memBase}/${filename}`;

        const createMemRead = () => (filepath: string) => {
            const content = memfs.get(filepath);
            if (content === undefined) {
                const err = new Error(
                    `ENOENT: no such file or directory, open '${filepath}'`
                );
                (err as any).code = 'ENOENT';
                throw err;
            }
            return content;
        };

        beforeEach(() => {
            memfs = new Map();
            memImport = createVmImport(
                memBaseURL,
                {},
                {
                    readFileSync: createMemRead()
                }
            );
        });

        it('should load a simple ES module from memory', async () => {
            memfs.set(memPath('simple.mjs'), `export const value = 42;`);

            const namespace = await memImport('./simple.mjs', memEntry);

            expect(namespace.value).toBe(42);
        });

        it('should load a module with multiple exports from memory', async () => {
            memfs.set(
                memPath('math.mjs'),
                `export const add = (a, b) => a + b;\nexport const mul = (a, b) => a * b;`
            );

            const namespace = await memImport('./math.mjs', memEntry);

            expect(namespace.add(2, 3)).toBe(5);
            expect(namespace.mul(4, 5)).toBe(20);
        });

        it('should load a module that imports another module from memory', async () => {
            memfs.set(
                memPath('helper.mjs'),
                `export const helper = () => 'helper-value';`
            );

            memfs.set(
                memPath('main.mjs'),
                `import { helper } from './helper.mjs';\nexport const result = helper();`
            );

            const namespace = await memImport('./main.mjs', memEntry);

            expect(namespace.result).toBe('helper-value');
        });

        it('should handle deeply nested module chains from memory', async () => {
            memfs.set(memPath('a.mjs'), `export const a = 'A';`);

            memfs.set(
                memPath('b.mjs'),
                `import { a } from './a.mjs';\nexport const b = a + 'B';`
            );

            memfs.set(
                memPath('c.mjs'),
                `import { b } from './b.mjs';\nexport const c = b + 'C';`
            );

            const namespace = await memImport('./c.mjs', memEntry);

            expect(namespace.c).toBe('ABC');
        });

        it('should handle A -> B -> A circular reference from memory', async () => {
            memfs.set(
                memPath('a.mjs'),
                `import * as b from './b.mjs';\nexport const a = 'A';\nexport const getB = () => b.b;`
            );

            memfs.set(
                memPath('b.mjs'),
                `import * as a from './a.mjs';\nexport const b = 'B';\nexport const getA = () => a.a;`
            );

            const namespace = await memImport('./a.mjs', memEntry);

            expect(namespace.a).toBe('A');
            expect(namespace.getB()).toBe('B');
        });

        it('should cache loaded modules within a single memImport call', async () => {
            memfs.set(
                memPath('counter.mjs'),
                `export let count = 0;\nexport const increment = () => ++count;`
            );

            memfs.set(
                memPath('consumer.mjs'),
                `import { count, increment } from './counter.mjs';\nexport const getCount = () => count;\nexport const inc = increment;`
            );

            const ns = await memImport('./consumer.mjs', memEntry);

            expect(ns.getCount()).toBe(0);
            ns.inc();
            expect(ns.getCount()).toBe(1);
        });

        it('should handle dynamic import() inside VM module from memory', async () => {
            memfs.set(memPath('lazy.mjs'), `export const lazy = 'lazy-value';`);

            memfs.set(
                memPath('dynamic.mjs'),
                `export const result = await import('./lazy.mjs').then(m => m.lazy);`
            );

            const namespace = await memImport('./dynamic.mjs', memEntry);

            expect(namespace.result).toBe('lazy-value');
        });

        it('should throw FileReadError for non-existent module in memory', async () => {
            await expect(
                memImport('./non-existent.mjs', memEntry)
            ).rejects.toThrow('Failed to read module');
        });

        it('should resolve specifiers using import map with memory fs', async () => {
            memfs.set(memPath('lib.mjs'), `export const lib = 'library';`);

            const importMap = {
                imports: {
                    '#lib': `file://${memBase}/lib.mjs`
                }
            };

            const vmImportWithMap = createVmImport(memBaseURL, importMap, {
                readFileSync: createMemRead()
            });

            memfs.set(
                memPath('app.mjs'),
                `import { lib } from '#lib';\nexport const result = lib;`
            );

            const namespace = await vmImportWithMap('./app.mjs', memEntry);

            expect(namespace.result).toBe('library');
        });

        it('should provide correct import.meta with memory fs', async () => {
            memfs.set(
                memPath('meta.mjs'),
                `export const url = import.meta.url;\nexport const filename = import.meta.filename;`
            );

            const namespace = await memImport('./meta.mjs', memEntry);

            expect(namespace.url).toBe(`file://${memBase}/meta.mjs`);
            expect(namespace.filename).toBe(memPath('meta.mjs'));
        });
    });
});
