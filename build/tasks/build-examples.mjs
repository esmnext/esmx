import { execCommand, log } from '../utils.mjs';

export async function buildExamples() {
    log.info('Building examples...');
    await execCommand('pnpm build:examples');
}
