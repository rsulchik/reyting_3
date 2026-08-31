import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { StudentWorksDialog } from "@/components/student-works-dialog";
import { groupsForFaculty, useGroups, useScopedStudents } from "@/lib/students-store";
import { useFaculties } from "@/lib/taxonomy";
import { useSession } from "@/lib/auth";
import { usePointAwards, totalPoints } from "@/lib/point-awards";
import type { Student } from "@/lib/mock-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "StudRate — Bilim jemgyýetinde öz ornuňyzy anyklaň" },
      {
        name: "description",
        content:
          "Talypdaşlaryňyzyň başarnyklaryna baha beriň we öz professional ösüşiňize gözegçilik ediň.",
      },
      { property: "og:title", content: "StudRate" },
      { property: "og:description", content: "Talyplaryň öz-özüni bahalandyryş platformasy." },
    ],
  }),
  component: Index,
});

const select =
  "rounded-full bg-card px-4 py-2 text-sm ring-1 ring-black/10 outline-none focus:ring-brand";

function Index() {
  const { all } = useScopedStudents();
  const [awards] = usePointAwards();
  const [allFaculties] = useFaculties();
  const [groups] = useGroups();
  const { isAdmin } = useSession();
  const faculties = allFaculties;

  const [faculty, setFaculty] = useState("");
  const [group, setGroup] = useState("");
  const [course, setCourse] = useState<number | "">("");
  const [selectedStudent, setSelectedStudent] = useState<(Student & { points: number }) | null>(null);

  const activeFaculty = faculty && faculties.includes(faculty) ? faculty : (faculties[0] ?? "");

  const availableGroups = useMemo(() => {
    const fromRegistry = groupsForFaculty(groups, activeFaculty).map((g) => g.name);
    const fromStudents = all.filter((s) => s.faculty === activeFaculty).map((s) => s.group);
    return [...new Set([...fromRegistry, ...fromStudents])].sort();
  }, [groups, activeFaculty, all]);

  const activeGroup = group && availableGroups.includes(group) ? group : (availableGroups[0] ?? "");

  const availableCourses = useMemo(
    () =>
      [
        ...new Set(
          all
            .filter((s) => s.faculty === activeFaculty && s.group === activeGroup)
            .map((s) => s.course),
        ),
      ].sort((a, b) => a - b),
    [all, activeFaculty, activeGroup],
  );

  const activeCourse =
    course !== "" && availableCourses.includes(course) ? course : (availableCourses[0] ?? null);

  const ranked = all
    .filter(
      (s) =>
        s.faculty === activeFaculty &&
        s.group === activeGroup &&
        activeCourse !== null &&
        s.course === activeCourse,
    )
    .map((s) => ({ ...s, points: totalPoints(awards, s.id) }))
    .sort((a, b) => b.points - a.points);

  return (
    <main className="mx-auto max-w-7xl space-y-20 px-6 py-12">
      <section className="grid items-end gap-12 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-7">
          <h1 className="max-w-[24ch] text-balance text-4xl font-semibold leading-tight lg:text-5xl">
            Bilim jemgyýetinde öz ornuňyzy anyklaň
          </h1>
          <p className="max-w-[48ch] text-pretty text-lg text-ink/70">
            Talypdaşlaryňyzyň başarnyklaryna halal baha beriň, üstünlik nyşanlary toplaň we
            toparyňyzyň reýtinginde öňe geçiň.
          </p>
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link
              to="/reyting"
              className="rounded-full bg-brand px-5 py-2.5 text-sm font-medium text-white ring-1 ring-brand transition hover:brightness-110"
            >
              Reýtingi gör
            </Link>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 lg:col-span-5">
          <div className="space-y-1 rounded-2xl bg-card p-6 ring-1 ring-black/5">
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Fakultet sany
            </span>
            <div className="font-display text-3xl font-medium">4</div>
          </div>
          <div className="space-y-1 rounded-2xl bg-brand p-6 text-white ring-1 ring-brand">
            <span className="text-xs font-medium uppercase tracking-wider text-white/60">
              Talyplaryň sany
            </span>
            <div className="font-display text-3xl font-medium">1,140</div>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="font-display text-xl font-semibold">Iň ýokary reýting</h2>
          <div className="flex flex-wrap items-end gap-3">
            <div className="space-y-1">
              <label className="px-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                Fakultet
              </label>
              <select
                value={activeFaculty}
                onChange={(e) => {
                  setFaculty(e.target.value);
                  setGroup("");
                  setCourse("");
                }}
                className={select}
              >
                {faculties.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="px-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                Topar
              </label>
              <select
                value={activeGroup}
                onChange={(e) => {
                  setGroup(e.target.value);
                  setCourse("");
                }}
                disabled={availableGroups.length === 0}
                className={select + " disabled:opacity-40"}
              >
                {availableGroups.length === 0 ? (
                  <option value="">Topar ýok</option>
                ) : (
                  availableGroups.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))
                )}
              </select>
            </div>
            <div className="space-y-1">
              <label className="px-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                Kurs
              </label>
              <select
                value={activeCourse ?? ""}
                onChange={(e) => setCourse(Number(e.target.value))}
                disabled={availableCourses.length === 0}
                className={select + " disabled:opacity-40"}
              >
                {availableCourses.length === 0 ? (
                  <option value="">Kurs ýok</option>
                ) : (
                  availableCourses.map((c) => (
                    <option key={c} value={c}>
                      {c}-nji ýyl
                    </option>
                  ))
                )}
              </select>
            </div>
            <Link to="/reyting" className="pb-2 text-sm font-medium text-brand">
              Hemmesini gör
            </Link>
          </div>
        </div>
        <div className="space-y-3">
          {ranked.map((s, i) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setSelectedStudent(s)}
              className="flex w-full items-center rounded-2xl bg-card p-4 text-left ring-1 ring-black/5 transition hover:bg-secondary/40 hover:ring-brand/20"
            >
              <span className="w-8 font-display font-medium text-muted-foreground">
                {String(i + 1).padStart(2, "0")}
              </span>
              {s.photo ? (
                <img
                  src={s.photo}
                  alt={s.fullName}
                  className="mx-4 size-12 shrink-0 rounded-xl object-cover ring-1 ring-black/5"
                />
              ) : (
                <div className="mx-4 grid size-12 shrink-0 place-items-center rounded-xl bg-brand-soft text-sm font-semibold text-brand ring-1 ring-black/5">
                  {s.initials}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-sm font-semibold">{s.fullName}</h3>
                <p className="truncate text-xs text-muted-foreground">
                  {s.faculty} • {s.group}
                </p>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold text-brand">{s.points}</div>
                <div className="text-[10px] uppercase text-muted-foreground">Ball</div>
              </div>
            </button>
          ))}
          {ranked.length === 0 && (
            <div className="rounded-2xl bg-card p-8 text-center text-sm text-muted-foreground ring-1 ring-black/5">
              Saýlanan fakultet, topar we kurs boýunça talyp tapylmady.
            </div>
          )}
        </div>
      </section>

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