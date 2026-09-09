import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AwardFilePreviewDialog } from "@/components/award-file-preview-dialog";
import { POINT_RULES, type PointRule } from "@/lib/mock-data";
import { useLocalStorage } from "@/hooks/use-local-storage";
import {
  usePointAwards,
  formatWhen,
  readAwardFiles,
  readImageDataUrl,
  totalPoints,
  type PointAward,
  type AwardFile,
} from "@/lib/point-awards";
import {
  useAllStudents,
  useScopedStudents,
  useGroups,
  groupsForFaculty,
  createStudent,
  makeInitials,
} from "@/lib/students-store";
import { useSession } from "@/lib/auth";
import { useFaculties, useCategories, usePenalties, type Category } from "@/lib/taxonomy";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Turkmenistanyn Milli Konserwwatoriyasy" },
      { name: "description", content: "Ölçegleri, kategoriýalary, ballary we temmi çäreleri dolandyryň." },
      { property: "og:title", content: "Admin paneli — StudRate" },
      { property: "og:description", content: "Ölçegleri, kategoriýalary, ballary we temmi çäreleri dolandyryň." },
    ],
  }),
  component: Admin,
});

const input =
  "w-full rounded-xl bg-secondary px-4 py-2.5 text-sm ring-1 ring-black/10 outline-none focus:ring-brand";
const chip = "rounded-lg bg-secondary px-3 py-1.5 text-xs font-semibold hover:bg-accent";

function Admin() {
  const [tab, setTab] = useState<
    "stats" | "categories" | "points" | "penalties" | "members" | "moderation" | "groups"
  >("stats");
  const [rules, setRules] = useLocalStorage<PointRule[]>("studrate:point-rules", POINT_RULES);
  const [categories, setCategories] = useCategories();
  const [awards, setAwards] = usePointAwards();
  const [faculties] = useFaculties();
  const pendingAwards = awards.filter((a) => a.status === "pending");
  const decidedAwards = awards.filter((a) => a.status !== "pending");
  const { all: allStudents } = useScopedStudents();
  const { isAdmin } = useSession();
  const activeTab = !isAdmin && tab !== "members" && tab !== "penalties" ? "members" : tab;
  const [previewFile, setPreviewFile] = useState<AwardFile | null>(null);



  return (
    <main className="mx-auto max-w-7xl space-y-10 px-6 py-12">
      <header className="flex flex-wrap items-end justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-semibold">Admin paneli</h1>
          <p className="max-w-[60ch] text-muted-foreground">
            Ölçegleri, kategoriýalary, ballary, temmi çäreleri, toparlary we fakultetleri dolandyryň.
          </p>
        </div>
        <span className="rounded-full bg-brand-soft px-3 py-1 text-xs font-semibold text-brand ring-1 ring-brand/20">
          Moderator
        </span>
      </header>

      <nav className="flex flex-wrap gap-2 border-b border-border">
        {(isAdmin
          ? [
              ["stats", "Statistika"],
              ["categories", "Kategoriýalar"],
              ["points", "Ball ber"],
              ["penalties", "Temmi çäreler"],
              ["members", "Talyplar"],
              ["moderation", "Moderasiýa"],
              ["groups", "Toparlar we fakultetler"],
            ]
          : [
              ["members", "Ball ber"],
              ["penalties", "Talyba temmi çäre bellemek"],
              ["moderation", "Moderasiýa"],
              ["categories", "Kategoriýalar"],
            ]
        ).map(([key, label]) => (

          <button
            key={key}
            onClick={() => setTab(key as typeof tab)}
            className={
              "border-b-2 px-4 py-2 text-sm font-medium transition " +
              (activeTab === key
                ? "border-brand text-brand"
                : "border-transparent text-muted-foreground hover:text-ink")
            }
          >
            {label}
            {key === "moderation" && pendingAwards.length > 0 && (
              <span className="ml-2 rounded-full bg-brand px-2 py-0.5 text-[10px] font-bold text-white">
                {pendingAwards.length}
              </span>
            )}
          </button>
        ))}
      </nav>

      {activeTab === "stats" && (
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Aktiw talyplar", allStudents.length.toString()],
            ["Fakultetler", faculties.length.toString()],
            ["Kategoriýalar", categories.length.toString()],
            ["Garaşýan ballar", pendingAwards.length.toString()],
          ].map(([l, v]) => (
            <div key={l} className="space-y-2 rounded-2xl bg-card p-6 ring-1 ring-black/5">
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{l}</div>
              <div className="font-display text-3xl font-medium">{v}</div>
            </div>
          ))}
        </section>
      )}

      {activeTab === "categories" && (
        <CategoriesTab
          categories={categories}
          setCategories={setCategories}
          rules={rules}
          setRules={setRules}
        />
      )}

      {activeTab === "points" && (
        <AwardPointsForm rules={rules} awards={awards} setAwards={setAwards} />
      )}

      {activeTab === "penalties" && (
        <PenaltiesTab awards={awards} setAwards={setAwards} limited={!isAdmin} />
      )}

      {activeTab === "members" && (
        <MembersTab rules={rules} awards={awards} setAwards={setAwards} limited={!isAdmin} />
      )}

      {activeTab === "moderation" && (
        <section className="space-y-8">
          <div className="space-y-3">
            <h2 className="text-lg font-semibold">Tassyklanmaga garaşýan ballar</h2>
            {pendingAwards.length === 0 ? (
              <div className="rounded-2xl bg-card p-6 text-sm text-muted-foreground ring-1 ring-black/5">
                Häzirlikçe garaşýan ball ýok.
              </div>
            ) : (
              pendingAwards.map((a) => (
                <div key={a.id} className="space-y-3 rounded-2xl bg-card p-5 ring-1 ring-black/5">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                    <div>
                      <span className="font-semibold text-ink">{a.fromName}</span> → {a.studentName}
                    </div>
                    <span>{formatWhen(a.createdAt)}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-sm font-semibold">{a.action}</span>
                    <span
                      className={
                        "rounded-full px-3 py-1 text-xs font-semibold ring-1 " +
                        (a.points < 0
                          ? "bg-secondary text-destructive ring-destructive/20"
                          : "bg-brand-soft text-brand ring-brand/20")
                      }
                    >
                      {a.points > 0 ? "+" : ""}
                      {a.points} ball
                    </span>
                    <span className="text-xs text-muted-foreground">{a.criterion}</span>
                  </div>
                  {a.note && <p className="text-sm text-muted-foreground">{a.note}</p>}
                  {a.files && a.files.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {a.files.map((f) => (
                        <button
                          key={f.name}
                          type="button"
                          onClick={() => setPreviewFile(f)}
                          className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-brand ring-1 ring-brand/20"
                        >
                          📎 {f.name}
                        </button>
                      ))}
                    </div>
                  )}
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        setAwards(
                          awards.map((x) =>
                            x.id === a.id ? { ...x, status: "approved", approvedAt: Date.now() } : x,
                          ),
                        )
                      }
                      className="rounded-lg bg-brand px-3 py-1.5 text-xs font-semibold text-white"
                    >
                      Tassyklamak
                    </button>
                    <button
                      onClick={() =>
                        setAwards(awards.map((x) => (x.id === a.id ? { ...x, status: "rejected" } : x)))
                      }
                      className="rounded-lg bg-secondary px-3 py-1.5 text-xs font-semibold text-destructive"
                    >
                      Ret etmek
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {decidedAwards.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold">Ballaryň taryhy</h2>
              {decidedAwards.map((a) => (
                <div
                  key={a.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-card p-4 text-sm ring-1 ring-black/5"
                >
                  <span>
                    {a.studentName} — {a.action}{" "}
                    <span className="text-xs text-muted-foreground">
                      ({a.points > 0 ? "+" : ""}
                      {a.points})
                    </span>
                  </span>
                  <div className="flex items-center gap-2">
                    <span
                      className={
                        "rounded-full px-3 py-1 text-xs font-semibold " +
                        (a.status === "approved"
                          ? "bg-brand-soft text-brand ring-1 ring-brand/20"
                          : "bg-secondary text-destructive")
                      }
                    >
                      {a.status === "approved" ? "Tassyklandy" : "Ret edildi"}
                    </span>
                    {a.approvedAt && (
                      <span className="text-xs text-muted-foreground">
                        {formatDateTime(a.approvedAt)}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {activeTab === "groups" && <GroupsTab />}

      <AwardFilePreviewDialog
        file={previewFile}
        open={previewFile !== null}
        onOpenChange={(open) => {
          if (!open) setPreviewFile(null);
        }}
      />
    </main>
  );
}

function CategoriesTab({
  categories,
  setCategories,
  rules,
  setRules,
}: {
  categories: Category[];
  setCategories: (v: Category[]) => void;
  rules: PointRule[];
  setRules: (v: PointRule[]) => void;
}) {
  const [name, setName] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [itemDraft, setItemDraft] = useState<Record<string, { action: string; points: number }>>({});

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Kategoriýalar</h2>
        <p className="max-w-[70ch] text-sm text-muted-foreground">
          Meselem: «Talyplaryň ylmy-usuly işleri» kategoriýasynyň içine «Daşary ýurt makalasyny çap
          etmek — 5 ball» ýaly işleri goşup bilersiňiz.
        </p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          const v = name.trim();
          if (!v) return;
          setCategories([...categories, { id: crypto.randomUUID(), name: v }]);
          setName("");
        }}
        className="flex flex-wrap gap-3 rounded-2xl border-2 border-dashed border-border p-4"
      >
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Kategoriýanyň ady"
          className={"min-w-[240px] flex-1 " + input}
        />
        <button className="rounded-full bg-brand px-5 py-2.5 text-sm font-medium text-white">
          + Kategoriýa goş
        </button>
      </form>

      <div className="space-y-4">
        {categories.map((c) => {
          const items = rules.filter((r) => r.categoryId === c.id);
          const d = itemDraft[c.id] ?? { action: "", points: 5 };
          return (
            <div key={c.id} className="space-y-4 rounded-2xl bg-card p-6 ring-1 ring-black/5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                {editId === c.id ? (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const v = editName.trim();
                      if (!v) return;
                      setCategories(categories.map((x) => (x.id === c.id ? { ...x, name: v } : x)));
                      setEditId(null);
                    }}
                    className="flex flex-1 flex-wrap gap-2"
                  >
                    <input
                      autoFocus
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className={"min-w-[220px] flex-1 " + input}
                    />
                    <button className="rounded-lg bg-brand px-3 py-1.5 text-xs font-semibold text-white">
                      Ýatda sakla
                    </button>
                    <button type="button" onClick={() => setEditId(null)} className={chip}>
                      Ýatyr
                    </button>
                  </form>
                ) : (
                  <>
                    <div>
                      <div className="text-sm font-semibold">{c.name}</div>
                      <div className="text-xs text-muted-foreground">{items.length} iş</div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditId(c.id);
                          setEditName(c.name);
                        }}
                        className={chip}
                      >
                        Üýtget
                      </button>
                      <button
                        onClick={() => {
                          setCategories(categories.filter((x) => x.id !== c.id));
                          setRules(
                            rules.map((r) =>
                              r.categoryId === c.id ? { ...r, categoryId: undefined } : r,
                            ),
                          );
                        }}
                        className={chip + " text-destructive"}
                      >
                        Aýyr
                      </button>
                    </div>
                  </>
                )}
              </div>

              <div className="space-y-2">
                {items.map((r) => (
                  <div
                    key={r.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-secondary/60 px-4 py-3 text-sm"
                  >
                    <span>{r.action}</span>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        value={r.points}
                        onChange={(e) =>
                          setRules(
                            rules.map((x) =>
                              x.id === r.id ? { ...x, points: Number(e.target.value) } : x,
                            ),
                          )
                        }
                        className="w-20 rounded-lg bg-card px-3 py-1.5 text-xs ring-1 ring-black/10 outline-none focus:ring-brand"
                      />
                      <span className="text-xs text-muted-foreground">ball</span>
                      <button
                        onClick={() => setRules(rules.filter((x) => x.id !== r.id))}
                        className={chip + " text-destructive"}
                      >
                        Aýyr
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!d.action.trim()) return;
                  setRules([
                    ...rules,
                    {
                      id: crypto.randomUUID(),
                      action: d.action.trim(),
                      points: d.points,
                      criterion: "",
                      categoryId: c.id,
                    },
                  ]);
                  setItemDraft({ ...itemDraft, [c.id]: { action: "", points: 5 } });
                }}
                className="flex flex-wrap gap-3"
              >
                <input
                  value={d.action}
                  onChange={(e) =>
                    setItemDraft({ ...itemDraft, [c.id]: { ...d, action: e.target.value } })
                  }
                  placeholder="Iş"
                  className={"min-w-[220px] flex-1 " + input}
                />
                <input
                  type="number"
                  value={d.points}
                  onChange={(e) =>
                    setItemDraft({ ...itemDraft, [c.id]: { ...d, points: Number(e.target.value) } })
                  }
                  className={"w-24 " + input}
                />
                <button className="rounded-full bg-brand px-5 py-2.5 text-sm font-medium text-white">
                  + Goş
                </button>
              </form>
            </div>
          );
        })}
      </div>

    </section>
  );
}

function PenaltiesTab({
  awards,
  setAwards,
  limited = false,
}: {
  awards: PointAward[];
  setAwards: (v: PointAward[]) => void;
  limited?: boolean;
}) {
  const [penalties, setPenalties] = usePenalties();
  const { all } = useScopedStudents();
  const [draft, setDraft] = useState({ action: "", points: 5 });
  const [editId, setEditId] = useState<string | null>(null);
  const [target, setTarget] = useState("");
  const [penaltyId, setPenaltyId] = useState("");
  const [note, setNote] = useState("");
  const [msg, setMsg] = useState("");

  const student = all.find((s) => s.id === target);
  const penalty = penalties.find((p) => p.id === penaltyId);

  return (
    <section className="space-y-8">
      {!limited && (
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Temmi çäreler</h2>
        <p className="max-w-[70ch] text-sm text-muted-foreground">
          Temmi çäre bellenende görkezilen ball talybyň umumy balyndan aýrylýar (meselem käýinç —10
          ball).
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!draft.action.trim()) return;
            if (editId) {
              setPenalties(penalties.map((p) => (p.id === editId ? { ...p, ...draft } : p)));
              setEditId(null);
            } else {
              setPenalties([...penalties, { id: crypto.randomUUID(), ...draft }]);
            }
            setDraft({ action: "", points: 5 });
          }}
          className="grid gap-4 rounded-2xl bg-card p-6 ring-1 ring-black/5 md:grid-cols-[2fr_1fr_auto] md:items-end"
        >
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Temmi çäre</label>
            <input
              value={draft.action}
              onChange={(e) => setDraft({ ...draft, action: e.target.value })}
              placeholder="Meselem: Käýinç almak"
              className={input}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Aýrylýan ball</label>
            <input
              type="number"
              min={1}
              max={100}
              value={draft.points}
              onChange={(e) => setDraft({ ...draft, points: Number(e.target.value) })}
              className={input}
            />
          </div>
          <button className="rounded-full bg-brand px-5 py-2.5 text-sm font-medium text-white">
            {editId ? "Ýatda sakla" : "Goş"}
          </button>
        </form>

        <div className="space-y-3">
          {penalties.map((p) => (
            <div
              key={p.id}
              className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-card p-5 ring-1 ring-black/5"
            >
              <div className="text-sm font-semibold">{p.action}</div>
              <div className="flex items-center gap-3">
                <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-destructive ring-1 ring-destructive/20">
                  −{p.points} ball
                </span>
                <button
                  onClick={() => {
                    setEditId(p.id);
                    setDraft({ action: p.action, points: p.points });
                  }}
                  className={chip}
                >
                  Üýtget
                </button>
                <button
                  onClick={() => setPenalties(penalties.filter((x) => x.id !== p.id))}
                  className={chip + " text-destructive"}
                >
                  Poz
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      )}

      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Talyba temmi çäre bellemek</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!student || !penalty) return;
            setAwards([
              {
                id: crypto.randomUUID(),
                studentId: student.id,
                studentName: student.fullName,
                action: penalty.action,
                points: -Math.abs(penalty.points),
                criterion: "Temmi çäre",
                note: note.trim(),
                fromName: "Moderator",
                createdAt: Date.now(),
                status: "pending",
                files: [],
              },
              ...awards,
            ]);
            setNote("");
            setPenaltyId("");
            setMsg(`${student.fullName} üçin temmi çäre moderasiýa iberildi.`);
          }}
          className="grid gap-4 rounded-2xl bg-card p-6 ring-1 ring-black/5 md:grid-cols-2"
        >
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Talyp</label>
            <select value={target} onChange={(e) => setTarget(e.target.value)} className={input}>
              <option value="">Saýlaň…</option>
              {all.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.fullName} — {s.group}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Temmi çäre</label>
            <select value={penaltyId} onChange={(e) => setPenaltyId(e.target.value)} className={input}>
              <option value="">Saýlaň…</option>
              {penalties.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.action} (−{p.points})
                </option>
              ))}
            </select>
          </div>
          <button
            disabled={!student || !penalty}
            className="rounded-full bg-brand px-5 py-2.5 text-sm font-medium text-white disabled:opacity-40 md:w-fit"
          >
            Moderasiýa iber
          </button>
        </form>
        {msg && (
          <div className="rounded-xl bg-brand-soft px-4 py-3 text-sm text-brand ring-1 ring-brand/20">
            {msg}
          </div>
        )}
      </div>
    </section>
  );
}

function GroupsTab() {
  const { all } = useScopedStudents();
  const [groups, setGroups] = useGroups();
  const [faculties, setFaculties] = useFaculties();
  const { updateStudent } = useAllStudents();
  const [newGroup, setNewGroup] = useState("");
  const [newGroupFaculty, setNewGroupFaculty] = useState(faculties[0] ?? "");
  const [newFaculty, setNewFaculty] = useState("");
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");

  return (
    <section className="space-y-8">
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Toparlar</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const v = newGroup.trim();
            if (!v || !newGroupFaculty) return;
            if (groups.some((g) => g.name === v && g.faculty === newGroupFaculty)) return;
            setGroups([...groups, { name: v, faculty: newGroupFaculty }]);
            setNewGroup("");
          }}
          className="grid gap-4 rounded-2xl border-2 border-dashed border-border p-4 md:grid-cols-[1.5fr_2fr_auto] md:items-end"
        >
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Topar ady</label>
            <input
              value={newGroup}
              onChange={(e) => setNewGroup(e.target.value)}
              placeholder="Meselem: IKT-24"
              className={input}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Fakultet</label>
            <select
              value={newGroupFaculty}
              onChange={(e) => setNewGroupFaculty(e.target.value)}
              className={input}
            >
              {faculties.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>
          <button className="rounded-full bg-brand px-5 py-2.5 text-sm font-medium text-white">
            + Goş
          </button>
        </form>
        <div className="grid gap-3 md:grid-cols-2">
          {groups.map((g) => (
            <div
              key={`${g.faculty}::${g.name}`}
              className="flex items-center justify-between gap-3 rounded-2xl bg-card p-5 ring-1 ring-black/5"
            >
              <div>
                <div className="text-sm font-semibold">{g.name}</div>
                <div className="text-xs text-muted-foreground">{g.faculty}</div>
                <div className="text-xs text-muted-foreground">
                  {all.filter((s) => s.group === g.name && s.faculty === g.faculty).length} talyp
                </div>
              </div>
              <button
                onClick={() =>
                  setGroups(groups.filter((x) => !(x.name === g.name && x.faculty === g.faculty)))
                }
                className={chip + " text-destructive"}
              >
                Aýyr
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Fakultetler</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const v = newFaculty.trim();
            if (!v || faculties.includes(v)) return;
            setFaculties([...faculties, v]);
            setNewFaculty("");
          }}
          className="flex flex-wrap gap-3 rounded-2xl border-2 border-dashed border-border p-4"
        >
          <input
            value={newFaculty}
            onChange={(e) => setNewFaculty(e.target.value)}
            placeholder="Täze fakultet"
            className={"min-w-[220px] flex-1 " + input}
          />
          <button className="rounded-full bg-brand px-5 py-2.5 text-sm font-medium text-white">
            + Goş
          </button>
        </form>
        <div className="grid gap-4 md:grid-cols-2">
          {faculties.map((f, i) => (
            <div key={f + i} className="space-y-3 rounded-2xl bg-card p-6 ring-1 ring-black/5">
              {editIdx === i ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const v = editValue.trim();
                    if (!v) return;
                    setFaculties(faculties.map((x, j) => (j === i ? v : x)));
                    all
                      .filter((s) => s.faculty === f)
                      .forEach((s) => updateStudent(s.id, { faculty: v }));
                    setGroups(groups.map((g) => (g.faculty === f ? { ...g, faculty: v } : g)));
                    setEditIdx(null);
                  }}
                  className="flex flex-wrap gap-2"
                >
                  <input
                    autoFocus
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className={"min-w-[180px] flex-1 " + input}
                  />
                  <button className="rounded-lg bg-brand px-3 py-1.5 text-xs font-semibold text-white">
                    Ýatda sakla
                  </button>
                  <button type="button" onClick={() => setEditIdx(null)} className={chip}>
                    Ýatyr
                  </button>
                </form>
              ) : (
                <>
                  <div className="text-sm font-semibold">{f}</div>
                  <div className="text-xs text-muted-foreground">
                    {all.filter((s) => s.faculty === f).length} talyp
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditIdx(i);
                        setEditValue(f);
                      }}
                      className={chip}
                    >
                      Adyny üýtget
                    </button>
                    <button
                      onClick={() => {
                        setFaculties(faculties.filter((_, j) => j !== i));
                        setGroups(groups.filter((g) => g.faculty !== f));
                      }}
                      className={chip + " text-destructive"}
                    >
                      Aýyr
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function AwardPointsForm({
  rules,
  awards,
  setAwards,
}: {
  rules: PointRule[];
  awards: PointAward[];
  setAwards: (v: PointAward[]) => void;
}) {
  const { all } = useScopedStudents();
  const [target, setTarget] = useState("");
  const [ruleId, setRuleId] = useState("");
  const [note, setNote] = useState("");
  const [files, setFiles] = useState<AwardFile[]>([]);
  const [fileError, setFileError] = useState("");
  const [msg, setMsg] = useState("");

  const student = all.find((s) => s.id === target);
  const rule = rules.find((r) => r.id === ruleId);

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Ball ber</h2>
        <p className="max-w-[70ch] text-sm text-muted-foreground">
          Talyp saýlap, edilen iş boýunça ball iberiň. Tassyklamak üçin moderasiýa iberiler.
        </p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!student || !rule) return;
          setAwards([
            {
              id: crypto.randomUUID(),
              studentId: student.id,
              studentName: student.fullName,
              action: rule.action,
              points: rule.points,
              criterion: rule.criterion,
              note: note.trim(),
              fromName: "Moderator",
              createdAt: Date.now(),
              status: "pending",
              files,
            },
            ...awards,
          ]);
          setNote("");
          setFiles([]);
          setRuleId("");
          setMsg(`${student.fullName} üçin +${rule.points} ball moderasiýa iberildi.`);
        }}
        className="grid gap-4 rounded-2xl bg-card p-6 ring-1 ring-black/5 md:grid-cols-2"
      >
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">Talyp</label>
          <select value={target} onChange={(e) => setTarget(e.target.value)} className={input}>
            <option value="">Saýlaň…</option>
            {all.map((s) => (
              <option key={s.id} value={s.id}>
                {s.fullName} — {s.group}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">Iş / hereket</label>
          <select value={ruleId} onChange={(e) => setRuleId(e.target.value)} className={input}>
            <option value="">Saýlaň…</option>
            {rules.map((r) => (
              <option key={r.id} value={r.id}>
                {r.action} (+{r.points})
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2 md:col-span-2">
          <label className="text-xs font-medium text-muted-foreground">Düşündiriş</label>
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Näme üçin ball berilýär?"
            className={input}
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <label className="text-xs font-medium text-muted-foreground">
            Subutnama faýllary (.pdf, .jpeg — 2 MB çenli)
          </label>
          <input
            type="file"
            multiple
            accept="application/pdf,image/jpeg"
            onChange={async (e) => {
              const list = e.target.files;
              const picked = await readAwardFiles(list);
              setFileError(
                list && picked.length !== list.length
                  ? "Käbir faýllar kabul edilmedi (diňe .pdf/.jpeg, 2 MB çenli)."
                  : "",
              );
              setFiles(picked);
            }}
            className={input + " file:mr-3 file:rounded-full file:border-0 file:bg-brand file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white"}
          />
          {fileError && <p className="text-xs text-destructive">{fileError}</p>}
          {files.length > 0 && (
            <ul className="flex flex-wrap gap-2">
              {files.map((f) => (
                <li key={f.name} className="rounded-full bg-secondary px-3 py-1 text-xs text-muted-foreground">
                  {f.name}
                </li>
              ))}
            </ul>
          )}
        </div>
        <button
          disabled={!student || !rule}
          className="rounded-full bg-brand px-5 py-2.5 text-sm font-medium text-white disabled:opacity-40 md:w-fit"
        >
          Moderasiýa iber
        </button>
      </form>
      {msg && (
        <div className="rounded-xl bg-brand-soft px-4 py-3 text-sm text-brand ring-1 ring-brand/20">
          {msg}
        </div>
      )}
    </section>
  );
}

function MembersTab({
  rules,
  awards,
  setAwards,
  limited = false,
}: {
  rules: PointRule[];
  awards: PointAward[];
  setAwards: (v: PointAward[]) => void;
  limited?: boolean;
}) {
  const { all, custom, setCustom, updateStudent } = useScopedStudents();
  const [groups, setGroups] = useGroups();
  const [faculties] = useFaculties();
  const defaultFaculty = faculties[0] ?? "";
  const emptyForm = {
    lastName: "",
    firstName: "",
    middleName: "",
    email: "",
    photo: "",
    faculty: defaultFaculty,
    group: groupsForFaculty(groups, defaultFaculty)[0]?.name ?? "",
    newGroup: "",
    course: 1,
  };
  const [form, setForm] = useState(emptyForm);
  const [msg, setMsg] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const PER_PAGE = 15;
  const [edit, setEdit] = useState({
    fullName: "",
    email: "",
    photo: "",
    faculty: "",
    group: "",
    course: 1,
  });

  return (
    <section className="space-y-8">
      {!limited && (
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Talyp goş</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const group = form.newGroup.trim() || form.group;
            const fullName = [form.lastName, form.firstName, form.middleName]
              .map((x) => x.trim())
              .filter(Boolean)
              .join(" ");
            if (!fullName || !group) return;
            if (!groups.some((g) => g.name === group && g.faculty === form.faculty)) {
              setGroups([...groups, { name: group, faculty: form.faculty }]);
            }
            setCustom([
              ...custom,
              createStudent({
                fullName,
                faculty: form.faculty,
                group,
                course: form.course,
                email: form.email,
                photo: form.photo,
              }),
            ]);
            setForm({ ...emptyForm, faculty: form.faculty, group });
            setMsg("Talyp goşuldy.");
          }}
          className="grid gap-4 rounded-2xl bg-card p-6 ring-1 ring-black/5 md:grid-cols-3"
        >
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Familiýasy</label>
            <input
              value={form.lastName}
              onChange={(e) => setForm({ ...form, lastName: e.target.value })}
              placeholder="Sopyýew"
              className={input}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Ady</label>
            <input
              value={form.firstName}
              onChange={(e) => setForm({ ...form, firstName: e.target.value })}
              placeholder="Nazguly"
              className={input}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Atasynyň ady</label>
            <input
              value={form.middleName}
              onChange={(e) => setForm({ ...form, middleName: e.target.value })}
              placeholder="Myradowiç"
              className={input}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">E-poçtasy</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="talyp@uni.edu.tm"
              className={input}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Fakultet</label>
            <select
              value={form.faculty}
              onChange={(e) => {
                const faculty = e.target.value;
                const available = groupsForFaculty(groups, faculty);
                setForm({
                  ...form,
                  faculty,
                  group: available[0]?.name ?? "",
                  newGroup: "",
                });
              }}
              className={input}
            >
              {faculties.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Kurs</label>
            <input
              type="number"
              min={1}
              max={6}
              value={form.course}
              onChange={(e) => setForm({ ...form, course: Number(e.target.value) })}
              className={input}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Topar</label>
            <select
              value={form.group}
              onChange={(e) => setForm({ ...form, group: e.target.value })}
              className={input}
            >
              {groupsForFaculty(groups, form.faculty).map((g) => (
                <option key={g.name} value={g.name}>
                  {g.name}
                </option>
              ))}
            </select>
            <input
              value={form.newGroup}
              onChange={(e) => setForm({ ...form, newGroup: e.target.value })}
              placeholder="ýa-da topar goşmak"
              className="w-full rounded-xl bg-secondary px-4 py-2 text-xs ring-1 ring-black/10 outline-none focus:ring-brand"
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="text-xs font-medium text-muted-foreground">3x4 surat</label>
            <div className="flex items-center gap-4">
              {form.photo ? (
                <img
                  src={form.photo}
                  alt="3x4 surat"
                  className="h-20 w-[60px] rounded-lg object-cover ring-1 ring-black/10"
                />
              ) : (
                <div className="grid h-20 w-[60px] place-items-center rounded-lg bg-secondary text-[10px] text-muted-foreground ring-1 ring-black/10">
                  3x4
                </div>
              )}
              <input
                type="file"
                accept="image/jpeg,image/png"
                onChange={async (e) =>
                  setForm({ ...form, photo: await readImageDataUrl(e.target.files?.[0]) })
                }
                className={input + " file:mr-3 file:rounded-full file:border-0 file:bg-brand file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white"}
              />
            </div>
          </div>
          <button className="rounded-full bg-brand px-5 py-2.5 text-sm font-medium text-white md:col-span-3 md:w-fit">
            + Talyp goş
          </button>
        </form>
        {msg && (
          <div className="rounded-xl bg-brand-soft px-4 py-3 text-sm text-brand ring-1 ring-brand/20">
            {msg}
          </div>
        )}
      </div>
      )}

      {limited && <AwardPointsForm rules={rules} awards={awards} setAwards={setAwards} />}

      {!limited && (
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Talyplar ({all.length})</h2>
        {all.slice((page - 1) * PER_PAGE, page * PER_PAGE).map((s) => {
          const total = totalPoints(awards, s.id);
          const isCustom = custom.some((c) => c.id === s.id);
          const editing = editId === s.id;
          return (
            <div key={s.id} className="space-y-4 rounded-2xl bg-card p-4 ring-1 ring-black/5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  {s.photo ? (
                    <img
                      src={s.photo}
                      alt={s.fullName}
                      className="h-16 w-12 rounded-lg object-cover ring-1 ring-black/10"
                    />
                  ) : (
                    <div className="grid h-16 w-12 place-items-center rounded-lg bg-brand-soft text-xs font-semibold text-brand">
                      {s.initials}
                    </div>
                  )}
                  <div>
                    <div className="text-sm font-semibold">{s.fullName}</div>
                    <div className="text-xs text-muted-foreground">
                      {s.faculty} • {s.group} • {s.course}-nji ýyl
                    </div>
                    {s.email && <div className="text-xs text-muted-foreground">{s.email}</div>}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="rounded-full bg-brand-soft px-3 py-1 text-xs font-semibold text-brand ring-1 ring-brand/20">
                    {total} ball
                  </span>
                  <button
                    onClick={() => {
                      setEditId(editing ? null : s.id);
                      setEdit({
                        fullName: s.fullName,
                        email: s.email ?? "",
                        photo: s.photo ?? "",
                        faculty: s.faculty,
                        group: s.group,
                        course: s.course,
                      });
                    }}
                    className={chip}
                  >
                    {editing ? "Ýap" : "Üýtget"}
                  </button>
                  {isCustom && (
                    <button
                      onClick={() => setCustom(custom.filter((c) => c.id !== s.id))}
                      className={chip + " text-destructive"}
                    >
                      Poz
                    </button>
                  )}
                </div>
              </div>

              {editing && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!edit.fullName.trim()) return;
                    updateStudent(s.id, {
                      fullName: edit.fullName.trim(),
                      initials: makeInitials(edit.fullName),
                      email: edit.email.trim() || undefined,
                      photo: edit.photo || undefined,
                      faculty: edit.faculty,
                      group: edit.group,
                      course: edit.course,
                    });
                    setEditId(null);
                  }}
                  className="grid gap-4 rounded-xl bg-secondary/50 p-4 md:grid-cols-3"
                >
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-xs font-medium text-muted-foreground">
                      Familiýasy, ady, atasynyň ady
                    </label>
                    <input
                      value={edit.fullName}
                      onChange={(e) => setEdit({ ...edit, fullName: e.target.value })}
                      className={input}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground">E-poçtasy</label>
                    <input
                      type="email"
                      value={edit.email}
                      onChange={(e) => setEdit({ ...edit, email: e.target.value })}
                      className={input}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground">Fakultet</label>
                    <select
                      value={edit.faculty}
                      onChange={(e) => {
                        const faculty = e.target.value;
                        const available = groupsForFaculty(groups, faculty);
                        const nextGroup = available.some((g) => g.name === edit.group)
                          ? edit.group
                          : (available[0]?.name ?? "");
                        setEdit({ ...edit, faculty, group: nextGroup });
                      }}
                      className={input}
                    >
                      {[...new Set([...faculties, edit.faculty])].map((f) => (
                        <option key={f} value={f}>
                          {f}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground">Topar</label>
                    <select
                      value={edit.group}
                      onChange={(e) => setEdit({ ...edit, group: e.target.value })}
                      className={input}
                    >
                      {[
                        ...new Set([
                          ...groupsForFaculty(groups, edit.faculty).map((g) => g.name),
                          edit.group,
                        ]),
                      ].map((g) => (
                        <option key={g} value={g}>
                          {g}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground">Kurs</label>
                    <input
                      type="number"
                      min={1}
                      max={6}
                      value={edit.course}
                      onChange={(e) => setEdit({ ...edit, course: Number(e.target.value) })}
                      className={input}
                    />
                  </div>
                  <div className="space-y-2 md:col-span-3">
                    <label className="text-xs font-medium text-muted-foreground">3x4 surat</label>
                    <div className="flex items-center gap-4">
                      {edit.photo && (
                        <img
                          src={edit.photo}
                          alt="3x4"
                          className="h-20 w-[60px] rounded-lg object-cover ring-1 ring-black/10"
                        />
                      )}
                      <input
                        type="file"
                        accept="image/jpeg,image/png"
                        onChange={async (e) =>
                          setEdit({ ...edit, photo: await readImageDataUrl(e.target.files?.[0]) })
                        }
                        className={input + " file:mr-3 file:rounded-full file:border-0 file:bg-brand file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white"}
                      />
                    </div>
                  </div>
                  <button className="rounded-full bg-brand px-5 py-2.5 text-sm font-medium text-white md:w-fit">
                    Ýatda sakla
                  </button>
                </form>
              )}
            </div>
          );
        })}
        {all.length > PER_PAGE && (
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className={chip + " disabled:opacity-40"}
            >
              Öňki
            </button>
            {Array.from({ length: Math.ceil(all.length / PER_PAGE) }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                onClick={() => setPage(n)}
                className={
                  "rounded-full px-3 py-1.5 text-xs font-semibold ring-1 transition " +
                  (n === page
                    ? "bg-brand text-white ring-brand"
                    : "bg-card text-ink ring-black/10 hover:ring-brand/30")
                }
              >
                {n}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(Math.ceil(all.length / PER_PAGE), p + 1))}
              disabled={page >= Math.ceil(all.length / PER_PAGE)}
              className={chip + " disabled:opacity-40"}
            >
              Indiki
            </button>
          </div>
        )}
      </div>
      )}
    </section>

  );
}
