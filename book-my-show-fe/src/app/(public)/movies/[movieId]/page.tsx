import { Suspense } from "react";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { ErrorBoundary } from "react-error-boundary";

import { getQueryClient, trpc } from "@/trpc/server";
import MovieDetails from "../_components/movie-details";
import Loading from "@/components/loading";
import { ErrorState } from "@/components/error-state";

type Props = {
  params: Promise<{
    movieId: string;
  }>;
};

const MoviePage = async ({ params }: Props) => {
  const { movieId } = await params;

  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(trpc.movies.getById.queryOptions({ movieId }));

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<Loading />}>
        <ErrorBoundary
          fallback={
            <ErrorState
              title="Unable to load movie details"
              description="We are having some trouble loading movie details. Please try again later."
            />
          }
        >
          <MovieDetails movieId={movieId} />
        </ErrorBoundary>
      </Suspense>
    </HydrationBoundary>
  );
  return;
};

export default MoviePage;
