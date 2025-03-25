---
titleSuffix: Exemplo de Aplicação Vue2 SSR com Gez Framework
description: Aprenda a criar uma aplicação Vue2 SSR do zero usando o Gez Framework. Este guia prático cobre desde a inicialização do projeto até a configuração do Vue2 e arquivos de entrada.
head:
  - - meta
    - property: keywords
      content: Gez, Vue2, Aplicação SSR, Configuração TypeScript, Inicialização de Projeto, Renderização no Servidor, Interação no Cliente
---

# Vue2

Este tutorial irá guiá-lo na criação de uma aplicação Vue2 SSR (Server-Side Rendering) do zero usando o Gez Framework. Através de um exemplo completo, demonstraremos como utilizar o Gez Framework para criar uma aplicação com renderização no servidor.

## Estrutura do Projeto

Primeiro, vamos entender a estrutura básica do projeto:

```bash
.
├── package.json         # Arquivo de configuração do projeto, define dependências e scripts
├── tsconfig.json        # Arquivo de configuração do TypeScript, define opções de compilação
└── src                  # Diretório de código-fonte
    ├── app.vue          # Componente principal da aplicação, define a estrutura e lógica da página
    ├── create-app.ts    # Fábrica de instância Vue, responsável pela inicialização da aplicação
    ├── entry.client.ts  # Arquivo de entrada do cliente, lida com a renderização no navegador
    ├── entry.node.ts    # Arquivo de entrada do Node.js, configura o ambiente de desenvolvimento e inicia o servidor
    └── entry.server.ts  # Arquivo de entrada do servidor, lida com a lógica de renderização SSR
```

## Configuração do Projeto

### package.json

Crie o arquivo `package.json` para configurar as dependências e scripts do projeto:

```json title="package.json"
{
  "name": "ssr-demo-vue2",
  "version": "1.0.0",
  "type": "module",
  "private": true,
  "scripts": {
    "dev": "gez dev",
    "build": "npm run build:dts && npm run build:ssr",
    "build:ssr": "gez build",
    "preview": "gez preview",
    "start": "NODE_ENV=production node dist/index.js",
    "build:dts": "vue-tsc --declaration --emitDeclarationOnly --outDir dist/src"
  },
  "dependencies": {
    "@gez/core": "*"
  },
  "devDependencies": {
    "@gez/rspack-vue": "*",
    "@types/node": "22.8.6",
    "typescript": "^5.7.3",
    "vue": "^2.7.16",
    "vue-server-renderer": "^2.7.16",
    "vue-tsc": "^2.1.6"
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

Isso instalará todos os pacotes necessários, incluindo Vue2, TypeScript e dependências relacionadas ao SSR.

### tsconfig.json

Crie o arquivo `tsconfig.json` para configurar as opções de compilação do TypeScript:

```json title="tsconfig.json"
{
    "compilerOptions": {
        "module": "ESNext",
        "moduleResolution": "node",
        "isolatedModules": true,
        "resolveJsonModule": true,
        
        "target": "ESNext",
        "lib": ["ESNext", "DOM"],
        
        "strict": true,
        "skipLibCheck": true,
        "types": ["@types/node"],
        
        "experimentalDecorators": true,
        "allowSyntheticDefaultImports": true,
        
        "baseUrl": ".",
        "paths": {
            "ssr-demo-vue2/src/*": ["./src/*"],
            "ssr-demo-vue2/*": ["./*"]
        }
    },
    "include": ["src"],
    "exclude": ["dist", "node_modules"]
}
```

## Estrutura do Código-Fonte

### app.vue

Crie o componente principal da aplicação `src/app.vue`, utilizando a sintaxe `<script setup>`:

```html title="src/app.vue"
<template>
    <div id="app">
        <h1><a href="https://www.esmnext.com/guide/frameworks/vue2.html" target="_blank">Início Rápido com Gez</a></h1>
        <time :datetime="time">{{ time }}</time>
    </div>
</template>

<script setup lang="ts">
/**
 * @file Componente de Exemplo
 * @description Exibe um título de página com atualização automática de tempo, demonstrando funcionalidades básicas do Gez Framework
 */

import { onMounted, onUnmounted, ref } from 'vue';

// Tempo atual, atualizado a cada segundo
const time = ref(new Date().toISOString());
let timer: NodeJS.Timeout;

onMounted(() => {
    timer = setInterval(() => {
        time.value = new Date().toISOString();
    }, 1000);
});

onUnmounted(() => {
    clearInterval(timer);
});
</script>
```

### create-app.ts

Crie o arquivo `src/create-app.ts`, responsável por criar a instância da aplicação Vue:

```ts title="src/create-app.ts"
/**
 * @file Criação de Instância Vue
 * @description Responsável por criar e configurar a instância da aplicação Vue
 */

import Vue from 'vue';
import App from './app.vue';

export function createApp() {
    const app = new Vue({
        render: (h) => h(App)
    });
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

import { createApp } from './create-app';

// Cria a instância Vue
const { app } = createApp();

// Monta a instância Vue
app.$mount('#app');
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
     * @param gez Instância do Gez Framework, fornece funcionalidades principais e interfaces de configuração
     * @returns Retorna a instância configurada da aplicação Rspack, suportando HMR e visualização em tempo real
     */
    async devApp(gez) {
        return import('@gez/rspack-vue').then((m) =>
            m.createRspackVue2App(gez, {
                config(context) {
                    // Personalize a configuração de compilação do Rspack aqui
                }
            })
        );
    },

    /**
     * Configura e inicia o servidor HTTP
     * @description Cria a instância do servidor HTTP, integra middleware do Gez e processa requisições SSR
     * @param gez Instância do Gez Framework, fornece middleware e funcionalidades de renderização
     */
    async server(gez) {
        const server = http.createServer((req, res) => {
            // Usa middleware do Gez para processar requisições
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

1. Função `devApp`: Responsável por criar e configurar a instância da aplicação Rspack para o ambiente de desenvolvimento, suportando atualização em tempo real e visualização instantânea. Aqui, `createRspackVue2App` é usado para criar uma instância Rspack específica para Vue2.
2. Função `server`: Responsável por criar e configurar o servidor HTTP, integrando middleware do Gez para processar requisições SSR.

### entry.server.ts

Crie o arquivo de entrada para renderização no servidor `src/entry.server.ts`:

```ts title="src/entry.server.ts"
/**
 * @file Arquivo de Entrada do Servidor
 * @description Responsável pelo fluxo de renderização no servidor, geração de HTML e injeção de recursos
 */

import type { RenderContext } from '@gez/core';
import { createRenderer } from 'vue-server-renderer';
import { createApp } from './create-app';

// Cria o renderizador
const renderer = createRenderer();

export default async (rc: RenderContext) => {
    // Cria a instância da aplicação Vue
    const { app } = createApp();

    // Usa renderToString do Vue para gerar o conteúdo da página
    const html = await renderer.renderToString(app, {
        importMetaSet: rc.importMetaSet
    });

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
    ${html}
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

Agora, você criou com sucesso uma aplicação Vue2 SSR baseada no Gez Framework! Acesse http://localhost:3000 para ver o resultado.