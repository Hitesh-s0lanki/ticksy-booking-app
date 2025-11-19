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

  // Use logo as fallback if image is not available
  const imageSrc =
    movie.imageKey && movie.imageKey.trim() !== ""
      ? movie.imageKey
      : "/logo.png";

  return (
    <div className="relative  text-white rounded-md">
      {/* BACKGROUND IMAGE */}
      <div className="absolute inset-0 -z-10">
        <Image
          src={imageSrc}
          alt={`${movie.title} backdrop`}
          fill
          className="object-cover"
          quality={50} // drop quality a bit for perf
          style={{ filter: "brightness(0.3)" }} // darken for contrast
          unoptimized
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            if (target.src !== "/logo.png") {
              target.src = "/logo.png";
            }
          }}
        />
      </div>
      <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8">
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 md:gap-8 items-end">
          {/* Movie Poster */}
          <div className="flex-shrink-0 w-32 sm:w-40 md:w-48 lg:w-64 h-48 sm:h-64 md:h-80 lg:h-96 mx-auto lg:mx-0">
            <Image
              src={imageSrc}
              alt={movie.title}
              width={256}
              height={384}
              className="object-cover rounded-lg shadow-2xl w-full h-full"
              quality={100}
              unoptimized
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                if (target.src !== "/logo.png") {
                  target.src = "/logo.png";
                }
              }}
            />
          </div>

          {/* Movie Info */}
          <div className="flex-1 py-2 w-full lg:w-auto">
            <h1 className="text-lg sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 md:mb-4">
              {movie.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 md:gap-8 mb-3 sm:mb-4">
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

            <p className="text-xs sm:text-sm mb-4 sm:mb-6 leading-relaxed line-clamp-3 sm:line-clamp-none">
              {movie.description}
            </p>

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 md:gap-4">
              <Button
                size="default"
                className="text-sm sm:text-base"
                onClick={() => onOpen(movie.movieId)}
              >
                <Play className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Watch Trailer
              </Button>
              <Button
                variant="outline"
                size="default"
                className={cn("bg-transparent text-white text-sm sm:text-base")}
                onClick={() => setWishlisted((v) => !v)}
                aria-pressed={wishlisted}
                aria-label="Toggle wishlist"
              >
                <Heart
                  className={cn(
                    "w-4 h-4 sm:w-5 sm:h-5 mr-1 transition-colors",
                    wishlisted && "text-red-500"
                  )}
                  fill={wishlisted ? "currentColor" : "none"}
                />
                <span className="hidden sm:inline">
                  {wishlisted ? "Wishlisted" : "Wishlist"}
                </span>
                <span className="sm:hidden">
                  {wishlisted ? "Saved" : "Save"}
                </span>
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
