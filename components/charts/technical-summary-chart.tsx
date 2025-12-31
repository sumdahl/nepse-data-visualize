"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

interface SummaryData {
  summary: string;
  count: number;
}

interface TechnicalSummaryChartProps {
  data: SummaryData[];
}

const COLORS = [
  "hsl(142, 76%, 36%)", // Green for bullish
  "hsl(142, 71%, 45%)",
  "hsl(38, 92%, 50%)", // Yellow/Orange
  "hsl(0, 84%, 60%)", // Red for bearish
  "hsl(var(--muted))",
];

export function TechnicalSummaryChart({ data }: TechnicalSummaryChartProps) {
  const chartData = data.map((item) => ({
    name: item.summary,
    value: item.count,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          outerRadius={100}
          fill="#8884d8"
          dataKey="value"
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              return (
                <div className="rounded-lg border bg-background p-2 shadow-sm">
                  <div className="grid gap-2">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-sm font-medium">{payload[0].name}</span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-xs text-muted-foreground">Count:</span>
                      <span className="text-sm font-bold">{payload[0].value}</span>
                    </div>
                  </div>
                </div>
              );
            }
            return null;
          }}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}

