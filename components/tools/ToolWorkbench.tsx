"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import FlagLanguageToggle from "@/components/layout/FlagLanguageToggle";
import GitHubRepoAnalyzer from "@/components/tools/GitHubRepoAnalyzerTool";
import ToolLayout, { type OutputBlock } from "@/components/tools/ToolLayout";
import { recordLocalActivity } from "@/lib/local-progress";
import { localizedHref, type InterfaceLanguage } from "@/lib/language";
import { toolDefinitions, type ToolDefinition, type ToolSlug } from "@/lib/tool-definitions";

import {
  detectLanguage,
  extractVariables,
  getToolFormCopy,
  getWorkbenchCopy,
  launchWorkflow,
  launchWorkflowCopy,
  lines,
  normalizeJson,
  parseHeaders,
  promptTemplates,
  roadmapTracks,
  safeJsonBody,
  sampleApiBug,
  sampleBug,
  sampleCode,
  samplePython,
  stringifyHeaders,
  toolDisplay,
  toolExamples,
  toolHref,
  type ApiMethod,
  type PromptTemplateKey,
  type RoadmapTrack,
} from "@/lib/tool-workbench-client";

export default function ToolWorkbench({
  initialSlug = "prompt-optimizer",
  initialLanguage = "en",
  initialRepoUrl,
}: {
  initialSlug?: ToolSlug;
  initialLanguage?: InterfaceLanguage;
  initialRepoUrl?: string;
}) {
  const pathname = usePathname();
  const language = initialLanguage;
  const t = getWorkbenchCopy(language);
  const active = useMemo<ToolSlug>(() => {
    const routeTool = toolDefinitions.find((tool) => pathname?.endsWith(`/tools/${tool.slug}`));
    return routeTool?.slug || initialSlug;
  }, [initialSlug, pathname]);

  const activeTool = toolDefinitions.find((tool) => tool.slug === active) || toolDefinitions[0];
  const activeToolDisplay = toolDisplay(activeTool, language);

  useEffect(() => {
    recordLocalActivity({
      id: `tool:${active}`,
      title: activeToolDisplay.title,
      href: toolHref(active, language),
      kind: "tool",
    });
  }, [active, activeToolDisplay.title, language]);

  return (
    <main className="apple-page">
      <div className="tool-shell">
        <aside className="tool-rail dense-panel">
          <Link href={localizedHref("/", language)} className="tool-brand">
            <span>JM</span>
            <strong>JinMing Lab</strong>
          </Link>
          <FlagLanguageToggle initialLanguage={language} />
          <nav className="tool-nav">
            <p className="tool-nav-kicker">{t.navKicker}</p>
            {toolDefinitions.map((tool) => {
              const display = toolDisplay(tool, language);
              return (
              <Link
                key={tool.slug}
                href={toolHref(tool.slug, language)}
                className={tool.slug === active ? "tool-nav-link tool-nav-link-active" : "tool-nav-link"}
              >
                <span>{tool.code}</span>
                <strong>{display.shortTitle}</strong>
              </Link>
              );
            })}
          </nav>
        </aside>

        <section className="min-w-0">
          <div className="dense-panel tool-hero">
            <div>
              <p className="eyebrow">{t.heroEyebrow}</p>
              <h1>{activeToolDisplay.title}</h1>
              <p>{activeToolDisplay.description}</p>
            </div>
            <div className="tool-proof-grid">
              {t.proof.map((item) => <span key={item}>{item}</span>)}
            </div>
          </div>

          <div className="tool-command-strip dense-panel">
            <div>
              <p className="eyebrow">{t.inputPattern}</p>
              <strong>{activeToolDisplay.inputHint}</strong>
            </div>
            <div className="tool-command-tags">
              <span>{activeToolDisplay.promise}</span>
              <span>{t.localFirst}</span>
              <span>{t.privateDefault}</span>
            </div>
          </div>

          {active === "github-repo-analyzer" && (
            <section className="tool-launch-flow dense-panel" aria-label={t.launchFlowLabel}>
              <div className="tool-launch-flow-head">
                <div>
                  <p className="eyebrow">{t.recommendedOrder}</p>
                  <h2>{t.workflowTitle}</h2>
                </div>
                <Link href={toolHref("github-repo-analyzer", language)}>{t.startWithAudit}</Link>
              </div>
              <div className="tool-launch-flow-grid">
                {launchWorkflow.map((item) => {
                  const copy = launchWorkflowCopy(item, language);
                  return (
                    <Link
                      key={item.tool}
                      href={toolHref(item.tool, language)}
                      className={item.tool === active ? "tool-launch-card tool-launch-card-active" : "tool-launch-card"}
                    >
                      <span>{item.step}</span>
                      <strong>{copy.title}</strong>
                      <p>{copy.body}</p>
                    </Link>
                  );
                })}
              </div>
            </section>
          )}

          <div className="mt-3">
            {active === "github-repo-analyzer" && <GitHubRepoAnalyzer language={language} initialRepoUrl={initialRepoUrl} />}
            {active === "prompt-optimizer" && <PromptOptimizer language={language} />}
            {active === "code-explainer" && <CodeExplainer language={language} />}
            {active === "bug-finder" && <BugFinder language={language} />}
            {active === "api-request-generator" && <ApiRequestGenerator language={language} />}
            {active === "dev-utilities" && <DevUtilities language={language} />}
            {active === "learning-roadmap" && <LearningRoadmap language={language} />}
          </div>

          <ToolSeoPanel tool={activeToolDisplay} language={language} />
        </section>
      </div>
    </main>
  );
}

function ToolSeoPanel({ tool, language = "en" }: { tool: ToolDefinition; language?: InterfaceLanguage }) {
  const t = getWorkbenchCopy(language);
  const examples = toolExamples(tool, language);

  return (
    <section className="mt-3 grid gap-3 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
      <div className="dense-panel p-5">
        <p className="eyebrow">{t.whatItDoes}</p>
        <h2 className="mt-2 text-2xl font-semibold">{t.workflow(tool.shortTitle)}</h2>
        <div className="mt-4 grid gap-2">
          {tool.whatItDoes.map((item) => (
            <div key={item} className="dense-row">
              <span className="text-sm font-semibold">{item}</span>
              <span className="text-xs text-[color:var(--muted)]">{t.helperLine}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="dense-panel p-5">
        <p className="eyebrow">{t.goodFor}</p>
        <h2 className="mt-2 text-2xl font-semibold">{t.who}</h2>
        <div className="mt-4 grid gap-2 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
          {tool.audience.map((item) => (
            <div key={item} className="rounded-[8px] border border-slate-200 bg-white/70 p-3 text-sm font-semibold">
              {item}
            </div>
          ))}
        </div>
      </div>

      <div className="dense-panel p-5">
        <p className="eyebrow">{t.examples}</p>
        <h2 className="mt-2 text-2xl font-semibold">{t.inputOutput}</h2>
        <div className="mt-4 grid gap-3">
          {examples.map((example) => (
            <article key={example.title} className="rounded-[8px] border border-slate-200 bg-white/75 p-3">
              <p className="eyebrow">{example.title}</p>
              <p className="mt-2 text-sm leading-6 text-slate-800"><strong>{t.input}</strong> {example.input}</p>
              <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]"><strong>{t.output}</strong> {example.output}</p>
            </article>
          ))}
        </div>
      </div>

      <div className="dense-panel p-5">
        <p className="eyebrow">{t.faqLimits}</p>
        <h2 className="mt-2 text-2xl font-semibold">{t.beforeUse}</h2>
        <div className="mt-4 grid gap-2">
          {tool.faq.map((item) => (
            <details key={item.question} className="rounded-[8px] border border-slate-200 bg-white/70 p-3">
              <summary className="cursor-pointer text-sm font-semibold">{item.question}</summary>
              <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">{item.answer}</p>
            </details>
          ))}
          <div className="rounded-[8px] border border-slate-200 bg-white/70 p-3">
            <p className="text-sm font-semibold">{t.usageLimits}</p>
            <ul className="mt-2 space-y-1 text-sm leading-6 text-[color:var(--muted)]">
              {tool.limitations.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

function PromptOptimizer({ language }: { language: InterfaceLanguage }) {
  const f = getToolFormCopy(language);
  const sampleGoal = "Build an AI tool website with six practical developer tools";
  const sampleContext = "Target users are beginners and indie developers. The page should be dense, useful and production ready.";
  const [goal, setGoal] = useState(sampleGoal);
  const [mode, setMode] = useState("coding");
  const [context, setContext] = useState(sampleContext);
  const [templateKey, setTemplateKey] = useState<PromptTemplateKey>("builder");

  const promptBlocks = useMemo<OutputBlock[]>(() => {
    const template = promptTemplates[templateKey];
    const role =
      template?.role ||
      (mode === "research"
        ? "You are a senior research analyst"
        : mode === "product"
          ? "You are a senior product manager and UX writer"
          : "You are a senior full stack engineer");
    const cleanGoal = goal.trim() || "Describe the goal here";
    const cleanContext = context.trim() || "Add audience product constraints current stack and examples here";

    return [
      { badge: "01", title: "Role", content: role },
      { badge: "02", title: "Goal", content: cleanGoal },
      { badge: "03", title: "Context", content: cleanContext },
      {
        badge: "04",
        title: "Tasks",
        content: template?.tasks || `1. Restate the objective in one sentence
2. Ask only the critical missing questions
3. Propose a practical implementation plan
4. Produce the final answer or code in a copy ready format
5. Call out risks edge cases and test steps`,
      },
      {
        badge: "05",
        title: "Output Format",
        content: `- Summary
- Assumptions
- Plan
- Deliverable
- Verification`,
      },
      {
        badge: "06",
        title: "Constraints",
        content: template?.constraints || `- Prefer simple maintainable choices
- Avoid vague advice
- Make the result usable immediately
- Include filenames commands or examples when relevant`,
      },
      {
        badge: "07",
        title: "Acceptance Criteria",
        content: template?.acceptance || `- The answer solves the actual user goal
- The next action is obvious
- The output can be pasted into a real workflow`,
      },
    ];
  }, [context, goal, mode, templateKey]);

  const output = useMemo(
    () => promptBlocks.map((block) => `${block.title}\n${block.content}`).join("\n\n"),
    [promptBlocks]
  );

  return (
    <ToolLayout
      output={output}
      outputTitle={f.optimizedPrompt}
      language={language}
      blocks={promptBlocks}
      actions={
        <>
          <button type="button" className="dense-action" onClick={() => { setGoal(sampleGoal); setContext(sampleContext); setMode("coding"); }}>
            {f.loadSample}
          </button>
          <button type="button" className="dense-action" onClick={() => { setGoal(""); setContext(""); }}>
            {f.clear}
          </button>
        </>
      }
    >
      <p className="eyebrow">{f.input}</p>
      <h2>{f.roughRequest}</h2>
      <textarea value={goal} onChange={(event) => setGoal(event.target.value)} className="tool-textarea" placeholder={f.promptPlaceholder} />
      <div className="tool-field-grid">
        <label>
          <span>{f.useCase}</span>
          <select value={mode} onChange={(event) => setMode(event.target.value)} className="tool-input">
            <option value="coding">{f.coding}</option>
            <option value="research">{f.research}</option>
            <option value="product">{f.product}</option>
          </select>
        </label>
        <label>
          <span>{f.template}</span>
          <select value={templateKey} onChange={(event) => setTemplateKey(event.target.value as PromptTemplateKey)} className="tool-input">
            {Object.entries(promptTemplates).map(([key, template]) => (
              <option key={key} value={key}>{template.label}</option>
            ))}
          </select>
        </label>
      </div>
      <label className="block">
        <span className="tool-label">{f.context}</span>
        <textarea value={context} onChange={(event) => setContext(event.target.value)} className="tool-textarea tool-textarea-small" />
      </label>
    </ToolLayout>
  );
}

function CodeExplainer({ language }: { language: InterfaceLanguage }) {
  const f = getToolFormCopy(language);
  const [code, setCode] = useState(sampleCode);
  const explainBlocks = useMemo<OutputBlock[]>(() => {
    const language = detectLanguage(code);
    const variables = extractVariables(code);
    const risks = [
      code.includes("fetch(") && !code.includes("response.ok") ? "Network response is used without checking response.ok" : "",
      /JSON\.parse|\.json\(\)/.test(code) && !/try|catch/.test(code) ? "JSON parsing has no error handling path" : "",
      /\.\w+\.\w+/.test(code) ? "Nested property access may fail when an object is undefined" : "",
      /password|secret|token|apiKey/i.test(code) ? "Sensitive value appears in code and should be moved to environment variables" : "",
    ].filter(Boolean);

    const notes = [
      `Detected language ${language}`,
      `Approximate size ${lines(code)} lines`,
      variables.length ? `Key names ${variables.join(", ")}` : "No obvious variable declarations found",
    ];

    return [
      {
        badge: "01",
        title: "Code purpose",
        content: [
        language === "JavaScript TypeScript" && code.includes("fetch(")
          ? "This code performs an asynchronous HTTP request and returns data from the response"
          : "This code defines logic that should be read from input setup to output or return value",
        code.includes("return") ? "The final returned value is the main result of the function" : "Look for side effects such as printing mutation or network calls",
        ].map((item) => `- ${item}`).join("\n"),
      },
      {
        badge: "02",
        title: "Key variables and functions",
        content: (variables.length ? variables.map((item) => `${item} is a named value function or class used by the snippet`) : ["No named variables detected"]).map((item) => `- ${item}`).join("\n"),
      },
      {
        badge: "03",
        title: "Potential bugs",
        content: (risks.length ? risks : ["No obvious bug pattern found from static heuristics"]).map((item) => `- ${item}`).join("\n"),
      },
      {
        badge: "04",
        title: "Learning notes",
        content: notes.map((item) => `- ${item}`).join("\n"),
      },
    ];
  }, [code]);
  const output = useMemo(
    () => explainBlocks.map((block) => `${block.title}\n${block.content}`).join("\n\n"),
    [explainBlocks]
  );

  return (
    <ToolLayout
      output={output}
      outputTitle={f.codeExplanation}
      language={language}
      blocks={explainBlocks}
      actions={
        <>
          <button type="button" className="dense-action" onClick={() => setCode(sampleCode)}>
            {f.jsSample}
          </button>
          <button type="button" className="dense-action" onClick={() => setCode(samplePython)}>
            {f.pythonSample}
          </button>
          <button type="button" className="dense-action" onClick={() => setCode("")}>
            {f.clear}
          </button>
        </>
      }
    >
      <p className="eyebrow">{f.input}</p>
      <h2>{f.pasteCode}</h2>
      <textarea value={code} onChange={(event) => setCode(event.target.value)} className="tool-textarea tool-code-input" spellCheck={false} />
    </ToolLayout>
  );
}

function BugFinder({ language }: { language: InterfaceLanguage }) {
  const f = getToolFormCopy(language);
  const [error, setError] = useState(sampleBug);
  const [code, setCode] = useState(sampleCode);
  const bugBlocks = useMemo<OutputBlock[]>(() => {
    const combined = `${error}\n${code}`;
    const causes = [
      /undefined|null|Cannot read/i.test(combined) ? "A value is undefined or null before property access" : "",
      /404/.test(combined) ? "The requested endpoint or route is missing" : "",
      /401|403/.test(combined) ? "Authentication permission or same origin policy is blocking the request" : "",
      /500|Prisma|database|SQL/i.test(combined) ? "Server side database or API logic may be failing" : "",
      /CORS|origin/i.test(combined) ? "Cross origin request policy is rejecting the browser request" : "",
      /module not found|Cannot find module/i.test(combined) ? "A dependency import path or package installation is missing" : "",
      /Type '.+' is not assignable|ts\(/i.test(combined) ? "TypeScript types do not match the value being passed" : "",
    ].filter(Boolean);
    const firstCause = causes[0] || "The error needs a smaller reproduction but the failure is probably near the first stack trace line";
    const severity = /401|403|password|secret|token|apiKey/i.test(combined)
      ? "High because auth or sensitive data may be involved"
      : /500|database|Prisma|SQL/i.test(combined)
        ? "Medium because server or data logic may be failing"
        : "Normal debugging risk";
    const repairTemplate = code.includes(".user.name")
      ? `const userName = data?.user?.name;
if (!userName) {
  throw new Error("User name is missing from API response");
}
return userName;`
      : /401|403/i.test(combined)
        ? `const response = await fetch(url, {
  headers: {
    Authorization: \`Bearer \${token}\`
  }
});

if (!response.ok) {
  throw new Error(\`Request failed \${response.status}\`);
}`
        : `if (!value) {
  throw new Error("Expected value is missing");
}

// Then continue with the normal logic`;

    return [
      { badge: "01", title: "Severity", content: severity },
      { badge: "02", title: "Most likely cause", content: firstCause },
      {
        badge: "03",
        title: "Debug steps",
        content: `1. Reproduce with the smallest input that still fails
2. Log the value immediately before the failing line
3. Check network status response body and server logs
4. Add guards for missing data before using nested fields
5. Write one regression test or manual checklist after fixing`,
      },
      { badge: "04", title: "Repair template", content: repairTemplate },
      {
        badge: "05",
        title: "What to verify",
        content: `- The same input no longer fails
- Missing data produces a clear error
- The fix does not hide a real server or auth issue`,
      },
    ];
  }, [code, error]);
  const output = useMemo(
    () => bugBlocks.map((block) => `${block.title}\n${block.content}`).join("\n\n"),
    [bugBlocks]
  );

  return (
    <ToolLayout
      output={output}
      outputTitle={f.bugDiagnosis}
      language={language}
      blocks={bugBlocks}
      actions={
        <>
          <button type="button" className="dense-action" onClick={() => { setError(sampleBug); setCode(sampleCode); }}>
            {f.typeErrorSample}
          </button>
          <button type="button" className="dense-action" onClick={() => { setError(sampleApiBug); setCode(sampleApiBug); }}>
            {f.apiSample}
          </button>
          <button type="button" className="dense-action" onClick={() => { setError(""); setCode(""); }}>
            {f.clear}
          </button>
        </>
      }
    >
      <p className="eyebrow">{f.input}</p>
      <h2>{f.errorAndCode}</h2>
      <label className="block">
        <span className="tool-label">{f.errorMessage}</span>
        <textarea value={error} onChange={(event) => setError(event.target.value)} className="tool-textarea tool-textarea-small" />
      </label>
      <label className="block">
        <span className="tool-label">{f.codeSnippet}</span>
        <textarea value={code} onChange={(event) => setCode(event.target.value)} className="tool-textarea tool-code-input" spellCheck={false} />
      </label>
    </ToolLayout>
  );
}

function ApiRequestGenerator({ language }: { language: InterfaceLanguage }) {
  const f = getToolFormCopy(language);
  const [url, setUrl] = useState("https://api.example.com/v1/users");
  const [method, setMethod] = useState<ApiMethod>("POST");
  const [headers, setHeaders] = useState("Authorization: Bearer YOUR_TOKEN\nContent-Type: application/json");
  const [body, setBody] = useState('{"name":"JinMing Lab","role":"developer"}');
  const requestBlocks = useMemo<OutputBlock[]>(() => {
    const parsedHeaders = parseHeaders(headers);
    const prettyBody = safeJsonBody(body);
    const hasBody = !["GET", "DELETE"].includes(method) && prettyBody.length > 0;
    const headerFlags = Object.entries(parsedHeaders).map(([key, value]) => `  -H '${key}: ${value}'`).join(" \\\n");
    const curlBody = hasBody ? ` \\\n  -d '${prettyBody.replace(/'/g, "'\\''")}'` : "";
    const headersObject = stringifyHeaders(parsedHeaders, 4);
    const bodyLine = hasBody ? `,\n  body: JSON.stringify(${prettyBody})` : "";
    const axiosBody = hasBody ? `,\n  ${prettyBody}` : "";
    const pythonBody = hasBody ? `,\n    json=${prettyBody.replace(/\n/g, "\n    ")}` : "";

    return [
      {
        badge: "01",
        title: "curl",
        content: `curl -X ${method} '${url}'${headerFlags ? ` \\\n${headerFlags}` : ""}${curlBody}`,
      },
      {
        badge: "02",
        title: "fetch",
        content: `const response = await fetch("${url}", {
  method: "${method}",
  headers: ${headersObject}${bodyLine}
});
const data = await response.json();`,
      },
      {
        badge: "03",
        title: "axios",
        content: `const response = await axios.${method.toLowerCase()}("${url}"${axiosBody}, {
  headers: ${headersObject}
});`,
      },
      {
        badge: "04",
        title: "Python requests",
        content: `import requests

response = requests.${method.toLowerCase()}(
    "${url}",
    headers=${JSON.stringify(parsedHeaders, null, 4).replace(/\n/g, "\n    ")}${pythonBody}
)
print(response.status_code)
print(response.json())`,
      },
    ];
  }, [body, headers, method, url]);
  const output = useMemo(
    () => requestBlocks.map((block) => `${block.title}\n${block.content}`).join("\n\n"),
    [requestBlocks]
  );

  return (
    <ToolLayout
      output={output}
      outputTitle={f.requestSnippets}
      language={language}
      blocks={requestBlocks}
      actions={
        <>
          <button type="button" className="dense-action" onClick={() => { setMethod("GET"); setUrl("https://api.example.com/v1/projects"); setHeaders("Authorization: Bearer YOUR_TOKEN"); setBody(""); }}>
            {f.getPreset}
          </button>
          <button type="button" className="dense-action" onClick={() => { setMethod("POST"); setUrl("https://api.example.com/v1/users"); setHeaders("Authorization: Bearer YOUR_TOKEN\nContent-Type: application/json"); setBody('{"name":"JinMing Lab","role":"developer"}'); }}>
            {f.postPreset}
          </button>
          <button type="button" className="dense-action" onClick={() => { setHeaders(""); setBody(""); }}>
            {f.clearBody}
          </button>
        </>
      }
    >
      <p className="eyebrow">{f.input}</p>
      <h2>{f.apiDetails}</h2>
      <div className="tool-field-grid">
        <label>
          <span>{f.method}</span>
          <select value={method} onChange={(event) => setMethod(event.target.value as ApiMethod)} className="tool-input">
            {["GET", "POST", "PUT", "PATCH", "DELETE"].map((item) => <option key={item}>{item}</option>)}
          </select>
        </label>
        <label>
          <span>{f.endpoint}</span>
          <input value={url} onChange={(event) => setUrl(event.target.value)} className="tool-input" />
        </label>
      </div>
      <label className="block">
        <span className="tool-label">{f.headersOnePerLine}</span>
        <textarea value={headers} onChange={(event) => setHeaders(event.target.value)} className="tool-textarea tool-textarea-small" />
      </label>
      <label className="block">
        <span className="tool-label">{f.jsonBody}</span>
        <textarea value={body} onChange={(event) => setBody(event.target.value)} className="tool-textarea tool-textarea-small" spellCheck={false} />
      </label>
    </ToolLayout>
  );
}

function DevUtilities({ language }: { language: InterfaceLanguage }) {
  const f = getToolFormCopy(language);
  const [json, setJson] = useState('{"name":"JinMing Lab","tools":["json","regex","timestamp"],"ok":true}');
  const [pattern, setPattern] = useState("\\b[A-Z][A-Za-z]+\\b");
  const [flags, setFlags] = useState("g");
  const [regexText, setRegexText] = useState("JinMing Lab builds JSON Regex Timestamp Tools");
  const [timestamp, setTimestamp] = useState("1700000000000");

  const utilityBlocks = useMemo<OutputBlock[]>(() => {
    const jsonResult = normalizeJson(json);
    let regexResult = "";
    try {
      const normalizedFlags = flags.includes("g") ? flags : `${flags}g`;
      const regex = new RegExp(pattern, normalizedFlags);
      const matches = Array.from(regexText.matchAll(regex)).map((match) => match[0]);
      regexResult = matches.length ? matches.join("\n") : "No matches";
    } catch (error) {
      regexResult = error instanceof Error ? error.message : "Invalid regex";
    }

    const numeric = Number(timestamp.trim());
    const date = Number.isFinite(numeric)
      ? new Date(String(Math.trunc(numeric)).length === 10 ? numeric * 1000 : numeric)
      : new Date(timestamp.trim());

    return [
      { badge: "01", title: "JSON status", content: jsonResult.message },
      { badge: "02", title: "Formatted JSON", content: jsonResult.ok ? jsonResult.pretty : "Fix JSON before formatting" },
      { badge: "03", title: "Minified JSON", content: jsonResult.ok ? jsonResult.minified : "Unavailable" },
      { badge: "04", title: "Regex matches", content: regexResult },
      {
        badge: "05",
        title: "Timestamp",
        content: `Input ${timestamp}
ISO ${Number.isNaN(date.getTime()) ? "Invalid date" : date.toISOString()}
Local ${Number.isNaN(date.getTime()) ? "Invalid date" : date.toLocaleString()}
Unix seconds ${Number.isNaN(date.getTime()) ? "Invalid date" : Math.floor(date.getTime() / 1000)}
Milliseconds ${Number.isNaN(date.getTime()) ? "Invalid date" : date.getTime()}`,
      },
    ];
  }, [flags, json, pattern, regexText, timestamp]);
  const output = useMemo(
    () => utilityBlocks.map((block) => `${block.title}\n${block.content}`).join("\n\n"),
    [utilityBlocks]
  );

  return (
    <ToolLayout
      output={output}
      outputTitle={f.utilityResult}
      language={language}
      blocks={utilityBlocks}
      actions={
        <>
          <button type="button" className="dense-action" onClick={() => setJson('{"name":"JinMing Lab","tools":["json","regex","timestamp"],"ok":true}')}>
            {f.jsonSample}
          </button>
          <button type="button" className="dense-action" onClick={() => setTimestamp(String(Date.now()))}>
            {f.currentTime}
          </button>
          <button type="button" className="dense-action" onClick={() => { setJson(""); setRegexText(""); setTimestamp(""); }}>
            {f.clear}
          </button>
        </>
      }
    >
      <p className="eyebrow">{f.input}</p>
      <h2>{f.jsonRegexTimestamp}</h2>
      <label className="block">
        <span className="tool-label">{f.json}</span>
        <textarea value={json} onChange={(event) => setJson(event.target.value)} className="tool-textarea tool-textarea-small" spellCheck={false} />
      </label>
      <div className="tool-field-grid">
        <label>
          <span>{f.regex}</span>
          <input value={pattern} onChange={(event) => setPattern(event.target.value)} className="tool-input" />
        </label>
        <label>
          <span>{f.flags}</span>
          <input value={flags} onChange={(event) => setFlags(event.target.value)} className="tool-input" />
        </label>
      </div>
      <textarea value={regexText} onChange={(event) => setRegexText(event.target.value)} className="tool-textarea tool-textarea-small" />
      <label className="block">
        <span className="tool-label">{f.timestampOrDate}</span>
        <input value={timestamp} onChange={(event) => setTimestamp(event.target.value)} className="tool-input" />
      </label>
    </ToolLayout>
  );
}

function LearningRoadmap({ language }: { language: InterfaceLanguage }) {
  const f = getToolFormCopy(language);
  const [track, setTrack] = useState<RoadmapTrack>("frontend");
  const data = roadmapTracks[track];
  const roadmapBlocks = useMemo<OutputBlock[]>(() => {
    const days = Array.from({ length: 30 }, (_, index) => {
      const day = index + 1;
      const week = Math.ceil(day / 7);
      const focus =
        week === 1
          ? "foundation syntax environment and reading examples"
          : week === 2
            ? "small components scripts and API practice"
            : week === 3
              ? "project building debugging and refactor"
              : "ship polish deploy and review";
      return `Day ${day} ${focus}`;
    });

    return [
      { badge: "01", title: `${data.label} goal`, content: data.goal },
      { badge: "02", title: "Stack", content: data.stack.join("\n") },
      { badge: "03", title: "Daily plan", content: days.map((item) => `- ${item}`).join("\n") },
      {
        badge: "04",
        title: "Weekly milestones",
        content: `- Week 1 finish environment setup and 10 small exercises
- Week 2 build 3 practical mini tools
- Week 3 build the final project core flow
- Week 4 polish deploy document and collect feedback`,
      },
      { badge: "05", title: "Final project", content: data.project },
      {
        badge: "06",
        title: "Daily rhythm",
        content: `- 30 minutes learn
- 60 minutes build
- 20 minutes debug notes
- 10 minutes publish a tiny progress log`,
      },
    ];
  }, [data]);
  const output = useMemo(
    () => roadmapBlocks.map((block) => `${block.title}\n${block.content}`).join("\n\n"),
    [roadmapBlocks]
  );

  return (
    <ToolLayout output={output} outputTitle={f.plan30} blocks={roadmapBlocks} language={language}>
      <p className="eyebrow">{f.input}</p>
      <h2>{f.chooseDirection}</h2>
      <div className="tool-choice-grid">
        {Object.entries(roadmapTracks).map(([key, item]) => (
          <button
            key={key}
            type="button"
            onClick={() => setTrack(key as RoadmapTrack)}
            className={track === key ? "tool-choice tool-choice-active" : "tool-choice"}
          >
            <strong>{item.label}</strong>
            <span>{item.goal}</span>
          </button>
        ))}
      </div>
    </ToolLayout>
  );
}
