import Link from "next/link";

export const metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default function ReportRetiredPage() {
  return (
    <main className="apple-page grid min-h-screen place-items-center px-4 py-12">
      <section className="apple-card max-w-xl p-6 text-center">
        <p className="eyebrow">Retired</p>
        <h1 className="mt-3 text-3xl font-semibold">旧举报入口已下线</h1>
        <p className="mt-3 text-sm leading-6 text-[color:var(--muted)]">
          公开排名、评论和举报系统不属于当前公开版本。现在优先打磨英语学习、编程训练和 AI 工具三个核心入口。
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          <Link href="/" className="dense-action-primary">返回首页</Link>
          <Link href="/tools" className="dense-action">打开 AI 工具</Link>
        </div>
      </section>
    </main>
  );
}
