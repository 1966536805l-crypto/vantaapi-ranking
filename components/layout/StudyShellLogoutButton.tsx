"use client";

import { useState } from "react";
import { localizedHref, type InterfaceLanguage } from "@/lib/language";

export default function StudyShellLogoutButton({
  language = "en",
  label,
}: {
  language?: InterfaceLanguage;
  label: string;
}) {
  const [busy, setBusy] = useState(false);

  async function logout() {
    if (busy) return;
    setBusy(true);
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => null);
    window.location.href = localizedHref("/login", language);
  }

  return (
    <button type="button" disabled={busy} onClick={logout} className="apple-button-secondary px-3 py-1.5">
      {label}
    </button>
  );
}
