"use client";

import Image from "next/image";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ErrorState } from "@/components/error-state";

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
    <div className="p-8 flex flex-col gap-6">
      <div className="relative w-full h-64">
        <Image
          src={data.bannerUrl}
          alt={data.title}
          fill
          className="object-cover rounded-md"
          unoptimized
        />
      </div>
      <h1 className="text-2xl font-bold">{data.title}</h1>
      <p className="text-gray-700">{data.description}</p>
      <div className="text-sm text-gray-600 flex flex-col gap-1">
        <p>
          <strong>Showtime:</strong>{" "}
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
      </div>
    </div>
  );
};

export default EventDetails;
