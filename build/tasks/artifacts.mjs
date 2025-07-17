import { cpSync, existsSync, mkdirSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { config } from '../config.mjs';
import { log, toDisplayPath } from '../utils.mjs';

function findSSRDirectories(baseDir) {
    try {
        const ssrDirs = [];

        if (!existsSync(baseDir)) {
            log.warn(`Base directory not found: ${toDisplayPath(baseDir)}`);
            return ssrDirs;
        }

        const entries = readdirSync(baseDir, { withFileTypes: true });

        for (const entry of entries) {
            if (!entry.isDirectory()) continue;
            if (entry.name === 'router-demo') {
                ssrDirs.push(...findSSRDirectories(join(baseDir, entry.name)));
            } else if (
                ['ssr-', 'router-demo'].some((s) => entry.name.startsWith(s))
            ) {
                const clientPath = join(baseDir, entry.name, 'dist', 'client');
                if (existsSync(clientPath)) {
                    ssrDirs.push({
                        name: entry.name,
                        path: clientPath
                    });
                }
            }
        }

        return ssrDirs;
    } catch (error) {
        log.error(
            `Failed to find SSR directories in ${toDisplayPath(baseDir)}: ${error.message}`
        );
        throw error; // Re-throw to ensure non-zero exit
    }
}

export async function copyArtifacts() {
    try {
        log.info('Copying build artifacts...');

        // Create dist directory
        if (!existsSync(config.outDir)) {
            mkdirSync(config.outDir, { recursive: true });
        }

        // Copy SSR examples using native Node.js APIs
        const ssrDirs = findSSRDirectories(config.examplesDir);

        for (const { name, path } of ssrDirs) {
            const targetDir = join(config.outDir, name);
            mkdirSync(targetDir, { recursive: true });
            cpSync(path, targetDir, { recursive: true });
            log.info(
                `Copied ${toDisplayPath(path)} to ${toDisplayPath(targetDir)}`
            );
        }

        // Copy docs
        const docsPath = join(config.examplesDir, 'docs/dist/client');
        if (existsSync(docsPath)) {
            cpSync(docsPath, config.outDir, { recursive: true });
            log.info(
                `Copied ${toDisplayPath(docsPath)} to ${toDisplayPath(config.outDir)}`
            );
        }
    } catch (error) {
        log.error(`Artifact copying failed: ${error.message}`);
        throw error; // Re-throw to ensure non-zero exit
    }
}
