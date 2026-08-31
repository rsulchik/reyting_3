import type { ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatDateTime, type PointAward } from "@/lib/point-awards";

const statusLabel = {
  approved: "Tassyklandy",
  pending: "Garaşýar",
  rejected: "Ret edildi",
} as const;

type Props = {
  work: PointAward | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function DetailRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="space-y-1">
      <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="text-sm">{value}</div>
    </div>
  );
}

export function WorkDetailDialog({ work, open, onOpenChange }: Props) {
  if (!work) return null;

  const approvedAt = work.approvedAt ?? (work.status === "approved" ? work.createdAt : undefined);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-lg overflow-y-auto rounded-2xl sm:rounded-2xl">
        <DialogHeader>
          <DialogTitle className="pr-6 text-left">{work.action}</DialogTitle>
          <DialogDescription className="text-left">{work.criterion}</DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={
                "rounded-full px-3 py-1 text-sm font-semibold ring-1 " +
                (work.points < 0
                  ? "bg-secondary text-destructive ring-destructive/20"
                  : "bg-brand-soft text-brand ring-brand/20")
              }
            >
              {work.points > 0 ? "+" : ""}
              {work.points} ball
            </span>
            <span
              className={
                "rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide " +
                (work.status === "approved"
                  ? "bg-brand-soft text-brand"
                  : work.status === "pending"
                    ? "bg-secondary text-muted-foreground"
                    : "bg-secondary text-destructive")
              }
            >
              {statusLabel[work.status]}
            </span>
          </div>

          <div className="grid gap-4 rounded-xl bg-secondary/40 p-4 ring-1 ring-black/5 sm:grid-cols-2">
            <DetailRow label="Talyp" value={work.studentName} />
            <DetailRow label="Iberen" value={work.fromName} />
            <DetailRow label="Ugradylan wagty" value={formatDateTime(work.createdAt)} />
            <DetailRow
              label="Moderasiýa tassyklanan wagty"
              value={
                work.status === "approved" && approvedAt ? (
                  formatDateTime(approvedAt)
                ) : work.status === "pending" ? (
                  <span className="text-muted-foreground">Heniz tassyklanmady</span>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )
              }
            />
          </div>

          {work.note ? (
            <div className="space-y-2">
              <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                Düşündiriş
              </div>
              <p className="rounded-xl bg-secondary/40 p-4 text-sm text-muted-foreground ring-1 ring-black/5">
                {work.note}
              </p>
            </div>
          ) : null}

          {work.files && work.files.length > 0 ? (
            <div className="space-y-2">
              <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                Subutnama faýllary
              </div>
              <div className="flex flex-wrap gap-2">
                {work.files.map((f) => (
                  <a
                    key={f.name}
                    href={f.dataUrl}
                    download={f.name}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-full bg-card px-3 py-1.5 text-xs font-medium text-brand ring-1 ring-brand/20 transition hover:ring-brand/40"
                  >
                    {f.name}
                  </a>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
