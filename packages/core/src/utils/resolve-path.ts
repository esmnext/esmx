import path from 'node:path';
import { pathToFileURL } from 'node:url';

export type ProjectPath =
    | './'
    | 'dist'
    | 'dist/index.mjs'
    | 'dist/package.json'
    | 'dist/client'
    | 'dist/client/manifest.json'
    | 'dist/client/js'
    | 'dist/client/css'
    | 'dist/client/images'
    | 'dist/client/media'
    | 'dist/client/fonts'
    | 'dist/client/workers'
    | 'dist/client/importmap'
    | 'dist/client/versions/latest.tgz'
    | 'dist/server'
    | 'dist/server/js'
    | 'dist/server/manifest.json'
    | 'dist/node'
    | 'dist/node/js'
    | 'src'
    | 'src/entry.node.ts'
    | 'src/entry.client.ts'
    | 'src/entry.server.ts'
    | 'package.json';

export function resolvePath(
    root: string,
    projectPath: ProjectPath,
    ...args: string[]
): string {
    return path.resolve(root, projectPath, ...args);
}

export function resolveImportPath(...paths: string[]): string {
    const absolutePath = path.resolve(...paths);
    return pathToFileURL(absolutePath).href;
}
