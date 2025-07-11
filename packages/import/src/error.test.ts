import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
    CircularDependencyError,
    FileReadError,
    ModuleLoadingError,
    formatCircularDependency,
    formatModuleChain
} from './error';

describe('Module Loading Errors', () => {
    let originalEnv: string | undefined;

    beforeEach(() => {
        originalEnv = process.env.NO_COLOR;
        process.env.NO_COLOR = '1'; // Disable colors for testing
    });

    afterEach(() => {
        if (originalEnv !== undefined) {
            process.env.NO_COLOR = originalEnv;
        } else {
            process.env.NO_COLOR = undefined;
        }
    });

    describe('CircularDependencyError', () => {
        it('should create circular dependency error with correct properties', () => {
            const moduleIds = ['/src/A.js', '/src/B.js'];
            const targetModule = '/src/A.js';

            const error = new CircularDependencyError(
                'Test circular dependency',
                moduleIds,
                targetModule
            );

            expect(error.name).toBe('CircularDependencyError');
            expect(error.message).toBe('Test circular dependency');
            expect(error.moduleIds).toEqual(moduleIds);
            expect(error.targetModule).toBe(targetModule);
            expect(error instanceof ModuleLoadingError).toBe(true);
        });

        it('should format circular dependency in toString', () => {
            const moduleIds = ['/src/A.js', '/src/B.js'];
            const targetModule = '/src/A.js';

            const error = new CircularDependencyError(
                'Circular dependency detected',
                moduleIds,
                targetModule
            );

            const formatted = error.toString();

            // Calculate expected relative paths
            const relativeA = path.relative(process.cwd(), '/src/A.js');
            const relativeB = path.relative(process.cwd(), '/src/B.js');

            expect(formatted).toContain('CircularDependencyError');
            expect(formatted).toContain('Circular dependency detected');
            expect(formatted).toContain(`┌─ ${relativeA}`);
            expect(formatted).toContain(`├─ ${relativeB}`);
            expect(formatted).toContain(`└─ ${relativeA}`);
            expect(formatted).toContain('circular');
        });
    });

    describe('FileReadError', () => {
        it('should create file read error with correct properties', () => {
            const moduleIds = ['/src/main.js', '/src/components/App.js'];
            const targetModule = '/src/missing.js';
            const originalError = new Error(
                'ENOENT: no such file or directory'
            );

            const error = new FileReadError(
                'Failed to read module',
                moduleIds,
                targetModule,
                originalError
            );

            expect(error.name).toBe('FileReadError');
            expect(error.message).toBe('Failed to read module');
            expect(error.moduleIds).toEqual(moduleIds);
            expect(error.targetModule).toBe(targetModule);
            expect(error.originalError).toBe(originalError);
            expect(error instanceof ModuleLoadingError).toBe(true);
        });

        it('should format module chain in toString', () => {
            const moduleIds = ['/src/main.js', '/src/components/App.js'];
            const targetModule = '/src/missing.js';
            const originalError = new Error(
                'ENOENT: no such file or directory'
            );

            const error = new FileReadError(
                'Failed to read module',
                moduleIds,
                targetModule,
                originalError
            );

            const formatted = error.toString();

            expect(formatted).toContain('FileReadError');
            expect(formatted).toContain('Failed to read module');
            expect(formatted).toContain('Import chain:');
            expect(formatted).toContain('main.js');
            expect(formatted).toContain('App.js');
            expect(formatted).toContain('missing.js');
            expect(formatted).toContain('✗ FAILED');
            expect(formatted).toContain('Cause:');
            expect(formatted).toContain('ENOENT');
        });
    });

    describe('Formatting Functions', () => {
        it('should format circular dependency correctly', () => {
            const moduleIds = ['/src/A.js', '/src/B.js', '/src/C.js'];
            const targetModule = '/src/A.js';

            const formatted = formatCircularDependency(moduleIds, targetModule);

            // Calculate expected relative paths
            const relativeA = path.relative(process.cwd(), '/src/A.js');
            const relativeB = path.relative(process.cwd(), '/src/B.js');
            const relativeC = path.relative(process.cwd(), '/src/C.js');

            expect(formatted).toContain('Circular dependency:');
            expect(formatted).toContain(`┌─ ${relativeA}`);
            expect(formatted).toContain(`├─ ${relativeB}`);
            expect(formatted).toContain(`├─ ${relativeC}`);
            expect(formatted).toContain(`└─ ${relativeA}`);
            expect(formatted).toContain('circular');
        });

        it('should format module chain correctly', () => {
            const moduleIds = ['/src/main.js', '/src/app.js'];
            const targetModule = '/src/missing.js';
            const originalError = new Error('File not found');

            const formatted = formatModuleChain(
                moduleIds,
                targetModule,
                originalError
            );

            expect(formatted).toContain('Import chain:');
            expect(formatted).toContain('main.js');
            expect(formatted).toContain('app.js');
            expect(formatted).toContain('missing.js');
            expect(formatted).toContain('✗ FAILED');
            expect(formatted).toContain('Cause:');
            expect(formatted).toContain('File not found');
        });

        it('should handle empty moduleIds in formatModuleChain', () => {
            const moduleIds: string[] = [];
            const targetModule = '/src/standalone.js';

            const formatted = formatModuleChain(moduleIds, targetModule);

            expect(formatted).toContain('Failed to load:');
            expect(formatted).toContain('standalone.js');
        });

        it('should handle deep module chains', () => {
            const moduleIds = [
                '/src/a.js',
                '/src/b.js',
                '/src/c.js',
                '/src/d.js'
            ];
            const targetModule = '/src/e.js';

            const formatted = formatModuleChain(moduleIds, targetModule);

            // Calculate expected relative paths
            const relativeA = path.relative(process.cwd(), '/src/a.js');
            const relativeB = path.relative(process.cwd(), '/src/b.js');
            const relativeC = path.relative(process.cwd(), '/src/c.js');
            const relativeD = path.relative(process.cwd(), '/src/d.js');
            const relativeE = path.relative(process.cwd(), '/src/e.js');

            expect(formatted).toContain(relativeA);
            expect(formatted).toContain(`  └─ ${relativeB}`);
            expect(formatted).toContain(`    └─ ${relativeC}`);
            expect(formatted).toContain(`      └─ ${relativeD}`);
            expect(formatted).toContain(`        └─ ${relativeE} ✗ FAILED`);
        });
    });
});
