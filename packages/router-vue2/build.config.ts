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
                target: 'es2015'
            }
        },
        {
            input: './src/',
            ext: 'cjs',
            format: 'cjs',
            esbuild: {
                target: 'es2015'
            }
        }
    ]
});
