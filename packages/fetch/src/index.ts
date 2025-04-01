/*

专门为 esmx 框架提供远程的下载库，具有缓存功能。

例子：

const urls = [
    'ssr-html/versions/latest.tgz',
    'ssr-html/versions/1.0.tgz',
];

const outputDir = path.join(path.dirname(fileURLToPath(import.meta.url)), 'output');

fetchPkgsWithProgress({
    outputDir,
    axiosReqCfg: {
        baseURL: 'https://www.esmnext.com/',
        timeout: 10000,
    },
    packs: urls.map(url => ({ url, name: url.split('/')[0] })),
    logger: (barLogger, str) => barLogger(str),
    returnLevel: 0,
}).then((...args) => {
    console.log(...args);
});

 */

export * from './types';
export * from './fetch-pkg';
export * from './fetch-pkgs';
