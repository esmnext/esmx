---
titleSuffix: Ejemplo de aplicación SSR con Esmx, Preact y HTM
description: Aprende a crear una aplicación SSR con Preact+HTM desde cero utilizando el framework Esmx. Este tutorial cubre la inicialización del proyecto, configuración de Preact y configuración de archivos de entrada.
head:
  - - meta
    - property: keywords
      content: Esmx, Preact, HTM, Aplicación SSR, Configuración TypeScript, Inicialización de proyecto, Renderizado en el servidor, Interacción en el cliente
---

# Preact+HTM

Este tutorial te guiará en la creación de una aplicación SSR con Preact+HTM utilizando el framework Esmx. A través de un ejemplo completo, mostraremos cómo usar Esmx para crear una aplicación con renderizado en el servidor.

## Estructura del proyecto

Primero, veamos la estructura básica del proyecto:

```bash
.
├── package.json         # Archivo de configuración del proyecto, define dependencias y comandos de scripts
├── tsconfig.json        # Archivo de configuración de TypeScript, establece opciones de compilación
└── src                  # Directorio de código fuente
    ├── app.ts           # Componente principal de la aplicación, define la estructura y lógica de la página
    ├── create-app.ts    # Fábrica de creación de instancias de la aplicación, responsable de la inicialización
    ├── entry.client.ts  # Archivo de entrada del cliente, maneja el renderizado en el navegador
    ├── entry.node.ts    # Archivo de entrada del servidor Node.js, configura el entorno de desarrollo y arranca el servidor
    └── entry.server.ts  # Archivo de entrada del servidor, maneja la lógica de renderizado SSR
```

## Configuración del proyecto

### package.json

Crea el archivo `package.json` para configurar las dependencias y scripts del proyecto:

```json title="package.json"
{
  "name": "ssr-demo-preact-htm",
  "version": "1.0.0",
  "type": "module",
  "private": true,
  "scripts": {
    "dev": "esmx dev",
    "build": "npm run build:dts && npm run build:ssr",
    "build:ssr": "esmx build",
    "preview": "esmx preview",
    "start": "NODE_ENV=production node dist/index.js",
    "build:dts": "tsc --declaration --emitDeclarationOnly --outDir dist/src"
  },
  "dependencies": {
    "@esmx/core": "*"
  },
  "devDependencies": {
    "@esmx/rspack": "*",
    "@types/node": "22.8.6",
    "htm": "^3.1.1",
    "preact": "^10.26.2",
    "preact-render-to-string": "^6.5.13",
    "typescript": "^5.2.2"
  }
}
```

Después de crear el archivo `package.json`, instala las dependencias del proyecto. Puedes usar cualquiera de los siguientes comandos:
```bash
pnpm install
# o
yarn install
# o
npm install
```

Esto instalará todos los paquetes necesarios, incluyendo Preact, HTM, TypeScript y las dependencias relacionadas con SSR.

### tsconfig.json

Crea el archivo `tsconfig.json` para configurar las opciones de compilación de TypeScript:

```json title="tsconfig.json"
{
    "compilerOptions": {
        "isolatedModules": true,
        "experimentalDecorators": true,
        "resolveJsonModule": true,
        "types": [
            "@types/node"
        ],
        "target": "ESNext",
        "module": "ESNext",
        "moduleResolution": "node",
        "strict": true,
        "skipLibCheck": true,
        "allowSyntheticDefaultImports": true,
        "paths": {
            "ssr-demo-preact-htm/src/*": [
                "./src/*"
            ],
            "ssr-demo-preact-htm/*": [
                "./*"
            ]
        }
    },
    "include": [
        "src"
    ],
    "exclude": [
        "dist"
    ]
}
```

## Estructura del código fuente

### app.ts

Crea el componente principal de la aplicación en `src/app.ts`, utilizando componentes de clase de Preact y HTM:

```ts title="src/app.ts"
/**
 * @file Componente de ejemplo
 * @description Muestra un título de página con la hora actualizada automáticamente, para demostrar las funciones básicas de Esmx
 */

import { Component } from 'preact';
import { html } from 'htm/preact';

export default class App extends Component {
    state = {
        time: new Date().toISOString()
    };

    timer: NodeJS.Timeout | null = null;

    componentDidMount() {
        this.timer = setInterval(() => {
            this.setState({
                time: new Date().toISOString()
            });
        }, 1000);
    }

    componentWillUnmount() {
        if (this.timer) {
            clearInterval(this.timer);
        }
    }

    render() {
        const { time } = this.state;
        return html`
            <div>
                <h1><a href="https://www.esmnext.com/guide/frameworks/preact-htm.html" target="_blank">Inicio rápido con Esmx</a></h1>
                <time datetime=${time}>${time}</time>
            </div>
        `;
    }
}
```

### create-app.ts

Crea el archivo `src/create-app.ts`, responsable de crear la instancia de la aplicación:

```ts title="src/create-app.ts"
/**
 * @file Creación de instancia de la aplicación
 * @description Responsable de crear y configurar la instancia de la aplicación
 */

import type { VNode } from 'preact';
import { html } from 'htm/preact';
import App from './app';

export function createApp(): { app: VNode } {
    const app = html`<${App} />`;
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

import { render } from 'preact';
import { createApp } from './create-app';

// Crear instancia de la aplicación
const { app } = createApp();

// Montar la instancia de la aplicación
render(app, document.getElementById('app')!);
```

### entry.node.ts

Crea el archivo `entry.node.ts` para configurar el entorno de desarrollo y arrancar el servidor:

```ts title="src/entry.node.ts"
/**
 * @file Archivo de entrada del servidor Node.js
 * @description Responsable de la configuración del entorno de desarrollo y arranque del servidor, proporciona el entorno de ejecución SSR
 */

import http from 'node:http';
import type { EsmxOptions } from '@esmx/core';

export default {
    /**
     * Configura el creador de la aplicación para el entorno de desarrollo
     * @description Crea y configura la instancia de la aplicación Rspack, utilizada para la construcción y actualización en caliente en el entorno de desarrollo
     * @param esmx Instancia del framework Esmx, proporciona funciones principales y interfaces de configuración
     * @returns Devuelve la instancia de la aplicación Rspack configurada, compatible con HMR y vista previa en tiempo real
     */
    async devApp(esmx) {
        return import('@esmx/rspack').then((m) =>
            m.createRspackHtmlApp(esmx, {
                config(context) {
                    // Personaliza la configuración de compilación de Rspack aquí
                }
            })
        );
    },

    /**
     * Configura y arranca el servidor HTTP
     * @description Crea una instancia del servidor HTTP, integra middleware de Esmx y maneja solicitudes SSR
     * @param esmx Instancia del framework Esmx, proporciona middleware y funciones de renderizado
     */
    async server(esmx) {
        const server = http.createServer((req, res) => {
            // Usar middleware de Esmx para manejar la solicitud
            esmx.middleware(req, res, async () => {
                // Ejecutar el renderizado en el servidor
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

Este archivo es el punto de entrada para la configuración del entorno de desarrollo y el arranque del servidor, y contiene dos funciones principales:

1. `devApp`: Responsable de crear y configurar la instancia de la aplicación Rspack para el entorno de desarrollo, compatible con actualización en caliente y vista previa en tiempo real.
2. `server`: Responsable de crear y configurar el servidor HTTP, integrando middleware de Esmx para manejar solicitudes SSR.

### entry.server.ts

Crea el archivo de entrada para el renderizado en el servidor `src/entry.server.ts`:

```ts title="src/entry.server.ts"
/**
 * @file Archivo de entrada para el renderizado en el servidor
 * @description Responsable del flujo de renderizado SSR, generación de HTML e inyección de recursos
 */

import type { RenderContext } from '@esmx/core';
import type { VNode } from 'preact';
import { render } from 'preact-render-to-string';
import { createApp } from './create-app';

export default async (rc: RenderContext) => {
    // Crear instancia de la aplicación
    const { app } = createApp();

    // Usar renderToString de Preact para generar el contenido de la página
    const html = render(app);

    // Confirmar la recolección de dependencias, asegurando que todos los recursos necesarios se carguen
    await rc.commit();

    // Generar la estructura HTML completa
    rc.html = `<!DOCTYPE html>
<html lang="es">
<head>
    ${rc.preload()}
    <title>Inicio rápido con Esmx</title>
    ${rc.css()}
</head>
<body>
    <div id="app">${html}</div>
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

¡Ahora has creado con éxito una aplicación SSR con Preact+HTM utilizando el framework Esmx! Visita http://localhost:3000 para ver el resultado.