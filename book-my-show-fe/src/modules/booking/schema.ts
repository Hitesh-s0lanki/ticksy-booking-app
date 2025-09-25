import { z } from "zod";

export const showtimeIdParam = z.object({
  showtimeId: z.string().min(1, "Showtime ID is required"),
  source: z.enum(["event", "movie"]).optional().default("movie"),
});

export const razorpaySuccessResponse = z.object({
  razorpay_payment_id: z.string().min(1, "razorpay_payment_id is required"),
  razorpay_order_id: z.string().min(1, "razorpay_order_id is required"),
  razorpay_signature: z.string().min(1, "razorpay_signature is required"),
});

export const bookingPayload = z
  .object({
    showtimeId: z.string().min(1, "Showtime ID is required"),
    seats: z.array(z.string().optional()).optional(),
    amountWithoutGST: z.number().gte(0, "amountWithoutGST must be >= 0"),
    gst: z.number().gte(0, "gst must be >= 0"),
    totalAmount: z.number().gte(0, "totalAmount must be >= 0"),
  })
  .merge(razorpaySuccessResponse);
