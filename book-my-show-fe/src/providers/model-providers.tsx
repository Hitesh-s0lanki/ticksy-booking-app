"use client";

import WatchTrailerModel from "@/components/movies/watch-trailer-model";
import { useEffect, useState } from "react";

const ModelProviders = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <>
      <WatchTrailerModel />
    </>
  );
};

export default ModelProviders;
