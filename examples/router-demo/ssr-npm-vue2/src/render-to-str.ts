import { createRenderer } from 'vue-server-renderer';

// 创建渲染器
const renderer = createRenderer();

export async function renderToString(app: any, context: any) {
    const html = await renderer.renderToString(app, context);
    return `<div id="root">${html}</div>`;
}
