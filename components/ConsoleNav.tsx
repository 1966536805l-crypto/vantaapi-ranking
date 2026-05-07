import Link from "next/link";

type Lang = "en" | "zh";

const labels = {
  en: {
    brand: "JinMing AI Coding Lab",
    switchLabel: "中文",
    switchHref: "/?lang=zh",
    items: [
      ["/", "Home"],
      ["/today", "Today"],
      ["/learn", "Subjects"],
      ["/questions", "Problems"],
      ["/mistakes", "Mistakes"],
      ["/cpp", "C++ Lab"],
      ["/ai", "AI Coach"],
      ["/projects", "Projects"],
      ["/status", "Progress"],
    ],
  },
  zh: {
    brand: "金明 AI 编程实验室",
    switchLabel: "EN",
    switchHref: "/",
    items: [
      ["/?lang=zh", "首页"],
      ["/today?lang=zh", "今日"],
      ["/learn?lang=zh", "科目"],
      ["/questions?lang=zh", "题库"],
      ["/mistakes?lang=zh", "错题"],
      ["/cpp?lang=zh", "C++ 实验"],
      ["/ai?lang=zh", "AI 教练"],
      ["/projects?lang=zh", "项目"],
      ["/status?lang=zh", "进度"],
    ],
  },
} satisfies Record<Lang, { brand: string; switchLabel: string; switchHref: string; items: string[][] }>;

export default function ConsoleNav({ lang = "en" }: { lang?: Lang }) {
  const copy = labels[lang];

  return (
    <nav className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
        <Link href={lang === "zh" ? "/?lang=zh" : "/"} className="flex items-baseline gap-3">
          <span className="font-serif text-[25px] leading-none tracking-tight text-slate-950">
            JinMing Lab
          </span>
          <span className="eyebrow hidden sm:inline">{copy.brand}</span>
        </Link>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <ul className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[14px]">
            {copy.items.map(([href, label]) => (
              <li key={href}>
                <Link
                  href={href}
                  className="text-slate-700 transition-colors hover:text-[color:var(--accent-link)]"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
          <Link
            href={copy.switchHref}
            className="border border-slate-300 px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.12em] text-slate-600 hover:border-slate-500 hover:text-slate-950"
          >
            {copy.switchLabel}
          </Link>
        </div>
      </div>
    </nav>
  );
}
