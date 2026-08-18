# Especificação técnica — Titãs Intelligence

## 1. Arquitetura proposta

O MVP usa uma aplicação web modular em Next.js. A interface React atende desktop e tablet; rotas de API formam a fronteira do backend; Prisma acessa PostgreSQL. A lógica de voleibol fica em serviços puros de domínio, independente da UI.

```text
Interface (cadastros, scout, dashboards)
            |
API / casos de uso / autorização
            |
Domínio (rally, rotação, placar, estatísticas)
            |
Prisma ORM -> PostgreSQL
            +-- futuro: IA (somente consultas verificáveis)
            +-- futuro: vídeo (rally + timestamps)
```

Decisões principais:

- Eventos são a fonte da verdade: cada fundamento pertence a um rally e tem autor, equipe, resultado, ordem e instante.
- Placar e estatísticas são projeções recalculáveis; não são digitados duas vezes.
- `undo` invalida logicamente a última ação, preservando auditoria.
- Autorização é por papel (`ADMIN` e `STAFF`) e deve ser validada no servidor.
- Tema usa tokens CSS, sem acoplar regras esportivas a cores.
- IA futura recebe apenas consultas estruturadas e deve citar os eventos usados.

## 2. Estrutura do banco de dados

Entidades centrais: `User`, `Team`, `Player`, `Opponent`, `OpponentPlayer`, `Competition`, `Match`, `MatchSet`, `Lineup`, `LineupPlayer`, `Rally`, `Action`, especializações de fundamento, `Substitution`, `Video` e `AuditLog`.

Relações essenciais:

- uma partida tem sets, escalações e ralis;
- cada rali pertence a um set e guarda placar antes/depois, equipe sacando, rotação e vencedor;
- cada ação pertence a um rally e pode referenciar atleta da casa ou adversário;
- detalhes específicos ficam em tabelas 1:1 (`Serve`, `Reception`, `Attack`, `Block`, `Defense`);
- jogadores em quadra e suas posições são capturados como instantâneo do rali, para preservar o contexto histórico;
- vídeos referenciam rally com URL e timestamps, sem análise automática nesta fase.

Índices devem priorizar `matchId + setNumber`, `rallyId + sequence`, jogador, fundamento e data. Exclusão de eventos deve ser lógica (`deletedAt`) quando houver efeito histórico.

## 3. Fluxo de navegação

```text
Login -> Dashboard
         |-- Atletas -> cadastro -> perfil
         |-- Adversários -> cadastro -> elenco
         |-- Partidas -> nova partida -> escalação -> Scout ao vivo
         |                                      |-> rali -> ações -> fechar ponto
         |                                      |-> desfazer / editar histórico
         `-- Relatório básico da partida
```

## 4. Lista de telas

Fase 1 implementada:

1. Login.
2. Dashboard da temporada.
3. Lista e cadastro de atletas.
4. Lista e cadastro de adversários.
5. Lista e cadastro de partidas.
6. Preparação da partida e escalação.
7. Scout ao vivo.
8. Histórico e edição de ralis.
9. Relatório/dashboard básico.

Telas reservadas às fases seguintes: análise de rotações, comparação de jogos, scouting avançado do adversário, mapas, distribuição do levantador, vídeo e Titãs AI.

## 5. Funcionalidades da Fase 1

- sessão demonstrativa e separação visual de perfil;
- CRUD essencial de atletas, adversários e partidas;
- seleção de relacionados e seis titulares;
- início/fim de set e placar por rali;
- registro rápido de saque, recepção, ataque, bloqueio, defesa, erro e ponto;
- histórico sequencial do rali;
- desfazer última ação e editar/excluir rali;
- dashboard com jogos, resultados e indicadores derivados;
- layout responsivo para desktop/tablet e alvos grandes no scout.

## 6. Modelo de dados

O modelo completo e seus enums estão em `prisma/schema.prisma`. A separação entre `Action` e seus detalhes permite uma linha do tempo uniforme e atributos especializados. `RallySnapshot` registra os seis jogadores e posições no momento do ponto. `AuditLog` registra alterações para responsabilização.

Fórmulas base:

- eficiência de ataque = `(pontos - erros - bloqueios sofridos) / tentativas`;
- recepção perfeita = `perfeitas / recepções`;
- recepção positiva = `(perfeitas + positivas) / recepções`;
- break point = `ralis vencidos sacando / rallies sacando`;
- side-out = `ralis vencidos recebendo antes da troca de saque / rallies recebendo`.

Divisão por zero retorna `0`, nunca `NaN`. Estatísticas oficiais devem ignorar ações/rallies invalidados.

## 7. Ordem recomendada de desenvolvimento

1. Identidade, layout, sessão e permissões.
2. Cadastros mestres: equipe, atletas, adversários e competições.
3. Partida, relacionados, escalação e sets.
4. Motor de rali, placar e timeline de ações.
5. Auditoria: desfazer, editar e correção.
6. Projeções estatísticas e dashboard básico.
7. Persistência API/Prisma, validação e testes ponta a ponta.
8. Somente depois: rotações e comparações (Fase 2).

## Critérios de aceite da Fase 1

- é possível entrar, cadastrar dados e abrir uma partida;
- seis atletas podem ser colocados em quadra;
- uma ação comum é registrada em até três interações;
- concluir rali atualiza placar e histórico;
- a última ação pode ser desfeita imediatamente;
- corrigir um rali recalcula o placar e os indicadores;
- recarregar a página mantém os dados demonstrativos;
- componentes não contêm fórmulas esportivas: elas ficam na camada de domínio.




