"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

interface SummaryData {
  summary: string;
  count: number;
}

interface TechnicalSummaryChartProps {
  data: SummaryData[];
}

const COLOR_MAP: Record<string, string> = {
  'Strong Bullish': "hsl(142, 76%, 36%)", // More green
  'Bullish': "hsl(142, 60%, 55%)",        // Light green
  'Neutral': "hsl(45, 93%, 47%)",        // Yellow
  'Bearish': "hsl(0, 84%, 60%)",         // Red
  'Strong Bearish': "hsl(0, 72%, 40%)",  // Dark Red
};

const DEFAULT_COLOR = "hsl(var(--muted))";

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
            <Cell key={`cell-${index}`} fill={COLOR_MAP[entry.name] || DEFAULT_COLOR} />
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

