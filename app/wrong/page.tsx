import Link from "next/link";
import StudyShell from "@/components/layout/StudyShell";
import WrongQuestionActions from "@/components/learning/WrongQuestionActions";
import { localizedHref, resolveInterfaceLanguage, type PageSearchParams } from "@/lib/language";
import { prisma } from "@/lib/prisma";
import { requireServerUser } from "@/lib/server-auth";
import { getStudyPageCopy } from "@/lib/study-page-copy";

export const dynamic = "force-dynamic";

export default async function WrongPage({ searchParams }: { searchParams?: Promise<PageSearchParams> }) {
  const language = resolveInterfaceLanguage(searchParams ? await searchParams : undefined);
  const copy = getStudyPageCopy(language);
  const user = await requireServerUser();
  const items = await prisma.wrongQuestion.findMany({ where: { userId: user.id }, include: { question: { include: { lesson: { include: { course: true } } } } }, orderBy: { createdAt: "desc" } });
  const englishCount = items.filter((item) => item.question.lesson.course.direction === "ENGLISH").length;
  const cppCount = items.filter((item) => item.question.lesson.course.direction === "CPP").length;
  const firstReviewHref = items[0]
    ? `/learn/${items[0].question.lesson.course.direction === "ENGLISH" ? "english" : "cpp"}/${items[0].question.lesson.course.slug}/${items[0].question.lesson.slug}`
    : "/english";

  return (
    <StudyShell language={language}>
      <section className="apple-card soft-gradient p-5">
        <p className="eyebrow">{copy.wrong.eyebrow}</p>
        <h1 className="mt-3 font-serif text-4xl">{copy.wrong.title}</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-[color:var(--muted)]">{copy.wrong.intro}</p>
        <div className="mt-5 flex flex-wrap gap-2">
          <Link href={localizedHref(firstReviewHref, language)} className="apple-button-primary px-4 py-2 text-sm">{copy.wrong.start}</Link>
          <Link href={localizedHref("/today", language)} className="apple-button-secondary px-4 py-2 text-sm">{copy.wrong.today}</Link>
          <Link href={localizedHref("/progress", language)} className="apple-button-secondary px-4 py-2 text-sm">{copy.wrong.progress}</Link>
        </div>
      </section>

      <section className="mt-4 grid gap-3 md:grid-cols-3">
        <ReviewStat label={copy.wrong.all} value={items.length} />
        <ReviewStat label={copy.directions.english} value={englishCount} />
        <ReviewStat label={copy.directions.cpp} value={cppCount} />
      </section>

      <section className="mt-4 apple-card p-5">
        <p className="eyebrow">{copy.wrong.loopEyebrow}</p>
        <div className="mt-3 grid gap-2 text-sm md:grid-cols-3">
          <span className="dense-row"><strong>{copy.wrong.step1}</strong><small className="text-[color:var(--muted)]">{copy.wrong.step1Hint}</small></span>
          <span className="dense-row"><strong>{copy.wrong.step2}</strong><small className="text-[color:var(--muted)]">{copy.wrong.step2Hint}</small></span>
          <span className="dense-row"><strong>{copy.wrong.step3}</strong><small className="text-[color:var(--muted)]">{copy.wrong.step3Hint}</small></span>
        </div>
      </section>

      <div className="mt-5 space-y-3">
        {items.map((item) => {
          const direction = item.question.lesson.course.direction === "ENGLISH" ? "english" : "cpp";
          const directionLabel = item.question.lesson.course.direction === "ENGLISH" ? copy.directions.english : copy.directions.cpp;
          const lessonHref = `/learn/${direction}/${item.question.lesson.course.slug}/${item.question.lesson.slug}`;
          return (
            <article key={item.id} className="apple-card p-5">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="eyebrow">{directionLabel} · {item.question.lesson.course.title}</p>
                  <h2 className="mt-2 text-xl font-semibold">{item.question.lesson.title}</h2>
                </div>
                <Link href={localizedHref(lessonHref, language)} className="apple-button-secondary w-fit px-3 py-2 text-sm">{copy.wrong.backToLesson}</Link>
              </div>

              <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-slate-800">{item.question.prompt}</p>
              {item.question.codeSnippet && <pre className="mt-3 overflow-x-auto rounded-[8px] bg-slate-950 p-3 text-sm text-white shadow-inner"><code>{item.question.codeSnippet}</code></pre>}

              <div className="mt-4 grid gap-3 text-sm md:grid-cols-2">
                <p className="rounded-[8px] border border-red-100 bg-red-50 p-3 text-red-700">{copy.wrong.yourAnswer}: {item.userAnswer || copy.wrong.noAnswer}</p>
                <p className="rounded-[8px] border border-emerald-100 bg-emerald-50 p-3 text-emerald-700">{copy.wrong.correctAnswer}: {item.question.answer}</p>
              </div>

              {item.question.explanation && <p className="mt-3 rounded-[8px] border border-black/5 bg-white/65 p-3 text-sm leading-6 text-[color:var(--muted)]">{copy.wrong.explanation}: {item.question.explanation}</p>}
              <WrongQuestionActions id={item.id} />
            </article>
          );
        })}
        {items.length === 0 && (
          <div className="apple-card border-dashed p-7 text-center">
            <p className="text-[color:var(--muted)]">{copy.wrong.empty}</p>
            <div className="mt-5 flex justify-center gap-2">
              <Link href={localizedHref("/english", language)} className="apple-button-primary px-4 py-2 text-sm">{copy.wrong.goEnglish}</Link>
              <Link href={localizedHref("/cpp", language)} className="apple-button-secondary px-4 py-2 text-sm">{copy.wrong.goCpp}</Link>
            </div>
          </div>
        )}
      </div>
    </StudyShell>
  );
}

function ReviewStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="apple-card p-4">
      <p className="eyebrow">{label}</p>
      <p className="mt-2 font-serif text-4xl">{value}</p>
    </div>
  );
}
