/**
 * Unit tests for template variable replacement utilities
 */

import { describe, expect, it } from 'vitest';
import { replaceTemplateVariables } from './template';

describe('replaceTemplateVariables', () => {
    describe('basic functionality', () => {
        it('should replace single variable', () => {
            // Arrange
            const content = 'Hello {{name}}!';
            const variables = { name: 'World' };

            // Act
            const result = replaceTemplateVariables(content, variables);

            // Assert
            expect(result).toBe('Hello World!');
        });

        it('should replace multiple different variables', () => {
            // Arrange
            const content = 'Project {{projectName}} version {{version}}';
            const variables = {
                projectName: 'my-app',
                version: '1.0.0'
            };

            // Act
            const result = replaceTemplateVariables(content, variables);

            // Assert
            expect(result).toBe('Project my-app version 1.0.0');
        });

        it('should replace same variable multiple times', () => {
            // Arrange
            const content = '{{greeting}} {{name}}, {{greeting}} again!';
            const variables = {
                greeting: 'Hello',
                name: 'World'
            };

            // Act
            const result = replaceTemplateVariables(content, variables);

            // Assert
            expect(result).toBe('Hello World, Hello again!');
        });
    });

    describe('edge cases', () => {
        it('should handle content without variables', () => {
            // Arrange
            const content = 'No variables here';
            const variables = { name: 'World' };

            // Act
            const result = replaceTemplateVariables(content, variables);

            // Assert
            expect(result).toBe('No variables here');
        });

        it('should handle empty variables object', () => {
            // Arrange
            const content = 'Hello {{name}}!';
            const variables = {};

            // Act
            const result = replaceTemplateVariables(content, variables);

            // Assert
            expect(result).toBe('Hello {{name}}!');
        });

        it('should handle empty content', () => {
            // Arrange
            const content = '';
            const variables = { name: 'World' };

            // Act
            const result = replaceTemplateVariables(content, variables);

            // Assert
            expect(result).toBe('');
        });

        it('should handle variables with special characters', () => {
            // Arrange
            const content = 'Command: {{installCommand}}';
            const variables = { installCommand: 'npm install --save-dev' };

            // Act
            const result = replaceTemplateVariables(content, variables);

            // Assert
            expect(result).toBe('Command: npm install --save-dev');
        });

        it('should handle variables with regex special characters', () => {
            // Arrange
            const content = 'Pattern: {{pattern}}';
            const variables = { pattern: '[a-z]+.*$' };

            // Act
            const result = replaceTemplateVariables(content, variables);

            // Assert
            expect(result).toBe('Pattern: [a-z]+.*$');
        });
    });

    describe('real-world scenarios', () => {
        it('should handle all template variables from create-esmx', () => {
            // Arrange
            const content = `# {{projectName}}

Install dependencies:
\`\`\`bash
{{installCommand}}
\`\`\`

Start development:
\`\`\`bash
{{devCommand}}
\`\`\`

Build for production:
\`\`\`bash
{{buildCommand}}
\`\`\`

Start production server:
\`\`\`bash
{{startCommand}}
\`\`\`

Esmx version: {{esmxVersion}}`;

            const variables = {
                projectName: 'my-awesome-app',
                installCommand: 'pnpm install',
                devCommand: 'pnpm dev',
                buildCommand: 'pnpm build',
                startCommand: 'pnpm start',
                esmxVersion: '3.0.0-rc.33'
            };

            // Act
            const result = replaceTemplateVariables(content, variables);

            // Assert
            expect(result).toContain('# my-awesome-app');
            expect(result).toContain('pnpm install');
            expect(result).toContain('pnpm dev');
            expect(result).toContain('pnpm build');
            expect(result).toContain('pnpm start');
            expect(result).toContain('3.0.0-rc.33');
            expect(result).not.toContain('{{');
            expect(result).not.toContain('}}');
        });

        it('should handle package.json template', () => {
            // Arrange
            const content = `{
  "name": "{{projectName}}",
  "version": "1.0.0",
  "scripts": {
    "dev": "esmx dev",
    "build": "esmx build",
    "start": "esmx start"
  },
  "dependencies": {
    "esmx": "{{esmxVersion}}"
  }
}`;

            const variables = {
                projectName: '@scope/my-package',
                esmxVersion: '^3.0.0'
            };

            // Act
            const result = replaceTemplateVariables(content, variables);

            // Assert
            expect(result).toContain('"name": "@scope/my-package"');
            expect(result).toContain('"esmx": "^3.0.0"');
        });
    });

    describe('variable name validation', () => {
        it('should handle variables with underscores', () => {
            // Arrange
            const content = 'Command: {{install_command}}';
            const variables = { install_command: 'npm install' };

            // Act
            const result = replaceTemplateVariables(content, variables);

            // Assert
            expect(result).toBe('Command: npm install');
        });

        it('should handle variables with numbers', () => {
            // Arrange
            const content = 'Node version: {{node18}}';
            const variables = { node18: 'v18.12.0' };

            // Act
            const result = replaceTemplateVariables(content, variables);

            // Assert
            expect(result).toBe('Node version: v18.12.0');
        });

        it('should be case sensitive', () => {
            // Arrange
            const content = 'Hello {{Name}} and {{name}}!';
            const variables = {
                Name: 'Alice',
                name: 'Bob'
            };

            // Act
            const result = replaceTemplateVariables(content, variables);

            // Assert
            expect(result).toBe('Hello Alice and Bob!');
        });
    });
});
