---
titleSuffix: Guía de configuración de rutas de recursos estáticos en el marco Esmx
description: Explicación detallada de la configuración de rutas base en el marco Esmx, incluyendo implementación en múltiples entornos, distribución CDN y configuración de rutas de acceso a recursos, para ayudar a los desarrolladores a lograr una gestión flexible de recursos estáticos.
head:
  - - meta
    - property: keywords
      content: Esmx, Ruta base, Base Path, CDN, Recursos estáticos, Implementación en múltiples entornos, Gestión de recursos
---

# Ruta base

La ruta base (Base Path) es el prefijo de la ruta de acceso a los recursos estáticos (como JavaScript, CSS, imágenes, etc.) en una aplicación. En Esmx, una configuración adecuada de la ruta base es crucial para los siguientes escenarios:

- **Implementación en múltiples entornos**: Soporte para el acceso a recursos en diferentes entornos como desarrollo, pruebas y producción
- **Implementación en múltiples regiones**: Adaptación a las necesidades de implementación en clústeres de diferentes regiones o países
- **Distribución CDN**: Implementación de distribución global y aceleración de recursos estáticos

## Mecanismo de ruta predeterminada

Esmx utiliza un mecanismo automático de generación de rutas basado en el nombre del servicio. Por defecto, el marco leerá el campo `name` en el archivo `package.json` del proyecto para generar la ruta base de los recursos estáticos: `/your-app-name/`.

```json title="package.json"
{
    "name": "your-app-name"
}
```

Este diseño de convención sobre configuración tiene las siguientes ventajas:

- **Consistencia**: Garantiza que todos los recursos estáticos utilicen una ruta de acceso unificada
- **Previsibilidad**: La ruta de acceso a los recursos se puede inferir a través del campo `name` en `package.json`
- **Mantenibilidad**: No se requiere configuración adicional, reduciendo los costos de mantenimiento

## Configuración dinámica de rutas

En proyectos reales, a menudo necesitamos implementar el mismo código en diferentes entornos o regiones. Esmx proporciona soporte para rutas base dinámicas, permitiendo que la aplicación se adapte a diferentes escenarios de implementación.

### Casos de uso

#### Implementación en subdirectorios
```
- example.com      -> Sitio principal predeterminado
- example.com/cn/  -> Sitio en chino
- example.com/en/  -> Sitio en inglés
```

#### Implementación en dominios independientes
```
- example.com    -> Sitio principal predeterminado
- cn.example.com -> Sitio en chino
- en.example.com -> Sitio en inglés
```

### Método de configuración

A través del parámetro `base` del método `esmx.render()`, puedes establecer dinámicamente la ruta base según el contexto de la solicitud:

```ts
const render = await esmx.render({
    base: '/cn',  // Establecer la ruta base
    params: {
        url: req.url
    }
});
```