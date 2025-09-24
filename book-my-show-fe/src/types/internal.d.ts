import { MovieInput } from "@/gen/js-ts/movie_pb";
import { ShowtimeInput } from "@/gen/js-ts/showtime_pb";
import { PlainMessage } from "@bufbuild/protobuf";

export type InternalService = {
  service: "movies" | "showtimes" | "venues";
  payload: PlainMessage<MovieInput> | PlainMessage<ShowtimeInput>;
};
