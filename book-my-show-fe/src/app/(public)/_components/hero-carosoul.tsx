"use client";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import Image from "next/image";
import { useRef } from "react";
import Autoplay from "embla-carousel-autoplay";
import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ChevronRight, Clock, Play, Star, Upload } from "lucide-react";
import { useWatchTrailerModel } from "@/modules/movies/hooks/use-watch-trailer-model";
import Link from "next/link";

const HeroCarousel = () => {
  const trpc = useTRPC();
  const { data, isLoading } = useQuery(
    trpc.dashboard.getFeaturesImages.queryOptions()
  );

  const { onOpen } = useWatchTrailerModel();

  const plugin = useRef(Autoplay({ delay: 2000, stopOnInteraction: true }));

  // Simple skeleton while data loads
  if (isLoading) {
    return (
      <section className="w-full py-5">
        <Carousel
          plugins={[plugin.current]}
          className="w-full"
          onMouseEnter={plugin.current.stop}
          onMouseLeave={plugin.current.reset}
        >
        <CarouselContent className="-ml-2 sm:-ml-4">
          {Array.from({ length: 3 }).map((_, i) => (
              <CarouselItem
                key={i}
                className="pl-2 sm:pl-4 basis-full"
              >
                <div className="relative text-white rounded-md w-full min-h-[400px] sm:min-h-[450px] md:h-[400px] lg:h-[450px] overflow-hidden bg-transparent mx-auto max-w-7xl">
                  <div className="absolute inset-0 -z-10 bg-gray-300/30 animate-pulse" />
                  <div className="h-full min-h-[400px] sm:min-h-[450px] flex items-end">
                    <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-12 py-4 sm:py-6 md:py-8 w-full">
                      <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 md:gap-8 items-center lg:items-end justify-center lg:justify-start h-full">
                        <div className="flex-shrink-0 h-40 sm:h-52 md:h-72 lg:h-80 w-28 sm:w-36 md:w-48 lg:w-56 mx-auto lg:mx-0">
                          <div className="w-full h-full bg-gray-300 rounded-lg shadow-inner animate-pulse" />
                        </div>

                        <div className="flex-1 py-2 w-full lg:w-auto text-center lg:text-left">
                          <div className="h-6 sm:h-7 md:h-8 bg-gray-300 rounded w-3/5 mx-auto lg:mx-0 mb-4 animate-pulse" />
                          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 sm:gap-6 md:gap-8 mb-3 sm:mb-4">
                            <div className="h-4 w-16 bg-gray-300 rounded animate-pulse" />
                            <div className="h-4 w-12 bg-gray-300 rounded animate-pulse" />
                            <div className="h-4 w-24 bg-gray-300 rounded animate-pulse" />
                          </div>

                          <div className="space-y-2 mb-4 sm:mb-6">
                            <div className="h-3 bg-gray-300 rounded w-full animate-pulse" />
                            <div className="h-3 bg-gray-300 rounded w-5/6 mx-auto lg:mx-0 animate-pulse" />
                            <div className="h-3 bg-gray-300 rounded w-4/6 mx-auto lg:mx-0 animate-pulse" />
                          </div>

                          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 justify-center lg:justify-start">
                            <div className="h-10 w-36 bg-gray-300 rounded mx-auto lg:mx-0 animate-pulse" />
                            <div className="h-10 w-36 bg-gray-300 rounded mx-auto lg:mx-0 animate-pulse" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </section>
    );
  }

  if (data?.length === 0) return <div className="h-40 w-full"></div>;

  return (
    <section className="w-full py-5">
      <Carousel
        plugins={[plugin.current]}
        className="w-full"
        onMouseEnter={plugin.current.stop}
        onMouseLeave={plugin.current.reset}
      >
        <CarouselContent className="-ml-2 sm:-ml-4">
          {data?.map((item, index) => {
            // Use logo as fallback if image is not available
            const imageSrc = item.image && item.image.trim() !== "" 
              ? item.image 
              : "/logo.png";

            return (
            <CarouselItem
              key={item.id}
              className="pl-2 sm:pl-4 basis-full"
            >
              <div
                className={cn(
                  "relative text-white rounded-md w-full min-h-[400px] sm:min-h-[450px] md:h-[400px] lg:h-[450px] overflow-hidden mx-auto max-w-7xl"
                )}
              >
                {/* BACKGROUND IMAGE */}
                <div className="absolute inset-0 -z-10">
                  <Image
                    src={imageSrc}
                    alt={`${item.title} backdrop`}
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
                <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-12 py-4 sm:py-6 md:py-8 h-full min-h-[400px] sm:min-h-[450px]">
                  <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 md:gap-8 items-center lg:items-end justify-center lg:justify-start h-full">
                    {/* Movie Poster */}
                    <div className="flex-shrink-0 h-40 sm:h-52 md:h-72 lg:h-80 w-28 sm:w-36 md:w-48 lg:w-56 mx-auto lg:mx-0">
                      <Image
                        src={imageSrc}
                        alt={item.title}
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
                    <div className="flex-1 py-2 w-full lg:w-auto text-center lg:text-left">
                      <h1 className="text-lg sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 md:mb-4">
                        {item.title}
                      </h1>

                      <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 sm:gap-6 md:gap-8 mb-3 sm:mb-4">
                        {item?.rating && (
                          <div className="flex items-center gap-2">
                            <Star className="size-4 text-yellow-400" />
                            <span className="text-sm font-semibold">
                              {item?.rating}/10
                            </span>
                          </div>
                        )}
                        {item?.durationMins && (
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            <span className="text-sm">{item.durationMins}</span>
                          </div>
                        )}
                        {item?.releaseDate && (
                          <div className="flex items-center">
                            <Upload className="w-4 h-4 mr-1" />
                            <p className="text-sm">
                              {new Date(item.releaseDate).toLocaleDateString(
                                "en-GB",
                                {
                                  day: "2-digit",
                                  month: "2-digit",
                                  year: "numeric",
                                }
                              )}
                            </p>
                          </div>
                        )}
                      </div>

                      <p className="text-xs sm:text-sm mb-4 sm:mb-6 leading-relaxed pr-0 sm:pr-4 md:pr-8 lg:pr-20 line-clamp-none">
                        {item.description}
                      </p>

                      <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 justify-center lg:justify-start">
                        {item.posterKey && (
                          <Button size="lg" onClick={() => onOpen(item.id)}>
                            <Play className="w-5 h-5 mr-1" />
                            Watch Trailer
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="lg"
                          className="text-black hover:bg-transparent hover:text-white"
                          asChild
                        >
                          <Link
                            href={
                              item.rating
                                ? `/movies/${item.id}`
                                : `/events/${item.id}`
                            }
                          >
                            Book Now
                            <ChevronRight className="w-5 h-5 ml-1" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CarouselItem>
            );
          })}
        </CarouselContent>
      </Carousel>
    </section>
  );
};

export default HeroCarousel;
