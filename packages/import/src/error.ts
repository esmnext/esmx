import path from 'upath';

// Color constants for terminal output
const Colors = {
    RED: '\x1b[31m',
    YELLOW: '\x1b[33m',
    CYAN: '\x1b[36m',
    GRAY: '\x1b[90m',
    RESET: '\x1b[0m',
    BOLD: '\x1b[1m'
};

// Check if terminal supports colors
const supportsColor = (): boolean => {
    return (
        !!(process.stdout?.isTTY && process.env.TERM !== 'dumb') ||
        process.env.FORCE_COLOR === '1' ||
        process.env.FORCE_COLOR === 'true'
    );
};

// Color formatter utility
const useColors = supportsColor() && process.env.NO_COLOR !== '1';

const colorize = (text: string, color: string): string => {
    return useColors ? `${color}${text}${Colors.RESET}` : text;
};

// Get relative path from current working directory
const getRelativeFromCwd = (filePath: string): string => {
    return path.relative(process.cwd(), filePath);
};

// Formatting functions
export const formatCircularDependency = (
    moduleIds: string[],
    targetModule: string
): string => {
    const fullChain = [...moduleIds, targetModule];

    return `${colorize(colorize('Module dependency chain (circular reference found):', Colors.BOLD), Colors.RED)}\n${fullChain
        .map((module, index) => {
            const isLastModule = index === fullChain.length - 1;
            const prefix =
                index === 0
                    ? '┌─ '
                    : index === fullChain.length - 1
                      ? '└─ '
                      : '├─ ';

            const displayPath = getRelativeFromCwd(module);

            // Check if this module appears elsewhere in the chain (circular dependency)
            const isCircularModule =
                fullChain.filter((m) => m === module).length > 1;

            const coloredFile = isCircularModule
                ? colorize(colorize(displayPath, Colors.BOLD), Colors.RED)
                : colorize(displayPath, Colors.CYAN);

            const suffix = isLastModule
                ? ` ${colorize('🔄 Creates circular reference', Colors.YELLOW)}`
                : '';

            return `${colorize(prefix, Colors.GRAY)}${coloredFile}${suffix}`;
        })
        .join('\n')}`;
};

export const formatModuleChain = (
    moduleIds: string[],
    targetModule: string,
    originalError?: Error
): string => {
    let result = '';

    if (moduleIds.length === 0) {
        const displayPath = getRelativeFromCwd(targetModule);

        result = `${colorize('Failed to load:', Colors.CYAN)} ${colorize(displayPath, Colors.RED)}`;
    } else {
        const chain = [...moduleIds, targetModule];
        result = `${colorize(colorize('Module loading path:', Colors.BOLD), Colors.CYAN)}\n${chain
            .map((module, index) => {
                const indent = '  '.repeat(index);
                const connector = index === 0 ? '' : '└─ ';
                const displayPath = getRelativeFromCwd(module);

                const isFailedFile = index === chain.length - 1;
                const coloredFile = isFailedFile
                    ? colorize(colorize(displayPath, Colors.BOLD), Colors.RED)
                    : colorize(displayPath, Colors.CYAN);

                const status = isFailedFile
                    ? ` ${colorize(colorize('❌ Loading failed', Colors.BOLD), Colors.RED)}`
                    : '';

                return `${colorize(indent + connector, Colors.GRAY)}${coloredFile}${status}`;
            })
            .join('\n')}`;
    }

    if (originalError) {
        result += `\n\n${colorize('Error details:', Colors.YELLOW)} ${originalError.message}`;
    }

    return result;
};

// Base module loading error class
export class ModuleLoadingError extends Error {
    constructor(
        message: string,
        public moduleIds: string[],
        public targetModule: string,
        public originalError?: Error
    ) {
        super(message);
        this.name = 'ModuleLoadingError';

        // Hide auxiliary properties from enumeration to avoid cluttering error display
        Object.defineProperty(this, 'moduleIds', {
            value: moduleIds,
            writable: false,
            enumerable: false,
            configurable: true
        });

        Object.defineProperty(this, 'targetModule', {
            value: targetModule,
            writable: false,
            enumerable: false,
            configurable: true
        });

        if (originalError) {
            Object.defineProperty(this, 'originalError', {
                value: originalError,
                writable: false,
                enumerable: false,
                configurable: true
            });
        }
    }
}

// Circular dependency error class
export class CircularDependencyError extends ModuleLoadingError {
    constructor(message: string, moduleIds: string[], targetModule: string) {
        super(message, moduleIds, targetModule);
        this.name = 'CircularDependencyError';

        // Custom stack for clean error display
        this.stack = `${this.name}: ${message}\n\n${formatCircularDependency(moduleIds, targetModule)}`;
    }
}

// File read error class
export class FileReadError extends ModuleLoadingError {
    constructor(
        message: string,
        moduleIds: string[],
        targetModule: string,
        originalError?: Error
    ) {
        super(message, moduleIds, targetModule, originalError);
        this.name = 'FileReadError';

        // Custom stack for clean error display
        this.stack = `${this.name}: ${message}\n\n${formatModuleChain(moduleIds, targetModule, originalError)}`;
    }
}
