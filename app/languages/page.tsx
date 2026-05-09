import Link from "next/link";
import type { Metadata } from "next";
import { headers } from "next/headers";
import FlagLanguageToggle from "@/components/layout/FlagLanguageToggle";
import { WorldLanguageExplorer } from "@/components/learning/WorldLanguageExplorer";
import { localizedHref, localizedLanguageAlternates, resolveInterfaceLanguage, type InterfaceLanguage, type PageSearchParams } from "@/lib/language";
import {
  worldLanguageFamilies,
  worldLanguages,
  worldLanguageStarterPlan,
} from "@/lib/world-language-content";

export async function generateMetadata({
  searchParams,
}: {
  searchParams?: Promise<PageSearchParams>;
}): Promise<Metadata> {
  const headersList = await headers();
  const headerLanguage = headersList.get("x-jinming-language");
  const language = resolveInterfaceLanguage(searchParams ? await searchParams : undefined, headerLanguage);
  const page = languagesPageCopy[language];
  const canonical = localizedHref("/languages", language);

  return {
    title: `${page.title} - JinMing Lab`,
    description: page.body,
    alternates: {
      canonical,
      languages: localizedLanguageAlternates("/languages"),
    },
    openGraph: {
      title: `${page.title} - JinMing Lab`,
      description: page.body,
      url: `https://vantaapi.com${canonical}`,
      siteName: "JinMing Lab",
      type: "website",
    },
  };
}

const featuredSlugs = [
  "english",
  "spanish",
  "french",
  "japanese",
  "korean",
  "chinese",
  "arabic",
  "german",
  "russian",
  "portuguese",
  "italian",
  "thai",
];

const featuredLanguages = featuredSlugs
  .map((slug) => worldLanguages.find((language) => language.slug === slug))
  .filter((language): language is (typeof worldLanguages)[number] => Boolean(language));

type LanguagesPageCopy = {
  navWorld: string;
  navTools: string;
  navProgramming: string;
  eyebrow: string;
  title: string;
  body: string;
  english: string;
  japanese: string;
  spanish: string;
  orderLabel: string;
  zeroRules: { eyebrow: string; title: string; body: string }[];
  recommendedEyebrow: string;
  recommendedTitle: string;
  languageCount: (count: number) => string;
  familiesEyebrow: string;
  familiesTitle: string;
  familyCount: (count: number) => string;
  cardBody: (nativeName: string) => string;
};

type LanguagesPageLanguage = "en" | "zh" | "ja" | "ar";

const pageCopy: Record<LanguagesPageLanguage, LanguagesPageCopy> = {
  en: {
    navWorld: "World languages",
    navTools: "AI Tools",
    navProgramming: "Coding Lab",
    eyebrow: "World languages from zero",
    title: "Start any world language from zero",
    body: "Begin with sound, script, first phrases, sentence swaps, and daily review so every language has a practical first step.",
    english: "Learn English",
    japanese: "Learn Japanese",
    spanish: "Learn Spanish",
    orderLabel: "Zero foundation order",
    zeroRules: [
      { eyebrow: "Hear first", title: "Sound before tables", body: "Start with greetings thanks and self introduction before grammar tables." },
      { eyebrow: "Read early", title: "Notice the script", body: "In week one, learn shapes, sounds, direction, and input habits for new scripts." },
      { eyebrow: "Swap sentences", title: "Practice whole phrases", body: "Use I am learning, I need water, and I do not understand, then replace one slot at a time." },
      { eyebrow: "Short review", title: "Ten minutes daily", body: "A short daily loop is steadier than one long session. Revive yesterday before adding today." },
    ],
    recommendedEyebrow: "Recommended",
    recommendedTitle: "Start with common languages",
    languageCount: (count) => `${count} languages`,
    familiesEyebrow: "Families",
    familiesTitle: "Find by language family",
    familyCount: (count) => `${count} languages`,
    cardBody: (nativeName) => `Start ${nativeName} with sound, script, and first phrases.`,
  },
  zh: {
    navWorld: "世界语言",
    navTools: "AI 工具",
    navProgramming: "编程训练",
    eyebrow: "世界语言 0 基础",
    title: "世界语言从 0 开始",
    body: "从发音开始 再到文字系统 第一批短句 句型替换 每日复习 让任何语言都能从 0 开始学",
    english: "学英语",
    japanese: "学日本語",
    spanish: "学Español",
    orderLabel: "0 基础顺序",
    zeroRules: [
      { eyebrow: "先听声音", title: "声音先行", body: "不要一上来背语法表 先把问候 感谢 自我介绍听到节奏熟悉" },
      { eyebrow: "早认文字", title: "文字早认", body: "遇到新文字系统 第一周就认识字形 声音 方向和输入习惯" },
      { eyebrow: "整句替换", title: "整句替换", body: "先练我正在学 我要水 我没听懂 这类高频句 再一次替换一个位置" },
      { eyebrow: "短频复习", title: "短频复习", body: "每天十分钟比一次学很久更稳 每次先复活昨天 再加新句子" },
    ],
    recommendedEyebrow: "推荐入口",
    recommendedTitle: "先从常用语言开始",
    languageCount: (count) => `${count} 门语言`,
    familiesEyebrow: "语系",
    familiesTitle: "按语系找入口",
    familyCount: (count) => `${count} 门语言`,
    cardBody: (nativeName) => `从声音 文字 第一批短句开始 建立 ${nativeName} 的入门手感`,
  },
  ja: {
    navWorld: "世界の言語",
    navTools: "AI ツール",
    navProgramming: "プログラミング",
    eyebrow: "世界の言語 ゼロ基礎",
    title: "どの言語もゼロから始める",
    body: "音、文字、最初の短文、文型の入れ替え、毎日の復習から始めるので、どの言語にも最初の一歩があります。",
    english: "英語を学ぶ",
    japanese: "日本語を学ぶ",
    spanish: "スペイン語を学ぶ",
    orderLabel: "ゼロ基礎の順序",
    zeroRules: [
      { eyebrow: "まず音", title: "音から入る", body: "文法表より先に、挨拶、感謝、自己紹介のリズムに慣れます。" },
      { eyebrow: "早く文字", title: "文字を早めに見る", body: "新しい文字体系では、最初の週に形、音、方向、入力の癖をつかみます。" },
      { eyebrow: "文で交換", title: "丸ごと短文を使う", body: "学んでいます、水がほしい、わかりません、のような文を一か所ずつ入れ替えます。" },
      { eyebrow: "短く復習", title: "毎日十分", body: "長時間を一回より、短い毎日の復習が安定します。昨日を戻してから今日を足します。" },
    ],
    recommendedEyebrow: "おすすめ",
    recommendedTitle: "よく使う言語から始める",
    languageCount: (count) => `${count} 言語`,
    familiesEyebrow: "語族",
    familiesTitle: "語族から探す",
    familyCount: (count) => `${count} 言語`,
    cardBody: (nativeName) => `${nativeName} を音、文字、最初の短文から始めます。`,
  },
  ar: {
    navWorld: "لغات العالم",
    navTools: "أدوات AI",
    navProgramming: "مختبر البرمجة",
    eyebrow: "لغات العالم من الصفر",
    title: "ابدأ أي لغة عالمية من الصفر",
    body: "ابدأ بالصوت ثم الكتابة ثم العبارات الأولى وتبديل الجمل والمراجعة اليومية حتى تكون لكل لغة خطوة واضحة.",
    english: "تعلم الإنجليزية",
    japanese: "تعلم اليابانية",
    spanish: "تعلم الإسبانية",
    orderLabel: "ترتيب البداية من الصفر",
    zeroRules: [
      { eyebrow: "الصوت أولا", title: "ابدأ بالسماع", body: "لا تبدأ بجداول القواعد. تعود أولا على التحية والشكر والتعريف بالنفس." },
      { eyebrow: "الكتابة مبكرا", title: "تعرف على الحروف", body: "في الأسبوع الأول افهم شكل الكتابة وصوتها واتجاهها وطريقة إدخالها." },
      { eyebrow: "بدل الجمل", title: "تدرب بعبارات كاملة", body: "تدرب على أنا أتعلم، أريد ماء، لم أفهم، ثم بدل جزءا واحدا في كل مرة." },
      { eyebrow: "مراجعة قصيرة", title: "عشر دقائق يوميا", body: "مراجعة قصيرة يومية أفضل من جلسة طويلة متقطعة. أعد أمس ثم أضف اليوم." },
    ],
    recommendedEyebrow: "مداخل مقترحة",
    recommendedTitle: "ابدأ باللغات الأكثر استخداما",
    languageCount: (count) => `${count} لغة`,
    familiesEyebrow: "العائلات",
    familiesTitle: "ابحث حسب عائلة اللغة",
    familyCount: (count) => `${count} لغة`,
    cardBody: (nativeName) => `ابدأ ${nativeName} بالصوت والكتابة والعبارات الأولى.`,
  },
};

const extendedPageCopy: Partial<Record<InterfaceLanguage, LanguagesPageCopy>> = {
  ko: {
    navWorld: "세계 언어",
    navTools: "AI 도구",
    navProgramming: "코딩 랩",
    eyebrow: "세계 언어 제로 베이스",
    title: "어떤 언어든 0부터 시작",
    body: "소리, 문자, 첫 문장, 문장 바꾸기, 매일 복습으로 모든 언어의 첫 걸음을 만듭니다.",
    english: "영어 배우기",
    japanese: "일본어 배우기",
    spanish: "스페인어 배우기",
    orderLabel: "제로 베이스 순서",
    zeroRules: [
      { eyebrow: "먼저 듣기", title: "표보다 소리", body: "문법표보다 인사 감사 자기소개 리듬을 먼저 익힙니다." },
      { eyebrow: "문자 보기", title: "문자를 일찍 만남", body: "새 문자에서는 모양 소리 방향 입력 습관을 첫 주에 잡습니다." },
      { eyebrow: "문장 바꾸기", title: "전체 문장 연습", body: "자주 쓰는 문장을 한 자리씩 바꾸며 연습합니다." },
      { eyebrow: "짧은 복습", title: "매일 10분", body: "긴 한 번보다 짧은 매일 루프가 더 안정적입니다." },
    ],
    recommendedEyebrow: "추천",
    recommendedTitle: "자주 쓰는 언어부터 시작",
    languageCount: (count) => `${count}개 언어`,
    familiesEyebrow: "어족",
    familiesTitle: "어족으로 찾기",
    familyCount: (count) => `${count}개 언어`,
    cardBody: (nativeName) => `${nativeName}을 소리 문자 첫 문장부터 시작합니다.`,
  },
  es: {
    navWorld: "Idiomas",
    navTools: "Herramientas AI",
    navProgramming: "Laboratorio de codigo",
    eyebrow: "Idiomas del mundo desde cero",
    title: "Empieza cualquier idioma desde cero",
    body: "Empieza con sonido, escritura, primeras frases, cambios de frase y repaso diario para tener un primer paso real.",
    english: "Aprender ingles",
    japanese: "Aprender japones",
    spanish: "Aprender espanol",
    orderLabel: "Orden desde cero",
    zeroRules: [
      { eyebrow: "Escucha primero", title: "Sonido antes que tablas", body: "Aprende saludos, gracias y presentacion antes de tablas gramaticales." },
      { eyebrow: "Lee temprano", title: "Observa la escritura", body: "En la primera semana mira formas, sonidos, direccion y habitos de entrada." },
      { eyebrow: "Cambia frases", title: "Practica frases completas", body: "Usa frases utiles y cambia una parte cada vez." },
      { eyebrow: "Repaso corto", title: "Diez minutos diarios", body: "Un bucle diario corto es mas estable que una sesion larga." },
    ],
    recommendedEyebrow: "Recomendado",
    recommendedTitle: "Empieza con idiomas comunes",
    languageCount: (count) => `${count} idiomas`,
    familiesEyebrow: "Familias",
    familiesTitle: "Buscar por familia",
    familyCount: (count) => `${count} idiomas`,
    cardBody: (nativeName) => `Empieza ${nativeName} con sonido, escritura y primeras frases.`,
  },
  fr: {
    navWorld: "Langues",
    navTools: "Outils IA",
    navProgramming: "Lab de code",
    eyebrow: "Langues du monde depuis zero",
    title: "Commencer n importe quelle langue depuis zero",
    body: "Commence par le son, l ecriture, les premieres phrases, les substitutions et la revision quotidienne.",
    english: "Apprendre anglais",
    japanese: "Apprendre japonais",
    spanish: "Apprendre espagnol",
    orderLabel: "Ordre debutant",
    zeroRules: [
      { eyebrow: "Ecouter d abord", title: "Le son avant les tableaux", body: "Commence par salutations merci et presentation avant la grammaire." },
      { eyebrow: "Lire tot", title: "Observer l ecriture", body: "Apprends formes sons direction et saisie des la premiere semaine." },
      { eyebrow: "Changer la phrase", title: "Phrases entieres", body: "Garde la phrase et remplace une seule partie a la fois." },
      { eyebrow: "Revision courte", title: "Dix minutes par jour", body: "Une petite boucle quotidienne reste plus solide qu une longue session." },
    ],
    recommendedEyebrow: "Recommande",
    recommendedTitle: "Commencer par les langues courantes",
    languageCount: (count) => `${count} langues`,
    familiesEyebrow: "Familles",
    familiesTitle: "Trouver par famille",
    familyCount: (count) => `${count} langues`,
    cardBody: (nativeName) => `Commence ${nativeName} par le son, l ecriture et les premieres phrases.`,
  },
  de: {
    navWorld: "Weltsprachen",
    navTools: "AI Tools",
    navProgramming: "Coding Lab",
    eyebrow: "Weltsprachen von null",
    title: "Jede Sprache von null starten",
    body: "Starte mit Klang, Schrift, ersten Saetzen, Satztausch und taeglicher Wiederholung.",
    english: "Englisch lernen",
    japanese: "Japanisch lernen",
    spanish: "Spanisch lernen",
    orderLabel: "Null Basis Reihenfolge",
    zeroRules: [
      { eyebrow: "Erst hoeren", title: "Klang vor Tabellen", body: "Beginne mit Gruss, Dank und Vorstellung vor Grammatiktafeln." },
      { eyebrow: "Frueh lesen", title: "Schrift erkennen", body: "Lerne Formen, Laute, Richtung und Eingabegewohnheiten frueh." },
      { eyebrow: "Saetze tauschen", title: "Ganze Saetze ueben", body: "Nutze feste Saetze und ersetze jeweils nur eine Stelle." },
      { eyebrow: "Kurz wiederholen", title: "Zehn Minuten taeglich", body: "Eine kurze taegliche Runde ist stabiler als eine lange Sitzung." },
    ],
    recommendedEyebrow: "Empfohlen",
    recommendedTitle: "Mit haeufigen Sprachen starten",
    languageCount: (count) => `${count} Sprachen`,
    familiesEyebrow: "Familien",
    familiesTitle: "Nach Sprachfamilie finden",
    familyCount: (count) => `${count} Sprachen`,
    cardBody: (nativeName) => `Starte ${nativeName} mit Klang, Schrift und ersten Saetzen.`,
  },
  pt: {
    navWorld: "Idiomas",
    navTools: "Ferramentas AI",
    navProgramming: "Lab de codigo",
    eyebrow: "Idiomas do mundo do zero",
    title: "Comece qualquer idioma do zero",
    body: "Som, escrita, primeiras frases, troca de frases e revisao diaria criam o primeiro passo real.",
    english: "Aprender ingles",
    japanese: "Aprender japones",
    spanish: "Aprender espanhol",
    orderLabel: "Ordem do zero",
    zeroRules: pageCopy.en.zeroRules,
    recommendedEyebrow: "Recomendado",
    recommendedTitle: "Comece por idiomas comuns",
    languageCount: (count) => `${count} idiomas`,
    familiesEyebrow: "Familias",
    familiesTitle: "Buscar por familia",
    familyCount: (count) => `${count} idiomas`,
    cardBody: (nativeName) => `Comece ${nativeName} com som, escrita e primeiras frases.`,
  },
  ru: {
    navWorld: "Языки мира",
    navTools: "AI инструменты",
    navProgramming: "Кодинг",
    eyebrow: "Языки мира с нуля",
    title: "Начни любой язык с нуля",
    body: "Звук, письмо, первые фразы, замена частей предложения и ежедневное повторение дают понятный старт.",
    english: "Учить английский",
    japanese: "Учить японский",
    spanish: "Учить испанский",
    orderLabel: "Порядок с нуля",
    zeroRules: [
      { eyebrow: "Сначала звук", title: "Звук до таблиц", body: "Начни с приветствия, благодарности и представления до грамматики." },
      { eyebrow: "Рано читать", title: "Заметь письменность", body: "В первую неделю изучи формы, звуки, направление и ввод." },
      { eyebrow: "Меняй фразы", title: "Целые фразы", body: "Бери полезные фразы и меняй одну часть за раз." },
      { eyebrow: "Короткий повтор", title: "Десять минут в день", body: "Короткий ежедневный цикл устойчивее длинной сессии." },
    ],
    recommendedEyebrow: "Рекомендуем",
    recommendedTitle: "Начни с частых языков",
    languageCount: (count) => `${count} языков`,
    familiesEyebrow: "Семьи",
    familiesTitle: "Найти по языковой семье",
    familyCount: (count) => `${count} языков`,
    cardBody: (nativeName) => `Начни ${nativeName} со звука, письма и первых фраз.`,
  },
  hi: {
    navWorld: "विश्व भाषाएं",
    navTools: "AI tools",
    navProgramming: "Coding lab",
    eyebrow: "विश्व भाषाएं शून्य से",
    title: "किसी भी भाषा को शून्य से शुरू करें",
    body: "ध्वनि, लिपि, पहली पंक्तियां, वाक्य बदलना और रोज़ समीक्षा से साफ शुरुआत मिलती है.",
    english: "English सीखें",
    japanese: "Japanese सीखें",
    spanish: "Spanish सीखें",
    orderLabel: "शून्य आधार क्रम",
    zeroRules: [
      { eyebrow: "पहले सुनें", title: "तालिका से पहले ध्वनि", body: "व्याकरण से पहले greeting, thanks और self intro सुनें." },
      { eyebrow: "जल्दी पढ़ें", title: "लिपि पहचानें", body: "नई लिपि में आकार, ध्वनि, दिशा और input आदत देखें." },
      { eyebrow: "वाक्य बदलें", title: "पूरे वाक्य", body: "एक समय में वाक्य का सिर्फ एक हिस्सा बदलें." },
      { eyebrow: "छोटी समीक्षा", title: "रोज़ दस मिनट", body: "छोटा daily loop लंबी session से ज्यादा स्थिर है." },
    ],
    recommendedEyebrow: "सुझाव",
    recommendedTitle: "आम भाषाओं से शुरू करें",
    languageCount: (count) => `${count} भाषाएं`,
    familiesEyebrow: "परिवार",
    familiesTitle: "भाषा परिवार से खोजें",
    familyCount: (count) => `${count} भाषाएं`,
    cardBody: (nativeName) => `${nativeName} को ध्वनि, लिपि और पहली पंक्तियों से शुरू करें.`,
  },
  id: {
    navWorld: "Bahasa dunia",
    navTools: "Alat AI",
    navProgramming: "Lab kode",
    eyebrow: "Bahasa dunia dari nol",
    title: "Mulai bahasa apa pun dari nol",
    body: "Mulai dari suara, tulisan, frasa pertama, pertukaran kalimat, dan ulasan harian.",
    english: "Belajar Inggris",
    japanese: "Belajar Jepang",
    spanish: "Belajar Spanyol",
    orderLabel: "Urutan dari nol",
    zeroRules: pageCopy.en.zeroRules,
    recommendedEyebrow: "Rekomendasi",
    recommendedTitle: "Mulai dari bahasa umum",
    languageCount: (count) => `${count} bahasa`,
    familiesEyebrow: "Keluarga",
    familiesTitle: "Cari menurut keluarga",
    familyCount: (count) => `${count} bahasa`,
    cardBody: (nativeName) => `Mulai ${nativeName} dari suara, tulisan, dan frasa pertama.`,
  },
  vi: {
    navWorld: "Ngon ngu the gioi",
    navTools: "Cong cu AI",
    navProgramming: "Phong code",
    eyebrow: "Ngon ngu the gioi tu so khong",
    title: "Bat dau bat ky ngon ngu nao tu so khong",
    body: "Bat dau bang am thanh, chu viet, cum dau tien, doi mau cau va on tap hang ngay.",
    english: "Hoc tieng Anh",
    japanese: "Hoc tieng Nhat",
    spanish: "Hoc tieng Tay Ban Nha",
    orderLabel: "Thu tu tu so khong",
    zeroRules: pageCopy.en.zeroRules,
    recommendedEyebrow: "Goi y",
    recommendedTitle: "Bat dau voi ngon ngu pho bien",
    languageCount: (count) => `${count} ngon ngu`,
    familiesEyebrow: "He ngon ngu",
    familiesTitle: "Tim theo he ngon ngu",
    familyCount: (count) => `${count} ngon ngu`,
    cardBody: (nativeName) => `Bat dau ${nativeName} bang am thanh, chu viet va cum dau tien.`,
  },
  th: {
    navWorld: "ภาษาทั่วโลก",
    navTools: "เครื่องมือ AI",
    navProgramming: "ห้องโค้ด",
    eyebrow: "ภาษาทั่วโลกจากศูนย์",
    title: "เริ่มภาษาใดก็ได้จากศูนย์",
    body: "เริ่มจากเสียง ระบบเขียน วลีแรก การสลับประโยค และทบทวนรายวัน",
    english: "เรียนอังกฤษ",
    japanese: "เรียนญี่ปุ่น",
    spanish: "เรียนสเปน",
    orderLabel: "ลำดับเริ่มจากศูนย์",
    zeroRules: pageCopy.en.zeroRules,
    recommendedEyebrow: "แนะนำ",
    recommendedTitle: "เริ่มจากภาษาที่ใช้บ่อย",
    languageCount: (count) => `${count} ภาษา`,
    familiesEyebrow: "ตระกูลภาษา",
    familiesTitle: "ค้นหาตามตระกูล",
    familyCount: (count) => `${count} ภาษา`,
    cardBody: (nativeName) => `เริ่ม ${nativeName} จากเสียง ตัวเขียน และวลีแรก`,
  },
  tr: {
    navWorld: "Dunya dilleri",
    navTools: "AI araclari",
    navProgramming: "Kod lab",
    eyebrow: "Dunya dilleri sifirdan",
    title: "Her dili sifirdan baslat",
    body: "Ses, yazi, ilk cumleler, cumle degistirme ve gunluk tekrar net ilk adim verir.",
    english: "Ingilizce ogren",
    japanese: "Japonca ogren",
    spanish: "Ispanyolca ogren",
    orderLabel: "Sifirdan sira",
    zeroRules: pageCopy.en.zeroRules,
    recommendedEyebrow: "Onerilen",
    recommendedTitle: "Yaygin dillerle basla",
    languageCount: (count) => `${count} dil`,
    familiesEyebrow: "Aileler",
    familiesTitle: "Dil ailesine gore bul",
    familyCount: (count) => `${count} dil`,
    cardBody: (nativeName) => `${nativeName} icin ses, yazi ve ilk cumlelerle basla.`,
  },
  it: {
    navWorld: "Lingue del mondo",
    navTools: "Strumenti AI",
    navProgramming: "Lab codice",
    eyebrow: "Lingue del mondo da zero",
    title: "Inizia qualsiasi lingua da zero",
    body: "Suono, scrittura, prime frasi, scambio di frasi e ripasso quotidiano creano il primo passo.",
    english: "Impara inglese",
    japanese: "Impara giapponese",
    spanish: "Impara spagnolo",
    orderLabel: "Ordine da zero",
    zeroRules: pageCopy.en.zeroRules,
    recommendedEyebrow: "Consigliato",
    recommendedTitle: "Inizia dalle lingue comuni",
    languageCount: (count) => `${count} lingue`,
    familiesEyebrow: "Famiglie",
    familiesTitle: "Trova per famiglia",
    familyCount: (count) => `${count} lingue`,
    cardBody: (nativeName) => `Inizia ${nativeName} con suono, scrittura e prime frasi.`,
  },
  nl: {
    navWorld: "Wereldtalen",
    navTools: "AI tools",
    navProgramming: "Code lab",
    eyebrow: "Wereldtalen vanaf nul",
    title: "Start elke taal vanaf nul",
    body: "Begin met klank, schrift, eerste zinnen, zinwissels en dagelijkse herhaling.",
    english: "Engels leren",
    japanese: "Japans leren",
    spanish: "Spaans leren",
    orderLabel: "Volgorde vanaf nul",
    zeroRules: pageCopy.en.zeroRules,
    recommendedEyebrow: "Aanbevolen",
    recommendedTitle: "Begin met veelgebruikte talen",
    languageCount: (count) => `${count} talen`,
    familiesEyebrow: "Families",
    familiesTitle: "Vind per taalfamilie",
    familyCount: (count) => `${count} talen`,
    cardBody: (nativeName) => `Start ${nativeName} met klank, schrift en eerste zinnen.`,
  },
  pl: {
    navWorld: "Jezyki swiata",
    navTools: "Narzędzia AI",
    navProgramming: "Lab kodu",
    eyebrow: "Jezyki swiata od zera",
    title: "Zacznij dowolny jezyk od zera",
    body: "Dzwiek, pismo, pierwsze frazy, podmiana zdan i codzienna powtorka tworza pierwszy krok.",
    english: "Ucz sie angielskiego",
    japanese: "Ucz sie japonskiego",
    spanish: "Ucz sie hiszpanskiego",
    orderLabel: "Kolejnosc od zera",
    zeroRules: pageCopy.en.zeroRules,
    recommendedEyebrow: "Polecane",
    recommendedTitle: "Zacznij od popularnych jezykow",
    languageCount: (count) => `${count} jezykow`,
    familiesEyebrow: "Rodziny",
    familiesTitle: "Szukaj wedlug rodziny",
    familyCount: (count) => `${count} jezykow`,
    cardBody: (nativeName) => `Zacznij ${nativeName} od dzwieku, pisma i pierwszych fraz.`,
  },
};

const languagesPageCopy: Record<InterfaceLanguage, LanguagesPageCopy> = {
  ...pageCopy,
  ...extendedPageCopy,
} as Record<InterfaceLanguage, LanguagesPageCopy>;

const starterStepCopy: Record<LanguagesPageLanguage, Record<string, { title: string; body: string }>> = {
  en: {
    sound: { title: "Hear the sound", body: "Start with greetings thanks and self introduction before grammar." },
    script: { title: "Meet the script", body: "For non Latin scripts learn shapes sounds and direction early." },
    sentence: { title: "Use whole sentences", body: "Put every word inside a sentence instead of memorizing alone." },
    review: { title: "Short frequent review", body: "Ten minutes daily beats one long weekend session." },
  },
  zh: {
    sound: { title: "先听音", body: "先掌握问候 感谢 自我介绍 三句话 不急着背语法" },
    script: { title: "再认字", body: "拉丁字母以外的语言先认字母或文字系统" },
    sentence: { title: "整句输入", body: "每个词都放到一句话里练 不孤立背词" },
    review: { title: "短频复习", body: "每天 10 分钟比周末一次 2 小时更稳" },
  },
  ja: {
    sound: { title: "まず音を聞く", body: "文法より先に、挨拶、感謝、自己紹介の三文を覚えます。" },
    script: { title: "次に文字を見る", body: "ラテン文字以外では、文字の形、音、方向を早めにつかみます。" },
    sentence: { title: "文で入力する", body: "単語だけでなく、必ず短い文の中で練習します。" },
    review: { title: "短く何度も復習", body: "週末二時間より、毎日十分の方が安定します。" },
  },
  ar: {
    sound: { title: "اسمع أولا", body: "ابدأ بثلاث جمل للتحية والشكر والتعريف بالنفس قبل القواعد." },
    script: { title: "تعرف على الكتابة", body: "في اللغات غير اللاتينية تعلم شكل الحروف وصوتها واتجاهها مبكرا." },
    sentence: { title: "استخدم جملا كاملة", body: "ضع كل كلمة داخل جملة قصيرة بدلا من حفظها وحدها." },
    review: { title: "مراجعة قصيرة متكررة", body: "عشر دقائق يوميا أفضل من ساعتين في نهاية الأسبوع." },
  },
};

const extendedStarterStepCopy: Partial<Record<InterfaceLanguage, Record<string, { title: string; body: string }>>> = {
  ko: {
    sound: { title: "먼저 소리", body: "문법보다 인사 감사 자기소개를 먼저 듣습니다." },
    script: { title: "문자 만나기", body: "새 문자에서는 모양 소리 방향을 일찍 익힙니다." },
    sentence: { title: "문장으로 입력", body: "단어만 외우지 말고 짧은 문장 안에서 연습합니다." },
    review: { title: "짧고 자주 복습", body: "매일 10분이 긴 주말 학습보다 안정적입니다." },
  },
  es: {
    sound: { title: "Escucha primero", body: "Empieza con saludos gracias y presentacion antes de gramatica." },
    script: { title: "Conoce la escritura", body: "En escrituras no latinas aprende forma sonido y direccion temprano." },
    sentence: { title: "Usa frases completas", body: "Pon cada palabra dentro de una frase corta." },
    review: { title: "Repaso corto", body: "Diez minutos diarios vencen una sesion larga." },
  },
  fr: {
    sound: { title: "Ecouter d abord", body: "Commence par saluer remercier et te presenter avant la grammaire." },
    script: { title: "Voir l ecriture", body: "Pour les ecritures non latines, apprends formes sons et direction tot." },
    sentence: { title: "Utiliser des phrases", body: "Place chaque mot dans une phrase courte." },
    review: { title: "Revision courte", body: "Dix minutes par jour valent mieux qu une longue session." },
  },
  de: {
    sound: { title: "Erst hoeren", body: "Starte mit Gruss Dank und Vorstellung vor Grammatik." },
    script: { title: "Schrift sehen", body: "Bei nicht lateinischen Schriften frueh Form Klang und Richtung lernen." },
    sentence: { title: "Ganze Saetze", body: "Setze jedes Wort in einen kurzen Satz." },
    review: { title: "Kurz wiederholen", body: "Zehn Minuten taeglich schlagen eine lange Sitzung." },
  },
};

function starterStepText(step: (typeof worldLanguageStarterPlan)[number], language: InterfaceLanguage) {
  const source = extendedStarterStepCopy[language] || starterStepCopy[language as LanguagesPageLanguage] || starterStepCopy.en;
  return source[step.id] ?? {
    title: language === "zh" ? step.zh : step.en,
    body: language === "zh" ? step.bodyZh : step.bodyEn,
  };
}

export default async function WorldLanguagesPage({ searchParams }: { searchParams?: Promise<PageSearchParams> }) {
  const headersList = await headers();
  const headerLanguage = headersList.get("x-jinming-language");
  const language = resolveInterfaceLanguage(searchParams ? await searchParams : undefined, headerLanguage);
  const copy = languagesPageCopy[language];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "JinMing Lab World Languages",
    itemListElement: worldLanguages.map((language, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: language.name,
      url: `https://vantaapi.com/languages/${language.slug}`,
      description: `${language.name} zero foundation course for ${language.starterGoal}`,
    })),
  };

  return (
    <main className="apple-page pb-16" dir={language === "ar" ? "rtl" : "ltr"} data-interface-language={language}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <section className="mx-auto grid min-h-screen w-[min(1480px,calc(100%_-_28px))] gap-3 py-5 lg:grid-cols-[220px_minmax(0,1fr)]">
        <aside className="dense-panel sticky top-5 h-fit p-3">
          <Link href={localizedHref("/", language)} className="mb-3 flex items-center gap-2 rounded-[8px] p-2 font-semibold">
            <span className="grid h-8 w-8 place-items-center rounded-[8px] bg-slate-950 text-[10px] text-white">JM</span>
            <span>JinMing Lab</span>
          </Link>
          <nav className="grid gap-1 text-sm">
            <Link href={localizedHref("/languages", language)} className="rail-link rail-link-active">
              <span>W</span>
              <strong>{copy.navWorld}</strong>
            </Link>
            <Link href={localizedHref("/tools", language)} className="rail-link">
              <span>T</span>
              <strong>{copy.navTools}</strong>
            </Link>
            <Link href={localizedHref("/programming", language)} className="rail-link">
              <span>C</span>
              <strong>{copy.navProgramming}</strong>
            </Link>
          </nav>
          <div className="mt-3">
            <FlagLanguageToggle initialLanguage={language} />
          </div>
        </aside>

        <section className="min-w-0">
          <section className="dense-panel overflow-hidden p-5 sm:p-6">
            <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px] xl:items-end">
              <div>
                <p className="eyebrow">{copy.eyebrow}</p>
                <h1 className="mt-3 max-w-5xl text-3xl font-semibold leading-[1.04] sm:text-4xl lg:text-5xl">
                  {copy.title}
                </h1>
                <p className="mt-3 max-w-3xl text-sm leading-6 text-[color:var(--muted)]">
                  {copy.body}
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  <Link href={localizedHref("/languages/english", language)} className="dense-action-primary px-4 py-2.5">
                    {copy.english}
                  </Link>
                  <Link href={localizedHref("/languages/japanese", language)} className="dense-action px-4 py-2.5">
                    {copy.japanese}
                  </Link>
                  <Link href={localizedHref("/languages/spanish", language)} className="dense-action px-4 py-2.5">
                    {copy.spanish}
                  </Link>
                </div>
              </div>

              <div className="rounded-[8px] border border-slate-200 bg-white/75 p-4">
                <p className="eyebrow">{copy.orderLabel}</p>
                <div className="mt-3 grid gap-2">
                  {worldLanguageStarterPlan.map((step) => (
                    <div key={step.id} className="dense-row">
                      <span className="text-sm font-semibold">{starterStepText(step, language).title}</span>
                      <span className="truncate text-xs text-[color:var(--muted)]">{starterStepText(step, language).body}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="mt-3 grid gap-3 lg:grid-cols-4">
            {copy.zeroRules.map((rule) => (
              <article key={rule.title} className="dense-card p-5">
                <p className="eyebrow">{rule.eyebrow}</p>
                <h2 className="mt-3 text-xl font-semibold">{rule.title}</h2>
                <p className="mt-3 text-sm leading-6 text-[color:var(--muted)]">{rule.body}</p>
              </article>
            ))}
          </section>

          <section className="mt-3 grid gap-3 xl:grid-cols-[minmax(0,1.08fr)_minmax(320px,0.92fr)]">
            <div className="dense-panel p-5">
              <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="eyebrow">{copy.recommendedEyebrow}</p>
                  <h2 className="mt-2 text-2xl font-semibold">{copy.recommendedTitle}</h2>
                </div>
                <span className="dense-status">{copy.languageCount(worldLanguages.length)}</span>
              </div>
              <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                {featuredLanguages.map((item) => (
                  <LanguageCard key={item.slug} language={item} interfaceLanguage={language} copy={copy} />
                ))}
              </div>
            </div>

            <div className="dense-panel dense-grid-bg p-5">
              <p className="eyebrow text-slate-400">{copy.familiesEyebrow}</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">{copy.familiesTitle}</h2>
              <div className="mt-5 grid gap-2 sm:grid-cols-2">
                {worldLanguageFamilies.map((family) => {
                  const count = worldLanguages.filter((language) => language.family === family).length;
                  return (
                    <div key={family} className="rounded-[8px] border border-white/10 bg-white/[0.07] p-3">
                      <p className="font-semibold text-white">{family}</p>
                      <p className="mt-1 text-xs text-slate-300">{copy.familyCount(count)}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          <WorldLanguageExplorer languages={worldLanguages} families={worldLanguageFamilies} language={language} />
        </section>
      </section>
    </main>
  );
}

function LanguageCard({
  language,
  interfaceLanguage,
  copy,
  compact = false,
}: {
  language: (typeof worldLanguages)[number];
  interfaceLanguage: InterfaceLanguage;
  copy: LanguagesPageCopy;
  compact?: boolean;
}) {
  return (
    <Link href={localizedHref(`/languages/${language.slug}`, interfaceLanguage)} className="dense-card p-4 transition hover:-translate-y-0.5 hover:border-slate-300">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="eyebrow">{language.family}</p>
          <h3 className="mt-1 truncate text-lg font-semibold">{language.name}</h3>
          <p className="mt-1 truncate text-sm text-[color:var(--muted)]">{language.nativeName}</p>
        </div>
        <span className="dense-status">{language.script}</span>
      </div>
      {!compact && (
        <p className="mt-3 line-clamp-2 text-sm leading-6 text-[color:var(--muted)]">
          {copy.cardBody(language.nativeName)}
        </p>
      )}
      <div className="mt-3 flex flex-wrap gap-2">
        {language.firstLesson.slice(0, compact ? 2 : 3).map((item) => (
          <span key={item} className="dense-status">{item}</span>
        ))}
      </div>
    </Link>
  );
}
