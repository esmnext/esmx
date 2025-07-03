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
            `${colors.cyan}View main coverage report: https://www.esmnext.com/coverage/${colors.reset}`
        );
        console.log(
            `${colors.cyan}Local coverage reports: ./dist/coverage/index.html${colors.reset}`
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
    <title>Esmx - Test Coverage Report | ESM Next Generation Framework</title>
    <meta name="description" content="Comprehensive test coverage report for Esmx framework packages. Real-time coverage statistics for statements, branches, functions, and lines across all Esmx modules including core, router, router-vue, fetch, and class-state.">
    <meta name="keywords" content="Esmx, ESM, test coverage, code coverage, JavaScript, TypeScript, framework, module federation, micro frontend, coverage report, vitest, testing, quality assurance, CI/CD">
    <meta name="author" content="Esmx Framework Team">
    <meta name="robots" content="index, follow">
    <meta property="og:title" content="Esmx Test Coverage Report - ESM Next Generation Framework">
    <meta property="og:description" content="Live test coverage statistics for Esmx framework - the next generation ESM-based micro frontend framework with zero runtime overhead.">
    <meta property="og:type" content="website">
    <meta property="og:url" content="https://www.esmnext.com/coverage/">
    <meta property="og:image" content="https://www.esmnext.com/logo.svg">
    <meta property="og:site_name" content="Esmx Framework">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="Esmx Test Coverage Report">
    <meta name="twitter:description" content="Real-time test coverage report for Esmx - ESM Next Generation Framework">
    <meta name="twitter:image" content="https://www.esmnext.com/logo.svg">
    <link rel="canonical" href="https://www.esmnext.com/coverage/">
    <link rel="icon" type="image/svg+xml" href="https://www.esmnext.com/logo.svg">
    <style>
        :root {
            --esmx-primary: #FFA726;
            --esmx-primary-light: #FFE55C;
            --esmx-primary-dark: #FF7043;
            --esmx-secondary: #E65100;
            --esmx-bg-primary: #FFF8F0;
            --esmx-bg-secondary: #FFF3E8;
            --esmx-bg-tertiary: #FFEDE0;
            --esmx-text-primary: #3E2723;
            --esmx-text-secondary: #5D4037;
            --esmx-border: #FFCC80;
            --esmx-shadow: 0 4px 20px rgba(255, 167, 38, 0.15);
            --esmx-shadow-hover: 0 8px 32px rgba(255, 167, 38, 0.25);
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', sans-serif;
            line-height: 1.6;
            color: var(--esmx-text-primary);
            background: linear-gradient(135deg, var(--esmx-bg-primary) 0%, var(--esmx-bg-secondary) 50%, var(--esmx-bg-tertiary) 100%);
            min-height: 100vh;
            padding: 20px;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: rgba(255, 255, 255, 0.95);
            border-radius: 16px;
            box-shadow: var(--esmx-shadow);
            overflow: hidden;
            border: 1px solid var(--esmx-border);
            backdrop-filter: blur(10px);
        }
        
        .header {
            background: linear-gradient(135deg, #FFFACD 0%, #FFE55C 20%, #FFA726 50%, #FF7043 80%, #E65100 100%);
            color: #2C1810;
            padding: 40px;
            position: relative;
            overflow: hidden;
            display: flex;
            align-items: center;
            min-height: 120px;
        }
        
        .logo-container {
            position: absolute;
            top: 20px;
            left: 20px;
            width: 60px;
            height: 60px;
            z-index: 10;
        }
        
        .logo {
            width: 100%;
            height: 100%;
            background: url('https://www.esmnext.com/logo.svg') no-repeat center;
            background-size: contain;
        }
        
        .header-content {
            flex: 1;
            text-align: center;
            position: relative;
            z-index: 5;
        }
        

        
        .header h1 {
            font-size: 2.5rem;
            margin-bottom: 10px;
            font-weight: 800;
            text-shadow: 0 2px 4px rgba(139, 69, 19, 0.3), 0 1px 2px rgba(255, 140, 0, 0.2);
            letter-spacing: -0.02em;
            position: relative;
            z-index: 2;
        }
        
        .header p {
            font-size: 1.1rem;
            opacity: 0.95;
            position: relative;
            z-index: 2;
            font-weight: 500;
        }
        
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 24px;
            padding: 40px;
            background: linear-gradient(135deg, var(--esmx-bg-secondary) 0%, var(--esmx-bg-tertiary) 100%);
        }
        
        .stat-card {
            background: rgba(255, 255, 255, 0.9);
            padding: 28px 24px;
            border-radius: 12px;
            text-align: center;
            box-shadow: var(--esmx-shadow);
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            border: 1px solid var(--esmx-border);
            backdrop-filter: blur(10px);
            position: relative;
            overflow: hidden;
        }
        
        .stat-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 4px;
            background: linear-gradient(90deg, var(--esmx-primary) 0%, var(--esmx-secondary) 100%);
            transform: scaleX(0);
            transition: transform 0.3s ease;
        }
        
        .stat-card:hover {
            transform: translateY(-4px);
            box-shadow: var(--esmx-shadow-hover);
        }
        
        .stat-card:hover::before {
            transform: scaleX(1);
        }
        
        .stat-number {
            font-size: 2.2rem;
            font-weight: 800;
            margin-bottom: 8px;
            background: linear-gradient(135deg, var(--esmx-primary) 0%, var(--esmx-secondary) 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        
        .stat-label {
            color: var(--esmx-text-secondary);
            font-size: 0.9rem;
            text-transform: uppercase;
            letter-spacing: 1px;
            font-weight: 600;
        }
        
        .packages-section {
            padding: 40px;
            background: rgba(255, 255, 255, 0.8);
        }
        
        .packages-title {
            font-size: 1.8rem;
            margin-bottom: 30px;
            color: var(--esmx-text-primary);
            text-align: center;
            font-weight: 700;
            position: relative;
        }
        
        .packages-title::after {
            content: '';
            position: absolute;
            bottom: -8px;
            left: 50%;
            transform: translateX(-50%);
            width: 60px;
            height: 3px;
            background: linear-gradient(90deg, var(--esmx-primary) 0%, var(--esmx-secondary) 100%);
            border-radius: 2px;
        }
        
        .table-container {
            overflow-x: auto;
            border-radius: 12px;
            box-shadow: var(--esmx-shadow);
            border: 1px solid var(--esmx-border);
            background: rgba(255, 255, 255, 0.95);
            -webkit-overflow-scrolling: touch;
        }
        
        .packages-table {
            width: calc(100% - 2px);
            border-collapse: collapse;
            background: transparent;
            box-sizing: border-box;
        }
        
        .packages-table th {
            background: linear-gradient(135deg, var(--esmx-bg-secondary) 0%, var(--esmx-bg-tertiary) 100%);
            color: var(--esmx-text-primary);
            font-weight: 700;
            padding: 18px 16px;
            text-align: left;
            border-bottom: 2px solid var(--esmx-border);
            font-size: 0.9rem;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .packages-table td {
            padding: 18px 16px;
            border-bottom: 1px solid var(--esmx-border);
            background: rgba(255, 255, 255, 0.9);
        }
        
        .packages-table tr:hover td {
            background: var(--esmx-bg-secondary);
            transform: scale(1.005);
            transition: all 0.2s ease;
        }
        
        .package-name {
            font-weight: 700;
            color: var(--esmx-primary-dark);
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
            height: 10px;
            background: rgba(255, 193, 7, 0.1);
            border-radius: 6px;
            overflow: hidden;
            border: 1px solid var(--esmx-border);
        }
        
        .progress-fill {
            height: 100%;
            border-radius: 6px;
            transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            position: relative;
        }
        
        .progress-fill::after {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, rgba(255, 255, 255, 0.3) 0%, transparent 50%, rgba(255, 255, 255, 0.3) 100%);
            animation: shimmer 2s infinite;
        }
        
        @keyframes shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
        }
        
        .coverage-high { 
            background: linear-gradient(135deg, #10B981 0%, #059669 100%);
        }
        .coverage-medium { 
            background: linear-gradient(135deg, var(--esmx-primary) 0%, var(--esmx-primary-dark) 100%);
        }
        .coverage-low { 
            background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%);
        }
        
        .coverage-text {
            font-weight: 700;
            min-width: 60px;
            text-align: right;
            color: var(--esmx-text-primary);
            font-size: 0.9rem;
        }
        
        .footer {
            background: linear-gradient(135deg, var(--esmx-bg-secondary) 0%, var(--esmx-bg-tertiary) 100%);
            padding: 24px;
            text-align: center;
            color: var(--esmx-text-secondary);
            border-top: 1px solid var(--esmx-border);
        }
        
        .badge {
            display: inline-block;
            padding: 6px 12px;
            border-radius: 8px;
            font-size: 0.75rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            border: 1px solid;
        }
        
        .badge-success { 
            background: linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%);
            color: #065F46;
            border-color: #10B981;
        }
        .badge-warning { 
            background: linear-gradient(135deg, var(--esmx-bg-secondary) 0%, var(--esmx-bg-tertiary) 100%);
            color: var(--esmx-secondary);
            border-color: var(--esmx-primary);
        }
        .badge-danger { 
            background: linear-gradient(135deg, #FEE2E2 0%, #FECACA 100%);
            color: #991B1B;
            border-color: #EF4444;
        }
        
        @media (max-width: 768px) {
            .packages-section {
                padding: 20px 16px;
            }
            
            .packages-table {
                font-size: 0.85rem;
                min-width: 800px;
            }
            
            .packages-table th,
            .packages-table td {
                padding: 12px 8px;
                white-space: nowrap;
            }
            
            .header {
                padding: 30px 20px;
            }
            
            .header h1 {
                font-size: 2rem;
            }
            
            .header p {
                font-size: 1rem;
            }
            
            .stats-grid {
                padding: 20px;
                gap: 16px;
            }
            
            .package-name {
                min-width: 120px;
            }
            
            .coverage-bar {
                min-width: 140px;
            }
            
            .progress-bar {
                min-width: 80px;
            }
            
            .coverage-text {
                min-width: 50px;
                font-size: 0.8rem;
            }
        }
        
        @media (max-width: 480px) {
            .packages-section {
                padding: 16px 8px;
            }
            
            .header {
                padding: 20px 16px;
            }
            
            .header h1 {
                font-size: 1.8rem;
            }
            
            .stats-grid {
                padding: 16px;
                grid-template-columns: repeat(2, 1fr);
            }
            
            .packages-table {
                font-size: 0.8rem;
                min-width: 1000px;
            }
            
            .packages-table th,
            .packages-table td {
                padding: 10px 6px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <header class="header">
            <div class="logo-container">
                <div class="logo"></div>
            </div>
            <div class="header-content">
                <h1>🚀 Esmx Test Coverage Report</h1>
                <p>Complete overview of test coverage across all packages</p>
            <div style="margin-top: 20px; padding: 16px 24px; background: rgba(255,255,255,0.9); border-radius: 12px; font-size: 0.95rem; border: 1px solid rgba(139, 69, 19, 0.2); backdrop-filter: blur(10px); position: relative; z-index: 3;">
                📍 <strong>Live Coverage Reports:</strong> <a href="https://www.esmnext.com/coverage/" style="color: #8B4513; text-decoration: none; border-bottom: 2px solid #FFA726; font-weight: 600;">https://www.esmnext.com/coverage/</a>
            </div>
            <div style="margin-top: 12px; padding: 12px 24px; background: rgba(255,255,255,0.7); border-radius: 10px; font-size: 0.9rem; border: 1px solid rgba(139, 69, 19, 0.15); backdrop-filter: blur(5px); position: relative; z-index: 3;">
                🔧 <strong>Generated by:</strong> <a href="https://github.com/esmnext/esmx/actions" style="color: #8B4513; text-decoration: none; border-bottom: 2px solid #FF7043; font-weight: 600;">GitHub Actions CI/CD</a>
            </div>
            </div>
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
            <div class="table-container">
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
            </div>
        </section>
        
        <footer class="footer">
            <p>Generated on ${currentDate} by <a href="https://github.com/esmnext/esmx/actions" target="_blank" style="color: #007bff; text-decoration: none;">GitHub Actions</a></p>
            <p style="margin-top: 8px; font-size: 0.9rem;"><strong>Esmx Framework</strong> - ESM Next Generation | <a href="https://github.com/esmnext/esmx" target="_blank" style="color: #007bff; text-decoration: none;">View Source</a></p>
        </footer>
    </div>
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
            if (
                entry.isDirectory() &&
                ['ssr-', 'router-demo'].some((s) => entry.name.startsWith(s))
            ) {
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
            '█   📊 COVERAGE: REPORTS AT https://www.esmnext.com/coverage/              █'
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
