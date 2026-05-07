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
  title: "JinMing Lab - AI 工具 Prompt 优化 代码解释 编程学习",
  description:
    "JinMing Lab 提供 AI 工具、Prompt 优化、代码解释、Bug 定位、API 请求生成和零基础编程学习路线。",
  keywords: ["AI 工具", "Prompt 优化", "代码解释", "Bug 定位", "API 请求生成", "编程学习", "零基础编程"],
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
