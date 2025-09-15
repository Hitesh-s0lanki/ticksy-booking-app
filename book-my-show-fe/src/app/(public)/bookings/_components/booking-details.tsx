"use client";

import React, { useEffect, useMemo, useState } from "react";

type Props = {};

type Section = "incliner" | "gold" | "silver";

const SECTION_PRICES: Record<Section, number> = {
  incliner: 1000,
  gold: 600,
  silver: 400,
};

const rowToSection = (row: string): Section => {
  // Customize mapping: back rows -> incliner, middle -> gold, front -> silver
  const backRows = ["G", "H", "I", "J", "K", "L"];
  const middleRows = ["E", "F", "C", "D"];
  const frontRows = ["A", "B"];
  if (backRows.includes(row)) return "incliner";
  if (middleRows.includes(row)) return "gold";
  return "silver";
};

const BookingDetails = ({}: Props) => {
  const groupRows = [
    ["A", "B"],
    ["C", "D"],
    ["E", "F"],
    ["G", "H", "I"],
    ["J", "K", "L"],
  ];

  const [selectedSeats, setSelectedSeats] = useState<Set<string>>(new Set());
  const [occupiedSeats, setOccupiedSeats] = useState<Set<string>>(new Set());
  const [loadingOccupied, setLoadingOccupied] = useState(false);

  useEffect(() => {
    // Mock fetching occupied seats
    const load = async () => {
      setLoadingOccupied(true);
      // Simulate server response
      await new Promise((r) => setTimeout(r, 300));
      setOccupiedSeats(new Set(["A3", "A4", "E7", "G1", "J9"]));
      setLoadingOccupied(false);
    };
    load();
  }, []);

  const handleSeatClick = (seatId: string) => {
    if (occupiedSeats.has(seatId)) return;
    setSelectedSeats((prev) => {
      const next = new Set(prev);
      if (next.has(seatId)) next.delete(seatId);
      else next.add(seatId);
      return next;
    });
  };

  const createBooking = async () => {
    // stub: send selectedSeats to server
    const seats = Array.from(selectedSeats);
    console.log("Booking seats:", seats);
    // Implement API call here
  };

  const getSeatStyle = (
    row: string,
    seatId: string,
    isSelected: boolean,
    isOccupied: boolean
  ) => {
    const section = rowToSection(row);
    const base =
      "aspect-square rounded border text-xs transition w-8 @max-xs:w-6 flex items-center justify-center";
    const occupiedCls = isOccupied
      ? "opacity-30 cursor-not-allowed border-primary/40 bg-gray-600 text-white"
      : "";
    const selectedCls = isSelected ? "ring-2 ring-offset-1" : "";
    let sectionCls = "";
    if (section === "incliner")
      sectionCls =
        "bg-gradient-to-br from-indigo-700 to-indigo-400 text-white border-indigo-600";
    if (section === "gold")
      sectionCls = "bg-yellow-400 text-black border-yellow-500";
    if (section === "silver")
      sectionCls = "bg-gray-400 text-black border-gray-500";
    return `${base} ${sectionCls} ${isOccupied ? occupiedCls : ""} ${
      isSelected ? selectedCls : ""
    }`;
  };

  const renderSeats = (row: string, count = 9) => {
    return (
      <div key={row} className="w-full flex justify-center mb-3">
        <div className="grid grid-cols-9 gap-1 sm:gap-2 md:gap-3">
          {Array.from({ length: count }, (_, i) => {
            const seatId = `${row}${i + 1}`;
            const isOccupied = occupiedSeats.has(seatId);
            const isSelected = selectedSeats.has(seatId);
            const title = `${seatId} • ${rowToSection(row).toUpperCase()} • ₹${
              SECTION_PRICES[rowToSection(row)]
            }`;
            return (
              <button
                key={seatId}
                onClick={() => handleSeatClick(seatId)}
                className={getSeatStyle(row, seatId, isSelected, isOccupied)}
                title={title}
                aria-pressed={isSelected}
                aria-label={`${seatId} ${
                  isOccupied
                    ? "occupied"
                    : isSelected
                    ? "selected"
                    : "available"
                }`}
                disabled={isOccupied}
              >
                {seatId}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const totalPrice = useMemo(() => {
    let total = 0;
    selectedSeats.forEach((s) => {
      const row = s.match(/^[A-Z]+/)?.[0] ?? "";
      total += SECTION_PRICES[rowToSection(row)];
    });
    return total;
  }, [selectedSeats]);

  return (
    <div className="flex flex-col xl:flex-row px-6 md:px-16 lg:px-24 py-12 md:pt-10 max-sm:mt-10 gap-8">
      <div className="relative flex flex-1 flex-col items-center max-md:mt-15">
        {/* Screen */}
        <div className="w-full flex justify-center mb-6">
          <div className="relative w-4/5 h-14 bg-gradient-to-br from-gray-200 to-gray-400 rounded-b-3xl flex items-center justify-center text-sm font-semibold text-gray-800 shadow-inner">
            <div className="absolute -top-6 w-40 h-6 rounded-full bg-gray-200 opacity-40" />
            SCREEN
          </div>
        </div>

        <p className="text-sm font-medium mb-4">SCREEN SIDE</p>

        <div className="flex flex-col items-center mt-4 w-full font-medium text-xs">
          <div className="w-full">
            {groupRows[0].map((row) => renderSeats(row))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mt-6 w-full">
            {groupRows.slice(1).map((group, index) => (
              <div key={index} className="flex flex-col items-center w-full">
                {group.map((row) => renderSeats(row))}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6">
          <button
            onClick={createBooking}
            disabled={selectedSeats.size === 0}
            className="px-4 py-2 bg-primary text-white rounded disabled:opacity-50"
          >
            Book{" "}
            {selectedSeats.size > 0
              ? `(${selectedSeats.size}) - ₹${totalPrice}`
              : ""}
          </button>
        </div>
      </div>

      <aside className="relative w-72 bg-primary/6 border border-primary/20 rounded-lg py-6 px-4 h-max">
        <p className="text-lg font-semibold mb-3">Sections & Prices</p>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 rounded flex items-center justify-center bg-gradient-to-br from-indigo-700 to-indigo-400 text-white text-xs">
                I
              </span>
              <div>
                <div className="text-sm font-medium">Incliner</div>
                <div className="text-xs text-gray-400">Back rows - premium</div>
              </div>
            </div>
            <div className="font-semibold">₹{SECTION_PRICES.incliner}</div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 rounded bg-yellow-400 flex items-center justify-center text-xs">
                G
              </span>
              <div>
                <div className="text-sm font-medium">Gold</div>
                <div className="text-xs text-gray-400">Middle rows</div>
              </div>
            </div>
            <div className="font-semibold">₹{SECTION_PRICES.gold}</div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 rounded bg-gray-400 flex items-center justify-center text-xs">
                S
              </span>
              <div>
                <div className="text-sm font-medium">Silver</div>
                <div className="text-xs text-gray-400">Front rows</div>
              </div>
            </div>
            <div className="font-semibold">₹{SECTION_PRICES.silver}</div>
          </div>
        </div>

        <div className="mt-5 border-t pt-4 text-sm">
          <div className="flex items-center justify-between">
            <div>Selected</div>
            <div>{Array.from(selectedSeats).join(", ") || "-"}</div>
          </div>
          <div className="flex items-center justify-between mt-2">
            <div>Total</div>
            <div className="font-semibold">₹{totalPrice}</div>
          </div>
        </div>

        {loadingOccupied ? (
          <div className="mt-4 text-xs text-gray-500">
            Loading occupied seats...
          </div>
        ) : null}
      </aside>
    </div>
  );
};

export default BookingDetails;
