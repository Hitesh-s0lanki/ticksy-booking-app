import { ShareButton } from "@/components/movies/share-button";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useWatchTrailerModel } from "@/modules/movies/hooks/use-watch-trailer-model";
import { Movie } from "@/types/movie.type";
import { Clock, Heart, Play, Share2, Star, Upload } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

type Props = {
  movie: Movie;
};

const MovieHeroSection = ({ movie }: Props) => {
  const { onOpen } = useWatchTrailerModel();

  const [wishlisted, setWishlisted] = useState(false);

  return (
    <div className="relative  text-white rounded-md">
      {/* BACKGROUND IMAGE */}
      <div className="absolute inset-0 -z-10">
        <Image
          src={movie.imageKey}
          alt={`${movie.title} backdrop`}
          fill
          className="object-cover"
          quality={50} // drop quality a bit for perf
          style={{ filter: "brightness(0.3)" }} // darken for contrast
          unoptimized
        />
      </div>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8 items-end">
          {/* Movie Poster */}
          <div className="flex-shrink-0">
            <Image
              src={movie.imageKey}
              alt={movie.title}
              width={256} // ← match w-64 (64 * 4 = 256px)
              height={384} // ← match h-96 (96 * 4 = 384px)
              className="object-cover rounded-lg shadow-2xl mx-auto lg:mx-0"
              quality={100} // optional: bump quality if you still see artifacts
              unoptimized
            />
          </div>

          {/* Movie Info */}
          <div className="flex-1 py-2">
            <h1 className="text-2xl font-semibold mb-4">{movie.title}</h1>
            <div className="flex flex-wrap items-center gap-8 mb-4">
              <div className="flex items-center gap-2">
                <Star className="size-4 text-yellow-400" />
                <span className="text-sm font-semibold">{movie.rating}/10</span>
              </div>
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                <span className="text-sm">{movie.durationMins}</span>
              </div>
              <div className="flex items-center">
                <Upload className="w-4 h-4 mr-1" />
                <p className="text-sm">
                  {new Date(movie.releaseDate).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>

            <p className="text-sm mb-6 leading-relaxed">{movie.description}</p>

            <div className="flex gap-4">
              <Button size="lg" onClick={() => onOpen(movie.movieId)}>
                <Play className="w-5 h-5 mr-2" />
                Watch Trailer
              </Button>
              <Button
                variant="outline"
                size="lg"
                className={cn("bg-transparent text-white")}
                onClick={() => setWishlisted((v) => !v)}
                aria-pressed={wishlisted}
                aria-label="Toggle wishlist"
              >
                <Heart
                  className={cn(
                    "w-5 h-5 mr-1 transition-colors",
                    wishlisted && "text-red-500"
                  )}
                  fill={wishlisted ? "currentColor" : "none"}
                />
                {wishlisted ? "Wishlisted" : "Wishlist"}
              </Button>
              <ShareButton />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieHeroSection;
