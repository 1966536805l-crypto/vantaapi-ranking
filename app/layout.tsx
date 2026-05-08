import type { Metadata, Viewport } from "next";
import { cookies, headers } from "next/headers";
import type { CSSProperties } from "react";
import GlobalSearchLauncher from "@/components/layout/GlobalSearchLauncher";
import LanguageDocumentBootstrap from "@/components/layout/LanguageDocumentBootstrap";
import CsrfBootstrap from "@/components/security/CsrfBootstrap";
import { isInterfaceLanguage, languageHtmlLang, type InterfaceLanguage } from "@/lib/language";
import "./globals.css";
import "@/lib/protection";

const fontVariables = {
  "--font-geist-sans": "Arial, Helvetica, sans-serif",
  "--font-geist-mono": "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
} as CSSProperties & Record<"--font-geist-sans" | "--font-geist-mono", string>;

const languageCookieNames = ["jinming_language", "vantaapi-language"];

export const metadata: Metadata = {
  metadataBase: new URL("https://vantaapi.com"),
  title: "JinMing Lab - Rules First GitHub Launch Audit",
  description:
    "JinMing Lab helps developers audit public GitHub repositories before launch with deterministic README, env, CI, deployment, and security checks plus issue templates and release checklists.",
  keywords: [
    "GitHub Launch Audit",
    "GitHub 项目体检",
    "deterministic checks",
    "rules first audit",
    "README check",
    "env example",
    "CI check",
    "deployment checklist",
    "security checklist",
    "release checklist",
    "AI developer tools",
    "编程工具",
  ],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
};

async function resolveDocumentLanguage(): Promise<InterfaceLanguage> {
  const headerStore = await headers();
  const proxiedLanguage = headerStore.get("x-jinming-language");
  if (isInterfaceLanguage(proxiedLanguage)) return proxiedLanguage;

  const cookieStore = await cookies();
  for (const name of languageCookieNames) {
    const language = cookieStore.get(name)?.value;
    if (isInterfaceLanguage(language)) return language;
  }

  return "en";
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const documentLanguage = await resolveDocumentLanguage();
  return (
    <html
      lang={languageHtmlLang(documentLanguage)}
      dir={documentLanguage === "ar" ? "rtl" : "ltr"}
      className="h-full antialiased"
      style={fontVariables}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-white text-slate-900">
        <LanguageDocumentBootstrap />
        <CsrfBootstrap />
        <GlobalSearchLauncher />
        {children}
      </body>
    </html>
  );
}
