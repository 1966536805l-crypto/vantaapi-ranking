"use client";

import { useState } from "react";
import clsx from "clsx";

/* -------------------------------------------------------------------------
 * Tabs — understated, underline-active, small-caps labels.
 * ----------------------------------------------------------------------- */
type Tab = {
  id: string;
  label: string;
  icon?: string; // kept for API compatibility; no longer rendered
};

type TabsProps = {
  tabs: Tab[];
  defaultTab?: string;
  children: (activeTab: string) => React.ReactNode;
};

export function Tabs({ tabs, defaultTab, children }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);

  return (
    <div>
      <div className="mb-6 flex gap-6 border-b border-slate-200 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={clsx(
              "relative -mb-px whitespace-nowrap px-0 py-3 text-[13px] font-medium transition-colors",
              activeTab === tab.id
                ? "text-slate-900"
                : "text-slate-500 hover:text-slate-800"
            )}
          >
            {tab.label}
            {activeTab === tab.id && (
              <span className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-[color:var(--accent)]" />
            )}
          </button>
        ))}
      </div>
      <div>{children(activeTab)}</div>
    </div>
  );
}

/* -------------------------------------------------------------------------
 * StatCard — thin-rule card with big serif number, USACO-style.
 * ----------------------------------------------------------------------- */
type StatCardProps = {
  title: string;
  value: string | number;
  change?: string;
  trend?: "up" | "down" | "neutral";
  icon?: string; // API-compatible; no longer rendered
};

export function StatCard({ title, value, change, trend }: StatCardProps) {
  return (
    <div className="border border-slate-200 bg-white p-5">
      <p className="eyebrow">{title}</p>
      <p className="mt-3 font-serif text-[32px] leading-none tracking-tight text-slate-900">
        {value}
      </p>
      {change && (
        <p
          className={clsx(
            "mt-3 text-[12px] font-medium",
            trend === "up" && "text-emerald-700",
            trend === "down" && "text-rose-700",
            (!trend || trend === "neutral") && "text-slate-500"
          )}
        >
          {trend === "up" && "▲ "}
          {trend === "down" && "▼ "}
          {change}
        </p>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------
 * Badge — flat, square-ish chip with thin border, no shadow.
 * ----------------------------------------------------------------------- */
type BadgeProps = {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "error" | "info";
};

export function Badge({ children, variant = "default" }: BadgeProps) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-[2px] border px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.12em]",
        variant === "default" && "border-slate-200 bg-white text-slate-700",
        variant === "success" && "border-emerald-200 bg-emerald-50 text-emerald-800",
        variant === "warning" && "border-amber-200 bg-amber-50 text-amber-800",
        variant === "error" && "border-rose-200 bg-rose-50 text-rose-800",
        variant === "info" && "border-blue-200 bg-blue-50 text-blue-800"
      )}
    >
      {children}
    </span>
  );
}

/* -------------------------------------------------------------------------
 * ProgressBar — narrow, academic blue fill, optional label.
 * ----------------------------------------------------------------------- */
type ProgressBarProps = {
  value: number;
  max?: number;
  color?: string;
  showLabel?: boolean;
  label?: string;
};

export function ProgressBar({
  value,
  max = 100,
  color,
  showLabel = true,
  label = "Progress",
}: ProgressBarProps) {
  const percentage = Math.min((value / max) * 100, 100);
  return (
    <div>
      {showLabel && (
        <div className="mb-1.5 flex justify-between text-[12px]">
          <span className="text-slate-500">{label}</span>
          <span className="font-mono text-slate-800">{percentage.toFixed(0)}%</span>
        </div>
      )}
      <div className="h-[5px] w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className={clsx(
            "h-full transition-all duration-500",
            color ?? "bg-[color:var(--accent)]"
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------
 * Section header — serif title + eyebrow + optional action.
 * Useful building block to unify internal pages.
 * ----------------------------------------------------------------------- */
type SectionHeaderProps = {
  eyebrow?: string;
  title: string;
  action?: React.ReactNode;
};

export function SectionHeader({ eyebrow, title, action }: SectionHeaderProps) {
  return (
    <div className="section-rule mb-6 flex items-end justify-between gap-4">
      <div>
        {eyebrow && <p className="eyebrow mb-2">{eyebrow}</p>}
        <h2 className="font-serif text-[22px] leading-tight tracking-tight text-slate-900">
          {title}
        </h2>
      </div>
      {action}
    </div>
  );
}
