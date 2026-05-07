import Link from "next/link";
import { notFound } from "next/navigation";
import StudyShell from "@/components/layout/StudyShell";
import ProgressButton from "@/components/learning/ProgressButton";
import QuizBlock from "@/components/learning/QuizBlock";
import { getFallbackLesson } from "@/lib/fallback-learning";
import { publicQuestionSelect, toLearningDirection } from "@/lib/learning";

export const dynamic = "force-dynamic";

export default async function LessonPage({ params }: { params: Promise<{ direction: string; courseSlug: string; lessonSlug: string }> }) {
  const { direction, courseSlug, lessonSlug } = await params;
  const dbDirection = toLearningDirection(direction);
  if (!dbDirection) notFound();

  let lesson = null;

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
  } catch (error) {
    console.error("Falling back to built-in lesson content", error);
    lesson = getFallbackLesson(dbDirection, courseSlug, lessonSlug);
  }

  if (!lesson) notFound();

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
      <div className="mt-5">
        <ProgressButton lessonId={lesson.id} initialStatus={lesson.progress?.[0]?.status} />
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
    </StudyShell>
  );
}
