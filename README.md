# Configuração do Claude Code e do Codex

Este repositório é a cópia versionada da minha configuração pessoal de agentes: as orientações globais e as rules que definem como o agente trabalha, escreve código e toma decisões. A cópia ativa fica em `%USERPROFILE%\.claude` (Claude Code) e `%USERPROFILE%\.codex\AGENTS.md` (Codex).

## Estrutura

```text
.
├── AGENTS.md                 # Gerado: CLAUDE.md + rules/ em um só arquivo, para o Codex
├── CLAUDE.md                 # Carrega sempre: linguagem e framework, resumo da assinatura, índice das rules
├── gera-agents.js            # Gera AGENTS.md a partir de CLAUDE.md e rules/
└── rules/
    ├── ai-behavior-standards.md         # Carrega sempre
    ├── code-standards.md                # Carrega ao ler código
    ├── design-standards.md              # Carrega ao ler código
    ├── exception-handling-standards.md  # Carrega ao ler código
    ├── logging-standards.md             # Carrega ao ler código
    ├── narrative-style.md               # Carrega ao ler código
    ├── performance-standards.md         # Carrega ao ler código
    └── test-standards.md                # Carrega ao ler código
```

| Arquivo | Finalidade |
| --- | --- |
| `ai-behavior-standards.md` | Pensar antes de executar, simplicidade, respeitar o escopo e execução guiada por objetivo. |
| `code-standards.md` | Nomes, comentários, tamanhos, decisões explícitas, convenções de código e mudanças cirúrgicas em código existente. |
| `design-standards.md` | Responsabilidades, interface por colaborador, abstração na terceira ocorrência, pureza e convenções do projeto. |
| `exception-handling-standards.md` | Catch só onde age, tipo tratado, contrato de Try, relançamento, handler na fronteira e resultado esperado. |
| `logging-standards.md` | Log em fronteira, log estruturado, correlation ID, níveis, falha registrada uma vez e identificador em vez de payload. |
| `narrative-style.md` | A assinatura de organização do código: orquestrador, etapas e leitura do fluxo. |
| `performance-standards.md` | N+1, recursos descartáveis, paginação, transações curtas, async ponta a ponta e medir antes de otimizar. |
| `test-standards.md` | Cobertura, objetivo verificável, FIRST, onde mockar, AAA, nomes, pirâmide e frontend. |

## Como o Claude Code carrega

`CLAUDE.md` e `rules/ai-behavior-standards.md` entram em toda sessão. O primeiro traz o resumo da assinatura em oito itens e o índice das rules; a segunda, só orientações gerais de comportamento.

As outras sete rules têm o cabeçalho `paths:` e só entram quando o Claude Code lê um arquivo `.cs`, `.ts`, `.tsx`, `.js`, `.jsx` ou `.py`:

```markdown
---
paths:
  - "**/*.{cs,ts,tsx,js,jsx,py}"
---
```

Assim, uma conversa sem código não gasta contexto com regras de código. Ao planejar um projeto novo, ou ao escrever em uma linguagem fora dessa lista, o `CLAUDE.md` manda ler as rules relevantes antes de escrever.

Para conferir o que carregou numa sessão, rode `/context` e veja a lista em Memory files. O hook `InstructionsLoaded` registra cada arquivo carregado e o motivo: `session_start` ou `path_glob_match`.

## Como o Codex carrega

O Codex lê um único `AGENTS.md`, de uma vez, no início da sessão. O limite padrão para a cadeia de instruções é 32 KiB. Por isso `AGENTS.md` é gerado a partir de `CLAUDE.md` e `rules/`: sem o cabeçalho `paths:` e com o parágrafo de carregamento adaptado. Hoje ele tem cerca de 22 KB.

Nunca edite `AGENTS.md` à mão. Altere `CLAUDE.md` ou `rules/` e regenere (precisa do Node.js):

```powershell
node .\gera-agents.js
```

## Instalar nesta máquina

Depois de editar ou de clonar o repositório, copie para os diretórios ativos. O backup permite voltar se uma sessão se comportar mal:

```powershell
Copy-Item -LiteralPath "$env:USERPROFILE\.claude\rules" -Destination "$env:USERPROFILE\.claude\rules.bak" -Recurse -Force
Copy-Item -LiteralPath .\CLAUDE.md -Destination "$env:USERPROFILE\.claude\CLAUDE.md" -Force
Copy-Item -LiteralPath .\rules\* -Destination "$env:USERPROFILE\.claude\rules" -Recurse -Force
Copy-Item -LiteralPath .\AGENTS.md -Destination "$env:USERPROFILE\.codex\AGENTS.md" -Force
```

Em outra máquina, crie `%USERPROFILE%\.claude\rules` antes de copiar. As regras valem a partir da próxima sessão de cada ferramenta.

## Publicar

```powershell
git diff
git add CLAUDE.md rules AGENTS.md gera-agents.js README.md
git commit -m "docs: atualiza regras do Claude"
git push
```

## Princípios da configuração

- As rules descrevem intenções. A implementação respeita a linguagem, o framework e as convenções do projeto alterado.
- Exemplos em C# não exigem classes, interfaces ou APIs de .NET em frontend ou outras linguagens.
- O idioma das rules não define o idioma dos identificadores. Nomes de código seguem o vocabulário do projeto ou módulo.
- Código novo usa o estilo narrativo quando há um fluxo a coordenar. Métodos, funções e componentes existentes preservam sua estrutura, salvo pedido de refatoração.
- Regra curta, sem exemplo por padrão. Um exemplo entra quando o teste A/B mostra que a regra perde força sem ele.
- Instrução de agente é remendo para um modelo específico. A cada troca de modelo, as rules passam por auditoria: o que compensava fraqueza de modelo sai; o que é preferência minha fica.

## Revisões de setembro de 2026

A revisão partiu do artigo da OpenAI "Rethinking skills and prompts for GPT-6 Astra". Cada rodada foi revisada por um segundo agente e testada em ambiente isolado antes de ativar.

1. `paths:` nas sete rules técnicas, resumo da assinatura no `CLAUDE.md`, avisos repetidos de "adapte C# ao framework" reduzidos a uma frase e duplicações resolvidas. No teste A/B, o contexto inicial caiu de 42 mil para 26 mil tokens, com a mesma qualidade de código.
2. `ai-behavior-standards.md` só com orientações gerais. O que era exclusivo de código foi para as rules técnicas.
3. Seis rules técnicas enxutas: saíram os exemplos que só repetiam a regra; obrigações, condições e exceções ficaram. `AGENTS.md` caiu de 39,5 KB para 22 KB e passou a caber nos 32 KiB do Codex. No teste A/B (Claude e Codex, mesmo prompt, testes independentes e mutação), funcionalidade e decisões ficaram iguais; a única regressão, strings de status e erro deixadas inline, foi corrigida com um exemplo de uma linha na regra de constantes.

Nenhuma regra foi removida com a justificativa de que "o modelo já sabe".

## Segurança

O repositório é público. Mantenha somente regras e documentação nele. Nunca adicione tokens, senhas, chaves de API, arquivos de sessão, histórico de conversas ou configurações locais com credenciais.
