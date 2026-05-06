"use client";

import { useState } from "react";
import clsx from "clsx";

type Tab = {
  id: string;
  label: string;
  icon?: string;
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
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-700 mb-6 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={clsx(
              "px-4 py-2 font-mono text-sm font-medium transition-colors whitespace-nowrap",
              activeTab === tab.id
                ? "border-b-2 border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400"
                : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
            )}
          >
            {tab.icon && <span className="mr-2">{tab.icon}</span>}
            {tab.label}
          </button>
        ))}
      </div>
      <div>{children(activeTab)}</div>
    </div>
  );
}

type StatCardProps = {
  title: string;
  value: string | number;
  change?: string;
  trend?: "up" | "down" | "neutral";
  icon?: string;
};

export function StatCard({ title, value, change, trend, icon }: StatCardProps) {
  return (
    <div className="border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-600 dark:text-slate-400">{title}</p>
          <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-slate-100">
            {value}
          </p>
          {change && (
            <p
              className={clsx(
                "mt-2 text-sm font-medium",
                trend === "up" && "text-emerald-600",
                trend === "down" && "text-red-600",
                trend === "neutral" && "text-slate-600"
              )}
            >
              {trend === "up" && "↑ "}
              {trend === "down" && "↓ "}
              {change}
            </p>
          )}
        </div>
        {icon && <span className="text-3xl">{icon}</span>}
      </div>
    </div>
  );
}

type BadgeProps = {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "error" | "info";
};

export function Badge({ children, variant = "default" }: BadgeProps) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        variant === "default" &&
          "bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200",
        variant === "success" &&
          "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200",
        variant === "warning" &&
          "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
        variant === "error" &&
          "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
        variant === "info" &&
          "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      )}
    >
      {children}
    </span>
  );
}

type ProgressBarProps = {
  value: number;
  max?: number;
  color?: string;
  showLabel?: boolean;
};

export function ProgressBar({
  value,
  max = 100,
  color = "bg-blue-600",
  showLabel = true,
}: ProgressBarProps) {
  const percentage = Math.min((value / max) * 100, 100);

  return (
    <div>
      {showLabel && (
        <div className="mb-2 flex justify-between text-sm">
          <span className="text-slate-600 dark:text-slate-400">进度</span>
          <span className="font-mono font-medium text-slate-900 dark:text-slate-100">
            {percentage.toFixed(0)}%
          </span>
        </div>
      )}
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
        <div
          className={clsx("h-full transition-all duration-500", color)}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
