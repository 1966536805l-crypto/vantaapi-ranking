import Link from "next/link";
import ConsoleNav from "@/components/ConsoleNav";

type Lang = "en" | "zh";

type ConsolePageProps = {
  eyebrow?: string;
  title: string;
  description: string;
  children: React.ReactNode;
  lang?: Lang;
};

const footer = {
  en: {
    note: "Personal Study Tools",
    privacy: "Privacy",
    terms: "Terms",
    disclaimer: "Disclaimer",
    divisions: "Divisions",
  },
  zh: {
    note: "个人学习工具",
    privacy: "隐私",
    terms: "条款",
    disclaimer: "说明",
    divisions: "分级",
  },
};

export default function ConsolePage({
  eyebrow,
  title,
  description,
  children,
  lang = "en",
}: ConsolePageProps) {
  const t = footer[lang];
  const suffix = lang === "zh" ? "?lang=zh" : "";

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <ConsoleNav lang={lang} />

      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto w-full max-w-6xl px-4 py-7 sm:px-6 sm:py-9">
          {eyebrow && <p className="eyebrow mb-3">{eyebrow}</p>}
          <h1 className="font-serif text-[32px] leading-[1.08] tracking-tight text-slate-900 sm:text-[42px]">
            {title}
          </h1>
          <p className="mt-3 max-w-2xl text-[14px] leading-6 text-slate-600">{description}</p>

          <div className="mt-5 flex flex-wrap items-center gap-2 text-slate-500">
            <span className="eyebrow">{t.divisions}</span>
            <span className="text-slate-700">/</span>
            <span className="division division-bronze"><span className="dot" /> Bronze</span>
            <span className="division division-silver"><span className="dot" /> Silver</span>
            <span className="division division-gold"><span className="dot" /> Gold</span>
            <span className="division division-platinum"><span className="dot" /> Platinum</span>
          </div>
        </div>
      </header>

      <div className="mx-auto w-full max-w-6xl px-4 py-7 sm:px-6 sm:py-9">{children}</div>

      <footer className="border-t border-slate-200">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-6 py-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} VantaAPI · {t.note}</p>
          <div className="flex items-center gap-5">
            <Link className="hover:text-slate-900" href={`/privacy${suffix}`}>{t.privacy}</Link>
            <Link className="hover:text-slate-900" href={`/terms${suffix}`}>{t.terms}</Link>
            <Link className="hover:text-slate-900" href={`/disclaimer${suffix}`}>{t.disclaimer}</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
