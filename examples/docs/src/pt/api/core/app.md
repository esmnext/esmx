---
titleSuffix: Interface de abstração de aplicação do framework Esmx
description: Detalha a interface App do framework Esmx, incluindo gerenciamento do ciclo de vida do aplicativo, manipulação de recursos estáticos e renderização do lado do servidor, ajudando os desenvolvedores a entender e usar as funcionalidades principais do aplicativo.
head:
  - - meta
    - property: keywords
      content: Esmx, App, abstração de aplicação, ciclo de vida, recursos estáticos, renderização do lado do servidor, API
---

# App

`App` é a abstração de aplicação do framework Esmx, fornecendo uma interface unificada para gerenciar o ciclo de vida do aplicativo, recursos estáticos e renderização do lado do servidor.

```ts title="entry.node.ts"
export default {
  // Configuração do ambiente de desenvolvimento
  async devApp(esmx) {
    return import('@esmx/rspack').then((m) =>
      m.createRspackHtmlApp(esmx, {
        config(rc) {
          // Configuração personalizada do Rspack
        }
      })
    );
  }
}
```

## Definição de tipos
### App

```ts
interface App {
  middleware: Middleware;
  render: (options?: RenderContextOptions) => Promise<RenderContext>;
  build?: () => Promise<boolean>;
  destroy?: () => Promise<boolean>;
}
```

#### middleware

- **Tipo**: `Middleware`

Middleware de manipulação de recursos estáticos.

Ambiente de desenvolvimento:
- Processa solicitações de recursos estáticos do código-fonte
- Suporta compilação em tempo real e atualização a quente (hot reload)
- Usa política de cache no-cache

Ambiente de produção:
- Processa recursos estáticos após a construção
- Suporta cache de longo prazo para arquivos imutáveis (.final.xxx)
- Estratégia otimizada de carregamento de recursos

```ts
server.use(esmx.middleware);
```

#### render

- **Tipo**: `(options?: RenderContextOptions) => Promise<RenderContext>`

Função de renderização do lado do servidor. Fornece implementações diferentes dependendo do ambiente de execução:
- Ambiente de produção (start): Carrega o arquivo de entrada do servidor após a construção (entry.server) e executa a renderização
- Ambiente de desenvolvimento (dev): Carrega o arquivo de entrada do servidor do código-fonte e executa a renderização

```ts
const rc = await esmx.render({
  params: { url: '/page' }
});
res.end(rc.html);
```

#### build

- **Tipo**: `() => Promise<boolean>`

Função de construção para o ambiente de produção. Usada para empacotamento e otimização de recursos. Retorna true em caso de sucesso na construção, false em caso de falha.

#### destroy

- **Tipo**: `() => Promise<boolean>`

Função de limpeza de recursos. Usada para fechar o servidor, desconectar conexões, etc. Retorna true em caso de sucesso na limpeza, false em caso de falha.