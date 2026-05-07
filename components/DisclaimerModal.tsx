"use client";

import { useEffect, useState } from "react";

export default function DisclaimerModal() {
  const [open, setOpen] = useState(() => {
    if (typeof window === "undefined") return false;
    return !localStorage.getItem("vantaapi-disclaimer-accepted");
  });

  useEffect(() => {
    if (!open) return;
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
      <div className="max-h-[85vh] w-full max-w-2xl overflow-y-auto border border-slate-200 bg-white p-6 text-slate-900">
        <p className="eyebrow">Notice</p>
        <h2 className="mt-3 font-serif text-3xl">Before you continue</h2>
        <div className="mt-6 space-y-4 text-sm leading-7 text-slate-700">
          <p>JinMing Lab provides AI tools coding practice and learning utilities</p>
          <p>User-submitted content remains the responsibility of the submitter</p>
          <p>AI and status features are for study review, not professional advice</p>
          <p>The service may change, break or become unavailable</p>
        </div>
        <button
          onClick={() => {
            localStorage.setItem("vantaapi-disclaimer-accepted", "true");
            setOpen(false);
          }}
          className="mt-6 w-full border border-[color:var(--accent)] bg-[color:var(--accent)] px-5 py-3 font-semibold text-white"
        >
          I understand
        </button>
      </div>
    </div>
  );
}
