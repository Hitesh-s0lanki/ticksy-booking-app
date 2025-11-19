"use client";

import * as React from "react";
import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";
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
  Calendar,
  ExternalLink,
  Film,
  Music,
  Trophy,
  Loader2,
} from "lucide-react";

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
  createdAt?: string | Date;
  status?: "sending" | "sent" | "failed";
  suggestions?: Suggestion[];
};

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
    <div className="group relative my-2">
      <pre className="overflow-x-auto overflow-y-auto max-h-64 rounded-xl border bg-background/50 p-3 text-sm break-words">
        <code
          ref={codeRef}
          className="whitespace-pre-wrap break-words overflow-wrap-anywhere"
        >
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

// Source icon mapping
const sourceIcons = {
  movie: Film,
  event: Music,
  sports: Trophy,
};

// Source badge styles
const sourceBadgeStyles: Record<"movie" | "event" | "sports", string> = {
  movie:
    "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800",
  event:
    "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800",
  sports:
    "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
};

// Suggestion list item component
function SuggestionListItem({
  suggestion,
  onBook,
  onVisit,
}: {
  suggestion: Suggestion;
  onBook?: (s: Suggestion) => void;
  onVisit?: (s: Suggestion) => void;
}) {
  const SourceIcon = sourceIcons[suggestion.source];

  return (
    <div className="group relative flex gap-3 rounded-lg border border-border/50 bg-card/50 p-3 transition-all hover:border-border hover:bg-card hover:shadow-sm">
      {/* Image */}
      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={suggestion.image}
          alt={suggestion.name}
          className="h-full w-full object-cover transition-transform group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1 space-y-1.5">
        {/* Title and Badge */}
        <div className="flex items-start justify-between gap-2">
          <h4 className="line-clamp-1 text-sm font-semibold leading-tight text-foreground">
            {suggestion.name}
          </h4>
          <span
            className={cn(
              "inline-flex shrink-0 items-center gap-1 rounded-full border px-1.5 py-0.5 text-xs font-medium",
              sourceBadgeStyles[suggestion.source]
            )}
          >
            <SourceIcon className="h-3 w-3" />
            {suggestion.source}
          </span>
        </div>

        {/* Description */}
        <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
          {suggestion.description}
        </p>

        {/* Showtimes */}
        {suggestion.showtime?.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {suggestion.showtime.slice(0, 3).map((time, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 rounded-md bg-muted/50 px-1.5 py-0.5 text-xs text-muted-foreground"
              >
                <Clock className="h-3 w-3" />
                {time}
              </span>
            ))}
            {suggestion.showtime.length > 3 && (
              <span className="text-xs text-muted-foreground">
                +{suggestion.showtime.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          {suggestion.external_url && (
            <Button
              size="sm"
              variant="outline"
              className="h-7 px-2 text-sm"
              onClick={() => onVisit?.(suggestion)}
            >
              <ExternalLink className="mr-1 h-3.5 w-3.5" />
              Visit
            </Button>
          )}
          <Button
            size="sm"
            className="h-7 px-2 text-sm"
            onClick={() => onBook?.(suggestion)}
          >
            <Calendar className="mr-1 h-3.5 w-3.5" />
            Book
          </Button>
        </div>
      </div>
    </div>
  );
}

// Suggestions list component
function SuggestionsList({
  suggestions,
  onBook,
  onVisit,
}: {
  suggestions: Suggestion[];
  onBook?: (s: Suggestion) => void;
  onVisit?: (s: Suggestion) => void;
}) {
  if (!suggestions?.length) return null;

  return (
    <div className="mt-3 space-y-2 rounded-lg border border-border/50 bg-muted/20 p-3">
      <div className="space-y-2">
        {suggestions.map((suggestion) => (
          <SuggestionListItem
            key={`${suggestion.source}-${suggestion.source_id}`}
            suggestion={suggestion}
            onBook={onBook}
            onVisit={onVisit}
          />
        ))}
      </div>
    </div>
  );
}

// Bubble component
function MessageBubble({
  m,
  isMine,
  onBook,
  onVisit,
  isStreaming,
}: {
  m: ChatMessage;
  isMine: boolean;
  onBook?: (s: Suggestion) => void;
  onVisit?: (s: Suggestion) => void;
  isStreaming?: boolean;
}) {
  const statusIcon =
    m.status === "failed" ? (
      <XCircle className="h-3 w-3 text-destructive" />
    ) : m.status === "sending" ? (
      <Clock className="h-3 w-3 text-muted-foreground" />
    ) : (
      <CheckCheck className="h-3 w-3 text-muted-foreground" />
    );

  const content = linkify(m.content);

  return (
    <div
      className={cn(
        "flex w-full gap-3",
        isMine ? "flex-row-reverse" : "flex-row"
      )}
    >
      <Avatar className="h-9 w-9 shrink-0 border-2 border-background shadow-sm">
        <AvatarFallback
          className={cn(
            isMine
              ? "bg-primary text-primary-foreground"
              : "bg-gradient-to-br from-blue-500 to-purple-600 text-white"
          )}
        >
          {isMine ? <User2 className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
        </AvatarFallback>
      </Avatar>
      <div
        className={cn(
          "flex max-w-[80%] min-w-0 flex-col gap-1",
          isMine && "items-end"
        )}
      >
        <div
          className={cn(
            "relative rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm transition-all min-h-[40px] w-full",
            isMine
              ? "bg-primary text-primary-foreground rounded-br-md"
              : "bg-muted/80 backdrop-blur-sm text-foreground rounded-bl-md",
            isStreaming && !m.content
              ? "flex items-center"
              : "break-words overflow-wrap-anywhere word-break-break-word"
          )}
          style={{ wordWrap: "break-word", overflowWrap: "anywhere" }}
        >
          {isStreaming && !m.content ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              <span className="text-sm">AI is thinking...</span>
            </div>
          ) : m.content ? (
            <div className="prose prose-sm max-w-none dark:prose-invert break-words overflow-wrap-anywhere">
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
                        <code
                          className={cn(
                            "rounded px-1 py-0.5 text-[0.85em] break-words",
                            isMine
                              ? "bg-primary-foreground/20 text-primary-foreground"
                              : "bg-background/60 text-foreground"
                          )}
                        >
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
                        className={cn(
                          "underline underline-offset-2 transition-opacity hover:opacity-80 break-all",
                          isMine ? "text-primary-foreground/90" : "text-primary"
                        )}
                      >
                        {children}
                      </a>
                    );
                  },
                  ul(props) {
                    return (
                      <ul
                        className="list-disc space-y-1 pl-4 break-words"
                        {...props}
                      />
                    );
                  },
                  ol(props) {
                    return (
                      <ol
                        className="list-decimal space-y-1 pl-4 break-words"
                        {...props}
                      />
                    );
                  },
                  li(props) {
                    return <li className="break-words" {...props} />;
                  },
                  blockquote(props) {
                    return (
                      <blockquote
                        className={cn(
                          "border-l-2 pl-3 italic break-words my-2",
                          isMine
                            ? "border-primary-foreground/30 text-primary-foreground/90"
                            : "border-border/60 text-muted-foreground"
                        )}
                        {...props}
                      />
                    );
                  },
                  p(props) {
                    return (
                      <p
                        className="mb-1 last:mb-0 break-words overflow-wrap-anywhere"
                        {...props}
                      />
                    );
                  },
                  h1(props) {
                    return (
                      <h1
                        className="text-sm font-semibold mb-1 break-words"
                        {...props}
                      />
                    );
                  },
                  h2(props) {
                    return (
                      <h2
                        className="text-sm font-semibold mb-1 break-words"
                        {...props}
                      />
                    );
                  },
                  h3(props) {
                    return (
                      <h3
                        className="text-sm font-medium mb-1 break-words"
                        {...props}
                      />
                    );
                  },
                  strong(props) {
                    return (
                      <strong
                        className="font-semibold break-words"
                        {...props}
                      />
                    );
                  },
                  em(props) {
                    return <em className="italic break-words" {...props} />;
                  },
                }}
              >
                {content}
              </ReactMarkdown>
            </div>
          ) : null}
        </div>

        {/* Suggestions */}
        {!isMine && m.suggestions && m.suggestions.length > 0 && (
          <SuggestionsList
            suggestions={m.suggestions}
            onBook={onBook}
            onVisit={onVisit}
          />
        )}

        {/* Status only (no timestamp) */}
        {isMine && m.status && (
          <div
            className={cn(
              "flex items-center gap-1.5 text-sm text-muted-foreground",
              "justify-end"
            )}
          >
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span
                    aria-label={m.status}
                    className="inline-flex items-center transition-opacity hover:opacity-70"
                  >
                    {statusIcon}
                  </span>
                </TooltipTrigger>
                <TooltipContent className="text-sm">{m.status}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )}
      </div>
    </div>
  );
}

// Typing indicator (spinner loader)
export function TypingDots({ visible }: { visible?: boolean }) {
  if (!visible) return null;
  return (
    <div className="flex items-center gap-3 pl-12">
      <Avatar className="h-9 w-9 shrink-0 border-2 border-background shadow-sm">
        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
          <Bot className="h-4 w-4" />
        </AvatarFallback>
      </Avatar>
      <div className="rounded-2xl rounded-bl-md bg-muted/80 backdrop-blur-sm px-4 py-3 shadow-sm min-h-[40px] flex items-center">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm">AI is thinking...</span>
        </div>
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

export type ChatMessageListProps = {
  messages: ChatMessage[];
  isAssistantTyping?: boolean;
  onRetry?: (id: string) => void;
  onBook?: (suggestion: Suggestion) => void;
  onVisit?: (suggestion: Suggestion) => void;
  className?: string;
  streamingMessageId?: string | null;
};

export function ChatMessageList({
  messages,
  isAssistantTyping,
  onRetry,
  onBook,
  onVisit,
  className,
  streamingMessageId,
}: ChatMessageListProps) {
  const bottomRef = useAutoscroll(
    messages.length + (isAssistantTyping ? 1 : 0)
  );

  return (
    <div
      className={cn(
        "flex-1 overflow-y-auto overflow-x-hidden px-4 py-6 sm:px-6",
        "[scrollbar-width:thin] [scrollbar-color:var(--border)transparent]",
        className
      )}
      role="log"
      aria-live="polite"
    >
      <div className="mx-auto max-w-4xl space-y-4 break-words">
        {messages.map((m) => {
          const isMine = m.role === "user";
          const isStreaming =
            !isMine &&
            streamingMessageId === m.id &&
            (!m.content || m.content.trim() === "");
          return (
            <div key={m.id} className="group/message">
              <MessageBubble
                m={m}
                isMine={isMine}
                onBook={onBook}
                onVisit={onVisit}
                isStreaming={isStreaming}
              />
              {m.status === "failed" && (
                <div
                  className={cn(
                    "mt-2 flex items-center gap-2 text-sm",
                    isMine ? "justify-end pr-12" : "justify-start pl-12"
                  )}
                >
                  <span className="text-destructive">Failed to send</span>
                  {onRetry && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 px-2.5 text-sm"
                      onClick={() => onRetry(m.id)}
                    >
                      <RefreshCw className="mr-1.5 h-3.5 w-3.5" /> Retry
                    </Button>
                  )}
                </div>
              )}
            </div>
          );
        })}

        <TypingDots visible={isAssistantTyping} />
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
