"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import type { SiteLanguage } from "@/lib/language";

const sampleRepo = "https://github.com/vercel/swr";

export default function RepoAuditForm({ language }: { language: SiteLanguage }) {
  const [repoUrl, setRepoUrl] = useState(sampleRepo);
  const zh = language === "zh";

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = repoUrl.trim() || sampleRepo;
    const params = new URLSearchParams();
    params.set("repo", trimmed);
    if (zh) params.set("lang", "zh");
    window.location.href = `/tools/github-repo-analyzer?${params.toString()}`;
  }

  function useSample() {
    setRepoUrl(sampleRepo);
  }

  return (
    <form className="home-audit-form" onSubmit={submit}>
      <label>
        <span>{zh ? "GitHub 仓库地址" : "GitHub repo URL"}</span>
        <div>
          <input
            value={repoUrl}
            onChange={(event) => setRepoUrl(event.target.value)}
            placeholder={sampleRepo}
            autoCapitalize="none"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
          />
          <button type="submit">{zh ? "生成报告" : "Run Audit"}</button>
        </div>
      </label>
      <button type="button" className="home-audit-sample" onClick={useSample}>
        {zh ? "使用示例仓库 vercel/swr" : "Use sample repo vercel/swr"}
      </button>
    </form>
  );
}
