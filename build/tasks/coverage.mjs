import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { config } from '../config.mjs';
import { colors, log, toDisplayPath } from '../utils.mjs';
import { generateCoverageHTML } from './coverage-html.mjs';

export async function generateCoverage(packagesWithTests) {
    try {
        log.info('Generating coverage overview index.html...');

        if (!packagesWithTests || packagesWithTests.length === 0) {
            log.warn('No packages with tests to generate coverage reports');
            return;
        }

        const coverageIndexPath = join(config.coverageDir, 'index.html');

        // Read coverage data for each package
        const packageCoverageData = [];

        for (const packagePath of packagesWithTests) {
            const packageName = packagePath.split('/').pop();
            const coverageFinalPath = join(
                config.coverageDir,
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

        log.success(
            `✅ Coverage index generated: ${toDisplayPath(coverageIndexPath)}`
        );

        // Display coverage summary
        console.log('');
        console.log(
            `${colors.blue}${colors.bold}📊 COVERAGE SUMMARY${colors.reset}`
        );
        console.log(
            `${colors.cyan}Coverage reports available in: ${toDisplayPath(config.coverageDir)}${colors.reset}`
        );
        console.log(
            `${colors.cyan}View main coverage report: https://www.esmnext.com/coverage/${colors.reset}`
        );
        console.log(
            `${colors.cyan}Local coverage reports: ${toDisplayPath(join(config.coverageDir, 'index.html'))}${colors.reset}`
        );
        console.log(
            `${colors.cyan}View detailed HTML reports by opening: ${toDisplayPath(join(config.coverageDir, '[package]/index.html'))}${colors.reset}`
        );
        console.log('');
    } catch (error) {
        log.error(`Failed to generate coverage index: ${error.message}`);
        throw error;
    }
}
