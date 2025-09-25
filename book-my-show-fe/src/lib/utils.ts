import { PlainMessage, Message, MessageType } from "@bufbuild/protobuf";
import { AxiosResponse } from "axios";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const parseProtoPlainMessage = <T extends Message<T>>(
  platform: PlainMessage<T>,
  messageType: MessageType<T>
) => {
  // Convert plain message to JSON string and then to a message object
  return messageType.fromJsonString(JSON.stringify(platform), {
    ignoreUnknownFields: true,
  });
};

export function generateDates(n = 5) {
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const result = [];
  const today = new Date();

  for (let i = 0; i < n; i++) {
    // Clone and advance date
    const dt = new Date(today);
    dt.setDate(dt.getDate() + i);

    // Format YYYY-MM-DD
    const yyyy = dt.getFullYear();
    const mm = String(dt.getMonth() + 1).padStart(2, "0");
    const dd = String(dt.getDate()).padStart(2, "0");
    const dateStr = `${yyyy}-${mm}-${dd}`;

    // Compute label
    let label;
    if (i === 0) label = "Today";
    else if (i === 1) label = "Tomorrow";
    else label = dayNames[dt.getDay()];

    result.push({ date: dateStr, day: label });
  }

  return result;
}

export function deseralize<T extends Message>(
  deseralizer: (byetData: Uint8Array) => T,
  response: AxiosResponse
): T {
  try {
    // Convert binary data to buffer array
    const buffer = Buffer.from(response.data, "binary");
    const arrayBuffer = buffer.buffer.slice(
      buffer.byteOffset,
      buffer.byteOffset + buffer.byteLength
    );

    // Convert byteBuffer to Uint8Array
    const uint8Array = new Uint8Array(arrayBuffer);

    // Decode Uint8Array to protot object.
    return deseralizer(uint8Array);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    throw new Error(error.message || "Internal server error");
  }
}
