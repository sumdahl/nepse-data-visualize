'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import Link from 'next/link';

interface SectorData {
  sector: string;
  count: number;
  avgMomentum: number;
  avgLtp: number;
}

interface SectorGridProps {
  sectors: SectorData[];
}

export function SectorGrid({ sectors }: SectorGridProps) {
  const maxCount = Math.max(...sectors.map(s => s.count));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sector Performance</CardTitle>
        <CardDescription>Signal distribution and average momentum by sector</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sectors.slice(0, 9).map((sector) => (
            <Link
              key={sector.sector}
              href={`/signals?sector=${encodeURIComponent(sector.sector)}`}
              className="p-4 rounded-lg border hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <p className="font-medium text-sm truncate" title={sector.sector}>
                  {sector.sector}
                </p>
                <Badge variant="secondary">{sector.count}</Badge>
              </div>
              <Progress
                value={(sector.count / maxCount) * 100}
                className="h-2 mb-2"
              />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Avg Momentum: {sector.avgMomentum.toFixed(1)}</span>
                <span>Rs. {sector.avgLtp.toFixed(0)}</span>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
