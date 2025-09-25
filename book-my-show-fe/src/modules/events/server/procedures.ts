import { publicProcedure, createTRPCRouter } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import {
  getAllEvents,
  getEventById,
  getEventShowtime,
} from "../actions/actions";
import { eventsSearchParams, eventIdParam } from "../schema";
import { getShowtimeById } from "@/modules/booking/actions/actions";
import { showtimeIdParam } from "@/modules/booking/schema";

export const eventsRouter = createTRPCRouter({
  getManyEvents: publicProcedure
    .input(eventsSearchParams)
    .query(async ({ input }) => {
      const { data, statusCode, message } = await getAllEvents({
        title: input.title ? input.title.trim() : null,
        eventType: "GENERAL",
        categoryType: input.categoryType ? input.categoryType.trim() : null,
      });

      if (statusCode !== 200) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message,
        });
      }

      return data?.events || [];
    }),
  getManySports: publicProcedure
    .input(eventsSearchParams)
    .query(async ({ input }) => {
      const { data, statusCode, message } = await getAllEvents({
        title: input.title ? input.title.trim() : null,
        eventType: "SPORTS",
        categoryType: input.categoryType ? input.categoryType.trim() : null,
      });

      if (statusCode !== 200) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message,
        });
      }

      return data?.events || [];
    }),
  getById: publicProcedure.input(eventIdParam).query(async ({ input }) => {
    const { data, statusCode, message } = await getEventById({
      id: input.eventId,
    });

    if (statusCode !== 200) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message,
      });
    }

    return data;
  }),
  getShowtimes: publicProcedure.input(eventIdParam).query(async ({ input }) => {
    const { data, statusCode, message } = await getEventShowtime({
      eventId: input.eventId,
    });

    if (statusCode !== 200) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message,
      });
    }

    return data;
  }),
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
