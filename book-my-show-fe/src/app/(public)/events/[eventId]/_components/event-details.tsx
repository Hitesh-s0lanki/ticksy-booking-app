"use client";

import Image from "next/image";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ErrorState } from "@/components/error-state";
import { Button } from "@/components/ui/button";
import { CalendarArrowDownIcon } from "lucide-react";
import Link from "next/link";

interface Props {
  eventId: string;
}

const EventDetails = ({ eventId }: Props) => {
  const trpc = useTRPC();

  const { data } = useSuspenseQuery(
    trpc.events.getShowtimes.queryOptions({ eventId })
  );

  if (!data) {
    return (
      <ErrorState
        title="Event not found"
        description="The event you are looking for does not exist."
      />
    );
  }

  if (!data.event) {
    return (
      <ErrorState
        title="Event not found"
        description="The event details are missing."
      />
    );
  }

  const start = new Date(data.event.startDate);
  const end = new Date(data.event.endDate);
  const durationMinutes = Math.round((end.getTime() - start.getTime()) / 60000);
  const durationHours = durationMinutes / 60 || 2;

  const imageSrc = data.event.bannerUrl && data.event.bannerUrl.trim() !== ""
    ? data.event.bannerUrl
    : "/logo.png";

  return (
    <div className="w-full flex items-center justify-center p-4 sm:p-6 md:p-8 lg:p-10">
      <div className="p-4 sm:p-6 md:p-8 w-full h-full grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 bg-primary/10 border-2 border-primary/30 rounded-md shadow-lg">
        <div className="relative w-full h-48 sm:h-64 md:h-80 mx-auto md:mx-0">
          <Image
            src={imageSrc}
            alt={data.event.title}
            fill
            className="object-cover rounded-md shadow-2xl"
            unoptimized
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              if (target.src !== "/logo.png") {
                target.src = "/logo.png";
              }
            }}
          />
        </div>
        <div className="col-span-1 md:col-span-2 flex flex-col gap-3 sm:gap-4 justify-center">
          <h1 className="text-xl sm:text-2xl font-bold">{data.event.title}</h1>
          <p className="text-sm sm:text-base text-gray-700">{data.event.description}</p>
          <div className="text-xs sm:text-sm text-gray-600 flex flex-col gap-1">
            <p>
              <strong>Event Timing:</strong>{" "}
              {start.toLocaleString("en-GB", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
            <p>
              <strong>Venue:</strong> {data.venueName}
            </p>
            <p>
              <strong>Duration:</strong> {durationHours} hours
            </p>
          </div>
          <div>
            <Button asChild className="w-full sm:w-auto">
              <Link
                href={`/bookings/${data.showtimes?.showtimeId}?source=event`}
              >
                <CalendarArrowDownIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-1" />
                Grab Your Spot
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;
