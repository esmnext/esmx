const FILE_EXT_REGEX =
    /\.(js|mjs|cjs|jsx|mjsx|cjsx|ts|mts|cts|tsx|mtsx|ctsx)$/i;

export interface ParsedExport {
    name: string;
    pkg: boolean;
    client: boolean;
    server: boolean;
    file: string;
}

export function parseExport(exports: string | string[]): ParsedExport {
    let left = '';
    let right = '';
    if (Array.isArray(exports)) {
        left = exports[0];
        right = exports[1];
    } else if (exports.includes(':')) {
        left = exports;
        right = exports.split(':', 2)[1];
    } else {
        left = exports.replace(FILE_EXT_REGEX, '');
        right = exports;
    }

    // 处理修饰符
    const modifiers = left.split(':', 1)[0].split('.');
    const pkg = modifiers.includes('pkg');
    let client = modifiers.includes('client');
    let server = modifiers.includes('server');

    if (!client && !server) {
        client = true;
        server = true;
    }

    let name = '';
    if (left.includes(':')) {
        name = left.split(':', 2)[1];
    } else {
        name = left;
    }
    if (!Array.isArray(exports)) {
        name = name
            .split('/')
            .filter((str) => {
                return !/^\.+$/.test(str);
            })
            .join('/')
            .replace(FILE_EXT_REGEX, '');
    }
    const file = right;
    return {
        name,
        pkg: pkg,
        client,
        server,
        file
    };
}
