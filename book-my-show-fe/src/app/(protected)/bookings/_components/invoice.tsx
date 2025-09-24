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
  isEvent?: boolean;
  eventPrice?: number;
};

export const Invoice: React.FC<InvoiceProps> = ({
  selectedBySection,
  subtotal,
  gst,
  total,
  disabled,
  onProceed,
  isEvent = false,
  eventPrice = 0,
}) => {
  const sections: Section[] = ["incliner", "gold", "silver"];

  const totalSeats = sections.reduce(
    (acc, s) => acc + selectedBySection[s].length,
    0
  );

  return (
    <aside className="">
      <p className="text-lg font-semibold mb-1.5">
        {isEvent ? "Event Booking" : "Sections & Prices"}
      </p>
      <p className="text-xs text-muted-foreground mb-4">
        {isEvent
          ? "Review event details and proceed to payment."
          : "Review your selection and proceed to payment."}
      </p>

      {isEvent ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium">Event Ticket</div>
            <div className="text-sm text-muted-foreground">₹{eventPrice}</div>
          </div>
        </div>
      ) : (
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
      )}

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
        totalSeats={isEvent ? 1 : totalSeats}
        disabled={disabled}
        onProceed={onProceed}
      />
    </aside>
  );
};
