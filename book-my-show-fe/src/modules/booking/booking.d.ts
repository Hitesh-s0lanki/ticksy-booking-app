export type BookingPayload = {
  showtimeId: string;
  seats?: any;
  amountWithoutGST: number;
  gst: number;
  totalAmount: number;
} & RazorpaySuccessResponse;

export type RazorpaySuccessResponse = {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
};
