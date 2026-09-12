# Configuração do Claude Code

Este repositório guarda a minha configuração pessoal do Claude Code: as orientações globais e as rules que definem como o agente trabalha, escreve código e toma decisões.

Ele funciona como uma cópia versionada da configuração ativa em `%USERPROFILE%\.claude`. Assim, as mudanças têm histórico no GitHub e podem ser recuperadas em outra máquina.

## Estrutura

```text
.
├── AGENTS.md                 # Versão consolidada para o Codex, gerada a partir de CLAUDE.md e rules/
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

## Como o carregamento funciona

`CLAUDE.md` tem três partes: como aplicar os exemplos em C# a outras linguagens e frameworks; um resumo da minha assinatura de código em oito itens; e o índice das rules. Ele entra em toda sessão.

`rules/ai-behavior-standards.md` também entra em toda sessão. Ela guarda só orientações gerais: perguntar quando a dúvida muda o resultado, informar suposições, avançar em decisões pequenas e reversíveis, simplicidade, respeitar o escopo e concluir com a verificação adequada à tarefa.

As outras sete rules têm o cabeçalho `paths:` e só entram quando o Claude Code lê um arquivo `.cs`, `.ts`, `.tsx`, `.js`, `.jsx` ou `.py`:

```markdown
---
paths:
  - "**/*.{cs,ts,tsx,js,jsx,py}"
---
```

Assim, uma conversa sem código não gasta contexto com regras de código. Ao planejar um projeto novo, ou ao escrever em uma linguagem fora dessa lista, o `CLAUDE.md` manda ler as rules relevantes antes de escrever.

Para conferir o que carregou numa sessão, rode `/context` e veja a lista em Memory files. O hook `InstructionsLoaded` registra cada arquivo carregado e o motivo: `session_start` ou `path_glob_match`.

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

## Codex

`AGENTS.md` é a mesma configuração em um único arquivo, porque o Codex recebe suas instruções nesse formato. Ele é gerado a partir de `CLAUDE.md` e de `rules/`: sem o cabeçalho `paths:`, sem o comentário de manutenção e com o parágrafo de carregamento adaptado, já que o Codex lê tudo de uma vez.

Para regenerar, rode na raiz do repositório (precisa do Node.js):

```powershell
node .\gera-agents.js
```

O script lê `CLAUDE.md` e `rules/` e sobrescreve `AGENTS.md`. Confira com `git diff AGENTS.md` antes de publicar.

O arquivo global do Codex nesta máquina é `%USERPROFILE%\.codex\AGENTS.md`. Depois de regenerar, copie:

```powershell
Copy-Item -LiteralPath .\AGENTS.md -Destination "$env:USERPROFILE\.codex\AGENTS.md" -Force
```

## Princípios da configuração

- As rules descrevem intenções. A implementação respeita a linguagem, o framework e as convenções do projeto alterado.
- Exemplos em C# não exigem classes, interfaces ou APIs de .NET em frontend ou outras linguagens.
- O idioma das rules não define o idioma dos identificadores. Nomes de código seguem o vocabulário do projeto ou módulo.
- Código novo usa o estilo narrativo quando há um fluxo a coordenar. Métodos, funções e componentes existentes preservam sua estrutura, salvo pedido de refatoração.
- Instrução de agente é remendo para um modelo específico. A cada troca de modelo, as rules passam por auditoria: o que compensava fraqueza de modelo sai; o que é preferência minha fica.

## Revisão de setembro de 2026

A revisão partiu do artigo da OpenAI "Rethinking skills and prompts for GPT-6 Astra" e foi feita em duas rodadas. Cada rodada foi revisada por um segundo agente e testada em ambiente isolado antes de ativar.

1. `paths:` nas sete rules técnicas, resumo da assinatura no `CLAUDE.md`, avisos repetidos de "adapte C# ao framework" reduzidos a uma frase e duplicações resolvidas. No teste A/B, o contexto inicial caiu de 42 mil para 26 mil tokens, com a mesma qualidade de código.
2. `ai-behavior-standards.md` só com orientações gerais. O que era exclusivo de código foi para as rules técnicas.

Os exemplos antes e depois em C# continuam nas rules técnicas. Nenhuma regra foi removida com a justificativa de que "o modelo já sabe".

## Aplicar uma alteração localmente

Edite os arquivos neste repositório. Depois, no PowerShell, faça um backup e copie a configuração para o diretório usado pelo Claude Code:

```powershell
Copy-Item -LiteralPath "$env:USERPROFILE\.claude\CLAUDE.md" -Destination "$env:USERPROFILE\.claude\CLAUDE.md.bak" -Force
Copy-Item -LiteralPath "$env:USERPROFILE\.claude\rules" -Destination "$env:USERPROFILE\.claude\rules.bak" -Recurse -Force
Copy-Item -LiteralPath .\CLAUDE.md -Destination "$env:USERPROFILE\.claude\CLAUDE.md" -Force
Copy-Item -LiteralPath .\rules\* -Destination "$env:USERPROFILE\.claude\rules" -Recurse -Force
```

Inicie uma nova sessão do Claude Code para carregar as regras atualizadas.

## Publicar uma alteração

Depois de revisar a mudança, registre-a no histórico:

```powershell
git status
git diff
git add CLAUDE.md rules AGENTS.md gera-agents.js README.md
git commit -m "docs: atualiza regras do Claude"
git push
```

## Recuperar em outra máquina

Clone o repositório e copie os arquivos para `%USERPROFILE%\.claude`:

```powershell
git clone https://github.com/VictorMarri/claude-rules.git
Set-Location claude-rules
New-Item -ItemType Directory -Path "$env:USERPROFILE\.claude\rules" -Force | Out-Null
Copy-Item -LiteralPath .\CLAUDE.md -Destination "$env:USERPROFILE\.claude\CLAUDE.md" -Force
Copy-Item -LiteralPath .\rules\* -Destination "$env:USERPROFILE\.claude\rules" -Recurse -Force
```

## Segurança

O repositório é público. Mantenha somente regras e documentação nele. Nunca adicione tokens, senhas, chaves de API, arquivos de sessão, histórico de conversas ou configurações locais com credenciais.
