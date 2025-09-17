"use server";

import { ShowtimeDetailResponse } from "@/gen/js-ts/showtime_pb";
import { axiosInstance } from "@/lib/axios-instance";
import { apiResponse, errorHandler } from "@/lib/handler";
import { deseralize } from "@/lib/utils";
import { PlainMessage } from "@bufbuild/protobuf";

export const getShowtimeById = async ({
  id,
}: {
  id: string;
}): Promise<{
  data?: PlainMessage<ShowtimeDetailResponse>;
  message: string;
  statusCode: number;
}> => {
  try {
    const response = await axiosInstance.get(`/showtimes/${id}`);

    const showtime = deseralize(ShowtimeDetailResponse.fromBinary, response);

    return apiResponse("Showtime fetched successfully", 200, showtime);
  } catch (error: any) {
    console.error("Error fetching showtime by ID:", error);
    return errorHandler(
      error?.message || "Failed to fetch showtime.",
      error?.response?.status || 500
    );
  }
};

export const createBooking = async ({}) => {};
