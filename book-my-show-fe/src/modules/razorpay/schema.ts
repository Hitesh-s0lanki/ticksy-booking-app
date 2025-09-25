import { z } from "zod";

export const createOrderParams = z.object({
  amountInRupees: z
    .number()
    .min(1, "Amount must be at least 1 rupee")
    .positive("Amount must be greater than zero"),
  currency: z.literal("INR").optional(),
  receiptId: z.string().optional(),
  notes: z.any().optional(),
});

export const verifySignatureParams = z.object({
  razorpay_order_id: z.string().min(1),
  razorpay_payment_id: z.string().min(1),
  razorpay_signature: z.string().min(1),
});
