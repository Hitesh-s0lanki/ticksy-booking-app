import { useState, useCallback, useRef } from "react";

export interface ApiSuggestion {
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

interface ChatResponse {
  message: string;
  suggestion: ApiSuggestion[];
  stage: "query" | "auth" | "booking" | "support" | "cancel";
}

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface UseStreamingChatOptions {
  apiUrl?: string;
  onError?: (error: Error) => void;
  systemMessage?: string;
  onSuggestion?: (suggestions: ApiSuggestion[]) => void;
  onStage?: (stage: ChatResponse["stage"]) => void;
}

export function useStreamingChat(options: UseStreamingChatOptions = {}) {
  const defaultApiUrl = "/api/chat";
  const { 
    apiUrl = defaultApiUrl, 
    onError, 
    systemMessage = "You are Ticksy, a helpful booking assistant.",
    onSuggestion,
    onStage,
  } = options;
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const conversationHistoryRef = useRef<ChatMessage[]>([
    { role: "system", content: systemMessage },
  ]);

  const sendMessage = useCallback(
    async (
      message: string,
      onChunk?: (chunk: string) => void,
      onComplete?: (fullResponse: string) => void
    ) => {
      if (!message.trim()) return;

      setIsLoading(true);
      setError(null);

      // Cancel any ongoing request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new abort controller for this request
      const controller = new AbortController();
      abortControllerRef.current = controller;

      // Add user message to conversation history
      const userMessage: ChatMessage = { role: "user", content: message };
      conversationHistoryRef.current.push(userMessage);

      let fullResponse = "";
      let buffer = "";

      try {
        const response = await fetch(apiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ messages: conversationHistoryRef.current }),
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        if (!reader) {
          throw new Error("No response body");
        }

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
                const data: ChatResponse = JSON.parse(line);
                const chunk = data.message || "";
                fullResponse += chunk;
                onChunk?.(chunk);
                
                // Handle suggestions if present
                if (data.suggestion && data.suggestion.length > 0) {
                  console.log("Hook: Received suggestions from API:", data.suggestion);
                  onSuggestion?.(data.suggestion);
                }
                
                // Handle stage updates
                if (data.stage) {
                  onStage?.(data.stage);
                }
              } catch (e) {
                // Skip invalid JSON lines
                console.warn("Error parsing JSON line:", e, line);
              }
            }
          }
        }

        // Process any remaining buffer
        if (buffer.trim()) {
          try {
            const data: ChatResponse = JSON.parse(buffer);
            const chunk = data.message || "";
            fullResponse += chunk;
            onChunk?.(chunk);
            
            // Handle suggestions if present
            if (data.suggestion && data.suggestion.length > 0) {
              onSuggestion?.(data.suggestion);
            }
            
            // Handle stage updates
            if (data.stage) {
              onStage?.(data.stage);
            }
          } catch (e) {
            // Ignore parse errors for incomplete final line
          }
        }

        // Add assistant response to conversation history
        const assistantMessage: ChatMessage = { role: "assistant", content: fullResponse };
        conversationHistoryRef.current.push(assistantMessage);

        onComplete?.(fullResponse);
      } catch (err) {
        // Don't set error if request was aborted
        if (err instanceof Error && err.name === "AbortError") {
          return;
        }

        // Remove user message from history if request failed
        conversationHistoryRef.current.pop();

        // Provide more helpful error messages
        let errorMessage = "An error occurred";
        if (err instanceof TypeError && err.message === "Failed to fetch") {
          errorMessage = "Unable to connect to the AI server. Please try again later.";
        } else if (err instanceof Error) {
          errorMessage = err.message;
        }

        setError(errorMessage);
        onError?.(err instanceof Error ? err : new Error(errorMessage));
      } finally {
        setIsLoading(false);
        abortControllerRef.current = null;
      }
    },
    [apiUrl, onError, onSuggestion, onStage]
  );

  const clearHistory = useCallback(() => {
    conversationHistoryRef.current = [
      { role: "system", content: systemMessage },
    ];
  }, [systemMessage]);

  const getHistory = useCallback(() => {
    return [...conversationHistoryRef.current];
  }, []);

  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsLoading(false);
    }
  }, []);

  return {
    sendMessage,
    isLoading,
    error,
    cancel,
    clearHistory,
    getHistory,
  };
}

