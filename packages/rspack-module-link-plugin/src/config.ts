import type { RspackOptionsNormalized } from '@rspack/core';
import type { ParsedModuleLinkPluginOptions } from './types';

export function initConfig(
    options: RspackOptionsNormalized,
    opts: ParsedModuleLinkPluginOptions
) {
    const isProduction = options.mode === 'production';
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
    options.output = {
        ...options.output,
        iife: false,
        uniqueName: opts.name,
        chunkFormat: 'module',
        module: true,
        library: {
            type: isProduction ? 'modern-module' : 'module'
        },
        environment: {
            ...options.output.environment,
            dynamicImport: true,
            dynamicImportInWorker: true,
            module: true
        }
    };
    options.optimization = {
        ...options.optimization,
        avoidEntryIife: isProduction,
        concatenateModules: isProduction,
        usedExports: isProduction
    };
}
