export interface Movie {
  movieId: string;
  title: string;
  description: string;
  genre: string[];
  durationMins: number;
  releaseDate: string;
  rating: number;
  languages: string[];
  imageKey: string;
  posterKey: string;
}
