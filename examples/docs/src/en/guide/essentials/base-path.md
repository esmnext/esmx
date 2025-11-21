---
titleSuffix: "Base Path and Static Asset Management"
description: "Detailed introduction to Esmx framework's base path configuration, including multi-environment deployment, CDN distribution, and resource access path settings, helping developers achieve flexible static resource management."
head:
  - - "meta"
    - name: "keywords"
      content: "Esmx, base path, Base Path, CDN, static resources, multi-environment deployment, resource management"
---

# Base Path

Base Path refers to the access path prefix for static resources (such as JavaScript, CSS, images, etc.) in an application. In Esmx, proper base path configuration is crucial for the following scenarios:

- **Multi-Environment Deployment**: Supports resource access in different environments like development, testing, and production
- **Multi-Region Deployment**: Adapts to cluster deployment needs in different regions or countries
- **CDN Distribution**: Achieves global distribution and acceleration of static resources

## Default Path Mechanism

Esmx adopts an automatic path generation mechanism based on the service name. By default, the framework reads the `name` field in the project's `package.json` to generate the base path for static resources: `/your-app-name/`.

```json title="package.json"
{
    "name": "your-app-name"
}
```

This convention-over-configuration design has the following advantages:

- **Consistency**: Ensures all static resources use unified access paths
- **Predictability**: Resource access paths can be inferred through the `name` field in `package.json`
- **Maintainability**: No additional configuration needed, reducing maintenance costs

## Dynamic Path Configuration

In real-world projects, we often need to deploy the same codebase to different environments or regions. Esmx provides support for dynamic base paths, enabling applications to adapt to various deployment scenarios.

### Usage Scenarios

#### Secondary Directory Deployment
```
- example.com      -> Default main site
- example.com/cn/  -> Chinese site
- example.com/en/  -> English site
```

#### Independent Domain Deployment
```
- example.com    -> Default main site
- cn.example.com -> Chinese site
- en.example.com -> English site
```

### Configuration Method

You can dynamically set the base path based on the request context through the `base` parameter of the `esmx.render()` method:

```ts
const render = await esmx.render({
    base: '/cn',
    params: {
        url: req.url
    }
});