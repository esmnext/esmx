(() => {
    const HMR_JSONP = '__esmx_rspack_hmr_jsonp__';
    const HMR_JSONP_LIST = '__esmx_rspack_hmr_jsonp_list__';

    const list: Array<{ url: string; jsonp: Function }> = (window[
        HMR_JSONP_LIST
    ] = window[HMR_JSONP_LIST] || []);

    Object.defineProperty(window, HMR_JSONP, {
        get() {
            return (...args: any[]) => {
                const hotUrl = getStackUrl(new Error().stack || '', 1);
                if (hotUrl) {
                    const item = list.find((item) =>
                        isSameModule(hotUrl, item.url)
                    );
                    if (item) {
                        return item.jsonp(...args);
                    }
                }
                console.log('%chot update not found', 'color: red', args);
            };
        },
        set(jsonp) {
            const url = getStackUrl(new Error().stack || '', 1);
            if (url) {
                list.push({ url, jsonp });
            }
        }
    });
    function isSameModule(hotUrl: string, originalUrl: string): boolean {
        const normalizedHotUrl = hotUrl
            .replace(/\/__hot__\//, '/')
            .replace(/\.\w+\.hot-update\.mjs$/, '.mjs');
        const normalizedOriginalUrl = originalUrl;
        return normalizedHotUrl === normalizedOriginalUrl;
    }

    function getStackUrl(stack: string, index = 0): string | null {
        const lines = stack.split('\n');
        const stackLines = lines.filter((line) => line.includes('at '));
        if (index < 0 || index >= stackLines.length) {
            return null;
        }
        const line = stackLines[index];
        const withoutAt = line.replace(/^\s*at\s+/, '');
        const urlMatch = withoutAt.match(/\((.*?)\)/);
        const url = urlMatch ? urlMatch[1] : withoutAt;
        return url.replace(/:\d+:\d+$/, '');
    }
})();
