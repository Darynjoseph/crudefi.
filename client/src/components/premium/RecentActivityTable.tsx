import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { Calendar, Package, DollarSign, TrendingUp } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ActivityRecord {
  id: string;
  date: string;
  item: string;
  quantity: string;
  cost: string;
  status?: 'completed' | 'pending' | 'processing';
  type?: 'delivery' | 'expense' | 'production';
}

interface RecentActivityTableProps {
  data: ActivityRecord[];
  className?: string;
}

export const RecentActivityTable: React.FC<RecentActivityTableProps> = ({ 
  data, 
  className 
}) => {
  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="success" className="text-xs">Completed</Badge>;
      case 'pending':
        return <Badge variant="warning" className="text-xs">Pending</Badge>;
      case 'processing':
        return <Badge variant="info" className="text-xs">Processing</Badge>;
      default:
        return <Badge variant="secondary" className="text-xs">Unknown</Badge>;
    }
  };

  const getTypeIcon = (type?: string) => {
    switch (type) {
      case 'delivery':
        return <Package className="h-4 w-4 text-primary" />;
      case 'expense':
        return <DollarSign className="h-4 w-4 text-accent" />;
      case 'production':
        return <TrendingUp className="h-4 w-4 text-primary" />;
      default:
        return <Calendar className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <Card className={cn("shadow-lg border border-gray-200 bg-white hover:shadow-xl transition-all duration-300", className)}>
      <CardHeader className="border-b border-gray-100 bg-white px-6 py-5">
        <CardTitle className="text-xl font-bold tracking-tight flex items-center gap-3 text-gray-800">
          <div className="p-2 rounded-xl bg-primary/10 text-primary">
            <TrendingUp className="h-5 w-5" />
          </div>
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-b border-slate-100/80 bg-slate-50/30">
              <TableHead className="font-bold text-slate-700 py-4 px-6 text-sm">Date</TableHead>
              <TableHead className="font-bold text-slate-700 text-sm">Item</TableHead>
              <TableHead className="font-bold text-slate-700 text-sm">Quantity</TableHead>
              <TableHead className="font-bold text-slate-700 text-sm">Cost</TableHead>
              <TableHead className="font-bold text-slate-700 text-sm">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((record, index) => (
              <TableRow 
                key={record.id || index}
                className={cn(
                  "hover:bg-slate-50/80 border-b border-slate-100/60 transition-all duration-200 hover:shadow-sm",
                  index % 2 === 0 ? "bg-white" : "bg-slate-25"
                )}
              >
                <TableCell className="py-4 px-6">
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 rounded-lg bg-slate-100">
                      {getTypeIcon(record.type)}
                    </div>
                    <span className="font-semibold text-slate-700 text-sm">{record.date}</span>
                  </div>
                </TableCell>
                <TableCell className="py-4">
                  <span className="font-semibold text-slate-900 text-sm">{record.item}</span>
                </TableCell>
                <TableCell className="py-4">
                  <span className="text-slate-700 font-medium text-sm">{record.quantity}</span>
                </TableCell>
                <TableCell className="py-4">
                  <span className="font-bold text-slate-900 text-sm">{record.cost}</span>
                </TableCell>
                <TableCell className="py-4">
                  {getStatusBadge(record.status)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {data.length === 0 && (
          <div className="py-16 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Package className="h-8 w-8 text-slate-400" />
            </div>
            <p className="text-slate-600 font-semibold mb-1">No recent activity found</p>
            <p className="text-slate-400 text-sm">Activity will appear here once data is available</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};