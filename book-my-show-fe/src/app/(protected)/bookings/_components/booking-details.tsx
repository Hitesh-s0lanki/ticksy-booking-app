"use client";

import React from "react";
import type { MovieInfo } from "@/types/booking.types";
import MovieBookingDetails from "./movie-booking-details";
import EventBookingDetails from "./event-booking-details";

type BookingContainerProps = {
  showtimeId: string;
  movie?: MovieInfo;
  source?: "movie" | "event";
};

const BookingDetails: React.FC<BookingContainerProps> = ({
  showtimeId,
  movie,
  source = "movie",
}) => {
  if (source === "event") {
    return <EventBookingDetails showtimeId={showtimeId} />;
  }

  return <MovieBookingDetails showtimeId={showtimeId} movie={movie} />;
};

export default BookingDetails;
