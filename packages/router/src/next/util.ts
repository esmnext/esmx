export const isBrowser = typeof window === 'object';

export function isNotNullish(value: unknown): boolean {
    return value !== undefined && value !== null;
}

export function isESModule(obj: any): boolean {
    return Boolean(obj.__esModule) || obj[Symbol.toStringTag] === 'Module';
}
export const removeFromArray = <T>(arr: T[], ele: T) => {
    const i = arr.findIndex((item) => item === ele);
    if (i === -1) return;
    arr.splice(i, 1);
};

export function isValidConfirmHookResult(result: unknown): boolean {
    return (
        typeof result === 'boolean' ||
        typeof result === 'string' ||
        (!!result && typeof result === 'object')
    );
}
