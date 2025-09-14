import { z } from "zod";

export const eventsSearchParams = z.object({
  title: z.string().optional().nullable(),
  eventType: z.string().optional().nullable(),
  categoryType: z.string().optional().nullable(),
});

export const eventIdParam = z.object({
  eventId: z.string().min(1, "Event ID is required"),
});
