import Link from "next/link";

const navItems = [
  { href: "/", label: "首页" },
  { href: "/learn", label: "学习" },
  { href: "/mistakes", label: "错题" },
  { href: "/projects", label: "项目" },
  { href: "/status", label: "状态" },
  { href: "/games", label: "小游戏" },
  { href: "/ai", label: "AI" },
];

export default function ConsoleNav() {
  return (
    <nav className="flex flex-col gap-4 border-b border-cyan-300/10 pb-5 sm:flex-row sm:items-center sm:justify-between">
      <Link href="/" className="flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-lg border border-cyan-300/40 bg-cyan-300 text-sm font-black text-black shadow-lg shadow-cyan-300/20">
          I
        </span>
        <div>
          <p className="text-lg font-semibold text-white">Immortal</p>
          <p className="text-xs text-cyan-200/70">Personal Console</p>
        </div>
      </Link>
      <div className="flex flex-wrap gap-2 text-sm">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-stone-300 transition hover:border-cyan-300/50 hover:text-cyan-100"
          >
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
