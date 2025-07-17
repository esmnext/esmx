import { config } from './config.mjs';
import { copyArtifacts } from './tasks/artifacts.mjs';
import { buildExamples } from './tasks/build-examples.mjs';
import { buildPackages } from './tasks/build-packages.mjs';
import { cleanEnvironment } from './tasks/clean.mjs';
import { generateCoverage } from './tasks/coverage.mjs';
import { checkPrerequisites } from './tasks/prerequisites.mjs';
import { displaySuccessMessage } from './tasks/success-message.mjs';
import { runTests } from './tasks/tests.mjs';
import { log, toDisplayPath } from './utils.mjs';

export async function cli() {
    try {
        log.info('Starting cross-platform build process...');
        log.info(`Running on: ${process.platform} ${process.arch}`);
        log.info(`Root directory: ${toDisplayPath(config.rootDir)}`);
        log.info(`Output directory: ${toDisplayPath(config.outDir)}`);

        await checkPrerequisites();
        cleanEnvironment();
        await buildPackages();

        const { packagesWithTests } = await runTests();
        await generateCoverage(packagesWithTests);

        await buildExamples();
        await copyArtifacts();

        displaySuccessMessage();
    } catch (error) {
        log.error(`Build failed: ${error.message}`);
        process.exit(1);
    }
}
