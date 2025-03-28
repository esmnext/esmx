import type { AxiosRequestConfig } from 'axios';
import type { Options as MultiBarOptions } from 'cli-progress';

export interface FetchBaseOptions {
    /**
     * 是否不使用缓存 默认为 `false` (即默认使用缓存)
     * 现在的逻辑是不使用缓存时，不校验 hash 值。
     */
    noCache?: boolean;
    /**
     * 缓存文件夹路径 默认为 `{system cache dir}/npm-esmx/packages`。
     * 当 `noCache` 为 `true` 时，该参数无效。
     * 当 `noCache` 为 `false` 时，省略该参数会导致报错 `cacheDir is empty`。
     */
    cacheDir?: string;
    /**
     * 输出的文件夹路径。
     * 省略时不输出文件，如果使用缓存会下载到缓存。
     * 不使用缓存时或无hash文件时，省略则会导致报错 `outputDir is empty`。
     * 目前，如果不使用缓存，会直接下载到输出，且不进行 hash 校验。
     */
    outputDir?: string;
    /**
     * 返回结果的级别 默认为 `2` (即默认返回详细结果)
     * - `0`: 如果没有发生任何错误，返回 `true`，否则返回 `false`；
     * - `1`: 根据入参顺序，返回 `boolean[]`，表示是否成功；
     * - `2`: 返回详细结果。
     */
    returnLevel?: number;
    /**
     * 日志输出函数 默认为 `console.log`
     * @param str string 输出的字符串
     * @returns void
     */
    logger?: (str?: string) => void;
    /**
     * axios 请求配置
     */
    axiosReqCfg?: AxiosRequestConfig;
    /**
     * 包下载结束时的回调函数
     * @param pack 包信息
     * @param result 结果
     */
    onFinally?: (result: FetchResultSuccess | FetchResultError) => void;
}
export interface FetchPkgOptions extends FetchBaseOptions {
    /**
     * 包名。用于输出和保存时的文件名。
     */
    name: string;
    /**
     * 下载地址。优先级低于 `axiosReqCfg?.url`
     */
    url?: string;
}
export interface FetchPkgsOptions extends FetchBaseOptions {
    /**
     * 请确保每个包的 `name` 不同，否则会报错 `Duplicate name`。文件将会被下载到 `{outputDir}/{name}.ext`。
     */
    packs: FetchPkgOptions[];
    /**
     * 每个包下载结束时的回调函数
     * @param pack 包信息
     * @param result 结果
     */
    onEachFinally?: (result: FetchResultSuccess | FetchResultError) => void;
}

export type FetchPkgWithBarLogger = (
    multiBarLogger: (data?: string) => void,
    str?: string
) => void;
export interface FetchPkgWithBarOptions
    extends Omit<FetchPkgOptions, 'logger'> {
    /**
     * 进度条日志输出函数，默认为空（不输出东西）。可以使用 `(barLogger, str) => barLogger(str)` 来输出日志。
     * @param multiBarLogger `(data: string) => void` 进度条自带的日志输出函数，请通过该函数进行日志输出
     * @param str string 输出的字符串
     * @returns void
     */
    logger?: FetchPkgWithBarLogger;
}
export interface FetchPkgsWithBarOptions
    extends Omit<FetchBaseOptions, 'logger'> {
    /**
     * 进度条日志输出函数，默认为 `(barLogger, str) => barLogger(str)`
     * @param multiBarLogger `(data: string) => void` 进度条自带的日志输出函数，请通过该函数进行日志输出
     * @param str string 输出的字符串
     * @returns void
     */
    logger?: FetchPkgWithBarLogger;
    /**
     * 进度条配置
     */
    multiBarCfg?: MultiBarOptions;
    /**
     * 每个包下载结束时的回调函数
     * @param pack 包信息
     * @param result 结果
     */
    onEachFinally?: (result: FetchResultSuccess | FetchResultError) => void;
    packs: FetchPkgWithBarOptions[];
}

export interface FetchResultBase {
    /**
     * 资源是从哪个 URL 获取的
     */
    url: string;
    /**
     * 包名。用于输出和保存时的文件名。
     */
    name: string;
}
export interface FetchResultSuccess extends FetchResultBase {
    hasError: false;
    /**
     * 输出的文件路径
     * 如果无 outputPath，且使用缓存，则为缓存文件路径。
     */
    filePath: string;
    /**
     * 缓存文件路径 默认为 `{system cache dir}/npm-esmx/packages/hash.ext`
     * 如果不使用缓存，则为空字符串。
     */
    cacheFilePath: string;
    /**
     * 文件 hash 值
     * 如果不使用缓存/无校验文件时，则为空字符串。
     */
    hash: string;
    /**
     * 是否命中缓存
     * 如果不使用缓存，则必定为 `false`。
     */
    hitCache: boolean;
}
export interface FetchResultError extends FetchResultBase {
    hasError: true;
    /**
     * 错误信息
     */
    error: Error;
}
export type FetchResult<Level extends number> = Level extends 0
    ? boolean
    : FetchResultSuccess | FetchResultError;
export type FetchResults<Level extends number> = Level extends 0
    ? FetchResult<0>
    : Level extends 1
      ? boolean[]
      : FetchResult<2>[];
