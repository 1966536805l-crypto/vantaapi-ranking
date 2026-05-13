import type { Metadata } from "next";
import { headers } from "next/headers";
import { ModuleHub, type ModuleItem } from "@/components/learning/ModuleHub";
import {
  localizedHref,
  localizedLanguageAlternates,
  resolveInterfaceLanguage,
  type InterfaceLanguage,
  type PageSearchParams,
} from "@/lib/language";

type EnglishHomeCopy = {
  eyebrow: string;
  title: string;
  description: string;
  cta: string;
  modules: ModuleItem[];
};

const englishHomeCopy: Record<InterfaceLanguage, EnglishHomeCopy> = {
  en: {
    eyebrow: "English Learning",
    title: "English Training Center",
    description: "Vocabulary, typing, grammar, reading, quizzes, progress tracking and review in one focused path.",
    cta: "Open English path",
    modules: [
      { href: "/today", eyebrow: "Today", title: "Today Study", description: "Review, new words, typing, reading and practice in one daily queue.", points: ["daily queue", "review", "local progress", "no login needed"] },
      { href: "/english/memory", eyebrow: "Memory", title: "Spaced Vocabulary System", description: "Choose a word bank and review with Ebbinghaus scheduling, pronunciation, spelling and Q/0 shortcuts.", points: ["Ebbinghaus", "Q know", "0 unknown", "saved progress"] },
      { href: "/english/vocabulary/custom", eyebrow: "Wordbook", title: "Custom Wordbook", description: "Import your own words, tag them, search them, back up JSON and drill immediately.", points: ["import", "tags", "multiple choice", "spaced review"] },
      { href: "/english/word-typing", eyebrow: "Word Typing", title: "Daily 50 Word Typing", description: "Start with a verified daily or middle-school core set, then use generated expansion words only for extra spelling practice.", points: ["today 50", "verified core", "audio", "progress"] },
      { href: "/english/vocabulary", eyebrow: "Vocabulary", title: "Vocabulary Center", description: "Verified core words are separated from generated spelling-practice expansion words.", points: ["verified core", "practice expansion", "IELTS", "TOEFL"] },
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
      { href: "/english/memory", eyebrow: "背单词", title: "背单词系统", description: "选择词库后用艾宾浩斯遗忘曲线复习 支持发音 拼写 Q 认识 0 不认识", points: ["艾宾浩斯", "Q 认识", "0 不认识", "保存进度"] },
      { href: "/english/vocabulary/custom", eyebrow: "我的词书", title: "自定义词书", description: "自己导入单词 标签分组 搜索筛选 JSON 备份 并直接进入背词训练", points: ["批量导入", "标签", "四选一", "艾宾浩斯"] },
      { href: "/english/word-typing", eyebrow: "单词打字", title: "今日 50 跟打", description: "默认从日常或初中精选词开始 扩展词只作为额外拼写练习", points: ["今日50", "精选核心", "发音例句", "保存进度"] },
      { href: "/english/vocabulary", eyebrow: "词汇", title: "考试词汇", description: "精选已校验词和扩展拼写练习词分开展示 不夸大正式词量", points: ["精选词", "扩展练习", "雅思托福", "四六级考研"] },
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
  ko: {
    eyebrow: "영어 학습",
    title: "영어 트레이닝 센터",
    description: "단어 타이핑 문법 읽기 퀴즈 진도 복습을 한 경로로 묶습니다",
    cta: "영어 경로 열기",
    modules: [
      { href: "/today", eyebrow: "오늘", title: "오늘 학습", description: "복습 새 단어 타이핑 읽기 연습을 하루 큐로 정리합니다", points: ["매일", "복습", "진도", "로그인 없음"] },
      { href: "/english/vocabulary/custom", eyebrow: "단어장", title: "나만의 단어장", description: "내 단어를 가져오고 태그 검색 JSON 백업 후 바로 연습합니다", points: ["가져오기", "태그", "선택", "간격 복습"] },
      { href: "/english/typing", eyebrow: "타이핑", title: "영어 받아쓰기", description: "먼저 듣고 단어나 문장을 정확히 입력하며 틀리면 다시 시도합니다", points: ["듣기", "입력", "재시도", "단축키"] },
      { href: "/english/vocabulary", eyebrow: "어휘", title: "어휘 센터", description: "학교 IELTS TOEFL CET 대학원 어휘 팩을 계속 확장합니다", points: ["학교", "IELTS", "TOEFL", "CET"] },
      { href: "/english/grammar", eyebrow: "문법", title: "문법 시스템", description: "짧은 규칙 예문 판단 문제 선택 문제로 연습합니다", points: ["규칙", "예문", "판단", "선택"] },
      { href: "/english/reading", eyebrow: "읽기", title: "오리지널 글 라이브러리", description: "공식 시험 내용을 쓰지 않는 단계별 오리지널 읽기입니다", points: ["오리지널", "단계별", "읽기", "해설"] },
      { href: "/english/question-bank", eyebrow: "문제", title: "오리지널 문제 은행", description: "선택과 빈칸 문제로 꾸준히 영어를 연습합니다", points: ["선택", "빈칸", "오리지널", "복습"] },
      { href: "/english/quiz/basic", eyebrow: "퀴즈", title: "영어 퀴즈", description: "자동 채점 해설 오답 저장 복습 루프를 제공합니다", points: ["채점", "해설", "오답", "복습"] },
    ],
  },
  es: {
    eyebrow: "Aprendizaje de ingles",
    title: "Centro de entrenamiento de ingles",
    description: "Vocabulario, escritura, gramatica, lectura, cuestionarios, progreso y repaso en una ruta clara.",
    cta: "Abrir ruta de ingles",
    modules: [
      { href: "/today", eyebrow: "Hoy", title: "Estudio de hoy", description: "Repaso, palabras nuevas, escritura, lectura y practica en una cola diaria.", points: ["diario", "repaso", "progreso", "sin login"] },
      { href: "/english/vocabulary/custom", eyebrow: "Vocabulario", title: "Libro de palabras propio", description: "Importa palabras, usa etiquetas, busca, guarda JSON y practica al instante.", points: ["importar", "etiquetas", "opcion", "repaso"] },
      { href: "/english/typing", eyebrow: "Escritura", title: "Dictado en ingles", description: "Escucha primero, escribe exacto y reintenta cuando fallas.", points: ["escuchar", "escribir", "reintento", "atajos"] },
      { href: "/english/vocabulary", eyebrow: "Palabras", title: "Centro de vocabulario", description: "Paquetes escolares, IELTS, TOEFL, CET y posgrado en expansion.", points: ["escuela", "IELTS", "TOEFL", "CET"] },
      { href: "/english/grammar", eyebrow: "Gramatica", title: "Sistema de gramatica", description: "Reglas cortas, ejemplos y practica de juicio y opcion multiple.", points: ["reglas", "ejemplos", "juicio", "opcion"] },
      { href: "/english/reading", eyebrow: "Lectura", title: "Biblioteca original", description: "Lecturas niveladas originales sin contenido oficial de examenes.", points: ["original", "niveles", "lectura", "analisis"] },
      { href: "/english/question-bank", eyebrow: "Preguntas", title: "Banco original", description: "Preguntas originales de opcion y huecos para practica estable.", points: ["opcion", "huecos", "original", "repaso"] },
      { href: "/english/quiz/basic", eyebrow: "Quiz", title: "Quiz de ingles", description: "Puntuacion automatica, explicaciones, errores guardados y repaso.", points: ["nota", "explica", "errores", "repaso"] },
    ],
  },
  fr: {
    eyebrow: "Apprentissage anglais",
    title: "Centre d'entrainement anglais",
    description: "Vocabulaire, frappe, grammaire, lecture, quiz, progression et revision dans un parcours clair.",
    cta: "Ouvrir le parcours anglais",
    modules: [
      { href: "/today", eyebrow: "Aujourd hui", title: "Etude du jour", description: "Revision, nouveaux mots, dictee, lecture et pratique dans une file quotidienne.", points: ["quotidien", "revision", "progression", "sans login"] },
      { href: "/english/vocabulary/custom", eyebrow: "Carnet", title: "Carnet de mots", description: "Importez vos mots, ajoutez des tags, cherchez, sauvegardez JSON et pratiquez.", points: ["import", "tags", "choix", "revision"] },
      { href: "/english/typing", eyebrow: "Frappe", title: "Dictee anglaise", description: "Ecoutez, tapez exactement, puis recommencez apres une erreur.", points: ["ecoute", "frappe", "reessai", "raccourcis"] },
      { href: "/english/vocabulary", eyebrow: "Vocabulaire", title: "Centre vocabulaire", description: "Packs scolaires, IELTS, TOEFL, CET et concours en expansion.", points: ["ecole", "IELTS", "TOEFL", "CET"] },
      { href: "/english/grammar", eyebrow: "Grammaire", title: "Systeme grammaire", description: "Regles courtes, exemples, questions de jugement et choix.", points: ["regles", "exemples", "jugement", "choix"] },
      { href: "/english/reading", eyebrow: "Lecture", title: "Bibliotheque originale", description: "Lectures originales par niveau sans contenu officiel d'examen.", points: ["original", "niveaux", "lecture", "analyse"] },
      { href: "/english/question-bank", eyebrow: "Questions", title: "Banque originale", description: "Questions originales de choix et blancs pour pratiquer regulierement.", points: ["choix", "blancs", "original", "revision"] },
      { href: "/english/quiz/basic", eyebrow: "Quiz", title: "Quiz anglais", description: "Score automatique, explications, erreurs sauvegardees et revision.", points: ["score", "expliquer", "erreurs", "revision"] },
    ],
  },
  de: {
    eyebrow: "Englisch lernen",
    title: "Englisch Trainingszentrum",
    description: "Wortschatz, Tippen, Grammatik, Lesen, Quiz, Fortschritt und Wiederholung in einem klaren Pfad.",
    cta: "Englischpfad oeffnen",
    modules: [
      { href: "/today", eyebrow: "Heute", title: "Lernen heute", description: "Wiederholung, neue Woerter, Tippen, Lesen und Uebung in einer Tagesliste.", points: ["taeglich", "wiederholen", "Fortschritt", "kein Login"] },
      { href: "/english/vocabulary/custom", eyebrow: "Wortbuch", title: "Eigenes Wortbuch", description: "Eigene Woerter importieren, taggen, suchen, JSON sichern und sofort ueben.", points: ["Import", "Tags", "Auswahl", "Abstand"] },
      { href: "/english/typing", eyebrow: "Tippen", title: "Englisches Diktat", description: "Erst hoeren, exakt tippen und nach Fehlern neu versuchen.", points: ["Hoeren", "Tippen", "Neuversuch", "Tasten"] },
      { href: "/english/vocabulary", eyebrow: "Wortschatz", title: "Wortschatzzentrum", description: "Schule, IELTS, TOEFL, CET und Graduiertenwortschatz wachsen weiter.", points: ["Schule", "IELTS", "TOEFL", "CET"] },
      { href: "/english/grammar", eyebrow: "Grammatik", title: "Grammatiksystem", description: "Kurze Regeln, Beispiele, Urteil und Multiple Choice.", points: ["Regeln", "Beispiele", "Urteil", "Auswahl"] },
      { href: "/english/reading", eyebrow: "Lesen", title: "Originale Lesebibliothek", description: "Originale Lesetexte nach Niveau ohne offizielle Pruefungsinhalte.", points: ["Original", "Niveau", "Lesen", "Analyse"] },
      { href: "/english/question-bank", eyebrow: "Fragen", title: "Originale Fragenbank", description: "Originale Auswahl- und Lueckenfragen fuer stabiles Training.", points: ["Auswahl", "Luecken", "Original", "Wiederholung"] },
      { href: "/english/quiz/basic", eyebrow: "Quiz", title: "Englisch Quiz", description: "Automatische Bewertung, Erklaerungen, Fehler speichern und wiederholen.", points: ["Score", "Erklaerung", "Fehler", "Wiederholen"] },
    ],
  },
  pt: {
    eyebrow: "Aprender ingles",
    title: "Centro de treino de ingles",
    description: "Vocabulario, digitacao, gramatica, leitura, quizzes, progresso e revisao em uma rota clara.",
    cta: "Abrir rota de ingles",
    modules: [
      { href: "/today", eyebrow: "Hoje", title: "Estudo de hoje", description: "Revisao, palavras novas, digitacao, leitura e pratica em uma fila diaria.", points: ["diario", "revisao", "progresso", "sem login"] },
      { href: "/english/vocabulary/custom", eyebrow: "Vocabulario", title: "Livro de palavras", description: "Importe palavras, use tags, pesquise, salve JSON e pratique.", points: ["importar", "tags", "escolha", "revisao"] },
      { href: "/english/typing", eyebrow: "Digitacao", title: "Ditado em ingles", description: "Ouça primeiro, digite exato e tente de novo apos erro.", points: ["ouvir", "digitar", "repetir", "atalhos"] },
      { href: "/english/vocabulary", eyebrow: "Palavras", title: "Centro de vocabulario", description: "Pacotes escolares, IELTS, TOEFL, CET e pos-graduacao em expansao.", points: ["escola", "IELTS", "TOEFL", "CET"] },
      { href: "/english/grammar", eyebrow: "Gramatica", title: "Sistema de gramatica", description: "Regras curtas, exemplos, julgamento e escolha.", points: ["regras", "exemplos", "julgar", "escolha"] },
      { href: "/english/reading", eyebrow: "Leitura", title: "Biblioteca original", description: "Leituras originais por nivel sem conteudo oficial de exames.", points: ["original", "nivel", "leitura", "analise"] },
      { href: "/english/question-bank", eyebrow: "Perguntas", title: "Banco original", description: "Perguntas originais de escolha e lacunas para pratica constante.", points: ["escolha", "lacunas", "original", "revisao"] },
      { href: "/english/quiz/basic", eyebrow: "Quiz", title: "Quiz de ingles", description: "Pontuacao automatica, explicacoes, erros salvos e revisao.", points: ["nota", "explica", "erros", "revisao"] },
    ],
  },
  ru: {
    eyebrow: "Изучение английского",
    title: "Центр тренировки английского",
    description: "Слова, набор, грамматика, чтение, тесты, прогресс и повторение в одном понятном маршруте.",
    cta: "Открыть маршрут английского",
    modules: [
      { href: "/today", eyebrow: "Сегодня", title: "Учеба сегодня", description: "Повторение, новые слова, набор, чтение и практика в одной дневной очереди.", points: ["день", "повтор", "прогресс", "без входа"] },
      { href: "/english/vocabulary/custom", eyebrow: "Словарь", title: "Свой словарь", description: "Импортируйте слова, теги, поиск, JSON копию и сразу тренируйтесь.", points: ["импорт", "теги", "выбор", "интервал"] },
      { href: "/english/typing", eyebrow: "Набор", title: "Английский диктант", description: "Сначала слушайте, затем точно вводите и повторяйте после ошибки.", points: ["слух", "набор", "повтор", "клавиши"] },
      { href: "/english/vocabulary", eyebrow: "Слова", title: "Центр словаря", description: "Школа, IELTS, TOEFL, CET и академические наборы расширяются.", points: ["школа", "IELTS", "TOEFL", "CET"] },
      { href: "/english/grammar", eyebrow: "Грамматика", title: "Система грамматики", description: "Короткие правила, примеры, задания на выбор и оценку.", points: ["правила", "примеры", "оценка", "выбор"] },
      { href: "/english/reading", eyebrow: "Чтение", title: "Библиотека оригинальных текстов", description: "Оригинальное чтение по уровням без официальных экзаменационных материалов.", points: ["оригинал", "уровни", "чтение", "анализ"] },
      { href: "/english/question-bank", eyebrow: "Вопросы", title: "Оригинальный банк вопросов", description: "Оригинальные вопросы выбора и пропусков для стабильной практики.", points: ["выбор", "пропуски", "оригинал", "повтор"] },
      { href: "/english/quiz/basic", eyebrow: "Тест", title: "Тест английского", description: "Автооценка, объяснения, сохранение ошибок и повторение.", points: ["балл", "объяснение", "ошибки", "повтор"] },
    ],
  },
  hi: {
    eyebrow: "English learning",
    title: "English Training Center",
    description: "Vocabulary typing grammar reading quizzes progress aur review ek clear path me.",
    cta: "English path kholen",
    modules: [
      { href: "/today", eyebrow: "Aaj", title: "Aaj ka study", description: "Review, new words, typing, reading aur practice ek daily queue me.", points: ["daily", "review", "progress", "no login"] },
      { href: "/english/vocabulary/custom", eyebrow: "Wordbook", title: "Apni wordbook", description: "Apne words import karo, tags lagao, search karo, JSON backup aur practice.", points: ["import", "tags", "choice", "spaced review"] },
      { href: "/english/typing", eyebrow: "Typing", title: "English dictation typing", description: "Pehle suno, exact type karo, galti par dobara try karo.", points: ["listen", "type", "retry", "shortcuts"] },
      { href: "/english/vocabulary", eyebrow: "Vocabulary", title: "Vocabulary Center", description: "School, IELTS, TOEFL, CET aur postgraduate word packs expand hote rahte hain.", points: ["school", "IELTS", "TOEFL", "CET"] },
      { href: "/english/grammar", eyebrow: "Grammar", title: "Grammar system", description: "Short rules, examples, judgment aur multiple choice practice.", points: ["rules", "examples", "judge", "choice"] },
      { href: "/english/reading", eyebrow: "Reading", title: "Original article library", description: "Official exam content ke bina leveled original reading.", points: ["original", "level", "reading", "analysis"] },
      { href: "/english/question-bank", eyebrow: "Questions", title: "Original question bank", description: "Choice aur fill blank questions steady practice ke liye.", points: ["choice", "blank", "original", "review"] },
      { href: "/english/quiz/basic", eyebrow: "Quiz", title: "English quiz", description: "Auto score, explanation, wrong items save aur review loop.", points: ["score", "explain", "wrong", "review"] },
    ],
  },
  id: {
    eyebrow: "Belajar Inggris",
    title: "Pusat latihan Inggris",
    description: "Kosakata, mengetik, tata bahasa, membaca, kuis, progres dan ulasan dalam satu jalur.",
    cta: "Buka jalur Inggris",
    modules: [
      { href: "/today", eyebrow: "Hari ini", title: "Belajar hari ini", description: "Ulasan, kata baru, mengetik, membaca dan latihan dalam antrean harian.", points: ["harian", "ulasan", "progres", "tanpa login"] },
      { href: "/english/vocabulary/custom", eyebrow: "Wordbook", title: "Buku kata sendiri", description: "Impor kata, beri tag, cari, cadangkan JSON dan langsung latihan.", points: ["impor", "tag", "pilihan", "spasi"] },
      { href: "/english/typing", eyebrow: "Mengetik", title: "Dikte Inggris", description: "Dengar dulu, ketik tepat, lalu coba lagi setelah salah.", points: ["dengar", "ketik", "ulang", "shortcut"] },
      { href: "/english/vocabulary", eyebrow: "Kosakata", title: "Pusat kosakata", description: "Paket sekolah, IELTS, TOEFL, CET dan pascasarjana terus bertambah.", points: ["sekolah", "IELTS", "TOEFL", "CET"] },
      { href: "/english/grammar", eyebrow: "Grammar", title: "Sistem grammar", description: "Aturan singkat, contoh, soal benar salah dan pilihan.", points: ["aturan", "contoh", "nilai", "pilihan"] },
      { href: "/english/reading", eyebrow: "Membaca", title: "Perpustakaan artikel original", description: "Bacaan bertingkat original tanpa konten ujian resmi.", points: ["original", "level", "baca", "analisis"] },
      { href: "/english/question-bank", eyebrow: "Soal", title: "Bank soal original", description: "Soal pilihan dan isian original untuk latihan stabil.", points: ["pilihan", "isian", "original", "ulasan"] },
      { href: "/english/quiz/basic", eyebrow: "Kuis", title: "Kuis Inggris", description: "Skor otomatis, penjelasan, simpan salah dan ulangi.", points: ["skor", "jelas", "salah", "ulang"] },
    ],
  },
  vi: {
    eyebrow: "Hoc tieng Anh",
    title: "Trung tam luyen tieng Anh",
    description: "Tu vung, go chu, ngu phap, doc, quiz, tien do va on tap trong mot lo trinh.",
    cta: "Mo lo trinh tieng Anh",
    modules: [
      { href: "/today", eyebrow: "Hom nay", title: "Hoc hom nay", description: "On tap, tu moi, go chu, doc va luyen tap trong hang doi moi ngay.", points: ["hang ngay", "on tap", "tien do", "khong can login"] },
      { href: "/english/vocabulary/custom", eyebrow: "So tu", title: "So tu rieng", description: "Nhap tu cua ban, gan tag, tim kiem, sao luu JSON va luyen ngay.", points: ["nhap", "tag", "chon", "on cach quang"] },
      { href: "/english/typing", eyebrow: "Go chu", title: "Nghe va go tieng Anh", description: "Nghe truoc, go chinh xac, sai thi thu lai.", points: ["nghe", "go", "thu lai", "phim tat"] },
      { href: "/english/vocabulary", eyebrow: "Tu vung", title: "Trung tam tu vung", description: "Goi tu vung truong hoc, IELTS, TOEFL, CET va sau dai hoc tiep tuc mo rong.", points: ["truong hoc", "IELTS", "TOEFL", "CET"] },
      { href: "/english/grammar", eyebrow: "Ngu phap", title: "He thong ngu phap", description: "Quy tac ngan, vi du, cau hoi danh gia va lua chon.", points: ["quy tac", "vi du", "danh gia", "lua chon"] },
      { href: "/english/reading", eyebrow: "Doc", title: "Thu vien bai doc goc", description: "Bai doc phan cap tu viet, khong dung noi dung de thi chinh thuc.", points: ["goc", "cap do", "doc", "phan tich"] },
      { href: "/english/question-bank", eyebrow: "Cau hoi", title: "Ngan hang cau hoi goc", description: "Cau hoi chon va dien tu goc de luyen tap deu dan.", points: ["chon", "dien tu", "goc", "on tap"] },
      { href: "/english/quiz/basic", eyebrow: "Quiz", title: "Quiz tieng Anh", description: "Cham diem tu dong, giai thich, luu cau sai va on tap.", points: ["diem", "giai thich", "sai", "on"] },
    ],
  },
  th: {
    eyebrow: "เรียนอังกฤษ",
    title: "ศูนย์ฝึกอังกฤษ",
    description: "คำศัพท์ พิมพ์ ไวยากรณ์ อ่าน แบบทดสอบ ความคืบหน้า และทบทวนในเส้นทางเดียว",
    cta: "เปิดเส้นทางอังกฤษ",
    modules: [
      { href: "/today", eyebrow: "วันนี้", title: "เรียนวันนี้", description: "ทบทวน คำใหม่ พิมพ์ อ่าน และฝึกในคิวรายวัน", points: ["รายวัน", "ทบทวน", "คืบหน้า", "ไม่ต้องล็อกอิน"] },
      { href: "/english/vocabulary/custom", eyebrow: "สมุดคำ", title: "สมุดคำของฉัน", description: "นำเข้าคำ ติดแท็ก ค้นหา สำรอง JSON แล้วฝึกทันที", points: ["นำเข้า", "แท็ก", "เลือกตอบ", "ทบทวน"] },
      { href: "/english/typing", eyebrow: "พิมพ์", title: "พิมพ์ตามเสียงอังกฤษ", description: "ฟังก่อน พิมพ์ให้ตรง ผิดแล้วลองใหม่", points: ["ฟัง", "พิมพ์", "ลองใหม่", "ปุ่มลัด"] },
      { href: "/english/vocabulary", eyebrow: "คำศัพท์", title: "ศูนย์คำศัพท์", description: "ชุดคำศัพท์โรงเรียน IELTS TOEFL CET และระดับสูงเพิ่มต่อเนื่อง", points: ["โรงเรียน", "IELTS", "TOEFL", "CET"] },
      { href: "/english/grammar", eyebrow: "ไวยากรณ์", title: "ระบบไวยากรณ์", description: "กฎสั้น ตัวอย่าง คำถามตัดสิน และเลือกตอบ", points: ["กฎ", "ตัวอย่าง", "ตัดสิน", "เลือก"] },
      { href: "/english/reading", eyebrow: "อ่าน", title: "คลังบทอ่านต้นฉบับ", description: "บทอ่านแบ่งระดับที่เขียนเอง ไม่ใช้ข้อสอบทางการ", points: ["ต้นฉบับ", "ระดับ", "อ่าน", "วิเคราะห์"] },
      { href: "/english/question-bank", eyebrow: "คำถาม", title: "คลังคำถามต้นฉบับ", description: "คำถามเลือกตอบและเติมคำสำหรับฝึกสม่ำเสมอ", points: ["เลือก", "เติม", "ต้นฉบับ", "ทบทวน"] },
      { href: "/english/quiz/basic", eyebrow: "Quiz", title: "แบบทดสอบอังกฤษ", description: "ให้คะแนนอัตโนมัติ อธิบาย บันทึกข้อผิด และทบทวน", points: ["คะแนน", "อธิบาย", "ข้อผิด", "ทบทวน"] },
    ],
  },
  tr: {
    eyebrow: "Ingilizce ogren",
    title: "Ingilizce antrenman merkezi",
    description: "Kelime, yazma, gramer, okuma, quiz, ilerleme ve tekrar tek bir yolda.",
    cta: "Ingilizce yolunu ac",
    modules: [
      { href: "/today", eyebrow: "Bugun", title: "Bugunun calismasi", description: "Tekrar, yeni kelime, yazma, okuma ve pratik tek gunluk sirada.", points: ["gunluk", "tekrar", "ilerleme", "giris yok"] },
      { href: "/english/vocabulary/custom", eyebrow: "Kelime defteri", title: "Kendi kelime defterin", description: "Kelimeleri ice aktar, etiketle, ara, JSON yedekle ve hemen calis.", points: ["ice aktar", "etiket", "secim", "aralik"] },
      { href: "/english/typing", eyebrow: "Yazma", title: "Ingilizce dikte", description: "Once dinle, tam yaz, hata olursa yeniden dene.", points: ["dinle", "yaz", "yeniden", "kisayol"] },
      { href: "/english/vocabulary", eyebrow: "Kelime", title: "Kelime merkezi", description: "Okul, IELTS, TOEFL, CET ve lisansustu paketleri genisler.", points: ["okul", "IELTS", "TOEFL", "CET"] },
      { href: "/english/grammar", eyebrow: "Gramer", title: "Gramer sistemi", description: "Kisa kurallar, ornekler, karar ve secim sorulari.", points: ["kural", "ornek", "karar", "secim"] },
      { href: "/english/reading", eyebrow: "Okuma", title: "Orijinal makale kutuphanesi", description: "Resmi sinav icerigi olmadan seviyeli orijinal okuma.", points: ["orijinal", "seviye", "okuma", "analiz"] },
      { href: "/english/question-bank", eyebrow: "Sorular", title: "Orijinal soru bankasi", description: "Secim ve bosluk sorulariyla duzenli pratik.", points: ["secim", "bosluk", "orijinal", "tekrar"] },
      { href: "/english/quiz/basic", eyebrow: "Quiz", title: "Ingilizce quiz", description: "Otomatik puan, aciklama, hata kaydi ve tekrar.", points: ["puan", "aciklama", "hata", "tekrar"] },
    ],
  },
  it: {
    eyebrow: "Studio inglese",
    title: "Centro allenamento inglese",
    description: "Lessico, digitazione, grammatica, lettura, quiz, progresso e ripasso in un percorso.",
    cta: "Apri percorso inglese",
    modules: [
      { href: "/today", eyebrow: "Oggi", title: "Studio di oggi", description: "Ripasso, parole nuove, digitazione, lettura e pratica in una coda quotidiana.", points: ["giorno", "ripasso", "progresso", "no login"] },
      { href: "/english/vocabulary/custom", eyebrow: "Vocabolario", title: "Vocabolario personale", description: "Importa parole, tag, cerca, salva JSON e pratica subito.", points: ["importa", "tag", "scelta", "ripasso"] },
      { href: "/english/typing", eyebrow: "Digitazione", title: "Dettato inglese", description: "Ascolta prima, digita esatto e riprova dopo un errore.", points: ["ascolto", "digita", "riprova", "scorciatoie"] },
      { href: "/english/vocabulary", eyebrow: "Lessico", title: "Centro lessico", description: "Pacchetti scuola, IELTS, TOEFL, CET e post laurea in crescita.", points: ["scuola", "IELTS", "TOEFL", "CET"] },
      { href: "/english/grammar", eyebrow: "Grammatica", title: "Sistema grammatica", description: "Regole brevi, esempi, giudizio e scelta multipla.", points: ["regole", "esempi", "giudizio", "scelta"] },
      { href: "/english/reading", eyebrow: "Lettura", title: "Libreria articoli originali", description: "Letture originali per livello senza contenuti ufficiali d'esame.", points: ["originale", "livello", "lettura", "analisi"] },
      { href: "/english/question-bank", eyebrow: "Domande", title: "Banca domande originale", description: "Domande originali di scelta e riempimento per pratica stabile.", points: ["scelta", "vuoti", "originale", "ripasso"] },
      { href: "/english/quiz/basic", eyebrow: "Quiz", title: "Quiz inglese", description: "Punteggio automatico, spiegazioni, errori salvati e ripasso.", points: ["score", "spiega", "errori", "ripasso"] },
    ],
  },
  nl: {
    eyebrow: "Engels leren",
    title: "Engels trainingscentrum",
    description: "Woordenschat, typen, grammatica, lezen, quizzen, voortgang en herhaling in een pad.",
    cta: "Open Engels pad",
    modules: [
      { href: "/today", eyebrow: "Vandaag", title: "Vandaag leren", description: "Herhaling, nieuwe woorden, typen, lezen en oefenen in een dagrij.", points: ["dagelijks", "herhaal", "voortgang", "geen login"] },
      { href: "/english/vocabulary/custom", eyebrow: "Woordenboek", title: "Eigen woordenboek", description: "Importeer woorden, tag, zoek, maak JSON backup en oefen direct.", points: ["import", "tags", "keuze", "herhaling"] },
      { href: "/english/typing", eyebrow: "Typen", title: "Engels dictee typen", description: "Luister eerst, typ exact en probeer opnieuw na fouten.", points: ["luister", "typ", "opnieuw", "sneltoets"] },
      { href: "/english/vocabulary", eyebrow: "Woorden", title: "Woordenschat centrum", description: "School, IELTS, TOEFL, CET en academische pakketten groeien door.", points: ["school", "IELTS", "TOEFL", "CET"] },
      { href: "/english/grammar", eyebrow: "Grammatica", title: "Grammatica systeem", description: "Korte regels, voorbeelden, oordeel en keuzevragen.", points: ["regels", "voorbeelden", "oordeel", "keuze"] },
      { href: "/english/reading", eyebrow: "Lezen", title: "Originele artikelbibliotheek", description: "Originele teksten op niveau zonder officiele exameninhoud.", points: ["origineel", "niveau", "lezen", "analyse"] },
      { href: "/english/question-bank", eyebrow: "Vragen", title: "Originele vragenbank", description: "Originele keuze- en invulvragen voor vaste oefening.", points: ["keuze", "invullen", "origineel", "herhaal"] },
      { href: "/english/quiz/basic", eyebrow: "Quiz", title: "Engels quiz", description: "Automatische score, uitleg, fouten opslaan en herhalen.", points: ["score", "uitleg", "fouten", "herhaal"] },
    ],
  },
  pl: {
    eyebrow: "Nauka angielskiego",
    title: "Centrum treningu angielskiego",
    description: "Slownictwo, pisanie, gramatyka, czytanie, quizy, postep i powtorki w jednej sciezce.",
    cta: "Otworz sciezke angielskiego",
    modules: [
      { href: "/today", eyebrow: "Dzisiaj", title: "Dzisiejsza nauka", description: "Powtorka, nowe slowa, pisanie, czytanie i praktyka w dziennej kolejce.", points: ["dziennie", "powtorka", "postep", "bez logowania"] },
      { href: "/english/vocabulary/custom", eyebrow: "Slownik", title: "Wlasny slownik", description: "Importuj slowa, taguj, szukaj, rob kopie JSON i cwicz od razu.", points: ["import", "tagi", "wybor", "powtorki"] },
      { href: "/english/typing", eyebrow: "Pisanie", title: "Dyktando angielskie", description: "Najpierw sluchaj, wpisz dokladnie i probuj ponownie po bledzie.", points: ["sluch", "pisz", "ponow", "skroty"] },
      { href: "/english/vocabulary", eyebrow: "Slowa", title: "Centrum slownictwa", description: "Pakiety szkolne, IELTS, TOEFL, CET i akademickie dalej rosna.", points: ["szkola", "IELTS", "TOEFL", "CET"] },
      { href: "/english/grammar", eyebrow: "Gramatyka", title: "System gramatyki", description: "Krotkie zasady, przyklady, ocena i pytania wyboru.", points: ["zasady", "przyklady", "ocena", "wybor"] },
      { href: "/english/reading", eyebrow: "Czytanie", title: "Biblioteka oryginalna", description: "Oryginalne czytanki poziomowane bez oficjalnych tresci egzaminow.", points: ["oryginalne", "poziomy", "czytanie", "analiza"] },
      { href: "/english/question-bank", eyebrow: "Pytania", title: "Oryginalny bank pytan", description: "Oryginalne pytania wyboru i luk do stalej praktyki.", points: ["wybor", "luki", "oryginalne", "powtorka"] },
      { href: "/english/quiz/basic", eyebrow: "Quiz", title: "Quiz angielski", description: "Automatyczny wynik, wyjasnienia, zapis bledow i powtorka.", points: ["wynik", "wyjasnij", "bledy", "powtorz"] },
    ],
  },
};

export async function generateMetadata({
  searchParams,
}: {
  searchParams?: Promise<PageSearchParams>;
}): Promise<Metadata> {
  const headersList = await headers();
  const headerLanguage = headersList.get("x-jinming-language");
  const language = resolveInterfaceLanguage(searchParams ? await searchParams : undefined, headerLanguage);
  const pageCopy = englishHomeCopy[language];
  const canonical = localizedHref("/english", language);

  return {
    title: `${pageCopy.title} - JinMing Lab`,
    description: pageCopy.description,
    alternates: {
      canonical,
      languages: localizedLanguageAlternates("/english"),
    },
    openGraph: {
      title: `${pageCopy.title} - JinMing Lab`,
      description: pageCopy.description,
      url: `https://vantaapi.com${canonical}`,
      siteName: "JinMing Lab",
      type: "website",
    },
  };
}

export default async function EnglishHome({ searchParams }: { searchParams?: Promise<PageSearchParams> }) {
  const headersList = await headers();
  const headerLanguage = headersList.get("x-jinming-language");
  const language = resolveInterfaceLanguage(searchParams ? await searchParams : undefined, headerLanguage);
  const pageCopy = englishHomeCopy[language];

  return (
    <ModuleHub
      eyebrow={pageCopy.eyebrow}
      title={pageCopy.title}
      description={pageCopy.description}
      modules={pageCopy.modules}
      ctaHref="/learn/english"
      ctaLabel={pageCopy.cta}
      language={language}
      pageClassName="english-entry-rounded"
    />
  );
}
