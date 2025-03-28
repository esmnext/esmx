---
titleSuffix: Esmx Framework - Motor de Build de Alto Desempenho
description: Análise aprofundada do sistema de build Rspack do framework Esmx, incluindo compilação de alto desempenho, build para múltiplos ambientes, otimização de recursos e outras funcionalidades principais, ajudando desenvolvedores a construir aplicações web modernas eficientes e confiáveis.
head:
  - - meta
    - property: keywords
      content: Esmx, Rspack, Sistema de Build, Compilação de Alto Desempenho, Atualização a Quente (HMR), Build para Múltiplos Ambientes, Tree Shaking, Divisão de Código, SSR, Otimização de Recursos, Eficiência de Desenvolvimento, Ferramenta de Build
---

# Rspack

O Esmx é construído com base no sistema de build [Rspack](https://rspack.dev/), aproveitando ao máximo a capacidade de build de alto desempenho do Rspack. Este documento apresenta o posicionamento e as funcionalidades principais do Rspack no framework Esmx.

## Funcionalidades

O Rspack é o sistema de build central do framework Esmx, oferecendo as seguintes funcionalidades-chave:

- **Build de Alto Desempenho**: Motor de build implementado em Rust, proporcionando velocidade de compilação extremamente rápida, melhorando significativamente a velocidade de build em projetos grandes.
- **Otimização da Experiência de Desenvolvimento**: Suporte a atualização a quente (HMR), compilação incremental e outras funcionalidades modernas de desenvolvimento, proporcionando uma experiência de desenvolvimento fluida.
- **Build para Múltiplos Ambientes**: Configuração de build unificada para ambientes de cliente (client), servidor (server) e Node.js (node), simplificando o fluxo de desenvolvimento multiplataforma.
- **Otimização de Recursos**: Capacidade integrada de processamento e otimização de recursos, com suporte a divisão de código, Tree Shaking, compressão de recursos, entre outros.

## Construindo Aplicações

O sistema de build Rspack do Esmx é projetado de forma modular, contendo principalmente os seguintes módulos centrais:

### @esmx/rspack

Módulo de build básico, oferecendo as seguintes capacidades principais:

- **Configuração de Build Unificada**: Gerenciamento padronizado de configurações de build, com suporte a configurações para múltiplos ambientes.
- **Processamento de Recursos**: Capacidade integrada de processamento de recursos como TypeScript, CSS, imagens, etc.
- **Otimização de Build**: Oferece funcionalidades de otimização de desempenho, como divisão de código e Tree Shaking.
- **Servidor de Desenvolvimento**: Integra um servidor de desenvolvimento de alto desempenho, com suporte a HMR.

### @esmx/rspack-vue

Módulo de build específico para o framework Vue, oferecendo:

- **Compilação de Componentes Vue**: Suporte à compilação eficiente de componentes Vue 2/3.
- **Otimização para SSR**: Otimizações específicas para cenários de renderização no lado do servidor (SSR).
- **Aprimoramentos de Desenvolvimento**: Funcionalidades específicas para aprimorar o ambiente de desenvolvimento Vue.

## Fluxo de Build

O fluxo de build do Esmx é dividido principalmente nas seguintes etapas:

1. **Inicialização da Configuração**
   - Carregamento da configuração do projeto
   - Fusão das configurações padrão com as configurações do usuário
   - Ajuste da configuração com base em variáveis de ambiente

2. **Compilação de Recursos**
   - Resolução de dependências do código-fonte
   - Transformação de diversos recursos (TypeScript, CSS, etc.)
   - Processamento de importações e exportações de módulos

3. **Processamento de Otimização**
   - Execução da divisão de código
   - Aplicação de Tree Shaking
   - Compressão de código e recursos

4. **Geração de Saída**
   - Geração de arquivos de destino
   - Saída de mapeamento de recursos
   - Geração de relatórios de build

## Melhores Práticas

### Otimização do Ambiente de Desenvolvimento

- **Configuração de Compilação Incremental**: Configure adequadamente a opção `cache` para aproveitar o cache e acelerar o tempo de build.
- **Otimização de HMR**: Configure o escopo de atualização a quente de forma direcionada, evitando atualizações desnecessárias de módulos.
- **Otimização de Processamento de Recursos**: Use configurações adequadas de loader para evitar processamento repetitivo.

### Otimização do Ambiente de Produção

- **Estratégia de Divisão de Código**: Configure adequadamente `splitChunks` para otimizar o carregamento de recursos.
- **Compressão de Recursos**: Ative configurações de compressão adequadas para equilibrar o tempo de build e o tamanho dos artefatos.
- **Otimização de Cache**: Utilize hashes de conteúdo e estratégias de cache de longo prazo para melhorar o desempenho de carregamento.

## Exemplo de Configuração

```ts title="src/entry.node.ts"
import type { EsmxOptions } from '@esmx/core';

export default {
    async devApp(esmx) {
        return import('@esmx/rspack').then((m) =>
            m.createRspackHtmlApp(esmx, {
                // Configuração personalizada de build
                config({ config }) {
                    // Adicione configurações personalizadas do Rspack aqui
                }
            })
        );
    },
} satisfies EsmxOptions;
```

::: tip
Para mais detalhes sobre a API e opções de configuração, consulte a [Documentação da API do Rspack](/api/app/rspack.html).
:::