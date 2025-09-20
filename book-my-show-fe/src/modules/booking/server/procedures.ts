import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import {
  createBooking,
  getShowtimeById,
  getUserBookings,
} from "../actions/actions";
import { bookingPayload, showtimeIdParam } from "../schema";

export const bookingRouter = createTRPCRouter({
  getShowtime: protectedProcedure
    .input(showtimeIdParam)
    .query(async ({ input }) => {
      const { showtimeId } = input;

      const showtime = await getShowtimeById({ id: showtimeId });

      if (showtime.statusCode !== 200 || !showtime.data) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: showtime.message,
        });
      }

      return showtime.data;
    }),

  createBooking: protectedProcedure
    .input(bookingPayload)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.auth.userId;

      const booking = await createBooking(input, userId);

      if (booking.statusCode !== 201) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: booking.message,
        });
      }

      return booking;
    }),
  getUserBookings: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.auth.userId;

    const bookings = await getUserBookings(userId);

    if (bookings.statusCode !== 200) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: bookings.message,
      });
    }

    if (!bookings.data) {
      return [];
    }

    return bookings.data;
  }),
});
