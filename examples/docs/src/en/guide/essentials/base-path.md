---
titleSuffix: Esmx Framework Static Resource Path Configuration Guide
description: A detailed guide on configuring base paths in the Esmx framework, including multi-environment deployment, CDN distribution, and resource access path settings, helping developers achieve flexible static resource management.
head:
  - - meta
    - property: keywords
      content: Esmx, Base Path, CDN, Static Resources, Multi-environment Deployment, Resource Management
---

# Base Path

The Base Path refers to the prefix of the access path for static resources (such as JavaScript, CSS, images, etc.) in an application. In Esmx, proper configuration of the base path is crucial for the following scenarios:

- **Multi-environment Deployment**: Supporting resource access in different environments such as development, testing, and production
- **Multi-region Deployment**: Adapting to cluster deployment requirements in different regions or countries
- **CDN Distribution**: Enabling global distribution and acceleration of static resources

## Default Path Mechanism

Esmx employs an automatic path generation mechanism based on the service name. By default, the framework reads the `name` field in the project's `package.json` to generate the base path for static resources: `/your-app-name/`.

```json title="package.json"
{
    "name": "your-app-name"
}
```

This convention-over-configuration design offers the following advantages:

- **Consistency**: Ensures all static resources use a unified access path
- **Predictability**: The resource access path can be inferred directly from the `name` field in `package.json`
- **Maintainability**: No additional configuration required, reducing maintenance costs

## Dynamic Path Configuration

In real-world projects, we often need to deploy the same codebase to different environments or regions. Esmx provides support for dynamic base paths, allowing applications to adapt to various deployment scenarios.

### Use Cases

#### Subdirectory Deployment
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

You can dynamically set the base path based on the request context using the `base` parameter in the `esmx.render()` method:

```ts
const render = await esmx.render({
    base: '/cn',  // Set the base path
    params: {
        url: req.url
    }
});
```