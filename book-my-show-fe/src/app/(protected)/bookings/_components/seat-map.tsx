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
      <div className="relative w-11/12 md:w-4/5 h-2 bg-black  rounded-b-[2rem] shadow-inner">
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-40 sm:w-52 h-2 rounded-full bg-white/50 blur-md" />
      </div>
    </div>
  );

  return (
    <div className="relative flex flex-1 flex-col items-center h-full">
      <h2 className="text-lg font-semibold mb-4">Select Your Seats</h2>

      <div className="flex flex-col items-center w-full mb-8">
        <ScreenBar />
        <p className="text-[11px] uppercase tracking-widest text-muted-foreground mb-3">
          Screen
        </p>
      </div>

      <div className="flex flex-col items-center mt-2 w-full font-medium text-xs gap-5">
        <div className="w-full">
          {groupRows[0].map((row) => renderSeats(row))}
        </div>

        {/* Divider sections of seats with price label */}
        <div className="w-full flex justify-center relative">
          <hr className="w-3/4 border-t border-dashed border-muted-foreground" />

          {groupRows[0]?.length
            ? (() => {
                const representativeRow =
                  groupRows[0][groupRows[0].length - 1] || groupRows[0][0];
                const section = rowToSection(representativeRow);
                const price = SECTION_PRICES[section];

                return (
                  <span className="absolute top-1/2 -translate-y-1/2 bg-background/95 px-3 py-0.5 rounded-full text-xs shadow-sm">
                    <span className="capitalize mr-2">{section}</span>• ₹{price}
                  </span>
                );
              })()
            : null}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8 mt-6 w-full">
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

                {/* Divider + price badge for this group */}
                <div className="w-full flex justify-center relative mt-2 sm:mt-4">
                  <hr className="w-3/4 border-t border-dashed border-muted-foreground" />

                  <span className="absolute top-1/2 -translate-y-1/2 bg-background/95 px-3 py-0.5 rounded-full text-xs shadow-sm">
                    <span className="capitalize mr-2">{section}</span>• ₹{price}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      {(() => {
        const sections = Object.keys(SECTION_PRICES) as Section[];

        const getSectionClass = (section: Section) =>
          section === "incliner"
            ? "bg-gradient-to-br from-sky-100 to-slate-200 border-slate-300"
            : section === "gold"
            ? "bg-amber-100 border-amber-300"
            : "bg-gray-100 border-slate-300";

        return (
          <div className="mt-10 flex flex-wrap gap-4 text-xs text-muted-foreground">
            {sections.map((section) => (
              <div key={section} className="flex items-center gap-2">
                <span
                  className={cn(
                    "h-4 w-4 rounded-sm border",
                    getSectionClass(section)
                  )}
                />
                <div className="capitalize">
                  {section} • ₹{SECTION_PRICES[section]}
                </div>
              </div>
            ))}

            <div className="flex items-center gap-2">
              <span className="h-4 w-4 rounded-sm bg-emerald-300 border border-emerald-400" />
              Selected
            </div>

            <div className="flex items-center gap-2">
              <span className="h-4 w-4 rounded-sm bg-rose-200 border border-rose-400" />
              Booked
            </div>
          </div>
        );
      })()}
    </div>
  );
};
