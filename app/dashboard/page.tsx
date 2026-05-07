import Link from "next/link";
import { requireServerUser } from "@/lib/server-auth";
import { prisma } from "@/lib/prisma";
import { AppleStudyHeader } from "@/components/learning/ModuleHub";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await requireServerUser();
  const [progress, wrongCount, totalLessons, englishTotal, cppTotal] = await Promise.all([
    prisma.userProgress.findMany({ where: { userId: user.id }, include: { lesson: { include: { course: true } } }, orderBy: { updatedAt: "desc" } }),
    prisma.wrongQuestion.count({ where: { userId: user.id } }),
    prisma.lesson.count({ where: { isPublished: true, course: { isPublished: true } } }),
    prisma.lesson.count({ where: { isPublished: true, course: { direction: "ENGLISH", isPublished: true } } }),
    prisma.lesson.count({ where: { isPublished: true, course: { direction: "CPP", isPublished: true } } }),
  ]);
  const completed = progress.filter((item) => item.status === "COMPLETED").length;
  const englishCompleted = progress.filter((item) => item.status === "COMPLETED" && item.lesson.course.direction === "ENGLISH").length;
  const cppCompleted = progress.filter((item) => item.status === "COMPLETED" && item.lesson.course.direction === "CPP").length;
  const percent = totalLessons ? Math.round((completed / totalLessons) * 100) : 0;
  const englishPercent = englishTotal ? Math.round((englishCompleted / englishTotal) * 100) : 0;
  const cppPercent = cppTotal ? Math.round((cppCompleted / cppTotal) * 100) : 0;

  return (
    <main className="apple-page pb-12 pt-4">
      <AppleStudyHeader />
      <section className="apple-shell py-7">
        <div className="apple-card soft-gradient p-5">
          <p className="eyebrow">Dashboard</p>
          <h1 className="mt-3 font-serif text-4xl">Learning Dashboard</h1>
          <p className="mt-3 text-sm text-[color:var(--muted)]">{user.email} can track progress wrong answers and active courses here.</p>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <Stat label="Completed" value={`${completed}`} />
          <Stat label="Completion" value={`${percent}%`} />
          <Stat label="Wrong Items" value={`${wrongCount}`} />
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <Link href="/english" className="apple-card apple-card-hover p-5"><p className="eyebrow">English {englishCompleted}/{englishTotal}</p><h2 className="mt-3 text-2xl font-semibold">Continue English</h2><p className="mt-2 text-sm text-[color:var(--muted)]">Completion {englishPercent}%</p></Link>
          <Link href="/cpp" className="apple-card apple-card-hover p-5"><p className="eyebrow">C++ {cppCompleted}/{cppTotal}</p><h2 className="mt-3 text-2xl font-semibold">Continue C++</h2><p className="mt-2 text-sm text-[color:var(--muted)]">Completion {cppPercent}%</p></Link>
          <Link href="/progress" className="apple-card apple-card-hover p-5"><p className="eyebrow">Progress</p><h2 className="mt-3 text-2xl font-semibold">Full Progress</h2></Link>
          <Link href="/wrong" className="apple-card apple-card-hover p-5"><p className="eyebrow">Wrong Questions</p><h2 className="mt-3 text-2xl font-semibold">Wrong Bank</h2></Link>
        </div>
      </section>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return <div className="apple-card p-4"><p className="eyebrow">{label}</p><p className="mt-2 font-serif text-4xl">{value}</p></div>;
}
