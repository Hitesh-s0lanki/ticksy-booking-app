"use client";

import React from "react";
import Image from "next/image";
import { Clock } from "lucide-react";

type MovieDetailsProps = {
  movieName: string;
  movieDescription: string;
  movieImage: string;
  movieDuration: string;
  movieRating: string;
  className?: string;
};

export const MovieDetails: React.FC<MovieDetailsProps> = ({
  movieName,
  movieDescription,
  movieImage,
  movieDuration,
  movieRating,
  className,
}) => {
  // Use logo as fallback if image is not available
  const imageSrc = movieImage && movieImage.trim() !== "" 
    ? movieImage 
    : "/logo.png";

  return (
    <div className={className}>
      <p className="text-sm sm:text-base font-semibold mb-2 sm:mb-3">Movie Details</p>
      <div className="flex gap-2 sm:gap-3">
        <div className="w-14 h-20 sm:w-16 sm:h-24 overflow-hidden rounded-md shrink-0 bg-muted">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <Image
            src={imageSrc}
            alt={movieName}
            className="h-full w-full object-cover"
            height={96}
            width={64}
            unoptimized
            onError={(e) => {
              // Fallback to logo if image fails to load
              const target = e.target as HTMLImageElement;
              if (target.src !== "/logo.png") {
                target.src = "/logo.png";
              }
            }}
          />
        </div>
        <div className="space-y-1 min-w-0 flex-1">
          <div className="font-semibold leading-snug text-sm sm:text-base">{movieName}</div>
          <p className="text-xs text-muted-foreground line-clamp-2 sm:line-clamp-3">
            {movieDescription.slice(0, 100)}
          </p>
          <div className="flex flex-wrap gap-x-2 sm:gap-x-3 gap-y-1 pt-1 text-[10px] sm:text-xs items-center">
            <span className="rounded-md border px-1 sm:px-1.5 py-0.5">
              {movieRating} / 10
            </span>
            <span className="text-muted-foreground flex items-center">
              <Clock className="h-3 w-3 sm:h-4 sm:w-4 mr-1 flex-shrink-0" />
              {movieDuration} min
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
