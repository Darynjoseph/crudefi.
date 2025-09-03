import React, { useState, useEffect } from 'react';
import { ArrowLeft, TrendingUp, DollarSign, BarChart3, PieChart, Calendar, Download, Target } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ChartCard } from '../../components/premium/ChartCard';
import DashboardCard from '../../components/common/DashboardCard';
import { useAuth } from '../../contexts/AuthContext';

const CombinedReports = () => {
  const navigate = useNavigate();
  const { hasRole } = useAuth();
  const [dateRange, setDateRange] = useState('30d');
  const [loading, setLoading] = useState(false);

  // P&L Data
  const profitLossData = [
    { month: 'Jan', revenue: 85000, expenses: 67000, profit: 18000 },
    { month: 'Feb', revenue: 92000, expenses: 69000, profit: 23000 },
    { month: 'Mar', revenue: 78000, expenses: 65000, profit: 13000 },
    { month: 'Apr', revenue: 105000, expenses: 73000, profit: 32000 },
    { month: 'May', revenue: 98000, expenses: 71000, profit: 27000 }
  ];

  const roiTrendData = [
    { month: 'Jan', value: 26.9 },
    { month: 'Feb', value: 33.3 },
    { month: 'Mar', value: 20.0 },
    { month: 'Apr', value: 43.8 },
    { month: 'May', value: 38.0 }
  ];

  const revenueBreakdownData = [
    { name: 'Oil Sales', value: 78000 },
    { name: 'Processing Services', value: 15000 },
    { name: 'Consultation', value: 3000 },
    { name: 'Equipment Rental', value: 2000 }
  ];

  const expenseBreakdownData = [
    { name: 'Raw Materials', value: 28000 },
    { name: 'Labor Costs', value: 25000 },
    { name: 'Equipment & Maintenance', value: 8000 },
    { name: 'Transportation', value: 6000 },
    { name: 'Utilities', value: 4000 }
  ];

  const executiveKPIs = [
    {
      title: 'Net Profit Margin',
      value: '27.6%',
      change: '+4.2%',
      changeType: 'positive' as const,
      icon: <TrendingUp className="h-6 w-6" />,
      color: 'green' as const
    },
    {
      title: 'ROI',
      value: '32.4%',
      change: '+8.1%',
      changeType: 'positive' as const,
      icon: <Target className="h-6 w-6" />,
      color: 'blue' as const
    },
    {
      title: 'Revenue Growth',
      value: '+18.3%',
      change: 'YoY',
      changeType: 'positive' as const,
      icon: <BarChart3 className="h-6 w-6" />,
      color: 'purple' as const
    },
    {
      title: 'Cost Efficiency',
      value: '72.4%',
      change: '+3.8%',
      changeType: 'positive' as const,
      icon: <DollarSign className="h-6 w-6" />,
      color: 'amber' as const
    }
  ];

  // P&L Chart Component
  const ProfitLossChart = () => {
    const maxValue = Math.max(...profitLossData.flatMap(d => [d.revenue, d.expenses, d.profit]));

    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-800 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <BarChart3 className="h-5 w-5" />
            </div>
            Profit & Loss Statement
          </h3>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-gray-600">Revenue</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-gray-600">Expenses</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-gray-600">Net Profit</span>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {profitLossData.map((item, index) => (
            <div key={index} className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-700">{item.month}</span>
                <div className="flex items-center gap-6 text-sm">
                  <span className="text-green-600 font-medium">KES {item.revenue.toLocaleString()}</span>
                  <span className="text-red-600 font-medium">KES {item.expenses.toLocaleString()}</span>
                  <span className="text-blue-600 font-medium">KES {item.profit.toLocaleString()}</span>
                </div>
              </div>
              
              <div className="space-y-2">
                {/* Revenue Bar */}
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-500 w-16">Revenue</span>
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-green-500 rounded-full transition-all duration-700 ease-out"
                      style={{ width: `${(item.revenue / maxValue) * 100}%` }}
                    />
                  </div>
                </div>
                
                {/* Expenses Bar */}
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-500 w-16">Expenses</span>
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-red-500 rounded-full transition-all duration-700 ease-out"
                      style={{ width: `${(item.expenses / maxValue) * 100}%` }}
                    />
                  </div>
                </div>
                
                {/* Profit Bar */}
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-500 w-16">Profit</span>
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 rounded-full transition-all duration-700 ease-out"
                      style={{ width: `${(item.profit / maxValue) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const businessMetrics = [
    { metric: 'Gross Margin', current: '68.2%', target: '70%', status: 'good' },
    { metric: 'Operating Margin', current: '32.4%', target: '30%', status: 'excellent' },
    { metric: 'Asset Turnover', current: '1.8x', target: '2.0x', status: 'fair' },
    { metric: 'Debt-to-Equity', current: '0.3', target: '0.4', status: 'excellent' },
    { metric: 'Current Ratio', current: '2.1', target: '2.0', status: 'excellent' },
    { metric: 'Quick Ratio', current: '1.8', target: '1.5', status: 'excellent' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-600 bg-green-100';
      case 'good': return 'text-blue-600 bg-blue-100';
      case 'fair': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-red-600 bg-red-100';
    }
  };

  const handleExport = () => {
    console.log('Exporting combined report...');
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
                Combined Analytics
              </h1>
              <p className="text-gray-600 text-lg font-medium mt-1">
                Advanced P&L, cross-functional analysis, and executive dashboards
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

        {/* Executive KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {executiveKPIs.map((kpi, index) => (
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

        {/* P&L Statement Chart */}
        <ProfitLossChart />

        {/* Revenue and Expense Breakdown */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <ChartCard
            title="Revenue Breakdown"
            type="pie"
            data={revenueBreakdownData}
            className="w-full"
          />

          <ChartCard
            title="Expense Breakdown"
            type="pie"
            data={expenseBreakdownData}
            className="w-full"
          />
        </div>

        {/* ROI Trends */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <ChartCard
            title="ROI Trends (%)"
            type="line"
            data={roiTrendData}
            className="w-full"
          />

          {/* Business Health Score */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10 text-primary">
                <Target className="h-5 w-5" />
              </div>
              Business Health Score
            </h3>
            
            <div className="space-y-4">
              <div className="text-center mb-6">
                <div className="relative w-32 h-32 mx-auto">
                  <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-gray-200"
                      stroke="currentColor"
                      strokeWidth="3"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="text-green-500"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeDasharray="87, 100"
                      strokeLinecap="round"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-3xl font-bold text-green-600">87</span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-2">Overall Health Score</p>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Financial Stability</span>
                  <span className="text-sm font-bold text-green-600">92%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Operational Efficiency</span>
                  <span className="text-sm font-bold text-blue-600">85%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Growth Potential</span>
                  <span className="text-sm font-bold text-purple-600">89%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Risk Management</span>
                  <span className="text-sm font-bold text-yellow-600">82%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Business Metrics Analysis */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-800">Key Business Metrics</h3>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="h-4 w-4" />
              Current Period vs Target
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {businessMetrics.map((metric, index) => (
              <div key={index} className="p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">{metric.metric}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(metric.status)}`}>
                    {metric.status}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-gray-800">{metric.current}</span>
                  <span className="text-sm text-gray-600">Target: {metric.target}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Executive Summary Table */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-6">Executive Summary - Monthly P&L</h3>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Month</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Revenue</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">COGS</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Gross Profit</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Operating Exp</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Net Profit</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Margin %</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { month: 'January', revenue: 85000, cogs: 28000, gross: 57000, opex: 39000, net: 18000, margin: 21.2 },
                  { month: 'February', revenue: 92000, cogs: 30000, gross: 62000, opex: 39000, net: 23000, margin: 25.0 },
                  { month: 'March', revenue: 78000, cogs: 25000, gross: 53000, opex: 40000, net: 13000, margin: 16.7 },
                  { month: 'April', revenue: 105000, cogs: 35000, gross: 70000, opex: 38000, net: 32000, margin: 30.5 },
                  { month: 'May', revenue: 98000, cogs: 32000, gross: 66000, opex: 39000, net: 27000, margin: 27.6 }
                ].map((row, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-gray-800">{row.month}</td>
                    <td className="py-3 px-4 text-right font-medium text-gray-800">
                      KES {row.revenue.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-red-600">
                      KES {row.cogs.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-blue-600">
                      KES {row.gross.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-red-600">
                      KES {row.opex.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-green-600">
                      KES {row.net.toLocaleString()}
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

export default CombinedReports;
