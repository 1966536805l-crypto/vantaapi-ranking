import ConsoleNav from "@/components/ConsoleNav";
import ParticleBackground from "@/components/ParticleBackground";

type ConsolePageProps = {
  eyebrow?: string;
  title: string;
  description: string;
  children: React.ReactNode;
};

export default function ConsolePage({
  eyebrow,
  title,
  description,
  children,
}: ConsolePageProps) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f5f7fb] text-slate-950">
      <ParticleBackground />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(15,23,42,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.045)_1px,transparent_1px)] bg-[size:44px_44px]" />
      <div className="pointer-events-none absolute left-8 top-28 h-28 w-28 rounded-full border border-sky-300/45 bg-sky-100/60" />
      <div className="pointer-events-none absolute right-10 top-24 h-0 w-0 border-l-[70px] border-r-[70px] border-b-[120px] border-l-transparent border-r-transparent border-b-amber-200/45" />
      <div className="pointer-events-none absolute bottom-20 left-1/2 h-20 w-20 rounded-full border-[18px] border-blue-200/50" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_16%,rgba(186,230,253,0.55),transparent_28%),radial-gradient(circle_at_82%_4%,rgba(254,240,138,0.45),transparent_26%),linear-gradient(180deg,rgba(255,255,255,0.76),rgba(245,247,251,0.92)_70%)]" />
      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-5 sm:px-7 lg:px-10">
        <ConsoleNav />
        <header className="py-8 sm:py-12">
          {eyebrow && (
            <p className="mb-4 inline-flex rounded-sm border border-blue-200 bg-white px-3 py-1.5 font-mono text-xs font-semibold uppercase tracking-[0.22em] text-blue-700 shadow-sm">
              USACO TRAINING / {eyebrow}
            </p>
          )}
          <h1 className="max-w-5xl text-4xl font-black leading-[0.95] text-slate-950 sm:text-6xl">
            {title}
          </h1>
          <p className="mt-5 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">
            {description}
          </p>
          <div className="mt-6 grid gap-2 font-mono text-[11px] uppercase text-slate-500 sm:grid-cols-4">
            {["Bronze", "Silver", "Gold", "Platinum"].map((level, index) => (
              <div
                key={level}
                className="flex items-center justify-between border border-slate-200 bg-white px-3 py-2 shadow-sm"
              >
                <span>{level}</span>
                <span className={index < 2 ? "text-emerald-700" : "text-amber-700"}>
                  {index < 2 ? "active" : "queued"}
                </span>
              </div>
            ))}
          </div>
        </header>
        {children}
      </div>
    </main>
  );
}
