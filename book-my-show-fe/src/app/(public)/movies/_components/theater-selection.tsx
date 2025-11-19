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
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-4">
      <h3 className="text-base sm:text-lg md:text-xl font-semibold px-2 sm:px-0">Select Cinema & Showtime</h3>
      {/* <Skeleton  /> use */}

      {(isLoading || !data) &&
        Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-32 sm:h-36 w-full rounded-md" />
        ))}

      {data?.responses.map((showtime) => (
        <Card key={showtime.venueId} className="overflow-hidden">
          <CardHeader className="pb-2 sm:pb-3 md:pb-4 px-3 sm:px-4 md:px-6">
            <CardTitle className="text-sm sm:text-base md:text-lg">{showtime.venueName}</CardTitle>
            <div className="flex items-center text-gray-600 mt-1">
              <MapPin className="w-3 h-3 sm:w-4 sm:h-4 mr-1 flex-shrink-0" />
              <span className="text-xs sm:text-sm break-words">{showtime.venueLocation}</span>
            </div>
          </CardHeader>
          <CardContent className="pt-0 px-3 sm:px-4 md:px-6 pb-3 sm:pb-4 md:pb-6">
            <div className="space-y-2 sm:space-y-3">
              <div className="flex flex-wrap gap-2">
                {showtime.showtimes.map((show) => (
                  <Link
                    key={show.showtimeId}
                    href={`/bookings/${show.showtimeId}`}
                    className="flex-shrink-0"
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs sm:text-sm hover:border-primary hover:text-white hover:bg-primary min-w-[60px] sm:min-w-[70px]"
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
