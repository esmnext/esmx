import { configDefaults, defineConfig } from 'vitest/config';

const excludePatterns = ['**/template/**'];

export default defineConfig({
    test: {
        exclude: [...configDefaults.exclude, ...excludePatterns],
        coverage: {
            exclude: [
                ...(configDefaults.coverage.exclude || []),
                ...excludePatterns
            ]
        }
    }
});
