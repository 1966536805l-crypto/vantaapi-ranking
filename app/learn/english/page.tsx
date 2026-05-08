import Link from "next/link";
import StudyShell from "@/components/layout/StudyShell";
import { getFallbackTrack } from "@/lib/fallback-learning";
import { localizedHref, resolveInterfaceLanguage, type InterfaceLanguage, type PageSearchParams } from "@/lib/language";
import { getLearnPageCopy, getStudyPageCopy } from "@/lib/study-page-copy";

type TrackCourse = {
  id: string;
  slug: string;
  title: string;
  description: string;
  lessons: {
    id: string;
    slug: string;
    title: string;
    summary: string;
    progress: { status: string }[];
  }[];
};

export default async function EnglishPage({ searchParams }: { searchParams?: Promise<PageSearchParams> }) {
  const language = resolveInterfaceLanguage(searchParams ? await searchParams : undefined);
  const copy = getLearnPageCopy(language);
  const studyCopy = getStudyPageCopy(language);
  let courses: TrackCourse[];

  try {
    const [{ getServerUser }, { prisma }] = await Promise.all([
      import("@/lib/server-auth"),
      import("@/lib/prisma"),
    ]);
    const user = await getServerUser();
    courses = await prisma.course.findMany({
      where: { direction: "ENGLISH", isPublished: true },
      orderBy: { sortOrder: "asc" },
      select: {
        id: true,
        slug: true,
        title: true,
        description: true,
        lessons: {
          where: { isPublished: true },
          orderBy: { sortOrder: "asc" },
          select: {
            id: true,
            slug: true,
            title: true,
            summary: true,
            progress: {
              where: { userId: user?.id ?? "__anonymous__" },
              select: { status: true },
            },
          },
        },
      },
    });
  } catch (error) {
    console.error("Falling back to built-in English lessons", error);
    courses = getFallbackTrack("ENGLISH");
  }

  return (
    <TrackPage
      title={`${studyCopy.directions.english} ${copy.path}`}
      desc={language === "zh" ? "按词汇 语法 阅读 测验 进度和复习一路推进" : "Move through vocabulary grammar reading quizzes progress and review."}
      courses={courses}
      direction="english"
      language={language}
      copy={copy}
    />
  );
}

function TrackPage({
  title,
  desc,
  courses,
  direction,
  language,
  copy,
}: {
  title: string;
  desc: string;
  courses: TrackCourse[];
  direction: string;
  language: InterfaceLanguage;
  copy: ReturnType<typeof getLearnPageCopy>;
}) {
  return (
    <StudyShell language={language}>
      <section className="mx-auto max-w-6xl px-4 py-7 sm:px-6 sm:py-9">
        <p className="eyebrow">{copy.path}</p>
        <h1 className="mt-3 font-serif text-4xl">{title}</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">{desc}</p>
        <div className="mt-5 space-y-4">
          {courses.map((course) => (
            <article key={course.id} className="border border-slate-200 bg-white p-5">
              <h2 className="text-2xl font-semibold">{course.title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{course.description}</p>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {course.lessons.map((lesson, index) => (
                  <Link
                    key={lesson.id}
                    href={localizedHref(`/learn/${direction}/${course.slug}/${lesson.slug}`, language)}
                    className="border border-slate-200 bg-slate-50 p-4 hover:border-[color:var(--accent)]"
                  >
                    <p className="font-mono text-xs text-slate-500">
                      {String(index + 1).padStart(2, "0")}
                    </p>
                    <h3 className="mt-2 text-lg font-semibold">{lesson.title}</h3>
                    <p className="mt-2 text-sm text-slate-600">{lesson.summary}</p>
                    <p className="mt-3 text-xs text-emerald-700">
                      {lesson.progress?.[0]?.status === "COMPLETED" ? copy.completed : copy.start}
                    </p>
                  </Link>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>
    </StudyShell>
  );
}
