// define the allowed categories (optional, but adds extra type safety)
export type EventCategory =
  | "Music"
  | "Comedy"
  | "Art"
  | "Technology"
  | "Food"
  | "Dance"
  | "Literature";

// your Event interface
export interface Event {
  id: number;
  title: string;
  category: string;
  date: string; // YYYY-MM-DD
  venue: string;
  price: number;
  image: string; // URL to the event image
}
