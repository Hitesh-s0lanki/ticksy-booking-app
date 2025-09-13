import { movie } from "@/lib/data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

type Props = {
  movieId: string;
  date: string;
};

const TheaterSelection = ({ movieId, date }: Props) => {
  const trpc = useTRPC();
  const { data, isLoading } = useQuery(
    trpc.movies.getShowtimes.queryOptions({ movieId, date })
  );

  return (
    <div className="space-y-4 px-2">
      <h3 className="text-xl font-semibold">Select Cinema & Showtime</h3>
      {/* <Skeleton  /> use */}

      {(isLoading || !data) &&
        Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-36 w-full rounded-md" />
        ))}

      {data?.responses.map((showtime) => (
        <Card key={showtime.venueId} className="overflow-hidden">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">{showtime.venueName}</CardTitle>
            <div className="flex items-center text-gray-600">
              <MapPin className="w-4 h-4 mr-1" />
              <span className="text-sm">{showtime.venueLocation}</span>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {showtime.showtimes.map((show) => (
                  <Link
                    key={show.showtimeId}
                    href={`/booking/${movie.id}?theater=${showtime.venueId}&time=${show.startAt}&date=12`}
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      className="hover:border-primary hover:text-white hover:bg-primary"
                    >
                      {/* Show the formatted only time HH:MM */}
                      {new Date(show.startAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
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
