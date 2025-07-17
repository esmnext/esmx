import { execSync, spawn } from 'node:child_process';
import { relative } from 'node:path';

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

export function commandExists(command) {
    try {
        execSync(
            `${process.platform === 'win32' ? 'where' : 'which'} ${command}`,
            { stdio: 'ignore' }
        );
        return true;
    } catch {
        return false;
    }
}

export function execCommand(command, args = [], options = {}) {
    return new Promise((resolve, reject) => {
        const child = spawn(command, args, {
            stdio: 'inherit',
            shell: true,
            ...options
        });

        child.on('close', (code) => {
            if (code === 0) {
                resolve(code);
            } else {
                reject(new Error(`Command failed with exit code ${code}`));
            }
        });

        child.on('error', reject);
    });
}

export function toDisplayPath(absolutePath, rootDir = process.cwd()) {
    const relativePath = relative(rootDir, absolutePath);
    return relativePath || '.'; // Return '.' if the path is the root directory itself
}
