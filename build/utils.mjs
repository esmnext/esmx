import { exec, execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { rm } from 'node:fs/promises';
import { join, relative } from 'node:path';
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
        log.error(`Command failed: ${command}`);
        log.error(`Working directory: ${execOptions.cwd}`);
        log.error(`Exit code: ${error.code}`);
        if (error.stdout) log.error(`Stdout: ${error.stdout}`);
        if (error.stderr) log.error(`Stderr: ${error.stderr}`);
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

export async function getPackagePaths(mode = 'examples') {
    const patterns = {
        examples: './examples/*',
        packages: './packages/*'
    };

    const paths = [];

    if (mode === 'all') {
        const [examplesPaths, packagesPaths] = await Promise.all([
            getPackagePaths('examples'),
            getPackagePaths('packages')
        ]);

        paths.push(...examplesPaths, ...packagesPaths, config.rootDir);
    } else if (mode === 'examples' || mode === 'packages') {
        const pattern = patterns[mode];
        try {
            const { stdout } = await execCommand(
                `pnpm -F "${pattern}" exec -- pwd`,
                { stdio: 'pipe', shell: true }
            );

            const projectPaths = stdout.trim().split('\n').filter(Boolean);
            paths.push(...projectPaths);
        } catch (error) {
            if (error.message.includes('No projects matched')) {
                return [];
            }
            throw error;
        }
    }

    const uniquePaths = [...new Set(paths)].sort();
    return uniquePaths;
}

/**
 * Clean node_modules directories in specified project paths
 * @param {'examples' | 'packages' | 'all'} mode - The mode for which paths to clean
 * @returns {Promise<void>}
 */
export async function cleanNodeModules(mode = 'all') {
    const paths = await getPackagePaths(mode);

    for (const projectPath of paths) {
        const nodeModulesPath = join(projectPath, 'node_modules');

        if (existsSync(nodeModulesPath)) {
            await rm(nodeModulesPath, { recursive: true, force: true });
            log.info(`Cleaned ${toDisplayPath(nodeModulesPath)}`);
        }
    }
}

/**
 * Clean dist directories in specified project paths
 * @param {'examples' | 'packages' | 'all'} mode - The mode for which paths to clean
 * @returns {Promise<void>}
 */
export async function cleanDist(mode = 'all') {
    const paths = await getPackagePaths(mode);

    for (const projectPath of paths) {
        const distPath = join(projectPath, 'dist');

        if (existsSync(distPath)) {
            await rm(distPath, { recursive: true, force: true });
            log.info(`Cleaned ${toDisplayPath(distPath)}`);
        }
    }
}

/**
 * Clean both dist and node_modules directories in specified project paths
 * @param {'examples' | 'packages' | 'all'} mode - The mode for which paths to clean
 * @returns {Promise<void>}
 */
export async function cleanDirectories(mode = 'all') {
    await Promise.all([cleanDist(mode), cleanNodeModules(mode)]);
}
