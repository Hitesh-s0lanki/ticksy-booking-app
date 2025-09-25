import { MovieInput } from "@/gen/js-ts/movie_pb";
import { routeHandlerError, routeHandlerSuccess } from "@/lib/handler";
import { createMovie } from "@/modules/movies/actions/actions";
import { InternalService } from "@/types/internal";
import { PlainMessage } from "@bufbuild/protobuf";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body: InternalService = await request.json();
    console.log("Internal service route body:", body);

    switch (body.service) {
      case "movies":
        const payload = body.payload as PlainMessage<MovieInput>;
        const { data, statusCode } = await createMovie({ movieData: payload });

        if (statusCode !== 201) throw new Error("Failed to create movie");

        return routeHandlerSuccess(
          "Movie created successfully",
          statusCode,
          data
        );
      case "showtimes":
        // Handle showtime-related operations
        return routeHandlerError("Showtime service not implemented", 501);
      case "venues":
        // Handle venue-related operations
        return routeHandlerError("Venue service not implemented", 501);
      default:
        return routeHandlerError("Invalid service type", 400);
    }
  } catch (error) {
    console.error("Error in internal service route:", error);
    return routeHandlerError("Internal server error", 500);
  }
}
