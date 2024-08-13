import { defineServer } from '@gez/core'
import { createRenderer } from 'vue-server-renderer';
import { createApp } from './create-app';

export default defineServer({
  async render(context) {
    const { app } = createApp()
    const html = await createRenderer({}).renderToString(app)
    context.html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Gen for Rspack</title>
    </head>
    <body>
    ${html}
    </body>
    </html>
`
    context.insertHtml(`<script type="module" src="/ssr-rspack-vue2/js/index.js"></script>`, 'bodyBefore')
  }
})
