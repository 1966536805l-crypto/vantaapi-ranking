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

const layoutCopy: Record<InterfaceLanguage, {
  generated: string;
  lines: string;
  chars: string;
  copy: string;
  copied: string;
  download: string;
  downloaded: string;
}> = {
  en: { generated: "Generated", lines: "lines", chars: "chars", copy: "Copy", copied: "Copied", download: "Download", downloaded: "Downloaded" },
  zh: { generated: "生成结果", lines: "行", chars: "字符", copy: "复制", copied: "已复制", download: "下载", downloaded: "已下载" },
  ja: { generated: "生成結果", lines: "行", chars: "文字", copy: "コピー", copied: "コピー済み", download: "ダウンロード", downloaded: "完了" },
  ko: { generated: "생성 결과", lines: "줄", chars: "글자", copy: "복사", copied: "복사됨", download: "다운로드", downloaded: "완료" },
  es: { generated: "Generado", lines: "líneas", chars: "caracteres", copy: "Copiar", copied: "Copiado", download: "Descargar", downloaded: "Descargado" },
  fr: { generated: "Generated", lines: "lines", chars: "chars", copy: "Copy", copied: "Copied", download: "Download", downloaded: "Downloaded" },
  de: { generated: "Generated", lines: "lines", chars: "chars", copy: "Copy", copied: "Copied", download: "Download", downloaded: "Downloaded" },
  pt: { generated: "Generated", lines: "lines", chars: "chars", copy: "Copy", copied: "Copied", download: "Download", downloaded: "Downloaded" },
  ru: { generated: "Generated", lines: "lines", chars: "chars", copy: "Copy", copied: "Copied", download: "Download", downloaded: "Downloaded" },
  ar: { generated: "النتيجة", lines: "أسطر", chars: "حروف", copy: "نسخ", copied: "تم النسخ", download: "تنزيل", downloaded: "تم التنزيل" },
  hi: { generated: "Generated", lines: "lines", chars: "chars", copy: "Copy", copied: "Copied", download: "Download", downloaded: "Downloaded" },
  id: { generated: "Generated", lines: "lines", chars: "chars", copy: "Copy", copied: "Copied", download: "Download", downloaded: "Downloaded" },
  vi: { generated: "Generated", lines: "lines", chars: "chars", copy: "Copy", copied: "Copied", download: "Download", downloaded: "Downloaded" },
  th: { generated: "Generated", lines: "lines", chars: "chars", copy: "Copy", copied: "Copied", download: "Download", downloaded: "Downloaded" },
  tr: { generated: "Generated", lines: "lines", chars: "chars", copy: "Copy", copied: "Copied", download: "Download", downloaded: "Downloaded" },
  it: { generated: "Generated", lines: "lines", chars: "chars", copy: "Copy", copied: "Copied", download: "Download", downloaded: "Downloaded" },
  nl: { generated: "Generated", lines: "lines", chars: "chars", copy: "Copy", copied: "Copied", download: "Download", downloaded: "Downloaded" },
  pl: { generated: "Generated", lines: "lines", chars: "chars", copy: "Copy", copied: "Copied", download: "Download", downloaded: "Downloaded" },
};

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
  const t = layoutCopy[language] || layoutCopy.en;
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
            <p className="eyebrow">{t.generated}</p>
            <h2>{outputTitle}</h2>
          </div>
          <div className="tool-output-actions">
            <span>{outputLines} {t.lines}</span>
            <span>{outputCharacters} {t.chars}</span>
            <button type="button" className="dense-action" onClick={() => copy(output, "main")}>
              {copied === "main" ? t.copied : t.copy}
            </button>
            <button type="button" className="dense-action" onClick={downloadOutput}>
              {downloaded ? t.downloaded : t.download}
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
                    {copied === block.title ? t.copied : t.copy}
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
