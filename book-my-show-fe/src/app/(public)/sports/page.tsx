import { Suspense } from "react";
import { getQueryClient, trpc } from "@/trpc/server";
import EventsList from "./_components/events-list";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import Loading from "@/components/loading";
import { ErrorBoundary } from "react-error-boundary";
import { ErrorState } from "@/components/error-state";
import { SearchParams } from "next/dist/server/request/search-params";
import { loadSearchParams } from "@/modules/events/params";

type Props = {
  searchParams: Promise<SearchParams>;
};

const EventsPage = async ({ searchParams }: Props) => {
  const filters = await loadSearchParams(searchParams);

  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(
    trpc.events.getManySports.queryOptions({
      ...filters,
    })
  );

  return (
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
          <EventsList />
        </ErrorBoundary>
      </Suspense>
    </HydrationBoundary>
  );
};

export default EventsPage;
