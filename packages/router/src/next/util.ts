export const isBrowser = typeof window === 'object';

export function isNotNullish(value: unknown): boolean {
    return value !== undefined && value !== null;
}
