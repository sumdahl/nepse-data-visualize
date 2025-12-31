"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface SectorData {
  sector: string;
  count: number;
  avgLtp: number;
}

interface SectorChartProps {
  data: SectorData[];
}

const COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--primary))",
  "hsl(var(--primary))",
  "hsl(var(--muted))",
  "hsl(var(--muted))",
];

export function SectorChart({ data }: SectorChartProps) {
  const chartData = data.slice(0, 8).map((item) => ({
    name: item.sector.length > 15 ? item.sector.substring(0, 15) + "..." : item.sector,
    fullName: item.sector,
    value: item.count,
    avgLtp: item.avgLtp,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis
          dataKey="name"
          angle={-45}
          textAnchor="end"
          height={100}
          className="text-xs"
          tick={{ fill: "hsl(var(--muted-foreground))" }}
        />
        <YAxis tick={{ fill: "hsl(var(--muted-foreground))" }} />
        <Tooltip
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              return (
                <div className="rounded-lg border bg-background p-2 shadow-sm">
                  <div className="grid gap-2">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-sm font-medium">{payload[0].payload.fullName}</span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-xs text-muted-foreground">Signals:</span>
                      <span className="text-sm font-bold">{payload[0].value}</span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-xs text-muted-foreground">Avg LTP:</span>
                      <span className="text-sm font-bold">Rs. {payload[0].payload.avgLtp.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              );
            }
            return null;
          }}
        />
        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

