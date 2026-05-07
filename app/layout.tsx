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
  title: "JinMing Lab - GitHub 项目上线前体检 AI 工具",
  description:
    "JinMing Lab 提供 GitHub 项目上线前体检、README 检查、环境变量风险提示、部署检查、AI 工具和零基础编程学习路线。",
  keywords: ["GitHub 项目体检", "上线前检查", "AI 工具", "README 检查", "部署检查", "Prompt 优化", "编程学习"],
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
