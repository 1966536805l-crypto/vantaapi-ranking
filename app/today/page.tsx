import type { Metadata } from "next";
import TodayStudyPlan from "@/components/home/TodayStudyPlan";
import { AppleStudyHeader } from "@/components/learning/ModuleHub";
import { examVocabularyPacks } from "@/lib/exam-content";
import {
  localizedHref,
  localizedLanguageAlternates,
  resolveInterfaceLanguage,
  type InterfaceLanguage,
  type PageSearchParams,
} from "@/lib/language";
import { originalQuestionPacks, originalReadingPacks } from "@/lib/original-english-bank";

const todayMetadataCopy: Record<InterfaceLanguage, { title: string; description: string; openGraphDescription: string }> = {
  en: {
    title: "Today Learning Plan",
    description: "A daily review queue for vocabulary typing reading questions streaks and local progress.",
    openGraphDescription: "Open one focused page for today's vocabulary review typing drill reading task and question bank.",
  },
  zh: {
    title: "今日学习计划",
    description: "每日复习队列，整合词汇、打字、阅读、题库、连续学习和本地进度。",
    openGraphDescription: "打开一个聚焦页面，完成今天的词汇复习、打字听写、阅读任务和题库练习。",
  },
  ja: {
    title: "今日の学習計画",
    description: "語彙、タイピング、読解、問題、連続学習、ローカル進捗をまとめた毎日の復習キュー。",
    openGraphDescription: "今日の語彙復習、タイピング練習、読解タスク、問題演習を一つの画面で進められます。",
  },
  ko: {
    title: "오늘 학습 계획",
    description: "단어, 타이핑, 읽기, 문제, 연속 학습, 로컬 진도를 한곳에 모은 일일 복습 큐입니다.",
    openGraphDescription: "오늘의 단어 복습, 타이핑 훈련, 읽기 과제, 문제 풀이를 한 화면에서 시작하세요.",
  },
  es: {
    title: "Plan de estudio de hoy",
    description: "Una cola diaria para repasar vocabulario, escritura, lectura, preguntas, rachas y progreso local.",
    openGraphDescription: "Abre una pagina enfocada para el repaso de vocabulario, escritura, lectura y preguntas de hoy.",
  },
  fr: {
    title: "Plan d'apprentissage du jour",
    description: "Une file quotidienne pour reviser le vocabulaire, la frappe, la lecture, les questions, les series et la progression locale.",
    openGraphDescription: "Ouvrez une page concentree pour le vocabulaire, la dictee, la lecture et les exercices du jour.",
  },
  de: {
    title: "Lernplan fur heute",
    description: "Eine tagliche Wiederholungsliste fur Wortschatz, Tippen, Lesen, Fragen, Streaks und lokalen Fortschritt.",
    openGraphDescription: "Offne eine fokussierte Seite fur heutigen Wortschatz, Tipptraining, Lesen und Fragen.",
  },
  pt: {
    title: "Plano de estudo de hoje",
    description: "Uma fila diaria para revisar vocabulario, digitacao, leitura, perguntas, sequencia e progresso local.",
    openGraphDescription: "Abra uma pagina focada para o vocabulario, treino de digitacao, leitura e perguntas de hoje.",
  },
  ru: {
    title: "План обучения на сегодня",
    description: "Ежедневная очередь повторения для словаря, набора, чтения, вопросов, серии занятий и локального прогресса.",
    openGraphDescription: "Откройте одну страницу для повторения слов, тренировки набора, чтения и вопросов на сегодня.",
  },
  ar: {
    title: "خطة تعلم اليوم",
    description: "قائمة مراجعة يومية تجمع المفردات والكتابة والقراءة والأسئلة والاستمرارية والتقدم المحلي.",
    openGraphDescription: "افتح صفحة مركزة لمراجعة مفردات اليوم وتدريب الكتابة والقراءة والأسئلة.",
  },
  hi: {
    title: "आज की सीखने की योजना",
    description: "शब्दावली, टाइपिंग, पढ़ाई, प्रश्न, streaks और local progress के लिए daily review queue.",
    openGraphDescription: "आज के शब्द अभ्यास, typing drill, reading task और question bank को एक focused page में खोलें.",
  },
  id: {
    title: "Rencana belajar hari ini",
    description: "Antrian ulasan harian untuk kosakata, mengetik, membaca, soal, streak, dan progres lokal.",
    openGraphDescription: "Buka satu halaman fokus untuk kosakata, latihan mengetik, bacaan, dan soal hari ini.",
  },
  vi: {
    title: "Ke hoach hoc hom nay",
    description: "Hang doi on tap moi ngay cho tu vung, go chu, doc hieu, cau hoi, chuoi hoc va tien do cuc bo.",
    openGraphDescription: "Mo mot trang tap trung cho tu vung, luyen go, bai doc va ngan hang cau hoi hom nay.",
  },
  th: {
    title: "แผนการเรียนวันนี้",
    description: "คิวทบทวนรายวันสำหรับคำศัพท์ การพิมพ์ การอ่าน คำถาม สถิติการเรียนต่อเนื่อง และความคืบหน้าในเครื่อง",
    openGraphDescription: "เปิดหน้าเดียวเพื่อทบทวนคำศัพท์ ฝึกพิมพ์ อ่านบทความ และทำคำถามของวันนี้",
  },
  tr: {
    title: "Bugunun calisma plani",
    description: "Kelime, yazma, okuma, sorular, seri ve yerel ilerleme icin gunluk tekrar sirasi.",
    openGraphDescription: "Bugunun kelime tekrari, yazma alistirmasi, okuma gorevi ve soru bankasi icin tek odakli sayfa.",
  },
  it: {
    title: "Piano di studio di oggi",
    description: "Una coda giornaliera per lessico, digitazione, lettura, domande, serie e progresso locale.",
    openGraphDescription: "Apri una pagina concentrata per lessico, dettato, lettura e domande di oggi.",
  },
  nl: {
    title: "Leerplan voor vandaag",
    description: "Een dagelijkse wachtrij voor woordenschat, typen, lezen, vragen, streaks en lokale voortgang.",
    openGraphDescription: "Open een gerichte pagina voor woordenschat, typtraining, lezen en vragen van vandaag.",
  },
  pl: {
    title: "Dzisiejszy plan nauki",
    description: "Codzienna kolejka powtorek dla slownictwa, pisania, czytania, pytan, serii i lokalnych postepow.",
    openGraphDescription: "Otworz jedna skupiona strone dla slownictwa, pisania, czytania i pytan na dzis.",
  },
};

export async function generateMetadata({
  searchParams,
}: {
  searchParams?: Promise<PageSearchParams>;
}): Promise<Metadata> {
  const language = resolveInterfaceLanguage(searchParams ? await searchParams : undefined);
  const copy = todayMetadataCopy[language];
  const canonical = localizedHref("/today", language);

  return {
    title: `${copy.title} - JinMing Lab`,
    description: copy.description,
    alternates: {
      canonical,
      languages: localizedLanguageAlternates("/today"),
    },
    openGraph: {
      title: `${copy.title} - JinMing Lab`,
      description: copy.openGraphDescription,
      url: `https://vantaapi.com${canonical}`,
      siteName: "JinMing Lab",
      type: "website",
    },
  };
}

export default async function TodayPage({
  searchParams,
}: {
  searchParams?: Promise<PageSearchParams>;
}) {
  const language = resolveInterfaceLanguage(searchParams ? await searchParams : undefined);
  const packs = examVocabularyPacks.map((pack) => ({
    slug: pack.slug,
    shortTitle: pack.shortTitle,
    level: pack.level,
    route: pack.route,
    words: pack.priorityWords.map((word) => ({
      word: word.word,
      meaningZh: word.meaningZh,
      collocation: word.collocation,
    })),
  }));

  return (
    <main className="apple-page pb-12 pt-4">
      <AppleStudyHeader language={language} />
      <TodayStudyPlan
        initialLanguage={language}
        packs={packs}
        readingPacks={originalReadingPacks}
        questionPacks={originalQuestionPacks.map((pack) => ({
          slug: pack.slug,
          title: pack.title,
          zhTitle: pack.zhTitle,
          level: pack.level,
        }))}
      />
    </main>
  );
}
