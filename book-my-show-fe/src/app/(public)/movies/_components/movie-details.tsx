import DataSelection from "./date-selection";
import MovieHeroSection from "./movie-hero-section";
import TheaterSelection from "./theater-selection";

type Props = {};

const MovieDetails = ({}: Props) => {
  return (
    <div className="p-8 flex flex-col gap-8">
      <MovieHeroSection />
      <DataSelection />
      <TheaterSelection />
    </div>
  );
};

export default MovieDetails;
