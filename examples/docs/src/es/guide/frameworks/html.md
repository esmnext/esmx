---
titleSuffix: Ejemplo de aplicación HTML SSR con Gez
description: Aprende a crear una aplicación HTML SSR con Gez desde cero. Este tutorial muestra el uso básico del framework, incluyendo la inicialización del proyecto, configuración de HTML y configuración de archivos de entrada.
head:
  - - meta
    - property: keywords
      content: Gez, HTML, Aplicación SSR, Configuración TypeScript, Inicialización de proyecto, Renderizado en servidor, Interacción en cliente
---

# HTML

Este tutorial te guiará en la creación de una aplicación HTML SSR (Server-Side Rendering) basada en Gez desde cero. A través de un ejemplo completo, mostraremos cómo utilizar el framework Gez para crear una aplicación con renderizado en el servidor.

## Estructura del proyecto

Primero, veamos la estructura básica del proyecto:

```bash
.
├── package.json         # Archivo de configuración del proyecto, define dependencias y comandos de script
├── tsconfig.json        # Archivo de configuración de TypeScript, establece opciones de compilación
└── src                  # Directorio de código fuente
    ├── app.ts           # Componente principal de la aplicación, define la estructura de la página y la lógica de interacción
    ├── create-app.ts    # Fábrica de creación de instancias de la aplicación, responsable de inicializar la aplicación
    ├── entry.client.ts  # Archivo de entrada del cliente, maneja el renderizado en el navegador
    ├── entry.node.ts    # Archivo de entrada del servidor Node.js, responsable de la configuración del entorno de desarrollo y el inicio del servidor
    └── entry.server.ts  # Archivo de entrada del servidor, maneja la lógica de renderizado SSR
```

## Configuración del proyecto

### package.json

Crea el archivo `package.json` para configurar las dependencias y scripts del proyecto:

```json title="package.json"
{
  "name": "ssr-demo-html",
  "version": "1.0.0",
  "type": "module",
  "private": true,
  "scripts": {
    "dev": "gez dev",
    "build": "npm run build:dts && npm run build:ssr",
    "build:ssr": "gez build",
    "preview": "gez preview",
    "start": "NODE_ENV=production node dist/index.js",
    "build:dts": "tsc --declaration --emitDeclarationOnly --outDir dist/src"
  },
  "dependencies": {
    "@gez/core": "*"
  },
  "devDependencies": {
    "@gez/rspack": "*",
    "@types/node": "22.8.6",
    "typescript": "^5.7.3"
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

Esto instalará todos los paquetes necesarios, incluyendo TypeScript y las dependencias relacionadas con SSR.

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
            "ssr-demo-html/src/*": ["./src/*"],
            "ssr-demo-html/*": ["./*"]
        }
    },
    "include": ["src"],
    "exclude": ["dist", "node_modules"]
}
```

## Estructura del código fuente

### app.ts

Crea el componente principal de la aplicación `src/app.ts`, que implementa la estructura de la página y la lógica de interacción:

```ts title="src/app.ts"
/**
 * @file Componente de ejemplo
 * @description Muestra un título de página con la hora actualizada automáticamente, para demostrar las funcionalidades básicas de Gez
 */

export default class App {
    /**
     * Hora actual, en formato ISO
     * @type {string}
     */
    public time = '';

    /**
     * Crea una instancia de la aplicación
     * @param {SsrContext} [ssrContext] - Contexto del servidor, contiene un conjunto de metadatos de importación
     */
    public constructor(public ssrContext?: SsrContext) {
        // No se necesita inicialización adicional en el constructor
    }

    /**
     * Renderiza el contenido de la página
     * @returns {string} Retorna la estructura HTML de la página
     */
    public render(): string {
        // Asegura la correcta recolección de metadatos de importación en el entorno del servidor
        if (this.ssrContext) {
            this.ssrContext.importMetaSet.add(import.meta);
        }

        return `
        <div id="app">
            <h1><a href="https://www.esmnext.com/guide/frameworks/html.html" target="_blank">Inicio rápido con Gez</a></h1>
            <time datetime="${this.time}">${this.time}</time>
        </div>
        `;
    }

    /**
     * Inicialización en el cliente
     * @throws {Error} Lanza un error si no se encuentra el elemento de visualización de la hora
     */
    public onClient(): void {
        // Obtiene el elemento de visualización de la hora
        const time = document.querySelector('#app time');
        if (!time) {
            throw new Error('No se encontró el elemento de visualización de la hora');
        }

        // Establece un temporizador para actualizar la hora cada segundo
        setInterval(() => {
            this.time = new Date().toISOString();
            time.setAttribute('datetime', this.time);
            time.textContent = this.time;
        }, 1000);
    }

    /**
     * Inicialización en el servidor
     */
    public onServer(): void {
        this.time = new Date().toISOString();
    }
}

/**
 * Interfaz del contexto del servidor
 * @interface
 */
export interface SsrContext {
    /**
     * Conjunto de metadatos de importación
     * @type {Set<ImportMeta>}
     */
    importMetaSet: Set<ImportMeta>;
}
```

### create-app.ts

Crea el archivo `src/create-app.ts`, responsable de crear instancias de la aplicación:

```ts title="src/create-app.ts"
/**
 * @file Creación de instancias de la aplicación
 * @description Responsable de crear y configurar instancias de la aplicación
 */

import App from './app';

export function createApp() {
    const app = new App();
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
 * @description Responsable de la lógica de interacción del cliente y actualizaciones dinámicas
 */

import { createApp } from './create-app';

// Crea una instancia de la aplicación y la inicializa
const { app } = createApp();
app.onClient();
```

### entry.node.ts

Crea el archivo `entry.node.ts`, que configura el entorno de desarrollo y el inicio del servidor:

```ts title="src/entry.node.ts"
/**
 * @file Archivo de entrada del servidor Node.js
 * @description Responsable de la configuración del entorno de desarrollo y el inicio del servidor, proporcionando un entorno de ejecución SSR
 */

import http from 'node:http';
import type { GezOptions } from '@gez/core';

export default {
    /**
     * Configura el creador de la aplicación para el entorno de desarrollo
     * @description Crea y configura una instancia de la aplicación Rspack para el entorno de desarrollo, soportando construcción y actualización en caliente
     * @param gez Instancia del framework Gez, proporciona funcionalidades principales e interfaces de configuración
     * @returns Retorna una instancia de la aplicación Rspack configurada, soportando HMR y vista previa en tiempo real
     */
    async devApp(gez) {
        return import('@gez/rspack').then((m) =>
            m.createRspackHtmlApp(gez, {
                config(context) {
                    // Personaliza la configuración de compilación de Rspack aquí
                }
            })
        );
    },

    /**
     * Configura e inicia el servidor HTTP
     * @description Crea una instancia del servidor HTTP, integra middleware de Gez y maneja solicitudes SSR
     * @param gez Instancia del framework Gez, proporciona middleware y funcionalidades de renderizado
     */
    async server(gez) {
        const server = http.createServer((req, res) => {
            // Usa middleware de Gez para manejar solicitudes
            gez.middleware(req, res, async () => {
                // Ejecuta el renderizado en el servidor
                const rc = await gez.render({
                    params: { url: req.url }
                });
                res.end(rc.html);
            });
        });

        server.listen(3000, () => {
            console.log('Servidor iniciado: http://localhost:3000');
        });
    }
} satisfies GezOptions;
```

Este archivo es el punto de entrada para la configuración del entorno de desarrollo y el inicio del servidor, y contiene dos funciones principales:

1. `devApp`: Responsable de crear y configurar una instancia de la aplicación Rspack para el entorno de desarrollo, soportando actualización en caliente y vista previa en tiempo real.
2. `server`: Responsable de crear y configurar un servidor HTTP, integrando middleware de Gez para manejar solicitudes SSR.

### entry.server.ts

Crea el archivo de entrada para el renderizado en el servidor `src/entry.server.ts`:

```ts title="src/entry.server.ts"
/**
 * @file Archivo de entrada para el renderizado en el servidor
 * @description Responsable del flujo de renderizado en el servidor, generación de HTML e inyección de recursos
 */

import type { RenderContext } from '@gez/core';
import type App from './app';
import type { SsrContext } from './app';
import { createApp } from './create-app';

// Encapsula la lógica de generación de contenido de la página
const renderToString = (app: App, ssrContext: SsrContext): string => {
    // Inyecta el contexto de renderizado en el servidor en la instancia de la aplicación
    app.ssrContext = ssrContext;
    // Inicializa el servidor
    app.onServer();

    // Genera el contenido de la página
    return app.render();
};

export default async (rc: RenderContext) => {
    // Crea una instancia de la aplicación, retorna un objeto que contiene la instancia de la aplicación
    const { app } = createApp();
    // Usa renderToString para generar el contenido de la página
    const html = renderToString(app, {
        importMetaSet: rc.importMetaSet
    });

    // Confirma la recolección de dependencias, asegurando que todos los recursos necesarios estén cargados
    await rc.commit();

    // Genera la estructura HTML completa
    rc.html = `<!DOCTYPE html>
<html lang="es">
<head>
    ${rc.preload()}
    <title>Inicio rápido con Gez</title>
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

## Ejecución del proyecto

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

¡Ahora has creado con éxito una aplicación HTML SSR basada en Gez! Visita http://localhost:3000 para ver el resultado.