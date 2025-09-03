import React, { useState, useEffect } from 'react';
import { ArrowLeft, DollarSign, TrendingUp, TrendingDown, Calendar, Download, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ChartCard } from '../../components/premium/ChartCard';
import DashboardCard from '../../components/common/DashboardCard';
import { useAuth } from '../../contexts/AuthContext';

const FinancialReports = () => {
  const navigate = useNavigate();
  const { hasRole } = useAuth();
  const [dateRange, setDateRange] = useState('30d');
  const [loading, setLoading] = useState(false);

  // Mock data - in real implementation, this would come from API calls
  const expenseBreakdownData = [
    { name: 'Salaries', value: 45000 },
    { name: 'Casual Wages', value: 28000 },
    { name: 'Transport', value: 15000 },
    { name: 'Petty Cash', value: 8000 },
    { name: 'Other', value: 12000 }
  ];

  const expenseTrendData = [
    { month: 'Week 1', value: 25000 },
    { month: 'Week 2', value: 28000 },
    { month: 'Week 3', value: 32000 },
    { month: 'Week 4', value: 29000 },
    { month: 'Week 5', value: 35000 }
  ];

  const revenueData = [
    { month: 'Jan', value: 85000 },
    { month: 'Feb', value: 92000 },
    { month: 'Mar', value: 78000 },
    { month: 'Apr', value: 105000 },
    { month: 'May', value: 98000 }
  ];

  const profitMarginData = [
    { month: 'Jan', value: 25 },
    { month: 'Feb', value: 28 },
    { month: 'Mar', value: 22 },
    { month: 'Apr', value: 32 },
    { month: 'May', value: 29 }
  ];

  const financialKPIs = [
    {
      title: 'Total Revenue',
      value: 'KES 458,000',
      change: '+12.5%',
      changeType: 'positive' as const,
      icon: <DollarSign className="h-6 w-6" />,
      color: 'green' as const
    },
    {
      title: 'Total Expenses',
      value: 'KES 108,000',
      change: '+8.2%',
      changeType: 'negative' as const,
      icon: <TrendingUp className="h-6 w-6" />,
      color: 'red' as const
    },
    {
      title: 'Net Profit',
      value: 'KES 350,000',
      change: '+15.3%',
      changeType: 'positive' as const,
      icon: <TrendingUp className="h-6 w-6" />,
      color: 'green' as const
    },
    {
      title: 'Profit Margin',
      value: '76.4%',
      change: '+2.1%',
      changeType: 'positive' as const,
      icon: <TrendingUp className="h-6 w-6" />,
      color: 'blue' as const
    }
  ];

  const expenseCategories = [
    { category: 'Salaries', amount: 45000, percentage: 41.7, trend: '+5%', color: 'bg-blue-500' },
    { category: 'Casual Wages', amount: 28000, percentage: 25.9, trend: '+12%', color: 'bg-green-500' },
    { category: 'Transport', amount: 15000, percentage: 13.9, trend: '-3%', color: 'bg-yellow-500' },
    { category: 'Petty Cash', amount: 8000, percentage: 7.4, trend: '+8%', color: 'bg-purple-500' },
    { category: 'Other', amount: 12000, percentage: 11.1, trend: '-1%', color: 'bg-red-500' }
  ];

  const handleExport = () => {
    // Implementation for exporting reports
    console.log('Exporting financial report...');
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/reports')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-800">
                Financial Reports
              </h1>
              <p className="text-gray-600 text-lg font-medium mt-1">
                Comprehensive financial analysis and expense tracking
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 3 months</option>
              <option value="1y">Last year</option>
            </select>
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Download className="h-4 w-4" />
              Export
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {financialKPIs.map((kpi, index) => (
            <DashboardCard
              key={index}
              title={kpi.title}
              value={kpi.value}
              subtitle={`${kpi.change} from last period`}
              icon={kpi.icon}
              color={kpi.color}
            />
          ))}
        </div>

        {/* Main Charts */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Expense Breakdown Pie Chart */}
          <ChartCard
            title="Expense Breakdown"
            type="pie"
            data={expenseBreakdownData}
            className="w-full"
          />

          {/* Expense Trend Line Graph */}
          <ChartCard
            title="Expense Trends"
            type="line"
            data={expenseTrendData}
            className="w-full"
          />
        </div>

        {/* Revenue and Profit Trends */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <ChartCard
            title="Revenue Trends"
            type="line"
            data={revenueData}
            className="w-full"
          />

          <ChartCard
            title="Profit Margin Trends"
            type="line"
            data={profitMarginData}
            className="w-full"
          />
        </div>

        {/* Detailed Expense Analysis */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-800">Expense Category Analysis</h3>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="h-4 w-4" />
              Last 30 days
            </div>
          </div>

          <div className="space-y-4">
            {expenseCategories.map((category, index) => (
              <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`w-4 h-4 rounded-full ${category.color}`} />
                  <div>
                    <p className="font-semibold text-gray-800">{category.category}</p>
                    <p className="text-sm text-gray-600">{category.percentage}% of total expenses</p>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="font-bold text-gray-800">KES {category.amount.toLocaleString()}</p>
                  <div className="flex items-center gap-1">
                    {category.trend.startsWith('+') ? (
                      <TrendingUp className="h-3 w-3 text-green-600" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-red-600" />
                    )}
                    <span className={`text-sm font-medium ${
                      category.trend.startsWith('+') ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {category.trend}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Financial Summary Table */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-6">Monthly Financial Summary</h3>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Month</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Revenue</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Expenses</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Net Profit</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Margin</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { month: 'January', revenue: 85000, expenses: 22000, profit: 63000, margin: 74.1 },
                  { month: 'February', revenue: 92000, expenses: 25000, profit: 67000, margin: 72.8 },
                  { month: 'March', revenue: 78000, expenses: 21000, profit: 57000, margin: 73.1 },
                  { month: 'April', revenue: 105000, expenses: 28000, profit: 77000, margin: 73.3 },
                  { month: 'May', revenue: 98000, expenses: 26000, profit: 72000, margin: 73.5 }
                ].map((row, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-gray-800">{row.month}</td>
                    <td className="py-3 px-4 text-right font-medium text-gray-800">
                      KES {row.revenue.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-gray-800">
                      KES {row.expenses.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-green-600">
                      KES {row.profit.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-gray-800">
                      {row.margin}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialReports;
