"use client";

import PreviewDialog from "@/components/preview-dialog";
import SuccessModel from "@/components/success-model";
import { useEffect, useState } from "react";

const ModelProviders = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <>
      <SuccessModel />
      <PreviewDialog />
    </>
  );
};

export default ModelProviders;
