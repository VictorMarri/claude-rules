# Padrões de tratamento de exceções

Em C# e contextos que usam exceções, falhas inesperadas propagam como exceções; resultados esperados seguem o contrato do projeto (ver seção abaixo). Em linguagens com erros retornados ou resultados tipados, preserve esse mecanismo em vez de introduzir exceções para imitar C#. Os exemplos abaixo são em C#.

## Catch só onde age

Um catch existe para recuperar, traduzir para o domínio, adicionar contexto ou converter em resposta na fronteira. Fora desses casos, a exceção propaga. Catch vazio, ou que só loga e segue, esconde a falha de todo mundo.

```csharp
// Antes: loga e segue, como se nada tivesse acontecido
try { await _repository.SaveAsync(policy); }
catch (Exception ex) { _logger.LogError(ex, "Save failed"); }

// Depois: sem ação possível aqui, propaga; quem loga é a fronteira
await _repository.SaveAsync(policy);

// Depois, quando há ação: retentar é agir
try { await _gateway.AuthorizeAsync(payment); }
catch (HttpRequestException) when (attempt < max) { await RetryAsync(); }
```

## Catch pelo tipo que você trata

Em C#, o tipo capturado é o que a ação cobre. `catch (Exception)` só na última linha de defesa (ver Handler centralizado na fronteira). Em linguagens cujo `catch` não filtra pelo tipo, verifique se a falha pertence ao contrato tratado e relance as demais pelo mecanismo da linguagem.

```csharp
// Antes: captura tudo para retentar, inclusive bug de código
catch (Exception) { await RetryAsync(); }

// Depois: retenta o que é transitório; o resto propaga
catch (HttpRequestException) { await RetryAsync(); }
catch (TimeoutException) { await RetryAsync(); }
```

## Contrato de Try

Quando a convenção do projeto usa `Try...` para operações falíveis, esse nome indica uma tentativa cujo resultado é informado no retorno. A função ou método trata apenas as falhas previstas no contrato; exceções inesperadas continuam propagando, preservando tipo, mensagem e stack trace. Deixe explícitas quais falhas são tratadas. Em outras convenções de retorno de erros, preserve os nomes e os contratos da linguagem ou do projeto.

## Relançar preserva a original

Em C#, use `throw;`, nunca `throw ex;`. Ao envolver com mais contexto, a original vai como inner exception. Em outras linguagens, use o mecanismo de relançamento ou encadeamento que preserve a falha original e sua informação de diagnóstico; a sintaxe de C# não é uma exigência fora de C#.

```csharp
// Antes: reinicia o stack trace; a linha da falha some
catch (SqlException ex) { throw ex; }

// Depois: propaga intacta
catch (SqlException) { throw; }

// Depois, traduzindo para o domínio: a original vai dentro
catch (SqlException ex) { throw new PolicyPersistenceException(policy.Id, ex); }
```

## Handler centralizado na fronteira

Uma última linha de defesa na fronteira externa (middleware HTTP, wrapper do consumer, runner do job) converte exceção não tratada em um log (ver `logging-standards.md`, Falha registrada uma vez) e uma resposta padrão com o correlation ID. As camadas internas não inventam tratamento próprio.

Esses exemplos de fronteira são de backend. No frontend, use os pontos de tratamento de erro previstos pelo framework e pelo projeto para renderização, eventos e operações assíncronas, respeitando o alcance de cada mecanismo. Uma edição de componente não exige criar middleware, respostas HTTP ou uma nova infraestrutura de erros.

```csharp
// Antes: cada controller com o próprio try/catch
[HttpPost]
public async Task<IActionResult> Issue(IssuePolicyRequest request)
{
    try { ... }
    catch (Exception ex) { _logger.LogError(ex, "Issue failed"); return StatusCode(500); }
}

// Depois: o middleware trata tudo, uma vez
app.UseExceptionHandler(builder => builder.Run(async context =>
{
    var ex = context.Features.Get<IExceptionHandlerFeature>()!.Error;
    logger.LogError(ex, "Unhandled exception on {Path}", context.Request.Path);
    await context.Response.WriteAsJsonAsync(new { correlationId = Activity.Current?.TraceId.ToString() });
}));
```

## Resultado esperado segue o contrato do projeto

Validação, não encontrado e conflito seguem o padrão que o repositório já usa: retorno tipado (`Result<T>`), código de status ou exceção específica. Não introduza outro padrão para o mesmo caso.

Para a escrita da guarda de não encontrado, siga `code-standards.md`, Decisões explícitas e métodos de uma linha.

Em projetos novos, prefira o mecanismo idiomático de retorno de resultados esperados da linguagem. Onde se usam exceções, reserve-as para falhas inesperadas.

```csharp
// Em projeto que já usa exceção específica para este caso: mantenha o contrato
if (coverage > limit) throw new CoverageExceededException();

// Em projeto que usa Result<T>, ou em projeto novo: prefira retorno tipado
if (coverage > limit) return Result<Policy>.Failure("Coverage exceeds limit");
```
