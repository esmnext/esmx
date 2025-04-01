/**
 * 在新窗口打开页面，如果被拦截，则会降级到当前窗口打开
 * @param url 打开的地址
 */
export function openWindow(url: string, target?: string) {
    try {
        const newWindow = window.open(url, target);
        if (!newWindow) {
            location.href = url;
        }
    } catch (e) {
        location.href = url;
    }
}
