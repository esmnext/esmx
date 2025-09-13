import type { RenderContext } from '@esmx/core';
import { version as vueVersion } from './vue';
import { version as vue2Version } from './vue2';

export default async (rc: RenderContext) => {
    await rc.commit();

    rc.html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Esmx Shared Modules - Micro-frontend module sharing solution based on native ESM">
    <meta name="keywords" content="Esmx,Shared Modules,Micro-frontend,ESM Modules,JavaScript Modules,TypeScript,Rspack,Frontend Architecture">
    <meta name="generator" content="Esmx Framework">
    <link rel="icon" href="https://www.esmnext.com/logo.svg" type="image/svg+xml">
    ${rc.preload()}
    <title>Esmx Shared Modules | Micro-frontend Module Sharing Solution</title>
    ${rc.css()}
</head>
<body>
    <header>
        <h1 style="text-align: center;">Esmx Shared Modules</h1>
        <p style="text-align: center;">Micro-frontend module sharing solution based on native ESM</p>
    </header>
    <main>
        <section>
            <h2 style="text-align: center;">Module Features</h2>
            <p style="text-align: center;">Provides common modules and components for cross-application sharing</p>
        </section>
    </main>
    Vue:${vueVersion}
    Vue2:${vue2Version}
    ${rc.importmap()}
    ${rc.moduleEntry()}
    ${rc.modulePreload()}
</body>
</html>
`;
};
