"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import GitHubRepoAnalyzerActions from "@/components/tools/github-repo-analyzer/GitHubRepoAnalyzerActions";
import GitHubRepoAuditView from "@/components/tools/github-repo-analyzer/GitHubRepoAuditView";
import ToolLayout, { type OutputBlock } from "@/components/tools/ToolLayout";
import type { InterfaceLanguage } from "@/lib/language";

import {
  bulletList,
  decodeSharedAnalysis,
  encodeSharedAnalysis,
  findingList,
  formatGitHubRepoOutput,
  getAuditCopy,
  localizeAnalysisForDisplay,
  numberedList,
  qualityGateLabel,
  riskLevelLabel,
  sampleGitHubAnalysis,
  sampleRepoUrl,
  validatePublicGitHubRepoUrl,
  type GitHubRepoAnalysis,
  type GitHubRepoAnalyzerResponse,
} from "@/lib/github-repo-analyzer-client";

function GitHubRepoAnalyzer({ language = "en", initialRepoUrl }: { language?: InterfaceLanguage; initialRepoUrl?: string }) {
  const t = getAuditCopy(language);
  const [url, setUrl] = useState(initialRepoUrl?.trim() || sampleRepoUrl);
  const [analysis, setAnalysis] = useState<GitHubRepoAnalysis | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [shareStatus, setShareStatus] = useState("");
  const [actionStatus, setActionStatus] = useState("");
  const [runStatus, setRunStatus] = useState("");
  const hasAutoRunRef = useRef(false);

  const output = useMemo(() => formatGitHubRepoOutput(analysis, error, language), [analysis, error, language]);
  const displayAnalysis = useMemo(() => analysis ? localizeAnalysisForDisplay(analysis, language) : null, [analysis, language]);
  const displayedRunStatus = runStatus || t.ready;
  const issueBundle = useMemo(() => displayAnalysis?.copyableIssues.join("\n\n---\n\n") || "", [displayAnalysis]);
  const releaseBundle = useMemo(() => displayAnalysis ? numberedList(displayAnalysis.releaseChecklist) : "", [displayAnalysis]);
  const prDescription = useMemo(() => displayAnalysis?.prDescription || "", [displayAnalysis]);
  const qualityGates = useMemo(() => analysis ? qualityGateLabel(analysis, language) : [], [analysis, language]);
  const shareUrl = useMemo(() => {
    if (!analysis || typeof window === "undefined") return "";
    const hash = encodeSharedAnalysis(analysis);
    return `${window.location.origin}/tools/github-repo-analyzer${window.location.search}#report=${hash}`;
  }, [analysis]);
  const blocks = useMemo<OutputBlock[]>(() => {
    if (!displayAnalysis) return [];
    return [
      { badge: `${displayAnalysis.launchScore.score}`, title: `${riskLevelLabel(displayAnalysis.launchScore.riskLevel, language)} ${t.riskSuffix}`, content: displayAnalysis.launchScore.summary },
      { badge: "01", title: t.mustFixFirst, content: numberedList(displayAnalysis.mustFix) },
      { badge: "02", title: "GitHub Issues", content: displayAnalysis.copyableIssues.join("\n\n---\n\n") },
      { badge: "03", title: t.copyPrDescription.replace(/^Copy\s+/i, "").replace(/^复制\s*/, ""), content: displayAnalysis.prDescription },
      { badge: "04", title: t.copyReleaseChecklist.replace(/^Copy\s+/i, "").replace(/^复制\s*/, ""), content: numberedList(displayAnalysis.releaseChecklist) },
      { badge: "05", title: t.conclusion, content: findingList(displayAnalysis.issueFindings, language) },
      { badge: "06", title: "README", content: bulletList(displayAnalysis.readmeSuggestions) },
    ];
  }, [displayAnalysis, language, t]);

  useEffect(() => {
    const shared = decodeSharedAnalysis(window.location.hash);
    if (!shared) return;
    window.setTimeout(() => {
      setAnalysis(shared);
      setUrl(shared.repository.url);
      setError("");
      hasAutoRunRef.current = true;
    }, 0);
  }, []);

  async function copyShareLink() {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setShareStatus(t.shareLinkCopied);
      window.setTimeout(() => setShareStatus(""), 1400);
    } catch {
      setShareStatus(t.copyFailed);
      window.setTimeout(() => setShareStatus(""), 1400);
    }
  }

  async function copyAuditText(text: string, successMessage: string) {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setActionStatus(successMessage);
      window.setTimeout(() => setActionStatus(""), 1400);
    } catch {
      setActionStatus(t.copyFailed);
      window.setTimeout(() => setActionStatus(""), 1400);
    }
  }

  const loadSamplePreview = useCallback((reason = t.localSampleLoaded) => {
    setUrl(sampleRepoUrl);
    setAnalysis(sampleGitHubAnalysis);
    setError("");
    setRunStatus(reason);
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
    }
  }, [t.localSampleLoaded]);

  const analyzeRepo = useCallback(async (targetUrl = url) => {
    const validation = validatePublicGitHubRepoUrl(targetUrl, language, t.urlRequired);
    if (!validation.ok) {
      setError(validation.message);
      setAnalysis(null);
      setRunStatus(validation.message);
      return;
    }
    const trimmed = validation.value;

    setUrl(trimmed);
    setLoading(true);
    setError("");
    setRunStatus(t.readingSignals);
    try {
      const response = await fetch(`/api/tools/github-repo-analyzer?lang=${encodeURIComponent(language)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: trimmed }),
      });
      const data = (await response.json()) as GitHubRepoAnalyzerResponse;
      if (!response.ok || !data.success || !data.analysis) {
        throw new Error(data.error || data.message || "Could not run repository launch audit");
      }
      setAnalysis(data.analysis);
      setRunStatus(t.auditComplete(data.analysis.launchScore.score));
      window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : t.copyFailed;
      if (trimmed === sampleRepoUrl) {
        loadSamplePreview(t.liveAuditBusy);
        return;
      }
      setAnalysis(null);
      setError(message);
      setRunStatus(message);
    } finally {
      setLoading(false);
    }
  }, [language, loadSamplePreview, t, url]);

  function runSampleAudit() {
    loadSamplePreview(t.localSampleLoaded);
  }

  useEffect(() => {
    if (hasAutoRunRef.current || !initialRepoUrl?.trim()) return;
    hasAutoRunRef.current = true;
    const target = initialRepoUrl.trim();
    const timer = window.setTimeout(() => {
      if (target === sampleRepoUrl) {
        loadSamplePreview(t.homepageSampleLoaded);
        return;
      }
      void analyzeRepo(target);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [analyzeRepo, initialRepoUrl, loadSamplePreview, t.homepageSampleLoaded]);

  return (
    <ToolLayout
      output={output}
      outputTitle={displayAnalysis ? `${displayAnalysis.launchScore.score}/100 ${t.launchReadinessReport}` : t.launchReadinessReport}
      language={language}
      blocks={blocks}
      actions={
        <GitHubRepoAnalyzerActions
          analysis={analysis}
          issueBundle={issueBundle}
          loading={loading}
          prDescription={prDescription}
          releaseBundle={releaseBundle}
          shareStatus={shareStatus}
          shareUrl={shareUrl}
          t={t}
          onAnalyze={(targetUrl) => void analyzeRepo(targetUrl)}
          onClear={() => { setUrl(""); setAnalysis(null); setError(""); setRunStatus(""); }}
          onCopyAuditText={(text, successMessage) => void copyAuditText(text, successMessage)}
          onCopyShareLink={() => void copyShareLink()}
          onResetSample={() => { setUrl(sampleRepoUrl); setError(""); setRunStatus(""); }}
          onRunSampleAudit={runSampleAudit}
          onRunSampleLive={() => void analyzeRepo(sampleRepoUrl)}
        />
      }
    >
      <GitHubRepoAuditView
        actionStatus={actionStatus}
        displayAnalysis={displayAnalysis}
        displayedRunStatus={displayedRunStatus}
        issueBundle={issueBundle}
        language={language}
        loading={loading}
        prDescription={prDescription}
        qualityGates={qualityGates}
        releaseBundle={releaseBundle}
        t={t}
        url={url}
        onAnalyze={(targetUrl) => void analyzeRepo(targetUrl)}
        onCopyAuditText={(text, successMessage) => void copyAuditText(text, successMessage)}
        onUrlChange={setUrl}
      />
    </ToolLayout>
  );
}


export default GitHubRepoAnalyzer;
