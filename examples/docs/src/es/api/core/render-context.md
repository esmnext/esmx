---
titleSuffix: Referencia de la API de Contexto de Renderizado del Framework Esmx
description: Detalles sobre la clase principal RenderContext del framework Esmx, incluyendo control de renderizado, gestión de recursos, sincronización de estado y control de rutas, para ayudar a los desarrolladores a implementar renderizado del lado del servidor (SSR) eficiente.
head:
  - - meta
    - property: keywords
      content: Esmx, RenderContext, SSR, Renderizado del lado del servidor, Contexto de renderizado, Sincronización de estado, Gestión de recursos, Framework de aplicaciones web
---

# RenderContext

RenderContext es la clase principal del framework Esmx, responsable de gestionar el ciclo de vida completo del renderizado del lado del servidor (SSR). Proporciona un conjunto completo de API para manejar el contexto de renderizado, la gestión de recursos, la sincronización de estado y otras tareas clave:

- **Control de renderizado**: Gestiona el flujo de renderizado del lado del servidor, soportando escenarios como renderizado de múltiples entradas y renderizado condicional.
- **Gestión de recursos**: Recopila e inyecta inteligentemente recursos estáticos como JS, CSS, optimizando el rendimiento de carga.
- **Sincronización de estado**: Maneja la serialización del estado del servidor, asegurando una correcta hidratación (hydration) en el cliente.
- **Control de rutas**: Soporta funciones avanzadas como redirecciones del lado del servidor y configuración de códigos de estado.

## Definiciones de tipos

### ServerRenderHandle

Definición del tipo de función de manejo de renderizado del lado del servidor.

```ts
type ServerRenderHandle = (rc: RenderContext) => Promise<void> | void;
```

La función de manejo de renderizado del lado del servidor es una función asíncrona o síncrona que recibe una instancia de RenderContext como parámetro, utilizada para manejar la lógica de renderizado del lado del servidor.

```ts title="entry.node.ts"
// 1. Función asíncrona
export default async (rc: RenderContext) => {
  const app = createApp();
  const html = await renderToString(app);
  rc.html = html;
};

// 2. Función síncrona
export const simple = (rc: RenderContext) => {
  rc.html = '<h1>Hello World</h1>';
};
```

### RenderFiles

Definición del tipo de lista de archivos de recursos recopilados durante el proceso de renderizado.

```ts
interface RenderFiles {
  js: string[];
  css: string[];
  modulepreload: string[];
  resources: string[];
}
```

- **js**: Lista de archivos JavaScript
- **css**: Lista de archivos de hojas de estilo
- **modulepreload**: Lista de módulos ESM que necesitan precarga
- **resources**: Lista de otros archivos de recursos (imágenes, fuentes, etc.)

```ts
// Ejemplo de lista de archivos de recursos
rc.files = {
  js: [
    '/assets/entry-client.js',
    '/assets/vendor.js'
  ],
  css: [
    '/assets/main.css',
    '/assets/vendor.css'
  ],
  modulepreload: [
    '/assets/Home.js',
    '/assets/About.js'
  ],
  resources: [
    '/assets/logo.png',
    '/assets/font.woff2'
  ]
};
```

### ImportmapMode

Define el modo de generación del importmap.

```ts
type ImportmapMode = 'inline' | 'js';
```

- `inline`: Incluye el contenido del importmap directamente en el HTML, adecuado para:
  - Reducir el número de solicitudes HTTP
  - Cuando el contenido del importmap es pequeño
  - Cuando se requiere un alto rendimiento en la carga inicial
- `js`: Genera el contenido del importmap como un archivo JS independiente, adecuado para:
  - Cuando el contenido del importmap es grande
  - Cuando se necesita aprovechar el mecanismo de caché del navegador
  - Cuando múltiples páginas comparten el mismo importmap

Clase de contexto de renderizado, responsable de la gestión de recursos y la generación de HTML durante el proceso de renderizado del lado del servidor (SSR).
## Opciones de instancia

Define las opciones de configuración del contexto de renderizado.

```ts
interface RenderContextOptions {
  base?: string
  entryName?: string
  params?: Record<string, any>
  importmapMode?: ImportmapMode
}
```

#### base

- **Tipo**: `string`
- **Valor por defecto**: `''`

Ruta base para los recursos estáticos.
- Todos los recursos estáticos (JS, CSS, imágenes, etc.) se cargarán basados en esta ruta
- Soporta configuración dinámica en tiempo de ejecución, sin necesidad de reconstruir
- Comúnmente utilizado en sitios multilingües, aplicaciones de microfrontends, etc.

#### entryName

- **Tipo**: `string`
- **Valor por defecto**: `'default'`

Nombre de la función de entrada para el renderizado del lado del servidor. Se utiliza para especificar la función de entrada a usar durante el renderizado del lado del servidor, cuando un módulo exporta múltiples funciones de renderizado.

```ts title="src/entry.server.ts"
export const mobile = async (rc: RenderContext) => {
  // Lógica de renderizado para móviles
};

export const desktop = async (rc: RenderContext) => {
  // Lógica de renderizado para escritorio
};
```

#### params

- **Tipo**: `Record<string, any>`
- **Valor por defecto**: `{}`

Parámetros de renderizado. Se pueden pasar parámetros de cualquier tipo a la función de renderizado, comúnmente utilizados para pasar información de la solicitud (URL, parámetros de consulta, etc.).

```ts
const rc = await esmx.render({
  params: {
    url: req.url,
    lang: 'zh-CN',
    theme: 'dark'
  }
});
```

#### importmapMode

- **Tipo**: `'inline' | 'js'`
- **Valor por defecto**: `'inline'`

Modo de generación del mapa de importación (Import Map):
- `inline`: Incluye el contenido del importmap directamente en el HTML
- `js`: Genera el contenido del importmap como un archivo JS independiente


## Propiedades de instancia

### esmx

- **Tipo**: `Esmx`
- **Solo lectura**: `true`

Referencia a la instancia de Esmx. Se utiliza para acceder a las funciones principales y la configuración del framework.

### redirect

- **Tipo**: `string | null`
- **Valor por defecto**: `null`

Dirección de redirección. Si se establece, el servidor puede realizar una redirección HTTP basada en este valor, comúnmente utilizado en escenarios de verificación de inicio de sesión, control de permisos, etc.

```ts title="entry.node.ts"
// Ejemplo de verificación de inicio de sesión
export default async (rc: RenderContext) => {
  if (!isLoggedIn()) {
    rc.redirect = '/login';
    rc.status = 302;
    return;
  }
  // Continuar con el renderizado de la página...
};

// Ejemplo de control de permisos
export default async (rc: RenderContext) => {
  if (!hasPermission()) {
    rc.redirect = '/403';
    rc.status = 403;
    return;
  }
  // Continuar con el renderizado de la página...
};
```

### status

- **Tipo**: `number | null`
- **Valor por defecto**: `null`

Código de estado HTTP de respuesta. Se puede establecer cualquier código de estado HTTP válido, comúnmente utilizado en escenarios de manejo de errores, redirecciones, etc.

```ts title="entry.node.ts"
// Ejemplo de manejo de error 404
export default async (rc: RenderContext) => {
  const page = await findPage(rc.params.url);
  if (!page) {
    rc.status = 404;
    // Renderizar página 404...
    return;
  }
  // Continuar con el renderizado de la página...
};

// Ejemplo de redirección temporal
export default async (rc: RenderContext) => {
  if (needMaintenance()) {
    rc.redirect = '/maintenance';
    rc.status = 307; // Redirección temporal, manteniendo el método de solicitud
    return;
  }
  // Continuar con el renderizado de la página...
};
```

### html

- **Tipo**: `string`
- **Valor por defecto**: `''`

Contenido HTML. Se utiliza para establecer y obtener el contenido HTML final generado, al establecerlo se manejan automáticamente los marcadores de posición de la ruta base.

```ts title="entry.node.ts"
// Uso básico
export default async (rc: RenderContext) => {
  // Establecer contenido HTML
  rc.html = `
    <!DOCTYPE html>
    <html>
      <head>
        ${rc.preload()}
        ${rc.css()}
      </head>
      <body>
        <div id="app">Hello World</div>
        ${rc.importmap()}
        ${rc.moduleEntry()}
        ${rc.modulePreload()}
      </body>
    </html>
  `;
};

// Ruta base dinámica
const rc = await esmx.render({
  base: '/app',  // Establecer ruta base
  params: { url: req.url }
});

// Los marcadores de posición en el HTML se reemplazarán automáticamente:
// [[[___GEZ_DYNAMIC_BASE___]]]/your-app-name/css/style.css
// Se reemplaza por:
// /app/your-app-name/css/style.css
```

### base

- **Tipo**: `string`
- **Solo lectura**: `true`
- **Valor por defecto**: `''`

Ruta base para los recursos estáticos. Todos los recursos estáticos (JS, CSS, imágenes, etc.) se cargarán basados en esta ruta, soporta configuración dinámica en tiempo de ejecución.

```ts
// Uso básico
const rc = await esmx.render({
  base: '/esmx',  // Establecer ruta base
  params: { url: req.url }
});

// Ejemplo de sitio multilingüe
const rc = await esmx.render({
  base: '/cn',  // Sitio en chino
  params: { lang: 'zh-CN' }
});

// Ejemplo de aplicación de microfrontends
const rc = await esmx.render({
  base: '/app1',  // Subaplicación 1
  params: { appId: 1 }
});
```

### entryName

- **Tipo**: `string`
- **Solo lectura**: `true`
- **Valor por defecto**: `'default'`

Nombre de la función de entrada para el renderizado del lado del servidor. Se utiliza para seleccionar la función de renderizado a usar desde entry.server.ts.

```ts title="entry.node.ts"
// Función de entrada por defecto
export default async (rc: RenderContext) => {
  // Lógica de renderizado por defecto
};

// Múltiples funciones de entrada
export const mobile = async (rc: RenderContext) => {
  // Lógica de renderizado para móviles
};

export const desktop = async (rc: RenderContext) => {
  // Lógica de renderizado para escritorio
};

// Seleccionar función de entrada basada en el tipo de dispositivo
const rc = await esmx.render({
  entryName: isMobile ? 'mobile' : 'desktop',
  params: { url: req.url }
});
```

### params

- **Tipo**: `Record<string, any>`
- **Solo lectura**: `true`
- **Valor por defecto**: `{}`

Parámetros de renderizado. Se pueden pasar y acceder a parámetros durante el proceso de renderizado del lado del servidor, comúnmente utilizados para pasar información de la solicitud, configuración de la página, etc.

```ts
// Uso básico - Pasar URL y configuración de idioma
const rc = await esmx.render({
  params: {
    url: req.url,
    lang: 'zh-CN'
  }
});

// Configuración de página - Establecer tema y diseño
const rc = await esmx.render({
  params: {
    theme: 'dark',
    layout: 'sidebar'
  }
});

// Configuración de entorno - Inyectar URL base de la API
const rc = await esmx.render({
  params: {
    apiBaseUrl: process.env.API_BASE_URL,
    version: '1.0.0'
  }
});
```

### importMetaSet

- **Tipo**: `Set<ImportMeta>`

Conjunto de recopilación de dependencias de módulos. Durante el proceso de renderizado de componentes, se rastrean y registran automáticamente las dependencias de módulos, solo se recopilan los recursos realmente utilizados durante el renderizado de la página actual.

```ts
// Uso básico
const renderToString = (app: any, context: { importMetaSet: Set<ImportMeta> }) => {
  // Durante el proceso de renderizado, se recopilan automáticamente las dependencias de módulos
  // El framework llamará automáticamente a context.importMetaSet.add(import.meta) durante el renderizado de componentes
  // Los desarrolladores no necesitan manejar manualmente la recopilación de dependencias
  return '<div id="app">Hello World</div>';
};

// Ejemplo de uso
const app = createApp();
const html = await renderToString(app, {
  importMetaSet: rc.importMetaSet
});
```

### files

- **Tipo**: `RenderFiles`

Lista de archivos de recursos:
- js: Lista de archivos JavaScript
- css: Lista de archivos de hojas de estilo
- modulepreload: Lista de módulos ESM que necesitan precarga
- resources: Lista de otros archivos de recursos (imágenes, fuentes, etc.)

```ts
// Recopilación de recursos
await rc.commit();

// Inyección de recursos
rc.html = `
  <!DOCTYPE html>
  <html>
  <head>
    <!-- Precargar recursos -->
    ${rc.preload()}
    <!-- Inyectar hojas de estilo -->
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
```

### importmapMode

- **Tipo**: `'inline' | 'js'`
- **Valor por defecto**: `'inline'`

Modo de generación del mapa de importación:
- `inline`: Incluye el contenido del importmap directamente en el HTML
- `js`: Genera el contenido del importmap como un archivo JS independiente


## Métodos de instancia

### serialize()

- **Parámetros**: 
  - `input: any` - Datos a serializar
  - `options?: serialize.SerializeJSOptions` - Opciones de serialización
- **Retorno**: `string`

Serializa un objeto JavaScript a una cadena. Se utiliza para serializar datos de estado durante el proceso de renderizado del lado del servidor, asegurando que los datos se puedan incrustar de manera segura en el HTML.

```ts
const state = {
  user: { id: 1, name: 'Alice' },
  timestamp: new Date()
};

rc.html = `
  <script>
    window.__INITIAL_STATE__ = ${rc.serialize(state)};
  </script>
`;
```

### state()

- **Parámetros**: 
  - `varName: string` - Nombre de la variable
  - `data: Record<string, any>` - Datos de estado
- **Retorno**: `string`

Serializa e inyecta datos de estado en el HTML. Utiliza métodos de serialización seguros para manejar datos, soportando estructuras de datos complejas.

```ts
const userInfo = {
  id: 1,
  name: 'John',
  roles: ['admin']
};

rc.html = `
  <head>
    ${rc.state('__USER__', userInfo)}
  </head>
`;
```

### commit()

- **Retorno**: `Promise<void>`

Confirma la recopilación de dependencias y actualiza la lista de recursos. Recopila todos los módulos utilizados desde importMetaSet, basándose en el archivo manifest para resolver los recursos específicos de cada módulo.

```ts
// Renderizar y confirmar dependencias
const html = await renderToString(app, {
  importMetaSet: rc.importMetaSet
});

// Confirmar recopilación de dependencias
await rc.commit();
```

### preload()

- **Retorno**: `string`

Genera etiquetas de precarga de recursos. Se utiliza para precargar recursos CSS y JavaScript, soporta configuración de prioridades, maneja automáticamente la ruta base.

```ts
rc.html = `
  <!DOCTYPE html>
  <html>
  <head>
    ${rc.preload()}
    ${rc.css()}  <!-- Inyectar hojas de estilo -->
  </head>
  <body>
    ${html}
    ${rc.importmap()}
    ${rc.moduleEntry()}
    ${rc.modulePreload()}
  </body>
  </html>
`;
```

### css()

- **Retorno**: `string`

Genera etiquetas de hojas de estilo CSS. Inyecta los archivos CSS recopilados, asegurando que las hojas de estilo se carguen en el orden correcto.

```ts
rc.html = `
  <head>
    ${rc.css()}  <!-- Inyectar todas las hojas de estilo recopiladas -->
  </head>
`;
```

### importmap()

- **Retorno**: `string`

Genera etiquetas de mapa de importación. Genera el mapa de importación en línea o externo según la configuración de importmapMode.

```ts
rc.html = `
  <head>
    ${rc.importmap()}  <!-- Inyectar mapa de