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
  "message": "Your message here"
}
```

**Request Schema:**
- `message` (string, required): The user's message to send to the AI agent

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
{"content": "chunk of text"}
```

**Response Schema:**
- `content` (string): A chunk of the AI's response text

#### Example Response Stream

```
{"content": "Hello"}
{"content": " there"}
{"content": "! How"}
{"content": " can I"}
{"content": " help you?"}
```

---

## Integration Examples

### JavaScript/TypeScript (Fetch API)

```javascript
async function streamChat(message) {
  const response = await fetch('http://localhost:8000/stream', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message }),
  });

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let fullResponse = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value);
    const lines = chunk.split('\n').filter(line => line.trim());

    for (const line of lines) {
      try {
        const data = JSON.parse(line);
        fullResponse += data.content;
        console.log('Received chunk:', data.content);
        // Update UI with fullResponse
      } catch (e) {
        console.error('Error parsing JSON:', e);
      }
    }
  }

  return fullResponse;
}

// Usage
streamChat('Hello, how are you?')
  .then(response => console.log('Complete response:', response))
  .catch(error => console.error('Error:', error));
```

### React Hook Example

```typescript
import { useState, useCallback } from 'react';

interface CharResponse {
  content: string;
}

export function useStreamingChat() {
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(async (message: string) => {
    setIsLoading(true);
    setResponse('');
    setError(null);

    try {
      const res = await fetch('http://localhost:8000/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No response body');
      }

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter(line => line.trim());

        for (const line of lines) {
          try {
            const data: CharResponse = JSON.parse(line);
            setResponse(prev => prev + data.content);
          } catch (e) {
            console.error('Error parsing JSON:', e);
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { response, isLoading, error, sendMessage };
}

// Usage in component
function ChatComponent() {
  const { response, isLoading, error, sendMessage } = useStreamingChat();
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
    setInput('');
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

def stream_chat(message: str):
    url = "http://localhost:8000/stream"
    payload = {"message": message}
    
    response = requests.post(url, json=payload, stream=True)
    response.raise_for_status()
    
    full_response = ""
    for line in response.iter_lines():
        if line:
            try:
                data = json.loads(line)
                chunk = data.get("content", "")
                full_response += chunk
                print(chunk, end="", flush=True)  # Print as it streams
            except json.JSONDecodeError:
                continue
    
    return full_response

# Usage
response = stream_chat("Hello, how are you?")
print(f"\n\nComplete response: {response}")
```

### cURL Example

```bash
curl -X POST http://localhost:8000/stream \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello, how are you?"}' \
  --no-buffer
```

### Axios Example (with streaming support)

```javascript
import axios from 'axios';

async function streamChat(message) {
  const response = await axios({
    method: 'POST',
    url: 'http://localhost:8000/stream',
    data: { message },
    responseType: 'stream',
  });

  let fullResponse = '';

  response.data.on('data', (chunk) => {
    const lines = chunk.toString().split('\n').filter(line => line.trim());
    
    lines.forEach(line => {
      try {
        const data = JSON.parse(line);
        fullResponse += data.content;
        console.log('Chunk:', data.content);
      } catch (e) {
        console.error('Parse error:', e);
      }
    });
  });

  response.data.on('end', () => {
    console.log('Complete response:', fullResponse);
  });

  response.data.on('error', (error) => {
    console.error('Stream error:', error);
  });
}

streamChat('Hello, how are you?');
```

---

## Error Handling

### Error Response Format

If an error occurs during streaming, the API will send an error message in the same format:

```json
{"content": "Error: <error message>"}
```

### Common HTTP Status Codes

- `200 OK`: Request successful, streaming started
- `422 Unprocessable Entity`: Invalid request body (missing or invalid `message` field)
- `500 Internal Server Error`: Server error occurred

### Example Error Handling

```javascript
try {
  const response = await fetch('http://localhost:8000/stream', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: 'Hello' }),
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  // Handle streaming...
} catch (error) {
  console.error('Request failed:', error);
  // Handle error in UI
}
```

---

## Best Practices

### 1. Handle Incomplete JSON Lines

The stream may contain incomplete JSON at the end of a chunk. Always check for complete lines:

```javascript
let buffer = '';
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;

  buffer += decoder.decode(value, { stream: true });
  const lines = buffer.split('\n');
  
  // Keep the last incomplete line in buffer
  buffer = lines.pop() || '';
  
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

fetch('http://localhost:8000/stream', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ message: 'Hello' }),
  signal: controller.signal,
});

// Cancel the request
controller.abort();
```

### 3. Timeout Handling

```javascript
const timeoutId = setTimeout(() => {
  controller.abort();
  console.error('Request timeout');
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
     "message": "Hello, how are you?"
   }
   ```
4. Click "Send" - you should see the response stream in real-time

### Using Swagger UI

Visit `http://localhost:8000/` to access the interactive API documentation where you can test the endpoint directly.

---

## Notes

- The API streams responses in real-time as the AI generates them
- Each line in the response is a complete, valid JSON object
- The `content` field contains incremental text chunks
- Concatenate all `content` values to get the complete response
- The stream ends when the AI finishes generating the response
- Connection is kept alive during streaming

---

## Support

For issues or questions, please refer to the main project documentation or contact the development team.

