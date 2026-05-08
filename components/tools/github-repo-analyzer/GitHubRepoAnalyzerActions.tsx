"use client";

import type { GitHubRepoAnalysis } from "@/lib/github-repo-analyzer-client";
import type { getAuditCopy } from "@/lib/github-repo-analyzer-client";

type AuditCopy = ReturnType<typeof getAuditCopy>;

type GitHubRepoAnalyzerActionsProps = {
  analysis: GitHubRepoAnalysis | null;
  issueBundle: string;
  loading: boolean;
  prDescription: string;
  releaseBundle: string;
  shareStatus: string;
  shareUrl: string;
  t: AuditCopy;
  onAnalyze: (targetUrl?: string) => void;
  onClear: () => void;
  onCopyAuditText: (text: string, successMessage: string) => void;
  onCopyShareLink: () => void;
  onResetSample: () => void;
  onRunSampleAudit: () => void;
  onRunSampleLive: () => void;
};

export default function GitHubRepoAnalyzerActions({
  analysis,
  issueBundle,
  loading,
  prDescription,
  releaseBundle,
  shareStatus,
  shareUrl,
  t,
  onAnalyze,
  onClear,
  onCopyAuditText,
  onCopyShareLink,
  onResetSample,
  onRunSampleAudit,
  onRunSampleLive,
}: GitHubRepoAnalyzerActionsProps) {
  return (
    <>
      <button type="button" className="dense-action-primary" onClick={() => onAnalyze()} disabled={loading}>
        {loading ? t.auditingRepo : t.auditRepo}
      </button>
      <button type="button" className="dense-action" onClick={onRunSampleAudit} disabled={loading}>
        {t.previewReport}
      </button>
      <button type="button" className="dense-action" onClick={onRunSampleLive} disabled={loading}>
        {t.liveSample}
      </button>
      {analysis && (
        <>
          <button type="button" className="dense-action" onClick={onCopyShareLink}>
            {shareStatus || t.copyShareLink}
          </button>
          <a className="dense-action" href={shareUrl} target="_blank" rel="noreferrer">
            {t.openShare}
          </a>
          <button type="button" className="dense-action" onClick={() => onCopyAuditText(issueBundle, t.issuesCopied)}>
            {t.copyIssues}
          </button>
          <button type="button" className="dense-action" onClick={() => onCopyAuditText(releaseBundle, t.releaseChecklistCopied)}>
            {t.copyReleaseChecklist}
          </button>
          <button type="button" className="dense-action" onClick={() => onCopyAuditText(prDescription, t.prDescriptionCopied)}>
            {t.copyPrDescription}
          </button>
          <a className="dense-action" href={analysis.repository.url} target="_blank" rel="noreferrer">
            {t.openRepo}
          </a>
        </>
      )}
      <button type="button" className="dense-action" onClick={onResetSample}>
        {t.resetSample}
      </button>
      <button type="button" className="dense-action" onClick={onClear}>
        {t.clear}
      </button>
    </>
  );
}
