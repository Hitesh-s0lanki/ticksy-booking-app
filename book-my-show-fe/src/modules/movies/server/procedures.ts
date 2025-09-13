import { publicProcedure, createTRPCRouter } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { getAllMovies } from "../actions/actions";
import { moviesSearchParams } from "../schema";

export const moviesRouter = createTRPCRouter({
  getMany: publicProcedure
    .input(moviesSearchParams)
    .query(async ({ input }) => {
      const { data, statusCode, message } = await getAllMovies({
        title: input.title ? input.title?.trim() : null,
        genre: input.genre ? input.genre?.trim() : null,
      });

      if (statusCode !== 200) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message,
        });
      }

      return data?.movies || [];
    }),
});
