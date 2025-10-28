import { resolve } from 'node:path';

const rootDir = process.cwd();

export const config = {
    rootDir,
    outDir: resolve(rootDir, 'dist'),
    packagesDir: resolve(rootDir, 'packages'),
    examplesDir: resolve(rootDir, 'examples'),
    nodeModulesDir: resolve(rootDir, 'node_modules'),
    coverageDir: resolve(rootDir, 'dist', 'coverage'),

    // URLs
    baseUrl: 'https://esmx.dev',
    coverageUrl: 'https://esmx.dev/coverage/'
};
