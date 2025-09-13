"use client";

import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import DataSelection from "./date-selection";
import MovieHeroSection from "./movie-hero-section";
import TheaterSelection from "./theater-selection";
import { ErrorState } from "@/components/error-state";
import { generateDates } from "@/lib/utils";
import { useState } from "react";

type Props = {
  movieId: string;
};

const MovieDetails = ({ movieId }: Props) => {
  const trpc = useTRPC();

  const [selectedDate, setSelectedDate] = useState(new Date());

  const { data } = useSuspenseQuery(
    trpc.movies.getById.queryOptions({ movieId })
  );

  if (!data) {
    return (
      <ErrorState
        title="Movie not found"
        description="The movie you are looking for does not exist."
      />
    );
  }

  return (
    <div className="p-8 flex flex-col gap-8">
      <MovieHeroSection movie={data} />
      <DataSelection
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
      />
      <TheaterSelection
        date={selectedDate.toISOString().slice(0, 10)}
        movieId={movieId}
      />
    </div>
  );
};

export default MovieDetails;
