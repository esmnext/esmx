import { existsSync } from 'node:fs';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createProject } from './index';

// Test utilities
async function createTempDir(prefix = 'esmx-test-'): Promise<string> {
    return mkdtemp(join(tmpdir(), prefix));
}

async function cleanupTempDir(tempDir: string): Promise<void> {
    try {
        await rm(tempDir, { recursive: true, force: true });
    } catch (error) {
        console.warn(`Failed to cleanup temp directory: ${tempDir}`, error);
    }
}

describe('create-esmx integration tests', () => {
    let tmpDir: string;

    beforeEach(async () => {
        tmpDir = await createTempDir();
    });

    afterEach(async () => {
        await cleanupTempDir(tmpDir);
    });

    it('should create project with vue2 template', async () => {
        const projectPath = join(tmpDir, 'test-project');

        await createProject({
            argv: ['test-project', '--template', 'vue2'],
            cwd: tmpDir,
            userAgent: 'npm/test'
        });

        // Verify project directory exists
        expect(existsSync(projectPath)).toBe(true);

        // Verify essential common files exist
        expect(existsSync(join(projectPath, 'package.json'))).toBe(true);
        expect(existsSync(join(projectPath, 'tsconfig.json'))).toBe(true);
        expect(existsSync(join(projectPath, 'README.md'))).toBe(true);

        // Verify src directory exists
        expect(existsSync(join(projectPath, 'src'))).toBe(true);

        // Verify Esmx common entry files exist
        expect(existsSync(join(projectPath, 'src/entry.client.ts'))).toBe(true);
        expect(existsSync(join(projectPath, 'src/entry.node.ts'))).toBe(true);
        expect(existsSync(join(projectPath, 'src/entry.server.ts'))).toBe(true);
        expect(existsSync(join(projectPath, 'src/create-app.ts'))).toBe(true);
    });

    it('should handle --force parameter correctly', async () => {
        const projectPath = join(tmpDir, 'test-project');

        // Create project first time
        await createProject({
            argv: ['test-project', '--template', 'vue2'],
            cwd: tmpDir,
            userAgent: 'npm/test'
        });

        // Verify project exists
        expect(existsSync(join(projectPath, 'package.json'))).toBe(true);

        // Create project again with force flag
        await createProject({
            argv: ['test-project', '--template', 'vue2', '--force'],
            cwd: tmpDir,
            userAgent: 'npm/test'
        });

        // Verify project still exists and is valid
        expect(existsSync(join(projectPath, 'package.json'))).toBe(true);
        expect(existsSync(join(projectPath, 'src'))).toBe(true);

        // Verify Esmx common entry files still exist after force overwrite
        expect(existsSync(join(projectPath, 'src/entry.client.ts'))).toBe(true);
        expect(existsSync(join(projectPath, 'src/entry.node.ts'))).toBe(true);
        expect(existsSync(join(projectPath, 'src/entry.server.ts'))).toBe(true);
        expect(existsSync(join(projectPath, 'src/create-app.ts'))).toBe(true);
    });

    it('should show help information', async () => {
        // Mock console.log to capture help output
        const originalLog = console.log;
        const logOutput: string[] = [];
        console.log = (...args: any[]) => {
            logOutput.push(args.join(' '));
        };

        try {
            await createProject({
                argv: ['--help'],
                cwd: tmpDir,
                userAgent: 'npm/test'
            });

            const output = logOutput.join('\n');
            expect(output).toContain('Usage');
            expect(output).toContain('Options');
            expect(output).toContain('Examples');
        } finally {
            console.log = originalLog;
        }
    });

    it('should show version information', async () => {
        // Mock console.log to capture version output
        const originalLog = console.log;
        const logOutput: string[] = [];
        console.log = (...args: any[]) => {
            logOutput.push(args.join(' '));
        };

        try {
            await createProject({
                argv: ['--version'],
                cwd: tmpDir,
                userAgent: 'npm/test'
            });

            const output = logOutput.join('\n');
            expect(output).toMatch(/^\d+\.\d+\.\d+/);
        } finally {
            console.log = originalLog;
        }
    });

    it('should handle creating directory when target directory does not exist', async () => {
        const projectPath = join(tmpDir, 'non-existent-parent', 'test-project');

        await createProject({
            argv: ['non-existent-parent/test-project', '--template', 'vue2'],
            cwd: tmpDir,
            userAgent: 'npm/test'
        });

        // Verify project was created in nested directory
        expect(existsSync(projectPath)).toBe(true);
        expect(existsSync(join(projectPath, 'package.json'))).toBe(true);
        expect(existsSync(join(projectPath, 'src'))).toBe(true);
    });

    it('should handle force overwrite for non-empty directory', async () => {
        const projectPath = join(tmpDir, 'test-project');

        // Create directory with some files
        await mkdir(projectPath, { recursive: true });
        await writeFile(
            join(projectPath, 'existing-file.txt'),
            'existing content'
        );

        // Create project with force flag in non-empty directory
        await createProject({
            argv: ['test-project', '--template', 'vue2', '--force'],
            cwd: tmpDir,
            userAgent: 'npm/test'
        });

        // Verify project was created successfully
        expect(existsSync(join(projectPath, 'package.json'))).toBe(true);
        expect(existsSync(join(projectPath, 'src'))).toBe(true);
    });

    it('should handle force overwrite in current directory', async () => {
        // Create some files in current directory
        const testFile = join(tmpDir, 'existing-file.txt');
        await writeFile(testFile, 'existing content');

        // Create project in current directory with force flag
        await createProject({
            argv: ['.', '--template', 'vue2', '--force'],
            cwd: tmpDir,
            userAgent: 'npm/test'
        });

        // Verify project was created successfully in current directory
        expect(existsSync(join(tmpDir, 'package.json'))).toBe(true);
        expect(existsSync(join(tmpDir, 'src'))).toBe(true);
        expect(existsSync(join(tmpDir, 'src/entry.client.ts'))).toBe(true);
    });

    it('should create project in current directory when target is "."', async () => {
        // Create project in current directory
        await createProject({
            argv: ['.', '--template', 'vue2'],
            cwd: tmpDir,
            userAgent: 'npm/test'
        });

        // Verify project was created in current directory
        expect(existsSync(join(tmpDir, 'package.json'))).toBe(true);
        expect(existsSync(join(tmpDir, 'src'))).toBe(true);
        expect(existsSync(join(tmpDir, 'src/entry.client.ts'))).toBe(true);
    });

    it('should handle various project name formats', async () => {
        // Test with different naming styles
        const testCases = [
            'simple-name',
            'nested/project-name',
            'deep/nested/project-name'
        ];

        for (const projectName of testCases) {
            const projectPath = join(tmpDir, projectName);

            await createProject({
                argv: [projectName, '--template', 'vue2'],
                cwd: tmpDir,
                userAgent: 'npm/test'
            });

            expect(existsSync(projectPath)).toBe(true);
            expect(existsSync(join(projectPath, 'package.json'))).toBe(true);
        }
    });
});
