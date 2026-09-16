import type { Server, Socket } from "socket.io";
import { verifyToken } from "../modules/auth/auth.service.js";
import { prisma } from "../db/client.js";

let ioInstance: Server | null = null;

const presenceByBoard = new Map<string, Map<string, { userId: string; fullName: string }>>();

function parseCookie(cookieHeader: string | undefined, name: string): string | undefined {
  if (!cookieHeader) return undefined;
  const match = cookieHeader.split("; ").find((entry) => entry.startsWith(`${name}=`));
  return match?.slice(name.length + 1);
}

function broadcastPresence(boardId: string): void {
  const viewers = Array.from(presenceByBoard.get(boardId)?.values() ?? []);
  ioInstance?.to(`board:${boardId}`).emit("presence:update", { boardId, viewers });
}

export function registerRealtimeServer(io: Server): void {
  ioInstance = io;

  io.use((socket: Socket, next) => {
    const token = parseCookie(socket.handshake.headers.cookie, "flowboard_token");
    if (!token) {
      next(new Error("Unauthorized"));
      return;
    }

    try {
      socket.data.userId = verifyToken(token).userId;
      next();
    } catch {
      next(new Error("Unauthorized"));
    }
  });

  io.on("connection", (socket: Socket) => {
    socket.on("board:view", async (boardId: string) => {
      const user = await prisma.user.findUnique({ where: { id: socket.data.userId } });
      if (!user) return;

      socket.data.currentBoardId = boardId;
      await socket.join(`board:${boardId}`);

      if (!presenceByBoard.has(boardId)) {
        presenceByBoard.set(boardId, new Map());
      }
      presenceByBoard.get(boardId)!.set(socket.id, { userId: user.id, fullName: user.fullName });
      broadcastPresence(boardId);
    });

    socket.on("board:leave", () => {
      leaveCurrentBoard(socket);
    });

    socket.on("disconnect", () => {
      leaveCurrentBoard(socket);
    });
  });
}

function leaveCurrentBoard(socket: Socket): void {
  const boardId = socket.data.currentBoardId as string | undefined;
  if (!boardId) return;

  presenceByBoard.get(boardId)?.delete(socket.id);
  socket.leave(`board:${boardId}`);
  broadcastPresence(boardId);
  socket.data.currentBoardId = undefined;
}

export function broadcastToBoard(boardId: string, event: string, payload: unknown): void {
  ioInstance?.to(`board:${boardId}`).emit(event, payload);
}
