import type { Metadata } from "next";
import ToolWorkbench from "@/components/tools/ToolWorkbench";
import { localizedHref, localizedLanguageAlternates, resolveInterfaceLanguage, type InterfaceLanguage, type PageSearchParams } from "@/lib/language";
import { toolDefinitions } from "@/lib/tool-definitions";

const toolsMetaCopy: Record<InterfaceLanguage, { title: string; description: string; name: string }> = {
  en: {
    title: "GitHub Launch Audit Tools - JinMing Lab",
    description: "Start with a GitHub launch-readiness audit, then use focused developer utilities for prompts, API requests, JSON, regex, timestamps, and coding roadmaps.",
    name: "JinMing Lab AI Tools",
  },
  zh: {
    title: "GitHub 上线体检工具 - JinMing Lab",
    description: "先做 GitHub 上线体检，再使用提示词、API 请求、JSON、正则、时间戳和编程路线工具。",
    name: "JinMing Lab AI 工具",
  },
  ja: {
    title: "GitHub 公開前診断ツール - JinMing Lab",
    description: "GitHub 公開前診断から始め、プロンプト、API、JSON、正規表現、時間、学習ルートを整理します。",
    name: "JinMing Lab AI ツール",
  },
  ko: {
    title: "GitHub 출시 점검 도구 - JinMing Lab",
    description: "GitHub 출시 점검부터 시작해 프롬프트 API JSON 정규식 타임스탬프와 코딩 로드맵을 정리합니다.",
    name: "JinMing Lab AI 도구",
  },
  es: {
    title: "Herramientas de auditoría GitHub - JinMing Lab",
    description: "Empieza con una auditoría de lanzamiento GitHub y usa utilidades para prompts, API, JSON, regex, timestamps y rutas de programación.",
    name: "Herramientas AI JinMing Lab",
  },
  fr: {
    title: "Outils d’audit GitHub - JinMing Lab",
    description: "Commencez par un audit GitHub puis utilisez des outils pour prompts, API, JSON, regex, timestamps et parcours de code.",
    name: "Outils AI JinMing Lab",
  },
  de: {
    title: "GitHub Startprüfung Werkzeuge - JinMing Lab",
    description: "Starte mit einer GitHub Startprüfung und nutze Werkzeuge für Prompts, API Requests, JSON, Regex, Zeitstempel und Programmierwege.",
    name: "JinMing Lab KI Werkzeuge",
  },
  pt: {
    title: "Ferramentas de auditoria GitHub - JinMing Lab",
    description: "Comece com auditoria GitHub e use ferramentas para prompts, API, JSON, regex, timestamps e roteiros de programação.",
    name: "Ferramentas AI JinMing Lab",
  },
  ru: {
    title: "Инструменты GitHub аудита - JinMing Lab",
    description: "Начните с аудита запуска GitHub и используйте инструменты для prompt, API, JSON, regex, timestamp и маршрутов программирования.",
    name: "AI инструменты JinMing Lab",
  },
  ar: {
    title: "أدوات تدقيق GitHub قبل الإطلاق - JinMing Lab",
    description: "ابدأ بتدقيق GitHub ثم استخدم أدوات للمطالبات و API و JSON و regex والطوابع الزمنية ومسارات البرمجة.",
    name: "أدوات JinMing Lab AI",
  },
  hi: {
    title: "GitHub लॉन्च जांच उपकरण - JinMing Lab",
    description: "GitHub लॉन्च जांच से शुरू करें और prompt, API, JSON, regex, timestamp तथा coding roadmap उपकरण इस्तेमाल करें.",
    name: "JinMing Lab AI उपकरण",
  },
  id: {
    title: "Alat audit rilis GitHub - JinMing Lab",
    description: "Mulai dengan audit rilis GitHub lalu gunakan alat prompt API JSON regex timestamp dan roadmap coding.",
    name: "Alat AI JinMing Lab",
  },
  vi: {
    title: "Công cụ kiểm tra GitHub - JinMing Lab",
    description: "Bắt đầu với kiểm tra GitHub rồi dùng công cụ prompt, API, JSON, regex, timestamp và lộ trình code.",
    name: "Công cụ AI JinMing Lab",
  },
  th: {
    title: "เครื่องมือตรวจ GitHub ก่อนปล่อย - JinMing Lab",
    description: "เริ่มจาก GitHub launch audit แล้วใช้เครื่องมือ prompt API JSON regex timestamp และ coding roadmap",
    name: "เครื่องมือ AI JinMing Lab",
  },
  tr: {
    title: "GitHub yayın denetim araçları - JinMing Lab",
    description: "GitHub yayın denetimiyle başla ve prompt, API, JSON, regex, timestamp, coding roadmap araçlarını kullan.",
    name: "JinMing Lab AI araçları",
  },
  it: {
    title: "Strumenti audit GitHub - JinMing Lab",
    description: "Inizia con audit GitHub e usa strumenti per prompt, API, JSON, regex, timestamp e percorsi coding.",
    name: "Strumenti AI JinMing Lab",
  },
  nl: {
    title: "GitHub publicatiecontrole gereedschap - JinMing Lab",
    description: "Start met GitHub publicatiecontrole en gebruik gereedschap voor prompts, API requests, JSON, regex, timestamps en programmeerroutes.",
    name: "JinMing Lab AI gereedschap",
  },
  pl: {
    title: "Narzędzia audytu publikacji GitHub - JinMing Lab",
    description: "Zacznij od audytu publikacji GitHub i użyj narzędzi do promptów, API, JSON, regex, timestamp oraz ścieżek kodowania.",
    name: "AI narzędzia JinMing Lab",
  },
};

export async function generateMetadata({ searchParams }: { searchParams?: Promise<PageSearchParams> }): Promise<Metadata> {
  const language = resolveInterfaceLanguage(searchParams ? await searchParams : undefined);
  const meta = toolsMetaCopy[language];

  return {
    title: meta.title,
    description: meta.description,
    alternates: {
      canonical: localizedHref("/tools", language),
      languages: localizedLanguageAlternates("/tools"),
    },
    openGraph: {
      title: meta.title,
      description: meta.description,
      url: "https://vantaapi.com/tools",
      siteName: "JinMing Lab",
      type: "website",
    },
    twitter: {
      card: "summary",
      title: meta.title,
      description: meta.description,
    },
  };
}

export default async function ToolsPage({ searchParams }: { searchParams?: Promise<PageSearchParams> }) {
  const language = resolveInterfaceLanguage(searchParams ? await searchParams : undefined);
  const meta = toolsMetaCopy[language];
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: meta.name,
    itemListElement: toolDefinitions.map((tool, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: tool.title,
      url: `https://vantaapi.com/tools/${tool.slug}`,
      description: tool.description,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ToolWorkbench initialSlug="github-repo-analyzer" initialLanguage={language} />
    </>
  );
}
