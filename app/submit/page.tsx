"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ParticleBackground from "@/components/ParticleBackground";

type Category = {
  id: string;
  name: string;
};

export default function SubmitPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    imageUrl: "",
    categoryId: "",
  });

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await fetch("/api/categories");
        const data = (await response.json()) as Category[];

        setCategories(data);
        setFormData((current) => ({
          ...current,
          categoryId: current.categoryId || data[0]?.id || "",
        }));
      } catch {
        setCategories([]);
      } finally {
        setCategoriesLoading(false);
      }
    };

    loadCategories();
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/rankings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert("提交成功，已进入榜单。");
        router.push("/");
      } else {
        const error = await response.json();
        alert(`提交失败：${error.message}`);
      }
    } catch {
      alert("提交失败，请重试。");
    } finally {
      setLoading(false);
    }
  };

  const canSubmit =
    Boolean(formData.title.trim()) && Boolean(formData.categoryId) && !loading;

  return (
    <main className="relative min-h-screen bg-gradient-to-br from-[#07070a] via-[#0a0a0f] to-[#0d0a08] text-stone-100">
      <ParticleBackground />
      <div className="relative z-10 mx-auto min-h-screen w-full max-w-3xl px-5 py-6 sm:px-8">
        <nav className="mb-10 flex items-center justify-between border-b border-white/10 pb-5">
          <Link
            href="/"
            className="flex items-center gap-3 text-stone-200 transition hover:text-lime-200"
          >
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-lime-300 text-sm font-black text-black">
              I
            </span>
            <span className="font-semibold">Immortal</span>
          </Link>
          <Link
            href="/ai"
            className="rounded-lg border border-white/10 px-4 py-2 text-sm text-stone-200 transition hover:border-lime-300/50 hover:text-lime-200"
          >
            AI 助手
          </Link>
        </nav>

        <header className="mb-7">
          <p className="mb-3 inline-flex rounded-full border border-lime-300/20 bg-gradient-to-r from-lime-300/10 to-yellow-300/10 px-4 py-2 text-sm font-medium text-lime-200 shadow-lg shadow-lime-300/10">
            Submit to Immortal
          </p>
          <h1 className="bg-gradient-to-br from-white via-lime-100 to-yellow-200 bg-clip-text text-4xl font-bold text-transparent">提交项目</h1>
          <p className="mt-4 text-sm leading-6 text-stone-400">
            分享你觉得值得长期关注的产品、工具或内容。提交后会出现在对应榜单里。
          </p>
          <div className="mt-5 rounded-lg border border-yellow-500/20 bg-gradient-to-br from-yellow-900/10 to-orange-900/10 p-4 text-xs leading-relaxed text-stone-400 backdrop-blur-sm">
            <p className="font-semibold text-yellow-200">⚠️ 提交须知</p>
            <p className="mt-2">提交即表示您确认：(1) 您对提交内容拥有合法权利或已获得授权；(2) 提交内容不违反任何法律法规；(3) 您对提交内容的真实性、合法性承担全部法律责任；(4) 平台有权在不通知的情况下删除违规内容。</p>
          </div>
        </header>

        <section className="rounded-lg border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.02] p-5 shadow-2xl shadow-black/40 backdrop-blur-sm sm:p-6">
          {categoriesLoading ? (
            <p className="py-10 text-center text-sm text-stone-400">
              正在加载分类...
            </p>
          ) : categories.length === 0 ? (
            <div className="rounded-lg border border-dashed border-white/15 px-5 py-10 text-center">
              <p className="font-medium text-white">暂时没有可提交的分类</p>
              <p className="mt-2 text-sm text-stone-400">
                分类准备好之后，这里会自动显示下拉选择。
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-stone-300">
                  项目名称 *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(event) =>
                    setFormData({ ...formData, title: event.target.value })
                  }
                  className="w-full rounded-lg border border-white/10 bg-white/[0.06] px-4 py-3 text-white outline-none transition placeholder:text-stone-500 focus:border-lime-300/60"
                  placeholder="输入项目名称"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-stone-300">
                  分类 *
                </label>
                <select
                  required
                  value={formData.categoryId}
                  onChange={(event) =>
                    setFormData({ ...formData, categoryId: event.target.value })
                  }
                  className="w-full rounded-lg border border-white/10 bg-[#111115] px-4 py-3 text-white outline-none transition focus:border-lime-300/60"
                >
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-stone-300">
                  项目描述
                </label>
                <textarea
                  value={formData.description}
                  onChange={(event) =>
                    setFormData({
                      ...formData,
                      description: event.target.value,
                    })
                  }
                  rows={4}
                  className="w-full rounded-lg border border-white/10 bg-white/[0.06] px-4 py-3 text-white outline-none transition placeholder:text-stone-500 focus:border-lime-300/60"
                  placeholder="描述项目的特点和亮点"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-stone-300">
                  图片链接
                </label>
                <input
                  type="url"
                  value={formData.imageUrl}
                  onChange={(event) =>
                    setFormData({ ...formData, imageUrl: event.target.value })
                  }
                  className="w-full rounded-lg border border-white/10 bg-white/[0.06] px-4 py-3 text-white outline-none transition placeholder:text-stone-500 focus:border-lime-300/60"
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                <button
                  type="submit"
                  disabled={!canSubmit}
                  className="flex-1 rounded-lg bg-lime-300 px-6 py-3 font-semibold text-black transition hover:bg-lime-200 disabled:cursor-not-allowed disabled:bg-stone-700 disabled:text-stone-400"
                >
                  {loading ? "提交中..." : "提交"}
                </button>
                <Link
                  href="/"
                  className="flex-1 rounded-lg border border-white/10 px-6 py-3 text-center font-semibold text-stone-200 transition hover:border-white/30 hover:bg-white/[0.04]"
                >
                  返回首页
                </Link>
              </div>
            </form>
          )}
        </section>
      </div>
    </main>
  );
}
