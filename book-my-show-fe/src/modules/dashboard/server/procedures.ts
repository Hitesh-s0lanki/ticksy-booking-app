import { publicProcedure, createTRPCRouter } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { getAllEvents } from "@/modules/events/actions/actions";
import { getAllMovies } from "@/modules/movies/actions/actions";

export const dashboardRouter = createTRPCRouter({
  getFeaturesImages: publicProcedure.query(async () => {
    // Fetch all movies with MOVIES type
    const {
      data: movies,
      statusCode: moviesStatusCode,
      message: moviesMessage,
    } = await getAllMovies({});

    // Fetch all events with GENERAL type
    const {
      data: events,
      statusCode: eventsStatusCode,
      message: eventsMessage,
    } = await getAllEvents({
      title: null,
      eventType: "GENERAL",
      categoryType: null,
    });

    // Fetch all sports with SPORTS type
    const {
      data: sports,
      statusCode: sportsStatusCode,
      message: sportsMessage,
    } = await getAllEvents({
      title: null,
      eventType: "SPORTS",
      categoryType: null,
    });

    if (
      moviesStatusCode !== 200 ||
      eventsStatusCode !== 200 ||
      sportsStatusCode !== 200
    ) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: moviesMessage || eventsMessage || sportsMessage,
      });
    }

    // Get Random 5 from all movies, events and sports
    const getRandomItems = (arr: any[], num: number) => {
      const shuffled = arr.sort(() => 0.5 - Math.random());
      return shuffled.slice(0, num);
    };

    const recommendedMovies = getRandomItems(movies?.movies || [], 2);
    const recommendedEvents = getRandomItems(events?.events || [], 1);
    const recommendedSports = getRandomItems(sports?.events || [], 1);

    // return only images and ids
    const extractImagesAndIds = (items: any[]) => {
      return items.map((item) => ({
        id: item.movieId || item.eventId,
        image: item.bannerUrl || item.imageKey,
        title: item.title,
        description: item.description,
        rating: item.rating,
        durationMins: item.durationMins,
        releaseDate: item.releaseDate || item.startDate,
        posterKey: item.posterKey,
      }));
    };

    return [
      ...extractImagesAndIds(recommendedMovies),
      ...extractImagesAndIds(recommendedEvents),
      ...extractImagesAndIds(recommendedSports),
    ];
  }),
});
