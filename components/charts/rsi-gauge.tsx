'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface RSIGaugeProps {
  value: number;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function RSIGauge({ value, showLabel = true, size = 'md' }: RSIGaugeProps) {
  const getZone = () => {
    if (value > 70) return { label: 'Overbought', color: '#ef4444', bgClass: 'bg-red-100' };
    if (value < 30) return { label: 'Oversold', color: '#22c55e', bgClass: 'bg-green-100' };
    return { label: 'Neutral', color: '#eab308', bgClass: 'bg-yellow-100' };
  };

  const zone = getZone();

  const sizes = {
    sm: { width: 120, height: 60, fontSize: 12 },
    md: { width: 160, height: 80, fontSize: 16 },
    lg: { width: 200, height: 100, fontSize: 20 },
  };

  const { width, height, fontSize } = sizes[size];
  const centerX = width / 2;
  const centerY = height - 10;
  const radius = Math.min(width, height) - 20;

  const angle = ((value / 100) * 180 - 90) * (Math.PI / 180);
  const needleX = centerX + radius * 0.7 * Math.cos(angle);
  const needleY = centerY + radius * 0.7 * Math.sin(angle);

  return (
    <Card className={cn('overflow-hidden', zone.bgClass)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">RSI (14)</CardTitle>
        {showLabel && (
          <CardDescription className={cn(
            'font-medium',
            value > 70 ? 'text-red-600' : value < 30 ? 'text-green-600' : 'text-yellow-600'
          )}>
            {zone.label}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="flex justify-center pb-4">
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
          <path
            d={`M 10 ${centerY} A ${radius / 2} ${radius / 2} 0 0 1 ${width - 10} ${centerY}`}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth={8}
            strokeLinecap="round"
          />
          <path
            d={`M 10 ${centerY} A ${radius / 2} ${radius / 2} 0 0 1 ${centerX - radius / 4} ${centerY - radius / 4}`}
            fill="none"
            stroke="#22c55e"
            strokeWidth={8}
            strokeLinecap="round"
          />
          <path
            d={`M ${centerX - radius / 4} ${centerY - radius / 4} A ${radius / 2} ${radius / 2} 0 0 1 ${centerX + radius / 4} ${centerY - radius / 4}`}
            fill="none"
            stroke="#eab308"
            strokeWidth={8}
            strokeLinecap="round"
          />
          <path
            d={`M ${centerX + radius / 4} ${centerY - radius / 4} A ${radius / 2} ${radius / 2} 0 0 1 ${width - 10} ${centerY}`}
            fill="none"
            stroke="#ef4444"
            strokeWidth={8}
            strokeLinecap="round"
          />
          <circle cx={centerX} cy={centerY} r={4} fill="#374151" />
          <line
            x1={centerX}
            y1={centerY}
            x2={needleX}
            y2={needleY}
            stroke="#374151"
            strokeWidth={2}
            strokeLinecap="round"
          />
          <text x={10} y={height - 2} fontSize={10} fill="#6b7280">0</text>
          <text x={width - 20} y={height - 2} fontSize={10} fill="#6b7280">100</text>
          <text
            x={centerX}
            y={centerY + 25}
            fontSize={fontSize}
            fontWeight="bold"
            textAnchor="middle"
            fill={zone.color}
          >
            {value.toFixed(1)}
          </text>
        </svg>
      </CardContent>
    </Card>
  );
}

export function RSIZoneBar({ rsi }: { rsi: number }) {
  const getZoneColor = () => {
    if (rsi > 70) return 'bg-red-500';
    if (rsi < 30) return 'bg-green-500';
    return 'bg-yellow-500';
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden relative">
        <div className="absolute left-[30%] top-0 bottom-0 w-px bg-muted-foreground/30" />
        <div className="absolute left-[70%] top-0 bottom-0 w-px bg-muted-foreground/30" />
        <div
          className={cn('h-full rounded-full transition-all', getZoneColor())}
          style={{ width: `${Math.min(100, Math.max(0, rsi))}%` }}
        />
      </div>
      <span className="text-sm font-medium w-12 text-right">{rsi.toFixed(1)}</span>
    </div>
  );
}
