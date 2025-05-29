export function isNotNullish(value: unknown): boolean {
    return value !== void 0 && value !== null;
}

/**
 * 在新窗口打开页面，如果被拦截，则会降级到当前窗口打开
 * @param url 打开的地址
 */
export const openWindow = (...args: Parameters<typeof window.open>) => {
    const url = URL.parse(args[0] || 'about:blank');
    try {
        const newWindow = window.open(...args);
        if (newWindow) {
            newWindow.opener = null; // 解除新窗口与当前窗口的关系
        } else if (url) {
            location.replace(url);
        }
    } catch {
        if (url) location.replace(url);
    }
};
