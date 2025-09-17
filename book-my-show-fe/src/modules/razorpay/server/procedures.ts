import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { createOrder } from "../actions/actions";
import { createOrderParams, verifySignatureParams } from "../schema";
import crypto from "crypto";

export const razorpayRouter = createTRPCRouter({
  createOrder: protectedProcedure
    .input(createOrderParams)
    .mutation(async ({ input }) => {
      const { data, statusCode, message } = await createOrder(input);

      if (statusCode !== 200 || !data) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message,
        });
      }

      return data;
    }),

  verifySignature: protectedProcedure
    .input(verifySignatureParams)
    .mutation(async ({ input }) => {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
        input;

      const secret = process.env.RAZORPAY_KEY_SECRET;
      if (!secret) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Razorpay key secret not configured",
        });
      }

      const hmac = crypto.createHmac("sha256", secret);
      hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
      const expected = hmac.digest("hex");

      const isAuthentic = expected === razorpay_signature;

      if (isAuthentic) {
        // TODO: mark order as PAID in your DB (use razorpay_order_id or map payment -> order)
      }

      return { ok: isAuthentic };
    }),
});
