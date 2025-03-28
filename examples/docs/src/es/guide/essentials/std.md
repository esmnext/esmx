---
titleSuffix: Guía de Estructura y Normas del Proyecto del Framework Esmx
description: Descripción detallada de la estructura estándar del proyecto, normas de archivos de entrada y configuración del framework Esmx, para ayudar a los desarrolladores a construir aplicaciones SSR normalizadas y mantenibles.
head:
  - - meta
    - property: keywords
      content: Esmx, Estructura del Proyecto, Archivos de Entrada, Normas de Configuración, Framework SSR, TypeScript, Normas del Proyecto, Estándares de Desarrollo
---

# Normas Estándar

Esmx es un framework SSR moderno que adopta una estructura de proyecto estandarizada y un mecanismo de resolución de rutas para garantizar la consistencia y mantenibilidad del proyecto en entornos de desarrollo y producción.

## Normas de Estructura del Proyecto

### Estructura de Directorios Estándar

```txt
root
│─ dist                  # Directorio de salida de compilación
│  ├─ package.json       # Configuración del paquete después de la compilación
│  ├─ server             # Salida de compilación del servidor
│  │  └─ manifest.json   # Salida del manifiesto de compilación, utilizado para generar importmap
│  ├─ node               # Salida de compilación del programa del servidor Node
│  ├─ client             # Salida de compilación del cliente
│  │  ├─ versions        # Directorio de almacenamiento de versiones
│  │  │  └─ latest.tgz   # Archivo comprimido del directorio dist, para distribución del paquete
│  │  └─ manifest.json   # Salida del manifiesto de compilación, utilizado para generar importmap
│  └─ src                # Archivos generados por tsc
├─ src
│  ├─ entry.server.ts    # Punto de entrada de la aplicación del servidor
│  ├─ entry.client.ts    # Punto de entrada de la aplicación del cliente
│  └─ entry.node.ts      # Punto de entrada de la aplicación del servidor Node
├─ tsconfig.json         # Configuración de TypeScript
└─ package.json          # Configuración del paquete
```

::: tip Conocimiento Adicional
- `esmx.name` proviene del campo `name` en `package.json`
- `dist/package.json` proviene del `package.json` en el directorio raíz
- El directorio `dist` se archiva solo cuando `packs.enable` está configurado como `true`

:::

## Normas de Archivos de Entrada

### entry.client.ts
El archivo de entrada del cliente es responsable de:
- **Inicializar la aplicación**: Configurar los ajustes básicos de la aplicación del cliente
- **Gestión de rutas**: Manejar las rutas y navegación del cliente
- **Gestión de estado**: Implementar el almacenamiento y actualización del estado del cliente
- **Manejo de interacciones**: Gestionar eventos del usuario e interacciones de la interfaz

### entry.server.ts
El archivo de entrada del servidor es responsable de:
- **Renderizado del servidor**: Ejecutar el proceso de renderizado SSR
- **Generación de HTML**: Construir la estructura inicial de la página
- **Precarga de datos**: Manejar la obtención de datos en el servidor
- **Inyección de estado**: Transferir el estado del servidor al cliente
- **Optimización SEO**: Asegurar la optimización del motor de búsqueda de la página

### entry.node.ts
El archivo de entrada del servidor Node.js es responsable de:
- **Configuración del servidor**: Establecer los parámetros del servidor HTTP
- **Manejo de rutas**: Gestionar las reglas de rutas del servidor
- **Integración de middleware**: Configurar middleware del servidor
- **Gestión del entorno**: Manejar variables de entorno y configuraciones
- **Respuesta a solicitudes**: Manejar solicitudes y respuestas HTTP

## Normas de Archivos de Configuración

### package.json

```json title="package.json"
{
    "name": "your-app-name",
    "type": "module",
    "scripts": {
        "dev": "esmx dev",
        "build": "npm run build:dts && npm run build:ssr",
        "build:ssr": "esmx build",
        "build:dts": "tsc --declaration --emitDeclarationOnly --outDir dist/src",
        "preview": "esmx preview",
        "start": "NODE_ENV=production node dist/index.js"
    }
}
```

### tsconfig.json

```json title="tsconfig.json"
{
    "compilerOptions": {
        "isolatedModules": true,
        "allowJs": false,
        "experimentalDecorators": true,
        "resolveJsonModule": true,
        "types": [
            "@types/node"
        ],
        "target": "ESNext",
        "module": "ESNext",
        "importHelpers": false,
        "declaration": true,
        "sourceMap": true,
        "strict": true,
        "noImplicitAny": false,
        "noImplicitReturns": false,
        "noFallthroughCasesInSwitch": true,
        "noUnusedLocals": false,
        "noUnusedParameters": false,
        "moduleResolution": "node",
        "esModuleInterop": true,
        "skipLibCheck": true,
        "allowSyntheticDefaultImports": true,
        "forceConsistentCasingInFileNames": true,
        "noEmit": true
    },
    "include": [
        "src",
        "**.ts"
    ],
    "exclude": [
        "dist"
    ]
}
```