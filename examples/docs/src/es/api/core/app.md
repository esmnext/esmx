---
titleSuffix: Interfaz de abstracción de aplicaciones del framework Esmx
description: Detalles sobre la interfaz App del framework Esmx, incluyendo la gestión del ciclo de vida de la aplicación, el manejo de recursos estáticos y la renderización del lado del servidor, para ayudar a los desarrolladores a comprender y utilizar las funciones principales de la aplicación.
head:
  - - meta
    - property: keywords
      content: Esmx, App, abstracción de aplicación, ciclo de vida, recursos estáticos, renderización del lado del servidor, API
---

# App

`App` es la abstracción de la aplicación en el framework Esmx, que proporciona una interfaz unificada para gestionar el ciclo de vida de la aplicación, los recursos estáticos y la renderización del lado del servidor.

```ts title="entry.node.ts"
export default {
  // Configuración del entorno de desarrollo
  async devApp(esmx) {
    return import('@esmx/rspack').then((m) =>
      m.createRspackHtmlApp(esmx, {
        config(rc) {
          // Configuración personalizada de Rspack
        }
      })
    );
  }
}
```

## Definición de tipos
### App

```ts
interface App {
  middleware: Middleware;
  render: (options?: RenderContextOptions) => Promise<RenderContext>;
  build?: () => Promise<boolean>;
  destroy?: () => Promise<boolean>;
}
```

#### middleware

- **Tipo**: `Middleware`

Middleware para el manejo de recursos estáticos.

Entorno de desarrollo:
- Maneja las solicitudes de recursos estáticos del código fuente
- Soporta compilación en tiempo real y actualización en caliente
- Utiliza una política de caché no-cache

Entorno de producción:
- Maneja los recursos estáticos después de la construcción
- Soporta caché a largo plazo para archivos inmutables (.final.xxx)
- Estrategia optimizada para la carga de recursos

```ts
server.use(esmx.middleware);
```

#### render

- **Tipo**: `(options?: RenderContextOptions) => Promise<RenderContext>`

Función de renderización del lado del servidor. Proporciona diferentes implementaciones según el entorno:
- Entorno de producción (start): Carga el archivo de entrada del servidor construido (entry.server) y ejecuta la renderización
- Entorno de desarrollo (dev): Carga el archivo de entrada del servidor desde el código fuente y ejecuta la renderización

```ts
const rc = await esmx.render({
  params: { url: '/page' }
});
res.end(rc.html);
```

#### build

- **Tipo**: `() => Promise<boolean>`

Función de construcción para el entorno de producción. Se utiliza para empaquetar y optimizar recursos. Devuelve true si la construcción es exitosa, false en caso de fallo.

#### destroy

- **Tipo**: `() => Promise<boolean>`

Función de limpieza de recursos. Se utiliza para cerrar servidores, desconectar conexiones, etc. Devuelve true si la limpieza es exitosa, false en caso de fallo.
```