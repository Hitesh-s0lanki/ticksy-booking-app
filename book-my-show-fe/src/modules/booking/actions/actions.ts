"use server";

import {
  CreateBookingRequest,
  MyBooking,
  MyBookings,
} from "@/gen/js-ts/booking_pb";
import { ShowtimeDetailResponse } from "@/gen/js-ts/showtime_pb";
import { axiosInstance } from "@/lib/axios-instance";
import { apiResponse, errorHandler } from "@/lib/handler";
import { deseralize } from "@/lib/utils";
import { PlainMessage } from "@bufbuild/protobuf";
import { BookingPayload } from "../booking";

export const getShowtimeById = async ({
  id,
}: {
  id: string;
}): Promise<{
  data?: PlainMessage<ShowtimeDetailResponse>;
  message: string;
  statusCode: number;
}> => {
  try {
    const response = await axiosInstance.get(`/showtimes/${id}`);

    const showtime = deseralize(ShowtimeDetailResponse.fromBinary, response);

    return apiResponse("Showtime fetched successfully", 200, showtime);
  } catch (error: any) {
    console.error("Error fetching showtime by ID:", error);
    return errorHandler(
      error?.message || "Failed to fetch showtime.",
      error?.response?.status || 500
    );
  }
};

CreateBookingRequest;

export const createBooking = async (
  payload: BookingPayload,
  user_id: string
) => {
  try {
    // check if user_id is present
    if (!user_id) {
      throw new Error("User not authenticated");
    }

    const bookingRequest = new CreateBookingRequest({
      showtimeId: payload.showtimeId,
      seats: payload.seats || [],
      amountWithoutGst: `${payload.amountWithoutGST}`,
      gst: `${payload.gst}`,
      totalAmount: `${payload.totalAmount}`,
      razorpay: {
        razorpayOrderId: payload.razorpay_order_id,
        razorpayPaymentId: payload.razorpay_payment_id,
        razorpaySignature: payload.razorpay_signature,
      },
      userId: user_id,
    });

    console.log("Booking Request:", bookingRequest.toJsonString());

    const response = await axiosInstance.post(
      "/bookings",
      bookingRequest.toBinary()
    );

    return apiResponse("Booking created successfully", 201, response.data);
  } catch (error: any) {
    console.error("Error creating booking:", error);
    return errorHandler(
      error?.message || "Failed to create booking.",
      error?.response?.status || 500
    );
  }
};

export const getUserBookings = async (
  user_id: string
): Promise<{
  data?: PlainMessage<MyBooking>[];
  message: string;
  statusCode: number;
}> => {
  try {
    // check if user_id is present
    if (!user_id) {
      throw new Error("User not authenticated");
    }

    const response = await axiosInstance.get(`/bookings?userId=${user_id}`);

    const bookings = deseralize(MyBookings.fromBinary, response);

    return apiResponse("Bookings fetched successfully", 200, bookings.items);
  } catch (error: any) {
    console.error("Error fetching user bookings:", error);
    return errorHandler(
      error?.message || "Failed to fetch bookings.",
      error?.response?.status || 500
    );
  }
};
