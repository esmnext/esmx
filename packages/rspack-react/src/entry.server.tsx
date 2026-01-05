import type { RenderContext } from '@esmx/core';
import { renderToString } from 'react-dom/server';
import { createApp } from './create-app';

export default async (rc: RenderContext) => {
  const { app } = createApp();
  const html = renderToString(app);

  await rc.commit();

  rc.html = `<!DOCTYPE html>
<html lang="en">
<head>
    ${rc.preload()}
    <title>EconomicHub - Financial News & Economic Calendar</title>
    ${rc.css()}
</head>
<body>
    <div id="app">${html}</div>
    ${rc.importmap()}
    ${rc.moduleEntry()}
    ${rc.modulePreload()}
</body>
</html>
`;
};
