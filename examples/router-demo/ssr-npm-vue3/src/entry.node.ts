import type { EsmxOptions } from '@esmx/core';

export default {
    modules: {
        exports: ['npm:vue', 'npm:@esmx/router-vue']
    },
    async devApp(esmx) {
        return import('@esmx/rspack-vue').then((m) =>
            m.createRspackVue3App(esmx)
        );
    }
} satisfies EsmxOptions;
