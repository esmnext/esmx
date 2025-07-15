/**
 * Project name utilities
 */

import { basename } from 'node:path';

export interface ProjectNameResult {
    packageName: string;
    targetDir: string;
}

/**
 * Format project name and determine target directory
 *
 * Examples:
 * 1. Input: 'foo'
 *    Output: folder `<cwd>/foo`, `package.json#name` -> `foo`
 *
 * 2. Input: 'foo/bar'
 *    Output: folder -> `<cwd>/foo/bar` folder, `package.json#name` -> `bar`
 *
 * 3. Input: '@scope/foo'
 *    Output: folder -> `<cwd>/@scope/foo` folder, `package.json#name` -> `@scope/foo`
 *
 * 4. Input: './foo/bar'
 *    Output: folder -> `<cwd>/foo/bar` folder, `package.json#name` -> `bar`
 *
 * 5. Input: '/root/path/to/foo'
 *    Output: folder -> `'/root/path/to/foo'` folder, `package.json#name` -> `foo`
 *
 * 6. Input: '.'
 *    Output: folder -> `<cwd>` folder, `package.json#name` -> `<current-dir-name>`
 */
export function formatProjectName(
    input: string,
    cwd?: string
): ProjectNameResult {
    const targetDir = input.replace(/\/+$/g, '');

    let packageName: string;
    if (targetDir === '.') {
        // Use current directory name as package name
        const workingDir = cwd || process.cwd();
        packageName = basename(workingDir);
    } else if (targetDir.startsWith('@')) {
        packageName = targetDir;
    } else {
        packageName = targetDir.split('/').pop() || 'esmx-project';
    }

    return {
        packageName,
        targetDir
    };
}
