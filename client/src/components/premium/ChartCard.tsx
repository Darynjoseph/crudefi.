import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { cn } from '../../lib/utils';
import { BarChart3, TrendingUp, PieChart } from 'lucide-react';

interface ChartCardProps {
  title: string;
  type: 'line' | 'pie' | 'bar';
  data: Array<{ month?: string; name?: string; value: number }>;
  className?: string;
}

export const ChartCard: React.FC<ChartCardProps> = ({
  title,
  type,
  data,
  className,
}) => {
  const getIcon = () => {
    switch (type) {
      case 'line':
        return <TrendingUp className="h-5 w-5 text-primary" />;
      case 'pie':
        return <PieChart className="h-5 w-5 text-primary" />;
      case 'bar':
        return <BarChart3 className="h-5 w-5 text-primary" />;
    }
  };

  const renderChart = () => {
    if (type === 'line') {
      return (
        <div className="space-y-3">
          {data.map((item, index) => (
            <div key={index} className="flex items-center justify-between p-4 rounded-xl bg-slate-50/80 hover:bg-slate-100/80 transition-all duration-200 border border-slate-200/40 hover:border-slate-300/60">
              <span className="text-sm font-semibold text-slate-700">{item.month}</span>
              <div className="flex items-center gap-3">
                <div className="w-24 h-2.5 bg-slate-200 rounded-full overflow-hidden shadow-inner">
                  <div 
                    className="h-full bg-primary rounded-full transition-all duration-700 ease-out"
                    style={{ width: `${(item.value / Math.max(...data.map(d => d.value))) * 100}%` }}
                  />
                </div>
                <span className="text-sm font-bold text-slate-900 min-w-[60px] text-right">{item.value.toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (type === 'pie') {
      const total = data.reduce((sum, item) => sum + item.value, 0);
      return (
        <div className="space-y-3">
          {data.map((item, index) => {
            const percentage = ((item.value / total) * 100).toFixed(1);
            const colors = [
              'bg-primary',
              'bg-primary/80',
              'bg-accent',
              'bg-accent/80',
              'bg-primary/60'
            ];
            return (
              <div key={index} className="flex items-center justify-between p-4 rounded-xl bg-slate-50/80 hover:bg-slate-100/80 transition-all duration-200 border border-slate-200/40 hover:border-slate-300/60">
                <div className="flex items-center gap-4">
                  <div className={`w-4 h-4 rounded-full shadow-sm ${colors[index % colors.length]}`} />
                  <span className="text-sm font-semibold text-slate-700">{item.name}</span>
                </div>
                <div className="text-right space-y-0.5">
                  <div className="text-sm font-bold text-slate-900">{percentage}%</div>
                  <div className="text-xs text-slate-500 font-medium">{item.value.toLocaleString()}</div>
                </div>
              </div>
            );
          })}
        </div>
      );
    }

    return (
      <div className="text-center text-gray-500 py-8">
        <BarChart3 className="h-12 w-12 mx-auto mb-2 text-gray-300" />
        <p>Chart visualization coming soon</p>
      </div>
    );
  };

  return (
    <Card className={cn("shadow-lg border border-gray-200 bg-white hover:shadow-xl transition-all duration-300 hover:border-gray-300", className)}>
      <CardHeader className="border-b border-gray-100 bg-white">
        <CardTitle className="text-xl font-bold tracking-tight flex items-center gap-3 text-gray-800">
          <div className="p-2 rounded-xl bg-primary/10 text-primary">
            {getIcon()}
          </div>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 lg:p-8">
        {renderChart()}
      </CardContent>
    </Card>
  );
};