# API Documentation

## Overview

This API provides a streaming chat interface that uses LangChain agents with OpenAI's GPT models. Responses are streamed in real-time as newline-delimited JSON (NDJSON) format.

**Base URL:** `http://localhost:8000` (development)  
**API Documentation:** `http://localhost:8000/` (Swagger UI)

---

## Endpoints

### POST `/stream`

Streams chat responses from the AI agent in real-time.

#### Request

**Headers:**

```
Content-Type: application/json
```

**Body:**

```json
{
  "messages": [
    {
      "role": "system",
      "content": "You are Ticksy, a helpful booking assistant."
    },
    { "role": "user", "content": "Your message here" }
  ]
}
```

**Request Schema:**

- `messages` (array, required): Ordered conversation history, minimum 1 entry
  - `role` (string, required): `"system"`, `"user"`, or `"assistant"`
  - `content` (string, required): Message text for the given role

#### Response

**Headers:**

```
Content-Type: application/x-ndjson
Cache-Control: no-cache
Connection: keep-alive
```

**Response Format:**
The response is a stream of newline-delimited JSON objects. Each line is a complete JSON object with the following structure:

```json
{
  "message": "chunk of text",
  "suggestion": [
    {
      "id": "movie-123",
      "title": "Movie Title",
      "type": "movie",
      "description": "Movie description",
      "date": "2024-01-15",
      "time": "19:00",
      "venue": "Cinema Hall",
      "venue_id": "venue-456",
      "image_url": "https://example.com/image.jpg",
      "metadata": {}
    }
  ],
  "stage": "query"
}
```

**Response Schema:**

- `message` (string): A chunk of the AI's response text
- `suggestion` (array): Array of suggestion objects extracted from query_agent tools. Each suggestion contains:
  - `id` (string, optional): Unique identifier (movieId, eventId, venueId)
  - `title` (string, required): Title of the movie, event, or venue
  - `type` (string, required): Type: "movie", "event", or "venue"
  - `description` (string, optional): Description or summary
  - `date` (string, optional): Date in YYYY-MM-DD format
  - `time` (string, optional): Time or time range
  - `venue` (string, optional): Venue name
  - `venue_id` (string, optional): Venue ID
  - `image_url` (string, optional): Image URL or key
  - `metadata` (object, optional): Additional metadata
- `stage` (string): Current conversation stage: "query", "auth", "booking", "support", or "cancel"

#### Example Response Stream

```
{"message": "Hello", "suggestion": [], "stage": "query"}
{"message": " there", "suggestion": [], "stage": "query"}
{"message": "! I found", "suggestion": [], "stage": "query"}
{"message": " some movies", "suggestion": [{"id": "movie-123", "title": "Inception", "type": "movie", "description": "A mind-bending thriller", "date": "2024-01-15", "time": "19:00", "venue": "Cinema Hall", "venue_id": "venue-456", "image_url": null, "metadata": {}}], "stage": "query"}
{"message": " for you.", "suggestion": [{"id": "movie-123", "title": "Inception", "type": "movie", "description": "A mind-bending thriller", "date": "2024-01-15", "time": "19:00", "venue": "Cinema Hall", "venue_id": "venue-456", "image_url": null, "metadata": {}}], "stage": "query"}
```

---

## Integration Examples

### JavaScript/TypeScript (Fetch API)

```javascript
async function streamChat(message, history = []) {
  const messages = [...history, { role: "user", content: message }];

  const response = await fetch("http://localhost:8000/stream", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ messages }),
  });

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let fullResponse = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value);
    const lines = chunk.split("\n").filter((line) => line.trim());

    for (const line of lines) {
      try {
        const data = JSON.parse(line);
        fullResponse += data.message;
        console.log("Received chunk:", data.message);
        // Handle suggestions if present
        if (data.suggestion && data.suggestion.length > 0) {
          console.log("Suggestions:", data.suggestion);
          // Update UI with suggestions
        }
        // Update UI with fullResponse
      } catch (e) {
        console.error("Error parsing JSON:", e);
      }
    }
  }

  return {
    fullResponse,
    messages: [...messages, { role: "assistant", content: fullResponse }],
  };
}

// Usage
streamChat("Hello, how are you?")
  .then(({ fullResponse }) => console.log("Complete response:", fullResponse))
  .catch((error) => console.error("Error:", error));
```

### React Hook Example

```typescript
import { useState, useCallback } from "react";

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface Suggestion {
  id?: string;
  title: string;
  type: "movie" | "event" | "venue";
  description?: string;
  date?: string;
  time?: string;
  venue?: string;
  venue_id?: string;
  image_url?: string;
  metadata?: Record<string, any>;
}

interface CharResponse {
  message: string;
  suggestion: Suggestion[];
  stage: "query" | "auth" | "booking" | "support" | "cancel";
}

export function useStreamingChat() {
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(async (messages: ChatMessage[]) => {
    setIsLoading(true);
    setResponse("");
    setError(null);

    try {
      const res = await fetch("http://localhost:8000/stream", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messages }),
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error("No response body");
      }

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n").filter((line) => line.trim());

        for (const line of lines) {
          try {
            const data: CharResponse = JSON.parse(line);
            setResponse((prev) => prev + data.message);
            // Handle suggestions if present
            if (data.suggestion && data.suggestion.length > 0) {
              // Update suggestions state if needed
              console.log("Suggestions received:", data.suggestion);
            }
          } catch (e) {
            console.error("Error parsing JSON:", e);
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { response, isLoading, error, sendMessage };
}

// Usage in component
function ChatComponent() {
  const { response, isLoading, error, sendMessage } = useStreamingChat();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "system", content: "You are Ticksy, a helpful booking assistant." },
  ]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = [...messages, { role: "user", content: input }];
    setMessages(updated);
    sendMessage(updated);
    setInput("");
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading}>
          Send
        </button>
      </form>
      {error && <div className="error">{error}</div>}
      <div className="response">{response}</div>
    </div>
  );
}
```

### Python Example

```python
import requests
import json

def stream_chat(messages):
    url = "http://localhost:8000/stream"
    payload = {"messages": messages}

    response = requests.post(url, json=payload, stream=True)
    response.raise_for_status()

    full_response = ""
    for line in response.iter_lines():
        if line:
            try:
                data = json.loads(line)
                chunk = data.get("message", "")
                full_response += chunk
                print(chunk, end="", flush=True)  # Print as it streams
                # Handle suggestions if present
                suggestions = data.get("suggestion", [])
                if suggestions:
                    print(f"\n[Suggestions: {len(suggestions)} items]", flush=True)
            except json.JSONDecodeError:
                continue

    return full_response

# Usage
response = stream_chat([
    {"role": "system", "content": "You are Ticksy, a helpful booking assistant."},
    {"role": "user", "content": "Hello, how are you?"}
])
print(f"\n\nComplete response: {response}")
```

### cURL Example

```bash
curl -X POST http://localhost:8000/stream \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"Hello, how are you?"}]}' \
  --no-buffer
```

### Axios Example (with streaming support)

```javascript
import axios from "axios";

async function streamChat(message, history = []) {
  const messages = [...history, { role: "user", content: message }];

  const response = await axios({
    method: "POST",
    url: "http://localhost:8000/stream",
    data: { messages },
    responseType: "stream",
  });

  let fullResponse = "";

  response.data.on("data", (chunk) => {
    const lines = chunk
      .toString()
      .split("\n")
      .filter((line) => line.trim());

    lines.forEach((line) => {
      try {
        const data = JSON.parse(line);
        fullResponse += data.message;
        console.log("Chunk:", data.message);
        // Handle suggestions if present
        if (data.suggestion && data.suggestion.length > 0) {
          console.log("Suggestions:", data.suggestion);
        }
      } catch (e) {
        console.error("Parse error:", e);
      }
    });
  });

  response.data.on("end", () => {
    console.log("Complete response:", fullResponse);
  });

  response.data.on("error", (error) => {
    console.error("Stream error:", error);
  });
}

streamChat("Hello, how are you?");
```

---

## Error Handling

### Error Response Format

If an error occurs during streaming, the API will send an error message in the same format:

```json
{
  "message": "Error: <error message>",
  "suggestion": [],
  "stage": "query"
}
```

### Common HTTP Status Codes

- `200 OK`: Request successful, streaming started
- `422 Unprocessable Entity`: Invalid request body (missing or invalid `messages` array or message role/content)
- `500 Internal Server Error`: Server error occurred

### Example Error Handling

```javascript
try {
  const response = await fetch("http://localhost:8000/stream", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages: [{ role: "user", content: "Hello" }],
    }),
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  // Handle streaming...
} catch (error) {
  console.error("Request failed:", error);
  // Handle error in UI
}
```

---

## Best Practices

### 1. Handle Incomplete JSON Lines

The stream may contain incomplete JSON at the end of a chunk. Always check for complete lines:

```javascript
let buffer = "";
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;

  buffer += decoder.decode(value, { stream: true });
  const lines = buffer.split("\n");

  // Keep the last incomplete line in buffer
  buffer = lines.pop() || "";

  for (const line of lines) {
    if (line.trim()) {
      try {
        const data = JSON.parse(line);
        // Process data
      } catch (e) {
        // Skip invalid JSON
      }
    }
  }
}
```

### 2. Cancel Streaming

You can cancel an ongoing stream request:

```javascript
const controller = new AbortController();

fetch("http://localhost:8000/stream", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    messages: [{ role: "user", content: "Hello" }],
  }),
  signal: controller.signal,
});

// Cancel the request
controller.abort();
```

### 3. Timeout Handling

```javascript
const timeoutId = setTimeout(() => {
  controller.abort();
  console.error("Request timeout");
}, 30000); // 30 seconds

// Clear timeout when done
clearTimeout(timeoutId);
```

---

## Testing

### Using Postman

1. Create a new POST request to `http://localhost:8000/stream`
2. Set Headers: `Content-Type: application/json`
3. Set Body (raw JSON):
   ```json
   {
     "messages": [
       {
         "role": "system",
         "content": "You are Ticksy, a helpful booking assistant."
       },
       { "role": "user", "content": "Hello, how are you?" }
     ]
   }
   ```
4. Click "Send" - you should see the response stream in real-time

### Using Swagger UI

Visit `http://localhost:8000/` to access the interactive API documentation where you can test the endpoint directly.

---

## Notes

- The API streams responses in real-time as the AI generates them
- Each line in the response is a complete, valid JSON object
- The `message` field contains incremental text chunks
- Concatenate all `message` values to get the complete response
- The `suggestion` array contains structured data extracted from query_agent tools (movies, events, venues)
- Suggestions are populated when the agent calls query tools and may be included in multiple chunks
- The `stage` field indicates the current conversation stage
- The stream ends when the AI finishes generating the response
- Connection is kept alive during streaming

---

## Support

For issues or questions, please refer to the main project documentation or contact the development team.
