import type { RspackOptionsNormalized } from '@rspack/core';

export function initConfig(options: RspackOptionsNormalized) {
    const isProduction = options.mode === 'production';

    options.output = {
        ...options.output,
        module: true,
        chunkFormat: 'module',
        chunkLoading: 'import',
        workerChunkLoading: 'import',
        library: {
            type: 'module'
        }
    };
    options.experiments = {
        ...options.experiments,
        outputModule: true,
        rspackFuture: {
            bundlerInfo: { force: false }
        }
    };

    options.module = {
        ...options.module,
        parser: {
            ...options.module?.parser,
            javascript: {
                ...options.module?.parser?.javascript,
                importMeta: false,
                strictExportPresence: true
            }
        }
    };
    options.optimization = {
        ...options.optimization,
        // See detail: https://github.com/web-infra-dev/rspack/issues/11578
        // runtimeChunk: 'single',
        // splitChunks: {
        //     chunks: 'all'
        // },
        avoidEntryIife: isProduction
    };
}
