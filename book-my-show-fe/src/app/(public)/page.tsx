import HeroCarousel from "./_components/hero-carosoul";
import RecommendedEvents from "./_components/recommended-events";
import RecommendedMovies from "./_components/recommended-movies";
import RecommendedSports from "./_components/recommended-sports";
import SearchBar from "./_components/search-bar";

const HomePage = () => {
  return (
    <div>
      <HeroCarousel />
      <SearchBar />
      <RecommendedMovies />
      <RecommendedEvents />
      <RecommendedSports />
    </div>
  );
};

export default HomePage;
