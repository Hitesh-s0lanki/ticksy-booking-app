"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import ChatBody from "./chat-body";
import { ChatInput } from "./chat-input";
import { ChatEmpty } from "./chat-empty";
import { useStreamingChat, type ApiSuggestion } from "@/modules/ai/hooks/use-streaming-chat";
import { useAiSheet } from "@/modules/ai/hooks/use-ai-sheet";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export type ChatRole = "user" | "assistant";

export type Suggestion = {
  source_id: string;
  image: string;
  showtime: string[];
  name: string;
  description: string;
  source: "movie" | "event" | "sports";
  medium: "internal" | "external";
  external_url: string | null;
};

export type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  suggestions?: Suggestion[];
};

// Map API suggestion to component Suggestion format
function mapApiSuggestionToSuggestion(apiSuggestion: ApiSuggestion): Suggestion {
  // Extract showtime from time field or metadata
  const showtime = apiSuggestion.time 
    ? [apiSuggestion.time] 
    : (Array.isArray(apiSuggestion.metadata?.showtime) 
        ? apiSuggestion.metadata.showtime 
        : apiSuggestion.metadata?.showtime 
          ? [apiSuggestion.metadata.showtime] 
          : []);
  
  // Determine source type - handle venue type as well
  const source: "movie" | "event" | "sports" = 
    apiSuggestion.type === "movie" ? "movie" :
    apiSuggestion.type === "event" ? "event" : "sports";
  
  // Determine medium (internal if we have an id, external otherwise)
  const medium: "internal" | "external" = (apiSuggestion.id || apiSuggestion.venue_id) ? "internal" : "external";
  
  const mapped: Suggestion = {
    source_id: apiSuggestion.id || apiSuggestion.venue_id || "",
    image: apiSuggestion.image_url || "",
    showtime,
    name: apiSuggestion.title || "",
    description: apiSuggestion.description || "",
    source,
    medium,
    external_url: apiSuggestion.metadata?.external_url || null,
  };
  
  return mapped;
}

const Chat: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const { firstChat, clearFirstChat, isOpen } = useAiSheet();
  const hasTriggeredFirstChat = useRef(false);
  const previousIsOpenRef = useRef(isOpen);

  const assistantMessageIdRef = useRef<string | null>(null);
  const currentSuggestionsRef = useRef<Suggestion[]>([]);

  const { sendMessage, isLoading, error } = useStreamingChat({
    onError: (err) => {
      console.error("Streaming chat error:", err);
    },
    onSuggestion: (apiSuggestions: ApiSuggestion[]) => {
      // Map API suggestions to component format
      const suggestions = apiSuggestions.map(mapApiSuggestionToSuggestion);
      
      // Filter out invalid suggestions (must have at least name/title)
      const validSuggestions = suggestions.filter(s => s.name && s.name.trim() !== "");
      
      if (validSuggestions.length === 0) {
        console.log("No valid suggestions to display");
        return;
      }
      
      console.log("Received suggestions:", validSuggestions);
      currentSuggestionsRef.current = validSuggestions;
      
      // Update the assistant message with suggestions
      if (assistantMessageIdRef.current) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessageIdRef.current
              ? { ...msg, suggestions: validSuggestions }
              : msg
          )
        );
      }
    },
    onStage: (stage) => {
      // Handle stage updates if needed
      console.log("Conversation stage:", stage);
    },
  });

  const handleSend = useCallback(
    async (text: string) => {
      if (!text.trim()) return;

      // Reset suggestions for new message
      currentSuggestionsRef.current = [];

      // Add user message
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: "user", content: text },
      ]);

      // Create assistant message placeholder for streaming
      const assistantId = crypto.randomUUID();
      assistantMessageIdRef.current = assistantId;
      setMessages((prev) => [
        ...prev,
        { id: assistantId, role: "assistant", content: "", suggestions: [] },
      ]);

      // Stream the response
      await sendMessage(
        text,
        (chunk) => {
          // Update the assistant message with each chunk
          // Preserve existing suggestions or use the latest from ref
          setMessages((prev) =>
            prev.map((msg) => {
              if (msg.id === assistantId) {
                // Use suggestions from ref if available, otherwise keep existing ones
                const suggestions = currentSuggestionsRef.current.length > 0 
                  ? currentSuggestionsRef.current 
                  : (msg.suggestions || []);
                
                return { 
                  ...msg, 
                  content: msg.content + chunk,
                  suggestions,
                };
              }
              return msg;
            })
          );
        },
        (fullResponse) => {
          // Response is complete - ensure suggestions are included
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantId
                ? { 
                    ...msg, 
                    // Final update with all suggestions
                    suggestions: currentSuggestionsRef.current,
                  }
                : msg
            )
          );
          assistantMessageIdRef.current = null;
        }
      );
    },
    [sendMessage]
  );

  // Hook these to your router, modal, or state machine:
  const handleBook = (s: Suggestion) => {
    // e.g., router.push(`/book/${s.source}/${s.source_id}`)
    alert(`Book Now → ${s.source} • ${s.name} (${s.source_id})`);
  };

  const handleVisit = (s: Suggestion) => {
    if (s.external_url) window.open(s.external_url, "_blank", "noopener");
  };

  const handleSuggestionClick = (text: string) => {
    handleSend(text);
  };

  // Reset state when sheet closes
  useEffect(() => {
    const wasOpen = previousIsOpenRef.current;
    previousIsOpenRef.current = isOpen;

    if (wasOpen && !isOpen) {
      // Sheet just closed - reset everything
      hasTriggeredFirstChat.current = false;
      setMessages([]);
    }
  }, [isOpen]);

  // Auto-trigger API when sheet opens with firstChat
  useEffect(() => {
    // Only trigger if sheet is open, firstChat exists, and hasn't been triggered for this firstChat value
    if (isOpen && firstChat && firstChat.trim()) {
      // Use firstChat as the key to track if we've sent this specific message
      const currentFirstChat = firstChat.trim();
      
      // Check if we've already processed this firstChat
      if (!hasTriggeredFirstChat.current) {
        hasTriggeredFirstChat.current = true;
        // Small delay to ensure sheet is fully open and component is ready
        const timer = setTimeout(() => {
          handleSend(currentFirstChat);
          // Clear firstChat after triggering (without closing the sheet)
          clearFirstChat();
        }, 300);
        return () => clearTimeout(timer);
      }
    } else if (!firstChat || !firstChat.trim()) {
      // Reset when firstChat is cleared, so a new firstChat can trigger
      hasTriggeredFirstChat.current = false;
    }
  }, [isOpen, firstChat, handleSend, clearFirstChat]);

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-background to-muted/20">
      {/* Error Alert */}
      {error && (
        <div className="px-4 pt-4">
          <Alert
            variant="destructive"
            className="border-destructive/50 bg-destructive/10"
          >
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-sm">{error}</AlertDescription>
          </Alert>
        </div>
      )}

      {/* Chat Content */}
      <div className="flex-1 min-h-0 flex flex-col">
        {messages.length === 0 ? (
          <ChatEmpty onSuggestionClick={handleSuggestionClick} />
        ) : (
          <ChatBody
            messages={messages}
            onBook={handleBook}
            onVisit={handleVisit}
            isLoading={isLoading}
            streamingMessageId={assistantMessageIdRef.current}
          />
        )}
      </div>

      {/* Input */}
      <ChatInput onSend={handleSend} disabled={isLoading} />
    </div>
  );
};

export default Chat;
