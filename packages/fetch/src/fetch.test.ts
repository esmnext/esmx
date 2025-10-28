import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'vitest';
import { fetchPkgsWithProgress } from '.';

test('base', async () => {
    const urls = ['ssr-html/versions/latest.tgz', 'ssr-html/versions/1.0.tgz'];
    const outputDir = path.join(
        path.dirname(fileURLToPath(import.meta.url)),
        'output'
    );
    await fetchPkgsWithProgress({
        outputDir,
        axiosReqCfg: {
            baseURL: 'https://esmx.dev',
            timeout: 4500
        },
        packs: urls.map((url) => ({ url, name: url.split('/')[0] }))
    }).then((...args) => {
        console.log(...args);
    });
}, 5000);
