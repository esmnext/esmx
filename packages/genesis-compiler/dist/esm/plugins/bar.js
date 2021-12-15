import { Plugin } from '@fmfe/genesis-core';
import WebpackBar from 'webpackbar';
export class BarPlugin extends Plugin {
    chainWebpack({ target, config }) {
        const options = target === 'client'
            ? {
                name: `Client: ${this.ssr.name}`,
                color: 'green'
            }
            : {
                name: `Server: ${this.ssr.name}`,
                color: 'orange'
            };
        config.plugin('webpackbar').use(WebpackBar, [options]);
    }
}
