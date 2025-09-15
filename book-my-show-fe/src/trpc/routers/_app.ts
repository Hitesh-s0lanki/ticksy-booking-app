import { moviesRouter } from "@/modules/movies/server/procedures";
import { eventsRouter } from "@/modules/events/server/procedures";
import { createTRPCRouter } from "../init";
import { dashboardRouter } from "@/modules/dashboard/server/procedures";

export const appRouter = createTRPCRouter({
  dashboard: dashboardRouter,
  movies: moviesRouter,
  events: eventsRouter,
});

export type AppRouter = typeof appRouter;
