/**
 * @file 客户端入口文件
 * @description 负责客户端交互逻辑和动态更新
 */

import { createApp } from './create-app';

const base =
    location.origin === 'https://www.esmnext.com'
        ? 'https://www.esmnext.com/router-demo/ssr-vue3/'
        : location.origin;

createApp({
    base,
    url: location.href
});
