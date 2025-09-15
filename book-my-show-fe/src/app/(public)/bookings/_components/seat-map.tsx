"use client";

import React from "react";
import { cn } from "@/lib/utils";
import type { Section } from "@/types/booking.types";

type SeatMapProps = {
  groupRows: string[][];
  selectedSeats: Set<string>;
  occupiedSeats: Set<string>;
  bookedSeats: Set<string>;
  onToggleSeat: (seatId: string) => void;
  rowToSection: (row: string) => Section;
  SECTION_PRICES: Record<Section, number>;
};

export const SeatMap: React.FC<SeatMapProps> = ({
  groupRows,
  selectedSeats,
  occupiedSeats,
  bookedSeats,
  onToggleSeat,
  rowToSection,
  SECTION_PRICES,
}) => {
  const getSeatStyle = (
    row: string,
    seatId: string,
    isSelected: boolean,
    isBooked: boolean
  ) => {
    const section = rowToSection(row);

    const base =
      "aspect-square rounded-md border text-[11px] md:text-xs transition w-8 sm:w-9 md:w-8 flex items-center justify-center font-medium";

    const baseBySection =
      section === "incliner"
        ? "bg-gradient-to-br from-indigo-700 to-indigo-500 text-white border-indigo-600"
        : section === "gold"
        ? "bg-yellow-400 text-black border-yellow-500"
        : "bg-gray-300 text-black border-gray-500";

    const selectedCls =
      "bg-emerald-500 text-white border-emerald-600 ring-2 ring-emerald-300 ring-offset-1";

    const bookedCls =
      "bg-rose-500 text-white border-rose-600 opacity-80 cursor-not-allowed";

    return cn(
      base,
      baseBySection,
      isSelected && selectedCls,
      isBooked && bookedCls
    );
  };

  const renderSeats = (row: string, count = 9) => (
    <div key={row} className="w-full flex justify-center mb-2 sm:mb-3">
      <div className="grid grid-cols-9 gap-1.5 sm:gap-2 md:gap-3">
        {Array.from({ length: count }, (_, i) => {
          const seatId = `${row}${i + 1}`;
          const isBooked = bookedSeats.has(seatId) || occupiedSeats.has(seatId);
          const isSelected = selectedSeats.has(seatId);
          const title = `${seatId} • ${rowToSection(row).toUpperCase()} • ₹${
            SECTION_PRICES[rowToSection(row)]
          }`;

          return (
            <button
              key={seatId}
              onClick={() => onToggleSeat(seatId)}
              className={getSeatStyle(row, seatId, isSelected, isBooked)}
              title={title}
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
    <div className="w-full flex justify-center mb-4 sm:mb-6">
      <div className="relative w-11/12 md:w-4/5 h-4 sm:h-5 bg-gradient-to-b from-gray-200 to-gray-300 rounded-b-[2rem] shadow-inner">
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-40 sm:w-52 h-2 rounded-full bg-white/50 blur-md" />
      </div>
    </div>
  );

  return (
    <div className="relative flex flex-1 flex-col items-center">
      <ScreenBar />
      <p className="text-[11px] uppercase tracking-widest text-muted-foreground mb-3">
        Screen
      </p>

      <div className="flex flex-col items-center mt-2 w-full font-medium text-xs">
        <div className="w-full">
          {groupRows[0].map((row) => renderSeats(row))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8 mt-6 w-full">
          {groupRows.slice(1).map((group, index) => (
            <div key={index} className="flex flex-col items-center w-full">
              {group.map((row) => renderSeats(row))}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 grid grid-cols-3 gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <span className="h-4 w-4 rounded-sm bg-emerald-500 border border-emerald-600" />
          Selected
        </div>
        <div className="flex items-center gap-2">
          <span className="h-4 w-4 rounded-sm bg-gray-300 border border-gray-500" />
          Available
        </div>
        <div className="flex items-center gap-2">
          <span className="h-4 w-4 rounded-sm bg-rose-500 border border-rose-600" />
          Booked
        </div>
      </div>
    </div>
  );
};
