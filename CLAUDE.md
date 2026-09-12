# CLAUDE.md — Global

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

`ai-behavior-standards.md` carrega sempre. As demais carregam quando um arquivo `.cs`, `.ts`, `.tsx`, `.js`, `.jsx` ou `.py` é lido. Ao planejar um projeto novo, ou ao escrever código em linguagem fora dessa lista, leia as rules relevantes antes de escrever. Não usar `@` para apontar para elas, senão entram em dobro.

- `rules/ai-behavior-standards.md`: pensar antes, simplicidade, respeitar o escopo, execução guiada por objetivo
- `rules/code-standards.md`: nomes, comentários, tamanhos, decisões explícitas, parâmetros, constantes, variáveis, dados sensíveis, mudanças cirúrgicas
- `rules/design-standards.md`: responsabilidade única, interface para colaborador, abstração na terceira ocorrência, pureza, convenção do projeto
- `rules/exception-handling-standards.md`: catch só onde age, tipo tratado, contrato de Try, rethrow, handler centralizado, resultado esperado segue o contrato do projeto
- `rules/logging-standards.md`: logar em fronteira, log estruturado, correlation ID, níveis, falha uma vez, identificador em vez de payload
- `rules/narrative-style.md`: orquestrador, etapas auxiliares, ordem de leitura, código novo e existente, referência canônica
- `rules/performance-standards.md`: N+1, dispose e HttpClient, paginação e projeção, transação curta, async ponta a ponta, medir antes de otimizar
- `rules/test-standards.md`: cobertura, objetivo verificável, FIRST, onde mockar, AAA, um conceito por teste, nome, pirâmide, frontend

<!--
Nota para o Victor (o Claude Code remove este comentário antes de carregar o arquivo).
Estas orientações estão funcionando quando: há menos alterações desnecessárias nas diferenças de código e menos reescritas por excesso de complexidade; dúvidas relevantes são esclarecidas antes da implementação; os logs permitem reconstruir o caminho da entrada até uma falha em produção; e os testes falham quando o comportamento protegido quebra, mantendo-se estáveis quando ele está correto.
-->
