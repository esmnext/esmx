---
titleSuffix: "Static Asset Base Path Configuration"
description: "Configure Esmx base paths for multi-env deployment, CDN distribution, and resource access, enabling flexible static asset management."
head:
  - - "meta"
    - name: "keywords"
      content: "Esmx, Base Path, CDN, Static Assets, Multi-env Deployment, Resource Management"
---

# Base Path

The base path is the prefix for static asset URLs (JavaScript, CSS, images). Proper base path configuration is vital for:

- **Multi-env deployment**: dev, test, prod resource access
- **Multi-region deployment**: clusters across different regions or countries
- **CDN distribution**: global distribution and acceleration

## Default Path Mechanism

Esmx auto-generates base paths from the service name. By default, it reads `package.json:name` and sets `/your-app-name/`.

```json title="package.json"
{
    "name": "your-app-name"
}
```

Benefits:

- **Consistency**: unified access paths for assets
- **Predictability**: infer paths from `name` field
- **Maintainability**: no extra config needed

## Dynamic Path Configuration

Deploy the same codebase across environments or regions by setting a dynamic base path.

### Scenarios

#### Sub-directory deployment
```
- example.com      -> default site
- example.com/cn/  -> Chinese site
- example.com/en/  -> English site
```

#### Separate domain deployment
```
- example.com    -> default site
- cn.example.com -> Chinese site
- en.example.com -> English site
```

### Configuration

Set the base path via `esmx.render()` based on the request context:

```ts
const render = await esmx.render({
    base: '/cn',
    params: {
        url: req.url
    }
});
```
