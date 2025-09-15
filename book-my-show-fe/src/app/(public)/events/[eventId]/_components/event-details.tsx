"use client";

import Image from "next/image";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ErrorState } from "@/components/error-state";
import { Button } from "@/components/ui/button";
import { CalendarArrowDownIcon } from "lucide-react";

interface Props {
  eventId: string;
}

const EventDetails = ({ eventId }: Props) => {
  const trpc = useTRPC();

  const { data } = useSuspenseQuery(
    trpc.events.getById.queryOptions({ eventId })
  );

  if (!data) {
    return (
      <ErrorState
        title="Event not found"
        description="The event you are looking for does not exist."
      />
    );
  }

  const start = new Date(data.startDate);
  const end = new Date(data.endDate);
  const durationMinutes = Math.round((end.getTime() - start.getTime()) / 60000);
  const durationHours = durationMinutes / 60 || 2;

  return (
    <div className="w-full flex items-center justify-center p-10">
      <div className="p-8 w-full h-full grid grid-cols-3 gap-6 bg-primary/10 border-2 border-primary/30 rounded-md shadow-lg">
        <div className="relative w-full h-64">
          <Image
            src={data.bannerUrl}
            alt={data.title}
            fill
            className="object-cover rounded-md shadow-2xl"
            unoptimized
          />
        </div>
        <div className="col-span-2 flex flex-col gap-4 justify-center">
          <h1 className="text-2xl font-bold">{data.title}</h1>
          <p className="text-gray-700">{data.description}</p>
          <div className="text-sm text-gray-600 flex flex-col gap-1">
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
              <strong>Venue:</strong> {data.organizerName}
            </p>
            <p>
              <strong>Duration:</strong> {durationHours} hours
            </p>
            <p>
              <strong>Category:</strong> {data.categoryType.toLocaleUpperCase()}
            </p>
          </div>
          <div>
            <Button>
              <CalendarArrowDownIcon className="w-5 h-5 mr-1" />
              Grab Your Spot
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;
