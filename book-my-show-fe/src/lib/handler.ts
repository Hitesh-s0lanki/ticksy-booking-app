/* eslint-disable @typescript-eslint/no-explicit-any */
import { Message } from "@bufbuild/protobuf";
import { AxiosError } from "axios";
import { NextResponse } from "next/server";

export const apiResponse = <T>(
  message: string,
  statusCode: number,
  data?: T
): {
  message: string;
  statusCode: number;
  data?: T;
} => {
  if (!data && statusCode != 200) return { message, statusCode };
  let dataString: string;
  if (data instanceof Message) {
    dataString = data.toJsonString({
      enumAsInteger: true,
      emitDefaultValues: true,
    });
  } else {
    dataString = JSON.stringify(data);
  }
  return {
    message,
    data: data ? JSON.parse(dataString) : undefined,
    statusCode,
  };
};

export const errorHandler = (
  error: any,
  status?: number,
  displayMessage?: string
): {
  message: string;
  statusCode: number;
} => {
  let response;
  //check axios error
  if (error instanceof AxiosError) {
    response = {
      message:
        displayMessage ||
        error.response?.data ||
        error.message ||
        "Internal server error",
      statusCode: error.status || error.response?.status || status || 500,
    };
  }
  // Check string message
  else if (typeof error == "string") {
    response = { message: displayMessage || error, statusCode: status || 500 };
  }
  // Check for Clerk error
  else if (error.clerkError && error.clerkTraceId) {
    response = {
      message: displayMessage || error.message || "Internal server error",
      statusCode: error.status || status || 500,
    };
  }
  // Check for google client error
  else if (error.errors) {
    response = {
      message:
        displayMessage || error.errors[0].message || "Internal server error",
      statusCode: error.response?.status || status || 400,
    };
  }
  // Check for Error class instance
  else if (error instanceof Error) {
    response = {
      message: displayMessage || error.message || "Internal server error",
      statusCode: status || 500,
    };
  }
  // Handle general error
  else {
    response = {
      message: displayMessage || "Internal server error",
      statusCode: status || 500,
    };
  }

  return apiResponse(response.message, response.statusCode);
};

type RouteHandlerSuccessResponse<T> = {
  success: boolean;
  message: string;
  data: T | null;
};

type RouteHandlerErrorResponse = {
  success: boolean;
  message: string;
};

export const routeHandlerSuccess = <T>(
  message: string,
  status: number,
  data?: T
): NextResponse<RouteHandlerSuccessResponse<T>> => {
  let processedData: unknown;

  if (data instanceof Message) {
    processedData = JSON.parse(
      data.toJsonString({
        enumAsInteger: true,
        emitDefaultValues: true,
      })
    );
  } else if (data !== undefined) {
    processedData = data;
  }

  return NextResponse.json(
    {
      success: true,
      message,
      data: (processedData as T) ?? null,
    },
    { status }
  );
};

export const routeHandlerError = (
  message: string,
  status: number
): NextResponse<RouteHandlerErrorResponse> => {
  return NextResponse.json(
    {
      success: false,
      message,
    },
    { status }
  );
};
