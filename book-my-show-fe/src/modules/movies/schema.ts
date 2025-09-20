import { z } from "zod";

export const moviesSearchParams = z.object({
  title: z.string().optional().nullable(),
  genre: z.string().optional().nullable(),
});

export const movieIdParam = z.object({
  movieId: z.string().min(1, "Movie ID is required"),
});

export const movieShowtimesParams = z.object({
  movieId: z.string().min(1, "Movie ID is required"),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
});

export const showtimeIdParam = z.object({
  showtimeId: z.string().min(1, "Showtime ID is required"),
});
