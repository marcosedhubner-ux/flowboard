import { prisma } from "../../db/client.js";
import { assertMembership } from "../boards/boards.service.js";
import { logActivity } from "../boards/boards.repository.js";
import { NotFoundError } from "../../domain/errors.js";
import { positionAfter } from "../../domain/ordering.js";
import type { CreateColumnInput, RenameColumnInput } from "./columns.schema.js";

export async function createColumn(boardId: string, input: CreateColumnInput, requesterId: string) {
  await assertMembership(boardId, requesterId);

  const lastColumn = await prisma.column.findFirst({
    where: { boardId },
    orderBy: { position: "desc" },
  });

  const column = await prisma.column.create({
    data: { boardId, name: input.name, position: positionAfter(lastColumn?.position ?? null) },
  });

  await logActivity(boardId, requesterId, `added the "${input.name}" column`);
  return column;
}

export async function renameColumn(
  boardId: string,
  columnId: string,
  input: RenameColumnInput,
  requesterId: string
) {
  await assertMembership(boardId, requesterId);

  const column = await prisma.column.findFirst({ where: { id: columnId, boardId } });
  if (!column) {
    throw new NotFoundError("Column");
  }

  return prisma.column.update({ where: { id: columnId }, data: { name: input.name } });
}
