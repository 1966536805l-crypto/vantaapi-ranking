import type { Metadata, Viewport } from "next";
import type { CSSProperties } from "react";
import GlobalSearchLauncher from "@/components/layout/GlobalSearchLauncher";
import CsrfBootstrap from "@/components/security/CsrfBootstrap";
import "./globals.css";
import "@/lib/protection";

const fontVariables = {
  "--font-geist-sans": "Arial, Helvetica, sans-serif",
  "--font-geist-mono": "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
} as CSSProperties & Record<"--font-geist-sans" | "--font-geist-mono", string>;

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en-US"
      className="h-full antialiased"
      style={fontVariables}
    >
      <body className="min-h-full flex flex-col bg-white text-slate-900">
        <CsrfBootstrap />
        <GlobalSearchLauncher />
        {children}
      </body>
    </html>
  );
}
