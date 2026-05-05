import { PrismaClient } from '@prisma/client'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'

const databaseUrl = new URL(process.env.DATABASE_URL ?? '')

const adapter = new PrismaMariaDb({
  host: databaseUrl.hostname,
  port: Number(databaseUrl.port || 3306),
  user: decodeURIComponent(databaseUrl.username),
  password: decodeURIComponent(databaseUrl.password),
  database: databaseUrl.pathname.replace(/^\//, ''),
  connectionLimit: 5,
  ssl: false,
})

const prisma = new PrismaClient({ adapter })

async function main() {
  // 创建分类
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: '游戏排行榜',
        description: '最热门的游戏推荐',
        icon: '🎮',
      },
    }),
    prisma.category.create({
      data: {
        name: '音乐排行榜',
        description: '最受欢迎的音乐作品',
        icon: '🎵',
      },
    }),
    prisma.category.create({
      data: {
        name: '电影排行榜',
        description: '高分电影推荐',
        icon: '🎬',
      },
    }),
    prisma.category.create({
      data: {
        name: '书籍排行榜',
        description: '值得一读的好书',
        icon: '📚',
      },
    }),
  ])

  console.log('创建了', categories.length, '个分类')

  // 为每个分类添加一些示例数据
  await prisma.ranking.create({
    data: {
      title: '塞尔达传说：王国之泪',
      description: '任天堂开放世界冒险游戏的巅峰之作',
      categoryId: categories[0].id,
      score: 9.8,
      votes: 1250,
      status: 'approved',
    },
  })

  await prisma.ranking.create({
    data: {
      title: '艾尔登法环',
      description: '魂系列游戏的集大成之作',
      categoryId: categories[0].id,
      score: 9.5,
      votes: 980,
      status: 'approved',
    },
  })

  console.log('添加了示例数据')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
