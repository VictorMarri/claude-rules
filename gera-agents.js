// Gera AGENTS.md (versão consolidada para o Codex) a partir de CLAUDE.md e rules/.
// Uso, na raiz do repositório: node gera-agents.js
// O que faz: usa o corpo do CLAUDE.md sem o título e sem o comentário HTML,
// troca o parágrafo de carregamento do Claude Code por um parágrafo do Codex
// e acrescenta as rules na ordem do índice, sem o cabeçalho paths.
const fs = require('fs');
const path = require('path');

const raiz = __dirname;
const ordemDasRules = [
  'ai-behavior-standards',
  'code-standards',
  'design-standards',
  'exception-handling-standards',
  'logging-standards',
  'narrative-style',
  'performance-standards',
  'test-standards',
];
const cabecalho = '# AGENTS.md — Instruções globais do Codex\n\nEsta é a versão do Codex da configuração pessoal mantida em `claude-rules`. As instruções abaixo são globais. Regras de projeto e do usuário têm precedência quando forem mais específicas.\n\n';
const paragrafoDoCodex = 'No Codex, o conteúdo de todas as rules está consolidado neste arquivo, na ordem do índice abaixo. Ao planejar um projeto novo ou ao escrever em outra linguagem, consulte as seções relevantes antes de escrever.\n';

function gerarAgentsMd() {
  const corpoDoClaude = trocarParagrafoDeCarregamento(lerClaudeMdSemTituloEComentario());
  let saida = cabecalho + corpoDoClaude.trimEnd() + '\n';
  for (const nome of ordemDasRules) saida += '\n' + lerRuleSemFrontmatter(nome).trimEnd() + '\n';
  fs.writeFileSync(path.join(raiz, 'AGENTS.md'), saida);
  console.log('AGENTS.md gerado: ' + saida.split('\n').length + ' linhas');
}

function lerClaudeMdSemTituloEComentario() {
  let texto = lerArquivo('CLAUDE.md');
  texto = texto.replace(/^# CLAUDE\.md[^\n]*\n\n?/, '');
  texto = texto.replace(/\n*<!--[\s\S]*?-->\s*$/, '\n');
  return texto;
}

function trocarParagrafoDeCarregamento(texto) {
  const paragrafoDoClaude = /`ai-behavior-standards\.md` carrega sempre\.[^\n]*\n/;
  if (!paragrafoDoClaude.test(texto)) throw new Error('parágrafo de carregamento não encontrado no CLAUDE.md');
  return texto.replace(paragrafoDoClaude, paragrafoDoCodex);
}

function lerRuleSemFrontmatter(nome) {
  const texto = lerArquivo(path.join('rules', nome + '.md'));
  if (nome !== 'ai-behavior-standards' && !/^---\n/.test(texto)) throw new Error('sem frontmatter paths: ' + nome);
  return texto.replace(/^---\n[\s\S]*?\n---\n\n?/, '');
}

function lerArquivo(caminhoRelativo) {
  return fs.readFileSync(path.join(raiz, caminhoRelativo), 'utf8').replace(/\r\n/g, '\n');
}

gerarAgentsMd();
