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
    <div className="px-20 py-8 flex justify-center items-center w-full">
      <div className="max-w-4xl w-full">
        <h1 className="text-3xl font-semibold text-gray-800 mb-8">
          My Bookings
        </h1>

        <Tabs defaultValue="upcoming" className="w-full">
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="upcoming">
              Upcoming ({upcoming.length})
            </TabsTrigger>
            <TabsTrigger value="past">
              Past Bookings ({past.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="space-y-6 mt-6">
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
                <CardContent className="text-center py-12">
                  <Ticket className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">
                    No Upcoming Bookings
                  </h3>
                  <p className="text-gray-600 mb-4">
                    You don't have any upcoming bookings.
                  </p>
                  <Button asChild>
                    <Link href="/">Book Now</Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="past" className="space-y-6 mt-6">
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
                <CardContent className="text-center py-12">
                  <Ticket className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">
                    No Past Bookings
                  </h3>
                  <p className="text-gray-600">
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
