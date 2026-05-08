"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import type { InterfaceLanguage } from "@/lib/language";

export type OutputBlock = {
  title: string;
  badge: string;
  content: string;
};

function useCopy() {
  const [copied, setCopied] = useState("");
  async function copy(text: string, key: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      window.setTimeout(() => setCopied(""), 1200);
    } catch {
      setCopied("");
    }
  }
  return { copied, copy };
}

function fileSafeName(value: string) {
  const normalized = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return normalized || "jinming-lab-output";
}

function downloadTextFile(text: string, title: string) {
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${fileSafeName(title)}.txt`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export default function ToolLayout({
  children,
  output,
  outputTitle = "Output",
  actions,
  blocks,
  language = "en",
}: {
  children: ReactNode;
  output: string;
  outputTitle?: string;
  actions?: ReactNode;
  blocks?: OutputBlock[];
  language?: InterfaceLanguage;
}) {
  const zh = language === "zh";
  const { copied, copy } = useCopy();
  const [downloaded, setDownloaded] = useState(false);
  const outputLines = output.trim() ? output.trim().split(/\r?\n/).length : 0;
  const outputCharacters = output.length;

  function downloadOutput() {
    downloadTextFile(output, outputTitle);
    setDownloaded(true);
    window.setTimeout(() => setDownloaded(false), 1200);
  }

  return (
    <div className="tool-workgrid">
      <section className="dense-panel tool-panel">
        {children}
        {actions && <div className="tool-action-row">{actions}</div>}
      </section>
      <section className="dense-panel tool-output">
        <div className="tool-output-head">
          <div>
            <p className="eyebrow">{zh ? "生成结果" : "Generated"}</p>
            <h2>{outputTitle}</h2>
          </div>
          <div className="tool-output-actions">
            <span>{outputLines} {zh ? "行" : "lines"}</span>
            <span>{outputCharacters} {zh ? "字符" : "chars"}</span>
            <button type="button" className="dense-action" onClick={() => copy(output, "main")}>
              {copied === "main" ? (zh ? "已复制" : "Copied") : (zh ? "复制" : "Copy")}
            </button>
            <button type="button" className="dense-action" onClick={downloadOutput}>
              {downloaded ? (zh ? "已下载" : "Downloaded") : (zh ? "下载" : "Download")}
            </button>
          </div>
        </div>
        <pre>{output}</pre>
        {blocks && blocks.length > 0 && (
          <div className="tool-block-grid">
            {blocks.map((block) => (
              <article key={block.title} className="tool-copy-block">
                <div className="tool-copy-block-head">
                  <span>{block.badge}</span>
                  <strong>{block.title}</strong>
                  <button type="button" onClick={() => copy(block.content, block.title)}>
                    {copied === block.title ? (zh ? "已复制" : "Copied") : (zh ? "复制" : "Copy")}
                  </button>
                </div>
                <p>{block.content}</p>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
