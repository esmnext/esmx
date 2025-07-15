/**
 * Unit tests for package-manager utilities
 */

import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { getCommand } from './package-manager';
import type { CommandType } from './package-manager';

describe('package-manager utilities', () => {
    // Store original environment variable
    let originalUserAgent: string | undefined;

    beforeEach(() => {
        // Save original environment
        originalUserAgent = process.env.npm_config_user_agent;
    });

    afterEach(() => {
        // Restore original environment
        if (originalUserAgent !== undefined) {
            process.env.npm_config_user_agent = originalUserAgent;
        } else {
            process.env.npm_config_user_agent = undefined;
        }
    });

    describe('getCommand', () => {
        describe('when using npm', () => {
            beforeEach(() => {
                process.env.npm_config_user_agent =
                    'npm/8.19.2 node/v18.12.0 darwin x64 workspaces/false';
            });

            it('should return npm install command', () => {
                // Arrange
                const commandType: CommandType = 'install';

                // Act
                const result = getCommand(commandType);

                // Assert
                expect(result).toBe('npm install');
            });

            it('should return npm dev command', () => {
                // Arrange
                const commandType: CommandType = 'dev';

                // Act
                const result = getCommand(commandType);

                // Assert
                expect(result).toBe('npm run dev');
            });

            it('should return npm build command', () => {
                // Arrange
                const commandType: CommandType = 'build';

                // Act
                const result = getCommand(commandType);

                // Assert
                expect(result).toBe('npm run build');
            });

            it('should return npm start command', () => {
                // Arrange
                const commandType: CommandType = 'start';

                // Act
                const result = getCommand(commandType);

                // Assert
                expect(result).toBe('npm start');
            });

            it('should return npm create command', () => {
                // Arrange
                const commandType: CommandType = 'create';

                // Act
                const result = getCommand(commandType);

                // Assert
                expect(result).toBe('npm create esmx@latest');
            });

            it('should return npm build:type command', () => {
                // Arrange
                const commandType: CommandType = 'build:type';

                // Act
                const result = getCommand(commandType);

                // Assert
                expect(result).toBe('npm run build:type');
            });

            it('should return npm lint:type command', () => {
                // Arrange
                const commandType: CommandType = 'lint:type';

                // Act
                const result = getCommand(commandType);

                // Assert
                expect(result).toBe('npm run lint:type');
            });
        });

        describe('when using yarn', () => {
            beforeEach(() => {
                process.env.npm_config_user_agent =
                    'yarn/1.22.19 npm/? node/v18.12.0 darwin x64';
            });

            it('should return yarn install command', () => {
                // Arrange
                const commandType: CommandType = 'install';

                // Act
                const result = getCommand(commandType);

                // Assert
                expect(result).toBe('yarn install');
            });

            it('should return yarn dev command', () => {
                // Arrange
                const commandType: CommandType = 'dev';

                // Act
                const result = getCommand(commandType);

                // Assert
                expect(result).toBe('yarn dev');
            });

            it('should return yarn build command', () => {
                // Arrange
                const commandType: CommandType = 'build';

                // Act
                const result = getCommand(commandType);

                // Assert
                expect(result).toBe('yarn build');
            });

            it('should return yarn start command', () => {
                // Arrange
                const commandType: CommandType = 'start';

                // Act
                const result = getCommand(commandType);

                // Assert
                expect(result).toBe('yarn start');
            });

            it('should return yarn create command', () => {
                // Arrange
                const commandType: CommandType = 'create';

                // Act
                const result = getCommand(commandType);

                // Assert
                expect(result).toBe('yarn create esmx');
            });

            it('should return yarn build:type command', () => {
                // Arrange
                const commandType: CommandType = 'build:type';

                // Act
                const result = getCommand(commandType);

                // Assert
                expect(result).toBe('yarn build:type');
            });

            it('should return yarn lint:type command', () => {
                // Arrange
                const commandType: CommandType = 'lint:type';

                // Act
                const result = getCommand(commandType);

                // Assert
                expect(result).toBe('yarn lint:type');
            });
        });

        describe('when using pnpm', () => {
            beforeEach(() => {
                process.env.npm_config_user_agent =
                    'pnpm/7.14.0 npm/? node/v18.12.0 darwin x64';
            });

            it('should return pnpm install command', () => {
                // Arrange
                const commandType: CommandType = 'install';

                // Act
                const result = getCommand(commandType);

                // Assert
                expect(result).toBe('pnpm install');
            });

            it('should return pnpm dev command', () => {
                // Arrange
                const commandType: CommandType = 'dev';

                // Act
                const result = getCommand(commandType);

                // Assert
                expect(result).toBe('pnpm dev');
            });

            it('should return pnpm build command', () => {
                // Arrange
                const commandType: CommandType = 'build';

                // Act
                const result = getCommand(commandType);

                // Assert
                expect(result).toBe('pnpm build');
            });

            it('should return pnpm start command', () => {
                // Arrange
                const commandType: CommandType = 'start';

                // Act
                const result = getCommand(commandType);

                // Assert
                expect(result).toBe('pnpm start');
            });

            it('should return pnpm create command', () => {
                // Arrange
                const commandType: CommandType = 'create';

                // Act
                const result = getCommand(commandType);

                // Assert
                expect(result).toBe('pnpm create esmx');
            });

            it('should return pnpm build:type command', () => {
                // Arrange
                const commandType: CommandType = 'build:type';

                // Act
                const result = getCommand(commandType);

                // Assert
                expect(result).toBe('pnpm build:type');
            });

            it('should return pnpm lint:type command', () => {
                // Arrange
                const commandType: CommandType = 'lint:type';

                // Act
                const result = getCommand(commandType);

                // Assert
                expect(result).toBe('pnpm lint:type');
            });
        });

        describe('when using bun', () => {
            beforeEach(() => {
                process.env.npm_config_user_agent =
                    'bun/0.6.0 bun/0.6.0 darwin x64';
            });

            it('should return bun install command', () => {
                // Arrange
                const commandType: CommandType = 'install';

                // Act
                const result = getCommand(commandType);

                // Assert
                expect(result).toBe('bun install');
            });

            it('should return bun dev command', () => {
                // Arrange
                const commandType: CommandType = 'dev';

                // Act
                const result = getCommand(commandType);

                // Assert
                expect(result).toBe('bun dev');
            });

            it('should return bun build command', () => {
                // Arrange
                const commandType: CommandType = 'build';

                // Act
                const result = getCommand(commandType);

                // Assert
                expect(result).toBe('bun run build');
            });

            it('should return bun start command', () => {
                // Arrange
                const commandType: CommandType = 'start';

                // Act
                const result = getCommand(commandType);

                // Assert
                expect(result).toBe('bun start');
            });

            it('should return bun create command', () => {
                // Arrange
                const commandType: CommandType = 'create';

                // Act
                const result = getCommand(commandType);

                // Assert
                expect(result).toBe('bun create esmx');
            });

            it('should return bun build:type command', () => {
                // Arrange
                const commandType: CommandType = 'build:type';

                // Act
                const result = getCommand(commandType);

                // Assert
                expect(result).toBe('bun run build:type');
            });

            it('should return bun lint:type command', () => {
                // Arrange
                const commandType: CommandType = 'lint:type';

                // Act
                const result = getCommand(commandType);

                // Assert
                expect(result).toBe('bun run lint:type');
            });
        });

        describe('when user agent is not set', () => {
            beforeEach(() => {
                process.env.npm_config_user_agent = undefined;
            });

            it('should default to npm commands', () => {
                // Arrange
                const commandType: CommandType = 'install';

                // Act
                const result = getCommand(commandType);

                // Assert
                expect(result).toBe('npm install');
            });
        });

        describe('when user agent is empty string', () => {
            beforeEach(() => {
                process.env.npm_config_user_agent = '';
            });

            it('should default to npm commands', () => {
                // Arrange
                const commandType: CommandType = 'dev';

                // Act
                const result = getCommand(commandType);

                // Assert
                expect(result).toBe('npm run dev');
            });
        });

        describe('when user agent contains unknown package manager', () => {
            beforeEach(() => {
                process.env.npm_config_user_agent =
                    'unknown-pm/1.0.0 node/v18.12.0';
            });

            it('should default to npm commands', () => {
                // Arrange
                const commandType: CommandType = 'build';

                // Act
                const result = getCommand(commandType);

                // Assert
                expect(result).toBe('npm run build');
            });
        });
    });
});
