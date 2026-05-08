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

async function main() {
  console.log(`JinMing Lab language smoke check: ${baseUrl}\n`);

  await checkRedirect("accept-language:ja", "ja-JP,ja;q=0.9,en;q=0.2", "/?lang=ja", 1);
  await checkRedirect("accept-language:zh", "zh-CN,zh;q=0.9,en;q=0.2", "/?lang=zh", 2);
  await checkRedirect("accept-language:en", "en-US,en;q=0.9", "", 3);

  await checkPage(
    "programming-ar",
    "/programming/javascript?lang=ar",
    "ar-SA,ar;q=0.9,en;q=0.2",
    ["ما هي JavaScript", "التعريف أولا", "مدخلات مخرجات return", "hrefLang=\"ar\"", "https://vantaapi.com/programming/javascript?lang=ar", "/programming/python?lang=ar"],
    ["What is JavaScript", "Full screen", "input output return reusable actions"],
    4,
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

  console.log(`\nSummary: pass=${pass} fail=${fail}`);
  if (fail > 0) process.exit(1);
}

main().catch((error) => {
  bad("language-smoke", error instanceof Error ? error.message : "unknown failure");
  console.log(`\nSummary: pass=${pass} fail=${fail}`);
  process.exit(1);
});
