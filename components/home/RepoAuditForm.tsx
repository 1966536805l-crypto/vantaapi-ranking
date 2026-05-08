"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import type { InterfaceLanguage } from "@/lib/language";

const sampleRepo = "https://github.com/vercel/swr";

const formCopy: Record<InterfaceLanguage, { label: string; action: string; sample: string }> = {
  en: { label: "GitHub repo URL", action: "Run Audit", sample: "Use sample repo vercel/swr" },
  zh: { label: "GitHub 仓库地址", action: "生成报告", sample: "使用示例仓库 vercel/swr" },
  ja: { label: "GitHub リポジトリ URL", action: "診断する", sample: "サンプル vercel/swr を使う" },
  ko: { label: "GitHub 저장소 URL", action: "점검 실행", sample: "샘플 vercel/swr 사용" },
  es: { label: "URL del repo GitHub", action: "Ejecutar auditoría", sample: "Usar repo ejemplo vercel/swr" },
  fr: { label: "URL du repo GitHub", action: "Lancer l’audit", sample: "Utiliser l’exemple vercel/swr" },
  de: { label: "GitHub Repo URL", action: "Audit starten", sample: "Beispiel vercel/swr nutzen" },
  pt: { label: "URL do repo GitHub", action: "Rodar auditoria", sample: "Usar exemplo vercel/swr" },
  ru: { label: "URL репозитория GitHub", action: "Запустить аудит", sample: "Использовать пример vercel/swr" },
  ar: { label: "رابط مستودع GitHub", action: "تشغيل التدقيق", sample: "استخدم المثال vercel/swr" },
  hi: { label: "GitHub repo URL", action: "Audit चलाएं", sample: "Sample repo vercel/swr इस्तेमाल करें" },
  id: { label: "URL repo GitHub", action: "Jalankan audit", sample: "Pakai contoh vercel/swr" },
  vi: { label: "URL repo GitHub", action: "Chạy kiểm tra", sample: "Dùng repo mẫu vercel/swr" },
  th: { label: "GitHub repo URL", action: "เริ่มตรวจ", sample: "ใช้ตัวอย่าง vercel/swr" },
  tr: { label: "GitHub repo URL", action: "Denetimi çalıştır", sample: "Örnek vercel/swr kullan" },
  it: { label: "URL repo GitHub", action: "Avvia audit", sample: "Usa esempio vercel/swr" },
  nl: { label: "GitHub repo URL", action: "Audit starten", sample: "Gebruik voorbeeld vercel/swr" },
  pl: { label: "URL repo GitHub", action: "Uruchom audyt", sample: "Użyj przykładu vercel/swr" },
};

const trustNotice: Partial<Record<InterfaceLanguage, string>> = {
  en: "Use public GitHub repository URLs only. Do not paste API keys, passwords, private source, or internal company links.",
  zh: "只粘贴公开 GitHub 仓库地址。不要提交 API Key、密码、私有源码或公司内部链接。",
  ja: "公開 GitHub リポジトリ URL のみ使用してください。API key、パスワード、非公開コード、社内リンクは貼らないでください。",
  ko: "공개 GitHub 저장소 URL만 사용하세요. API 키, 비밀번호, 비공개 소스, 내부 링크는 붙여 넣지 마세요.",
  es: "Usa solo URLs de repos públicos de GitHub. No pegues API keys, contraseñas, código privado ni enlaces internos.",
  fr: "Utilisez uniquement des repos GitHub publics. Ne collez pas de clés API, mots de passe, code privé ou liens internes.",
  de: "Nur öffentliche GitHub Repo URLs verwenden. Keine API Keys, Passwörter, privaten Quellcodes oder internen Links einfügen.",
  ar: "استخدم روابط مستودعات GitHub العامة فقط. لا تلصق مفاتيح API أو كلمات مرور أو كودا خاصا أو روابط داخلية.",
};

export default function RepoAuditForm({ language }: { language: InterfaceLanguage }) {
  const [repoUrl, setRepoUrl] = useState(sampleRepo);
  const t = formCopy[language];
  const notice = trustNotice[language] || trustNotice.en;

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = repoUrl.trim() || sampleRepo;
    const params = new URLSearchParams();
    params.set("repo", trimmed);
    if (language !== "en") params.set("lang", language);
    window.location.href = `/tools/github-repo-analyzer?${params.toString()}`;
  }

  function useSample() {
    setRepoUrl(sampleRepo);
  }

  return (
    <form className="home-audit-form" onSubmit={submit}>
      <label>
        <span>{t.label}</span>
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
          <button type="submit">{t.action}</button>
        </div>
      </label>
      <button type="button" className="home-audit-sample" onClick={useSample}>
        {t.sample}
      </button>
      <p className="home-audit-trust-note">{notice}</p>
    </form>
  );
}
