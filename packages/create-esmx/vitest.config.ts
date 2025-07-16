import { configDefaults, defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        exclude: [...configDefaults.exclude, '**/template/**'],
        coverage: {
            exclude: [
                ...(configDefaults.coverage.exclude || []),
                '**/template/**'
            ]
        }
    }
});
