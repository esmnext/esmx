import type { EsmxOptions } from '@esmx/core';

export default {
    modules: {
        exports: ['npm:vue', 'npm:@esmx/router-vue']
    },
    async devApp(esmx) {
        return import('@esmx/rspack-vue').then((m) =>
            m.createRspackVue2App(esmx, {
                config(context) {
                    // 在此处自定义 Rspack 编译配置
                }
            })
        );
    }
} satisfies EsmxOptions;
