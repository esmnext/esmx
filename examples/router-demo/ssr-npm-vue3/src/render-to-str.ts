import { renderToString as renderer } from '@vue/server-renderer';

export async function renderToString(app: any, context: any): Promise<string> {
    const html = await renderer(app, context);
    return `${context.teleports?.body || ''}<div id="root"><div data-server-rendered>${
        html
    }</div></div><div id="teleported">${
        context.teleports?.['#teleported'] ?? ''
    }</div>`;
}
