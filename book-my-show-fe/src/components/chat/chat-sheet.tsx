"use client";

import * as React from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ChatMessage, ChatMessageList } from "./chat-message-list";
import { ChatEmpty } from "./chat-empty";
import { ChatInput } from "./chat-input";

export default function ChatSheet() {
  const [open, setOpen] = React.useState(false);
  const [messages, setMessages] = React.useState<ChatMessage[]>([
    {
      id: "m1",
      role: "user",
      content: "do androids truly dream of electric sheep or not?",
    },
    {
      id: "m2",
      role: "assistant",
      content:
        "Great question! It’s the central theme of Philip K. Dick’s novel. In short: it explores empathy and what it means to be human.",
    },
  ]);
  const [loading, setLoading] = React.useState(false);

  const handleSend = async (text: string) => {
    const id = crypto.randomUUID();
    setMessages((prev) => [...prev, { id, role: "user", content: text }]);

    // Simulated assistant reply (replace with your API call)
    setLoading(true);
    await new Promise((r) => setTimeout(r, 700));
    setMessages((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        role: "assistant",
        content:
          "If androids do dream, then we must rethink the boundary between simulation and sentience.",
      },
    ]);
    setLoading(false);
  };

  return (
    <Sheet open={true} onOpenChange={setOpen}>
      <SheetContent side="right" className="min-w-2xl p-0 flex flex-col">
        <SheetHeader className="px-4 pt-4 pb-2">
          <SheetTitle>Chat</SheetTitle>
          <SheetDescription>
            Ask your question—get instant help.
          </SheetDescription>
        </SheetHeader>

        {/* Conversation Area */}
        <div className="flex-1 min-h-0 flex flex-col">
          {messages.length === 0 ? (
            <ChatEmpty />
          ) : (
            <ChatMessageList messages={messages} />
          )}
        </div>

        {/* Composer */}
        <ChatInput onSend={handleSend} disabled={loading} />
      </SheetContent>
    </Sheet>
  );
}
