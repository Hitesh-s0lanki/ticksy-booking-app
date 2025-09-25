"use client";

import { useMoviesFilters } from "@/modules/movies/hooks/use-movies-filters";
import Header from "./header";
import MovieCard from "./movie-card";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import NoDataFound from "@/components/no-data-found";

const MoviesList = () => {
  const trpc = useTRPC();
  const [filters, setFilters] = useMoviesFilters();

  const { data } = useSuspenseQuery(
    trpc.movies.getMany.queryOptions({
      ...filters,
    })
  );

  return (
    <div className="py-5 px-5 md:px-10 lg:px-20 pb-20">
      <Header />
      <div className="px-4 w-full">
        {data.length === 0 && <NoDataFound />}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {data.map((movie) => (
            <MovieCard key={movie.movieId} movie={movie} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default MoviesList;
