"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowUpIcon, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

type PromptInputProps = {
  onSend?: (text: string) => Promise<void> | void;
  placeholder?: string;
  maxLength?: number; // optional soft limit for counter UI
  className?: string;
};

const SUGGESTIONS = [
  "Find action movies near me this evening",
  "What events are trending this weekend?",
];

const PromptInput = ({
  onSend,
  placeholder = "Chat with me to book the perfect movie & event tickets—smart suggestions and instant support…",
  maxLength = 500,
  className,
}: PromptInputProps) => {
  const [value, setValue] = useState("");
  const [isSending, setIsSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Auto-resize the textarea
  const autoResize = useCallback((el: HTMLTextAreaElement | null) => {
    if (!el) return;
    el.style.height = "0px";
    const next = Math.min(el.scrollHeight, 280); // cap max height for aesthetics
    el.style.height = next + "px";
  }, []);

  useEffect(() => {
    autoResize(textareaRef.current);
  }, [value, autoResize]);

  const canSend = useMemo(
    () => value.trim().length > 0 && !isSending,
    [value, isSending]
  );

  const handleSend = useCallback(async () => {
    if (!canSend) return;
    try {
      setIsSending(true);
      await onSend?.(value.trim());
      setValue("");
    } finally {
      setIsSending(false);
    }
  }, [canSend, onSend, value]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      // Enter to send; Shift+Enter for newline
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  const applySuggestion = (text: string) => {
    setValue((prev) => (prev ? `${prev}\n${text}` : text));
    // focus textarea after clicking chip
    requestAnimationFrame(() => textareaRef.current?.focus());
  };

  const count = value.length;
  const overLimit = maxLength ? count > maxLength : false;

  return (
    <div className={cn("w-full py-4", className)}>
      <div className="mx-auto max-w-3xl px-4">
        {/* Suggestion chips */}
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
            <Sparkles className="size-4" />
            Try:
          </span>
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => applySuggestion(s)}
              className="rounded-full bg-muted px-3 py-1 text-sm text-muted-foreground hover:bg-muted/80 transition-colors"
            >
              {s}
            </button>
          ))}
        </div>

        {/* Fancy container */}
        <div
          className={cn(
            "relative group",
            "rounded-2xl p-[1px]",
            "bg-gradient-to-tr from-primary/30 via-fuchsia-500/20 to-indigo-500/30"
          )}
        >
          <div
            className={cn(
              "relative rounded-2xl border bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/60",
              "border-border shadow-[0_8px_30px_rgb(0,0,0,0.08)]"
            )}
          >
            <Textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              aria-label="Chat prompt"
              aria-describedby="prompt-hint"
              className={cn(
                "w-full resize-none",
                "min-h-[120px] max-h-[280px]",
                "px-4 pb-14 pt-4 md:px-5", // bottom padding for the floating button
                "text-base leading-relaxed",
                "bg-transparent outline-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0",
                "placeholder:text-muted-foreground"
              )}
            />

            {/* Bottom bar: counter + hint + send */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between px-4 pb-3 md:px-5">
              {/* Counter + hint */}
              <div className="pointer-events-auto flex flex-col gap-1">
                {maxLength ? (
                  <span
                    className={cn(
                      "text-[11px]",
                      overLimit ? "text-destructive" : "text-muted-foreground"
                    )}
                  >
                    {count}/{maxLength}
                  </span>
                ) : null}
              </div>

              {/* Send button */}
              <div className="pointer-events-auto">
                <Button
                  type="button"
                  size="icon"
                  onClick={handleSend}
                  disabled={!canSend || overLimit}
                  className={cn(
                    "h-10 w-10 rounded-full shadow-lg transition-all",
                    "bg-primary text-primary-foreground",
                    "hover:scale-[1.03] active:scale-95",
                    "disabled:opacity-50 disabled:hover:scale-100"
                  )}
                >
                  <ArrowUpIcon
                    className={cn(
                      "size-4 transition-transform",
                      canSend && !overLimit && "group-hover:translate-y-[-1px]"
                    )}
                  />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Small helper text below */}
        <p className="mt-2 text-center text-xs text-muted-foreground">
          I’ll tailor picks to your mood, time, and location — just ask.
        </p>
      </div>
    </div>
  );
};

export default PromptInput;
