"use client";

import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const categories = [
  "all",
  "ART",
  "TECHNOLOGY",
  "DANCE",
  "SEMINAR",
  "WORKSHOP",
] as const;
type Category = (typeof categories)[number];

const EventHeader = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [searchTerm, setSearchTerm] = useState<string>(
    searchParams.get("title") ?? ""
  );
  const [categoryFilter, setCategoryFilter] = useState<Category>(
    (searchParams.get("categoryType") as Category) ?? "all"
  );

  useEffect(() => {
    setSearchTerm(searchParams.get("title") ?? "");
    setCategoryFilter((searchParams.get("categoryType") as Category) ?? "all");
  }, [searchParams]);

  const handleCategoryFilter = (category: Category) => {
    setCategoryFilter(category);

    const params = new URLSearchParams(searchParams.toString());
    if (category && category !== "all") {
      params.set("categoryType", category);
    } else {
      params.delete("categoryType");
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
    <div className="">
      <div className="container mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-3 sm:mb-4">Events</h1>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-between py-2">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => handleCategoryFilter(category)}
                className={`px-3 sm:px-4 py-0 rounded-full h-7 sm:h-8 text-[10px] sm:text-xs transition-colors ${
                  categoryFilter === category
                    ? "bg-primary text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {category === "all" ? "All" : category}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-[300px] md:w-[400px]">
            <Search className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
            <Input
              type="text"
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-8 sm:pl-10 text-sm sm:text-base"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventHeader;
