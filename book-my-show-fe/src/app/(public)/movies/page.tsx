import { Suspense } from "react";
import { getQueryClient, trpc } from "@/trpc/server";
import MoviesList from "./_components/movies-list";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import Loading from "@/components/loading";
import { ErrorBoundary } from "react-error-boundary";
import { ErrorState } from "@/components/error-state";
import { SearchParams } from "next/dist/server/request/search-params";
import { loadSearchParams } from "@/modules/movies/params";

type Props = {
  searchParams: Promise<SearchParams>;
};

const MoviesPage = async ({ searchParams }: Props) => {
  const filters = await loadSearchParams(searchParams);

  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(
    trpc.movies.getMany.queryOptions({
      ...filters,
    })
  );

  return (
    <>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <Suspense fallback={<Loading />}>
          <ErrorBoundary
            fallback={
              <ErrorState
                title="Something went wrong"
                description="Please try again later"
              />
            }
          >
            <MoviesList />
          </ErrorBoundary>
        </Suspense>
      </HydrationBoundary>
    </>
  );
};

export default MoviesPage;
