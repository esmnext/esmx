---
titleSuffix: "Do dilema do micro frontend à inovação do ESM: A jornada de evolução do framework Esmx"
description: Explore em profundidade a evolução do framework Esmx, desde os desafios da arquitetura tradicional de micro frontend até as inovações baseadas em ESM, compartilhando práticas técnicas em otimização de desempenho, gerenciamento de dependências e seleção de ferramentas de construção.
head:
  - - meta
    - property: keywords
      content: Esmx, framework de micro frontend, ESM, Import Maps, Rspack, Module Federation, gerenciamento de dependências, otimização de desempenho, evolução técnica, renderização no lado do servidor
sidebar: false
---

# Do compartilhamento de componentes à modularização nativa: A jornada de evolução do framework Esmx de micro frontend

## Contexto do Projeto

Nos últimos anos, a arquitetura de micro frontend tem buscado um caminho correto. No entanto, o que vemos são várias soluções técnicas complexas que usam camadas de encapsulamento e isolamento artificial para simular um mundo ideal de micro frontend. Essas soluções trazem um pesado custo de desempenho, tornando o desenvolvimento simples em algo complexo e os processos padrão em algo obscuro.

### Limitações das Soluções Tradicionais

Na prática da arquitetura de micro frontend, percebemos profundamente as várias limitações das soluções tradicionais:

- **Perda de desempenho**: Injeção de dependências em tempo de execução, proxy de sandbox JS, cada operação consome um desempenho precioso
- **Isolamento frágil**: Ambientes de sandbox criados artificialmente nunca alcançam a capacidade de isolamento nativo do navegador
- **Complexidade de construção**: Para lidar com as dependências, é necessário modificar as ferramentas de construção, tornando projetos simples difíceis de manter
- **Regras personalizadas**: Estratégias de implantação especiais, processamento em tempo de execução, cada passo se desvia do fluxo padrão de desenvolvimento moderno
- **Limitações do ecossistema**: Acoplamento de frameworks, APIs personalizadas, limitando a escolha de tecnologias a ecossistemas específicos

Esses problemas foram particularmente evidentes em um projeto corporativo de grande escala em 2019. Na época, um grande produto foi dividido em mais de dez subsistemas de negócios independentes, que precisavam compartilhar um conjunto de componentes básicos e de negócios. A solução inicial de compartilhamento de componentes baseada em pacotes npm revelou sérios problemas de eficiência de manutenção: quando um componente compartilhado era atualizado, todos os subsistemas que dependiam dele precisavam passar por um processo completo de construção e implantação.

## Evolução Técnica

### v1.0: Explorando Componentes Remotos

Para resolver o problema de eficiência no compartilhamento de componentes, o Esmx v1.0 introduziu o mecanismo de componente RemoteView baseado no protocolo HTTP. Essa solução implementou a montagem de código sob demanda entre serviços por meio de solicitações dinâmicas em tempo de execução, resolvendo com sucesso o problema da cadeia de dependências de construção excessivamente longa. No entanto, devido à falta de um mecanismo padronizado de comunicação em tempo de execução, a sincronização de estado e a passagem de eventos entre serviços ainda apresentavam gargalos de eficiência.

### v2.0: Tentativa de Module Federation

Na versão v2.0, adotamos a tecnologia [Module Federation](https://webpack.js.org/concepts/module-federation/) do [Webpack 5.0](https://webpack.js.org/). Essa tecnologia, por meio de um mecanismo unificado de carregamento de módulos e contêineres de tempo de execução, melhorou significativamente a eficiência de colaboração entre serviços. No entanto, em práticas em larga escala, o mecanismo fechado de implementação do Module Federation trouxe novos desafios: dificuldade em gerenciar versões de dependências com precisão, especialmente ao unificar dependências compartilhadas entre vários serviços, frequentemente enfrentando conflitos de versão e exceções em tempo de execução.

## Abraçando a Nova Era do ESM

Ao planejar a versão v3.0, observamos profundamente as tendências de desenvolvimento do ecossistema frontend e descobrimos que os avanços nas capacidades nativas do navegador trouxeram novas possibilidades para a arquitetura de micro frontend:

### Sistema de Módulos Padronizado

Com o suporte completo dos principais navegadores aos [ES Modules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules) e a maturidade da especificação [Import Maps](https://github.com/WICG/import-maps), o desenvolvimento frontend entrou em uma era verdadeiramente modular. De acordo com as estatísticas do [Can I Use](https://caniuse.com/?search=importmap), a taxa de suporte nativo ao ESM nos principais navegadores (Chrome >= 89, Edge >= 89, Firefox >= 108, Safari >= 16.4) atingiu 93,5%, o que nos proporcionou as seguintes vantagens:

- **Gerenciamento de dependências padronizado**: Import Maps oferece a capacidade de resolver dependências de módulos no nível do navegador, sem a necessidade de injeção complexa em tempo de execução
- **Otimização de carregamento de recursos**: O mecanismo de cache de módulos nativo do navegador melhora significativamente a eficiência de carregamento de recursos
- **Simplificação do fluxo de construção**: O modo de desenvolvimento baseado em ESM torna o fluxo de construção entre ambientes de desenvolvimento e produção mais consistente

Além disso, com o suporte ao modo de compatibilidade (Chrome >= 87, Edge >= 88, Firefox >= 78, Safari >= 14), podemos aumentar ainda mais a cobertura de navegadores para 96,81%, permitindo que mantenhamos alto desempenho sem sacrificar o suporte a navegadores antigos.

### Avanços em Desempenho e Isolamento

O sistema de módulos nativo trouxe não apenas padronização, mas também melhorias significativas em desempenho e isolamento:

- **Zero custo de tempo de execução**: Eliminamos o proxy de sandbox JavaScript e a injeção em tempo de execução das soluções tradicionais de micro frontend
- **Mecanismo de isolamento confiável**: O escopo estrito de módulos do ESM fornece naturalmente a capacidade de isolamento mais confiável
- **Gerenciamento preciso de dependências**: A análise estática de importações torna as relações de dependência mais claras e o controle de versão mais preciso

### Escolha da Ferramenta de Construção

Na implementação da solução técnica, a escolha da ferramenta de construção foi um ponto de decisão crucial. Após quase um ano de pesquisa e prática técnica, nossa escolha passou pela seguinte evolução:

1. **Exploração do Vite**
   - Vantagem: Servidor de desenvolvimento baseado em ESM, proporcionando uma experiência de desenvolvimento excepcional
   - Desafio: As diferenças de construção entre ambientes de desenvolvimento e produção trouxeram certa incerteza

2. **Estabelecimento do [Rspack](https://www.rspack.dev/)**
   - Vantagem de desempenho: Compilação de alta performance baseada em [Rust](https://www.rust-lang.org/), melhorando significativamente a velocidade de construção
   - Suporte ao ecossistema: Alta compatibilidade com o ecossistema Webpack, reduzindo o custo de migração
   - Suporte ao ESM: Através da prática do projeto Rslib, validamos sua confiabilidade na construção com ESM

Essa decisão nos permitiu manter a experiência de desenvolvimento enquanto obtínhamos suporte mais estável para o ambiente de produção. Com a combinação de ESM e Rspack, finalmente construímos uma solução de micro frontend de alta performance e baixa intrusividade.

## Perspectivas Futuras

No planejamento futuro, o framework Esmx focará em três direções principais:

### Otimização Profunda do Import Maps

- **Gerenciamento dinâmico de dependências**: Implementar agendamento inteligente de versões de dependências em tempo de execução, resolvendo conflitos de dependências entre múltiplas aplicações
- **Estratégia de pré-carregamento**: Pré-carregamento inteligente baseado em análise de rotas, melhorando a eficiência de carregamento de recursos
- **Otimização de construção**: Gerar automaticamente a configuração ótima do Import Maps, reduzindo o custo de configuração manual dos desenvolvedores

### Solução de Rota Independente de Framework

- **Abstração unificada de rotas**: Projetar uma interface de rota independente de framework, suportando Vue, React e outros frameworks principais
- **Roteamento de micro aplicações**: Implementar interligação de rotas entre aplicações, mantendo a consistência entre URL e estado da aplicação
- **Middleware de rota**: Fornecer um mecanismo de middleware extensível, suportando controle de acesso, transições de página, etc.

### Melhores Práticas de Comunicação entre Frameworks

- **Aplicação de exemplo**: Fornecer um exemplo completo de comunicação entre frameworks, cobrindo Vue, React, Preact e outros frameworks principais
- **Sincronização de estado**: Solução leve de compartilhamento de estado baseada em ESM
- **Barramento de eventos**: Mecanismo padronizado de comunicação por eventos, suportando comunicação desacoplada entre aplicações

Com essas otimizações e expansões, esperamos tornar o Esmx uma solução de micro frontend mais completa e fácil de usar, proporcionando aos desenvolvedores uma melhor experiência de desenvolvimento e maior eficiência.