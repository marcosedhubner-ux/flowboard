import { Prisma } from "@prisma/client";
import { prisma } from "../../db/client.js";
import * as boardsRepository from "./boards.repository.js";
import { ConflictError, ForbiddenError, NotFoundError } from "../../domain/errors.js";
import { rebalancedPositions } from "../../domain/ordering.js";
import type { CreateBoardInput } from "./boards.schema.js";

export function listBoards(userId: string) {
  return boardsRepository.findBoardsForUser(userId);
}

export async function createBoard(input: CreateBoardInput, creatorId: string) {
  const columnPositions = rebalancedPositions(3);
  return boardsRepository.createBoard(input.name, creatorId, columnPositions);
}

export async function assertMembership(boardId: string, userId: string) {
  const membership = await boardsRepository.findMembership(boardId, userId);
  if (!membership) {
    throw new ForbiddenError("You are not a member of this board");
  }
  return membership;
}

export async function assertOwner(boardId: string, userId: string) {
  const membership = await assertMembership(boardId, userId);
  if (membership.role !== "OWNER") {
    throw new ForbiddenError("Only the board owner can do this");
  }
  return membership;
}

export async function getBoardDetail(boardId: string, userId: string) {
  await assertMembership(boardId, userId);

  const board = await boardsRepository.findBoardDetail(boardId);
  if (!board) {
    throw new NotFoundError("Board");
  }
  return board;
}

export async function addMemberByEmail(boardId: string, email: string, requesterId: string) {
  await assertOwner(boardId, requesterId);

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new NotFoundError("No user with that email");
  }

  try {
    await boardsRepository.addMember(boardId, user.id);
    await boardsRepository.logActivity(boardId, requesterId, `added ${user.fullName} to the board`);
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      throw new ConflictError("This person is already a member of the board");
    }
    throw err;
  }
}
