import React from 'react';
import { SummaryCard } from '../../components/premium/SummaryCard';
import { RecentActivityTable } from '../../components/premium/RecentActivityTable';
import { ChartCard } from '../../components/premium/ChartCard';
import { 
  Package, 
  TrendingUp, 
  DollarSign, 
  Users, 
  Calendar,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

const oilData = [
  { month: "Jan", value: 4000 },
  { month: "Feb", value: 3200 },
  { month: "Mar", value: 4800 },
  { month: "Apr", value: 5100 },
  { month: "May", value: 6000 },
];

const expenseData = [
  { name: "Raw Materials", value: 400 },
  { name: "Processing", value: 300 },
  { name: "Packaging", value: 300 },
  { name: "Marketing", value: 200 },
];

const recentActivity = [
  {
    id: '1',
    date: '2025-08-01',
    item: 'Mango Delivery',
    quantity: '500 KG',
    cost: 'KES 30,000',
    status: 'completed' as const,
    type: 'delivery' as const
  },
  {
    id: '2',
    date: '2025-08-02',
    item: 'Avocado Processing',
    quantity: '350 KG',
    cost: 'KES 28,000',
    status: 'processing' as const,
    type: 'production' as const
  },
  {
    id: '3',
    date: '2025-08-03',
    item: 'Packaging Supplies',
    quantity: '1000 units',
    cost: 'KES 15,000',
    status: 'completed' as const,
    type: 'expense' as const
  },
  {
    id: '4',
    date: '2025-08-04',
    item: 'Orange Delivery',
    quantity: '200 KG',
    cost: 'KES 18,000',
    status: 'pending' as const,
    type: 'delivery' as const
  },
  {
    id: '5',
    date: '2025-08-05',
    item: 'Equipment Maintenance',
    quantity: '1 service',
    cost: 'KES 25,000',
    status: 'pending' as const,
    type: 'expense' as const
  },
];

export default function PremiumDashboard() {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Welcome Section */}
        <div className="space-y-3">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
            Dashboard Overview
          </h1>
          <p className="text-gray-600 text-lg">
            Welcome back! Here's what's happening with your operations today.
          </p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <SummaryCard
          title="Total Fruit Delivered"
          value="12,500 KG"
          change="+12%"
          changeType="positive"
          icon={Package}
          description="This month"
        />
        <SummaryCard
          title="Oil Production"
          value="50,000 L"
          change="+8%"
          changeType="positive"
          icon={TrendingUp}
          description="Current month"
        />
        <SummaryCard
          title="Monthly Expenses"
          value="KES 125,000"
          change="-5%"
          changeType="positive"
          icon={DollarSign}
          description="Cost optimization"
        />
        <SummaryCard
          title="Active Staff"
          value="45"
          change="+3"
          changeType="positive"
          icon={Users}
          description="Current headcount"
        />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard
            title="Production Trends"
            type="line"
            data={oilData}
          />
          <ChartCard
            title="Expense Distribution"
            type="pie"
            data={expenseData}
          />
        </div>

        {/* Recent Activity */}
        <RecentActivityTable
          data={recentActivity}
          className="w-full"
        />

        {/* Additional Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-primary p-6 rounded-xl text-white shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-primary-100 text-sm font-medium">Today's Revenue</p>
                <h3 className="text-3xl font-bold">KES 45,680</h3>
                <div className="flex items-center mt-2">
                  <ArrowUpRight className="h-4 w-4" />
                  <span className="text-sm">+18% from yesterday</span>
                </div>
              </div>
              <DollarSign className="h-8 w-8 text-primary-100" />
            </div>
          </div>

          <div className="bg-gradient-accent p-6 rounded-xl text-white shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-accent-100 text-sm font-medium">Processing Queue</p>
                <h3 className="text-3xl font-bold">12 Batches</h3>
                <div className="flex items-center mt-2">
                  <ArrowDownRight className="h-4 w-4" />
                  <span className="text-sm">-2 from yesterday</span>
                </div>
              </div>
              <Package className="h-8 w-8 text-accent-100" />
            </div>
          </div>

          <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Scheduled Deliveries</p>
                <h3 className="text-3xl font-bold text-gray-800">8 Today</h3>
                <div className="flex items-center mt-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  <span className="text-sm text-gray-600">3 completed</span>
                </div>
              </div>
              <TrendingUp className="h-8 w-8 text-primary" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}