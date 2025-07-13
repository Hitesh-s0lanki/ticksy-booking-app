"use client";

import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useState } from "react";

type Props = {};

const SearchBar = ({}: Props) => {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <section className="py-5 bg-white">
      <div className=" px-4">
        <div className="relative max-w-2xl mx-auto">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            type="text"
            placeholder="Search for Movies, Events, Sports..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 py-3 text-lg"
          />
        </div>
      </div>
    </section>
  );
};

export default SearchBar;
