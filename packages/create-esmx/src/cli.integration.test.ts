import { existsSync, readFileSync } from 'node:fs';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { cli } from './cli';
import { getAvailableTemplates } from './template';

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

async function verifyProjectStructure(
    projectPath: string,
    projectName: string
): Promise<void> {
    expect(existsSync(projectPath)).toBe(true);
    expect(existsSync(join(projectPath, 'src'))).toBe(true);

    const requiredFiles = [
        'package.json',
        'tsconfig.json',
        'README.md',
        'src/entry.client.ts',
        'src/entry.node.ts'
    ];

    for (const file of requiredFiles) {
        expect(existsSync(join(projectPath, file))).toBe(true);
        if (!existsSync(join(projectPath, file))) {
            throw new Error(`Missing required file: ${file}`);
        }
    }

    // Check for entry.client.ts (only .ts extension is allowed)
    const entryClientTs = join(projectPath, 'src/entry.client.ts');
    expect(existsSync(entryClientTs)).toBe(true);
    if (!existsSync(entryClientTs)) {
        throw new Error('Missing required file: src/entry.client.ts');
    }

    const packageJson = JSON.parse(
        readFileSync(join(projectPath, 'package.json'), 'utf-8')
    );

    const typeCheckCommands = ['vue-tsc --noEmit', 'tsc --noEmit'];
    const typeGenCommands = [
        'vue-tsc --declaration --emitDeclarationOnly --noEmit false --outDir dist/src && tsc-alias -p tsconfig.json --outDir dist/src',
        'tsc --declaration --emitDeclarationOnly --outDir dist/src && tsc-alias -p tsconfig.json --outDir dist/src'
    ];

    expect(packageJson).toMatchObject({
        name: projectName,
        type: 'module',
        private: true,
        scripts: {
            dev: 'esmx dev',
            build: 'esmx build',
            preview: 'esmx preview',
            start: 'esmx start'
        },
        dependencies: {
            '@esmx/core': expect.any(String)
        },
        devDependencies: {
            typescript: expect.any(String),
            '@types/node': expect.any(String),
            'tsc-alias': expect.any(String)
        }
    });

    expect(packageJson.scripts['lint:type']).toBeOneOf(typeCheckCommands);
    expect(packageJson.scripts['build:type']).toBeOneOf(typeGenCommands);

    const tsconfig = JSON.parse(
        readFileSync(join(projectPath, 'tsconfig.json'), 'utf-8')
    );

    expect(tsconfig).toMatchObject({
        compilerOptions: {
            module: 'ESNext',
            moduleResolution: 'node',
            target: 'ESNext',
            strict: true,
            baseUrl: '.',
            paths: {
                [`${projectName}/src/*`]: ['./src/*'],
                [`${projectName}/*`]: ['./*']
            }
        },
        include: ['src'],
        exclude: ['dist', 'node_modules']
    });

    const readmeContent = readFileSync(join(projectPath, 'README.md'), 'utf-8');
    expect(readmeContent.length).toBeGreaterThan(0);
    expect(readmeContent).toContain(projectName);
}

describe('create-esmx CLI integration tests', () => {
    let tmpDir: string;

    beforeEach(async () => {
        tmpDir = await createTempDir();
    });

    afterEach(async () => {
        await cleanupTempDir(tmpDir);
    });

    it('should create project with all available templates', async () => {
        const templates = getAvailableTemplates();
        expect(templates.length).toBeGreaterThan(0);

        for (const template of templates) {
            const projectName = `test-${template.folder}`;
            const projectPath = join(tmpDir, projectName);

            await cli({
                argv: [projectName, '--template', template.folder],
                cwd: tmpDir,
                userAgent: 'npm/test'
            });

            await verifyProjectStructure(projectPath, projectName);
        }
    });

    it('should handle --force parameter correctly', async () => {
        const projectPath = join(tmpDir, 'test-project');

        await cli({
            argv: ['test-project', '--template', 'vue2-csr'],
            cwd: tmpDir,
            userAgent: 'npm/test'
        });

        expect(existsSync(join(projectPath, 'package.json'))).toBe(true);

        await cli({
            argv: ['test-project', '--template', 'vue2-csr', '--force'],
            cwd: tmpDir,
            userAgent: 'npm/test'
        });

        expect(existsSync(join(projectPath, 'package.json'))).toBe(true);
        expect(existsSync(join(projectPath, 'src'))).toBe(true);
        expect(existsSync(join(projectPath, 'src/entry.client.ts'))).toBe(true);
        expect(existsSync(join(projectPath, 'src/entry.node.ts'))).toBe(true);
        expect(existsSync(join(projectPath, 'src/entry.server.ts'))).toBe(true);
        expect(existsSync(join(projectPath, 'src/create-app.ts'))).toBe(true);
    });

    it('should show help information', async () => {
        const originalLog = console.log;
        const logOutput: string[] = [];
        console.log = (...args: any[]) => {
            logOutput.push(args.join(' '));
        };

        try {
            await cli({
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
        const originalLog = console.log;
        const logOutput: string[] = [];
        console.log = (...args: any[]) => {
            logOutput.push(args.join(' '));
        };

        try {
            await cli({
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

        await cli({
            argv: [
                'non-existent-parent/test-project',
                '--template',
                'vue2-csr'
            ],
            cwd: tmpDir,
            userAgent: 'npm/test'
        });

        expect(existsSync(projectPath)).toBe(true);
        expect(existsSync(join(projectPath, 'package.json'))).toBe(true);
        expect(existsSync(join(projectPath, 'src'))).toBe(true);
    });

    it('should handle force overwrite for non-empty directory', async () => {
        const projectPath = join(tmpDir, 'test-project');

        await mkdir(projectPath, { recursive: true });
        await writeFile(
            join(projectPath, 'existing-file.txt'),
            'existing content'
        );

        await cli({
            argv: ['test-project', '--template', 'vue2-csr', '--force'],
            cwd: tmpDir,
            userAgent: 'npm/test'
        });

        expect(existsSync(join(projectPath, 'package.json'))).toBe(true);
        expect(existsSync(join(projectPath, 'src'))).toBe(true);
    });

    it('should handle force overwrite in current directory', async () => {
        const testFile = join(tmpDir, 'existing-file.txt');
        await writeFile(testFile, 'existing content');

        await cli({
            argv: ['.', '--template', 'vue2-csr', '--force'],
            cwd: tmpDir,
            userAgent: 'npm/test'
        });

        expect(existsSync(join(tmpDir, 'package.json'))).toBe(true);
        expect(existsSync(join(tmpDir, 'src'))).toBe(true);
        expect(existsSync(join(tmpDir, 'src/entry.client.ts'))).toBe(true);
    });

    it('should create project in current directory when target is "."', async () => {
        await cli({
            argv: ['.', '--template', 'vue2-csr'],
            cwd: tmpDir,
            userAgent: 'npm/test'
        });

        expect(existsSync(join(tmpDir, 'package.json'))).toBe(true);
        expect(existsSync(join(tmpDir, 'src'))).toBe(true);
        expect(existsSync(join(tmpDir, 'src/entry.client.ts'))).toBe(true);
    });

    it('should handle various project name formats', async () => {
        const testCases = [
            'simple-name',
            'nested/project-name',
            'deep/nested/project-name'
        ];

        for (const projectName of testCases) {
            const projectPath = join(tmpDir, projectName);

            await cli({
                argv: [projectName, '--template', 'vue2-csr'],
                cwd: tmpDir,
                userAgent: 'npm/test'
            });

            expect(existsSync(projectPath)).toBe(true);
            expect(existsSync(join(projectPath, 'package.json'))).toBe(true);
        }
    });
});
