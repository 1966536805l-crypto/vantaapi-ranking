import AdminForms from "@/components/admin/AdminForms";
import StudyShell from "@/components/layout/StudyShell";
import { requireServerAdmin } from "@/lib/server-auth";

export const dynamic = "force-dynamic";

export default async function AdminLessonsPage() {
  await requireServerAdmin();
  return (
    <StudyShell>
      <section className="apple-card soft-gradient p-5">
        <p className="eyebrow">Admin · Lessons</p>
        <h1 className="mt-3 font-serif text-4xl">知识点管理</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-[color:var(--muted)]">创建知识点时直接选择所属课程，不需要手动复制 Course ID。内容会用于学习详情页和进度系统。</p>
      </section>
      <div className="mt-5"><AdminForms kind="lessons" /></div>
    </StudyShell>
  );
}
