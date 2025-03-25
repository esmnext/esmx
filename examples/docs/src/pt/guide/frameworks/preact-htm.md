---
titleSuffix: Exemplo de Aplicação SSR com Preact+HTM no Framework Gez
description: Aprenda a criar uma aplicação SSR com Preact+HTM usando o framework Gez desde o início. Este tutorial cobre inicialização do projeto, configuração do Preact e definição de arquivos de entrada.
head:
  - - meta
    - property: keywords
      content: Gez, Preact, HTM, Aplicação SSR, Configuração TypeScript, Inicialização de Projeto, Renderização no Servidor, Interação no Cliente
---

# Preact+HTM

Este tutorial irá guiá-lo na criação de uma aplicação SSR (Server-Side Rendering) com Preact+HTM usando o framework Gez. Vamos demonstrar como utilizar o Gez para criar uma aplicação com renderização no servidor através de um exemplo completo.

## Estrutura do Projeto

Primeiro, vamos entender a estrutura básica do projeto:

```bash
.
├── package.json         # Arquivo de configuração do projeto, define dependências e scripts
├── tsconfig.json        # Arquivo de configuração do TypeScript, define opções de compilação
└── src                  # Diretório de código-fonte
    ├── app.ts           # Componente principal da aplicação, define a estrutura e lógica da página
    ├── create-app.ts    # Fábrica de criação de instância da aplicação, responsável pela inicialização
    ├── entry.client.ts  # Arquivo de entrada do cliente, lida com a renderização no navegador
    ├── entry.node.ts    # Arquivo de entrada do Node.js, configura o ambiente de desenvolvimento e inicia o servidor
    └── entry.server.ts  # Arquivo de entrada do servidor, lida com a lógica de renderização SSR
```

## Configuração do Projeto

### package.json

Crie o arquivo `package.json` para configurar as dependências e scripts do projeto:

```json title="package.json"
{
  "name": "ssr-demo-preact-htm",
  "version": "1.0.0",
  "type": "module",
  "private": true,
  "scripts": {
    "dev": "gez dev",
    "build": "npm run build:dts && npm run build:ssr",
    "build:ssr": "gez build",
    "preview": "gez preview",
    "start": "NODE_ENV=production node dist/index.js",
    "build:dts": "tsc --declaration --emitDeclarationOnly --outDir dist/src"
  },
  "dependencies": {
    "@gez/core": "*"
  },
  "devDependencies": {
    "@gez/rspack": "*",
    "@types/node": "22.8.6",
    "htm": "^3.1.1",
    "preact": "^10.26.2",
    "preact-render-to-string": "^6.5.13",
    "typescript": "^5.2.2"
  }
}
```

Após criar o arquivo `package.json`, instale as dependências do projeto. Você pode usar um dos seguintes comandos para instalar:
```bash
pnpm install
# ou
yarn install
# ou
npm install
```

Isso instalará todos os pacotes necessários, incluindo Preact, HTM, TypeScript e dependências relacionadas ao SSR.

### tsconfig.json

Crie o arquivo `tsconfig.json` para configurar as opções de compilação do TypeScript:

```json title="tsconfig.json"
{
    "compilerOptions": {
        "isolatedModules": true,
        "experimentalDecorators": true,
        "resolveJsonModule": true,
        "types": [
            "@types/node"
        ],
        "target": "ESNext",
        "module": "ESNext",
        "moduleResolution": "node",
        "strict": true,
        "skipLibCheck": true,
        "allowSyntheticDefaultImports": true,
        "paths": {
            "ssr-demo-preact-htm/src/*": [
                "./src/*"
            ],
            "ssr-demo-preact-htm/*": [
                "./*"
            ]
        }
    },
    "include": [
        "src"
    ],
    "exclude": [
        "dist"
    ]
}
```

## Estrutura do Código-Fonte

### app.ts

Crie o componente principal da aplicação `src/app.ts`, utilizando componentes de classe do Preact e HTM:

```ts title="src/app.ts"
/**
 * @file Componente de Exemplo
 * @description Exibe um título de página com atualização automática de tempo, demonstrando funcionalidades básicas do Gez
 */

import { Component } from 'preact';
import { html } from 'htm/preact';

export default class App extends Component {
    state = {
        time: new Date().toISOString()
    };

    timer: NodeJS.Timeout | null = null;

    componentDidMount() {
        this.timer = setInterval(() => {
            this.setState({
                time: new Date().toISOString()
            });
        }, 1000);
    }

    componentWillUnmount() {
        if (this.timer) {
            clearInterval(this.timer);
        }
    }

    render() {
        const { time } = this.state;
        return html`
            <div>
                <h1><a href="https://www.esmnext.com/guide/frameworks/preact-htm.html" target="_blank">Início Rápido com Gez</a></h1>
                <time datetime=${time}>${time}</time>
            </div>
        `;
    }
}
```

### create-app.ts

Crie o arquivo `src/create-app.ts`, responsável por criar a instância da aplicação:

```ts title="src/create-app.ts"
/**
 * @file Criação da Instância da Aplicação
 * @description Responsável por criar e configurar a instância da aplicação
 */

import type { VNode } from 'preact';
import { html } from 'htm/preact';
import App from './app';

export function createApp(): { app: VNode } {
    const app = html`<${App} />`;
    return {
        app
    };
}
```

### entry.client.ts

Crie o arquivo de entrada do cliente `src/entry.client.ts`:

```ts title="src/entry.client.ts"
/**
 * @file Arquivo de Entrada do Cliente
 * @description Responsável pela lógica de interação do cliente e atualizações dinâmicas
 */

import { render } from 'preact';
import { createApp } from './create-app';

// Cria a instância da aplicação
const { app } = createApp();

// Monta a instância da aplicação
render(app, document.getElementById('app')!);
```

### entry.node.ts

Crie o arquivo `entry.node.ts` para configurar o ambiente de desenvolvimento e iniciar o servidor:

```ts title="src/entry.node.ts"
/**
 * @file Arquivo de Entrada do Node.js
 * @description Responsável pela configuração do ambiente de desenvolvimento e inicialização do servidor, fornecendo o ambiente de execução SSR
 */

import http from 'node:http';
import type { GezOptions } from '@gez/core';

export default {
    /**
     * Configura o criador de aplicação para o ambiente de desenvolvimento
     * @description Cria e configura a instância da aplicação Rspack, usada para construção e atualização em tempo real no ambiente de desenvolvimento
     * @param gez Instância do framework Gez, fornece funcionalidades principais e interfaces de configuração
     * @returns Retorna a instância configurada da aplicação Rspack, suportando HMR e visualização em tempo real
     */
    async devApp(gez) {
        return import('@gez/rspack').then((m) =>
            m.createRspackHtmlApp(gez, {
                config(context) {
                    // Personalize a configuração de compilação do Rspack aqui
                }
            })
        );
    },

    /**
     * Configura e inicia o servidor HTTP
     * @description Cria a instância do servidor HTTP, integra middleware do Gez e processa requisições SSR
     * @param gez Instância do framework Gez, fornece middleware e funcionalidades de renderização
     */
    async server(gez) {
        const server = http.createServer((req, res) => {
            // Usa middleware do Gez para processar a requisição
            gez.middleware(req, res, async () => {
                // Executa a renderização no servidor
                const rc = await gez.render({
                    params: { url: req.url }
                });
                res.end(rc.html);
            });
        });

        server.listen(3000, () => {
            console.log('Servidor iniciado: http://localhost:3000');
        });
    }
} satisfies GezOptions;
```

Este arquivo é o ponto de entrada para a configuração do ambiente de desenvolvimento e inicialização do servidor, contendo duas funcionalidades principais:

1. Função `devApp`: Responsável por criar e configurar a instância da aplicação Rspack para o ambiente de desenvolvimento, suportando atualização em tempo real e visualização instantânea. Aqui, `createRspackHtmlApp` é usado para criar uma instância da aplicação Rspack específica para Preact+HTM.
2. Função `server`: Responsável por criar e configurar o servidor HTTP, integrando middleware do Gez para processar requisições SSR.

### entry.server.ts

Crie o arquivo de entrada para a renderização no servidor `src/entry.server.ts`:

```ts title="src/entry.server.ts"
/**
 * @file Arquivo de Entrada para Renderização no Servidor
 * @description Responsável pelo fluxo de renderização no servidor, geração de HTML e injeção de recursos
 */

import type { RenderContext } from '@gez/core';
import type { VNode } from 'preact';
import { render } from 'preact-render-to-string';
import { createApp } from './create-app';

export default async (rc: RenderContext) => {
    // Cria a instância da aplicação
    const { app } = createApp();

    // Usa renderToString do Preact para gerar o conteúdo da página
    const html = render(app);

    // Submete a coleta de dependências, garantindo que todos os recursos necessários sejam carregados
    await rc.commit();

    // Gera a estrutura HTML completa
    rc.html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    ${rc.preload()}
    <title>Início Rápido com Gez</title>
    ${rc.css()}
</head>
<body>
    <div id="app">${html}</div>
    ${rc.importmap()}
    ${rc.moduleEntry()}
    ${rc.modulePreload()}
</body>
</html>
`;
};
```

## Executando o Projeto

Após configurar os arquivos acima, você pode usar os seguintes comandos para executar o projeto:

1. Modo de desenvolvimento:
```bash
npm run dev
```

2. Construir o projeto:
```bash
npm run build
```

3. Executar em produção:
```bash
npm run start
```

Agora, você criou com sucesso uma aplicação SSR com Preact+HTM usando o framework Gez! Acesse http://localhost:3000 para ver o resultado.