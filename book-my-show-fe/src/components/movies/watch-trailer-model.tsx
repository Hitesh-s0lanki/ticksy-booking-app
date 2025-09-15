import React, { useMemo } from "react";
import dynamic from "next/dynamic";
import type { YouTubeProps } from "react-youtube";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useWatchTrailerModel } from "@/modules/movies/hooks/use-watch-trailer-model";
import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";

// Load react-youtube only on client to avoid SSR/hydration issues
const YouTube = dynamic(() => import("react-youtube"), { ssr: false });

// Robustly extract a YouTube video ID from multiple URL formats.
function extractYouTubeId(url?: string | null): string | null {
  if (!url) return null;

  try {
    // Handle plain IDs passed accidentally
    if (/^[a-zA-Z0-9_-]{11}$/.test(url)) return url;

    const u = new URL(url);
    // youtu.be/<id>
    if (u.hostname === "youtu.be") {
      return u.pathname.replace("/", "") || null;
    }
    // youtube.com/watch?v=<id>
    if (u.searchParams.has("v")) {
      return u.searchParams.get("v");
    }
    // youtube.com/embed/<id> or /v/<id>
    const parts = u.pathname.split("/").filter(Boolean);
    const embedIndex = parts.findIndex((p) => p === "embed" || p === "v");
    if (embedIndex >= 0 && parts[embedIndex + 1]) {
      return parts[embedIndex + 1];
    }
  } catch {
    // not a URL; ignore
  }
  return null;
}

const WatchTrailerModel: React.FC = () => {
  const { isOpen, onClose, movieId } = useWatchTrailerModel();
  const trpc = useTRPC();

  // Use TRPC query options but guard with enabled to avoid firing without movieId
  const queryOptions = trpc.movies.getById.queryOptions({ movieId: movieId! });
  const { data, isLoading, isError } = useQuery({
    ...queryOptions,
    enabled: !!movieId,
  });

  const videoId = useMemo(
    () => extractYouTubeId(data?.posterKey),
    [data?.posterKey]
  );

  const opts: YouTubeProps["opts"] = {
    // We render inside a responsive container; let the iframe fill it
    width: "100%",
    height: "100%",
    playerVars: {
      autoplay: 1, // auto-play when dialog opens
      // You can uncomment the next line if you want to hide related videos at end:
      // rel: 0,
      // modestbranding: 1,
    },
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle className="line-clamp-2">
            {data?.title ?? "Trailer"}
          </DialogTitle>
          {data?.description ? (
            <DialogDescription className="line-clamp-3">
              {data.description}
            </DialogDescription>
          ) : null}
        </DialogHeader>

        {/* Body */}
        <div className="grid gap-4">
          {/* Loading state */}
          {isLoading && (
            <div className="w-full aspect-video rounded-xl bg-muted/50 animate-pulse" />
          )}

          {/* Error / empty states */}
          {!isLoading && isError && (
            <div className="text-sm text-destructive">
              Failed to load trailer. Please try again.
            </div>
          )}

          {!isLoading && !isError && !videoId && (
            <div className="text-sm text-muted-foreground">
              No trailer found for this movie.
              {data?.posterKey ? (
                <>
                  {" "}
                  <a
                    href={data.posterKey}
                    target="_blank"
                    rel="noreferrer"
                    className="underline"
                  >
                    Open on YouTube
                  </a>
                  .
                </>
              ) : null}
            </div>
          )}

          {/* Player */}
          {!isLoading && !isError && videoId && (
            <div className="relative w-full aspect-video overflow-hidden rounded-xl">
              {/* react-youtube will fill the container */}
              <YouTube
                className="h-full w-full absolute inset-0"
                videoId={videoId}
                opts={opts}
                onReady={(e) => {
                  // If you’d rather not autoplay, you can pause here:
                  // e.target.pauseVideo();
                }}
              />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WatchTrailerModel;
