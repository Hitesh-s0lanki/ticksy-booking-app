import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin } from "lucide-react";
import { Event } from "@/types/event.types";
import Link from "next/link";

type Props = {
  event: Event;
};

const EventCard = ({ event }: Props) => {
  return (
    <Card
      key={event.id}
      className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer py-0"
    >
      <Link href={`/events/${event.id}`}>
        <CardContent className="p-0">
          <div className="relative">
            <img
              src={event.image}
              alt={event.title}
              className="w-full h-48 object-cover"
            />
            <div className="absolute top-2 left-2">
              <Badge className="bg-primary text-white">{event.category}</Badge>
            </div>
          </div>
          <div className="p-4">
            <h3 className="font-bold text-lg mb-2 line-clamp-2">
              {event.title}
            </h3>
            <div className="flex items-center text-gray-600 text-sm mb-2">
              <Calendar className="w-4 h-4 mr-1" />
              <span>{new Date(event.date).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center text-gray-600 text-sm mb-3">
              <MapPin className="w-4 h-4 mr-1" />
              <span>{event.venue}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-lg font-bold text-primary">
                ₹{event.price}
              </span>
              <Button>Book Now</Button>
            </div>
          </div>
        </CardContent>
      </Link>
    </Card>
  );
};

export default EventCard;
