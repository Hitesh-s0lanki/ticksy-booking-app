import { moviesRouter } from "@/modules/movies/server/procedures";
import { eventsRouter } from "@/modules/events/server/procedures";
import { createTRPCRouter } from "../init";
import { dashboardRouter } from "@/modules/dashboard/server/procedures";
import { bookingRouter } from "@/modules/booking/server/procedures";

export const appRouter = createTRPCRouter({
  dashboard: dashboardRouter,
  movies: moviesRouter,
  events: eventsRouter,
  bookings: bookingRouter,
});

export type AppRouter = typeof appRouter;
