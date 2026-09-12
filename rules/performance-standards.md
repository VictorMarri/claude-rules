---
paths:
  - "**/*.{cs,ts,tsx,js,jsx,py}"
---

# Padrões de performance

Correto e simples primeiro. As regras de queries, conexões e transações valem para o código que acessa esses recursos.

## N+1: batch ou join

Loop que faz uma query por iteração é o bug de performance mais comum, e o ORM esconde: no código parece um loop normal. Busque tudo de uma vez.

```csharp
// Antes: 1 query para os pedidos + 1 por pedido para o cliente
var orders = await _db.Orders.ToListAsync(ct);
foreach (var order in orders)
    order.Customer = await _db.Customers.FindAsync(order.CustomerId);

// Depois: uma query com join
var orders = await _db.Orders.Include(o => o.Customer).ToListAsync(ct);

// Depois, com Dapper: uma query com IN
var customers = await connection.QueryAsync<Customer>(
    "SELECT * FROM Customers WHERE Id IN @Ids", new { Ids = orders.Select(o => o.CustomerId) });
```

## Recurso descartável fecha sozinho

Libere os recursos que a unidade de código cria e pelos quais é responsável, inclusive nos caminhos de falha. Recursos compartilhados ou gerenciados pelo framework seguem o ciclo de vida de seu proprietário.

Em C#, conexões, streams, `HttpResponseMessage` e outros `IDisposable` sob responsabilidade local entram em `using`/`await using`. Para `HttpClient`, siga o padrão de `IHttpClientFactory`; evite criar e descartar um cliente com seu próprio pool a cada chamada.

No frontend, timers, listeners, subscriptions e requisições que deixaram de ser necessárias seguem a limpeza ou o cancelamento do framework.

```csharp
// Antes: conexão fica aberta se der exceção; HttpClient novo a cada chamada
var connection = new SqlConnection(cs);
connection.Open();
var client = new HttpClient();

// Depois
await using var connection = new SqlConnection(cs);
await connection.OpenAsync(ct);
var client = _httpClientFactory.CreateClient("payments");
```

## Consulta limitada: paginação e projeção

Toda listagem pagina e busca só as colunas que vai usar. "Get all" em tabela que cresce é bomba-relógio; entidade inteira com `Include` de tudo carrega o que ninguém lê.

```csharp
// Antes: tabela inteira, entidade inteira
var policies = await _db.Policies.Include(p => p.Customer).Include(p => p.Coverages).ToListAsync(ct);

// Depois: uma página, só os campos da tela
var policies = await _db.Policies
    .Where(p => p.CustomerId == customerId)
    .OrderByDescending(p => p.IssuedAt)
    .Skip(page * size).Take(size)
    .Select(p => new PolicySummary(p.Id, p.Number, p.IssuedAt))
    .ToListAsync(ct);
```

## Conexão e lock não atravessam chamada externa

Mantenha transações curtas. Consultas e gravações que fazem parte da mesma operação podem compartilhar a transação. Evite manter conexão ou transação aberta enquanto aguarda HTTP, publicação em fila ou outro serviço externo. Essa espera prolonga o uso da conexão e pode manter locks, fazendo outras operações aguardarem.

```csharp
// Antes: a transação espera o gateway responder
await using var tx = await _db.Database.BeginTransactionAsync(ct);
var authorization = await _gateway.AuthorizeAsync(payment, ct);   // HTTP dentro da transação
order.MarkPaid(authorization.Id);
await _db.SaveChangesAsync(ct);
await tx.CommitAsync(ct);

// Depois: chamada externa antes, transação curta depois
var authorization = await _gateway.AuthorizeAsync(payment, ct);
await using var tx = await _db.Database.BeginTransactionAsync(ct);
order.MarkPaid(authorization.Id);
await _db.SaveChangesAsync(ct);
await tx.CommitAsync(ct);
```

## Async ponta a ponta

Em C#, use `await` do controller até o banco. Evite `.Result`, `.Wait()` e `.GetAwaiter().GetResult()`, que bloqueiam a thread e podem causar travamentos. `async void` só em event handler. Encaminhe o `CancellationToken` da requisição às operações que suportam cancelamento.

No frontend, impeça que resultados obsoletos atualizem a interface. Funções síncronas, cálculos puros e componentes não viram assíncronos por causa desta regra.

```csharp
// Antes: bloqueia a thread, o token morre no controller, async void engole a exceção
public IActionResult Get(Guid id, CancellationToken ct)
{
    var policy = _repository.GetAsync(id).Result;
    return Ok(policy);
}
public async void Refresh() { await _cache.RefreshAsync(); }

// Depois
public async Task<IActionResult> Get(Guid id, CancellationToken ct)
{
    var policy = await _repository.GetAsync(id, ct);
    return Ok(policy);
}
public async Task RefreshAsync(CancellationToken ct) => await _cache.RefreshAsync(ct);
```

## Otimizar só com medição

Otimização nasce de análise de desempenho, plano de execução da consulta ou teste de carga; sem número, é palpite que adiciona complexidade (ver Simplicidade primeiro em `ai-behavior-standards.md`). Vazamento de recursos, N+1 e consulta sem limite não são otimização: são bugs e se corrigem sem medir.

```csharp
// Antes: cache "por via das dúvidas", sem medição
private static readonly ConcurrentDictionary<Guid, Policy> _cache = new();

// Depois: o código simples; cache só quando o profiler apontar essa consulta
var policy = await _repository.GetAsync(id, ct);
```
