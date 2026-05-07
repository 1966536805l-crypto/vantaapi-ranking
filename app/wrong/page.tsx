import Link from "next/link";
import StudyShell from "@/components/layout/StudyShell";
import WrongQuestionActions from "@/components/learning/WrongQuestionActions";
import { prisma } from "@/lib/prisma";
import { requireServerUser } from "@/lib/server-auth";

export const dynamic = "force-dynamic";

export default async function WrongPage() {
  const user = await requireServerUser();
  const items = await prisma.wrongQuestion.findMany({ where: { userId: user.id }, include: { question: { include: { lesson: { include: { course: true } } } } }, orderBy: { createdAt: "desc" } });

  return (
    <StudyShell>
      <section className="apple-card soft-gradient p-5">
        <p className="eyebrow">Wrong Questions</p>
        <h1 className="mt-3 font-serif text-4xl">错题收藏</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-[color:var(--muted)]">做错或手动收藏的题会集中在这里，适合复习前快速扫一遍。</p>
      </section>

      <div className="mt-5 space-y-3">
        {items.map((item) => {
          const direction = item.question.lesson.course.direction === "ENGLISH" ? "english" : "cpp";
          const lessonHref = `/learn/${direction}/${item.question.lesson.course.slug}/${item.question.lesson.slug}`;
          return (
            <article key={item.id} className="apple-card p-5">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="eyebrow">{item.question.lesson.course.direction === "ENGLISH" ? "英语" : "C++"} · {item.question.lesson.course.title}</p>
                  <h2 className="mt-2 text-xl font-semibold">{item.question.lesson.title}</h2>
                </div>
                <Link href={lessonHref} className="apple-button-secondary w-fit px-3 py-2 text-sm">回到知识点</Link>
              </div>

              <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-slate-800">{item.question.prompt}</p>
              {item.question.codeSnippet && <pre className="mt-3 overflow-x-auto rounded-[8px] bg-slate-950 p-3 text-sm text-white shadow-inner"><code>{item.question.codeSnippet}</code></pre>}

              <div className="mt-4 grid gap-3 text-sm md:grid-cols-2">
                <p className="rounded-[8px] border border-red-100 bg-red-50 p-3 text-red-700">你的答案：{item.userAnswer || "未记录"}</p>
                <p className="rounded-[8px] border border-emerald-100 bg-emerald-50 p-3 text-emerald-700">正确答案：{item.question.answer}</p>
              </div>

              {item.question.explanation && <p className="mt-3 rounded-[8px] border border-black/5 bg-white/65 p-3 text-sm leading-6 text-[color:var(--muted)]">解析：{item.question.explanation}</p>}
              <WrongQuestionActions id={item.id} />
            </article>
          );
        })}
        {items.length === 0 && (
          <div className="apple-card border-dashed p-7 text-center">
            <p className="text-[color:var(--muted)]">还没有错题</p>
            <Link href="/english" className="apple-button-primary mt-5 px-4 py-2 text-sm">去学习</Link>
          </div>
        )}
      </div>
    </StudyShell>
  );
}
