import { basename, isAbsolute, normalize, resolve } from 'node:path';

export interface ProjectNameResult {
    name: string;
    root: string;
}

/**
 * Check if input looks like a Windows absolute path (drive letter or UNC)
 */
function isWindowsAbsolutePath(input: string): boolean {
    // Drive letter: C:\ or C:/
    if (/^[a-zA-Z]:[\/\\]/.test(input)) {
        return true;
    }
    // UNC path: \\server\share or //server/share
    if (/^[\/\\]{2}[^\/\\]/.test(input)) {
        return true;
    }
    return false;
}

/**
 * Extract project name from Windows-style path
 */
function getWindowsBasename(input: string): string {
    // Normalize separators to forward slashes for easier processing
    const normalized = input.replace(/\\/g, '/');

    // Split by '/' and get the last non-empty segment
    const segments = normalized
        .split('/')
        .filter((segment) => segment.length > 0);
    return segments[segments.length - 1] || 'esmx-project';
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

    // Clean trailing slashes but preserve single '/' or '\'
    let cleanInput = input;
    if (input !== '/' && input !== '\\') {
        cleanInput = input.replace(/[\/\\]+$/g, '');
    }

    let root: string;
    let name: string;

    if (cleanInput === '.') {
        root = workingDir;
        name = basename(workingDir);
    } else if (cleanInput === '' || cleanInput === '/' || cleanInput === '\\') {
        if (cleanInput === '/') {
            root = '/';
            name = 'esmx-project';
        } else {
            root = resolve(workingDir, 'esmx-project');
            name = 'esmx-project';
        }
    } else if (cleanInput.startsWith('@')) {
        if (isAbsolute(cleanInput) || isWindowsAbsolutePath(cleanInput)) {
            root = resolve(cleanInput);
        } else {
            root = resolve(workingDir, cleanInput);
        }
        name = cleanInput;
    } else {
        const isAbsPath =
            isAbsolute(cleanInput) || isWindowsAbsolutePath(cleanInput);

        if (isAbsPath) {
            root = resolve(cleanInput);
            if (isWindowsAbsolutePath(cleanInput)) {
                name = getWindowsBasename(cleanInput);
            } else {
                name = basename(normalize(cleanInput)) || 'esmx-project';
            }
        } else {
            root = resolve(workingDir, cleanInput);
            // For relative paths, also check for Windows-style separators
            if (cleanInput.includes('\\')) {
                name = getWindowsBasename(cleanInput);
            } else {
                const normalizedPath = normalize(cleanInput);
                name = basename(normalizedPath) || 'esmx-project';
            }
        }
    }

    return {
        name,
        root
    };
}
