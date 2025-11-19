"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import type { Section } from "@/types/booking.types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CalendarCheck, Clock } from "lucide-react";

const SECTION_PRICES: Record<Section, number> = {
  incliner: 1000,
  gold: 600,
  silver: 400,
};

const rowToSection = (row: string): Section => {
  const backRows = ["I", "J", "K", "L"];
  const middleRows = ["E", "F", "C", "D", "G", "H"];

  if (backRows.includes(row)) return "incliner";
  if (middleRows.includes(row)) return "gold";
  return "silver";
};

// Demo data - simplified seat layout for chat
const groupRows = [
  ["A", "B"],
  ["C", "D", "E"],
  ["F", "G", "H"],
  ["I", "J"],
  ["K", "L"],
];

// Demo occupied seats
const demoOccupiedSeats = new Set(["A1", "A2", "B5", "C3", "D7", "E9", "F2", "G4", "H6", "I8", "J1", "K5", "L9"]);

type ChatSeatSelectionProps = {
  showtimeId?: string;
  movieName?: string;
  movieDescription?: string;
  movieImage?: string;
  movieDuration?: string;
  movieRating?: string;
  date?: string;
  startAt?: string;
  endAt?: string;
  venueName?: string;
  venueLocation?: string;
  venueMapUrl?: string;
};

export const ChatSeatSelection: React.FC<ChatSeatSelectionProps> = ({
  showtimeId = "demo-showtime-123",
  movieName = "Demo Movie",
  movieDescription = "An exciting action-packed adventure film with stunning visuals and compelling storyline.",
  movieImage = "/movies/spider.jpg",
  movieDuration = "136",
  movieRating = "8.5",
  date = "2025-01-20",
  startAt = "2025-01-20T18:30:00",
  endAt = "2025-01-20T21:15:00",
  venueName = "PVR Cinemas",
  venueLocation = "Mumbai, Maharashtra",
  venueMapUrl = "https://www.google.com/maps?q=PVR+Cinemas+Mumbai",
}) => {
  // Use logo as fallback if image is not available
  const imageSrc = movieImage && movieImage.trim() !== "" 
    ? movieImage 
    : "/logo.png";

  const [selectedSeats, setSelectedSeats] = useState<Set<string>>(new Set());
  const [occupiedSeats] = useState<Set<string>>(demoOccupiedSeats);

  const onToggleSeat = (seatId: string) => {
    if (occupiedSeats.has(seatId)) return;
    setSelectedSeats((prev) => {
      const next = new Set(prev);
      next.has(seatId) ? next.delete(seatId) : next.add(seatId);
      return next;
    });
  };

  const getSeatStyle = (
    row: string,
    seatId: string,
    isSelected: boolean,
    isBooked: boolean
  ) => {
    const section = rowToSection(row);

    const base =
      "aspect-square rounded border text-[8px] sm:text-[9px] transition w-5 sm:w-6 flex items-center justify-center font-medium cursor-pointer";

    const baseBySection =
      section === "incliner"
        ? "bg-gradient-to-br from-sky-100 to-slate-200 text-slate-900 border-slate-300"
        : section === "gold"
        ? "bg-amber-100 text-amber-900 border-amber-300"
        : "bg-gray-100 text-slate-900 border-slate-300";

    const selectedCls =
      "bg-emerald-300 text-emerald-900 border-emerald-400 ring-1 ring-emerald-300 shadow-sm";

    const bookedCls =
      "bg-rose-200 text-rose-900 border-rose-400 opacity-95 cursor-not-allowed";

    return cn(
      base,
      baseBySection,
      isSelected && selectedCls,
      isBooked && bookedCls
    );
  };

  const renderSeats = (row: string, count = 9) => (
    <div key={row} className="w-full flex justify-center mb-0.5 sm:mb-1">
      <div className="grid grid-cols-9 gap-0.5 sm:gap-1">
        {Array.from({ length: count }, (_, i) => {
          const seatId = `${row}${i + 1}`;
          const isBooked = occupiedSeats.has(seatId);
          const isSelected = selectedSeats.has(seatId);
          const section = rowToSection(row);
          const price = SECTION_PRICES[section];

          return (
            <button
              key={seatId}
              onClick={() => onToggleSeat(seatId)}
              className={getSeatStyle(row, seatId, isSelected, isBooked)}
              title={`${seatId} • ${section.toUpperCase()} • ₹${price}`}
              aria-pressed={isSelected}
              aria-label={`${seatId} ${
                isBooked ? "booked" : isSelected ? "selected" : "available"
              }`}
              disabled={isBooked}
            >
              {seatId}
            </button>
          );
        })}
      </div>
    </div>
  );

  const ScreenBar = () => (
    <div className="w-full flex justify-center mb-2">
      <div className="relative w-11/12 md:w-4/5 h-1 bg-black rounded-b-[1rem] shadow-inner">
        <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-24 sm:w-32 h-1 rounded-full bg-white/50 blur-sm" />
      </div>
    </div>
  );

  const selectedBySection = useMemo(() => {
    const map: Record<Section, string[]> = {
      incliner: [],
      gold: [],
      silver: [],
    };
    selectedSeats.forEach((s) => {
      const row = s.match(/^[A-Z]+/)?.[0] ?? "";
      map[rowToSection(row)].push(s);
    });
    return map;
  }, [selectedSeats]);

  const subtotal = useMemo(() => {
    let total = 0;
    selectedSeats.forEach((s) => {
      const row = s.match(/^[A-Z]+/)?.[0] ?? "";
      total += SECTION_PRICES[rowToSection(row)];
    });
    return total;
  }, [selectedSeats]);

  const gst = Math.round(subtotal * 0.18);
  const total = subtotal + gst;

  const start = new Date(startAt);
  const end = new Date(endAt);
  const startTime = start.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  const endTime = end.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const durationMs = end.getTime() - start.getTime();
  const durationHrs = Math.floor(durationMs / (1000 * 60 * 60));
  const durationMins = Math.floor(
    (durationMs % (1000 * 60 * 60)) / (1000 * 60)
  );
  const durationText =
    durationHrs > 0 ? `${durationHrs}h ${durationMins}m` : `${durationMins}m`;

  // Venue map embed URL
  const venueEmbedSrc = useMemo(() => {
    try {
      const url = new URL(venueMapUrl);
      const q = url.searchParams.get("q") ?? venueName ?? venueLocation;
      return `https://www.google.com/maps?q=${encodeURIComponent(q)}&output=embed`;
    } catch {
      const q = venueName || venueLocation;
      return `https://www.google.com/maps?q=${encodeURIComponent(q)}&output=embed`;
    }
  }, [venueMapUrl, venueName, venueLocation]);

  return (
    <Card className="w-2/3 border-primary/20 shadow-sm">
      <CardHeader className="pb-2 pt-3 px-3 sm:px-4">
        <CardTitle className="text-xs sm:text-sm">Booking Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 px-3 sm:px-4 pb-3">
        {/* Movie Summary */}
        <div>
          <p className="text-xs font-semibold mb-2">Movie Details</p>
          <div className="flex gap-2">
            <div className="w-12 h-16 overflow-hidden rounded-md shrink-0 bg-muted">
              <Image
                src={imageSrc}
                alt={movieName}
                className="h-full w-full object-cover"
                height={64}
                width={48}
                unoptimized
                onError={(e) => {
                  // Fallback to logo if image fails to load
                  const target = e.target as HTMLImageElement;
                  if (target.src !== "/logo.png") {
                    target.src = "/logo.png";
                  }
                }}
              />
            </div>
            <div className="space-y-0.5 flex-1 min-w-0">
              <div className="font-semibold text-xs leading-tight">{movieName}</div>
              <p className="text-[10px] text-muted-foreground line-clamp-2">
                {movieDescription.slice(0, 80)}
              </p>
              <div className="flex flex-wrap gap-x-2 gap-y-0.5 pt-0.5 text-[10px] items-center">
                <span className="rounded-md border px-1 py-0.5">
                  {movieRating} / 10
                </span>
                <span className="text-muted-foreground flex items-center">
                  <Clock className="h-3 w-3 mr-0.5" />
                  {movieDuration} min
                </span>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Showtime & Venue - Side by side */}
        <div className="grid grid-cols-2 gap-3">
          {/* Showtime Detail */}
          <div>
            <p className="text-xs font-semibold mb-2">Showtime</p>
            <div className="bg-background border border-primary/20 rounded-lg p-2 flex flex-col gap-2">
              <div className="flex items-center gap-2 text-xs">
                <CalendarCheck className="h-3.5 w-3.5 text-gray-500" />
                <span className="font-medium text-gray-700">{date}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-900">
                <Clock className="h-3.5 w-3.5 text-gray-500" />
                <span>
                  {startTime} - {endTime} ({durationText})
                </span>
              </div>
            </div>
          </div>

          {/* Venue Card */}
          <div>
            <p className="text-xs font-semibold mb-2">Venue</p>
            <div className="flex flex-col gap-1 mb-2">
              <h3 className="text-xs font-semibold tracking-tight">
                {venueName}
              </h3>
              <p className="text-[10px] text-gray-600">{venueLocation}</p>
            </div>
            {/* Map */}
            <div className="aspect-video w-full">
              <iframe
                title={`${venueName} map`}
                src={venueEmbedSrc}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="h-full w-full border-0 rounded-md"
                allowFullScreen
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Seat Selection */}
        <div>
          <p className="text-xs font-semibold mb-2">Select Your Seats</p>
          {/* Seat Map */}
          <div className="relative flex flex-col items-center">
          <ScreenBar />
          <p className="text-[9px] uppercase tracking-wider text-muted-foreground mb-1">
            Screen
          </p>

          <div className="flex flex-col items-center w-full font-medium text-[10px] gap-1.5">
            {/* First group */}
            <div className="w-full">
              {groupRows[0].map((row) => renderSeats(row))}
            </div>

            {/* Divider */}
            <div className="w-full flex justify-center relative">
              <hr className="w-3/4 border-t border-dashed border-muted-foreground" />
              <span className="absolute top-1/2 -translate-y-1/2 bg-background/95 px-1.5 py-0.5 rounded-full text-[9px] shadow-sm">
                <span className="capitalize mr-0.5">silver</span>• ₹{SECTION_PRICES.silver}
              </span>
            </div>

            {/* Other groups - responsive grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 w-full">
              {groupRows.slice(1).map((group, index) => {
                const representativeRow = group[group.length - 1] || group[0];
                const section = rowToSection(representativeRow);
                const price = SECTION_PRICES[section];

                return (
                  <div
                    key={index}
                    className="flex flex-col items-center w-full relative"
                  >
                    <div className="w-full">
                      {group.map((row) => renderSeats(row))}
                    </div>

                    <div className="w-full flex justify-center relative mt-1">
                      <hr className="w-3/4 border-t border-dashed border-muted-foreground" />
                      <span className="absolute top-1/2 -translate-y-1/2 bg-background/95 px-1.5 py-0.5 rounded-full text-[9px] shadow-sm">
                        <span className="capitalize mr-0.5">{section}</span>• ₹{price}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Compact Legend */}
          <div className="mt-2 flex flex-wrap gap-2 text-[9px] text-muted-foreground justify-center">
            {(["incliner", "gold", "silver"] as Section[]).map((section) => (
              <div key={section} className="flex items-center gap-1">
                <span
                  className={cn(
                    "h-2.5 w-2.5 rounded-sm border",
                    section === "incliner"
                      ? "bg-gradient-to-br from-sky-100 to-slate-200 border-slate-300"
                      : section === "gold"
                      ? "bg-amber-100 border-amber-300"
                      : "bg-gray-100 border-slate-300"
                  )}
                />
                <span className="capitalize">
                  {section} • ₹{SECTION_PRICES[section]}
                </span>
              </div>
            ))}
            <div className="flex items-center gap-1">
              <span className="h-2.5 w-2.5 rounded-sm bg-emerald-300 border border-emerald-400" />
              <span>Selected</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="h-2.5 w-2.5 rounded-sm bg-rose-200 border border-rose-400" />
              <span>Booked</span>
            </div>
          </div>
        </div>

          <Separator className="my-2" />

          {/* Seat Summary */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold">Selected Seats Summary</h3>
            
            {selectedSeats.size === 0 ? (
              <p className="text-[10px] text-muted-foreground text-center py-1">
                No seats selected yet
              </p>
            ) : (
              <>
                <div className="space-y-1">
                  {(["incliner", "gold", "silver"] as Section[]).map((sec) => {
                    const seats = selectedBySection[sec];
                    const count = seats.length;
                    if (count === 0) return null;
                    
                    return (
                      <div
                        key={sec}
                        className="flex items-center justify-between text-xs"
                      >
                        <div className="font-medium capitalize">{sec}</div>
                        <div className="text-muted-foreground text-[10px]">
                          {seats.join(", ")} ({count})
                        </div>
                      </div>
                    );
                  })}
                </div>

                <Separator className="my-1.5" />

                <div className="space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span>Subtotal</span>
                    <span className="font-medium">₹{subtotal}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>GST (18%)</span>
                    <span className="font-medium">₹{gst}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm font-semibold pt-1 border-t">
                    <span>Total</span>
                    <span>₹{total}</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

