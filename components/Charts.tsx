"use client";

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type ProgressChartProps = {
  data: Array<{ name: string; value: number }>;
  color?: string;
};

export function ProgressChart({ data, color = "#3b82f6" }: ProgressChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis dataKey="name" stroke="#64748b" />
        <YAxis stroke="#64748b" />
        <Tooltip
          contentStyle={{
            backgroundColor: "#fff",
            border: "1px solid #e2e8f0",
            borderRadius: "4px",
          }}
        />
        <Bar dataKey="value" fill={color} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

type TrendChartProps = {
  data: Array<{ date: string; value: number }>;
  color?: string;
};

export function TrendChart({ data, color = "#3b82f6" }: TrendChartProps) {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis dataKey="date" stroke="#64748b" />
        <YAxis stroke="#64748b" />
        <Tooltip
          contentStyle={{
            backgroundColor: "#fff",
            border: "1px solid #e2e8f0",
            borderRadius: "4px",
          }}
        />
        <Line
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={2}
          dot={{ fill: color, r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

type RadarChartData = {
  subject: string;
  value: number;
  fullMark: number;
};

type KnowledgeRadarProps = {
  data: RadarChartData[];
};

export function KnowledgeRadar({ data }: KnowledgeRadarProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <RadarChart data={data}>
        <PolarGrid stroke="#e2e8f0" />
        <PolarAngleAxis dataKey="subject" stroke="#64748b" />
        <PolarRadiusAxis stroke="#64748b" />
        <Radar
          name="Mastery"
          dataKey="value"
          stroke="#3b82f6"
          fill="#3b82f6"
          fillOpacity={0.6}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "#fff",
            border: "1px solid #e2e8f0",
            borderRadius: "4px",
          }}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}

type HeatmapProps = {
  data: Array<{ day: string; hour: number; value: number }>;
};

export function StudyHeatmap({ data }: HeatmapProps) {
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const getColor = (value: number) => {
    if (value === 0) return "#f1f5f9";
    if (value < 30) return "#dbeafe";
    if (value < 60) return "#93c5fd";
    if (value < 90) return "#3b82f6";
    return "#1e40af";
  };

  return (
    <div className="overflow-x-auto">
      <div className="inline-grid grid-cols-[auto_repeat(24,1fr)] gap-1 min-w-max">
        <div />
        {hours.map((hour) => (
          <div
            key={hour}
            className="text-center text-xs text-slate-500 font-mono"
          >
            {hour}
          </div>
        ))}
        {days.map((day) => (
          <>
            <div
              key={day}
              className="text-xs text-slate-600 font-medium pr-2 flex items-center"
            >
              {day}
            </div>
            {hours.map((hour) => {
              const cell = data.find((d) => d.day === day && d.hour === hour);
              const value = cell?.value || 0;
              return (
                <div
                  key={`${day}-${hour}`}
                  className="w-6 h-6 rounded-sm cursor-pointer hover:ring-2 hover:ring-blue-400 transition-all"
                  style={{ backgroundColor: getColor(value) }}
                  title={`${day} ${hour}:00 - ${value}min`}
                />
              );
            })}
          </>
        ))}
      </div>
      <div className="mt-4 flex items-center gap-2 text-xs text-slate-600">
        <span>Less</span>
        <div className="flex gap-1">
          {[0, 30, 60, 90, 120].map((val) => (
            <div
              key={val}
              className="w-4 h-4 rounded-sm"
              style={{ backgroundColor: getColor(val) }}
            />
          ))}
        </div>
        <span>More</span>
      </div>
    </div>
  );
}
