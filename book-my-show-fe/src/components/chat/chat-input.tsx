"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { ArrowUpIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  onSend: (text: string) => void;
  disabled?: boolean;
};

export function ChatInput({ onSend, disabled }: Props) {
  const [value, setValue] = React.useState("");
  const inputRef = React.useRef<HTMLTextAreaElement>(null);

  const send = () => {
    const text = value.trim();
    if (!text || disabled) return;
    onSend(text);
    setValue("");
    // Reset textarea height
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  // Auto-resize textarea
  React.useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 100)}px`;
    }
  }, [value]);

  const hasValue = value.trim().length > 0;
  const canSend = hasValue && !disabled;

  return (
    <div className="border-t border-border bg-background">
      <div className="p-2 sm:p-3">
        <div className="flex items-end gap-2 rounded-lg border border-border bg-background px-2 sm:px-3 py-1.5 sm:py-2 shadow-sm transition-shadow focus-within:border-primary/50 focus-within:shadow-md">
          {/* Textarea */}
          <textarea
            ref={inputRef}
            className="flex-1 resize-none border-0 bg-transparent px-0 py-1 sm:py-1.5 text-xs sm:text-sm leading-relaxed text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-0 disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="Type your message..."
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            rows={1}
            style={{ minHeight: "20px", maxHeight: "100px" }}
          />

          {/* Send button */}
          <Button
            size="sm"
            onClick={send}
            disabled={!canSend}
            className={cn(
              "h-6 w-6 sm:h-7 sm:w-7 shrink-0 rounded-md p-0 transition-all",
              canSend
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "bg-muted text-muted-foreground cursor-not-allowed opacity-50"
            )}
            aria-label="Send message"
          >
            {disabled ? (
              <Loader2 className="h-3 w-3 sm:h-3.5 sm:w-3.5 animate-spin" />
            ) : (
              <ArrowUpIcon className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
