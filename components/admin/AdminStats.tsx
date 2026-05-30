"use client";

import { Card, CardContent } from '@/components/ui/card';

interface Stat {
  label: string;
  value: number;
  color?: string;
}

interface AdminStatsProps {
  stats: Stat[];
}

export function AdminStats({ stats }: AdminStatsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className={`text-3xl font-bold ${stat.color || 'text-foreground'}`}>
                {stat.value}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                {stat.label}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
