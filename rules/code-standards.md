---
paths:
  - "**/*.{cs,ts,tsx,js,jsx,py}"
---

# Padrões de codificação

Valem para todo código novo. Se escrever 200 linhas e puder resolver com 50, reescreva.

## Nomes como especificação

O idioma destas rules não determina o idioma do código. Métodos, funções, classes, variáveis e demais identificadores seguem o idioma e o vocabulário usados no código do projeto. Se o código usa inglês, escreva os nomes em inglês; se usa português, siga esse padrão. Em projetos mistos, siga a convenção documentada ou a do módulo alterado. Preserve identificadores existentes, salvo quando a tarefa exigir renomeá-los; não os traduza por estas instruções estarem em português.

Nomes são frases de especificação que dispensam comentários: `IsCancellationDocument`, `RemoveReinsuranceIfExists`, `ReducedOrderAmountIsEqualThanReinsurancePremium`. Condição e efeito vão no próprio nome (`...IfExists`, `Is...`, `...IsEqualThan...`).

O nome carrega uma condição ou efeito, por um idioma consagrado (`Try...`, `...IfExists`, `Is...`, `...Async`). Ele expressa o contrato, não o mecanismo. Se precisar de oração subordinada ou gerúndio empilhado, encurte e deixe o detalhe para o corpo.

Exemplo: `ExecuteComputeCycleLoggingTransientFailures` expõe o mecanismo e tem leitura ambígua; `TryExecuteComputeCycle` expressa a tentativa, enquanto o log fica no corpo. Para usar `Try...`, siga o contrato definido em `exception-handling-standards.md`, Contrato de Try.

## Comentários

Comentário só para o que o nome não consegue carregar: uma regex complexa, uma restrição externa, um "por quê" não óbvio. Se o código precisa de comentário para ser entendido, renomeie ou extraia.

```csharp
// Antes: o comentário repete o código
// verifica se o cliente está ativo
if (customer.Status == Status.Active) ApplyDiscount(order);

// Depois: o nome carrega a informação
if (customer.IsActive) ApplyDiscount(order);

// Aceitável: a regex não se explica sozinha
// CPF com ou sem pontuação: 000.000.000-00 ou 00000000000
private static readonly Regex CpfPattern = new(@"^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$");
```

## Tamanho de classe e arquivo

100 linhas são um ponto de revisão, não um limite obrigatório. Ao ultrapassar esse tamanho, revise as responsabilidades. Divida quando houver responsabilidades distintas. Se a classe ou o arquivo continuar coeso e a divisão prejudicar a leitura, mantenha-o e justifique brevemente. Arquivos de configuração (`appsettings.json`, `package.json`, `pyproject.toml`, `docker-compose.yml`) ficam fora desse critério.

```csharp
// Antes: OrderService.cs com 240 linhas e responsabilidades distintas
public class OrderService
{
    public Task<Order> CreateAsync(CreateOrderCommand command) { ... }
    public Task CancelAsync(Guid orderId) { ... }
    public Task RefundAsync(Guid orderId) { ... }
    public Task SendConfirmationEmailAsync(Order order) { ... }
}

// Depois: uma responsabilidade por arquivo
// CreateOrderUseCase.cs
// CancelOrderUseCase.cs
// RefundOrderUseCase.cs
// OrderConfirmationMailer.cs
```

## Tamanho de método e função

Em lógica imperativa, 20 linhas de lógica executável são o ponto de revisão e 30 o teto. Acima do teto, extraia etapas com nome de especificação (ver `narrative-style.md`).

O limite conta lógica executável; marcação JSX, template e estilos não contam. Em componentes, avalie composição e responsabilidade.

```csharp
// Antes: 60 linhas num corpo só
public async Task<Order> PlaceAsync(PlaceOrderCommand command)
{
    ... validação ...
    ... cálculo de total, desconto e frete ...
    ... persistência e publicação de evento ...
}

// Depois: o público narra, os privados executam
public async Task<Order> PlaceAsync(PlaceOrderCommand command)
{
    ValidateOrThrow(command);
    var order = BuildOrder(command);
    await PersistAndPublishAsync(order);
    return order;
}
```

## Decisões explícitas e métodos de uma linha

Use `if`, cláusulas de guarda e `else` quando necessário para expressar decisões, em vez de operadores condicionais ternários. Priorize a leitura explícita da condição e de seu resultado sobre a redução de linhas.

A guarda de não encontrado usa `if`, com `throw` ou retorno conforme o contrato do projeto.

Em C#, mantenha corpo de expressão (`=>`) para métodos simples de uma linha.

No JSX, troque o ternário por variável local, retorno antecipado ou bloco condicional do template.

## Aninhamento de condicionais

Até 3 níveis de `if/else`. Prefira cláusulas de guarda com retorno antecipado: cada condição que impede o fluxo sai cedo, e o caminho feliz fica sem indentação.

```csharp
// Antes
public decimal CalculateDiscount(Customer customer, Order order)
{
    if (customer != null)
    {
        if (customer.IsActive)
        {
            if (order.Total > MinimumForDiscount)
            {
                return order.Total * LoyaltyDiscountRate;
            }
        }
    }
    return 0;
}

// Depois
public decimal CalculateDiscount(Customer customer, Order order)
{
    if (customer is null) return 0;
    if (!customer.IsActive) return 0;
    if (order.Total <= MinimumForDiscount) return 0;

    return order.Total * LoyaltyDiscountRate;
}
```

## Parâmetros

Até 4 por método ou função. Passou disso, agrupe num objeto parâmetro.

```csharp
// Antes
Task<Policy> IssueAsync(Guid customerId, Guid productId, decimal coverage, DateOnly start, DateOnly end, string channel);

// Depois
Task<Policy> IssueAsync(IssuePolicyRequest request);

public sealed record IssuePolicyRequest(
    Guid CustomerId,
    Guid ProductId,
    decimal Coverage,
    DateOnly Start,
    DateOnly End,
    string Channel);
```

## Espaçamento dentro de métodos

No máximo 1 linha em branco entre blocos.

```csharp
// Antes
var total = CalculateTotal(order);



var tax = CalculateTax(total);

// Depois
var total = CalculateTotal(order);

var tax = CalculateTax(total);
```

## Números e strings mágicos

Número ou string com significado vira constante nomeada. O nome carrega o conceito.

```csharp
// Antes
if (attempts > 3) throw new TooManyAttemptsException();
if (order.Status == "PAID") Ship(order);

// Depois
private const int MaxLoginAttempts = 3;
private const string PaidStatus = "PAID";

if (attempts > MaxLoginAttempts) throw new TooManyAttemptsException();
if (order.Status == PaidStatus) Ship(order);
```

## Declaração de variáveis

Declare variáveis perto do primeiro uso; em código imperativo, na linha imediatamente antes.

```csharp
// Antes: tudo declarado no topo
public async Task<Invoice> IssueAsync(Order order)
{
    var invoice = new Invoice();
    var total = 0m;
    var customer = await _customers.GetAsync(order.CustomerId);

    ... 15 linhas usando customer ...

    total = CalculateTotal(order);
    invoice.Total = total;
    return invoice;
}

// Depois: cada variável nasce onde é usada
public async Task<Invoice> IssueAsync(Order order)
{
    var customer = await _customers.GetAsync(order.CustomerId);
    ... 15 linhas usando customer ...

    var total = CalculateTotal(order);
    return new Invoice { Total = total };
}
```

## Dados sensíveis

Chave de API, senha, token e connection string vivem no arquivo que o projeto destina a isso (`.env`, user secrets, `appsettings.Development.json`, variável de ambiente) e entram no código por configuração.

```csharp
// Antes
var client = new OpenAiClient("sk-live-4f8a9c2e...");

// Depois
var client = new OpenAiClient(configuration["OpenAi:ApiKey"]);
```

## Mudanças cirúrgicas em código existente

O princípio geral está em `ai-behavior-standards.md`, Respeitar o escopo. Em código:

- Não refatore o que não está quebrado sem que isso faça parte do pedido.
- Se notar código morto sem relação com a tarefa, mencione-o; não o apague.
- Remova importações, variáveis e funções que suas mudanças tornaram desnecessárias.
