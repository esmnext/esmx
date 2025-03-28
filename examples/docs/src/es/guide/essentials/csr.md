---
titleSuffix: Guía de implementación de renderizado en el cliente del framework Esmx
description: Explicación detallada del mecanismo de renderizado en el cliente del framework Esmx, incluyendo construcción estática, estrategias de despliegue y mejores prácticas, para ayudar a los desarrolladores a lograr un renderizado frontend eficiente en entornos sin servidor.
head:
  - - meta
    - property: keywords
      content: Esmx, Renderizado en el cliente, CSR, Construcción estática, Renderizado frontend, Despliegue sin servidor, Optimización de rendimiento
---

# Renderizado en el cliente

El renderizado en el cliente (Client-Side Rendering, CSR) es una técnica de renderizado de páginas que se ejecuta en el navegador. En Esmx, cuando tu aplicación no puede desplegar una instancia de servidor Node.js, puedes optar por generar un archivo estático `index.html` durante la fase de construcción, logrando un renderizado puramente en el cliente.

## Casos de uso

Se recomienda utilizar el renderizado en el cliente en los siguientes escenarios:

- **Entornos de alojamiento estático**: Servicios de alojamiento como GitHub Pages, CDN, etc., que no admiten renderizado en el servidor.
- **Aplicaciones simples**: Aplicaciones pequeñas donde la velocidad de carga inicial y el SEO no son críticos.
- **Entorno de desarrollo**: Para una vista previa rápida y depuración de la aplicación durante la fase de desarrollo.

## Configuración

### Configuración de la plantilla HTML

En el modo de renderizado en el cliente, necesitas configurar una plantilla HTML genérica. Esta plantilla servirá como contenedor de la aplicación, incluyendo las referencias necesarias a recursos y el punto de montaje.

```ts title="src/entry.server.ts"
import type { RenderContext } from '@esmx/core';

export default async (rc: RenderContext) => {
    // Enviar la recolección de dependencias
    await rc.commit();
    
    // Configurar la plantilla HTML
    rc.html = `
<!DOCTYPE html>
<html>
<head>
    ${rc.preload()}           // Precargar recursos
    <title>Esmx</title>
    ${rc.css()}               // Inyectar estilos
</head>
<body>
    <div id="app"></div>
    ${rc.importmap()}         // Mapa de importación
    ${rc.moduleEntry()}       // Módulo de entrada
    ${rc.modulePreload()}     // Precarga de módulos
</body>
</html>
`;
};
```

### Generación de HTML estático

Para utilizar el renderizado en el cliente en un entorno de producción, es necesario generar un archivo HTML estático durante la fase de construcción. Esmx proporciona una función de enlace `postBuild` para implementar esta funcionalidad:

```ts title="src/entry.node.ts"
import type { EsmxOptions } from '@esmx/core';

export default {
    async postBuild(esmx) {
        // Generar archivo HTML estático
        const rc = await esmx.render();
        // Escribir archivo HTML
        esmx.writeSync(
            esmx.resolvePath('dist/client', 'index.html'),
            rc.html
        );
    }
} satisfies EsmxOptions;
```