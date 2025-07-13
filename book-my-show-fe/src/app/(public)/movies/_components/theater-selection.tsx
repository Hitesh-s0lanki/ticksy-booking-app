import { movie } from "@/lib/data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

type Props = {};

const TheaterSelection = ({}: Props) => {
  return (
    <div className="space-y-4 px-2">
      <h3 className="text-xl font-semibold">Select Cinema & Showtime</h3>
      {movie.theaters.map((theater) => (
        <Card key={theater.id} className="overflow-hidden">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">{theater.name}</CardTitle>
            <div className="flex items-center text-gray-600">
              <MapPin className="w-4 h-4 mr-1" />
              <span className="text-sm">{theater.location}</span>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {theater.showtimes.map((time) => (
                  <Link
                    key={time}
                    href={`/booking/${movie.id}?theater=${theater.id}&time=${time}&date=12`}
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      className="hover:border-primary hover:text-white hover:bg-primary"
                    >
                      {time}
                    </Button>
                  </Link>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default TheaterSelection;
