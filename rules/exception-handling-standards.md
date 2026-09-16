---
paths:
  - "**/*.{cs,ts,tsx,js,jsx,py}"
---

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
