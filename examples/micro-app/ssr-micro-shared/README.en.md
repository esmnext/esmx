# ssr-micro-shared

Shared dependency package for the micro-frontend example.

## Description

This package serves as a shared dependency hub, exporting `@esmx/router` for all sub-apps to use. This avoids duplicate bundling and ensures consistent runtime versions.

## Exported Modules

- `@esmx/router` - Esmx Router core library

## Usage

Other sub-apps link to this package via `modules.links` and map bare module imports via `modules.imports`:

```typescript
modules: {
    links: {
        'ssr-micro-shared': '../ssr-micro-shared/dist'
    },
    imports: {
        '@esmx/router': 'ssr-micro-shared/@esmx/router'
    }
}
```
