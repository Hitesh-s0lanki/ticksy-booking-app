"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { ArrowUpIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  onSend: (text: string) => void;
  disabled?: boolean;
};

export function ChatInput({ onSend, disabled }: Props) {
  const [value, setValue] = React.useState("");

  const send = () => {
    const text = value.trim();
    if (!text) return;
    onSend(text);
    setValue("");
  };

  return (
    <div className="border-t p-2 flex items-center gap-2">
      <input
        className="flex-1 px-3 py-2 rounded-md border bg-background focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        placeholder="Type a message…"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            send();
          }
        }}
        disabled={disabled}
      />
      <Button size="sm" onClick={send} disabled={disabled || !value.trim()}>
        <ArrowUpIcon className={cn("size-4 transition-transform")} />
      </Button>
    </div>
  );
}
