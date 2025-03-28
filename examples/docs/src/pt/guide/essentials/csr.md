---
titleSuffix: Guia de Implementação de Renderização no Cliente do Framework Esmx
description: Detalha o mecanismo de renderização no cliente do framework Esmx, incluindo construção estática, estratégias de implantação e melhores práticas, ajudando desenvolvedores a alcançar renderização front-end eficiente em ambientes sem servidor.
head:
  - - meta
    - property: keywords
      content: Esmx, Renderização no Cliente, CSR, Construção Estática, Renderização Front-end, Implantação sem Servidor, Otimização de Desempenho
---

# Renderização no Cliente

A renderização no cliente (Client-Side Rendering, CSR) é uma técnica de renderização de páginas executada no navegador. No Esmx, quando sua aplicação não pode ser implantada em uma instância de servidor Node.js, você pode optar por gerar um arquivo estático `index.html` na fase de construção, implementando a renderização puramente no cliente.

## Cenários de Uso

Os seguintes cenários recomendam o uso de renderização no cliente:

- **Ambientes de Hospedagem Estática**: como GitHub Pages, CDN e outros serviços de hospedagem que não suportam renderização no servidor
- **Aplicações Simples**: pequenas aplicações onde a velocidade de carregamento inicial e SEO não são prioridades
- **Ambiente de Desenvolvimento**: para visualização e depuração rápida da aplicação durante o desenvolvimento

## Configuração

### Configuração do Modelo HTML

No modo de renderização no cliente, você precisa configurar um modelo HTML genérico. Este modelo servirá como contêiner para a aplicação, incluindo referências de recursos necessários e pontos de montagem.

```ts title="src/entry.server.ts"
import type { RenderContext } from '@esmx/core';

export default async (rc: RenderContext) => {
    // Submeter coleta de dependências
    await rc.commit();
    
    // Configurar modelo HTML
    rc.html = `
<!DOCTYPE html>
<html>
<head>
    ${rc.preload()}           // Pré-carregar recursos
    <title>Esmx</title>
    ${rc.css()}               // Injetar estilos
</head>
<body>
    <div id="app"></div>
    ${rc.importmap()}         // Mapeamento de importação
    ${rc.moduleEntry()}       // Módulo de entrada
    ${rc.modulePreload()}     // Pré-carregamento de módulos
</body>
</html>
`;
};
```

### Geração de HTML Estático

Para usar a renderização no cliente em ambiente de produção, é necessário gerar um arquivo HTML estático na fase de construção. O Esmx fornece uma função de gancho `postBuild` para implementar esta funcionalidade:

```ts title="src/entry.node.ts"
import type { EsmxOptions } from '@esmx/core';

export default {
    async postBuild(esmx) {
        // Gerar arquivo HTML estático
        const rc = await esmx.render();
        // Escrever arquivo HTML
        esmx.writeSync(
            esmx.resolvePath('dist/client', 'index.html'),
            rc.html
        );
    }
} satisfies EsmxOptions;
```