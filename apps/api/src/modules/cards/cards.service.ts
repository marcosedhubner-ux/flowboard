import { prisma } from "../../db/client.js";
import { assertMembership } from "../boards/boards.service.js";
import { logActivity } from "../boards/boards.repository.js";
import { NotFoundError } from "../../domain/errors.js";
import { needsRebalance, positionAfter, positionBetween, rebalancedPositions } from "../../domain/ordering.js";
import type { CreateCardInput, MoveCardInput, UpdateCardInput } from "./cards.schema.js";

const cardInclude = {
  assignee: { select: { id: true, fullName: true } },
  createdBy: { select: { id: true, fullName: true } },
} as const;

async function assertColumnInBoard(boardId: string, columnId: string) {
  const column = await prisma.column.findFirst({ where: { id: columnId, boardId } });
  if (!column) {
    throw new NotFoundError("Column");
  }
  return column;
}

export async function createCard(boardId: string, input: CreateCardInput, requesterId: string) {
  await assertMembership(boardId, requesterId);
  await assertColumnInBoard(boardId, input.columnId);

  const lastCard = await prisma.card.findFirst({
    where: { columnId: input.columnId },
    orderBy: { position: "desc" },
  });

  const card = await prisma.card.create({
    data: {
      boardId,
      columnId: input.columnId,
      title: input.title,
      description: input.description,
      assigneeId: input.assigneeId,
      createdById: requesterId,
      position: positionAfter(lastCard?.position ?? null),
    },
    include: cardInclude,
  });

  await logActivity(boardId, requesterId, `created card "${input.title}"`);
  return card;
}

export async function updateCard(
  boardId: string,
  cardId: string,
  input: UpdateCardInput,
  requesterId: string
) {
  await assertMembership(boardId, requesterId);

  const card = await prisma.card.findFirst({ where: { id: cardId, boardId } });
  if (!card) {
    throw new NotFoundError("Card");
  }

  if (input.assigneeId) {
    await assertMembership(boardId, input.assigneeId);
  }

  return prisma.card.update({
    where: { id: cardId },
    data: {
      title: input.title,
      description: input.description,
      assigneeId: input.assigneeId,
    },
    include: cardInclude,
  });
}

export async function deleteCard(boardId: string, cardId: string, requesterId: string) {
  await assertMembership(boardId, requesterId);

  const card = await prisma.card.findFirst({ where: { id: cardId, boardId } });
  if (!card) {
    throw new NotFoundError("Card");
  }

  await prisma.card.delete({ where: { id: cardId } });
  await logActivity(boardId, requesterId, `deleted card "${card.title}"`);
}

export async function moveCard(
  boardId: string,
  cardId: string,
  input: MoveCardInput,
  requesterId: string
) {
  await assertMembership(boardId, requesterId);

  const card = await prisma.card.findFirst({ where: { id: cardId, boardId } });
  if (!card) {
    throw new NotFoundError("Card");
  }
  await assertColumnInBoard(boardId, input.columnId);

  const [beforeCard, afterCard] = await Promise.all([
    input.beforeCardId
      ? prisma.card.findFirst({ where: { id: input.beforeCardId, columnId: input.columnId } })
      : null,
    input.afterCardId
      ? prisma.card.findFirst({ where: { id: input.afterCardId, columnId: input.columnId } })
      : null,
  ]);

  const beforePosition = beforeCard?.position ?? null;
  const afterPosition = afterCard?.position ?? null;

  let newPosition = positionBetween(beforePosition, afterPosition);

  if (needsRebalance(beforePosition, afterPosition)) {
    newPosition = await rebalanceColumnAndReturnTarget(input.columnId, cardId, input.beforeCardId ?? null);
  }

  const movedCard = await prisma.card.update({
    where: { id: cardId },
    data: { columnId: input.columnId, position: newPosition },
    include: cardInclude,
  });

  if (card.columnId !== input.columnId) {
    const targetColumn = await prisma.column.findUnique({ where: { id: input.columnId } });
    await logActivity(boardId, requesterId, `moved card "${card.title}" to "${targetColumn?.name}"`);
  }

  return movedCard;
}

async function rebalanceColumnAndReturnTarget(
  columnId: string,
  movingCardId: string,
  beforeCardId: string | null
): Promise<number> {
  const cardsInColumn = await prisma.card.findMany({
    where: { columnId, id: { not: movingCardId } },
    orderBy: { position: "asc" },
  });

  const insertIndex = beforeCardId
    ? cardsInColumn.findIndex((c) => c.id === beforeCardId) + 1
    : 0;

  const ordered = [...cardsInColumn];
  ordered.splice(insertIndex, 0, { id: movingCardId } as (typeof cardsInColumn)[number]);

  const positions = rebalancedPositions(ordered.length);

  const updates = ordered
    .map((c, index) => ({ id: c.id, position: positions[index]! }))
    .filter((entry) => entry.id !== movingCardId);

  await prisma.$transaction(
    updates.map((entry) => prisma.card.update({ where: { id: entry.id }, data: { position: entry.position } }))
  );

  return positions[insertIndex]!;
}
