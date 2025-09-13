import { moviesRouter } from "@/modules/movies/server/procedures";
import { createTRPCRouter } from "../init";

export const appRouter = createTRPCRouter({
  movies: moviesRouter,
});

export type AppRouter = typeof appRouter;
