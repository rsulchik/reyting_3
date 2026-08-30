import { useState, type ReactNode } from "react";
import { findAccount, useSession } from "@/lib/auth";

export function AuthGate({ children }: { children: ReactNode }) {
  const { loaded, account, signIn } = useSession();
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  if (!loaded) return null;
  if (account) return <>{children}</>;

  return (
    <main className="grid min-h-screen place-items-center bg-paper px-6 py-16">
      <div className="w-full max-w-md space-y-8 rounded-3xl bg-card p-8 ring-1 ring-black/5">
        <div className="space-y-2">
          <div className="font-display text-2xl font-semibold text-brand">TMK</div>
          <h1 className="text-2xl font-semibold">Ulgama girmek</h1>
          <p className="text-sm text-muted-foreground">
            Admin ýa-da fakultet hasabyňyz bilen giriň.
          </p>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const acc = findAccount(login, password);
            if (!acc) {
              setError("Login ýa-da parol nädogry.");
              return;
            }
            setError("");
            signIn(acc.login);
          }}
          className="space-y-4"
        >
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Login</label>
            <input
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              autoComplete="username"
              placeholder="admin"
              className="w-full rounded-xl bg-secondary px-4 py-2.5 text-sm ring-1 ring-black/10 outline-none focus:ring-brand"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Parol</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              placeholder="••••••"
              className="w-full rounded-xl bg-secondary px-4 py-2.5 text-sm ring-1 ring-black/10 outline-none focus:ring-brand"
            />
          </div>
          {error && (
            <div className="rounded-xl bg-secondary px-4 py-2.5 text-sm text-destructive ring-1 ring-destructive/20">
              {error}
            </div>
          )}
          <button className="w-full rounded-full bg-brand px-5 py-2.5 text-sm font-medium text-white transition hover:brightness-110">
            Gir
          </button>
        </form>
      </div>
    </main>
  );
}
