"use server";

import { Movie as MovieProto, MoviesList } from "@/gen/js-ts/movie_pb";
import { ShowtimeMovieResponseList } from "@/gen/js-ts/showtime_pb";
import { axiosInstance } from "@/lib/axios-instance";
import { apiResponse, errorHandler } from "@/lib/handler";
import { deseralize } from "@/lib/utils";
import { PlainMessage } from "@bufbuild/protobuf";

export const getAllMovies = async ({
  title,
  genre,
}: {
  title?: string | null;
  genre?: string | null;
}): Promise<{
  data?: PlainMessage<MoviesList>;
  message: string;
  statusCode: number;
}> => {
  try {
    // Build query parameters
    const params = new URLSearchParams();
    if (title) params.append("title", title);
    if (genre) params.append("genre", genre);

    const queryString = params.toString();
    const url = queryString ? `/movies?${queryString}` : "/movies";

    // Fetch all movies from the backend
    const response = await axiosInstance.get(url);

    // Deserialize the response data
    const movies = deseralize(MoviesList.fromBinary, response);

    return apiResponse("Movies fetched succesfully", 200, movies);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    // Capture api related error and report it to sentry
    console.error("Error fetching movies:", error);
    return errorHandler(
      error?.message || "Failed to fetch movies.",
      error?.response?.status || 500
    );
  }
};

export const getMovieById = async ({
  id,
}: {
  id: string;
}): Promise<{
  data?: PlainMessage<MovieProto>;
  message: string;
  statusCode: number;
}> => {
  try {
    // Fetch movie by ID from the backend
    const response = await axiosInstance.get(`/movies/${id}`);

    // Deserialize the response data
    const movie = deseralize(MovieProto.fromBinary, response);

    return apiResponse("Movie fetched succesfully", 200, movie);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    // Capture api related error and report it to sentry
    console.error("Error fetching movie by ID:", error);
    return errorHandler(
      error?.message || "Failed to fetch movie.",
      error?.response?.status || 500
    );
  }
};

export const getMovieShowtimes = async ({
  movieId,
  date,
}: {
  movieId: string;
  date: string; // Expected format: 'YYYY-MM-DD'
}): Promise<{
  data?: PlainMessage<ShowtimeMovieResponseList>;
  message: string;
  statusCode: number;
}> => {
  try {
    // Fetch movie showtimes from the backend
    const response = await axiosInstance.get(
      `/showtimes/by-movie/${movieId}?date=${date}`
    );

    // Deserialize the response data
    const showtimes = deseralize(
      ShowtimeMovieResponseList.fromBinary,
      response
    );

    return apiResponse("Showtimes fetched successfully", 200, showtimes);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    // Capture api related error and report it to sentry
    console.error("Error fetching movie showtimes:", error);
    return errorHandler(
      error?.message || "Failed to fetch showtimes.",
      error?.response?.status || 500
    );
  }
};
