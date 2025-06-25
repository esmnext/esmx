import { describe, expect, test } from 'vitest';
import { generateIdentifier } from './manifest';

describe('generateIdentifier', () => {
    test('should generate correct identifier with relative path', () => {
        // Arrange
        const root = '/project/root';
        const name = 'my-module';
        const filePath = '/project/root/src/components/Button.tsx';

        // Act
        const result = generateIdentifier({ root, name, filePath });

        // Assert
        expect(result).toBe('my-module@src/components/Button.tsx');
    });

    test('should handle different path separators correctly', () => {
        // Arrange
        const root = 'C:\\project\\root';
        const name = 'my-module';
        const filePath = 'C:\\project\\root\\src\\components\\Button.tsx';

        // Act
        const result = generateIdentifier({ root, name, filePath });

        // Assert
        expect(result).toBe('my-module@src/components/Button.tsx');
    });

    test('should handle nested module paths correctly', () => {
        // Arrange
        const root = '/project/root';
        const name = '@scope/module';
        const filePath = '/project/root/packages/sub-module/index.ts';

        // Act
        const result = generateIdentifier({ root, name, filePath });

        // Assert
        expect(result).toBe('@scope/module@packages/sub-module/index.ts');
    });

    test('should handle same directory files correctly', () => {
        // Arrange
        const root = '/project/root';
        const name = 'module';
        const filePath = '/project/root/index.ts';

        // Act
        const result = generateIdentifier({ root, name, filePath });

        // Assert
        expect(result).toBe('module@index.ts');
    });

    test('should handle file path outside root directory', () => {
        // Arrange
        const root = '/project/root';
        const name = 'module';
        const filePath = '/project/external/file.ts';

        // Act
        const result = generateIdentifier({ root, name, filePath });

        // Assert
        expect(result).toBe('module@../external/file.ts');
    });

    test('should handle empty root path correctly', () => {
        // Arrange
        const root = '';
        const name = 'module';
        const filePath = '/absolute/path/file.ts';

        // Act
        const result = generateIdentifier({ root, name, filePath });

        // Assert
        expect(result).toBe('module@/absolute/path/file.ts');
    });

    test('should handle special characters in module name', () => {
        // Arrange
        const root = '/root';
        const name = '@org/module-name';
        const filePath = '/root/src/index.ts';

        // Act
        const result = generateIdentifier({ root, name, filePath });

        // Assert
        expect(result).toBe('@org/module-name@src/index.ts');
    });

    test('should handle file paths with dots correctly', () => {
        // Arrange
        const root = '/root';
        const name = 'module';
        const filePath = '/root/src/components/Button.test.tsx';

        // Act
        const result = generateIdentifier({ root, name, filePath });

        // Assert
        expect(result).toBe('module@src/components/Button.test.tsx');
    });
});
