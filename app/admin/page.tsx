import Link from "next/link";
import StudyShell from "@/components/layout/StudyShell";
import { requireServerAdmin } from "@/lib/server-auth";

export const dynamic = "force-dynamic";

const links = [
  { href: "/admin/courses", label: "课程管理", desc: "维护英语 / C++ 学习方向、课程顺序和发布状态", stat: "Course" },
  { href: "/admin/lessons", label: "知识点管理", desc: "编辑讲解、摘要、学习内容和知识点顺序", stat: "Lesson" },
  { href: "/admin/questions", label: "题目管理", desc: "管理选择题、填空题、代码阅读题和解析", stat: "Quiz" },
  { href: "/admin/security", label: "安全中心", desc: "查看防爬虫、登录防护、人机验证和内置安全助手", stat: "Security" },
];

export default async function AdminPage() {
  await requireServerAdmin();
  return (
    <StudyShell>
      <section className="soft-gradient apple-card p-5">
        <p className="eyebrow">Admin Console</p>
        <h1 className="mt-3 font-serif text-4xl">内容管理</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-[color:var(--muted)]">第一版后台只保留课程、知识点和题目 CRUD。管理员接口已做服务端权限与字段校验，前端也会提前拦截常见错误。</p>
      </section>

      <div className="mt-5 grid gap-3 md:grid-cols-4">
        {links.map((link) => (
          <Link key={link.href} href={link.href} className="apple-card apple-card-hover p-4">
            <p className="eyebrow">{link.stat}</p>
            <h2 className="mt-2 text-xl font-semibold">{link.label}</h2>
            <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">{link.desc}</p>
            <span className="mt-4 inline-flex text-sm font-semibold text-[color:var(--accent-link)]">进入管理 →</span>
          </Link>
        ))}
      </div>
    </StudyShell>
  );
}
