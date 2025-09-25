"use client";

import * as React from "react";
import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils"; // if you don't have this, replace cn(...) with className joins
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import {
  Copy,
  RefreshCw,
  CheckCheck,
  XCircle,
  Bot,
  User2,
  Clock,
} from "lucide-react";

export type ChatRole = "user" | "assistant";

export type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  createdAt?: string | Date;
  status?: "sending" | "sent" | "failed";
};

// Utility: format time nicely
function formatTime(date?: string | Date) {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  try {
    return new Intl.DateTimeFormat(undefined, {
      hour: "2-digit",
      minute: "2-digit",
    }).format(d);
  } catch {
    return "";
  }
}

// Optional: linkify plain URLs
const linkify = (text: string) =>
  text.replace(
    /(https?:\/\/[^\s]+)|(www\.[^\s]+\.[^\s]+)/gi,
    (match) =>
      `[${match}](${match.startsWith("http") ? match : `https://${match}`})`
  );

// Code block with copy
function CodeBlock({ children }: { children: React.ReactNode }) {
  const codeRef = React.useRef<HTMLElement>(null);
  const [copied, setCopied] = React.useState(false);
  const onCopy = async () => {
    const text = codeRef.current?.innerText || "";
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {}
  };
  return (
    <div className="group relative">
      <pre className="overflow-x-auto rounded-xl border bg-background/50 p-3 text-xs">
        <code ref={codeRef} className="whitespace-pre-wrap">
          {children}
        </code>
      </pre>
      <Button
        size="icon"
        variant="ghost"
        onClick={onCopy}
        className="absolute right-2 top-2 h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100"
        aria-label="Copy code"
      >
        {copied ? (
          <CheckCheck className="h-4 w-4" />
        ) : (
          <Copy className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}

// Bubble component
function MessageBubble({ m, isMine }: { m: ChatMessage; isMine: boolean }) {
  const statusIcon =
    m.status === "failed" ? (
      <XCircle className="h-3.5 w-3.5 text-destructive" />
    ) : m.status === "sending" ? (
      <Clock className="h-3.5 w-3.5 text-muted-foreground" />
    ) : (
      <CheckCheck className="h-3.5 w-3.5 text-muted-foreground" />
    );

  const content = linkify(m.content);

  return (
    <div
      className={cn(
        "flex w-full gap-2",
        isMine ? "flex-row-reverse" : "flex-row"
      )}
    >
      <Avatar className="h-8 w-8 shrink-0">
        <AvatarFallback>
          {isMine ? <User2 className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
        </AvatarFallback>
      </Avatar>
      <div className={cn("max-w-[78%] space-y-1")}>
        <div
          className={cn(
            "rounded-2xl px-4 py-2 text-sm leading-relaxed shadow-sm",
            isMine
              ? "bg-primary text-primary-foreground rounded-br-md"
              : "bg-muted text-foreground rounded-bl-md"
          )}
        >
          <ReactMarkdown
            components={{
              code({
                inline,
                children,
              }: {
                inline?: boolean;
                children?: React.ReactNode;
              }) {
                if (inline) {
                  return (
                    <code className="rounded bg-background/60 px-1 py-0.5 text-[0.85em]">
                      {children}
                    </code>
                  );
                }
                return <CodeBlock>{children}</CodeBlock>;
              },
              a({ href, children }) {
                return (
                  <a
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    className="underline underline-offset-2 hover:opacity-80"
                  >
                    {children}
                  </a>
                );
              },
              ul(props) {
                return <ul className="list-disc pl-5" {...props} />;
              },
              ol(props) {
                return <ol className="list-decimal pl-5" {...props} />;
              },
              blockquote(props) {
                return (
                  <blockquote
                    className="border-l-2 border-border/60 pl-3 italic text-muted-foreground"
                    {...props}
                  />
                );
              },
            }}
          >
            {content}
          </ReactMarkdown>
        </div>
        <div
          className={cn(
            "flex items-center gap-2 text-[10px] text-muted-foreground",
            isMine ? "justify-end pr-1" : "justify-start pl-1"
          )}
        >
          {m.createdAt && <span>{formatTime(m.createdAt)}</span>}
          {isMine && m.status && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span
                    aria-label={m.status}
                    className="inline-flex items-center"
                  >
                    {statusIcon}
                  </span>
                </TooltipTrigger>
                <TooltipContent>{m.status}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </div>
    </div>
  );
}

// Day separator
function DayDivider({ label }: { label: string }) {
  return (
    <div className="sticky top-0 z-10 my-2 flex items-center gap-2">
      <div className="h-px flex-1 bg-border" />
      <span className="select-none rounded-full bg-muted px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <div className="h-px flex-1 bg-border" />
    </div>
  );
}

// Typing indicator (animated dots)
export function TypingDots({ visible }: { visible?: boolean }) {
  if (!visible) return null;
  return (
    <div className="flex items-center gap-2 pl-10">
      <div className="rounded-2xl bg-muted px-4 py-2 text-sm shadow-sm">
        <span className="inline-flex items-center gap-1">
          <span className="inline-block h-1 w-1 animate-bounce rounded-full [animation-delay:-0.2s] bg-foreground/80" />
          <span className="inline-block h-1 w-1 animate-bounce rounded-full [animation-delay:-0.05s] bg-foreground/80" />
          <span className="inline-block h-1 w-1 animate-bounce rounded-full bg-foreground/80" />
        </span>
      </div>
    </div>
  );
}

// Hook: auto-scroll to bottom on new messages
function useAutoscroll(dep: unknown) {
  const ref = React.useRef<HTMLDivElement | null>(null);
  React.useEffect(() => {
    ref.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [dep]);
  return ref;
}

// Group messages by day for nicer separators
function groupByDay(messages: ChatMessage[]) {
  const groups: { label: string; items: ChatMessage[] }[] = [];
  const fmt = new Intl.DateTimeFormat(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  let currentLabel: string | null = null;
  let bucket: ChatMessage[] = [];
  for (const m of messages) {
    const label = m.createdAt ? fmt.format(new Date(m.createdAt)) : "";
    if (label !== currentLabel) {
      if (bucket.length)
        groups.push({ label: currentLabel || "", items: bucket });
      currentLabel = label;
      bucket = [m];
    } else {
      bucket.push(m);
    }
  }
  if (bucket.length) groups.push({ label: currentLabel || "", items: bucket });
  return groups;
}

export type ChatMessageListProps = {
  messages: ChatMessage[];
  isAssistantTyping?: boolean;
  onRetry?: (id: string) => void;
  className?: string;
};

export function ChatMessageList({
  messages,
  isAssistantTyping,
  onRetry,
  className,
}: ChatMessageListProps) {
  const bottomRef = useAutoscroll(
    messages.length + (isAssistantTyping ? 1 : 0)
  );
  const groups = React.useMemo(() => groupByDay(messages), [messages]);

  return (
    <div
      className={cn(
        "flex-1 overflow-y-auto px-3 py-4 sm:px-4 sm:py-6",
        "[scrollbar-width:thin] [scrollbar-color:var(--border)transparent]",
        className
      )}
      role="log"
      aria-live="polite"
    >
      <div className="mx-auto max-w-3xl space-y-4">
        {groups.map((g, gi) => (
          <React.Fragment key={gi}>
            {g.label && <DayDivider label={g.label} />}
            <div className="space-y-3">
              {g.items.map((m) => {
                const isMine = m.role === "user";
                return (
                  <div key={m.id} className="group/message">
                    <MessageBubble m={m} isMine={isMine} />
                    {m.status === "failed" && (
                      <div
                        className={cn(
                          "mt-1 flex gap-2 text-xs",
                          isMine ? "justify-end pr-10" : "justify-start pl-10"
                        )}
                      >
                        <span className="text-destructive">Failed to send</span>
                        {onRetry && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 px-2"
                            onClick={() => onRetry(m.id)}
                          >
                            <RefreshCw className="mr-1 h-3.5 w-3.5" /> Retry
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </React.Fragment>
        ))}

        <TypingDots visible={isAssistantTyping} />
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
