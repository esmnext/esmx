import { cpSync, existsSync, mkdirSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { config } from '../config.mjs';
import { execCommand, log, toDisplayPath } from '../utils.mjs';

export async function runTests() {
    log.info('Running unit tests with coverage report...');

    let hasTestFailures = false;

    try {
        // Dynamically find all packages that have test files
        const packagesDir = config.packagesDir;

        if (!existsSync(packagesDir)) {
            throw new Error(
                `Packages directory not found: ${toDisplayPath(packagesDir)}`
            );
        }

        const packageDirs = readdirSync(packagesDir, { withFileTypes: true })
            .filter((dirent) => dirent.isDirectory())
            .map((dirent) => join(packagesDir, dirent.name));

        const packagesWithTests = [];

        // Check each package for test files
        for (const packagePath of packageDirs) {
            const srcDir = join(packagePath, 'src');
            if (existsSync(srcDir)) {
                try {
                    const hasTests = readdirSync(srcDir, {
                        recursive: true
                    }).some(
                        (file) =>
                            file.endsWith('.test.ts') ||
                            file.endsWith('.test.js') ||
                            file.endsWith('.spec.ts') ||
                            file.endsWith('.spec.js')
                    );

                    if (hasTests) {
                        packagesWithTests.push(packagePath);
                    }
                } catch (error) {
                    log.error(
                        `Failed to scan package ${toDisplayPath(packagePath)}: ${error.message}`
                    );
                    hasTestFailures = true;
                }
            }
        }

        if (packagesWithTests.length === 0) {
            log.warn('No packages with tests found');
            return { packagesWithTests: [] };
        }

        log.info(
            `Found ${packagesWithTests.length} packages with tests: ${packagesWithTests.map((p) => p.split('/').pop()).join(', ')}`
        );

        for (const packagePath of packagesWithTests) {
            const packageName = packagePath.split('/').pop();
            log.info(`Running tests for ${packageName}...`);

            try {
                await execCommand('pnpm', ['test', '--coverage', '--run'], {
                    cwd: packagePath
                });

                // Copy coverage reports to a consolidated location
                const coverageSource = join(packagePath, 'coverage');
                if (existsSync(coverageSource)) {
                    const coverageTarget = join(
                        config.coverageDir,
                        packageName
                    );

                    if (!existsSync(config.coverageDir)) {
                        mkdirSync(config.coverageDir, { recursive: true });
                    }

                    cpSync(coverageSource, coverageTarget, { recursive: true });
                    log.info(
                        `Coverage report copied to ${toDisplayPath(coverageTarget)}`
                    );
                }

                log.success(`✅ Tests passed for ${packageName}`);
            } catch (error) {
                log.error(
                    `❌ Tests failed for ${packageName}: ${error.message}`
                );
                hasTestFailures = true;
                // Continue with other packages even if one fails
            }
        }

        if (hasTestFailures) {
            throw new Error('One or more test suites failed');
        }

        log.success('✅ All tests passed with coverage reports generated!');
        return { packagesWithTests };
    } catch (error) {
        log.error(`Tests execution failed: ${error.message}`);
        throw error; // Re-throw to ensure non-zero exit
    }
}
