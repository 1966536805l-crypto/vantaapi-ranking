import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import FlagLanguageToggle from "@/components/layout/FlagLanguageToggle";
import { WorldLanguageStarterTrainer } from "@/components/learning/WorldLanguageStarterTrainer";
import { localizedHref, localizedLanguageAlternates, resolveInterfaceLanguage, type InterfaceLanguage, type PageSearchParams } from "@/lib/language";
import {
  worldLanguages,
  worldLanguageStarterPlan,
  worldLanguageSurvivalPhrases,
  type SurvivalPhraseKey,
} from "@/lib/world-language-content";

type WorldLanguagePageProps = {
  params: Promise<{ language: string }>;
  searchParams?: Promise<PageSearchParams>;
};

const survivalSlots = [
  { key: "greeting", zh: "问候", fallback: "先学当地问候句" },
  { key: "thanks", zh: "感谢", fallback: "先学感谢句" },
  { key: "selfIntro", zh: "自我介绍", fallback: "先学我正在学习这门语言" },
  { key: "need", zh: "需求", fallback: "先学我要水或我需要帮助" },
  { key: "confusion", zh: "听不懂", fallback: "先学我没听懂" },
  { key: "repeat", zh: "请重复", fallback: "先学请再说一遍" },
  { key: "direction", zh: "方向", fallback: "先学这里在哪里" },
  { key: "price", zh: "价格", fallback: "先学多少钱" },
] satisfies Array<{ key: SurvivalPhraseKey; zh: string; fallback: string }>;

const weekPlan = [
  { day: "第 1 天", zh: "只听三句话", body: "把前三句听十遍 先模仿声音 暂时不背语法" },
  { day: "第 2 天", zh: "认识文字系统", body: "先看书写方向 字母或字符形状 然后把三句话打一遍" },
  { day: "第 3 天", zh: "整句跟读", body: "一句一句跟读 标记暂时读不稳的声音" },
  { day: "第 4 天", zh: "替换一个词", body: "保留句型 只替换语言名 地点或物品" },
  { day: "第 5 天", zh: "听写短句", body: "先听 再隐藏文字 从记忆里把句子打出来" },
  { day: "第 6 天", zh: "小对话", body: "把问候 感谢 一个需求 拼成六行小对话" },
  { day: "第 7 天", zh: "复盘", body: "只留下十句真正能说出口的句子 进入下一周" },
];

type DetailCopy = {
  back: string;
  tools: string;
  programming: string;
  zero: string;
  fromFirst: string;
  heroBody: (script: string) => string;
  firstThree: string;
  cards: (nativeName: string, script: string) => { eyebrow: string; title: string; body: string }[];
  orderEyebrow: string;
  orderTitle: string;
  survivalEyebrow: string;
  survivalTitle: string;
  weekEyebrow: string;
  weekTitle: string;
  zeroStatus: string;
  sameFamilyEyebrow: string;
  sameFamilyTitle: string;
};

type BaseDetailLanguage = "en" | "zh" | "ja" | "ar";

const baseDetailCopy: Record<BaseDetailLanguage, DetailCopy> = {
  en: {
    back: "Back to languages",
    tools: "AI Tools",
    programming: "Coding Lab",
    zero: "zero foundation",
    fromFirst: "from the first phrase",
    heroBody: (script) => `First lesson from zero. Hear the sound, meet ${script}, then build confidence with three phrases.`,
    firstThree: "First three phrases",
    cards: (nativeName, script) => [
      { eyebrow: "Script", title: script, body: "Learn how it is written, read, and typed before memorizing complex rules." },
      { eyebrow: "Goal", title: "Speak first", body: `Start with the sound, script, and daily phrases of ${nativeName}.` },
      { eyebrow: "Method", title: "Hear See Say Type", body: "Each phrase follows one loop: listen, look, repeat, and type." },
      { eyebrow: "Review", title: "Ten minutes daily", body: "Revive yesterday's three phrases before adding today's content." },
    ],
    orderEyebrow: "Zero foundation order",
    orderTitle: "Every language starts with this order",
    survivalEyebrow: "Survival phrases",
    survivalTitle: "First phrase slots",
    weekEyebrow: "7 day start",
    weekTitle: "The first week aims for steadiness, not volume",
    zeroStatus: "zero foundation",
    sameFamilyEyebrow: "Same family",
    sameFamilyTitle: "Compare nearby languages",
  },
  zh: {
    back: "返回语言列表",
    tools: "AI 工具",
    programming: "编程训练",
    zero: "0 基础",
    fromFirst: "从第一句开始",
    heroBody: (script) => `0 基础第一课 先听声音 再认 ${script} 然后用三句话建立信心`,
    firstThree: "前三句",
    cards: (nativeName, script) => [
      { eyebrow: "文字", title: script, body: "先知道文字怎么写 怎么读 怎么输入 不急着背复杂规则" },
      { eyebrow: "目标", title: "先能开口", body: `先掌握 ${nativeName} 的声音 文字和日常短句` },
      { eyebrow: "方法", title: "听 看 说 打", body: "每句话都按 听一遍 看一遍 跟读一遍 打出来一遍 的顺序练" },
      { eyebrow: "复习", title: "每天十分钟", body: "先把昨天的三句话复活 再加今天的新内容" },
    ],
    orderEyebrow: "0 基础顺序",
    orderTitle: "每门语言都按这个顺序开局",
    survivalEyebrow: "生存短句",
    survivalTitle: "第一批短句位",
    weekEyebrow: "7 天入门",
    weekTitle: "第一周不追求多 只追求稳",
    zeroStatus: "0 基础",
    sameFamilyEyebrow: "同语系",
    sameFamilyTitle: "同语系可以顺手对比",
  },
  ja: {
    back: "言語一覧へ戻る",
    tools: "AI ツール",
    programming: "プログラミング",
    zero: "ゼロ基礎",
    fromFirst: "最初の一文から",
    heroBody: (script) => `ゼロからの第一課です。音を聞き、${script} を見て、三つの文で自信を作ります。`,
    firstThree: "最初の三文",
    cards: (nativeName, script) => [
      { eyebrow: "文字", title: script, body: "複雑な規則を覚える前に、書き方、読み方、入力方法を見ます。" },
      { eyebrow: "目標", title: "まず話す", body: `${nativeName} の音、文字、日常短文から始めます。` },
      { eyebrow: "方法", title: "聞く 見る 言う 打つ", body: "各文を、聞く、見る、まねる、入力する、の順で練習します。" },
      { eyebrow: "復習", title: "毎日十分", body: "昨日の三文を戻してから、今日の内容を足します。" },
    ],
    orderEyebrow: "ゼロ基礎の順序",
    orderTitle: "すべての言語をこの順序で始める",
    survivalEyebrow: "サバイバル短文",
    survivalTitle: "最初の文型スロット",
    weekEyebrow: "7日入門",
    weekTitle: "第一週は量より安定を優先",
    zeroStatus: "ゼロ基礎",
    sameFamilyEyebrow: "同じ語族",
    sameFamilyTitle: "近い言語を比べる",
  },
  ar: {
    back: "العودة إلى قائمة اللغات",
    tools: "أدوات AI",
    programming: "مختبر البرمجة",
    zero: "من الصفر",
    fromFirst: "من أول عبارة",
    heroBody: (script) => `الدرس الأول من الصفر. استمع للصوت، تعرف على ${script}، ثم ابن الثقة بثلاث عبارات.`,
    firstThree: "أول ثلاث عبارات",
    cards: (nativeName, script) => [
      { eyebrow: "الكتابة", title: script, body: "تعرف أولا على طريقة الكتابة والقراءة والإدخال قبل القواعد المعقدة." },
      { eyebrow: "الهدف", title: "تكلم أولا", body: `ابدأ بصوت ${nativeName} وكتابته وعباراته اليومية.` },
      { eyebrow: "الطريقة", title: "اسمع شاهد قل اكتب", body: "كل عبارة تمر بحلقة واحدة: استمع، انظر، ردد، ثم اكتب." },
      { eyebrow: "المراجعة", title: "عشر دقائق يوميا", body: "أعد عبارات الأمس الثلاث قبل إضافة محتوى اليوم." },
    ],
    orderEyebrow: "ترتيب البداية من الصفر",
    orderTitle: "كل لغة تبدأ بهذا الترتيب",
    survivalEyebrow: "عبارات النجاة",
    survivalTitle: "خانات العبارات الأولى",
    weekEyebrow: "بداية 7 أيام",
    weekTitle: "الأسبوع الأول للاستقرار لا للكثرة",
    zeroStatus: "من الصفر",
    sameFamilyEyebrow: "نفس العائلة",
    sameFamilyTitle: "قارن اللغات القريبة",
  },
};

const extendedDetailCopy: Partial<Record<InterfaceLanguage, DetailCopy>> = {
  ko: {
    back: "언어 목록으로 돌아가기",
    tools: "AI 도구",
    programming: "코딩 랩",
    zero: "제로 베이스",
    fromFirst: "첫 문장부터",
    heroBody: (script) => `제로 베이스 첫 수업입니다. 소리를 듣고 ${script}을 보고 세 문장으로 자신감을 만듭니다.`,
    firstThree: "첫 세 문장",
    cards: (nativeName, script) => [
      { eyebrow: "문자", title: script, body: "복잡한 규칙보다 쓰기 읽기 입력 방법을 먼저 익힙니다." },
      { eyebrow: "목표", title: "먼저 말하기", body: `${nativeName}의 소리 문자 일상 문장부터 시작합니다.` },
      { eyebrow: "방법", title: "듣기 보기 말하기 입력", body: "각 문장은 듣고 보고 따라 말하고 입력하는 루프로 갑니다." },
      { eyebrow: "복습", title: "매일 10분", body: "어제의 세 문장을 살린 뒤 오늘 내용을 더합니다." },
    ],
    orderEyebrow: "제로 베이스 순서",
    orderTitle: "모든 언어는 이 순서로 시작",
    survivalEyebrow: "생존 문장",
    survivalTitle: "첫 문장 슬롯",
    weekEyebrow: "7일 시작",
    weekTitle: "첫 주는 양보다 안정성",
    zeroStatus: "제로 베이스",
    sameFamilyEyebrow: "같은 어족",
    sameFamilyTitle: "가까운 언어 비교",
  },
  es: {
    back: "Volver a idiomas",
    tools: "Herramientas AI",
    programming: "Laboratorio de codigo",
    zero: "desde cero",
    fromFirst: "desde la primera frase",
    heroBody: (script) => `Primera leccion desde cero. Escucha el sonido, conoce ${script} y gana confianza con tres frases.`,
    firstThree: "Primeras tres frases",
    cards: (nativeName, script) => [
      { eyebrow: "Escritura", title: script, body: "Aprende como se escribe, lee y teclea antes de reglas complejas." },
      { eyebrow: "Meta", title: "Hablar primero", body: `Empieza con sonido, escritura y frases diarias de ${nativeName}.` },
      { eyebrow: "Metodo", title: "Escucha Mira Di Teclea", body: "Cada frase sigue un ciclo: escuchar, mirar, repetir y teclear." },
      { eyebrow: "Repaso", title: "Diez minutos diarios", body: "Recupera las tres frases de ayer antes de agregar las de hoy." },
    ],
    orderEyebrow: "Orden desde cero",
    orderTitle: "Cada idioma empieza con este orden",
    survivalEyebrow: "Frases de supervivencia",
    survivalTitle: "Primeros huecos de frase",
    weekEyebrow: "Inicio de 7 dias",
    weekTitle: "La primera semana busca estabilidad, no volumen",
    zeroStatus: "desde cero",
    sameFamilyEyebrow: "Misma familia",
    sameFamilyTitle: "Compara idiomas cercanos",
  },
  fr: {
    back: "Retour aux langues",
    tools: "Outils IA",
    programming: "Lab de code",
    zero: "depuis zero",
    fromFirst: "des la premiere phrase",
    heroBody: (script) => `Premiere lecon depuis zero. Ecoute le son, observe ${script}, puis gagne confiance avec trois phrases.`,
    firstThree: "Trois premieres phrases",
    cards: (nativeName, script) => [
      { eyebrow: "Ecriture", title: script, body: "Apprends comment ecrire, lire et saisir avant les regles complexes." },
      { eyebrow: "But", title: "Parler d abord", body: `Commence ${nativeName} par le son, l ecriture et les phrases quotidiennes.` },
      { eyebrow: "Methode", title: "Ecouter Voir Dire Taper", body: "Chaque phrase suit une boucle: ecouter, regarder, repeter, taper." },
      { eyebrow: "Revision", title: "Dix minutes par jour", body: "Reveille les trois phrases d hier avant d ajouter celles d aujourd hui." },
    ],
    orderEyebrow: "Ordre debutant",
    orderTitle: "Chaque langue commence par cet ordre",
    survivalEyebrow: "Phrases utiles",
    survivalTitle: "Premiers emplacements de phrases",
    weekEyebrow: "Debut en 7 jours",
    weekTitle: "La premiere semaine vise la stabilite, pas le volume",
    zeroStatus: "depuis zero",
    sameFamilyEyebrow: "Meme famille",
    sameFamilyTitle: "Comparer les langues proches",
  },
  de: {
    back: "Zurueck zu Sprachen",
    tools: "KI Werkzeuge",
    programming: "Programmierlabor",
    zero: "von null",
    fromFirst: "ab dem ersten Satz",
    heroBody: (script) => `Erste Lektion von null. Hoere den Klang, lerne ${script} kennen und baue mit drei Saetzen Sicherheit auf.`,
    firstThree: "Erste drei Saetze",
    cards: (nativeName, script) => [
      { eyebrow: "Schrift", title: script, body: "Lerne Schreiben, Lesen und Tippen vor komplexen Regeln." },
      { eyebrow: "Ziel", title: "Erst sprechen", body: `Starte ${nativeName} mit Klang, Schrift und Alltagssaetzen.` },
      { eyebrow: "Methode", title: "Hoeren Sehen Sagen Tippen", body: "Jeder Satz folgt einer Runde: hoeren, ansehen, nachsprechen, tippen." },
      { eyebrow: "Wiederholung", title: "Zehn Minuten taeglich", body: "Hole die drei Saetze von gestern zurueck, bevor du neue hinzufuegst." },
    ],
    orderEyebrow: "Null Basis Reihenfolge",
    orderTitle: "Jede Sprache beginnt mit dieser Reihenfolge",
    survivalEyebrow: "Ueberlebenssaetze",
    survivalTitle: "Erste Satzfelder",
    weekEyebrow: "7 Tage Start",
    weekTitle: "Die erste Woche zielt auf Stabilitaet, nicht Menge",
    zeroStatus: "von null",
    sameFamilyEyebrow: "Gleiche Familie",
    sameFamilyTitle: "Nahe Sprachen vergleichen",
  },
  pt: {
    back: "Voltar aos idiomas",
    tools: "Ferramentas AI",
    programming: "Lab de codigo",
    zero: "do zero",
    fromFirst: "desde a primeira frase",
    heroBody: (script) => `Primeira aula do zero. Ouça o som, conheça ${script} e ganhe confiança com tres frases.`,
    firstThree: "Primeiras tres frases",
    cards: (nativeName, script) => [
      { eyebrow: "Escrita", title: script, body: "Aprenda como escreve, le e digita antes de regras complexas." },
      { eyebrow: "Meta", title: "Falar primeiro", body: `Comece ${nativeName} pelo som, escrita e frases diarias.` },
      { eyebrow: "Metodo", title: "Ouvir Ver Falar Digitar", body: "Cada frase segue: ouvir, ver, repetir e digitar." },
      { eyebrow: "Revisao", title: "Dez minutos por dia", body: "Recupere as frases de ontem antes de adicionar as de hoje." },
    ],
    orderEyebrow: "Ordem do zero",
    orderTitle: "Todo idioma comeca nesta ordem",
    survivalEyebrow: "Frases de sobrevivencia",
    survivalTitle: "Primeiros espacos de frase",
    weekEyebrow: "Inicio em 7 dias",
    weekTitle: "A primeira semana busca estabilidade, nao volume",
    zeroStatus: "do zero",
    sameFamilyEyebrow: "Mesma familia",
    sameFamilyTitle: "Compare idiomas proximos",
  },
  ru: {
    back: "Назад к языкам",
    tools: "AI инструменты",
    programming: "Кодинг",
    zero: "с нуля",
    fromFirst: "с первой фразы",
    heroBody: (script) => `Первый урок с нуля. Слушай звук, познакомься с ${script} и закрепи три фразы.`,
    firstThree: "Первые три фразы",
    cards: (nativeName, script) => [
      { eyebrow: "Письмо", title: script, body: "Сначала узнай как писать, читать и вводить, потом сложные правила." },
      { eyebrow: "Цель", title: "Сначала говорить", body: `Начни ${nativeName} со звука, письма и ежедневных фраз.` },
      { eyebrow: "Метод", title: "Слушай Смотри Говори Печатай", body: "Каждая фраза проходит цикл: слушать, видеть, повторять, вводить." },
      { eyebrow: "Повтор", title: "Десять минут в день", body: "Верни три вчерашние фразы перед новыми." },
    ],
    orderEyebrow: "Порядок с нуля",
    orderTitle: "Каждый язык начинается с этого порядка",
    survivalEyebrow: "Фразы выживания",
    survivalTitle: "Первые слоты фраз",
    weekEyebrow: "Старт за 7 дней",
    weekTitle: "Первая неделя за стабильность, не за объем",
    zeroStatus: "с нуля",
    sameFamilyEyebrow: "Та же семья",
    sameFamilyTitle: "Сравнить близкие языки",
  },
  hi: {
    back: "भाषा सूची पर वापस",
    tools: "AI उपकरण",
    programming: "कोडिंग लैब",
    zero: "शून्य आधार",
    fromFirst: "पहले वाक्य से",
    heroBody: (script) => `शून्य से पहला पाठ। ध्वनि सुनें, ${script} पहचानें, फिर तीन वाक्यों से आत्मविश्वास बनाएं।`,
    firstThree: "पहले तीन वाक्य",
    cards: (nativeName, script) => [
      { eyebrow: "लिपि", title: script, body: "जटिल नियमों से पहले लिखना, पढ़ना और टाइप करना सीखें।" },
      { eyebrow: "लक्ष्य", title: "पहले बोलना", body: `${nativeName} की ध्वनि, लिपि और रोज़मर्रा के वाक्यों से शुरू करें।` },
      { eyebrow: "तरीका", title: "सुनें देखें बोलें टाइप करें", body: "हर वाक्य एक चक्र में जाता है: सुनना, देखना, दोहराना और टाइप करना।" },
      { eyebrow: "दोहराव", title: "रोज़ दस मिनट", body: "नई चीज़ जोड़ने से पहले कल के तीन वाक्य फिर से जीवित करें।" },
    ],
    orderEyebrow: "शून्य आधार क्रम",
    orderTitle: "हर भाषा इस क्रम से शुरू होती है",
    survivalEyebrow: "काम आने वाले वाक्य",
    survivalTitle: "पहले वाक्य खांचे",
    weekEyebrow: "7 दिन शुरुआत",
    weekTitle: "पहले सप्ताह में मात्रा नहीं स्थिरता चाहिए",
    zeroStatus: "शून्य आधार",
    sameFamilyEyebrow: "एक ही परिवार",
    sameFamilyTitle: "करीबी भाषाओं की तुलना करें",
  },
  id: {
    back: "Kembali ke daftar bahasa",
    tools: "Alat AI",
    programming: "Lab Kode",
    zero: "dari nol",
    fromFirst: "dari frasa pertama",
    heroBody: (script) => `Pelajaran pertama dari nol. Dengarkan bunyi, kenali ${script}, lalu bangun percaya diri dengan tiga frasa.`,
    firstThree: "Tiga frasa pertama",
    cards: (nativeName, script) => [
      { eyebrow: "Aksara", title: script, body: "Pelajari cara menulis, membaca, dan mengetik sebelum aturan yang rumit." },
      { eyebrow: "Tujuan", title: "Bicara dulu", body: `Mulai ${nativeName} dari bunyi, aksara, dan frasa harian.` },
      { eyebrow: "Metode", title: "Dengar Lihat Ucap Ketik", body: "Setiap frasa mengikuti satu putaran: dengar, lihat, ulangi, ketik." },
      { eyebrow: "Ulang", title: "Sepuluh menit sehari", body: "Hidupkan kembali tiga frasa kemarin sebelum menambah materi hari ini." },
    ],
    orderEyebrow: "Urutan dari nol",
    orderTitle: "Setiap bahasa dimulai dengan urutan ini",
    survivalEyebrow: "Frasa bertahan",
    survivalTitle: "Slot frasa pertama",
    weekEyebrow: "Mulai 7 hari",
    weekTitle: "Minggu pertama mengejar stabil, bukan banyak",
    zeroStatus: "dari nol",
    sameFamilyEyebrow: "Keluarga sama",
    sameFamilyTitle: "Bandingkan bahasa yang dekat",
  },
  vi: {
    back: "Quay lại danh sách ngôn ngữ",
    tools: "Công cụ AI",
    programming: "Phòng code",
    zero: "từ con số không",
    fromFirst: "từ câu đầu tiên",
    heroBody: (script) => `Bài đầu tiên từ con số không. Nghe âm thanh, làm quen ${script}, rồi tạo tự tin bằng ba câu.`,
    firstThree: "Ba câu đầu tiên",
    cards: (nativeName, script) => [
      { eyebrow: "Chữ viết", title: script, body: "Học cách viết, đọc và gõ trước khi nhớ quy tắc phức tạp." },
      { eyebrow: "Mục tiêu", title: "Nói trước", body: `Bắt đầu ${nativeName} bằng âm thanh, chữ viết và câu hằng ngày.` },
      { eyebrow: "Phương pháp", title: "Nghe Nhìn Nói Gõ", body: "Mỗi câu đi theo một vòng: nghe, nhìn, lặp lại và gõ." },
      { eyebrow: "Ôn tập", title: "Mười phút mỗi ngày", body: "Làm sống lại ba câu hôm qua trước khi thêm nội dung hôm nay." },
    ],
    orderEyebrow: "Thứ tự từ số không",
    orderTitle: "Mọi ngôn ngữ đều bắt đầu theo thứ tự này",
    survivalEyebrow: "Câu sinh tồn",
    survivalTitle: "Các ô câu đầu tiên",
    weekEyebrow: "Khởi động 7 ngày",
    weekTitle: "Tuần đầu cần ổn định hơn là nhiều",
    zeroStatus: "từ con số không",
    sameFamilyEyebrow: "Cùng hệ",
    sameFamilyTitle: "So sánh ngôn ngữ gần nhau",
  },
  th: {
    back: "กลับไปยังรายการภาษา",
    tools: "เครื่องมือ AI",
    programming: "แล็บเขียนโค้ด",
    zero: "เริ่มจากศูนย์",
    fromFirst: "จากประโยคแรก",
    heroBody: (script) => `บทเรียนแรกจากศูนย์ ฟังเสียง รู้จัก ${script} แล้วสร้างความมั่นใจด้วยสามประโยค`,
    firstThree: "สามประโยคแรก",
    cards: (nativeName, script) => [
      { eyebrow: "ตัวเขียน", title: script, body: "เรียนวิธีเขียน อ่าน และพิมพ์ก่อนจำกฎที่ซับซ้อน" },
      { eyebrow: "เป้าหมาย", title: "พูดก่อน", body: `เริ่ม ${nativeName} จากเสียง ตัวเขียน และประโยคประจำวัน` },
      { eyebrow: "วิธี", title: "ฟัง ดู พูด พิมพ์", body: "ทุกประโยคใช้วงจรเดียว ฟัง ดู พูดตาม แล้วพิมพ์" },
      { eyebrow: "ทบทวน", title: "วันละสิบนาที", body: "ปลุกสามประโยคของเมื่อวานก่อนเพิ่มเนื้อหาใหม่" },
    ],
    orderEyebrow: "ลำดับจากศูนย์",
    orderTitle: "ทุกภาษาเริ่มด้วยลำดับนี้",
    survivalEyebrow: "ประโยคเอาตัวรอด",
    survivalTitle: "ช่องประโยคแรก",
    weekEyebrow: "เริ่ม 7 วัน",
    weekTitle: "สัปดาห์แรกเน้นความนิ่ง ไม่เน้นปริมาณ",
    zeroStatus: "เริ่มจากศูนย์",
    sameFamilyEyebrow: "ตระกูลเดียวกัน",
    sameFamilyTitle: "เปรียบเทียบภาษาที่ใกล้กัน",
  },
  tr: {
    back: "Diller listesine dön",
    tools: "AI araçları",
    programming: "Kod laboratuvarı",
    zero: "sıfırdan",
    fromFirst: "ilk cümleden",
    heroBody: (script) => `Sıfırdan ilk ders. Sesi dinle, ${script} ile tanış, sonra üç cümleyle güven kazan.`,
    firstThree: "İlk üç cümle",
    cards: (nativeName, script) => [
      { eyebrow: "Yazı", title: script, body: "Karmaşık kurallardan önce nasıl yazıldığını, okunduğunu ve yazıldığını öğren." },
      { eyebrow: "Hedef", title: "Önce konuş", body: `${nativeName} için ses, yazı ve günlük cümlelerle başla.` },
      { eyebrow: "Yöntem", title: "Dinle Gör Söyle Yaz", body: "Her cümle tek döngü izler: dinle, gör, tekrar et, yaz." },
      { eyebrow: "Tekrar", title: "Günde on dakika", body: "Bugünün içeriğini eklemeden önce dünkü üç cümleyi canlandır." },
    ],
    orderEyebrow: "Sıfırdan sıra",
    orderTitle: "Her dil bu sırayla başlar",
    survivalEyebrow: "Hayatta kalma cümleleri",
    survivalTitle: "İlk cümle alanları",
    weekEyebrow: "7 günlük başlangıç",
    weekTitle: "İlk hafta çokluk değil sağlamlık içindir",
    zeroStatus: "sıfırdan",
    sameFamilyEyebrow: "Aynı aile",
    sameFamilyTitle: "Yakın dilleri karşılaştır",
  },
  it: {
    back: "Torna alle lingue",
    tools: "Strumenti AI",
    programming: "Laboratorio codice",
    zero: "da zero",
    fromFirst: "dalla prima frase",
    heroBody: (script) => `Prima lezione da zero. Ascolta il suono, conosci ${script}, poi costruisci fiducia con tre frasi.`,
    firstThree: "Prime tre frasi",
    cards: (nativeName, script) => [
      { eyebrow: "Scrittura", title: script, body: "Impara come si scrive, si legge e si digita prima delle regole complesse." },
      { eyebrow: "Obiettivo", title: "Parlare prima", body: `Inizia ${nativeName} da suono, scrittura e frasi quotidiane.` },
      { eyebrow: "Metodo", title: "Ascolta Guarda Di Digita", body: "Ogni frase segue un giro: ascoltare, guardare, ripetere e digitare." },
      { eyebrow: "Ripasso", title: "Dieci minuti al giorno", body: "Riattiva le tre frasi di ieri prima di aggiungere quelle di oggi." },
    ],
    orderEyebrow: "Ordine da zero",
    orderTitle: "Ogni lingua inizia con questo ordine",
    survivalEyebrow: "Frasi utili",
    survivalTitle: "Primi slot di frase",
    weekEyebrow: "Avvio in 7 giorni",
    weekTitle: "La prima settimana punta alla stabilità, non al volume",
    zeroStatus: "da zero",
    sameFamilyEyebrow: "Stessa famiglia",
    sameFamilyTitle: "Confronta lingue vicine",
  },
  nl: {
    back: "Terug naar talen",
    tools: "AI gereedschap",
    programming: "Code lab",
    zero: "vanaf nul",
    fromFirst: "vanaf de eerste zin",
    heroBody: (script) => `Eerste les vanaf nul. Luister naar de klank, leer ${script} kennen en bouw vertrouwen met drie zinnen.`,
    firstThree: "Eerste drie zinnen",
    cards: (nativeName, script) => [
      { eyebrow: "Schrift", title: script, body: "Leer eerst schrijven, lezen en typen voordat je complexe regels onthoudt." },
      { eyebrow: "Doel", title: "Eerst spreken", body: `Begin ${nativeName} met klank, schrift en dagelijkse zinnen.` },
      { eyebrow: "Methode", title: "Luister Kijk Zeg Typ", body: "Elke zin volgt een lus: luisteren, kijken, herhalen en typen." },
      { eyebrow: "Herhalen", title: "Tien minuten per dag", body: "Haal de drie zinnen van gisteren terug voordat je nieuwe toevoegt." },
    ],
    orderEyebrow: "Volgorde vanaf nul",
    orderTitle: "Elke taal begint met deze volgorde",
    survivalEyebrow: "Overlevingszinnen",
    survivalTitle: "Eerste zinvelden",
    weekEyebrow: "Start in 7 dagen",
    weekTitle: "De eerste week gaat om stabiliteit, niet volume",
    zeroStatus: "vanaf nul",
    sameFamilyEyebrow: "Zelfde familie",
    sameFamilyTitle: "Vergelijk nabije talen",
  },
  pl: {
    back: "Wróć do języków",
    tools: "Narzędzia AI",
    programming: "Laboratorium kodu",
    zero: "od zera",
    fromFirst: "od pierwszego zdania",
    heroBody: (script) => `Pierwsza lekcja od zera. Posłuchaj dźwięku, poznaj ${script}, potem zbuduj pewność trzema zdaniami.`,
    firstThree: "Pierwsze trzy zdania",
    cards: (nativeName, script) => [
      { eyebrow: "Pismo", title: script, body: "Najpierw naucz się pisać, czytać i wpisywać, dopiero potem złożonych zasad." },
      { eyebrow: "Cel", title: "Najpierw mów", body: `Zacznij ${nativeName} od dźwięku, pisma i codziennych zdań.` },
      { eyebrow: "Metoda", title: "Słuchaj Patrz Mów Pisz", body: "Każde zdanie ma jeden cykl: słuchaj, patrz, powtórz i wpisz." },
      { eyebrow: "Powtórka", title: "Dziesięć minut dziennie", body: "Przywróć trzy zdania z wczoraj, zanim dodasz dzisiejsze." },
    ],
    orderEyebrow: "Kolejność od zera",
    orderTitle: "Każdy język zaczyna się w tej kolejności",
    survivalEyebrow: "Zwroty awaryjne",
    survivalTitle: "Pierwsze pola zdań",
    weekEyebrow: "Start 7 dni",
    weekTitle: "Pierwszy tydzień to stabilność, nie ilość",
    zeroStatus: "od zera",
    sameFamilyEyebrow: "Ta sama rodzina",
    sameFamilyTitle: "Porównaj bliskie języki",
  },
};

const detailCopy: Record<InterfaceLanguage, DetailCopy> = {
  ...baseDetailCopy,
  ...extendedDetailCopy,
} as Record<InterfaceLanguage, DetailCopy>;

const survivalSlotCopy: Partial<Record<InterfaceLanguage, Record<SurvivalPhraseKey, { label: string; fallback: string }>>> = {
  en: {
    greeting: { label: "Greeting", fallback: "Learn a local greeting first" },
    thanks: { label: "Thanks", fallback: "Learn a thank you phrase first" },
    selfIntro: { label: "Self intro", fallback: "Learn I am learning this language" },
    need: { label: "Need", fallback: "Learn I need water or I need help" },
    confusion: { label: "Confusion", fallback: "Learn I do not understand" },
    repeat: { label: "Repeat", fallback: "Learn please say that again" },
    direction: { label: "Direction", fallback: "Learn where is this place" },
    price: { label: "Price", fallback: "Learn how much is it" },
  },
  zh: Object.fromEntries(survivalSlots.map((slot) => [slot.key, { label: slot.zh, fallback: slot.fallback }])) as Record<SurvivalPhraseKey, { label: string; fallback: string }>,
  ja: {
    greeting: { label: "挨拶", fallback: "まず現地の挨拶を学ぶ" },
    thanks: { label: "感謝", fallback: "まずありがとうの文を学ぶ" },
    selfIntro: { label: "自己紹介", fallback: "この言語を学んでいますを学ぶ" },
    need: { label: "必要", fallback: "水がほしい 助けが必要 を学ぶ" },
    confusion: { label: "わからない", fallback: "わかりませんを学ぶ" },
    repeat: { label: "もう一度", fallback: "もう一度言ってくださいを学ぶ" },
    direction: { label: "方向", fallback: "ここはどこですかを学ぶ" },
    price: { label: "値段", fallback: "いくらですかを学ぶ" },
  },
  ar: {
    greeting: { label: "تحية", fallback: "تعلم تحية محلية أولا" },
    thanks: { label: "شكر", fallback: "تعلم عبارة شكر أولا" },
    selfIntro: { label: "تعريف بالنفس", fallback: "تعلم أنا أتعلم هذه اللغة" },
    need: { label: "حاجة", fallback: "تعلم أريد ماء أو أحتاج مساعدة" },
    confusion: { label: "لم أفهم", fallback: "تعلم لم أفهم" },
    repeat: { label: "كرر", fallback: "تعلم من فضلك أعد القول" },
    direction: { label: "اتجاه", fallback: "تعلم أين هذا المكان" },
    price: { label: "السعر", fallback: "تعلم كم السعر" },
  },
  ko: {
    greeting: { label: "인사", fallback: "현지 인사부터 배우기" },
    thanks: { label: "감사", fallback: "감사 표현부터 배우기" },
    selfIntro: { label: "자기소개", fallback: "이 언어를 배우고 있어요 배우기" },
    need: { label: "필요", fallback: "물이나 도움이 필요해요 배우기" },
    confusion: { label: "이해 안 됨", fallback: "이해하지 못했어요 배우기" },
    repeat: { label: "반복", fallback: "다시 말해 주세요 배우기" },
    direction: { label: "방향", fallback: "여기가 어디인가요 배우기" },
    price: { label: "가격", fallback: "얼마인가요 배우기" },
  },
  es: {
    greeting: { label: "Saludo", fallback: "Aprende primero un saludo local" },
    thanks: { label: "Gracias", fallback: "Aprende primero una frase de gracias" },
    selfIntro: { label: "Presentacion", fallback: "Aprende estoy aprendiendo este idioma" },
    need: { label: "Necesidad", fallback: "Aprende necesito agua o ayuda" },
    confusion: { label: "No entiendo", fallback: "Aprende no entiendo" },
    repeat: { label: "Repetir", fallback: "Aprende por favor repite" },
    direction: { label: "Direccion", fallback: "Aprende donde esta este lugar" },
    price: { label: "Precio", fallback: "Aprende cuanto cuesta" },
  },
  fr: {
    greeting: { label: "Saluer", fallback: "Apprends une salutation locale" },
    thanks: { label: "Remercier", fallback: "Apprends une phrase de remerciement" },
    selfIntro: { label: "Presentation", fallback: "Apprends je suis en train d apprendre cette langue" },
    need: { label: "Besoin", fallback: "Apprends j ai besoin d eau ou d aide" },
    confusion: { label: "Je ne comprends pas", fallback: "Apprends je ne comprends pas" },
    repeat: { label: "Repeter", fallback: "Apprends repetez s il vous plait" },
    direction: { label: "Direction", fallback: "Apprends ou est cet endroit" },
    price: { label: "Prix", fallback: "Apprends combien ca coute" },
  },
  de: {
    greeting: { label: "Begruessung", fallback: "Lerne zuerst eine lokale Begruessung" },
    thanks: { label: "Danke", fallback: "Lerne zuerst einen Dankessatz" },
    selfIntro: { label: "Vorstellung", fallback: "Lerne ich lerne diese Sprache" },
    need: { label: "Bedarf", fallback: "Lerne ich brauche Wasser oder Hilfe" },
    confusion: { label: "Nicht verstanden", fallback: "Lerne ich verstehe nicht" },
    repeat: { label: "Wiederholen", fallback: "Lerne bitte sagen Sie das noch einmal" },
    direction: { label: "Richtung", fallback: "Lerne wo ist dieser Ort" },
    price: { label: "Preis", fallback: "Lerne wie viel kostet es" },
  },
  pt: {
    greeting: { label: "Saudacao", fallback: "Aprenda uma saudacao local primeiro" },
    thanks: { label: "Obrigado", fallback: "Aprenda uma frase de agradecimento" },
    selfIntro: { label: "Apresentacao", fallback: "Aprenda estou aprendendo esta lingua" },
    need: { label: "Necessidade", fallback: "Aprenda preciso de agua ou ajuda" },
    confusion: { label: "Nao entendi", fallback: "Aprenda nao entendi" },
    repeat: { label: "Repetir", fallback: "Aprenda por favor repita" },
    direction: { label: "Direcao", fallback: "Aprenda onde fica este lugar" },
    price: { label: "Preco", fallback: "Aprenda quanto custa" },
  },
  ru: {
    greeting: { label: "Приветствие", fallback: "Сначала выучи местное приветствие" },
    thanks: { label: "Спасибо", fallback: "Сначала выучи фразу благодарности" },
    selfIntro: { label: "О себе", fallback: "Выучи я учу этот язык" },
    need: { label: "Нужно", fallback: "Выучи мне нужна вода или помощь" },
    confusion: { label: "Не понимаю", fallback: "Выучи я не понимаю" },
    repeat: { label: "Повторить", fallback: "Выучи пожалуйста повторите" },
    direction: { label: "Направление", fallback: "Выучи где это место" },
    price: { label: "Цена", fallback: "Выучи сколько это стоит" },
  },
  hi: {
    greeting: { label: "अभिवादन", fallback: "पहले स्थानीय अभिवादन सीखें" },
    thanks: { label: "धन्यवाद", fallback: "पहले धन्यवाद वाला वाक्य सीखें" },
    selfIntro: { label: "परिचय", fallback: "सीखें कि मैं यह भाषा सीख रहा हूं" },
    need: { label: "ज़रूरत", fallback: "सीखें मुझे पानी या मदद चाहिए" },
    confusion: { label: "समझ नहीं आया", fallback: "सीखें मुझे समझ नहीं आया" },
    repeat: { label: "दोहराएं", fallback: "सीखें कृपया फिर से कहें" },
    direction: { label: "दिशा", fallback: "सीखें यह जगह कहां है" },
    price: { label: "कीमत", fallback: "सीखें इसकी कीमत कितनी है" },
  },
  id: {
    greeting: { label: "Salam", fallback: "Pelajari salam lokal lebih dulu" },
    thanks: { label: "Terima kasih", fallback: "Pelajari frasa terima kasih lebih dulu" },
    selfIntro: { label: "Perkenalan", fallback: "Pelajari saya sedang belajar bahasa ini" },
    need: { label: "Kebutuhan", fallback: "Pelajari saya butuh air atau bantuan" },
    confusion: { label: "Tidak paham", fallback: "Pelajari saya tidak paham" },
    repeat: { label: "Ulangi", fallback: "Pelajari tolong ulangi" },
    direction: { label: "Arah", fallback: "Pelajari tempat ini di mana" },
    price: { label: "Harga", fallback: "Pelajari berapa harganya" },
  },
  vi: {
    greeting: { label: "Chào hỏi", fallback: "Học câu chào địa phương trước" },
    thanks: { label: "Cảm ơn", fallback: "Học câu cảm ơn trước" },
    selfIntro: { label: "Giới thiệu", fallback: "Học câu tôi đang học ngôn ngữ này" },
    need: { label: "Nhu cầu", fallback: "Học câu tôi cần nước hoặc cần giúp đỡ" },
    confusion: { label: "Không hiểu", fallback: "Học câu tôi không hiểu" },
    repeat: { label: "Lặp lại", fallback: "Học câu vui lòng nói lại" },
    direction: { label: "Phương hướng", fallback: "Học câu nơi này ở đâu" },
    price: { label: "Giá", fallback: "Học câu bao nhiêu tiền" },
  },
  th: {
    greeting: { label: "ทักทาย", fallback: "เรียนคำทักทายท้องถิ่นก่อน" },
    thanks: { label: "ขอบคุณ", fallback: "เรียนประโยคขอบคุณก่อน" },
    selfIntro: { label: "แนะนำตัว", fallback: "เรียนประโยคฉันกำลังเรียนภาษานี้" },
    need: { label: "ต้องการ", fallback: "เรียนประโยคฉันต้องการน้ำหรือความช่วยเหลือ" },
    confusion: { label: "ไม่เข้าใจ", fallback: "เรียนประโยคฉันไม่เข้าใจ" },
    repeat: { label: "พูดซ้ำ", fallback: "เรียนประโยคกรุณาพูดอีกครั้ง" },
    direction: { label: "ทิศทาง", fallback: "เรียนประโยคที่นี่อยู่ที่ไหน" },
    price: { label: "ราคา", fallback: "เรียนประโยคราคาเท่าไหร่" },
  },
  tr: {
    greeting: { label: "Selam", fallback: "Önce yerel selamı öğren" },
    thanks: { label: "Teşekkür", fallback: "Önce teşekkür cümlesini öğren" },
    selfIntro: { label: "Tanıtım", fallback: "Bu dili öğreniyorum cümlesini öğren" },
    need: { label: "İhtiyaç", fallback: "Suya veya yardıma ihtiyacım var cümlesini öğren" },
    confusion: { label: "Anlamadım", fallback: "Anlamadım cümlesini öğren" },
    repeat: { label: "Tekrar", fallback: "Lütfen tekrar söyleyin cümlesini öğren" },
    direction: { label: "Yön", fallback: "Burası nerede cümlesini öğren" },
    price: { label: "Fiyat", fallback: "Ne kadar cümlesini öğren" },
  },
  it: {
    greeting: { label: "Saluto", fallback: "Impara prima un saluto locale" },
    thanks: { label: "Grazie", fallback: "Impara prima una frase di ringraziamento" },
    selfIntro: { label: "Presentazione", fallback: "Impara sto imparando questa lingua" },
    need: { label: "Bisogno", fallback: "Impara ho bisogno di acqua o aiuto" },
    confusion: { label: "Non capisco", fallback: "Impara non capisco" },
    repeat: { label: "Ripeti", fallback: "Impara per favore ripeti" },
    direction: { label: "Direzione", fallback: "Impara dove si trova questo posto" },
    price: { label: "Prezzo", fallback: "Impara quanto costa" },
  },
  nl: {
    greeting: { label: "Groet", fallback: "Leer eerst een lokale groet" },
    thanks: { label: "Dank", fallback: "Leer eerst een bedankzin" },
    selfIntro: { label: "Voorstellen", fallback: "Leer ik leer deze taal" },
    need: { label: "Nodig", fallback: "Leer ik heb water of hulp nodig" },
    confusion: { label: "Niet begrepen", fallback: "Leer ik begrijp het niet" },
    repeat: { label: "Herhalen", fallback: "Leer zeg dat alstublieft nog eens" },
    direction: { label: "Richting", fallback: "Leer waar is deze plek" },
    price: { label: "Prijs", fallback: "Leer hoeveel kost het" },
  },
  pl: {
    greeting: { label: "Powitanie", fallback: "Najpierw naucz się lokalnego powitania" },
    thanks: { label: "Dziękuję", fallback: "Najpierw naucz się podziękowania" },
    selfIntro: { label: "Przedstawienie", fallback: "Naucz się zdania uczę się tego języka" },
    need: { label: "Potrzeba", fallback: "Naucz się potrzebuję wody albo pomocy" },
    confusion: { label: "Nie rozumiem", fallback: "Naucz się nie rozumiem" },
    repeat: { label: "Powtórz", fallback: "Naucz się proszę powtórzyć" },
    direction: { label: "Kierunek", fallback: "Naucz się gdzie jest to miejsce" },
    price: { label: "Cena", fallback: "Naucz się ile to kosztuje" },
  },
};

const weekPlanCopy: Partial<Record<InterfaceLanguage, { day: string; title: string; body: string }[]>> = {
  en: [
    { day: "Day 1", title: "Only hear three phrases", body: "Listen ten times and imitate the sound before grammar." },
    { day: "Day 2", title: "Meet the script", body: "Check direction, shapes, and type the three phrases once." },
    { day: "Day 3", title: "Repeat whole phrases", body: "Repeat phrase by phrase and mark sounds that still feel unstable." },
    { day: "Day 4", title: "Swap one word", body: "Keep the pattern and replace only language, place, or object." },
    { day: "Day 5", title: "Dictate short phrases", body: "Listen, hide the text, and type the phrase from memory." },
    { day: "Day 6", title: "Tiny dialogue", body: "Combine greeting, thanks, and one need into a six line dialogue." },
    { day: "Day 7", title: "Review", body: "Keep ten phrases you can really say before moving on." },
  ],
  zh: weekPlan.map((item) => ({ day: item.day, title: item.zh, body: item.body })),
  ja: [
    { day: "1日目", title: "三文だけ聞く", body: "三文を十回聞き、文法より先に音をまねます。" },
    { day: "2日目", title: "文字体系を見る", body: "方向、文字の形を見て、三文を一度入力します。" },
    { day: "3日目", title: "文ごとに復唱", body: "一文ずつまねて、まだ不安定な音を印します。" },
    { day: "4日目", title: "一語だけ入れ替え", body: "文型を保ち、言語名、場所、物だけを替えます。" },
    { day: "5日目", title: "短文ディクテーション", body: "聞いて、文字を隠し、記憶から入力します。" },
    { day: "6日目", title: "小さな会話", body: "挨拶、感謝、必要表現を六行の会話にします。" },
    { day: "7日目", title: "復習", body: "本当に口に出せる十文だけ残して次へ進みます。" },
  ],
  ar: [
    { day: "اليوم 1", title: "اسمع ثلاث عبارات فقط", body: "استمع عشر مرات وقلد الصوت قبل القواعد." },
    { day: "اليوم 2", title: "تعرف على الكتابة", body: "افحص الاتجاه والأشكال واكتب العبارات الثلاث مرة." },
    { day: "اليوم 3", title: "ردد عبارات كاملة", body: "ردد عبارة بعد عبارة وحدد الأصوات غير الثابتة." },
    { day: "اليوم 4", title: "بدل كلمة واحدة", body: "احتفظ بالنمط وبدل اللغة أو المكان أو الشيء فقط." },
    { day: "اليوم 5", title: "إملاء عبارات قصيرة", body: "استمع، أخف النص، واكتب العبارة من الذاكرة." },
    { day: "اليوم 6", title: "حوار صغير", body: "اجمع التحية والشكر وحاجة واحدة في حوار من ستة أسطر." },
    { day: "اليوم 7", title: "مراجعة", body: "اترك عشر عبارات تستطيع قولها فعلا قبل الانتقال." },
  ],
  hi: [
    { day: "दिन 1", title: "सिर्फ तीन वाक्य सुनें", body: "दस बार सुनें और व्याकरण से पहले ध्वनि की नकल करें।" },
    { day: "दिन 2", title: "लिपि पहचानें", body: "दिशा और आकार देखें, फिर तीन वाक्य एक बार टाइप करें।" },
    { day: "दिन 3", title: "पूरे वाक्य दोहराएं", body: "वाक्य दर वाक्य दोहराएं और अस्थिर ध्वनियां चिन्हित करें।" },
    { day: "दिन 4", title: "एक शब्द बदलें", body: "ढांचा वही रखें, सिर्फ भाषा, स्थान या वस्तु बदलें।" },
    { day: "दिन 5", title: "छोटा श्रुतलेख", body: "सुनें, पाठ छिपाएं और स्मृति से वाक्य टाइप करें।" },
    { day: "दिन 6", title: "छोटी बातचीत", body: "अभिवादन, धन्यवाद और एक जरूरत को छह पंक्तियों में जोड़ें।" },
    { day: "दिन 7", title: "दोहराव", body: "आगे बढ़ने से पहले दस वाक्य रखें जिन्हें सच में बोल सकते हैं।" },
  ],
  id: [
    { day: "Hari 1", title: "Dengar tiga frasa saja", body: "Dengarkan sepuluh kali dan tiru bunyi sebelum tata bahasa." },
    { day: "Hari 2", title: "Kenali aksara", body: "Cek arah, bentuk, lalu ketik tiga frasa sekali." },
    { day: "Hari 3", title: "Ulang frasa penuh", body: "Ulangi frasa demi frasa dan tandai bunyi yang belum stabil." },
    { day: "Hari 4", title: "Ganti satu kata", body: "Pertahankan pola dan ganti hanya bahasa, tempat, atau benda." },
    { day: "Hari 5", title: "Dikte frasa pendek", body: "Dengar, sembunyikan teks, lalu ketik frasa dari ingatan." },
    { day: "Hari 6", title: "Dialog kecil", body: "Gabungkan salam, terima kasih, dan satu kebutuhan dalam enam baris." },
    { day: "Hari 7", title: "Ulang", body: "Simpan sepuluh frasa yang benar-benar bisa kamu ucapkan." },
  ],
  vi: [
    { day: "Ngày 1", title: "Chỉ nghe ba câu", body: "Nghe mười lần và bắt chước âm trước khi học ngữ pháp." },
    { day: "Ngày 2", title: "Làm quen chữ viết", body: "Xem hướng viết, hình dạng rồi gõ ba câu một lần." },
    { day: "Ngày 3", title: "Lặp lại cả câu", body: "Lặp từng câu và đánh dấu âm còn chưa chắc." },
    { day: "Ngày 4", title: "Thay một từ", body: "Giữ mẫu câu, chỉ thay tên ngôn ngữ, nơi hoặc đồ vật." },
    { day: "Ngày 5", title: "Nghe chép câu ngắn", body: "Nghe, ẩn chữ rồi gõ câu từ trí nhớ." },
    { day: "Ngày 6", title: "Đối thoại nhỏ", body: "Ghép chào hỏi, cảm ơn và một nhu cầu thành sáu dòng." },
    { day: "Ngày 7", title: "Ôn lại", body: "Giữ lại mười câu thật sự có thể nói trước khi đi tiếp." },
  ],
  th: [
    { day: "วันที่ 1", title: "ฟังแค่สามประโยค", body: "ฟังสิบครั้งและเลียนเสียงก่อนเรียนไวยากรณ์" },
    { day: "วันที่ 2", title: "รู้จักตัวเขียน", body: "ดูทิศทาง รูปร่าง แล้วพิมพ์สามประโยคหนึ่งครั้ง" },
    { day: "วันที่ 3", title: "พูดตามทั้งประโยค", body: "พูดตามทีละประโยคและทำเครื่องหมายเสียงที่ยังไม่มั่นคง" },
    { day: "วันที่ 4", title: "เปลี่ยนหนึ่งคำ", body: "คงรูปประโยคไว้ เปลี่ยนแค่ภาษา สถานที่ หรือสิ่งของ" },
    { day: "วันที่ 5", title: "ฟังเขียนประโยคสั้น", body: "ฟัง ซ่อนข้อความ แล้วพิมพ์จากความจำ" },
    { day: "วันที่ 6", title: "บทสนทนาเล็ก", body: "รวมคำทักทาย ขอบคุณ และความต้องการหนึ่งอย่างเป็นหกบรรทัด" },
    { day: "วันที่ 7", title: "ทบทวน", body: "เหลือสิบประโยคที่พูดได้จริงก่อนขึ้นบทต่อไป" },
  ],
  tr: [
    { day: "Gün 1", title: "Sadece üç cümle dinle", body: "On kez dinle ve gramerden önce sesi taklit et." },
    { day: "Gün 2", title: "Yazıyla tanış", body: "Yönü ve şekilleri kontrol et, üç cümleyi bir kez yaz." },
    { day: "Gün 3", title: "Tam cümleleri tekrar et", body: "Cümle cümle tekrar et ve zor sesleri işaretle." },
    { day: "Gün 4", title: "Bir kelime değiştir", body: "Kalıbı koru, sadece dil, yer veya nesneyi değiştir." },
    { day: "Gün 5", title: "Kısa dikte", body: "Dinle, metni gizle ve cümleyi hafızadan yaz." },
    { day: "Gün 6", title: "Küçük diyalog", body: "Selam, teşekkür ve bir ihtiyacı altı satırlık diyaloğa bağla." },
    { day: "Gün 7", title: "Tekrar", body: "Devam etmeden önce gerçekten söyleyebildiğin on cümleyi bırak." },
  ],
  it: [
    { day: "Giorno 1", title: "Ascolta solo tre frasi", body: "Ascolta dieci volte e imita il suono prima della grammatica." },
    { day: "Giorno 2", title: "Conosci la scrittura", body: "Controlla direzione e forme, poi digita le tre frasi una volta." },
    { day: "Giorno 3", title: "Ripeti frasi intere", body: "Ripeti frase per frase e segna i suoni ancora instabili." },
    { day: "Giorno 4", title: "Cambia una parola", body: "Mantieni lo schema e cambia solo lingua, luogo o oggetto." },
    { day: "Giorno 5", title: "Dettato breve", body: "Ascolta, nascondi il testo e digita la frase a memoria." },
    { day: "Giorno 6", title: "Piccolo dialogo", body: "Unisci saluto, grazie e un bisogno in sei righe." },
    { day: "Giorno 7", title: "Ripasso", body: "Tieni dieci frasi che puoi davvero dire prima di continuare." },
  ],
  nl: [
    { day: "Dag 1", title: "Luister alleen drie zinnen", body: "Luister tien keer en imiteer de klank voor grammatica." },
    { day: "Dag 2", title: "Leer het schrift kennen", body: "Bekijk richting en vormen en typ de drie zinnen een keer." },
    { day: "Dag 3", title: "Herhaal hele zinnen", body: "Herhaal zin voor zin en markeer klanken die nog wankel zijn." },
    { day: "Dag 4", title: "Vervang een woord", body: "Houd het patroon en vervang alleen taal, plaats of object." },
    { day: "Dag 5", title: "Korte dictatie", body: "Luister, verberg de tekst en typ de zin uit geheugen." },
    { day: "Dag 6", title: "Kleine dialoog", body: "Combineer groet, dank en een behoefte in zes regels." },
    { day: "Dag 7", title: "Herhaal", body: "Bewaar tien zinnen die je echt kunt zeggen voordat je doorgaat." },
  ],
  pl: [
    { day: "Dzień 1", title: "Słuchaj tylko trzech zdań", body: "Posłuchaj dziesięć razy i naśladuj dźwięk przed gramatyką." },
    { day: "Dzień 2", title: "Poznaj pismo", body: "Sprawdź kierunek i kształty, potem wpisz trzy zdania raz." },
    { day: "Dzień 3", title: "Powtarzaj całe zdania", body: "Powtarzaj zdanie po zdaniu i zaznacz trudne dźwięki." },
    { day: "Dzień 4", title: "Zmień jedno słowo", body: "Zostaw wzór i zmień tylko język, miejsce albo rzecz." },
    { day: "Dzień 5", title: "Krótkie dyktando", body: "Posłuchaj, ukryj tekst i wpisz zdanie z pamięci." },
    { day: "Dzień 6", title: "Mały dialog", body: "Połącz powitanie, podziękowanie i jedną potrzebę w sześć linii." },
    { day: "Dzień 7", title: "Powtórka", body: "Zostaw dziesięć zdań, które naprawdę możesz powiedzieć." },
  ],
};

const starterStepDetailCopy: Partial<Record<InterfaceLanguage, Record<string, { title: string; body: string }>>> = {
  en: {
    sound: { title: "Hear the sound", body: "Start with greeting thanks and self introduction before grammar." },
    script: { title: "Meet the script", body: "For non Latin scripts learn the writing system early." },
    sentence: { title: "Use whole sentences", body: "Put every word inside a sentence instead of memorizing alone." },
    review: { title: "Short frequent review", body: "Ten minutes daily beats one long weekend session." },
  },
  zh: Object.fromEntries(worldLanguageStarterPlan.map((step) => [step.id, { title: step.zh, body: step.bodyZh }])) as Record<string, { title: string; body: string }>,
  ja: {
    sound: { title: "まず音を聞く", body: "文法より先に、挨拶、感謝、自己紹介から始めます。" },
    script: { title: "文字体系を見る", body: "ラテン文字以外では、最初に文字の形と方向を見ます。" },
    sentence: { title: "文で使う", body: "単語だけで覚えず、必ず短い文の中で練習します。" },
    review: { title: "短く頻繁に復習", body: "毎日十分の復習が、週末だけの長時間より安定します。" },
  },
  ar: {
    sound: { title: "اسمع الصوت", body: "ابدأ بالتحية والشكر والتعريف بالنفس قبل القواعد." },
    script: { title: "تعرف على الكتابة", body: "في غير اللاتينية تعلم نظام الكتابة مبكرا." },
    sentence: { title: "استخدم جملا كاملة", body: "ضع كل كلمة داخل جملة بدلا من حفظها وحدها." },
    review: { title: "مراجعة قصيرة متكررة", body: "عشر دقائق يوميا أفضل من جلسة طويلة في نهاية الأسبوع." },
  },
  hi: {
    sound: { title: "ध्वनि सुनें", body: "व्याकरण से पहले अभिवादन, धन्यवाद और परिचय से शुरू करें।" },
    script: { title: "लिपि पहचानें", body: "गैर लैटिन लिपियों में लिखने की प्रणाली जल्दी सीखें।" },
    sentence: { title: "पूरे वाक्य इस्तेमाल करें", body: "शब्दों को अकेले याद न करें, उन्हें हमेशा वाक्य में रखें।" },
    review: { title: "छोटा बार बार दोहराव", body: "रोज़ दस मिनट सप्ताहांत की लंबी बैठक से बेहतर है।" },
  },
  id: {
    sound: { title: "Dengar bunyi", body: "Mulai dari salam, terima kasih, dan perkenalan sebelum tata bahasa." },
    script: { title: "Kenali aksara", body: "Untuk aksara non Latin, pelajari sistem tulisan sejak awal." },
    sentence: { title: "Pakai kalimat utuh", body: "Letakkan setiap kata dalam kalimat, bukan hafalan sendiri." },
    review: { title: "Ulang singkat sering", body: "Sepuluh menit sehari lebih kuat dari satu sesi panjang." },
  },
  vi: {
    sound: { title: "Nghe âm thanh", body: "Bắt đầu bằng chào hỏi, cảm ơn và giới thiệu trước ngữ pháp." },
    script: { title: "Làm quen chữ viết", body: "Với chữ không Latin, học hệ chữ từ sớm." },
    sentence: { title: "Dùng cả câu", body: "Đặt mỗi từ vào một câu thay vì ghi nhớ riêng lẻ." },
    review: { title: "Ôn ngắn thường xuyên", body: "Mười phút mỗi ngày tốt hơn một buổi dài cuối tuần." },
  },
  th: {
    sound: { title: "ฟังเสียง", body: "เริ่มจากทักทาย ขอบคุณ และแนะนำตัวก่อนเรียนไวยากรณ์" },
    script: { title: "รู้จักตัวเขียน", body: "ถ้าไม่ใช่อักษรละติน ให้เรียนระบบเขียนตั้งแต่ต้น" },
    sentence: { title: "ใช้ทั้งประโยค", body: "ใส่ทุกคำไว้ในประโยค ไม่จำแยกเดี่ยว" },
    review: { title: "ทบทวนสั้นและบ่อย", body: "วันละสิบนาทีดีกว่าฝึกยาวแค่สุดสัปดาห์" },
  },
  tr: {
    sound: { title: "Sesi dinle", body: "Gramerden önce selam, teşekkür ve tanıtımla başla." },
    script: { title: "Yazıyla tanış", body: "Latin dışı yazılarda sistemi erken öğren." },
    sentence: { title: "Tam cümle kullan", body: "Her kelimeyi yalnız ezberlemek yerine cümle içinde kullan." },
    review: { title: "Kısa sık tekrar", body: "Her gün on dakika, tek uzun hafta sonu çalışmasından iyidir." },
  },
  it: {
    sound: { title: "Ascolta il suono", body: "Prima della grammatica inizia con saluto, grazie e presentazione." },
    script: { title: "Conosci la scrittura", body: "Per scritture non latine impara presto il sistema." },
    sentence: { title: "Usa frasi intere", body: "Metti ogni parola dentro una frase invece di memorizzarla da sola." },
    review: { title: "Ripasso breve frequente", body: "Dieci minuti al giorno battono una lunga sessione nel weekend." },
  },
  nl: {
    sound: { title: "Luister naar de klank", body: "Begin met groet, dank en jezelf voorstellen voor grammatica." },
    script: { title: "Leer het schrift kennen", body: "Bij niet Latijnse schriften leer je het systeem vroeg." },
    sentence: { title: "Gebruik hele zinnen", body: "Zet elk woord in een zin in plaats van los te onthouden." },
    review: { title: "Kort en vaak herhalen", body: "Tien minuten per dag werkt beter dan een lange weekendsessie." },
  },
  pl: {
    sound: { title: "Słuchaj dźwięku", body: "Zacznij od powitania, podziękowania i przedstawienia przed gramatyką." },
    script: { title: "Poznaj pismo", body: "Przy pismach niełacińskich poznaj system wcześnie." },
    sentence: { title: "Używaj całych zdań", body: "Wkładaj każde słowo w zdanie zamiast zapamiętywać osobno." },
    review: { title: "Krótka częsta powtórka", body: "Dziesięć minut dziennie jest lepsze niż jedna długa sesja." },
  },
};

function starterStepLabel(step: (typeof worldLanguageStarterPlan)[number], language: InterfaceLanguage) {
  const copy = starterStepDetailCopy[language] || starterStepDetailCopy.en;
  return copy?.[step.id] ?? {
    title: language === "zh" ? step.zh : step.en,
    body: language === "zh" ? step.bodyZh : step.bodyEn,
  };
}

function getLanguage(slug: string) {
  return worldLanguages.find((language) => language.slug === slug);
}

export function generateStaticParams() {
  return worldLanguages.map((language) => ({ language: language.slug }));
}

export async function generateMetadata({ params, searchParams }: WorldLanguagePageProps): Promise<Metadata> {
  const { language } = await params;
  const interfaceLanguage = resolveInterfaceLanguage(searchParams ? await searchParams : undefined);
  const copy = detailCopy[interfaceLanguage];
  const current = getLanguage(language);
  if (!current) {
    return {
      title: "World Language Course - JinMing Lab",
    };
  }

  const path = `/languages/${current.slug}`;
  const canonical = localizedHref(path, interfaceLanguage);
  const title = `${current.name} ${copy.zero} - JinMing Lab`;
  const description = copy.heroBody(current.script);

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: localizedLanguageAlternates(path),
    },
    openGraph: {
      title,
      description,
      url: `https://vantaapi.com${canonical}`,
      siteName: "JinMing Lab",
      type: "website",
    },
  };
}

export default async function WorldLanguageDetailPage({ params, searchParams }: WorldLanguagePageProps) {
  const { language } = await params;
  const interfaceLanguage = resolveInterfaceLanguage(searchParams ? await searchParams : undefined);
  const copy = detailCopy[interfaceLanguage];
  const current = getLanguage(language);
  if (!current) notFound();
  const survivalCopy = survivalSlotCopy[interfaceLanguage] || survivalSlotCopy.en!;
  const weekCopy = weekPlanCopy[interfaceLanguage] || weekPlanCopy.en!;

  const sameFamily = worldLanguages
    .filter((item) => item.family === current.family && item.slug !== current.slug)
    .slice(0, 8);
  const survivalPhrases = worldLanguageSurvivalPhrases[current.slug];
  const trainerPhrases = survivalSlots.map((slot, index) => ({
    key: slot.key,
    label: survivalCopy[slot.key].label,
    text: survivalPhrases?.[slot.key] ?? current.firstLesson[index] ?? survivalCopy[slot.key].fallback,
  }));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: `${current.name} Zero Foundation Course`,
    description: `A zero foundation ${current.name} course for ${current.starterGoal}.`,
    provider: {
      "@type": "Organization",
      name: "JinMing Lab",
      url: "https://vantaapi.com",
    },
    inLanguage: current.name,
    url: `https://vantaapi.com/languages/${current.slug}`,
    educationalLevel: "Beginner",
  };

  return (
    <main className="apple-page pb-16" dir={interfaceLanguage === "ar" ? "rtl" : "ltr"} data-interface-language={interfaceLanguage}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <section className="mx-auto min-h-screen w-[min(1280px,calc(100%_-_28px))] py-5">
        <header className="dense-panel flex flex-wrap items-center justify-between gap-3 p-4">
          <Link href={localizedHref("/languages", interfaceLanguage)} className="dense-action">{copy.back}</Link>
          <div className="flex flex-wrap items-center gap-2">
            <Link href={localizedHref("/tools", interfaceLanguage)} className="dense-action">{copy.tools}</Link>
            <Link href={localizedHref("/programming", interfaceLanguage)} className="dense-action">{copy.programming}</Link>
            <FlagLanguageToggle initialLanguage={interfaceLanguage} />
          </div>
        </header>

        <section className="mt-3 dense-panel overflow-hidden p-5 sm:p-6">
          <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px] xl:items-end">
            <div>
              <p className="eyebrow">{current.family} · {current.region}</p>
              <h1 className="mt-3 max-w-5xl text-3xl font-semibold leading-[1.04] sm:text-4xl lg:text-5xl">
                {current.nativeName} {copy.zero}
              </h1>
              <p className="mt-2 text-xl font-semibold">{current.name} · {copy.fromFirst}</p>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-[color:var(--muted)]">
                {copy.heroBody(current.script)}
              </p>
            </div>

            <div className="rounded-[8px] border border-slate-200 bg-white/75 p-4">
              <p className="eyebrow">{copy.firstThree}</p>
              <div className="mt-3 grid gap-2">
                {current.firstLesson.map((phrase, index) => (
                  <div key={phrase} className="dense-row">
                    <span className="text-sm font-semibold">{String(index + 1).padStart(2, "0")}</span>
                    <span className="truncate text-sm text-[color:var(--muted)]">{phrase}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mt-3 grid gap-3 lg:grid-cols-4">
          {copy.cards(current.nativeName, current.script).map((card) => (
            <article key={card.eyebrow} className="dense-card p-5">
              <p className="eyebrow">{card.eyebrow}</p>
              <h2 className="mt-3 text-xl font-semibold">{card.title}</h2>
              <p className="mt-3 text-sm leading-6 text-[color:var(--muted)]">{card.body}</p>
            </article>
          ))}
        </section>

        <WorldLanguageStarterTrainer
          languageSlug={current.slug}
          nativeName={current.nativeName}
          languageName={current.name}
          phrases={trainerPhrases}
          interfaceLanguage={interfaceLanguage}
        />

        <section className="mt-3 grid gap-3 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <div className="dense-panel dense-grid-bg p-5">
            <p className="eyebrow text-slate-400">{copy.orderEyebrow}</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">{copy.orderTitle}</h2>
            <div className="mt-5 grid gap-2">
              {worldLanguageStarterPlan.map((step, index) => (
                <div key={step.id} className="rounded-[8px] border border-white/10 bg-white/[0.07] p-3">
                  <div className="flex items-start gap-3">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-[8px] bg-white text-xs font-semibold text-slate-950">
                      {index + 1}
                    </span>
                    <div>
                      <h3 className="font-semibold text-white">{starterStepLabel(step, interfaceLanguage).title}</h3>
                      <p className="mt-1 text-sm leading-6 text-slate-300">{starterStepLabel(step, interfaceLanguage).body}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="dense-panel p-5">
            <p className="eyebrow">{copy.survivalEyebrow}</p>
            <h2 className="mt-2 text-2xl font-semibold">{copy.survivalTitle}</h2>
            <div className="mt-5 grid gap-2 sm:grid-cols-2">
              {survivalSlots.map((slot, index) => (
                <article key={slot.key} className="dense-card p-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold">{survivalCopy[slot.key].label}</p>
                    <span className="dense-status">{String(index + 1).padStart(2, "0")}</span>
                  </div>
                  <h3 className="mt-3 text-lg font-semibold">
                    {survivalPhrases?.[slot.key] ?? current.firstLesson[index] ?? survivalCopy[slot.key].fallback}
                  </h3>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-3 dense-panel p-5">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="eyebrow">{copy.weekEyebrow}</p>
              <h2 className="mt-2 text-2xl font-semibold">{copy.weekTitle}</h2>
            </div>
            <span className="dense-status">{copy.zeroStatus}</span>
          </div>
          <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-4">
            {weekCopy.map((item) => (
              <article key={item.day} className="dense-card p-4">
                <p className="eyebrow">{item.day}</p>
                <h3 className="mt-3 text-xl font-semibold">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-[color:var(--muted)]">{item.body}</p>
              </article>
            ))}
          </div>
        </section>

        {sameFamily.length > 0 && (
          <section className="mt-3 dense-panel p-5">
            <p className="eyebrow">{copy.sameFamilyEyebrow}</p>
            <h2 className="mt-2 text-2xl font-semibold">{copy.sameFamilyTitle}</h2>
            <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {sameFamily.map((item) => (
                <Link key={item.slug} href={localizedHref(`/languages/${item.slug}`, interfaceLanguage)} className="dense-row">
                  <span className="text-sm font-semibold">{item.name}</span>
                  <span className="truncate text-xs text-[color:var(--muted)]">{item.nativeName}</span>
                </Link>
              ))}
            </div>
          </section>
        )}
      </section>
    </main>
  );
}
