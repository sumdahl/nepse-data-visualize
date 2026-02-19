'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface MomentumPoint {
  date: string;
  momentum_score: number;
  signal_composite?: number;
  rsi_14?: number;
}

interface MomentumChartProps {
  data: MomentumPoint[];
  title?: string;
  description?: string;
  showComposite?: boolean;
}

export function MomentumChart({
  data,
  title = 'Momentum History',
  description = 'Momentum score over time',
  showComposite = true,
}: MomentumChartProps) {
  const formattedData = data.map(item => ({
    ...item,
    displayDate: new Date(item.date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    }),
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={formattedData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="displayDate"
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
            />
            <YAxis
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              domain={[-100, 100]}
            />
            <ReferenceLine y={0} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" />
            <ReferenceLine y={50} stroke="#22c55e" strokeDasharray="3 3" opacity={0.5} />
            <ReferenceLine y={-50} stroke="#ef4444" strokeDasharray="3 3" opacity={0.5} />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="rounded-lg border bg-background p-3 shadow-sm">
                      <p className="text-sm font-medium">{data.date}</p>
                      <p className="text-sm text-muted-foreground">
                        Momentum: {data.momentum_score.toFixed(2)}
                      </p>
                      {showComposite && data.signal_composite !== undefined && (
                        <p className="text-sm text-muted-foreground">
                          Composite: {data.signal_composite.toFixed(2)}
                        </p>
                      )}
                    </div>
                  );
                }
                return null;
              }}
            />
            <Line
              type="monotone"
              dataKey="momentum_score"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={false}
            />
            {showComposite && (
              <Line
                type="monotone"
                dataKey="signal_composite"
                stroke="#8b5cf6"
                strokeWidth={2}
                dot={false}
                strokeDasharray="5 5"
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
