---
paths:
  - "**/*.{cs,ts,tsx,js,jsx,py}"
---

# Padrões de logging

Use o logger ou a telemetria já adotados no projeto.

## Logar em fronteira

Registre o que ajuda a investigar: requisição ou evento recebido, decisão-chave, chamada externa (ida e volta) e conclusão da requisição. Funções internas e mudanças triviais de estado ficam fora do log.

## Log estruturado

Use campos estruturados. Em C# com `ILogger`, use templates com propriedades nomeadas, não strings montadas:

```csharp
_logger.LogInformation("Order {OrderId} placed by {CustomerId}", order.Id, customer.Id);
```

## Correlation ID por escopo

No backend, introduza a correlação na fronteira de HTTP, fila ou job e use o mecanismo do projeto (`Activity`/OpenTelemetry, middleware, header). Em C# com `ILogger`, sem outro mecanismo, use `BeginScope` na entrada. Propague o contexto em mensagens e chamadas externas conforme o protocolo adotado.

## Níveis com critério

- Debug: diagnóstico, desligado em produção.
- Info: marco do ciclo de vida.
- Warn: anomalia com recuperação automática, inclusive nova tentativa.
- Error: falha que precisa de intervenção humana.

## Falha registrada uma vez

A fronteira registra a exceção não tratada uma vez; camadas que só a repassam não repetem o log. Uma camada que recupera a falha ou controla nova tentativa pode registrar aviso sobre essa ação.

Inclua a exceção completa (com stack trace) e o contexto disponível: correlation ID, identificador da entidade e estado relevante.

## Identificador, não payload

Registre o ID da entidade, não o objeto. Segredos, tokens, senhas e dados pessoais ficam fora do log.
