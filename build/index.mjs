import { config } from './config.mjs';
import { copyArtifacts } from './tasks/artifacts.mjs';
import { buildExamples } from './tasks/build-examples.mjs';
import { generateCoverage } from './tasks/coverage.mjs';
import { initEnvironment } from './tasks/environment.mjs';
import { checkPrerequisites } from './tasks/prerequisites.mjs';
import { generateSitemap } from './tasks/sitemap.mjs';
import { displaySuccessMessage } from './tasks/success-message.mjs';
import { runTests } from './tasks/tests.mjs';
import { log, toDisplayPath } from './utils.mjs';

export async function cli() {
    try {
        log.info(`Running on: ${process.platform} ${process.arch}`);
        log.info(`Root directory: ${toDisplayPath(config.rootDir)}`);
        log.info(`Output directory: ${toDisplayPath(config.outDir)}`);

        await checkPrerequisites();
        await initEnvironment();

        await runTests();
        await generateCoverage();

        await buildExamples();
        await copyArtifacts();
        await generateSitemap();

        displaySuccessMessage();
    } catch (error) {
        log.error(`Build failed: ${error.message}`);
        process.exit(1);
    }
}
