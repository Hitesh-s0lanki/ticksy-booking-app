import axios from "axios";
import path from "path";
import protobuf from "protobufjs";
import { Movie } from "@/types/movie.type";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

export async function fetchMovies(): Promise<Movie[]> {
  const response = await axios.get(`${API_BASE_URL}/movies`, {
    responseType: "arraybuffer",
    headers: { Accept: "application/x-protobuf" },
  });

  const protoPath = path.resolve(process.cwd(), "public/proto/movie.proto");
  const root = await protobuf.load(protoPath);
  const MoviesResponse = root.lookupType("AllMoviesResponse");

  const decoded = MoviesResponse.decode(new Uint8Array(response.data));
  const object = MoviesResponse.toObject(decoded, {
    longs: String,
    enums: String,
    defaults: true,
  });

  return (object.movies || []) as Movie[];
}
