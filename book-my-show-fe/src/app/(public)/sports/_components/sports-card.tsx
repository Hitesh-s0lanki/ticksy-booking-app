import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Trophy } from "lucide-react";
import { SportEvent } from "@/types/sports.types";
import Link from "next/link";

type Props = {
  sport: SportEvent;
};

const SportsCard = ({ sport }: Props) => {
  return (
    <Card
      key={sport.id}
      className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer py-0"
    >
      <Link href={`/sports/${sport.id}`}>
        <CardContent className="p-0">
          <div className="relative">
            <img
              src={sport.image}
              alt={sport.title}
              className="w-full h-48 object-cover"
            />
            <div className="absolute top-2 left-2">
              <Badge className="bg-primary text-white flex items-center">
                <Trophy className="w-3 h-3 mr-1" />
                {sport.sport}
              </Badge>
            </div>
          </div>
          <div className="p-4">
            <h3 className="font-bold text-lg mb-2 line-clamp-2">
              {sport.title}
            </h3>
            <p className="text-gray-700 font-medium mb-2 line-clamp-1">
              {sport.teams}
            </p>
            <div className="flex items-center text-gray-600 text-sm mb-2">
              <Calendar className="w-4 h-4 mr-1" />
              <span>{new Date(sport.date).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center text-gray-600 text-sm mb-3">
              <MapPin className="w-4 h-4 mr-1" />
              <span>{sport.venue}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-lg font-bold text-primary">
                ₹{sport.price}
              </span>
              <Button>Book Now</Button>
            </div>
          </div>
        </CardContent>
      </Link>
    </Card>
  );
};

export default SportsCard;
