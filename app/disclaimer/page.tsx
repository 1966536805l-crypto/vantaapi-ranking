import Link from "next/link";

export default function DisclaimerPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-[#07070a] via-[#0a0a0f] to-[#0d0a08] text-stone-100">
      <div className="mx-auto min-h-screen w-full max-w-4xl px-5 py-6 sm:px-8">
        <nav className="mb-10 flex items-center justify-between border-b border-white/10 pb-5">
          <Link href="/" className="flex items-center gap-3 text-stone-200 transition hover:text-lime-200">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-lime-300 text-sm font-black text-black">I</span>
            <span className="font-semibold">返回首页</span>
          </Link>
        </nav>

        <div className="rounded-xl border border-yellow-500/30 bg-gradient-to-br from-white/[0.04] to-white/[0.02] p-6 backdrop-blur-sm sm:p-8">
          <div className="mb-6 flex items-center gap-3">
            <span className="text-4xl">⚠️</span>
            <h1 className="text-3xl font-bold text-yellow-200">免责声明</h1>
          </div>

          <div className="space-y-6 text-sm leading-relaxed text-stone-300">
            <section>
              <h2 className="mb-3 text-lg font-semibold text-yellow-200">平台性质</h2>
              <p>Immortal 是一个信息展示平台，仅提供技术服务。平台不是内容的发布者或创作者，不对用户提交的内容进行实质性审查、编辑或背书。</p>
            </section>

            <section>
              <h2 className="mb-3 text-lg font-semibold text-yellow-200">内容责任</h2>
              <p>所有展示内容均由用户自行提交。用户对其提交内容的真实性、合法性、准确性承担全部法律责任。平台不对用户提交内容的真实性、合法性、准确性作任何保证。</p>
            </section>

            <section>
              <h2 className="mb-3 text-lg font-semibold text-yellow-200">第三方链接</h2>
              <p>平台展示的第三方链接和工具由用户提交。平台不对第三方网站的内容、安全性或可用性负责。用户访问第三方链接的风险由用户自行承担。</p>
            </section>

            <section>
              <h2 className="mb-3 text-lg font-semibold text-yellow-200">服务中断</h2>
              <p>平台不对因不可抗力、网络故障、系统维护等原因导致的服务中断或数据丢失承担责任。</p>
            </section>

            <section>
              <h2 className="mb-3 text-lg font-semibold text-yellow-200">损害赔偿</h2>
              <p>在任何情况下，平台对用户或第三方因使用本平台产生的任何直接、间接、偶然、特殊或后果性损害不承担责任。</p>
            </section>

            <div className="mt-6 rounded-lg border border-red-500/30 bg-red-900/10 p-4">
              <p className="font-semibold text-red-200">使用本平台即表示您已阅读、理解并同意本免责声明的所有内容。</p>
            </div>

            <p className="mt-6 text-center text-xs text-stone-500">最后更新：2026年5月5日</p>
          </div>
        </div>
      </div>
    </main>
  );
}
