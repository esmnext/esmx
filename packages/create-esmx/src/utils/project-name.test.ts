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

            // Act
            const result: ProjectNameResult = formatProjectName(input);

            // Assert
            expect(result.targetDir).toBe('foo');
            expect(result.packageName).toBe('foo');
        });

        it('should handle nested path project name', () => {
            // Arrange
            const input = 'foo/bar';

            // Act
            const result: ProjectNameResult = formatProjectName(input);

            // Assert
            expect(result.targetDir).toBe('foo/bar');
            expect(result.packageName).toBe('bar');
        });

        it('should handle scoped package name', () => {
            // Arrange
            const input = '@scope/foo';

            // Act
            const result: ProjectNameResult = formatProjectName(input);

            // Assert
            expect(result.targetDir).toBe('@scope/foo');
            expect(result.packageName).toBe('@scope/foo');
        });

        it('should handle relative path project name', () => {
            // Arrange
            const input = './foo/bar';

            // Act
            const result: ProjectNameResult = formatProjectName(input);

            // Assert
            expect(result.targetDir).toBe('./foo/bar');
            expect(result.packageName).toBe('bar');
        });

        it('should handle absolute path project name', () => {
            // Arrange
            const input = '/root/path/to/foo';

            // Act
            const result: ProjectNameResult = formatProjectName(input);

            // Assert
            expect(result.targetDir).toBe('/root/path/to/foo');
            expect(result.packageName).toBe('foo');
        });

        it('should handle current directory', () => {
            // Arrange
            const input = '.';
            const expectedPackageName = basename(process.cwd());

            // Act
            const result: ProjectNameResult = formatProjectName(input);

            // Assert
            expect(result.targetDir).toBe('.');
            expect(result.packageName).toBe(expectedPackageName);
        });

        it('should handle project name with trailing slashes', () => {
            // Arrange
            const input = 'foo/bar///';

            // Act
            const result: ProjectNameResult = formatProjectName(input);

            // Assert
            expect(result.targetDir).toBe('foo/bar');
            expect(result.packageName).toBe('bar');
        });

        it('should handle project name with multiple trailing slashes', () => {
            // Arrange
            const input = 'my-project/////';

            // Act
            const result: ProjectNameResult = formatProjectName(input);

            // Assert
            expect(result.targetDir).toBe('my-project');
            expect(result.packageName).toBe('my-project');
        });

        it('should handle deep nested path', () => {
            // Arrange
            const input = 'projects/web/frontend/my-app';

            // Act
            const result: ProjectNameResult = formatProjectName(input);

            // Assert
            expect(result.targetDir).toBe('projects/web/frontend/my-app');
            expect(result.packageName).toBe('my-app');
        });

        it('should handle scoped package with nested path', () => {
            // Arrange
            const input = 'org/@scope/package-name';

            // Act
            const result: ProjectNameResult = formatProjectName(input);

            // Assert
            expect(result.targetDir).toBe('org/@scope/package-name');
            expect(result.packageName).toBe('package-name');
        });

        it('should handle scoped package starting with @', () => {
            // Arrange
            const input = '@company/ui-library';

            // Act
            const result: ProjectNameResult = formatProjectName(input);

            // Assert
            expect(result.targetDir).toBe('@company/ui-library');
            expect(result.packageName).toBe('@company/ui-library');
        });

        it('should handle empty path segment', () => {
            // Arrange
            const input = 'foo//bar';

            // Act
            const result: ProjectNameResult = formatProjectName(input);

            // Assert
            expect(result.targetDir).toBe('foo//bar');
            expect(result.packageName).toBe('bar');
        });

        it('should handle single character project name', () => {
            // Arrange
            const input = 'a';

            // Act
            const result: ProjectNameResult = formatProjectName(input);

            // Assert
            expect(result.targetDir).toBe('a');
            expect(result.packageName).toBe('a');
        });

        it('should handle project name with numbers and hyphens', () => {
            // Arrange
            const input = 'my-project-v2';

            // Act
            const result: ProjectNameResult = formatProjectName(input);

            // Assert
            expect(result.targetDir).toBe('my-project-v2');
            expect(result.packageName).toBe('my-project-v2');
        });

        it('should handle project name ending with slash', () => {
            // Arrange
            const input = 'path/to/project/';

            // Act
            const result: ProjectNameResult = formatProjectName(input);

            // Assert
            expect(result.targetDir).toBe('path/to/project');
            expect(result.packageName).toBe('project');
        });

        it('should fall back to default name when path ends with slash and no name', () => {
            // Arrange
            const input = '/';

            // Act
            const result: ProjectNameResult = formatProjectName(input);

            // Assert
            expect(result.targetDir).toBe('');
            expect(result.packageName).toBe('esmx-project');
        });

        it('should handle Windows-style paths', () => {
            // Arrange
            const input = 'C:\\projects\\my-app';

            // Act
            const result: ProjectNameResult = formatProjectName(input);

            // Assert
            expect(result.targetDir).toBe('C:\\projects\\my-app');
            // Windows paths use backslashes, so the function returns the full path as package name
            expect(result.packageName).toBe('C:\\projects\\my-app');
        });

        it('should handle mixed path separators', () => {
            // Arrange
            const input = 'path\\to/project';

            // Act
            const result: ProjectNameResult = formatProjectName(input);

            // Assert
            expect(result.targetDir).toBe('path\\to/project');
            expect(result.packageName).toBe('project');
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
            expect(result.targetDir).toBe('.');
            expect(result.packageName).toBe('directory');
        });

        it('should fallback to process.cwd() when cwd is not provided', () => {
            // Arrange
            const input = '.';
            const expectedPackageName = basename(process.cwd());

            // Act
            const result: ProjectNameResult = formatProjectName(input);

            // Assert
            expect(result.targetDir).toBe('.');
            expect(result.packageName).toBe(expectedPackageName);
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
            expect(result.targetDir).toBe('my-project');
            expect(result.packageName).toBe('my-project');
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
            expect(result.targetDir).toBe('@scope/package');
            expect(result.packageName).toBe('@scope/package');
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
            expect(result.targetDir).toBe('org/team/project');
            expect(result.packageName).toBe('project');
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
            expect(result.targetDir).toBe('.');
            expect(result.packageName).toBe('my-awesome-app');
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
            expect(result.targetDir).toBe('.');
            // On Unix systems, backslashes are treated as regular characters
            // On Windows systems, basename would correctly extract 'WindowsApp'
            // This test verifies the current behavior on the running platform
            const expectedPackageName = basename(customCwd);
            expect(result.packageName).toBe(expectedPackageName);
        });
    });
});
