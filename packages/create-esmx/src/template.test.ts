import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { mkdir, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
    copyTemplateFiles,
    getAvailableTemplates,
    getEsmxVersion,
    isDirectoryEmpty
} from './template';

// Test utilities
async function createTempDir(prefix = 'esmx-template-test-'): Promise<string> {
    return mkdtemp(join(tmpdir(), prefix));
}

async function cleanupTempDir(tempDir: string): Promise<void> {
    try {
        await rm(tempDir, { recursive: true, force: true });
    } catch (error) {
        console.warn(`Failed to cleanup temp directory: ${tempDir}`, error);
    }
}

describe('template unit tests', () => {
    let tmpDir: string;

    beforeEach(async () => {
        tmpDir = await createTempDir();
    });

    afterEach(async () => {
        await cleanupTempDir(tmpDir);
    });

    it('should get Esmx version from package.json', () => {
        const version = getEsmxVersion();
        // 版本可能是 x.y.z 格式，也可能是 x.y.z-rc.n 格式，或 'latest'
        expect(typeof version).toBe('string');
        expect(version.length).toBeGreaterThan(0);
    });

    it('should get available templates', () => {
        const templates = getAvailableTemplates();
        expect(templates.length).toBeGreaterThan(0);
        expect(templates[0]).toHaveProperty('folder');
        expect(templates[0]).toHaveProperty('name');
        expect(templates[0]).toHaveProperty('description');
    });

    it('should detect empty directory', async () => {
        // Create empty directory
        const emptyDir = join(tmpDir, 'empty');
        await mkdir(emptyDir);
        expect(isDirectoryEmpty(emptyDir)).toBe(true);

        // Create directory with only hidden files
        const hiddenDir = join(tmpDir, 'hidden');
        await mkdir(hiddenDir);
        writeFileSync(join(hiddenDir, '.hiddenfile'), 'hidden');
        expect(isDirectoryEmpty(hiddenDir)).toBe(true);

        // Create directory with visible files
        const nonEmptyDir = join(tmpDir, 'non-empty');
        await mkdir(nonEmptyDir);
        writeFileSync(join(nonEmptyDir, 'visible.txt'), 'visible');
        expect(isDirectoryEmpty(nonEmptyDir)).toBe(false);
    });

    it('should copy template files with variable replacement', () => {
        // Create a simple template
        const templateDir = join(tmpDir, 'template');
        const targetDir = join(tmpDir, 'target');

        mkdirSync(templateDir, { recursive: true });
        mkdirSync(join(templateDir, 'src'), { recursive: true });
        mkdirSync(targetDir, { recursive: true });

        // Create template files with variables
        writeFileSync(
            join(templateDir, 'package.json'),
            JSON.stringify({
                name: '{{projectName}}',
                version: '1.0.0',
                dependencies: {
                    esmx: '{{esmxVersion}}'
                },
                scripts: {
                    dev: '{{devCommand}}',
                    build: '{{buildCommand}}'
                }
            })
        );

        writeFileSync(
            join(templateDir, 'src', 'index.ts'),
            'console.log("Welcome to {{projectName}}!");'
        );

        // Copy with variable replacement
        copyTemplateFiles(templateDir, targetDir, {
            projectName: 'test-project',
            esmxVersion: '1.2.3',
            devCommand: 'npm run dev',
            buildCommand: 'npm run build',
            installCommand: 'npm install',
            startCommand: 'npm start',
            buildTypeCommand: 'npm run build:type',
            lintTypeCommand: 'npm run lint:type'
        });

        // Check that files were created
        expect(existsSync(join(targetDir, 'package.json'))).toBe(true);
        expect(existsSync(join(targetDir, 'src', 'index.ts'))).toBe(true);

        // Check variable replacement in package.json
        const packageJson = JSON.parse(
            require('node:fs').readFileSync(
                join(targetDir, 'package.json'),
                'utf-8'
            )
        );
        expect(packageJson.name).toBe('test-project');
        expect(packageJson.dependencies.esmx).toBe('1.2.3');
        expect(packageJson.scripts.dev).toBe('npm run dev');

        // Check variable replacement in source file
        const indexContent = require('node:fs').readFileSync(
            join(targetDir, 'src', 'index.ts'),
            'utf-8'
        );
        expect(indexContent).toBe('console.log("Welcome to test-project!");');
    });
});
