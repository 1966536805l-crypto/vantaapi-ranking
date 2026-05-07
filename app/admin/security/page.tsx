import Link from "next/link";
import Admin2FAPanel from "@/components/admin/Admin2FAPanel";
import SecurityAssistantPanel from "@/components/admin/SecurityAssistantPanel";
import StudyShell from "@/components/layout/StudyShell";
import { requireServerAdmin } from "@/lib/server-auth";

export const dynamic = "force-dynamic";

const botControls = [
  { label: "Bot scoring", value: "active", desc: "User agent path probes fetch metadata and request frequency" },
  { label: "Crawler traps", value: "active", desc: ".env wp-login xmlrpc phpmyadmin and other probe paths" },
  { label: "API pressure limit", value: "active", desc: "Separate limits for auth admin unsafe API and public pages" },
  { label: "Private indexing", value: "active", desc: "API admin dashboard progress wrong bank are noindex" },
];

export default async function AdminSecurityPage() {
  await requireServerAdmin({ allowUnverified2FA: true });

  const turnstileConfigured = Boolean(process.env.TURNSTILE_SECRET_KEY && process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY);
  const geminiConfigured = Boolean(process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY);
  const aiGatewayConfigured = Boolean(process.env.AI_API_KEY);

  return (
    <StudyShell>
      <section className="soft-gradient apple-card p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="eyebrow">Security Console</p>
            <h1 className="mt-3 font-serif text-4xl">Protection Center</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-[color:var(--muted)]">
              Anti crawling login hardening rate limits crawler traps and admin only security assistant are wired into the app.
            </p>
          </div>
          <Link href="/admin" className="apple-button-secondary px-4 py-2 text-sm">
            Back
          </Link>
        </div>
      </section>

      <div className="mt-6 grid gap-3 md:grid-cols-4">
        {botControls.map((item) => (
          <div key={item.label} className="apple-card p-4">
            <p className="eyebrow">{item.label}</p>
            <p className="mt-3 text-xl font-semibold text-slate-950">{item.value}</p>
            <p className="mt-2 text-xs leading-5 text-[color:var(--muted)]">{item.desc}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <div className="apple-card p-5">
          <p className="eyebrow">Human verification</p>
          <h2 className="mt-3 text-2xl font-semibold">{turnstileConfigured ? "Turnstile enabled" : "Turnstile ready"}</h2>
          <p className="mt-3 text-sm leading-7 text-[color:var(--muted)]">
            Configure NEXT_PUBLIC_TURNSTILE_SITE_KEY and TURNSTILE_SECRET_KEY to turn on Cloudflare Turnstile for auth forms.
          </p>
        </div>
        <div className="apple-card p-5">
          <p className="eyebrow">AI assistant</p>
          <h2 className="mt-3 text-2xl font-semibold">
            {geminiConfigured ? "Gemini connected" : aiGatewayConfigured ? "AI gateway connected" : "Local fallback"}
          </h2>
          <p className="mt-3 text-sm leading-7 text-[color:var(--muted)]">
            Set GEMINI_API_KEY to prefer Gemini free tier. Existing AI_API_KEY is used second. Without a key the page still gives built in security guidance.
          </p>
        </div>
      </div>

      <div className="mt-6">
        <Admin2FAPanel />
      </div>

      <div className="mt-6">
        <SecurityAssistantPanel />
      </div>
    </StudyShell>
  );
}
