// Template generation, do not manually modify
export default {
    '*.{css,vue}': (filenames) => {
        return ['npm run lint:css'];
    },
    '*.{ts,js,mjs,cjs}': (filenames) => {
        return ['npm run lint:js'];
    }
};
