---
titleSuffix: Guia de Configuração de Caminho de Recursos Estáticos do Framework Esmx
description: Detalha a configuração do caminho base no framework Esmx, incluindo implantação em múltiplos ambientes, distribuição CDN e configuração de caminhos de acesso a recursos, ajudando desenvolvedores a gerenciar recursos estáticos de forma flexível.
head:
  - - meta
    - property: keywords
      content: Esmx, Caminho Base, Base Path, CDN, Recursos Estáticos, Implantação em Múltiplos Ambientes, Gerenciamento de Recursos
---

# Caminho Base

O caminho base (Base Path) refere-se ao prefixo do caminho de acesso aos recursos estáticos (como JavaScript, CSS, imagens, etc.) em uma aplicação. No Esmx, a configuração adequada do caminho base é crucial para os seguintes cenários:

- **Implantação em Múltiplos Ambientes**: Suporta o acesso a recursos em diferentes ambientes, como desenvolvimento, teste e produção
- **Implantação em Múltiplas Regiões**: Adapta-se às necessidades de implantação em clusters de diferentes regiões ou países
- **Distribuição CDN**: Permite a distribuição global e aceleração de recursos estáticos

## Mecanismo de Caminho Padrão

O Esmx utiliza um mecanismo de geração automática de caminho baseado no nome do serviço. Por padrão, o framework lê o campo `name` do arquivo `package.json` do projeto para gerar o caminho base dos recursos estáticos: `/your-app-name/`.

```json title="package.json"
{
    "name": "your-app-name"
}
```

Este design de convenção sobre configuração oferece as seguintes vantagens:

- **Consistência**: Garante que todos os recursos estáticos usem um caminho de acesso unificado
- **Previsibilidade**: O caminho de acesso aos recursos pode ser inferido diretamente pelo campo `name` do `package.json`
- **Manutenibilidade**: Elimina a necessidade de configurações adicionais, reduzindo custos de manutenção

## Configuração Dinâmica de Caminho

Em projetos reais, frequentemente precisamos implantar o mesmo código em diferentes ambientes ou regiões. O Esmx oferece suporte a caminhos base dinâmicos, permitindo que a aplicação se adapte a diferentes cenários de implantação.

### Cenários de Uso

#### Implantação em Subdiretório
```
- example.com      -> Site principal padrão
- example.com/cn/  -> Site em chinês
- example.com/en/  -> Site em inglês
```

#### Implantação em Domínios Independentes
```
- example.com    -> Site principal padrão
- cn.example.com -> Site em chinês
- en.example.com -> Site em inglês
```

### Método de Configuração

Através do parâmetro `base` do método `esmx.render()`, você pode definir dinamicamente o caminho base de acordo com o contexto da requisição:

```ts
const render = await esmx.render({
    base: '/cn',  // Define o caminho base
    params: {
        url: req.url
    }
});
```