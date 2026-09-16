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
