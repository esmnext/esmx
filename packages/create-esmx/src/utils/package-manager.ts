/**
 * Package manager detection and command generation utilities
 */

export type PackageManager = 'npm' | 'yarn' | 'pnpm' | 'bun';

export type CommandType =
    | 'install'
    | 'dev'
    | 'build'
    | 'start'
    | 'create'
    | 'build:type'
    | 'lint:type';

interface PackageManagerCommands {
    install: string;
    dev: string;
    build: string;
    start: string;
    create: string;
    'build:type': string;
    'lint:type': string;
}

/**
 * Configuration for different package managers and their commands
 */
const PACKAGE_MANAGER_CONFIG: Record<PackageManager, PackageManagerCommands> = {
    npm: {
        install: 'npm install',
        dev: 'npm run dev',
        build: 'npm run build',
        start: 'npm start',
        create: 'npm create esmx@latest',
        'build:type': 'npm run build:type',
        'lint:type': 'npm run lint:type'
    },
    yarn: {
        install: 'yarn install',
        dev: 'yarn dev',
        build: 'yarn build',
        start: 'yarn start',
        create: 'yarn create esmx',
        'build:type': 'yarn build:type',
        'lint:type': 'yarn lint:type'
    },
    pnpm: {
        install: 'pnpm install',
        dev: 'pnpm dev',
        build: 'pnpm build',
        start: 'pnpm start',
        create: 'pnpm create esmx',
        'build:type': 'pnpm build:type',
        'lint:type': 'pnpm lint:type'
    },
    bun: {
        install: 'bun install',
        dev: 'bun dev',
        build: 'bun run build',
        start: 'bun start',
        create: 'bun create esmx',
        'build:type': 'bun run build:type',
        'lint:type': 'bun run lint:type'
    }
};

/**
 * Detect the package manager being used based on user agent
 */
function detectPackageManager(userAgent?: string): PackageManager {
    const agent = userAgent || process.env.npm_config_user_agent || '';

    if (agent.includes('pnpm')) return 'pnpm';
    if (agent.includes('yarn')) return 'yarn';
    if (agent.includes('bun')) return 'bun';

    // Default to npm
    return 'npm';
}

/**
 * Get a specific command for the detected package manager
 * Business logic only needs to specify what command to execute
 */
export function getCommand(
    commandType: CommandType,
    userAgent?: string
): string {
    const packageManager = detectPackageManager(userAgent);
    return PACKAGE_MANAGER_CONFIG[packageManager][commandType];
}
