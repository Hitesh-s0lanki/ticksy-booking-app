export type Showtime = {
  venueId: string;
  venueName: string;
  venueMapUrl: string;
  venueLocation: string;
  showtimes: ShowtimeDetails[];
};

export type ShowtimeDetails = {
  showtimeId: string;
  startAt: string;
  endAt: string;
};
