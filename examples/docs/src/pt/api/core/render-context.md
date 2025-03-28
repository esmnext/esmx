---
titleSuffix: Referência da API de Contexto de Renderização do Framework Esmx
description: Detalhes sobre a classe principal RenderContext do framework Esmx, incluindo controle de renderização, gerenciamento de recursos, sincronização de estado e controle de roteamento, ajudando desenvolvedores a implementar renderização no lado do servidor (SSR) de forma eficiente.
head:
  - - meta
    - property: keywords
      content: Esmx, RenderContext, SSR, Renderização no lado do servidor, Contexto de renderização, Sincronização de estado, Gerenciamento de recursos, Framework de aplicação web
---

# RenderContext

RenderContext é a classe principal do framework Esmx, responsável por gerenciar o ciclo de vida completo da renderização no lado do servidor (SSR). Ele fornece um conjunto completo de APIs para lidar com o contexto de renderização, gerenciamento de recursos, sincronização de estado e outras tarefas críticas:

- **Controle de renderização**: Gerencia o fluxo de renderização no lado do servidor, suportando cenários como renderização de múltiplas entradas e renderização condicional.
- **Gerenciamento de recursos**: Coleta e injeta recursos estáticos como JS, CSS de forma inteligente, otimizando o desempenho de carregamento.
- **Sincronização de estado**: Lida com a serialização do estado no lado do servidor, garantindo a ativação correta no cliente (hydration).
- **Controle de roteamento**: Suporta funcionalidades avançadas como redirecionamento no lado do servidor e configuração de códigos de status.

## Definições de Tipo

### ServerRenderHandle

Definição de tipo para a função de manipulação de renderização no lado do servidor.

```ts
type ServerRenderHandle = (rc: RenderContext) => Promise<void> | void;
```

A função de manipulação de renderização no lado do servidor é uma função assíncrona ou síncrona que recebe uma instância de RenderContext como parâmetro, usada para processar a lógica de renderização no lado do servidor.

```ts title="entry.node.ts"
// 1. Função assíncrona
export default async (rc: RenderContext) => {
  const app = createApp();
  const html = await renderToString(app);
  rc.html = html;
};

// 2. Função síncrona
export const simple = (rc: RenderContext) => {
  rc.html = '<h1>Hello World</h1>';
};
```

### RenderFiles

Definição de tipo para a lista de arquivos de recursos coletados durante o processo de renderização.

```ts
interface RenderFiles {
  js: string[];
  css: string[];
  modulepreload: string[];
  resources: string[];
}
```

- **js**: Lista de arquivos JavaScript
- **css**: Lista de arquivos de folhas de estilo
- **modulepreload**: Lista de módulos ESM que precisam ser pré-carregados
- **resources**: Lista de outros arquivos de recursos (imagens, fontes, etc.)

```ts
// Exemplo de lista de arquivos de recursos
rc.files = {
  js: [
    '/assets/entry-client.js',
    '/assets/vendor.js'
  ],
  css: [
    '/assets/main.css',
    '/assets/vendor.css'
  ],
  modulepreload: [
    '/assets/Home.js',
    '/assets/About.js'
  ],
  resources: [
    '/assets/logo.png',
    '/assets/font.woff2'
  ]
};
```

### ImportmapMode

Define o modo de geração do importmap.

```ts
type ImportmapMode = 'inline' | 'js';
```

- `inline`: Inclui o conteúdo do importmap diretamente no HTML, adequado para os seguintes cenários:
  - Reduzir o número de requisições HTTP
  - Quando o conteúdo do importmap é pequeno
  - Quando o desempenho de carregamento inicial é crítico
- `js`: Gera o conteúdo do importmap como um arquivo JS independente, adequado para os seguintes cenários:
  - Quando o conteúdo do importmap é grande
  - Quando é necessário aproveitar o mecanismo de cache do navegador
  - Quando múltiplas páginas compartilham o mesmo importmap

Classe de contexto de renderização, responsável pelo gerenciamento de recursos e geração de HTML durante o processo de renderização no lado do servidor (SSR).
## Opções de Instância

Define as opções de configuração do contexto de renderização.

```ts
interface RenderContextOptions {
  base?: string
  entryName?: string
  params?: Record<string, any>
  importmapMode?: ImportmapMode
}
```

#### base

- **Tipo**: `string`
- **Valor padrão**: `''`

Caminho base para recursos estáticos.
- Todos os recursos estáticos (JS, CSS, imagens, etc.) serão carregados com base neste caminho
- Suporta configuração dinâmica em tempo de execução, sem necessidade de reconstrução
- Comumente usado em cenários como sites multilíngues, aplicações de micro frontend, etc.

#### entryName

- **Tipo**: `string`
- **Valor padrão**: `'default'`

Nome da função de entrada para renderização no lado do servidor. Usado para especificar a função de entrada a ser usada durante a renderização no lado do servidor, quando um módulo exporta múltiplas funções de renderização.

```ts title="src/entry.server.ts"
export const mobile = async (rc: RenderContext) => {
  // Lógica de renderização para dispositivos móveis
};

export const desktop = async (rc: RenderContext) => {
  // Lógica de renderização para desktop
};
```

#### params

- **Tipo**: `Record<string, any>`
- **Valor padrão**: `{}`

Parâmetros de renderização. Permite passar parâmetros de qualquer tipo para a função de renderização, comumente usado para passar informações de requisição (URL, parâmetros de query, etc.).

```ts
const rc = await esmx.render({
  params: {
    url: req.url,
    lang: 'zh-CN',
    theme: 'dark'
  }
});
```

#### importmapMode

- **Tipo**: `'inline' | 'js'`
- **Valor padrão**: `'inline'`

Modo de geração do mapa de importação (Import Map):
- `inline`: Inclui o conteúdo do importmap diretamente no HTML
- `js`: Gera o conteúdo do importmap como um arquivo JS independente


## Propriedades da Instância

### esmx

- **Tipo**: `Esmx`
- **Somente leitura**: `true`

Referência à instância do Esmx. Usado para acessar funcionalidades e informações de configuração do núcleo do framework.

### redirect

- **Tipo**: `string | null`
- **Valor padrão**: `null`

Endereço de redirecionamento. Quando definido, o servidor pode realizar um redirecionamento HTTP com base neste valor, comumente usado em cenários como verificação de login, controle de permissões, etc.

```ts title="entry.node.ts"
// Exemplo de verificação de login
export default async (rc: RenderContext) => {
  if (!isLoggedIn()) {
    rc.redirect = '/login';
    rc.status = 302;
    return;
  }
  // Continuar a renderização da página...
};

// Exemplo de controle de permissões
export default async (rc: RenderContext) => {
  if (!hasPermission()) {
    rc.redirect = '/403';
    rc.status = 403;
    return;
  }
  // Continuar a renderização da página...
};
```

### status

- **Tipo**: `number | null`
- **Valor padrão**: `null`

Código de status HTTP. Pode ser definido qualquer código de status HTTP válido, comumente usado em cenários como tratamento de erros, redirecionamentos, etc.

```ts title="entry.node.ts"
// Exemplo de tratamento de erro 404
export default async (rc: RenderContext) => {
  const page = await findPage(rc.params.url);
  if (!page) {
    rc.status = 404;
    // Renderizar página 404...
    return;
  }
  // Continuar a renderização da página...
};

// Exemplo de redirecionamento temporário
export default async (rc: RenderContext) => {
  if (needMaintenance()) {
    rc.redirect = '/maintenance';
    rc.status = 307; // Redirecionamento temporário, mantendo o método de requisição
    return;
  }
  // Continuar a renderização da página...
};
```

### html

- **Tipo**: `string`
- **Valor padrão**: `''`

Conteúdo HTML. Usado para definir e obter o conteúdo HTML final gerado, ao definir, trata automaticamente os espaços reservados para o caminho base.

```ts title="entry.node.ts"
// Uso básico
export default async (rc: RenderContext) => {
  // Definir conteúdo HTML
  rc.html = `
    <!DOCTYPE html>
    <html>
      <head>
        ${rc.preload()}
        ${rc.css()}
      </head>
      <body>
        <div id="app">Hello World</div>
        ${rc.importmap()}
        ${rc.moduleEntry()}
        ${rc.modulePreload()}
      </body>
    </html>
  `;
};

// Caminho base dinâmico
const rc = await esmx.render({
  base: '/app',  // Definir caminho base
  params: { url: req.url }
});

// Os espaços reservados no HTML serão substituídos automaticamente:
// [[[___GEZ_DYNAMIC_BASE___]]]/your-app-name/css/style.css
// Substituído por:
// /app/your-app-name/css/style.css
```

### base

- **Tipo**: `string`
- **Somente leitura**: `true`
- **Valor padrão**: `''`

Caminho base para recursos estáticos. Todos os recursos estáticos (JS, CSS, imagens, etc.) serão carregados com base neste caminho, suportando configuração dinâmica em tempo de execução.

```ts
// Uso básico
const rc = await esmx.render({
  base: '/esmx',  // Definir caminho base
  params: { url: req.url }
});

// Exemplo de site multilíngue
const rc = await esmx.render({
  base: '/cn',  // Site em chinês
  params: { lang: 'zh-CN' }
});

// Exemplo de aplicação de micro frontend
const rc = await esmx.render({
  base: '/app1',  // Subaplicação 1
  params: { appId: 1 }
});
```

### entryName

- **Tipo**: `string`
- **Somente leitura**: `true`
- **Valor padrão**: `'default'`

Nome da função de entrada para renderização no lado do servidor. Usado para selecionar a função de renderização a ser usada a partir do entry.server.ts.

```ts title="entry.node.ts"
// Função de entrada padrão
export default async (rc: RenderContext) => {
  // Lógica de renderização padrão
};

// Múltiplas funções de entrada
export const mobile = async (rc: RenderContext) => {
  // Lógica de renderização para dispositivos móveis
};

export const desktop = async (rc: RenderContext) => {
  // Lógica de renderização para desktop
};

// Selecionar função de entrada com base no tipo de dispositivo
const rc = await esmx.render({
  entryName: isMobile ? 'mobile' : 'desktop',
  params: { url: req.url }
});
```

### params

- **Tipo**: `Record<string, any>`
- **Somente leitura**: `true`
- **Valor padrão**: `{}`

Parâmetros de renderização. Permite passar e acessar parâmetros durante o processo de renderização no lado do servidor, comumente usado para passar informações de requisição, configurações de página, etc.

```ts
// Uso básico - Passar URL e configurações de idioma
const rc = await esmx.render({
  params: {
    url: req.url,
    lang: 'zh-CN'
  }
});

// Configurações de página - Definir tema e layout
const rc = await esmx.render({
  params: {
    theme: 'dark',
    layout: 'sidebar'
  }
});

// Configurações de ambiente - Injetar endereço da API
const rc = await esmx.render({
  params: {
    apiBaseUrl: process.env.API_BASE_URL,
    version: '1.0.0'
  }
});
```

### importMetaSet

- **Tipo**: `Set<ImportMeta>`

Conjunto de dependências de módulos coletadas. Durante o processo de renderização de componentes, rastreia e registra automaticamente as dependências de módulos, coletando apenas os recursos realmente usados na renderização da página atual.

```ts
// Uso básico
const renderToString = (app: any, context: { importMetaSet: Set<ImportMeta> }) => {
  // Coletar automaticamente as dependências de módulos durante o processo de renderização
  // O framework chamará automaticamente context.importMetaSet.add(import.meta) durante a renderização de componentes
  // Desenvolvedores não precisam lidar manualmente com a coleta de dependências
  return '<div id="app">Hello World</div>';
};

// Exemplo de uso
const app = createApp();
const html = await renderToString(app, {
  importMetaSet: rc.importMetaSet
});
```

### files

- **Tipo**: `RenderFiles`

Lista de arquivos de recursos:
- js: Lista de arquivos JavaScript
- css: Lista de arquivos de folhas de estilo
- modulepreload: Lista de módulos ESM que precisam ser pré-carregados
- resources: Lista de outros arquivos de recursos (imagens, fontes, etc.)

```ts
// Coleta de recursos
await rc.commit();

// Injeção de recursos
rc.html = `
  <!DOCTYPE html>
  <html>
  <head>
    <!-- Pré-carregar recursos -->
    ${rc.preload()}
    <!-- Injetar folhas de estilo -->
    ${rc.css()}
  </head>
  <body>
    ${html}
    ${rc.importmap()}
    ${rc.moduleEntry()}
    ${rc.modulePreload()}
  </body>
  </html>
`;
```

### importmapMode

- **Tipo**: `'inline' | 'js'`
- **Valor padrão**: `'inline'`

Modo de geração do mapa de importação:
- `inline`: Inclui o conteúdo do importmap diretamente no HTML
- `js`: Gera o conteúdo do importmap como um arquivo JS independente


## Métodos da Instância

### serialize()

- **Parâmetros**: 
  - `input: any` - Dados a serem serializados
  - `options?: serialize.SerializeJSOptions` - Opções de serialização
- **Retorno**: `string`

Serializa um objeto JavaScript em uma string. Usado para serializar dados de estado durante o processo de renderização no lado do servidor, garantindo que os dados possam ser embutidos com segurança no HTML.

```ts
const state = {
  user: { id: 1, name: 'Alice' },
  timestamp: new Date()
};

rc.html = `
  <script>
    window.__INITIAL_STATE__ = ${rc.serialize(state)};
  </script>
`;
```

### state()

- **Parâmetros**: 
  - `varName: string` - Nome da variável
  - `data: Record<string, any>` - Dados de estado
- **Retorno**: `string`

Serializa e injeta dados de estado no HTML. Usa métodos de serialização seguros para processar dados, suportando estruturas de dados complexas.

```ts
const userInfo = {
  id: 1,
  name: 'John',
  roles: ['admin']
};

rc.html = `
  <head>
    ${rc.state('__USER__', userInfo)}
  </head>
`;
```

### commit()

- **Retorno**: `Promise<void>`

Submete a coleta de dependências e atualiza a lista de recursos. Coleta todos os módulos usados a partir do importMetaSet, analisando os recursos específicos de cada módulo com base no arquivo de manifesto.

```ts
// Renderizar e submeter dependências
const html = await renderToString(app, {
  importMetaSet: rc.importMetaSet
});

// Submeter coleta de dependências
await rc.commit();
```

### preload()

- **Retorno**: `string`

Gera tags de pré-carregamento de recursos. Usado para pré-carregar recursos CSS e JavaScript, suportando configuração de prioridade, tratando automaticamente o caminho base.

```ts
rc.html = `
  <!DOCTYPE html>
  <html>
  <head>
    ${rc.preload()}
    ${rc.css()}  <!-- Injetar folhas de estilo -->
  </head>
  <body>
    ${html}
    ${rc.importmap()}
    ${rc.moduleEntry()}
    ${rc.modulePreload()}
  </body>
  </html>
`;
```

### css()

- **Retorno**: `string`

Gera tags de folhas de estilo CSS. Injeta os arquivos CSS coletados, garantindo que as folhas de estilo sejam carregadas na ordem correta.

```ts
rc.html = `
  <head>
    ${rc.css()}  <!-- Injetar todas as folhas de estilo coletadas -->
  </head>
`;
```

### importmap()

- **Retorno**: `string`

Gera tags de mapa de importação. Gera o mapa de importação inline ou externo com base na configuração do importmapMode.

```ts
rc.html = `
  <head>
    ${rc.importmap()}  <!-- Injetar mapa