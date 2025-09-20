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

const RecommendedEvents = () => {
  const trpc = useTRPC();
  const { data } = useQuery(trpc.events.getManyEvents.queryOptions({}));

  return (
    <div className="flex w-full flex-col gap-5 px-20 py-8">
      <h2 className="text-2xl font-[500px]">Events</h2>

      <Carousel className="w-full">
        <CarouselContent className="-ml-1">
          {data?.map((event) => (
            <CarouselItem
              key={event.eventId}
              className="pl-1 md:basis-1/2 lg:basis-1/4"
            >
              <div className="flex flex-col gap-3 rounded-2xl overflow-hidden bg-primary/10">
                <div className="relative group">
                  {/* Image */}
                  <div className="relative w-full h-80 overflow-hidden">
                    <Image
                      src={event.bannerUrl}
                      alt={event.title}
                      fill
                      className="object-cover object-center transition-transform duration-300 group-hover:scale-105"
                      unoptimized
                    />
                  </div>

                  {/* Hover Overlay with Button */}
                  <div className="absolute inset-0 flex flex-col gap-3 items-start justify-end bg-black/40 opacity-100 transition-opacity duration-300 px-4 py-4">
                    <h3 className="text-white text-md font-semibold text-center">
                      {event.title}
                    </h3>
                    <p className=" text-xs text-white line-clamp-3">
                      {event.description.slice(0, 80)}...
                    </p>
                    <Link
                      href={`/events/${event.eventId}`}
                      className="px-4 py-1 bg-primary/70 text-white text-xs font-medium rounded-sm shadow hover:bg-primary/10"
                    >
                      Book Now
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

export default RecommendedEvents;
