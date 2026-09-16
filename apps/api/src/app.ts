import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { env } from "./config/env.js";
import { authRouter } from "./modules/auth/auth.routes.js";
import { boardsRouter } from "./modules/boards/boards.routes.js";
import { columnsRouter } from "./modules/columns/columns.routes.js";
import { cardsRouter } from "./modules/cards/cards.routes.js";
import { errorHandler, notFoundHandler } from "./middlewares/errorHandler.js";
import { apiRateLimiter } from "./middlewares/rateLimiters.js";

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: env.WEB_ORIGIN, credentials: true }));
  app.use(express.json({ limit: "1mb" }));
  app.use(cookieParser());
  app.use(apiRateLimiter);

  app.get("/health", (_req, res) => res.status(200).json({ status: "ok" }));

  app.use("/boards", boardsRouter);
  app.use("/boards/:boardId/columns", columnsRouter);
  app.use("/boards/:boardId/cards", cardsRouter);
  app.use("/auth", authRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
