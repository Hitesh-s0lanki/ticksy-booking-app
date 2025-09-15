import { publicProcedure, createTRPCRouter } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { getAllEvents, getEventById } from "../actions/actions";
import { eventsSearchParams, eventIdParam } from "../schema";

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
});
