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
    title: "Herramientas de auditoria GitHub - JinMing Lab",
    description: "Empieza con audit de lanzamiento GitHub y usa utilidades para prompts API JSON regex timestamps y rutas de programacion.",
    name: "Herramientas AI JinMing Lab",
  },
  fr: {
    title: "Outils audit GitHub - JinMing Lab",
    description: "Commencez par un audit GitHub puis utilisez des outils pour prompts API JSON regex timestamps et parcours de code.",
    name: "Outils AI JinMing Lab",
  },
  de: {
    title: "GitHub Launch Audit Werkzeuge - JinMing Lab",
    description: "Starte mit GitHub Launch Audit und nutze Werkzeuge fuer Prompts API JSON Regex Zeitstempel und Coding Routen.",
    name: "JinMing Lab AI Werkzeuge",
  },
  pt: {
    title: "Ferramentas de auditoria GitHub - JinMing Lab",
    description: "Comece com auditoria GitHub e use ferramentas para prompts API JSON regex timestamps e roteiros de programacao.",
    name: "Ferramentas AI JinMing Lab",
  },
  ru: {
    title: "Инструменты GitHub аудита - JinMing Lab",
    description: "Начните с GitHub launch audit и используйте инструменты для prompts API JSON regex timestamps и маршрутов программирования.",
    name: "AI инструменты JinMing Lab",
  },
  ar: {
    title: "أدوات تدقيق GitHub قبل الإطلاق - JinMing Lab",
    description: "ابدأ بتدقيق GitHub ثم استخدم أدوات للمطالبات و API و JSON و regex والطوابع الزمنية ومسارات البرمجة.",
    name: "أدوات JinMing Lab AI",
  },
  hi: {
    title: "GitHub लॉन्च ऑडिट टूल्स - JinMing Lab",
    description: "GitHub launch audit से शुरू करें और prompts API JSON regex timestamps और coding roadmap tools इस्तेमाल करें.",
    name: "JinMing Lab AI टूल्स",
  },
  id: {
    title: "Alat audit rilis GitHub - JinMing Lab",
    description: "Mulai dengan audit rilis GitHub lalu gunakan alat prompt API JSON regex timestamp dan roadmap coding.",
    name: "Alat AI JinMing Lab",
  },
  vi: {
    title: "Cong cu kiem tra GitHub - JinMing Lab",
    description: "Bat dau voi audit GitHub roi dung cong cu prompt API JSON regex timestamp va lo trinh coding.",
    name: "Cong cu AI JinMing Lab",
  },
  th: {
    title: "เครื่องมือตรวจ GitHub ก่อนปล่อย - JinMing Lab",
    description: "เริ่มจาก GitHub launch audit แล้วใช้เครื่องมือ prompt API JSON regex timestamp และ coding roadmap",
    name: "เครื่องมือ AI JinMing Lab",
  },
  tr: {
    title: "GitHub yayin denetim araclari - JinMing Lab",
    description: "GitHub launch audit ile basla ve prompt API JSON regex timestamp coding roadmap araclarini kullan.",
    name: "JinMing Lab AI araclari",
  },
  it: {
    title: "Strumenti audit GitHub - JinMing Lab",
    description: "Inizia con audit GitHub e usa strumenti per prompt API JSON regex timestamp e percorsi coding.",
    name: "Strumenti AI JinMing Lab",
  },
  nl: {
    title: "GitHub launch audit tools - JinMing Lab",
    description: "Start met GitHub launch audit en gebruik tools voor prompts API JSON regex timestamps en coding routes.",
    name: "JinMing Lab AI tools",
  },
  pl: {
    title: "Narzędzia audytu GitHub - JinMing Lab",
    description: "Zacznij od GitHub launch audit i uzyj narzedzi do promptow API JSON regex timestamp oraz tras kodowania.",
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
