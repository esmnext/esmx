import { execCommand, log } from '../utils.mjs';

export async function runTests() {
    log.info('Running unit tests with coverage report...');

    await execCommand('pnpm -r test --coverage --run');

    log.success('✅ All tests passed with coverage reports generated!');
}
