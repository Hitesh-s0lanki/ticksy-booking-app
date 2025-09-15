import { Suspense } from "react";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { ErrorBoundary } from "react-error-boundary";

import { getQueryClient, trpc } from "@/trpc/server";
import EventDetails from "./_components/event-details";
import Loading from "@/components/loading";
import { ErrorState } from "@/components/error-state";

interface Props {
  params: Promise<{
    eventId: string;
  }>;
}

const EventPage = async ({ params }: Props) => {
  const { eventId } = await params;

  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(trpc.events.getById.queryOptions({ eventId }));

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<Loading />}>
        <ErrorBoundary
          fallback={
            <ErrorState
              title="Unable to load event details"
              description="We are having some trouble loading event details. Please try again later."
            />
          }
        >
          <EventDetails eventId={eventId} />
        </ErrorBoundary>
      </Suspense>
    </HydrationBoundary>
  );
};

export default EventPage;
