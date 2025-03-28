---
titleSuffix: Guía de mapeo de rutas de importación de módulos en el marco Esmx
description: Explicación detallada del mecanismo de alias de rutas en el marco Esmx, incluyendo características como la simplificación de rutas de importación, evitación de anidamientos profundos, seguridad de tipos y optimización de resolución de módulos, para ayudar a los desarrolladores a mejorar la mantenibilidad del código.
head:
  - - meta
    - property: keywords
      content: Esmx, alias de rutas, Path Alias, TypeScript, importación de módulos, mapeo de rutas, mantenibilidad del código
---

# Alias de Rutas

El alias de rutas (Path Alias) es un mecanismo de mapeo de rutas de importación de módulos que permite a los desarrolladores utilizar identificadores cortos y semánticos en lugar de rutas completas de módulos. En Esmx, el mecanismo de alias de rutas ofrece las siguientes ventajas:

- **Simplificación de rutas de importación**: Uso de alias semánticos en lugar de rutas relativas largas, mejorando la legibilidad del código.
- **Evitación de anidamientos profundos**: Elimina las dificultades de mantenimiento causadas por referencias a directorios con múltiples niveles (como `../../../../`).
- **Seguridad de tipos**: Integración completa con el sistema de tipos de TypeScript, proporcionando autocompletado y verificación de tipos.
- **Optimización de resolución de módulos**: Mejora el rendimiento de la resolución de módulos mediante mapeos de rutas predefinidos.

## Mecanismo de Alias Predeterminado

Esmx utiliza un mecanismo de alias automático basado en el nombre del servicio (Service Name), un diseño que prioriza la convención sobre la configuración y tiene las siguientes características:

- **Configuración automática**: Genera automáticamente alias basados en el campo `name` en `package.json`, sin necesidad de configuración manual.
- **Normativa unificada**: Asegura que todos los módulos de servicio sigan una normativa consistente de nomenclatura y referencia.
- **Soporte de tipos**: Junto con el comando `npm run build:dts`, genera automáticamente archivos de declaración de tipos, permitiendo la inferencia de tipos entre servicios.
- **Previsibilidad**: Permite inferir la ruta de referencia de un módulo a través del nombre del servicio, reduciendo los costos de mantenimiento.

## Configuración

### Configuración en package.json

En `package.json`, el nombre del servicio se define mediante el campo `name`, que servirá como prefijo predeterminado para los alias del servicio:

```json title="package.json"
{
    "name": "your-app-name"
}
```

### Configuración en tsconfig.json

Para que TypeScript pueda resolver correctamente las rutas de alias, es necesario configurar el mapeo `paths` en `tsconfig.json`:

```json title="tsconfig.json"
{
    "compilerOptions": {
        "paths": {
            "your-app-name/src/*": [
                "./src/*"
            ],
            "your-app-name/*": [
                "./*"
            ]
        }
    }
}
```

## Ejemplos de Uso

### Importación de módulos internos del servicio

```ts
// Uso de alias para importar
import { MyComponent } from 'your-app-name/src/components';

// Importación equivalente con ruta relativa
import { MyComponent } from '../components';
```

### Importación de módulos de otros servicios

```ts
// Importación de componentes de otro servicio
import { SharedComponent } from 'other-service/src/components';

// Importación de funciones utilitarias de otro servicio
import { utils } from 'other-service/src/utils';
```

::: tip Mejores Prácticas
- Priorizar el uso de rutas de alias en lugar de rutas relativas.
- Mantener las rutas de alias semánticas y consistentes.
- Evitar el uso excesivo de niveles de directorio en las rutas de alias.

:::

``` ts
// Importación de componentes
import { Button } from 'your-app-name/src/components';
import { Layout } from 'your-app-name/src/components/layout';

// Importación de funciones utilitarias
import { formatDate } from 'your-app-name/src/utils';
import { request } from 'your-app-name/src/utils/request';

// Importación de definiciones de tipos
import type { UserInfo } from 'your-app-name/src/types';
```

### Importación entre servicios

Cuando se configura un enlace de módulos (Module Link), se puede utilizar la misma forma para importar módulos de otros servicios:

```ts
// Importación de componentes de un servicio remoto
import { Header } from 'remote-service/src/components';

// Importación de funciones utilitarias de un servicio remoto
import { logger } from 'remote-service/src/utils';
```

### Alias Personalizados

Para paquetes de terceros o escenarios especiales, se pueden personalizar alias a través del archivo de configuración de Esmx:

```ts title="src/entry.node.ts"
export default {
    async devApp(esmx) {
        return import('@esmx/rspack').then((m) =>
            m.createApp(esmx, (buildContext) => {
                buildContext.config.resolve = {
                    ...buildContext.config.resolve,
                    alias: {
                        ...buildContext.config.resolve?.alias,
                        // Configuración de una versión específica de Vue
                        'vue$': 'vue/dist/vue.esm.js',
                        // Configuración de alias cortos para directorios comunes
                        '@': './src',
                        '@components': './src/components'
                    }
                }
            })
        );
    }
} satisfies EsmxOptions;
```

::: warning Consideraciones
1. Para módulos de negocio, se recomienda siempre utilizar el mecanismo de alias predeterminado para mantener la consistencia del proyecto.
2. Los alias personalizados se utilizan principalmente para manejar necesidades especiales de paquetes de terceros o para optimizar la experiencia de desarrollo.
3. El uso excesivo de alias personalizados puede afectar la mantenibilidad del código y la optimización de la construcción.

:::