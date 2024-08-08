import { z } from "zod";

export const ProjectSchema = z.object({
  id: z.string().uuid(),
  content: z.string(),
  userId: z.string().uuid(),
});

export const CreateProjectSchema = z.object({
  content: z.string().min(1),
  userId: z.string().uuid(),
});

export const UpdateProjectSchema = z.object({
  content: z.string().min(1).optional(),
  userId: z.string().uuid().optional(),
});