"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";
import { Invoice } from "./invoice";
import { Separator } from "@/components/ui/separator";
import { useTRPC } from "@/trpc/client";
import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import VenueCard from "./venue-card";
import ShowtimeDetail from "./showtime-detail";
import { BookingPayload } from "@/modules/booking/booking";
import { toast } from "sonner";
import { useSuccessModel } from "@/modules/booking/hooks/use-success-model";
import { useRouter } from "next/navigation";

type EventBookingDetailsProps = {
  showtimeId: string;
};

const EventBookingDetails: React.FC<EventBookingDetailsProps> = ({
  showtimeId,
}) => {
  const router = useRouter();
  const trpc = useTRPC();

  // Get the Event Showtime using events.getShowtime
  const { data } = useSuspenseQuery(
    trpc.events.getShowtime.queryOptions({ showtimeId })
  );

  const { onOpen, onClose, setPhase } = useSuccessModel();

  const bookingMutation = useMutation(
    trpc.bookings.createBooking.mutationOptions({
      onSuccess: () => {
        toast.success("Event booking created successfully");
        setPhase("success");
        onClose();
        router.replace("/my-booking");
      },
      onError: (err) => {
        toast.error(err.message);
        setPhase("error");
        onClose();
      },
    })
  );

  const [isProcessing, setIsProcessing] = useState(false);

  // For events, we assume a fixed price (no seat selection)
  const eventPrice = 500; // You can get this from the event data or make it configurable
  const subtotal = eventPrice;
  const gst = Math.round(subtotal * 0.18);
  const total = subtotal + gst;

  // Event details from the showtime data
  const eventDetails = useMemo(() => {
    if (!data) return null;

    // Calculate duration if available
    const start = data.showtime?.startAt
      ? new Date(data.showtime.startAt)
      : null;
    const end = data.showtime?.endAt ? new Date(data.showtime.endAt) : null;
    const durationMinutes =
      start && end
        ? Math.round((end.getTime() - start.getTime()) / 60000)
        : null;
    const durationHours = durationMinutes ? durationMinutes / 60 : 2;

    return {
      title: data.event?.title, // In events, this might be event title
      description: data.event?.description, // Event description
      imageUrl: data.event?.bannerUrl, // Event banner/image
      duration: durationHours,
    };
  }, [data]);

  const paymentSuccess = async (response: {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
  }) => {
    setIsProcessing(true);
    onOpen();

    const payload: BookingPayload = {
      showtimeId,
      seats: [], // No seats for events
      amountWithoutGST: subtotal,
      gst,
      totalAmount: total,
      razorpay_order_id: response.razorpay_order_id,
      razorpay_payment_id: response.razorpay_payment_id,
      razorpay_signature: response.razorpay_signature,
    };

    try {
      await bookingMutation.mutateAsync(payload);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!data || !eventDetails) {
    return <div>Loading event details...</div>;
  }

  return (
    <div className="flex flex-col xl:flex-row px-6 md:px-16 lg:px-24 py-8 md:pt-10 gap-10 items-start">
      {/* Left column - Event Details */}
      <div className="flex-1 w-full">
        <div className="w-full p-8 bg-primary/10 border-2 border-primary/30 rounded-md shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="relative w-full h-64 md:h-80">
              {eventDetails.imageUrl && (
                <Image
                  src={eventDetails.imageUrl}
                  alt={eventDetails.title || "Event Image"}
                  fill
                  className="object-cover rounded-md shadow-2xl"
                  unoptimized
                />
              )}
            </div>
            <div className="md:col-span-2 flex flex-col gap-4 justify-center">
              <h1 className="text-2xl font-bold">{eventDetails.title}</h1>
              <p className="text-gray-700">{eventDetails.description}</p>
              <div className="text-sm text-gray-600 flex flex-col gap-1">
                <p>
                  <strong>Event Timing:</strong>{" "}
                  {data.showtime?.startAt &&
                    new Date(data.showtime.startAt).toLocaleString("en-GB", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                </p>
                <p>
                  <strong>Venue:</strong> {data.venueName}
                </p>
                <p>
                  <strong>Duration:</strong> {eventDetails.duration} hours
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <ShowtimeDetail
            date={data.showtime?.date}
            startAt={data.showtime?.startAt}
            endAt={data.showtime?.endAt}
          />
        </div>
      </div>

      {/* Right column - Booking Details */}
      <div className="w-full xl:w-80 2xl:w-96 space-y-6">
        <div className="relative w-full xl:w-80 2xl:w-96 bg-background border border-primary/20 rounded-xl p-5 h-max shadow-sm">
          <Invoice
            selectedBySection={{
              incliner: [],
              gold: [],
              silver: [],
            }}
            SECTION_PRICES={{
              incliner: eventPrice,
              gold: eventPrice,
              silver: eventPrice,
            }}
            subtotal={subtotal}
            gst={gst}
            total={total}
            disabled={isProcessing}
            onProceed={paymentSuccess}
            isEvent={true}
            eventPrice={eventPrice}
          />

          <div className="py-5">
            <Separator />
          </div>

          <VenueCard
            data={{
              venueName: data.venueName,
              venueLocation: data.venueLocation,
              venueMapUrl: data.venueMapUrl,
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default EventBookingDetails;
