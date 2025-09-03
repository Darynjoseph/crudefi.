import React, { useState, useEffect } from 'react';
import { ArrowLeft, Users, Clock, DollarSign, TrendingUp, Calendar, Download, UserCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ChartCard } from '../../components/premium/ChartCard';
import DashboardCard from '../../components/common/DashboardCard';
import { useAuth } from '../../contexts/AuthContext';

const LaborReports = () => {
  const navigate = useNavigate();
  const { hasRole } = useAuth();
  const [dateRange, setDateRange] = useState('30d');
  const [loading, setLoading] = useState(false);

  // Staff Cost Comparison Data
  const staffCostData = [
    { name: 'Casual Staff', value: 28000 },
    { name: 'Salaried Staff', value: 45000 }
  ];

  const departmentCostData = [
    { name: 'Production', value: 32000 },
    { name: 'Processing', value: 18000 },
    { name: 'Quality Control', value: 12000 },
    { name: 'Administration', value: 11000 }
  ];

  const attendanceTrendData = [
    { month: 'Week 1', value: 95 },
    { month: 'Week 2', value: 92 },
    { month: 'Week 3', value: 97 },
    { month: 'Week 4', value: 89 },
    { month: 'Week 5', value: 94 }
  ];

  const productivityData = [
    { month: 'Jan', value: 85 },
    { month: 'Feb', value: 88 },
    { month: 'Mar', value: 82 },
    { month: 'Apr', value: 91 },
    { month: 'May', value: 87 }
  ];

  const laborKPIs = [
    {
      title: 'Total Staff Cost',
      value: 'KES 73,000',
      change: '+8.2%',
      changeType: 'negative' as const,
      icon: <DollarSign className="h-6 w-6" />,
      color: 'red' as const
    },
    {
      title: 'Active Employees',
      value: '45',
      change: '+3',
      changeType: 'positive' as const,
      icon: <Users className="h-6 w-6" />,
      color: 'blue' as const
    },
    {
      title: 'Avg. Attendance',
      value: '93.4%',
      change: '+2.1%',
      changeType: 'positive' as const,
      icon: <UserCheck className="h-6 w-6" />,
      color: 'green' as const
    },
    {
      title: 'Productivity Index',
      value: '86.6%',
      change: '+4.3%',
      changeType: 'positive' as const,
      icon: <TrendingUp className="h-6 w-6" />,
      color: 'purple' as const
    }
  ];

  const staffBreakdown = [
    { 
      category: 'Permanent Staff', 
      count: 28, 
      cost: 45000, 
      avgSalary: 1607, 
      trend: '+5%', 
      color: 'bg-blue-500' 
    },
    { 
      category: 'Casual Workers', 
      count: 17, 
      cost: 28000, 
      avgSalary: 1647, 
      trend: '+12%', 
      color: 'bg-green-500' 
    }
  ];

  const departmentBreakdown = [
    { 
      department: 'Production', 
      staff: 18, 
      cost: 32000, 
      efficiency: 89, 
      trend: '+3%',
      color: 'bg-blue-500' 
    },
    { 
      department: 'Processing', 
      staff: 12, 
      cost: 18000, 
      efficiency: 92, 
      trend: '+7%',
      color: 'bg-green-500' 
    },
    { 
      department: 'Quality Control', 
      staff: 8, 
      cost: 12000, 
      efficiency: 95, 
      trend: '+2%',
      color: 'bg-purple-500' 
    },
    { 
      department: 'Administration', 
      staff: 7, 
      cost: 11000, 
      efficiency: 87, 
      trend: '+1%',
      color: 'bg-yellow-500' 
    }
  ];

  const handleExport = () => {
    console.log('Exporting labor report...');
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
                Labor & Salary Reports
              </h1>
              <p className="text-gray-600 text-lg font-medium mt-1">
                Staff performance, salary analysis, and workforce insights
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
          {laborKPIs.map((kpi, index) => (
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
          {/* Staff Cost Comparison */}
          <ChartCard
            title="Staff Cost Comparison"
            type="pie"
            data={staffCostData}
            className="w-full"
          />

          {/* Department Cost Distribution */}
          <ChartCard
            title="Department Cost Distribution"
            type="pie"
            data={departmentCostData}
            className="w-full"
          />
        </div>

        {/* Attendance and Productivity Trends */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <ChartCard
            title="Attendance Trends (%)"
            type="line"
            data={attendanceTrendData}
            className="w-full"
          />

          <ChartCard
            title="Productivity Index (%)"
            type="line"
            data={productivityData}
            className="w-full"
          />
        </div>

        {/* Staff Category Analysis */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-800">Staff Category Analysis</h3>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="h-4 w-4" />
              Last 30 days
            </div>
          </div>

          <div className="space-y-4">
            {staffBreakdown.map((category, index) => (
              <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`w-4 h-4 rounded-full ${category.color}`} />
                  <div>
                    <p className="font-semibold text-gray-800">{category.category}</p>
                    <p className="text-sm text-gray-600">{category.count} employees</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-8 text-right">
                  <div>
                    <p className="text-sm text-gray-600">Total Cost</p>
                    <p className="font-bold text-gray-800">KES {category.cost.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Avg. Daily Rate</p>
                    <p className="font-bold text-gray-800">KES {category.avgSalary}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Trend</p>
                    <span className={`font-medium ${
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

        {/* Department Performance */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-6">Department Performance Analysis</h3>
          
          <div className="space-y-4">
            {departmentBreakdown.map((dept, index) => (
              <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`w-4 h-4 rounded-full ${dept.color}`} />
                  <div>
                    <p className="font-semibold text-gray-800">{dept.department}</p>
                    <p className="text-sm text-gray-600">{dept.staff} staff members</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-8 text-right">
                  <div>
                    <p className="text-sm text-gray-600">Monthly Cost</p>
                    <p className="font-bold text-gray-800">KES {dept.cost.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Efficiency</p>
                    <p className="font-bold text-gray-800">{dept.efficiency}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Trend</p>
                    <span className={`font-medium ${
                      dept.trend.startsWith('+') ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {dept.trend}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Detailed Staff Summary Table */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-6">Monthly Staff Summary</h3>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Month</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Total Staff</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Salary Cost</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Casual Cost</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Attendance</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Productivity</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { month: 'January', staff: 42, salary: 42000, casual: 25000, attendance: 94.2, productivity: 85 },
                  { month: 'February', staff: 43, salary: 43000, casual: 26000, attendance: 92.8, productivity: 88 },
                  { month: 'March', staff: 44, salary: 44000, casual: 27000, attendance: 95.1, productivity: 82 },
                  { month: 'April', staff: 45, salary: 45000, casual: 28000, attendance: 93.7, productivity: 91 },
                  { month: 'May', staff: 45, salary: 45000, casual: 28000, attendance: 94.5, productivity: 87 }
                ].map((row, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-gray-800">{row.month}</td>
                    <td className="py-3 px-4 text-right font-medium text-gray-800">{row.staff}</td>
                    <td className="py-3 px-4 text-right font-medium text-gray-800">
                      KES {row.salary.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-gray-800">
                      KES {row.casual.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-green-600">
                      {row.attendance}%
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-blue-600">
                      {row.productivity}%
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

export default LaborReports;
