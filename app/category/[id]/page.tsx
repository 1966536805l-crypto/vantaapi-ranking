import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const category = await prisma.category.findUnique({
    where: { id },
    include: {
      rankings: {
        where: { status: "approved" },
        orderBy: { score: "desc" },
      },
    },
  });

  if (!category) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        <div className="mb-8">
          <Link
            href="/"
            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 mb-4 inline-block"
          >
            ← 返回首页
          </Link>
          <div className="flex items-center mb-4">
            {category.icon && (
              <span className="text-5xl mr-4">{category.icon}</span>
            )}
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              {category.name}
            </h1>
          </div>
          {category.description && (
            <p className="text-xl text-gray-600 dark:text-gray-300">
              {category.description}
            </p>
          )}
        </div>

        <div className="space-y-4">
          {category.rankings.map((ranking, index) => (
            <div
              key={ranking.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 flex items-center gap-6"
            >
              <div className="text-4xl font-bold text-gray-300 dark:text-gray-600 w-16 text-center">
                #{index + 1}
              </div>
              {ranking.imageUrl && (
                <img
                  src={ranking.imageUrl}
                  alt={ranking.title}
                  className="w-24 h-24 object-cover rounded-lg"
                />
              )}
              <div className="flex-1">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                  {ranking.title}
                </h2>
                {ranking.description && (
                  <p className="text-gray-600 dark:text-gray-300 mb-2">
                    {ranking.description}
                  </p>
                )}
                <div className="flex gap-4 text-sm text-gray-500 dark:text-gray-400">
                  <span>评分: {ranking.score.toFixed(1)}</span>
                  <span>投票: {ranking.votes}</span>
                </div>
              </div>
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
                onClick={() => {
                  // TODO: 实现投票功能
                  alert("投票功能即将推出");
                }}
              >
                投票
              </button>
            </div>
          ))}
        </div>

        {category.rankings.length === 0 && (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              该分类暂无项目
            </p>
            <Link
              href="/submit"
              className="text-blue-600 hover:text-blue-700 dark:text-blue-400"
            >
              成为第一个提交的人 →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
