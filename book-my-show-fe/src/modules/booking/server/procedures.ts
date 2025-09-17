import { publicProcedure, createTRPCRouter } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { getShowtimeById } from "../actions/actions";
import { showtimeIdParam } from "../schema";

export const bookingRouter = createTRPCRouter({
  getShowtime: publicProcedure
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
});
