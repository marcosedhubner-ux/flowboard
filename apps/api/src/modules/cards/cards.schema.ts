import { z } from "zod";

export const createCardSchema = z.object({
  columnId: z.string().cuid(),
  title: z.string().min(1).max(160),
  description: z.string().max(2000).optional(),
  assigneeId: z.string().cuid().optional(),
});

export const updateCardSchema = z.object({
  title: z.string().min(1).max(160).optional(),
  description: z.string().max(2000).nullable().optional(),
  assigneeId: z.string().cuid().nullable().optional(),
});

export const moveCardSchema = z.object({
  columnId: z.string().cuid(),
  beforeCardId: z.string().cuid().nullable().optional(),
  afterCardId: z.string().cuid().nullable().optional(),
});

export type CreateCardInput = z.infer<typeof createCardSchema>;
export type UpdateCardInput = z.infer<typeof updateCardSchema>;
export type MoveCardInput = z.infer<typeof moveCardSchema>;
