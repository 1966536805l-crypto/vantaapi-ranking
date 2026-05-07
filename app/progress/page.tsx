import Link from "next/link";
import StudyShell from "@/components/layout/StudyShell";
import { prisma } from "@/lib/prisma";
import { requireServerUser } from "@/lib/server-auth";

export const dynamic = "force-dynamic";

export default async function ProgressPage() {
  const user = await requireServerUser();
  const [items, totalLessons] = await Promise.all([
    prisma.userProgress.findMany({ where: { userId: user.id }, include: { lesson: { include: { course: true } } }, orderBy: { updatedAt: "desc" } }),
    prisma.lesson.count({ where: { isPublished: true, course: { isPublished: true } } }),
  ]);
  const completed = items.filter((item) => item.status === "COMPLETED").length;
  const percent = totalLessons > 0 ? Math.round((completed / totalLessons) * 100) : 0;

  return (
    <StudyShell>
      <section className="apple-card soft-gradient p-5">
        <p className="eyebrow">My Progress</p>
        <h1 className="mt-3 font-serif text-4xl">学习进度</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-[color:var(--muted)]">这里记录你已经开始和完成的知识点。MVP 保持清楚可用，先把学习闭环跑顺。</p>
      </section>

      <div className="mt-5 grid gap-3 md:grid-cols-3">
        <Stat label="已完成" value={`${completed}`} />
        <Stat label="已开始" value={`${items.length}`} />
        <Stat label="完成率" value={`${percent}%`} />
      </div>

      <div className="mt-5 space-y-3">
        {items.map((item) => {
          const direction = item.lesson.course.direction === "ENGLISH" ? "english" : "cpp";
          return (
            <Link key={item.id} href={`/learn/${direction}/${item.lesson.course.slug}/${item.lesson.slug}`} className="apple-card apple-card-hover block p-5">
              <p className="eyebrow">{item.lesson.course.direction === "ENGLISH" ? "英语" : "C++"} · {item.lesson.course.title}</p>
              <div className="mt-2 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <h2 className="text-xl font-semibold">{item.lesson.title}</h2>
                <span className={`w-fit rounded-full border px-3 py-1 text-xs font-semibold ${item.status === "COMPLETED" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-blue-200 bg-blue-50 text-blue-700"}`}>{item.status === "COMPLETED" ? "已完成" : "学习中"}</span>
              </div>
              <p className="mt-3 text-sm text-[color:var(--muted)]">最近更新：{item.updatedAt.toLocaleString("zh-CN")}</p>
            </Link>
          );
        })}
        {items.length === 0 && (
          <div className="apple-card border-dashed p-7 text-center">
            <p className="text-[color:var(--muted)]">还没有学习记录</p>
            <div className="mt-5 flex justify-center gap-3">
              <Link href="/english" className="apple-button-primary px-4 py-2 text-sm">开始英语</Link>
              <Link href="/cpp" className="apple-button-secondary px-4 py-2 text-sm">开始 C++</Link>
            </div>
          </div>
        )}
      </div>
    </StudyShell>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return <div className="apple-card p-4"><p className="eyebrow">{label}</p><p className="mt-2 font-serif text-3xl">{value}</p></div>;
}
