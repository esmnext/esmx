/**
 * @file Node.js 服务器入口文件
 * @description 负责开发环境配置和服务器启动，提供 SSR 运行时环境
 */

import type { EsmxOptions } from '@esmx/core';

export default {
    modules: {
        exports: ['root:src/store/music-store.ts', 'root:src/utils/time.ts']
    },
    async devApp(esmx) {
        return import('@esmx/rspack').then((m) => m.createRspackHtmlApp(esmx));
    }
} satisfies EsmxOptions;
