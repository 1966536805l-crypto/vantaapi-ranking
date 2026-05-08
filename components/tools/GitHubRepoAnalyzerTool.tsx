"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ToolLayout, { type OutputBlock } from "@/components/tools/ToolLayout";
import type { InterfaceLanguage } from "@/lib/language";

import {
  auditModeLabel,
  bulletList,
  decodeSharedAnalysis,
  encodeSharedAnalysis,
  findingList,
  formatGitHubRepoOutput,
  getAuditCopy,
  impactLabel,
  issueTitle,
  localizeAnalysisForDisplay,
  numberedList,
  qualityGateLabel,
  repoAgeLabel,
  riskLevelLabel,
  riskTone,
  sampleGitHubAnalysis,
  sampleRepoUrl,
  scorecardStatusLabel,
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
    const trimmed = targetUrl.trim();
    if (!trimmed) {
      setError(t.urlRequired);
      setAnalysis(null);
      setRunStatus(t.urlRequired);
      return;
    }

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
        <>
          <button type="button" className="dense-action-primary" onClick={() => void analyzeRepo()} disabled={loading}>
            {loading ? t.auditingRepo : t.auditRepo}
          </button>
          <button type="button" className="dense-action" onClick={runSampleAudit} disabled={loading}>
            {t.previewReport}
          </button>
          <button type="button" className="dense-action" onClick={() => void analyzeRepo(sampleRepoUrl)} disabled={loading}>
            {t.liveSample}
          </button>
          {analysis && (
            <>
              <button type="button" className="dense-action" onClick={copyShareLink}>
                {shareStatus || t.copyShareLink}
              </button>
              <a className="dense-action" href={shareUrl} target="_blank" rel="noreferrer">
                {t.openShare}
              </a>
              <button type="button" className="dense-action" onClick={() => copyAuditText(issueBundle, t.issuesCopied)}>
                {t.copyIssues}
              </button>
              <button type="button" className="dense-action" onClick={() => copyAuditText(releaseBundle, t.releaseChecklistCopied)}>
                {t.copyReleaseChecklist}
              </button>
              <button type="button" className="dense-action" onClick={() => copyAuditText(prDescription, t.prDescriptionCopied)}>
                {t.copyPrDescription}
              </button>
              <a className="dense-action" href={analysis.repository.url} target="_blank" rel="noreferrer">
                {t.openRepo}
              </a>
            </>
          )}
          <button type="button" className="dense-action" onClick={() => { setUrl(sampleRepoUrl); setError(""); setRunStatus(""); }}>
            {t.resetSample}
          </button>
          <button type="button" className="dense-action" onClick={() => { setUrl(""); setAnalysis(null); setError(""); setRunStatus(""); }}>
            {t.clear}
          </button>
        </>
      }
    >
      <p className="eyebrow">{t.repoUrl}</p>
      <h2>{t.auditBlockers}</h2>
      {displayAnalysis ? (
        <section className={`repo-verdict repo-verdict-${riskTone(displayAnalysis.launchScore.riskLevel)}`}>
          <div>
            <p className="eyebrow">{t.verdict}</p>
            <strong>{riskLevelLabel(displayAnalysis.launchScore.riskLevel, language)} {t.risk}</strong>
            <span>{displayAnalysis.launchScore.summary}</span>
          </div>
          <div className="repo-score">
            <strong>{displayAnalysis.launchScore.score}</strong>
            <span>/100</span>
          </div>
          <div className="repo-next-step">
            <p className="eyebrow">{t.nextFix}</p>
            <span>{displayAnalysis.mustFix[0]}</span>
          </div>
        </section>
      ) : (
        <section className="repo-verdict repo-verdict-empty">
          <div>
            <p className="eyebrow">{t.reportShape}</p>
            <strong>{t.reportShapeTitle}</strong>
            <span>{t.reportShapeBody}</span>
          </div>
        </section>
      )}
      {displayAnalysis && (
        <section className="repo-audit-brief">
          <div>
            <p className="eyebrow">{t.engine}</p>
            <strong>{auditModeLabel(displayAnalysis.auditEngine?.mode, language)}</strong>
            <span>{t.aiDependencyNone}</span>
          </div>
          <div>
            <p className="eyebrow">{t.repository}</p>
            <strong>{displayAnalysis.repository.fullName}</strong>
            <span>{displayAnalysis.repository.language || t.unknown} · {displayAnalysis.repository.license || t.noLicense} · {repoAgeLabel(displayAnalysis.repository.pushedAt, language)}</span>
          </div>
          <div>
            <p className="eyebrow">{t.impact}</p>
            <strong>{impactLabel(displayAnalysis.launchScore.score, language)}</strong>
            <span>{displayAnalysis.mustFix.length} {t.actionItems} · {displayAnalysis.copyableIssues.length} {t.issueDrafts}</span>
          </div>
          <div>
            <p className="eyebrow">{t.qualityGates}</p>
            <strong>{qualityGates[0]}</strong>
            <span>{qualityGates.slice(1).join(" · ")}</span>
          </div>
        </section>
      )}
      {displayAnalysis && (
        <section className="repo-command-board">
          <div className="repo-command-head">
            <div>
              <p className="eyebrow">{t.doThisFirst}</p>
              <h3>{t.turnIntoWork}</h3>
              <span>{actionStatus || t.copyIntoGithub}</span>
            </div>
            <a href={displayAnalysis.repository.url} target="_blank" rel="noreferrer">{t.openRepo}</a>
          </div>
          <div className="repo-command-grid">
            <button type="button" onClick={() => copyAuditText(numberedList(displayAnalysis.mustFix), t.mustFixCopied)}>
              <span>01</span>
              <strong>{t.copy} {t.mustFixFirst}</strong>
              <em>{displayAnalysis.mustFix.length} {t.items}</em>
            </button>
            <button type="button" onClick={() => copyAuditText(issueBundle, t.issuesCopied)}>
              <span>02</span>
              <strong>{t.copyIssues}</strong>
              <em>{displayAnalysis.copyableIssues.length} {t.drafts}</em>
            </button>
            <button type="button" onClick={() => copyAuditText(prDescription, t.prDescriptionCopied)}>
              <span>03</span>
              <strong>{t.copyPrDescription}</strong>
              <em>{t.pasteReady}</em>
            </button>
            <button type="button" onClick={() => copyAuditText(releaseBundle, t.releaseChecklistCopied)}>
              <span>04</span>
              <strong>{t.copyReleaseChecklist}</strong>
              <em>{displayAnalysis.releaseChecklist.length} {t.steps}</em>
            </button>
          </div>
        </section>
      )}
      <section className="repo-flow-strip">
        {t.repoFlow.map((item, index) => (
          <span key={item} className={loading && index > 0 ? "repo-flow-pending" : ""}>
            {item}
          </span>
        ))}
        <strong>{displayedRunStatus}</strong>
      </section>
      <label className="block">
        <span className="tool-label">{t.repoUrl}</span>
        <input
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") void analyzeRepo();
          }}
          className="tool-input"
          placeholder={sampleRepoUrl}
        />
      </label>
      <div className="tool-field-grid">
        <div className="dense-row">
          <span className="text-sm font-semibold">{t.auditMethod}</span>
          <span className="text-xs text-[color:var(--muted)]">{t.deterministicRules}</span>
        </div>
        <div className="dense-row">
          <span className="text-sm font-semibold">{t.scope}</span>
          <span className="text-xs text-[color:var(--muted)]">{t.publicRepoOnly}</span>
        </div>
        <div className="dense-row">
          <span className="text-sm font-semibold">{t.reads}</span>
          <span className="text-xs text-[color:var(--muted)]">{t.readsValue}</span>
        </div>
        {displayAnalysis && (
          <div className="dense-row">
            <span className="text-sm font-semibold">{t.score}</span>
            <span className="text-xs text-[color:var(--muted)]">{displayAnalysis.launchScore.score}/100 {riskLevelLabel(displayAnalysis.launchScore.riskLevel, language)}</span>
          </div>
        )}
      </div>
      {displayAnalysis && (
        <section className="repo-scorecard-grid">
          {displayAnalysis.scorecard.map((item) => (
            <article key={item.label} className={`repo-scorecard-item repo-scorecard-${item.status}`}>
              <div>
                <p className="eyebrow">{item.label}</p>
                <strong>{item.score}</strong>
              </div>
              <span>{scorecardStatusLabel(item.status, language)}</span>
              <p>{item.note}</p>
            </article>
          ))}
        </section>
      )}
      {displayAnalysis && (
        <section className="repo-priority-grid">
          <article className="repo-priority-card repo-priority-today">
            <p className="eyebrow">{t.fixToday}</p>
            <ol className="repo-check-list">
              {(displayAnalysis.priorityFixes.today.length ? displayAnalysis.priorityFixes.today : [t.noSameDayBlocker]).map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ol>
          </article>
          <article className="repo-priority-card">
            <p className="eyebrow">{t.beforeLaunch}</p>
            <ol className="repo-check-list">
              {(displayAnalysis.priorityFixes.beforeLaunch.length ? displayAnalysis.priorityFixes.beforeLaunch : [t.noPreLaunch]).map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ol>
          </article>
          <article className="repo-priority-card">
            <p className="eyebrow">{t.laterPolish}</p>
            <ol className="repo-check-list">
              {(displayAnalysis.priorityFixes.later.length ? displayAnalysis.priorityFixes.later : [t.laterFallback]).map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ol>
          </article>
        </section>
      )}
      {displayAnalysis && (
        <section className="repo-evidence-grid">
          {displayAnalysis.issueFindings.slice(0, 4).map((item) => (
            <article key={`${item.severity}-${item.title}`} className={`repo-evidence-card repo-evidence-${item.severity.toLowerCase()}`}>
              <div className="repo-evidence-head">
                <span>{item.severity}</span>
                <strong>{item.source}</strong>
              </div>
              <h3>{item.title}</h3>
              <p>{item.evidence}</p>
            </article>
          ))}
        </section>
      )}
      {displayAnalysis && (
        <section className="repo-action-panel">
          <div>
            <p className="eyebrow">{t.shipNext}</p>
            <h3>{t.turnReportIntoTasks}</h3>
            <p>{actionStatus || t.actionPanelBody}</p>
          </div>
          <div className="repo-action-list">
            {displayAnalysis.mustFix.slice(0, 3).map((item, index) => (
              <div key={item} className="dense-row">
                <span className="text-sm font-semibold">{String(index + 1).padStart(2, "0")}</span>
                <span className="truncate text-xs text-[color:var(--muted)]">{item}</span>
              </div>
            ))}
          </div>
        </section>
      )}
      {displayAnalysis && (
        <section className="repo-report-board">
          <div className="repo-report-head">
            <div>
              <p className="eyebrow">{t.professionalReport}</p>
              <h3>{t.launchReadinessReport}</h3>
              <span>{displayAnalysis.repository.fullName} · {riskLevelLabel(displayAnalysis.launchScore.riskLevel, language)} {t.risk} · {displayAnalysis.copyableIssues.length} {t.issueDrafts}</span>
            </div>
            <div className="repo-report-score">
              <strong>{displayAnalysis.launchScore.score}</strong>
              <span>{t.launchScore}</span>
            </div>
          </div>

          <div className="repo-report-grid">
            <div className="repo-report-section repo-report-section-primary">
              <div className="repo-report-section-head">
                <p className="eyebrow">{t.mustFixFirst}</p>
                <button type="button" onClick={() => copyAuditText(numberedList(displayAnalysis.mustFix), t.mustFixCopied)}>
                  {t.copy}
                </button>
              </div>
              <ol className="repo-check-list">
                {displayAnalysis.mustFix.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ol>
            </div>

            <div className="repo-report-section">
              <div className="repo-report-section-head">
                <p className="eyebrow">{t.copyPrDescription.replace(/^Copy\s+/i, "").replace(/^复制\s*/, "")}</p>
                <button type="button" onClick={() => copyAuditText(prDescription, t.prDescriptionCopied)}>
                  {t.copy}
                </button>
              </div>
              <pre className="repo-pr-description">{displayAnalysis.prDescription}</pre>
            </div>
          </div>

          <div className="repo-issue-grid">
            {displayAnalysis.copyableIssues.slice(0, 3).map((issue, index) => (
              <article key={issue} className="repo-issue-card">
                <div>
                  <p className="eyebrow">Issue {String(index + 1).padStart(2, "0")}</p>
                  <h4>{issueTitle(issue, index)}</h4>
                </div>
                <button type="button" onClick={() => copyAuditText(issue, t.issueCopied(index + 1))}>
                  {t.copyIssue}
                </button>
              </article>
            ))}
          </div>
        </section>
      )}
    </ToolLayout>
  );
}


export default GitHubRepoAnalyzer;
