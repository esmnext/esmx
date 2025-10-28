/**
 * @file 客户端入口文件
 * @description 负责客户端交互逻辑和动态更新
 */

import { createApp } from './create-app';

const base =
    location.origin === 'https://esmx.dev'
        ? 'https://esmx.dev/router-demo/'
        : location.origin;

createApp({
    base,
    url: location.href
});
