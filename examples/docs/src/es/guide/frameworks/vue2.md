---
titleSuffix: Ejemplo de aplicación Vue2 SSR con el framework Esmx
description: Crea una aplicación Vue2 SSR basada en Esmx desde cero. Este tutorial muestra el uso básico del framework, incluyendo la inicialización del proyecto, configuración de Vue2 y configuración de archivos de entrada.
head:
  - - meta
    - property: keywords
      content: Esmx, Vue2, Aplicación SSR, Configuración TypeScript, Inicialización de proyecto, Renderizado en el servidor, Interacción en el cliente
---

# Vue2

Este tutorial te guiará en la creación de una aplicación Vue2 SSR basada en Esmx desde cero. A través de un ejemplo completo, mostraremos cómo utilizar el framework Esmx para crear una aplicación con renderizado en el servidor (SSR).

## Estructura del proyecto

Primero, veamos la estructura básica del proyecto:

```bash
.
├── package.json         # Archivo de configuración del proyecto, define dependencias y comandos de script
├── tsconfig.json        # Archivo de configuración de TypeScript, establece opciones de compilación
└── src                  # Directorio de código fuente
    ├── app.vue          # Componente principal de la aplicación, define la estructura y lógica de interacción de la página
    ├── create-app.ts    # Fábrica de creación de instancias de Vue, responsable de inicializar la aplicación
    ├── entry.client.ts  # Archivo de entrada del cliente, maneja el renderizado en el navegador
    ├── entry.node.ts    # Archivo de entrada del servidor Node.js, responsable de la configuración del entorno de desarrollo y el inicio del servidor
    └── entry.server.ts  # Archivo de entrada del servidor, maneja la lógica de renderizado SSR
```

## Configuración del proyecto

### package.json

Crea el archivo `package.json` para configurar las dependencias y scripts del proyecto:

```json title="package.json"
{
  "name": "ssr-demo-vue2",
  "version": "1.0.0",
  "type": "module",
  "private": true,
  "scripts": {
    "dev": "esmx dev",
    "build": "npm run build:dts && npm run build:ssr",
    "build:ssr": "esmx build",
    "preview": "esmx preview",
    "start": "NODE_ENV=production node dist/index.js",
    "build:dts": "vue-tsc --declaration --emitDeclarationOnly --outDir dist/src"
  },
  "dependencies": {
    "@esmx/core": "*"
  },
  "devDependencies": {
    "@esmx/rspack-vue": "*",
    "@types/node": "22.8.6",
    "typescript": "^5.7.3",
    "vue": "^2.7.16",
    "vue-server-renderer": "^2.7.16",
    "vue-tsc": "^2.1.6"
  }
}
```

Después de crear el archivo `package.json`, necesitas instalar las dependencias del proyecto. Puedes usar cualquiera de los siguientes comandos para instalarlas:
```bash
pnpm install
# o
yarn install
# o
npm install
```

Esto instalará todos los paquetes necesarios, incluyendo Vue2, TypeScript y las dependencias relacionadas con SSR.

### tsconfig.json

Crea el archivo `tsconfig.json` para configurar las opciones de compilación de TypeScript:

```json title="tsconfig.json"
{
    "compilerOptions": {
        "module": "ESNext",
        "moduleResolution": "node",
        "isolatedModules": true,
        "resolveJsonModule": true,
        
        "target": "ESNext",
        "lib": ["ESNext", "DOM"],
        
        "strict": true,
        "skipLibCheck": true,
        "types": ["@types/node"],
        
        "experimentalDecorators": true,
        "allowSyntheticDefaultImports": true,
        
        "baseUrl": ".",
        "paths": {
            "ssr-demo-vue2/src/*": ["./src/*"],
            "ssr-demo-vue2/*": ["./*"]
        }
    },
    "include": ["src"],
    "exclude": ["dist", "node_modules"]
}
```

## Estructura del código fuente

### app.vue

Crea el componente principal de la aplicación `src/app.vue`, utilizando la sintaxis `<script setup>`:

```html title="src/app.vue"
<template>
    <div id="app">
        <h1><a href="https://www.esmnext.com/guide/frameworks/vue2.html" target="_blank">Inicio rápido con Esmx</a></h1>
        <time :datetime="time">{{ time }}</time>
    </div>
</template>

<script setup lang="ts">
/**
 * @file Componente de ejemplo
 * @description Muestra un título de página con la hora actualizada automáticamente, para demostrar las funciones básicas del framework Esmx
 */

import { onMounted, onUnmounted, ref } from 'vue';

// Hora actual, actualizada cada segundo
const time = ref(new Date().toISOString());
let timer: NodeJS.Timeout;

onMounted(() => {
    timer = setInterval(() => {
        time.value = new Date().toISOString();
    }, 1000);
});

onUnmounted(() => {
    clearInterval(timer);
});
</script>
```

### create-app.ts

Crea el archivo `src/create-app.ts`, responsable de crear la instancia de la aplicación Vue:

```ts title="src/create-app.ts"
/**
 * @file Creación de instancia de Vue
 * @description Responsable de crear y configurar la instancia de la aplicación Vue
 */

import Vue from 'vue';
import App from './app.vue';

export function createApp() {
    const app = new Vue({
        render: (h) => h(App)
    });
    return {
        app
    };
}
```

### entry.client.ts

Crea el archivo de entrada del cliente `src/entry.client.ts`:

```ts title="src/entry.client.ts"
/**
 * @file Archivo de entrada del cliente
 * @description Responsable de la lógica de interacción del cliente y actualización dinámica
 */

import { createApp } from './create-app';

// Crear instancia de Vue
const { app } = createApp();

// Montar la instancia de Vue
app.$mount('#app');
```

### entry.node.ts

Crea el archivo `entry.node.ts`, responsable de la configuración del entorno de desarrollo y el inicio del servidor:

```ts title="src/entry.node.ts"
/**
 * @file Archivo de entrada del servidor Node.js
 * @description Responsable de la configuración del entorno de desarrollo y el inicio del servidor, proporcionando el entorno de ejecución SSR
 */

import http from 'node:http';
import type { EsmxOptions } from '@esmx/core';

export default {
    /**
     * Configura el creador de la aplicación para el entorno de desarrollo
     * @description Crea y configura la instancia de la aplicación Rspack, utilizada para la construcción y actualización en caliente en el entorno de desarrollo
     * @param esmx Instancia del framework Esmx, proporciona funciones principales e interfaces de configuración
     * @returns Devuelve la instancia de la aplicación Rspack configurada, compatible con HMR y vista previa en tiempo real
     */
    async devApp(esmx) {
        return import('@esmx/rspack-vue').then((m) =>
            m.createRspackVue2App(esmx, {
                config(context) {
                    // Personaliza la configuración de compilación de Rspack aquí
                }
            })
        );
    },

    /**
     * Configura e inicia el servidor HTTP
     * @description Crea una instancia del servidor HTTP, integra middleware de Esmx y maneja solicitudes SSR
     * @param esmx Instancia del framework Esmx, proporciona middleware y funciones de renderizado
     */
    async server(esmx) {
        const server = http.createServer((req, res) => {
            // Usar middleware de Esmx para manejar solicitudes
            esmx.middleware(req, res, async () => {
                // Ejecutar renderizado en el servidor
                const rc = await esmx.render({
                    params: { url: req.url }
                });
                res.end(rc.html);
            });
        });

        server.listen(3000, () => {
            console.log('Servidor iniciado: http://localhost:3000');
        });
    }
} satisfies EsmxOptions;
```

Este archivo es el punto de entrada para la configuración del entorno de desarrollo y el inicio del servidor, y contiene dos funciones principales:

1. `devApp`: Responsable de crear y configurar la instancia de la aplicación Rspack para el entorno de desarrollo, compatible con actualización en caliente y vista previa en tiempo real. Aquí se utiliza `createRspackVue2App` para crear una instancia de la aplicación Rspack específica para Vue2.
2. `server`: Responsable de crear y configurar el servidor HTTP, integrando middleware de Esmx para manejar solicitudes SSR.

### entry.server.ts

Crea el archivo de entrada para el renderizado en el servidor `src/entry.server.ts`:

```ts title="src/entry.server.ts"
/**
 * @file Archivo de entrada para el renderizado en el servidor
 * @description Responsable del flujo de renderizado SSR, generación de HTML e inyección de recursos
 */

import type { RenderContext } from '@esmx/core';
import { createRenderer } from 'vue-server-renderer';
import { createApp } from './create-app';

// Crear renderizador
const renderer = createRenderer();

export default async (rc: RenderContext) => {
    // Crear instancia de la aplicación Vue
    const { app } = createApp();

    // Usar renderToString de Vue para generar el contenido de la página
    const html = await renderer.renderToString(app, {
        importMetaSet: rc.importMetaSet
    });

    // Confirmar la recolección de dependencias, asegurando que todos los recursos necesarios se carguen
    await rc.commit();

    // Generar la estructura HTML completa
    rc.html = `<!DOCTYPE html>
<html lang="es-ES">
<head>
    ${rc.preload()}
    <title>Inicio rápido con Esmx</title>
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

## Ejecutar el proyecto

Después de configurar los archivos anteriores, puedes usar los siguientes comandos para ejecutar el proyecto:

1. Modo de desarrollo:
```bash
npm run dev
```

2. Construir el proyecto:
```bash
npm run build
```

3. Ejecutar en producción:
```bash
npm run start
```

¡Ahora has creado con éxito una aplicación Vue2 SSR basada en Esmx! Visita http://localhost:3000 para ver el resultado.