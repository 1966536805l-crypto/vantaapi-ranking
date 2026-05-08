import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE } from "@/lib/auth-constants";
import { botBlockedResponse, evaluateBotRequest, getBotClientIp, withBotHeaders, type BotVerdict } from "@/lib/bot-protection";

const protectedPages = ["/dashboard", "/progress", "/wrong", "/admin"];
const safeMethods = new Set(["GET", "HEAD", "OPTIONS"]);
const allowedMethods = new Set(["GET", "HEAD", "OPTIONS", "POST", "PUT", "PATCH", "DELETE"]);
const rateBuckets = new Map<string, { count: number; resetTime: number }>();
const penaltyBuckets = new Map<string, { blockedUntil: number; level: number; resetTime: number; reason: string }>();
type SecurityMode = "normal" | "elevated" | "emergency";
const supportedSiteLanguages = ["en", "zh", "ja", "ko", "es", "fr", "de", "pt", "ru", "ar", "hi", "id", "vi", "th", "tr", "it", "nl", "pl"] as const;
type SiteLanguage = (typeof supportedSiteLanguages)[number];

const languageCookieNames = ["jinming_language", "vantaapi-language"];

const expensiveApiRules = [
  { prefix: "/api/ai/coach", normal: 24, elevated: 12, emergency: 6, windowMs: 60_000 },
  { prefix: "/api/auth/login", normal: 18, elevated: 10, emergency: 6, windowMs: 15 * 60_000 },
  { prefix: "/api/auth/register", normal: 8, elevated: 4, emergency: 2, windowMs: 60 * 60_000 },
  { prefix: "/api/quiz/submit", normal: 80, elevated: 40, emergency: 20, windowMs: 60_000 },
  { prefix: "/api/cpp/run", normal: 30, elevated: 16, emergency: 8, windowMs: 60_000 },
  { prefix: "/api/questions", normal: 90, elevated: 45, emergency: 20, windowMs: 60_000 },
  { prefix: "/api/tools/github-repo-analyzer", normal: 20, elevated: 10, emergency: 4, windowMs: 60_000 },
];

const jsonWriteApiPrefixes = [
  "/api/ai",
  "/api/ai-review",
  "/api/ai/analyze-mistake",
  "/api/auth/login",
  "/api/auth/register",
  "/api/cpp",
  "/api/progress",
  "/api/quiz/submit",
  "/api/report",
  "/api/reports",
  "/api/tools/github-repo-analyzer",
  "/api/wrong",
];

const emergencyWritableApiPrefixes = [
  "/api/auth/login",
  "/api/auth/logout",
  "/api/auth/2fa",
  "/api/csrf",
  "/api/ai/coach",
];

const apiMethodRules = [
  { prefix: "/api/ai/coach", methods: ["POST"] },
  { prefix: "/api/ai/analyze-mistake", methods: ["POST"] },
  { prefix: "/api/ai-review", methods: ["POST"] },
  { prefix: "/api/ai", methods: ["POST"] },
  { prefix: "/api/auth/login", methods: ["POST"] },
  { prefix: "/api/auth/logout", methods: ["POST"] },
  { prefix: "/api/auth/register", methods: ["POST"] },
  { prefix: "/api/auth/me", methods: ["GET", "HEAD"] },
  { prefix: "/api/csrf", methods: ["GET", "HEAD"] },
  { prefix: "/api/cpp/analyze", methods: ["POST"] },
  { prefix: "/api/cpp/run", methods: ["POST"] },
  { prefix: "/api/questions", methods: ["GET", "HEAD"] },
  { prefix: "/api/quiz/submit", methods: ["POST"] },
  { prefix: "/api/rankings/like", methods: ["POST"] },
  { prefix: "/api/report", methods: ["POST"] },
  { prefix: "/api/stats", methods: ["GET", "HEAD"] },
  { prefix: "/api/tools/github-repo-analyzer", methods: ["POST"] },
];

function getClientIp(request: NextRequest) {
  return getBotClientIp(request);
}

function stableHash(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36);
}

function securityMode(): SecurityMode {
  const value = (process.env.SECURITY_MODE || process.env.DDOS_MODE || "normal").toLowerCase();
  if (value === "emergency" || value === "lockdown") return "emergency";
  if (value === "elevated" || value === "attack") return "elevated";
  return "normal";
}

function rateLimit(key: string, maxRequests: number, windowMs: number) {
  const now = Date.now();
  const current = rateBuckets.get(key);

  if (rateBuckets.size > 10_000) {
    for (const [bucketKey, bucket] of rateBuckets) {
      if (bucket.resetTime < now) rateBuckets.delete(bucketKey);
    }
  }

  if (!current || current.resetTime < now) {
    const resetTime = now + windowMs;
    rateBuckets.set(key, { count: 1, resetTime });
    return { allowed: true, remaining: maxRequests - 1, resetTime };
  }

  if (current.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetTime: current.resetTime };
  }

  current.count += 1;
  return { allowed: true, remaining: maxRequests - current.count, resetTime: current.resetTime };
}

function cleanupPenalties(now: number) {
  if (penaltyBuckets.size < 10_000) return;
  for (const [key, penalty] of penaltyBuckets) {
    if (penalty.resetTime < now && penalty.blockedUntil < now) penaltyBuckets.delete(key);
  }
}

function rememberPenalty(ip: string, reason: string, severity = 1) {
  const now = Date.now();
  cleanupPenalties(now);
  const current = penaltyBuckets.get(ip);
  const mode = securityMode();
  const baseMs = mode === "normal" ? 30_000 : mode === "elevated" ? 90_000 : 180_000;

  if (!current || current.resetTime < now) {
    const level = severity;
    const blockedUntil = now + Math.min(baseMs * level, 15 * 60_000);
    penaltyBuckets.set(ip, { blockedUntil, level, resetTime: now + 30 * 60_000, reason });
    return { blockedUntil, level, reason };
  }

  current.level = Math.min(current.level + severity, 8);
  current.blockedUntil = now + Math.min(baseMs * current.level, 15 * 60_000);
  current.resetTime = now + 30 * 60_000;
  current.reason = reason;
  return current;
}

function penaltyGuard(request: NextRequest) {
  const ip = getClientIp(request);
  const penalty = penaltyBuckets.get(ip);
  if (!penalty) return null;

  const now = Date.now();
  if (penalty.blockedUntil <= now) return null;

  return jsonError("Temporarily rate limited", 429, {
    "Retry-After": String(Math.max(1, Math.ceil((penalty.blockedUntil - now) / 1000))),
    "X-Abuse-Protection": "penalty-box",
  }, request);
}

function jsonError(message: string, status: number, extraHeaders: Record<string, string> = {}, request?: NextRequest) {
  const response = NextResponse.json({ message: request ? localizedSecurityMessage(message, status, securityLanguage(request)) : message }, { status });
  for (const [key, value] of Object.entries(extraHeaders)) response.headers.set(key, value);
  return withSecurityHeaders(response);
}

function rateLimitResponse(request: NextRequest, bucket: { resetTime: number }, ip?: string, reason = "rate-limit") {
  const penalty = ip ? rememberPenalty(ip, reason) : null;
  const resetTime = penalty ? Math.max(bucket.resetTime, penalty.blockedUntil) : bucket.resetTime;
  const retryAfter = Math.max(1, Math.ceil((bucket.resetTime - Date.now()) / 1000));
  return jsonError("Too many requests", 429, {
    "Retry-After": String(penalty ? Math.max(retryAfter, Math.ceil((resetTime - Date.now()) / 1000)) : retryAfter),
    "X-RateLimit-Reset": String(Math.ceil(resetTime / 1000)),
    ...(penalty ? { "X-Abuse-Protection": "penalty-box" } : {}),
  }, request);
}

function withSecurityHeaders(response: NextResponse, botVerdict?: BotVerdict) {
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Permitted-Cross-Domain-Policies", "none");
  response.headers.set("X-Download-Options", "noopen");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=(), usb=(), bluetooth=(), accelerometer=(), gyroscope=(), magnetometer=(), serial=(), browsing-topics=()");
  response.headers.set("X-Security-Mode", securityMode());
  if (response.headers.get("content-type")?.includes("application/json")) {
    response.headers.set("Cache-Control", "no-store");
    response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
  }
  return withBotHeaders(response, botVerdict);
}

function readLanguageCookie(request: NextRequest): SiteLanguage | null {
  for (const name of languageCookieNames) {
    const value = request.cookies.get(name)?.value;
    if (isSupportedSiteLanguage(value)) return value;
  }
  return null;
}

function preferredLanguageFromHeader(request: NextRequest): SiteLanguage | null {
  const header = request.headers.get("accept-language");
  if (!header) return null;

  const candidates = header
    .split(",")
    .map((part) => {
      const [tag = "", quality = "q=1"] = part.trim().split(";");
      const q = Number(quality.replace(/^q=/, "")) || 0;
      const base = tag.toLowerCase().split("-")[0];
      return { base, q };
    })
    .filter((item) => item.q > 0)
    .sort((a, b) => b.q - a.q);

  for (const candidate of candidates) {
    if (isSupportedSiteLanguage(candidate.base)) return candidate.base;
  }

  return null;
}

function isSupportedSiteLanguage(value: string | undefined | null): value is SiteLanguage {
  return supportedSiteLanguages.some((language) => language === value);
}

function writeLanguageCookies(response: NextResponse, language: SiteLanguage) {
  const options = {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
  };
  for (const name of languageCookieNames) {
    response.cookies.set(name, language, options);
  }
  return response;
}

function withLanguagePreference(response: NextResponse, request: NextRequest) {
  const language = request.nextUrl.searchParams.get("lang");
  if (isSupportedSiteLanguage(language)) {
    return writeLanguageCookies(response, language);
  }
  return response;
}

function securityLanguage(request: NextRequest): SiteLanguage {
  const explicitLanguage = request.nextUrl.searchParams.get("lang");
  return isSupportedSiteLanguage(explicitLanguage)
    ? explicitLanguage
    : readLanguageCookie(request) || preferredLanguageFromHeader(request) || "en";
}

const localizedStatusMessages: Record<SiteLanguage, Record<number, string>> = {
  en: {
    400: "Invalid request",
    401: "Authentication required",
    403: "Request blocked",
    404: "Request blocked",
    405: "Method not allowed",
    413: "Request body too large",
    415: "Content-Type must be application/json",
    421: "Host not allowed",
    429: "Too many requests",
    503: "Temporarily protected",
  },
  zh: {
    400: "请求不合法",
    401: "请先登录",
    403: "请求已被安全策略拦截",
    404: "请求已被安全策略拦截",
    405: "请求方法不允许",
    413: "请求内容过大",
    415: "Content-Type 必须是 application/json",
    421: "访问域名不在允许列表",
    429: "请求过于频繁，请稍后再试",
    503: "临时保护中，请稍后再试",
  },
  ja: {
    400: "リクエストが無効です",
    401: "ログインが必要です",
    403: "リクエストは安全ポリシーでブロックされました",
    404: "リクエストは安全ポリシーでブロックされました",
    405: "このリクエスト方法は使えません",
    413: "リクエスト本文が大きすぎます",
    415: "Content-Type は application/json にしてください",
    421: "このホストは許可されていません",
    429: "リクエストが多すぎます。少し待ってください",
    503: "一時的に保護中です。少し待ってください",
  },
  ko: {
    400: "잘못된 요청입니다",
    401: "로그인이 필요합니다",
    403: "보안 정책에 의해 요청이 차단되었습니다",
    404: "보안 정책에 의해 요청이 차단되었습니다",
    405: "허용되지 않는 요청 방식입니다",
    413: "요청 본문이 너무 큽니다",
    415: "Content-Type은 application/json이어야 합니다",
    421: "허용되지 않은 호스트입니다",
    429: "요청이 너무 많습니다. 잠시 후 다시 시도하세요",
    503: "일시 보호 중입니다. 잠시 후 다시 시도하세요",
  },
  es: {
    400: "Solicitud no válida",
    401: "Debes iniciar sesión",
    403: "Solicitud bloqueada por seguridad",
    404: "Solicitud bloqueada por seguridad",
    405: "Método no permitido",
    413: "La solicitud es demasiado grande",
    415: "Content-Type debe ser application/json",
    421: "Host no permitido",
    429: "Demasiadas solicitudes. Inténtalo más tarde",
    503: "Protección temporal activa. Inténtalo más tarde",
  },
  fr: {
    400: "Requete invalide",
    401: "Connexion requise",
    403: "Requete bloquee par la securite",
    404: "Requete bloquee par la securite",
    405: "Methode non autorisee",
    413: "Corps de requete trop grand",
    415: "Content-Type doit etre application/json",
    421: "Hote non autorise",
    429: "Trop de requetes. Reessaie plus tard",
    503: "Protection temporaire active. Reessaie plus tard",
  },
  de: {
    400: "Ungueltige Anfrage",
    401: "Anmeldung erforderlich",
    403: "Anfrage durch Sicherheit blockiert",
    404: "Anfrage durch Sicherheit blockiert",
    405: "Methode nicht erlaubt",
    413: "Anfrageinhalt zu gross",
    415: "Content-Type muss application/json sein",
    421: "Host nicht erlaubt",
    429: "Zu viele Anfragen. Bitte spaeter erneut versuchen",
    503: "Voruebergehend geschuetzt. Bitte spaeter erneut versuchen",
  },
  pt: {
    400: "Pedido invalido",
    401: "Login necessario",
    403: "Pedido bloqueado pela seguranca",
    404: "Pedido bloqueado pela seguranca",
    405: "Metodo nao permitido",
    413: "Corpo do pedido muito grande",
    415: "Content-Type deve ser application/json",
    421: "Host nao permitido",
    429: "Muitas requisicoes. Tente mais tarde",
    503: "Protecao temporaria ativa. Tente mais tarde",
  },
  ru: {
    400: "Неверный запрос",
    401: "Требуется вход",
    403: "Запрос заблокирован политикой безопасности",
    404: "Запрос заблокирован политикой безопасности",
    405: "Метод не разрешен",
    413: "Тело запроса слишком большое",
    415: "Content-Type должен быть application/json",
    421: "Хост не разрешен",
    429: "Слишком много запросов. Попробуйте позже",
    503: "Временная защита активна. Попробуйте позже",
  },
  ar: {
    400: "الطلب غير صالح",
    401: "تسجيل الدخول مطلوب",
    403: "تم حظر الطلب بواسطة سياسة الأمان",
    404: "تم حظر الطلب بواسطة سياسة الأمان",
    405: "طريقة الطلب غير مسموحة",
    413: "حجم الطلب كبير جدا",
    415: "يجب أن يكون Content-Type هو application/json",
    421: "المضيف غير مسموح",
    429: "طلبات كثيرة جدا. حاول بعد قليل",
    503: "الحماية المؤقتة مفعلة. حاول بعد قليل",
  },
  hi: {
    400: "अनुरोध अमान्य है",
    401: "लॉगिन जरूरी है",
    403: "सुरक्षा नीति ने अनुरोध रोक दिया",
    404: "सुरक्षा नीति ने अनुरोध रोक दिया",
    405: "यह request method allowed नहीं है",
    413: "Request body बहुत बड़ा है",
    415: "Content-Type application/json होना चाहिए",
    421: "Host allowed नहीं है",
    429: "बहुत अधिक requests. थोड़ी देर बाद कोशिश करें",
    503: "अस्थायी सुरक्षा चालू है. थोड़ी देर बाद कोशिश करें",
  },
  id: {
    400: "Permintaan tidak valid",
    401: "Perlu masuk",
    403: "Permintaan diblokir oleh keamanan",
    404: "Permintaan diblokir oleh keamanan",
    405: "Metode tidak diizinkan",
    413: "Isi permintaan terlalu besar",
    415: "Content-Type harus application/json",
    421: "Host tidak diizinkan",
    429: "Terlalu banyak permintaan. Coba lagi nanti",
    503: "Perlindungan sementara aktif. Coba lagi nanti",
  },
  vi: {
    400: "Yeu cau khong hop le",
    401: "Can dang nhap",
    403: "Yeu cau bi chan boi bao mat",
    404: "Yeu cau bi chan boi bao mat",
    405: "Phuong thuc khong duoc phep",
    413: "Noi dung yeu cau qua lon",
    415: "Content-Type phai la application/json",
    421: "Host khong duoc phep",
    429: "Qua nhieu yeu cau. Thu lai sau",
    503: "Dang bao ve tam thoi. Thu lai sau",
  },
  th: {
    400: "คำขอไม่ถูกต้อง",
    401: "ต้องเข้าสู่ระบบ",
    403: "คำขอถูกบล็อกโดยระบบความปลอดภัย",
    404: "คำขอถูกบล็อกโดยระบบความปลอดภัย",
    405: "ไม่อนุญาต method นี้",
    413: "ข้อมูลคำขอใหญ่เกินไป",
    415: "Content-Type ต้องเป็น application/json",
    421: "ไม่อนุญาต host นี้",
    429: "มีคำขอมากเกินไป โปรดลองใหม่ภายหลัง",
    503: "เปิดการป้องกันชั่วคราว โปรดลองใหม่ภายหลัง",
  },
  tr: {
    400: "Gecersiz istek",
    401: "Giris gerekli",
    403: "Istek guvenlik tarafindan engellendi",
    404: "Istek guvenlik tarafindan engellendi",
    405: "Yontem izinli degil",
    413: "Istek govdesi cok buyuk",
    415: "Content-Type application/json olmali",
    421: "Host izinli degil",
    429: "Cok fazla istek. Biraz sonra tekrar dene",
    503: "Gecici koruma aktif. Biraz sonra tekrar dene",
  },
  it: {
    400: "Richiesta non valida",
    401: "Accesso richiesto",
    403: "Richiesta bloccata dalla sicurezza",
    404: "Richiesta bloccata dalla sicurezza",
    405: "Metodo non consentito",
    413: "Corpo richiesta troppo grande",
    415: "Content-Type deve essere application/json",
    421: "Host non consentito",
    429: "Troppe richieste. Riprova piu tardi",
    503: "Protezione temporanea attiva. Riprova piu tardi",
  },
  nl: {
    400: "Ongeldig verzoek",
    401: "Inloggen vereist",
    403: "Verzoek geblokkeerd door beveiliging",
    404: "Verzoek geblokkeerd door beveiliging",
    405: "Methode niet toegestaan",
    413: "Verzoekbody is te groot",
    415: "Content-Type moet application/json zijn",
    421: "Host niet toegestaan",
    429: "Te veel verzoeken. Probeer later opnieuw",
    503: "Tijdelijke bescherming actief. Probeer later opnieuw",
  },
  pl: {
    400: "Nieprawidlowe zapytanie",
    401: "Wymagane logowanie",
    403: "Zapytanie zablokowane przez zabezpieczenia",
    404: "Zapytanie zablokowane przez zabezpieczenia",
    405: "Metoda niedozwolona",
    413: "Cialo zapytania jest za duze",
    415: "Content-Type musi byc application/json",
    421: "Host niedozwolony",
    429: "Zbyt wiele zapytan. Sprobuj pozniej",
    503: "Tymczasowa ochrona aktywna. Sprobuj pozniej",
  },
};

const localizedExactSecurityMessages: Partial<Record<SiteLanguage, Partial<Record<string, string>>>> = {
  zh: {
    "Temporarily rate limited": "临时限流中，请稍后再试",
    "Too many requests": "请求过于频繁，请稍后再试",
    "Request blocked": "请求已被安全策略拦截",
  },
  ja: {
    "Temporarily rate limited": "一時的に制限されています。少し待ってください",
    "Too many requests": "リクエストが多すぎます。少し待ってください",
    "Request blocked": "リクエストは安全ポリシーでブロックされました",
  },
  ar: {
    "Temporarily rate limited": "تم تقييد الطلب مؤقتا. حاول بعد قليل",
    "Too many requests": "طلبات كثيرة جدا. حاول بعد قليل",
    "Request blocked": "تم حظر الطلب بواسطة سياسة الأمان",
  },
};

function localizedSecurityMessage(message: string, status: number, language: SiteLanguage) {
  if (language === "en") return message;
  return localizedExactSecurityMessages[language]?.[message] ?? localizedStatusMessages[language][status] ?? localizedStatusMessages[language][400];
}

function languageRedirectGuard(request: NextRequest, pathname: string) {
  if (!safeMethods.has(request.method) || pathname.startsWith("/api/")) return null;
  if (pathname === "/robots.txt" || pathname === "/sitemap.xml") return null;
  if (/\.[A-Za-z0-9]{2,8}$/.test(pathname)) return null;

  const explicitLanguage = request.nextUrl.searchParams.get("lang");
  if (isSupportedSiteLanguage(explicitLanguage)) return null;

  const preferredLanguage = readLanguageCookie(request) || preferredLanguageFromHeader(request);
  if (!preferredLanguage || preferredLanguage === "en") return null;

  const url = request.nextUrl.clone();
  url.searchParams.set("lang", preferredLanguage);
  return NextResponse.redirect(url);
}

function isAllowedHost(host: string | null) {
  if (!host) return false;
  const normalized = host.toLowerCase();
  const configuredHosts = (process.env.APP_ALLOWED_HOSTS || "")
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);

  if (configuredHosts.length > 0) {
    return configuredHosts.includes(normalized);
  }

  return (
    normalized === "vantaapi.com" ||
    normalized === "www.vantaapi.com" ||
    normalized.startsWith("localhost:") ||
    normalized.startsWith("127.0.0.1:")
  );
}

function isSameHost(urlValue: string, host: string) {
  try {
    return new URL(urlValue).host.toLowerCase() === host.toLowerCase();
  } catch {
    return false;
  }
}

function crossSiteGuard(request: NextRequest) {
  if (safeMethods.has(request.method)) return null;

  const host = request.headers.get("host");
  if (!host) return jsonError("Missing host", 400, {}, request);

  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");
  const fetchSite = request.headers.get("sec-fetch-site");

  if (fetchSite === "cross-site") {
    return jsonError("Cross-site request blocked", 403, {}, request);
  }

  if (origin && !isSameHost(origin, host)) {
    return jsonError("Cross-origin request blocked", 403, {}, request);
  }

  if (!origin && referer && !isSameHost(referer, host)) {
    return jsonError("Cross-origin request blocked", 403, {}, request);
  }

  return null;
}

function bodySizeGuard(request: NextRequest, pathname: string) {
  if (safeMethods.has(request.method)) return null;

  const contentLength = Number(request.headers.get("content-length") || "0");
  if (!Number.isFinite(contentLength)) return jsonError("Invalid content length", 400, {}, request);

  const maxBytes = pathname.startsWith("/api/admin")
    ? 96 * 1024
    : pathname.startsWith("/api/ai")
      ? 12 * 1024
      : pathname.startsWith("/api/auth")
        ? 8 * 1024
        : 48 * 1024;
  if (contentLength > maxBytes) return jsonError("Request body too large", 413, {}, request);

  return null;
}

function queryShapeGuard(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  if (params.size > 32) return jsonError("Too many query parameters", 400, {}, request);

  for (const [key, value] of params.entries()) {
    if (key.length > 80 || value.length > 900) return jsonError("Query parameter too large", 400, {}, request);
    if (/^(?:redirect|return|next|url|callback|continue)$/i.test(key) && /^https?:\/\//i.test(value)) {
      return jsonError("External redirect blocked", 400, {}, request);
    }
  }

  return null;
}

function apiMethodGuard(request: NextRequest, pathname: string) {
  if (!pathname.startsWith("/api/")) return null;
  if (request.method === "OPTIONS") return null;

  const rule = apiMethodRules.find((item) => pathname === item.prefix || pathname.startsWith(`${item.prefix}/`));
  if (!rule) return null;
  if (rule.methods.includes(request.method)) return null;

  return jsonError("Method not allowed", 405, { Allow: rule.methods.join(", ") }, request);
}

function adminApiCookieGuard(request: NextRequest, pathname: string) {
  if (!pathname.startsWith("/api/admin") || pathname === "/api/admin/login") return null;
  if (request.cookies.get(AUTH_COOKIE)?.value) return null;
  return jsonError("Authentication required", 401, {}, request);
}

function contentTypeGuard(request: NextRequest, pathname: string) {
  if (safeMethods.has(request.method)) return null;
  const expectsJson = jsonWriteApiPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
  if (!expectsJson) return null;

  const contentType = request.headers.get("content-type") || "";
  if (!contentType.toLowerCase().includes("application/json")) {
    return jsonError("Content-Type must be application/json", 415, {}, request);
  }

  return null;
}

function emergencyWriteGuard(request: NextRequest, pathname: string) {
  if (securityMode() !== "emergency" || safeMethods.has(request.method) || !pathname.startsWith("/api/")) return null;
  const allowed = emergencyWritableApiPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
  return allowed ? null : jsonError("Temporarily protected", 503, { "Retry-After": "120" }, request);
}

function globalRateGuard(request: NextRequest, botVerdict: BotVerdict) {
  const mode = securityMode();
  const ip = getClientIp(request);
  const maxRequests = botVerdict.trustedCrawler
    ? mode === "emergency" ? 240 : 600
    : botVerdict.action === "throttle"
      ? mode === "normal" ? 45 : mode === "elevated" ? 25 : 12
      : mode === "normal" ? 360 : mode === "elevated" ? 180 : 72;
  const bucket = rateLimit(`global:${ip}`, maxRequests, 60_000);
  return bucket.allowed ? null : rateLimitResponse(request, bucket, ip, "global-rate-limit");
}

function fingerprintRateGuard(request: NextRequest, botVerdict: BotVerdict) {
  if (botVerdict.trustedCrawler) return null;

  const mode = securityMode();
  const unsafe = !safeMethods.has(request.method);
  const fingerprint = stableHash([
    request.headers.get("user-agent") || "",
    request.headers.get("accept-language") || "",
    request.headers.get("accept") || "",
    request.headers.get("sec-ch-ua-platform") || "",
  ].join("|"));
  const limit = unsafe
    ? mode === "normal" ? 180 : mode === "elevated" ? 80 : 32
    : mode === "normal" ? 720 : mode === "elevated" ? 320 : 120;
  const bucket = rateLimit(`fingerprint:${fingerprint}:${unsafe ? "write" : "read"}`, limit, 60_000);
  return bucket.allowed ? null : rateLimitResponse(request, bucket, getClientIp(request), "fingerprint-rate-limit");
}

function expensiveApiGuard(request: NextRequest, pathname: string) {
  if (safeMethods.has(request.method)) return null;

  const mode = securityMode();
  const rule = expensiveApiRules.find((item) => pathname === item.prefix || pathname.startsWith(`${item.prefix}/`));
  if (!rule) return null;

  const ip = getClientIp(request);
  const maxRequests = rule[mode];
  const bucket = rateLimit(`expensive:${rule.prefix}:${ip}`, maxRequests, rule.windowMs);
  return bucket.allowed ? null : rateLimitResponse(request, bucket, ip, "expensive-api-rate-limit");
}

function apiRateGuard(request: NextRequest, pathname: string) {
  const ip = getClientIp(request);
  const unsafe = !safeMethods.has(request.method);
  const mode = securityMode();
  const windowMs = pathname.startsWith("/api/auth") ? 15 * 60_000 : 60_000;
  const baseLimit = pathname.startsWith("/api/auth/login")
    ? 30
    : pathname.startsWith("/api/auth")
      ? 60
      : unsafe
        ? 120
        : 240;
  const maxRequests = mode === "normal" ? baseLimit : mode === "elevated" ? Math.ceil(baseLimit * 0.55) : Math.ceil(baseLimit * 0.28);
  const bucket = rateLimit(`api:${pathname}:${ip}`, maxRequests, windowMs);

  return bucket.allowed ? null : rateLimitResponse(request, bucket, ip, "api-rate-limit");
}

function pageRateGuard(request: NextRequest, pathname: string, botVerdict: BotVerdict) {
  if (!safeMethods.has(request.method) || pathname.startsWith("/api/")) return null;

  const ip = getBotClientIp(request);
  const mode = securityMode();
  const baseLimit = botVerdict.trustedCrawler
    ? 600
    : botVerdict.action === "throttle"
      ? 30
      : pathname.startsWith("/programming") || pathname.startsWith("/english/vocabulary")
        ? 160
        : 240;
  const maxRequests = botVerdict.trustedCrawler
    ? mode === "emergency" ? 240 : baseLimit
    : mode === "normal" ? baseLimit : mode === "elevated" ? Math.ceil(baseLimit * 0.55) : Math.ceil(baseLimit * 0.25);
  const bucket = rateLimit(`page:${ip}`, maxRequests, 60_000);

  return bucket.allowed ? null : rateLimitResponse(request, bucket, ip, "page-rate-limit");
}

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const host = request.headers.get("host");

  if (!isAllowedHost(host)) {
    return jsonError("Host not allowed", 421, {}, request);
  }

  if (!allowedMethods.has(request.method)) {
    return jsonError("Method not allowed", 405, { Allow: Array.from(allowedMethods).join(", ") }, request);
  }

  const botVerdict = evaluateBotRequest(request, pathname);
  if (botVerdict.action === "block" || botVerdict.action === "trap") {
    rememberPenalty(getClientIp(request), botVerdict.reason, botVerdict.action === "trap" ? 3 : 2);
    return withSecurityHeaders(botBlockedResponse(botVerdict, localizedSecurityMessage("Request blocked", botVerdict.action === "trap" ? 404 : 403, securityLanguage(request))), botVerdict);
  }

  const penaltyBlocked = penaltyGuard(request);
  if (penaltyBlocked) return withSecurityHeaders(penaltyBlocked, botVerdict);

  const globalRateBlocked = globalRateGuard(request, botVerdict);
  if (globalRateBlocked) return withSecurityHeaders(globalRateBlocked, botVerdict);

  const fingerprintRateBlocked = fingerprintRateGuard(request, botVerdict);
  if (fingerprintRateBlocked) return withSecurityHeaders(fingerprintRateBlocked, botVerdict);

  const queryBlocked = queryShapeGuard(request);
  if (queryBlocked) return queryBlocked;

  const pageRateBlocked = pageRateGuard(request, pathname, botVerdict);
  if (pageRateBlocked) return pageRateBlocked;

  const languageRedirect = languageRedirectGuard(request, pathname);
  if (languageRedirect) return withSecurityHeaders(languageRedirect, botVerdict);

  if (pathname.startsWith("/api/")) {
    if (botVerdict.action === "throttle") {
      rememberPenalty(getClientIp(request), botVerdict.reason, 1);
      return withSecurityHeaders(botBlockedResponse(botVerdict, localizedSecurityMessage("Too many requests", 429, securityLanguage(request))), botVerdict);
    }

    const methodBlocked = apiMethodGuard(request, pathname);
    if (methodBlocked) return methodBlocked;

    const adminCookieBlocked = adminApiCookieGuard(request, pathname);
    if (adminCookieBlocked) return adminCookieBlocked;

    const bodyBlocked = bodySizeGuard(request, pathname);
    if (bodyBlocked) return bodyBlocked;

    const contentTypeBlocked = contentTypeGuard(request, pathname);
    if (contentTypeBlocked) return contentTypeBlocked;

    const crossSiteBlocked = crossSiteGuard(request);
    if (crossSiteBlocked) return crossSiteBlocked;

    const emergencyBlocked = emergencyWriteGuard(request, pathname);
    if (emergencyBlocked) return emergencyBlocked;

    const expensiveApiBlocked = expensiveApiGuard(request, pathname);
    if (expensiveApiBlocked) return expensiveApiBlocked;

    const rateBlocked = apiRateGuard(request, pathname);
    if (rateBlocked) return rateBlocked;
  }

  const needsLogin = protectedPages.some((path) => pathname === path || pathname.startsWith(`${path}/`));
  if (needsLogin && !request.cookies.get(AUTH_COOKIE)?.value) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return withSecurityHeaders(NextResponse.redirect(loginUrl), botVerdict);
  }

  return withLanguagePreference(withSecurityHeaders(NextResponse.next(), botVerdict), request);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)"],
};
