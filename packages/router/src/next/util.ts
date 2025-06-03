export const isBrowser = typeof window === 'object';

export function isNotNullish(value: unknown): boolean {
    return value !== undefined && value !== null;
}

export function isESModule(obj: any): boolean {
    return Boolean(obj.__esModule) || obj[Symbol.toStringTag] === 'Module';
}
