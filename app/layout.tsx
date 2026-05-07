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
  title: "VantaAPI - English and C++ Learning MVP",
  description:
    "VantaAPI provides English learning, C++ beginner practice, quizzes, progress tracking, wrong-question review, and focused AI learning tools.",
  keywords: ["英语学习", "C++ 学习", "学习进度", "错题复习", "AI 工具", "编程训练"],
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
      lang="zh-CN"
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
