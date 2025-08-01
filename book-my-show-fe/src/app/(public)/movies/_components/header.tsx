"use client";

import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useState } from "react";

type Props = {};

const genres = [
  "all",
  "Action",
  "Adventure",
  "Drama",
  "Crime",
  "Sci-Fi",
  "Thriller",
];

const Header = ({}: Props) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [genreFilter, setGenreFilter] = useState("all");

  const handleGenreFilter = (genre: string) => {
    setGenreFilter(genre);
  };

  return (
    <div className="bg-white">
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Movies</h1>

        {/* Search and Filters */}
        <div className="flex gap-4 justify-between">
          <div className="flex flex-wrap gap-2">
            {genres.map((genre) => (
              <button
                key={genre}
                onClick={() => handleGenreFilter(genre)}
                className={`px-4 py-0 rounded-2xl text-xs transition-colors ${
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
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search movies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
