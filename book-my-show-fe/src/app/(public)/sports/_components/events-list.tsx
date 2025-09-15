"use client";

import EventHeader from "./header";
import EventCard from "./event-card";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useEventsFilters } from "@/modules/events/hooks/use-events-filters";

const EventsList = () => {
  const trpc = useTRPC();
  const [filters] = useEventsFilters();

  const { data } = useSuspenseQuery(
    trpc.events.getManySports.queryOptions({
      ...filters,
    })
  );

  return (
    <div className="py-5 px-5 md:px-10 lg:px-20">
      <EventHeader />
      <div className="container mx-auto px-4 pb-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {data.map((event) => (
            <EventCard key={event.eventId} event={event} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default EventsList;
