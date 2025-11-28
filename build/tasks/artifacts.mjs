import { cpSync, existsSync, mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { config } from '../config.mjs';
import { getPackagePaths, log, toDisplayPath } from '../utils.mjs';

async function findSSRDirectories() {
    log.info('Searching for projects with client builds...');

    const projectPaths = await getPackagePaths('examples');
    const ssrDirs = [];
    for (const projectPath of projectPaths) {
        const clientPath = join(projectPath, 'dist', 'client');
        if (!existsSync(clientPath)) continue;

        const packageJsonPath = join(projectPath, 'package.json');
        if (!existsSync(packageJsonPath)) continue;

        const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
        if (!packageJson.name) continue;

        ssrDirs.push({ name: packageJson.name, path: clientPath });
        log.info(`Found client build in ${toDisplayPath(clientPath)}`);
    }

    return ssrDirs;
}

export async function copyArtifacts() {
    log.info('Copying build artifacts...');

    if (!existsSync(config.outDir)) {
        mkdirSync(config.outDir, { recursive: true });
    }

    const ssrDirs = await findSSRDirectories();

    if (ssrDirs.length === 0) {
        log.warn('No client builds found to copy');
    }

    for (const { name, path } of ssrDirs) {
        const targetDir = join(config.outDir, name);
        mkdirSync(targetDir, { recursive: true });
        cpSync(path, targetDir, { recursive: true });
        log.info(
            `Copied ${toDisplayPath(path)} to ${toDisplayPath(targetDir)}`
        );
    }

    const docsPath = join(config.examplesDir, 'docs/dist/client');
    if (existsSync(docsPath)) {
        cpSync(docsPath, config.outDir, { recursive: true });
        log.info(
            `Copied ${toDisplayPath(docsPath)} to ${toDisplayPath(config.outDir)}`
        );
    }
}
