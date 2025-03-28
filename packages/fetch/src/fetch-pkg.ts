import fs from 'node:fs';
import path from 'node:path';
import genSysCacheDir from 'cachedir';

import type { FetchPkgOptions, FetchResult } from './types';
import { downloadFile, getHashText } from './utils';

const sysCacheDir = path.join(genSysCacheDir('npm-esmx'), 'packages');

/**
 * 获取文件，并缓存到本地。如果有缓存则使用缓存
 */
export async function fetchPkg<Level extends number>({
    cacheDir = sysCacheDir,
    outputDir,
    noCache,
    returnLevel = 2 as Level,
    logger = console.log,
    axiosReqCfg = {},
    name,
    url = '',
    onFinally = () => {}
}: FetchPkgOptions & { returnLevel?: Level }): Promise<FetchResult<Level>> {
    const returnWrapper = (ans: FetchResult<2>) => {
        onFinally(ans);
        return (returnLevel === 0 ? ans.hasError : ans) as FetchResult<Level>;
    };

    const paramsChecker = () => {
        url = axiosReqCfg.url || url;
        if (axiosReqCfg.baseURL) {
            url = new URL(url, axiosReqCfg.baseURL).href;
        }
        if (!name) {
            return returnWrapper({
                hasError: true,
                name,
                url,
                error: new Error('name is empty')
            });
        }
        if (!url) {
            return returnWrapper({
                hasError: true,
                name,
                url,
                error: new Error('url is empty')
            });
        }
        const urlInfo = new URL(url);
        urlInfo.searchParams.append(Date.now() + '_', Date.now() + '');
        axiosReqCfg.headers = axiosReqCfg.headers || {};
        axiosReqCfg.headers['Cache-Control'] =
            axiosReqCfg.headers['Cache-Control'] || 'no-cache';
        axiosReqCfg.headers.Pragma = axiosReqCfg.headers.Pragma || 'no-cache';
        axiosReqCfg.headers.Expires = axiosReqCfg.headers.Expires || '0';
        url = urlInfo.href;
        if (noCache && !outputDir) {
            return returnWrapper({
                hasError: true,
                name,
                url,
                error: new Error('outputFilePath is empty')
            });
        }
        if (!noCache && cacheDir === '') {
            return returnWrapper({
                hasError: true,
                name,
                url,
                error: new Error('cacheDir is empty')
            });
        }
    };

    const initDirs = async () => {
        if (outputDir && !fs.existsSync(outputDir)) {
            await fs.promises.mkdir(outputDir, { recursive: true });
        }
        if (!noCache) {
            if (!fs.existsSync(cacheDir)) {
                await fs.promises.mkdir(cacheDir, { recursive: true });
            }
        }
    };

    const t = paramsChecker();
    logger?.(`[fetch] [${name}] From ${url}`);
    if (t) {
        return t;
    }
    await initDirs();

    const urlInfo = new URL(url);
    const fileExt = path.parse(urlInfo.pathname).ext;
    urlInfo.pathname = urlInfo.pathname.replace(
        new RegExp(fileExt + '$'),
        '.txt'
    );
    const hashUrl = urlInfo.href;

    /*
        获取 hash。使用缓存时，一定要有 hash 值。
        现在的逻辑是不使用缓存时，不校验 hash 值。
        TODO: 理论上应该将《是否使用缓存》和《是否校验》分开，以后再说吧。
    */
    let hash = '';
    let hashAlg = '';
    if (!noCache) {
        const hashInfo = await getHashText(hashUrl, {
            ...axiosReqCfg,
            onDownloadProgress: undefined
        });
        if (hashInfo.error) {
            logger?.(`[fetch] [${name}] Error: ${hashInfo.error}`);
            return returnWrapper({
                hasError: true,
                name,
                url,
                error: hashInfo.error
            });
        }
        ({ hash, hashAlg } = hashInfo);
    }
    // 不使用缓存时 || 无hash文件时，直接下载到 outputPath，且不进行校验
    const download2output = noCache || !hash;
    if (download2output && !outputDir) {
        logger?.(`[fetch] [${name}] Error: outputDir is empty`);
        return returnWrapper({
            hasError: true,
            name,
            url,
            error: new Error('outputDir is empty')
        });
    }
    const outputFilePath = outputDir
        ? path.join(outputDir, name + fileExt)
        : '';

    const cacheFilePath = path.join(cacheDir, hash + fileExt);
    const tmpFilePath =
        (download2output
            ? outputFilePath
            : path.join(cacheDir, hash + fileExt)) + '.tmp';

    if (hash && fs.existsSync(cacheFilePath)) {
        logger?.(`[fetch] [${name}] Hit cache`);
        if (outputFilePath) {
            await fs.promises.cp(cacheFilePath, outputFilePath, {
                force: true
            });
        }
        return returnWrapper({
            hasError: false,
            name,
            url,
            filePath: outputFilePath || cacheFilePath,
            cacheFilePath,
            hash,
            hitCache: true
        });
    }

    const error = await downloadFile(
        url,
        tmpFilePath,
        hash,
        hashAlg,
        axiosReqCfg
    );
    if (error) {
        const err = error.error as Error;
        switch (error.errType) {
            case 'axios':
                logger?.(`[fetch] [${name}] Error: ${err.message}`);
                break;
            case 'file':
                logger?.(`[fetch] [${name}] Write file error: ${err.message}`);
                break;
            case 'hash':
                logger?.(`[fetch] [${name}] Hash not match`);
                break;
        }
        return returnWrapper({ hasError: true, name, url, error: err });
    }
    if (download2output) {
        await fs.promises.rename(tmpFilePath, outputFilePath);
        logger?.(
            `[fetch] [${name}] Downloaded without cache: ${outputFilePath}`
        );
        return returnWrapper({
            hasError: false,
            name,
            url,
            filePath: outputFilePath,
            cacheFilePath: outputFilePath,
            hash,
            hitCache: true
        });
    } else {
        await fs.promises.rename(tmpFilePath, cacheFilePath);
        if (outputFilePath) {
            await fs.promises.cp(cacheFilePath, outputFilePath, {
                force: true
            });
        }
        const filePath = outputFilePath || cacheFilePath;
        logger?.(`[fetch] [${name}] Downloaded: ${filePath}`);
        return returnWrapper({
            hasError: false,
            name,
            url,
            filePath,
            cacheFilePath,
            hash,
            hitCache: false
        });
    }
}
