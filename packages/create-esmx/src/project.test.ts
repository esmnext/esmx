import { existsSync } from 'node:fs';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createProjectFromTemplate } from './project';
import { getEsmxVersion } from './template';
import { formatProjectName } from './utils/index';

async function createTempDir(prefix = 'esmx-unit-test-'): Promise<string> {
    return mkdtemp(join(tmpdir(), prefix));
}

async function cleanupTempDir(tmpDir: string): Promise<void> {
    await rm(tmpDir, { recursive: true, force: true });
}

describe('project unit tests', () => {
    let tmpDir: string;

    beforeEach(async () => {
        tmpDir = await createTempDir();
    });

    afterEach(async () => {
        await cleanupTempDir(tmpDir);
    });

    it('should handle isDirectoryEmpty edge cases', async () => {
        const hiddenFilesDir = join(tmpDir, 'hidden-files-dir');
        await mkdir(hiddenFilesDir, { recursive: true });
        await writeFile(join(hiddenFilesDir, '.hidden-file'), 'hidden content');
        await writeFile(join(hiddenFilesDir, '.gitignore'), 'node_modules/');

        const projectNameInput = 'hidden-files-dir';
        const { name, root } = formatProjectName(projectNameInput, tmpDir);

        // Create project from template
        await createProjectFromTemplate(root, 'vue2-csr', tmpDir, false, {
            projectName: name,
            esmxVersion: getEsmxVersion(),
            installCommand: 'npm install',
            devCommand: 'npm run dev',
            buildCommand: 'npm run build',
            startCommand: 'npm start',
            buildTypeCommand: 'npm run build:type',
            lintTypeCommand: 'npm run lint:type'
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

        // Get project name and target directory
        const projectNameInput = 'very/deep/nested/path/project';
        const { name, root } = formatProjectName(projectNameInput, tmpDir);

        // Create project from template
        await createProjectFromTemplate(root, 'vue2-csr', tmpDir, false, {
            projectName: name,
            esmxVersion: getEsmxVersion(),
            installCommand: 'npm install',
            devCommand: 'npm run dev',
            buildCommand: 'npm run build',
            startCommand: 'npm start',
            buildTypeCommand: 'npm run build:type',
            lintTypeCommand: 'npm run lint:type'
        });

        expect(existsSync(deepPath)).toBe(true);
        expect(existsSync(join(deepPath, 'package.json'))).toBe(true);
    });

    it('should handle file copy with template variable replacement', async () => {
        const projectPath = join(tmpDir, 'variable-test');

        // Get project name and target directory
        const projectNameInput = 'variable-test';
        const { name, root } = formatProjectName(projectNameInput, tmpDir);

        // Create project from template
        await createProjectFromTemplate(root, 'vue2-csr', tmpDir, false, {
            projectName: name,
            esmxVersion: getEsmxVersion(),
            installCommand: 'npm install',
            devCommand: 'npm run dev',
            buildCommand: 'npm run build',
            startCommand: 'npm start',
            buildTypeCommand: 'npm run build:type',
            lintTypeCommand: 'npm run lint:type'
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

        // Get project name and target directory
        const projectNameInput = 'empty-dir';
        const { name, root } = formatProjectName(projectNameInput, tmpDir);

        // Create project from template
        await createProjectFromTemplate(root, 'vue2-csr', tmpDir, false, {
            projectName: name,
            esmxVersion: getEsmxVersion(),
            installCommand: 'npm install',
            devCommand: 'npm run dev',
            buildCommand: 'npm run build',
            startCommand: 'npm start',
            buildTypeCommand: 'npm run build:type',
            lintTypeCommand: 'npm run lint:type'
        });

        expect(existsSync(join(emptyDir, 'package.json'))).toBe(true);
    });

    it('should handle mixed file types in directory', async () => {
        // Test directory with mix of hidden and non-hidden files
        const mixedDir = join(tmpDir, 'mixed-dir');
        await mkdir(mixedDir, { recursive: true });
        await writeFile(join(mixedDir, '.dotfile'), 'hidden');
        await writeFile(join(mixedDir, 'regular-file.txt'), 'visible');

        // Get project name and target directory
        const projectNameInput = 'mixed-dir';
        const { name, root } = formatProjectName(projectNameInput, tmpDir);

        // Create project from template with force flag
        await createProjectFromTemplate(
            root,
            'vue2-csr',
            tmpDir,
            true, // force flag
            {
                projectName: name,
                esmxVersion: getEsmxVersion(),
                installCommand: 'npm install',
                devCommand: 'npm run dev',
                buildCommand: 'npm run build',
                startCommand: 'npm start',
                buildTypeCommand: 'npm run build:type',
                lintTypeCommand: 'npm run lint:type'
            }
        );

        expect(existsSync(join(mixedDir, 'package.json'))).toBe(true);
    });

    it('should handle special characters in project names', async () => {
        const specialNames = [
            'project-with-dashes',
            'project_with_underscores',
            'project.with.dots'
        ];

        for (const projectName of specialNames) {
            const projectPath = join(tmpDir, projectName);

            // Get project name and target directory
            const { name, root } = formatProjectName(projectName, tmpDir);

            // Create project from template
            await createProjectFromTemplate(root, 'vue2-csr', tmpDir, false, {
                projectName: name,
                esmxVersion: getEsmxVersion(),
                installCommand: 'npm install',
                devCommand: 'npm run dev',
                buildCommand: 'npm run build',
                startCommand: 'npm start',
                buildTypeCommand: 'npm run build:type',
                lintTypeCommand: 'npm run lint:type'
            });

            expect(existsSync(projectPath)).toBe(true);
            expect(existsSync(join(projectPath, 'package.json'))).toBe(true);
        }
    });
});
