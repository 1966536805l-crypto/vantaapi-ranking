import { NextRequest, NextResponse } from "next/server";

export const supportedSiteLanguages = ["en", "zh", "ja", "ko", "es", "fr", "de", "pt", "ru", "ar", "hi", "id", "vi", "th", "tr", "it", "nl", "pl"] as const;
export type SiteLanguage = (typeof supportedSiteLanguages)[number];

const languageCookieNames = ["jinming_language", "vantaapi-language"];

export function readLanguageCookie(request: NextRequest): SiteLanguage | null {
  for (const name of languageCookieNames) {
    const value = request.cookies.get(name)?.value;
    if (isSupportedSiteLanguage(value)) return value;
  }
  return null;
}

export function preferredLanguageFromHeader(request: NextRequest): SiteLanguage | null {
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

export function isSupportedSiteLanguage(value: string | undefined | null): value is SiteLanguage {
  return supportedSiteLanguages.some((language) => language === value);
}

export function writeLanguageCookies(response: NextResponse, language: SiteLanguage) {
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

export function withLanguagePreference(response: NextResponse, request: NextRequest) {
  const language = request.nextUrl.searchParams.get("lang");
  if (isSupportedSiteLanguage(language)) {
    return writeLanguageCookies(response, language);
  }
  return response;
}

export function securityLanguage(request: NextRequest): SiteLanguage {
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

export function localizedSecurityMessage(message: string, status: number, language: SiteLanguage) {
  if (language === "en") return message;
  return localizedExactSecurityMessages[language]?.[message] ?? localizedStatusMessages[language][status] ?? localizedStatusMessages[language][400];
}
