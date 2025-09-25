"use client";

import { Button } from "@/components/ui/button";
import { RazorpaySuccessResponse } from "@/modules/booking/booking";
import { loadRazorpayCheckout } from "@/modules/razorpay/load-razorpay";
import { useTRPC } from "@/trpc/client";
import { useUser } from "@clerk/nextjs";
import { useMutation } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { toast } from "sonner";

type Props = {
  amountInRupees: number;
  totalSeats?: number;
  notes?: Record<string, string>;
  disabled?: boolean;
  onProceed: (response: RazorpaySuccessResponse) => Promise<void>;
};

export default function CheckoutButton({
  amountInRupees,
  notes,
  totalSeats,
  disabled,
  onProceed,
}: Props) {
  const { user } = useUser();

  const trpc = useTRPC();
  const [loading, setLoading] = useState(false);

  // create order mutation
  const createOrder = useMutation(
    trpc.razorpay.createOrder.mutationOptions({
      onSuccess: () => {
        toast.success("Order created successfully");
      },
      onError: (err) => {
        toast.error(err.message);
      },
    })
  );

  // verify payment
  const verifyPayment = useMutation(
    trpc.razorpay.verifySignature.mutationOptions({
      onSuccess: () => {
        toast.success("Payment verified successfully");
      },
      onError: (err) => {
        toast.error(err.message);
      },
    })
  );

  const onPay = useCallback(async () => {
    if (!user) return toast.error("User not logged in");

    setLoading(true);
    try {
      await loadRazorpayCheckout();
      const order = await createOrder.mutateAsync({
        amountInRupees,
        notes,
      });

      const options = {
        key: order.key,
        amount: order.amount, // in paise
        currency: order.currency,
        name: "Ticksy Booking",
        description: "Order payment",
        order_id: order.orderId,
        prefill: {
          name: user?.fullName || "Guest User",
          email: user?.primaryEmailAddress?.emailAddress || "guest@example.com",
        },
        notes,
        theme: { color: "#ff6900" },
        handler: async (response: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) => {
          setLoading(true);

          const result = await verifyPayment.mutateAsync(response);
          if (result.ok) {
            // Payment verified
            toast.success("Payment verified ✅");

            // Proceed with booking
            await onProceed(response).finally(() => setLoading(false));

            // Redirect to Success Page
          } else {
            toast.error("Payment verification failed ❌");
          }
        },
        modal: {
          ondismiss: () => toast.warning("Checkout closed"),
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (e: any) {
      console.error(e);
      alert(e.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [createOrder, verifyPayment, notes, user]);

  return (
    <Button
      className="mt-4 w-full"
      size="sm"
      onClick={onPay}
      disabled={loading || disabled}
    >
      Proceed to Pay {totalSeats ? `(${totalSeats})` : ""}
    </Button>
  );
}
