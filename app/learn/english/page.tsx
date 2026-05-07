import Link from "next/link";
import { getFallbackTrack } from "@/lib/fallback-learning";

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

export default async function EnglishPage() {
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
      title="English Learning Path"
      desc="Move through vocabulary grammar reading quizzes progress and review."
      courses={courses}
      direction="english"
    />
  );
}

function TrackPage({
  title,
  desc,
  courses,
  direction,
}: {
  title: string;
  desc: string;
  courses: TrackCourse[];
  direction: string;
}) {
  return (
    <main className="min-h-screen bg-white text-slate-950">
      <Header />
      <section className="mx-auto max-w-6xl px-4 py-7 sm:px-6 sm:py-9">
        <p className="eyebrow">Learning Path</p>
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
                    href={`/learn/${direction}/${course.slug}/${lesson.slug}`}
                    className="border border-slate-200 bg-slate-50 p-4 hover:border-[color:var(--accent)]"
                  >
                    <p className="font-mono text-xs text-slate-500">
                      {String(index + 1).padStart(2, "0")}
                    </p>
                    <h3 className="mt-2 text-lg font-semibold">{lesson.title}</h3>
                    <p className="mt-2 text-sm text-slate-600">{lesson.summary}</p>
                    <p className="mt-3 text-xs text-emerald-700">
                      {lesson.progress?.[0]?.status === "COMPLETED" ? "Completed" : "Start"}
                    </p>
                  </Link>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

function Header() {
  return (
    <header className="border-b border-slate-200">
      <div className="mx-auto flex max-w-6xl justify-between px-4 py-4 sm:px-6">
        <Link href="/" className="text-xl font-semibold">JinMing Lab</Link>
        <nav className="flex gap-4 text-sm">
          <Link href="/learn/cpp">C++</Link>
          <Link href="/progress">Progress</Link>
          <Link href="/wrong">Wrong Bank</Link>
        </nav>
      </div>
    </header>
  );
}
