import type { Compiler } from '@rspack/core';
import type { ParsedModuleLinkPluginOptions } from './types';

export function initConfig(
    compiler: Compiler,
    opts: ParsedModuleLinkPluginOptions
) {
    const isProduction = compiler.options.mode === 'production';
    compiler.options.experiments = {
        ...compiler.options.experiments,
        outputModule: true
    };
    compiler.options.output = {
        ...compiler.options.output,
        iife: false,
        uniqueName: opts.name,
        chunkFormat: isProduction ? 'module' : undefined,
        chunkLoading: isProduction ? 'import' : undefined,
        module: true,
        library: {
            type: isProduction ? 'modern-module' : 'module'
        },
        publicPath: `/${opts.name}/`,
        environment: {
            ...compiler.options.output.environment,
            dynamicImport: true,
            dynamicImportInWorker: true,
            module: true
        }
    };
    compiler.options.optimization = {
        ...compiler.options.optimization,
        avoidEntryIife: isProduction,
        concatenateModules: isProduction
    };
}
