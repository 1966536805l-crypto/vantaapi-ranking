import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";

const navItems = [
  { href: "/", label: "Dashboard" },
  { href: "/cpp", label: "C++ Run" },
  { href: "/learn", label: "Training" },
  { href: "/mistakes", label: "Wrong Set" },
  { href: "/questions", label: "Questions" },
  { href: "/projects", label: "Build" },
  { href: "/status", label: "Status" },
  { href: "/games", label: "Drills" },
  { href: "/ai", label: "AI Coach" },
];

export default function ConsoleNav() {
  return (
    <nav className="flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-center sm:justify-between dark:border-slate-700">
      <Link href="/" className="flex items-center gap-3">
        <span className="relative grid h-12 w-12 place-items-center border border-blue-200 bg-white shadow-sm dark:border-blue-700 dark:bg-slate-800">
          <span className="h-0 w-0 border-l-[10px] border-r-[10px] border-b-[18px] border-l-transparent border-r-transparent border-b-blue-700 dark:border-b-blue-400" />
          <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-amber-400" />
        </span>
        <div>
          <p className="font-mono text-lg font-black tracking-[0.14em] text-slate-950 dark:text-slate-100">IMMORTAL</p>
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-blue-700 dark:text-blue-400">
            Contest Console
          </p>
        </div>
      </Link>
      <div className="flex flex-wrap gap-2 font-mono text-xs items-center">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="border border-slate-200 bg-white px-3 py-2 text-slate-600 shadow-sm transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-blue-600 dark:hover:bg-slate-700 dark:hover:text-blue-400"
          >
            {item.label}
          </Link>
        ))}
        <ThemeToggle />
      </div>
    </nav>
  );
}
