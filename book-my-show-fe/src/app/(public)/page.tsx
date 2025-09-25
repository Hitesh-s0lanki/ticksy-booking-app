import HeroCarousel from "./_components/hero-carosoul";
import PromptInput from "./_components/prompt-input";
import RecommendedEvents from "./_components/recommended-events";
import RecommendedMovies from "./_components/recommended-movies";
import RecommendedSports from "./_components/recommended-sports";

const HomePage = () => {
  return (
    <div>
      <HeroCarousel />
      <PromptInput />
      <RecommendedMovies />
      <RecommendedEvents />
      <RecommendedSports />
      <div className="h-20 w-full" />
    </div>
  );
};

export default HomePage;
