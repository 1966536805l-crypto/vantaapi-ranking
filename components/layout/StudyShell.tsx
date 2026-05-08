import Link from "next/link";
import { localizedHref, type InterfaceLanguage } from "@/lib/language";
import { getServerUser } from "@/lib/server-auth";

const navItems = [
  { href: "/", key: "home" },
  { href: "/today", key: "today" },
  { href: "/english", key: "english" },
  { href: "/cpp", key: "cpp" },
  { href: "/dashboard", key: "dashboard" },
  { href: "/wrong", key: "wrong" },
] as const;

const shellCopy: Record<InterfaceLanguage, {
  tagline: string;
  nav: Record<(typeof navItems)[number]["key"], string>;
  admin: string;
  login: string;
  logout: string;
}> = {
  en: {
    tagline: "AI tools and learning lab",
    nav: { home: "Home", today: "Today", english: "English", cpp: "C++", dashboard: "Dashboard", wrong: "Wrong Bank" },
    admin: "Admin",
    login: "Login",
    logout: "Logout",
  },
  zh: {
    tagline: "AI 工具与学习实验室",
    nav: { home: "首页", today: "今日", english: "英语", cpp: "C++", dashboard: "学习面板", wrong: "错题本" },
    admin: "后台",
    login: "登录",
    logout: "退出",
  },
  ja: {
    tagline: "AI ツールと学習ラボ",
    nav: { home: "ホーム", today: "今日", english: "英語", cpp: "C++", dashboard: "学習ボード", wrong: "復習ノート" },
    admin: "管理",
    login: "ログイン",
    logout: "ログアウト",
  },
  ko: {
    tagline: "AI 도구와 학습 랩",
    nav: { home: "홈", today: "오늘", english: "영어", cpp: "C++", dashboard: "대시보드", wrong: "오답 노트" },
    admin: "관리",
    login: "로그인",
    logout: "로그아웃",
  },
  es: {
    tagline: "Laboratorio de IA y aprendizaje",
    nav: { home: "Inicio", today: "Hoy", english: "Ingles", cpp: "C++", dashboard: "Panel", wrong: "Errores" },
    admin: "Admin",
    login: "Entrar",
    logout: "Salir",
  },
  fr: {
    tagline: "Outils IA et labo d'apprentissage",
    nav: { home: "Accueil", today: "Aujourd'hui", english: "Anglais", cpp: "C++", dashboard: "Tableau", wrong: "Erreurs" },
    admin: "Admin",
    login: "Connexion",
    logout: "Deconnexion",
  },
  de: {
    tagline: "KI Tools und Lernlabor",
    nav: { home: "Start", today: "Heute", english: "Englisch", cpp: "C++", dashboard: "Dashboard", wrong: "Fehlerbank" },
    admin: "Admin",
    login: "Login",
    logout: "Logout",
  },
  pt: {
    tagline: "Ferramentas de IA e laboratorio de estudo",
    nav: { home: "Inicio", today: "Hoje", english: "Ingles", cpp: "C++", dashboard: "Painel", wrong: "Erros" },
    admin: "Admin",
    login: "Entrar",
    logout: "Sair",
  },
  ru: {
    tagline: "AI инструменты и учебная лаборатория",
    nav: { home: "Главная", today: "Сегодня", english: "Английский", cpp: "C++", dashboard: "Панель", wrong: "Ошибки" },
    admin: "Админ",
    login: "Вход",
    logout: "Выход",
  },
  ar: {
    tagline: "مختبر أدوات الذكاء الاصطناعي والتعلم",
    nav: { home: "الرئيسية", today: "اليوم", english: "الإنجليزية", cpp: "C++", dashboard: "لوحة التعلم", wrong: "دفتر الأخطاء" },
    admin: "الإدارة",
    login: "تسجيل الدخول",
    logout: "تسجيل الخروج",
  },
  hi: {
    tagline: "AI उपकरण और सीखने की प्रयोगशाला",
    nav: { home: "होम", today: "आज", english: "अंग्रेजी", cpp: "C++", dashboard: "लर्निंग बोर्ड", wrong: "गलती बैंक" },
    admin: "एडमिन",
    login: "लॉग इन",
    logout: "लॉग आउट",
  },
  id: {
    tagline: "Lab alat AI dan belajar",
    nav: { home: "Beranda", today: "Hari ini", english: "Inggris", cpp: "C++", dashboard: "Dasbor", wrong: "Bank salah" },
    admin: "Admin",
    login: "Masuk",
    logout: "Keluar",
  },
  vi: {
    tagline: "Cong cu AI va phong hoc",
    nav: { home: "Trang chu", today: "Hom nay", english: "Tieng Anh", cpp: "C++", dashboard: "Bang hoc", wrong: "So loi sai" },
    admin: "Quan tri",
    login: "Dang nhap",
    logout: "Dang xuat",
  },
  th: {
    tagline: "เครื่องมือ AI และห้องเรียนรู้",
    nav: { home: "หน้าแรก", today: "วันนี้", english: "อังกฤษ", cpp: "C++", dashboard: "กระดานเรียน", wrong: "คลังข้อผิด" },
    admin: "ผู้ดูแล",
    login: "เข้าสู่ระบบ",
    logout: "ออกจากระบบ",
  },
  tr: {
    tagline: "AI araclari ve ogrenme laboratuvari",
    nav: { home: "Ana sayfa", today: "Bugun", english: "Ingilizce", cpp: "C++", dashboard: "Panel", wrong: "Hata defteri" },
    admin: "Admin",
    login: "Giris",
    logout: "Cikis",
  },
  it: {
    tagline: "Strumenti IA e laboratorio di studio",
    nav: { home: "Home", today: "Oggi", english: "Inglese", cpp: "C++", dashboard: "Dashboard", wrong: "Errori" },
    admin: "Admin",
    login: "Login",
    logout: "Logout",
  },
  nl: {
    tagline: "AI tools en leerlab",
    nav: { home: "Home", today: "Vandaag", english: "Engels", cpp: "C++", dashboard: "Dashboard", wrong: "Fouten" },
    admin: "Admin",
    login: "Login",
    logout: "Logout",
  },
  pl: {
    tagline: "Narzędzia AI i laboratorium nauki",
    nav: { home: "Start", today: "Dzisiaj", english: "Angielski", cpp: "C++", dashboard: "Panel", wrong: "Bledy" },
    admin: "Admin",
    login: "Login",
    logout: "Logout",
  },
};

export default async function StudyShell({
  children,
  language = "en",
}: {
  children: React.ReactNode;
  language?: InterfaceLanguage;
}) {
  const user = await getServerUser();
  const copy = shellCopy[language];

  return (
    <main className="apple-page pb-10 pt-3">
      <div className="apple-shell flex min-h-screen flex-col">
        <header className="apple-nav px-4 py-2.5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <Link href={localizedHref("/", language)} className="flex items-center gap-3">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-slate-950 text-[10px] font-semibold text-white shadow-sm">JM</span>
              <span>
                <span className="block font-semibold leading-none">JinMing Lab</span>
                <span className="text-xs text-[color:var(--muted)]">{copy.tagline}</span>
              </span>
            </Link>

            <nav className="flex flex-wrap items-center gap-2 text-sm">
              {navItems.map((item) => (
                <Link key={item.href} href={localizedHref(item.href, language)} className="apple-pill px-3 py-1.5">
                  {copy.nav[item.key]}
                </Link>
              ))}
              {user?.role === "ADMIN" && <Link href={localizedHref("/admin", language)} className="apple-pill border-amber-200 bg-amber-50/80 px-3 py-1.5 text-amber-800">{copy.admin}</Link>}
              {user ? (
                <form action="/api/auth/logout" method="post"><button className="apple-button-secondary px-3 py-1.5">{copy.logout}</button></form>
              ) : (
                <Link href={localizedHref("/login", language)} className="apple-button-primary px-4 py-1.5">{copy.login}</Link>
              )}
            </nav>
          </div>
        </header>
        <div className="flex-1 py-5">{children}</div>
      </div>
    </main>
  );
}
