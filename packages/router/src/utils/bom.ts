/**
 * 在新窗口打开页面，如果被拦截，则会降级到当前窗口打开
 * @param url 打开的地址
 */
export function openWindow(url: string, target?: string) {
    try {
        const newWindow = window.open(url, target);
        if (!newWindow) {
            location.href = url;
        } else {
            newWindow.opener = null; // 解除新窗口与当前窗口的关系
        }
    } catch (e) {
        location.href = url;
    }
}

export const withResolvers =
    Promise.withResolvers?.bind(Promise) ||
    (<T>(): PromiseWithResolvers<T> => {
        let resolve: any;
        let reject: any;
        const promise = new Promise<T>((res, rej) => {
            resolve = res;
            reject = rej;
        });
        return { promise, resolve, reject };
    });
