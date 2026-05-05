import Link from "next/link";
import { prisma } from "@/lib/prisma";

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
    <main className="min-h-screen bg-[#07070a] text-stone-100">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-5 py-6 sm:px-8 lg:px-10">
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
            <p className="mb-5 inline-flex rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-lime-200">
              Curated by builders, ranked by signal
            </p>
            <h1 className="max-w-4xl text-6xl font-semibold leading-none text-white sm:text-7xl lg:text-8xl">
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
              className="group rounded-lg border border-white/10 bg-white/[0.04] p-6 transition hover:-translate-y-1 hover:border-lime-300/40 hover:bg-white/[0.07]"
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

        <footer className="mt-auto border-t border-white/10 py-6 text-sm text-stone-500">
          Immortal / signal over noise
        </footer>
      </div>
    </main>
  );
}
