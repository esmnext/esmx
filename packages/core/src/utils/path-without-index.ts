export function pathWithoutIndex(i: Record<string, string>) {
    const s = '/index';
    Object.entries(i).forEach(([k, v]) => {
        if (k.endsWith(s)) {
            k = k.substring(0, k.length - s.length);
            if (k in i) return;
            i[k] = v;
        }
    });
}
