export type SiteLanguage = "en" | "zh";

export type PageSearchParams = Record<string, string | string[] | undefined>;

export function resolveLanguage(searchParams?: PageSearchParams | null): SiteLanguage {
  const value = searchParams?.lang;
  const lang = Array.isArray(value) ? value[0] : value;
  return lang === "zh" ? "zh" : "en";
}

export function localizedHref(href: string, language: SiteLanguage) {
  const [pathWithQuery, hash = ""] = href.split("#");
  const [path, query = ""] = pathWithQuery.split("?");
  const params = new URLSearchParams(query);

  if (language === "zh") {
    params.set("lang", "zh");
  } else {
    params.delete("lang");
  }

  const nextQuery = params.toString();
  const nextHash = hash ? `#${hash}` : "";
  return `${path}${nextQuery ? `?${nextQuery}` : ""}${nextHash}`;
}

export function resolveSafeNextHref(searchParams: PageSearchParams | undefined, fallback: string) {
  const value = searchParams?.next;
  const nextHref = Array.isArray(value) ? value[0] : value;

  if (!nextHref || !nextHref.startsWith("/") || nextHref.startsWith("//")) {
    return fallback;
  }

  return nextHref;
}
