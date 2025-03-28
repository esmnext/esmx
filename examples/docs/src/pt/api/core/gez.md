---
titleSuffix: Referência da API das Classes Principais do Framework
description: Detalha a API das classes principais do framework Esmx, incluindo gerenciamento do ciclo de vida do aplicativo, manipulação de recursos estáticos e capacidade de renderização no lado do servidor, ajudando os desenvolvedores a entender profundamente as funcionalidades principais do framework.
head:
  - - meta
    - property: keywords
      content: Esmx, API, Gerenciamento do Ciclo de Vida, Recursos Estáticos, Renderização no Lado do Servidor, Rspack, Framework de Aplicação Web
---

# Esmx

## Introdução

Esmx é um framework de aplicação Web de alto desempenho baseado no Rspack, que oferece gerenciamento completo do ciclo de vida do aplicativo, manipulação de recursos estáticos e capacidade de renderização no lado do servidor.

## Definições de Tipos

### RuntimeTarget

- **Definição de Tipo**:
```ts
type RuntimeTarget = 'client' | 'server'
```

Tipos de ambiente de execução do aplicativo:
- `client`: Executa no ambiente do navegador, suporta operações DOM e APIs do navegador
- `server`: Executa no ambiente Node.js, suporta sistema de arquivos e funcionalidades do lado do servidor

### ImportMap

- **Definição de Tipo**:
```ts
type ImportMap = {
  imports?: SpecifierMap
  scopes?: ScopesMap
}
```

Tipo de mapeamento de importação de módulos ES.

#### SpecifierMap

- **Definição de Tipo**:
```ts
type SpecifierMap = Record<string, string>
```

Tipo de mapeamento de identificadores de módulos, usado para definir o mapeamento de caminhos de importação de módulos.

#### ScopesMap

- **Definição de Tipo**:
```ts
type ScopesMap = Record<string, SpecifierMap>
```

Tipo de mapeamento de escopo, usado para definir o mapeamento de importação de módulos em escopos específicos.

### COMMAND

- **Definição de Tipo**:
```ts
enum COMMAND {
    dev = 'dev',
    build = 'build',
    preview = 'preview',
    start = 'start'
}
```

Enumeração de tipos de comandos:
- `dev`: Comando de ambiente de desenvolvimento, inicia o servidor de desenvolvimento com suporte a atualização em tempo real
- `build`: Comando de construção, gera os artefatos de construção para o ambiente de produção
- `preview`: Comando de pré-visualização, inicia o servidor de pré-visualização local
- `start`: Comando de inicialização, executa o servidor de produção

## Opções de Instância

Define as opções de configuração principais do framework Esmx.

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
- **Valor Padrão**: `process.cwd()`

Caminho do diretório raiz do projeto. Pode ser um caminho absoluto ou relativo, caminhos relativos são resolvidos com base no diretório de trabalho atual.

#### isProd

- **Tipo**: `boolean`
- **Valor Padrão**: `process.env.NODE_ENV === 'production'`

Identificador de ambiente.
- `true`: Ambiente de produção
- `false`: Ambiente de desenvolvimento

#### basePathPlaceholder

- **Tipo**: `string | false`
- **Valor Padrão**: `'[[[___GEZ_DYNAMIC_BASE___]]]'`

Configuração do espaço reservado para o caminho base. Usado para substituir dinamicamente o caminho base dos recursos em tempo de execução. Definir como `false` desativa essa funcionalidade.

#### modules

- **Tipo**: `ModuleConfig`

Opções de configuração de módulos. Usado para configurar as regras de resolução de módulos do projeto, incluindo aliases de módulos, dependências externas, etc.

#### packs

- **Tipo**: `PackConfig`

Opções de configuração de empacotamento. Usado para empacotar os artefatos de construção em pacotes npm no formato .tgz.

#### devApp

- **Tipo**: `(esmx: Esmx) => Promise<App>`

Função de criação de aplicativo para o ambiente de desenvolvimento. Usado apenas no ambiente de desenvolvimento, para criar a instância do aplicativo do servidor de desenvolvimento.

```ts title="entry.node.ts"
export default {
  async devApp(esmx) {
    return import('@esmx/rspack').then((m) =>
      m.createRspackHtmlApp(esmx, {
        config(context) {
          // Configuração personalizada do Rspack
        }
      })
    )
  }
}
```

#### server

- **Tipo**: `(esmx: Esmx) => Promise<void>`

Função de configuração de inicialização do servidor. Usado para configurar e iniciar o servidor HTTP, pode ser usado tanto no ambiente de desenvolvimento quanto no de produção.

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

Função de pós-processamento de construção. Executada após a construção do projeto, pode ser usada para:
- Executar processamento adicional de recursos
- Operações de implantação
- Gerar arquivos estáticos
- Enviar notificações de construção

## Propriedades da Instância

### name

- **Tipo**: `string`
- **Somente Leitura**: `true`

Nome do módulo atual, derivado da configuração do módulo.

### varName

- **Tipo**: `string`
- **Somente Leitura**: `true`

Nome de variável JavaScript válido gerado com base no nome do módulo.

### root

- **Tipo**: `string`
- **Somente Leitura**: `true`

Caminho absoluto do diretório raiz do projeto. Se o `root` configurado for um caminho relativo, ele será resolvido com base no diretório de trabalho atual.

### isProd

- **Tipo**: `boolean`
- **Somente Leitura**: `true`

Determina se o ambiente atual é de produção. Prioriza o `isProd` da configuração, se não configurado, usa `process.env.NODE_ENV` para determinar.

### basePath

- **Tipo**: `string`
- **Somente Leitura**: `true`
- **Lança**: `NotReadyError` - Quando o framework não está inicializado

Obtém o caminho base do módulo que começa e termina com uma barra. Retorna o formato `/${name}/`, onde name vem da configuração do módulo.

### basePathPlaceholder

- **Tipo**: `string`
- **Somente Leitura**: `true`

Obtém o espaço reservado para substituição dinâmica do caminho base em tempo de execução. Pode ser desativado pela configuração.

### middleware

- **Tipo**: `Middleware`
- **Somente Leitura**: `true`

Obtém o middleware de manipulação de recursos estáticos. Fornece implementações diferentes dependendo do ambiente:
- Ambiente de desenvolvimento: Suporta compilação em tempo real do código-fonte e atualização em tempo real
- Ambiente de produção: Suporta cache de longo prazo para recursos estáticos

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
- **Somente Leitura**: `true`

Obtém a função de renderização no lado do servidor. Fornece implementações diferentes dependendo do ambiente:
- Ambiente de desenvolvimento: Suporta atualização em tempo real e pré-visualização em tempo real
- Ambiente de produção: Fornece desempenho de renderização otimizado

```ts
// Uso básico
const rc = await esmx.render({
  params: { url: req.url }
});

// Configuração avançada
const rc = await esmx.render({
  base: '',                    // Caminho base
  importmapMode: 'inline',     // Modo de mapeamento de importação
  entryName: 'default',        // Entrada de renderização
  params: {
    url: req.url,
    state: { user: 'admin' }   // Dados de estado
  }
});
```

### COMMAND

- **Tipo**: `typeof COMMAND`
- **Somente Leitura**: `true`

Obtém a definição do tipo de enumeração de comandos.

### moduleConfig

- **Tipo**: `ParsedModuleConfig`
- **Somente Leitura**: `true`
- **Lança**: `NotReadyError` - Quando o framework não está inicializado

Obtém as informações completas de configuração do módulo atual, incluindo regras de resolução de módulos, configuração de aliases, etc.

### packConfig

- **Tipo**: `ParsedPackConfig`
- **Somente Leitura**: `true`
- **Lança**: `NotReadyError` - Quando o framework não está inicializado

Obtém as configurações relacionadas ao empacotamento do módulo atual, incluindo caminho de saída, processamento de package.json, etc.

## Métodos da Instância

### constructor()

- **Parâmetros**: 
  - `options?: EsmxOptions` - Opções de configuração do framework
- **Retorno**: `Esmx`

Cria uma instância do framework Esmx.

```ts
const esmx = new Esmx({
  root: './src',
  isProd: process.env.NODE_ENV === 'production'
});
```

### init()

- **Parâmetros**: `command: COMMAND`
- **Retorno**: `Promise<boolean>`
- **Lança**:
  - `Error`: Quando há inicialização repetida
  - `NotReadyError`: Quando acessado antes da inicialização

Inicializa a instância do framework Esmx. Executa os seguintes processos principais de inicialização:

1. Resolve as configurações do projeto (package.json, configuração de módulos, configuração de empacotamento, etc.)
2. Cria a instância do aplicativo (ambiente de desenvolvimento ou produção)
3. Executa os métodos do ciclo de vida correspondentes com base no comando

::: warning Atenção
- Lança um erro em caso de inicialização repetida
- Lança `NotReadyError` ao acessar uma instância não inicializada

:::

```ts
const esmx = new Esmx({
  root: './src',
  isProd: process.env.NODE_ENV === 'production'
});

await esmx.init(COMMAND.dev);
```

### destroy()

- **Retorno**: `Promise<boolean>`

Destrói a instância do framework Esmx, executa a limpeza de recursos e o fechamento de conexões. Principalmente usado para:
- Fechar o servidor de desenvolvimento
- Limpar arquivos temporários e cache
- Liberar recursos do sistema

```ts
process.once('SIGTERM', async () => {
  await esmx.destroy();
  process.exit(0);
});
```

### build()

- **Retorno**: `Promise<boolean>`

Executa o processo de construção do aplicativo, incluindo:
- Compilar o código-fonte
- Gerar os artefatos de construção para o ambiente de produção
- Otimizar e comprimir o código
- Gerar o manifesto de recursos

::: warning Atenção
Lança `NotReadyError` se chamado antes da inicialização do framework
:::

```ts title="entry.node.ts"
export default {
  async postBuild(esmx) {
    await esmx.build();
    // Gera HTML estático após a construção
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

- **Retorno**: `Promise<void>`
- **Lança**: `NotReadyError` - Quando o framework não está inicializado

Inicia o servidor HTTP e configura a instância do servidor. Chamado nos seguintes ciclos de vida:
- Ambiente de desenvolvimento (dev): Inicia o servidor de desenvolvimento, fornece atualização em tempo real
- Ambiente de produção (start): Inicia o servidor de produção, fornece desempenho de nível de produção

```ts title="entry.node.ts"
export default {
  async server(esmx) {
    const server = http.createServer((req, res) => {
      // Manipula recursos estáticos
      esmx.middleware(req, res, async () => {
        // Renderização no lado do servidor
        const render = await esmx.render({
          params: { url: req.url }
        });
        res.end(render.html);
      });
    });

    server.listen(3000, () => {
      console.log('Servidor rodando em http://localhost:3000');
    });
  }
}
```

### postBuild()

- **Retorno**: `Promise<boolean>`

Executa a lógica de pós-processamento de construção, usada para:
- Gerar arquivos HTML estáticos
- Processar os artefatos de construção
- Executar tarefas de implantação
- Enviar notificações de construção

```ts title="entry.node.ts"
export default {
  async postBuild(esmx) {
    // Gera HTML estático para várias páginas
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

Resolve o caminho do projeto, convertendo caminhos relativos em absolutos.

- **Parâmetros**:
  - `projectPath: ProjectPath` - Tipo de caminho do projeto
  - `...args: string[]` - Segmentos do caminho
- **Retorno**: `string` - Caminho absoluto resolvido

- **Exemplo**:
```ts
// Resolve o caminho de recursos estáticos
const htmlPath = esmx.resolvePath('dist/client', 'index.html');
```

### writeSync()

Escreve o conteúdo do arquivo de forma síncrona.

- **Parâmetros**:
  - `filepath`: `string` - Caminho absoluto do arquivo
  - `data`: `any` - Dados a serem escritos, podem ser string, Buffer ou objeto
- **Retorno**: `boolean` - Indica se a escrita foi bem-sucedida

- **Exemplo**:
```ts title="src/entry.node.ts"

async postBuild(esmx) {
  const htmlPath = esmx.resolvePath('dist/client', 'index.html');
  const success = await esmx.write(htmlPath, '<html>...</html>');
}
```

### readJsonSync()

Lê e analisa um arquivo JSON de forma síncrona.

- **Parâmetros**:
  - `filename`: `string` - Caminho absoluto do arquivo JSON

- **Retorno**: `any` - Objeto JSON analisado
- **Exceção**: Lança uma exceção se o arquivo não existir ou se o formato JSON for inválido

- **Exemplo**:
```ts title="src/entry.node.ts"
async server(esmx) {
  const manifest = esmx.readJsonSync(esmx.resolvePath('dist/client', 'manifest.json'));
  // Usa o objeto manifest
}
```

### readJson()

Lê e analisa um arquivo JSON de forma assíncrona.

- **Parâmetros**:
  - `filename`: `string` - Caminho absoluto do arquivo JSON

- **Retorno**: `Promise<any>` - Objeto JSON analisado
- **Exceção**: Lança uma exceção se o arquivo não existir ou se o formato JSON for inválido

- **Exemplo**:
```ts title="src/entry.node.ts"
async server(esmx) {
  const manifest = await esmx.readJson(esmx.resolvePath('dist/client', 'manifest.json'));
  // Usa o objeto manifest
}
```

### getManifestList()

Obtém a lista de manifestos de construção.

- **Parâmetros**:
  - `target`: `RuntimeTarget` - Tipo de ambiente de destino
    - `'client'`: Ambiente do cliente
    - `'server'`: Ambiente do servidor

- **Retorno**: `Promise<readonly ManifestJson[]>` - Lista de manifestos de construção somente leitura
- **Exceção**: Lança `NotReadyError` se o framework não estiver inicializado

Este método é usado para obter a lista de manifestos de construção para o ambiente de destino especificado, incluindo as seguintes funcionalidades:
1. **Gerenciamento de Cache**
   - Usa mecanismo de cache interno para evitar carregamento repetido
   - Retorna lista de manifestos imutável

2. **Adaptação ao Ambiente**
   - Suporta ambientes do cliente e do servidor
   - Retorna informações de manifesto correspondentes ao ambiente de destino

3. **Mapeamento de Módulos**
   - Inclui informações de exportação de módulos
   - Registra dependências de recursos