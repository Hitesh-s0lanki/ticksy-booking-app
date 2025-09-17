"use client";

import React from "react";
import type { Section } from "@/types/booking.types";
import CheckoutButton from "./checkout-button";
import { RazorpaySuccessResponse } from "@/modules/booking/booking";

type InvoiceProps = {
  selectedBySection: Record<Section, string[]>;
  SECTION_PRICES: Record<Section, number>;
  subtotal: number;
  gst: number;
  total: number;
  disabled?: boolean;
  onProceed: (response: RazorpaySuccessResponse) => Promise<void>;
};

export const Invoice: React.FC<InvoiceProps> = ({
  selectedBySection,
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
          return (
            <div key={sec} className="flex items-center justify-between">
              <div className="text-sm font-medium capitalize">{sec}</div>
              <div className="text-sm text-muted-foreground">
                {seats.length ? seats.join(", ") : "-"} ({count})
              </div>
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

      <CheckoutButton
        amountInRupees={total}
        notes={{}}
        totalSeats={totalSeats}
        disabled={disabled}
        onProceed={onProceed}
      />
    </aside>
  );
};
