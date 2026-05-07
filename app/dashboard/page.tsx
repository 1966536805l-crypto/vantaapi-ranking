import Link from "next/link";
import { requireServerUser } from "@/lib/server-auth";
import { prisma } from "@/lib/prisma";
import { AppleStudyHeader } from "@/components/learning/ModuleHub";

export const dynamic = "force-dynamic";

type NextLesson = {
  slug: string;
  title: string;
  summary: string;
  course: {
    slug: string;
    title: string;
  };
};

function lessonHref(direction: "english" | "cpp", lesson: NextLesson | null) {
  return lesson ? `/learn/${direction}/${lesson.course.slug}/${lesson.slug}` : `/${direction === "english" ? "english" : "cpp"}`;
}

export default async function DashboardPage() {
  const user = await requireServerUser();
  const [progress, wrongCount, totalLessons, englishTotal, cppTotal, nextEnglishLesson, nextCppLesson] = await Promise.all([
    prisma.userProgress.findMany({
      where: { userId: user.id },
      include: { lesson: { include: { course: true } } },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.wrongQuestion.count({ where: { userId: user.id } }),
    prisma.lesson.count({ where: { isPublished: true, course: { isPublished: true } } }),
    prisma.lesson.count({ where: { isPublished: true, course: { direction: "ENGLISH", isPublished: true } } }),
    prisma.lesson.count({ where: { isPublished: true, course: { direction: "CPP", isPublished: true } } }),
    prisma.lesson.findFirst({
      where: {
        isPublished: true,
        course: { direction: "ENGLISH", isPublished: true },
        progress: { none: { userId: user.id, status: "COMPLETED" } },
      },
      orderBy: [{ course: { sortOrder: "asc" } }, { sortOrder: "asc" }],
      select: { slug: true, title: true, summary: true, course: { select: { slug: true, title: true } } },
    }),
    prisma.lesson.findFirst({
      where: {
        isPublished: true,
        course: { direction: "CPP", isPublished: true },
        progress: { none: { userId: user.id, status: "COMPLETED" } },
      },
      orderBy: [{ course: { sortOrder: "asc" } }, { sortOrder: "asc" }],
      select: { slug: true, title: true, summary: true, course: { select: { slug: true, title: true } } },
    }),
  ]);

  const completed = progress.filter((item) => item.status === "COMPLETED").length;
  const englishCompleted = progress.filter((item) => item.status === "COMPLETED" && item.lesson.course.direction === "ENGLISH").length;
  const cppCompleted = progress.filter((item) => item.status === "COMPLETED" && item.lesson.course.direction === "CPP").length;
  const percent = totalLessons ? Math.round((completed / totalLessons) * 100) : 0;
  const englishPercent = englishTotal ? Math.round((englishCompleted / englishTotal) * 100) : 0;
  const cppPercent = cppTotal ? Math.round((cppCompleted / cppTotal) * 100) : 0;
  const recent = progress.slice(0, 3);

  return (
    <main className="apple-page pb-12 pt-4">
      <AppleStudyHeader />
      <section className="apple-shell py-7">
        <div className="apple-card soft-gradient p-5">
          <p className="eyebrow">Continue Learning</p>
          <h1 className="mt-3 font-serif text-4xl">Your next study step</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[color:var(--muted)]">
            {user.email} can jump back into English, C++, today&apos;s plan, and wrong-question review from one place.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link href="/today" className="apple-button-primary px-4 py-2 text-sm">Open Today&apos;s Plan</Link>
            <Link href="/wrong" className="apple-button-secondary px-4 py-2 text-sm">Review Wrong Questions</Link>
            <Link href="/progress" className="apple-button-secondary px-4 py-2 text-sm">Full Progress</Link>
          </div>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <Stat label="Completed" value={`${completed}/${totalLessons}`} />
          <Stat label="Completion" value={`${percent}%`} />
          <Stat label="Wrong Items" value={`${wrongCount}`} />
        </div>

        <section className="mt-4 grid gap-3 lg:grid-cols-2">
          <NextActionCard
            eyebrow={`English ${englishCompleted}/${englishTotal}`}
            title={nextEnglishLesson?.title || "English path complete"}
            body={nextEnglishLesson?.summary || "You have completed the published English lessons. Use review and typing practice to keep momentum."}
            href={lessonHref("english", nextEnglishLesson)}
            progress={englishPercent}
            cta="Continue English"
          />
          <NextActionCard
            eyebrow={`C++ ${cppCompleted}/${cppTotal}`}
            title={nextCppLesson?.title || "C++ path complete"}
            body={nextCppLesson?.summary || "You have completed the published C++ lessons. Review code-reading and output-prediction questions next."}
            href={lessonHref("cpp", nextCppLesson)}
            progress={cppPercent}
            cta="Continue C++"
          />
        </section>

        <section className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
          <div className="apple-card p-5">
            <p className="eyebrow">Learning Loop</p>
            <h2 className="mt-2 text-2xl font-semibold">Today, practice, review</h2>
            <div className="mt-4 grid gap-2 sm:grid-cols-3">
              <Link href="/today" className="dense-row"><span className="text-sm font-semibold">Today Plan</span><span className="text-xs text-[color:var(--muted)]">Daily entry</span></Link>
              <Link href="/wrong" className="dense-row"><span className="text-sm font-semibold">Wrong Bank</span><span className="text-xs text-[color:var(--muted)]">Fix mistakes</span></Link>
              <Link href="/tools" className="dense-row"><span className="text-sm font-semibold">AI Tools</span><span className="text-xs text-[color:var(--muted)]">Support only</span></Link>
            </div>
          </div>

          <div className="apple-card p-5">
            <p className="eyebrow">Recent Activity</p>
            <h2 className="mt-2 text-2xl font-semibold">Last touched lessons</h2>
            <div className="mt-4 grid gap-2">
              {recent.map((item) => (
                <Link
                  key={item.id}
                  href={`/learn/${item.lesson.course.direction === "ENGLISH" ? "english" : "cpp"}/${item.lesson.course.slug}/${item.lesson.slug}`}
                  className="dense-row"
                >
                  <span className="text-sm font-semibold">{item.lesson.title}</span>
                  <span className="text-xs text-[color:var(--muted)]">{item.status.toLowerCase().replace("_", " ")}</span>
                </Link>
              ))}
              {recent.length === 0 && <p className="text-sm leading-6 text-[color:var(--muted)]">No saved lesson activity yet. Start with English or C++.</p>}
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return <div className="apple-card p-4"><p className="eyebrow">{label}</p><p className="mt-2 font-serif text-4xl">{value}</p></div>;
}

function NextActionCard({
  eyebrow,
  title,
  body,
  href,
  progress,
  cta,
}: {
  eyebrow: string;
  title: string;
  body: string;
  href: string;
  progress: number;
  cta: string;
}) {
  return (
    <Link href={href} className="apple-card apple-card-hover p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="eyebrow">{eyebrow}</p>
        <span className="apple-pill px-3 py-1 text-xs">{progress}%</span>
      </div>
      <h2 className="mt-3 text-2xl font-semibold">{title}</h2>
      <p className="mt-3 min-h-16 text-sm leading-6 text-[color:var(--muted)]">{body}</p>
      <span className="mt-4 inline-flex rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white">{cta}</span>
    </Link>
  );
}
