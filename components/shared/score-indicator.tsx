import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ScoreIndicatorProps {
  score: number;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function ScoreIndicator({ score, label, size = 'md', showLabel = true }: ScoreIndicatorProps) {
  const getColor = () => {
    if (score >= 50) return 'bg-green-500';
    if (score >= 25) return 'bg-green-400';
    if (score >= 0) return 'bg-yellow-400';
    if (score >= -25) return 'bg-orange-400';
    return 'bg-red-500';
  };

  const getTextColor = () => {
    if (score >= 50) return 'text-green-600';
    if (score >= 25) return 'text-green-500';
    if (score >= 0) return 'text-yellow-600';
    if (score >= -25) return 'text-orange-500';
    return 'text-red-600';
  };

  const sizes = {
    sm: 'w-16 h-2',
    md: 'w-24 h-3',
    lg: 'w-32 h-4',
  };

  const normalizedScore = Math.min(100, Math.max(-100, score));
  const percentage = ((normalizedScore + 100) / 200) * 100;

  return (
    <div className="flex items-center gap-2">
      {showLabel && label && (
        <span className="text-xs text-muted-foreground">{label}</span>
      )}
      <div className={cn('rounded-full bg-muted overflow-hidden', sizes[size])}>
        <div
          className={cn('h-full rounded-full transition-all', getColor())}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className={cn('text-sm font-medium', getTextColor())}>
        {score > 0 ? '+' : ''}{score.toFixed(1)}
      </span>
    </div>
  );
}

export function RSIIndicator({ rsi, showLabel = true }: { rsi: number; showLabel?: boolean }) {
  const getZone = () => {
    if (rsi > 70) return { label: 'Overbought', color: 'bg-red-500', textColor: 'text-red-600' };
    if (rsi < 30) return { label: 'Oversold', color: 'bg-green-500', textColor: 'text-green-600' };
    return { label: 'Neutral', color: 'bg-yellow-500', textColor: 'text-yellow-600' };
  };

  const zone = getZone();
  const percentage = Math.min(100, Math.max(0, rsi));

  return (
    <div className="flex items-center gap-2">
      {showLabel && <span className="text-xs text-muted-foreground">RSI</span>}
      <div className="w-16 h-2 rounded-full bg-muted overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all', zone.color)}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className={cn('text-sm font-medium', zone.textColor)}>
        {rsi.toFixed(1)}
      </span>
    </div>
  );
}

export function ZoneBadge({ rsi }: { rsi: number }) {
  if (rsi > 70) {
    return <Badge variant="destructive" className="text-xs">Overbought</Badge>;
  }
  if (rsi < 30) {
    return <Badge className="bg-green-100 text-green-800 text-xs">Oversold</Badge>;
  }
  return <Badge variant="secondary" className="text-xs">Neutral</Badge>;
}
