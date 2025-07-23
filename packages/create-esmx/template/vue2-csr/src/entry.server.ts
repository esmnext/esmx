import type { RenderContext } from '@esmx/core';

export default async (rc: RenderContext) => {
    await rc.commit();

    rc.html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Vue2 with Client-Side Rendering powered by Esmx framework">
    <meta name="keywords" content="Vue2, CSR, Client-Side Rendering, Esmx, Vue.js, JavaScript, TypeScript, Rspack">
    <link rel="icon" href="https://www.esmnext.com/logo.svg" type="image/svg+xml">
    ${rc.preload()}
    <title>Vue2 CSR Demo | Powered by Esmx</title>
    ${rc.css()}
</head>
<body>
    <div id="app"></div>
    ${rc.importmap()}
    ${rc.moduleEntry()}
    ${rc.modulePreload()}
</body>
</html>
`;
};
