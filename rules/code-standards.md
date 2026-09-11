# Padrões de codificação

Valem para todo código novo, respeitando a linguagem, o tipo de arquivo e o framework. Exemplos em C# ilustram a intenção; a sintaxe e os mecanismos específicos de C# só se aplicam nesse contexto.

## Nomes como especificação

O idioma destas rules não determina o idioma do código. Métodos, funções, classes, variáveis e demais identificadores seguem o idioma e o vocabulário usados no código do projeto. Se o código usa inglês, escreva os nomes em inglês; se usa português, siga esse padrão. Em projetos mistos, siga a convenção documentada ou a do módulo alterado. Preserve identificadores existentes, salvo quando a tarefa exigir renomeá-los; não os traduza por estas instruções estarem em português.

Nomes são frases de especificação que dispensam comentários: `IsCancellationDocument`, `RemoveReinsuranceIfExists`, `ReducedOrderAmountIsEqualThanReinsurancePremium`. Condição e efeito vão no próprio nome (`...IfExists`, `Is...`, `...IsEqualThan...`).

Esses nomes são exemplos em C#. Adapte capitalização, prefixos e sufixos à convenção local, como `snake_case` em Python ou nomes de hooks em React. Preserve nomes exigidos pelo framework.

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

Em lógica imperativa, até 30 linhas por método ou função. Passou disso, extraia etapas com nome de especificação usando métodos privados em C# ou funções auxiliares no formato da linguagem (ver `narrative-style.md`).

Esse limite não se aplica ao tamanho total de componentes com JSX, templates ou estilos declarativos. Neles, avalie a composição e a responsabilidade, preservando as regras de escopo e ciclo de vida do framework ao extrair lógica.

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

Quando o contrato do projeto usa exceção para não encontrado, use uma guarda com `if` e `throw`. A escolha entre exceção e retorno segue `exception-handling-standards.md`, Resultado esperado segue o contrato do projeto.

Em C#, mantenha corpo de expressão (`=>`) para métodos simples de uma linha. Em outras linguagens, use a forma de função adotada no projeto, sem converter funções para outra sintaxe apenas por esse exemplo.

No frontend, mantenha a preferência por evitar ternários usando blocos condicionais do template, variáveis locais ou retornos claros onde forem válidos. Em React, mantenha hooks como `useState` e `useEffect` no nível superior do componente ou custom hook, antes de retornos condicionais; extraia lógica com hooks para custom hooks, não para funções auxiliares comuns. A preferência por guardas não autoriza alterar a ordem dessas chamadas.

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

Declare variáveis próximas do primeiro uso, respeitando escopo, inicialização e a ordem de chamadas exigida pelo framework. Em código imperativo sem essas restrições, declare na linha imediatamente antes do primeiro uso.

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
