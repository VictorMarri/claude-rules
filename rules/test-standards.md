---
paths:
  - "**/*.{cs,ts,tsx,js,jsx,py}"
---

# Padrões de testes

## Cobertura obrigatória

Todo código novo ou alterado nasce com teste automatizado nos projetos que a configuração do repositório marca como cobertos. Cobertura mínima: 80%, sem exceção nesse escopo.

Priorize o risco de negócio: checkout, pagamento e cálculo de prêmio exigem cobertura exaustiva, inclusive bordas e erros; cadastros simples cobrem caminho feliz e validações principais. Cobertura é piso: teste que passa com o comportamento quebrado não conta.

Verifique conforme a tarefa: validação nova exige testes de entradas inválidas passando; correção de bug exige teste que reproduz o problema e passa após a correção; refatoração exige testes passando antes e depois.

## Princípios FIRST, sem a exigência de escrever o teste primeiro

### Rapidez

Testes unitários isolados devem ser rápidos: substitua banco, HTTP, filesystem e fila por stub ou mock conforme a linguagem. Integrações existentes usam os recursos e fixtures necessários ao contrato testado.

### Independência

Cada teste monta seu cenário e passa sozinho, em qualquer ordem.

### Repetibilidade

Mantenha o resultado estável entre execuções: controle data, aleatoriedade e API externa com mock ou fake.

### Autovalidação

Verifique retorno e efeito, não apenas ausência de exceção. Depois de escrever o teste, quebre o comportamento de propósito e confirme que ele falha.

## Onde mockar

Nos testes unitários isolados de C#, todos os colaboradores de serviço entram por interface e são mockados. Cada colaborador tem seu próprio teste. Entidades, DTOs, valores e dados de entrada podem ser concretos. Fora de C#, use o mecanismo de mock adotado pelo projeto.

Exemplo: o teste de `IssuePolicyUseCase` recebe `IPremiumCalculator` mockado e verifica a persistência do prêmio retornado. A conta do prêmio é provada em `PremiumCalculatorTests`.

A exigência de mocks é para unidade isolada; integração segue a seção Pirâmide.

## Estrutura AAA ou Dado/Quando/Então

Organize preparação, execução e verificação nessa ordem, separadas por uma linha em branco.

## Um conceito por teste

Cada teste cobre um requisito. Dois comportamentos, dois testes.

## Nome do teste

Expresse comportamento e condição na convenção do framework: `Should_RejectPolicy_When_CoverageExceedsLimit` em C# ou descrição equivalente em `it`/`test` no frontend. Evite nomes genéricos.

## Ordem de criação

1. Comportamento mais crítico para o negócio.
2. Caminho feliz dos demais requisitos.
3. Bordas e erros: entrada inválida, vazio, limite e falha de dependência.

## Pirâmide

Priorize testes de unidade; integração e end-to-end ficam em menor número. Crie integração apenas onde o repositório já adota esse padrão (pasta, projeto ou fixture) e siga-o. Sem padrão existente, fique na unidade.

## Frontend

Teste o comportamento visível ao usuário com as ferramentas do repositório. A regra de mocks não exige substituir componentes filhos, hooks ou recursos do framework. Integração e end-to-end seguem a seção Pirâmide.

```typescript
await user.click(screen.getByRole('button', { name: 'Finalizar compra' }));
expect(screen.getByText('Pedido confirmado')).toBeVisible();
```

## Testes com falhas intermitentes

Investigue e corrija falhas intermitentes. Remova um teste apenas se o comportamento deixou de ser necessário ou já está protegido por outro teste confiável.
