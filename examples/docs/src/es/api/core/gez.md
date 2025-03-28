---
titleSuffix: Referencia de API de las clases principales del framework
description: Documentación detallada de las API de las clases principales del framework Esmx, incluyendo la gestión del ciclo de vida de la aplicación, el manejo de recursos estáticos y la capacidad de renderizado en el servidor, para ayudar a los desarrolladores a comprender en profundidad las funcionalidades centrales del framework.
head:
  - - meta
    - property: keywords
      content: Esmx, API, Gestión del ciclo de vida, Recursos estáticos, Renderizado en el servidor, Rspack, Framework de aplicaciones web
---

# Esmx

## Introducción

Esmx es un framework de aplicaciones web de alto rendimiento basado en Rspack, que ofrece una gestión completa del ciclo de vida de la aplicación, manejo de recursos estáticos y capacidades de renderizado en el servidor.

## Definiciones de tipos

### RuntimeTarget

- **Definición de tipo**:
```ts
type RuntimeTarget = 'client' | 'server'
```

Tipos de entorno de ejecución de la aplicación:
- `client`: Se ejecuta en el entorno del navegador, compatible con operaciones DOM y API del navegador.
- `server`: Se ejecuta en el entorno de Node.js, compatible con sistemas de archivos y funcionalidades del servidor.

### ImportMap

- **Definición de tipo**:
```ts
type ImportMap = {
  imports?: SpecifierMap
  scopes?: ScopesMap
}
```

Tipo de mapeo de importación de módulos ES.

#### SpecifierMap

- **Definición de tipo**:
```ts
type SpecifierMap = Record<string, string>
```

Tipo de mapeo de identificadores de módulos, utilizado para definir las relaciones de mapeo de rutas de importación de módulos.

#### ScopesMap

- **Definición de tipo**:
```ts
type ScopesMap = Record<string, SpecifierMap>
```

Tipo de mapeo de alcance, utilizado para definir las relaciones de mapeo de importación de módulos en un alcance específico.

### COMMAND

- **Definición de tipo**:
```ts
enum COMMAND {
    dev = 'dev',
    build = 'build',
    preview = 'preview',
    start = 'start'
}
```

Enumeración de tipos de comandos:
- `dev`: Comando de entorno de desarrollo, inicia el servidor de desarrollo con soporte para actualización en caliente.
- `build`: Comando de construcción, genera los artefactos de construcción para el entorno de producción.
- `preview`: Comando de vista previa, inicia un servidor local de vista previa.
- `start`: Comando de inicio, ejecuta el servidor de producción.

## Opciones de instancia

Define las opciones de configuración centrales del framework Esmx.

```ts
interface EsmxOptions {
  root?: string
  isProd?: boolean
  basePathPlaceholder?: string | false
  modules?: ModuleConfig
  packs?: PackConfig
  devApp?: (esmx: Esmx) => Promise<App>
  server?: (esmx: Esmx) => Promise<void>
  postBuild?: (esmx: Esmx) => Promise<void>
}
```

#### root

- **Tipo**: `string`
- **Valor predeterminado**: `process.cwd()`

Ruta del directorio raíz del proyecto. Puede ser una ruta absoluta o relativa, las rutas relativas se resuelven basándose en el directorio de trabajo actual.

#### isProd

- **Tipo**: `boolean`
- **Valor predeterminado**: `process.env.NODE_ENV === 'production'`

Identificador de entorno.
- `true`: Entorno de producción.
- `false`: Entorno de desarrollo.

#### basePathPlaceholder

- **Tipo**: `string | false`
- **Valor predeterminado**: `'[[[___GEZ_DYNAMIC_BASE___]]]'`

Configuración del marcador de posición de la ruta base. Se utiliza para reemplazar dinámicamente la ruta base de los recursos en tiempo de ejecución. Establecerlo en `false` desactiva esta funcionalidad.

#### modules

- **Tipo**: `ModuleConfig`

Opciones de configuración de módulos. Se utiliza para configurar las reglas de resolución de módulos del proyecto, incluyendo alias de módulos, dependencias externas, etc.

#### packs

- **Tipo**: `PackConfig`

Opciones de configuración de empaquetado. Se utiliza para empaquetar los artefactos de construcción en paquetes de software estándar en formato .tgz de npm.

#### devApp

- **Tipo**: `(esmx: Esmx) => Promise<App>`

Función de creación de la aplicación en el entorno de desarrollo. Solo se utiliza en el entorno de desarrollo, para crear instancias de la aplicación del servidor de desarrollo.

```ts title="entry.node.ts"
export default {
  async devApp(esmx) {
    return import('@esmx/rspack').then((m) =>
      m.createRspackHtmlApp(esmx, {
        config(context) {
          // Configuración personalizada de Rspack
        }
      })
    )
  }
}
```

#### server

- **Tipo**: `(esmx: Esmx) => Promise<void>`

Función de configuración del servidor. Se utiliza para configurar e iniciar el servidor HTTP, tanto en el entorno de desarrollo como en el de producción.

```ts title="entry.node.ts"
export default {
  async server(esmx) {
    const server = http.createServer((req, res) => {
      esmx.middleware(req, res, async () => {
        const render = await esmx.render({
          params: { url: req.url }
        });
        res.end(render.html);
      });
    });

    server.listen(3000);
  }
}
```

#### postBuild

- **Tipo**: `(esmx: Esmx) => Promise<void>`

Función de procesamiento posterior a la construcción. Se ejecuta después de completar la construcción del proyecto, y se puede utilizar para:
- Ejecutar procesamiento adicional de recursos.
- Operaciones de despliegue.
- Generar archivos estáticos.
- Enviar notificaciones de construcción.

## Propiedades de instancia

### name

- **Tipo**: `string`
- **Solo lectura**: `true`

Nombre del módulo actual, derivado de la configuración del módulo.

### varName

- **Tipo**: `string`
- **Solo lectura**: `true`

Nombre de variable JavaScript válido generado a partir del nombre del módulo.

### root

- **Tipo**: `string`
- **Solo lectura**: `true`

Ruta absoluta del directorio raíz del proyecto. Si la configuración de `root` es una ruta relativa, se resuelve basándose en el directorio de trabajo actual.

### isProd

- **Tipo**: `boolean`
- **Solo lectura**: `true`

Determina si el entorno actual es de producción. Prioriza el uso de la opción de configuración `isProd`, si no está configurado, se determina según `process.env.NODE_ENV`.

### basePath

- **Tipo**: `string`
- **Solo lectura**: `true`
- **Lanza**: `NotReadyError` - Cuando el framework no está inicializado.

Obtiene la ruta base del módulo que comienza y termina con una barra diagonal. El formato de retorno es `/${name}/`, donde name proviene de la configuración del módulo.

### basePathPlaceholder

- **Tipo**: `string`
- **Solo lectura**: `true`

Obtiene el marcador de posición de la ruta base utilizado para el reemplazo dinámico en tiempo de ejecución. Se puede desactivar mediante configuración.

### middleware

- **Tipo**: `Middleware`
- **Solo lectura**: `true`

Obtiene el middleware de manejo de recursos estáticos. Proporciona diferentes implementaciones según el entorno:
- Entorno de desarrollo: Soporta compilación en tiempo real y actualización en caliente.
- Entorno de producción: Soporta caché a largo plazo de recursos estáticos.

```ts
const server = http.createServer((req, res) => {
  esmx.middleware(req, res, async () => {
    const rc = await esmx.render({ url: req.url });
    res.end(rc.html);
  });
});
```

### render

- **Tipo**: `(options?: RenderContextOptions) => Promise<RenderContext>`
- **Solo lectura**: `true`

Obtiene la función de renderizado en el servidor. Proporciona diferentes implementaciones según el entorno:
- Entorno de desarrollo: Soporta actualización en caliente y vista previa en tiempo real.
- Entorno de producción: Proporciona un rendimiento de renderizado optimizado.

```ts
// Uso básico
const rc = await esmx.render({
  params: { url: req.url }
});

// Configuración avanzada
const rc = await esmx.render({
  base: '',                    // Ruta base
  importmapMode: 'inline',     // Modo de mapeo de importación
  entryName: 'default',        // Entrada de renderizado
  params: {
    url: req.url,
    state: { user: 'admin' }   // Datos de estado
  }
});
```

### COMMAND

- **Tipo**: `typeof COMMAND`
- **Solo lectura**: `true`

Obtiene la definición del tipo de enumeración de comandos.

### moduleConfig

- **Tipo**: `ParsedModuleConfig`
- **Solo lectura**: `true`
- **Lanza**: `NotReadyError` - Cuando el framework no está inicializado.

Obtiene la información completa de configuración del módulo actual, incluyendo reglas de resolución de módulos, configuración de alias, etc.

### packConfig

- **Tipo**: `ParsedPackConfig`
- **Solo lectura**: `true`
- **Lanza**: `NotReadyError` - Cuando el framework no está inicializado.

Obtiene la configuración relacionada con el empaquetado del módulo actual, incluyendo rutas de salida, procesamiento de package.json, etc.

## Métodos de instancia

### constructor()

- **Parámetros**: 
  - `options?: EsmxOptions` - Opciones de configuración del framework.
- **Retorna**: `Esmx`

Crea una instancia del framework Esmx.

```ts
const esmx = new Esmx({
  root: './src',
  isProd: process.env.NODE_ENV === 'production'
});
```

### init()

- **Parámetros**: `command: COMMAND`
- **Retorna**: `Promise<boolean>`
- **Lanza**:
  - `Error`: Cuando se intenta inicializar repetidamente.
  - `NotReadyError`: Cuando se accede a una instancia no inicializada.

Inicializa la instancia del framework Esmx. Ejecuta los siguientes procesos centrales de inicialización:

1. Analiza la configuración del proyecto (package.json, configuración de módulos, configuración de empaquetado, etc.).
2. Crea la instancia de la aplicación (entorno de desarrollo o producción).
3. Ejecuta los métodos del ciclo de vida correspondientes según el comando.

::: warning Nota
- Lanza un error si se intenta inicializar repetidamente.
- Lanza `NotReadyError` si se accede a una instancia no inicializada.

:::

```ts
const esmx = new Esmx({
  root: './src',
  isProd: process.env.NODE_ENV === 'production'
});

await esmx.init(COMMAND.dev);
```

### destroy()

- **Retorna**: `Promise<boolean>`

Destruye la instancia del framework Esmx, ejecuta la limpieza de recursos y el cierre de conexiones. Principalmente utilizado para:
- Cerrar el servidor de desarrollo.
- Limpiar archivos temporales y caché.
- Liberar recursos del sistema.

```ts
process.once('SIGTERM', async () => {
  await esmx.destroy();
  process.exit(0);
});
```

### build()

- **Retorna**: `Promise<boolean>`

Ejecuta el proceso de construcción de la aplicación, incluyendo:
- Compilación del código fuente.
- Generación de artefactos de construcción para el entorno de producción.
- Optimización y compresión del código.
- Generación del manifiesto de recursos.

::: warning Nota
Lanza `NotReadyError` si se llama antes de inicializar la instancia del framework.
:::

```ts title="entry.node.ts"
export default {
  async postBuild(esmx) {
    await esmx.build();
    // Genera HTML estático después de la construcción
    const render = await esmx.render({
      params: { url: '/' }
    });
    esmx.writeSync(
      esmx.resolvePath('dist/client', 'index.html'),
      render.html
    );
  }
}
```

### server()

- **Retorna**: `Promise<void>`
- **Lanza**: `NotReadyError` - Cuando el framework no está inicializado.

Inicia el servidor HTTP y configura la instancia del servidor. Se llama en los siguientes ciclos de vida:
- Entorno de desarrollo (dev): Inicia el servidor de desarrollo con actualización en caliente.
- Entorno de producción (start): Inicia el servidor de producción con rendimiento de nivel de producción.

```ts title="entry.node.ts"
export default {
  async server(esmx) {
    const server = http.createServer((req, res) => {
      // Maneja recursos estáticos
      esmx.middleware(req, res, async () => {
        // Renderizado en el servidor
        const render = await esmx.render({
          params: { url: req.url }
        });
        res.end(render.html);
      });
    });

    server.listen(3000, () => {
      console.log('Servidor ejecutándose en http://localhost:3000');
    });
  }
}
```

### postBuild()

- **Retorna**: `Promise<boolean>`

Ejecuta la lógica de procesamiento posterior a la construcción, utilizada para:
- Generar archivos HTML estáticos.
- Procesar los artefactos de construcción.
- Ejecutar tareas de despliegue.
- Enviar notificaciones de construcción.

```ts title="entry.node.ts"
export default {
  async postBuild(esmx) {
    // Genera HTML estático para múltiples páginas
    const pages = ['/', '/about', '/404'];

    for (const url of pages) {
      const render = await esmx.render({
        params: { url }
      });

      await esmx.write(
        esmx.resolvePath('dist/client', url.substring(1), 'index.html'),
        render.html
      );
    }
  }
}
```

### resolvePath

Resuelve las rutas del proyecto, convierte rutas relativas en absolutas.

- **Parámetros**:
  - `projectPath: ProjectPath` - Tipo de ruta del proyecto.
  - `...args: string[]` - Fragmentos de ruta.
- **Retorna**: `string` - Ruta absoluta resuelta.

- **Ejemplo**:
```ts
// Resuelve la ruta de recursos estáticos
const htmlPath = esmx.resolvePath('dist/client', 'index.html');
```

### writeSync()

Escribe sincrónicamente el contenido de un archivo.

- **Parámetros**:
  - `filepath`: `string` - Ruta absoluta del archivo.
  - `data`: `any` - Datos a escribir, pueden ser cadenas, Buffer u objetos.
- **Retorna**: `boolean` - Indica si la escritura fue exitosa.

- **Ejemplo**:
```ts title="src/entry.node.ts"

async postBuild(esmx) {
  const htmlPath = esmx.resolvePath('dist/client', 'index.html');
  const success = await esmx.write(htmlPath, '<html>...</html>');
}
```

### readJsonSync()

Lee y analiza sincrónicamente un archivo JSON.

- **Parámetros**:
  - `filename`: `string` - Ruta absoluta del archivo JSON.

- **Retorna**: `any` - Objeto JSON analizado.
- **Excepciones**: Lanza una excepción si el archivo no existe o si el formato JSON es incorrecto.

- **Ejemplo**:
```ts title="src/entry.node.ts"
async server(esmx) {
  const manifest = esmx.readJsonSync(esmx.resolvePath('dist/client', 'manifest.json'));
  // Usa el objeto manifest
}
```

### readJson()

Lee y analiza asincrónicamente un archivo JSON.

- **Parámetros**:
  - `filename`: `string` - Ruta absoluta del archivo JSON.

- **Retorna**: `Promise<any>` - Objeto JSON analizado.
- **Excepciones**: Lanza una excepción si el archivo no existe o si el formato JSON es incorrecto.

- **Ejemplo**:
```ts title="src/entry.node.ts"
async server(esmx) {
  const manifest = await esmx.readJson(esmx.resolvePath('dist/client', 'manifest.json'));
  // Usa el objeto manifest
}
```

### getManifestList()

Obtiene la lista de manifiestos de construcción.

- **Parámetros**:
  - `target`: `RuntimeTarget` - Tipo de entorno objetivo.
    - `'client'`: Entorno del cliente.
    - `'server'`: Entorno del servidor.

- **Retorna**: `Promise<readonly ManifestJson[]>` - Lista de manifiestos de construcción de solo lectura.
- **Excepciones**: Lanza `NotReadyError` si la instancia del framework no está inicializada.

Este método se utiliza para obtener la lista de manifiestos de construcción para el entorno objetivo especificado, incluyendo las siguientes funcionalidades:
1. **Gestión de caché**
   - Utiliza un mecanismo de caché interno para evitar cargas repetidas.
   - Retorna una lista de manifiestos inmutable.

2. **Adaptación al entorno**
   - Soporta entornos de cliente y servidor.
   - Retorna la información de manifiesto correspondiente según el entorno objetivo.

3. **Mapeo de módulos**
   - Incluye información