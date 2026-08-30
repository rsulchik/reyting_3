import { useLocalStorage } from "@/hooks/use-local-storage";
import { FACULTIES } from "@/lib/mock-data";

export const FACULTIES_KEY = "studrate:faculties";
export const CATEGORIES_KEY = "studrate:categories";
export const PENALTIES_KEY = "studrate:penalties";

export type Category = { id: string; name: string };
export type PenaltyRule = { id: string; action: string; points: number };

export const DEFAULT_CATEGORIES: Category[] = [
  { id: "cat-ylmy", name: "Talyplaryň ylmy-usuly işleri" },
  { id: "cat-jemgyyet", name: "Jemgyýetçilik işleri" },
  { id: "cat-sport", name: "Sport we medeniýet" },
];

export const DEFAULT_PENALTIES: PenaltyRule[] = [
  { id: "pen-kayinc", action: "Käýinç almak", points: 10 },
  { id: "pen-giç", action: "Sapaga gijä galmak", points: 2 },
  { id: "pen-galmak", action: "Sebäpsiz sapak galdyrmak", points: 5 },
];

export function useFaculties() {
  return useLocalStorage<string[]>(FACULTIES_KEY, FACULTIES);
}

export function useCategories() {
  return useLocalStorage<Category[]>(CATEGORIES_KEY, DEFAULT_CATEGORIES);
}

export function usePenalties() {
  return useLocalStorage<PenaltyRule[]>(PENALTIES_KEY, DEFAULT_PENALTIES);
}