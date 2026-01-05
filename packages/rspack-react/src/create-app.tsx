/**
 * @file 应用实例创建
 * @description 负责创建和配置应用实例
 */

import { createElement } from 'react';
import App from './app';

export function createApp() {
  const app = createElement(App);
  return {
    app
  };
}