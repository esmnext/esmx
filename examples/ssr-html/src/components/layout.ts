import './layout.css';

interface LayoutOptions {
    url?: string;
    base?: string;
}

export function layout(slot: string, options: LayoutOptions = {}) {
    const { base = '/' } = options;

    // 判断链接是否激活
    const isActive = (path: string) => {
        // 对于空路径的特殊处理
        if (!path) {
            return '';
        }

        // 如果 options.url 不存在，返回空字符串
        if (!options.url) {
            return '';
        }

        // 从 URL 中移除查询参数
        const urlWithoutQuery = options.url.split('?')[0];
        const pathWithoutQuery = path.startsWith('/') ? path : '/' + path;

        // 对于首页的特殊处理
        if (pathWithoutQuery === '/' && urlWithoutQuery === '/') {
            return 'active';
        }

        return urlWithoutQuery === pathWithoutQuery ? 'active' : '';
    };

    // 处理相对路径
    const resolvePath = (path: string) => {
        if (path.startsWith('http')) return path;
        return base + (path.startsWith('/') ? path.slice(1) : path);
    };

    return `
<div class="layout">
    <header class="header">
        <div class="container">
            <h1><img src="https://esmx.dev/logo.svg" alt="Esmx Logo" width="48" height="48"></h1>
            <nav class="nav">
                <a href="${resolvePath('/')} " class="${isActive('/')}">首页</a>
                <a href="${resolvePath('about')}" class="${isActive('/about')}">关于我们</a>
                <a href="https://github.com/esmnext/esmx/tree/master/examples/ssr-html" target="_blank">示例代码</a>
            </nav>
        </div>
    </header>
    <main class="main">
        <div class="container">
            ${slot}
        </div>
    </main>
</div>
`;
}
