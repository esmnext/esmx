---
titleSuffix: Guia de Estrutura e Padrões de Projeto do Framework Esmx
description: Detalha a estrutura padrão de projeto do framework Esmx, especificações de arquivos de entrada e configurações, ajudando desenvolvedores a construir aplicações SSR padronizadas e de fácil manutenção.
head:
  - - meta
    - property: keywords
      content: Esmx, estrutura de projeto, arquivo de entrada, padrões de configuração, framework SSR, TypeScript, padrões de projeto, padrões de desenvolvimento
---

# Padrões Padrão

Esmx é um framework SSR moderno que adota uma estrutura de projeto padronizada e mecanismos de resolução de caminhos para garantir consistência e manutenibilidade em ambientes de desenvolvimento e produção.

## Padrões de Estrutura de Projeto

### Estrutura de Diretórios Padrão

```txt
root
│─ dist                  # Diretório de saída da compilação
│  ├─ package.json       # Configuração do pacote após a compilação
│  ├─ server             # Saída da compilação do servidor
│  │  └─ manifest.json   # Saída do manifesto de compilação, usado para gerar importmap
│  ├─ node               # Saída da compilação do programa do servidor Node
│  ├─ client             # Saída da compilação do cliente
│  │  ├─ versions        # Diretório de armazenamento de versões
│  │  │  └─ latest.tgz   # Arquiva o diretório dist, fornecendo distribuição de pacotes
│  │  └─ manifest.json   # Saída do manifesto de compilação, usado para gerar importmap
│  └─ src                # Tipos de arquivos gerados pelo tsc
├─ src
│  ├─ entry.server.ts    # Ponto de entrada da aplicação do servidor
│  ├─ entry.client.ts    # Ponto de entrada da aplicação do cliente
│  └─ entry.node.ts      # Ponto de entrada da aplicação do servidor Node
├─ tsconfig.json         # Configuração do TypeScript
└─ package.json          # Configuração do pacote
```

::: tip Conhecimento Adicional
- `esmx.name` é derivado do campo `name` no `package.json`
- `dist/package.json` é derivado do `package.json` na raiz
- O diretório `dist` só será arquivado se `packs.enable` estiver definido como `true`

:::

## Padrões de Arquivos de Entrada

### entry.client.ts
O arquivo de entrada do cliente é responsável por:
- **Inicializar a aplicação**: Configurar as configurações básicas da aplicação do cliente
- **Gerenciar rotas**: Lidar com rotas e navegação do cliente
- **Gerenciar estado**: Implementar armazenamento e atualização do estado do cliente
- **Processar interações**: Gerenciar eventos do usuário e interações da interface

### entry.server.ts
O arquivo de entrada do servidor é responsável por:
- **Renderização do lado do servidor**: Executar o processo de renderização SSR
- **Geração de HTML**: Construir a estrutura inicial da página
- **Pré-busca de dados**: Lidar com a obtenção de dados no servidor
- **Injeção de estado**: Passar o estado do servidor para o cliente
- **Otimização de SEO**: Garantir a otimização para motores de busca

### entry.node.ts
O arquivo de entrada do servidor Node.js é responsável por:
- **Configuração do servidor**: Definir parâmetros do servidor HTTP
- **Processamento de rotas**: Gerenciar regras de roteamento do servidor
- **Integração de middleware**: Configurar middleware do servidor
- **Gerenciamento de ambiente**: Lidar com variáveis de ambiente e configurações
- **Resposta a requisições**: Processar requisições e respostas HTTP

## Padrões de Arquivos de Configuração

### package.json

```json title="package.json"
{
    "name": "your-app-name",
    "type": "module",
    "scripts": {
        "dev": "esmx dev",
        "build": "npm run build:dts && npm run build:ssr",
        "build:ssr": "esmx build",
        "build:dts": "tsc --declaration --emitDeclarationOnly --outDir dist/src",
        "preview": "esmx preview",
        "start": "NODE_ENV=production node dist/index.js"
    }
}
```

### tsconfig.json

```json title="tsconfig.json"
{
    "compilerOptions": {
        "isolatedModules": true,
        "allowJs": false,
        "experimentalDecorators": true,
        "resolveJsonModule": true,
        "types": [
            "@types/node"
        ],
        "target": "ESNext",
        "module": "ESNext",
        "importHelpers": false,
        "declaration": true,
        "sourceMap": true,
        "strict": true,
        "noImplicitAny": false,
        "noImplicitReturns": false,
        "noFallthroughCasesInSwitch": true,
        "noUnusedLocals": false,
        "noUnusedParameters": false,
        "moduleResolution": "node",
        "esModuleInterop": true,
        "skipLibCheck": true,
        "allowSyntheticDefaultImports": true,
        "forceConsistentCasingInFileNames": true,
        "noEmit": true
    },
    "include": [
        "src",
        "**.ts"
    ],
    "exclude": [
        "dist"
    ]
}
```