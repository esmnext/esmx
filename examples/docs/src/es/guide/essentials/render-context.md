---
titleSuffix: Mecanismo central de renderizado del lado del servidor en el framework Esmx
description: Explicación detallada del mecanismo de contexto de renderizado (RenderContext) en el framework Esmx, incluyendo la gestión de recursos, generación de HTML y el sistema de módulos ESM, para ayudar a los desarrolladores a comprender y utilizar la funcionalidad de renderizado del lado del servidor.
head:
  - - meta
    - property: keywords
      content: Esmx, contexto de renderizado, RenderContext, SSR, renderizado del lado del servidor, ESM, gestión de recursos
---

# Contexto de Renderizado

RenderContext es una clase central en el framework Esmx, responsable principalmente de la gestión de recursos y la generación de HTML durante el proceso de renderizado del lado del servidor (SSR). Cuenta con las siguientes características principales:

1. **Sistema de módulos basado en ESM**
   - Utiliza el estándar moderno de ECMAScript Modules
   - Soporta importación y exportación nativa de módulos
   - Implementa una mejor división de código y carga bajo demanda

2. **Recolección inteligente de dependencias**
   - Recolecta dependencias dinámicamente basándose en la ruta de renderizado real
   - Evita la carga innecesaria de recursos
   - Soporta componentes asíncronos e importación dinámica

3. **Inyección precisa de recursos**
   - Controla estrictamente el orden de carga de recursos
   - Optimiza el rendimiento de carga de la primera pantalla
   - Garantiza la fiabilidad de la activación del cliente (Hydration)

4. **Mecanismo de configuración flexible**
   - Soporta configuración dinámica de rutas base
   - Proporciona múltiples modos de mapeo de importación
   - Se adapta a diferentes escenarios de despliegue

## Modo de uso

En el framework Esmx, los desarrolladores generalmente no necesitan crear instancias de RenderContext directamente, sino que pueden obtener una instancia a través del método `esmx.render()`:

```ts title="src/entry.node.ts"
async server(esmx) {
    const server = http.createServer((req, res) => {
        // Manejo de archivos estáticos
        esmx.middleware(req, res, async () => {
            // Obtener una instancia de RenderContext a través de esmx.render()
            const rc = await esmx.render({
                params: {
                    url: req.url
                }
            });
            // Responder con el contenido HTML
            res.end(rc.html);
        });
    });
}
```

## Funcionalidades principales

### Recolección de dependencias

RenderContext implementa un mecanismo inteligente de recolección de dependencias, que se basa en los componentes renderizados realmente para recolectar dependencias dinámicamente, en lugar de precargar simplemente todos los recursos posibles:

#### Recolección bajo demanda
- Rastrea y registra automáticamente las dependencias de módulos durante el proceso de renderizado de componentes
- Solo recolecta los recursos CSS, JavaScript, etc., que realmente se utilizan en la renderización de la página actual
- Registra con precisión las relaciones de dependencia de módulos de cada componente a través de `importMetaSet`
- Soporta la recolección de dependencias de componentes asíncronos e importación dinámica

#### Procesamiento automático
- Los desarrolladores no necesitan gestionar manualmente el proceso de recolección de dependencias
- El framework recolecta automáticamente la información de dependencias durante el renderizado de componentes
- Procesa todos los recursos recolectados a través del método `commit()`
- Maneja automáticamente problemas de dependencias circulares y repetidas

#### Optimización de rendimiento
- Evita la carga de módulos no utilizados, reduciendo significativamente el tiempo de carga de la primera pantalla
- Controla con precisión el orden de carga de recursos, optimizando el rendimiento de renderizado de la página
- Genera automáticamente un mapeo de importación (Import Map) óptimo
- Soporta estrategias de precarga y carga bajo demanda de recursos

### Inyección de recursos

RenderContext proporciona múltiples métodos para inyectar diferentes tipos de recursos, cada uno diseñado cuidadosamente para optimizar el rendimiento de carga de recursos:

- `preload()`: Precarga recursos CSS y JS, soporta configuración de prioridad
- `css()`: Inyecta hojas de estilo para la primera pantalla, soporta extracción de CSS crítico
- `importmap()`: Inyecta mapeo de importación de módulos, soporta resolución dinámica de rutas
- `moduleEntry()`: Inyecta el módulo de entrada del cliente, soporta configuración de múltiples entradas
- `modulePreload()`: Precarga dependencias de módulos, soporta estrategias de carga bajo demanda

### Orden de inyección de recursos

RenderContext controla estrictamente el orden de inyección de recursos, un diseño basado en el funcionamiento del navegador y consideraciones de optimización de rendimiento:

1. Parte head:
   - `preload()`: Precarga recursos CSS y JS, permitiendo que el navegador los descubra y comience a cargarlos lo antes posible
   - `css()`: Inyecta hojas de estilo para la primera pantalla, asegurando que los estilos de la página estén listos cuando se renderice el contenido

2. Parte body:
   - `importmap()`: Inyecta mapeo de importación de módulos, definiendo las reglas de resolución de rutas para módulos ESM
   - `moduleEntry()`: Inyecta el módulo de entrada del cliente, debe ejecutarse después de importmap
   - `modulePreload()`: Precarga dependencias de módulos, debe ejecutarse después de importmap

## Flujo completo de renderizado

Un flujo típico de uso de RenderContext es el siguiente:

```ts title="src/entry.server.ts"
export default async (rc: RenderContext) => {
    // 1. Renderizar el contenido de la página y recolectar dependencias
    const app = createApp();
    const html = await renderToString(app, {
       importMetaSet: rc.importMetaSet
    });

    // 2. Confirmar la recolección de dependencias
    await rc.commit();
    
    // 3. Generar HTML completo
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

## Características avanzadas

### Configuración de ruta base

RenderContext proporciona un mecanismo flexible de configuración dinámica de rutas base, que permite establecer dinámicamente la ruta base de los recursos estáticos en tiempo de ejecución:

```ts title="src/entry.node.ts"
const rc = await esmx.render({
    base: '/esmx',  // Establecer la ruta base
    params: {
        url: req.url
    }
});
```

Este mecanismo es especialmente útil en los siguientes escenarios:

1. **Despliegue de sitios multilingües**
   ```
   dominio-principal.com      → Idioma predeterminado
   dominio-principal.com/cn/  → Sitio en chino
   dominio-principal.com/en/  → Sitio en inglés
   ```

2. **Aplicaciones de microfrontends**
   - Soporta el despliegue flexible de subaplicaciones en diferentes rutas
   - Facilita la integración en diferentes aplicaciones principales

### Modos de mapeo de importación

RenderContext proporciona dos modos de mapeo de importación (Import Map):

1. **Modo Inline** (predeterminado)
   - Incluye el mapeo de importación directamente en el HTML
   - Adecuado para aplicaciones pequeñas, reduce solicitudes de red adicionales
   - Disponible inmediatamente al cargar la página

2. **Modo JS**
   - Carga el mapeo de importación a través de un archivo JavaScript externo
   - Adecuado para aplicaciones grandes, permite aprovechar el mecanismo de caché del navegador
   - Soporta actualización dinámica del contenido del mapeo

Puede elegir el modo adecuado mediante configuración:

```ts title="src/entry.node.ts"
const rc = await esmx.render({
    importmapMode: 'js',  // 'inline' | 'js'
    params: {
        url: req.url
    }
});
```

### Configuración de función de entrada

RenderContext soporta la configuración de `entryName` para especificar la función de entrada para el renderizado del lado del servidor:

```ts title="src/entry.node.ts"
const rc = await esmx.render({
    entryName: 'mobile',  // Especificar la función de entrada para móviles
    params: {
        url: req.url
    }
});
```

Este mecanismo es especialmente útil en los siguientes escenarios:

1. **Renderizado de múltiples plantillas**
   ```ts title="src/entry.server.ts"
   // Función de entrada para móviles
   export const mobile = async (rc: RenderContext) => {
       // Lógica de renderizado específica para móviles
   };

   // Función de entrada para escritorio
   export const desktop = async (rc: RenderContext) => {
       // Lógica de renderizado específica para escritorio
   };
   ```

2. **Pruebas A/B**
   - Soporta el uso de diferentes lógicas de renderizado para la misma página
   - Facilita la experimentación con la experiencia del usuario
   - Permite cambiar flexiblemente entre diferentes estrategias de renderizado

3. **Requerimientos especiales de renderizado**
   - Soporta el uso de flujos de renderizado personalizados para ciertas páginas
   - Se adapta a las necesidades de optimización de rendimiento en diferentes escenarios
   - Permite un control más fino del renderizado

## Mejores prácticas

1. **Obtener una instancia de RenderContext**
   - Siempre obtener la instancia a través del método `esmx.render()`
   - Pasar los parámetros adecuados según sea necesario
   - Evitar la creación manual de instancias

2. **Recolección de dependencias**
   - Asegurarse de que todos los módulos llamen correctamente a `importMetaSet.add(import.meta)`
   - Llamar al método `commit()` inmediatamente después de completar el renderizado
   - Utilizar componentes asíncronos e importación dinámica para optimizar la carga de la primera pantalla

3. **Inyección de recursos**
   - Seguir estrictamente el orden de inyección de recursos
   - No inyectar CSS en el body
   - Asegurarse de que importmap esté antes de moduleEntry

4. **Optimización de rendimiento**
   - Utilizar preload para precargar recursos críticos
   - Usar modulePreload adecuadamente para optimizar la carga de módulos
   - Evitar la carga innecesaria de recursos
   - Aprovechar el mecanismo de caché del navegador para optimizar el rendimiento de carga