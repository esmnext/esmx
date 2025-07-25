import {
    cpSync,
    existsSync,
    mkdirSync,
    readFileSync,
    writeFileSync
} from 'node:fs';
import { basename, join } from 'node:path';
import { config } from '../config.mjs';
import { colors, getPackagePaths, log, toDisplayPath } from '../utils.mjs';
import { generateCoverageHTML } from './coverage-html.mjs';

function ensureCoverageDir() {
    if (!existsSync(config.coverageDir)) {
        mkdirSync(config.coverageDir, { recursive: true });
    }
}

async function findPackagesWithCoverage() {
    const packagePaths = await getPackagePaths('packages');

    return packagePaths.filter((packagePath) =>
        existsSync(join(packagePath, 'coverage', 'coverage-final.json'))
    );
}

function copyPackageCoverageReports(packagesWithCoverage) {
    for (const packagePath of packagesWithCoverage) {
        const packageName = basename(packagePath);
        const packageCoverageDir = join(packagePath, 'coverage');
        const targetDir = join(config.coverageDir, packageName);

        if (!existsSync(targetDir)) {
            mkdirSync(targetDir, { recursive: true });
        }

        cpSync(packageCoverageDir, targetDir, { recursive: true });
        log.info(
            `Copied coverage report from ${toDisplayPath(packageCoverageDir)} to ${toDisplayPath(targetDir)}`
        );
    }
}

function calculatePackageCoverage(packageName) {
    const coverageFinalPath = join(
        config.coverageDir,
        packageName,
        'coverage-final.json'
    );
    const coverageData = JSON.parse(readFileSync(coverageFinalPath, 'utf8'));

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
            totalLines += Object.keys(file.s).length;
            coveredLines += Object.values(file.s).filter(
                (count) => count > 0
            ).length;
        }
        if (file.b) {
            Object.values(file.b).forEach((branches) => {
                totalBranches += branches.length;
                coveredBranches += branches.filter((count) => count > 0).length;
            });
        }
        if (file.f) {
            totalFunctions += Object.keys(file.f).length;
            coveredFunctions += Object.values(file.f).filter(
                (count) => count > 0
            ).length;
        }
    }

    const formatPercent = (covered, total) =>
        total > 0 ? ((covered / total) * 100).toFixed(2) : '0.00';

    return {
        name: packageName,
        statements: formatPercent(coveredStatements, totalStatements),
        branches: formatPercent(coveredBranches, totalBranches),
        functions: formatPercent(coveredFunctions, totalFunctions),
        lines: formatPercent(coveredLines, totalLines)
    };
}

function generateIndexHtml(packageCoverageData) {
    const coverageIndexPath = join(config.coverageDir, 'index.html');
    const htmlContent = generateCoverageHTML(packageCoverageData);
    writeFileSync(coverageIndexPath, htmlContent, 'utf8');
    return coverageIndexPath;
}

function displayCoverageSummary(coverageIndexPath) {
    log.success(
        `Coverage index generated: ${toDisplayPath(coverageIndexPath)}`
    );

    console.log('');
    console.log(
        `${colors.blue}${colors.bold}📊 COVERAGE SUMMARY${colors.reset}`
    );
    console.log(
        `${colors.cyan}Coverage reports available in: ${toDisplayPath(config.coverageDir)}${colors.reset}`
    );
    console.log(
        `${colors.cyan}View main coverage report: ${config.coverageUrl}${colors.reset}`
    );
    console.log(
        `${colors.cyan}Local coverage reports: ${toDisplayPath(join(config.coverageDir, 'index.html'))}${colors.reset}`
    );
    console.log(
        `${colors.cyan}View detailed HTML reports by opening: ${toDisplayPath(join(config.coverageDir, '[package]/index.html'))}${colors.reset}`
    );
    console.log('');
}

export async function generateCoverage() {
    log.info('Generating coverage overview index.html...');

    ensureCoverageDir();

    const packagesWithCoverage = await findPackagesWithCoverage();

    if (packagesWithCoverage.length === 0) {
        log.warn(
            'No coverage reports found, skipping coverage report generation'
        );
        return;
    }

    copyPackageCoverageReports(packagesWithCoverage);

    const packageCoverageData = packagesWithCoverage.map((packagePath) => {
        const packageName = basename(packagePath);
        return calculatePackageCoverage(packageName);
    });

    const coverageIndexPath = generateIndexHtml(packageCoverageData);

    displayCoverageSummary(coverageIndexPath);
}
