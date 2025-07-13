import { movies } from "@/lib/data";
import Header from "./header";
import MovieCard from "./movie-card";

type Props = {};

const MoviesList = ({}: Props) => {
  return (
    <div className="py-5 px-5 md:px-10 lg:px-20">
      <Header />
      <div className="px-4 ">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {movies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default MoviesList;
