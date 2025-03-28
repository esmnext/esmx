import type { RenderContext } from '@esmx/core';
import { getRoutePage } from './routes';

export default async (rc: RenderContext) => {
    // 渲染页面内容
    const Page = await getRoutePage(new URL(rc.params.url, 'file:').pathname);
    const page = new Page();

    page.importMetaSet = rc.importMetaSet;
    page.props = {
        url: rc.params.url,
        base: rc.params.base || '/'
    };
    page.onCreated();
    await page.onServer();
    const html = page.render();

    // 提交模块依赖收集
    await rc.commit();

    rc.html = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    ${rc.preload()}
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${page.title}</title>
    <link rel="icon" type="image/svg+xml" href="https://www.esmnext.com/logo.svg">
    ${rc.css()}
</head>
<body>
    <div id="app">
        ${html}
    </div>
    ${rc.state('__INIT_PROPS__', page.props)}
    ${rc.state('__INIT_STATE__', page.state)}
    ${rc.importmap()}
    ${rc.moduleEntry()}
    ${rc.modulePreload()}
</body>
</html>
`;
};
