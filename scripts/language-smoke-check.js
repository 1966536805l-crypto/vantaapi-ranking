#!/usr/bin/env node

/**
 * Local multi-language smoke check for JinMing Lab.
 * Requires a running app, for example: npm run dev -- --port 3003
 */

const DEFAULT_BASE_URL = "http://127.0.0.1:3003";
const args = process.argv.slice(2);
const baseArg = args.find((arg) => arg.startsWith("--base="));
const baseUrl = (baseArg ? baseArg.slice("--base=".length) : process.env.LANGUAGE_SMOKE_BASE_URL || DEFAULT_BASE_URL).replace(/\/+$/, "");
const timeoutMs = Number(process.env.LANGUAGE_SMOKE_TIMEOUT_MS || 10_000);

let pass = 0;
let fail = 0;

function ok(name, message) {
  pass += 1;
  console.log(`OK ${name}: ${message}`);
}

function bad(name, message) {
  fail += 1;
  console.error(`FAIL ${name}: ${message}`);
}

function browserHeaders(acceptLanguage, index = 1) {
  return {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120 Safari/537.36",
    Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": acceptLanguage,
    "Sec-Fetch-Mode": "navigate",
    "Sec-Fetch-Dest": "document",
    "X-Forwarded-For": `127.0.0.${40 + index}`,
  };
}

function apiHeaders(acceptLanguage, index = 20) {
  return {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120 Safari/537.36",
    Accept: "application/json",
    "Accept-Language": acceptLanguage,
    "Content-Type": "application/json",
    Origin: baseUrl,
    "Sec-Fetch-Mode": "cors",
    "Sec-Fetch-Site": "same-origin",
    "X-Forwarded-For": `127.0.0.${40 + index}`,
  };
}

async function fetchWithTimeout(path, headers, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(`${baseUrl}${path}`, {
      ...options,
      signal: controller.signal,
      headers,
      redirect: options.redirect || "manual",
    });
  } finally {
    clearTimeout(timeout);
  }
}

async function checkApiJson(name, path, acceptLanguage, options, requiredSnippets, forbiddenSnippets, index) {
  try {
    const response = await fetchWithTimeout(path, apiHeaders(acceptLanguage, index), {
      ...options,
      redirect: "follow",
    });
    const body = await response.text();
    if (response.ok) return bad(name, `expected an error response, got HTTP ${response.status}`);

    const missing = requiredSnippets.filter((snippet) => !body.includes(snippet));
    if (missing.length) return bad(name, `missing localized JSON snippets: ${missing.join(" | ")}`);

    const exposed = forbiddenSnippets.filter((snippet) => body.includes(snippet));
    if (exposed.length) return bad(name, `unexpected English fallback snippets: ${exposed.join(" | ")}`);

    return ok(name, `${path} returned localized JSON error`);
  } catch (error) {
    bad(name, error instanceof Error ? error.message : "request failed");
  }
}

async function checkRedirect(name, acceptLanguage, expectedLocation, index) {
  try {
    const response = await fetchWithTimeout("/", browserHeaders(acceptLanguage, index));
    const location = response.headers.get("location") || "";
    if (expectedLocation) {
      if (![301, 302, 303, 307, 308].includes(response.status)) {
        return bad(name, `expected redirect to ${expectedLocation}, got HTTP ${response.status}`);
      }
      if (location !== expectedLocation) {
        return bad(name, `expected Location ${expectedLocation}, got ${location || "(empty)"}`);
      }
      return ok(name, `redirects to ${expectedLocation}`);
    }

    if (response.status !== 200) return bad(name, `expected HTTP 200, got HTTP ${response.status}`);
    return ok(name, "keeps default English entry without lang parameter");
  } catch (error) {
    bad(name, error instanceof Error ? error.message : "request failed");
  }
}

async function checkCookieRedirect(name, path, cookieLanguage, expectedLocation, index) {
  try {
    const response = await fetchWithTimeout(path, {
      ...browserHeaders(`${cookieLanguage};q=0.9,en;q=0.2`, index),
      Cookie: `jinming_language=${cookieLanguage}; vantaapi-language=${cookieLanguage}`,
    });
    const location = response.headers.get("location") || "";
    if (![301, 302, 303, 307, 308].includes(response.status)) {
      return bad(name, `expected cookie language redirect to ${expectedLocation}, got HTTP ${response.status}`);
    }
    if (location !== expectedLocation) {
      return bad(name, `expected Location ${expectedLocation}, got ${location || "(empty)"}`);
    }
    return ok(name, `cookie language redirects to ${expectedLocation}`);
  } catch (error) {
    bad(name, error instanceof Error ? error.message : "request failed");
  }
}

async function checkProtectedLanguageRedirect(name, path, acceptLanguage, expectedLocation, index) {
  try {
    const response = await fetchWithTimeout(path, browserHeaders(acceptLanguage, index));
    const location = response.headers.get("location") || "";
    if (![301, 302, 303, 307, 308].includes(response.status)) {
      return bad(name, `expected login redirect to ${expectedLocation}, got HTTP ${response.status}`);
    }
    if (location !== expectedLocation) {
      return bad(name, `expected Location ${expectedLocation}, got ${location || "(empty)"}`);
    }
    return ok(name, `protected page preserves language in ${expectedLocation}`);
  } catch (error) {
    bad(name, error instanceof Error ? error.message : "request failed");
  }
}

async function checkRetiredLanguageRedirect(name, path, acceptLanguage, expectedLocation, index) {
  try {
    const response = await fetchWithTimeout(path, browserHeaders(acceptLanguage, index));
    const location = response.headers.get("location") || "";
    if (![301, 302, 303, 307, 308].includes(response.status)) {
      return bad(name, `expected retired redirect to ${expectedLocation}, got HTTP ${response.status}`);
    }
    if (location !== expectedLocation) {
      return bad(name, `expected Location ${expectedLocation}, got ${location || "(empty)"}`);
    }
    return ok(name, `retired page preserves language in ${expectedLocation}`);
  } catch (error) {
    bad(name, error instanceof Error ? error.message : "request failed");
  }
}

async function checkPage(name, path, acceptLanguage, requiredSnippets, forbiddenSnippets, index) {
  try {
    const response = await fetchWithTimeout(path, browserHeaders(acceptLanguage, index), { redirect: "follow" });
    const body = await response.text();
    if (!response.ok) return bad(name, `HTTP ${response.status}`);

    const missing = requiredSnippets.filter((snippet) => !body.includes(snippet));
    if (missing.length) return bad(name, `missing snippets: ${missing.join(" | ")}`);

    const exposed = forbiddenSnippets.filter((snippet) => body.includes(snippet));
    if (exposed.length) return bad(name, `unexpected fallback snippets: ${exposed.join(" | ")}`);

    return ok(name, `${path} rendered expected localized markers`);
  } catch (error) {
    bad(name, error instanceof Error ? error.message : "request failed");
  }
}

function visibleText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<pre[\s\S]*?<\/pre>/gi, " ")
    .replace(/<code[\s\S]*?<\/code>/gi, " ")
    .replace(/<select[\s\S]*?<\/select>/gi, " ")
    .replace(/<nav class="programming-language-list"[\s\S]*?<\/nav>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&[^;]+;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

async function checkVisibleText(name, path, acceptLanguage, requiredSnippets, forbiddenSnippets, index) {
  try {
    const response = await fetchWithTimeout(path, browserHeaders(acceptLanguage, index), { redirect: "follow" });
    const text = visibleText(await response.text());
    if (!response.ok) return bad(name, `HTTP ${response.status}`);

    const missing = requiredSnippets.filter((snippet) => !text.includes(snippet));
    if (missing.length) return bad(name, `missing visible snippets: ${missing.join(" | ")}`);

    const exposed = forbiddenSnippets.filter((snippet) => text.includes(snippet));
    if (exposed.length) return bad(name, `unexpected visible fallback snippets: ${exposed.join(" | ")}`);

    return ok(name, `${path} rendered expected visible localized copy`);
  } catch (error) {
    bad(name, error instanceof Error ? error.message : "request failed");
  }
}

async function checkDocumentLanguage(name, path, acceptLanguage, expectedHtmlAttrs, index) {
  try {
    const response = await fetchWithTimeout(path, browserHeaders(acceptLanguage, index), { redirect: "follow" });
    const body = await response.text();
    if (!response.ok) return bad(name, `HTTP ${response.status}`);

    const htmlTag = body.match(/<html[^>]*>/)?.[0] || "";
    const missing = expectedHtmlAttrs.filter((snippet) => !htmlTag.includes(snippet));
    if (missing.length) return bad(name, `html tag ${htmlTag || "(missing)"} missing ${missing.join(" | ")}`);

    return ok(name, `document starts with ${expectedHtmlAttrs.join(" ")}`);
  } catch (error) {
    bad(name, error instanceof Error ? error.message : "request failed");
  }
}

async function checkSitemapAlternates() {
  try {
    const response = await fetchWithTimeout("/sitemap.xml", browserHeaders("en-US,en;q=0.9", 8), { redirect: "follow" });
    const body = await response.text();
    if (!response.ok) return bad("sitemap-hreflang", `HTTP ${response.status}`);

    const required = [
      "<loc>https://vantaapi.com/programming/javascript</loc>",
      "hreflang=\"ar\" href=\"https://vantaapi.com/programming/javascript?lang=ar\"",
      "hreflang=\"ja-JP\" href=\"https://vantaapi.com/tools/github-repo-analyzer?lang=ja\"",
      "<loc>https://vantaapi.com/security</loc>",
      "<loc>https://vantaapi.com/privacy</loc>",
    ];
    const missing = required.filter((snippet) => !body.includes(snippet));
    if (missing.length) return bad("sitemap-hreflang", `missing snippets: ${missing.join(" | ")}`);

    return ok("sitemap-hreflang", "core multilingual alternates are present");
  } catch (error) {
    bad("sitemap-hreflang", error instanceof Error ? error.message : "request failed");
  }
}

async function main() {
  console.log(`JinMing Lab language smoke check: ${baseUrl}\n`);

  await checkRedirect("accept-language:ja", "ja-JP,ja;q=0.9,en;q=0.2", "/?lang=ja", 1);
  await checkRedirect("accept-language:zh", "zh-CN,zh;q=0.9,en;q=0.2", "/?lang=zh", 2);
  await checkRedirect("accept-language:en", "en-US,en;q=0.9", "", 3);
  await checkCookieRedirect("cookie-language:ar-programming", "/programming/javascript", "ar", "/programming/javascript?lang=ar", 12);
  await checkCookieRedirect("cookie-language:ja-search", "/search?q=github", "ja", "/search?q=github&lang=ja", 13);
  await checkProtectedLanguageRedirect(
    "protected-language:dashboard-ar",
    "/dashboard?lang=ar",
    "ar-SA,ar;q=0.9,en;q=0.2",
    "/login?next=%2Fdashboard%3Flang%3Dar&lang=ar",
    14,
  );
  await checkProtectedLanguageRedirect(
    "protected-language:wrong-ja",
    "/wrong?lang=ja",
    "ja-JP,ja;q=0.9,en;q=0.2",
    "/login?next=%2Fwrong%3Flang%3Dja&lang=ja",
    35,
  );
  await checkProtectedLanguageRedirect(
    "protected-language:progress-ar",
    "/progress?lang=ar",
    "ar-SA,ar;q=0.9,en;q=0.2",
    "/login?next=%2Fprogress%3Flang%3Dar&lang=ar",
    36,
  );
  await checkRetiredLanguageRedirect(
    "retired-projects-ja",
    "/projects?lang=ja",
    "ja-JP,ja;q=0.9,en;q=0.2",
    "/tools/github-repo-analyzer?lang=ja",
    47,
  );
  await checkRetiredLanguageRedirect(
    "retired-cpp-errors-ar",
    "/cpp-errors?lang=ar",
    "ar-SA,ar;q=0.9,en;q=0.2",
    "/learn/cpp?lang=ar",
    48,
  );
  await checkRetiredLanguageRedirect(
    "retired-category-ja",
    "/category/old?lang=ja",
    "ja-JP,ja;q=0.9,en;q=0.2",
    "/?lang=ja",
    49,
  );
  await checkVisibleText(
    "home-ar-visible-copy",
    "/?lang=ar",
    "ar-SA,ar;q=0.9,en;q=0.2",
    ["تدقيق GitHub قبل الإطلاق", "ألصق المستودع واعرف عوائق الإطلاق", "تشغيل التدقيق", "عرض أدوات المطور", "فتح البرمجة"],
    ["Paste a GitHub repo", "Run Audit", "Developer tools", "Open coding"],
    33,
  );

  await checkPage(
    "programming-ar",
    "/programming/javascript?lang=ar",
    "ar-SA,ar;q=0.9,en;q=0.2",
    ["ما هي JavaScript", "التعريف أولا", "تطبيقات الويب والأتمتة وربط الواجهات", "قيد التوسيع", "مدخلات مخرجات return", "أدوات المطور", "الذكاء الاصطناعي للكود", "ذكاء اصطناعي سريع", "ابحث عن لغة", "53 من 53", "Enter يفتح أول نتيجة", "بنك الأسئلة", "ابحث ثم تدرب", "hrefLang=\"ar\"", "https://vantaapi.com/programming/javascript?lang=ar", "/programming/python?lang=ar"],
    ["What is JavaScript", "Full screen", "input output return reusable actions", "DevTools", "AI للكود", "AI سريع", "Question bank", "Search before practice", "لغة لتطبيقات الويب", "مناسب لـ لغة"],
    4,
  );
  await checkVisibleText(
    "programming-ar-visible-copy",
    "/programming/javascript?lang=ar",
    "ar-SA,ar;q=0.9,en;q=0.2",
    ["ما هي JavaScript", "س 1", "أدوات المطور", "الذكاء الاصطناعي للكود", "ذكاء اصطناعي سريع", "بنك الأسئلة"],
    ["What is JavaScript", "Definition first", "Full screen", "Q 1", "DevTools", "Question bank", "AI للكود", "AI سريع"],
    30,
  );
  await checkPage(
    "programming-javascript-zh",
    "/programming/javascript?lang=zh",
    "zh-CN,zh;q=0.9,en;q=0.2",
    ["JavaScript 是什么", "先定义", "开发者工具", "编程陪练", "编程题库", "先搜题 再练习"],
    ["What is JavaScript", "Definition first", "DevTools", "Code AI", "Question bank", "Search before practice"],
    26,
  );
  await checkPage(
    "programming-javascript-ja",
    "/programming/javascript?lang=ja",
    "ja-JP,ja;q=0.9,en;q=0.2",
    ["JavaScript とは何か", "まず定義", "開発者ツール", "プログラミング コンパニオン", "問題バンク", "検索してから練習"],
    ["What is JavaScript", "Definition first", "DevTools", "Code AI", "Question bank", "Search before practice"],
    27,
  );
  await checkPage(
    "programming-rust-ar",
    "/programming/rust?lang=ar",
    "ar-SA,ar;q=0.9,en;q=0.2",
    ["ما هي Rust", "نقطة الدخول", "الربط والقيم", "نتائج الأخطاء", "fn main هي نقطة بدء برنامج Rust", "main هي نقطة الدخول", "println! ماكرو للطباعة"],
    ["Entry", "Bindings", "fn main starts a Rust binary", "main is the entry point", "Use braces for blocks"],
    20,
  );
  await checkPage(
    "programming-python-ar",
    "/programming/python?lang=ar",
    "ar-SA,ar;q=0.9,en;q=0.2",
    ["ما هي Python", "المتغيرات", "الحلقات", "تعريف الدالة", "استخدم def", "المسافات البادئة مهمة", "مر على القيم مباشرة"],
    ["Variables", "Loops", "function definition", "Use def to name work", "Indentation matters"],
    21,
  );
  await checkPage(
    "programming-sql-ar",
    "/programming/sql?lang=ar",
    "ar-SA,ar;q=0.9,en;q=0.2",
    ["ما هي SQL", "اختيار البيانات", "تصفية البيانات", "تجميع البيانات", "اختر الأعمدة المطلوبة فقط"],
    ["Select only needed columns", "Filter", "Group", "Read from one table first"],
    22,
  );
  await checkPage(
    "programming-hub-ar",
    "/programming?lang=ar",
    "ar-SA,ar;q=0.9,en;q=0.2",
    ["ابحث عن لغة", "53 من 53", 'placeholder="Python أتمتة SQL بيانات Rust أمان"', "/programming/javascript?lang=ar"],
    ["مناسب لـ لغة", "لغة لتطبيقات"],
    18,
  );
  await checkPage(
    "programming-hub-ja",
    "/programming?lang=ja",
    "ja-JP,ja;q=0.9,en;q=0.2",
    ["言語を探す", "53 / 53", "プログラミング教材", "/programming/javascript?lang=ja"],
    ["プログラミング教程"],
    19,
  );
  await checkPage(
    "programming-rust-ja",
    "/programming/rust?lang=ja",
    "ja-JP,ja;q=0.9,en;q=0.2",
    ["Rust とは", "エントリ", "束縛", "Result の扱い", "fn main は Rust バイナリの入口になる", "main は入口", "println! はマクロ"],
    ["Entry", "Bindings", "fn main starts a Rust binary", "main is the entry point", "Use braces for blocks"],
    23,
  );
  await checkPage(
    "programming-python-ja",
    "/programming/python?lang=ja",
    "ja-JP,ja;q=0.9,en;q=0.2",
    ["Python とは", "変数", "ループ", "関数定義", "def で再利用できる関数を作る", "インデントは重要", "値を直接ループする"],
    ["Variables", "Loops", "function definition", "Use def to name work", "Indentation matters"],
    24,
  );
  await checkPage(
    "programming-sql-ja",
    "/programming/sql?lang=ja",
    "ja-JP,ja;q=0.9,en;q=0.2",
    ["SQL とは", "列の選択", "データを絞り込む", "データを集計する", "必要な列だけを選ぶ"],
    ["Select only needed columns", "Filter", "Group", "Read from one table first"],
    25,
  );
  await checkDocumentLanguage(
    "document-language:programming-ar",
    "/programming/javascript?lang=ar",
    "ar-SA,ar;q=0.9,en;q=0.2",
    ['lang="ar"', 'dir="rtl"'],
    17,
  );

  await checkPage(
    "programming-ar-fallback",
    "/programming/elixir?lang=ar",
    "ar-SA,ar;q=0.9,en;q=0.2",
    ["ما هي Elixir", "مسار عملي لتعلم Elixir من الصفر", "تعلم جزءا صغيرا من Elixir", "/programming/erlang?lang=ar"],
    ["typed BEAM services", "Learn one small", "Definition first"],
    11,
  );

  await checkPage(
    "world-languages-hub-ja",
    "/languages?lang=ja",
    "ja-JP,ja;q=0.9,en;q=0.2",
    ["世界の言語 ゼロ基礎", "どの言語もゼロから始める", "言語を検索", "/languages/japanese?lang=ja"],
    ["世界语言从 0 开始", "搜索语言"],
    45,
  );
  await checkPage(
    "world-languages-hub-es",
    "/languages?lang=es",
    "es-ES,es;q=0.9,en;q=0.2",
    ["Idiomas del mundo desde cero", "Empieza cualquier idioma desde cero", "Buscar idioma", "/languages/japanese?lang=es"],
    ["Start any world language from zero", "World Language Map", "世界语言从 0 开始"],
    62,
  );
  await checkPage(
    "world-languages-hub-de",
    "/languages?lang=de",
    "de-DE,de;q=0.9,en;q=0.2",
    ["Weltsprachen von null", "Jede Sprache von null starten", "Sprache suchen", "/languages/japanese?lang=de"],
    ["Start any world language from zero", "World Language Map", "世界语言从 0 开始"],
    63,
  );
  await checkPage(
    "world-language-detail-ar",
    "/languages/english?lang=ar",
    "ar-SA,ar;q=0.9,en;q=0.2",
    ["من الصفر", "أول ثلاث عبارات", "مدرب الدرس الأول", "اكتب هذه العبارة", "/languages?lang=ar"],
    ["返回语言列表", "第一课训练器", "打出这句"],
    46,
  );
  await checkPage(
    "world-language-detail-es",
    "/languages/japanese?lang=es",
    "es-ES,es;q=0.9,en;q=0.2",
    ["Volver a idiomas", "desde cero", "Primeras tres frases", "Entrenador de primera leccion", "Escribe esta frase", "Orden desde cero"],
    ["Back to languages", "First three phrases", "First lesson trainer", "Type this phrase"],
    64,
  );
  await checkPage(
    "world-language-detail-de",
    "/languages/spanish?lang=de",
    "de-DE,de;q=0.9,en;q=0.2",
    ["Zurueck zu Sprachen", "von null", "Erste drei Saetze", "Trainer erste Lektion", "Diesen Satz tippen", "Null Basis Reihenfolge"],
    ["Back to languages", "First three phrases", "First lesson trainer", "Type this phrase"],
    65,
  );
  await checkPage(
    "world-language-detail-hi",
    "/languages/english?lang=hi",
    "hi-IN,hi;q=0.9,en;q=0.2",
    ["भाषा सूची पर वापस", "शून्य आधार", "पहले तीन वाक्य", "पहला पाठ प्रशिक्षक", "यह वाक्य टाइप करें"],
    ["Back to languages", "First three phrases", "First lesson trainer", "Type this phrase"],
    66,
  );
  await checkPage(
    "world-language-detail-id",
    "/languages/japanese?lang=id",
    "id-ID,id;q=0.9,en;q=0.2",
    ["Kembali ke daftar bahasa", "dari nol", "Tiga frasa pertama", "Pelatih pelajaran pertama", "Ketik frasa ini"],
    ["Back to languages", "First three phrases", "First lesson trainer", "Type this phrase"],
    67,
  );
  await checkPage(
    "world-language-detail-vi",
    "/languages/korean?lang=vi",
    "vi-VN,vi;q=0.9,en;q=0.2",
    ["Quay lại danh sách ngôn ngữ", "từ con số không", "Ba câu đầu tiên", "Huấn luyện bài đầu", "Gõ câu này"],
    ["Back to languages", "First three phrases", "First lesson trainer", "Type this phrase"],
    68,
  );
  await checkPage(
    "world-language-detail-th",
    "/languages/thai?lang=th",
    "th-TH,th;q=0.9,en;q=0.2",
    ["กลับไปยังรายการภาษา", "เริ่มจากศูนย์", "สามประโยคแรก", "ครูฝึกบทแรก", "พิมพ์ประโยคนี้"],
    ["Back to languages", "First three phrases", "First lesson trainer", "Type this phrase"],
    69,
  );
  await checkPage(
    "world-language-detail-tr",
    "/languages/turkish?lang=tr",
    "tr-TR,tr;q=0.9,en;q=0.2",
    ["Diller listesine dön", "sıfırdan", "İlk üç cümle", "İlk ders antrenörü", "Bu cümleyi yaz"],
    ["Back to languages", "First three phrases", "First lesson trainer", "Type this phrase"],
    70,
  );
  await checkPage(
    "world-language-detail-it",
    "/languages/italian?lang=it",
    "it-IT,it;q=0.9,en;q=0.2",
    ["Torna alle lingue", "da zero", "Prime tre frasi", "Allenatore prima lezione", "Digita questa frase"],
    ["Back to languages", "First three phrases", "First lesson trainer", "Type this phrase"],
    71,
  );
  await checkPage(
    "world-language-detail-nl",
    "/languages/dutch?lang=nl",
    "nl-NL,nl;q=0.9,en;q=0.2",
    ["Terug naar talen", "vanaf nul", "Eerste drie zinnen", "Eerste les trainer", "Typ deze zin"],
    ["Back to languages", "First three phrases", "First lesson trainer", "Type this phrase"],
    72,
  );
  await checkPage(
    "world-language-detail-pl",
    "/languages/polish?lang=pl",
    "pl-PL,pl;q=0.9,en;q=0.2",
    ["Wróć do języków", "od zera", "Pierwsze trzy zdania", "Trener pierwszej lekcji", "Wpisz to zdanie"],
    ["Back to languages", "First three phrases", "First lesson trainer", "Type this phrase"],
    73,
  );

  await checkPage(
    "github-audit-de",
    "/tools/github-repo-analyzer?lang=de",
    "de-DE,de;q=0.9,en;q=0.2",
    ["Bereit fuer Audit", "Repo auditieren", "Ergebnis", "hrefLang=\"de-DE\"", "https://vantaapi.com/tools/github-repo-analyzer?lang=de"],
    ["Ready to audit", "Audit repo", "GENERATED"],
    5,
  );

  await checkPage(
    "search-ja",
    "/search?lang=ja&q=github",
    "ja-JP,ja;q=0.9,en;q=0.2",
    ["開発者ツール検索", "GitHub 公開前監査", "hrefLang=\"ja-JP\"", "https://vantaapi.com/search?lang=ja", "/tools/github-repo-analyzer?lang=ja"],
    ["Developer Tool Search", "Run GitHub Launch Audit"],
    6,
  );
  await checkVisibleText(
    "search-de-visible-copy",
    "/search?lang=de&q=github",
    "de-DE,de;q=0.9,en;q=0.2",
    ["Entwickler Tool Suche", "Startprüfungen KI Werkzeuge", "KI Werkzeuge", "Programmierlabor", "GitHub Prüfung starten"],
    ["AI Tools", "Coding Lab", "Run GitHub Launch Audit"],
    74,
  );
  await checkVisibleText(
    "search-hi-visible-copy",
    "/search?lang=hi&q=github",
    "hi-IN,hi;q=0.9,en;q=0.2",
    ["डेवलपर टूल खोज", "AI उपकरण", "कोडिंग लैब", "सार्वजनिक प्रवेश", "स्थानीय सूचकांक"],
    ["AI Tools", "Coding Lab", "public entries", "local index"],
    75,
  );
  await checkVisibleText(
    "search-th-visible-copy",
    "/search?lang=th&q=github",
    "th-TH,th;q=0.9,en;q=0.2",
    ["ค้นหาเครื่องมือนักพัฒนา", "เครื่องมือ AI", "แล็บเขียนโค้ด", "รันตรวจ GitHub"],
    ["AI Tools", "Coding Lab", "Developer Tool Search", "GitHub audit"],
    76,
  );
  await checkVisibleText(
    "search-nl-visible-copy",
    "/search?lang=nl&q=github",
    "nl-NL,nl;q=0.9,en;q=0.2",
    ["Developer tool zoeken", "AI gereedschap", "Programmeerlab", "GitHub controle starten"],
    ["AI Tools", "Coding Lab", "Run GitHub Launch Audit"],
    77,
  );
  await checkVisibleText(
    "search-vi-visible-copy",
    "/search?lang=vi&q=github",
    "vi-VN,vi;q=0.9,en;q=0.2",
    ["Tìm công cụ lập trình", "Tìm kiểm tra ra mắt", "Chạy kiểm tra GitHub", "chỉ mục cục bộ"],
    ["Tìm công cụ developer", "GitHub audit", "chỉ mục local", "Developer Tool Search"],
    78,
  );
  await checkVisibleText(
    "search-tr-visible-copy",
    "/search?lang=tr&q=github",
    "tr-TR,tr;q=0.9,en;q=0.2",
    ["Geliştirici araç arama", "GitHub denetimi çalıştır", "Kod laboratuvarı", "açık girişler"],
    ["GitHub audit çalıştır", "Kod Lab", "Developer Tool Search"],
    79,
  );
  await checkVisibleText(
    "search-pl-visible-copy",
    "/search?lang=pl&q=github",
    "pl-PL,pl;q=0.9,en;q=0.2",
    ["Wyszukiwarka narzędzi", "Uruchom audyt GitHub", "Narzędzia AI", "Programowanie"],
    ["GitHub audit", "Developer Tool Search", "Run GitHub Launch Audit"],
    80,
  );
  await checkPage(
    "today-ja-language-links",
    "/today?lang=ja",
    "ja-JP,ja;q=0.9,en;q=0.2",
    ["/?lang=ja", "/programming?lang=ja", "/english/typing?lang=ja", "/wrong?lang=ja", "/today?lang=ja"],
    ["/english/typing?lang=zh", "/english/vocabulary?lang=zh", "/wrong?lang=zh", "/programming?lang=zh"],
    34,
  );
  await checkVisibleText(
    "today-ja-visible-copy",
    "/today?lang=ja",
    "ja-JP,ja;q=0.9,en;q=0.2",
    ["今日の学習", "今日の進捗", "英語ディクテーション入力", "明日の予告"],
    ["今日学习", "先复习", "连贯的", "基础设施", "Today Plan", "Today Progress"],
    50,
  );
  await checkVisibleText(
    "today-ar-visible-copy",
    "/today?lang=ar",
    "ar-SA,ar;q=0.9,en;q=0.2",
    ["خطة اليوم", "تقدم اليوم", "إملاء إنجليزي بالكتابة", "معاينة الغد"],
    ["今日学习", "先复习", "连贯的", "基础设施", "Today Plan", "Today Progress"],
    51,
  );
  await checkPage(
    "today-ja-clean-payload",
    "/today?lang=ja",
    "ja-JP,ja;q=0.9,en;q=0.2",
    ["今日の学習", "cohesive essay/community"],
    ["meaningZh\":\"连贯的", "初一原创英语文章", "雅思原创题库", "考研英语"],
    52,
  );
  await checkPage(
    "english-hub-ja",
    "/english?lang=ja",
    "ja-JP,ja;q=0.9,en;q=0.2",
    ["英語トレーニングセンター", "英語ディクテーション", "/learn/english?lang=ja", "/english/vocabulary?lang=ja"],
    ["Programming Training Hub", "C++ Core Track"],
    39,
  );
  await checkPage(
    "english-hub-es",
    "/english?lang=es",
    "es-ES,es;q=0.9,en;q=0.2",
    ["Centro de entrenamiento de ingles", "Dictado en ingles", "/learn/english?lang=es", "/english/vocabulary?lang=es"],
    ["English Training Center", "英語トレーニングセンター", "مركز تدريب الإنجليزية"],
    53,
  );
  await checkPage(
    "english-hub-de",
    "/english?lang=de",
    "de-DE,de;q=0.9,en;q=0.2",
    ["Englisch Trainingszentrum", "Englisches Diktat", "/learn/english?lang=de", "/english/vocabulary?lang=de"],
    ["English Training Center", "英語トレーニングセンター", "مركز تدريب الإنجليزية"],
    54,
  );
  await checkPage(
    "cpp-hub-ar",
    "/cpp?lang=ar",
    "ar-SA,ar;q=0.9,en;q=0.2",
    ["مركز تدريب C++", "بنك أسئلة C++ مصنف", "/learn/cpp?lang=ar", "/cpp/quiz/mega-1000?lang=ar"],
    ["C++ Training Hub", "Question Bank", "/cpp/quiz/mega-1000\""],
    40,
  );
  await checkPage(
    "cpp-hub-es",
    "/cpp?lang=es",
    "es-ES,es;q=0.9,en;q=0.2",
    ["Centro de entrenamiento C++", "Banco de preguntas C++", "/learn/cpp?lang=es", "/cpp/quiz/mega-1000?lang=es"],
    ["C++ Training Hub", "C++ トレーニングハブ", "مركز تدريب C++"],
    55,
  );
  await checkPage(
    "cpp-hub-de",
    "/cpp?lang=de",
    "de-DE,de;q=0.9,en;q=0.2",
    ["C++ Trainingszentrum", "C++ Fragenbank", "/learn/cpp?lang=de", "/cpp/quiz/mega-1000?lang=de"],
    ["C++ Training Hub", "C++ トレーニングハブ", "مركز تدريب C++"],
    56,
  );
  await checkPage(
    "cpp-basics-ja",
    "/cpp/basics?lang=ja",
    "ja-JP,ja;q=0.9,en;q=0.2",
    ["構文と型", "中心範囲", "問題形式", "/cpp/quiz/basics?lang=ja"],
    ["Syntax And Types", "Core scope", "Question types", "/cpp/quiz/basics\""],
    41,
  );
  await checkPage(
    "cpp-basics-es",
    "/cpp/basics?lang=es",
    "es-ES,es;q=0.9,en;q=0.2",
    ["Sintaxis y tipos", "Alcance central", "Tipos de pregunta", "/cpp/quiz/basics?lang=es"],
    ["Syntax And Types", "構文と型", "الصياغة والأنواع", "/cpp/quiz/basics\""],
    57,
  );
  await checkPage(
    "cpp-oop-de",
    "/cpp/oop?lang=de",
    "de-DE,de;q=0.9,en;q=0.2",
    ["Objektorientiertes C++", "Kernkonzepte", "Trainingsziel", "/cpp/quiz/oop?lang=de"],
    ["Object Oriented C++", "オブジェクト指向 C++", "البرمجة الكائنية في C++", "/cpp/quiz/oop\""],
    58,
  );
  await checkPage(
    "cpp-stl-ar",
    "/cpp/stl?lang=ar",
    "ar-SA,ar;q=0.9,en;q=0.2",
    ["حاويات STL", "الحاويات", "التدريب", "/cpp/quiz/stl?lang=ar"],
    ["STL Containers", "Containers", "Practice", "/cpp/quiz/stl\""],
    42,
  );
  await checkPage(
    "cpp-algorithms-fr",
    "/cpp/algorithms?lang=fr",
    "fr-FR,fr;q=0.9,en;q=0.2",
    ["Bases des algorithmes", "Premier perimetre", "Perimetre plus tard", "/cpp/quiz/algorithms?lang=fr"],
    ["Algorithm Basics", "基礎アルゴリズム", "أساسيات الخوارزميات", "/cpp/quiz/algorithms\""],
    59,
  );
  await checkPage(
    "cpp-quiz-ar",
    "/cpp/quiz/mega-1000?lang=ar&q=vector",
    "ar-SA,ar;q=0.9,en;q=0.2",
    ["بحث أسئلة C++", "تصنيف المواضيع", "جدول الأسئلة", "تدرب على المجموعة المحددة"],
    ["C++ Question Search", "Topic categories", "Question table", "Practice selected set"],
    43,
  );
  await checkPage(
    "cpp-quiz-es",
    "/cpp/quiz/mega-1000?lang=es&category=syntax-types",
    "es-ES,es;q=0.9,en;q=0.2",
    ["Buscador de preguntas C++", "Sintaxis y tipos", "Tabla de preguntas", "Preguntas encontradas"],
    ["C++ Question Search", "Topic categories", "变量", "注意整数除法"],
    60,
  );
  await checkPage(
    "cpp-quiz-practice-ja",
    "/cpp/quiz/mega-1000?lang=ja&mode=practice&type=MULTIPLE_CHOICE",
    "ja-JP,ja;q=0.9,en;q=0.2",
    ["練習モード", "現在のセット", "選択問題"],
    ["Practice mode", "Current set", "Exercise 1", "Multiple choice"],
    44,
  );
  await checkPage(
    "cpp-quiz-practice-de",
    "/cpp/quiz/mega-1000?lang=de&mode=practice&category=syntax-types&type=CODE_READING",
    "de-DE,de;q=0.9,en;q=0.2",
    ["Uebungsmodus", "Aktuelles Set", "Aufgabe", "Code lesen", "Integer division"],
    ["Practice mode", "Current set", "Score", "注意整数除法"],
    61,
  );
  await checkPage(
    "learn-english-ja",
    "/learn/english?lang=ja",
    "ja-JP,ja;q=0.9,en;q=0.2",
    ["学習パス", "/learn/english", "?lang=ja"],
    ["Learning Path", "Wrong Bank", "Progress"],
    37,
  );
  await checkPage(
    "learn-cpp-ar",
    "/learn/cpp?lang=ar",
    "ar-SA,ar;q=0.9,en;q=0.2",
    ["مسار التعلم", "دفتر الأخطاء", "?lang=ar"],
    ["Learning Path", "Wrong Bank", "Progress"],
    38,
  );

  await checkPage(
    "prompt-ar",
    "/tools/prompt-optimizer?lang=ar",
    "ar-SA,ar;q=0.9,en;q=0.2",
    ["محسن Prompt بالذكاء الاصطناعي", "يحول الطلب الخام", "مثال ابن صفحة"],
    ["AI Prompt Optimizer", "Turn a rough request into"],
    7,
  );
  await checkPage(
    "tools-ar",
    "/tools?lang=ar",
    "ar-SA,ar;q=0.9,en;q=0.2",
    ["أدوات الذكاء الاصطناعي للمطورين", "هل يعمل إذا كان الذكاء الاصطناعي ضعيفا", "ما الفرق عن جعل الذكاء الاصطناعي يقرأ الكود"],
    ["أدوات AI", "AI ضعيفا", "AI قوي", "خطة تعلم البرمجة AI"],
    28,
  );
  await checkVisibleText(
    "tools-ar-visible-copy",
    "/tools?lang=ar",
    "ar-SA,ar;q=0.9,en;q=0.2",
    ["أدوات الذكاء الاصطناعي للمطورين", "هل يعمل إذا كان الذكاء الاصطناعي ضعيفا", "ما الفرق عن جعل الذكاء الاصطناعي يقرأ الكود"],
    ["أدوات AI", "AI ضعيفا", "AI قوي", "خطة تعلم البرمجة AI"],
    31,
  );
  await checkVisibleText(
    "tools-vi-visible-copy",
    "/tools?lang=vi",
    "vi-VN,vi;q=0.9,en;q=0.2",
    ["Công cụ AI cho lập trình viên", "Kiểm tra ra mắt GitHub", "Sẵn sàng kiểm tra", "Báo cáo sẵn sàng ra mắt", "Cần GitHub token không"],
    ["Cong cu", "Quy trinh", "Kiem tra ra mat", "San sang kiem tra", "Bao cao san sang ra mat"],
    81,
  );
  await checkVisibleText(
    "tools-tr-visible-copy",
    "/tools?lang=tr",
    "tr-TR,tr;q=0.9,en;q=0.2",
    ["Geliştiriciler için AI araçları", "GitHub yayın denetimi", "Denetime hazır", "Yayın hazırlık raporu", "GitHub token gerekir mi"],
    ["Yayin", "gelistirici", "araclari", "yapistir", "Denetime hazir"],
    82,
  );
  await checkVisibleText(
    "tools-nl-visible-copy",
    "/tools?lang=nl",
    "nl-NL,nl;q=0.9,en;q=0.2",
    ["AI gereedschap voor ontwikkelaars", "GitHub publicatiecontrole", "Klaar voor controle", "Publicatie gereedheidsrapport", "Is GitHub token nodig"],
    ["AI developer tools", "Launch flow", "launch audit"],
    83,
  );
  await checkVisibleText(
    "tools-pl-visible-copy",
    "/tools?lang=pl",
    "pl-PL,pl;q=0.9,en;q=0.2",
    ["Narzędzia AI dla programistów", "GitHub audyt publikacji", "Raport gotowości publikacji", "Czy potrzeba GitHub token"],
    ["developerow", "gotowosci", "Utworz", "Bugow", "Podglad raportu"],
    84,
  );
  await checkVisibleText(
    "tools-hi-visible-copy",
    "/tools?lang=hi",
    "hi-IN,hi;q=0.9,en;q=0.2",
    ["डेवलपर के लिए AI उपकरण", "GitHub लॉन्च जांच", "जांच के लिए तैयार", "GitHub token चाहिए"],
    ["AI डेवलपर टूल्स", "लॉन्च फ्लो", "Audit के लिए तैयार", "Code Explainer"],
    85,
  );
  await checkPage(
    "search-ar",
    "/search?lang=ar&q=github",
    "ar-SA,ar;q=0.9,en;q=0.2",
    ["أدوات الذكاء الاصطناعي", "خطة تعلم البرمجة بالذكاء الاصطناعي", "نتائج لـ"],
    ["أدوات AI", "خطة تعلم البرمجة AI"],
    29,
  );
  await checkVisibleText(
    "search-ar-visible-copy",
    "/search?lang=ar&q=github",
    "ar-SA,ar;q=0.9,en;q=0.2",
    ["أدوات الذكاء الاصطناعي", "خطة تعلم البرمجة بالذكاء الاصطناعي", "نتائج لـ"],
    ["أدوات AI", "خطة تعلم البرمجة AI"],
    32,
  );

  await checkPage(
    "login-ar",
    "/login?lang=ar",
    "ar-SA,ar;q=0.9,en;q=0.2",
    ["تسجيل الدخول", "البريد الإلكتروني", "كلمة المرور", "العودة للرئيسية"],
    ["Sign in", "Welcome back", "Password"],
    15,
  );

  await checkPage(
    "login-ja",
    "/login?lang=ja",
    "ja-JP,ja;q=0.9,en;q=0.2",
    ["ログイン", "メール", "パスワード", "ホームへ戻る"],
    ["Sign in", "Welcome back", "Password"],
    16,
  );

  await checkApiJson(
    "api-github-ja",
    "/api/tools/github-repo-analyzer?lang=ja",
    "ja-JP,ja;q=0.9,en;q=0.2",
    { method: "POST", body: "{}" },
    ["GitHub リポジトリ URL を入力してください"],
    ["Repository URL is required", "Invalid request"],
    9,
  );

  await checkApiJson(
    "api-questions-ar",
    "/api/questions?lang=ar",
    "ar-SA,ar;q=0.9,en;q=0.2",
    { method: "GET" },
    ["طلب غير صالح"],
    ["lessonId is required", "Invalid request"],
    10,
  );

  await checkSitemapAlternates();

  console.log(`\nSummary: pass=${pass} fail=${fail}`);
  if (fail > 0) process.exit(1);
}

main().catch((error) => {
  bad("language-smoke", error instanceof Error ? error.message : "unknown failure");
  console.log(`\nSummary: pass=${pass} fail=${fail}`);
  process.exit(1);
});
