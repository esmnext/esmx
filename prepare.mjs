import { exec } from 'node:child_process';
import { promisify } from 'node:util';

const execAsync = promisify(exec);

try {
    await execAsync('husky install');
} catch (error) {
    console.log(`\x1b[33m[WARN]\x1b[0m Husky not found`);
}
