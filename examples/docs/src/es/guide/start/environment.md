---
titleSuffix: Guía de compatibilidad del framework Esmx
description: Detalles sobre los requisitos de entorno del framework Esmx, incluyendo los requisitos de versión de Node.js y la compatibilidad con navegadores, para ayudar a los desarrolladores a configurar correctamente el entorno de desarrollo.
head:
  - - meta
    - property: keywords
      content: Esmx, Node.js, Compatibilidad con navegadores, TypeScript, es-module-shims, Configuración del entorno
---

# Requisitos del entorno

Este documento describe los requisitos de entorno necesarios para utilizar este framework, incluyendo el entorno de Node.js y la compatibilidad con navegadores.

## Entorno de Node.js

El framework requiere Node.js versión >= 22.6, principalmente para admitir la importación de tipos de TypeScript (a través de la bandera `--experimental-strip-types`), sin necesidad de pasos adicionales de compilación.

## Compatibilidad con navegadores

El framework utiliza por defecto un modo de construcción compatible para admitir una gama más amplia de navegadores. Sin embargo, es importante tener en cuenta que para lograr un soporte completo de compatibilidad con navegadores, es necesario agregar manualmente la dependencia [es-module-shims](https://github.com/guybedford/es-module-shims).

### Modo compatible (por defecto)
- 🌐 Chrome: >= 87 
- 🔷 Edge: >= 88 
- 🦊 Firefox: >= 78 
- 🧭 Safari: >= 14 

Según las estadísticas de [Can I Use](https://caniuse.com/?search=dynamic%20import), la cobertura de navegadores en modo compatible alcanza el 96.81%.

### Modo de soporte nativo
- 🌐 Chrome: >= 89 
- 🔷 Edge: >= 89 
- 🦊 Firefox: >= 108 
- 🧭 Safari: >= 16.4 

El modo de soporte nativo ofrece las siguientes ventajas:
- Cero sobrecarga en tiempo de ejecución, sin necesidad de cargadores de módulos adicionales
- Análisis nativo del navegador, mayor velocidad de ejecución
- Mejor capacidad de división de código y carga bajo demanda

Según las estadísticas de [Can I Use](https://caniuse.com/?search=importmap), la cobertura de navegadores en modo compatible alcanza el 93.5%.

### Habilitar soporte compatible

::: warning Nota importante
Aunque el framework utiliza por defecto el modo de construcción compatible, para lograr un soporte completo en navegadores antiguos, es necesario agregar la dependencia [es-module-shims](https://github.com/guybedford/es-module-shims) en su proyecto.

:::

Agregue el siguiente script en su archivo HTML:

```html
<!-- Entorno de desarrollo -->
<script async src="https://ga.jspm.io/npm:es-module-shims@2.0.10/dist/es-module-shims.js"></script>

<!-- Entorno de producción -->
<script async src="/path/to/es-module-shims.js"></script>
```

::: tip Mejores prácticas

1. Recomendaciones para el entorno de producción:
   - Implemente es-module-shims en su propio servidor
   - Asegure la estabilidad y velocidad de carga de los recursos
   - Evite posibles riesgos de seguridad
2. Consideraciones de rendimiento:
   - El modo compatible implica un ligero costo de rendimiento
   - Puede decidir habilitarlo según la distribución de navegadores de su audiencia objetivo

:::