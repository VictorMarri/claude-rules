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

Rode os testes e comandos de verificação do projeto e corrija as falhas causadas pela sua mudança sem parar para pedir aprovação a cada etapa.

Para tarefas com várias etapas, apresente um plano breve, uma linha por etapa: `1. [Etapa] → verificar: [checagem]`. Se o plano envolve código, leia as rules técnicas relevantes antes de planejar, mesmo sem arquivo de código na pasta.

# Padrões de codificação

Valem para todo código novo. Use a solução mais simples que resolve o pedido; se puder resolver com menos código sem perder clareza, simplifique.

## Nomes como especificação

Identificadores seguem o idioma e o vocabulário do projeto; em projetos mistos, siga a convenção documentada ou a do módulo. Preserve nomes existentes, salvo quando a tarefa exigir renomeá-los. O idioma destas rules não determina o idioma do código.

Nomes expressam o contrato, a condição ou o efeito: `IsCancellationDocument`, `RemoveReinsuranceIfExists`, `TryExecuteComputeCycle`. Use formas consagradas (`Is...`, `...IfExists`, `...Async`, `Try...`), sem empilhar orações ou expor o mecanismo. Prefira `TryExecuteComputeCycle` a `ExecuteComputeCycleLoggingTransientFailures`; o log fica no corpo. Para `Try...`, siga o contrato de `exception-handling-standards.md`.

## Comentários

Comente apenas o que o nome não consegue carregar: regex complexa, restrição externa ou motivo não óbvio. Se o comentário explica o que o código faz, renomeie ou extraia.

## Tamanho de classe e arquivo

100 linhas são ponto de revisão, não limite. Separe responsabilidades distintas; se o arquivo continuar coeso e a divisão prejudicar a leitura, mantenha-o e justifique brevemente. Arquivos de configuração ficam fora desse critério.

## Tamanho de método e função

Em lógica imperativa, 20 linhas executáveis são ponto de revisão e 30 o teto. Acima do teto, extraia etapas com nome de especificação, conforme `narrative-style.md`. JSX, templates e estilos não contam; em componentes, avalie composição e responsabilidade.

O orquestrador narra as etapas:

```csharp
public async Task<Order> PlaceAsync(PlaceOrderCommand command)
{
    ValidateOrThrow(command);
    var order = BuildOrder(command);
    await PersistAndPublishAsync(order);
    return order;
}
```

## Decisões explícitas e métodos de uma linha

Use `if`, guardas com retorno antecipado e `else` quando necessário; não use ternário. A guarda de não encontrado usa `if`, com `throw` ou retorno conforme o contrato do projeto.

Em C#, mantenha `=>` em métodos simples de uma linha. No JSX, substitua ternários por variável local, retorno antecipado ou bloco condicional do template.

## Aninhamento de condicionais

Até 3 níveis de `if/else`. Prefira guardas que encerrem cedo os caminhos impeditivos e deixem o caminho feliz sem indentação.

## Parâmetros

Até 4 por método ou função; acima disso, agrupe num objeto parâmetro.

## Espaçamento dentro de métodos

No máximo 1 linha em branco entre blocos.

## Números e strings mágicos

Número ou string com significado vira constante nomeada pelo conceito. Isso inclui códigos de status, erro ou categoria comparados ou retornados na lógica: `order.Status == PaidStatus`, não `order.Status == "PAID"`.

## Declaração de variáveis

Declare perto do primeiro uso; em código imperativo, na linha imediatamente antes.

## Dados sensíveis

Chaves, senhas, tokens e connection strings entram por configuração, no mecanismo destinado pelo projeto: `.env`, user secrets, arquivo de configuração de desenvolvimento ou variável de ambiente.

## Mudanças cirúrgicas em código existente

Siga o escopo de `ai-behavior-standards.md`: não refatore o que não está quebrado sem que isso faça parte do pedido. Mencione código morto preexistente sem removê-lo, salvo quando solicitado. Remova importações, variáveis e funções que suas mudanças deixaram sem uso.

# Padrões de design

Valem para todo código novo.

## Uma responsabilidade por unidade

Separe responsabilidades independentes na unidade natural da linguagem: classe, função, módulo ou componente. Coordenar etapas do mesmo caso de uso ou compor partes da mesma interface não exige, por si só, dividir a unidade.

## Interface para colaborador, abstração só na terceira ocorrência

Em C#, todo colaborador de serviço injetado entra por interface, mesmo com uma implementação só, e é mockado no teste unitário isolado. Dados e valores não são colaboradores de serviço.

Fora de C#, use o mecanismo de substituição do projeto: função por parâmetro, módulo, objeto ou interface quando fizer sentido. A regra não exige criar classes, interfaces ou contêineres de injeção.

Camadas, configurabilidade e generalização só nascem na terceira ocorrência real; até lá, use a solução concreta.

## Funções puras, entrada e saída explícitas

Em cálculos e regras de negócio, explicite entradas e resultados e mantenha dependências externas controláveis. Por exemplo, receba `now` como entrada em vez de ler `DateTime.Now` dentro do cálculo.

## Duplicação pequena é melhor que abstração errada

Dois trechos parecidos podem permanecer assim. Abstraia quando a terceira ocorrência mostrar o que é comum de verdade.

## Difícil de testar é sinal de design

Se provar uma regra exige montar colaboradores sem relação com ela, corrija o acoplamento no design em vez de complicar o teste.

## Convenções do projeto e estilo narrativo

Para organização do fluxo e aplicação a código novo ou existente, siga `narrative-style.md`. Nas demais convenções, siga o repositório: nomes, pastas, framework de testes, injeção de dependências e tratamento de erros.

# Padrões de tratamento de exceções

Onde há exceções, falhas inesperadas propagam como exceções; resultados esperados seguem o contrato do projeto. Em linguagens com erros retornados ou resultados tipados, preserve esse mecanismo.

## Catch só onde age

Capture para recuperar (inclusive retentar), traduzir para o domínio, adicionar contexto ou converter em resposta na fronteira. Nos demais casos, deixe propagar. Não use catch vazio ou que apenas loga e segue; não trate cenários impossíveis.

## Catch pelo tipo que você trata

Em C#, capture apenas os tipos cobertos pela ação; `catch (Exception)` fica na última linha de defesa da fronteira. Onde `catch` não filtra por tipo, verifique se a falha pertence ao contrato tratado e relance as demais.

## Contrato de Try

Quando o projeto usa `Try...`, informe o resultado da tentativa no retorno e explicite as falhas tratadas. Trate apenas essas falhas; exceções inesperadas propagam preservando tipo, mensagem e stack trace.

## Relançar preserva a original

Em C#, use `throw;`, nunca `throw ex;`. Ao envolver uma exceção com mais contexto, mantenha a original como inner exception.

## Handler centralizado na fronteira

A última linha de defesa externa (middleware HTTP, wrapper do consumer ou runner do job) converte exceções não tratadas em um único log e uma resposta padrão com correlation ID. As camadas internas não criam tratamento próprio. Siga `logging-standards.md`, Falha registrada uma vez.

## Resultado esperado segue o contrato do projeto

Validação, não encontrado e conflito usam o padrão existente: retorno tipado, status ou exceção específica. Não introduza outro padrão para o mesmo caso. A guarda de não encontrado segue `code-standards.md`.

Em projetos novos, prefira o retorno de resultados esperados idiomático da linguagem; onde há exceções, reserve-as para falhas inesperadas.

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
