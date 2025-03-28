---
titleSuffix: "De los desafíos de los microfrontends a la innovación con ESM: El camino evolutivo del framework Esmx"
description: Explora en profundidad la evolución del framework Esmx desde los desafíos de las arquitecturas tradicionales de microfrontends hasta los avances innovadores basados en ESM, compartiendo experiencias prácticas en optimización de rendimiento, gestión de dependencias y selección de herramientas de construcción.
head:
  - - meta
    - property: keywords
      content: Esmx, framework de microfrontends, ESM, Import Maps, Rspack, Federación de Módulos, gestión de dependencias, optimización de rendimiento, evolución técnica, renderizado en el servidor
sidebar: false
---

# De la compartición de componentes a la modularización nativa: El camino evolutivo del framework de microfrontends Esmx

## Contexto del proyecto

En los últimos años, las arquitecturas de microfrontends han estado buscando un camino correcto. Sin embargo, lo que hemos visto son diversas soluciones técnicas complejas que utilizan capas de envoltura y aislamiento artificial para simular un mundo ideal de microfrontends. Estas soluciones han traído una carga pesada en términos de rendimiento, haciendo que el desarrollo simple se vuelva complejo y que los flujos estándar se vuelvan oscuros.

### Limitaciones de las soluciones tradicionales

En la práctica de las arquitecturas de microfrontends, hemos experimentado profundamente las numerosas limitaciones de las soluciones tradicionales:

- **Pérdida de rendimiento**: Inyección de dependencias en tiempo de ejecución, proxies de sandbox de JS, cada operación consume un rendimiento valioso.
- **Aislamiento frágil**: Entornos de sandbox creados artificialmente, que nunca pueden alcanzar las capacidades de aislamiento nativas del navegador.
- **Complejidad de construcción**: Para manejar las relaciones de dependencia, se tuvo que modificar las herramientas de construcción, haciendo que los proyectos simples sean difíciles de mantener.
- **Reglas personalizadas**: Estrategias de implementación especiales, procesamiento en tiempo de ejecución, cada paso se desvía de los flujos estándar de desarrollo moderno.
- **Limitaciones del ecosistema**: Acoplamiento de frameworks, APIs personalizadas, lo que obliga a la selección técnica a estar vinculada a un ecosistema específico.

Estos problemas fueron especialmente evidentes en un proyecto empresarial en 2019. En ese momento, un gran producto se dividió en más de diez subsistemas de negocio independientes, que necesitaban compartir un conjunto de componentes básicos y de negocio. La solución inicial de compartición de componentes basada en paquetes npm reveló serios problemas de eficiencia de mantenimiento: cuando se actualizaban los componentes compartidos, todos los subsistemas que dependían de ellos tenían que pasar por un proceso completo de construcción e implementación.

## Evolución técnica

### v1.0: Exploración de componentes remotos

Para resolver el problema de eficiencia en la compartición de componentes, Esmx v1.0 introdujo el mecanismo de componentes RemoteView basado en el protocolo HTTP. Esta solución implementó el ensamblaje dinámico de código entre servicios en tiempo de ejecución, resolviendo con éxito el problema de las largas cadenas de dependencias de construcción. Sin embargo, debido a la falta de un mecanismo estandarizado de comunicación en tiempo de ejecución, la sincronización de estado y la transferencia de eventos entre servicios aún presentaban cuellos de botella en términos de eficiencia.

### v2.0: Intento de Federación de Módulos

En la versión v2.0, adoptamos la tecnología de [Federación de Módulos (Module Federation)](https://webpack.js.org/concepts/module-federation/) de [Webpack 5.0](https://webpack.js.org/). Esta tecnología, a través de un mecanismo unificado de carga de módulos y contenedores en tiempo de ejecución, mejoró significativamente la eficiencia de colaboración entre servicios. Sin embargo, en la práctica a gran escala, el mecanismo cerrado de implementación de la Federación de Módulos presentó nuevos desafíos: era difícil lograr una gestión precisa de versiones de dependencias, especialmente al unificar dependencias compartidas entre múltiples servicios, donde frecuentemente se encontraban conflictos de versiones y excepciones en tiempo de ejecución.

## Abrazando la nueva era de ESM

Al planificar la versión v3.0, observamos profundamente las tendencias de desarrollo del ecosistema frontend y descubrimos que los avances en las capacidades nativas del navegador ofrecían nuevas posibilidades para las arquitecturas de microfrontends:

### Sistema de módulos estandarizado

Con el soporte completo de los principales navegadores para [ES Modules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules) y la madurez de la especificación [Import Maps](https://github.com/WICG/import-maps), el desarrollo frontend ha entrado en una verdadera era de modularización. Según las estadísticas de [Can I Use](https://caniuse.com/?search=importmap), el soporte nativo de ESM en los principales navegadores (Chrome >= 89, Edge >= 89, Firefox >= 108, Safari >= 16.4) ha alcanzado el 93.5%, lo que nos proporciona las siguientes ventajas:

- **Gestión de dependencias estandarizada**: Import Maps ofrece la capacidad de resolver dependencias de módulos a nivel del navegador, sin necesidad de inyección compleja en tiempo de ejecución.
- **Optimización de carga de recursos**: El mecanismo de caché de módulos nativo del navegador mejora significativamente la eficiencia de carga de recursos.
- **Simplificación del flujo de construcción**: El modo de desarrollo basado en ESM hace que los flujos de construcción en entornos de desarrollo y producción sean más consistentes.

Además, con el soporte de modo de compatibilidad (Chrome >= 87, Edge >= 88, Firefox >= 78, Safari >= 14), podemos aumentar la cobertura de navegadores al 96.81%, lo que nos permite mantener un alto rendimiento sin sacrificar el soporte para navegadores antiguos.

### Avances en rendimiento y aislamiento

El sistema de módulos nativo no solo trae estandarización, sino también mejoras significativas en rendimiento y aislamiento:

- **Cero sobrecarga en tiempo de ejecución**: Se eliminan los proxies de sandbox de JavaScript y la inyección en tiempo de ejecución de las soluciones tradicionales de microfrontends.
- **Mecanismo de aislamiento confiable**: El ámbito estricto de los módulos ESM proporciona naturalmente la capacidad de aislamiento más confiable.
- **Gestión precisa de dependencias**: El análisis estático de importaciones hace que las relaciones de dependencia sean más claras y el control de versiones más preciso.

### Selección de herramientas de construcción

En la implementación de la solución técnica, la selección de herramientas de construcción fue un punto de decisión clave. Después de casi un año de investigación y práctica técnica, nuestra elección evolucionó de la siguiente manera:

1. **Exploración de Vite**
   - Ventaja: Servidor de desarrollo basado en ESM, proporcionando una experiencia de desarrollo extrema.
   - Desafío: Las diferencias en la construcción entre entornos de desarrollo y producción introdujeron cierta incertidumbre.

2. **Establecimiento de [Rspack](https://www.rspack.dev/)**
   - Ventaja de rendimiento: Compilación de alto rendimiento basada en [Rust](https://www.rust-lang.org/), mejorando significativamente la velocidad de construcción.
   - Soporte del ecosistema: Alta compatibilidad con el ecosistema de Webpack, reduciendo los costos de migración.
   - Soporte de ESM: A través de la práctica del proyecto Rslib, se validó su fiabilidad en la construcción basada en ESM.

Esta decisión nos permitió mantener la experiencia de desarrollo mientras obteníamos un soporte más estable para el entorno de producción. Basándonos en la combinación de ESM y Rspack, finalmente construimos una solución de microfrontends de alto rendimiento y baja intrusividad.

## Perspectivas futuras

En el plan de desarrollo futuro, el framework Esmx se centrará en las siguientes tres direcciones:

### Optimización profunda de Import Maps

- **Gestión dinámica de dependencias**: Implementar la programación inteligente de versiones de dependencias en tiempo de ejecución, resolviendo conflictos de dependencias entre múltiples aplicaciones.
- **Estrategias de precarga**: Precarga inteligente basada en análisis de rutas, mejorando la eficiencia de carga de recursos.
- **Optimización de construcción**: Generación automática de configuraciones óptimas de Import Maps, reduciendo los costos de configuración manual para los desarrolladores.

### Solución de enrutamiento independiente del framework

- **Abstracción unificada de enrutamiento**: Diseñar una interfaz de enrutamiento independiente del framework, compatible con Vue, React y otros frameworks principales.
- **Enrutamiento de microaplicaciones**: Implementar la interconexión de rutas entre aplicaciones, manteniendo la consistencia entre la URL y el estado de la aplicación.
- **Middleware de enrutamiento**: Proporcionar un mecanismo de middleware extensible, soportando control de permisos, transiciones de página, etc.

### Mejores prácticas de comunicación entre frameworks

- **Aplicación de ejemplo**: Proporcionar un ejemplo completo de comunicación entre frameworks, cubriendo Vue, React, Preact y otros frameworks principales.
- **Sincronización de estado**: Solución ligera de compartición de estado basada en ESM.
- **Bus de eventos**: Mecanismo estandarizado de comunicación de eventos, soportando comunicación desacoplada entre aplicaciones.

Con estas optimizaciones y extensiones, esperamos que Esmx se convierta en una solución de microfrontends más completa y fácil de usar, proporcionando a los desarrolladores una mejor experiencia de desarrollo y una mayor eficiencia.