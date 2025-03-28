---
titleSuffix: Referência da API de Configuração de Empacotamento do Framework Esmx
description: Detalha a interface de configuração PackConfig do framework Esmx, incluindo regras de empacotamento de pacotes, configuração de saída e ganchos de ciclo de vida, ajudando os desenvolvedores a implementar fluxos de construção padronizados.
head:
  - - meta
    - property: keywords
      content: Esmx, PackConfig, empacotamento de pacotes, configuração de construção, ganchos de ciclo de vida, configuração de empacotamento, framework de aplicação web
---

# PackConfig

`PackConfig` é a interface de configuração de empacotamento de pacotes, usada para empacotar os artefatos de construção de um serviço no formato padrão .tgz do npm.

- **Padronização**: Utiliza o formato de empacotamento .tgz padrão do npm
- **Integridade**: Inclui todos os arquivos necessários, como código-fonte do módulo, declarações de tipo e arquivos de configuração
- **Compatibilidade**: Totalmente compatível com o ecossistema npm, suportando fluxos de trabalho padrão de gerenciamento de pacotes

## Definição de Tipo

```ts
interface PackConfig {
    enable?: boolean;
    outputs?: string | string[] | boolean;
    packageJson?: (esmx: Esmx, pkg: Record<string, any>) => Promise<Record<string, any>>;
    onBefore?: (esmx: Esmx, pkg: Record<string, any>) => Promise<void>;
    onAfter?: (esmx: Esmx, pkg: Record<string, any>, file: Buffer) => Promise<void>;
}
```

### PackConfig

#### enable

Habilita ou desabilita a funcionalidade de empacotamento. Quando habilitado, os artefatos de construção são empacotados no formato padrão .tgz do npm.

- Tipo: `boolean`
- Valor padrão: `false`

#### outputs

Especifica o caminho de saída do arquivo do pacote. Suporta as seguintes configurações:
- `string`: Um único caminho de saída, por exemplo, 'dist/versions/my-app.tgz'
- `string[]`: Múltiplos caminhos de saída, usados para gerar várias versões simultaneamente
- `boolean`: Quando true, usa o caminho padrão 'dist/client/versions/latest.tgz'

#### packageJson

Função de callback para personalizar o conteúdo do package.json. Chamada antes do empacotamento, usada para personalizar o conteúdo do package.json.

- Parâmetros:
  - `esmx: Esmx` - Instância do Esmx
  - `pkg: any` - Conteúdo original do package.json
- Retorno: `Promise<any>` - Conteúdo modificado do package.json

Usos comuns:
- Modificar o nome e a versão do pacote
- Adicionar ou atualizar dependências
- Adicionar campos personalizados
- Configurar informações de publicação

Exemplo:
```ts
packageJson: async (esmx, pkg) => {
  // Definir informações do pacote
  pkg.name = 'my-app';
  pkg.version = '1.0.0';
  pkg.description = 'Minha aplicação';

  // Adicionar dependências
  pkg.dependencies = {
    'vue': '^3.0.0',
    'express': '^4.17.1'
  };

  // Adicionar configuração de publicação
  pkg.publishConfig = {
    registry: 'https://registry.example.com'
  };

  return pkg;
}
```

#### onBefore

Função de callback para preparação antes do empacotamento.

- Parâmetros:
  - `esmx: Esmx` - Instância do Esmx
  - `pkg: Record<string, any>` - Conteúdo do package.json
- Retorno: `Promise<void>`

Usos comuns:
- Adicionar arquivos adicionais (README, LICENSE, etc.)
- Executar testes ou validações de construção
- Gerar documentação ou metadados
- Limpar arquivos temporários

Exemplo:
```ts
onBefore: async (esmx, pkg) => {
  // Adicionar documentação
  await fs.writeFile('dist/README.md', '# My App');
  await fs.writeFile('dist/LICENSE', 'MIT License');

  // Executar testes
  await runTests();

  // Gerar documentação
  await generateDocs();

  // Limpar arquivos temporários
  await cleanupTempFiles();
}
```

#### onAfter

Função de callback para processamento após o empacotamento. Chamada após a geração do arquivo .tgz, usada para processar os artefatos de empacotamento.

- Parâmetros:
  - `esmx: Esmx` - Instância do Esmx
  - `pkg: Record<string, any>` - Conteúdo do package.json
  - `file: Buffer` - Conteúdo do arquivo empacotado
- Retorno: `Promise<void>`

Usos comuns:
- Publicar no repositório npm (público ou privado)
- Fazer upload para um servidor de recursos estáticos
- Gerenciar versões
- Disparar fluxos de CI/CD

Exemplo:
```ts
onAfter: async (esmx, pkg, file) => {
  // Publicar no repositório npm privado
  await publishToRegistry(file, {
    registry: 'https://registry.example.com'
  });

  // Fazer upload para o servidor de recursos estáticos
  await uploadToServer(file, 'https://assets.example.com/packages');

  // Criar tag de versão no Git
  await createGitTag(pkg.version);

  // Disparar processo de implantação
  await triggerDeploy(pkg.version);
}
```

## Exemplo de Uso

```ts title="entry.node.ts"
import type { EsmxOptions } from '@esmx/core';

export default {
  modules: {
    // Configurar módulos a serem exportados
    exports: [
      'root:src/components/button.vue',
      'root:src/utils/format.ts',
      'npm:vue',
      'npm:vue-router'
    ]
  },
  // Configuração de empacotamento
  pack: {
    // Habilitar funcionalidade de empacotamento
    enable: true,

    // Gerar múltiplas versões simultaneamente
    outputs: [
      'dist/versions/latest.tgz',
      'dist/versions/1.0.0.tgz'
    ],

    // Personalizar package.json
    packageJson: async (esmx, pkg) => {
      pkg.version = '1.0.0';
      return pkg;
    },

    // Preparação antes do empacotamento
    onBefore: async (esmx, pkg) => {
      // Adicionar arquivos necessários
      await fs.writeFile('dist/README.md', '# Your App\n\nExplicação da exportação de módulos...');
      // Executar verificação de tipos
      await runTypeCheck();
    },

    // Processamento após o empacotamento
    onAfter: async (esmx, pkg, file) => {
      // Publicar no repositório npm privado
      await publishToRegistry(file, {
        registry: 'https://npm.your-registry.com/'
      });
      // Ou fazer upload para o servidor estático
      await uploadToServer(file, 'https://static.example.com/packages');
    }
  }
} satisfies EsmxOptions;
```