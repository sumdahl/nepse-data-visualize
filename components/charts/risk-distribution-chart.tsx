"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface RiskData {
  risk: string;
  count: number;
}

interface RiskDistributionChartProps {
  data: RiskData[];
}

const RISK_COLORS: Record<string, string> = {
  "High Risk": "hsl(0, 84%, 60%)",
  "Medium Risk": "hsl(38, 92%, 50%)",
  "Low Risk": "hsl(142, 76%, 36%)",
};

export function RiskDistributionChart({ data }: RiskDistributionChartProps) {
  const chartData = data.map((item) => ({
    name: item.risk,
    value: item.count,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData} layout="vertical">
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis type="number" tick={{ fill: "hsl(var(--muted-foreground))" }} />
        <YAxis
          dataKey="name"
          type="category"
          width={100}
          tick={{ fill: "hsl(var(--muted-foreground))" }}
        />
        <Tooltip
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              return (
                <div className="rounded-lg border bg-background p-2 shadow-sm">
                  <div className="grid gap-2">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-sm font-medium">{payload[0].payload.name}</span>
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
        <Bar dataKey="value" radius={[0, 4, 4, 0]}>
          {chartData.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={RISK_COLORS[entry.name] || "hsl(var(--muted))"}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

