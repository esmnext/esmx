---
titleSuffix: Guia de Compatibilidade do Framework Esmx
description: Detalha os requisitos de ambiente do framework Esmx, incluindo requisitos de versão do Node.js e compatibilidade do navegador, ajudando os desenvolvedores a configurar corretamente o ambiente de desenvolvimento.
head:
  - - meta
    - property: keywords
      content: Esmx, Node.js, Compatibilidade do Navegador, TypeScript, es-module-shims, Configuração do Ambiente
---

# Requisitos de Ambiente

Este documento descreve os requisitos de ambiente necessários para usar este framework, incluindo o ambiente Node.js e a compatibilidade do navegador.

## Ambiente Node.js

O framework requer Node.js versão >= 22.6, principalmente para suportar a importação de tipos TypeScript (através da flag `--experimental-strip-types`), sem a necessidade de etapas adicionais de compilação.

## Compatibilidade do Navegador

O framework é construído por padrão no modo de compatibilidade para suportar uma gama mais ampla de navegadores. No entanto, é importante notar que, para obter suporte completo de compatibilidade do navegador, é necessário adicionar manualmente a dependência [es-module-shims](https://github.com/guybedford/es-module-shims).

### Modo de Compatibilidade (Padrão)
- 🌐 Chrome: >= 87
- 🔷 Edge: >= 88
- 🦊 Firefox: >= 78
- 🧭 Safari: >= 14

De acordo com as estatísticas do [Can I Use](https://caniuse.com/?search=dynamic%20import), a cobertura de navegadores no modo de compatibilidade é de 96,81%.

### Modo de Suporte Nativo
- 🌐 Chrome: >= 89
- 🔷 Edge: >= 89
- 🦊 Firefox: >= 108
- 🧭 Safari: >= 16.4

O modo de suporte nativo oferece as seguintes vantagens:
- Zero sobrecarga de tempo de execução, sem a necessidade de carregadores de módulos adicionais
- Análise nativa pelo navegador, resultando em maior velocidade de execução
- Melhor capacidade de divisão de código e carregamento sob demanda

De acordo com as estatísticas do [Can I Use](https://caniuse.com/?search=importmap), a cobertura de navegadores no modo de suporte nativo é de 93,5%.

### Habilitando Suporte de Compatibilidade

::: warning Aviso Importante
Embora o framework seja construído por padrão no modo de compatibilidade, para obter suporte completo a navegadores mais antigos, você precisa adicionar a dependência [es-module-shims](https://github.com/guybedford/es-module-shims) ao seu projeto.

:::

Adicione o seguinte script ao seu arquivo HTML:

```html
<!-- Ambiente de Desenvolvimento -->
<script async src="https://ga.jspm.io/npm:es-module-shims@2.0.10/dist/es-module-shims.js"></script>

<!-- Ambiente de Produção -->
<script async src="/path/to/es-module-shims.js"></script>
```

::: tip Melhores Práticas

1. Recomendações para o ambiente de produção:
   - Implante o es-module-shims em seu próprio servidor
   - Garanta a estabilidade e velocidade de carregamento dos recursos
   - Evite possíveis riscos de segurança
2. Considerações de desempenho:
   - O modo de compatibilidade traz uma pequena sobrecarga de desempenho
   - Decida se deseja habilitar com base na distribuição de navegadores do seu público-alvo

:::