import { Suspense } from "react";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { ErrorBoundary } from "react-error-boundary";

import { getQueryClient, trpc } from "@/trpc/server";
import Loading from "@/components/loading";
import { ErrorState } from "@/components/error-state";
import BookingDetails from "../_components/booking-details";
import { SearchParams } from "next/dist/server/request/search-params";
import { loadSearchParams } from "@/modules/booking/params";

type Props = {
  params: Promise<{
    showtimeId: string;
  }>;
  searchParams: Promise<SearchParams>;
};

const BookingPage = async ({ params, searchParams }: Props) => {
  const { showtimeId } = await params;
  const filters = await loadSearchParams(searchParams);

  const queryClient = getQueryClient();

  // Prefetch based on source type
  if (filters.source === "event") {
    void queryClient.prefetchQuery(
      trpc.events.getShowtime.queryOptions({ showtimeId })
    );
  } else {
    void queryClient.prefetchQuery(
      trpc.bookings.getShowtime.queryOptions({ showtimeId })
    );
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<Loading />}>
        <ErrorBoundary
          fallback={
            <ErrorState
              title="Unable to load booking details"
              description="We are having some trouble loading booking details. Please try again later."
            />
          }
        >
          <BookingDetails
            showtimeId={showtimeId}
            source={filters.source === "event" ? "event" : "movie"}
          />
        </ErrorBoundary>
      </Suspense>
    </HydrationBoundary>
  );
};

export default BookingPage;
