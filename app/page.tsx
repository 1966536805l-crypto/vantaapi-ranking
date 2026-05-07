import Link from "next/link";
import type { Metadata } from "next";
import { getServerUser } from "@/lib/server-auth";
import { localizedHref, type SiteLanguage } from "@/lib/language";
import { worldLanguages } from "@/lib/world-language-content";

export const metadata: Metadata = {
  title: "JinMing Lab - GitHub 项目上线前体检 AI 工具",
  description:
    "JinMing Lab 提供 GitHub 项目上线前体检，自动整理 README、环境变量、部署、安全、SEO、CI 和发布清单，并保留英语学习与编程训练入口。",
  keywords: ["GitHub 项目体检", "上线前检查", "AI 工具", "README 检查", "部署检查", "安全检查", "编程学习"],
};

type HomeSearchParams = Promise<{ ui?: string | string[]; lang?: string | string[] }>;

type HomeCopy = {
  version: string;
  versions: string;
  tools: string;
  coding: string;
  english: string;
  roadmap: string;
  login: string;
  logout: string;
  admin: string;
  eyebrow: string;
  title: string;
  description: string;
  primaryCta: string;
  secondaryCta: string;
  tertiaryCta: string;
  focus: string;
  ready: string;
  cards: Array<{
    href: string;
    eyebrow: string;
    title: string;
    body: string;
    points: string[];
  }>;
};

const siteVersionSlugs = ["chinese", "english", "japanese", "korean", "spanish", "french"];

const homeCopy: Record<string, HomeCopy> = {
  chinese: {
    version: "版本",
    versions: "语言版本",
    tools: "发布体检",
    coding: "编程训练",
    english: "英语学习",
    roadmap: "发布清单",
    login: "登录",
    logout: "退出",
    admin: "后台",
    eyebrow: "GitHub 项目上线前体检",
    title: "JinMing Lab",
    description: "把 GitHub 仓库丢进来，快速得到上线前修复清单：README、环境变量、部署、CI、安全、SEO、半成品入口和发布步骤。英语学习和编程训练保留为长期训练入口。",
    primaryCta: "检查 GitHub 项目",
    secondaryCta: "进入编程训练",
    tertiaryCta: "开始英语训练",
    focus: "体检范围",
    ready: "可用",
    cards: [
      {
        href: "/tools/github-repo-analyzer",
        eyebrow: "主工具",
        title: "GitHub 上线体检",
        body: "检查仓库是否像正式项目：README、env 示例、临时文件、部署配置、CI、SEO、安全提示和发布 checklist。",
        points: ["README", "env 风险", "部署清单"],
      },
      {
        href: "/programming",
        eyebrow: "训练",
        title: "编程训练",
        body: "从 Python、JavaScript、C++ 开始，按语言、主题和题型组织练习。先理解，再动手，再复盘。",
        points: ["零基础", "分类练习", "实操复盘"],
      },
      {
        href: "/english?lang=zh",
        eyebrow: "长期训练",
        title: "英语学习",
        body: "把背词、听写、打字和短阅读做成连续训练。每次练习只给必要提示，错题自动沉淀到复习路径。",
        points: ["词汇训练", "打字听写", "错题复习"],
      },
    ],
  },
  english: {
    version: "Version",
    versions: "Site Versions",
    tools: "Launch Audit",
    coding: "Coding Practice",
    english: "English Learning",
    roadmap: "Release Checklist",
    login: "Login",
    logout: "Logout",
    admin: "Admin",
    eyebrow: "GitHub Launch Readiness Audit",
    title: "JinMing Lab",
    description: "Paste a GitHub repository and get the launch work developers usually miss: README gaps, env files, deployment clues, CI, security notes, SEO basics, unfinished entry points, and a release checklist.",
    primaryCta: "Audit GitHub Repo",
    secondaryCta: "Start Coding Practice",
    tertiaryCta: "Start English",
    focus: "Audit Scope",
    ready: "Ready",
    cards: [
      {
        href: "/tools/github-repo-analyzer",
        eyebrow: "Main Tool",
        title: "GitHub Launch Audit",
        body: "Check whether a repository looks ready to ship: README, env examples, temp files, deployment, CI, security notes, SEO basics, and release steps.",
        points: ["README", "env risk", "release list"],
      },
      {
        href: "/programming",
        eyebrow: "Practice",
        title: "Coding Practice",
        body: "Beginner friendly coding practice organized by language, topic, question type, hints, answers, and code explanation.",
        points: ["Beginner friendly", "Classified drills", "Code explain"],
      },
      {
        href: "/english?lang=zh",
        eyebrow: "Long Term",
        title: "English Learning",
        body: "Curated vocabulary, typing, reading, and mistake review. AI Coach explains words, sentence logic, and the next practice step.",
        points: ["Vocabulary", "Typing", "Review"],
      },
    ],
  },
  japanese: {
    version: "バージョン",
    versions: "言語バージョン",
    tools: "AI ツール",
    coding: "コード練習",
    english: "英語学習",
    roadmap: "学習ロードマップ",
    login: "ログイン",
    logout: "ログアウト",
    admin: "管理",
    eyebrow: "AI ツール & コードラボ",
    title: "JinMing Lab",
    description: "初心者と個人開発者向けの AI ツールとコード練習プラットフォームです。明確なプロンプト、速いコード理解、体系的な練習ルートで学習と開発を進めます。",
    primaryCta: "AI ツールを開く",
    secondaryCta: "コード練習を始める",
    tertiaryCta: "ロードマップを作る",
    focus: "ホームの重点",
    ready: "利用可能",
    cards: [
      { href: "/tools", eyebrow: "ツール", title: "AI ツール", body: "プロンプト改善、コード説明、バグ分析、API リクエスト生成、開発ユーティリティをまとめています。", points: ["Prompt", "Code", "Bug"] },
      { href: "/programming", eyebrow: "練習", title: "コード練習", body: "初心者向けに言語、テーマ、問題形式、ヒント、解答を整理した練習入口です。", points: ["初心者向け", "分類練習", "AI 補助"] },
      { href: "/tools/learning-roadmap", eyebrow: "計画", title: "学習ロードマップ", body: "フロントエンド、Python、自動化、個人開発の実行しやすい学習ルートを作ります。", points: ["段階目標", "毎日の課題", "更新中"] },
    ],
  },
  korean: {
    version: "버전",
    versions: "언어 버전",
    tools: "AI 도구",
    coding: "코딩 연습",
    english: "영어 학습",
    roadmap: "학습 로드맵",
    login: "로그인",
    logout: "로그아웃",
    admin: "관리",
    eyebrow: "AI 도구 & 코딩 랩",
    title: "JinMing Lab",
    description: "초보 학습자와 독립 개발자를 위한 AI 도구 및 코딩 연습 플랫폼입니다. 더 명확한 프롬프트, 빠른 코드 이해, 체계적인 연습 경로로 학습과 개발을 이어갑니다.",
    primaryCta: "AI 도구 열기",
    secondaryCta: "코딩 연습 시작",
    tertiaryCta: "로드맵 만들기",
    focus: "홈 핵심",
    ready: "사용 가능",
    cards: [
      { href: "/tools", eyebrow: "도구", title: "AI 도구", body: "프롬프트 개선, 코드 설명, 버그 분석, API 요청 생성, 개발 유틸리티를 제공합니다.", points: ["Prompt", "Code", "Bug"] },
      { href: "/programming", eyebrow: "연습", title: "코딩 연습", body: "초보자도 시작할 수 있게 언어, 주제, 문제 유형, 힌트, 답안을 정리했습니다.", points: ["초보 친화", "분류 연습", "AI 보조"] },
      { href: "/tools/learning-roadmap", eyebrow: "계획", title: "학습 로드맵", body: "프론트엔드, Python, 자동화, 독립 개발을 위한 실천 가능한 학습 경로를 만듭니다.", points: ["단계 목표", "일일 과제", "업데이트 중"] },
    ],
  },
  spanish: {
    version: "Versión",
    versions: "Versiones",
    tools: "Herramientas IA",
    coding: "Práctica de código",
    english: "Inglés",
    roadmap: "Ruta de aprendizaje",
    login: "Entrar",
    logout: "Salir",
    admin: "Admin",
    eyebrow: "Herramientas IA & Laboratorio de código",
    title: "JinMing Lab",
    description: "Una plataforma de herramientas IA y práctica de código para principiantes y desarrolladores independientes. Usa prompts más claros, lectura de código más rápida y rutas de práctica estructuradas.",
    primaryCta: "Abrir herramientas IA",
    secondaryCta: "Empezar código",
    tertiaryCta: "Crear ruta",
    focus: "Enfoque",
    ready: "Listo",
    cards: [
      { href: "/tools", eyebrow: "Herramientas", title: "Herramientas IA", body: "Optimización de prompts, explicación de código, diagnóstico de bugs, generación de requests API y utilidades de desarrollo.", points: ["Prompt", "Código", "Bug"] },
      { href: "/programming", eyebrow: "Práctica", title: "Práctica de código", body: "Entrenamiento organizado por lenguaje, tema, tipo de pregunta, pistas y respuestas para empezar desde cero.", points: ["Desde cero", "Clasificado", "IA asistida"] },
      { href: "/tools/learning-roadmap", eyebrow: "Plan", title: "Ruta de aprendizaje", body: "Crea rutas prácticas para frontend, Python, automatización y productos independientes.", points: ["Hitos", "Tareas diarias", "En expansión"] },
    ],
  },
  french: {
    version: "Version",
    versions: "Versions",
    tools: "Outils IA",
    coding: "Pratique code",
    english: "Anglais",
    roadmap: "Parcours",
    login: "Connexion",
    logout: "Sortir",
    admin: "Admin",
    eyebrow: "Outils IA & Laboratoire code",
    title: "JinMing Lab",
    description: "Une plateforme d outils IA et de pratique du code pour débutants et développeurs indépendants. Utilisez des prompts plus clairs, une lecture de code plus rapide et des parcours structurés.",
    primaryCta: "Ouvrir les outils IA",
    secondaryCta: "Commencer le code",
    tertiaryCta: "Créer un parcours",
    focus: "Focus",
    ready: "Prêt",
    cards: [
      { href: "/tools", eyebrow: "Outils", title: "Outils IA", body: "Optimisation de prompts, explication de code, diagnostic de bugs, génération de requêtes API et utilitaires développeur.", points: ["Prompt", "Code", "Bug"] },
      { href: "/programming", eyebrow: "Pratique", title: "Pratique code", body: "Exercices organisés par langage, thème, type de question, indices et réponses pour débutants.", points: ["Débutant", "Classé", "IA assistée"] },
      { href: "/tools/learning-roadmap", eyebrow: "Plan", title: "Parcours", body: "Générez des routes pratiques pour frontend, Python, automatisation et projets indépendants.", points: ["Étapes", "Tâches", "Mise à jour"] },
    ],
  },
};

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function getSelectedUi(rawUi: string | string[] | undefined) {
  const ui = firstParam(rawUi);
  return ui && siteVersionSlugs.includes(ui) ? ui : "chinese";
}

function getSiteLanguage(selectedUi: string, rawLanguage?: string | string[]): SiteLanguage {
  const language = firstParam(rawLanguage);
  if (language === "zh" || language === "en") return language;
  return selectedUi === "chinese" ? "zh" : "en";
}

function homeHref(ui: string) {
  const language = ui === "chinese" ? "zh" : "en";
  return ui === "chinese" ? "/?lang=zh" : `/?ui=${ui}&lang=${language}`;
}

export default async function HomePage({ searchParams }: { searchParams: HomeSearchParams }) {
  const user = await getServerUser();
  const params = await searchParams;
  const selectedUi = getSelectedUi(params?.ui);
  const siteLanguage = getSiteLanguage(selectedUi, params?.lang);
  const copy = homeCopy[selectedUi] ?? homeCopy.chinese;

  return (
    <main className="apple-page home-core-page">
      <div className="study-desk-shell grid min-h-screen grid-cols-[76px_minmax(0,1fr)] gap-3 py-5 sm:grid-cols-[112px_minmax(0,1fr)] lg:grid-cols-[152px_minmax(0,1fr)] lg:gap-4">
        <HomeRail copy={copy} isAdmin={user?.role === "ADMIN"} language={siteLanguage} />

        <section className="min-w-0">
          <TopBar
            copy={copy}
            isAdmin={user?.role === "ADMIN"}
            isSignedIn={Boolean(user)}
            selectedUi={selectedUi}
            language={siteLanguage}
          />

          <section className="mt-3 dense-panel overflow-hidden p-5 sm:p-7">
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-end">
              <div>
                <p className="eyebrow">{copy.eyebrow}</p>
                <h1 className="mt-3 max-w-4xl text-4xl font-semibold leading-[1.02] tracking-normal sm:text-5xl lg:text-6xl">
                  {copy.title}
                </h1>
                <p className="mt-4 max-w-2xl text-sm leading-6 text-[color:var(--muted)]">
                  {copy.description}
                </p>
                <div className="mt-6 flex flex-wrap gap-2">
                  <Link href={localizedHref("/tools/github-repo-analyzer", siteLanguage)} className="dense-action-primary px-4 py-2.5">
                    {copy.primaryCta}
                  </Link>
                  <Link href={localizedHref("/programming", siteLanguage)} className="dense-action px-4 py-2.5">
                    {copy.secondaryCta}
                  </Link>
                  <Link href={localizedHref("/english", siteLanguage)} className="dense-action px-4 py-2.5">
                    {copy.tertiaryCta}
                  </Link>
                </div>
              </div>

              <div className="rounded-[8px] border border-slate-200 bg-white/75 p-4">
                <p className="eyebrow">{copy.focus}</p>
                <div className="mt-3 grid gap-2">
                  {[copy.tools, copy.coding, copy.english].map((item) => (
                    <span key={item} className="dense-row">
                      <span className="text-sm font-semibold">{item}</span>
                      <span className="text-xs text-[color:var(--muted)]">{copy.ready}</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="mt-3 grid gap-3 lg:grid-cols-3">
            {copy.cards.map((card) => (
              <Link key={card.href} href={localizedHref(card.href, siteLanguage)} className="dense-card p-5 transition hover:-translate-y-0.5 hover:border-slate-300">
                <p className="eyebrow">{card.eyebrow}</p>
                <h2 className="mt-2 text-2xl font-semibold">{card.title}</h2>
                <p className="mt-3 min-h-24 text-sm leading-6 text-[color:var(--muted)]">{card.body}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {card.points.map((point) => (
                    <span key={point} className="dense-status">
                      {point}
                    </span>
                  ))}
                </div>
              </Link>
            ))}
          </section>
        </section>
      </div>
    </main>
  );
}

function HomeRail({ copy, isAdmin, language }: { copy: HomeCopy; isAdmin: boolean; language: SiteLanguage }) {
  const items = [
    { href: localizedHref("/tools/github-repo-analyzer", language), code: "GH", label: copy.tools },
    { href: localizedHref("/english", language), code: "E", label: copy.english },
    { href: localizedHref("/programming", language), code: "C", label: copy.coding },
    ...(isAdmin ? [{ href: localizedHref("/admin", language), code: "A", label: copy.admin }] : []),
  ];

  return (
    <aside className="study-rail sticky top-5 flex h-[calc(100vh-40px)] flex-col p-2">
      <Link href={localizedHref("/", language)} className="mb-3 flex items-center gap-2 rounded-[8px] px-2 py-2">
        <span className="grid h-8 w-8 place-items-center rounded-[8px] bg-slate-950 text-[10px] font-semibold text-white">JM</span>
        <span className="hidden text-sm font-semibold leading-tight sm:block">JinMing Lab</span>
      </Link>

      <nav className="grid gap-1">
        {items.map((item) => (
          <Link key={item.href} href={item.href} className="rail-link">
            <span className="grid h-7 w-7 place-items-center rounded-[8px] bg-white/70 text-xs font-semibold text-slate-700">
              {item.code}
            </span>
            <span className="hidden text-xs font-semibold sm:inline lg:text-sm">{item.label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}

function TopBar({
  copy,
  isAdmin,
  isSignedIn,
  selectedUi,
  language,
}: {
  copy: HomeCopy;
  isAdmin: boolean;
  isSignedIn: boolean;
  selectedUi: string;
  language: SiteLanguage;
}) {
  return (
    <header className="dense-panel flex flex-wrap items-center justify-between gap-3 px-4 py-3">
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="dense-status">JinMing Lab</span>
        <span className="dense-status">{copy.english}</span>
        <span className="dense-status">{copy.tools}</span>
        <span className="dense-status">{copy.coding}</span>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <SiteVersionMenu copy={copy} selectedUi={selectedUi} />
        <Link href={localizedHref("/english", language)} className="dense-action">{copy.english}</Link>
        <Link href={localizedHref("/tools/github-repo-analyzer", language)} className="dense-action">{copy.tools}</Link>
        <Link href={localizedHref("/programming", language)} className="dense-action">{copy.coding}</Link>
        {isAdmin && <Link href={localizedHref("/admin", language)} className="dense-action">{copy.admin}</Link>}
        {isSignedIn ? (
          <form action="/api/auth/logout" method="post">
            <button className="dense-action">{copy.logout}</button>
          </form>
        ) : (
          <Link href={localizedHref("/login", language)} className="dense-action">{copy.login}</Link>
        )}
      </div>
    </header>
  );
}

function SiteVersionMenu({ copy, selectedUi }: { copy: HomeCopy; selectedUi: string }) {
  const selectedLanguage = worldLanguages.find((language) => language.slug === selectedUi) ?? worldLanguages[0];
  const supportedVersions = worldLanguages.filter((language) => siteVersionSlugs.includes(language.slug));

  return (
    <details className="home-language-menu home-version-menu">
      <summary aria-label="Open site language version switcher">
        <span>{copy.version}</span>
        <strong>{selectedLanguage.nativeName}</strong>
      </summary>
      <div className="home-language-popover">
        <div className="home-language-popover-head">
          <span>{copy.versions}</span>
          <Link href={homeHref("chinese")}>中文</Link>
        </div>
        <div className="home-language-featured">
          {supportedVersions.map((language) => (
            <Link key={language.slug} href={homeHref(language.slug)}>
              <span>{language.nativeName}</span>
              <small>{language.name}</small>
            </Link>
          ))}
        </div>
      </div>
    </details>
  );
}
