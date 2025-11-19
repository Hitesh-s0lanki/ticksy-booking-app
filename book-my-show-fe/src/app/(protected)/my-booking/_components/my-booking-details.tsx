"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Ticket } from "lucide-react";
import BookingCard from "./booking-card";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import * as React from "react";
import Link from "next/link";

const MyBookingDetails = () => {
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(
    trpc.bookings.getUserBookings.queryOptions()
  );

  // Build a Date from booking.date (YYYY-MM-DD) and booking.time (HH:mm or HH:mm:ss)
  const toDateTime = React.useCallback((b: { date: string; time: string }) => {
    const time = b.time.length === 5 ? `${b.time}:00` : b.time; // ensure seconds
    const d = new Date(`${b.date}T${time}`); // interpreted in user's local tz
    return isNaN(d.getTime()) ? null : d;
  }, []);

  const { upcoming, past } = React.useMemo(() => {
    const now = new Date();

    const valid = (data ?? []).filter((b) => toDateTime(b) !== null);

    const upcoming = valid
      .filter((b) => {
        const dt = toDateTime(b)!;
        return dt.getTime() >= now.getTime();
      })
      .sort((a, b) => {
        const da = toDateTime(a)!.getTime();
        const db = toDateTime(b)!.getTime();
        return da - db; // soonest first
      });

    const past = valid
      .filter((b) => {
        const dt = toDateTime(b)!;
        return dt.getTime() < now.getTime();
      })
      .sort((a, b) => {
        const da = toDateTime(a)!.getTime();
        const db = toDateTime(b)!.getTime();
        return db - da; // most recent past first
      });

    return { upcoming, past };
  }, [data, toDateTime]);

  return (
    <div className="px-4 sm:px-6 md:px-8 lg:px-12 xl:px-20 py-6 sm:py-8 flex justify-center items-center w-full">
      <div className="max-w-4xl w-full">
        <h1 className="text-2xl sm:text-3xl font-semibold text-gray-800 mb-6 sm:mb-8">
          My Bookings
        </h1>

        <Tabs defaultValue="upcoming" className="w-full">
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="upcoming" className="text-xs sm:text-sm">
              <span className="hidden sm:inline">Upcoming </span>
              <span className="sm:hidden">Upcoming</span>
              ({upcoming.length})
            </TabsTrigger>
            <TabsTrigger value="past" className="text-xs sm:text-sm">
              <span className="hidden sm:inline">Past Bookings </span>
              <span className="sm:hidden">Past</span>
              ({past.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
            {upcoming.length > 0 ? (
              upcoming.map((booking) => (
                <BookingCard
                  key={booking.bookingId}
                  booking={booking}
                  isUpcoming={true}
                />
              ))
            ) : (
              <Card>
                <CardContent className="text-center py-8 sm:py-12 px-4">
                  <Ticket className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-3 sm:mb-4" />
                  <h3 className="text-lg sm:text-xl font-semibold mb-2">
                    No Upcoming Bookings
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600 mb-4">
                    You don't have any upcoming bookings.
                  </p>
                  <Button asChild size="sm" className="sm:size-default">
                    <Link href="/">Book Now</Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="past" className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
            {past.length > 0 ? (
              past.map((booking) => (
                <BookingCard
                  key={booking.bookingId}
                  booking={booking}
                  isUpcoming={false}
                />
              ))
            ) : (
              <Card>
                <CardContent className="text-center py-8 sm:py-12 px-4">
                  <Ticket className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-3 sm:mb-4" />
                  <h3 className="text-lg sm:text-xl font-semibold mb-2">
                    No Past Bookings
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600">
                    You haven't made any bookings yet.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MyBookingDetails;
