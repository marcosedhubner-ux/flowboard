import { z } from "zod";

export const createColumnSchema = z.object({
  name: z.string().min(1).max(60),
});

export const renameColumnSchema = z.object({
  name: z.string().min(1).max(60),
});

export type CreateColumnInput = z.infer<typeof createColumnSchema>;
export type RenameColumnInput = z.infer<typeof renameColumnSchema>;
