import { Suspense } from "react";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { ErrorBoundary } from "react-error-boundary";

import { getQueryClient, trpc } from "@/trpc/server";
import Loading from "@/components/loading";
import { ErrorState } from "@/components/error-state";
import BookingDetails from "../_components/booking-details";

type Props = {
  params: Promise<{
    showtimeId: string;
  }>;
};

const BookingPage = async ({ params }: Props) => {
  const { showtimeId } = await params;

  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(
    trpc.bookings.getShowtime.queryOptions({ showtimeId })
  );

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
          <BookingDetails showtimeId={showtimeId} />
        </ErrorBoundary>
      </Suspense>
    </HydrationBoundary>
  );
  return;
};

export default BookingPage;
