import { describe, expect, it } from 'vitest';
import type { ProjectNameResult } from './project-name';
import { formatProjectName } from './project-name';

const isWindows = process.platform === 'win32';
const isUnix = !isWindows;

describe('project-name utilities', () => {
    describe('formatProjectName', () => {
        it('should handle simple project name', () => {
            const input = 'foo';
            const cwd = isWindows ? 'C:\\workspace' : '/home/user';

            const result: ProjectNameResult = formatProjectName(input, cwd);

            expect(result.name).toBe('foo');
            if (isWindows) {
                expect(result.root).toBe('C:\\workspace\\foo');
            } else {
                expect(result.root).toBe('/home/user/foo');
            }
        });

        it('should handle nested path project name', () => {
            const input = isWindows ? 'foo\\bar' : 'foo/bar';
            const cwd = isWindows ? 'C:\\workspace' : '/home/user';

            const result: ProjectNameResult = formatProjectName(input, cwd);

            expect(result.name).toBe('bar');
            if (isWindows) {
                expect(result.root).toBe('C:\\workspace\\foo\\bar');
            } else {
                expect(result.root).toBe('/home/user/foo/bar');
            }
        });

        it('should handle scoped package name', () => {
            const input = '@scope/foo';
            const cwd = isWindows ? 'C:\\workspace' : '/home/user';

            const result: ProjectNameResult = formatProjectName(input, cwd);

            expect(result.name).toBe('@scope/foo');
            if (isWindows) {
                expect(result.root).toBe('C:\\workspace\\@scope\\foo');
            } else {
                expect(result.root).toBe('/home/user/@scope/foo');
            }
        });

        it('should handle relative path project name', () => {
            const input = isWindows ? '.\\foo\\bar' : './foo/bar';
            const cwd = isWindows
                ? 'C:\\workspace\\current'
                : '/home/user/current';

            const result: ProjectNameResult = formatProjectName(input, cwd);

            expect(result.name).toBe('bar');
            if (isWindows) {
                expect(result.root).toBe('C:\\workspace\\current\\foo\\bar');
            } else {
                expect(result.root).toBe('/home/user/current/foo/bar');
            }
        });

        it('should handle absolute path project name', () => {
            const input = isWindows
                ? 'C:\\projects\\my-app'
                : '/root/path/to/foo';
            const cwd = isWindows ? 'D:\\workspace' : '/home/user';

            const result: ProjectNameResult = formatProjectName(input, cwd);

            if (isWindows) {
                expect(result.name).toBe('my-app');
                expect(result.root).toBe('C:\\projects\\my-app');
            } else {
                expect(result.name).toBe('foo');
                expect(result.root).toBe('/root/path/to/foo');
            }
        });

        it('should handle current directory', () => {
            const input = '.';
            const cwd = isWindows
                ? 'C:\\Users\\Developer\\Projects\\WindowsApp'
                : '/home/user/projects/my-app';

            const result: ProjectNameResult = formatProjectName(input, cwd);

            if (isWindows) {
                expect(result.name).toBe('WindowsApp');
                expect(result.root).toBe(
                    'C:\\Users\\Developer\\Projects\\WindowsApp'
                );
            } else {
                expect(result.name).toBe('my-app');
                expect(result.root).toBe('/home/user/projects/my-app');
            }
        });

        it('should handle project name with trailing slashes', () => {
            const input = isWindows ? 'foo\\' : 'foo/';
            const cwd = isWindows ? 'C:\\workspace' : '/home/user';

            const result: ProjectNameResult = formatProjectName(input, cwd);

            expect(result.name).toBe('foo');
            if (isWindows) {
                expect(result.root).toBe('C:\\workspace\\foo');
            } else {
                expect(result.root).toBe('/home/user/foo');
            }
        });

        it('should handle project name with multiple trailing slashes', () => {
            const input = isWindows ? 'foo\\\\\\' : 'foo///';
            const cwd = isWindows ? 'C:\\workspace' : '/home/user';

            const result: ProjectNameResult = formatProjectName(input, cwd);

            expect(result.name).toBe('foo');
            if (isWindows) {
                expect(result.root).toBe('C:\\workspace\\foo');
            } else {
                expect(result.root).toBe('/home/user/foo');
            }
        });

        it('should handle deep nested path', () => {
            const input = isWindows
                ? 'path\\to\\nested\\project'
                : 'path/to/nested/project';
            const cwd = isWindows ? 'C:\\workspace' : '/home/user';

            const result: ProjectNameResult = formatProjectName(input, cwd);

            expect(result.name).toBe('project');
            if (isWindows) {
                expect(result.root).toBe(
                    'C:\\workspace\\path\\to\\nested\\project'
                );
            } else {
                expect(result.root).toBe('/home/user/path/to/nested/project');
            }
        });

        it('should handle scoped package with nested path', () => {
            const input = isWindows
                ? '@company\\ui\\library'
                : '@company/ui/library';
            const cwd = isWindows ? 'C:\\workspace' : '/home/user';

            const result: ProjectNameResult = formatProjectName(input, cwd);

            expect(result.name).toBe(input);
            if (isWindows) {
                expect(result.root).toBe(
                    'C:\\workspace\\@company\\ui\\library'
                );
            } else {
                expect(result.root).toBe('/home/user/@company/ui/library');
            }
        });

        it('should handle scoped package starting with @', () => {
            const input = '@my-org/my-package';
            const cwd = isWindows ? 'C:\\workspace' : '/home/user';

            const result: ProjectNameResult = formatProjectName(input, cwd);

            expect(result.name).toBe('@my-org/my-package');
            if (isWindows) {
                expect(result.root).toBe('C:\\workspace\\@my-org\\my-package');
            } else {
                expect(result.root).toBe('/home/user/@my-org/my-package');
            }
        });

        it('should handle empty path segment', () => {
            const input = isWindows
                ? 'path\\\\with\\\\segments'
                : 'path//with//segments';
            const cwd = isWindows ? 'C:\\workspace' : '/home/user';

            const result: ProjectNameResult = formatProjectName(input, cwd);

            expect(result.name).toBe('segments');
            if (isWindows) {
                expect(result.root).toBe('C:\\workspace\\path\\with\\segments');
            } else {
                expect(result.root).toBe('/home/user/path/with/segments');
            }
        });

        it('should handle single character project name', () => {
            const input = 'a';
            const cwd = isWindows ? 'C:\\workspace' : '/home/user';

            const result: ProjectNameResult = formatProjectName(input, cwd);

            expect(result.name).toBe('a');
            if (isWindows) {
                expect(result.root).toBe('C:\\workspace\\a');
            } else {
                expect(result.root).toBe('/home/user/a');
            }
        });

        it('should handle project name with numbers and hyphens', () => {
            const input = 'my-project-123';
            const cwd = isWindows ? 'C:\\workspace' : '/home/user';

            const result: ProjectNameResult = formatProjectName(input, cwd);

            expect(result.name).toBe('my-project-123');
            if (isWindows) {
                expect(result.root).toBe('C:\\workspace\\my-project-123');
            } else {
                expect(result.root).toBe('/home/user/my-project-123');
            }
        });

        it('should handle project name ending with slash', () => {
            const input = isWindows ? 'my-project\\' : 'my-project/';
            const cwd = isWindows ? 'C:\\workspace' : '/home/user';

            const result: ProjectNameResult = formatProjectName(input, cwd);

            expect(result.name).toBe('my-project');
            if (isWindows) {
                expect(result.root).toBe('C:\\workspace\\my-project');
            } else {
                expect(result.root).toBe('/home/user/my-project');
            }
        });

        it('should fall back to default name when path ends with slash and no name', () => {
            const input = '/';
            const cwd = isWindows ? 'C:\\workspace' : '/home/user';

            const result: ProjectNameResult = formatProjectName(input, cwd);

            expect(result.root).toBe('/');
            expect(result.name).toBe('esmx-project');
        });

        it.runIf(isWindows)(
            'should handle Windows-style absolute paths',
            () => {
                const input = 'C:\\projects\\my-app';
                const cwd = 'D:\\workspace';

                const result: ProjectNameResult = formatProjectName(input, cwd);

                expect(result.name).toBe('my-app');
                expect(result.root).toMatch(/projects[\\/]my-app/);
            }
        );

        it.runIf(isWindows)('should handle Windows UNC paths', () => {
            const input = '\\\\server\\share\\project';
            const cwd = 'C:\\workspace';

            const result: ProjectNameResult = formatProjectName(input, cwd);

            expect(result.name).toBe('project');
            expect(result.root).toMatch(/project$/);
        });

        it.runIf(isUnix)('should handle mixed path separators on Unix', () => {
            const input = 'path\\to/mixed/separators';
            const cwd = '/home/user';

            const result: ProjectNameResult = formatProjectName(input, cwd);

            expect(result.name).toBe('separators');
            expect(result.root).toBe('/home/user/path\\to/mixed/separators');
        });

        it.runIf(isWindows)(
            'should handle Windows-style relative paths',
            () => {
                const input = 'foo\\bar';
                const cwd = 'C:\\workspace';

                const result: ProjectNameResult = formatProjectName(input, cwd);

                expect(result.name).toBe('bar');
                expect(result.root).toMatch(/workspace[\\/]foo[\\/]bar/);
            }
        );

        it.runIf(isWindows)(
            'should handle Windows-style trailing backslashes',
            () => {
                const input = 'foo\\bar\\\\\\';
                const cwd = 'C:\\workspace';

                const result: ProjectNameResult = formatProjectName(input, cwd);

                expect(result.name).toBe('bar');
                expect(result.root).toMatch(/workspace[\\/]foo[\\/]bar/);
            }
        );
    });

    describe('formatProjectName with cwd parameter', () => {
        it('should use custom cwd when input is "."', () => {
            const input = '.';
            const customCwd = isWindows
                ? 'C:\\custom\\path\\to\\project'
                : '/custom/path/to/project';

            const result: ProjectNameResult = formatProjectName(
                input,
                customCwd
            );

            expect(result.name).toBe('project');
            expect(result.root).toBe(customCwd);
        });

        it('should fallback to process.cwd() when cwd is not provided', () => {
            const input = 'test-project';

            const result: ProjectNameResult = formatProjectName(input);

            expect(result.name).toBe('test-project');
            expect(result.root).toMatch(/test-project$/);
        });

        it('should ignore cwd parameter when input is not "."', () => {
            const input = 'my-project';
            const customCwd = isWindows ? 'C:\\custom\\path' : '/custom/path';

            const result: ProjectNameResult = formatProjectName(
                input,
                customCwd
            );

            expect(result.name).toBe('my-project');
            if (isWindows) {
                expect(result.root).toBe('C:\\custom\\path\\my-project');
            } else {
                expect(result.root).toBe('/custom/path/my-project');
            }
        });

        it('should handle scoped packages with custom cwd', () => {
            const input = '@scope/foo';
            const customCwd = isWindows
                ? 'C:\\custom\\workspace'
                : '/custom/workspace';

            const result: ProjectNameResult = formatProjectName(
                input,
                customCwd
            );

            expect(result.name).toBe('@scope/foo');
            if (isWindows) {
                expect(result.root).toBe('C:\\custom\\workspace\\@scope\\foo');
            } else {
                expect(result.root).toBe('/custom/workspace/@scope/foo');
            }
        });

        it('should handle nested paths with custom cwd', () => {
            const input = isWindows ? 'foo\\bar' : 'foo/bar';
            const customCwd = isWindows
                ? 'C:\\custom\\workspace'
                : '/custom/workspace';

            const result: ProjectNameResult = formatProjectName(
                input,
                customCwd
            );

            expect(result.name).toBe('bar');
            if (isWindows) {
                expect(result.root).toBe('C:\\custom\\workspace\\foo\\bar');
            } else {
                expect(result.root).toBe('/custom/workspace/foo/bar');
            }
        });

        it.runIf(isUnix)(
            'should handle Unix-style absolute paths in cwd',
            () => {
                const input = '/root/path/to/foo';
                const customCwd = '/this/should/be/ignored';

                const result: ProjectNameResult = formatProjectName(
                    input,
                    customCwd
                );

                expect(result.name).toBe('foo');
                expect(result.root).toBe('/root/path/to/foo');
            }
        );

        it.runIf(isWindows)(
            'should handle Windows-style absolute paths in cwd',
            () => {
                const input = 'C:\\projects\\my-app';
                const customCwd = 'D:\\this\\should\\be\\ignored';

                const result: ProjectNameResult = formatProjectName(
                    input,
                    customCwd
                );

                expect(result.name).toBe('my-app');
                expect(result.root).toBe('C:\\projects\\my-app');
            }
        );

        it('should handle absolute input paths and ignore cwd', () => {
            const input = isWindows
                ? 'C:\\projects\\absolute-project'
                : '/projects/absolute-project';
            const customCwd = isWindows ? 'D:\\ignored' : '/ignored';

            const result: ProjectNameResult = formatProjectName(
                input,
                customCwd
            );

            expect(result.name).toBe('absolute-project');
            if (isWindows) {
                expect(result.root).toBe('C:\\projects\\absolute-project');
            } else {
                expect(result.root).toBe('/projects/absolute-project');
            }
        });
    });
});
