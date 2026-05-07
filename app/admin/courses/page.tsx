import AdminForms from "@/components/admin/AdminForms";
import StudyShell from "@/components/layout/StudyShell";
import { requireServerAdmin } from "@/lib/server-auth";

export const dynamic = "force-dynamic";

export default async function AdminCoursesPage() {
  await requireServerAdmin();
  return (
    <StudyShell>
      <section className="apple-card soft-gradient p-5">
        <p className="eyebrow">Admin · Courses</p>
        <h1 className="mt-3 font-serif text-4xl">课程管理</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-[color:var(--muted)]">创建英语或 C++ 课程。Slug 会作为稳定路径标识，请使用小写字母、数字和中横线。</p>
      </section>
      <div className="mt-5"><AdminForms kind="courses" /></div>
    </StudyShell>
  );
}
