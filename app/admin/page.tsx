import Link from "next/link";
import StudyShell from "@/components/layout/StudyShell";
import { requireServerAdmin } from "@/lib/server-auth";
import { getAIEventSummary } from "@/lib/ai-observability";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const links = [
  { href: "/admin/courses", label: "课程管理", desc: "维护英语 / C++ 学习方向、课程顺序和发布状态", stat: "Course" },
  { href: "/admin/lessons", label: "知识点管理", desc: "编辑讲解、摘要、学习内容和知识点顺序", stat: "Lesson" },
  { href: "/admin/questions", label: "题目管理", desc: "管理选择题、填空题、代码阅读题和解析", stat: "Quiz" },
  { href: "/admin/security", label: "安全中心", desc: "查看防爬虫、登录防护、人机验证和内置安全助手", stat: "Security" },
];

const stabilityItems = [
  { label: "错误日志", value: "控制台与 Vercel 日志", note: "上线后接 Sentry 或 Logtail" },
  { label: "接口限流", value: "已启用", note: "登录 AI 提交 题库接口均有限流" },
  { label: "AI 成本控制", value: "已启用", note: "登录后使用 每用户每日上限 熔断兜底" },
  { label: "数据库备份", value: "待配置", note: "使用 scripts/backup-db.js 生成备份" },
  { label: "移动端适配", value: "已覆盖", note: "首页 学习页 工具页使用响应式布局" },
];

async function getAdminMetrics() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [
    users,
    newUsersToday,
    activeProgressUsers,
    activeAttemptUsers,
    courses,
    lessons,
    questions,
    progress,
    attempts,
    attemptsToday,
    wrongQuestions,
    wrongQuestionsToday,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { createdAt: { gte: today } } }),
    prisma.userProgress.findMany({ where: { updatedAt: { gte: today } }, distinct: ["userId"], select: { userId: true } }),
    prisma.questionAttempt.findMany({ where: { createdAt: { gte: today } }, distinct: ["userId"], select: { userId: true } }),
    prisma.course.count(),
    prisma.lesson.count(),
    prisma.question.count(),
    prisma.userProgress.count(),
    prisma.questionAttempt.count(),
    prisma.questionAttempt.count({ where: { createdAt: { gte: today } } }),
    prisma.wrongQuestion.count(),
    prisma.wrongQuestion.count({ where: { createdAt: { gte: today } } }),
  ]);

  const ai = getAIEventSummary();
  const dailyActiveUsers = new Set([...activeProgressUsers, ...activeAttemptUsers].map((item) => item.userId)).size;

  return [
    { label: "用户数", value: users, note: `今日新增 ${newUsersToday}` },
    { label: "日活", value: dailyActiveUsers, note: "今日有学习记录的用户" },
    { label: "学习次数", value: progress + attempts, note: `今日答题 ${attemptsToday}` },
    { label: "AI 调用", value: ai.total, note: `成功 ${ai.success} 异常 ${ai.error + ai.timeout + ai["rate-limited"]}` },
    { label: "错题数", value: wrongQuestions, note: `今日新增 ${wrongQuestionsToday}` },
    { label: "内容量", value: courses + lessons + questions, note: `${courses} 课 / ${lessons} 节 / ${questions} 题` },
  ];
}

export default async function AdminPage() {
  await requireServerAdmin();
  const metrics = await getAdminMetrics();

  return (
    <StudyShell>
      <section className="soft-gradient apple-card p-5">
        <p className="eyebrow">Admin Console</p>
        <h1 className="mt-3 font-serif text-4xl">运营数据看板</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-[color:var(--muted)]">
          公开版本先看用户、日活、学习次数、AI 调用、错题和内容量。旧 ranking、comment、report、C++ run、AI review 已作为下线功能处理。
        </p>
      </section>

      <section className="mt-5 grid gap-3 md:grid-cols-3 xl:grid-cols-6">
        {metrics.map((metric) => (
          <div key={metric.label} className="apple-card p-4">
            <p className="eyebrow">{metric.label}</p>
            <strong className="mt-2 block text-3xl">{metric.value}</strong>
            <p className="mt-2 text-xs leading-5 text-[color:var(--muted)]">{metric.note}</p>
          </div>
        ))}
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

      <section className="mt-5 apple-card p-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="eyebrow">Launch Stability</p>
            <h2 className="mt-2 text-2xl font-semibold">上线稳定性检查</h2>
          </div>
          <span className="dense-status">公开前必看</span>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          {stabilityItems.map((item) => (
            <article key={item.label} className="rounded-[8px] border border-slate-200 bg-white/75 p-3">
              <p className="eyebrow">{item.label}</p>
              <h3 className="mt-2 text-lg font-semibold">{item.value}</h3>
              <p className="mt-2 text-xs leading-5 text-[color:var(--muted)]">{item.note}</p>
            </article>
          ))}
        </div>
      </section>
    </StudyShell>
  );
}
