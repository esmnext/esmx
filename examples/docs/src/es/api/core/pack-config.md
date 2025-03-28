---
titleSuffix: Referencia de API de configuración de empaquetado del framework Esmx
description: Documentación detallada de la interfaz de configuración PackConfig del framework Esmx, incluyendo reglas de empaquetado de paquetes, configuración de salida y hooks del ciclo de vida, para ayudar a los desarrolladores a implementar flujos de construcción estandarizados.
head:
  - - meta
    - property: keywords
      content: Esmx, PackConfig, empaquetado de paquetes, configuración de construcción, hooks del ciclo de vida, configuración de empaquetado, framework de aplicaciones web
---

# PackConfig

`PackConfig` es una interfaz de configuración para empaquetar paquetes, utilizada para empaquetar los artefactos de construcción de un servicio en un paquete estándar npm en formato .tgz.

- **Estandarización**: Utiliza el formato de empaquetado .tgz estándar de npm
- **Integridad**: Incluye todos los archivos necesarios como código fuente, declaraciones de tipos y archivos de configuración
- **Compatibilidad**: Totalmente compatible con el ecosistema de npm, soporta flujos de trabajo estándar de gestión de paquetes

## Definición de tipos

```ts
interface PackConfig {
    enable?: boolean;
    outputs?: string | string[] | boolean;
    packageJson?: (esmx: Esmx, pkg: Record<string, any>) => Promise<Record<string, any>>;
    onBefore?: (esmx: Esmx, pkg: Record<string, any>) => Promise<void>;
    onAfter?: (esmx: Esmx, pkg: Record<string, any>, file: Buffer) => Promise<void>;
}
```

### PackConfig

#### enable

Habilita o deshabilita la función de empaquetado. Cuando está habilitado, los artefactos de construcción se empaquetan en un paquete npm estándar en formato .tgz.

- Tipo: `boolean`
- Valor por defecto: `false`

#### outputs

Especifica la ruta de salida del archivo del paquete. Soporta las siguientes configuraciones:
- `string`: Una única ruta de salida, por ejemplo 'dist/versions/my-app.tgz'
- `string[]`: Múltiples rutas de salida, para generar varias versiones simultáneamente
- `boolean`: Cuando es true, utiliza la ruta por defecto 'dist/client/versions/latest.tgz'

#### packageJson

Función de callback para personalizar el contenido de package.json. Se llama antes del empaquetado para personalizar el contenido de package.json.

- Parámetros:
  - `esmx: Esmx` - Instancia de Esmx
  - `pkg: any` - Contenido original de package.json
- Valor de retorno: `Promise<any>` - Contenido modificado de package.json

Usos comunes:
- Modificar el nombre y la versión del paquete
- Agregar o actualizar dependencias
- Agregar campos personalizados
- Configurar información de publicación

Ejemplo:
```ts
packageJson: async (esmx, pkg) => {
  // Configurar información del paquete
  pkg.name = 'my-app';
  pkg.version = '1.0.0';
  pkg.description = 'Mi aplicación';

  // Agregar dependencias
  pkg.dependencies = {
    'vue': '^3.0.0',
    'express': '^4.17.1'
  };

  // Agregar configuración de publicación
  pkg.publishConfig = {
    registry: 'https://registry.example.com'
  };

  return pkg;
}
```

#### onBefore

Función de callback para preparativos antes del empaquetado.

- Parámetros:
  - `esmx: Esmx` - Instancia de Esmx
  - `pkg: Record<string, any>` - Contenido de package.json
- Valor de retorno: `Promise<void>`

Usos comunes:
- Agregar archivos adicionales (README, LICENSE, etc.)
- Ejecutar pruebas o validaciones de construcción
- Generar documentación o metadatos
- Limpiar archivos temporales

Ejemplo:
```ts
onBefore: async (esmx, pkg) => {
  // Agregar documentación
  await fs.writeFile('dist/README.md', '# Mi Aplicación');
  await fs.writeFile('dist/LICENSE', 'Licencia MIT');

  // Ejecutar pruebas
  await runTests();

  // Generar documentación
  await generateDocs();

  // Limpiar archivos temporales
  await cleanupTempFiles();
}
```

#### onAfter

Función de callback para procesamiento posterior al empaquetado. Se llama después de generar el archivo .tgz, para manejar los artefactos empaquetados.

- Parámetros:
  - `esmx: Esmx` - Instancia de Esmx
  - `pkg: Record<string, any>` - Contenido de package.json
  - `file: Buffer` - Contenido del archivo empaquetado
- Valor de retorno: `Promise<void>`

Usos comunes:
- Publicar en un repositorio npm (público o privado)
- Subir a un servidor de recursos estáticos
- Gestionar versiones
- Activar flujos de CI/CD

Ejemplo:
```ts
onAfter: async (esmx, pkg, file) => {
  // Publicar en un repositorio npm privado
  await publishToRegistry(file, {
    registry: 'https://registry.example.com'
  });

  // Subir a un servidor de recursos estáticos
  await uploadToServer(file, 'https://assets.example.com/packages');

  // Crear etiqueta de versión en Git
  await createGitTag(pkg.version);

  // Activar proceso de despliegue
  await triggerDeploy(pkg.version);
}
```

## Ejemplo de uso

```ts title="entry.node.ts"
import type { EsmxOptions } from '@esmx/core';

export default {
  modules: {
    // Configurar módulos a exportar
    exports: [
      'root:src/components/button.vue',
      'root:src/utils/format.ts',
      'npm:vue',
      'npm:vue-router'
    ]
  },
  // Configuración de empaquetado
  pack: {
    // Habilitar función de empaquetado
    enable: true,

    // Generar múltiples versiones simultáneamente
    outputs: [
      'dist/versions/latest.tgz',
      'dist/versions/1.0.0.tgz'
    ],

    // Personalizar package.json
    packageJson: async (esmx, pkg) => {
      pkg.version = '1.0.0';
      return pkg;
    },

    // Preparativos antes del empaquetado
    onBefore: async (esmx, pkg) => {
      // Agregar archivos necesarios
      await fs.writeFile('dist/README.md', '# Tu Aplicación\n\nExplicación de los módulos exportados...');
      // Ejecutar verificación de tipos
      await runTypeCheck();
    },

    // Procesamiento posterior al empaquetado
    onAfter: async (esmx, pkg, file) => {
      // Publicar en un repositorio npm privado
      await publishToRegistry(file, {
        registry: 'https://npm.your-registry.com/'
      });
      // O desplegar en un servidor estático
      await uploadToServer(file, 'https://static.example.com/packages');
    }
  }
} satisfies EsmxOptions;
```