import { sports } from "@/lib/data";
import SportsHeader from "./sports-header";
import SportsCard from "./sports-card";

type Props = {};

const SportsList = ({}: Props) => {
  return (
    <div className="py-5">
      <SportsHeader />
      <div className="container mx-auto px-4 pb-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {sports.map((sport) => (
            <SportsCard key={sport.id} sport={sport} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default SportsList;
