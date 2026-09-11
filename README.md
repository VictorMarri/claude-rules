# Configuração do Claude Code

Este repositório guarda a configuração pessoal do Claude Code: as orientações globais e as rules que definem como o agente trabalha, escreve código e toma decisões.

Ele funciona como uma cópia versionada da configuração ativa em `%USERPROFILE%\.claude`. Assim, as mudanças têm histórico no GitHub e podem ser recuperadas em outra máquina.

## Estrutura

```text
.
├── CLAUDE.md
└── rules/
    ├── ai-behavior-standards.md
    ├── code-standards.md
    ├── design-standards.md
    ├── exception-handling-standards.md
    ├── logging-standards.md
    ├── narrative-style.md
    ├── performance-standards.md
    └── test-standards.md
```

`CLAUDE.md` contém as orientações gerais e o índice das rules. Os arquivos em `rules/` são carregados automaticamente pelo Claude Code em todas as sessões.

| Arquivo | Finalidade |
| --- | --- |
| `ai-behavior-standards.md` | Como o agente pensa, decide, planeja e mantém mudanças cirúrgicas. |
| `code-standards.md` | Nomes, comentários, decisões explícitas e convenções de código. |
| `design-standards.md` | Responsabilidades, composição, abstração e convenções do projeto. |
| `exception-handling-standards.md` | Falhas esperadas, exceções, relançamento e fronteiras de erro. |
| `logging-standards.md` | Observabilidade, logs estruturados e correlação. |
| `narrative-style.md` | A assinatura de organização do código: orquestrador, etapas e leitura do fluxo. |
| `performance-standards.md` | Consultas, recursos, transações, assincronismo e otimização. |
| `test-standards.md` | Cobertura, isolamento, estrutura e estabilidade dos testes. |

## Princípios da configuração

- As rules descrevem intenções. A implementação respeita a linguagem, o framework e as convenções do projeto alterado.
- Exemplos em C# não exigem classes, interfaces ou APIs de .NET em frontend ou outras linguagens.
- O idioma das rules não define o idioma dos identificadores. Nomes de código seguem o vocabulário do projeto ou módulo.
- Código novo usa o estilo narrativo quando há um fluxo a coordenar. Métodos, funções e componentes existentes preservam sua estrutura, salvo pedido de refatoração.

## Aplicar uma alteração localmente

Edite os arquivos neste repositório. Depois, no PowerShell, copie a configuração para o diretório usado pelo Claude Code:

```powershell
Copy-Item -LiteralPath .\CLAUDE.md -Destination "$env:USERPROFILE\.claude\CLAUDE.md" -Force
Copy-Item -LiteralPath .\rules\* -Destination "$env:USERPROFILE\.claude\rules" -Recurse -Force
```

Inicie uma nova sessão do Claude Code para carregar as regras atualizadas.

## Publicar uma alteração

Depois de revisar a mudança, registre-a no histórico:

```powershell
git status
git diff
git add CLAUDE.md rules README.md
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
