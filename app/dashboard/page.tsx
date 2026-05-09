import Link from "next/link";
import { headers } from "next/headers";
import { requireServerUser } from "@/lib/server-auth";
import { prisma } from "@/lib/prisma";
import { AppleStudyHeader } from "@/components/learning/ModuleHub";
import { localizedHref, resolveInterfaceLanguage, type InterfaceLanguage, type PageSearchParams } from "@/lib/language";
import { getStudyPageCopy } from "@/lib/study-page-copy";

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

function lessonHref(direction: "english" | "cpp", lesson: NextLesson | null, language: InterfaceLanguage) {
  const href = lesson ? `/learn/${direction}/${lesson.course.slug}/${lesson.slug}` : `/${direction === "english" ? "english" : "cpp"}`;
  return localizedHref(href, language);
}

export default async function DashboardPage({ searchParams }: { searchParams?: Promise<PageSearchParams> }) {
  const headersList = await headers();
  const headerLanguage = headersList.get("x-jinming-language");
  const language = resolveInterfaceLanguage(searchParams ? await searchParams : undefined, headerLanguage);
  const copy = getStudyPageCopy(language);
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
      <AppleStudyHeader language={language} />
      <section className="apple-shell py-7">
        <div className="apple-card soft-gradient p-5">
          <p className="eyebrow">{copy.dashboard.eyebrow}</p>
          <h1 className="mt-3 font-serif text-4xl">{copy.dashboard.title}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[color:var(--muted)]">
            {copy.dashboard.intro(user.email)}
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link href={localizedHref("/today", language)} className="apple-button-primary px-4 py-2 text-sm">{copy.dashboard.today}</Link>
            <Link href={localizedHref("/wrong", language)} className="apple-button-secondary px-4 py-2 text-sm">{copy.dashboard.wrong}</Link>
            <Link href={localizedHref("/progress", language)} className="apple-button-secondary px-4 py-2 text-sm">{copy.dashboard.progress}</Link>
          </div>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <Stat label={copy.dashboard.completed} value={`${completed}/${totalLessons}`} />
          <Stat label={copy.dashboard.completion} value={`${percent}%`} />
          <Stat label={copy.dashboard.wrongItems} value={`${wrongCount}`} />
        </div>

        <section className="mt-4 grid gap-3 lg:grid-cols-2">
          <NextActionCard
            eyebrow={`${copy.directions.english} ${englishCompleted}/${englishTotal}`}
            title={nextEnglishLesson?.title || copy.dashboard.englishComplete}
            body={nextEnglishLesson?.summary || copy.dashboard.englishCompleteBody}
            href={lessonHref("english", nextEnglishLesson, language)}
            progress={englishPercent}
            cta={copy.dashboard.continueEnglish}
          />
          <NextActionCard
            eyebrow={`${copy.directions.cpp} ${cppCompleted}/${cppTotal}`}
            title={nextCppLesson?.title || copy.dashboard.cppComplete}
            body={nextCppLesson?.summary || copy.dashboard.cppCompleteBody}
            href={lessonHref("cpp", nextCppLesson, language)}
            progress={cppPercent}
            cta={copy.dashboard.continueCpp}
          />
        </section>

        <section className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
          <div className="apple-card p-5">
            <p className="eyebrow">{copy.dashboard.loopEyebrow}</p>
            <h2 className="mt-2 text-2xl font-semibold">{copy.dashboard.loopTitle}</h2>
            <div className="mt-4 grid gap-2 sm:grid-cols-3">
              <Link href={localizedHref("/today", language)} className="dense-row"><span className="text-sm font-semibold">{copy.dashboard.todayPlan}</span><span className="text-xs text-[color:var(--muted)]">{copy.dashboard.todayPlanHint}</span></Link>
              <Link href={localizedHref("/wrong", language)} className="dense-row"><span className="text-sm font-semibold">{copy.dashboard.wrongBank}</span><span className="text-xs text-[color:var(--muted)]">{copy.dashboard.wrongBankHint}</span></Link>
              <Link href={localizedHref("/tools", language)} className="dense-row"><span className="text-sm font-semibold">{copy.dashboard.tools}</span><span className="text-xs text-[color:var(--muted)]">{copy.dashboard.toolsHint}</span></Link>
            </div>
          </div>

          <div className="apple-card p-5">
            <p className="eyebrow">{copy.dashboard.recentEyebrow}</p>
            <h2 className="mt-2 text-2xl font-semibold">{copy.dashboard.recentTitle}</h2>
            <div className="mt-4 grid gap-2">
              {recent.map((item) => (
                <Link
                  key={item.id}
                  href={localizedHref(`/learn/${item.lesson.course.direction === "ENGLISH" ? "english" : "cpp"}/${item.lesson.course.slug}/${item.lesson.slug}`, language)}
                  className="dense-row"
                >
                  <span className="text-sm font-semibold">{item.lesson.title}</span>
                  <span className="text-xs text-[color:var(--muted)]">{item.status === "COMPLETED" ? copy.status.completed : copy.status.inProgress}</span>
                </Link>
              ))}
              {recent.length === 0 && <p className="text-sm leading-6 text-[color:var(--muted)]">{copy.dashboard.noRecent}</p>}
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
