"use server";

import { razorpay } from "@/lib/razorpay";
import { CreateOrderBody, CreateOrderResult } from "../types";
import { apiResponse, errorHandler } from "@/lib/handler";

export const createOrder = async (
  payload: CreateOrderBody
): Promise<CreateOrderResult> => {
  try {
    if (!payload?.amountInRupees || payload.amountInRupees <= 0) {
      return { message: "Invalid amount", statusCode: 400 };
    }

    const amountInPaise = Math.round(payload.amountInRupees * 100);

    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: payload.currency ?? "INR",
      receipt: payload.receiptId ?? `rcpt_${Date.now()}`,
      notes: payload.notes ?? {},
    });

    return apiResponse("Order created successfully", 200, {
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error: any) {
    console.error("[RAZORPAY_ORDER_ERROR]", error);
    return errorHandler(
      error?.message || "Failed to create order.",
      error?.response?.status || 500
    );
  }
};
