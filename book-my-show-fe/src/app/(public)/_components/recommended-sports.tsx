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

type Props = {};

const RecommendedSports = ({}: Props) => {
  const trpc = useTRPC();
  const { data, isLoading } = useQuery(
    trpc.events.getManySports.queryOptions({})
  );

  if (isLoading) {
    return (
      <div className="flex w-full flex-col gap-4 sm:gap-5 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-20 py-6 sm:py-8">
        <h2 className="text-xl sm:text-2xl font-semibold">Sports</h2>

        <Carousel className="w-full">
          <CarouselContent className="-ml-1 gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <CarouselItem
                key={i}
                className="h-64 bg-gray-300/30 rounded-lg animate-pulse md:basis-1/2 lg:basis-1/4"
              />
            ))}
          </CarouselContent>
        </Carousel>
      </div>
    );
  }

  if (data?.length === 0) return <div className="h-40 w-full"></div>;

  return (
    <div className="flex w-full flex-col gap-4 sm:gap-5 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-20 py-6 sm:py-8">
      <h2 className="text-xl sm:text-2xl font-semibold">Sports</h2>

      <Carousel className="w-full">
        <CarouselContent className="-ml-1 gap-4">
          {data?.map((event) => {
            const imageSrc =
              event.bannerUrl && event.bannerUrl.trim() !== ""
                ? event.bannerUrl
                : "/logo.png";

            return (
              <CarouselItem
                key={event.eventId}
                className="pl-1 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4"
              >
                <div className="flex flex-col gap-3 rounded-2xl overflow-hidden bg-primary/10">
                  <div className="relative group">
                    {/* Image */}
                    <div className="relative w-full h-52 sm:h-60 md:h-72 overflow-hidden">
                      <Image
                        src={imageSrc}
                        alt={event.title}
                        fill
                        className="object-cover object-center transition-transform duration-300 group-hover:scale-105"
                        unoptimized
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          if (target.src !== "/logo.png") {
                            target.src = "/logo.png";
                          }
                        }}
                      />
                    </div>

                    {/* Hover Overlay with Button */}
                    <div className="absolute inset-0 flex flex-col gap-2 items-start justify-end bg-black/40 opacity-100 transition-opacity duration-300 px-3 py-3">
                      <h3 className="text-white text-sm sm:text-base font-semibold text-start line-clamp-1">
                        {event.title}
                      </h3>
                      <p className="text-[11px] sm:text-xs text-white line-clamp-2">
                        {event.description}
                      </p>
                      <Link
                        href={`/events/${event.eventId}`}
                        className="px-3 py-1 bg-primary/70 text-white text-xs font-medium rounded-sm shadow hover:bg-primary/10"
                      >
                        Book Now
                      </Link>
                    </div>
                  </div>
                </div>
              </CarouselItem>
            );
          })}
        </CarouselContent>
        <CarouselNext />
      </Carousel>
    </div>
  );
};

export default RecommendedSports;
