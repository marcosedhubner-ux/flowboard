# FlowBoard

A real-time collaborative Kanban board. Drag a card and everyone else looking at the board sees it move instantly, sees who else is currently viewing, and sees it land in an activity feed — without a full-board refresh and without ever renumbering every other card in the column.

[Leia em português](./README.pt-BR.md)

## Why this exists

The obvious way to store "card order" is an integer column and a re-index on every drag: card moves to position 3, so every card after it shifts by one, in a single request. That works until two people drag cards in the same column at the same time, or the column has a few hundred cards — now every move is an O(n) write and a race condition waiting to happen. FlowBoard uses fractional positioning instead: each card gets a floating-point position, and inserting between two cards is just the midpoint between their positions — an O(1) write that touches exactly one row.

## Architecture

```
apps/
  web/   Next.js 16 (App Router, TypeScript, Tailwind) — boards, columns, cards, activity, presence
  api/   Node/Express (TypeScript) — REST API + Socket.IO, Prisma ORM, PostgreSQL
```

```
src/
  domain/            ordering.ts — pure fractional-positioning logic, framework-free, unit tested
                      errors.ts — typed domain errors mapped to HTTP status codes
  modules/<name>/     <name>.schema.ts   Zod input validation
                      <name>.service.ts   business logic
                      <name>.routes.ts    Express router, thin controllers
  middlewares/         auth, rate limiting, centralized error handling
  realtime/            Socket.IO rooms per board, plus an in-memory presence registry
```

## The interesting part: fractional positioning with automatic rebalancing

Moving a card to sit between card A (position 100) and card B (position 200) sets its position to 150 — no other row is touched (`domain/ordering.ts`). Dropping at the very start or end works the same way against a `null` neighbor. The one thing this scheme can't do forever is insert infinitely between the same two neighbors: floating-point precision eventually runs out. `needsRebalance` detects when the gap between two positions has collapsed below a threshold, and when it fires, `cards.service.ts` re-spaces every card in that column evenly (`rebalancedPositions`) in a single transaction before completing the move — an operation that stays rare in practice (it only triggers after dozens of insertions squeezed into the same slot) but keeps the scheme correct indefinitely instead of quietly degrading. `tests/ordering.test.ts` exercises the collapse case directly: enough repeated midpoint insertions to force `needsRebalance` to flip true.

Card moves are optimistic on the client (`useMoveCard` in `apps/web`): the UI reorders instantly on drop, rolls back automatically if the API rejects the move, and reconciles with the server's authoritative positions either way — so dragging feels instant even though every move is still validated and persisted server-side.

## Real-time presence

Beyond broadcasting data changes (the same `board:updated` pattern used across this portfolio), FlowBoard tracks who is *currently looking at* a board — state that deliberately never touches the database, because it's only true for as long as a socket stays connected. Each connection joins a `board:<id>` room and registers itself in an in-memory map; the current viewer list is rebroadcast to that room on every join and disconnect. Close the tab, and you disappear from everyone else's presence bar within one round trip — no stale "online" indicator waiting to expire.

## Security

- Passwords hashed with bcrypt (cost factor 12); sessions are JWTs in `httpOnly`, `sameSite=lax` cookies — the same token is verified before a Socket.IO connection is allowed to join any room.
- Every board route checks membership server-side; a non-member gets a `403` on the board itself and on every column/card/member action inside it, never a partial view.
- Only a board's `OWNER` can add new members; any member can create columns and cards and move cards around, mirroring how most real teams actually use a shared board.
- All input validated with Zod at the boundary; Prisma parameterizes every query; rate limiting on auth endpoints; `helmet` security headers; CORS locked to the configured web origin.
- No secret ever lives in source control — see [Getting started](#getting-started).

## Getting started

### Prerequisites

- Node.js 20+
- A PostgreSQL 14+ instance (local or hosted)

### 1. Configure the API

```bash
cd apps/api
cp .env.example .env
```

| Variable | Description |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Random string, 32+ characters (`openssl rand -hex 32`) |
| `WEB_ORIGIN` | URL of the frontend, for CORS (`http://localhost:3004` in dev) |

```bash
npm install
npm run prisma:migrate   # creates the schema
npm run prisma:seed      # demo team and a "Product Launch" board with cards in every column
npm run dev              # http://localhost:4004
```

Demo accounts created by the seed, all on the same board (password `Passw0rd!123`):

`nova@flowboard.dev` · `priya@flowboard.dev` · `theo@flowboard.dev`

### 2. Configure the web app

```bash
cd apps/web
cp .env.local.example .env.local   # NEXT_PUBLIC_API_URL
npm install
npm run dev -- -p 3004             # http://localhost:3004
```

## Testing

```bash
cd apps/api
npm test        # fractional-positioning and rebalancing unit tests (Vitest)
```

## Tech stack

Next.js 16 · React 19 · TypeScript · Tailwind CSS · TanStack Query · Node.js · Express · Socket.IO · Prisma · PostgreSQL · Zod · Vitest
