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

  // 创建题库数据
  console.log('开始填充题库数据...')

  const questions = [
    // 函数类（5题）
    {
      content: "已知函数 f(x) = 2x³ - 3x² + 1，求 f'(1) 的值。",
      answer: "0",
      explanation: "f'(x) = 6x² - 6x，代入 x=1 得 f'(1) = 6 - 6 = 0",
      difficulty: "简单",
      subject: "数学",
      topic: "函数",
      type: "填空题",
    },
    {
      content: "函数 f(x) = log₂(x² - 3x + 2) 的定义域是？",
      answer: "(-∞, 1) ∪ (2, +∞)",
      explanation: "x² - 3x + 2 > 0，解得 x < 1 或 x > 2",
      difficulty: "中等",
      subject: "数学",
      topic: "函数",
      type: "解答题",
    },
    {
      content: "若函数 f(x) = ax² + bx + c 的图像过点 (0, 1)、(1, 0)、(2, 3)，求 a + b + c 的值。",
      answer: "1",
      explanation: "由 f(0)=1 得 c=1；由 f(1)=0 得 a+b+c=0；由 f(2)=3 得 4a+2b+c=3。解方程组得 a=2, b=-3, c=1，故 a+b+c=0",
      difficulty: "中等",
      subject: "数学",
      topic: "函数",
      type: "解答题",
    },
    {
      content: "已知 f(x) 是定义在 R 上的奇函数，当 x > 0 时，f(x) = x² - 2x，求 f(-1) 的值。",
      answer: "1",
      explanation: "f(1) = 1 - 2 = -1，由奇函数性质 f(-1) = -f(1) = 1",
      difficulty: "中等",
      subject: "数学",
      topic: "函数",
      type: "填空题",
    },
    {
      content: "函数 y = sin(2x + π/3) 的最小正周期是？",
      answer: "π",
      explanation: "T = 2π/ω = 2π/2 = π",
      difficulty: "简单",
      subject: "数学",
      topic: "三角函数",
      type: "填空题",
    },

    // 三角函数类（5题）
    {
      content: "已知 sinα + cosα = 1/2，求 sin2α 的值。",
      answer: "-3/4",
      explanation: "(sinα + cosα)² = 1 + 2sinαcosα = 1/4，得 sin2α = 2sinαcosα = -3/4",
      difficulty: "中等",
      subject: "数学",
      topic: "三角函数",
      type: "解答题",
    },
    {
      content: "在△ABC中，a=3, b=4, cosC=1/2，求边 c 的长度。",
      answer: "√13",
      explanation: "由余弦定理 c² = a² + b² - 2ab·cosC = 9 + 16 - 2×3×4×(1/2) = 13，故 c = √13",
      difficulty: "中等",
      subject: "数学",
      topic: "三角函数",
      type: "解答题",
    },
    {
      content: "化简：sin15°cos15° = ?",
      answer: "1/4",
      explanation: "sin15°cos15° = (1/2)sin30° = 1/4",
      difficulty: "简单",
      subject: "数学",
      topic: "三角函数",
      type: "填空题",
    },
    {
      content: "已知 tanα = 2，求 (sinα + cosα)/(sinα - cosα) 的值。",
      answer: "3",
      explanation: "分子分母同除以 cosα，得 (tanα + 1)/(tanα - 1) = 3/1 = 3",
      difficulty: "中等",
      subject: "数学",
      topic: "三角函数",
      type: "填空题",
    },
    {
      content: "函数 y = 3sin(x/2 - π/4) 的振幅、周期、初相分别是？",
      answer: "振幅3，周期4π，初相-π/4",
      explanation: "振幅 A=3，周期 T=2π/(1/2)=4π，初相 φ=-π/4",
      difficulty: "简单",
      subject: "数学",
      topic: "三角函数",
      type: "解答题",
    },

    // 立体几何类（5题）
    {
      content: "正方体的体对角线长度为 6，求其表面积。",
      answer: "72",
      explanation: "设边长为 a，则 a√3 = 6，得 a = 2√3。表面积 = 6a² = 6×12 = 72",
      difficulty: "中等",
      subject: "数学",
      topic: "立体几何",
      type: "解答题",
    },
    {
      content: "圆锥的底面半径为 3，母线长为 5，求其侧面积。",
      answer: "15π",
      explanation: "侧面积 = πrl = π×3×5 = 15π",
      difficulty: "简单",
      subject: "数学",
      topic: "立体几何",
      type: "填空题",
    },
    {
      content: "球的表面积为 36π，求其体积。",
      answer: "36π",
      explanation: "4πr² = 36π，得 r=3。体积 V = (4/3)πr³ = 36π",
      difficulty: "中等",
      subject: "数学",
      topic: "立体几何",
      type: "解答题",
    },
    {
      content: "长方体的长、宽、高分别为 2、3、6，求其外接球的表面积。",
      answer: "49π",
      explanation: "外接球直径 = √(4+9+36) = 7，半径 r=7/2，表面积 = 4πr² = 49π",
      difficulty: "困难",
      subject: "数学",
      topic: "立体几何",
      type: "解答题",
    },
    {
      content: "正四面体的棱长为 a，求其高。",
      answer: "(√6/3)a",
      explanation: "设高为 h，底面中心到顶点距离为 (√3/3)a，由勾股定理 h² + (a√3/3)² = a²，解得 h = (√6/3)a",
      difficulty: "困难",
      subject: "数学",
      topic: "立体几何",
      type: "解答题",
    },

    // 解析几何类（5题）
    {
      content: "直线 2x + 3y - 6 = 0 与 x 轴、y 轴的交点坐标分别是？",
      answer: "(3, 0) 和 (0, 2)",
      explanation: "令 y=0 得 x=3；令 x=0 得 y=2",
      difficulty: "简单",
      subject: "数学",
      topic: "解析几何",
      type: "填空题",
    },
    {
      content: "圆 x² + y² - 4x + 6y - 3 = 0 的圆心和半径分别是？",
      answer: "圆心(2, -3)，半径4",
      explanation: "配方得 (x-2)² + (y+3)² = 16，圆心(2,-3)，半径4",
      difficulty: "中等",
      subject: "数学",
      topic: "解析几何",
      type: "解答题",
    },
    {
      content: "抛物线 y² = 8x 的焦点坐标是？",
      answer: "(2, 0)",
      explanation: "y² = 2px，2p = 8，p = 4，焦点 (p/2, 0) = (2, 0)",
      difficulty: "简单",
      subject: "数学",
      topic: "解析几何",
      type: "填空题",
    },
    {
      content: "椭圆 x²/25 + y²/9 = 1 的离心率是？",
      answer: "4/5",
      explanation: "a²=25, b²=9, c²=a²-b²=16, c=4, e=c/a=4/5",
      difficulty: "中等",
      subject: "数学",
      topic: "解析几何",
      type: "填空题",
    },
    {
      content: "双曲线 x²/9 - y²/16 = 1 的渐近线方程是？",
      answer: "y = ±(4/3)x",
      explanation: "渐近线方程为 y = ±(b/a)x = ±(4/3)x",
      difficulty: "中等",
      subject: "数学",
      topic: "解析几何",
      type: "解答题",
    },

    // 数列类（5题）
    {
      content: "等差数列 {aₙ} 中，a₁=3, d=2，求 a₁₀。",
      answer: "21",
      explanation: "a₁₀ = a₁ + 9d = 3 + 18 = 21",
      difficulty: "简单",
      subject: "数学",
      topic: "数列",
      type: "填空题",
    },
    {
      content: "等比数列 {aₙ} 中，a₁=2, q=3，求前 5 项和 S₅。",
      answer: "242",
      explanation: "S₅ = a₁(1-q⁵)/(1-q) = 2(1-243)/(1-3) = 242",
      difficulty: "中等",
      subject: "数学",
      topic: "数列",
      type: "解答题",
    },
    {
      content: "数列 {aₙ} 满足 a₁=1, aₙ₊₁ = 2aₙ + 1，求 a₃。",
      answer: "7",
      explanation: "a₂ = 2×1+1 = 3，a₃ = 2×3+1 = 7",
      difficulty: "简单",
      subject: "数学",
      topic: "数列",
      type: "填空题",
    },
    {
      content: "等差数列 {aₙ} 中，a₃ + a₇ = 20，求 a₅。",
      answer: "10",
      explanation: "a₃ + a₇ = 2a₅ = 20，得 a₅ = 10",
      difficulty: "中等",
      subject: "数学",
      topic: "数列",
      type: "填空题",
    },
    {
      content: "数列 1, 1+2, 1+2+3, ..., 1+2+3+...+n 的第 n 项是？",
      answer: "n(n+1)/2",
      explanation: "第 n 项 = 1+2+...+n = n(n+1)/2",
      difficulty: "中等",
      subject: "数学",
      topic: "数列",
      type: "解答题",
    },

    // 综合类（5题）
    {
      content: "已知向量 a=(1,2), b=(3,4)，求 a·b。",
      answer: "11",
      explanation: "a·b = 1×3 + 2×4 = 11",
      difficulty: "简单",
      subject: "数学",
      topic: "向量",
      type: "填空题",
    },
    {
      content: "排列组合：从 5 个人中选 3 个人排成一排，有多少种排法？",
      answer: "60",
      explanation: "A(5,3) = 5×4×3 = 60",
      difficulty: "简单",
      subject: "数学",
      topic: "排列组合",
      type: "填空题",
    },
    {
      content: "二项式 (x + 1/x)⁶ 展开式中 x² 的系数是？",
      answer: "15",
      explanation: "通项 Tᵣ₊₁ = C(6,r)x⁶⁻²ʳ，令 6-2r=2 得 r=2，系数 C(6,2)=15",
      difficulty: "困难",
      subject: "数学",
      topic: "二项式定理",
      type: "解答题",
    },
    {
      content: "复数 z = 1 + i，求 |z|。",
      answer: "√2",
      explanation: "|z| = √(1² + 1²) = √2",
      difficulty: "简单",
      subject: "数学",
      topic: "复数",
      type: "填空题",
    },
    {
      content: "导数应用：函数 f(x) = x³ - 3x 在区间 [-2, 2] 上的最大值是？",
      answer: "2",
      explanation: "f'(x) = 3x² - 3 = 0 得 x=±1。f(-2)=-2, f(-1)=2, f(1)=-2, f(2)=2，最大值为 2",
      difficulty: "困难",
      subject: "数学",
      topic: "导数",
      type: "解答题",
    },
  ]

  for (const q of questions) {
    await prisma.question.create({ data: q })
  }

  console.log(`成功创建 ${questions.length} 道题目`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
