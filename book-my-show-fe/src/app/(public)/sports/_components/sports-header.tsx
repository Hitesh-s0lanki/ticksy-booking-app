"use client";

import { useState } from "react";

type Props = {};

const categories = [
  "all",
  "Football",
  "Basketball",
  "Cricket",
  "Tennis",
  "Swimming",
  "Boxing",
];

const SportsHeader = ({}: Props) => {
  const [selectedCategory, setSelectedCategory] = useState("all");

  const handleCategoryFilter = (category: string) => {
    setSelectedCategory(category);
  };

  return (
    <div className="bg-white">
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Events</h1>

        {/* Search and Filters */}
        <div className="flex gap-4 justify-between">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => handleCategoryFilter(category)}
                className={`px-4 py-1 rounded-2xl text-sm transition-colors ${
                  selectedCategory === category
                    ? "bg-primary text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {category === "all" ? "All" : category}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SportsHeader;
