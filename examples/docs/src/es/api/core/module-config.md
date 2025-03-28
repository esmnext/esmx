---
titleSuffix: Referencia de API de configuración de módulos del framework Esmx
description: Documentación detallada de la interfaz de configuración ModuleConfig del framework Esmx, incluyendo reglas de importación/exportación de módulos, configuración de alias y gestión de dependencias externas, para ayudar a los desarrolladores a comprender en profundidad el sistema modular del framework.
head:
  - - meta
    - property: keywords
      content: Esmx, ModuleConfig, configuración de módulos, importación/exportación de módulos, dependencias externas, configuración de alias, gestión de dependencias, framework de aplicaciones web
---

# ModuleConfig

ModuleConfig proporciona la funcionalidad de configuración de módulos en el framework Esmx, utilizada para definir reglas de importación/exportación de módulos, configuración de alias y dependencias externas.

## Definición de tipos

### PathType

- **Definición de tipo**:
```ts
enum PathType {
  npm = 'npm:', 
  root = 'root:'
}
```

Enumeración de tipos de rutas de módulos:
- `npm`: Representa dependencias en node_modules
- `root`: Representa archivos en el directorio raíz del proyecto

### ModuleConfig

- **Definición de tipo**:
```ts
interface ModuleConfig {
  exports?: string[]
  links?: Record<string, string>
  imports?: Record<string, string>
}
```

Interfaz de configuración de módulos, utilizada para definir la exportación, importación y configuración de dependencias externas del servicio.

#### exports

Lista de configuración de exportaciones, que expone unidades de código específicas (como componentes, funciones utilitarias, etc.) en formato ESM.

Soporta dos tipos:
- `root:*`: Exporta archivos de código fuente, por ejemplo: `root:src/components/button.vue`
- `npm:*`: Exporta dependencias de terceros, por ejemplo: `npm:vue`

Cada elemento de exportación contiene los siguientes atributos:
- `name`: Ruta de exportación original, por ejemplo: `npm:vue` o `root:src/components`
- `type`: Tipo de ruta (`npm` o `root`)
- `importName`: Nombre de importación, formato: `${serviceName}/${type}/${path}`
- `exportName`: Ruta de exportación, relativa al directorio raíz del servicio
- `exportPath`: Ruta real del archivo
- `externalName`: Nombre de dependencia externa, utilizado como identificador cuando otros servicios importan este módulo

#### links

Mapeo de configuración de dependencias del servicio, utilizado para configurar otros servicios (locales o remotos) de los que depende el servicio actual y sus rutas locales. La clave de cada elemento de configuración es el nombre del servicio y el valor es la ruta local del servicio.

La configuración varía según el método de instalación:
- Instalación desde código fuente (Workspace, Git): Debe apuntar al directorio dist, ya que se utilizan los archivos construidos
- Instalación desde paquete (Link, servidor estático, repositorio privado, File): Apunta directamente al directorio del paquete, ya que este ya contiene los archivos construidos

#### imports

Mapeo de dependencias externas, configura las dependencias externas que se utilizarán, generalmente dependencias de módulos remotos.

Cada dependencia contiene los siguientes atributos:
- `match`: Expresión regular para coincidir con las declaraciones de importación
- `import`: Ruta real del módulo

**Ejemplo**:
```ts title="entry.node.ts"
import type { EsmxOptions } from '@esmx/core';

export default {
  modules: {
    // Configuración de exportaciones
    exports: [
      'root:src/components/button.vue',  // Exportar archivo de código fuente
      'root:src/utils/format.ts',
      'npm:vue',  // Exportar dependencia de terceros
      'npm:vue-router'
    ],

    // Configuración de importaciones
    links: {
      // Método de instalación desde código fuente: debe apuntar al directorio dist
      'ssr-remote': 'root:./node_modules/ssr-remote/dist',
      // Método de instalación desde paquete: apunta directamente al directorio del paquete
      'other-remote': 'root:./node_modules/other-remote'
    },

    // Configuración de dependencias externas
    imports: {
      'vue': 'ssr-remote/npm/vue',
      'vue-router': 'ssr-remote/npm/vue-router'
    }
  }
} satisfies EsmxOptions;
```

### ParsedModuleConfig

- **Definición de tipo**:
```ts
interface ParsedModuleConfig {
  name: string
  root: string
  exports: {
    name: string
    type: PathType
    importName: string
    exportName: string
    exportPath: string
    externalName: string
  }[]
  links: Array<{
    /**
     * Nombre del paquete
     */
    name: string
    /**
     * Directorio raíz del paquete
     */
    root: string
  }>
  imports: Record<string, { match: RegExp; import?: string }>
}
```

Configuración de módulos analizada, que convierte la configuración original de módulos a un formato interno estandarizado:

#### name
Nombre del servicio actual
- Utilizado para identificar el módulo y generar rutas de importación

#### root
Ruta del directorio raíz del servicio actual
- Utilizado para resolver rutas relativas y la ubicación de los artefactos de construcción

#### exports
Lista de configuración de exportaciones
- `name`: Ruta de exportación original, por ejemplo: 'npm:vue' o 'root:src/components'
- `type`: Tipo de ruta (npm o root)
- `importName`: Nombre de importación, formato: '${serviceName}/${type}/${path}'
- `exportName`: Ruta de exportación, relativa al directorio raíz del servicio
- `exportPath`: Ruta real del archivo
- `externalName`: Nombre de dependencia externa, utilizado como identificador cuando otros servicios importan este módulo

#### links
Lista de configuración de importaciones
- `name`: Nombre del paquete
- `root`: Directorio raíz del paquete

#### imports
Mapeo de dependencias externas
- Mapea las rutas de importación del módulo a la ubicación real del módulo
- `match`: Expresión regular para coincidir con las declaraciones de importación
- `import`: Ruta real del módulo