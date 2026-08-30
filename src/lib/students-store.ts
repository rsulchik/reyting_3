import { useLocalStorage } from "@/hooks/use-local-storage";
import { STUDENTS, FACULTIES, type Student } from "@/lib/mock-data";
import { useSession } from "@/lib/auth";

export const STUDENTS_KEY = "studrate:students";
export const GROUPS_KEY = "studrate:groups";
export const OVERRIDES_KEY = "studrate:student-overrides";

export type Group = { name: string; faculty: string };

function baseGroupsFromStudents(): Group[] {
  const seen = new Set<string>();
  const result: Group[] = [];
  for (const s of STUDENTS) {
    const key = `${s.faculty}::${s.group}`;
    if (!seen.has(key)) {
      seen.add(key);
      result.push({ name: s.group, faculty: s.faculty });
    }
  }
  return result;
}

function migrateGroups(raw: unknown): Group[] {
  if (!Array.isArray(raw) || raw.length === 0) return baseGroupsFromStudents();
  if (typeof raw[0] === "string") {
    return (raw as string[]).map((name) => ({
      name,
      faculty: STUDENTS.find((s) => s.group === name)?.faculty ?? FACULTIES[0],
    }));
  }
  return raw as Group[];
}

export function groupsForFaculty(groups: Group[], faculty: string) {
  return groups.filter((g) => g.faculty === faculty);
}

export function useCustomStudents() {
  return useLocalStorage<Student[]>(STUDENTS_KEY, []);
}

export function useAllStudents() {
  const [custom, setCustom] = useCustomStudents();
  const [overrides, setOverrides] = useLocalStorage<Record<string, Partial<Student>>>(
    OVERRIDES_KEY,
    {},
  );
  const all = [...STUDENTS, ...custom].map((s) => ({ ...s, ...(overrides[s.id] ?? {}) }));
  const updateStudent = (id: string, patch: Partial<Student>) =>
    setOverrides({ ...overrides, [id]: { ...(overrides[id] ?? {}), ...patch } });
  return { all, custom, setCustom, updateStudent };
}

/** Students visible to the signed-in account: admin sees all, a faculty account only its own. */
export function useScopedStudents() {
  const store = useAllStudents();
  const { isAdmin, faculty } = useSession();
  if (isAdmin || !faculty) return isAdmin ? store : { ...store, all: [], custom: [] };
  return {
    ...store,
    all: store.all.filter((s) => s.faculty === faculty),
    custom: store.custom.filter((s) => s.faculty === faculty),
  };
}

export function useGroups() {
  const [raw, setRaw] = useLocalStorage<unknown>(GROUPS_KEY, baseGroupsFromStudents());
  const groups = migrateGroups(raw);
  const setGroups = (next: Group[]) => setRaw(next);
  return [groups, setGroups] as const;
}

export function makeInitials(fullName: string) {
  return fullName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

export function createStudent(input: {
  fullName: string;
  faculty: string;
  group: string;
  course: number;
  email?: string;
  photo?: string;
}): Student {
  return {
    id: crypto.randomUUID(),
    fullName: input.fullName.trim(),
    initials: makeInitials(input.fullName),
    faculty: input.faculty || FACULTIES[0],
    group: input.group,
    course: input.course,
    email: input.email?.trim() || undefined,
    photo: input.photo || undefined,
    rating: 0,
    facultyRank: 0,
    groupRank: 0,
    reviewsCount: 0,
    badges: [],
    weekly: [0, 0, 0, 0, 0, 0, 0],
  };
}
