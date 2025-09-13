"use client";

import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const genres = [
  "all",
  "action",
  "adventure",
  "animation",
  "biography",
  "drama",
  "crime",
] as const;
type Genre = (typeof genres)[number];

const Header = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [searchTerm, setSearchTerm] = useState<string>(
    searchParams.get("title") ?? ""
  );
  const [genreFilter, setGenreFilter] = useState<Genre>(
    (searchParams.get("genre") as Genre) ?? "all"
  );

  // Keep local state in sync if URL params change elsewhere
  useEffect(() => {
    setSearchTerm(searchParams.get("title") ?? "");
    setGenreFilter((searchParams.get("genre") as Genre) ?? "all");
  }, [searchParams]);

  const handleGenreFilter = (genre: Genre) => {
    setGenreFilter(genre);

    const params = new URLSearchParams(searchParams.toString());
    if (genre && genre !== "all") {
      params.set("genre", genre);
    } else {
      params.delete("genre");
    }

    router.push(`?${params.toString()}`, { scroll: false });
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);

    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set("title", value);
    } else {
      params.delete("title");
    }

    router.push(`?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="bg-white">
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Movies</h1>

        {/* Search and Filters */}
        <div className="flex gap-4 justify-between py-2">
          <div className="flex flex-wrap gap-2">
            {genres.map((genre) => (
              <button
                key={genre}
                onClick={() => handleGenreFilter(genre)}
                className={`px-4 py-0 rounded-full h-8 text-xs transition-colors ${
                  genreFilter === genre
                    ? "bg-primary text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {genre === "all" ? "All" : genre}
              </button>
            ))}
          </div>

          <div className="relative w-[400px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search movies..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
