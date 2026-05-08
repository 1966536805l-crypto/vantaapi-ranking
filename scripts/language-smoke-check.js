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

  await checkPage(
    "programming-ar",
    "/programming/javascript?lang=ar",
    "ar-SA,ar;q=0.9,en;q=0.2",
    ["ما هي JavaScript", "التعريف أولا", "تطبيقات الويب والأتمتة وربط الواجهات", "قيد التوسيع", "مدخلات مخرجات return", "hrefLang=\"ar\"", "https://vantaapi.com/programming/javascript?lang=ar", "/programming/python?lang=ar"],
    ["What is JavaScript", "Full screen", "input output return reusable actions", "لغة لتطبيقات الويب", "مناسب لـ لغة"],
    4,
  );
  await checkPage(
    "programming-hub-ar",
    "/programming?lang=ar",
    "ar-SA,ar;q=0.9,en;q=0.2",
    ["ابحث عن لغة", "53 من 53", 'placeholder="Python JavaScript Rust SQL Bash"', "/programming/javascript?lang=ar"],
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
    "prompt-ar",
    "/tools/prompt-optimizer?lang=ar",
    "ar-SA,ar;q=0.9,en;q=0.2",
    ["محسن Prompt بالذكاء الاصطناعي", "يحول الطلب الخام", "مثال ابن صفحة"],
    ["AI Prompt Optimizer", "Turn a rough request into"],
    7,
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
