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

/**
 * 获取指定模式下的包路径
 * @param {'examples' | 'packages' | 'all'} mode - 要获取的包路径模式
 * @returns {Promise<string[]>} 返回项目路径数组
 */
export async function getPackagePaths(mode = 'examples') {
    const patterns = {
        examples: './examples/*',
        packages: './packages/*'
    };

    const paths = [];

    if (mode === 'all') {
        // 对于 all 模式，包含 examples、packages 和根目录
        const [examplesPaths, packagesPaths] = await Promise.all([
            getPackagePaths('examples'),
            getPackagePaths('packages')
        ]);

        paths.push(...examplesPaths, ...packagesPaths, config.rootDir);
    } else if (mode === 'examples' || mode === 'packages') {
        // 对于特定模式，使用对应的 pattern
        const pattern = patterns[mode];
        try {
            const { stdout } = await execCommand(
                `pnpm -F "${pattern}" exec -- pwd`,
                { stdio: 'pipe', shell: true }
            );

            const projectPaths = stdout.trim().split('\n').filter(Boolean);
            paths.push(...projectPaths);
        } catch (error) {
            // 如果没有匹配的项目，返回空数组而不是抛出错误
            if (error.message.includes('No projects matched')) {
                return [];
            }
            throw error;
        }
    }

    // 去重并排序
    const uniquePaths = [...new Set(paths)].sort();
    return uniquePaths;
}

/**
 * 清理指定目录下的 dist 和 node_modules 目录
 * @param {'examples' | 'packages' | 'all'} mode - 要清理的模式
 * @returns {Promise<void>}
 */
export async function cleanDirectories(mode = 'all') {
    const paths = await getPackagePaths(mode);

    for (const projectPath of paths) {
        const distPath = join(projectPath, 'dist');
        const nodeModulesPath = join(projectPath, 'node_modules');

        // 清理 dist 目录
        if (existsSync(distPath)) {
            await rm(distPath, { recursive: true, force: true });
            log.info(`Cleaned ${toDisplayPath(distPath)}`);
        }

        // 清理 node_modules 目录
        if (existsSync(nodeModulesPath)) {
            await rm(nodeModulesPath, { recursive: true, force: true });
            log.info(`Cleaned ${toDisplayPath(nodeModulesPath)}`);
        }
    }
}
