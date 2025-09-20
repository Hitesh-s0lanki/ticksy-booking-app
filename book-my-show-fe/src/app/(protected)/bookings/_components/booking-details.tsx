"use client";

import React, { useEffect, useMemo, useState } from "react";
import type { MovieInfo, Section } from "@/types/booking.types";
import { Invoice } from "./invoice";
import { MovieDetails } from "./movie-details";
import { SeatMap } from "./seat-map";
import { Separator } from "@/components/ui/separator";
import { useTRPC } from "@/trpc/client";
import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import VenueCard from "./venue-card";
import ShowtimeDetail from "./showtime-detail";
import { BookingPayload } from "@/modules/booking/booking";
import { toast } from "sonner";
import { useSuccessModel } from "@/modules/booking/hooks/use-success-model";
import { useRouter } from "next/navigation";
import { getBookedSeats } from "@/modules/movies/actions/actions";

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

type BookingContainerProps = {
  showtimeId: string; // parent or page passes this down
  movie?: MovieInfo;
};

const BookingDetails: React.FC<BookingContainerProps> = ({ showtimeId }) => {
  const router = useRouter();

  // Get the Showtime
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(
    trpc.bookings.getShowtime.queryOptions({ showtimeId })
  );

  const { onOpen, onClose, setPhase } = useSuccessModel();

  const bookingMutation = useMutation(
    trpc.bookings.createBooking.mutationOptions({
      onSuccess: () => {
        toast.success("Booking created successfully");
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

  const groupRows = [
    ["A", "B"],
    ["C", "D", "E"],
    ["F", "G", "H"],
    ["I", "J"],
    ["K", "L"],
  ];

  const [selectedSeats, setSelectedSeats] = useState<Set<string>>(new Set());
  const [bookedSeats, setBookedSeats] = useState<Set<string>>(new Set());
  const [occupiedSeats, setOccupiedSeats] = useState<Set<string>>(new Set());
  const [loadingOccupied, setLoadingOccupied] = useState(false);

  // Load initially occupied seats (server)
  useEffect(() => {
    const load = async () => {
      setLoadingOccupied(true);
      // TODO: fetch from API using showtimeId
      const { data, statusCode } = await getBookedSeats({ showtimeId });

      if (statusCode === 200)
        setOccupiedSeats(new Set(data?.bookedSeats || []));

      setLoadingOccupied(false);
    };
    load();
  }, [showtimeId]);

  const onToggleSeat = (seatId: string) => {
    const occupied = occupiedSeats;
    if (bookedSeats.has(seatId) || occupied.has(seatId)) return;
    setSelectedSeats((prev) => {
      const next = new Set(prev);
      next.has(seatId) ? next.delete(seatId) : next.add(seatId);
      return next;
    });
  };

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

  // Adjust GST% as needed
  const gst = Math.round(subtotal * 0.18);
  const total = subtotal + gst;

  const paymentSuccess = async (response: {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
  }) => {
    onOpen();

    const payload: BookingPayload = {
      showtimeId,
      seats: Array.from(selectedSeats),
      amountWithoutGST: subtotal,
      gst,
      totalAmount: total,
      razorpay_order_id: response.razorpay_order_id,
      razorpay_payment_id: response.razorpay_payment_id,
      razorpay_signature: response.razorpay_signature,
    };

    // Simulate success: mark them as booked locally
    setBookedSeats((prev) => new Set([...prev, ...payload.seats]));
    setSelectedSeats(new Set());

    // Send to server
    await bookingMutation.mutateAsync(payload);
  };

  return (
    <div className="flex flex-col xl:flex-row px-6 md:px-16 lg:px-24 py-8 md:pt-10 gap-10 items-center">
      <div className="flex-1 w-full flex flex-col gap-10">
        <SeatMap
          groupRows={groupRows}
          selectedSeats={selectedSeats}
          occupiedSeats={occupiedSeats}
          bookedSeats={bookedSeats}
          onToggleSeat={onToggleSeat}
          rowToSection={rowToSection}
          SECTION_PRICES={SECTION_PRICES}
        />
        <ShowtimeDetail
          date={data.showtime?.date}
          startAt={data.showtime?.startAt}
          endAt={data.showtime?.endAt}
        />
      </div>
      {/* Seat map */}

      {/* Right column */}
      <div className="w-full xl:w-80 2xl:w-96 space-y-6">
        <div className="relative w-full xl:w-80 2xl:w-96 bg-background border border-primary/20 rounded-xl p-5 h-max shadow-sm">
          <Invoice
            selectedBySection={selectedBySection}
            SECTION_PRICES={SECTION_PRICES}
            subtotal={subtotal}
            gst={gst}
            total={total}
            disabled={selectedSeats.size === 0}
            onProceed={paymentSuccess}
          />
          <div className="py-5">
            <Separator />
          </div>
          <MovieDetails
            movieName={data?.movieName}
            movieDescription={data?.movieDescription}
            movieImage={data.movieImageUrl}
            movieDuration={data?.movieDuration}
            movieRating={data?.movieRating}
          />
          <div className="py-5">
            <Separator />
          </div>
          {/* Venue Card */}
          <VenueCard
            data={{
              venueName: data.venueName,
              venueLocation: data.venueLocation,
              venueMapUrl: data.venueMapUrl,
            }}
          />
          {loadingOccupied && (
            <div className="text-xs text-muted-foreground">
              Syncing booked seats…
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingDetails;
