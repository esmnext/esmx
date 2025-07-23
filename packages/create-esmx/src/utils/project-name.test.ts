/**
 * Unit tests for project-name utilities
 */

import { basename } from 'node:path';
import { describe, expect, it } from 'vitest';
import { formatProjectName } from './project-name';
import type { ProjectNameResult } from './project-name';

describe('project-name utilities', () => {
    describe('formatProjectName', () => {
        it('should handle simple project name', () => {
            // Arrange
            const input = 'foo';
            const cwd = '/home/user';

            // Act
            const result: ProjectNameResult = formatProjectName(input, cwd);

            // Assert
            expect(result.root).toBe('/home/user/foo');
            expect(result.name).toBe('foo');
        });

        it('should handle nested path project name', () => {
            // Arrange
            const input = 'foo/bar';
            const cwd = '/home/user';

            // Act
            const result: ProjectNameResult = formatProjectName(input, cwd);

            // Assert
            expect(result.root).toBe('/home/user/foo/bar');
            expect(result.name).toBe('bar');
        });

        it('should handle scoped package name', () => {
            // Arrange
            const input = '@scope/foo';
            const cwd = '/home/user';

            // Act
            const result: ProjectNameResult = formatProjectName(input, cwd);

            // Assert
            expect(result.root).toBe('/home/user/@scope/foo');
            expect(result.name).toBe('@scope/foo');
        });

        it('should handle relative path project name', () => {
            // Arrange
            const input = './foo/bar';
            const cwd = '/home/user/current';

            // Act
            const result: ProjectNameResult = formatProjectName(input, cwd);

            // Assert
            expect(result.root).toBe('/home/user/current/foo/bar');
            expect(result.name).toBe('bar');
        });

        it('should handle absolute path project name', () => {
            // Arrange
            const input = '/root/path/to/foo';
            const cwd = '/home/user';

            // Act
            const result: ProjectNameResult = formatProjectName(input, cwd);

            // Assert
            expect(result.root).toBe('/root/path/to/foo');
            expect(result.name).toBe('foo');
        });

        it('should handle current directory', () => {
            // Arrange
            const input = '.';
            const cwd = '/home/user/projects/my-app';

            // Act
            const result: ProjectNameResult = formatProjectName(input, cwd);

            // Assert
            expect(result.root).toBe('/home/user/projects/my-app');
            expect(result.name).toBe('my-app');
        });

        it('should handle project name with trailing slashes', () => {
            // Arrange
            const input = 'foo/bar///';
            const cwd = '/home/user';

            // Act
            const result: ProjectNameResult = formatProjectName(input, cwd);

            // Assert
            expect(result.root).toBe('/home/user/foo/bar');
            expect(result.name).toBe('bar');
        });

        it('should handle project name with multiple trailing slashes', () => {
            // Arrange
            const input = 'my-project/////';
            const cwd = '/home/user';

            // Act
            const result: ProjectNameResult = formatProjectName(input, cwd);

            // Assert
            expect(result.root).toBe('/home/user/my-project');
            expect(result.name).toBe('my-project');
        });

        it('should handle deep nested path', () => {
            // Arrange
            const input = 'projects/web/frontend/my-app';
            const cwd = '/home/user';

            // Act
            const result: ProjectNameResult = formatProjectName(input, cwd);

            // Assert
            expect(result.root).toBe('/home/user/projects/web/frontend/my-app');
            expect(result.name).toBe('my-app');
        });

        it('should handle scoped package with nested path', () => {
            // Arrange
            const input = 'org/@scope/package-name';
            const cwd = '/home/user';

            // Act
            const result: ProjectNameResult = formatProjectName(input, cwd);

            // Assert
            expect(result.root).toBe('/home/user/org/@scope/package-name');
            expect(result.name).toBe('package-name');
        });

        it('should handle scoped package starting with @', () => {
            // Arrange
            const input = '@company/ui-library';
            const cwd = '/home/user';

            // Act
            const result: ProjectNameResult = formatProjectName(input, cwd);

            // Assert
            expect(result.root).toBe('/home/user/@company/ui-library');
            expect(result.name).toBe('@company/ui-library');
        });

        it('should handle empty path segment', () => {
            // Arrange
            const input = 'foo//bar';
            const cwd = '/home/user';

            // Act
            const result: ProjectNameResult = formatProjectName(input, cwd);

            // Assert
            expect(result.root).toBe('/home/user/foo/bar');
            expect(result.name).toBe('bar');
        });

        it('should handle single character project name', () => {
            // Arrange
            const input = 'a';
            const cwd = '/home/user';

            // Act
            const result: ProjectNameResult = formatProjectName(input, cwd);

            // Assert
            expect(result.root).toBe('/home/user/a');
            expect(result.name).toBe('a');
        });

        it('should handle project name with numbers and hyphens', () => {
            // Arrange
            const input = 'my-project-v2';
            const cwd = '/home/user';

            // Act
            const result: ProjectNameResult = formatProjectName(input, cwd);

            // Assert
            expect(result.root).toBe('/home/user/my-project-v2');
            expect(result.name).toBe('my-project-v2');
        });

        it('should handle project name ending with slash', () => {
            // Arrange
            const input = 'path/to/project/';
            const cwd = '/home/user';

            // Act
            const result: ProjectNameResult = formatProjectName(input, cwd);

            // Assert
            expect(result.root).toBe('/home/user/path/to/project');
            expect(result.name).toBe('project');
        });

        it('should fall back to default name when path ends with slash and no name', () => {
            // Arrange
            const input = '/';
            const cwd = '/home/user';

            // Act
            const result: ProjectNameResult = formatProjectName(input, cwd);

            // Assert
            // When input is just '/', it's treated as an absolute path to root
            // But creating projects in root is dangerous, so we should handle this carefully
            // For now, we treat it as root path but this might need product decision
            expect(result.root).toBe('/');
            expect(result.name).toBe('esmx-project');
        });

        it('should handle Windows-style absolute paths', () => {
            // Arrange
            const input = 'C:\\projects\\my-app';
            const cwd = 'D:\\workspace';

            // Act
            const result: ProjectNameResult = formatProjectName(input, cwd);

            // Assert
            expect(result.name).toBe('my-app');
            expect(result.root).toMatch(/projects[\/\\]my-app/);
        });

        it('should handle Windows UNC paths', () => {
            // Arrange
            const input = '\\\\server\\share\\project';
            const cwd = 'C:\\workspace';

            // Act
            const result: ProjectNameResult = formatProjectName(input, cwd);

            // Assert
            expect(result.name).toBe('project');
            expect(result.root).toMatch(/project$/);
        });

        it('should handle mixed path separators', () => {
            // Arrange
            const input = 'path\\to/project';
            const cwd = '/home/user';

            // Act
            const result: ProjectNameResult = formatProjectName(input, cwd);

            // Assert
            expect(result.root).toMatch(/path[\/\\]to[\/\\]project/);
            expect(result.name).toBe('project');
        });

        it('should handle Windows-style relative paths', () => {
            // Arrange
            const input = 'foo\\bar';
            const cwd = 'C:\\workspace';

            // Act
            const result: ProjectNameResult = formatProjectName(input, cwd);

            // Assert
            expect(result.name).toBe('bar');
            expect(result.root).toMatch(/workspace[\/\\]foo[\/\\]bar/);
        });

        it('should handle Windows-style trailing backslashes', () => {
            // Arrange
            const input = 'foo\\bar\\\\\\';
            const cwd = 'C:\\workspace';

            // Act
            const result: ProjectNameResult = formatProjectName(input, cwd);

            // Assert
            expect(result.name).toBe('bar');
            expect(result.root).toMatch(/workspace[\/\\]foo[\/\\]bar/);
        });
    });

    describe('formatProjectName with cwd parameter', () => {
        it('should use custom cwd when input is "."', () => {
            // Arrange
            const input = '.';
            const customCwd = '/custom/working/directory';

            // Act
            const result: ProjectNameResult = formatProjectName(
                input,
                customCwd
            );

            // Assert
            expect(result.root).toBe('/custom/working/directory');
            expect(result.name).toBe('directory');
        });

        it('should fallback to process.cwd() when cwd is not provided', () => {
            // Arrange
            const input = '.';
            const expectedPackageName = basename(process.cwd());

            // Act
            const result: ProjectNameResult = formatProjectName(input);

            // Assert
            expect(result.root).toBe(process.cwd());
            expect(result.name).toBe(expectedPackageName);
        });

        it('should ignore cwd parameter when input is not "."', () => {
            // Arrange
            const input = 'my-project';
            const customCwd = '/custom/working/directory';

            // Act
            const result: ProjectNameResult = formatProjectName(
                input,
                customCwd
            );

            // Assert
            expect(result.root).toBe('/custom/working/directory/my-project');
            expect(result.name).toBe('my-project');
        });

        it('should handle scoped packages with custom cwd', () => {
            // Arrange
            const input = '@scope/package';
            const customCwd = '/any/directory';

            // Act
            const result: ProjectNameResult = formatProjectName(
                input,
                customCwd
            );

            // Assert
            expect(result.root).toBe('/any/directory/@scope/package');
            expect(result.name).toBe('@scope/package');
        });

        it('should handle nested paths with custom cwd', () => {
            // Arrange
            const input = 'org/team/project';
            const customCwd = '/any/directory';

            // Act
            const result: ProjectNameResult = formatProjectName(
                input,
                customCwd
            );

            // Assert
            expect(result.root).toBe('/any/directory/org/team/project');
            expect(result.name).toBe('project');
        });

        it('should handle Unix-style absolute paths in cwd', () => {
            // Arrange
            const input = '.';
            const customCwd = '/home/user/projects/my-awesome-app';

            // Act
            const result: ProjectNameResult = formatProjectName(
                input,
                customCwd
            );

            // Assert
            expect(result.root).toBe('/home/user/projects/my-awesome-app');
            expect(result.name).toBe('my-awesome-app');
        });

        it('should handle Windows-style absolute paths in cwd', () => {
            // Arrange
            const input = '.';
            const customCwd = 'C:\\Users\\Developer\\Projects\\WindowsApp';

            // Act
            const result: ProjectNameResult = formatProjectName(
                input,
                customCwd
            );

            // Assert
            expect(result.root).toBe(
                'C:\\Users\\Developer\\Projects\\WindowsApp'
            );
            const expectedPackageName = basename(customCwd);
            expect(result.name).toBe(expectedPackageName);
        });

        it('should handle absolute input paths and ignore cwd', () => {
            // Arrange
            const input = '/absolute/path/to/project';
            const customCwd = '/ignored/directory';

            // Act
            const result: ProjectNameResult = formatProjectName(
                input,
                customCwd
            );

            // Assert
            expect(result.root).toBe('/absolute/path/to/project');
            expect(result.name).toBe('project');
        });
    });
});
