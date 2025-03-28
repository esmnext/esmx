---
titleSuffix: Referência da API de Configuração de Módulos do Framework Esmx
description: Detalha a interface de configuração ModuleConfig do framework Esmx, incluindo regras de importação e exportação de módulos, configuração de aliases e gerenciamento de dependências externas, ajudando os desenvolvedores a entender profundamente o sistema modular do framework.
head:
  - - meta
    - property: keywords
      content: Esmx, ModuleConfig, configuração de módulos, importação e exportação de módulos, dependências externas, configuração de aliases, gerenciamento de dependências, framework de aplicações web
---

# ModuleConfig

O ModuleConfig fornece a funcionalidade de configuração de módulos do framework Esmx, usada para definir regras de importação e exportação de módulos, configuração de aliases e dependências externas.

## Definição de Tipos

### PathType

- **Definição de Tipo**:
```ts
enum PathType {
  npm = 'npm:', 
  root = 'root:'
}
```

Enumeração de tipos de caminho de módulo:
- `npm`: Representa dependências no node_modules
- `root`: Representa arquivos no diretório raiz do projeto

### ModuleConfig

- **Definição de Tipo**:
```ts
interface ModuleConfig {
  exports?: string[]
  links?: Record<string, string>
  imports?: Record<string, string>
}
```

Interface de configuração de módulo, usada para definir a exportação, importação e configuração de dependências externas do serviço.

#### exports

Lista de configuração de exportação, que expõe unidades de código específicas (como componentes, funções utilitárias, etc.) no serviço no formato ESM.

Suporta dois tipos:
- `root:*`: Exporta arquivos de código-fonte, por exemplo: `root:src/components/button.vue`
- `npm:*`: Exporta dependências de terceiros, por exemplo: `npm:vue`

Cada item de exportação contém os seguintes atributos:
- `name`: Caminho de exportação original, por exemplo: `npm:vue` ou `root:src/components`
- `type`: Tipo de caminho (`npm` ou `root`)
- `importName`: Nome de importação, no formato: `${serviceName}/${type}/${path}`
- `exportName`: Caminho de exportação, relativo ao diretório raiz do serviço
- `exportPath`: Caminho real do arquivo
- `externalName`: Nome da dependência externa, usado como identificador quando outros serviços importam este módulo

#### links

Mapeamento de configuração de dependências do serviço, usado para configurar outros serviços (locais ou remotos) dos quais o serviço atual depende e seus caminhos locais. A chave de cada item de configuração é o nome do serviço e o valor é o caminho local desse serviço.

A configuração varia dependendo do método de instalação:
- Instalação de código-fonte (Workspace, Git): Precisa apontar para o diretório dist, pois usa os arquivos construídos
- Instalação de pacote (Link, servidor estático, repositório privado, File): Aponta diretamente para o diretório do pacote, pois o pacote já contém os arquivos construídos

#### imports

Mapeamento de dependências externas, configurando as dependências externas a serem usadas, geralmente dependências de módulos remotos.

Cada dependência contém os seguintes atributos:
- `match`: Expressão regular usada para corresponder às instruções de importação
- `import`: Caminho real do módulo

**Exemplo**:
```ts title="entry.node.ts"
import type { EsmxOptions } from '@esmx/core';

export default {
  modules: {
    // Configuração de exportação
    exports: [
      'root:src/components/button.vue',  // Exporta arquivo de código-fonte
      'root:src/utils/format.ts',
      'npm:vue',  // Exporta dependência de terceiros
      'npm:vue-router'
    ],

    // Configuração de importação
    links: {
      // Método de instalação de código-fonte: precisa apontar para o diretório dist
      'ssr-remote': 'root:./node_modules/ssr-remote/dist',
      // Método de instalação de pacote: aponta diretamente para o diretório do pacote
      'other-remote': 'root:./node_modules/other-remote'
    },

    // Configuração de dependências externas
    imports: {
      'vue': 'ssr-remote/npm/vue',
      'vue-router': 'ssr-remote/npm/vue-router'
    }
  }
} satisfies EsmxOptions;
```

### ParsedModuleConfig

- **Definição de Tipo**:
```ts
interface ParsedModuleConfig {
  name: string
  root: string
  exports: {
    name: string
    type: PathType
    importName: string
    exportName: string
    exportPath: string
    externalName: string
  }[]
  links: Array<{
    /**
     * Nome do pacote
     */
    name: string
    /**
     * Diretório raiz do pacote
     */
    root: string
  }>
  imports: Record<string, { match: RegExp; import?: string }>
}
```

Configuração de módulo analisada, que converte a configuração de módulo original em um formato interno padronizado:

#### name
Nome do serviço atual
- Usado para identificar o módulo e gerar o caminho de importação

#### root
Caminho do diretório raiz do serviço atual
- Usado para resolver caminhos relativos e o armazenamento dos artefatos de construção

#### exports
Lista de configuração de exportação
- `name`: Caminho de exportação original, por exemplo: 'npm:vue' ou 'root:src/components'
- `type`: Tipo de caminho (npm ou root)
- `importName`: Nome de importação, no formato: '${serviceName}/${type}/${path}'
- `exportName`: Caminho de exportação, relativo ao diretório raiz do serviço
- `exportPath`: Caminho real do arquivo
- `externalName`: Nome da dependência externa, usado como identificador quando outros serviços importam este módulo

#### links
Lista de configuração de importação
- `name`: Nome do pacote
- `root`: Diretório raiz do pacote

#### imports
Mapeamento de dependências externas
- Mapeia o caminho de importação do módulo para a localização real do módulo
- `match`: Expressão regular usada para corresponder às instruções de importação
- `import`: Caminho real do módulo
```