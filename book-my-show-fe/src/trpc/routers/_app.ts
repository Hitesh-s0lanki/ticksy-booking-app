import { moviesRouter } from "@/modules/movies/server/procedures";
import { eventsRouter } from "@/modules/events/server/procedures";
import { createTRPCRouter } from "../init";
import { dashboardRouter } from "@/modules/dashboard/server/procedures";
import { bookingRouter } from "@/modules/booking/server/procedures";
import { razorpayRouter } from "@/modules/razorpay/server/procedures";

export const appRouter = createTRPCRouter({
  dashboard: dashboardRouter,
  movies: moviesRouter,
  events: eventsRouter,
  bookings: bookingRouter,
  razorpay: razorpayRouter,
});

export type AppRouter = typeof appRouter;
