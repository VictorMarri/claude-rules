---
paths:
  - "**/*.{cs,ts,tsx,js,jsx,py}"
---

# Padrões de codificação

Valem para todo código novo. Use a solução mais simples que resolve o pedido; se puder resolver com menos código sem perder clareza, simplifique.

## Nomes como especificação

Identificadores seguem o idioma e o vocabulário do projeto; em projetos mistos, siga a convenção documentada ou a do módulo. Preserve nomes existentes, salvo quando a tarefa exigir renomeá-los. O idioma destas rules não determina o idioma do código.

Nomes expressam o contrato, a condição ou o efeito: `IsCancellationDocument`, `RemoveReinsuranceIfExists`, `TryExecuteComputeCycle`. Use formas consagradas (`Is...`, `...IfExists`, `...Async`, `Try...`), sem empilhar orações ou expor o mecanismo. Prefira `TryExecuteComputeCycle` a `ExecuteComputeCycleLoggingTransientFailures`; o log fica no corpo. Para `Try...`, siga o contrato de `exception-handling-standards.md`.

## Comentários

Comente apenas o que o nome não consegue carregar: regex complexa, restrição externa ou motivo não óbvio. Se o comentário explica o que o código faz, renomeie ou extraia.

## Tamanho de classe e arquivo

100 linhas são ponto de revisão, não limite. Separe responsabilidades distintas; se o arquivo continuar coeso e a divisão prejudicar a leitura, mantenha-o e justifique brevemente. Arquivos de configuração ficam fora desse critério.

## Tamanho de método e função

Em lógica imperativa, 20 linhas executáveis são ponto de revisão e 30 o teto. Acima do teto, extraia etapas com nome de especificação, conforme `narrative-style.md`. JSX, templates e estilos não contam; em componentes, avalie composição e responsabilidade.

O orquestrador narra as etapas:

```csharp
public async Task<Order> PlaceAsync(PlaceOrderCommand command)
{
    ValidateOrThrow(command);
    var order = BuildOrder(command);
    await PersistAndPublishAsync(order);
    return order;
}
```

## Decisões explícitas e métodos de uma linha

Use `if`, guardas com retorno antecipado e `else` quando necessário; não use ternário. A guarda de não encontrado usa `if`, com `throw` ou retorno conforme o contrato do projeto.

Em C#, mantenha `=>` em métodos simples de uma linha. No JSX, substitua ternários por variável local, retorno antecipado ou bloco condicional do template.

## Aninhamento de condicionais

Até 3 níveis de `if/else`. Prefira guardas que encerrem cedo os caminhos impeditivos e deixem o caminho feliz sem indentação.

## Parâmetros

Até 4 por método ou função; acima disso, agrupe num objeto parâmetro.

## Espaçamento dentro de métodos

No máximo 1 linha em branco entre blocos.

## Números e strings mágicos

Número ou string com significado vira constante nomeada pelo conceito. Isso inclui códigos de status, erro ou categoria comparados ou retornados na lógica: `order.Status == PaidStatus`, não `order.Status == "PAID"`.

## Declaração de variáveis

Declare perto do primeiro uso; em código imperativo, na linha imediatamente antes.

## Dados sensíveis

Chaves, senhas, tokens e connection strings entram por configuração, no mecanismo destinado pelo projeto: `.env`, user secrets, arquivo de configuração de desenvolvimento ou variável de ambiente.

## Mudanças cirúrgicas em código existente

Siga o escopo de `ai-behavior-standards.md`: não refatore o que não está quebrado sem que isso faça parte do pedido. Mencione código morto preexistente sem removê-lo, salvo quando solicitado. Remova importações, variáveis e funções que suas mudanças deixaram sem uso.
