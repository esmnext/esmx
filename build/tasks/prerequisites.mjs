import { commandExists, log } from '../utils.mjs';

export async function checkPrerequisites() {
    log.info('Checking prerequisites...');

    if (!commandExists('pnpm')) {
        log.error(
            'pnpm is required but not installed. Please install pnpm first.'
        );
        process.exit(1);
    }

    log.info('Prerequisites check passed.');
}
