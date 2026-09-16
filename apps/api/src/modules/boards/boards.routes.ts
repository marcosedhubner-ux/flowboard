import { Router } from "express";
import { addMemberSchema, createBoardSchema } from "./boards.schema.js";
import * as boardsService from "./boards.service.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { authenticate } from "../../middlewares/authenticate.js";
import { UnauthorizedError } from "../../domain/errors.js";
import { broadcastToBoard } from "../../realtime/socket.js";

export const boardsRouter = Router();

boardsRouter.use(authenticate);

boardsRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    if (!req.auth) throw new UnauthorizedError();
    const boards = await boardsService.listBoards(req.auth.userId);
    res.status(200).json({ boards });
  })
);

boardsRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    if (!req.auth) throw new UnauthorizedError();
    const input = createBoardSchema.parse(req.body);
    const board = await boardsService.createBoard(input, req.auth.userId);
    res.status(201).json({ board });
  })
);

boardsRouter.get(
  "/:id",
  asyncHandler(async (req, res) => {
    if (!req.auth) throw new UnauthorizedError();
    const { id } = req.params as { id: string };
    const board = await boardsService.getBoardDetail(id, req.auth.userId);
    res.status(200).json({ board });
  })
);

boardsRouter.post(
  "/:id/members",
  asyncHandler(async (req, res) => {
    if (!req.auth) throw new UnauthorizedError();
    const { id } = req.params as { id: string };
    const input = addMemberSchema.parse(req.body);
    await boardsService.addMemberByEmail(id, input.email, req.auth.userId);
    broadcastToBoard(id, "board:updated", { boardId: id });
    res.status(201).json({ ok: true });
  })
);
