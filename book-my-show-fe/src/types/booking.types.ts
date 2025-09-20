// Define the allowed booking types
export type BookingType = "movie" | "event";

// General booking interface
export interface MyBooking {
  type: string;
  title: string;
  date: string;
  time: string;
  venue: string;
  venueUrl: string;
  seats: string[];
  amount: number;
  qr: string;
  pdf: string;
  bookingId: string;
  image: string;
}

export type Section = "incliner" | "gold" | "silver";

export type MovieInfo = {
  posterUrl: string;
  title: string;
  description?: string;
  rating?: string; // e.g., "U/A 13+"
  durationMinutes?: number; // e.g., 136
  releaseDate?: string; // ISO string or human-readable
};

export type ProceedPayload = {
  showtimeId: string;
  seats: string[];
  amountWithoutGST: number;
  gst: number;
  totalAmount: number;
};
