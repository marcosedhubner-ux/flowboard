import { Router } from "express";
import { createColumnSchema, renameColumnSchema } from "./columns.schema.js";
import * as columnsService from "./columns.service.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { authenticate } from "../../middlewares/authenticate.js";
import { UnauthorizedError } from "../../domain/errors.js";
import { broadcastToBoard } from "../../realtime/socket.js";

export const columnsRouter = Router({ mergeParams: true });

columnsRouter.use(authenticate);

columnsRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    if (!req.auth) throw new UnauthorizedError();
    const { boardId } = req.params as { boardId: string };
    const input = createColumnSchema.parse(req.body);
    const column = await columnsService.createColumn(boardId, input, req.auth.userId);
    broadcastToBoard(boardId, "board:updated", { boardId });
    res.status(201).json({ column });
  })
);

columnsRouter.patch(
  "/:columnId",
  asyncHandler(async (req, res) => {
    if (!req.auth) throw new UnauthorizedError();
    const { boardId, columnId } = req.params as { boardId: string; columnId: string };
    const input = renameColumnSchema.parse(req.body);
    const column = await columnsService.renameColumn(boardId, columnId, input, req.auth.userId);
    broadcastToBoard(boardId, "board:updated", { boardId });
    res.status(200).json({ column });
  })
);
