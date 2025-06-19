#!/usr/bin/env node

import { execSync, spawn } from 'node:child_process';
import {
    cpSync,
    existsSync,
    mkdirSync,
    readFileSync,
    readdirSync,
    rmSync,
    writeFileSync
} from 'node:fs';
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

        // Generate coverage index.html
        await generateCoverageIndex(packagesWithTests);

        // Display coverage summary
        console.log('');
        console.log(
            `${colors.blue}${colors.bold}📊 COVERAGE SUMMARY${colors.reset}`
        );
        console.log(
            `${colors.cyan}Coverage reports available in: ./dist/coverage/${colors.reset}`
        );
        console.log(
            `${colors.cyan}View main coverage report: ./dist/coverage/index.html${colors.reset}`
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

// Generate coverage index.html
async function generateCoverageIndex(packagesWithTests) {
    try {
        log.info('Generating coverage overview index.html...');

        const coverageIndexPath = join('dist', 'coverage', 'index.html');

        // Read coverage data for each package
        const packageCoverageData = [];

        for (const packagePath of packagesWithTests) {
            const packageName = packagePath.split('/').pop();
            const coverageFinalPath = join(
                'dist',
                'coverage',
                packageName,
                'coverage-final.json'
            );

            if (existsSync(coverageFinalPath)) {
                try {
                    const coverageData = JSON.parse(
                        readFileSync(coverageFinalPath, 'utf8')
                    );

                    // Calculate overall coverage statistics
                    let totalStatements = 0;
                    let coveredStatements = 0;
                    let totalBranches = 0;
                    let coveredBranches = 0;
                    let totalFunctions = 0;
                    let coveredFunctions = 0;
                    let totalLines = 0;
                    let coveredLines = 0;

                    for (const filePath in coverageData) {
                        const file = coverageData[filePath];
                        if (file.s) {
                            totalStatements += Object.keys(file.s).length;
                            coveredStatements += Object.values(file.s).filter(
                                (count) => count > 0
                            ).length;
                        }
                        if (file.b) {
                            Object.values(file.b).forEach((branches) => {
                                totalBranches += branches.length;
                                coveredBranches += branches.filter(
                                    (count) => count > 0
                                ).length;
                            });
                        }
                        if (file.f) {
                            totalFunctions += Object.keys(file.f).length;
                            coveredFunctions += Object.values(file.f).filter(
                                (count) => count > 0
                            ).length;
                        }
                        if (file.s) {
                            // Use statement coverage as line coverage approximation
                            totalLines += Object.keys(file.s).length;
                            coveredLines += Object.values(file.s).filter(
                                (count) => count > 0
                            ).length;
                        }
                    }

                    packageCoverageData.push({
                        name: packageName,
                        statements:
                            totalStatements > 0
                                ? (
                                      (coveredStatements / totalStatements) *
                                      100
                                  ).toFixed(2)
                                : '0.00',
                        branches:
                            totalBranches > 0
                                ? (
                                      (coveredBranches / totalBranches) *
                                      100
                                  ).toFixed(2)
                                : '0.00',
                        functions:
                            totalFunctions > 0
                                ? (
                                      (coveredFunctions / totalFunctions) *
                                      100
                                  ).toFixed(2)
                                : '0.00',
                        lines:
                            totalLines > 0
                                ? ((coveredLines / totalLines) * 100).toFixed(2)
                                : '0.00'
                    });
                } catch (error) {
                    log.warn(
                        `Failed to parse coverage data for ${packageName}: ${error.message}`
                    );
                    packageCoverageData.push({
                        name: packageName,
                        statements: 'N/A',
                        branches: 'N/A',
                        functions: 'N/A',
                        lines: 'N/A'
                    });
                }
            }
        }

        // Generate HTML content
        const htmlContent = generateCoverageHTML(packageCoverageData);

        // Write the index.html file
        writeFileSync(coverageIndexPath, htmlContent, 'utf8');

        log.success(`✅ Coverage index generated: ${coverageIndexPath}`);
    } catch (error) {
        log.error(`Failed to generate coverage index: ${error.message}`);
        throw error;
    }
}

// Generate HTML content for coverage index
function generateCoverageHTML(packageCoverageData) {
    const currentDate = new Date().toLocaleString();

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Esmx - Test Coverage Report</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #333;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        
        .header {
            background: linear-gradient(135deg, #2196F3 0%, #21CBF3 100%);
            color: white;
            padding: 40px;
            text-align: center;
        }
        
        .header h1 {
            font-size: 2.5rem;
            margin-bottom: 10px;
            font-weight: 700;
        }
        
        .header p {
            font-size: 1.1rem;
            opacity: 0.9;
        }
        
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            padding: 40px;
            background: #f8f9fa;
        }
        
        .stat-card {
            background: white;
            padding: 24px;
            border-radius: 8px;
            text-align: center;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            transition: transform 0.2s;
        }
        
        .stat-card:hover {
            transform: translateY(-2px);
        }
        
        .stat-number {
            font-size: 2rem;
            font-weight: bold;
            margin-bottom: 8px;
        }
        
        .stat-label {
            color: #666;
            font-size: 0.9rem;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        
        .packages-section {
            padding: 40px;
        }
        
        .packages-title {
            font-size: 1.8rem;
            margin-bottom: 30px;
            color: #333;
            text-align: center;
        }
        
        .packages-table {
            width: 100%;
            border-collapse: collapse;
            background: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        
        .packages-table th {
            background: #f1f3f4;
            color: #333;
            font-weight: 600;
            padding: 16px;
            text-align: left;
            border-bottom: 2px solid #dee2e6;
        }
        
        .packages-table td {
            padding: 16px;
            border-bottom: 1px solid #dee2e6;
        }
        
        .packages-table tr:hover {
            background: #f8f9fa;
        }
        
        .package-name {
            font-weight: 600;
            color: #2196F3;
        }
        
        .package-name a {
            color: inherit;
            text-decoration: none;
        }
        
        .package-name a:hover {
            text-decoration: underline;
        }
        
        .coverage-bar {
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .progress-bar {
            flex: 1;
            height: 8px;
            background: #e9ecef;
            border-radius: 4px;
            overflow: hidden;
        }
        
        .progress-fill {
            height: 100%;
            border-radius: 4px;
            transition: width 0.3s ease;
        }
        
        .coverage-high { background: #28a745; }
        .coverage-medium { background: #ffc107; }
        .coverage-low { background: #dc3545; }
        
        .coverage-text {
            font-weight: 600;
            min-width: 50px;
            text-align: right;
        }
        
        .footer {
            background: #f8f9fa;
            padding: 20px;
            text-align: center;
            color: #666;
            border-top: 1px solid #dee2e6;
        }
        
        .badge {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 0.75rem;
            font-weight: 600;
            text-transform: uppercase;
        }
        
        .badge-success { background: #d4edda; color: #155724; }
        .badge-warning { background: #fff3cd; color: #856404; }
        .badge-danger { background: #f8d7da; color: #721c24; }
        
        @media (max-width: 768px) {
            .packages-table {
                font-size: 0.9rem;
            }
            
            .packages-table th,
            .packages-table td {
                padding: 12px 8px;
            }
            
            .header h1 {
                font-size: 2rem;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <header class="header">
            <h1>🚀 Esmx Test Coverage Report</h1>
            <p>Complete overview of test coverage across all packages</p>
        </header>
        
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-number">${packageCoverageData.length}</div>
                <div class="stat-label">Packages</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${calculateAverageCoverage(packageCoverageData, 'statements')}%</div>
                <div class="stat-label">Avg Statements</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${calculateAverageCoverage(packageCoverageData, 'branches')}%</div>
                <div class="stat-label">Avg Branches</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${calculateAverageCoverage(packageCoverageData, 'functions')}%</div>
                <div class="stat-label">Avg Functions</div>
            </div>
        </div>
        
        <section class="packages-section">
            <h2 class="packages-title">📦 Package Coverage Details</h2>
            <table class="packages-table">
                <thead>
                    <tr>
                        <th>Package</th>
                        <th>Statements</th>
                        <th>Branches</th>
                        <th>Functions</th>
                        <th>Lines</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    ${packageCoverageData
                        .map(
                            (pkg) => `
                        <tr>
                            <td class="package-name">
                                <a href="./${pkg.name}/index.html">📁 ${pkg.name}</a>
                            </td>
                            <td>
                                <div class="coverage-bar">
                                    <div class="progress-bar">
                                        <div class="progress-fill ${getCoverageClass(pkg.statements)}" 
                                             style="width: ${pkg.statements === 'N/A' ? '0' : pkg.statements}%"></div>
                                    </div>
                                    <span class="coverage-text">${pkg.statements}${pkg.statements !== 'N/A' ? '%' : ''}</span>
                                </div>
                            </td>
                            <td>
                                <div class="coverage-bar">
                                    <div class="progress-bar">
                                        <div class="progress-fill ${getCoverageClass(pkg.branches)}" 
                                             style="width: ${pkg.branches === 'N/A' ? '0' : pkg.branches}%"></div>
                                    </div>
                                    <span class="coverage-text">${pkg.branches}${pkg.branches !== 'N/A' ? '%' : ''}</span>
                                </div>
                            </td>
                            <td>
                                <div class="coverage-bar">
                                    <div class="progress-bar">
                                        <div class="progress-fill ${getCoverageClass(pkg.functions)}" 
                                             style="width: ${pkg.functions === 'N/A' ? '0' : pkg.functions}%"></div>
                                    </div>
                                    <span class="coverage-text">${pkg.functions}${pkg.functions !== 'N/A' ? '%' : ''}</span>
                                </div>
                            </td>
                            <td>
                                <div class="coverage-bar">
                                    <div class="progress-bar">
                                        <div class="progress-fill ${getCoverageClass(pkg.lines)}" 
                                             style="width: ${pkg.lines === 'N/A' ? '0' : pkg.lines}%"></div>
                                    </div>
                                    <span class="coverage-text">${pkg.lines}${pkg.lines !== 'N/A' ? '%' : ''}</span>
                                </div>
                            </td>
                            <td>
                                <span class="badge ${getStatusBadgeClass(pkg.statements)}">
                                    ${getStatusText(pkg.statements)}
                                </span>
                            </td>
                        </tr>
                    `
                        )
                        .join('')}
                </tbody>
            </table>
        </section>
        
        <footer class="footer">
            <p>Generated on ${currentDate} | <strong>Esmx Framework</strong> - ESM Next Generation</p>
        </footer>
    </div>
    
    <script>
        function ${getCoverageClass.toString()}
        
        function ${getStatusBadgeClass.toString()}
        
        function ${getStatusText.toString()}
    </script>
</body>
</html>`;
}

// Helper functions for HTML generation
function calculateAverageCoverage(packages, metric) {
    const validPackages = packages.filter((pkg) => pkg[metric] !== 'N/A');
    if (validPackages.length === 0) return '0.00';

    const total = validPackages.reduce(
        (sum, pkg) => sum + Number.parseFloat(pkg[metric]),
        0
    );
    return (total / validPackages.length).toFixed(2);
}

function getCoverageClass(coverage) {
    if (coverage === 'N/A') return 'coverage-low';
    const num = Number.parseFloat(coverage);
    if (num >= 80) return 'coverage-high';
    if (num >= 60) return 'coverage-medium';
    return 'coverage-low';
}

function getStatusBadgeClass(coverage) {
    if (coverage === 'N/A') return 'badge-danger';
    const num = Number.parseFloat(coverage);
    if (num >= 80) return 'badge-success';
    if (num >= 60) return 'badge-warning';
    return 'badge-danger';
}

function getStatusText(coverage) {
    if (coverage === 'N/A') return 'Error';
    const num = Number.parseFloat(coverage);
    if (num >= 80) return 'Good';
    if (num >= 60) return 'Fair';
    return 'Poor';
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
