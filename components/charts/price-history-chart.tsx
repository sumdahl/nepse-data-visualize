'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface PricePoint {
  date: string;
  ltp: number;
  daily_gain_pct?: number;
}

interface PriceHistoryChartProps {
  data: PricePoint[];
  title?: string;
  description?: string;
  showGain?: boolean;
}

export function PriceHistoryChart({
  data,
  title = 'Price History',
  description = 'Historical price movement',
  showGain = false,
}: PriceHistoryChartProps) {
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
              tickLine={{ stroke: 'hsl(var(--muted-foreground))' }}
            />
            <YAxis
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              tickLine={{ stroke: 'hsl(var(--muted-foreground))' }}
              domain={['auto', 'auto']}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="rounded-lg border bg-background p-3 shadow-sm">
                      <p className="text-sm font-medium">{data.date}</p>
                      <p className="text-sm text-muted-foreground">
                        Price: Rs. {data.ltp.toLocaleString()}
                      </p>
                      {showGain && data.daily_gain_pct !== undefined && (
                        <p className={`text-sm ${data.daily_gain_pct >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          Change: {data.daily_gain_pct >= 0 ? '+' : ''}{data.daily_gain_pct.toFixed(2)}%
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
              dataKey="ltp"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: 'hsl(var(--primary))' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
