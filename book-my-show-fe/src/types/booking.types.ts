// Define the allowed booking types
export type BookingType = "movie" | "event";

// General booking interface
export interface Booking {
  id: number;
  type: string;
  title: string;
  date: string; // in YYYY-MM-DD format
  time: string; // e.g. "8:15 PM"
  venue: string;
  seats: string[]; // e.g. ["A12", "A13"]
  amount: number; // total amount paid
  bookingId: string; // e.g. "BMS001234"
  image: string; // URL to poster/cover image
}
