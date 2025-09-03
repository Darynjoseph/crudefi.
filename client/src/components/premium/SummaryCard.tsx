import React from 'react';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Badge } from '../ui/badge';
import { cn } from '../../lib/utils';
import { LucideIcon } from 'lucide-react';

interface SummaryCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: LucideIcon;
  description?: string;
  className?: string;
}

export const SummaryCard: React.FC<SummaryCardProps> = ({
  title,
  value,
  change,
  changeType = 'neutral',
  icon: Icon,
  description,
  className,
}) => {
  const getChangeColor = () => {
    switch (changeType) {
      case 'positive':
        return 'success';
      case 'negative':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  return (
    <Card 
      className={cn(
        "relative overflow-hidden group hover:shadow-lg transition-all duration-300 border border-gray-200 bg-white hover:scale-[1.02] hover:border-gray-300",
        className
      )}
    >
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300">
              <Icon size={22} />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">{title}</p>
              <h3 className="text-2xl font-bold text-gray-800 tracking-tight">{value}</h3>
            </div>
          </div>
          {change && (
            <Badge variant={getChangeColor()} className="text-xs font-semibold px-2.5 py-1">
              {change}
            </Badge>
          )}
        </div>
      </CardHeader>
      {description && (
        <CardContent className="pt-0 pb-6">
          <p className="text-sm text-gray-500 font-medium">{description}</p>
        </CardContent>
      )}
    </Card>
  );
};