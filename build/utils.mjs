import { exec, execSync } from 'node:child_process';
import { relative } from 'node:path';
import { promisify } from 'node:util';
import { config } from './config.mjs';

export const colors = {
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

export const log = {
    info: (msg) => console.log(`${colors.green}[INFO]${colors.reset} ${msg}`),
    warn: (msg) => console.log(`${colors.yellow}[WARN]${colors.reset} ${msg}`),
    error: (msg) => console.log(`${colors.red}[ERROR]${colors.reset} ${msg}`),
    success: (msg) =>
        console.log(`${colors.green}${colors.bold}${msg}${colors.reset}`)
};

const execAsync = promisify(exec);

export async function execCommand(command, options = {}) {
    const defaultOptions = {
        shell: true,
        cwd: config.rootDir
    };
    const execOptions = { ...defaultOptions, ...options };

    try {
        const { stdout, stderr } = await execAsync(command, execOptions);
        return { code: 0, stdout, stderr };
    } catch (error) {
        throw new Error(
            `Command failed with exit code ${error.code}: ${error.message}`
        );
    }
}

export function commandExists(command) {
    try {
        const checkCmd = process.platform === 'win32' ? 'where' : 'which';
        execSync(`${checkCmd} ${command}`, { stdio: 'ignore' });
        return true;
    } catch {
        return false;
    }
}

export function toDisplayPath(absolutePath, rootDir = config.rootDir) {
    const relativePath = relative(rootDir, absolutePath);
    return relativePath || '.';
}
