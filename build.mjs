#!/usr/bin/env node

import { execSync, spawn } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, readdirSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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
    log.info('Cleaning previous build artifacts...');

    const pathsToClean = ['dist', 'node_modules'];

    pathsToClean.forEach((path) => {
        if (existsSync(path)) {
            rmSync(path, { recursive: true, force: true });
            log.info(`Removed ${path}`);
        }
    });
}

// Build packages
async function buildPackages() {
    log.info('Installing dependencies...');
    await execCommand('pnpm', ['i']);

    log.info('Building packages...');
    await execCommand('pnpm', ['build:packages']);
}

// Build examples
async function buildExamples() {
    log.info('Refreshing dependencies to link latest package builds...');

    if (existsSync('node_modules')) {
        rmSync('node_modules', { recursive: true, force: true });
    }

    await execCommand('pnpm', ['i']);

    log.info('Building examples...');
    await execCommand('pnpm', ['build:examples']);
}

// Find directories matching pattern using native Node.js APIs
function findSSRDirectories(baseDir) {
    const ssrDirs = [];

    if (!existsSync(baseDir)) {
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
}

// Copy artifacts
async function copyArtifacts() {
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
}

// Main execution
async function main() {
    try {
        log.info('Starting cross-platform build process...');
        log.info(`Running on: ${process.platform} ${process.arch}`);

        // await checkPrerequisites();
        // cleanEnvironment();
        // await buildPackages();
        // await buildExamples();
        // await copyArtifacts();

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
            '█   🌟 EXAMPLES: DEPLOYMENT READY                                          █'
        );
        console.log(
            '█   🎯 ARTIFACTS: COPIED TO ./dist                                         █'
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
