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
                    'chrome87',
                    'firefox78',
                    'safari14',
                    'edge88',
                    'node22'
                ]
            }
        }
    ]
});
