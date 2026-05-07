import AdminForms from "@/components/admin/AdminForms";
import StudyShell from "@/components/layout/StudyShell";
import { requireServerAdmin } from "@/lib/server-auth";

export const dynamic = "force-dynamic";

export default async function AdminQuestionsPage() {
  await requireServerAdmin();
  return (
    <StudyShell>
      <section className="apple-card soft-gradient p-5">
        <p className="eyebrow">Admin · Questions</p>
        <h1 className="mt-3 font-serif text-4xl">题目管理</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-[color:var(--muted)]">选择题选项一行一个，正确选项前加 *。C++ 第一版只做选择题、填空题、代码阅读题，不接在线 runner。</p>
      </section>
      <div className="mt-5"><AdminForms kind="questions" /></div>
    </StudyShell>
  );
}
