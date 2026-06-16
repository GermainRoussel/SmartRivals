"use client";

import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

export interface DayScore {
  name: string;
  score: number;
}

export function WeeklyChart({ data }: { data: DayScore[] }) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8" }} />
          <Tooltip
            cursor={{ fill: "#f1f5f9" }}
            contentStyle={{
              borderRadius: "12px",
              border: "none",
              boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
            }}
          />
          <Bar dataKey="score" radius={[6, 6, 6, 6]}>
            {data.map((entry, index) => (
              <Cell key={index} fill={entry.score > 500 ? "#FBBF24" : "#3B82F6"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
