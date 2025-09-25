"use client";

import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const categories = ["all"] as const;
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
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Sports</h1>

        {/* Search and Filters */}
        <div className="flex gap-4 justify-between py-2">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => handleCategoryFilter(category)}
                className={`px-4 py-0 rounded-full h-8 text-xs transition-colors ${
                  categoryFilter === category
                    ? "bg-primary text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {category === "all" ? "All" : category}
              </button>
            ))}
          </div>

          <div className="relative w-[400px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search sports..."
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

export default EventHeader;
