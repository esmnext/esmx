/**
 * Project name utilities
 */

import { basename, isAbsolute, normalize, resolve } from 'node:path';

export interface ProjectNameResult {
    name: string;
    root: string;
}

/**
 * Format project name and determine target directory
 *
 * Examples:
 * 1. Input: 'foo', cwd: '/home/user' (Unix)
 *    Output: { name: 'foo', root: '/home/user/foo' }
 *    Input: 'foo', cwd: 'C:\\workspace' (Windows)
 *    Output: { name: 'foo', root: 'C:\\workspace\\foo' }
 *
 * 2. Input: 'foo/bar', cwd: '/home/user' (Unix)
 *    Output: { name: 'bar', root: '/home/user/foo/bar' }
 *    Input: 'foo\\bar', cwd: 'C:\\workspace' (Windows)
 *    Output: { name: 'bar', root: 'C:\\workspace\\foo\\bar' }
 *
 * 3. Input: '@scope/foo', cwd: '/home/user' (Unix)
 *    Output: { name: '@scope/foo', root: '/home/user/@scope/foo' }
 *    Input: '@scope/foo', cwd: 'C:\\workspace' (Windows)
 *    Output: { name: '@scope/foo', root: 'C:\\workspace\\@scope\\foo' }
 *
 * 4. Input: './foo/bar', cwd: '/home/user/current' (Unix)
 *    Output: { name: 'bar', root: '/home/user/current/foo/bar' }
 *    Input: '.\\foo\\bar', cwd: 'C:\\workspace\\current' (Windows)
 *    Output: { name: 'bar', root: 'C:\\workspace\\current\\foo\\bar' }
 *
 * 5. Input: '/root/path/to/foo', cwd: '/home/user' (Unix absolute)
 *    Output: { name: 'foo', root: '/root/path/to/foo' }
 *    Input: 'C:\\projects\\my-app', cwd: 'D:\\workspace' (Windows absolute)
 *    Output: { name: 'my-app', root: 'C:\\projects\\my-app' }
 *
 * 6. Input: '.', cwd: '/home/user/projects/my-app' (Unix current dir)
 *    Output: { name: 'my-app', root: '/home/user/projects/my-app' }
 *    Input: '.', cwd: 'C:\\Users\\Developer\\Projects\\WindowsApp' (Windows current dir)
 *    Output: { name: 'WindowsApp', root: 'C:\\Users\\Developer\\Projects\\WindowsApp' }
 *
 * 7. Input: '\\\\server\\share\\project', cwd: 'C:\\workspace' (Windows UNC)
 *    Output: { name: 'project', root: '\\\\server\\share\\project' }
 *
 * 8. Input: 'path\\to/project', cwd: '/home/user' (Mixed separators)
 *    Output: { name: 'project', root: '/home/user/path/to/project' }
 */
export function formatProjectName(
    input: string,
    cwd?: string
): ProjectNameResult {
    const workingDir = cwd || process.cwd();

    let cleanInput = input;
    if (input !== '/' && input !== '\\' && input.length > 1) {
        cleanInput = input.replace(/[\\/]+$/, '');
    }

    if (cleanInput === '.') {
        return {
            name: basename(workingDir),
            root: workingDir
        };
    }

    if (cleanInput === '' || cleanInput === '/' || cleanInput === '\\') {
        if (cleanInput === '/') {
            return {
                name: 'esmx-project',
                root: '/'
            };
        }
        return {
            name: 'esmx-project',
            root: resolve(workingDir, 'esmx-project')
        };
    }

    let root: string;
    if (isAbsolute(cleanInput)) {
        root = normalize(cleanInput);
    } else {
        root = resolve(workingDir, cleanInput);
    }

    let name: string;
    if (cleanInput.startsWith('@')) {
        name = cleanInput;
    } else {
        name = basename(normalize(cleanInput)) || 'esmx-project';
    }

    return {
        name,
        root
    };
}
