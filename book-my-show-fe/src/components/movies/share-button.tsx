"use client";

import { Button } from "@/components/ui/button";
import { Share2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCallback } from "react";

type ShareButtonProps = {
  url?: string; // optional; defaults to current page
  title?: string; // optional share title
  text?: string; // optional share text/description
  className?: string;
};

export function ShareButton({ url, title, text, className }: ShareButtonProps) {
  const handleShare = useCallback(async () => {
    const shareUrl =
      url ?? (typeof window !== "undefined" ? window.location.href : "");

    if (!shareUrl) return;

    // Preferred: native share sheet (mobile/compatible browsers)
    if (typeof navigator !== "undefined" && (navigator as any).share) {
      try {
        await (navigator as any).share({ title, text, url: shareUrl });
        return;
      } catch {
        // user canceled or not allowed — fall through to fallback
      }
    }

    // Fallback: open Twitter intent in a new tab
    const intent = `https://twitter.com/intent/tweet?url=${encodeURIComponent(
      shareUrl
    )}${title ? `&text=${encodeURIComponent(title)}` : ""}`;
    if (typeof window !== "undefined") {
      window.open(intent, "_blank", "noopener,noreferrer");
    }
  }, [url, title, text]);

  return (
    <Button
      variant="outline"
      size="lg"
      className={cn("bg-transparent text-white", className)}
      onClick={handleShare}
      aria-label="Share"
    >
      <Share2 className="w-5 h-5 mr-2" />
      Share
    </Button>
  );
}
