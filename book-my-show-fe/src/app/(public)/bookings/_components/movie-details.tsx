"use client";

import React, { useMemo } from "react";
import type { MovieInfo } from "@/types/booking.types";

type MovieDetailsProps = {
  movie: MovieInfo;
  className?: string;
};

export const MovieDetails: React.FC<MovieDetailsProps> = ({
  movie,
  className,
}) => {
  const prettyDate = useMemo(() => {
    if (!movie.releaseDate) return undefined;
    const d = new Date(movie.releaseDate);
    if (Number.isNaN(d.getTime())) return movie.releaseDate;
    return d.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }, [movie.releaseDate]);

  return (
    <div className={className}>
      <p className="text-base font-semibold mb-3">Movie Details</p>
      <div className="flex gap-3">
        <div className="w-16 h-24 overflow-hidden rounded-md shrink-0 bg-muted">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={movie.posterUrl}
            alt={movie.title}
            className="h-full w-full object-cover"
          />
        </div>
        <div className="space-y-1">
          <div className="font-semibold leading-snug">{movie.title}</div>
          {movie.description ? (
            <p className="text-xs text-muted-foreground line-clamp-3">
              {movie.description}
            </p>
          ) : null}
          <div className="flex flex-wrap gap-x-3 gap-y-1 pt-1 text-xs">
            {movie.rating && (
              <span className="rounded-md border px-1.5 py-0.5">
                {movie.rating}
              </span>
            )}
            {typeof movie.durationMinutes === "number" && (
              <span className="text-muted-foreground">
                {movie.durationMinutes} min
              </span>
            )}
            {movie.releaseDate && (
              <span className="text-muted-foreground">
                Release: {prettyDate}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
