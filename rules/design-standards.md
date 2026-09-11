# Padrões de design

Valem para todo código novo. Exemplos em C#. Em outra linguagem, aplique o equivalente idiomático.

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

Em outras linguagens, use os mecanismos de composição e substituição já adotados pelo projeto: funções recebidas por parâmetro, módulos, objetos ou interfaces quando fizerem sentido. A regra de C# não exige criar classes, interfaces ou contêineres de injeção para funções, componentes ou hooks.

Camada, configurabilidade e generalização só nascem na terceira ocorrência real; até lá, use a solução concreta. Componentes, hooks e módulos exigidos pela organização do framework não são, por si só, generalização especulativa.

```csharp
// Em C#: colaborador de serviço injetado entra por interface
public class IssuePolicyUseCase(IPremiumCalculator calculator, IPolicyRepository repository)

// Antes: generalização para um caso só (usado uma vez, CSV para disco)
public class GenericExporter<TFormat, TDestination, TOptions> { ... }

// Depois: o caso concreto
public class CsvFileExporter { ... }
```

## Funções puras, entrada e saída explícitas

Em cálculos e regras de negócio, explicite entradas e resultados e mantenha dependências externas controláveis. Estado de interface e efeitos seguem o mecanismo do framework; essa preferência por pureza não obriga transformar componentes ou hooks em classes nem eliminar o estado necessário à interface.

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

```csharp
// O repositório usa Result<T> para erro esperado
public Result<Policy> Issue(IssuePolicyRequest request)

// Antes: código novo introduz exceção para o mesmo caso
throw new PolicyRejectedException(reason);

// Depois: segue o padrão da casa
return Result<Policy>.Failure(reason);
```
