import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { WorkDetailDialog } from "@/components/work-detail-dialog";
import type { Student } from "@/lib/mock-data";
import { formatWhen, totalPoints, type PointAward } from "@/lib/point-awards";

type StudentWithPoints = Student & { points?: number };

type Props = {
  student: StudentWithPoints | null;
  awards: PointAward[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const statusLabel = {
  approved: "Tassyklandy",
  pending: "Garaşýar",
  rejected: "Ret edildi",
} as const;

export function StudentWorksDialog({ student, awards, open, onOpenChange }: Props) {
  const [selectedWork, setSelectedWork] = useState<PointAward | null>(null);

  const works = student
    ? awards
        .filter((a) => a.studentId === student.id)
        .sort((a, b) => b.createdAt - a.createdAt)
    : [];

  const points = student ? (student.points ?? totalPoints(awards, student.id)) : 0;

  return (
    <>
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) setSelectedWork(null);
        onOpenChange(next);
      }}
    >
      <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto rounded-2xl sm:rounded-2xl">
        {student && (
          <>
            <DialogHeader>
              <div className="flex items-center gap-4 pr-6">
                {student.photo ? (
                  <img
                    src={student.photo}
                    alt={student.fullName}
                    className="size-16 shrink-0 rounded-xl object-cover ring-1 ring-black/10"
                  />
                ) : (
                  <div className="grid size-16 shrink-0 place-items-center rounded-xl bg-brand-soft text-lg font-semibold text-brand ring-1 ring-black/10">
                    {student.initials}
                  </div>
                )}
                <div className="min-w-0 space-y-1 text-left">
                  <DialogTitle className="truncate">{student.fullName}</DialogTitle>
                  <DialogDescription>
                    {student.faculty} • {student.group} • {student.course}-nji ýyl
                  </DialogDescription>
                  <div className="text-sm font-semibold text-brand">{points} ball</div>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold">Edilen işler</h3>
              {works.length === 0 ? (
                <div className="rounded-xl bg-secondary/60 px-4 py-6 text-center text-sm text-muted-foreground">
                  Bu talyp üçin entek iş ýok.
                </div>
              ) : (
                works.map((work) => (
                  <button
                    key={work.id}
                    type="button"
                    onClick={() => setSelectedWork(work)}
                    className="w-full space-y-2 rounded-xl bg-secondary/40 p-4 text-left ring-1 ring-black/5 transition hover:bg-secondary/70 hover:ring-brand/20"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="text-sm font-semibold">{work.action}</div>
                        <div className="text-xs text-muted-foreground">{work.criterion}</div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={
                            "rounded-full px-2.5 py-1 text-xs font-semibold ring-1 " +
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
                            "rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide " +
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
                    </div>
                    {work.note && <p className="text-sm text-muted-foreground">{work.note}</p>}
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                      <span>{work.fromName}</span>
                      <span>{formatWhen(work.createdAt)}</span>
                    </div>
                    {work.files && work.files.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-1">
                        {work.files.map((f) => (
                          <span
                            key={f.name}
                            className="rounded-full bg-card px-3 py-1 text-xs font-medium text-brand ring-1 ring-brand/20"
                          >
                            {f.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </button>
                ))
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>

    <WorkDetailDialog
      work={selectedWork}
      open={selectedWork !== null}
      onOpenChange={(next) => {
        if (!next) setSelectedWork(null);
      }}
    />
    </>
  );
}
