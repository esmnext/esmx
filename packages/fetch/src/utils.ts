import crypto from 'node:crypto';
import fs from 'node:fs';
import axios, { type AxiosResponse, type AxiosRequestConfig } from 'axios';

/**
 * 获取 hash 文件的值
 */
export async function getHashText(
    hashUrl: string,
    axiosOptions: AxiosRequestConfig = {}
): Promise<{ hash: string; hashAlg: string; error?: Error }> {
    try {
        let hash = (
            await axios.get(hashUrl, {
                ...axiosOptions,
                responseType: 'text'
            })
        ).data;
        let hashAlg = 'sha256';
        if (hash.includes('-')) {
            const t = hash.split('-');
            hash = t.pop() as string;
            hashAlg = t.join('-');
        }
        if (!crypto.getHashes().includes(hashAlg)) {
            return {
                hash: '',
                hashAlg: '',
                error: new Error(`Unsupported hash algorithm ${hashAlg}`)
            };
        }
        return { hash, hashAlg };
    } catch (error: any) {
        return { hash: '', hashAlg: '', error };
    }
}

/**
 * 获取文件。如果有hash则校验hash
 */
export async function downloadFile(
    url: string,
    filePath: string,
    hash: string,
    hashAlg: string,
    axiosOptions: AxiosRequestConfig = {}
): Promise<null | { errType?: 'axios' | 'file' | 'hash'; error?: Error }> {
    // TODO: 断点续传
    let result: AxiosResponse;
    try {
        result = await axios.get(url, {
            ...axiosOptions,
            responseType: 'stream'
        });
    } catch (error: any) {
        return { errType: 'axios', error };
    }

    const hashStream = hash ? crypto.createHash(hashAlg) : null;
    const fileStream = fs.createWriteStream(filePath);

    const streamPromise = new Promise<void>((resolve, reject) => {
        fileStream.on('finish', resolve);
        fileStream.on('error', reject);
    });
    result.data.on('data', (chunk: crypto.BinaryLike) => {
        hashStream?.update(chunk);
        fileStream.write(chunk);
    });
    result.data.on('end', () => fileStream.end());

    try {
        await streamPromise;
    } catch (error: any) {
        return { errType: 'file', error };
    }

    if (hash && hashStream?.digest('hex') !== hash) {
        return { errType: 'hash', error: new Error('Hash not match') };
    }

    return null;
}
