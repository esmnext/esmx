---
titleSuffix: Guia de Mapeamento de Caminhos de Importação de Módulos do Framework Esmx
description: Detalha o mecanismo de alias de caminhos do framework Esmx, incluindo simplificação de caminhos de importação, prevenção de aninhamento profundo, segurança de tipos e otimização de resolução de módulos, ajudando desenvolvedores a melhorar a manutenibilidade do código.
head:
  - - meta
    - property: keywords
      content: Esmx, Alias de Caminho, Path Alias, TypeScript, Importação de Módulos, Mapeamento de Caminhos, Manutenibilidade de Código
---

# Alias de Caminho

O alias de caminho (Path Alias) é um mecanismo de mapeamento de caminhos de importação de módulos que permite aos desenvolvedores usar identificadores curtos e semânticos no lugar de caminhos completos de módulos. No Esmx, o mecanismo de alias de caminho oferece as seguintes vantagens:

- **Simplificação de caminhos de importação**: Uso de aliases semânticos no lugar de caminhos relativos longos, melhorando a legibilidade do código
- **Prevenção de aninhamento profundo**: Elimina dificuldades de manutenção causadas por referências de diretórios com múltiplos níveis (como `../../../../`)
- **Segurança de tipos**: Totalmente integrado ao sistema de tipos do TypeScript, fornecendo autocompletar e verificação de tipos
- **Otimização de resolução de módulos**: Melhora o desempenho da resolução de módulos através de mapeamentos de caminhos pré-definidos

## Mecanismo de Alias Padrão

O Esmx adota um mecanismo de alias automático baseado no nome do serviço (Service Name), com um design que prioriza convenções em vez de configurações, apresentando as seguintes características:

- **Configuração automática**: Gera aliases automaticamente com base no campo `name` do `package.json`, sem necessidade de configuração manual
- **Padronização unificada**: Garante que todos os módulos de serviço sigam uma convenção consistente de nomenclatura e referência
- **Suporte a tipos**: Em conjunto com o comando `npm run build:dts`, gera automaticamente arquivos de declaração de tipos, permitindo inferência de tipos entre serviços
- **Previsibilidade**: Permite inferir o caminho de referência do módulo a partir do nome do serviço, reduzindo custos de manutenção

## Configuração

### Configuração do package.json

No `package.json`, o nome do serviço é definido pelo campo `name`, que servirá como prefixo padrão para o alias do serviço:

```json title="package.json"
{
    "name": "your-app-name"
}
```

### Configuração do tsconfig.json

Para que o TypeScript possa resolver corretamente os caminhos de alias, é necessário configurar o mapeamento `paths` no `tsconfig.json`:

```json title="tsconfig.json"
{
    "compilerOptions": {
        "paths": {
            "your-app-name/src/*": [
                "./src/*"
            ],
            "your-app-name/*": [
                "./*"
            ]
        }
    }
}
```

## Exemplos de Uso

### Importação de Módulos Internos do Serviço

```ts
// Uso de alias para importação
import { MyComponent } from 'your-app-name/src/components';

// Importação equivalente com caminho relativo
import { MyComponent } from '../components';
```

### Importação de Módulos de Outros Serviços

```ts
// Importação de componentes de outro serviço
import { SharedComponent } from 'other-service/src/components';

// Importação de funções utilitárias de outro serviço
import { utils } from 'other-service/src/utils';
```

::: tip Boas Práticas
- Priorize o uso de caminhos de alias em vez de caminhos relativos
- Mantenha os caminhos de alias semânticos e consistentes
- Evite o uso excessivo de níveis de diretórios em caminhos de alias

:::

``` ts
// Importação de componentes
import { Button } from 'your-app-name/src/components';
import { Layout } from 'your-app-name/src/components/layout';

// Importação de funções utilitárias
import { formatDate } from 'your-app-name/src/utils';
import { request } from 'your-app-name/src/utils/request';

// Importação de definições de tipos
import type { UserInfo } from 'your-app-name/src/types';
```

### Importação entre Serviços

Após configurar o link de módulos (Module Link), é possível importar módulos de outros serviços da mesma forma:

```ts
// Importação de componentes de um serviço remoto
import { Header } from 'remote-service/src/components';

// Importação de funções utilitárias de um serviço remoto
import { logger } from 'remote-service/src/utils';
```

### Alias Personalizados

Para pacotes de terceiros ou cenários específicos, é possível definir aliases personalizados através do arquivo de configuração do Esmx:

```ts title="src/entry.node.ts"
export default {
    async devApp(esmx) {
        return import('@esmx/rspack').then((m) =>
            m.createApp(esmx, (buildContext) => {
                buildContext.config.resolve = {
                    ...buildContext.config.resolve,
                    alias: {
                        ...buildContext.config.resolve?.alias,
                        // Configuração de versão específica para Vue
                        'vue$': 'vue/dist/vue.esm.js',
                        // Configuração de aliases curtos para diretórios comuns
                        '@': './src',
                        '@components': './src/components'
                    }
                }
            })
        );
    }
} satisfies EsmxOptions;
```

::: warning Considerações
1. Para módulos de negócios, recomenda-se sempre usar o mecanismo de alias padrão para manter a consistência do projeto
2. Aliases personalizados são principalmente usados para tratar necessidades específicas de pacotes de terceiros ou otimizar a experiência de desenvolvimento
3. O uso excessivo de aliases personalizados pode prejudicar a manutenibilidade do código e a otimização de builds

:::