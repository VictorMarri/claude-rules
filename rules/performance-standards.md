---
paths:
  - "**/*.{cs,ts,tsx,js,jsx,py}"
---

# Padrões de performance

Correto e simples primeiro. Regras de queries, conexões e transações aplicam-se ao código que acessa esses recursos.

## N+1: batch ou join

Busque os dados em lote ou com join, em vez de executar uma query por iteração de um loop, inclusive via ORM.

## Recurso descartável fecha sozinho

Libere recursos criados sob responsabilidade local, inclusive na falha. Recursos compartilhados ou gerenciados pelo framework seguem o ciclo de vida do proprietário.

Em C#, use `using`/`await using` para conexões, streams, `HttpResponseMessage` e outros `IDisposable` locais. Para `HttpClient`, siga `IHttpClientFactory`; evite criar e descartar um cliente com pool próprio a cada chamada.

No frontend, limpe timers, listeners e subscriptions e cancele requisições desnecessárias pelo mecanismo do framework.

## Consulta limitada: paginação e projeção

Toda listagem pagina e busca apenas as colunas usadas.

## Conexão e lock não atravessam chamada externa

Mantenha transações curtas. Consultas e gravações da mesma operação podem compartilhar a transação. Evite manter conexão ou transação aberta enquanto aguarda HTTP, publicação em fila ou outro serviço externo: isso prolonga o uso da conexão e pode manter locks.

## Async ponta a ponta

Em C#, use `await` do controller até o banco. Evite `.Result`, `.Wait()` e `.GetAwaiter().GetResult()`. `async void` só em event handler. Encaminhe o `CancellationToken` da requisição às operações que suportam cancelamento.

No frontend, impeça resultados obsoletos de atualizar a interface. Esta regra não torna assíncronos funções síncronas, cálculos puros ou componentes.

## Otimizar só com medição

Otimize com análise de desempenho, plano de execução ou teste de carga; não introduza otimização especulativa. Vazamento de recursos, N+1 e consulta sem limite são bugs e devem ser corrigidos sem exigir medição.
