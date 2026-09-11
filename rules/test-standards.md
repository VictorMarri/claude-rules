# Padrões de testes

Valem para backend e frontend. Exemplos em C# (xUnit + Moq) e TypeScript (Vitest). Em outra linguagem ou framework, aplique o equivalente idiomático.

## Cobertura obrigatória

Regra crítica, sem exceção: todo código novo ou alterado nasce com teste automatizado, nos projetos que a configuração do repositório marca como cobertos. Cobertura mínima: 80%. Priorize o que é mais crítico para o negócio.

```
Checkout, pagamento, cálculo de prêmio   → cobertura exaustiva, inclusive bordas e erros
Cadastro de categoria de produto         → caminho feliz e validações principais
```

Cobertura é o piso, não o objetivo: teste que passa com o comportamento quebrado não conta (ver Autovalidação).

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

Nos testes unitários isolados de outras linguagens, substitua os colaboradores pelo mecanismo já usado no projeto, como mocks de funções, módulos ou objetos. O isolamento não exige criar classes ou interfaces de C#.

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

Teste o comportamento visível ao usuário com as ferramentas e a estrutura já adotadas no repositório. Renderize o componente no ambiente de teste do framework e controle dependências externas conforme o cenário. A regra de mocks de colaboradores em C# não obriga substituir cada componente filho, hook ou recurso do framework. Testes de integração e end-to-end continuam sujeitos à seção Pirâmide.

```typescript
// Antes: testa estado interno
expect(component.state.isOpen).toBe(true);

// Depois: testa o que o usuário vê
await user.click(screen.getByRole('button', { name: 'Finalizar compra' }));
expect(screen.getByText('Pedido confirmado')).toBeVisible();
```

## Testes com falhas intermitentes

Investigue e corrija testes com falhas intermitentes. Remova um teste apenas quando ele não proteger mais um comportamento necessário ou quando essa proteção já estiver coberta por outro teste confiável.
