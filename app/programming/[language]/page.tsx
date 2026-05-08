import { notFound } from "next/navigation";
import ProgrammingTrainer from "@/components/learning/ProgrammingTrainer";
import { localizedHref, localizedLanguageAlternates, resolveInterfaceLanguage, type InterfaceLanguage, type PageSearchParams } from "@/lib/language";
import { getProgrammingLanguage, programmingLanguages } from "@/lib/programming-content";

type ProgrammingLanguagePageProps = {
  params: Promise<{ language: string }>;
  searchParams?: Promise<PageSearchParams>;
};

export function generateStaticParams() {
  return programmingLanguages.map((language) => ({ language: language.slug }));
}

type ProgrammingMetadataCopy = {
  title: (name: string) => string;
  description: (name: string) => string;
  fallback: string;
};

const englishMetadataCopy: ProgrammingMetadataCopy = {
  title: (name: string) => `${name} Coding Practice - JinMing Lab`,
  description: (name: string) => `${name} tutorials original exercises runnable examples hints answers and keyboard shortcuts`,
  fallback: "Code Practice - JinMing Lab",
};

const metadataCopy: Partial<Record<InterfaceLanguage, ProgrammingMetadataCopy>> = {
  en: englishMetadataCopy,
  zh: {
    title: (name: string) => `${name} 编程训练 - JinMing Lab`,
    description: (name: string) => `${name} 教程 原创练习 可运行示例 提示 答案和快捷键`,
    fallback: "编程训练 - JinMing Lab",
  },
  ja: {
    title: (name: string) => `${name} コーディング練習 - JinMing Lab`,
    description: (name: string) => `${name} の教程 オリジナル練習 実行例 ヒント 解答 ショートカット`,
    fallback: "コーディング練習 - JinMing Lab",
  },
  ko: {
    title: (name: string) => `${name} 코딩 연습 - JinMing Lab`,
    description: (name: string) => `${name} 튜토리얼 오리지널 문제 실행 예시 힌트 답안 단축키`,
    fallback: "코딩 연습 - JinMing Lab",
  },
  es: {
    title: (name: string) => `${name} practica de codigo - JinMing Lab`,
    description: (name: string) => `${name} tutoriales ejercicios originales ejemplos pistas respuestas y atajos`,
    fallback: "Practica de codigo - JinMing Lab",
  },
  fr: {
    title: (name: string) => `${name} pratique du code - JinMing Lab`,
    description: (name: string) => `${name} tutoriels exercices originaux exemples indices reponses et raccourcis`,
    fallback: "Pratique du code - JinMing Lab",
  },
  de: {
    title: (name: string) => `${name} Coding Praxis - JinMing Lab`,
    description: (name: string) => `${name} Tutorials originale Übungen lauffähige Beispiele Hinweise Antworten und Tastenkürzel`,
    fallback: "Coding Praxis - JinMing Lab",
  },
  pt: {
    title: (name: string) => `${name} prática de código - JinMing Lab`,
    description: (name: string) => `${name} tutoriais exercícios originais exemplos executáveis dicas respostas e atalhos`,
    fallback: "Prática de código - JinMing Lab",
  },
  ru: {
    title: (name: string) => `${name} практика кода - JinMing Lab`,
    description: (name: string) => `${name} уроки оригинальные задания запускаемые примеры подсказки ответы и горячие клавиши`,
    fallback: "Практика кода - JinMing Lab",
  },
  ar: {
    title: (name: string) => `تدريب ${name} البرمجي - JinMing Lab`,
    description: (name: string) => `دروس ${name} وتمارين أصلية وأمثلة قابلة للتشغيل وتلميحات وإجابات واختصارات`,
    fallback: "تدريب البرمجة - JinMing Lab",
  },
  hi: {
    title: (name: string) => `${name} कोड अभ्यास - JinMing Lab`,
    description: (name: string) => `${name} tutorial original exercises runnable examples hints answers और shortcuts`,
    fallback: "कोड अभ्यास - JinMing Lab",
  },
  id: {
    title: (name: string) => `${name} latihan kode - JinMing Lab`,
    description: (name: string) => `${name} tutorial latihan orisinal contoh yang bisa dijalankan petunjuk jawaban dan pintasan`,
    fallback: "Latihan kode - JinMing Lab",
  },
  vi: {
    title: (name: string) => `${name} luyện code - JinMing Lab`,
    description: (name: string) => `${name} hướng dẫn bài tập gốc ví dụ chạy được gợi ý đáp án và phím tắt`,
    fallback: "Luyện code - JinMing Lab",
  },
  th: {
    title: (name: string) => `ฝึกเขียน ${name} - JinMing Lab`,
    description: (name: string) => `บทเรียน ${name} แบบฝึกต้นฉบับ ตัวอย่างรันได้ คำใบ้ คำตอบ และปุ่มลัด`,
    fallback: "ฝึกเขียนโค้ด - JinMing Lab",
  },
  tr: {
    title: (name: string) => `${name} kod pratiği - JinMing Lab`,
    description: (name: string) => `${name} dersleri özgün alıştırmalar çalıştırılabilir örnekler ipuçları cevaplar ve kısayollar`,
    fallback: "Kod pratiği - JinMing Lab",
  },
  it: {
    title: (name: string) => `${name} pratica di codice - JinMing Lab`,
    description: (name: string) => `${name} tutorial esercizi originali esempi eseguibili indizi risposte e scorciatoie`,
    fallback: "Pratica di codice - JinMing Lab",
  },
  nl: {
    title: (name: string) => `${name} code oefenen - JinMing Lab`,
    description: (name: string) => `${name} tutorials originele oefeningen uitvoerbare voorbeelden hints antwoorden en sneltoetsen`,
    fallback: "Code oefenen - JinMing Lab",
  },
  pl: {
    title: (name: string) => `${name} ćwiczenia kodu - JinMing Lab`,
    description: (name: string) => `${name} tutoriale oryginalne ćwiczenia przykłady do uruchomienia podpowiedzi odpowiedzi i skróty`,
    fallback: "Ćwiczenia kodu - JinMing Lab",
  },
};

export async function generateMetadata({ params, searchParams }: ProgrammingLanguagePageProps) {
  const { language } = await params;
  const current = programmingLanguages.find((item) => item.slug === language);
  const siteLanguage = resolveInterfaceLanguage(searchParams ? await searchParams : undefined);
  const copy = metadataCopy[siteLanguage] || englishMetadataCopy;
  if (!current) {
    return {
      title: copy.fallback,
    };
  }
  const path = `/programming/${current.slug}`;
  return {
    title: copy.title(current.title),
    description: copy.description(current.title),
    alternates: {
      canonical: localizedHref(path, siteLanguage),
      languages: localizedLanguageAlternates(path),
    },
  };
}

export default async function ProgrammingLanguagePage({ params, searchParams }: ProgrammingLanguagePageProps) {
  const { language } = await params;
  const current = programmingLanguages.find((item) => item.slug === language);
  if (!current) notFound();
  const siteLanguage = resolveInterfaceLanguage(searchParams ? await searchParams : undefined);

  return <ProgrammingTrainer initialLanguageSlug={getProgrammingLanguage(language).slug} initialSiteLanguage={siteLanguage} />;
}
