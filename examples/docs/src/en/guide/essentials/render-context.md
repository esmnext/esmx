---
titleSuffix: "RenderContext"
description: "Resource management and HTML generation via RenderContext, including dependency collection and injection order."
head:
  - - "meta"
    - name: "keywords"
      content: "Esmx, RenderContext, SSR, Server-side Rendering, ESM, Resource Management"
---

# RenderContext

RenderContext manages resources and HTML generation during SSR, providing dependency collection and strict injection order.

## Usage

Get an instance via `esmx.render()`:

```ts title="src/entry.node.ts"
async server(esmx) {
    const server = http.createServer((req, res) => {
        esmx.middleware(req, res, async () => {
            const rc = await esmx.render({
                params: { url: req.url }
            });
            res.end(rc.html);
        });
    });
}
```

## Capabilities

### Dependency Collection

Collect module and resource deps during component rendering to avoid preloading everything.

#### On-demand
- Track module deps while components render
- Collect only CSS/JS actually used for the current page
- Record each component’s deps via `importMetaSet`
- Support async components and dynamic imports

#### Automated
- No manual management required
- Call `commit()` to process collected resources
- Handle cycles and duplicates automatically

#### Performance
- Avoid loading unused modules
- Control load order precisely
- Generate optimal Import Maps
- Support preload and on-demand strategies

### Resource Injection

- `preload()` for CSS/JS
- `css()` for critical styles
- `importmap()` for import mappings
- `moduleEntry()` for client entry modules
- `modulePreload()` for dependency preload

### Injection Order

1. head:
   - `preload()`
   - `css()`
2. body:
   - `importmap()`
   - `moduleEntry()`
   - `modulePreload()`

## Full Flow

```ts title="src/entry.server.ts"
export default async (rc: RenderContext) => {
    const app = createApp();
    const html = await renderToString(app, {
       importMetaSet: rc.importMetaSet
    });
    await rc.commit();
    rc.html = `
        <!DOCTYPE html>
        <html>
        <head>
            ${rc.preload()}
            ${rc.css()}
        </head>
        <body>
            ${html}
            ${rc.importmap()}
            ${rc.moduleEntry()}
            ${rc.modulePreload()}
        </body>
        </html>
    `;
};
```

## Advanced

### Base Path

Set dynamic base paths at runtime:

```ts title="src/entry.node.ts"
const rc = await esmx.render({
    base: '/esmx',
    params: { url: req.url }
});
```

Use cases:

1. **Multi-language sites**
   ```
   example.com
   example.com/cn/
   example.com/en/
   ```

2. **Micro frontends**
   - Flexible deployment under different paths
   - Easy integration with hosts

### Import Map Modes

1. **Inline** (default)
2. **JS** external file to leverage caching

```ts title="src/entry.node.ts"
const rc = await esmx.render({
    importmapMode: 'js',
    params: { url: req.url }
});
```

### Entry Function

Specify SSR entry via `entryName`:

```ts title="src/entry.node.ts"
const rc = await esmx.render({
    entryName: 'mobile',
    params: { url: req.url }
});
```

Examples:

```ts title="src/entry.server.ts"
export const mobile = async (rc: RenderContext) => {};
export const desktop = async (rc: RenderContext) => {};
```

## Best Practices

1. **Get via `esmx.render()`**
2. **Collect dependencies properly**
3. **Follow injection order**
4. **Optimize performance**
