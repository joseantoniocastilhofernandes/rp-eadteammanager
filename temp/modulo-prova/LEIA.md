# Navegação por níveis: curso → módulo → prova

## Estrutura de páginas

```
src/pages/cursos/
├── index.js                          lista de cursos
└── [idCurso]/
    ├── index.js                      visão geral do curso
    ├── aula/[idAula].js              edição da aula
    └── modulo/[idModulo]/
        ├── index.js                  aulas do módulo + prova
        └── prova.js                  questões e alternativas
```

A visão geral do curso continua existindo: ela mostra a árvore inteira e
serve para reordenar módulos e publicar. Cada módulo tem um botão que
abre a página dele, onde ficam as aulas e a prova.

## Backend novo

- `api/gestao/prova.js` — prova, questões e alternativas
- `api/gestao/modulo.js` — ganhou GET, para a página do módulo

## Regras que o backend garante

- Uma prova ativa por módulo
- Marcar uma alternativa como certa desmarca as demais (resposta única,
  que é como o app do aluno calcula a nota)
- Questão nasce com duas alternativas, nunca vazia
- Não dá para excluir alternativa se sobrarem menos de duas
- Publicar a prova exige ao menos uma questão com resposta certa marcada

## Aviso de tentativas

Se alunos já fizeram a prova, a tela mostra um aviso: alterar questões
depois não recalcula as notas antigas. O sistema não impede a edição,
mas deixa claro o efeito.

## Sobre "base de questões"

O que existe hoje são as questões daquela prova. Um banco reutilizável —
questões avulsas que você monta em provas diferentes — seria outro
modelo, com tabela própria e vínculo N-para-N. Dá para fazer depois sem
desmanchar o que está aqui.
