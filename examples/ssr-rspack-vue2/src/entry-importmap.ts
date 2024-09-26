import { ImportMapConfig } from '@gez/rspack'

export const importmapConfig: ImportMapConfig = {
    imports: [
        'ssr-rspack-vue2_remote/src/utils/index.ts'
    ],
    exposes: [
        './src/utils/index.ts',
    ]
};
