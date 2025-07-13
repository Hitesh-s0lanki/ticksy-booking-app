import { events } from "@/lib/data";
import EventHeader from "./header";
import EventCard from "./event-card";

type Props = {};

const EventsList = ({}: Props) => {
  return (
    <div className="py-5">
      <EventHeader />
      <div className="container mx-auto px-4 pb-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default EventsList;
