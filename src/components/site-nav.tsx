import { Link, useRouterState } from "@tanstack/react-router";
import { useSession } from "@/lib/auth";

const links = [
  { to: "/", label: "Baş sahypa" },
  { to: "/reyting", label: "Reýting" },
  { to: "/admin", label: "Admin" },
] as const;

export function SiteNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { account, faculty, signOut } = useSession();
  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-paper/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <div className="flex items-center gap-8">
          <Link to="/" className="font-display text-xl font-semibold tracking-tight text-brand">
            TMK
          </Link>
          <div className="hidden items-center gap-6 md:flex">
            {links.map((l) => {
              const active = pathname === l.to || (l.to !== "/" && pathname.startsWith(l.to));
              return (
                <Link
                  key={l.to}
                  to={l.to}
                  className={
                    "text-sm font-medium transition-colors " +
                    (active ? "text-ink" : "text-ink/60 hover:text-brand")
                  }
                >
                  {l.label}
                </Link>
              );
            })}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <p className="text-xs font-semibold leading-tight">{account?.login}</p>
            <p className="text-[10px] text-muted-foreground">
              {account?.role === "admin" ? "Administrator" : (faculty ?? "Fakultet")}
            </p>
          </div>
          <button
            onClick={signOut}
            className="rounded-full bg-secondary px-3 py-1.5 text-xs font-semibold hover:bg-accent"
          >
            Çyk
          </button>
        </div>
      </div>
    </nav>
  );
}
