import { ModuleHub, type ModuleItem } from "@/components/learning/ModuleHub";
import { resolveInterfaceLanguage, type InterfaceLanguage, type PageSearchParams } from "@/lib/language";

type EnglishHomeCopy = {
  eyebrow: string;
  title: string;
  description: string;
  cta: string;
  modules: ModuleItem[];
};

const englishHomeCopy: Record<"en" | "zh" | "ja" | "ar", EnglishHomeCopy> = {
  en: {
    eyebrow: "English Learning",
    title: "English Training Center",
    description: "Vocabulary, typing, grammar, reading, quizzes, progress tracking and review in one focused path.",
    cta: "Open English path",
    modules: [
      { href: "/today", eyebrow: "Today", title: "Today Study", description: "Review, new words, typing, reading and practice in one daily queue.", points: ["daily queue", "review", "local progress", "no login needed"] },
      { href: "/english/vocabulary/custom", eyebrow: "Wordbook", title: "Custom Wordbook", description: "Import your own words, tag them, search them, back up JSON and drill immediately.", points: ["import", "tags", "multiple choice", "spaced review"] },
      { href: "/english/typing", eyebrow: "Typing", title: "English Dictation Typing", description: "Listen first, type the exact word or sentence, and retry after mistakes.", points: ["listening", "typing", "retry", "shortcuts"] },
      { href: "/english/vocabulary", eyebrow: "Vocabulary", title: "Vocabulary Center", description: "Junior high, senior high, IELTS, TOEFL, CET and graduate vocabulary packs keep expanding.", points: ["school words", "IELTS", "TOEFL", "CET"] },
      { href: "/english/grammar", eyebrow: "Grammar", title: "Grammar System", description: "Short rules, examples, judgment and multiple-choice practice.", points: ["rules", "examples", "judgment", "choice"] },
      { href: "/english/reading", eyebrow: "Reading", title: "Original Article Library", description: "Original leveled reading for school, IELTS and TOEFL style practice without official exam content.", points: ["original", "leveled", "reading", "analysis"] },
      { href: "/english/question-bank", eyebrow: "Questions", title: "Original Question Bank", description: "Original multiple-choice and fill-blank questions for steady English practice.", points: ["choice", "fill blank", "original", "review"] },
      { href: "/english/quiz/basic", eyebrow: "Quiz", title: "English Quiz", description: "Auto scoring, explanations, wrong-question saving and review loop.", points: ["score", "explain", "wrong bank", "review"] },
    ],
  },
  zh: {
    eyebrow: "英语学习",
    title: "英语训练中心",
    description: "词汇 打字 语法 阅读 测验 进度追踪和复习闭环集中在一条路径里",
    cta: "打开英语路径",
    modules: [
      { href: "/today", eyebrow: "今日", title: "今日学习", description: "复习 新词 打字 阅读 刷题集中在一页 打开就知道下一步做什么", points: ["每日队列", "复习", "本地进度", "不用登录"] },
      { href: "/english/vocabulary/custom", eyebrow: "我的词书", title: "自定义词书", description: "自己导入单词 标签分组 搜索筛选 JSON 备份 并直接进入背词训练", points: ["批量导入", "标签", "四选一", "艾宾浩斯"] },
      { href: "/english/typing", eyebrow: "打字", title: "英文听写打字", description: "听音后输入英文 单词和句子都必须打对才过关 错了自动重听", points: ["听音打字", "错了重听", "本地进度", "不用登录"] },
      { href: "/english/vocabulary", eyebrow: "词汇", title: "考试词汇", description: "初中 高中 雅思 托福 四级 六级 考研词汇 重点词和句式持续扩充", points: ["初中词汇", "高中词汇", "雅思托福", "四六级考研"] },
      { href: "/english/grammar", eyebrow: "语法", title: "语法系统", description: "短规则 例句 判断题 选择题 组合成可持续练习", points: ["规则", "例句", "判断", "选择"] },
      { href: "/english/reading", eyebrow: "阅读", title: "原创文章库", description: "初中 高中 雅思 托福方向原创阅读持续扩充 不收录官方试卷内容", points: ["原创文章", "分级阅读", "雅思托福"] },
      { href: "/english/question-bank", eyebrow: "题库", title: "原创选择填空题库", description: "雅思 托福和各年级选择填空题持续扩充 全部站内原创", points: ["选择题", "填空题", "原创题库"] },
      { href: "/english/quiz/basic", eyebrow: "测验", title: "英语测验", description: "自动判分 答案解析 错题收藏 复习闭环", points: ["自动判分", "错题本", "复习"] },
    ],
  },
  ja: {
    eyebrow: "英語学習",
    title: "英語トレーニングセンター",
    description: "語彙 タイピング 文法 読解 クイズ 進捗 復習を一つの学習ルートにまとめます",
    cta: "英語パスを開く",
    modules: [
      { href: "/today", eyebrow: "今日", title: "今日の学習", description: "復習 新しい単語 タイピング 読解 練習を一つの毎日キューにまとめます", points: ["毎日", "復習", "進捗", "ログイン不要"] },
      { href: "/english/vocabulary/custom", eyebrow: "単語帳", title: "カスタム単語帳", description: "自分の単語を取り込み タグ 検索 JSON バックアップからすぐ練習できます", points: ["取り込み", "タグ", "選択", "間隔復習"] },
      { href: "/english/typing", eyebrow: "タイピング", title: "英語ディクテーション", description: "音を聞いて正確に入力し 間違えたらもう一度聞いてやり直します", points: ["聞く", "入力", "再挑戦", "ショートカット"] },
      { href: "/english/vocabulary", eyebrow: "語彙", title: "語彙センター", description: "学校 IELTS TOEFL CET 大学院向け語彙を継続的に拡張します", points: ["学校語彙", "IELTS", "TOEFL", "CET"] },
      { href: "/english/grammar", eyebrow: "文法", title: "文法システム", description: "短いルール 例文 判断問題 選択問題で練習します", points: ["ルール", "例文", "判断", "選択"] },
      { href: "/english/reading", eyebrow: "読解", title: "オリジナル記事ライブラリ", description: "公式試験内容を使わず 段階別のオリジナル読解を用意します", points: ["オリジナル", "段階別", "読解", "解説"] },
      { href: "/english/question-bank", eyebrow: "問題", title: "オリジナル問題庫", description: "選択と穴埋めのオリジナル問題で安定して練習できます", points: ["選択", "穴埋め", "オリジナル", "復習"] },
      { href: "/english/quiz/basic", eyebrow: "クイズ", title: "英語クイズ", description: "自動採点 解説 間違い保存 復習ループに対応します", points: ["採点", "解説", "復習ノート", "復習"] },
    ],
  },
  ar: {
    eyebrow: "تعلم الإنجليزية",
    title: "مركز تدريب الإنجليزية",
    description: "المفردات والكتابة والقواعد والقراءة والاختبارات والتقدم والمراجعة في مسار واحد واضح",
    cta: "افتح مسار الإنجليزية",
    modules: [
      { href: "/today", eyebrow: "اليوم", title: "دراسة اليوم", description: "المراجعة والكلمات الجديدة والكتابة والقراءة والتدريب في قائمة يومية واحدة", points: ["يومي", "مراجعة", "تقدم محلي", "بدون تسجيل"] },
      { href: "/english/vocabulary/custom", eyebrow: "دفتر الكلمات", title: "دفتر كلمات مخصص", description: "استورد كلماتك وضع الوسوم وابحث واحفظ JSON وابدأ التدريب مباشرة", points: ["استيراد", "وسوم", "اختيار", "مراجعة متباعدة"] },
      { href: "/english/typing", eyebrow: "الكتابة", title: "إملاء إنجليزي بالكتابة", description: "استمع أولا واكتب الكلمة أو الجملة بدقة وأعد المحاولة بعد الخطأ", points: ["استماع", "كتابة", "إعادة", "اختصارات"] },
      { href: "/english/vocabulary", eyebrow: "المفردات", title: "مركز المفردات", description: "حزم مفردات مدرسية و IELTS و TOEFL و CET تتوسع باستمرار", points: ["مدرسة", "IELTS", "TOEFL", "CET"] },
      { href: "/english/grammar", eyebrow: "القواعد", title: "نظام القواعد", description: "قواعد قصيرة وأمثلة وأسئلة حكم واختيار", points: ["قواعد", "أمثلة", "حكم", "اختيار"] },
      { href: "/english/reading", eyebrow: "القراءة", title: "مكتبة مقالات أصلية", description: "قراءة أصلية متدرجة دون استخدام محتوى اختبارات رسمية", points: ["أصلي", "متدرج", "قراءة", "شرح"] },
      { href: "/english/question-bank", eyebrow: "الأسئلة", title: "بنك أسئلة أصلي", description: "اختيار وملء فراغات أصلية للتدريب المستمر", points: ["اختيار", "فراغ", "أصلي", "مراجعة"] },
      { href: "/english/quiz/basic", eyebrow: "اختبار", title: "اختبار الإنجليزية", description: "تصحيح آلي وشرح وحفظ الأخطاء وحلقة مراجعة", points: ["تصحيح", "شرح", "دفتر الأخطاء", "مراجعة"] },
    ],
  },
};

function homeLanguage(language: InterfaceLanguage) {
  return language === "zh" || language === "ja" || language === "ar" ? language : "en";
}

export default async function EnglishHome({ searchParams }: { searchParams?: Promise<PageSearchParams> }) {
  const language = resolveInterfaceLanguage(searchParams ? await searchParams : undefined);
  const pageCopy = englishHomeCopy[homeLanguage(language)];

  return (
    <ModuleHub
      eyebrow={pageCopy.eyebrow}
      title={pageCopy.title}
      description={pageCopy.description}
      modules={pageCopy.modules}
      ctaHref="/learn/english"
      ctaLabel={pageCopy.cta}
      language={language}
    />
  );
}
