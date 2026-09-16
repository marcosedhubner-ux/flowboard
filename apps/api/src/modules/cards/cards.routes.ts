import { Router } from "express";
import { createCardSchema, moveCardSchema, updateCardSchema } from "./cards.schema.js";
import * as cardsService from "./cards.service.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { authenticate } from "../../middlewares/authenticate.js";
import { UnauthorizedError } from "../../domain/errors.js";
import { broadcastToBoard } from "../../realtime/socket.js";

export const cardsRouter = Router({ mergeParams: true });

cardsRouter.use(authenticate);

cardsRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    if (!req.auth) throw new UnauthorizedError();
    const { boardId } = req.params as { boardId: string };
    const input = createCardSchema.parse(req.body);
    const card = await cardsService.createCard(boardId, input, req.auth.userId);
    broadcastToBoard(boardId, "board:updated", { boardId });
    res.status(201).json({ card });
  })
);

cardsRouter.patch(
  "/:cardId",
  asyncHandler(async (req, res) => {
    if (!req.auth) throw new UnauthorizedError();
    const { boardId, cardId } = req.params as { boardId: string; cardId: string };
    const input = updateCardSchema.parse(req.body);
    const card = await cardsService.updateCard(boardId, cardId, input, req.auth.userId);
    broadcastToBoard(boardId, "board:updated", { boardId });
    res.status(200).json({ card });
  })
);

cardsRouter.patch(
  "/:cardId/move",
  asyncHandler(async (req, res) => {
    if (!req.auth) throw new UnauthorizedError();
    const { boardId, cardId } = req.params as { boardId: string; cardId: string };
    const input = moveCardSchema.parse(req.body);
    const card = await cardsService.moveCard(boardId, cardId, input, req.auth.userId);
    broadcastToBoard(boardId, "board:updated", { boardId });
    res.status(200).json({ card });
  })
);

cardsRouter.delete(
  "/:cardId",
  asyncHandler(async (req, res) => {
    if (!req.auth) throw new UnauthorizedError();
    const { boardId, cardId } = req.params as { boardId: string; cardId: string };
    await cardsService.deleteCard(boardId, cardId, req.auth.userId);
    broadcastToBoard(boardId, "board:updated", { boardId });
    res.status(204).send();
  })
);
