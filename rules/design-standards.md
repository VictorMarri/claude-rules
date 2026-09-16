---
paths:
  - "**/*.{cs,ts,tsx,js,jsx,py}"
---

# Padrões de design

Valem para todo código novo.

## Uma responsabilidade por unidade

Separe responsabilidades independentes na unidade natural da linguagem: classe, função, módulo ou componente. Coordenar etapas do mesmo caso de uso ou compor partes da mesma interface não exige, por si só, dividir a unidade.

## Interface para colaborador, abstração só na terceira ocorrência

Em C#, todo colaborador de serviço injetado entra por interface, mesmo com uma implementação só, e é mockado no teste unitário isolado. Dados e valores não são colaboradores de serviço.

Fora de C#, use o mecanismo de substituição do projeto: função por parâmetro, módulo, objeto ou interface quando fizer sentido. A regra não exige criar classes, interfaces ou contêineres de injeção.

Camadas, configurabilidade e generalização só nascem na terceira ocorrência real; até lá, use a solução concreta.

## Funções puras, entrada e saída explícitas

Em cálculos e regras de negócio, explicite entradas e resultados e mantenha dependências externas controláveis. Por exemplo, receba `now` como entrada em vez de ler `DateTime.Now` dentro do cálculo.

## Duplicação pequena é melhor que abstração errada

Dois trechos parecidos podem permanecer assim. Abstraia quando a terceira ocorrência mostrar o que é comum de verdade.

## Difícil de testar é sinal de design

Se provar uma regra exige montar colaboradores sem relação com ela, corrija o acoplamento no design em vez de complicar o teste.

## Convenções do projeto e estilo narrativo

Para organização do fluxo e aplicação a código novo ou existente, siga `narrative-style.md`. Nas demais convenções, siga o repositório: nomes, pastas, framework de testes, injeção de dependências e tratamento de erros.
