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
    ["ما هي JavaScript", "التعريف أولا", "تطبيقات الويب والأتمتة وربط الواجهات", "قيد التوسيع", "مدخلات مخرجات return", "أدوات المطور", "الذكاء الاصطناعي للكود", "ذكاء اصطناعي سريع", "ابحث عن لغة", "53 من 53", "Enter يفتح أول نتيجة", "hrefLang=\"ar\"", "https://vantaapi.com/programming/javascript?lang=ar", "/programming/python?lang=ar"],
    ["What is JavaScript", "Full screen", "input output return reusable actions", "DevTools", "AI للكود", "AI سريع", "لغة لتطبيقات الويب", "مناسب لـ لغة"],
    4,
  );
  await checkVisibleText(
    "programming-ar-visible-copy",
    "/programming/javascript?lang=ar",
    "ar-SA,ar;q=0.9,en;q=0.2",
    ["ما هي JavaScript", "س 1", "أدوات المطور", "الذكاء الاصطناعي للكود", "ذكاء اصطناعي سريع"],
    ["What is JavaScript", "Definition first", "Full screen", "Q 1", "DevTools", "AI للكود", "AI سريع"],
    30,
  );
  await checkPage(
    "programming-javascript-zh",
    "/programming/javascript?lang=zh",
    "zh-CN,zh;q=0.9,en;q=0.2",
    ["JavaScript 是什么", "先定义", "开发者工具", "编程陪练"],
    ["What is JavaScript", "Definition first", "DevTools", "Code AI"],
    26,
  );
  await checkPage(
    "programming-javascript-ja",
    "/programming/javascript?lang=ja",
    "ja-JP,ja;q=0.9,en;q=0.2",
    ["JavaScript とは何か", "まず定義", "開発者ツール", "プログラミング コンパニオン"],
    ["What is JavaScript", "Definition first", "DevTools", "Code AI"],
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
    "world-language-detail-ar",
    "/languages/english?lang=ar",
    "ar-SA,ar;q=0.9,en;q=0.2",
    ["من الصفر", "أول ثلاث عبارات", "مدرب الدرس الأول", "اكتب هذه العبارة", "/languages?lang=ar"],
    ["返回语言列表", "第一课训练器", "打出这句"],
    46,
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
    "cpp-stl-ar",
    "/cpp/stl?lang=ar",
    "ar-SA,ar;q=0.9,en;q=0.2",
    ["حاويات STL", "الحاويات", "التدريب", "/cpp/quiz/stl?lang=ar"],
    ["STL Containers", "Containers", "Practice", "/cpp/quiz/stl\""],
    42,
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
    "cpp-quiz-practice-ja",
    "/cpp/quiz/mega-1000?lang=ja&mode=practice&type=MULTIPLE_CHOICE",
    "ja-JP,ja;q=0.9,en;q=0.2",
    ["練習モード", "現在のセット", "選択問題"],
    ["Practice mode", "Current set", "Exercise 1", "Multiple choice"],
    44,
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
