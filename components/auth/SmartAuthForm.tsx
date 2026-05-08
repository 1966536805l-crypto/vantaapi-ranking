"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import FlagLanguageToggle from "@/components/layout/FlagLanguageToggle";
import TurnstileWidget from "@/components/security/TurnstileWidget";
import { localizedHref, type InterfaceLanguage } from "@/lib/language";

type AuthMode = "login" | "register";

type AuthUser = {
  id: string;
  email: string;
  name: string | null;
  role: "ADMIN" | "USER";
};

type SmartAuthFormProps = {
  language?: InterfaceLanguage;
  nextHref?: string;
  allowRegister?: boolean;
  initialMode?: AuthMode;
};

type AuthCopy = {
  account: string;
  login: string;
  register: string;
  titleLogin: string;
  titleRegister: string;
  subtitleLogin: string;
  subtitleRegister: string;
  email: string;
  name: string;
  optional: string;
  password: string;
  twoFactorCode: string;
  show: string;
  hide: string;
  signingIn: string;
  creating: string;
  actionLogin: string;
  actionRegister: string;
  back: string;
  next: string;
  dashboard: string;
  signedIn: string;
  continue: string;
  logout: string;
  checking: string;
  passwordHint: string;
  emailPlaceholder: string;
  namePlaceholder: string;
  errorLogin: string;
  errorRegister: string;
  twoFactorPlaceholder: string;
  routes: {
    english: [string, string];
    cpp: [string, string];
    review: [string, string];
    dashboard: [string, string];
  };
};

const authCopyEn: AuthCopy = {
  account: "Account",
  login: "Sign in",
  register: "Create account",
  titleLogin: "Welcome back",
  titleRegister: "Start your account",
  subtitleLogin: "Use your email and password to continue learning",
  subtitleRegister: "Create one account for progress wrong questions and admin tools",
  email: "Email",
  name: "Name",
  optional: "optional",
  password: "Password",
  twoFactorCode: "2FA code",
  show: "Show",
  hide: "Hide",
  signingIn: "Signing in",
  creating: "Creating",
  actionLogin: "Sign in",
  actionRegister: "Create account",
  back: "Back home",
  next: "After sign in",
  dashboard: "Learning dashboard",
  signedIn: "Signed in",
  continue: "Continue",
  logout: "Sign out",
  checking: "Checking account",
  passwordHint: "At least 12 characters",
  emailPlaceholder: "you@example.com",
  namePlaceholder: "Your name",
  errorLogin: "Sign in failed",
  errorRegister: "Account creation failed",
  twoFactorPlaceholder: "6 digit admin code",
  routes: {
    english: ["English", "IELTS TOEFL CET"],
    cpp: ["C++", "classified drills"],
    review: ["Review", "wrong bank"],
    dashboard: ["Dashboard", "progress"],
  },
};

function authCopyFromEnglish(overrides: Partial<AuthCopy>): AuthCopy {
  return {
    ...authCopyEn,
    ...overrides,
    routes: {
      english: overrides.routes?.english ?? authCopyEn.routes.english,
      cpp: overrides.routes?.cpp ?? authCopyEn.routes.cpp,
      review: overrides.routes?.review ?? authCopyEn.routes.review,
      dashboard: overrides.routes?.dashboard ?? authCopyEn.routes.dashboard,
    },
  };
}

const copy: Record<InterfaceLanguage, AuthCopy> = {
  en: authCopyEn,
  zh: {
    account: "账号",
    login: "登录",
    register: "注册",
    titleLogin: "欢迎回来",
    titleRegister: "创建账号",
    subtitleLogin: "用邮箱和密码继续学习",
    subtitleRegister: "一个账号保存进度错题和后台权限",
    email: "邮箱",
    name: "姓名",
    optional: "可不填",
    password: "密码",
    twoFactorCode: "2FA 验证码",
    show: "显示",
    hide: "隐藏",
    signingIn: "登录中",
    creating: "创建中",
    actionLogin: "登录",
    actionRegister: "创建账号",
    back: "返回首页",
    next: "登录后进入",
    dashboard: "学习面板",
    signedIn: "已登录",
    continue: "继续",
    logout: "退出",
    checking: "检查账号",
    passwordHint: "至少 12 位",
    emailPlaceholder: "you@example.com",
    namePlaceholder: "你的名字",
    errorLogin: "登录失败",
    errorRegister: "注册失败",
    twoFactorPlaceholder: "管理员 6 位动态码",
    routes: {
      english: ["英语", "词汇 阅读 打字"],
      cpp: ["C++", "分类训练"],
      review: ["复盘", "错题本"],
      dashboard: ["学习面板", "进度"],
    },
  },
  ja: authCopyFromEnglish({
    account: "アカウント",
    login: "ログイン",
    register: "アカウント作成",
    titleLogin: "おかえりなさい",
    titleRegister: "アカウントを開始",
    subtitleLogin: "メールとパスワードで学習を続けます",
    subtitleRegister: "進捗、復習、管理機能を一つのアカウントで扱います",
    email: "メール",
    name: "名前",
    optional: "任意",
    password: "パスワード",
    twoFactorCode: "2FA コード",
    show: "表示",
    hide: "隠す",
    signingIn: "ログイン中",
    creating: "作成中",
    actionLogin: "ログイン",
    actionRegister: "作成",
    back: "ホームへ戻る",
    next: "ログイン後",
    dashboard: "学習ダッシュボード",
    signedIn: "ログイン済み",
    continue: "続ける",
    logout: "ログアウト",
    checking: "確認中",
    passwordHint: "12文字以上",
    namePlaceholder: "あなたの名前",
    errorLogin: "ログインに失敗しました",
    errorRegister: "作成に失敗しました",
    twoFactorPlaceholder: "管理者 6 桁コード",
    routes: {
      english: ["英語", "語彙 読解 タイピング"],
      cpp: ["C++", "分類練習"],
      review: ["復習", "間違いノート"],
      dashboard: ["学習面板", "進捗"],
    },
  }),
  ko: authCopyFromEnglish({
    account: "계정",
    login: "로그인",
    register: "계정 만들기",
    titleLogin: "다시 오신 것을 환영합니다",
    titleRegister: "계정 시작",
    subtitleLogin: "이메일과 비밀번호로 학습을 계속합니다",
    subtitleRegister: "진도와 복습을 하나의 계정에 저장합니다",
    email: "이메일",
    name: "이름",
    optional: "선택",
    password: "비밀번호",
    twoFactorCode: "2FA 코드",
    show: "보기",
    hide: "숨기기",
    signingIn: "로그인 중",
    creating: "생성 중",
    actionLogin: "로그인",
    actionRegister: "생성",
    back: "홈으로",
    next: "로그인 후",
    dashboard: "학습 대시보드",
    signedIn: "로그인됨",
    continue: "계속",
    logout: "로그아웃",
    checking: "계정 확인 중",
    passwordHint: "12자 이상",
    namePlaceholder: "이름",
    errorLogin: "로그인 실패",
    errorRegister: "계정 생성 실패",
    twoFactorPlaceholder: "관리자 6자리 코드",
    routes: {
      english: ["영어", "어휘 읽기 타이핑"],
      cpp: ["C++", "분류 훈련"],
      review: ["복습", "오답 노트"],
      dashboard: ["대시보드", "진도"],
    },
  }),
  es: authCopyFromEnglish({
    account: "Cuenta",
    login: "Iniciar sesion",
    register: "Crear cuenta",
    titleLogin: "Bienvenido de nuevo",
    titleRegister: "Empieza tu cuenta",
    subtitleLogin: "Usa tu correo y contrasena para continuar",
    subtitleRegister: "Guarda progreso, errores y herramientas",
    email: "Correo",
    name: "Nombre",
    optional: "opcional",
    password: "Contrasena",
    twoFactorCode: "Codigo 2FA",
    show: "Ver",
    hide: "Ocultar",
    signingIn: "Entrando",
    creating: "Creando",
    actionLogin: "Entrar",
    actionRegister: "Crear cuenta",
    back: "Volver al inicio",
    next: "Despues de entrar",
    dashboard: "Panel de aprendizaje",
    signedIn: "Sesion iniciada",
    continue: "Continuar",
    logout: "Salir",
    checking: "Revisando cuenta",
    passwordHint: "Minimo 12 caracteres",
    namePlaceholder: "Tu nombre",
    errorLogin: "No se pudo iniciar sesion",
    errorRegister: "No se pudo crear la cuenta",
    twoFactorPlaceholder: "codigo admin de 6 digitos",
    routes: {
      english: ["Ingles", "vocabulario lectura typing"],
      cpp: ["C++", "ejercicios clasificados"],
      review: ["Repaso", "errores"],
      dashboard: ["Panel", "progreso"],
    },
  }),
  fr: authCopyFromEnglish({
    account: "Compte",
    login: "Connexion",
    register: "Creer un compte",
    titleLogin: "Bon retour",
    subtitleLogin: "Utilise ton email et ton mot de passe pour continuer",
    email: "Email",
    password: "Mot de passe",
    twoFactorCode: "Code 2FA",
    show: "Voir",
    hide: "Masquer",
    signingIn: "Connexion",
    actionLogin: "Se connecter",
    back: "Retour accueil",
    next: "Apres connexion",
    dashboard: "Tableau d apprentissage",
    continue: "Continuer",
    logout: "Se deconnecter",
    checking: "Verification du compte",
    errorLogin: "Connexion echouee",
    routes: {
      english: ["Anglais", "vocabulaire lecture typing"],
      cpp: ["C++", "exercices classes"],
      review: ["Revision", "erreurs"],
      dashboard: ["Tableau", "progression"],
    },
  }),
  de: authCopyFromEnglish({
    account: "Konto",
    login: "Anmelden",
    register: "Konto erstellen",
    titleLogin: "Willkommen zurueck",
    subtitleLogin: "Mit E-Mail und Passwort weiterlernen",
    email: "E-Mail",
    password: "Passwort",
    twoFactorCode: "2FA Code",
    show: "Zeigen",
    hide: "Ausblenden",
    signingIn: "Anmelden",
    actionLogin: "Anmelden",
    back: "Zur Startseite",
    next: "Nach Anmeldung",
    dashboard: "Lern Dashboard",
    continue: "Weiter",
    logout: "Abmelden",
    checking: "Konto pruefen",
    errorLogin: "Anmeldung fehlgeschlagen",
    routes: {
      english: ["Englisch", "Wortschatz Lesen Tippen"],
      cpp: ["C++", "klassifizierte Uebungen"],
      review: ["Wiederholen", "Fehlerbank"],
      dashboard: ["Dashboard", "Fortschritt"],
    },
  }),
  pt: authCopyFromEnglish({
    account: "Conta",
    login: "Entrar",
    titleLogin: "Bem-vindo de volta",
    subtitleLogin: "Use email e senha para continuar",
    email: "Email",
    password: "Senha",
    twoFactorCode: "Codigo 2FA",
    show: "Mostrar",
    hide: "Ocultar",
    signingIn: "Entrando",
    actionLogin: "Entrar",
    back: "Voltar ao inicio",
    next: "Depois de entrar",
    dashboard: "Painel de estudo",
    continue: "Continuar",
    logout: "Sair",
    checking: "Verificando conta",
    errorLogin: "Falha ao entrar",
    routes: {
      english: ["Ingles", "vocabulario leitura digitacao"],
      cpp: ["C++", "treinos classificados"],
      review: ["Revisao", "erros"],
      dashboard: ["Painel", "progresso"],
    },
  }),
  ru: authCopyFromEnglish({
    account: "Аккаунт",
    login: "Войти",
    titleLogin: "С возвращением",
    subtitleLogin: "Используй email и пароль чтобы продолжить",
    email: "Email",
    password: "Пароль",
    twoFactorCode: "Код 2FA",
    show: "Показать",
    hide: "Скрыть",
    signingIn: "Вход",
    actionLogin: "Войти",
    back: "На главную",
    next: "После входа",
    dashboard: "Панель обучения",
    continue: "Продолжить",
    logout: "Выйти",
    checking: "Проверка аккаунта",
    errorLogin: "Вход не удался",
    routes: {
      english: ["Английский", "слова чтение набор"],
      cpp: ["C++", "тренировки по типам"],
      review: ["Повторение", "ошибки"],
      dashboard: ["Панель", "прогресс"],
    },
  }),
  ar: authCopyFromEnglish({
    account: "الحساب",
    login: "تسجيل الدخول",
    register: "إنشاء حساب",
    titleLogin: "مرحبا بعودتك",
    titleRegister: "ابدأ حسابك",
    subtitleLogin: "استخدم البريد وكلمة المرور لمتابعة التعلم",
    subtitleRegister: "احفظ التقدم والمراجعة في حساب واحد",
    email: "البريد الإلكتروني",
    name: "الاسم",
    optional: "اختياري",
    password: "كلمة المرور",
    twoFactorCode: "رمز 2FA",
    show: "إظهار",
    hide: "إخفاء",
    signingIn: "جار تسجيل الدخول",
    creating: "جار الإنشاء",
    actionLogin: "تسجيل الدخول",
    actionRegister: "إنشاء حساب",
    back: "العودة للرئيسية",
    next: "بعد الدخول",
    dashboard: "لوحة التعلم",
    signedIn: "تم تسجيل الدخول",
    continue: "متابعة",
    logout: "تسجيل الخروج",
    checking: "فحص الحساب",
    passwordHint: "12 حرفا على الأقل",
    emailPlaceholder: "you@example.com",
    namePlaceholder: "اسمك",
    errorLogin: "فشل تسجيل الدخول",
    errorRegister: "فشل إنشاء الحساب",
    twoFactorPlaceholder: "رمز المدير من 6 أرقام",
    routes: {
      english: ["الإنجليزية", "مفردات قراءة كتابة"],
      cpp: ["C++", "تدريبات مصنفة"],
      review: ["مراجعة", "دفتر الأخطاء"],
      dashboard: ["لوحة التعلم", "التقدم"],
    },
  }),
  hi: authCopyFromEnglish({
    account: "खाता",
    login: "लॉग इन",
    titleLogin: "फिर से स्वागत है",
    subtitleLogin: "सीखना जारी रखने के लिए email और password इस्तेमाल करें",
    email: "ईमेल",
    password: "पासवर्ड",
    twoFactorCode: "2FA कोड",
    show: "दिखाएं",
    hide: "छिपाएं",
    signingIn: "लॉग इन हो रहा है",
    actionLogin: "लॉग इन",
    back: "होम पर जाएं",
    dashboard: "सीखने का पैनल",
    continue: "जारी रखें",
    logout: "लॉग आउट",
    checking: "खाता जांच",
    errorLogin: "लॉग इन असफल",
    routes: {
      english: ["अंग्रेजी", "शब्द पढ़ना typing"],
      cpp: ["C++", "वर्गीकृत अभ्यास"],
      review: ["दोहराव", "गलतियां"],
      dashboard: ["पैनल", "प्रगति"],
    },
  }),
  id: authCopyFromEnglish({
    account: "Akun",
    login: "Masuk",
    titleLogin: "Selamat datang kembali",
    subtitleLogin: "Gunakan email dan sandi untuk melanjutkan",
    email: "Email",
    password: "Sandi",
    twoFactorCode: "Kode 2FA",
    show: "Tampilkan",
    hide: "Sembunyikan",
    signingIn: "Masuk",
    actionLogin: "Masuk",
    back: "Kembali ke beranda",
    dashboard: "Dasbor belajar",
    continue: "Lanjut",
    logout: "Keluar",
    checking: "Memeriksa akun",
    errorLogin: "Gagal masuk",
    routes: {
      english: ["Inggris", "kosakata membaca mengetik"],
      cpp: ["C++", "latihan terklasifikasi"],
      review: ["Ulasan", "bank salah"],
      dashboard: ["Dasbor", "progres"],
    },
  }),
  vi: authCopyFromEnglish({
    account: "Tai khoan",
    login: "Dang nhap",
    titleLogin: "Chao mung tro lai",
    subtitleLogin: "Dung email va mat khau de hoc tiep",
    email: "Email",
    password: "Mat khau",
    twoFactorCode: "Ma 2FA",
    show: "Hien",
    hide: "An",
    signingIn: "Dang dang nhap",
    actionLogin: "Dang nhap",
    back: "Ve trang chu",
    dashboard: "Bang hoc tap",
    continue: "Tiep tuc",
    logout: "Dang xuat",
    checking: "Kiem tra tai khoan",
    errorLogin: "Dang nhap that bai",
    routes: {
      english: ["Tieng Anh", "tu vung doc go phim"],
      cpp: ["C++", "bai tap phan loai"],
      review: ["On tap", "loi sai"],
      dashboard: ["Bang hoc", "tien do"],
    },
  }),
  th: authCopyFromEnglish({
    account: "บัญชี",
    login: "เข้าสู่ระบบ",
    titleLogin: "ยินดีต้อนรับกลับ",
    subtitleLogin: "ใช้ email และ password เพื่อเรียนต่อ",
    email: "อีเมล",
    password: "รหัสผ่าน",
    twoFactorCode: "รหัส 2FA",
    show: "แสดง",
    hide: "ซ่อน",
    signingIn: "กำลังเข้าสู่ระบบ",
    actionLogin: "เข้าสู่ระบบ",
    back: "กลับหน้าแรก",
    dashboard: "แดชบอร์ดการเรียน",
    continue: "ต่อ",
    logout: "ออกจากระบบ",
    checking: "ตรวจบัญชี",
    errorLogin: "เข้าสู่ระบบไม่สำเร็จ",
    routes: {
      english: ["อังกฤษ", "คำศัพท์ อ่าน พิมพ์"],
      cpp: ["C++", "แบบฝึกแยกประเภท"],
      review: ["ทบทวน", "ข้อผิดพลาด"],
      dashboard: ["แดชบอร์ด", "ความคืบหน้า"],
    },
  }),
  tr: authCopyFromEnglish({
    account: "Hesap",
    login: "Giris yap",
    titleLogin: "Tekrar hos geldin",
    subtitleLogin: "Devam etmek icin email ve sifre kullan",
    email: "E-posta",
    password: "Sifre",
    twoFactorCode: "2FA kodu",
    show: "Goster",
    hide: "Gizle",
    signingIn: "Giris yapiliyor",
    actionLogin: "Giris yap",
    back: "Ana sayfaya don",
    dashboard: "Ogrenme paneli",
    continue: "Devam",
    logout: "Cikis",
    checking: "Hesap kontrol",
    errorLogin: "Giris basarisiz",
    routes: {
      english: ["Ingilizce", "kelime okuma yazma"],
      cpp: ["C++", "siniflandirilmis pratik"],
      review: ["Tekrar", "hata bankasi"],
      dashboard: ["Panel", "ilerleme"],
    },
  }),
  it: authCopyFromEnglish({
    account: "Account",
    login: "Accedi",
    titleLogin: "Bentornato",
    subtitleLogin: "Usa email e password per continuare",
    email: "Email",
    password: "Password",
    twoFactorCode: "Codice 2FA",
    show: "Mostra",
    hide: "Nascondi",
    signingIn: "Accesso",
    actionLogin: "Accedi",
    back: "Torna alla home",
    dashboard: "Dashboard studio",
    continue: "Continua",
    logout: "Esci",
    checking: "Controllo account",
    errorLogin: "Accesso non riuscito",
    routes: {
      english: ["Inglese", "vocabolario lettura typing"],
      cpp: ["C++", "esercizi classificati"],
      review: ["Ripasso", "errori"],
      dashboard: ["Dashboard", "progresso"],
    },
  }),
  nl: authCopyFromEnglish({
    account: "Account",
    login: "Inloggen",
    titleLogin: "Welkom terug",
    subtitleLogin: "Gebruik email en wachtwoord om verder te leren",
    email: "Email",
    password: "Wachtwoord",
    twoFactorCode: "2FA code",
    show: "Toon",
    hide: "Verberg",
    signingIn: "Inloggen",
    actionLogin: "Inloggen",
    back: "Terug naar home",
    dashboard: "Leer dashboard",
    continue: "Doorgaan",
    logout: "Uitloggen",
    checking: "Account controleren",
    errorLogin: "Inloggen mislukt",
    routes: {
      english: ["Engels", "woordenschat lezen typen"],
      cpp: ["C++", "ingedeelde oefeningen"],
      review: ["Herhalen", "foutenbank"],
      dashboard: ["Dashboard", "voortgang"],
    },
  }),
  pl: authCopyFromEnglish({
    account: "Konto",
    login: "Zaloguj",
    titleLogin: "Witaj ponownie",
    subtitleLogin: "Uzyj emaila i hasla aby kontynuowac",
    email: "E-mail",
    password: "Haslo",
    twoFactorCode: "Kod 2FA",
    show: "Pokaz",
    hide: "Ukryj",
    signingIn: "Logowanie",
    actionLogin: "Zaloguj",
    back: "Powrot do strony glownej",
    dashboard: "Panel nauki",
    continue: "Kontynuuj",
    logout: "Wyloguj",
    checking: "Sprawdzanie konta",
    errorLogin: "Logowanie nieudane",
    routes: {
      english: ["Angielski", "slowa czytanie pisanie"],
      cpp: ["C++", "cwiczenia wedlug typu"],
      review: ["Powtorka", "bledy"],
      dashboard: ["Panel", "postep"],
    },
  }),
};

export default function SmartAuthForm({
  language = "en",
  nextHref = localizedHref("/dashboard", language),
  allowRegister = false,
  initialMode = "login",
}: SmartAuthFormProps) {
  const t = copy[language];
  const [mode, setMode] = useState<AuthMode>(allowRegister ? initialMode : "login");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [website, setWebsite] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingUser, setCheckingUser] = useState(true);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const formStartedAt = useRef(0);
  const emailRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let cancelled = false;
    formStartedAt.current = Date.now();
    fetch("/api/auth/me", { cache: "no-store" })
      .then((response) => response.json())
      .then((data: { user?: AuthUser | null }) => {
        if (!cancelled) setCurrentUser(data.user ?? null);
      })
      .catch(() => {
        if (!cancelled) setCurrentUser(null);
      })
      .finally(() => {
        if (!cancelled) setCheckingUser(false);
      });

    requestAnimationFrame(() => {
      const storedEmail = window.localStorage.getItem("vantaapi-auth-email") || window.localStorage.getItem("vantaapi-auth-email");
      if (!cancelled && storedEmail) setEmail(storedEmail);
      if (!cancelled) emailRef.current?.focus();
    });

    return () => {
      cancelled = true;
    };
  }, []);

  function switchMode(nextMode: AuthMode) {
    if (nextMode === "register" && !allowRegister) return;
    setMode(nextMode);
    setError("");
    requestAnimationFrame(() => emailRef.current?.focus());
  }

  async function logout() {
    setLoading(true);
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => null);
    setCurrentUser(null);
    setLoading(false);
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const payload =
      mode === "register"
        ? { name: name.trim() || undefined, email: email.trim(), password, website, formStartedAt: formStartedAt.current || Date.now() - 1000, turnstileToken }
        : { email: email.trim(), password, twoFactorCode: twoFactorCode.trim() || undefined, website, formStartedAt: formStartedAt.current || Date.now() - 1000, turnstileToken };

    const response = await fetch(`/api/auth/${mode}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await response.json().catch(() => ({}));
    setLoading(false);

    if (!response.ok) {
      setError(data.message || (mode === "login" ? t.errorLogin : t.errorRegister));
      return;
    }

    window.localStorage.setItem("vantaapi-auth-email", email.trim());
    window.location.href = nextHref;
  }

  return (
    <main className="auth-page apple-page" dir={language === "ar" ? "rtl" : "ltr"} data-interface-language={language}>
      <section className="auth-shell">
        <div className="auth-side">
          <div className="flex items-center justify-between gap-3">
            <Link href={localizedHref("/", language)} className="auth-brand">
              <span className="auth-brand-mark">JM</span>
              <span>JinMing Lab</span>
            </Link>
            <FlagLanguageToggle initialLanguage={language} />
          </div>

          <div className="auth-copy">
            <p className="eyebrow">{t.account}</p>
            <h1 className="apple-display-title">{allowRegister && mode === "register" ? t.titleRegister : t.titleLogin}</h1>
            <p className="apple-display-subtitle">{allowRegister && mode === "register" ? t.subtitleRegister : t.subtitleLogin}</p>
          </div>

          <div className="auth-route-grid">
            <Link href={localizedHref("/english", language)} className="dense-mini">
              <span>{t.routes.english[0]}</span>
              <span>{t.routes.english[1]}</span>
            </Link>
            <Link href={localizedHref("/cpp", language)} className="dense-mini">
              <span>{t.routes.cpp[0]}</span>
              <span>{t.routes.cpp[1]}</span>
            </Link>
            <Link href={localizedHref("/wrong", language)} className="dense-mini">
              <span>{t.routes.review[0]}</span>
              <span>{t.routes.review[1]}</span>
            </Link>
            <Link href={localizedHref("/dashboard", language)} className="dense-mini">
              <span>{t.routes.dashboard[0]}</span>
              <span>{t.routes.dashboard[1]}</span>
            </Link>
          </div>
        </div>

        <div className="auth-card apple-card">
          {allowRegister ? (
            <div className="auth-tabs" role="tablist" aria-label={t.account}>
              <button
                type="button"
                role="tab"
                aria-selected={mode === "login"}
                className={mode === "login" ? "auth-tab auth-tab-active" : "auth-tab"}
                onClick={() => switchMode("login")}
              >
                {t.login}
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={mode === "register"}
                className={mode === "register" ? "auth-tab auth-tab-active" : "auth-tab"}
                onClick={() => switchMode("register")}
              >
                {t.register}
              </button>
            </div>
          ) : (
            <div className="auth-single-title">
              <span className="auth-single-dot" />
              {t.login}
            </div>
          )}

          {checkingUser ? (
            <div className="auth-session">
              <span className="auth-session-dot" />
              <span>{t.checking}</span>
            </div>
          ) : currentUser ? (
            <div className="auth-session">
              <div>
                <p className="eyebrow">{t.signedIn}</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">{currentUser.name || currentUser.email}</p>
                <p className="mt-1 text-xs text-[color:var(--muted)]">{currentUser.email}</p>
              </div>
              <div className="flex gap-2">
                <Link href={nextHref} className="dense-action-primary">{t.continue}</Link>
                <button type="button" disabled={loading} onClick={logout} className="dense-action disabled:opacity-50">
                  {t.logout}
                </button>
              </div>
            </div>
          ) : null}

          <form onSubmit={submit} className="auth-form">
            <label className="bot-field" aria-hidden="true">
              Website
              <input
                tabIndex={-1}
                autoComplete="off"
                value={website}
                onChange={(event) => setWebsite(event.target.value)}
              />
            </label>

            {allowRegister && mode === "register" && (
              <label className="auth-field">
                <span className="eyebrow">{t.name} {t.optional}</span>
                <input
                  name="name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  autoComplete="name"
                  placeholder={t.namePlaceholder}
                  className="auth-input"
                />
              </label>
            )}

            <label className="auth-field">
              <span className="eyebrow">{t.email}</span>
              <input
                ref={emailRef}
                required
                name="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                placeholder={t.emailPlaceholder}
                className="auth-input"
              />
            </label>

            <label className="auth-field">
              <span className="eyebrow">{t.password}</span>
              <div className="auth-password-wrap">
                <input
                  required
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete={allowRegister && mode === "register" ? "new-password" : "current-password"}
                  minLength={allowRegister && mode === "register" ? 12 : undefined}
                  placeholder={allowRegister && mode === "register" ? t.passwordHint : ""}
                  className="auth-input auth-input-password"
                />
                <button type="button" className="auth-password-toggle" onClick={() => setShowPassword((value) => !value)}>
                  {showPassword ? t.hide : t.show}
                </button>
              </div>
            </label>

            {mode === "login" && (
              <label className="auth-field">
                <span className="eyebrow">{t.twoFactorCode} {t.optional}</span>
                <input
                  name="twoFactorCode"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  value={twoFactorCode}
                  onChange={(event) => setTwoFactorCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
                  autoComplete="one-time-code"
                  placeholder={t.twoFactorPlaceholder}
                  className="auth-input"
                />
              </label>
            )}

            {error && <p className="auth-error" role="alert">{error}</p>}

            <TurnstileWidget onToken={setTurnstileToken} />

            <button disabled={loading} className="apple-button-primary auth-submit disabled:opacity-55">
              {loading
                ? allowRegister && mode === "register"
                  ? t.creating
                  : t.signingIn
                : allowRegister && mode === "register"
                  ? t.actionRegister
                  : t.actionLogin}
            </button>

            <div className="auth-foot">
              <Link href={localizedHref("/", language)} className="link">{t.back}</Link>
              <span>{t.next} {t.dashboard}</span>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}
