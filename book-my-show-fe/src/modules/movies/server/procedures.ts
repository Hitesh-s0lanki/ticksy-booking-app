import { publicProcedure, createTRPCRouter } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import {
  getAllMovies,
  getMovieById,
  getMovieShowtimes,
} from "../actions/actions";
import {
  movieIdParam,
  movieShowtimesParams,
  moviesSearchParams,
} from "../schema";

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
  getById: publicProcedure.input(movieIdParam).query(async ({ input }) => {
    const { data, statusCode, message } = await getMovieById({
      id: input.movieId,
    });

    if (statusCode !== 200 || !data) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message,
      });
    }

    return data;
  }),
  getShowtimes: publicProcedure
    .input(movieShowtimesParams)
    .query(async ({ input }) => {
      const { data, statusCode, message } = await getMovieShowtimes({
        movieId: input.movieId,
        date: input.date,
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
