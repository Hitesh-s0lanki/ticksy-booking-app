import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
} from "@/components/ui/carousel";

type Props = {};

const RecommendedSports = ({}: Props) => {
  return (
    <div className="flex w-full flex-col gap-5 px-20 py-8">
      <h2 className="text-2xl font-[500px]">Recommended Sports</h2>

      <Carousel className="w-full">
        <CarouselContent className="-ml-1">
          {Array.from({ length: 8 }).map((_, index) => (
            <CarouselItem
              key={index}
              className="pl-1 md:basis-1/2 lg:basis-1/4"
            >
              <div className="p-1">
                <Card>
                  <CardContent className="flex aspect-square items-center justify-center p-6">
                    <span className="text-2xl font-semibold">{index + 1}</span>
                  </CardContent>
                </Card>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselNext />
      </Carousel>
    </div>
  );
};

export default RecommendedSports;
