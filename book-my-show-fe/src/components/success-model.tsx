"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { useSuccessModel } from "@/modules/booking/hooks/use-success-model";

const SuccessModel: React.FC = () => {
  const { isOpen, phase, onClose } = useSuccessModel();

  // auto-close after success
  React.useEffect(() => {
    if (phase !== "success") return;
    const t = setTimeout(() => onClose(), 1200);
    return () => clearTimeout(t);
  }, [phase, onClose]);

  const renderIcon = () => {
    if (phase === "loading") {
      return <Loader2 className="h-10 w-10 animate-spin" />;
    }
    if (phase === "success") {
      return <CheckCircle2 className="h-10 w-10 text-green-600" />;
    }
    return <XCircle className="h-10 w-10 text-red-600" />;
  };

  const { heading, body } = (() => {
    if (phase === "loading")
      return {
        heading: "Working on it…",
        body: "Please wait while we process your request.",
      };
    if (phase === "success")
      return {
        heading: "All set!",
        body: "Your request completed successfully.",
      };
    return { heading: "Something went wrong", body: "Please try again." };
  })();

  return (
    <Dialog open={isOpen} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader className="items-center text-center">
          <div className="mb-3 flex justify-center">{renderIcon()}</div>
          <DialogTitle className="text-xl">{heading}</DialogTitle>
          <DialogDescription>{body}</DialogDescription>
        </DialogHeader>

        <div className="mt-2 flex justify-center gap-2">
          {phase === "error" && <Button onClick={onClose}>Retry</Button>}

          {phase === "loading" && (
            <Button disabled className="cursor-wait">
              Processing…
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SuccessModel;
