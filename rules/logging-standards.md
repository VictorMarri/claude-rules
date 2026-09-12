---
paths:
  - "**/*.{cs,ts,tsx,js,jsx,py}"
---

# Padrões de logging

Use o logger ou a telemetria já adotados no projeto.

## Logar em fronteira

Uma linha de log responde a uma pergunta de quem investiga uma falha. Pontos que respondem: requisição ou evento recebido, decisão-chave, chamada externa (ida e volta), requisição concluída. Função interna e mudança trivial de estado não entram.

```csharp
// Antes: ruído
_logger.LogInformation("Entrando em CalculateDiscount");
_logger.LogInformation("Desconto calculado");
_logger.LogInformation("Saindo de CalculateDiscount");

// Depois: só o que reconstrói o caminho
_logger.LogInformation("Order {OrderId} received from {Channel}", order.Id, channel);
_logger.LogInformation("Order {OrderId} routed to manual review: total {Total} above limit", order.Id, order.Total);
_logger.LogInformation("Order {OrderId} completed in {ElapsedMs}ms", order.Id, elapsed);
```

## Log estruturado

Use campos estruturados para permitir consultas na plataforma. Em C# com `ILogger`, use template com propriedades nomeadas em vez de string montada.

```csharp
// Antes: vira texto, não dá para filtrar por OrderId
_logger.LogInformation($"Order {order.Id} placed by {customer.Id}");

// Depois: OrderId e CustomerId viram campos
_logger.LogInformation("Order {OrderId} placed by {CustomerId}", order.Id, customer.Id);
```

## Correlation ID por escopo

No backend, um ID de correlação acompanha o fluxo: HTTP, fila, job. Ele entra na fronteira e acompanha os logs pelo mecanismo do projeto (`Activity`/OpenTelemetry, middleware, header). Em C# com `ILogger`, sem outro mecanismo, use `BeginScope` na entrada. Ao publicar mensagem ou chamar outro serviço, propague o contexto conforme o protocolo adotado.

```csharp
// Antes: repetido em cada chamada
_logger.LogInformation("Order {OrderId} received, correlation {CorrelationId}", order.Id, correlationId);
_logger.LogInformation("Payment authorized, correlation {CorrelationId}", correlationId);

// Depois: uma vez, na fronteira; as linhas abaixo carregam o campo sozinhas
using (_logger.BeginScope(new Dictionary<string, object> { ["CorrelationId"] = correlationId }))
{
    await _useCase.ExecuteAsync(command);
}
```

## Níveis com critério

Debug: diagnóstico, desligado em produção. Info: marco do ciclo de vida. Warn: anomalia da qual o sistema se recupera sozinho. Error: falha que precisa de humano.

```csharp
// Chamada externa falhou e vai retentar: Warn
_logger.LogWarning(ex, "Payment gateway timed out for order {OrderId}, attempt {Attempt} of {Max}", order.Id, attempt, max);

// Esgotou as tentativas: Error
_logger.LogError(ex, "Payment gateway unreachable for order {OrderId} after {Max} attempts", order.Id, max);
```

## Falha registrada uma vez

Quando a exceção sobe até a fronteira (middleware HTTP, consumer ou runner do job), essa fronteira registra o erro uma vez. As camadas que apenas repassam a exceção não registram outro log.

Quando uma camada recupera a falha ou controla uma nova tentativa, ela pode registrar um aviso sobre essa ação.

O registro inclui a exceção completa e o contexto disponível: correlation ID, identificador da entidade e estado relevante.

```csharp
// Antes: só a mensagem entra; o stack trace some
_logger.LogError("Failed to issue policy {PolicyId}: {Message}", policy.Id, ex.Message);

// Depois: a exceção vai inteira, com stack trace
_logger.LogError(ex, "Failed to issue policy {PolicyId} for customer {CustomerId}", policy.Id, customer.Id);
```

## Identificador, não payload

Logue o ID da entidade, não o objeto. Segredo, token, senha e dado pessoal ficam fora do log.

```csharp
// Antes: serializa o cliente inteiro, com CPF e e-mail
_logger.LogInformation("Customer created: {@Customer}", customer);

// Depois: o ID basta para achar o resto
_logger.LogInformation("Customer {CustomerId} created", customer.Id);
```
