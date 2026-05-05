import Link from "next/link";
import { prisma } from "@/lib/prisma";
import ParticleBackground from "@/components/ParticleBackground";

export const dynamic = "force-dynamic";

type CategoryCard = {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  _count: {
    rankings: number;
  };
};

export default async function Home() {
  const categories = await prisma.category.findMany({
    include: {
      _count: {
        select: { rankings: true }
      }
    }
  });

  return (
    <main className="relative min-h-screen bg-gradient-to-br from-[#07070a] via-[#0a0a0f] to-[#0d0a08] text-stone-100">
      <ParticleBackground />
      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl flex-col px-5 py-6 sm:px-8 lg:px-10">
        <nav className="flex items-center justify-between border-b border-white/10 pb-5">
          <Link href="/" className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-lg border border-lime-300/40 bg-lime-300 text-sm font-black text-black">
              I
            </span>
            <span className="text-xl font-semibold tracking-normal">Immortal</span>
          </Link>
          <div className="flex items-center gap-2 text-sm">
            <Link
              href="/ai"
              className="rounded-lg border border-white/10 px-4 py-2 text-stone-200 transition hover:border-lime-300/60 hover:text-lime-200"
            >
              AI 助手
            </Link>
            <Link
              href="/submit"
              className="rounded-lg bg-lime-300 px-4 py-2 font-semibold text-black transition hover:bg-lime-200"
            >
              提交
            </Link>
          </div>
        </nav>

        <header className="grid gap-10 py-14 lg:grid-cols-[1.05fr_0.95fr] lg:items-end lg:py-20">
          <div>
            <p className="mb-5 inline-flex rounded-full border border-lime-300/20 bg-gradient-to-r from-lime-300/10 to-yellow-300/10 px-4 py-2 text-sm font-medium text-lime-200 shadow-lg shadow-lime-300/10">
              Curated by builders, ranked by signal
            </p>
            <h1 className="glow-gold max-w-4xl bg-gradient-to-br from-white via-lime-100 to-yellow-200 bg-clip-text text-6xl font-bold leading-none text-transparent sm:text-7xl lg:text-8xl">
              Immortal
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-stone-300">
              一个更锋利的 AI 与工具发现榜。收集真实项目、筛选有效信号，把值得长期关注的东西放到台前。
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/ai"
                className="rounded-lg bg-white px-5 py-3 font-semibold text-black transition hover:bg-lime-200"
              >
                开始对话
              </Link>
              <Link
                href="/submit"
                className="rounded-lg border border-white/10 px-5 py-3 font-semibold text-stone-100 transition hover:border-white/30 hover:bg-white/[0.04]"
              >
                提交项目
              </Link>
            </div>
            <div className="mt-6 rounded-lg border border-yellow-500/20 bg-gradient-to-br from-yellow-900/10 to-orange-900/10 p-4 text-xs leading-relaxed text-stone-400 backdrop-blur-sm">
              <p className="font-semibold text-yellow-200">⚠️ 免责声明</p>
              <p className="mt-2">本平台仅提供工具展示服务。所有提交内容均由用户自行发布，平台不对其真实性、合法性、准确性承担任何责任。用户提交内容产生的一切法律责任由提交者本人承担，与本平台无关。如发现违法违规内容，请联系我们删除。</p>
            </div>
          </div>

          <div className="grid gap-3 rounded-lg border border-white/10 bg-white/[0.04] p-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <span className="text-sm text-stone-400">Live Index</span>
              <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-semibold text-emerald-200">
                Online
              </span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <p className="text-3xl font-semibold text-white">{categories.length}</p>
                <p className="mt-1 text-sm text-stone-400">分类</p>
              </div>
              <div>
                <p className="text-3xl font-semibold text-white">
                  {categories.reduce(
                    (total, category) => total + category._count.rankings,
                    0
                  )}
                </p>
                <p className="mt-1 text-sm text-stone-400">项目</p>
              </div>
              <div>
                <p className="text-3xl font-semibold text-lime-200">AI</p>
                <p className="mt-1 text-sm text-stone-400">助手</p>
              </div>
            </div>
            <div className="rounded-lg bg-black/30 p-4 text-sm leading-6 text-stone-300">
              Immortal 会把新项目放进对应榜单。少一点噪音，多一点可用的判断。
            </div>
          </div>
        </header>

        <section className="pb-14">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold text-white">榜单分类</h2>
              <p className="mt-2 text-sm text-stone-400">
                浏览不同赛道里正在被提交和发现的项目。
              </p>
            </div>
          </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {(categories as CategoryCard[]).map((category) => (
            <Link
              key={category.id}
              href={`/category/${category.id}`}
              className="card-hover group rounded-lg border border-white/10 bg-gradient-to-br from-white/[0.04] to-white/[0.02] p-6 backdrop-blur-sm transition hover:border-lime-300/40 hover:bg-gradient-to-br hover:from-lime-300/[0.08] hover:to-yellow-300/[0.04]"
            >
              <div className="mb-6 flex items-center justify-between">
                {category.icon && (
                  <span className="text-4xl">{category.icon}</span>
                )}
                <span className="text-sm text-stone-500 transition group-hover:text-lime-200">
                  查看
                </span>
              </div>
              <div>
                <h3 className="text-2xl font-semibold text-white">
                  {category.name}
                </h3>
                {category.description && (
                  <p className="mt-3 min-h-12 text-sm leading-6 text-stone-400">
                    {category.description}
                  </p>
                )}
              </div>
              <div className="mt-6 border-t border-white/10 pt-4 text-sm text-stone-400">
                {category._count.rankings} 个项目
              </div>
            </Link>
          ))}
        </div>

        {categories.length === 0 && (
          <div className="rounded-lg border border-dashed border-white/15 py-16 text-center">
            <p className="text-stone-400">暂无分类，请先添加分类</p>
          </div>
        )}
        </section>

        <footer className="mt-auto border-t border-white/10 py-6 text-center text-xs text-stone-500">
          <p className="mb-2 font-semibold">Immortal / signal over noise</p>
          <p className="text-stone-600">用户提交内容的法律责任由提交者承担 · 平台不对内容真实性负责</p>
        </footer>
      </div>
    </main>
  );
}
