import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Movie } from "@/types/movie.type";
import { Clock, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

type Props = {
  movie: Movie;
};

const MovieCard = ({ movie }: Props) => {
  return (
    <Card
      key={movie.id}
      className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer py-0"
    >
      <Link href={`/movies/${movie.id}`}>
        <CardContent className="p-0 py-0">
          <div className="relative">
            <div className="relative w-full h-80 overflow-hidden rounded-t-lg">
              <Image
                src={movie.image}
                alt={movie.title}
                fill
                className="object-cover"
              />
            </div>
            <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded-md flex items-center">
              <Star className="w-3 h-3 text-yellow-400 mr-1" />
              <span className="text-xs font-medium">{movie.rating}</span>
            </div>
          </div>
          <div className="p-4">
            <h3 className="font-semibold text-lg mb-2 line-clamp-2">
              {movie.title}
            </h3>

            <div className="text-xs text-gray-600 mb-3 flex flex-col gap-1">
              <Badge variant="secondary" className="mb-2">
                {movie.genre}
              </Badge>
              <div className="flex gap-1 px-2">
                <div className="flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  <span className="text-xs">{movie.duration}</span>
                </div>
              </div>
            </div>
            <Button className="w-full ">Book Now</Button>
          </div>
        </CardContent>
      </Link>
    </Card>
  );
};

export default MovieCard;
