"use client";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
} from "@/components/ui/carousel";
import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";

const RecommendedMovies = () => {
  const trpc = useTRPC();

  const { data } = useQuery(trpc.movies.getMany.queryOptions({}));

  return (
    <div className="flex w-full flex-col gap-5 px-20 py-8">
      <h2 className="text-2xl font-[500px]">Recommended Movies</h2>

      <Carousel className="w-full">
        <CarouselContent className="-ml-1">
          {data?.map((movie) => (
            <CarouselItem
              key={movie.movieId}
              className="pl-1 md:basis-1/2 lg:basis-1/4"
            >
              <div className="flex flex-col gap-3 rounded-2xl overflow-hidden bg-primary/10">
                <div className="relative group">
                  {/* Image */}
                  <div className="relative w-full h-80 overflow-hidden">
                    <Image
                      src={movie.imageKey}
                      alt={movie.title}
                      fill
                      className="object-cover object-center transition-transform duration-300 group-hover:scale-105"
                      unoptimized
                    />
                  </div>

                  {/* Hover Overlay with Button */}
                  <div className="absolute inset-0 flex flex-col gap-3 items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <h3 className="text-white text-md font-semibold text-center">
                      {movie.title}
                    </h3>
                    <p className=" text-xs px-4 text-center text-white line-clamp-3">
                      {movie.description}
                    </p>
                    <Link
                      href={`/movies/${movie.movieId}`}
                      className="px-4 py-2 bg-primary/70 text-white text-sm font-medium rounded-lg shadow hover:bg-primary/10"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselNext />
      </Carousel>
    </div>
  );
};

export default RecommendedMovies;
