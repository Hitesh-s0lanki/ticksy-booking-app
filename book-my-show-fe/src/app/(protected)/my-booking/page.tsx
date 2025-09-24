import MyBookingDetails from "./_components/my-booking-details";
import { Suspense } from "react";
import { getQueryClient, trpc } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import Loading from "@/components/loading";
import { ErrorBoundary } from "react-error-boundary";
import { ErrorState } from "@/components/error-state";

const MyBooking = () => {
  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(trpc.bookings.getUserBookings.queryOptions());

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
          <MyBookingDetails />
        </ErrorBoundary>
      </Suspense>
    </HydrationBoundary>
  );
};

export default MyBooking;
