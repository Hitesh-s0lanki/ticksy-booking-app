import { NextRequest } from "next/server";

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface ChatRequest {
  messages: ChatMessage[];
}

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json();

    // Validate request
    if (!body.messages || !Array.isArray(body.messages) || body.messages.length === 0) {
      return new Response(
        JSON.stringify({ error: "messages array is required and must not be empty" }),
        { status: 422, headers: { "Content-Type": "application/json" } }
      );
    }

    // Validate each message
    for (const msg of body.messages) {
      if (!msg.role || !msg.content) {
        return new Response(
          JSON.stringify({ error: "Each message must have 'role' and 'content' fields" }),
          { status: 422, headers: { "Content-Type": "application/json" } }
        );
      }
      if (!["system", "user", "assistant"].includes(msg.role)) {
        return new Response(
          JSON.stringify({ error: "Message role must be 'system', 'user', or 'assistant'" }),
          { status: 422, headers: { "Content-Type": "application/json" } }
        );
      }
    }

    // Get backend URL from environment or use default
    const backendUrl =
      process.env.NEXT_PUBLIC_AI_SERVER_API_URL || "http://localhost:8000";
    const streamUrl = `${backendUrl}/stream`;

    // Forward request to backend
    const backendResponse = await fetch(streamUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ messages: body.messages }),
    });

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text();
      return new Response(
        JSON.stringify({ error: errorText || `Backend error: ${backendResponse.status}` }),
        { status: backendResponse.status, headers: { "Content-Type": "application/json" } }
      );
    }

    // Return streaming response
    return new Response(backendResponse.body, {
      headers: {
        "Content-Type": "application/x-ndjson",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  } catch (error) {
    console.error("Error in chat API route:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Internal server error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

