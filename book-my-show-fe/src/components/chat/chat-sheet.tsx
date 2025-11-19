"use client";

import * as React from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useAiSheet } from "@/modules/ai/hooks/use-ai-sheet";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import Chat from "./chat";

export default function ChatSheet() {
  const { isOpen, onClose } = useAiSheet();

  // Note: Chat component now handles its own state and streaming
  // This component is mainly a wrapper for the Sheet UI

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="right"
        className="w-full sm:w-full md:min-w-[50%] lg:min-w-[60%] xl:min-w-[50%] p-0 flex flex-col rounded-l-2xl"
      >
        <SheetHeader className="px-4 pt-4 pb-3 border-b border-border/50">
          <div className="flex items-center gap-2">
            <div className="relative">
              <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-primary/20 via-purple-500/20 to-blue-500/20 blur-sm" />
              <div className="relative rounded-lg bg-gradient-to-br from-primary/10 to-purple-500/10 p-1.5 border border-primary/20">
                <Sparkles className="h-4 w-4 text-primary" />
              </div>
            </div>
            <div className="flex-1">
              <SheetTitle className="text-base font-semibold flex items-center gap-2">
                <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                  Ticksy AI
                </span>
              </SheetTitle>
              <SheetDescription className="text-xs text-muted-foreground mt-0.5">
                Your intelligent assistant for movies, events & more
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        {/* Conversation Area */}
        <div className="flex-1 min-h-0 flex flex-col">
          <Chat />
        </div>

        {/* Note: Chat component handles its own input via ChatBody */}
      </SheetContent>
    </Sheet>
  );
}
