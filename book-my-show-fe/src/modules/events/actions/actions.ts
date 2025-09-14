"use server";

import { Event as EventProto, EventsList } from "@/gen/js-ts/event_pb";
import { axiosInstance } from "@/lib/axios-instance";
import { apiResponse, errorHandler } from "@/lib/handler";
import { deseralize } from "@/lib/utils";
import { PlainMessage } from "@bufbuild/protobuf";

export const getAllEvents = async ({
  title,
  eventType,
  categoryType,
}: {
  title?: string | null;
  eventType?: string | null;
  categoryType?: string | null;
}): Promise<{
  data?: PlainMessage<EventsList>;
  message: string;
  statusCode: number;
}> => {
  try {
    const params = new URLSearchParams();
    if (title) params.append("title", title);
    if (eventType) params.append("eventType", eventType);
    if (categoryType) params.append("categoryType", categoryType);

    const queryString = params.toString();
    const url = queryString ? `/events?${queryString}` : "/events";

    const response = await axiosInstance.get(url);

    const events = deseralize(EventsList.fromBinary, response);

    return apiResponse("Events fetched succesfully", 200, events);
  } catch (error: any) {
    console.error("Error fetching events:", error);
    return errorHandler(
      error?.message || "Failed to fetch events.",
      error?.response?.status || 500
    );
  }
};

export const getEventById = async ({
  id,
}: {
  id: string;
}): Promise<{
  data?: PlainMessage<EventProto>;
  message: string;
  statusCode: number;
}> => {
  try {
    const response = await axiosInstance.get(`/events/${id}`);

    const event = deseralize(EventProto.fromBinary, response);

    return apiResponse("Event fetched succesfully", 200, event);
  } catch (error: any) {
    console.error("Error fetching event by ID:", error);
    return errorHandler(
      error?.message || "Failed to fetch event.",
      error?.response?.status || 500
    );
  }
};
