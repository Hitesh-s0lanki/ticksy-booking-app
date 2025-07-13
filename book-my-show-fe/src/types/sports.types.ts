// allowed sports categories
export type SportCategory =
  | "Football"
  | "Basketball"
  | "Cricket"
  | "Tennis"
  | "Swimming"
  | "Boxing";

// your SportEvent interface
export interface SportEvent {
  id: number;
  title: string;
  sport: string;
  date: string; // YYYY-MM-DD
  venue: string;
  teams: string; // e.g. "Team A vs Team B" or "Singles Final"
  price: number; // ticket price
  image: string; // URL to the event image
}
