---
titleSuffix: Motor de construcción de alto rendimiento del framework Esmx
description: Análisis en profundidad del sistema de construcción Rspack del framework Esmx, incluyendo compilación de alto rendimiento, construcción multi-entorno, optimización de recursos y otras características clave, para ayudar a los desarrolladores a construir aplicaciones web modernas eficientes y confiables.
head:
  - - meta
    - property: keywords
      content: Esmx, Rspack, sistema de construcción, compilación de alto rendimiento, actualización en caliente, construcción multi-entorno, Tree Shaking, división de código, SSR, optimización de recursos, eficiencia de desarrollo, herramientas de construcción
---

# Rspack

Esmx se basa en el sistema de construcción [Rspack](https://rspack.dev/), aprovechando al máximo su capacidad de construcción de alto rendimiento. Este documento presenta el posicionamiento y las funciones principales de Rspack en el framework Esmx.

## Características

Rspack es el sistema de construcción central del framework Esmx y ofrece las siguientes características clave:

- **Construcción de alto rendimiento**: Motor de construcción implementado en Rust, proporciona una velocidad de compilación extremadamente rápida, mejorando significativamente la velocidad de construcción de proyectos grandes.
- **Optimización de la experiencia de desarrollo**: Soporta características modernas como actualización en caliente (HMR) y compilación incremental, ofreciendo una experiencia de desarrollo fluida.
- **Construcción multi-entorno**: Configuración de construcción unificada que soporta entornos de cliente (client), servidor (server) y Node.js (node), simplificando el flujo de desarrollo multi-plataforma.
- **Optimización de recursos**: Capacidades integradas de procesamiento y optimización de recursos, soporta características como división de código, Tree Shaking y compresión de recursos.

## Construcción de aplicaciones

El sistema de construcción Rspack de Esmx sigue un diseño modular e incluye los siguientes módulos principales:

### @esmx/rspack

Módulo de construcción básico que proporciona las siguientes capacidades centrales:

- **Configuración de construcción unificada**: Ofrece gestión estandarizada de configuración de construcción, soporta configuración multi-entorno.
- **Procesamiento de recursos**: Capacidades integradas para procesar recursos como TypeScript, CSS, imágenes, etc.
- **Optimización de construcción**: Proporciona características de optimización de rendimiento como división de código y Tree Shaking.
- **Servidor de desarrollo**: Integra un servidor de desarrollo de alto rendimiento con soporte para HMR.

### @esmx/rspack-vue

Módulo de construcción específico para el framework Vue, ofrece:

- **Compilación de componentes Vue**: Soporta compilación eficiente de componentes Vue 2/3.
- **Optimización SSR**: Optimizaciones específicas para escenarios de renderizado del lado del servidor.
- **Mejoras de desarrollo**: Funcionalidades específicas para mejorar el entorno de desarrollo de Vue.

## Flujo de construcción

El flujo de construcción de Esmx se divide principalmente en las siguientes etapas:

1. **Inicialización de configuración**
   - Carga la configuración del proyecto
   - Combina la configuración predeterminada con la del usuario
   - Ajusta la configuración según las variables de entorno

2. **Compilación de recursos**
   - Resuelve las dependencias del código fuente
   - Transforma varios tipos de recursos (TypeScript, CSS, etc.)
   - Procesa importaciones y exportaciones de módulos

3. **Procesamiento de optimización**
   - Ejecuta la división de código
   - Aplica Tree Shaking
   - Comprime código y recursos

4. **Generación de salida**
   - Genera archivos de destino
   - Produce mapas de recursos
   - Genera informes de construcción

## Mejores prácticas

### Optimización del entorno de desarrollo

- **Configuración de compilación incremental**: Configura adecuadamente la opción `cache` para acelerar la velocidad de construcción utilizando la caché.
- **Optimización HMR**: Configura el alcance de la actualización en caliente de manera específica para evitar actualizaciones innecesarias de módulos.
- **Optimización del procesamiento de recursos**: Utiliza configuraciones de loader apropiadas para evitar el procesamiento repetido.

### Optimización del entorno de producción

- **Estrategia de división de código**: Configura adecuadamente `splitChunks` para optimizar la carga de recursos.
- **Compresión de recursos**: Habilita configuraciones de compresión adecuadas para equilibrar el tiempo de construcción y el tamaño de los artefactos.
- **Optimización de caché**: Utiliza estrategias de hash de contenido y caché a largo plazo para mejorar el rendimiento de carga.

## Ejemplo de configuración

```ts title="src/entry.node.ts"
import type { EsmxOptions } from '@esmx/core';

export default {
    async devApp(esmx) {
        return import('@esmx/rspack').then((m) =>
            m.createRspackHtmlApp(esmx, {
                // Configuración de construcción personalizada
                config({ config }) {
                    // Agrega configuraciones personalizadas de Rspack aquí
                }
            })
        );
    },
} satisfies EsmxOptions;
```

::: tip
Para obtener más detalles sobre la API y las opciones de configuración, consulta la [documentación de la API de Rspack](/api/app/rspack.html).
:::