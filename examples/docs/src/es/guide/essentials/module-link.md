---
titleSuffix: Mecanismo de compartición de código entre servicios en el marco Gez
description: Explicación detallada del mecanismo de enlace de módulos en el marco Gez, incluyendo la compartición de código entre servicios, gestión de dependencias e implementación de la especificación ESM, para ayudar a los desarrolladores a construir aplicaciones de microfrontend eficientes.
head:
  - - meta
    - property: keywords
      content: Gez, enlace de módulos, Module Link, ESM, compartición de código, gestión de dependencias, microfrontend
---

# Enlace de Módulos

El marco Gez proporciona un mecanismo completo de enlace de módulos para gestionar la compartición de código y las dependencias entre servicios. Este mecanismo se basa en la especificación ESM (ECMAScript Module) y admite la exportación e importación de módulos a nivel de código fuente, así como una gestión completa de dependencias.

### Conceptos Clave

#### Exportación de Módulos
La exportación de módulos es el proceso de exponer unidades de código específicas (como componentes, funciones de utilidad, etc.) de un servicio en formato ESM. Se admiten dos tipos de exportación:
- **Exportación de código fuente**: Exporta directamente los archivos de código fuente del proyecto
- **Exportación de dependencias**: Exporta paquetes de dependencias de terceros utilizados en el proyecto

#### Enlace de Módulos
La importación de módulos es el proceso de referenciar unidades de código exportadas por otros servicios en un servicio. Se admiten múltiples métodos de instalación:
- **Instalación de código fuente**: Adecuado para entornos de desarrollo, admite modificaciones en tiempo real y actualización en caliente
- **Instalación de paquetes**: Adecuado para entornos de producción, utiliza directamente los artefactos de construcción

## Exportación de Módulos

### Configuración

Configure los módulos a exportar en `entry.node.ts`:

```ts title="src/entry.node.ts"
import type { GezOptions } from '@gez/core';

export default {
    modules: {
        exports: [
            // Exportar archivos de código fuente
            'root:src/components/button.vue',  // Componente Vue
            'root:src/utils/format.ts',        // Función de utilidad
            // Exportar dependencias de terceros
            'npm:vue',                         // Marco Vue
            'npm:vue-router'                   // Vue Router
        ]
    }
} satisfies GezOptions;
```

La configuración de exportación admite dos tipos:
- `root:*`: Exporta archivos de código fuente, la ruta es relativa al directorio raíz del proyecto
- `npm:*`: Exporta dependencias de terceros, especifica directamente el nombre del paquete

## Importación de Módulos

### Configuración

Configure los módulos a importar en `entry.node.ts`:

```ts title="src/entry.node.ts"
import type { GezOptions } from '@gez/core';

export default {
    modules: {
        // Configuración de enlaces
        links: {
            // Instalación de código fuente: apunta al directorio de artefactos de construcción
            'ssr-remote': 'root:./node_modules/ssr-remote/dist',
            // Instalación de paquetes: apunta al directorio del paquete
            'other-remote': 'root:./node_modules/other-remote'
        },
        // Configuración de mapeo de importaciones
        imports: {
            // Usar dependencias de módulos remotos
            'vue': 'ssr-remote/npm/vue',
            'vue-router': 'ssr-remote/npm/vue-router'
        }
    }
} satisfies GezOptions;
```

Explicación de las opciones de configuración:
1. **imports**: Configura las rutas locales de los módulos remotos
   - Instalación de código fuente: apunta al directorio de artefactos de construcción (dist)
   - Instalación de paquetes: apunta directamente al directorio del paquete

2. **externals**: Configura dependencias externas
   - Para compartir dependencias de módulos remotos
   - Evita empaquetar dependencias duplicadas
   - Admite compartir dependencias entre múltiples módulos

### Métodos de Instalación

#### Instalación de Código Fuente
Adecuado para entornos de desarrollo, admite modificaciones en tiempo real y actualización en caliente.

1. **Método Workspace**
Recomendado para proyectos Monorepo:
```ts title="package.json"
{
    "devDependencies": {
        "ssr-remote": "workspace:*"
    }
}
```

2. **Método Link**
Para depuración local:
```ts title="package.json"
{
    "devDependencies": {
        "ssr-remote": "link:../ssr-remote"
    }
}
```

#### Instalación de Paquetes
Adecuado para entornos de producción, utiliza directamente los artefactos de construcción.

1. **Registro NPM**
Instalación a través del registro npm:
```ts title="package.json"
{
    "dependencies": {
        "ssr-remote": "^1.0.0"
    }
}
```

2. **Servidor Estático**
Instalación a través del protocolo HTTP/HTTPS:
```ts title="package.json"
{
    "dependencies": {
        "ssr-remote": "https://cdn.example.com/ssr-remote/1.0.0.tgz"
    }
}
```

## Construcción de Paquetes

### Configuración

Configure las opciones de construcción en `entry.node.ts`:

```ts title="src/entry.node.ts"
import type { GezOptions } from '@gez/core';

export default {
    // Configuración de exportación de módulos
    modules: {
        exports: [
            'root:src/components/button.vue',
            'root:src/utils/format.ts',
            'npm:vue'
        ]
    },
    // Configuración de construcción
    pack: {
        // Habilitar construcción
        enable: true,

        // Configuración de salida
        outputs: [
            'dist/client/versions/latest.tgz',
            'dist/client/versions/1.0.0.tgz'
        ],

        // package.json personalizado
        packageJson: async (gez, pkg) => {
            pkg.version = '1.0.0';
            return pkg;
        },

        // Procesamiento previo a la construcción
        onBefore: async (gez, pkg) => {
            // Generar declaraciones de tipos
            // Ejecutar casos de prueba
            // Actualizar documentación, etc.
        },

        // Procesamiento posterior a la construcción
        onAfter: async (gez, pkg, file) => {
            // Subir a CDN
            // Publicar en el registro npm
            // Desplegar en entorno de pruebas, etc.
        }
    }
} satisfies GezOptions;
```

### Artefactos de Construcción

```
your-app-name.tgz
├── package.json        # Información del paquete
├── index.js            # Entrada para entorno de producción
├── server/             # Recursos del servidor
│   └── manifest.json   # Mapeo de recursos del servidor
├── node/               # Entorno de ejecución Node.js
└── client/             # Recursos del cliente
    └── manifest.json   # Mapeo de recursos del cliente
```

### Proceso de Publicación

```bash
# 1. Construir versión de producción
gez build

# 2. Publicar en npm
npm publish dist/versions/your-app-name.tgz
```