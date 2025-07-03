// Template generation, do not manually modify
import { defineBuildConfig } from 'unbuild';

export default defineBuildConfig({
    clean: true,
    entries: [
        {
            input: './src/',
            format: 'esm',
            ext: 'mjs',
            cleanDist: true,
            declaration: true,
            esbuild: {
                target: [
                    'chrome64',
                    'firefox67',
                    'safari11.1',
                    'edge79',
                    'node24'
                ]
            }
        }
    ]
});
