import { prisma } from "../../db/client.js";
import type { Prisma } from "@prisma/client";

const boardDetailInclude = {
  members: { include: { user: { select: { id: true, fullName: true, email: true } } } },
  columns: {
    orderBy: { position: "asc" },
    include: {
      cards: {
        orderBy: { position: "asc" },
        include: {
          assignee: { select: { id: true, fullName: true } },
          createdBy: { select: { id: true, fullName: true } },
        },
      },
    },
  },
  activity: {
    orderBy: { createdAt: "desc" },
    take: 30,
    include: { actor: { select: { id: true, fullName: true } } },
  },
} satisfies Prisma.BoardInclude;

export function findBoardsForUser(userId: string) {
  return prisma.board.findMany({
    where: { members: { some: { userId } } },
    include: { members: { select: { userId: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export function findBoardDetail(boardId: string) {
  return prisma.board.findUnique({ where: { id: boardId }, include: boardDetailInclude });
}

export function findMembership(boardId: string, userId: string) {
  return prisma.boardMember.findUnique({ where: { boardId_userId: { boardId, userId } } });
}

export function createBoard(name: string, creatorId: string, columnPositions: number[]) {
  const columnNames = ["To Do", "In Progress", "Done"];
  return prisma.board.create({
    data: {
      name,
      createdById: creatorId,
      members: { create: { userId: creatorId, role: "OWNER" } },
      columns: {
        create: columnNames.map((columnName, index) => ({
          name: columnName,
          position: columnPositions[index]!,
        })),
      },
    },
    include: boardDetailInclude,
  });
}

export function addMember(boardId: string, userId: string) {
  return prisma.boardMember.create({ data: { boardId, userId } });
}

export function logActivity(boardId: string, actorId: string, message: string) {
  return prisma.activityEvent.create({ data: { boardId, actorId, message } });
}

export const detailInclude = boardDetailInclude;
