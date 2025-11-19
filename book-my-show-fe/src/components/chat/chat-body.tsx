"use client";

import React from "react";
import type { ChatMessage, Suggestion } from "./chat";
import {
  ChatMessageList,
  type ChatMessage as ChatMessageListMessage,
} from "./chat-message-list";
import { ChatSeatSelection } from "./chat-seat-selection";

type Props = {
  messages: ChatMessage[];
  onBook?: (suggestion: Suggestion) => void;
  onVisit?: (suggestion: Suggestion) => void;
  isLoading?: boolean;
  streamingMessageId?: string | null;
};

const ChatBody: React.FC<Props> = ({
  messages,
  onBook,
  onVisit,
  isLoading,
  streamingMessageId,
}) => {
  // Convert ChatMessage to ChatMessageList format
  const formattedMessages: ChatMessageListMessage[] = React.useMemo(() => {
    return messages.map((msg, index) => {
      const formatted = {
        id: msg.id,
        role: msg.role,
        content: msg.content,
        createdAt: new Date(Date.now() - (messages.length - index) * 1000), // Stagger timestamps for demo
        status: msg.role === "user" ? ("sent" as const) : undefined,
        suggestions: msg.suggestions,
      };
      
      // Debug log for suggestions
      if (msg.suggestions && msg.suggestions.length > 0) {
        console.log("ChatBody: Message has suggestions:", msg.id, msg.suggestions);
      }
      
      return formatted;
    });
  }, [messages]);

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">
      {/* Demo Seat Selection - Test UI (Hidden for now) */}
      {false && (
        <div className="px-2 sm:px-3 py-2 bg-muted/20">
          <div className="mx-auto max-w-5xl">
            <div className="mb-2 px-1">
              <h3 className="text-xs font-semibold text-muted-foreground">
                Demo Seat Selection UI (Testing)
              </h3>
            </div>
            <div className="px-1">
              <ChatSeatSelection />
            </div>
          </div>
        </div>
      )}

      {/* Chat Messages */}
      {messages.length === 0 ? (
        <ChatMessageList
          messages={formattedMessages}
          isAssistantTyping={isLoading && !streamingMessageId}
          onBook={onBook}
          onVisit={onVisit}
          className="flex-1"
          streamingMessageId={streamingMessageId}
        />
      ) : (
        <div className="px-2 sm:px-4 py-4">
          <ChatMessageList
            messages={formattedMessages}
            isAssistantTyping={isLoading && !streamingMessageId}
            onBook={onBook}
            onVisit={onVisit}
            className="flex-1"
            streamingMessageId={streamingMessageId}
          />
        </div>
      )}
    </div>
  );
};

export default ChatBody;
