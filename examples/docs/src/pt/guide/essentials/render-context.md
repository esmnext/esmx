---
titleSuffix: Mecanismo de Renderização no Lado do Servidor do Framework Esmx
description: Detalhes sobre o mecanismo de contexto de renderização (RenderContext) do framework Esmx, incluindo gerenciamento de recursos, geração de HTML e sistema de módulos ESM, para ajudar desenvolvedores a entender e utilizar a funcionalidade de renderização no lado do servidor (SSR).
head:
  - - meta
    - property: keywords
      content: Esmx, contexto de renderização, RenderContext, SSR, renderização no lado do servidor, ESM, gerenciamento de recursos
---

# Contexto de Renderização

O RenderContext é uma classe central no framework Esmx, responsável principalmente pelo gerenciamento de recursos e geração de HTML durante o processo de renderização no lado do servidor (SSR). Ele possui as seguintes características principais:

1. **Sistema de Módulos Baseado em ESM**
   - Utiliza o padrão moderno de ECMAScript Modules
   - Suporta importação e exportação nativa de módulos
   - Implementa divisão de código e carregamento sob demanda de forma mais eficiente

2. **Coleta Inteligente de Dependências**
   - Coleta dinamicamente dependências com base no caminho de renderização real
   - Evita o carregamento desnecessário de recursos
   - Suporta componentes assíncronos e importação dinâmica

3. **Injeção Precisa de Recursos**
   - Controla rigorosamente a ordem de carregamento de recursos
   - Otimiza o desempenho do carregamento da primeira tela
   - Garante a confiabilidade da ativação no cliente (Hydration)

4. **Mecanismo de Configuração Flexível**
   - Suporta configuração dinâmica de caminho base
   - Oferece vários modos de mapeamento de importação
   - Adapta-se a diferentes cenários de implantação

## Modo de Uso

No framework Esmx, os desenvolvedores geralmente não precisam criar instâncias de RenderContext diretamente, mas sim obtê-las através do método `esmx.render()`:

```ts title="src/entry.node.ts"
async server(esmx) {
    const server = http.createServer((req, res) => {
        // Tratamento de arquivos estáticos
        esmx.middleware(req, res, async () => {
            // Obtém a instância de RenderContext através de esmx.render()
            const rc = await esmx.render({
                params: {
                    url: req.url
                }
            });
            // Responde com o conteúdo HTML
            res.end(rc.html);
        });
    });
}
```

## Funcionalidades Principais

### Coleta de Dependências

O RenderContext implementa um mecanismo inteligente de coleta de dependências, que coleta dinamicamente as dependências com base nos componentes realmente renderizados, em vez de pré-carregar todos os recursos possíveis:

#### Coleta Sob Demanda
- Rastreia e registra automaticamente as dependências de módulos durante a renderização real dos componentes
- Coleta apenas os recursos CSS, JavaScript, etc., que são realmente usados na renderização da página atual
- Registra com precisão as relações de dependência de módulos de cada componente através de `importMetaSet`
- Suporta coleta de dependências de componentes assíncronos e importação dinâmica

#### Processamento Automatizado
- Os desenvolvedores não precisam gerenciar manualmente o processo de coleta de dependências
- O framework coleta automaticamente as informações de dependência durante a renderização dos componentes
- Processa todos os recursos coletados de forma unificada através do método `commit()`
- Lida automaticamente com problemas de dependências circulares e repetidas

#### Otimização de Desempenho
- Evita o carregamento de módulos não utilizados, reduzindo significativamente o tempo de carregamento da primeira tela
- Controla com precisão a ordem de carregamento de recursos, otimizando o desempenho de renderização da página
- Gera automaticamente o mapeamento de importação (Import Map) ideal
- Suporta estratégias de pré-carregamento e carregamento sob demanda de recursos

### Injeção de Recursos

O RenderContext fornece vários métodos para injetar diferentes tipos de recursos, cada um projetado para otimizar o desempenho de carregamento de recursos:

- `preload()`: Pré-carrega recursos CSS e JS, com suporte para configuração de prioridade
- `css()`: Injeta folhas de estilo para a primeira tela, com suporte para extração de CSS crítico
- `importmap()`: Injeta mapeamento de importação de módulos, com suporte para resolução dinâmica de caminhos
- `moduleEntry()`: Injeta o módulo de entrada do cliente, com suporte para configuração de múltiplas entradas
- `modulePreload()`: Pré-carrega dependências de módulos, com suporte para estratégias de carregamento sob demanda

### Ordem de Injeção de Recursos

O RenderContext controla rigorosamente a ordem de injeção de recursos, projetada com base no funcionamento do navegador e considerações de otimização de desempenho:

1. Parte head:
   - `preload()`: Pré-carrega recursos CSS e JS, permitindo que o navegador os descubra e comece a carregar o mais cedo possível
   - `css()`: Injeta folhas de estilo para a primeira tela, garantindo que os estilos da página estejam prontos quando o conteúdo for renderizado

2. Parte body:
   - `importmap()`: Injeta mapeamento de importação de módulos, definindo regras de resolução de caminhos para módulos ESM
   - `moduleEntry()`: Injeta o módulo de entrada do cliente, que deve ser executado após o importmap
   - `modulePreload()`: Pré-carrega dependências de módulos, que deve ser executado após o importmap

## Fluxo Completo de Renderização

Um fluxo típico de uso do RenderContext é o seguinte:

```ts title="src/entry.server.ts"
export default async (rc: RenderContext) => {
    // 1. Renderiza o conteúdo da página e coleta dependências
    const app = createApp();
    const html = await renderToString(app, {
       importMetaSet: rc.importMetaSet
    });

    // 2. Confirma a coleta de dependências
    await rc.commit();
    
    // 3. Gera o HTML completo
    rc.html = `
        <!DOCTYPE html>
        <html>
        <head>
            ${rc.preload()}
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

## Recursos Avançados

### Configuração de Caminho Base

O RenderContext fornece um mecanismo flexível de configuração dinâmica de caminho base, permitindo definir dinamicamente o caminho base para recursos estáticos em tempo de execução:

```ts title="src/entry.node.ts"
const rc = await esmx.render({
    base: '/esmx',  // Define o caminho base
    params: {
        url: req.url
    }
});
```

Esse mecanismo é particularmente útil nos seguintes cenários:

1. **Implantações de Sites Multilíngues**
   ```
   dominio.com      → Idioma padrão
   dominio.com/cn/  → Site em chinês
   dominio.com/en/  → Site em inglês
   ```

2. **Aplicações Microfrontend**
   - Suporta a implantação flexível de subaplicações em diferentes caminhos
   - Facilita a integração em diferentes aplicações principais

### Modos de Mapeamento de Importação

O RenderContext oferece dois modos de mapeamento de importação (Import Map):

1. **Modo Inline** (padrão)
   - Inclui o mapeamento de importação diretamente no HTML
   - Adequado para aplicações pequenas, reduzindo solicitações de rede adicionais
   - Disponível imediatamente ao carregar a página

2. **Modo JS**
   - Carrega o mapeamento de importação através de um arquivo JavaScript externo
   - Adequado para aplicações grandes, permitindo aproveitar o mecanismo de cache do navegador
   - Suporta atualização dinâmica do conteúdo do mapeamento

É possível escolher o modo apropriado através da configuração:

```ts title="src/entry.node.ts"
const rc = await esmx.render({
    importmapMode: 'js',  // 'inline' | 'js'
    params: {
        url: req.url
    }
});
```

### Configuração de Função de Entrada

O RenderContext suporta a configuração de `entryName` para especificar a função de entrada para renderização no lado do servidor:

```ts title="src/entry.node.ts"
const rc = await esmx.render({
    entryName: 'mobile',  // Especifica a função de entrada para dispositivos móveis
    params: {
        url: req.url
    }
});
```

Esse mecanismo é particularmente útil nos seguintes cenários:

1. **Renderização de Múltiplos Modelos**
   ```ts title="src/entry.server.ts"
   // Função de entrada para dispositivos móveis
   export const mobile = async (rc: RenderContext) => {
       // Lógica de renderização específica para dispositivos móveis
   };

   // Função de entrada para desktop
   export const desktop = async (rc: RenderContext) => {
       // Lógica de renderização específica para desktop
   };
   ```

2. **Testes A/B**
   - Suporta diferentes lógicas de renderização para a mesma página
   - Facilita experimentos de experiência do usuário
   - Permite alternar flexivelmente entre diferentes estratégias de renderização

3. **Requisitos Específicos de Renderização**
   - Suporta fluxos de renderização personalizados para determinadas páginas
   - Adapta-se a necessidades de otimização de desempenho em diferentes cenários
   - Permite um controle mais refinado da renderização

## Melhores Práticas

1. **Obtenção de Instância de RenderContext**
   - Sempre obtenha a instância através do método `esmx.render()`
   - Passe os parâmetros apropriados conforme necessário
   - Evite criar instâncias manualmente

2. **Coleta de Dependências**
   - Certifique-se de que todos os módulos chamem corretamente `importMetaSet.add(import.meta)`
   - Chame o método `commit()` imediatamente após a renderização
   - Use componentes assíncronos e importação dinâmica de forma adequada para otimizar o carregamento da primeira tela

3. **Injeção de Recursos**
   - Siga rigorosamente a ordem de injeção de recursos
   - Não injete CSS no body
   - Certifique-se de que o importmap seja executado antes do moduleEntry

4. **Otimização de Desempenho**
   - Use preload para pré-carregar recursos críticos
   - Use modulePreload de forma adequada para otimizar o carregamento de módulos
   - Evite o carregamento desnecessário de recursos
   - Aproveite o mecanismo de cache do navegador para otimizar o desempenho de carregamento