import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, User } from "lucide-react";
import { Event } from "@/types/event.type";
import Link from "next/link";

type Props = {
  event: Event;
};

const EventCard = ({ event }: Props) => {
  return (
    <Card
      key={event.eventId}
      className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer py-0"
    >
      <Link href={`/events/${event.eventId}`}>
        <CardContent className="p-0">
          <div className="relative">
            <img
              src={event.bannerUrl}
              alt={event.title}
              className="w-full h-48 object-cover"
            />
            {event.categoryType && (
              <div className="absolute top-2 left-2">
                <Badge className="bg-primary text-white">
                  {event.categoryType}
                </Badge>
              </div>
            )}
          </div>
          <div className="p-4">
            <h3 className="font-bold text-lg mb-2 line-clamp-2">
              {event.title}
            </h3>
            <div className="flex items-center text-gray-600 text-sm mb-2">
              <Calendar className="w-4 h-4 mr-1" />
              <span>{new Date(event.startDate).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center text-gray-600 text-sm mb-3">
              <User className="w-4 h-4 mr-1" />
              <span>{event.organizerName}</span>
            </div>
            <div className="flex justify-end">
              <Button>Book Now</Button>
            </div>
          </div>
        </CardContent>
      </Link>
    </Card>
  );
};

export default EventCard;
