import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { StudentWorksDialog } from "@/components/student-works-dialog";
import { useScopedStudents } from "@/lib/students-store";
import { useFaculties } from "@/lib/taxonomy";
import { useSession } from "@/lib/auth";
import { usePointAwards, totalPoints } from "@/lib/point-awards";
import type { Student } from "@/lib/mock-data";

export const Route = createFileRoute("/reyting")({
  head: () => ({
    meta: [
      { title: "Reýting — StudRate" },
      { name: "description", content: "Talyplaryň umumy, fakultet we topar boýunça reýtingi." },
      { property: "og:title", content: "Reýting — StudRate" },
      { property: "og:description", content: "Talyplaryň umumy, fakultet we topar boýunça reýtingi." },
    ],
  }),
  component: Reyting,
});

function Reyting() {
  const [scope, setScope] = useState<"all" | string>("all");
  const [q, setQ] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<(Student & { points: number }) | null>(null);
  const { all } = useScopedStudents();
  const { isAdmin } = useSession();
  const [allFaculties] = useFaculties();
  const faculties = allFaculties;
  const [awards] = usePointAwards();
  const list = all
    .filter(
      (s) =>
        (scope === "all" || s.faculty === scope) &&
        (q === "" ||
          s.fullName.toLowerCase().includes(q.toLowerCase()) ||
          s.group.toLowerCase().includes(q.toLowerCase())),
    )
    .map((s) => ({ ...s, points: totalPoints(awards, s.id) }))
    .sort((a, b) => b.points - a.points);

  return (
    <main className="mx-auto max-w-7xl space-y-10 px-6 py-12">
      <header className="space-y-4">
        <h1 className="text-4xl font-semibold">Reýting tagtasy</h1>
        <p className="max-w-[60ch] text-muted-foreground">
          Talyplaryň toplan ballarynyň jemi boýunça umumy ýerleşişi (temmi çäreler aýrylan).
        </p>
      </header>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setScope("all")}
            className={
              "rounded-full px-4 py-1.5 text-xs font-semibold ring-1 transition " +
              (scope === "all"
                ? "bg-brand text-white ring-brand"
                : "bg-card text-ink ring-black/10 hover:ring-brand/30")
            }
          >
            Ähli fakultet
          </button>
          {faculties.map((f) => (
            <button
              key={f}
              onClick={() => setScope(f)}
              className={
                "rounded-full px-4 py-1.5 text-xs font-semibold ring-1 transition " +
                (scope === f
                  ? "bg-brand text-white ring-brand"
                  : "bg-card text-ink ring-black/10 hover:ring-brand/30")
              }
            >
              {f}
            </button>
          ))}
        </div>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Talyp ýa-da topar gözle..."
          className="w-64 rounded-full bg-card px-4 py-2 text-sm ring-1 ring-black/10 outline-none focus:ring-brand"
        />
      </div>

      <div className="overflow-hidden rounded-3xl ring-1 ring-black/5">
        <table className="w-full bg-card">
          <thead>
            <tr className="text-left text-[10px] uppercase tracking-widest text-muted-foreground">
              <th className="px-6 py-4">#</th>
              <th className="px-2 py-4">Talyp</th>
              <th className="hidden px-4 py-4 md:table-cell">Fakultet</th>
              <th className="hidden px-4 py-4 sm:table-cell">Topar</th>
              <th className="hidden px-4 py-4 md:table-cell">Kurs</th>
              <th className="px-6 py-4 text-right">Ballar</th>
            </tr>
          </thead>
          <tbody>
            {list.map((s, i) => (
              <tr
                key={s.id}
                onClick={() => setSelectedStudent(s)}
                className="cursor-pointer border-t border-border transition hover:bg-secondary/40"
              >
                <td className="px-6 py-4 font-display text-sm text-muted-foreground">
                  {String(i + 1).padStart(2, "0")}
                </td>
                <td className="px-2 py-4">
                  <div className="flex items-center gap-3">
                    {s.photo ? (
                      <img
                        src={s.photo}
                        alt={s.fullName}
                        className="size-9 shrink-0 rounded-lg object-cover ring-1 ring-black/10"
                      />
                    ) : (
                      <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-brand-soft text-xs font-semibold text-brand">
                        {s.initials}
                      </div>
                    )}
                    <span className="text-sm font-semibold">{s.fullName}</span>
                  </div>
                </td>
                <td className="hidden px-4 py-4 text-sm text-muted-foreground md:table-cell">
                  {s.faculty}
                </td>
                <td className="hidden px-4 py-4 text-sm text-muted-foreground sm:table-cell">
                  {s.group}
                </td>
                <td className="hidden px-4 py-4 text-sm text-muted-foreground md:table-cell">
                  {s.course}-nji ýyl
                </td>
                <td
                  className={
                    "px-6 py-4 text-right text-sm font-semibold " +
                    (s.points < 0 ? "text-destructive" : "text-brand")
                  }
                >
                  {s.points}
                </td>
              </tr>
            ))}
            {list.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-sm text-muted-foreground">
                  Hiç hili talyp tapylmady.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <StudentWorksDialog
        student={selectedStudent}
        awards={awards}
        open={selectedStudent !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedStudent(null);
        }}
      />
    </main>
  );
}