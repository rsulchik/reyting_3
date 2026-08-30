import { useLocalStorage } from "@/hooks/use-local-storage";
import { POINT_RULES, type PointRule } from "@/lib/mock-data";

export type AwardStatus = "pending" | "approved" | "rejected";

export type AwardFile = {
  name: string;
  type: string;
  size: number;
  dataUrl: string;
};

export type PointAward = {
  id: string;
  studentId: string;
  studentName: string;
  action: string;
  points: number;
  criterion: string;
  note: string;
  fromName: string;
  createdAt: number;
  status: AwardStatus;
  files?: AwardFile[];
};

export const AWARDS_KEY = "studrate:point-awards";
export const RULES_KEY = "studrate:point-rules";

export function usePointAwards() {
  return useLocalStorage<PointAward[]>(AWARDS_KEY, []);
}

export function usePointRules() {
  return useLocalStorage<PointRule[]>(RULES_KEY, POINT_RULES);
}

export function formatWhen(ts: number) {
  const diff = Date.now() - ts;
  const min = Math.round(diff / 60000);
  if (min < 1) return "Şu pursat";
  if (min < 60) return `${min} min öň`;
  const h = Math.round(min / 60);
  if (h < 24) return `${h} sagat öň`;
  return `${Math.round(h / 24)} gün öň`;
}

export const ALLOWED_FILE_TYPES = ["application/pdf", "image/jpeg", "image/jpg"];
export const MAX_FILE_SIZE = 2 * 1024 * 1024;

export function totalPoints(awards: PointAward[], studentId: string) {
  return awards
    .filter((a) => a.studentId === studentId && a.status === "approved")
    .reduce((sum, a) => sum + a.points, 0);
}

export function readImageDataUrl(file: File | null | undefined): Promise<string> {
  if (!file) return Promise.resolve("");
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export async function readAwardFiles(list: FileList | null): Promise<AwardFile[]> {
  if (!list) return [];
  const files = Array.from(list).filter(
    (f) => ALLOWED_FILE_TYPES.includes(f.type) && f.size <= MAX_FILE_SIZE,
  );
  return Promise.all(
    files.map(
      (f) =>
        new Promise<AwardFile>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () =>
            resolve({ name: f.name, type: f.type, size: f.size, dataUrl: String(reader.result) });
          reader.onerror = () => reject(reader.error);
          reader.readAsDataURL(f);
        }),
    ),
  );
}
