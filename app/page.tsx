import Link from "next/link";
import { prisma } from "@/lib/prisma";

type CategoryCard = {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  _count: {
    rankings: number;
  };
};

export default async function Home() {
  const categories = await prisma.category.findMany({
    include: {
      _count: {
        select: { rankings: true }
      }
    }
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        <header className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
            VantaAPI 排行榜
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            发现最热门的内容，分享你的推荐
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {(categories as CategoryCard[]).map((category) => (
            <Link
              key={category.id}
              href={`/category/${category.id}`}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow"
            >
              <div className="flex items-center mb-4">
                {category.icon && (
                  <span className="text-4xl mr-4">{category.icon}</span>
                )}
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {category.name}
                </h2>
              </div>
              {category.description && (
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  {category.description}
                </p>
              )}
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {category._count.rankings} 个项目
              </div>
            </Link>
          ))}
        </div>

        {categories.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              暂无分类，请先添加分类
            </p>
          </div>
        )}

        <div className="flex justify-center gap-4">
          <Link
            href="/submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg shadow-lg transition-colors"
          >
            提交项目
          </Link>
          <Link
            href="/admin"
            className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-8 rounded-lg shadow-lg transition-colors"
          >
            管理后台
          </Link>
        </div>
      </div>
    </div>
  );
}
