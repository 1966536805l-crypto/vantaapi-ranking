"use client";

import type { InterfaceLanguage } from "@/lib/language";
import {
  auditModeLabel,
  impactLabel,
  issueTitle,
  numberedList,
  repoAgeLabel,
  riskLevelLabel,
  riskTone,
  sampleRepoUrl,
  scorecardStatusLabel,
  type GitHubRepoAnalysis,
} from "@/lib/github-repo-analyzer-client";
import type { getAuditCopy } from "@/lib/github-repo-analyzer-client";

type AuditCopy = ReturnType<typeof getAuditCopy>;

type GitHubRepoAuditViewProps = {
  actionStatus: string;
  displayAnalysis: GitHubRepoAnalysis | null;
  displayedRunStatus: string;
  issueBundle: string;
  language: InterfaceLanguage;
  loading: boolean;
  prDescription: string;
  qualityGates: string[];
  releaseBundle: string;
  t: AuditCopy;
  url: string;
  onAnalyze: (targetUrl?: string) => void;
  onCopyAuditText: (text: string, successMessage: string) => void;
  onUrlChange: (value: string) => void;
};

export default function GitHubRepoAuditView({
  actionStatus,
  displayAnalysis,
  displayedRunStatus,
  issueBundle,
  language,
  loading,
  prDescription,
  qualityGates,
  releaseBundle,
  t,
  url,
  onAnalyze,
  onCopyAuditText,
  onUrlChange,
}: GitHubRepoAuditViewProps) {
  return (
    <>
      <p className="eyebrow">{t.repoUrl}</p>
      <h2>{t.auditBlockers}</h2>
      <RepoVerdict analysis={displayAnalysis} language={language} t={t} />
      {displayAnalysis && (
        <>
          <RepoAuditBrief analysis={displayAnalysis} language={language} qualityGates={qualityGates} t={t} />
          <RepoCommandBoard
            actionStatus={actionStatus}
            analysis={displayAnalysis}
            issueBundle={issueBundle}
            prDescription={prDescription}
            releaseBundle={releaseBundle}
            t={t}
            onCopyAuditText={onCopyAuditText}
          />
        </>
      )}
      <RepoFlowStrip displayedRunStatus={displayedRunStatus} loading={loading} t={t} />
      <RepoInputPanel
        analysis={displayAnalysis}
        language={language}
        t={t}
        url={url}
        onAnalyze={onAnalyze}
        onUrlChange={onUrlChange}
      />
      {displayAnalysis && (
        <>
          <RepoScorecard analysis={displayAnalysis} language={language} />
          <RepoPriorityGrid analysis={displayAnalysis} t={t} />
          <RepoEvidenceGrid analysis={displayAnalysis} />
          <RepoActionPanel actionStatus={actionStatus} analysis={displayAnalysis} t={t} />
          <RepoReportBoard
            analysis={displayAnalysis}
            language={language}
            prDescription={prDescription}
            t={t}
            onCopyAuditText={onCopyAuditText}
          />
        </>
      )}
    </>
  );
}

function RepoVerdict({
  analysis,
  language,
  t,
}: {
  analysis: GitHubRepoAnalysis | null;
  language: InterfaceLanguage;
  t: AuditCopy;
}) {
  if (!analysis) {
    return (
      <section className="repo-verdict repo-verdict-empty">
        <div>
          <p className="eyebrow">{t.reportShape}</p>
          <strong>{t.reportShapeTitle}</strong>
          <span>{t.reportShapeBody}</span>
        </div>
      </section>
    );
  }

  return (
    <section className={`repo-verdict repo-verdict-${riskTone(analysis.launchScore.riskLevel)}`}>
      <div>
        <p className="eyebrow">{t.verdict}</p>
        <strong>{riskLevelLabel(analysis.launchScore.riskLevel, language)} {t.risk}</strong>
        <span>{analysis.launchScore.summary}</span>
      </div>
      <div className="repo-score">
        <strong>{analysis.launchScore.score}</strong>
        <span>/100</span>
      </div>
      <div className="repo-next-step">
        <p className="eyebrow">{t.nextFix}</p>
        <span>{analysis.mustFix[0]}</span>
      </div>
    </section>
  );
}

function RepoAuditBrief({
  analysis,
  language,
  qualityGates,
  t,
}: {
  analysis: GitHubRepoAnalysis;
  language: InterfaceLanguage;
  qualityGates: string[];
  t: AuditCopy;
}) {
  return (
    <section className="repo-audit-brief">
      <div>
        <p className="eyebrow">{t.engine}</p>
        <strong>{auditModeLabel(analysis.auditEngine?.mode, language)}</strong>
        <span>{t.aiDependencyNone}</span>
      </div>
      <div>
        <p className="eyebrow">{t.repository}</p>
        <strong>{analysis.repository.fullName}</strong>
        <span>{analysis.repository.language || t.unknown} · {analysis.repository.license || t.noLicense} · {repoAgeLabel(analysis.repository.pushedAt, language)}</span>
      </div>
      <div>
        <p className="eyebrow">{t.impact}</p>
        <strong>{impactLabel(analysis.launchScore.score, language)}</strong>
        <span>{analysis.mustFix.length} {t.actionItems} · {analysis.copyableIssues.length} {t.issueDrafts}</span>
      </div>
      <div>
        <p className="eyebrow">{t.qualityGates}</p>
        <strong>{qualityGates[0]}</strong>
        <span>{qualityGates.slice(1).join(" · ")}</span>
      </div>
    </section>
  );
}

function RepoCommandBoard({
  actionStatus,
  analysis,
  issueBundle,
  prDescription,
  releaseBundle,
  t,
  onCopyAuditText,
}: {
  actionStatus: string;
  analysis: GitHubRepoAnalysis;
  issueBundle: string;
  prDescription: string;
  releaseBundle: string;
  t: AuditCopy;
  onCopyAuditText: (text: string, successMessage: string) => void;
}) {
  return (
    <section className="repo-command-board">
      <div className="repo-command-head">
        <div>
          <p className="eyebrow">{t.doThisFirst}</p>
          <h3>{t.turnIntoWork}</h3>
          <span>{actionStatus || t.copyIntoGithub}</span>
        </div>
        <a href={analysis.repository.url} target="_blank" rel="noreferrer">{t.openRepo}</a>
      </div>
      <div className="repo-command-grid">
        <button type="button" onClick={() => onCopyAuditText(numberedList(analysis.mustFix), t.mustFixCopied)}>
          <span>01</span>
          <strong>{t.copy} {t.mustFixFirst}</strong>
          <em>{analysis.mustFix.length} {t.items}</em>
        </button>
        <button type="button" onClick={() => onCopyAuditText(issueBundle, t.issuesCopied)}>
          <span>02</span>
          <strong>{t.copyIssues}</strong>
          <em>{analysis.copyableIssues.length} {t.drafts}</em>
        </button>
        <button type="button" onClick={() => onCopyAuditText(prDescription, t.prDescriptionCopied)}>
          <span>03</span>
          <strong>{t.copyPrDescription}</strong>
          <em>{t.pasteReady}</em>
        </button>
        <button type="button" onClick={() => onCopyAuditText(releaseBundle, t.releaseChecklistCopied)}>
          <span>04</span>
          <strong>{t.copyReleaseChecklist}</strong>
          <em>{analysis.releaseChecklist.length} {t.steps}</em>
        </button>
      </div>
    </section>
  );
}

function RepoFlowStrip({ displayedRunStatus, loading, t }: { displayedRunStatus: string; loading: boolean; t: AuditCopy }) {
  return (
    <section className="repo-flow-strip">
      {t.repoFlow.map((item, index) => (
        <span key={item} className={loading && index > 0 ? "repo-flow-pending" : ""}>
          {item}
        </span>
      ))}
      <strong>{displayedRunStatus}</strong>
    </section>
  );
}

function RepoInputPanel({
  analysis,
  language,
  t,
  url,
  onAnalyze,
  onUrlChange,
}: {
  analysis: GitHubRepoAnalysis | null;
  language: InterfaceLanguage;
  t: AuditCopy;
  url: string;
  onAnalyze: (targetUrl?: string) => void;
  onUrlChange: (value: string) => void;
}) {
  const trustNote = language === "zh"
    ? "只提交公开 GitHub 仓库根地址。不要粘贴 API Key 密码 私有源码或公司内部链接。"
    : "Submit public GitHub repository root URLs only. Do not paste API keys passwords private source or internal company links.";

  return (
    <>
      <label className="block">
        <span className="tool-label">{t.repoUrl}</span>
        <input
          value={url}
          onChange={(event) => onUrlChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") onAnalyze();
          }}
          className="tool-input"
          placeholder={sampleRepoUrl}
        />
      </label>
      <p className="tool-trust-note">{trustNote}</p>
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
        {analysis && (
          <div className="dense-row">
            <span className="text-sm font-semibold">{t.score}</span>
            <span className="text-xs text-[color:var(--muted)]">{analysis.launchScore.score}/100 {riskLevelLabel(analysis.launchScore.riskLevel, language)}</span>
          </div>
        )}
      </div>
    </>
  );
}

function RepoScorecard({ analysis, language }: { analysis: GitHubRepoAnalysis; language: InterfaceLanguage }) {
  return (
    <section className="repo-scorecard-grid">
      {analysis.scorecard.map((item) => (
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
  );
}

function RepoPriorityGrid({ analysis, t }: { analysis: GitHubRepoAnalysis; t: AuditCopy }) {
  return (
    <section className="repo-priority-grid">
      <article className="repo-priority-card repo-priority-today">
        <p className="eyebrow">{t.fixToday}</p>
        <ol className="repo-check-list">
          {(analysis.priorityFixes.today.length ? analysis.priorityFixes.today : [t.noSameDayBlocker]).map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ol>
      </article>
      <article className="repo-priority-card">
        <p className="eyebrow">{t.beforeLaunch}</p>
        <ol className="repo-check-list">
          {(analysis.priorityFixes.beforeLaunch.length ? analysis.priorityFixes.beforeLaunch : [t.noPreLaunch]).map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ol>
      </article>
      <article className="repo-priority-card">
        <p className="eyebrow">{t.laterPolish}</p>
        <ol className="repo-check-list">
          {(analysis.priorityFixes.later.length ? analysis.priorityFixes.later : [t.laterFallback]).map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ol>
      </article>
    </section>
  );
}

function RepoEvidenceGrid({ analysis }: { analysis: GitHubRepoAnalysis }) {
  return (
    <section className="repo-evidence-grid">
      {analysis.issueFindings.slice(0, 4).map((item) => (
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
  );
}

function RepoActionPanel({ actionStatus, analysis, t }: { actionStatus: string; analysis: GitHubRepoAnalysis; t: AuditCopy }) {
  return (
    <section className="repo-action-panel">
      <div>
        <p className="eyebrow">{t.shipNext}</p>
        <h3>{t.turnReportIntoTasks}</h3>
        <p>{actionStatus || t.actionPanelBody}</p>
      </div>
      <div className="repo-action-list">
        {analysis.mustFix.slice(0, 3).map((item, index) => (
          <div key={item} className="dense-row">
            <span className="text-sm font-semibold">{String(index + 1).padStart(2, "0")}</span>
            <span className="truncate text-xs text-[color:var(--muted)]">{item}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function RepoReportBoard({
  analysis,
  language,
  prDescription,
  t,
  onCopyAuditText,
}: {
  analysis: GitHubRepoAnalysis;
  language: InterfaceLanguage;
  prDescription: string;
  t: AuditCopy;
  onCopyAuditText: (text: string, successMessage: string) => void;
}) {
  return (
    <section className="repo-report-board">
      <div className="repo-report-head">
        <div>
          <p className="eyebrow">{t.professionalReport}</p>
          <h3>{t.launchReadinessReport}</h3>
          <span>{analysis.repository.fullName} · {riskLevelLabel(analysis.launchScore.riskLevel, language)} {t.risk} · {analysis.copyableIssues.length} {t.issueDrafts}</span>
        </div>
        <div className="repo-report-score">
          <strong>{analysis.launchScore.score}</strong>
          <span>{t.launchScore}</span>
        </div>
      </div>

      <div className="repo-report-grid">
        <div className="repo-report-section repo-report-section-primary">
          <div className="repo-report-section-head">
            <p className="eyebrow">{t.mustFixFirst}</p>
            <button type="button" onClick={() => onCopyAuditText(numberedList(analysis.mustFix), t.mustFixCopied)}>
              {t.copy}
            </button>
          </div>
          <ol className="repo-check-list">
            {analysis.mustFix.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ol>
        </div>

        <div className="repo-report-section">
          <div className="repo-report-section-head">
            <p className="eyebrow">{t.copyPrDescription.replace(/^Copy\s+/i, "").replace(/^复制\s*/, "")}</p>
            <button type="button" onClick={() => onCopyAuditText(prDescription, t.prDescriptionCopied)}>
              {t.copy}
            </button>
          </div>
          <pre className="repo-pr-description">{analysis.prDescription}</pre>
        </div>
      </div>

      <div className="repo-issue-grid">
        {analysis.copyableIssues.slice(0, 3).map((issue, index) => (
          <article key={issue} className="repo-issue-card">
            <div>
              <p className="eyebrow">Issue {String(index + 1).padStart(2, "0")}</p>
              <h4>{issueTitle(issue, index)}</h4>
            </div>
            <button type="button" onClick={() => onCopyAuditText(issue, t.issueCopied(index + 1))}>
              {t.copyIssue}
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}
