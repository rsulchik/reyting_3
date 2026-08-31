import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { AwardFile } from "@/lib/point-awards";

type Props = {
  file: AwardFile | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function AwardFilePreviewDialog({ file, open, onOpenChange }: Props) {
  const isImage = file?.type.startsWith("image/");
  const isPdf = file?.type === "application/pdf";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-hidden rounded-2xl p-0 sm:rounded-2xl">
        {file && (
          <>
            <DialogHeader className="border-b border-border px-6 py-4">
              <DialogTitle className="pr-6 text-left">{file.name}</DialogTitle>
              <DialogDescription className="text-left">
                {Math.round(file.size / 1024)} KB
              </DialogDescription>
            </DialogHeader>

            <div className="h-[75vh] bg-secondary/30 p-4">
              {isImage ? (
                <img
                  src={file.dataUrl}
                  alt={file.name}
                  className="h-full w-full rounded-xl object-contain"
                />
              ) : isPdf ? (
                <iframe title={file.name} src={file.dataUrl} className="h-full w-full rounded-xl bg-white" />
              ) : (
                <div className="grid h-full place-items-center rounded-xl bg-card text-sm text-muted-foreground ring-1 ring-black/5">
                  Bu faýly öňünden görmek mümkin däl.
                </div>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
