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
    <main className="relative min-h-screen overflow-hidden bg-[#05070b] text-stone-100">
      <ParticleBackground />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(34,211,238,0.16),transparent_32%),radial-gradient(circle_at_80%_10%,rgba(132,204,22,0.12),transparent_28%)]" />
      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl flex-col px-5 py-6 sm:px-8 lg:px-10">
        <ConsoleNav />
        <header className="py-10 sm:py-14">
          {eyebrow && (
            <p className="mb-4 inline-flex rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-sm font-medium text-cyan-100">
              {eyebrow}
            </p>
          )}
          <h1 className="max-w-4xl bg-gradient-to-br from-white via-cyan-100 to-lime-200 bg-clip-text text-5xl font-bold leading-none text-transparent sm:text-6xl">
            {title}
          </h1>
          <p className="mt-5 max-w-2xl text-sm leading-7 text-stone-400 sm:text-base">
            {description}
          </p>
        </header>
        {children}
      </div>
    </main>
  );
}
