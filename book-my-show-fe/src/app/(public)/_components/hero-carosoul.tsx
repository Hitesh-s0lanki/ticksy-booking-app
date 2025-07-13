"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Film, Music, Star, Trophy } from "lucide-react";
import Image from "next/image";
import { useRef } from "react";
import Autoplay from "embla-carousel-autoplay";

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
        onMouseLeave={plugin.current.reset}
      >
        <CarouselContent defaultValue={2}>
          {featuredItems.map((item) => (
            <CarouselItem
              key={item.id}
              className="max-w-[1280px] max-h-[400px] px-5  rounded-lg"
            >
              <div className="relative w-full ">
                <Image
                  src={item.image}
                  alt={item.title}
                  height={200}
                  width={500}
                  className=" w-full rounded-lg object-contain object-center"
                />
                {/* <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                  <div className="text-center text-white max-w-2xl px-4">
                    <h1 className="text-4xl md:text-6xl font-bold mb-4">
                      {item.title}
                    </h1>
                    <Badge className="mb-4 text-lg px-4 py-2">
                      {item.type === "movie" && (
                        <Film className="w-4 h-4 mr-2" />
                      )}
                      {item.type === "event" && (
                        <Music className="w-4 h-4 mr-2" />
                      )}
                      {item.type === "sports" && (
                        <Trophy className="w-4 h-4 mr-2" />
                      )}
                      {item.type.toUpperCase()}
                    </Badge>
                    {item.rating && (
                      <div className="flex items-center justify-center mb-4">
                        <Star className="w-5 h-5 text-yellow-400 mr-1" />
                        <span className="text-lg font-semibold">
                          {item.rating}
                        </span>
                      </div>
                    )}
                    <Button size="lg" className="bg-red-600 hover:bg-red-700">
                      Book Now
                    </Button>
                  </div>
                </div> */}
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
