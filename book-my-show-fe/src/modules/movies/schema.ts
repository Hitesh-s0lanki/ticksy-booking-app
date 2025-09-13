import { z } from "zod";

export const moviesSearchParams = z.object({
  title: z.string().optional().nullable(),
  genre: z.string().optional().nullable(),
});
