"use client";

import * as React from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  PreviewType,
  usePreviewDialog,
} from "@/modules/booking/hooks/use-preview-dialog";

function detectType(url?: string): Exclude<PreviewType, "auto"> | null {
  if (!url) return null;
  const clean = url.split("?")[0].split("#")[0].toLowerCase();
  if (clean.endsWith(".pdf") || url.startsWith("data:application/pdf"))
    return "pdf";
  if (clean.match(/\.(png|jpe?g|webp|gif)$/) || url.startsWith("data:image/"))
    return "image";
  if (url.includes("contentType=application/pdf")) return "pdf";
  return "image";
}
const isSignedOrDataUrl = (u?: string) =>
  !!u &&
  (u.startsWith("data:") ||
    /X-Amz-Signature|GoogleAccessId|Signature=/.test(u));

const PreviewDialog: React.FC = () => {
  const { isOpen, url, title, type, onClose } = usePreviewDialog();
  const resolvedType = React.useMemo(
    () => (type === "auto" ? detectType(url) : (type as "image" | "pdf")),
    [type, url]
  );

  const [zoom, setZoom] = React.useState(1);
  React.useEffect(() => setZoom(1), [url]);

  return (
    <Dialog open={isOpen} onOpenChange={(o) => !o && onClose()}>
      {/* ⬇️ max width = 2xl */}
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader className="space-y-2">
          <DialogTitle>
            {title ??
              (resolvedType === "pdf" ? "Preview PDF" : "Preview Image")}
          </DialogTitle>
          <DialogDescription className="sr-only">
            Preview of the selected file. Use toolbar buttons to open, download,
            or copy the link.
          </DialogDescription>
        </DialogHeader>

        {/* ⬇️ fixed preview height = 400px */}
        <div className="mt-2 rounded-lg border bg-muted/20 p-2">
          {!url ? (
            <div className="flex h-[400px] items-center justify-center text-muted-foreground">
              No file to preview
            </div>
          ) : resolvedType === "pdf" ? (
            <div className="relative h-[400px] w-full overflow-hidden rounded-md">
              <iframe
                title={title ?? "PDF preview"}
                src={`${url}#view=FitH&toolbar=1`}
                className="h-full w-full rounded-md"
              />
              <div className="pointer-events-none absolute bottom-2 right-2 rounded bg-background/80 px-2 py-1 text-xs text-muted-foreground">
                If the PDF is blank, click “Open” (embedding may be blocked).
              </div>
            </div>
          ) : (
            <div className="flex h-[400px] w-full items-center justify-center overflow-auto rounded-md">
              <div className="relative h-full w-full">
                <div
                  className="absolute inset-0 flex items-center justify-center"
                  style={{
                    transform: `scale(${zoom})`,
                    transformOrigin: "center center",
                  }}
                >
                  <Image
                    src={url}
                    alt={title ?? "Preview image"}
                    fill
                    sizes="(max-width: 768px) 100vw, 672px" // 2xl ~ 42rem = 672px
                    className="select-none object-contain"
                    draggable={false}
                    unoptimized={isSignedOrDataUrl(url)}
                    quality={90}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PreviewDialog;
