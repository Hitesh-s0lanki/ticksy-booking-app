// components/VenueCard.tsx
"use client";
import { useMemo } from "react";

export type VenueData = {
  venueName: string;
  venueLocation: string;
  venueMapUrl: string; // e.g. https://maps.google.com/?q=PVR+Juhu+Dynamix+Mall+Mumbai
};

type Props = { data: VenueData };

export default function VenueCard({ data }: Props) {
  // Convert a "maps.google.com/?q=" link into an embeddable src
  const embedSrc = useMemo(() => {
    try {
      // Prefer q= param; fallback to full URL-encoded
      const url = new URL(data.venueMapUrl);
      const q =
        url.searchParams.get("q") ?? (data.venueName || data.venueLocation);
      return `https://www.google.com/maps?q=${encodeURIComponent(
        q
      )}&output=embed`;
    } catch {
      // If it's not a valid URL, treat it as a query
      const q = data.venueMapUrl || data.venueName || data.venueLocation;
      return `https://www.google.com/maps?q=${encodeURIComponent(
        q
      )}&output=embed`;
    }
  }, [data.venueMapUrl, data.venueName, data.venueLocation]);

  const directLink = useMemo(() => {
    // Ensure we always have a clickable link to open in Maps
    const q = data.venueName || data.venueLocation;
    return data.venueMapUrl?.startsWith("http")
      ? data.venueMapUrl
      : `https://www.google.com/maps?q=${encodeURIComponent(q)}`;
  }, [data]);

  const copyText = `${data.venueName}\n${data.venueLocation}\n${directLink}`;

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(copyText);
      alert("Venue details copied!");
    } catch {
      alert("Could not copy. Please try manually.");
    }
  };

  return (
    <div className="">
      {/* Header */}
      <p className="text-base font-semibold mb-3">Venue Details</p>
      <div className="flex flex-col gap-1">
        <h3 className="text-sm font-semibold tracking-tight">
          {data.venueName}
        </h3>
        <p className="text-xs  text-gray-600">{data.venueLocation}</p>
      </div>

      {/* Map */}
      <div className="aspect-video w-full mt-5">
        <iframe
          title={`${data.venueName} map`}
          src={embedSrc}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="h-full w-full border-0"
          allowFullScreen
        />
      </div>
    </div>
  );
}
