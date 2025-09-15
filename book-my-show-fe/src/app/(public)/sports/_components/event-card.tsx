import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, User } from "lucide-react";
import { Event } from "@/types/event.type";
import Link from "next/link";
import Image from "next/image";

type Props = {
  event: Event;
};

const EventCard = ({ event }: Props) => {
  return (
    <Card
      key={event.eventId}
      className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer py-0"
    >
      <Link href={`/events/${event.eventId}`} className="h-full">
        <CardContent className="p-0 h-full pb-2 flex flex-col justify-between  gap-2 ">
          <div className="">
            <div className="relative">
              <Image
                src={event.bannerUrl}
                alt={event.title}
                width={400}
                height={200}
                className="w-full h-48 object-cover"
                unoptimized
              />
            </div>
            <div className="p-4">
              <h3 className="font-bold text-lg mb-2 line-clamp-2">
                {event.title}
              </h3>
              <div className="flex items-center text-gray-600 text-sm mb-2">
                <Calendar className="w-4 h-4 mr-1" />
                <p className="text-sm">
                  {new Date(event.startDate).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })}
                </p>
              </div>
              <div className="flex items-center text-gray-600 text-sm mb-3">
                <User className="w-4 h-4 mr-1" />
                <span>{event.organizerName}</span>
              </div>
            </div>
          </div>
          <div className="px-4 mb-2 w-full">
            <Button className="w-full">Book Now</Button>
          </div>
        </CardContent>
      </Link>
    </Card>
  );
};

export default EventCard;
