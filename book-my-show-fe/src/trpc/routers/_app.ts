import { moviesRouter } from "@/modules/movies/server/procedures";
import { eventsRouter } from "@/modules/events/server/procedures";
import { createTRPCRouter } from "../init";

export const appRouter = createTRPCRouter({
  movies: moviesRouter,
  events: eventsRouter,
});

export type AppRouter = typeof appRouter;
