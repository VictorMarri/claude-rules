# AGENTS.md — Instruções globais do Codex

Esta é a versão do Codex da configuração pessoal mantida em `claude-rules`. As instruções abaixo são globais. Regras de projeto e do usuário têm precedência quando forem mais específicas.

## Linguagem e framework

Os exemplos das rules estão em C#. Em outra linguagem, aplique o equivalente idiomático e respeite as regras do framework (ordem de hooks, ciclo de vida, composição declarativa). Limites de linhas valem para lógica executável; marcação JSX, template e CSS não contam.

## Assinatura do Victor

Vale para todo código novo, em qualquer linguagem. O detalhe e os exemplos estão em `rules/`.

- Orquestrador narra as etapas; privados ou auxiliares executam, declarados na ordem em que são chamados. Extrair etapa com nome de especificação vale mesmo com um único uso.
- Nome é frase de especificação: `IsCancellationDocument`, `RemoveReinsuranceIfExists`, `TryExecuteComputeCycle`.
- Sem ternário. Decisão com `if`, cláusula de guarda e retorno antecipado.
- Em lógica imperativa, 20 linhas de lógica executável são ponto de revisão e 30 o teto. 100 linhas por classe ou arquivo são ponto de revisão, não limite. Até 4 parâmetros.
- Em C#, colaborador de serviço injetado entra por interface, mesmo com uma implementação só. No teste unitário isolado, todo colaborador é mock.
- Todo código novo ou alterado nasce com teste automatizado, nos projetos que a configuração do repositório marca como cobertos. Cobertura mínima de 80%.
- Mudança cirúrgica: só o que o pedido exige. Preserve o estilo do código existente. Código morto preexistente é mencionado, não apagado.
- Catch só onde age. Log em fronteira. Falha registrada uma vez.

## Regras em `rules/`

No Codex, o conteúdo de todas as rules está consolidado neste arquivo, na ordem do índice abaixo. Ao planejar um projeto novo ou ao escrever em outra linguagem, consulte as seções relevantes antes de escrever.

- `rules/ai-behavior-standards.md`: pensar antes, simplicidade, respeitar o escopo, execução guiada por objetivo
- `rules/code-standards.md`: nomes, comentários, tamanhos, decisões explícitas, parâmetros, constantes, variáveis, dados sensíveis, mudanças cirúrgicas
- `rules/design-standards.md`: responsabilidade única, interface para colaborador, abstração na terceira ocorrência, pureza, convenção do projeto
- `rules/exception-handling-standards.md`: catch só onde age, tipo tratado, contrato de Try, rethrow, handler centralizado, resultado esperado segue o contrato do projeto
- `rules/logging-standards.md`: logar em fronteira, log estruturado, correlation ID, níveis, falha uma vez, identificador em vez de payload
- `rules/narrative-style.md`: orquestrador, etapas auxiliares, ordem de leitura, código novo e existente, referência canônica
- `rules/performance-standards.md`: N+1, dispose e HttpClient, paginação e projeção, transação curta, async ponta a ponta, medir antes de otimizar
- `rules/test-standards.md`: cobertura, objetivo verificável, FIRST, onde mockar, AAA, um conceito por teste, nome, pirâmide, frontend

# Padrões de comportamento da IA

## Pensar antes de executar

- Pergunte quando a dúvida afetar o resultado esperado, o escopo ou uma ação difícil de desfazer. Explique a dúvida e as interpretações que levariam a resultados diferentes.
- Para decisões pequenas e reversíveis, siga as convenções do projeto e continue. Informe as suposições relevantes.
- Se existir uma abordagem mais simples, apresente-a, com vantagens e desvantagens. Questione a abordagem proposta quando houver motivo.

## Simplicidade primeiro

O mínimo que resolve o problema. Nada especulativo.

- Não acrescente funcionalidades, flexibilidade ou configurabilidade além do que foi pedido.
- Pergunte a si mesmo: um engenheiro experiente diria que isto está complicado demais? Se sim, simplifique.

## Respeitar o escopo

Altere apenas o necessário: cada mudança tem relação direta com o pedido. Não aproveite para melhorar o que está ao lado. Preserve o estilo existente, mesmo que você escrevesse de outra forma. Se notar algo fora do escopo, mencione; não mexa.

Limpe o que suas próprias mudanças deixaram sem uso. Não remova o que já estava sem uso antes, salvo quando solicitado.

## Execução guiada por objetivo

Defina critérios de sucesso e continue até verificar o resultado, com a verificação adequada à tarefa: teste, comando, leitura do resultado ou revisão do texto. Com critério vago ("fazer funcionar"), use o contexto disponível e pergunte só quando a informação ausente mudar o resultado, o escopo ou envolver ação difícil de desfazer.

Para tarefas com várias etapas, apresente um plano breve, uma linha por etapa: `1. [Etapa] → verificar: [checagem]`. Se o plano envolve código, leia as rules técnicas relevantes antes de planejar, mesmo sem arquivo de código na pasta.

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

# Padrões de design

Valem para todo código novo.

## Uma responsabilidade por unidade

Separe responsabilidades independentes na unidade natural da linguagem: classe, função, módulo ou componente. Uma unidade pode coordenar etapas do mesmo caso de uso ou compor partes da mesma interface; isso, sozinho, não exige dividi-la.

```csharp
// Antes: valida E calcula E persiste
public class OrderProcessor { ... }

// Depois: uma responsabilidade por classe
public class OrderValidator { ... }
public class OrderTotalCalculator { ... }
public class OrderRepository { ... }
```

## Interface para colaborador, abstração só na terceira ocorrência

Em C#, todo colaborador de serviço injetado entra por interface, mesmo com uma implementação só: o teste unitário isolado mocka (ver `test-standards.md`, Onde mockar). Objetos de dados e valores não são colaboradores de serviço.

Fora de C#, use o mecanismo de substituição que o projeto já adota: função por parâmetro, módulo, objeto ou interface quando fizer sentido. Esta regra não exige criar classes, interfaces ou contêineres de injeção.

Camada, configurabilidade e generalização só nascem na terceira ocorrência real; até lá, use a solução concreta.

```csharp
// Em C#: colaborador de serviço injetado entra por interface
public class IssuePolicyUseCase(IPremiumCalculator calculator, IPolicyRepository repository)

// Antes: generalização para um caso só (usado uma vez, CSV para disco)
public class GenericExporter<TFormat, TDestination, TOptions> { ... }

// Depois: o caso concreto
public class CsvFileExporter { ... }
```

## Funções puras, entrada e saída explícitas

Em cálculos e regras de negócio, explicite entradas e resultados e mantenha dependências externas controláveis.

```csharp
// Antes: lê o relógio e um campo escondido
public bool IsExpired() => EndDate < DateTime.Now && !_settings.GracePeriodEnabled;

// Depois: tudo que influencia o resultado está na assinatura
public bool IsExpiredAt(DateTime now, bool gracePeriodEnabled) => EndDate < now && !gracePeriodEnabled;
```

## Duplicação pequena é melhor que abstração errada

Dois trechos parecidos podem ficar parecidos. Abstraia quando a terceira ocorrência mostrar o que é comum de verdade.

```csharp
// Antes: abstração forçada em cima de duas coisas só parecidas
public abstract class DocumentBase { protected abstract decimal ComputeAmount(); }
public class Invoice : DocumentBase { ... }
public class CreditNote : DocumentBase { ... }

// Depois: cada uma com o próprio cálculo, até aparecer o terceiro caso
public class Invoice { public decimal Amount() { ... } }
public class CreditNote { public decimal Amount() { ... } }
```

## Difícil de testar é sinal de design

Se para provar uma regra o teste precisa montar colaboradores que não têm relação com ela, o problema é acoplamento. Conserte o design, não o teste.

```csharp
// Antes: 7 dependências, o teste monta 7 mocks para provar o cálculo do frete
public class CheckoutService(ICart cart, IPayment payment, IShipping shipping, IStock stock, IMailer mailer, IAudit audit, IClock clock)

// Depois: a regra ganha a própria classe, com o que ela realmente usa
public class ShippingFeeCalculator(IShippingRateProvider rates)
```

## Convenções do projeto e estilo narrativo

Para organizar o fluxo e decidir como aplicar o estilo a código novo ou existente, siga `narrative-style.md`, Código novo e código existente.

As demais convenções seguem o repositório: nomes, pastas, framework de testes, injeção de dependências e tratamento de erros.

# Padrões de tratamento de exceções

Em contextos que usam exceções, falhas inesperadas propagam como exceções; resultados esperados seguem o contrato do projeto (ver seção abaixo). Em linguagens com erros retornados ou resultados tipados, preserve esse mecanismo.

## Catch só onde age

Um catch existe para recuperar, traduzir para o domínio, adicionar contexto ou converter em resposta na fronteira. Fora desses casos, a exceção propaga. Catch vazio, ou que só loga e segue, esconde a falha de todo mundo. Não trate erros de cenários impossíveis.

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

Quando a convenção do projeto usa `Try...` para operações falíveis, esse nome indica uma tentativa cujo resultado é informado no retorno. A função ou método trata apenas as falhas previstas no contrato; exceções inesperadas continuam propagando, preservando tipo, mensagem e stack trace. Deixe explícitas quais falhas são tratadas.

## Relançar preserva a original

Em C#, use `throw;`, nunca `throw ex;`. Ao envolver com mais contexto, a original vai como inner exception.

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

# Padrões de testes

Exemplos em C# (xUnit + Moq) e TypeScript (Vitest).

## Cobertura obrigatória

Regra crítica, sem exceção: todo código novo ou alterado nasce com teste automatizado, nos projetos que a configuração do repositório marca como cobertos. Cobertura mínima: 80%. Priorize o que é mais crítico para o negócio.

```
Checkout, pagamento, cálculo de prêmio   → cobertura exaustiva, inclusive bordas e erros
Cadastro de categoria de produto         → caminho feliz e validações principais
```

Cobertura é o piso, não o objetivo: teste que passa com o comportamento quebrado não conta (ver Autovalidação).

Objetivo verificável por tipo de tarefa: validação nova, testes para entradas inválidas passando; correção de bug, um teste que reproduz o problema e passa depois da correção; refatoração, os testes passam antes e depois.

## Princípios FIRST, sem a exigência de escrever o teste primeiro

### Rapidez

Testes unitários isolados rodam rapidamente. Dependência lenta (banco, HTTP, filesystem, fila) sai por stub ou mock no mecanismo da linguagem. Testes de integração existentes usam os recursos e fixtures necessários ao contrato que verificam (ver Pirâmide).

```csharp
// Antes: bate no banco real
var repository = new SqlCustomerRepository(connectionString);

// Depois: mock da interface
var repository = new Mock<ICustomerRepository>();
repository.Setup(r => r.GetAsync(activeCustomer.Id)).ReturnsAsync(activeCustomer);
```

### Independência

Cada teste monta o próprio cenário e passa sozinho, em qualquer ordem.

```csharp
// Antes: o segundo teste só passa se o primeiro rodou antes
private static Guid _orderId;

[Fact] public void CreateOrder() { _orderId = _service.Create(order).Id; }
[Fact] public void CancelOrder() { _service.Cancel(_orderId); }

// Depois: cada teste cria o que precisa
[Fact]
public void Should_ChangeStatusToCancelled_When_OrderIsCancelled()
{
    var order = CreatePersistedOrder();

    _service.Cancel(order.Id);

    Assert.Equal(OrderStatus.Cancelled, order.Status);
}
```

### Repetibilidade

Mesmo resultado em toda execução. Data, aleatoriedade e API externa entram por mock ou fake.

```csharp
// Antes: o resultado muda conforme o dia em que o teste roda
var isExpired = policy.EndDate < DateTime.Now;

// Depois: relógio injetado e fixado no teste
var clock = new Mock<IClock>();
clock.Setup(c => c.Now).Returns(new DateTime(2026, 09, 10));
var isExpired = policy.IsExpiredAt(clock.Object.Now);
```

### Autovalidação

O teste quebra quando o comportamento quebra. A assertion verifica retorno e efeito, não só "não lançou exceção". Depois de escrever, quebre o comportamento de propósito e confirme que o teste falha.

```csharp
// Antes: passa mesmo com cálculo errado
var result = calculator.Calculate(order);
Assert.NotNull(result);

// Depois: valida o valor esperado
var result = calculator.Calculate(order);
Assert.Equal(150.00m, result.Total);
Assert.Equal(15.00m, result.Discount);
```

## Onde mockar

Esta exigência de mocks vale apenas para testes unitários isolados. Testes de integração seguem a seção Pirâmide: só são criados quando esse padrão já existe no repositório.

Nos testes unitários isolados de C#, os colaboradores de serviço da classe testada entram por interface e são mockados. Cada colaborador tem o próprio teste. Entidades, DTOs, objetos de valor e dados de entrada podem ser concretos.

Fora de C#, substitua os colaboradores pelo mecanismo de mock que o projeto já usa.

```csharp
// Antes: colaborador concreto dentro do teste do caso de uso
var useCase = new IssuePolicyUseCase(new PremiumCalculator(), repository.Object);

// Depois: só o caso de uso é concreto; o resto é mock
var calculator = new Mock<IPremiumCalculator>();
calculator.Setup(c => c.Calculate(It.IsAny<Policy>())).Returns(1250m);
var repository = new Mock<IPolicyRepository>();
var useCase = new IssuePolicyUseCase(calculator.Object, repository.Object);

await useCase.IssueAsync(policy);

repository.Verify(r => r.SaveAsync(It.Is<Policy>(p => p.Premium == 1250m)), Times.Once);
```

A conta do prêmio é provada em `PremiumCalculatorTests`, não aqui.

## Estrutura AAA ou Dado/Quando/Então

Três blocos, nessa ordem, separados por uma linha em branco.

```csharp
[Fact]
public void Should_ApplyLoyaltyDiscount_When_CustomerIsActive()
{
    // Preparação
    var customer = new Customer { IsActive = true };
    var order = new Order(total: 200m);

    // Execução
    var discount = _calculator.CalculateDiscount(customer, order);

    // Verificação
    Assert.Equal(20m, discount);
}
```

## Um conceito por teste

Cada teste cobre um requisito. Dois comportamentos, dois testes.

```csharp
// Antes: mistura desconto e frete
[Fact]
public void Should_CalculateOrder()
{
    Assert.Equal(20m, result.Discount);
    Assert.Equal(15m, result.Shipping);
}

// Depois
[Fact] public void Should_ApplyDiscount_When_CustomerIsActive() { ... }
[Fact] public void Should_ChargeShipping_When_OrderIsBelowFreeShippingLimit() { ... }
```

## Nome do teste

O nome expressa o comportamento e a condição, usando a convenção do framework: `Should_RejectPolicy_When_CoverageExceedsLimit` em C# ou uma descrição equivalente em `it`/`test` no frontend. Evite nomes genéricos como `Test1` e `PolicyTest`.

## Ordem de criação

1. Comportamento mais crítico (o que quebra o negócio se falhar).
2. Caminho feliz dos demais requisitos.
3. Bordas e erros: entrada inválida, vazio, limite, falha de dependência.

## Pirâmide

Base larga de testes de unidade; integração e end-to-end no topo, em menor número. Teste de integração só onde o repositório já tem esse padrão (pasta, projeto ou fixture de integração existente). Sem padrão existente, fique na unidade.

```
Repositório tem tests/Integration/ com fixture de banco  → teste novo de integração segue esse padrão
Repositório só tem testes de unidade                     → código novo ganha teste de unidade
```

## Frontend

Teste o comportamento visível ao usuário com as ferramentas já adotadas no repositório. A regra de mocks não obriga a substituir componentes filhos, hooks ou recursos do framework. Testes de integração e end-to-end seguem a seção Pirâmide.

```typescript
// Antes: testa estado interno
expect(component.state.isOpen).toBe(true);

// Depois: testa o que o usuário vê
await user.click(screen.getByRole('button', { name: 'Finalizar compra' }));
expect(screen.getByText('Pedido confirmado')).toBeVisible();
```

## Testes com falhas intermitentes

Investigue e corrija testes com falhas intermitentes. Remova um teste apenas quando ele não proteger mais um comportamento necessário ou quando essa proteção já estiver coberta por outro teste confiável.
