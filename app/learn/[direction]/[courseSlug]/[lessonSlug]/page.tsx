import Link from "next/link";
import { notFound } from "next/navigation";
import StudyShell from "@/components/layout/StudyShell";
import ProgressButton from "@/components/learning/ProgressButton";
import QuizBlock from "@/components/learning/QuizBlock";
import { getFallbackLesson, getFallbackTrack } from "@/lib/fallback-learning";
import { publicQuestionSelect, toLearningDirection } from "@/lib/learning";

export const dynamic = "force-dynamic";

type LessonNavigationItem = {
  slug: string;
  title: string;
  summary: string;
  sortOrder: number;
};

function estimateLessonMinutes(lesson: { content: string; examples: unknown[]; questions: unknown[] }) {
  const contentWeight = lesson.content.length;
  const practiceWeight = lesson.examples.length * 320 + lesson.questions.length * 220;
  return Math.min(25, Math.max(5, Math.ceil((contentWeight + practiceWeight) / 900)));
}

function lessonPath(direction: string, courseSlug: string, lessonSlug: string) {
  return `/learn/${direction}/${courseSlug}/${lessonSlug}`;
}

export default async function LessonPage({ params }: { params: Promise<{ direction: string; courseSlug: string; lessonSlug: string }> }) {
  const { direction, courseSlug, lessonSlug } = await params;
  const dbDirection = toLearningDirection(direction);
  if (!dbDirection) notFound();

  let lesson = null;
  let lessonNavigation: LessonNavigationItem[] = [];

  try {
    const [{ getServerUser }, { prisma }] = await Promise.all([
      import("@/lib/server-auth"),
      import("@/lib/prisma"),
    ]);
    const user = await getServerUser();
    lesson = await prisma.lesson.findFirst({
      where: { slug: lessonSlug, isPublished: true, course: { slug: courseSlug, direction: dbDirection, isPublished: true } },
      include: { course: true, examples: { orderBy: { sortOrder: "asc" } }, questions: { orderBy: { sortOrder: "asc" }, select: publicQuestionSelect }, progress: { where: { userId: user?.id ?? "__anonymous__" } } },
    });
    lessonNavigation = await prisma.lesson.findMany({
      where: { isPublished: true, course: { slug: courseSlug, direction: dbDirection, isPublished: true } },
      orderBy: { sortOrder: "asc" },
      select: { slug: true, title: true, summary: true, sortOrder: true },
    });
  } catch (error) {
    console.error("Falling back to built-in lesson content", error);
    lesson = getFallbackLesson(dbDirection, courseSlug, lessonSlug);
    lessonNavigation = getFallbackTrack(dbDirection)
      .find((course) => course.slug === courseSlug)
      ?.lessons.map((item) => ({ slug: item.slug, title: item.title, summary: item.summary, sortOrder: item.sortOrder })) ?? [];
  }

  if (!lesson) notFound();

  const currentIndex = lessonNavigation.findIndex((item) => item.slug === lesson.slug);
  const previousLesson = currentIndex > 0 ? lessonNavigation[currentIndex - 1] : null;
  const nextLesson = currentIndex >= 0 ? lessonNavigation[currentIndex + 1] ?? null : null;
  const estimatedMinutes = estimateLessonMinutes(lesson);
  const completionStatus = lesson.progress?.[0]?.status;

  return (
    <StudyShell>
      <div className="mb-4">
        <Link href={`/learn/${direction}`} className="link text-sm">
          ← 返回{direction === "english" ? "英语" : "C++"}路径
        </Link>
      </div>
      <p className="eyebrow">
        {lesson.course.direction === "ENGLISH" ? "英语" : "C++"} · {lesson.course.title}
      </p>
      <h1 className="mt-3 font-serif text-4xl">{lesson.title}</h1>
      <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">{lesson.summary}</p>
      <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold text-slate-600">
        <span className="rounded-full border border-slate-200 bg-white px-3 py-1">预计 {estimatedMinutes} 分钟</span>
        <span className="rounded-full border border-slate-200 bg-white px-3 py-1">{lesson.examples.length} 个例题</span>
        <span className="rounded-full border border-slate-200 bg-white px-3 py-1">{lesson.questions.length} 道练习</span>
        <span className="rounded-full border border-slate-200 bg-white px-3 py-1">{completionStatus === "COMPLETED" ? "已完成" : "未完成"}</span>
      </div>
      <div className="mt-5 flex flex-wrap items-center gap-2">
        <ProgressButton lessonId={lesson.id} initialStatus={completionStatus} />
        {nextLesson && (
          <Link href={lessonPath(direction, courseSlug, nextLesson.slug)} className="apple-button-secondary px-4 py-2 text-sm">
            下一节：{nextLesson.title}
          </Link>
        )}
      </div>
      <section className="mt-5 border border-slate-200 bg-white p-5">
        <h2 className="text-2xl font-semibold">讲解</h2>
        <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-700">{lesson.content}</p>
      </section>
      <section className="mt-5 border border-slate-200 bg-slate-50 p-5">
        <h2 className="text-2xl font-semibold">例题</h2>
        <div className="mt-3 space-y-3">
          {lesson.examples.map((example) => (
            <div key={example.id} className="border border-slate-200 bg-white p-3">
              <h3 className="font-semibold">{example.title}</h3>
              <pre className="mt-2 whitespace-pre-wrap text-sm leading-6">{example.content}</pre>
              {example.explanation && <p className="mt-2 text-sm leading-6 text-slate-600">{example.explanation}</p>}
            </div>
          ))}
          {lesson.examples.length === 0 && <p className="text-sm text-slate-500">这个知识点暂时还没有例题。</p>}
        </div>
      </section>
      <section className="mt-5">
        <h2 className="mb-3 text-2xl font-semibold">练习与测验</h2>
        {lesson.questions.length > 0 ? (
          <QuizBlock lessonId={lesson.id} questions={lesson.questions} />
        ) : (
          <div className="border border-dashed border-slate-300 bg-white py-8 text-center text-sm text-slate-500">
            这个知识点暂时还没有练习。
          </div>
        )}
      </section>

      <section className="mt-5 grid gap-3 md:grid-cols-2">
        {previousLesson ? (
          <Link href={lessonPath(direction, courseSlug, previousLesson.slug)} className="border border-slate-200 bg-white p-4 hover:border-[color:var(--accent)]">
            <p className="eyebrow">上一节</p>
            <h2 className="mt-2 text-xl font-semibold">{previousLesson.title}</h2>
            <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">{previousLesson.summary}</p>
          </Link>
        ) : (
          <div className="border border-dashed border-slate-200 bg-white p-4 text-sm text-slate-500">这是本课程第一节。</div>
        )}
        {nextLesson ? (
          <Link href={lessonPath(direction, courseSlug, nextLesson.slug)} className="border border-slate-200 bg-white p-4 hover:border-[color:var(--accent)]">
            <p className="eyebrow">下一节</p>
            <h2 className="mt-2 text-xl font-semibold">{nextLesson.title}</h2>
            <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">{nextLesson.summary}</p>
          </Link>
        ) : (
          <Link href="/wrong" className="border border-slate-200 bg-white p-4 hover:border-[color:var(--accent)]">
            <p className="eyebrow">课程完成后</p>
            <h2 className="mt-2 text-xl font-semibold">去错题本复盘</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">没有下一节时，优先回到错题本，把这一路的问题重新做一遍。</p>
          </Link>
        )}
      </section>
    </StudyShell>
  );
}
