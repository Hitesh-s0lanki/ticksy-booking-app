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
        <div className="container mx-auto px-4">
          <div className="flex flex-col gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="max-w-[1280px] max-h-[400px] px-5 rounded-lg w-full"
                aria-hidden
              >
                <div className="relative text-white rounded-md w-full h-[400px] overflow-hidden bg-transparent">
                  <div className="absolute inset-0 -z-10 bg-gray-300/30 animate-pulse" />
                  <div className="h-full flex items-end">
                    <div className="flex flex-col lg:flex-row gap-8 items-end w-full p-4">
                      <div className="flex-shrink-0 h-full">
                        <div className="w-[256px] h-[384px] bg-gray-300 rounded-lg shadow-inner animate-pulse mx-auto lg:mx-0" />
                      </div>

                      <div className="flex-1 py-2">
                        <div className="h-6 bg-gray-300 rounded w-3/5 mb-4 animate-pulse" />
                        <div className="flex flex-wrap items-center gap-4 mb-4">
                          <div className="h-4 w-16 bg-gray-300 rounded animate-pulse" />
                          <div className="h-4 w-12 bg-gray-300 rounded animate-pulse" />
                          <div className="h-4 w-24 bg-gray-300 rounded animate-pulse" />
                        </div>

                        <div className="space-y-2 mb-6">
                          <div className="h-3 bg-gray-300 rounded w-full animate-pulse" />
                          <div className="h-3 bg-gray-300 rounded w-5/6 animate-pulse" />
                          <div className="h-3 bg-gray-300 rounded w-4/6 animate-pulse" />
                        </div>

                        <div className="flex gap-4">
                          <div className="h-10 w-36 bg-gray-300 rounded animate-pulse" />
                          <div className="h-10 w-36 bg-gray-300 rounded animate-pulse" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full py-5">
      <Carousel
        plugins={[plugin.current]}
        className="w-full"
        onMouseEnter={plugin.current.stop}
        onMouseLeave={plugin.current.reset}
      >
        <CarouselContent defaultValue={2}>
          {data?.map((item, index) => (
            <CarouselItem
              key={item.id}
              className="max-w-[1280px] max-h-[400px] px-5  rounded-lg w-full "
            >
              <div
                className={cn(
                  "relative  text-white rounded-md w-full h-[400px] overflow-hidden",
                  index == 0 && "pl-20",
                  index == data.length - 1 && "pr-20"
                )}
              >
                {/* BACKGROUND IMAGE */}
                <div
                  className={cn(
                    "absolute inset-0 -z-10",
                    index == 0 && "left-16",
                    index == data.length - 1 && "right-16"
                  )}
                >
                  <Image
                    src={item.image}
                    alt={`${item.title} backdrop`}
                    fill
                    className="object-cover"
                    quality={50} // drop quality a bit for perf
                    style={{ filter: "brightness(0.3)" }} // darken for contrast
                    unoptimized
                  />
                </div>
                <div className="container mx-auto px-4 py-8 h-[400px]">
                  <div className="flex flex-col lg:flex-row gap-8 items-end h-full">
                    {/* Movie Poster */}
                    <div className="flex-shrink-0 h-full">
                      <Image
                        src={item.image}
                        alt={item.title}
                        width={256} // ← match w-64 (64 * 4 = 256px)
                        height={384} // ← match h-96 (96 * 4 = 384px)
                        className="object-cover rounded-lg shadow-2xl mx-auto lg:mx-0 h-full"
                        quality={100} // optional: bump quality if you still see artifacts
                        unoptimized
                      />
                    </div>

                    {/* Movie Info */}
                    <div className="flex-1 py-2">
                      <h1 className="text-2xl font-semibold mb-4">
                        {item.title}
                      </h1>

                      <div className="flex flex-wrap items-center gap-8 mb-4">
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

                      <p className="text-sm mb-6 leading-relaxed pr-20">
                        {item.description}
                      </p>

                      <div className="flex gap-4">
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
          ))}
        </CarouselContent>
      </Carousel>
    </section>
  );
};

export default HeroCarousel;
