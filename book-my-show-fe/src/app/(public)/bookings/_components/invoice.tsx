"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ProceedPayload, Section } from "@/types/booking.types";

type InvoiceProps = {
  selectedBySection: Record<Section, string[]>;
  SECTION_PRICES: Record<Section, number>;
  subtotal: number;
  gst: number;
  total: number;
  disabled?: boolean;
  onProceed: () => void;
};

export const Invoice: React.FC<InvoiceProps> = ({
  selectedBySection,
  SECTION_PRICES,
  subtotal,
  gst,
  total,
  disabled,
  onProceed,
}) => {
  const sections: Section[] = ["incliner", "gold", "silver"];

  const totalSeats = sections.reduce(
    (acc, s) => acc + selectedBySection[s].length,
    0
  );

  return (
    <aside className="">
      <p className="text-lg font-semibold mb-1.5">Sections & Prices</p>
      <p className="text-xs text-muted-foreground mb-4">
        Review your selection and proceed to payment.
      </p>

      <div className="space-y-3">
        {sections.map((sec) => {
          const seats = selectedBySection[sec];
          const count = seats.length;
          const price = SECTION_PRICES[sec];
          return (
            <div key={sec} className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    "w-6 h-6 rounded flex items-center justify-center text-[11px] font-semibold",
                    sec === "incliner" &&
                      "bg-gradient-to-br from-indigo-700 to-indigo-500 text-white",
                    sec === "gold" && "bg-yellow-400 text-black",
                    sec === "silver" && "bg-gray-300 text-black"
                  )}
                >
                  {sec.charAt(0).toUpperCase()}
                </span>
                <div>
                  <div className="text-sm font-medium capitalize">{sec}</div>
                  <div className="text-xs text-muted-foreground">
                    ₹{price} x {count || 0}
                    {count ? ` (${seats.join(", ")})` : ""}
                  </div>
                </div>
              </div>
              <div className="font-semibold">₹{count * price}</div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 border-t pt-4 space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <span>Subtotal</span>
          <span className="font-medium">₹{subtotal}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>GST (18%)</span>
          <span className="font-medium">₹{gst}</span>
        </div>
        <div className="flex items-center justify-between text-base font-semibold">
          <span>Total</span>
          <span>₹{total}</span>
        </div>
      </div>

      <Button
        className="mt-4 w-full"
        size="lg"
        onClick={onProceed}
        disabled={disabled}
      >
        Proceed to Pay {totalSeats ? `(${totalSeats})` : ""}
      </Button>
    </aside>
  );
};
