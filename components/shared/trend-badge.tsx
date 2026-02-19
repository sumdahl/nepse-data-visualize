import { Badge } from '@/components/ui/badge';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

interface TrendBadgeProps {
  value: number | string;
  type?: 'sentiment' | 'trend' | 'risk' | 'gain';
  showIcon?: boolean;
}

export function TrendBadge({ value, type = 'sentiment', showIcon = true }: TrendBadgeProps) {
  const strValue = String(value).toLowerCase();
  
  const getSentimentVariant = (): 'default' | 'secondary' | 'destructive' | 'outline' => {
    if (strValue.includes('bullish') || strValue === '1' || strValue === '2') return 'default';
    if (strValue.includes('bearish') || strValue === '-1' || strValue === '-2') return 'destructive';
    return 'secondary';
  };

  const getTrendIcon = () => {
    if (!showIcon) return null;
    
    if (type === 'gain') {
      const numValue = typeof value === 'number' ? value : parseFloat(strValue);
      if (numValue > 0) return <ArrowUpRight className="h-3 w-3" />;
      if (numValue < 0) return <ArrowDownRight className="h-3 w-3" />;
      return <Minus className="h-3 w-3" />;
    }
    
    if (strValue.includes('bullish') || strValue === '1' || strValue === '2') {
      return <ArrowUpRight className="h-3 w-3" />;
    }
    if (strValue.includes('bearish') || strValue === '-1' || strValue === '-2') {
      return <ArrowDownRight className="h-3 w-3" />;
    }
    return null;
  };

  const getDisplayValue = () => {
    if (type === 'sentiment') {
      if (strValue === '2') return 'Strong Bullish';
      if (strValue === '1') return 'Bullish';
      if (strValue === '0.5') return 'Weak Bullish';
      if (strValue === '0') return 'Neutral';
      if (strValue === '-0.5') return 'Weak Bearish';
      if (strValue === '-1') return 'Bearish';
      if (strValue === '-2') return 'Strong Bearish';
    }
    if (type === 'gain' && typeof value === 'number') {
      return `${value > 0 ? '+' : ''}${value.toFixed(2)}%`;
    }
    return String(value);
  };

  const getClassName = () => {
    if (type === 'gain') {
      const numValue = typeof value === 'number' ? value : parseFloat(strValue);
      if (numValue > 0) return 'bg-green-100 text-green-800 hover:bg-green-100';
      if (numValue < 0) return 'bg-red-100 text-red-800 hover:bg-red-100';
    }
    return '';
  };

  return (
    <Badge variant={getSentimentVariant()} className={getClassName()}>
      {getTrendIcon()}
      <span className={showIcon && getTrendIcon() ? 'ml-1' : ''}>{getDisplayValue()}</span>
    </Badge>
  );
}
