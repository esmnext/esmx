// Template generation, do not manually modify
import { exec } from 'node:child_process';
import { promisify } from 'node:util';

const execAsync = promisify(exec);

try {
    await execAsync('husky install');
} catch (error) {
    console.log('[33m[WARN][0m Husky not found');
}
