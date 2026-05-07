import type { Metadata } from "next";
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
  title: "JinMing Lab - AI Tools and Coding Lab",
  description:
    "A clean AI tools and programming learning platform for prompt optimization code explanation bug fixing API request generation and coding practice.",
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
