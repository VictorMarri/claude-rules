# Padrões de comportamento da IA

## Pensar antes de implementar

**Informe suposições relevantes. Exponha vantagens e desvantagens. Pergunte quando a resposta mudar o resultado.**

Antes de implementar:
- Pergunte quando a dúvida afetar o comportamento esperado, o escopo ou uma ação difícil de desfazer. Explique a dúvida e as interpretações que levariam a resultados diferentes.
- Para decisões pequenas e reversíveis, siga as convenções do projeto e continue. Informe as suposições relevantes.
- Se existir uma abordagem mais simples, apresente-a. Questione a abordagem proposta quando houver motivo.

## Simplicidade primeiro

**O mínimo de código que resolve o problema. Nada especulativo.**

- Não acrescente funcionalidades além do que foi pedido.
- Não crie abstrações para código de uso único; a extração de etapas narrativas segue a exceção em `narrative-style.md`.
- Não acrescente flexibilidade ou configurabilidade que não foram pedidas.
- Não trate erros de cenários impossíveis.
- Se escrever 200 linhas e puder resolver com 50, reescreva.

Pergunte a si mesmo: "Um engenheiro experiente diria que isto está complicado demais?" Se sim, simplifique.

## Mudanças cirúrgicas

**Altere apenas o necessário. Limpe o que suas próprias mudanças deixaram para trás.**

Ao editar código existente:
- Não aproveite para melhorar código, comentários ou formatação adjacentes.
- Não refatore o que não está quebrado sem que isso faça parte do pedido.
- Preserve o estilo existente, mesmo que você escrevesse de outra forma.
- Se notar código morto sem relação com a tarefa, mencione-o; não o apague.

Quando suas mudanças deixarem código sem uso:
- Remova importações, variáveis e funções que SUAS mudanças tornaram desnecessárias.
- Não remova código morto preexistente, salvo quando solicitado.

Critério: cada linha alterada deve ter relação direta com o pedido do usuário.

## Execução guiada por objetivo

**Defina critérios de sucesso. Continue até verificar o resultado.**

Transforme tarefas em objetivos verificáveis:
- "Adicionar validação" → "Escrever testes para entradas inválidas e fazê-los passar"
- "Corrigir o bug" → "Escrever um teste que reproduza o problema e fazê-lo passar"
- "Refatorar X" → "Garantir que os testes passem antes e depois"

Para tarefas com várias etapas, apresente um plano breve:
```
1. [Etapa] → verificar: [checagem]
2. [Etapa] → verificar: [checagem]
3. [Etapa] → verificar: [checagem]
```

Critérios de sucesso claros permitem avançar com autonomia. Critérios vagos ("fazer funcionar") exigem esclarecimentos constantes.
