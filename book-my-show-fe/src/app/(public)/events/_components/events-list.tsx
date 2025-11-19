"use client";

import EventHeader from "./header";
import EventCard from "./event-card";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useEventsFilters } from "@/modules/events/hooks/use-events-filters";
import NoDataFound from "@/components/no-data-found";

const EventsList = () => {
  const trpc = useTRPC();
  const [filters] = useEventsFilters();

  const { data } = useSuspenseQuery(
    trpc.events.getManyEvents.queryOptions({
      ...filters,
    })
  );

  return (
    <div className="py-4 sm:py-5 px-4 sm:px-5 md:px-8 lg:px-12 xl:px-20">
      <EventHeader />
      <div className="container mx-auto px-2 sm:px-4 pb-6 sm:pb-8 md:pb-10">
        {data.length === 0 && <NoDataFound />}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
          {data.map((event) => (
            <EventCard key={event.eventId} event={event} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default EventsList;
