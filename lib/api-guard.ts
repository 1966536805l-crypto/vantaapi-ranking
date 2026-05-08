import { NextRequest, NextResponse } from "next/server";
import { validateCsrfRequest } from "@/lib/csrf";
import { isInterfaceLanguage, type InterfaceLanguage } from "@/lib/language";
import { checkRateLimit, checkRateLimitAsync, getRateLimitKey } from "@/lib/security";

const languageCookieNames = ["jinming_language", "vantaapi-language"];

const genericApiMessages: Record<InterfaceLanguage, Record<number, string>> = {
  en: {
    400: "Invalid request",
    401: "Authentication required",
    403: "Request blocked",
    404: "Not found",
    413: "Request body too large",
    415: "Content-Type must be application/json",
    429: "Too many requests",
    500: "Server error",
  },
  zh: {
    400: "请求不合法",
    401: "请先登录",
    403: "请求已被安全策略拦截",
    404: "没有找到内容",
    413: "请求内容过大",
    415: "Content-Type 必须是 application/json",
    429: "请求过于频繁，请稍后再试",
    500: "服务器错误",
  },
  ja: {
    400: "リクエストが無効です",
    401: "ログインが必要です",
    403: "リクエストは安全ポリシーでブロックされました",
    404: "見つかりません",
    413: "リクエスト本文が大きすぎます",
    415: "Content-Type は application/json にしてください",
    429: "リクエストが多すぎます。少し待ってください",
    500: "サーバーエラー",
  },
  ko: {
    400: "잘못된 요청입니다",
    401: "로그인이 필요합니다",
    403: "보안 정책에 의해 요청이 차단되었습니다",
    404: "찾을 수 없습니다",
    413: "요청 본문이 너무 큽니다",
    415: "Content-Type은 application/json이어야 합니다",
    429: "요청이 너무 많습니다. 잠시 후 다시 시도하세요",
    500: "서버 오류",
  },
  es: {
    400: "Solicitud no válida",
    401: "Debes iniciar sesión",
    403: "Solicitud bloqueada por seguridad",
    404: "No encontrado",
    413: "La solicitud es demasiado grande",
    415: "Content-Type debe ser application/json",
    429: "Demasiadas solicitudes. Inténtalo más tarde",
    500: "Error del servidor",
  },
  fr: {
    400: "Requete invalide",
    401: "Connexion requise",
    403: "Requete bloquee par la securite",
    404: "Introuvable",
    413: "Corps de requete trop grand",
    415: "Content-Type doit etre application/json",
    429: "Trop de requetes. Reessaie plus tard",
    500: "Erreur serveur",
  },
  de: {
    400: "Ungueltige Anfrage",
    401: "Anmeldung erforderlich",
    403: "Anfrage durch Sicherheit blockiert",
    404: "Nicht gefunden",
    413: "Anfrageinhalt zu gross",
    415: "Content-Type muss application/json sein",
    429: "Zu viele Anfragen. Bitte spaeter erneut versuchen",
    500: "Serverfehler",
  },
  pt: {
    400: "Pedido invalido",
    401: "Login necessario",
    403: "Pedido bloqueado pela seguranca",
    404: "Nao encontrado",
    413: "Corpo do pedido muito grande",
    415: "Content-Type deve ser application/json",
    429: "Muitas requisicoes. Tente mais tarde",
    500: "Erro do servidor",
  },
  ru: {
    400: "Неверный запрос",
    401: "Требуется вход",
    403: "Запрос заблокирован политикой безопасности",
    404: "Не найдено",
    413: "Тело запроса слишком большое",
    415: "Content-Type должен быть application/json",
    429: "Слишком много запросов. Попробуйте позже",
    500: "Ошибка сервера",
  },
  ar: {
    400: "الطلب غير صالح",
    401: "تسجيل الدخول مطلوب",
    403: "تم حظر الطلب بواسطة سياسة الأمان",
    404: "غير موجود",
    413: "حجم الطلب كبير جدا",
    415: "يجب أن يكون Content-Type هو application/json",
    429: "طلبات كثيرة جدا. حاول بعد قليل",
    500: "خطأ في الخادم",
  },
  hi: {
    400: "अनुरोध अमान्य है",
    401: "लॉगिन जरूरी है",
    403: "सुरक्षा नीति ने अनुरोध रोक दिया",
    404: "नहीं मिला",
    413: "Request body बहुत बड़ा है",
    415: "Content-Type application/json होना चाहिए",
    429: "बहुत अधिक requests. थोड़ी देर बाद कोशिश करें",
    500: "Server error",
  },
  id: {
    400: "Permintaan tidak valid",
    401: "Perlu masuk",
    403: "Permintaan diblokir oleh keamanan",
    404: "Tidak ditemukan",
    413: "Isi permintaan terlalu besar",
    415: "Content-Type harus application/json",
    429: "Terlalu banyak permintaan. Coba lagi nanti",
    500: "Kesalahan server",
  },
  vi: {
    400: "Yeu cau khong hop le",
    401: "Can dang nhap",
    403: "Yeu cau bi chan boi bao mat",
    404: "Khong tim thay",
    413: "Noi dung yeu cau qua lon",
    415: "Content-Type phai la application/json",
    429: "Qua nhieu yeu cau. Thu lai sau",
    500: "Loi may chu",
  },
  th: {
    400: "คำขอไม่ถูกต้อง",
    401: "ต้องเข้าสู่ระบบ",
    403: "คำขอถูกบล็อกโดยระบบความปลอดภัย",
    404: "ไม่พบข้อมูล",
    413: "ข้อมูลคำขอใหญ่เกินไป",
    415: "Content-Type ต้องเป็น application/json",
    429: "มีคำขอมากเกินไป โปรดลองใหม่ภายหลัง",
    500: "ข้อผิดพลาดของเซิร์ฟเวอร์",
  },
  tr: {
    400: "Gecersiz istek",
    401: "Giris gerekli",
    403: "Istek guvenlik tarafindan engellendi",
    404: "Bulunamadi",
    413: "Istek govdesi cok buyuk",
    415: "Content-Type application/json olmali",
    429: "Cok fazla istek. Biraz sonra tekrar dene",
    500: "Sunucu hatasi",
  },
  it: {
    400: "Richiesta non valida",
    401: "Accesso richiesto",
    403: "Richiesta bloccata dalla sicurezza",
    404: "Non trovato",
    413: "Corpo richiesta troppo grande",
    415: "Content-Type deve essere application/json",
    429: "Troppe richieste. Riprova piu tardi",
    500: "Errore del server",
  },
  nl: {
    400: "Ongeldig verzoek",
    401: "Inloggen vereist",
    403: "Verzoek geblokkeerd door beveiliging",
    404: "Niet gevonden",
    413: "Verzoekbody is te groot",
    415: "Content-Type moet application/json zijn",
    429: "Te veel verzoeken. Probeer later opnieuw",
    500: "Serverfout",
  },
  pl: {
    400: "Nieprawidlowe zapytanie",
    401: "Wymagane logowanie",
    403: "Zapytanie zablokowane przez zabezpieczenia",
    404: "Nie znaleziono",
    413: "Cialo zapytania jest za duze",
    415: "Content-Type musi byc application/json",
    429: "Zbyt wiele zapytan. Sprobuj pozniej",
    500: "Blad serwera",
  },
};

const exactApiMessages: Partial<Record<InterfaceLanguage, Record<string, string>>> = {
  zh: {
    "Repository URL is required": "请先填写 GitHub 仓库 URL",
    "Could not run repository launch audit": "暂时无法运行仓库上线体检",
    "Missing coach prompt": "请输入要问教练的问题",
    "Content-Type must be application/json": "Content-Type 必须是 application/json",
    "Request body too large": "请求内容过大",
    "Invalid JSON body": "JSON 内容不合法",
    "Cross-origin request blocked": "跨域请求已被拦截",
    "CSRF validation failed": "CSRF 校验失败",
  },
  ja: {
    "Repository URL is required": "GitHub リポジトリ URL を入力してください",
    "Could not run repository launch audit": "リポジトリ診断を実行できませんでした",
    "Missing coach prompt": "コーチへの質問を入力してください",
    "Content-Type must be application/json": "Content-Type は application/json にしてください",
    "Request body too large": "リクエスト本文が大きすぎます",
    "Invalid JSON body": "JSON が無効です",
    "Cross-origin request blocked": "クロスオリジンリクエストはブロックされました",
    "CSRF validation failed": "CSRF 検証に失敗しました",
  },
  ar: {
    "Repository URL is required": "أدخل رابط مستودع GitHub أولا",
    "Could not run repository launch audit": "تعذر تشغيل فحص جاهزية المستودع",
    "Missing coach prompt": "اكتب سؤالا للمدرب أولا",
    "Content-Type must be application/json": "يجب أن يكون Content-Type هو application/json",
    "Request body too large": "حجم الطلب كبير جدا",
    "Invalid JSON body": "محتوى JSON غير صالح",
    "Cross-origin request blocked": "تم حظر طلب من مصدر مختلف",
    "CSRF validation failed": "فشل تحقق CSRF",
  },
};

export function resolveApiLanguage(request: NextRequest): InterfaceLanguage {
  const explicitLanguage = request.nextUrl.searchParams.get("lang");
  if (isInterfaceLanguage(explicitLanguage)) return explicitLanguage;

  for (const name of languageCookieNames) {
    const value = request.cookies.get(name)?.value;
    if (isInterfaceLanguage(value)) return value;
  }

  const accepted = request.headers.get("accept-language") || "";
  for (const item of accepted.split(",")) {
    const base = item.trim().split(";")[0]?.toLowerCase().split("-")[0];
    if (isInterfaceLanguage(base)) return base;
  }

  return "en";
}

export function localizedApiMessage(message: string, status: number, requestOrLanguage?: NextRequest | InterfaceLanguage) {
  const language = typeof requestOrLanguage === "string"
    ? requestOrLanguage
    : requestOrLanguage
      ? resolveApiLanguage(requestOrLanguage)
      : "en";

  if (language === "en") return message;
  return exactApiMessages[language]?.[message] ?? genericApiMessages[language][status] ?? genericApiMessages[language][400];
}

export function jsonError(message: string, status = 400, request?: NextRequest) {
  const localizedMessage = request ? localizedApiMessage(message, status, request) : message;
  return NextResponse.json(
    { success: false, message: localizedMessage, error: localizedMessage },
    {
      status,
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}

export function guardedJson<T>(data: T, init?: ResponseInit) {
  return NextResponse.json(data, {
    ...init,
    headers: {
      "Cache-Control": "no-store",
      ...(init?.headers ?? {}),
    },
  });
}

export async function readJsonBody<T = unknown>(
  request: NextRequest,
  maxBytes = 64 * 1024
): Promise<{ ok: true; body: T } | { ok: false; response: NextResponse }> {
  const contentType = request.headers.get("content-type") || "";
  if (!contentType.toLowerCase().includes("application/json")) {
    return { ok: false, response: jsonError("Content-Type must be application/json", 415, request) };
  }

  const contentLength = Number(request.headers.get("content-length") || "0");
  if (contentLength > maxBytes) {
    return { ok: false, response: jsonError("Request body too large", 413, request) };
  }

  try {
    const body = (await request.json()) as T;
    return { ok: true, body };
  } catch {
    return { ok: false, response: jsonError("Invalid JSON body", 400, request) };
  }
}

export function enforceRateLimit(
  request: NextRequest,
  maxRequests = 30,
  windowMs = 60_000,
  keySuffix = ""
): NextResponse | null {
  const key = `${getRateLimitKey(request)}:${keySuffix}`;
  const result = checkRateLimit(key, maxRequests, windowMs);

  if (result.allowed) return null;

  const message = localizedApiMessage("Too many requests", 429, request);
  return NextResponse.json(
    { success: false, message, error: message },
    {
      status: 429,
      headers: {
        "Retry-After": String(Math.ceil(windowMs / 1000)),
        "X-RateLimit-Reset": String(Math.ceil(result.resetTime / 1000)),
        "Cache-Control": "no-store",
      },
    }
  );
}

export function requireSameOrigin(request: NextRequest): NextResponse | null {
  if (["GET", "HEAD", "OPTIONS"].includes(request.method)) return null;

  const host = request.headers.get("host");
  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");

  try {
    if (origin && new URL(origin).host !== host) {
      return jsonError("Cross-origin request blocked", 403, request);
    }
    if (!origin && referer && new URL(referer).host !== host) {
      return jsonError("Cross-origin request blocked", 403, request);
    }
  } catch {
    return jsonError("Invalid origin", 403, request);
  }

  return null;
}

export function requireCsrf(request: NextRequest): NextResponse | null {
  if (validateCsrfRequest(request)) return null;
  return jsonError("CSRF validation failed", 403, request);
}

export async function enforceRateLimitAsync(
  request: NextRequest,
  maxRequests = 30,
  windowMs = 60_000,
  keySuffix = ""
): Promise<NextResponse | null> {
  const key = `${getRateLimitKey(request)}:${keySuffix}`;
  const result = await checkRateLimitAsync(key, maxRequests, windowMs);

  if (result.allowed) return null;

  const message = localizedApiMessage("Too many requests", 429, request);
  return NextResponse.json(
    { success: false, message, error: message },
    {
      status: 429,
      headers: {
        "Retry-After": String(Math.max(1, Math.ceil((result.resetTime - Date.now()) / 1000))),
        "X-RateLimit-Reset": String(Math.ceil(result.resetTime / 1000)),
        "Cache-Control": "no-store",
      },
    }
  );
}

export function sanitizeText(value: string, maxLength = 4000): string {
  return value
    .replace(/[\u0000-\u001f\u007f]/g, "")
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<iframe\b[^>]*>[\s\S]*?<\/iframe>/gi, "")
    .trim()
    .slice(0, maxLength);
}
