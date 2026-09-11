# CLAUDE.md — Global

## Aplicação por linguagem e framework

Antes de aplicar uma rule, identifique a linguagem, o tipo de arquivo e o framework. Preserve a intenção da regra usando os recursos naturais desse contexto. Requisitos de sintaxe, execução e ciclo de vida do framework têm precedência sobre a forma usada nos exemplos.

Exemplos em C# não exigem reproduzir classes, interfaces ou APIs de .NET em outras linguagens. Use funções, módulos, componentes e mecanismos de composição quando forem a forma adotada pelo projeto. Uma regra específica de C# ou de backend só vale onde esse contexto existe; sem equivalente aplicável, não crie uma estrutura apenas para satisfazer o exemplo.

Em JSX, templates, HTML e CSS, preserve a composição declarativa. Limites de métodos e extrações narrativas se aplicam à lógica executável, não impõem dividir marcação ou estilos pelo número de linhas. Preferências de leitura, como evitar ternários, continuam valendo onde aplicáveis.

## Estilo Narrativo

Minha assinatura de organização do código está em `rules/narrative-style.md`, incluindo sua aplicação a código novo e existente.

## Regras em `rules/`

Carregadas automaticamente em toda sessão. Não usar `@` para apontar para elas, senão entram em dobro.

- `rules/ai-behavior-standards.md`: como eu trabalho (pensar antes, simplicidade, mudanças cirúrgicas, execução guiada por objetivo)
- `rules/code-standards.md`: nomes, comentários, sintaxe e demais padrões de codificação
- `rules/design-standards.md`: responsabilidade única, interfaces, abstração, pureza, convenção do projeto
- `rules/exception-handling-standards.md`: catch só onde age, tipo tratado, contrato de Try, rethrow, handler centralizado, resultado esperado segue o contrato do projeto
- `rules/logging-standards.md`: logar em fronteira, log estruturado, correlation ID, níveis, identificador em vez de payload
- `rules/narrative-style.md`: orquestrador, etapas auxiliares, ordem de leitura e aplicação da assinatura do Victor
- `rules/performance-standards.md`: N+1, dispose e HttpClient, paginação e projeção, transação curta, async ponta a ponta, medir antes de otimizar
- `rules/test-standards.md`: padrões de testes

---

**Estas orientações estão funcionando quando:** há menos alterações desnecessárias nas diferenças de código e menos reescritas por excesso de complexidade; dúvidas relevantes são esclarecidas antes da implementação; os logs permitem reconstruir o caminho da entrada até uma falha em produção; e os testes falham quando o comportamento protegido quebra, mantendo-se estáveis quando ele está correto.
