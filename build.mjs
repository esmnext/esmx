#!/usr/bin/env node

import { execSync, spawn } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, readdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';

// Color codes for cross-platform output
const colors = {
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
    bold: '\x1b[1m',
    reset: '\x1b[0m'
};

// Logging functions
const log = {
    info: (msg) => console.log(`${colors.green}[INFO]${colors.reset} ${msg}`),
    warn: (msg) => console.log(`${colors.yellow}[WARN]${colors.reset} ${msg}`),
    error: (msg) => console.log(`${colors.red}[ERROR]${colors.reset} ${msg}`),
    success: (msg) =>
        console.log(`${colors.green}${colors.bold}${msg}${colors.reset}`)
};

// Check if command exists
function commandExists(command) {
    try {
        execSync(
            `${process.platform === 'win32' ? 'where' : 'which'} ${command}`,
            { stdio: 'ignore' }
        );
        return true;
    } catch {
        return false;
    }
}

// Execute command with promise wrapper
function execCommand(command, args = [], options = {}) {
    return new Promise((resolve, reject) => {
        const child = spawn(command, args, {
            stdio: 'inherit',
            shell: true,
            ...options
        });

        child.on('close', (code) => {
            if (code === 0) {
                resolve(code);
            } else {
                reject(new Error(`Command failed with exit code ${code}`));
            }
        });

        child.on('error', reject);
    });
}

// Check prerequisites
async function checkPrerequisites() {
    log.info('Checking prerequisites...');

    if (!commandExists('pnpm')) {
        log.error(
            'pnpm is required but not installed. Please install pnpm first.'
        );
        process.exit(1);
    }

    log.info('Prerequisites check passed.');
}

// Clean environment
function cleanEnvironment() {
    try {
        log.info('Cleaning previous build artifacts...');

        const pathsToClean = ['dist', 'node_modules'];

        pathsToClean.forEach((path) => {
            if (existsSync(path)) {
                rmSync(path, { recursive: true, force: true });
                log.info(`Removed ${path}`);
            }
        });
    } catch (error) {
        log.error(`Environment cleanup failed: ${error.message}`);
        throw error; // Re-throw to ensure non-zero exit
    }
}

// Build packages
async function buildPackages() {
    try {
        log.info('Installing dependencies...');
        await execCommand('pnpm', ['i']);

        log.info('Building packages...');
        await execCommand('pnpm', ['build:packages']);
    } catch (error) {
        log.error(`Package build failed: ${error.message}`);
        throw error; // Re-throw to ensure non-zero exit
    }
}

// Run tests with coverage report
async function runTestsWithCoverage() {
    log.info('Running unit tests with coverage report...');

    let hasTestFailures = false;

    try {
        // Dynamically find all packages that have test files
        const packagesDir = 'packages';

        if (!existsSync(packagesDir)) {
            throw new Error(`Packages directory not found: ${packagesDir}`);
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
                        `Failed to scan package ${packagePath}: ${error.message}`
                    );
                    hasTestFailures = true;
                }
            }
        }

        if (packagesWithTests.length === 0) {
            log.warn('No packages with tests found');
            return;
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
                        'dist',
                        'coverage',
                        packageName
                    );

                    if (!existsSync('dist/coverage')) {
                        mkdirSync('dist/coverage', { recursive: true });
                    }

                    cpSync(coverageSource, coverageTarget, { recursive: true });
                    log.info(
                        `Coverage report copied to dist/coverage/${packageName}/`
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

        // Display coverage summary
        console.log('');
        console.log(
            `${colors.blue}${colors.bold}📊 COVERAGE SUMMARY${colors.reset}`
        );
        console.log(
            `${colors.cyan}Coverage reports available in: ./dist/coverage/${colors.reset}`
        );
        console.log(
            `${colors.cyan}View detailed HTML reports by opening: ./dist/coverage/[package]/index.html${colors.reset}`
        );
        console.log('');
    } catch (error) {
        log.error(`Tests execution failed: ${error.message}`);
        throw error; // Re-throw to ensure non-zero exit
    }
}

// Build examples
async function buildExamples() {
    try {
        log.info('Refreshing dependencies to link latest package builds...');

        if (existsSync('node_modules')) {
            rmSync('node_modules', { recursive: true, force: true });
        }

        await execCommand('pnpm', ['i']);

        log.info('Building examples...');
        await execCommand('pnpm', ['build:examples']);
    } catch (error) {
        log.error(`Examples build failed: ${error.message}`);
        throw error; // Re-throw to ensure non-zero exit
    }
}

// Find directories matching pattern using native Node.js APIs
function findSSRDirectories(baseDir) {
    try {
        const ssrDirs = [];

        if (!existsSync(baseDir)) {
            log.warn(`Base directory not found: ${baseDir}`);
            return ssrDirs;
        }

        const entries = readdirSync(baseDir, { withFileTypes: true });

        for (const entry of entries) {
            if (entry.isDirectory() && entry.name.startsWith('ssr-')) {
                const clientPath = join(baseDir, entry.name, 'dist', 'client');
                if (existsSync(clientPath)) {
                    ssrDirs.push({
                        name: entry.name,
                        path: clientPath
                    });
                }
            }
        }

        return ssrDirs;
    } catch (error) {
        log.error(
            `Failed to find SSR directories in ${baseDir}: ${error.message}`
        );
        throw error; // Re-throw to ensure non-zero exit
    }
}

// Copy artifacts
async function copyArtifacts() {
    try {
        log.info('Copying build artifacts...');

        // Create dist directory
        if (!existsSync('dist')) {
            mkdirSync('dist', { recursive: true });
        }

        // Copy SSR examples using native Node.js APIs
        const ssrDirs = findSSRDirectories('examples');

        for (const { name, path } of ssrDirs) {
            const targetDir = join('dist', name);
            mkdirSync(targetDir, { recursive: true });
            cpSync(path, targetDir, { recursive: true });
            log.info(`Copied ${path} to ${targetDir}`);
        }

        // Copy docs
        const docsPath = 'examples/docs/dist/client';
        if (existsSync(docsPath)) {
            cpSync(docsPath, 'dist', { recursive: true });
            log.info(`Copied ${docsPath} to dist/`);
        }

        // Copy sitemap.xml if exists
        const sitemapPath = 'examples/docs/doc_build/sitemap.xml';
        if (existsSync(sitemapPath)) {
            cpSync(sitemapPath, 'dist/sitemap.xml');
            log.info('Copied sitemap.xml to dist/');
        } else {
            log.warn(`sitemap.xml not found at ${sitemapPath}`);
        }
    } catch (error) {
        log.error(`Artifact copying failed: ${error.message}`);
        throw error; // Re-throw to ensure non-zero exit
    }
}

// Main execution
async function main() {
    try {
        log.info('Starting cross-platform build process...');
        log.info(`Running on: ${process.platform} ${process.arch}`);

        await checkPrerequisites();
        cleanEnvironment();
        await buildPackages();
        await runTestsWithCoverage();
        await buildExamples();
        await copyArtifacts();

        // EPIC SUCCESS MESSAGE WITH PERFECT ALIGNMENT!
        console.log('');
        console.log('');
        console.log(`${colors.green}${colors.bold}`);
        console.log(
            '████████████████████████████████████████████████████████████████████████████'
        );
        console.log(
            '█                                                                          █'
        );
        console.log(
            '█   ███████╗ ███████╗███╗   ███╗██╗  ██╗                                   █'
        );
        console.log(
            '█   ██╔════╝ ██╔════╝████╗ ████║╚██╗██╔╝                                   █'
        );
        console.log(
            '█   █████╗   ███████╗██╔████╔██║ ╚███╔╝                                    █'
        );
        console.log(
            '█   ██╔══╝   ╚════██║██║╚██╔╝██║ ██╔██╗                                    █'
        );
        console.log(
            '█   ███████╗ ███████║██║ ╚═╝ ██║██╔╝ ██╗                                   █'
        );
        console.log(
            '█   ╚══════╝ ╚══════╝╚═╝     ╚═╝╚═╝  ╚═╝                                   █'
        );
        console.log(
            '█                                                                          █'
        );
        console.log(
            `█${colors.magenta}    ██████╗ ██╗   ██╗██╗██╗     ██████╗                                   ${colors.green}█`
        );
        console.log(
            `█${colors.magenta}    ██╔══██╗██║   ██║██║██║     ██╔══██╗                                  ${colors.green}█`
        );
        console.log(
            `█${colors.magenta}    ██████╔╝██║   ██║██║██║     ██║  ██║                                  ${colors.green}█`
        );
        console.log(
            `█${colors.magenta}    ██╔══██╗██║   ██║██║██║     ██║  ██║                                  ${colors.green}█`
        );
        console.log(
            `█${colors.magenta}    ██████╔╝╚██████╔╝██║███████╗██████╔╝                                  ${colors.green}█`
        );
        console.log(
            `█${colors.magenta}    ╚═════╝  ╚═════╝ ╚═╝╚══════╝╚═════╝                                   ${colors.green}█`
        );
        console.log(
            '█                                                                          █'
        );
        console.log(
            `█${colors.cyan}    ███████╗██╗   ██╗ ██████╗ ██████╗███████╗███████╗███████╗             ${colors.green}█`
        );
        console.log(
            `█${colors.cyan}    ██╔════╝██║   ██║██╔════╝██╔════╝██╔════╝██╔════╝██╔════╝             ${colors.green}█`
        );
        console.log(
            `█${colors.cyan}    ███████╗██║   ██║██║     ██║     █████╗  ███████╗███████╗             ${colors.green}█`
        );
        console.log(
            `█${colors.cyan}    ╚════██║██║   ██║██║     ██║     ██╔══╝  ╚════██║╚════██║             ${colors.green}█`
        );
        console.log(
            `█${colors.cyan}    ███████║╚██████╔╝╚██████╗╚██████╗███████╗███████║███████║             ${colors.green}█`
        );
        console.log(
            `█${colors.cyan}    ╚══════╝ ╚═════╝  ╚═════╝ ╚═════╝╚══════╝╚══════╝╚══════╝             ${colors.green}█`
        );
        console.log(
            '█                                                                          █'
        );
        console.log(
            `█${colors.yellow}                      💥 MISSION ACCOMPLISHED! 💥                         ${colors.green}█`
        );
        console.log(
            '█                                                                          █'
        );
        console.log(
            '█   🏆 ALL SYSTEMS OPERATIONAL                                             █'
        );
        console.log(
            '█   ⚡ PACKAGES: BUILT & OPTIMIZED                                         █'
        );
        console.log(
            '█   🧪 TESTS: PASSED WITH COVERAGE REPORTS                                 █'
        );
        console.log(
            '█   🌟 EXAMPLES: DEPLOYMENT READY                                          █'
        );
        console.log(
            '█   🎯 ARTIFACTS: COPIED TO ./dist                                         █'
        );
        console.log(
            '█   📊 COVERAGE: REPORTS IN ./dist/coverage                               █'
        );
        console.log(
            '█   🔥 STATUS: READY TO DOMINATE THE ESM UNIVERSE!                         █'
        );
        console.log(
            '█                                                                          █'
        );
        console.log(
            '████████████████████████████████████████████████████████████████████████████'
        );
        console.log(`${colors.reset}`);
        console.log('');
        console.log('');
    } catch (error) {
        log.error(`Build failed: ${error.message}`);
        process.exit(1);
    }
}

// Execute if this file is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}

export { main };
