---
paths:
  - "**/*.{cs,ts,tsx,js,jsx,py}"
---

# Estilo Narrativo — assinatura do Victor

Funções ou métodos que coordenam várias etapas contam a história; as funções auxiliares ou os métodos privados são os capítulos.

## Orquestrador como sumário

A função ou o método que coordena várias etapas apresenta chamadas nomeadas, na ordem do fluxo de negócio, deixando os detalhes de cada etapa nas funções auxiliares ou nos privados.

Funções ou métodos que fazem uma operação simples e clara podem manter a lógica diretamente no corpo, mesmo sendo públicos ou exportados. Extraia quando isso der nome a uma etapa significativa, não apenas para esconder uma operação já clara.

## Auxiliares e privados como etapas

Cada função auxiliar ou método privado representa uma etapa significativa e mantém um nível de abstração. O tamanho segue o limite de `code-standards.md`. Extraia quando houver uma etapa que possa ser nomeada e entendida separadamente, mesmo que seja usada uma única vez. Preserve funções e métodos coesos quando a divisão apenas espalhar a lógica.

Declare os privados e auxiliares na ordem em que são chamados, quando as regras de escopo e inicialização da linguagem permitirem: manchete em cima, detalhe descendo o arquivo.

## Composição declarativa no frontend

Em componentes, a organização narrativa vale para os fluxos imperativos, como ações de usuário e funções de negócio. A renderização pode manter a marcação no componente; extraia componentes ou hooks por responsabilidade, conforme o padrão do projeto, sem transformar a renderização em uma sequência de chamadas a auxiliares. Lógica com hooks vai para custom hooks, não para funções auxiliares comuns.

## Código novo e código existente

Código novo segue este estilo, mesmo quando o código ao redor usa outra organização. Ao corrigir ou alterar uma função, método ou componente existente, preserve o estilo dele; converta para o narrativo quando o pedido incluir essa refatoração. Essa é a fronteira com Respeitar o escopo em `ai-behavior-standards.md` e Mudanças cirúrgicas em `code-standards.md`. As demais convenções seguem `design-standards.md`.

## Referência canônica

`CalculateReinsuranceUseCase`, no repo `Pottencial.Financial.Taxes`, em `Pottencial.Financial.Taxes.UseCases/Reinsurance/`. Na dúvida sobre como o estilo se aplica em C#, leia essa classe antes de escrever. Em outras linguagens, use-a só como referência de leitura do fluxo, sem copiar sua estrutura de classes.

## Critérios de leitura

- Em funções ou métodos que coordenam várias etapas, o fluxo de negócio se narra lendo só o orquestrador.
- Cada auxiliar ou privado se entende sozinho, sem ler os outros.
- Em operações simples, nome e corpo bastam para entender o comportamento, sem exigir extração.
- Na interface declarativa, a composição deixa clara a estrutura da tela.
