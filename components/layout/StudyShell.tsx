import Link from "next/link";
import { getServerUser } from "@/lib/server-auth";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/today", label: "Today" },
  { href: "/english", label: "English" },
  { href: "/cpp", label: "C++" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/wrong", label: "Wrong Bank" },
];

export default async function StudyShell({ children }: { children: React.ReactNode }) {
  const user = await getServerUser();

  return (
    <main className="apple-page pb-10 pt-3">
      <div className="apple-shell flex min-h-screen flex-col">
        <header className="apple-nav px-4 py-2.5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <Link href="/" className="flex items-center gap-3">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-slate-950 text-[10px] font-semibold text-white shadow-sm">VA</span>
              <span>
                <span className="block font-semibold leading-none">VantaAPI</span>
                <span className="text-xs text-[color:var(--muted)]">AI tools and coding lab</span>
              </span>
            </Link>

            <nav className="flex flex-wrap items-center gap-2 text-sm">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href} className="apple-pill px-3 py-1.5">
                  {item.label}
                </Link>
              ))}
              {user?.role === "ADMIN" && <Link href="/admin" className="apple-pill border-amber-200 bg-amber-50/80 px-3 py-1.5 text-amber-800">Admin</Link>}
              {user ? (
                <form action="/api/auth/logout" method="post"><button className="apple-button-secondary px-3 py-1.5">Logout</button></form>
              ) : (
                <Link href="/login" className="apple-button-primary px-4 py-1.5">Login</Link>
              )}
            </nav>
          </div>
        </header>
        <div className="flex-1 py-5">{children}</div>
      </div>
    </main>
  );
}
