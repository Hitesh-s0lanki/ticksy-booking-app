export type CreateOrderBody = {
  amountInRupees: number; // e.g. 499.00
  currency?: "INR";
  receiptId?: string;
  notes?: Record<string, string>;
};

export type CreateOrderResult = {
  data?: {
    orderId: string;
    amount: string | number;
    currency: string;
    key?: string;
  };
  message: string;
  statusCode: number;
};
