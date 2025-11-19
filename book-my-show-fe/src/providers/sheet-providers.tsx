"use client";

import ChatSheet from "@/components/chat/chat-sheet";
import { useEffect, useState } from "react";

const SheetProviders = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <>
      <ChatSheet />
    </>
  );
};

export default SheetProviders;
