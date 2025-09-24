"use server";

import { Event as EventProto, EventsList } from "@/gen/js-ts/event_pb";
import { ShowtimeEventResponse } from "@/gen/js-ts/showtime_pb";
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

export const getEventShowtime = async ({
  eventId,
}: {
  eventId: string;
}): Promise<{
  data?: PlainMessage<ShowtimeEventResponse>;
  message: string;
  statusCode: number;
}> => {
  try {
    // Fetch event showtimes from the backend
    const response = await axiosInstance.get(`/showtimes/by-event/${eventId}`);

    // Deserialize the response data
    const showtime = deseralize(ShowtimeEventResponse.fromBinary, response);

    return apiResponse("Showtimes fetched successfully", 200, showtime);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    // Capture api related error and report it to sentry
    console.error("Error fetching event showtimes:", error);
    return errorHandler(
      error?.message || "Failed to fetch showtimes.",
      error?.response?.status || 500
    );
  }
};
