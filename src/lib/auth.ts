import { useEffect, useState } from "react";
import { useFaculties } from "@/lib/taxonomy";

export type Account = {
  login: string;
  password: string;
  role: "admin" | "faculty";
  /** index into the faculties list; undefined for admin */
  facultyIndex?: number;
};

export const ACCOUNTS: Account[] = [
  { login: "admin", password: "admin", role: "admin" },
  { login: "Fakultet 1", password: "qwerty1", role: "faculty", facultyIndex: 0 },
  { login: "Fakultet 2", password: "qwerty2", role: "faculty", facultyIndex: 1 },
  { login: "Fakultet 3", password: "qwerty3", role: "faculty", facultyIndex: 2 },
  { login: "Fakultet 4", password: "qwerty4", role: "faculty", facultyIndex: 3 },
];

export const SESSION_KEY = "studrate:session";

export function findAccount(login: string, password: string) {
  const l = login.trim().toLowerCase();
  return ACCOUNTS.find((a) => a.login.toLowerCase() === l && a.password === password) ?? null;
}

let currentLogin: string | null = null;
const listeners = new Set<(v: string | null) => void>();

function setCurrentLogin(v: string | null) {
  currentLogin = v;
  listeners.forEach((fn) => fn(v));
}

export function useSession() {
  const [login, setLogin] = useState<string | null>(currentLogin);
  const [loaded, setLoaded] = useState(false);
  const [faculties] = useFaculties();

  useEffect(() => {
    listeners.add(setLogin);
    try {
      const stored = window.localStorage.getItem(SESSION_KEY);
      currentLogin = stored;
      setLogin(stored);
    } catch {
      /* ignore */
    }
    setLoaded(true);
    return () => {
      listeners.delete(setLogin);
    };
  }, []);

  const account = login ? (ACCOUNTS.find((a) => a.login === login) ?? null) : null;

  const signIn = (l: string) => {
    try {
      window.localStorage.setItem(SESSION_KEY, l);
    } catch {
      /* ignore */
    }
    setCurrentLogin(l);
  };

  const signOut = () => {
    try {
      window.localStorage.removeItem(SESSION_KEY);
    } catch {
      /* ignore */
    }
    setCurrentLogin(null);
  };


  const isAdmin = account?.role === "admin";
  const faculty =
    account && account.facultyIndex !== undefined ? (faculties[account.facultyIndex] ?? null) : null;

  return { loaded, account, isAdmin, faculty, signIn, signOut };
}
