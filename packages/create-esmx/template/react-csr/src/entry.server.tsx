import type { RenderContext } from '@esmx/core';

export default async (rc: RenderContext) => {
    await rc.commit();

    rc.html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="React with Client-Side Rendering powered by Esmx framework">
    <meta name="keywords" content="React, CSR, Client-Side Rendering, Esmx, React.js, JavaScript, TypeScript, Rspack">
    <link rel="icon" href="https://esmx.dev/logo.svg" type="image/svg+xml">
    ${rc.preload()}
    <title>React CSR Demo | Powered by Esmx</title>
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

