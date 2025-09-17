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
  return (
    <div className={className}>
      <p className="text-base font-semibold mb-3">Movie Details</p>
      <div className="flex gap-3">
        <div className="w-16 h-24 overflow-hidden rounded-md shrink-0 bg-muted">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <Image
            src={movieImage}
            alt={movieName}
            className="h-full w-full object-cover"
            height={96}
            width={64}
            unoptimized
          />
        </div>
        <div className="space-y-1">
          <div className="font-semibold leading-snug">{movieName}</div>
          <p className="text-xs text-muted-foreground line-clamp-3">
            {movieDescription.slice(0, 100)}
          </p>
          <div className="flex flex-wrap gap-x-3 gap-y-1 pt-1 text-xs items-center">
            <span className="rounded-md border px-1.5 py-0.5">
              {movieRating} / 10
            </span>
            <span className="text-muted-foreground flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              {movieDuration} min
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
