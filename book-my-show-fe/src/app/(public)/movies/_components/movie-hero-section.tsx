import { Button } from "@/components/ui/button";
import { movie } from "@/lib/data";
import { Badge, Clock, Heart, Play, Share2, Star, Upload } from "lucide-react";
import Image from "next/image";

type Props = {};

const MovieHeroSection = ({}: Props) => {
  return (
    <div className="relative  text-white rounded-md">
      {/* BACKGROUND IMAGE */}
      <div className="absolute inset-0 -z-10">
        <Image
          src={movie.image}
          alt={`${movie.title} backdrop`}
          fill
          className="object-cover"
          quality={50} // drop quality a bit for perf
          style={{ filter: "brightness(0.3)" }} // darken for contrast
        />
      </div>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8 items-end">
          {/* Movie Poster */}
          <div className="flex-shrink-0">
            <Image
              src={movie.image}
              alt={movie.title}
              width={256} // ← match w-64 (64 * 4 = 256px)
              height={384} // ← match h-96 (96 * 4 = 384px)
              className="object-cover rounded-lg shadow-2xl mx-auto lg:mx-0"
              quality={100} // optional: bump quality if you still see artifacts
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
                <span className="text-sm">{movie.duration}</span>
              </div>
              <div className="flex items-center">
                <Upload className="w-4 h-4 mr-1" />
                <p className="text-sm">
                  {new Date(movie.releaseDate).toLocaleDateString()}
                </p>
              </div>
            </div>

            <p className="text-sm mb-6 leading-relaxed">{movie.synopsis}</p>

            {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">

              <div>
                <h3 className="font-semibold mb-2">Language</h3>
                <p>{movie.language}</p>
              </div>
              <Badge className="text-lg px-3 py-1 text-white">
                {movie.genre}
              </Badge>
              <div>
                <h3 className="font-semibold mb-2">Cast</h3>
                <p>{movie.cast.join(", ")}</p>
              </div>
            </div> */}

            <div className="flex gap-4">
              <Button size="lg">
                <Play className="w-5 h-5 mr-2" />
                Watch Trailer
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="text-black hover:bg-transparent hover:text-white"
              >
                <Heart className="w-5 h-5 mr-2" />
                Wishlist
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="text-black hover:bg-transparent hover:text-white"
              >
                <Share2 className="w-5 h-5 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieHeroSection;
