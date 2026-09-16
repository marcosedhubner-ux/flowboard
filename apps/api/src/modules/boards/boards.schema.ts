import { z } from "zod";

export const createBoardSchema = z.object({
  name: z.string().min(2).max(120),
});

export const addMemberSchema = z.object({
  email: z.string().email(),
});

export type CreateBoardInput = z.infer<typeof createBoardSchema>;
export type AddMemberInput = z.infer<typeof addMemberSchema>;
