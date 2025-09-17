import { z } from "zod";

export const showtimeIdParam = z.object({
  showtimeId: z.string().min(1, "Showtime ID is required"),
});
