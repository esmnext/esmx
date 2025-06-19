module.exports = {
    hooks: {
        readPackage(pkg) {
            // 在 Cloudflare Pages 环境中忽略 engines 检查
            if (process.env.CF_PAGES) {
                delete pkg.engines;
            }
            return pkg;
        }
    }
};
