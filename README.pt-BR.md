# Corkboard

Um quadro Kanban colaborativo em tempo real. Arraste um cartão e todo mundo olhando o quadro vê o movimento instantaneamente, vê quem mais está vendo o quadro agora, e vê tudo cair num feed de atividade — sem recarregar o quadro inteiro e sem nunca precisar renumerar todos os outros cartões da coluna.

[Read in English](./README.md)

## Por que esse projeto existe

O jeito óbvio de guardar "ordem do cartão" é uma coluna inteira e um reindex a cada arraste: o cartão vai pra posição 3, então todo cartão depois dele desloca uma posição, numa única requisição. Isso funciona até duas pessoas arrastarem cartões na mesma coluna ao mesmo tempo, ou a coluna ter algumas centenas de cartões — agora cada movimento é uma escrita O(n) e uma condição de corrida esperando pra acontecer. O Corkboard usa posicionamento fracionário em vez disso: cada cartão recebe uma posição em ponto flutuante, e inserir entre dois cartões é só o ponto médio entre as posições deles — uma escrita O(1) que toca exatamente uma linha.

## Arquitetura

```
apps/
  web/   Next.js 16 (App Router, TypeScript, Tailwind) — boards, colunas, cartões, atividade, presença
  api/   Node/Express (TypeScript) — API REST + Socket.IO, Prisma ORM, PostgreSQL
```

```
src/
  domain/            ordering.ts — lógica pura de posicionamento fracionário, sem framework, testada
                      errors.ts — erros de domínio tipados, mapeados para códigos HTTP
  modules/<nome>/     <nome>.schema.ts   validação de entrada com Zod
                      <nome>.service.ts   regra de negócio
                      <nome>.routes.ts    router do Express, controllers finos
  middlewares/         autenticação, rate limiting, tratamento central de erro
  realtime/            salas do Socket.IO por board, mais um registro de presença em memória
```

## A parte interessante: posicionamento fracionário com rebalanceamento automático

Mover um cartão pra ficar entre o cartão A (posição 100) e o cartão B (posição 200) define sua posição como 150 — nenhuma outra linha é tocada (`domain/ordering.ts`). Soltar bem no início ou no fim funciona do mesmo jeito, contra um vizinho `null`. A única coisa que esse esquema não consegue fazer para sempre é inserir infinitamente entre os mesmos dois vizinhos: a precisão de ponto flutuante eventualmente se esgota. `needsRebalance` detecta quando o espaço entre duas posições colapsou abaixo de um limite, e quando isso acontece, `cards.service.ts` reespaça todos os cartões daquela coluna de forma uniforme (`rebalancedPositions`) numa única transação antes de completar o movimento — uma operação que continua rara na prática (só é acionada depois de dezenas de inserções espremidas no mesmo espaço) mas mantém o esquema correto indefinidamente em vez de degradar silenciosamente. `tests/ordering.test.ts` exercita o caso de colapso diretamente: inserções repetidas de ponto médio suficientes pra forçar `needsRebalance` a virar verdadeiro.

Mover cartões é otimista no cliente (`useMoveCard` em `apps/web`): a interface reordena instantaneamente ao soltar, desfaz automaticamente se a API rejeitar o movimento, e reconcilia com as posições autoritativas do servidor de qualquer forma — então arrastar parece instantâneo mesmo que todo movimento continue sendo validado e persistido no servidor.

## Presença em tempo real

Além de transmitir mudanças de dados (o mesmo padrão `board:updated` usado em todo esse portfólio), o Corkboard rastreia quem está *olhando o board agora* — um estado que deliberadamente nunca toca o banco de dados, porque só é verdadeiro enquanto um socket continua conectado. Cada conexão entra numa sala `board:<id>` e se registra num mapa em memória; a lista atual de quem está vendo é retransmitida pra essa sala a cada entrada e desconexão. Feche a aba, e você desaparece da barra de presença de todo mundo em uma volta de rede — sem indicador "online" desatualizado esperando expirar.

## Segurança

- Senhas com hash via bcrypt (fator de custo 12); sessões são JWTs em cookies `httpOnly` e `sameSite=lax` — o mesmo token é validado antes de uma conexão Socket.IO ser autorizada a entrar em qualquer sala.
- Toda rota de board verifica a associação (membership) no servidor; quem não é membro recebe `403` no próprio board e em toda ação de coluna/cartão/membro dentro dele, nunca uma visão parcial.
- Só o `OWNER` de um board pode adicionar novos membros; qualquer membro pode criar colunas e cartões e mover cartões, refletindo como a maioria dos times realmente usa um board compartilhado.
- Toda entrada é validada com Zod na borda da aplicação; o Prisma parametriza todas as queries; rate limiting nos endpoints de autenticação; cabeçalhos de segurança via `helmet`; CORS restrito à origem configurada do frontend.
- Nenhum segredo fica versionado no repositório — veja [Como rodar](#como-rodar).

## Como rodar

### Pré-requisitos

- Node.js 20+
- Uma instância de PostgreSQL 14+ (local ou hospedada)

### 1. Configurar a API

```bash
cd apps/api
cp .env.example .env
```

| Variável | Descrição |
| --- | --- |
| `DATABASE_URL` | String de conexão do PostgreSQL |
| `JWT_SECRET` | String aleatória, 32+ caracteres (`openssl rand -hex 32`) |
| `WEB_ORIGIN` | URL do frontend, para o CORS (`http://localhost:3004` em dev) |

```bash
npm install
npm run prisma:migrate   # cria o schema
npm run prisma:seed      # equipe de demonstração e um board "Product Launch" com cartões em cada coluna
npm run dev              # http://localhost:4004
```

Contas de demonstração criadas pelo seed, todas no mesmo board (senha `Passw0rd!123`):

`nova@flowboard.dev` · `priya@flowboard.dev` · `theo@flowboard.dev`

### 2. Configurar o frontend

```bash
cd apps/web
cp .env.local.example .env.local   # NEXT_PUBLIC_API_URL
npm install
npm run dev -- -p 3004             # http://localhost:3004
```

## Testes

```bash
cd apps/api
npm test        # testes unitários de posicionamento fracionário e rebalanceamento (Vitest)
```

## Stack

Next.js 16 · React 19 · TypeScript · Tailwind CSS · TanStack Query · Node.js · Express · Socket.IO · Prisma · PostgreSQL · Zod · Vitest
