"use client";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Image from "next/image";
import { useRef } from "react";
import Autoplay from "embla-carousel-autoplay";
import { cn } from "@/lib/utils";

type Props = {};

const featuredItems = [
  {
    id: 1,
    title: "Avengers: Endgame",
    type: "movie",
    image: "/movies/image.png",
    rating: 8.4,
  },
  {
    id: 2,
    title: "Rock Concert Live",
    type: "event",
    image: "/movies/image.png",
    date: "2024-08-15",
  },
  {
    id: 3,
    title: "Premier League Final",
    type: "sports",
    image: "/movies/image.png",
    teams: "Team A vs Team B",
  },
];

const HeroCarousel = ({}: Props) => {
  const plugin = useRef(Autoplay({ delay: 2000, stopOnInteraction: true }));

  return (
    <section className="w-full py-5">
      <Carousel
        plugins={[plugin.current]}
        className="w-full"
        onMouseEnter={plugin.current.stop}
        onMouseLeave={plugin.current.reset}>
        <CarouselContent defaultValue={2}>
          {featuredItems.map((item, index) => (
            <CarouselItem
              key={item.id}
              className="max-w-[1280px] max-h-[400px] px-5  rounded-lg">
              <div
                className={cn(
                  "relative w-full",
                  index == 0 && "pl-20",
                  index == featuredItems.length - 1 && "pr-20"
                )}>
                <Image
                  src={item.image}
                  alt={item.title}
                  height={200}
                  width={500}
                  className=" w-full rounded-lg object-contain object-center"
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-4" />
        <CarouselNext className="right-4" />
      </Carousel>
    </section>
  );
};

export default HeroCarousel;
