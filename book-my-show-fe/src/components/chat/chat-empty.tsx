"use client";

import * as React from "react";
import { Sparkles, Film, Music, Trophy, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

const suggestions = [
  {
    icon: Film,
    text: "What movies are playing tonight?",
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
  },
  {
    icon: Music,
    text: "Show me upcoming events",
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
  },
  {
    icon: Trophy,
    text: "Any sports events this weekend?",
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
  },
];

export function ChatEmpty({ onSuggestionClick }: { onSuggestionClick?: (text: string) => void }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
      {/* Animated icon */}
      <div className="relative mb-6">
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/20 via-purple-500/20 to-blue-500/20 blur-2xl animate-pulse" />
        <div className="relative rounded-full bg-gradient-to-br from-primary/10 to-purple-500/10 p-6 border border-primary/20">
          <MessageSquare className="h-12 w-12 text-primary" />
        </div>
        <div className="absolute -top-1 -right-1">
          <Sparkles className="h-5 w-5 text-primary animate-pulse" />
        </div>
      </div>

      {/* Title */}
      <h3 className="text-lg font-semibold text-foreground mb-2">
        Start a conversation
      </h3>
      <p className="text-sm text-muted-foreground max-w-sm mb-8 leading-relaxed">
        Ask me about movies, events, sports, or anything else. I'm here to help you find the perfect entertainment!
      </p>

      {/* Suggestions */}
      <div className="w-full max-w-md space-y-2">
        <p className="text-xs font-medium text-muted-foreground/70 uppercase tracking-wider mb-3">
          Try asking:
        </p>
        {suggestions.map((suggestion, idx) => {
          const Icon = suggestion.icon;
          return (
            <button
              key={idx}
              onClick={() => onSuggestionClick?.(suggestion.text)}
              className={cn(
                "w-full flex items-center gap-3 rounded-xl border border-border/50 bg-card/50 p-3 text-left transition-all duration-200 hover:border-border hover:bg-card hover:shadow-sm hover:scale-[1.02] active:scale-[0.98]",
                suggestion.bgColor
              )}
            >
              <div className={cn(
                "rounded-lg p-2",
                suggestion.bgColor
              )}>
                <Icon className={cn("h-4 w-4", suggestion.color)} />
              </div>
              <span className="text-sm text-foreground font-medium flex-1">
                {suggestion.text}
              </span>
            </button>
          );
        })}
      </div>

      {/* Footer hint */}
      <p className="mt-8 text-xs text-muted-foreground/60">
        💡 Tip: Be specific for better results
      </p>
    </div>
  );
}
