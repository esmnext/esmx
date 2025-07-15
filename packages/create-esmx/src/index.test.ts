import { existsSync } from 'node:fs';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createProject } from './index';

// Test utilities
async function createTempDir(prefix = 'esmx-unit-test-'): Promise<string> {
    return mkdtemp(join(tmpdir(), prefix));
}

async function cleanupTempDir(tempDir: string): Promise<void> {
    try {
        await rm(tempDir, { recursive: true, force: true });
    } catch (error) {
        console.warn(`Failed to cleanup temp directory: ${tempDir}`, error);
    }
}

describe('createProject unit tests', () => {
    let tmpDir: string;

    beforeEach(async () => {
        tmpDir = await createTempDir();
    });

    afterEach(async () => {
        await cleanupTempDir(tmpDir);
    });

    it('should handle isDirectoryEmpty edge cases', async () => {
        // Test with directory containing only hidden files
        const hiddenFilesDir = join(tmpDir, 'hidden-files-dir');
        await mkdir(hiddenFilesDir, { recursive: true });
        await writeFile(join(hiddenFilesDir, '.hidden-file'), 'hidden content');
        await writeFile(join(hiddenFilesDir, '.gitignore'), 'node_modules/');

        await createProject({
            argv: ['hidden-files-dir', '--template', 'vue2'],
            cwd: tmpDir,
            userAgent: 'npm/test'
        });

        // Should succeed because hidden files are ignored
        expect(existsSync(join(hiddenFilesDir, 'package.json'))).toBe(true);
    });

    it('should handle directory creation for nested paths', async () => {
        const deepPath = join(
            tmpDir,
            'very',
            'deep',
            'nested',
            'path',
            'project'
        );

        await createProject({
            argv: ['very/deep/nested/path/project', '--template', 'vue2'],
            cwd: tmpDir,
            userAgent: 'npm/test'
        });

        expect(existsSync(deepPath)).toBe(true);
        expect(existsSync(join(deepPath, 'package.json'))).toBe(true);
    });

    it('should handle file copy with template variable replacement', async () => {
        const projectPath = join(tmpDir, 'variable-test');

        await createProject({
            argv: ['variable-test', '--template', 'vue2'],
            cwd: tmpDir,
            userAgent: 'npm/test'
        });

        // Verify that package.json contains replaced variables
        const packageJsonPath = join(projectPath, 'package.json');
        expect(existsSync(packageJsonPath)).toBe(true);

        const packageContent = require('node:fs').readFileSync(
            packageJsonPath,
            'utf-8'
        );
        const packageJson = JSON.parse(packageContent);
        expect(packageJson.name).toBe('variable-test');
    });

    it('should handle empty directory detection correctly', async () => {
        // Test completely empty directory
        const emptyDir = join(tmpDir, 'empty-dir');
        await mkdir(emptyDir, { recursive: true });

        await createProject({
            argv: ['empty-dir', '--template', 'vue2'],
            cwd: tmpDir,
            userAgent: 'npm/test'
        });

        expect(existsSync(join(emptyDir, 'package.json'))).toBe(true);
    });

    it('should handle mixed file types in directory', async () => {
        // Test directory with mix of hidden and non-hidden files
        const mixedDir = join(tmpDir, 'mixed-dir');
        await mkdir(mixedDir, { recursive: true });
        await writeFile(join(mixedDir, '.dotfile'), 'hidden');
        await writeFile(join(mixedDir, 'regular-file.txt'), 'visible');

        // This should require force flag since directory is not empty
        await createProject({
            argv: ['mixed-dir', '--template', 'vue2', '--force'],
            cwd: tmpDir,
            userAgent: 'npm/test'
        });

        expect(existsSync(join(mixedDir, 'package.json'))).toBe(true);
    });

    it('should handle various package manager user agents', async () => {
        const testCases = ['npm', 'yarn', 'pnpm', 'bun'];

        for (const userAgent of testCases) {
            const projectName = `test-${userAgent}`;
            const projectPath = join(tmpDir, projectName);

            await createProject({
                argv: [projectName, '--template', 'vue2'],
                cwd: tmpDir,
                userAgent: `${userAgent}/test-version`
            });

            expect(existsSync(projectPath)).toBe(true);
            expect(existsSync(join(projectPath, 'package.json'))).toBe(true);
        }
    });

    it('should handle special characters in project names', async () => {
        const specialNames = [
            'project-with-dashes',
            'project_with_underscores',
            'project.with.dots'
        ];

        for (const projectName of specialNames) {
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
