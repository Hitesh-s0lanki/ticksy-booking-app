"use client";

export function ChatEmpty() {
  return (
    <div className="flex-1 grid place-items-center text-center p-6 text-muted-foreground">
      <div>
        <p className="font-medium text-foreground">Start a conversation</p>
        <p className="text-sm mt-1">
          Ask anything… I’ll keep replies concise and helpful.
        </p>
      </div>
    </div>
  );
}
